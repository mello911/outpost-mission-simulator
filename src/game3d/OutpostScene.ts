import * as THREE from 'three';
import { DestinationType, OutpostConfiguration, GeologicalSample, DeployedScienceStation } from '../types';
import { soundEngine } from '../utils/audio';

export type CameraMode = 'astronaut' | 'rover' | 'tactical';
export type GraphicsQuality = 'low' | 'med' | 'high';

export interface InteractiveTarget {
  id: string;
  type: 'solar' | 'airlock' | 'scrubber' | 'greenhouse' | 'ice_deposit' | 'rover' | 'rock_sample' | 'alsep_deploy' | 'supply_drop';
  name: string;
  position: THREE.Vector3;
  radius: number;
  actionPrompt: string;
  detail: string;
  metadata?: any;
}

export interface PhysRock {
  id: string;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  isAirborne: boolean;
  sampleData: GeologicalSample;
}

export interface SuitVitals {
  oxygenPct: number;
  batteryPct: number;
  rcsFuelPct: number;
  isWarning: boolean;
}

export interface DrillMinigameState {
  active: boolean;
  targetId: string | null;
  targetName: string;
  pressure: number; // 0 - 100
  sweetSpotMin: number;
  sweetSpotMax: number;
  progress: number; // 0 - 100
  heat: number; // 0 - 100
  extractedLitres: number;
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
  private roverChassis!: THREE.Group;
  private roverWheels: THREE.Mesh[] = [];
  private roverFrontWheels: THREE.Mesh[] = [];
  private roverLightLeft!: THREE.SpotLight;
  private roverLightRight!: THREE.SpotLight;

  // Base Modules
  private habitatGroup!: THREE.Group;
  private solarGroup!: THREE.Group;
  private greenhouseGroup!: THREE.Group;
  private eclssGroup!: THREE.Group;
  private commsDish!: THREE.Mesh;
  private landerGroup!: THREE.Group;
  private emergencyBeacons: THREE.PointLight[] = [];
  private exteriorStationLights: THREE.PointLight[] = [];

  // Particles & Environment
  private dustStormParticles!: THREE.Points;
  private jetpackParticles!: THREE.Points;
  private roverDustParticles!: THREE.Points;
  private dustDevilGroup!: THREE.Group;
  private meteorMesh!: THREE.Mesh;
  private isStormActive = false;
  private sunLight!: THREE.DirectionalLight;
  private sunMesh!: THREE.Mesh;
  private ambientLight!: THREE.AmbientLight;
  private earthMesh?: THREE.Mesh;

  // Day/Night astronomical cycle
  private solTime = 0.25; // 0.0 to 1.0 (0.25 = mid-morning, 0.5 = solar noon, 0.7 = sunset, 0.85 = night)
  private dayLengthSec = 120; // 2 minutes per full planetary day/night cycle for great gameplay!

  // Dynamic Physical Objects & Collectibles
  private targets: InteractiveTarget[] = [];
  private currentNearTarget: InteractiveTarget | null = null;
  public onNearTargetChange?: (target: InteractiveTarget | null) => void;

  private physRocks: PhysRock[] = [];
  private carriedRock: GeologicalSample | null = null;
  private carriedAlsep: boolean = false;
  private deployedStations: DeployedScienceStation[] = [];

  // Drill Minigame
  private drillState: DrillMinigameState = {
    active: false,
    targetId: null,
    targetName: '',
    pressure: 0,
    sweetSpotMin: 45,
    sweetSpotMax: 75,
    progress: 0,
    heat: 0,
    extractedLitres: 0,
  };

  // Suit EVA Vitals
  private suitVitals: SuitVitals = {
    oxygenPct: 100,
    batteryPct: 100,
    rcsFuelPct: 100,
    isWarning: false,
  };

  // Multispectral AR Scanner
  private scannerActive = false;
  private scannerRings: THREE.Group[] = [];

  // Callbacks to React HUD
  public onDrillComplete?: (extractedWater: number, sample?: GeologicalSample) => void;
  public onSampleCollected?: (sample: GeologicalSample) => void;
  public onStationDeployed?: (station: DeployedScienceStation) => void;
  public onSupplySalvaged?: (resources: { energy: number; water: number; integrity: number }) => void;
  public onSuitVitalsChange?: (vitals: SuitVitals) => void;

  // Camera & Controls State
  public cameraMode: CameraMode = 'astronaut';
  private playerPos = new THREE.Vector3(0, 0, 10);
  private playerVelocity = new THREE.Vector3();
  private playerRotationY = 0;
  private isGrounded = true;
  private walkTime = 0;
  private inRover = false;
  private flashlightOn = true;

  // Rover dynamics state
  private roverVelocity = 0;
  private roverSteerAngle = 0;
  private roverRotationY = 0;
  private isBoosting = false;

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
      700
    );

    // 3. Setup World
    this.setupSkyAndFog();
    this.setupLighting();
    this.buildTerrain();
    this.buildOutpostModules();
    this.buildAstronaut();
    this.buildRover();
    this.buildCollectiblesAndGeology();
    this.setupParticles();
    this.setupEnvironmentalHazards();

    // 4. Bind Events
    this.bindInputs();
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);

    // 5. Start Game Loop
    this.animate = this.animate.bind(this);
    this.animFrameId = requestAnimationFrame(this.animate);
  }

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

  private setupSkyAndFog() {
    if (this.destination === 'mars') {
      // Mars dusty atmosphere
      const marsFog = new THREE.Color(0xb25329);
      this.scene.background = marsFog;
      this.scene.fog = new THREE.FogExp2(0xb25329, 0.012);
      this.createStars(450, 0xffeedd, 0.5);
    } else {
      // Moon: pitch black void, brilliant stark stars, Earth in sky
      const lunarVoid = new THREE.Color(0x020307);
      this.scene.background = lunarVoid;
      this.scene.fog = new THREE.FogExp2(0x020307, 0.003);
      this.createStars(1400, 0xffffff, 1.0);
      this.createEarth();
    }
  }

  private createStars(count: number, colorHex: number, opacity: number) {
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 280 + Math.random() * 60;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 10;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      color: colorHex,
      size: 1.6,
      transparent: true,
      opacity,
      sizeAttenuation: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(starPoints);
  }

  private createEarth() {
    const earthGeo = new THREE.SphereGeometry(8, 16, 16);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0b3d91';
    ctx.fillRect(0, 0, 128, 64);
    // Swirling continents & clouds
    ctx.fillStyle = '#1e7538';
    ctx.beginPath();
    ctx.arc(40, 32, 14, 0, Math.PI * 2);
    ctx.arc(85, 28, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 128, Math.random() * 64, Math.random() * 8 + 3, 0, Math.PI * 2);
      ctx.fill();
    }
    const earthTex = new THREE.CanvasTexture(canvas);
    const earthMat = new THREE.MeshBasicMaterial({ map: earthTex });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthMesh.position.set(130, 95, -190);
    this.scene.add(this.earthMesh);
  }

  private setupLighting() {
    if (this.destination === 'mars') {
      this.ambientLight = new THREE.AmbientLight(0xd47a4d, 0.7);
      this.scene.add(this.ambientLight);

      this.sunLight = new THREE.DirectionalLight(0xfff0dd, 1.4);
      this.sunLight.position.set(60, 80, 40);
    } else {
      this.ambientLight = new THREE.AmbientLight(0x222633, 0.35);
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
      this.sunLight.shadow.camera.left = -55;
      this.sunLight.shadow.camera.right = 55;
      this.sunLight.shadow.camera.top = 55;
      this.sunLight.shadow.camera.bottom = -55;
    }
    this.scene.add(this.sunLight);

    // Glowing Sun Disc Mesh
    const sunGeo = new THREE.SphereGeometry(6, 12, 12);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffbe6 });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(this.sunMesh);
  }

  public getTerrainHeight(x: number, z: number): number {
    const dist = Math.sqrt(x * x + z * z);
    if (dist < 18) return 0;
    const wave1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 2.2;
    const wave2 = Math.sin(x * 0.03 + 1.2) * Math.cos(z * 0.03 - 0.7) * 4.5;
    const craterDist = Math.sqrt((x - 40) ** 2 + (z + 30) ** 2);
    let craterLip = 0;
    if (craterDist < 25) {
      craterLip = Math.sin((craterDist / 25) * Math.PI) * -3.5;
    }
    const ridgeDist = Math.sqrt((x + 45) ** 2 + (z - 35) ** 2);
    let ridge = 0;
    if (ridgeDist < 30) {
      ridge = Math.cos((ridgeDist / 30) * Math.PI * 0.5) * 4.2;
    }
    return (wave1 + wave2 + craterLip + ridge) * Math.min(1, (dist - 18) / 25);
  }

  public getTerrainNormal(x: number, z: number): { normal: THREE.Vector3; slopeAngleRad: number } {
    const eps = 0.5;
    const hL = this.getTerrainHeight(x - eps, z);
    const hR = this.getTerrainHeight(x + eps, z);
    const hD = this.getTerrainHeight(x, z - eps);
    const hU = this.getTerrainHeight(x, z + eps);

    const dYdX = (hR - hL) / (2 * eps);
    const dYdZ = (hU - hD) / (2 * eps);

    const normal = new THREE.Vector3(-dYdX, 1, -dYdZ).normalize();
    const slopeAngleRad = Math.acos(Math.max(0, Math.min(1, normal.y)));

    return { normal, slopeAngleRad };
  }

  private buildTerrain() {
    const size = 190;
    const segments = this.quality === 'low' ? 36 : 54;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = this.getTerrainHeight(x, z);
      pos.setY(i, y);
    }
    geo.computeVertexNormals();

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    if (this.destination === 'mars') {
      ctx.fillStyle = '#9c3d18';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 500; i++) {
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
      for (let i = 0; i < 550; i++) {
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

    const mat = new THREE.MeshLambertMaterial({ map: texture });
    this.terrainMesh = new THREE.Mesh(geo, mat);
    this.terrainMesh.receiveShadow = this.quality !== 'low';
    this.scene.add(this.terrainMesh);
  }

  private buildOutpostModules() {
    const whiteModuleMat = new THREE.MeshLambertMaterial({ color: 0xe8ecf2 });
    const darkMetalMat = new THREE.MeshLambertMaterial({ color: 0x333842 });
    const solarBlueMat = new THREE.MeshLambertMaterial({ color: 0x1a468c });
    const goldFoilMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });

    // 1. Central Habitat
    this.habitatGroup = new THREE.Group();
    const habChoice = this.outpostConfig.habitat || 'hab_transhab';

    if (habChoice === 'hab_subsurface_cavern') {
      const bunker = new THREE.Mesh(new THREE.CylinderGeometry(8, 9, 4, 12), darkMetalMat);
      bunker.position.y = 2;
      this.habitatGroup.add(bunker);

      const airlockDoor = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 2), whiteModuleMat);
      airlockDoor.position.set(0, 1.5, 8.5);
      this.habitatGroup.add(airlockDoor);
    } else {
      const domeGeo = new THREE.SphereGeometry(7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = habChoice === 'hab_transhab'
        ? new THREE.MeshLambertMaterial({ color: 0xf4eedb })
        : whiteModuleMat;
      const dome = new THREE.Mesh(domeGeo, domeMat);
      this.habitatGroup.add(dome);

      const ring = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 1, 16), darkMetalMat);
      ring.position.y = 0.5;
      this.habitatGroup.add(ring);

      const airlock = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 4, 8), whiteModuleMat);
      airlock.rotation.x = Math.PI / 2;
      airlock.position.set(0, 1.6, 7.5);
      this.habitatGroup.add(airlock);
    }

    // Flashing Emergency Beacon on roof
    const habBeacon = new THREE.PointLight(0xff3300, 0, 16);
    habBeacon.position.set(0, 7.5, 0);
    this.habitatGroup.add(habBeacon);
    this.emergencyBeacons.push(habBeacon);

    // Warm entrance light
    const entranceLight = new THREE.PointLight(0x66ccff, 1.0, 10);
    entranceLight.position.set(0, 3.2, 8.5);
    this.habitatGroup.add(entranceLight);
    this.exteriorStationLights.push(entranceLight);

    this.scene.add(this.habitatGroup);

    this.targets.push({
      id: 'target_airlock',
      type: 'airlock',
      name: 'Central Habitat Airlock',
      position: new THREE.Vector3(0, 1, 7.5),
      radius: 4.8,
      actionPrompt: '[E] EVA Hull Inspection & Emergency Shelter',
      detail: 'Pressurize airlock, conduct structural maintenance, or shelter from solar radiation.',
    });

    // 2. Power Grid (Solar Array / Kilopower Nuclear)
    this.solarGroup = new THREE.Group();
    this.solarGroup.position.set(-16, 0, -4);
    const powerChoice = this.outpostConfig.power || 'pow_solar_rosa';

    if (powerChoice === 'pow_kilopower_nuclear') {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 7, 8), darkMetalMat);
      tower.position.y = 3.5;
      this.solarGroup.add(tower);

      const radCore = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
      radCore.position.y = 2;
      this.solarGroup.add(radCore);

      for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4, 3.5), whiteModuleMat);
        fin.position.set(0, 4, 0);
        fin.rotation.y = (i * Math.PI) / 4;
        this.solarGroup.add(fin);
      }
    } else {
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
      radius: 4.8,
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

    const plantBed = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.4, 10), new THREE.MeshBasicMaterial({ color: 0x109930 }));
    plantBed.position.y = 0.2;
    this.greenhouseGroup.add(plantBed);

    const bioLight = new THREE.PointLight(0x44ff88, 1.2, 10);
    bioLight.position.set(0, 2.5, 0);
    this.greenhouseGroup.add(bioLight);
    this.exteriorStationLights.push(bioLight);

    this.scene.add(this.greenhouseGroup);

    this.targets.push({
      id: 'target_greenhouse',
      type: 'greenhouse',
      name: 'Aeroponic Agricultural Biosphere',
      position: new THREE.Vector3(16, 1, -3),
      radius: 4.8,
      actionPrompt: '[E] Tend Hydroponics & Harvest Crops',
      detail: 'Stimulate nutrient delivery to boost crew food calories.',
    });

    // 4. ECLSS & Water Recycling Facility
    this.eclssGroup = new THREE.Group();
    this.eclssGroup.position.set(0, 0, -15);
    for (let i = -1; i <= 1; i++) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.8, 10), whiteModuleMat);
      tank.position.set(i * 2.8, 1.9, 0);
      this.eclssGroup.add(tank);

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
      radius: 4.8,
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
    const landerBase = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 2.5, 8), goldFoilMat);
    landerBase.position.y = 2.2;
    this.landerGroup.add(landerBase);

    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4.5, 4), darkMetalMat);
      leg.position.set(Math.cos((i * Math.PI) / 2) * 3.8, 1.2, Math.sin((i * Math.PI) / 2) * 3.8);
      leg.rotation.z = Math.cos((i * Math.PI) / 2) * 0.4;
      leg.rotation.x = Math.sin((i * Math.PI) / 2) * 0.4;
      this.landerGroup.add(leg);
    }

    const ascentPod = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 3, 8), whiteModuleMat);
    ascentPod.position.y = 4.8;
    this.landerGroup.add(ascentPod);

    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 6), darkMetalMat);
    flagPole.position.set(4, 1.5, 2);
    this.landerGroup.add(flagPole);

    const flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), new THREE.MeshBasicMaterial({ color: 0x0055aa, side: THREE.DoubleSide }));
    flagMesh.position.set(4.6, 2.5, 2);
    this.landerGroup.add(flagMesh);

    this.scene.add(this.landerGroup);

    // 7. Deployable ALSEP Science Station Package at Equipment Rack
    const alsepRack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.0), new THREE.MeshLambertMaterial({ color: 0x55aa66 }));
    alsepRack.position.set(6, 0.4, 8);
    this.scene.add(alsepRack);

    this.targets.push({
      id: 'target_alsep_pickup',
      type: 'alsep_deploy',
      name: 'ALSEP / LEMS Scientific Package',
      position: new THREE.Vector3(6, 0.5, 8),
      radius: 3.5,
      actionPrompt: '[E] Pick Up Science Station Package',
      detail: 'Deployable lunar/martian surface observatory. Carry to a high ridge to deploy!',
    });
  }

  private buildAstronaut() {
    this.astronautGroup = new THREE.Group();
    const suitMat = new THREE.MeshLambertMaterial({ color: 0xf5f7fa });
    const jointMat = new THREE.MeshLambertMaterial({ color: 0x3a404d });
    const goldVisorMat = new THREE.MeshBasicMaterial({ color: 0xffb700 });

    // Torso
    this.astronautTorso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.45), suitMat);
    this.astronautTorso.position.y = 1.2;
    this.astronautGroup.add(this.astronautTorso);

    // Chest unit
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

    // PLSS Backpack (Portable Life Support System + Cold Gas Thrusters)
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.3), suitMat);
    backpack.position.set(0, 1.3, -0.35);
    this.astronautGroup.add(backpack);

    // Dual RCS Nozzles
    for (const side of [-0.22, 0.22]) {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.12, 6), jointMat);
      nozzle.position.set(side, 1.6, -0.48);
      nozzle.rotation.x = -Math.PI / 4;
      this.astronautGroup.add(nozzle);
    }

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

  private buildRover() {
    this.roverGroup = new THREE.Group();
    this.roverChassis = new THREE.Group();
    this.roverGroup.add(this.roverChassis);

    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xdedede });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x22262d });
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111317 });

    // Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 4.0), bodyMat);
    chassis.position.y = 1.0;
    this.roverChassis.add(chassis);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 2.2), darkMat);
    cabin.position.set(0, 1.8, 0.2);
    this.roverChassis.add(cabin);

    // Solar rooftop
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 2.4), new THREE.MeshBasicMaterial({ color: 0x1a468c }));
    roof.position.set(0, 2.45, 0.2);
    this.roverChassis.add(roof);

    // Rear Turbo Capacitor Thrusters
    for (const x of [-0.6, 0.6]) {
      const booster = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 0.6, 8), darkMat);
      booster.rotation.x = Math.PI / 2;
      booster.position.set(x, 1.0, -2.1);
      this.roverChassis.add(booster);
    }

    // 6 Wheels with independent steering mounts
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    const zOffsets = [-1.4, 0, 1.4];

    for (const z of zOffsets) {
      for (const side of [-1.35, 1.35]) {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(side, 0.55, z);
        this.roverChassis.add(wheel);
        this.roverWheels.push(wheel);
        if (z === 1.4) {
          this.roverFrontWheels.push(wheel);
        }
      }
    }

    // Dual Headlights
    this.roverLightLeft = new THREE.SpotLight(0xfffaed, 2.2, 45, Math.PI / 5, 0.3);
    this.roverLightLeft.position.set(-0.8, 1.2, 2.1);
    this.roverLightLeft.target.position.set(-0.8, 0.6, 18);
    this.roverChassis.add(this.roverLightLeft);
    this.roverChassis.add(this.roverLightLeft.target);

    this.roverLightRight = new THREE.SpotLight(0xfffaed, 2.2, 45, Math.PI / 5, 0.3);
    this.roverLightRight.position.set(0.8, 1.2, 2.1);
    this.roverLightRight.target.position.set(0.8, 0.6, 18);
    this.roverChassis.add(this.roverLightRight);
    this.roverChassis.add(this.roverLightRight.target);

    this.roverGroup.position.set(-10, 0, 12);
    this.scene.add(this.roverGroup);

    this.targets.push({
      id: 'target_rover',
      type: 'rover',
      name: 'Manned Planetary Rover',
      position: new THREE.Vector3(-10, 1, 12),
      radius: 4.8,
      actionPrompt: '[E] Mount / Drive Rover',
      detail: 'Traverse the crater surface at high speed in pressurized cabin. Press Shift for Turbo Boost!',
    });
  }

  private buildCollectiblesAndGeology() {
    // 1. Cryogenic Water Ice Pockets
    const iceGeo = new THREE.DodecahedronGeometry(1.4, 0);
    const iceMat = new THREE.MeshBasicMaterial({ color: 0x88e5ff });

    const iceCoords = [
      { x: 34, z: 28, name: 'Glacial Ice Pocket Alpha' },
      { x: -38, z: -25, name: 'Subsurface Permafrost Ridge' },
      { x: 42, z: -35, name: 'Hydrated Regolith Deposit' },
      { x: -24, z: -42, name: 'Volatile Core Bed Beta' },
    ];

    iceCoords.forEach((coord, i) => {
      const y = this.getTerrainHeight(coord.x, coord.z);
      const iceMesh = new THREE.Mesh(iceGeo, iceMat);
      iceMesh.position.set(coord.x, y + 0.8, coord.z);
      this.scene.add(iceMesh);

      const glow = new THREE.PointLight(0x00c8ff, 0.9, 10);
      glow.position.set(coord.x, y + 1.6, coord.z);
      this.scene.add(glow);

      this.targets.push({
        id: `target_ice_${i}`,
        type: 'ice_deposit',
        name: coord.name,
        position: new THREE.Vector3(coord.x, y + 1, coord.z),
        radius: 4.8,
        actionPrompt: '[E] Precision Cryo-Drill Ice Pocket',
        detail: 'Engage resonant rotary drill to extract water ice without sublimating volatiles.',
      });
    });

    // 2. Physical Geological Rock Specimens
    const rockDefinitions: Array<{
      name: string;
      type: GeologicalSample['mineralType'];
      colorHex: number;
      x: number;
      z: number;
      rarity: GeologicalSample['rarity'];
      scienceVal: number;
      desc: string;
      nasaFact: string;
    }> = [
      {
        name: this.destination === 'mars' ? 'Hematite Spherule Concretion' : 'Highland Anorthosite Plagioclase',
        type: this.destination === 'mars' ? 'hematite' : 'anorthosite',
        colorHex: this.destination === 'mars' ? 0xcc3322 : 0xd8dce2,
        x: 18,
        z: 24,
        rarity: 'common',
        scienceVal: 150,
        desc: this.destination === 'mars' ? 'Gray crystalline hematite blueberry indicating ancient groundwater.' : 'Pristine highland crust formed 4.4 billion years ago.',
        nasaFact: 'Discovered during historic Apollo / Opportunity rover expeditions.',
      },
      {
        name: this.destination === 'mars' ? 'Magnesian Olivine Basalt' : 'Titanium Ilmenite Ore',
        type: this.destination === 'mars' ? 'olivine' : 'ilmenite',
        colorHex: this.destination === 'mars' ? 0x44aa44 : 0x222233,
        x: -28,
        z: 14,
        rarity: 'rare',
        scienceVal: 220,
        desc: 'Dense mineral rich in iron and titanium oxides, perfect for ISRU oxygen production.',
        nasaFact: 'Can be reduced with hydrogen at 900°C to release pure water and breathable oxygen.',
      },
      {
        name: this.destination === 'mars' ? 'Hydrated Sulfate Crust' : 'Pyroclastic Volcanic Glass Bead',
        type: this.destination === 'mars' ? 'perchlorate' : 'pyroclastic_glass',
        colorHex: this.destination === 'mars' ? 0xeecc55 : 0xff7722,
        x: -42,
        z: 32,
        rarity: 'exotic',
        scienceVal: 350,
        desc: 'Pristine glassy sphere preserved in vacuum containing trapped deep-mantle volatiles.',
        nasaFact: 'Apollo 17 astronaut Jack Schmitt discovered famous "orange soil" volcanic glass at Taurus-Littrow.',
      },
      {
        name: 'Cryogenic Permafrost Core Chunk',
        type: 'water_ice',
        colorHex: 0x99ffff,
        x: 48,
        z: -18,
        rarity: 'rare',
        scienceVal: 280,
        desc: 'Subsurface permafrost aggregate preserved at cryogenic 40 Kelvin temperature.',
        nasaFact: 'Cometary volatiles preserved inside permanently shadowed craters for billions of years.',
      },
    ];

    rockDefinitions.forEach((def, idx) => {
      const y = this.getTerrainHeight(def.x, def.z);
      const geo = new THREE.DodecahedronGeometry(0.45, 0);
      const mat = new THREE.MeshLambertMaterial({ color: def.colorHex });
      const rockMesh = new THREE.Mesh(geo, mat);
      rockMesh.position.set(def.x, y + 0.35, def.z);
      rockMesh.castShadow = this.quality !== 'low';
      this.scene.add(rockMesh);

      const sample: GeologicalSample = {
        id: `rock_${idx}`,
        name: def.name,
        mineralType: def.type,
        colorHex: def.colorHex,
        description: def.desc,
        nasaFact: def.nasaFact,
        scienceValue: def.scienceVal,
        rarity: def.rarity,
        position: [def.x, y, def.z],
        collected: false,
      };

      this.physRocks.push({
        id: sample.id,
        mesh: rockMesh,
        velocity: new THREE.Vector3(),
        isAirborne: false,
        sampleData: sample,
      });

      this.targets.push({
        id: sample.id,
        type: 'rock_sample',
        name: def.name,
        position: new THREE.Vector3(def.x, y + 0.5, def.z),
        radius: 3.5,
        actionPrompt: '[E] Sample Specimen with Laser PIXL',
        detail: `Analyze elemental chemistry and bag specimen (+${def.scienceVal} Science XP).`,
        metadata: sample,
      });
    });

    // 3. Emergency Resupply Drop Capsule
    const dropX = -35;
    const dropZ = -38;
    const dropY = this.getTerrainHeight(dropX, dropZ);
    const dropPod = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.0, 1.8, 8), new THREE.MeshLambertMaterial({ color: 0xdd6611 }));
    dropPod.position.set(dropX, dropY + 0.9, dropZ);
    this.scene.add(dropPod);

    // Heat shield base
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.4, 8), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    shield.position.set(dropX, dropY + 0.2, dropZ);
    this.scene.add(shield);

    // Flashing emergency strobe
    const strobe = new THREE.PointLight(0xffaa00, 1.5, 15);
    strobe.position.set(dropX, dropY + 2.2, dropZ);
    this.scene.add(strobe);
    this.exteriorStationLights.push(strobe);

    this.targets.push({
      id: 'target_supply_drop',
      type: 'supply_drop',
      name: 'Orbital Resupply Drop Capsule',
      position: new THREE.Vector3(dropX, dropY + 1, dropZ),
      radius: 4.8,
      actionPrompt: '[E] Salvage Emergency Resupply Cargo',
      detail: 'Recover auxiliary fuel cells (+30 kWh), water filters (+15L), and hull repair sealant.',
    });
  }

  private setupParticles() {
    // 1. Dust Storm Particles
    const dustCount = this.quality === 'low' ? 250 : 700;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 140;
      dustPos[i * 3 + 1] = Math.random() * 25;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: this.destination === 'mars' ? 0xd8723b : 0x8a92a0,
      size: this.destination === 'mars' ? 1.8 : 1.2,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    this.dustStormParticles = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dustStormParticles);

    // 2. Cold Gas Jetpack Exhaust Particles
    const jetCount = 60;
    const jetGeo = new THREE.BufferGeometry();
    const jetPos = new Float32Array(jetCount * 3);
    for (let i = 0; i < jetCount; i++) {
      jetPos[i * 3] = 0;
      jetPos[i * 3 + 1] = 0;
      jetPos[i * 3 + 2] = 0;
    }
    jetGeo.setAttribute('position', new THREE.BufferAttribute(jetPos, 3));
    const jetMat = new THREE.PointsMaterial({
      color: 0x99ddff,
      size: 0.6,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    this.jetpackParticles = new THREE.Points(jetGeo, jetMat);
    this.jetpackParticles.visible = false;
    this.scene.add(this.jetpackParticles);

    // 3. Rover Wheel Dust Trails & Turbo Exhaust
    const rDustCount = 80;
    const rDustGeo = new THREE.BufferGeometry();
    const rDustPos = new Float32Array(rDustCount * 3);
    for (let i = 0; i < rDustCount; i++) {
      rDustPos[i * 3] = 0;
      rDustPos[i * 3 + 1] = 0;
      rDustPos[i * 3 + 2] = 0;
    }
    rDustGeo.setAttribute('position', new THREE.BufferAttribute(rDustPos, 3));
    const rDustMat = new THREE.PointsMaterial({
      color: this.destination === 'mars' ? 0xc86430 : 0x777e8a,
      size: 0.8,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    this.roverDustParticles = new THREE.Points(rDustGeo, rDustMat);
    this.scene.add(this.roverDustParticles);
  }

  private setupEnvironmentalHazards() {
    // 1. Swirling Dust Devil / Electrostatic Vortex
    this.dustDevilGroup = new THREE.Group();
    const vortexCount = 120;
    const vortexGeo = new THREE.BufferGeometry();
    const vortexPos = new Float32Array(vortexCount * 3);
    for (let i = 0; i < vortexCount; i++) {
      const h = Math.random() * 12;
      const r = (h / 12) * 3.5 + 0.4;
      const angle = Math.random() * Math.PI * 2;
      vortexPos[i * 3] = Math.cos(angle) * r;
      vortexPos[i * 3 + 1] = h;
      vortexPos[i * 3 + 2] = Math.sin(angle) * r;
    }
    vortexGeo.setAttribute('position', new THREE.BufferAttribute(vortexPos, 3));
    const vortexMat = new THREE.PointsMaterial({
      color: this.destination === 'mars' ? 0xe6753c : 0xa0a8b5,
      size: 1.4,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });
    const vortexPoints = new THREE.Points(vortexGeo, vortexMat);
    this.dustDevilGroup.add(vortexPoints);
    this.dustDevilGroup.position.set(50, 0, 50);
    this.scene.add(this.dustDevilGroup);

    // 2. Hypersonic Micrometeorite Streak
    const meteorGeo = new THREE.CylinderGeometry(0.08, 0.4, 18, 6);
    meteorGeo.rotateX(Math.PI / 2);
    const meteorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.meteorMesh = new THREE.Mesh(meteorGeo, meteorMat);
    this.meteorMesh.visible = false;
    this.scene.add(this.meteorMesh);
  }

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
        if (this.drillState.active) {
          this.pulseDrillPressure();
        }
        e.preventDefault();
      }
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = true;

      // Action: [E]
      if (code === 'KeyE') {
        this.triggerCurrentAction();
      }

      // Flashlight: [F]
      if (code === 'KeyF') {
        this.toggleFlashlight();
      }

      // Camera: [C]
      if (code === 'KeyC') {
        this.cycleCamera();
      }

      // Multispectral AR Scanner: [Q] or [Tab]
      if (code === 'KeyQ' || code === 'Tab') {
        e.preventDefault();
        this.toggleScanner();
      }

      // Throw Sample: [G]
      if (code === 'KeyG') {
        this.throwRockSample();
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

    const dom = this.renderer.domElement;
    dom.style.touchAction = 'none';

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

    let initialTouchDist = 0;
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2 && this.cameraMode === 'tactical') {
        this.isDragging = false;
        initialTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const touch = e.touches[0];
        const dx = touch.clientX - this.lastMouseX;
        const dy = touch.clientY - this.lastMouseY;
        this.lastMouseX = touch.clientX;
        this.lastMouseY = touch.clientY;

        if (this.cameraMode === 'tactical') {
          this.tacticalYaw -= dx * 0.008;
          this.tacticalPitch = Math.max(0.2, Math.min(1.4, this.tacticalPitch + dy * 0.008));
        } else {
          this.playerRotationY -= dx * 0.006;
        }
      } else if (e.touches.length === 2 && this.cameraMode === 'tactical' && initialTouchDist > 0) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = initialTouchDist - currentDist;
        this.tacticalDistance = Math.max(15, Math.min(130, this.tacticalDistance + diff * 0.1));
        initialTouchDist = currentDist;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
      initialTouchDist = 0;
    });

    window.addEventListener('touchcancel', () => {
      this.isDragging = false;
      initialTouchDist = 0;
    });

    dom.addEventListener('wheel', (e) => {
      if (this.cameraMode === 'tactical') {
        this.tacticalDistance = Math.max(15, Math.min(130, this.tacticalDistance + e.deltaY * 0.05));
      }
    });
  }

  public setVirtualInput(action: 'forward' | 'backward' | 'left' | 'right' | 'jump' | 'sprint', value: boolean) {
    this.keys[action] = value;
  }

  public toggleFlashlight() {
    this.flashlightOn = !this.flashlightOn;
    this.astronautLight.intensity = this.flashlightOn ? 1.6 : 0;
    this.roverLightLeft.intensity = this.flashlightOn ? 2.2 : 0;
    this.roverLightRight.intensity = this.flashlightOn ? 2.2 : 0;
    soundEngine.playBeep(980, 0.05, 'triangle');
  }

  public cycleCamera() {
    if (this.cameraMode === 'astronaut') this.cameraMode = 'rover';
    else if (this.cameraMode === 'rover') this.cameraMode = 'tactical';
    else this.cameraMode = 'astronaut';
    soundEngine.playBeep(1200, 0.06, 'sine');
  }

  public toggleScanner(): boolean {
    this.scannerActive = !this.scannerActive;
    soundEngine.playMineralScan();
    return this.scannerActive;
  }

  public getScannerActive(): boolean {
    return this.scannerActive;
  }

  public getSuitVitals(): SuitVitals {
    return this.suitVitals;
  }

  public getCarriedSample(): GeologicalSample | null {
    return this.carriedRock;
  }

  public getCarriedAlsep(): boolean {
    return this.carriedAlsep;
  }

  public getDrillState(): DrillMinigameState {
    return this.drillState;
  }

  public pulseDrillPressure() {
    if (!this.drillState.active) return;
    this.drillState.pressure = Math.min(100, this.drillState.pressure + 18);
    const inSweet = this.drillState.pressure >= this.drillState.sweetSpotMin && this.drillState.pressure <= this.drillState.sweetSpotMax;
    soundEngine.playDrillResonance(inSweet);
  }

  public cancelDrill() {
    this.drillState.active = false;
  }

  public throwRockSample(): boolean {
    if (!this.carriedRock) return false;
    const sample = this.carriedRock;
    this.carriedRock = null;

    const angle = this.playerRotationY;
    const throwDir = new THREE.Vector3(Math.sin(angle), 0.5, Math.cos(angle)).normalize();

    const geo = new THREE.DodecahedronGeometry(0.45, 0);
    const mat = new THREE.MeshLambertMaterial({ color: sample.colorHex });
    const rockMesh = new THREE.Mesh(geo, mat);
    rockMesh.position.set(this.playerPos.x + throwDir.x * 1.2, this.playerPos.y + 1.6, this.playerPos.z + throwDir.z * 1.2);
    this.scene.add(rockMesh);

    const initialSpeed = 12;
    this.physRocks.push({
      id: `thrown_${Date.now()}`,
      mesh: rockMesh,
      velocity: throwDir.multiplyScalar(initialSpeed),
      isAirborne: true,
      sampleData: sample,
    });

    soundEngine.playRockThrow();
    return true;
  }

  public triggerCurrentAction(): InteractiveTarget | null {
    if (!this.currentNearTarget) {
      // Check if carrying ALSEP and can deploy anywhere on high ridge
      if (this.carriedAlsep) {
        const p = this.getPlayerPosition();
        const distFromCenter = Math.sqrt(p.x * p.x + p.z * p.z);
        if (distFromCenter > 22) {
          this.deployAlsepStation(p.x, p.z);
          return null;
        }
      }
      return null;
    }

    const target = this.currentNearTarget;

    // 1. Mount / Dismount Rover
    if (target.type === 'rover') {
      this.inRover = !this.inRover;
      if (this.inRover) {
        this.cameraMode = 'rover';
        this.astronautGroup.visible = false;
        soundEngine.playInteract();
      } else {
        this.cameraMode = 'astronaut';
        this.astronautGroup.visible = true;
        this.playerPos.set(this.roverGroup.position.x + 2.8, 0, this.roverGroup.position.z);
        soundEngine.playInteract();
      }
      return target;
    }

    // 2. Pick up or Deploy ALSEP Science Package
    if (target.type === 'alsep_deploy') {
      if (!this.carriedAlsep) {
        this.carriedAlsep = true;
        soundEngine.playInteract();
        // Remove rack target
        this.targets = this.targets.filter(t => t.id !== target.id);
        this.currentNearTarget = null;
        return target;
      }
    }

    // 3. Drill Ice Pocket -> Start Resonant Minigame
    if (target.type === 'ice_deposit') {
      if (!this.drillState.active) {
        this.drillState = {
          active: true,
          targetId: target.id,
          targetName: target.name,
          pressure: 20,
          sweetSpotMin: 45,
          sweetSpotMax: 75,
          progress: 0,
          heat: 0,
          extractedLitres: 0,
        };
        soundEngine.playDrill();
      }
      return target;
    }

    // 4. Geological Rock Sample Pick Up
    if (target.type === 'rock_sample') {
      const sample = target.metadata as GeologicalSample;
      if (sample) {
        this.carriedRock = sample;
        // Remove rock mesh from world
        const pRock = this.physRocks.find(r => r.id === target.id);
        if (pRock) {
          this.scene.remove(pRock.mesh);
          this.physRocks = this.physRocks.filter(r => r.id !== target.id);
        }
        this.targets = this.targets.filter(t => t.id !== target.id);
        this.currentNearTarget = null;

        soundEngine.playSampleCollect();
        if (this.onSampleCollected) {
          this.onSampleCollected(sample);
        }
      }
      return target;
    }

    // 5. Emergency Resupply Drop Salvage
    if (target.type === 'supply_drop') {
      soundEngine.playAchievementFanfare();
      this.targets = this.targets.filter(t => t.id !== target.id);
      this.currentNearTarget = null;
      if (this.onSupplySalvaged) {
        this.onSupplySalvaged({ energy: 30, water: 15, integrity: 12 });
      }
      return target;
    }

    // 6. Base Modules (solar, airlock, scrubber, greenhouse)
    if (target.type === 'airlock' || target.type === 'scrubber') {
      soundEngine.playWelding();
    } else {
      soundEngine.playInteract();
    }

    return target;
  }

  private deployAlsepStation(x: number, z: number) {
    const y = this.getTerrainHeight(x, z);
    const stationGroup = new THREE.Group();
    stationGroup.position.set(x, y, z);

    // Central central electronics box
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), new THREE.MeshLambertMaterial({ color: 0xeeeeee }));
    box.position.y = 0.4;
    stationGroup.add(box);

    // Mini RTG / Solar Wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 0.8), new THREE.MeshBasicMaterial({ color: 0x1a468c }));
    wing.position.set(0, 0.8, 0);
    stationGroup.add(wing);

    // Omnidirectional Antenna
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), new THREE.MeshBasicMaterial({ color: 0xdddddd }));
    ant.position.set(0, 1.8, 0);
    stationGroup.add(ant);

    // Pulsing green beacon
    const beacon = new THREE.PointLight(0x00ff88, 1.2, 12);
    beacon.position.set(0, 2.2, 0);
    stationGroup.add(beacon);
    this.exteriorStationLights.push(beacon);

    this.scene.add(stationGroup);

    const station: DeployedScienceStation = {
      id: `alsep_${Date.now()}`,
      name: 'ALSEP Passive Seismometer & Weather Array',
      type: 'alsep_seismometer',
      position: [x, y, z],
      deployedSol: 1,
      status: 'transmitting',
      scienceYieldPerSol: 120,
      nasaInstrument: 'Passive Seismic Experiment & Artemis LEMS Array',
    };

    this.deployedStations.push(station);
    this.carriedAlsep = false;
    soundEngine.playAchievementFanfare();

    if (this.onStationDeployed) {
      this.onStationDeployed(station);
    }
  }

  private animate() {
    if (this.isDisposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Astronomical Sol Cycle & Dynamic Sky/Lighting
    this.updateCelestial(delta);

    // 2. Player & Rover Kinematics
    this.updateMovement(delta);

    // 3. Physical Objects (Thrown Rocks, Debris)
    this.updatePhysicsObjects(delta);

    // 4. Drill Minigame Loop
    this.updateDrillMinigame(delta);

    // 5. Environmental Hazards (Dust Devil, Meteorites)
    this.updateEnvironmentalHazards(delta);

    // 6. Rotate Comms Dish & Pulsing Lights
    if (this.commsDish) {
      this.commsDish.rotation.y += delta * 0.2;
    }
    if (this.emergencyBeacons[0] && this.emergencyBeacons[0].intensity > 0) {
      const pulse = (Math.sin(this.clock.getElapsedTime() * 6) + 1) * 1.5;
      this.emergencyBeacons.forEach(b => b.intensity = pulse);
    }

    // 7. Check Proximity to Interactive Objects
    this.checkProximity();

    // 8. Update Camera Follow
    this.updateCamera();

    // 9. Render Frame
    this.renderer.render(this.scene, this.camera);
  }

  private updateCelestial(delta: number) {
    this.solTime = (this.solTime + (delta / this.dayLengthSec)) % 1.0;

    // Sun orbits in an arc
    const sunAngle = this.solTime * Math.PI * 2;
    const sunDist = 180;
    const sunX = Math.cos(sunAngle) * sunDist;
    const sunY = Math.sin(sunAngle) * sunDist;
    const sunZ = Math.sin(sunAngle * 0.5) * 60;

    this.sunLight.position.set(sunX, Math.max(-10, sunY), sunZ);
    this.sunMesh.position.set(sunX * 0.95, sunY * 0.95, sunZ * 0.95);

    const isSunUp = sunY > 0;
    const sunElevRatio = Math.max(0, sunY / sunDist);

    if (this.destination === 'mars') {
      // Mars Sky: Midday amber -> Blue Sunset -> Night
      if (sunElevRatio > 0.25) {
        // Daytime
        this.scene.background = new THREE.Color(0xb25329);
        if (this.scene.fog) (this.scene.fog as THREE.FogExp2).color.setHex(0xb25329);
        this.ambientLight.color.setHex(0xd47a4d);
        this.ambientLight.intensity = 0.5 + sunElevRatio * 0.4;
        this.sunLight.intensity = 1.2 * sunElevRatio;
        this.sunMesh.visible = true;
      } else if (sunElevRatio > 0.02) {
        // Authentic Martian Blue Twilight (Mie forward scattering!)
        const blueSunset = new THREE.Color(0x286299);
        this.scene.background = blueSunset;
        if (this.scene.fog) (this.scene.fog as THREE.FogExp2).color.setHex(0x286299);
        this.ambientLight.color.setHex(0x3a5f8a);
        this.ambientLight.intensity = 0.35;
        this.sunLight.intensity = 0.4;
        this.sunMesh.visible = true;
      } else {
        // Night
        const nightColor = new THREE.Color(0x060810);
        this.scene.background = nightColor;
        if (this.scene.fog) (this.scene.fog as THREE.FogExp2).color.setHex(0x060810);
        this.ambientLight.color.setHex(0x161a28);
        this.ambientLight.intensity = 0.15;
        this.sunLight.intensity = 0;
        this.sunMesh.visible = false;
      }
    } else {
      // Moon: Pitch black void, sunlight on or off
      this.ambientLight.intensity = isSunUp ? 0.35 : 0.08;
      this.sunLight.intensity = isSunUp ? 2.0 : 0;
      this.sunMesh.visible = isSunUp;
    }

    // Auto-turn on station exterior lights during darkness
    const isDark = !isSunUp || sunElevRatio < 0.15;
    this.exteriorStationLights.forEach(light => {
      light.intensity = isDark ? 1.5 : 0.4;
    });
  }

  private updateMovement(delta: number) {
    const isMars = this.destination === 'mars';
    const gravity = isMars ? 3.71 : 1.62; // Realistic extraterrestrial gravity

    // Proximity to habitat base for consumables recharge
    const baseP = new THREE.Vector3(0, 0, 0);
    const distToBase = this.playerPos.distanceTo(baseP);
    const inHabAirlock = distToBase < 12;

    if (inHabAirlock || this.inRover) {
      // Recharge suit consumables
      this.suitVitals.oxygenPct = Math.min(100, this.suitVitals.oxygenPct + delta * 20);
      this.suitVitals.batteryPct = Math.min(100, this.suitVitals.batteryPct + delta * 25);
      this.suitVitals.rcsFuelPct = Math.min(100, this.suitVitals.rcsFuelPct + delta * 30);
      this.suitVitals.isWarning = false;
    } else {
      // Deplete suit consumables during EVA exploration
      const sprintFactor = this.keys.sprint ? 2.2 : 1.0;
      this.suitVitals.oxygenPct = Math.max(0, this.suitVitals.oxygenPct - (delta * 0.35 * sprintFactor));
      this.suitVitals.batteryPct = Math.max(0, this.suitVitals.batteryPct - (delta * 0.25));

      if (this.suitVitals.oxygenPct < 25 && !this.suitVitals.isWarning) {
        this.suitVitals.isWarning = true;
        soundEngine.playSuitAlarm();
      }
    }

    if (this.onSuitVitalsChange) {
      this.onSuitVitalsChange(this.suitVitals);
    }

    if (this.inRover) {
      // ADVANCED 6-WHEEL ROVER KINEMATICS
      this.isBoosting = this.keys.sprint && this.suitVitals.batteryPct > 5;
      const maxSpeed = this.isBoosting ? 22 : 12;
      const accel = this.isBoosting ? 16 : 8;

      if (this.isBoosting) {
        this.suitVitals.batteryPct = Math.max(0, this.suitVitals.batteryPct - delta * 4);
        if (Math.random() < 0.1) soundEngine.playRoverBoost();
      }

      // Steering
      if (this.keys.left) this.roverSteerAngle = Math.min(0.45, this.roverSteerAngle + delta * 2.5);
      else if (this.keys.right) this.roverSteerAngle = Math.max(-0.45, this.roverSteerAngle - delta * 2.5);
      else this.roverSteerAngle *= 0.85;

      // Throttle
      if (this.keys.forward) {
        this.roverVelocity = Math.min(maxSpeed, this.roverVelocity + accel * delta);
      } else if (this.keys.backward) {
        this.roverVelocity = Math.max(-6, this.roverVelocity - accel * delta);
      } else {
        this.roverVelocity *= 0.94; // Regolith rolling friction coasting
      }

      // Turn based on velocity and steer angle
      this.roverRotationY += this.roverSteerAngle * (this.roverVelocity / maxSpeed) * delta * 2.2;
      this.roverGroup.rotation.y = this.roverRotationY;

      // Front wheels turn angle
      this.roverFrontWheels.forEach(w => w.rotation.y = this.roverSteerAngle);

      // Forward displacement
      const forwardDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.roverRotationY);
      this.roverGroup.position.addScaledVector(forwardDir, this.roverVelocity * delta);

      // 6 Wheels spin
      const rollDist = this.roverVelocity * delta;
      this.roverWheels.forEach(w => w.rotation.x += rollDist * 1.8);

      // Chassis suspension tilt aligns to terrain normal!
      const terInfo = this.getTerrainNormal(this.roverGroup.position.x, this.roverGroup.position.z);
      this.roverGroup.position.y = this.getTerrainHeight(this.roverGroup.position.x, this.roverGroup.position.z);

      // Align chassis pitch and roll to slope normal
      const normal = terInfo.normal;
      const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      this.roverChassis.quaternion.slerp(targetQuat, delta * 5);

      // Rover wheel dust particles
      if (Math.abs(this.roverVelocity) > 4) {
        const rPos = this.roverDustParticles.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < 4; i++) {
          const idx = Math.floor(Math.random() * (rPos.count));
          rPos.setXYZ(
            idx,
            this.roverGroup.position.x + (Math.random() - 0.5) * 2.5,
            this.roverGroup.position.y + 0.3,
            this.roverGroup.position.z - forwardDir.z * 1.5 + (Math.random() - 0.5)
          );
        }
        rPos.needsUpdate = true;
      }

    } else {
      // ASTRONAUT EVA CONTROLLER WITH RCS JETPACK & LOW-GRAVITY JUMPS
      const baseSpeed = this.keys.sprint ? 7.2 : 3.8;
      let moveX = 0;
      let moveZ = 0;

      if (this.keys.forward) moveZ += 1;
      if (this.keys.backward) moveZ -= 1;
      if (this.keys.left) moveX += 1;
      if (this.keys.right) moveX -= 1;

      const isMoving = moveX !== 0 || moveZ !== 0;

      if (isMoving) {
        const angle = this.playerRotationY + Math.atan2(moveX, moveZ);
        this.playerVelocity.x = Math.sin(angle) * baseSpeed;
        this.playerVelocity.z = Math.cos(angle) * baseSpeed;

        this.walkTime += delta * (this.keys.sprint ? 12 : 7);

        if (Math.sin(this.walkTime) > 0.95 && this.isGrounded) {
          soundEngine.playFootstep();
        }

        const legSwing = Math.sin(this.walkTime) * 0.45;
        this.astronautLeftLeg.rotation.x = legSwing;
        this.astronautRightLeg.rotation.x = -legSwing;
        this.astronautLeftArm.rotation.x = -legSwing;
        this.astronautRightArm.rotation.x = legSwing;
      } else {
        // Regolith momentum dampening
        this.playerVelocity.x *= 0.82;
        this.playerVelocity.z *= 0.82;
        this.astronautLeftLeg.rotation.x *= 0.8;
        this.astronautRightLeg.rotation.x *= 0.8;
        this.astronautLeftArm.rotation.x *= 0.8;
        this.astronautRightArm.rotation.x *= 0.8;
      }

      // Parabolic Jump
      if (this.keys.jump && this.isGrounded) {
        this.playerVelocity.y = isMars ? 5.0 : 4.0;
        this.isGrounded = false;
        soundEngine.playJetpackBurst();
      }

      // Mid-Air RCS Thrusters Flight!
      if (!this.isGrounded && this.suitVitals.rcsFuelPct > 2) {
        if (this.keys.jump) {
          // Vertical boost
          this.playerVelocity.y += (isMars ? 5.5 : 4.0) * delta;
          this.suitVitals.rcsFuelPct = Math.max(0, this.suitVitals.rcsFuelPct - delta * 12);
          this.jetpackParticles.visible = true;
          if (Math.random() < 0.15) soundEngine.playJetpackBurst();
        }
        if (this.keys.sprint) {
          // Forward boost
          const fwdAngle = this.playerRotationY;
          this.playerVelocity.x += Math.sin(fwdAngle) * 8 * delta;
          this.playerVelocity.z += Math.cos(fwdAngle) * 8 * delta;
          this.suitVitals.rcsFuelPct = Math.max(0, this.suitVitals.rcsFuelPct - delta * 10);
          this.jetpackParticles.visible = true;
        }
      }

      // Gravity acceleration
      if (!this.isGrounded) {
        this.playerVelocity.y -= gravity * delta * 1.5;
      }

      // Slope Sliding Physics: if terrain slope > 25 degrees, player slides down!
      const terInfo = this.getTerrainNormal(this.playerPos.x, this.playerPos.z);
      if (this.isGrounded && terInfo.slopeAngleRad > 0.44) {
        const slideForce = (gravity * Math.sin(terInfo.slopeAngleRad)) * 2.2;
        this.playerVelocity.x += terInfo.normal.x * slideForce * delta;
        this.playerVelocity.z += terInfo.normal.z * slideForce * delta;
      }

      // Apply velocity displacement
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

      if (this.jetpackParticles.visible) {
        this.jetpackParticles.position.set(this.playerPos.x, this.playerPos.y + 1.2, this.playerPos.z);
      }
    }
  }

  private updatePhysicsObjects(delta: number) {
    const isMars = this.destination === 'mars';
    const gravity = isMars ? 3.71 : 1.62;

    for (const rock of this.physRocks) {
      if (!rock.isAirborne) continue;

      rock.velocity.y -= gravity * delta;
      rock.mesh.position.addScaledVector(rock.velocity, delta);

      const terY = this.getTerrainHeight(rock.mesh.position.x, rock.mesh.position.z);
      if (rock.mesh.position.y <= terY + 0.3) {
        rock.mesh.position.y = terY + 0.3;
        // Low-gravity bounce restitution
        if (Math.abs(rock.velocity.y) > 1.2) {
          rock.velocity.y = -rock.velocity.y * 0.45;
          rock.velocity.x *= 0.7;
          rock.velocity.z *= 0.7;
        } else {
          rock.velocity.set(0, 0, 0);
          rock.isAirborne = false;

          // Re-register target at new resting position
          this.targets.push({
            id: rock.id,
            type: 'rock_sample',
            name: rock.sampleData.name,
            position: rock.mesh.position.clone(),
            radius: 3.5,
            actionPrompt: '[E] Sample Specimen with Laser PIXL',
            detail: `Elemental analysis (+${rock.sampleData.scienceValue} Science XP).`,
            metadata: rock.sampleData,
          });
        }
      }
    }
  }

  private updateDrillMinigame(delta: number) {
    if (!this.drillState.active) return;

    // Heat dissipates slowly, pressure decays without pulsing
    this.drillState.pressure = Math.max(0, this.drillState.pressure - delta * 15);

    const inSweet = this.drillState.pressure >= this.drillState.sweetSpotMin && this.drillState.pressure <= this.drillState.sweetSpotMax;
    if (inSweet) {
      this.drillState.progress += delta * 24;
      this.drillState.heat = Math.max(0, this.drillState.heat - delta * 8);
    } else if (this.drillState.pressure > this.drillState.sweetSpotMax) {
      // Overpressure generates cryogenic sublimation heat
      this.drillState.heat = Math.min(100, this.drillState.heat + delta * 28);
    }

    if (this.drillState.progress >= 100) {
      // Drill Completed!
      const yieldLitres = this.drillState.heat > 60 ? 10 : 20;
      this.drillState.active = false;
      soundEngine.playAchievementFanfare();

      if (this.onDrillComplete) {
        this.onDrillComplete(yieldLitres);
      }
    }
  }

  private updateEnvironmentalHazards(delta: number) {
    // 1. Dust Devil / Electrostatic Vortex rotation & drift
    if (this.dustDevilGroup) {
      this.dustDevilGroup.rotation.y += delta * 4.5;
      this.dustDevilGroup.position.x += Math.sin(this.clock.getElapsedTime() * 0.2) * delta * 5;
      this.dustDevilGroup.position.z += Math.cos(this.clock.getElapsedTime() * 0.2) * delta * 5;
      const y = this.getTerrainHeight(this.dustDevilGroup.position.x, this.dustDevilGroup.position.z);
      this.dustDevilGroup.position.y = y;

      // Check proximity to player
      const p = this.getPlayerPosition();
      const dist = p.distanceTo(this.dustDevilGroup.position);
      if (dist < 8) {
        // Physical vortex push
        this.playerVelocity.x += (Math.random() - 0.5) * 6 * delta;
        this.playerVelocity.z += (Math.random() - 0.5) * 6 * delta;
      }
    }

    // 2. Occasional Meteorite Streak across sky
    if (Math.random() < 0.003 && !this.meteorMesh.visible) {
      this.meteorMesh.visible = true;
      const startX = (Math.random() - 0.5) * 120;
      const startZ = (Math.random() - 0.5) * 120;
      this.meteorMesh.position.set(startX, 65, startZ);
      soundEngine.playMeteorImpact();
      setTimeout(() => {
        if (this.meteorMesh) this.meteorMesh.visible = false;
      }, 700);
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
      const dist = 4.8;
      const height = 2.4;
      const angle = this.playerRotationY;

      const targetCamX = this.playerPos.x - Math.sin(angle) * dist;
      const targetCamZ = this.playerPos.z - Math.cos(angle) * dist;
      const targetCamY = this.playerPos.y + height;

      this.camera.position.set(targetCamX, targetCamY, targetCamZ);
      this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.4, this.playerPos.z);

    } else if (this.cameraMode === 'rover') {
      const dist = 7.8;
      const height = 3.8;
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.roverRotationY);

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

  public setAlarmState(active: boolean) {
    this.emergencyBeacons.forEach(b => {
      b.intensity = active ? 2.5 : 0;
    });
  }

  public setStormState(active: boolean) {
    this.isStormActive = active;
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

    v.project(this.camera);
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
