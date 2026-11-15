import * as THREE from 'three';

export class TitleScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  private planetGroup!: THREE.Group;
  private planetMesh!: THREE.Mesh;
  private atmosphereMesh!: THREE.Mesh;
  private satelliteGroup!: THREE.Group;
  private beaconLight!: THREE.PointLight;
  private starParticles!: THREE.Points;

  private mouseX = 0;
  private mouseY = 0;
  private targetRotX = 0;
  private targetRotY = 0;

  private animFrameId: number | null = null;
  private isDisposed = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. WebGL Renderer (Optimized for 4GB RAM / Integrated Intel HD)
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'low-power',
      antialias: false,
      alpha: true,
      depth: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(1.0); // Keep 1.0 for low-end device performance
    container.appendChild(this.renderer.domElement);

    // 2. Camera & Scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 42);

    // 3. Build Objects
    this.setupLighting();
    this.setupStarfield();
    this.setupPlanet();
    this.setupSatellite();

    // 4. Bind Mouse Parallax
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onWindowResize);

    // 5. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animFrameId = requestAnimationFrame(this.animate);
  }

  private setupLighting() {
    // Ambient cosmic glow
    const ambient = new THREE.AmbientLight(0x1a263f, 0.5);
    this.scene.add(ambient);

    // Harsh solar sunlight from top-right (creating dramatic crescent terminator on planet)
    const sunLight = new THREE.DirectionalLight(0xfffaea, 2.8);
    sunLight.position.set(60, 30, 40);
    this.scene.add(sunLight);

    // Rim backlight
    const rimLight = new THREE.DirectionalLight(0x0088ff, 0.4);
    rimLight.position.set(-50, -20, -30);
    this.scene.add(rimLight);
  }

  private setupStarfield() {
    const starCount = 800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 120 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xddeeff,
      size: 1.5,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: false,
    });
    this.starParticles = new THREE.Points(geo, mat);
    this.scene.add(this.starParticles);
  }

  private setupPlanet() {
    this.planetGroup = new THREE.Group();
    // Offset slightly to the right for cinematic composition
    this.planetGroup.position.set(11, -1, 0);

    // Procedural Mars texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Base Martian Rust
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#9e3d1b');
    grad.addColorStop(0.5, '#c85a2b');
    grad.addColorStop(1, '#812a0f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Dark volcanic basalt regions (Syrtis Major, Acidalia)
    ctx.fillStyle = 'rgba(40, 18, 12, 0.55)';
    for (let i = 0; i < 28; i++) {
      ctx.beginPath();
      const cx = (i * 37) % 512;
      const cy = 80 + Math.sin(i * 1.5) * 50;
      ctx.ellipse(cx, cy, 35 + (i % 20), 20 + (i % 15), i * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Polar Carbon-Dioxide Ice Cap
    ctx.fillStyle = '#f5f7fa';
    ctx.beginPath();
    ctx.ellipse(256, 15, 60, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    const planetTex = new THREE.CanvasTexture(canvas);

    // Planet Geometry
    const planetGeo = new THREE.SphereGeometry(15, 32, 24);
    const planetMat = new THREE.MeshLambertMaterial({
      map: planetTex,
      bumpScale: 0.05,
    });

    this.planetMesh = new THREE.Mesh(planetGeo, planetMat);
    this.planetGroup.add(this.planetMesh);

    // Atmospheric Glow Halo
    const atmosGeo = new THREE.SphereGeometry(15.4, 32, 24);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0xdf6a3b,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    this.atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    this.planetGroup.add(this.atmosphereMesh);

    this.scene.add(this.planetGroup);
  }

  private setupSatellite() {
    this.satelliteGroup = new THREE.Group();

    // Satellite body
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
    const solarMat = new THREE.MeshBasicMaterial({ color: 0x114488 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.4), bodyMat);
    this.satelliteGroup.add(body);

    // Solar Wings
    const wingGeo = new THREE.BoxGeometry(2.4, 0.05, 0.7);
    const leftWing = new THREE.Mesh(wingGeo, solarMat);
    leftWing.position.set(-1.6, 0, 0);
    this.satelliteGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, solarMat);
    rightWing.position.set(1.6, 0, 0);
    this.satelliteGroup.add(rightWing);

    // Flashing red navigation beacon
    this.beaconLight = new THREE.PointLight(0xff2200, 1.5, 6);
    this.beaconLight.position.set(0, 0.6, 0.7);
    this.satelliteGroup.add(this.beaconLight);

    this.scene.add(this.satelliteGroup);
  }

  private onMouseMove(e: MouseEvent) {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    this.mouseX = (e.clientX - halfW) / halfW;
    this.mouseY = (e.clientY - halfH) / halfH;
  }

  private onWindowResize() {
    if (!this.container || this.isDisposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private animate() {
    if (this.isDisposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Rotate planet slowly
    if (this.planetMesh) {
      this.planetMesh.rotation.y += delta * 0.04;
    }

    // Slowly drift starfield
    if (this.starParticles) {
      this.starParticles.rotation.y += delta * 0.005;
    }

    // Orbit satellite around planet
    if (this.satelliteGroup) {
      const satAngle = time * 0.35;
      const satRadius = 22;
      this.satelliteGroup.position.set(
        this.planetGroup.position.x + Math.cos(satAngle) * satRadius,
        this.planetGroup.position.y + Math.sin(satAngle * 0.5) * 4,
        this.planetGroup.position.z + Math.sin(satAngle) * satRadius
      );
      this.satelliteGroup.rotation.y = -satAngle + Math.PI / 2;

      // Pulse beacon
      if (this.beaconLight) {
        this.beaconLight.intensity = Math.sin(time * 8) > 0.4 ? 2.5 : 0;
      }
    }

    // Smooth Mouse Parallax
    this.targetRotY = this.mouseX * 0.08;
    this.targetRotX = -this.mouseY * 0.06;

    this.camera.position.x += (this.targetRotY * 12 - this.camera.position.x) * 0.04;
    this.camera.position.y += (this.targetRotX * 8 - this.camera.position.y) * 0.04;
    this.camera.lookAt(2, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.isDisposed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
