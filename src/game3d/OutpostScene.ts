import * as THREE from 'three';
import { DestinationType, OutpostConfiguration } from '../types';
import { soundEngine } from '../utils/audio';

export type CameraMode = 'astronaut' | 'rover' | 'tactical';
export type GraphicsQuality = 'low' | 'med' | 'high';

export interface InteractiveTarget {
  id: string;
  type: 'solar' | 'airlock' | 'scrubber' | 'greenhouse' | 'ice_deposit' | 'rover';
  name: string;
  position: THREE.Vector3;
  radius: number;
  actionPrompt: string;
  detail: string;
}

export class OutpostScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  // Configuration
  private destination: DestinationType;
  private outpostConfig: OutpostConfiguration;
  private quality: GraphicsQuality = 'low';

  // Game Objects
  private terrainMesh!: THREE.Mesh;
  private astronautGroup!: THREE.Group;
  private astronautTorso!: THREE.Mesh;
  private astronautLeftLeg!: THREE.Mesh;
  private astronautRightLeg!: THREE.Mesh;
  private astronautLeftArm!: THREE.Mesh;
  private astronautRightArm!: THREE.Mesh;
  private astronautVisor!: THREE.Mesh;
  private astronautLight!: THREE.SpotLight;

  private roverGroup!: THREE.Group;
  private roverWheels: THREE.Mesh[] = [];
  private roverLight!: THREE.SpotLight;

  // Base Modules
  private habitatGroup!: THREE.Group;
  private solarGroup!: THREE.Group;
  private greenhouseGroup!: THREE.Group;
  private eclssGroup!: THREE.Group;
  private commsDish!: THREE.Mesh;
  private landerGroup!: THREE.Group;
  private emergencyBeacons: THREE.PointLight[] = [];

  // Particles & Environment
  private dustStormParticles!: THREE.Points;
  private jetpackParticles!: THREE.Points;
  private thrusterPositions!: Float32Array;
  private isStormActive = false;
  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;

  // Interaction & Physics
  private targets: InteractiveTarget[] = [];
  private currentNearTarget: InteractiveTarget | null = null;
  public onNearTargetChange?: (target: InteractiveTarget | null) => void;

  // Camera & Controls State
  public cameraMode: CameraMode = 'astronaut';
  private playerPos = new THREE.Vector3(0, 0, 10);
  private playerVelocity = new THREE.Vector3();
  private playerRotationY = 0;
  private isGrounded = true;
  private walkTime = 0;
  private inRover = false;
  private flashlightOn = true;

  // Input State
  private keys: Record<string, boolean> = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  };

  // Tactical Camera
  private tacticalYaw = 0;
  private tacticalPitch = 0.6;
  private tacticalDistance = 45;
  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  private animFrameId: number | null = null;
  private isDisposed = false;

  constructor(
    container: HTMLElement,
    destination: DestinationType,
    outpostConfig: OutpostConfiguration,
    quality: GraphicsQuality = 'low'
  ) {
    this.container = container;
    this.destination = destination;
    this.outpostConfig = outpostConfig;
    this.quality = quality;
    this.clock = new THREE.Clock();

    // 1. Initialize Renderer (Optimized for 4GB RAM)
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'low-power',
      antialias: quality !== 'low',
      alpha: false,
      depth: true,
      stencil: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.applyQualitySettings(quality);
    container.appendChild(this.renderer.domElement);

    // 2. Initialize Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.2,
      600
    );

    // 3. Setup World
    this.setupSkyAndFog();
    this.setupLighting();
    this.buildTerrain();
    this.buildOutpostModules();
    this.buildAstronaut();
    this.buildRover();
    this.buildGeologyAndDeposits();
    this.setupParticles();

    // 4. Bind Events
    this.bindInputs();
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);

    // 5. Start Game Loop
    this.animate = this.animate.bind(this);
    this.animFrameId = requestAnimationFrame(this.animate);
  }

  /**
   * Adjust graphics quality for low-end / 4GB RAM systems
   */
  public setQuality(quality: GraphicsQuality) {
    this.quality = quality;
    this.applyQualitySettings(quality);
  }

  private applyQualitySettings(quality: GraphicsQuality) {
    if (quality === 'low') {
      this.renderer.setPixelRatio(1.0);
      this.renderer.shadowMap.enabled = false;
    } else if (quality === 'med') {
      this.renderer.setPixelRatio(1.0);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.BasicShadowMap;
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }

  /**
   * Procedural procedural sky & fog
   */
  private setupSkyAndFog() {
    if (this.destination === 'mars') {
      // Mars: salmon/ochre dusty haze
      const marsFog = new THREE.Color(0xb25329);
      this.scene.background = marsFog;
      this.scene.fog = new THREE.FogExp2(0xb25329, 0.012);

      // Starfield (dim through Martian dust)
      this.createStars(400, 0xffeedd, 0.6);
    } else {
      // Moon: pitch black void, brilliant stark stars, Earth in sky
      const lunarVoid = new THREE.Color(0x020307);
      this.scene.background = lunarVoid;
      this.scene.fog = new THREE.FogExp2(0x020307, 0.003);

      // Bright stars
      this.createStars(1200, 0xffffff, 1.0);
      this.createEarth();
    }
  }

  private createStars(count: number, colorHex: number, opacity: number) {
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 250 + Math.random() * 50;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 15; // Above horizon
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      color: colorHex,
      size: 1.5,
      transparent: true,
      opacity,
      sizeAttenuation: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(starPoints);
  }

  private createEarth() {
    const earthGeo = new THREE.SphereGeometry(8, 16, 16);
    // Procedural blue marble Earth texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0b3d91';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#ffffff';
    // cloud swirls
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 128, Math.random() * 64, Math.random() * 8 + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
    }
    const earthTex = new THREE.CanvasTexture(canvas);
    const earthMat = new THREE.MeshBasicMaterial({ map: earthTex });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(120, 95, -180);
    this.scene.add(earth);
  }

  private setupLighting() {
    if (this.destination === 'mars') {
      this.ambientLight = new THREE.AmbientLight(0xd47a4d, 0.7);
      this.scene.add(this.ambientLight);

      this.sunLight = new THREE.DirectionalLight(0xfff0dd, 1.4);
      this.sunLight.position.set(60, 80, 40);
    } else {
      this.ambientLight = new THREE.AmbientLight(0x222633, 0.4); // harsh lunar shadows
      this.scene.add(this.ambientLight);

      this.sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
      this.sunLight.position.set(80, 90, 50);
    }

    if (this.quality !== 'low') {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = 512;
      this.sunLight.shadow.mapSize.height = 512;
      this.sunLight.shadow.camera.near = 10;
      this.sunLight.shadow.camera.far = 250;
      this.sunLight.shadow.camera.left = -50;
      this.sunLight.shadow.camera.right = 50;
      this.sunLight.shadow.camera.top = 50;
      this.sunLight.shadow.camera.bottom = -50;
    }
    this.scene.add(this.sunLight);
  }

  /**
   * Procedural terrain with low-poly craters and dunes
   */
  private buildTerrain() {
    const size = 180;
    const segments = this.quality === 'low' ? 32 : 48;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Keep base area flat
      const distFromCenter = Math.sqrt(x * x + z * z);
      let y = 0;
      if (distFromCenter > 18) {
        // Natural craters and undulating dunes
        const wave1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 2.2;
        const wave2 = Math.sin(x * 0.03 + 1.2) * Math.cos(z * 0.03 - 0.7) * 4.5;
        // Crater rim
        const craterDist = Math.sqrt((x - 40) ** 2 + (z + 30) ** 2);
        let craterLip = 0;
        if (craterDist < 25) {
          craterLip = Math.sin((craterDist / 25) * Math.PI) * -3.5;
        }
        y = (wave1 + wave2 + craterLip) * Math.min(1, (distFromCenter - 18) / 25);
      }
      pos.setY(i, y);
    }
    geo.computeVertexNormals();

    // Procedural terrain texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    if (this.destination === 'mars') {
      ctx.fillStyle = '#9c3d18';
      ctx.fillRect(0, 0, 256, 256);
      // Speckles & rocks
      for (let i = 0; i < 400; i++) {
        const px = Math.random() * 256;
        const py = Math.random() * 256;
        const r = Math.random() * 3 + 1;
        ctx.fillStyle = Math.random() > 0.5 ? '#b85124' : '#68220c';
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#4c5059';
      ctx.fillRect(0, 0, 256, 256);
      // Lunar regolith dust
      for (let i = 0; i < 500; i++) {
        const px = Math.random() * 256;
        const py = Math.random() * 256;
        const r = Math.random() * 2 + 1;
        ctx.fillStyle = Math.random() > 0.5 ? '#6a707c' : '#2b2e35';
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 12);

    const mat = new THREE.MeshLambertMaterial({
      map: texture,
    });

    this.terrainMesh = new THREE.Mesh(geo, mat);
    this.terrainMesh.receiveShadow = this.quality !== 'low';
    this.scene.add(this.terrainMesh);
  }

  public getTerrainHeight(x: number, z: number): number {
    const dist = Math.sqrt(x * x + z * z);
    if (dist < 18) return 0;
    const wave1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 2.2;
    const wave2 = Math.sin(x * 0.03 + 1.2) * Math.cos(z * 0.03 - 0.7) * 4.5;
    return (wave1 + wave2) * Math.min(1, (dist - 18) / 25);
  }

  /**
   * Build Outpost 3D Architecture
   */
  private buildOutpostModules() {
    // Shared materials
    const whiteModuleMat = new THREE.MeshLambertMaterial({ color: 0xe8ecf2 });
    const darkMetalMat = new THREE.MeshLambertMaterial({ color: 0x333842 });
    const solarBlueMat = new THREE.MeshLambertMaterial({ color: 0x1a468c });
    const goldFoilMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });

    // 1. Central Habitat Dome / Modules
    this.habitatGroup = new THREE.Group();
    const habChoice = this.outpostConfig.habitat || 'hab_transhab';

    if (habChoice === 'hab_subsurface_cavern') {
      // Subsurface lava tube entrance arch & surface bunker
      const bunker = new THREE.Mesh(new THREE.CylinderGeometry(8, 9, 4, 12), darkMetalMat);
      bunker.position.y = 2;
      this.habitatGroup.add(bunker);

      const airlockDoor = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 2), whiteModuleMat);
      airlockDoor.position.set(0, 1.5, 8.5);
      this.habitatGroup.add(airlockDoor);
    } else {
      // Inflatable / Rigid Dome
      const domeGeo = new THREE.SphereGeometry(7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = habChoice === 'hab_transhab' 
        ? new THREE.MeshLambertMaterial({ color: 0xf4eedb }) // Kevlar weave
        : whiteModuleMat; // Aluminum
      const dome = new THREE.Mesh(domeGeo, domeMat);
      this.habitatGroup.add(dome);

      // Habitat foundation ring
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 1, 16), darkMetalMat);
      ring.position.y = 0.5;
      this.habitatGroup.add(ring);

      // Airlock tunnel
      const airlock = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 4, 8), whiteModuleMat);
      airlock.rotation.x = Math.PI / 2;
      airlock.position.set(0, 1.6, 7.5);
      this.habitatGroup.add(airlock);
    }

    // Emergency flashing beacon on Hab roof
    const habBeacon = new THREE.PointLight(0xff3300, 0, 15);
    habBeacon.position.set(0, 7.5, 0);
    this.habitatGroup.add(habBeacon);
    this.emergencyBeacons.push(habBeacon);

    this.scene.add(this.habitatGroup);

    // Register Airlock as interactive target
    this.targets.push({
      id: 'target_airlock',
      type: 'airlock',
      name: 'Central Habitat Airlock',
      position: new THREE.Vector3(0, 1, 7.5),
      radius: 4.5,
      actionPrompt: '[E] EVA Hull Inspection & Emergency Shelter',
      detail: 'Pressurize airlock, conduct structural maintenance, or shelter from solar radiation.',
    });

    // 2. Power Grid (Solar Array / Nuclear Kilopower)
    this.solarGroup = new THREE.Group();
    this.solarGroup.position.set(-16, 0, -4);
    const powerChoice = this.outpostConfig.power || 'pow_solar_rosa';

    if (powerChoice === 'pow_kilopower_nuclear') {
      // Kilopower Nuclear Fission Tower with Stirling cooling fins
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 7, 8), darkMetalMat);
      tower.position.y = 3.5;
      this.solarGroup.add(tower);

      const radCore = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
      radCore.position.y = 2;
      this.solarGroup.add(radCore);

      // Cooling fins
      for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4, 3.5), whiteModuleMat);
        fin.position.set(0, 4, 0);
        fin.rotation.y = (i * Math.PI) / 4;
        this.solarGroup.add(fin);
      }
    } else {
      // Solar Panel Arrays (dual track rows)
      for (let row = -1; row <= 1; row += 2) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.5, 6), darkMetalMat);
        pole.position.set(row * 3.5, 1.25, 0);
        this.solarGroup.add(pole);

        const panel = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.1, 2.2), solarBlueMat);
        panel.position.set(row * 3.5, 2.4, 0);
        panel.rotation.x = 0.35;
        this.solarGroup.add(panel);
      }
    }
    this.scene.add(this.solarGroup);

    this.targets.push({
      id: 'target_solar',
      type: 'solar',
      name: powerChoice === 'pow_kilopower_nuclear' ? 'KRUSTI Kilopower Reactor' : 'Surface Solar Array Farm',
      position: new THREE.Vector3(-16, 1, -4),
      radius: 4.5,
      actionPrompt: powerChoice === 'pow_kilopower_nuclear' ? '[E] Calibrate Fission Control Rods' : '[E] Clear Regolith Dust Grit',
      detail: 'Service power generators to restore peak energy production.',
    });

    // 3. Greenhouse & Agriculture
    this.greenhouseGroup = new THREE.Group();
    this.greenhouseGroup.position.set(16, 0, -3);
    const greenhouseDome = new THREE.Mesh(
      new THREE.SphereGeometry(4.5, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshLambertMaterial({
        color: 0x88ffaa,
        transparent: true,
        opacity: 0.65,
      })
    );
    this.greenhouseGroup.add(greenhouseDome);

    // Glowing interior plants
    const plantBed = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.4, 10), new THREE.MeshBasicMaterial({ color: 0x109930 }));
    plantBed.position.y = 0.2;
    this.greenhouseGroup.add(plantBed);

    const bioLight = new THREE.PointLight(0x44ff88, 1.2, 10);
    bioLight.position.set(0, 2.5, 0);
    this.greenhouseGroup.add(bioLight);

    this.scene.add(this.greenhouseGroup);

    this.targets.push({
      id: 'target_greenhouse',
      type: 'greenhouse',
      name: 'Aeroponic Agricultural Biosphere',
      position: new THREE.Vector3(16, 1, -3),
      radius: 4.5,
      actionPrompt: '[E] Tend Hydroponics & Harvest Crops',
      detail: 'Stimulate nutrient delivery to boost crew food calories.',
    });

    // 4. ECLSS & Water Recycling Facility
    this.eclssGroup = new THREE.Group();
    this.eclssGroup.position.set(0, 0, -15);
    // Triple condenser cylinders
    for (let i = -1; i <= 1; i++) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.8, 10), whiteModuleMat);
      tank.position.set(i * 2.8, 1.9, 0);
      this.eclssGroup.add(tank);
      // blue valve ring
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.1, 6, 12), new THREE.MeshBasicMaterial({ color: 0x00aaff }));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(i * 2.8, 2.5, 0);
      this.eclssGroup.add(ring);
    }
    this.scene.add(this.eclssGroup);

    this.targets.push({
      id: 'target_scrubber',
      type: 'scrubber',
      name: 'ECLSS Atmospheric & Water Processor',
      position: new THREE.Vector3(0, 1, -15),
      radius: 4.5,
      actionPrompt: '[E] Purge Amine Scrubbers & Check Filters',
      detail: 'Purge carbon dioxide capture scrubbers and cycle water recovery loops.',
    });

    // 5. Communications Dish Mast
    const commsGroup = new THREE.Group();
    commsGroup.position.set(12, 0, 12);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 6, 6), darkMetalMat);
    mast.position.y = 3;
    commsGroup.add(mast);

    const dishGeo = new THREE.CylinderGeometry(2, 0.3, 0.8, 12, 1, true);
    this.commsDish = new THREE.Mesh(dishGeo, whiteModuleMat);
    this.commsDish.position.set(0, 6, 0);
    this.commsDish.rotation.x = 0.6;
    commsGroup.add(this.commsDish);
    this.scene.add(commsGroup);

    // 6. Artemis / Apollo Landing Craft
    this.landerGroup = new THREE.Group();
    this.landerGroup.position.set(-28, 0, 22);
    // Octagonal base with gold foil
    const landerBase = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 2.5, 8), goldFoilMat);
    landerBase.position.y = 2.2;
    this.landerGroup.add(landerBase);

    // 4 Landing leg struts
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4.5, 4), darkMetalMat);
      leg.position.set(Math.cos((i * Math.PI) / 2) * 3.8, 1.2, Math.sin((i * Math.PI) / 2) * 3.8);
      leg.rotation.z = Math.cos((i * Math.PI) / 2) * 0.4;
      leg.rotation.x = Math.sin((i * Math.PI) / 2) * 0.4;
      this.landerGroup.add(leg);
    }

    // Ascent stage pod
    const ascentPod = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 3, 8), whiteModuleMat);
    ascentPod.position.y = 4.8;
    this.landerGroup.add(ascentPod);

    // Planted Flag nearby
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 6), darkMetalMat);
    flagPole.position.set(4, 1.5, 2);
    this.landerGroup.add(flagPole);

    const flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), new THREE.MeshBasicMaterial({ color: 0x0055aa, side: THREE.DoubleSide }));
    flagMesh.position.set(4.6, 2.5, 2);
    this.landerGroup.add(flagMesh);

    this.scene.add(this.landerGroup);
  }

  /**
   * Procedural Astronaut Character
   */
  private buildAstronaut() {
    this.astronautGroup = new THREE.Group();
    const suitMat = new THREE.MeshLambertMaterial({ color: 0xf5f7fa });
    const jointMat = new THREE.MeshLambertMaterial({ color: 0x3a404d });
    const goldVisorMat = new THREE.MeshBasicMaterial({ color: 0xffb700 });

    // Torso
    this.astronautTorso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.45), suitMat);
    this.astronautTorso.position.y = 1.2;
    this.astronautGroup.add(this.astronautTorso);

    // Chest pack
    const chestUnit = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.15), jointMat);
    chestUnit.position.set(0, 1.2, 0.28);
    this.astronautGroup.add(chestUnit);

    // Helmet & Visor
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), suitMat);
    helmet.position.set(0, 1.85, 0);
    this.astronautGroup.add(helmet);

    this.astronautVisor = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8, 0, Math.PI, 0, Math.PI), goldVisorMat);
    this.astronautVisor.rotation.x = Math.PI / 2;
    this.astronautVisor.position.set(0, 1.85, 0.2);
    this.astronautGroup.add(this.astronautVisor);

    // PLSS Backpack (Portable Life Support System)
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.3), suitMat);
    backpack.position.set(0, 1.3, -0.35);
    this.astronautGroup.add(backpack);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.75, 0.26);
    this.astronautLeftLeg = new THREE.Mesh(legGeo, suitMat);
    this.astronautLeftLeg.position.set(-0.2, 0.45, 0);
    this.astronautGroup.add(this.astronautLeftLeg);

    this.astronautRightLeg = new THREE.Mesh(legGeo, suitMat);
    this.astronautRightLeg.position.set(0.2, 0.45, 0);
    this.astronautGroup.add(this.astronautRightLeg);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.18, 0.7, 0.2);
    this.astronautLeftArm = new THREE.Mesh(armGeo, suitMat);
    this.astronautLeftArm.position.set(-0.46, 1.15, 0);
    this.astronautGroup.add(this.astronautLeftArm);

    this.astronautRightArm = new THREE.Mesh(armGeo, suitMat);
    this.astronautRightArm.position.set(0.46, 1.15, 0);
    this.astronautGroup.add(this.astronautRightArm);

    // Suit Flashlight
    this.astronautLight = new THREE.SpotLight(0xffffff, 1.6, 25, Math.PI / 5, 0.4);
    this.astronautLight.position.set(0, 1.8, 0.2);
    this.astronautLight.target.position.set(0, 1.4, 10);
    this.astronautGroup.add(this.astronautLight);
    this.astronautGroup.add(this.astronautLight.target);

    this.astronautGroup.position.copy(this.playerPos);
    this.scene.add(this.astronautGroup);
  }

  /**
   * Planetary Rover Vehicle
   */
  private buildRover() {
    this.roverGroup = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xdedede });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x22262d });
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111317 });

    // Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 4.0), bodyMat);
    chassis.position.y = 1.0;
    this.roverGroup.add(chassis);

    // Cockpit rollcage / cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 2.2), darkMat);
    cabin.position.set(0, 1.8, 0.2);
    this.roverGroup.add(cabin);

    // Solar rooftop
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 2.4), new THREE.MeshBasicMaterial({ color: 0x1a468c }));
    roof.position.set(0, 2.45, 0.2);
    this.roverGroup.add(roof);

    // 6 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    const zOffsets = [-1.4, 0, 1.4];
    for (const z of zOffsets) {
      for (const side of [-1.35, 1.35]) {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(side, 0.55, z);
        this.roverGroup.add(wheel);
        this.roverWheels.push(wheel);
      }
    }

    // Rover Headlights
    this.roverLight = new THREE.SpotLight(0xfffaed, 2.0, 35, Math.PI / 4, 0.3);
    this.roverLight.position.set(0, 1.2, 2.1);
    this.roverLight.target.position.set(0, 0.8, 15);
    this.roverGroup.add(this.roverLight);
    this.roverGroup.add(this.roverLight.target);

    // Initial parked location
    this.roverGroup.position.set(-10, 0, 12);
    this.scene.add(this.roverGroup);

    this.targets.push({
      id: 'target_rover',
      type: 'rover',
      name: 'Manned Planetary Rover',
      position: new THREE.Vector3(-10, 1, 12),
      radius: 4.5,
      actionPrompt: '[E] Mount / Drive Rover',
      detail: 'Traverse the crater surface at high speed in pressurized cabin.',
    });
  }

  /**
   * Geological Deposits (Water Ice & Mineral Formations)
   */
  private buildGeologyAndDeposits() {
    const iceGeo = new THREE.DodecahedronGeometry(1.4, 0);
    const iceMat = new THREE.MeshBasicMaterial({
      color: 0x88e5ff,
      wireframe: false,
    });

    const depositCoords = [
      { x: 34, z: 28, name: 'Glacial Ice Pocket Alpha' },
      { x: -38, z: -25, name: 'Subsurface Permafrost Ridge' },
      { x: 42, z: -35, name: 'Hydrated Regolith Deposit' },
      { x: -22, z: -40, name: 'Volatile Core Bed Beta' },
    ];

    depositCoords.forEach((coord, i) => {
      const y = this.getTerrainHeight(coord.x, coord.z);
      const iceMesh = new THREE.Mesh(iceGeo, iceMat);
      iceMesh.position.set(coord.x, y + 0.8, coord.z);
      this.scene.add(iceMesh);

      // Gentle glow
      const glow = new THREE.PointLight(0x00c8ff, 0.8, 8);
      glow.position.set(coord.x, y + 1.5, coord.z);
      this.scene.add(glow);

      this.targets.push({
        id: `target_ice_${i}`,
        type: 'ice_deposit',
        name: coord.name,
        position: new THREE.Vector3(coord.x, y + 1, coord.z),
        radius: 4.5,
        actionPrompt: '[E] Core-Drill Ice Pocket (+15L Water)',
        detail: 'Extract extraterrestrial water ice for life support reserves.',
      });
    });
  }

  /**
   * Particle Systems: Martian Dust Storm & Jetpack RCS sparks
   */
  private setupParticles() {
    // 1. Dust Storm Particles
    const dustCount = this.quality === 'low' ? 200 : 600;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 120;
      dustPos[i * 3 + 1] = Math.random() * 25;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: this.destination === 'mars' ? 0xc75e2b : 0xa0a8b5,
      size: 1.8,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
    });
    this.dustStormParticles = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dustStormParticles);

    // 2. Jetpack Thrusters
    const thrustCount = 30;
    const thrustGeo = new THREE.BufferGeometry();
    this.thrusterPositions = new Float32Array(thrustCount * 3);
    thrustGeo.setAttribute('position', new THREE.BufferAttribute(this.thrusterPositions, 3));
    const thrustMat = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 2.2,
      transparent: true,
      opacity: 0.8,
    });
    this.jetpackParticles = new THREE.Points(thrustGeo, thrustMat);
    this.jetpackParticles.visible = false;
    this.scene.add(this.jetpackParticles);
  }

  /**
   * Trigger dust storm or crisis visual effects in 3D
   */
  public setStormState(active: boolean) {
    this.isStormActive = active;
    if (this.dustStormParticles) {
      const mat = this.dustStormParticles.material as THREE.PointsMaterial;
      mat.opacity = active ? 0.75 : 0.25;
      mat.size = active ? 3.0 : 1.8;
    }
  }

  public setAlarmState(active: boolean) {
    this.emergencyBeacons.forEach(b => {
      b.intensity = active ? 2.5 : 0;
    });
  }

  /**
   * Input Bindings (WASD, Arrows, Space, Shift, E, F, C)
   */
  private bindInputs() {
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = true;
      if (code === 'Space') {
        this.keys.jump = true;
        e.preventDefault();
      }
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = true;

      // Action Key: [E]
      if (code === 'KeyE') {
        this.triggerCurrentAction();
      }

      // Flashlight: [F]
      if (code === 'KeyF') {
        this.toggleFlashlight();
      }

      // Camera Switch: [C]
      if (code === 'KeyC') {
        this.cycleCamera();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = false;
      if (code === 'Space') this.keys.jump = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = false;
    });

    // Mouse Drag for Camera Orbiting
    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      if (this.cameraMode === 'tactical') {
        this.tacticalYaw -= dx * 0.008;
        this.tacticalPitch = Math.max(0.2, Math.min(1.4, this.tacticalPitch + dy * 0.008));
      } else {
        this.playerRotationY -= dx * 0.006;
      }
    });

    // Mouse Wheel Zoom
    dom.addEventListener('wheel', (e) => {
      if (this.cameraMode === 'tactical') {
        this.tacticalDistance = Math.max(15, Math.min(120, this.tacticalDistance + e.deltaY * 0.05));
      }
    });
  }

  public setVirtualInput(action: 'forward' | 'backward' | 'left' | 'right' | 'jump' | 'sprint', value: boolean) {
    this.keys[action] = value;
  }

  public toggleFlashlight() {
    this.flashlightOn = !this.flashlightOn;
    this.astronautLight.intensity = this.flashlightOn ? 1.6 : 0;
    this.roverLight.intensity = this.flashlightOn ? 2.0 : 0;
    soundEngine.playBeep(980, 0.05, 'triangle');
  }

  public cycleCamera() {
    if (this.cameraMode === 'astronaut') this.cameraMode = 'rover';
    else if (this.cameraMode === 'rover') this.cameraMode = 'tactical';
    else this.cameraMode = 'astronaut';
    soundEngine.playBeep(1200, 0.06, 'sine');
  }

  /**
   * Trigger interactive object near player
   */
  public triggerCurrentAction(): InteractiveTarget | null {
    if (!this.currentNearTarget) return null;

    const target = this.currentNearTarget;
    if (target.type === 'rover') {
      this.inRover = !this.inRover;
      if (this.inRover) {
        this.cameraMode = 'rover';
        this.astronautGroup.visible = false;
        soundEngine.playInteract();
      } else {
        this.cameraMode = 'astronaut';
        this.astronautGroup.visible = true;
        this.playerPos.set(this.roverGroup.position.x + 2.5, 0, this.roverGroup.position.z);
        soundEngine.playInteract();
      }
      return target;
    }

    if (target.type === 'ice_deposit') {
      soundEngine.playDrill();
    } else if (target.type === 'airlock' || target.type === 'scrubber') {
      soundEngine.playWelding();
    } else {
      soundEngine.playInteract();
    }

    return target;
  }

  /**
   * Main Physics & Animation Loop
   */
  private animate() {
    if (this.isDisposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Update Player & Rover Physics
    this.updateMovement(delta);

    // 2. Rotate Comms Dish & Animate Lights
    if (this.commsDish) {
      this.commsDish.rotation.y += delta * 0.2;
    }

    // Pulse emergency beacons if active
    if (this.emergencyBeacons[0] && this.emergencyBeacons[0].intensity > 0) {
      const pulse = (Math.sin(this.clock.getElapsedTime() * 6) + 1) * 1.5;
      this.emergencyBeacons.forEach(b => b.intensity = pulse);
    }

    // 3. Update Dust Storm Particles
    if (this.dustStormParticles) {
      const pos = this.dustStormParticles.geometry.attributes.position as THREE.BufferAttribute;
      const speed = this.isStormActive ? 40 : 10;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) - delta * speed;
        let y = pos.getY(i) - delta * 2;
        let z = pos.getZ(i) + delta * (speed * 0.4);
        if (x < -60) x = 60;
        if (y < 0) y = 25;
        if (z > 60) z = -60;
        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }

    // 4. Check Proximity to Interactive Objects
    this.checkProximity();

    // 5. Update Camera Position & Target
    this.updateCamera();

    // 6. Render
    this.renderer.render(this.scene, this.camera);
  }

  private updateMovement(delta: number) {
    const isMars = this.destination === 'mars';
    const gravity = isMars ? 3.7 : 1.62; // Realistic low gravity!

    if (this.inRover) {
      // ROVER VEHICLE PHYSICS
      const speed = this.keys.sprint ? 18 : 10;
      if (this.keys.left) this.roverGroup.rotation.y += delta * 2.2;
      if (this.keys.right) this.roverGroup.rotation.y -= delta * 2.2;

      let moveDist = 0;
      if (this.keys.forward) moveDist += speed * delta;
      if (this.keys.backward) moveDist -= (speed * 0.5) * delta;

      if (moveDist !== 0) {
        this.roverGroup.translateZ(moveDist);
        // Spin wheels
        this.roverWheels.forEach(w => w.rotation.x += moveDist * 1.5);
      }

      // Stick rover to terrain
      const terY = this.getTerrainHeight(this.roverGroup.position.x, this.roverGroup.position.z);
      this.roverGroup.position.y = terY;

    } else {
      // ASTRONAUT EVA CONTROLLER
      const speed = this.keys.sprint ? 7.5 : 4.0;
      let moveX = 0;
      let moveZ = 0;

      if (this.keys.forward) moveZ += 1;
      if (this.keys.backward) moveZ -= 1;
      if (this.keys.left) moveX += 1;
      if (this.keys.right) moveX -= 1;

      const isMoving = moveX !== 0 || moveZ !== 0;

      if (isMoving) {
        // Move in direction player is facing
        const angle = this.playerRotationY + Math.atan2(moveX, moveZ);
        this.playerVelocity.x = Math.sin(angle) * speed;
        this.playerVelocity.z = Math.cos(angle) * speed;

        this.walkTime += delta * (this.keys.sprint ? 12 : 7);

        // Footsteps sound effect (subtle)
        if (Math.sin(this.walkTime) > 0.95 && this.isGrounded) {
          soundEngine.playFootstep();
        }

        // Animate Astronaut limbs walking
        const legSwing = Math.sin(this.walkTime) * 0.45;
        this.astronautLeftLeg.rotation.x = legSwing;
        this.astronautRightLeg.rotation.x = -legSwing;
        this.astronautLeftArm.rotation.x = -legSwing;
        this.astronautRightArm.rotation.x = legSwing;
      } else {
        this.playerVelocity.x *= 0.8;
        this.playerVelocity.z *= 0.8;
        this.astronautLeftLeg.rotation.x *= 0.8;
        this.astronautRightLeg.rotation.x *= 0.8;
        this.astronautLeftArm.rotation.x *= 0.8;
        this.astronautRightArm.rotation.x *= 0.8;
      }

      // Jump / Jetpack
      if (this.keys.jump && this.isGrounded) {
        this.playerVelocity.y = isMars ? 4.8 : 3.8; // High floaty jump
        this.isGrounded = false;
        soundEngine.playJetpackBurst();
        this.jetpackParticles.visible = true;
      }

      // Apply Gravity
      if (!this.isGrounded) {
        this.playerVelocity.y -= gravity * delta * 1.5;
      }

      // Update position
      this.playerPos.x += this.playerVelocity.x * delta;
      this.playerPos.z += this.playerVelocity.z * delta;
      this.playerPos.y += this.playerVelocity.y * delta;

      // Ground Collision
      const terrainY = this.getTerrainHeight(this.playerPos.x, this.playerPos.z);
      if (this.playerPos.y <= terrainY) {
        this.playerPos.y = terrainY;
        this.playerVelocity.y = 0;
        this.isGrounded = true;
        this.jetpackParticles.visible = false;
      }

      this.astronautGroup.position.copy(this.playerPos);
      this.astronautGroup.rotation.y = this.playerRotationY;

      // Jetpack particles position
      if (this.jetpackParticles.visible) {
        this.jetpackParticles.position.set(this.playerPos.x, this.playerPos.y + 1.2, this.playerPos.z);
      }
    }
  }

  private checkProximity() {
    const checkPos = this.inRover ? this.roverGroup.position : this.playerPos;
    let closestTarget: InteractiveTarget | null = null;
    let closestDist = Infinity;

    for (const target of this.targets) {
      if (this.inRover && target.type === 'rover') continue;
      const d = checkPos.distanceTo(target.position);
      if (d <= target.radius && d < closestDist) {
        closestDist = d;
        closestTarget = target;
      }
    }

    if (closestTarget !== this.currentNearTarget) {
      this.currentNearTarget = closestTarget;
      if (this.onNearTargetChange) {
        this.onNearTargetChange(closestTarget);
      }
    }
  }

  private updateCamera() {
    if (this.cameraMode === 'astronaut') {
      // 3rd Person Astronaut Camera (Over-the-shoulder follow)
      const dist = 4.8;
      const height = 2.4;
      const angle = this.playerRotationY;

      const targetCamX = this.playerPos.x - Math.sin(angle) * dist;
      const targetCamZ = this.playerPos.z - Math.cos(angle) * dist;
      const targetCamY = this.playerPos.y + height;

      this.camera.position.set(targetCamX, targetCamY, targetCamZ);
      this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.4, this.playerPos.z);

    } else if (this.cameraMode === 'rover') {
      // Chase Camera behind Rover
      const dist = 7.5;
      const height = 3.6;
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.roverGroup.quaternion);

      this.camera.position.set(
        this.roverGroup.position.x - forward.x * dist,
        this.roverGroup.position.y + height,
        this.roverGroup.position.z - forward.z * dist
      );
      this.camera.lookAt(
        this.roverGroup.position.x,
        this.roverGroup.position.y + 1.2,
        this.roverGroup.position.z
      );

    } else {
      // Tactical RTS / Flight Director Overview Camera
      const x = Math.sin(this.tacticalYaw) * Math.cos(this.tacticalPitch) * this.tacticalDistance;
      const y = Math.sin(this.tacticalPitch) * this.tacticalDistance;
      const z = Math.cos(this.tacticalYaw) * Math.cos(this.tacticalPitch) * this.tacticalDistance;

      this.camera.position.set(x, y, z);
      this.camera.lookAt(0, 2, 0);
    }
  }

  private onWindowResize() {
    if (!this.container || this.isDisposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  public getTargets(): InteractiveTarget[] {
    return this.targets;
  }

  public getPlayerPosition(): THREE.Vector3 {
    return this.inRover ? this.roverGroup.position : this.playerPos;
  }

  public getScreenCoordinates(worldPos: THREE.Vector3): { x: number; y: number; visible: boolean; distance: number } | null {
    if (!this.container || !this.camera) return null;
    const v = worldPos.clone();
    const playerP = this.getPlayerPosition();
    const distance = Math.round(playerP.distanceTo(worldPos));

    // Project world position to NDC (-1 to +1)
    v.project(this.camera);

    // Behind camera check
    const visible = v.z < 1.0 && v.x >= -1.1 && v.x <= 1.1 && v.y >= -1.1 && v.y <= 1.1;

    const halfW = this.container.clientWidth / 2;
    const halfH = this.container.clientHeight / 2;

    const x = v.x * halfW + halfW;
    const y = -(v.y * halfH) + halfH;

    return { x, y, visible, distance };
  }

  public dispose() {
    this.isDisposed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
