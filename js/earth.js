// ===== 地球 3D 模型 - 极致真实感版本 =====
// 参考: NASA视觉标准 / SpaceX轨道镜头 / Blue Marble项目

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 年代颜色配置
const ERA_COLORS = {
    hadean: { ocean: 0x1a0f0f, land: 0xff4500, atmosphere: 0xff2200, hasLava: true, cloudOpacity: 0 },
    archean: { ocean: 0x0a3a5c, land: 0x4a3728, atmosphere: 0x4a90a4, hasLava: false, cloudOpacity: 0.1 },
    proterozoic: { ocean: 0x0d4a7c, land: 0x5a4a3a, atmosphere: 0x4fc3f7, hasLava: false, cloudOpacity: 0.2 },
    paleozoic: { ocean: 0x1565c0, land: 0x6b8e4e, atmosphere: 0x87ceeb, hasLava: false, cloudOpacity: 0.3 },
    mesozoic: { ocean: 0x1976d2, land: 0x7cb342, atmosphere: 0x87ceeb, hasLava: false, cloudOpacity: 0.35 },
    cenozoic: { ocean: 0x1e88e5, land: 0x8bc34a, atmosphere: 0x87ceeb, hasLava: false, cloudOpacity: 0.4 },
    future: { ocean: 0x0d5a9c, land: 0x9e8b6a, atmosphere: 0xffaa44, hasLava: false, cloudOpacity: 0.2 }
};

const textureLoader = new THREE.TextureLoader();

const TEXTURE_URLS = {
    earthDay: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    earthNight: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_night_2048.jpg',
    earthNormal: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
    earthSpecular: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
    clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
    moon: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg',
};

export class Earth {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.earthGroup = null;
        this.earth = null;
        this.atmosphere = null;
        this.clouds = null;
        this.nightLights = null;
        this.moon = null;
        this.stars = null;
        this.milkyWay = null;
        this.aurora = null;
        
        this.currentYear = 4600;
        this.clock = new THREE.Clock();
        this.texturesLoaded = false;
        this.isRealisticMode = false;
        
        this.earthTilt = 23.5 * Math.PI / 180;
        this.sunPosition = new THREE.Vector3(100, 40, 100);
        this.time = 0;
    }
    
    async init() {
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initLights();
        this.initMilkyWay();
        this.initStars();
        await this.initEarth();
        this.initMoon();
        this.initControls();
        this.initEventListeners();
        this.updateForEra(0);
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
    }
    
    initCamera() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
        this.camera.position.set(0, 15, 35);
    }
    
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);
    }
    
    initLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.05);
        this.scene.add(ambientLight);
        
        this.sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
        this.sunLight.position.copy(this.sunPosition);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 4096;
        this.sunLight.shadow.mapSize.height = 4096;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -50;
        this.sunLight.shadow.camera.right = 50;
        this.sunLight.shadow.camera.top = 50;
        this.sunLight.shadow.camera.bottom = -50;
        this.scene.add(this.sunLight);
        
        const earthShine = new THREE.DirectionalLight(0x1a3a5c, 0.4);
        earthShine.position.set(-30, -10, -30);
        this.scene.add(earthShine);
    }
    
    // ===== 银河系背景 =====
    initMilkyWay() {
        const particleCount = 20000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const arm = Math.floor(Math.random() * 4);
            const armOffset = arm * Math.PI * 0.5;
            const radius = 300 + Math.random() * 600;
            const spiralAngle = radius * 0.015 + armOffset + (Math.random() - 0.5) * 0.8;
            
            positions[i3] = Math.cos(spiralAngle) * radius;
            positions[i3 + 1] = (Math.random() - 0.5) * radius * 0.15;
            positions[i3 + 2] = Math.sin(spiralAngle) * radius;
            
            const intensity = 0.5 + Math.random() * 0.5;
            colors[i3] = 0.8 * intensity;
            colors[i3 + 1] = 0.9 * intensity;
            colors[i3 + 2] = 1.0 * intensity;
            
            sizes[i] = 1 + Math.random() * 3;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    float pulse = 0.8 + 0.2 * sin(time * 0.3 + position.x * 0.01);
                    gl_PointSize = size * pulse * (500.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    float alpha = smoothstep(0.5, 0.0, dist);
                    gl_FragColor = vec4(vColor, alpha * 0.6);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.milkyWay = new THREE.Points(geometry, material);
        this.scene.add(this.milkyWay);
    }
    
    // ===== 增强星空 =====
    initStars() {
        const starCount = 30000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const radius = 400 + Math.random() * 1000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            const starType = Math.random();
            if (starType < 0.001) {
                colors[i3] = 0.5; colors[i3 + 1] = 0.7; colors[i3 + 2] = 1.0;
            } else if (starType < 0.01) {
                colors[i3] = 0.7; colors[i3 + 1] = 0.8; colors[i3 + 2] = 1.0;
            } else if (starType < 0.05) {
                colors[i3] = 0.95; colors[i3 + 1] = 0.95; colors[i3 + 2] = 1.0;
            } else if (starType < 0.15) {
                colors[i3] = 1.0; colors[i3 + 1] = 0.98; colors[i3 + 2] = 0.95;
            } else if (starType < 0.4) {
                colors[i3] = 1.0; colors[i3 + 1] = 0.95; colors[i3 + 2] = 0.8;
            } else if (starType < 0.7) {
                colors[i3] = 1.0; colors[i3 + 1] = 0.8; colors[i3 + 2] = 0.6;
            } else {
                colors[i3] = 1.0; colors[i3 + 1] = 0.6; colors[i3 + 2] = 0.4;
            }
            
            sizes[i] = 0.5 + Math.random() * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                void main() {
                    vColor = color;
                    float twinkle = 0.8 + 0.2 * sin(time * 2.0 + position.x * 0.1);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }
    
    // ===== 地球系统 =====
    async initEarth() {
        this.earthGroup = new THREE.Group();
        
        try {
            await this.loadRealisticTextures();
        } catch (e) {
            this.createProceduralTextures();
        }
        
        const earthGeometry = new THREE.SphereGeometry(10, 512, 512);
        
        this.earthMaterial = new THREE.MeshPhysicalMaterial({
            map: this.textures.day,
            normalMap: this.textures.normal,
            normalScale: new THREE.Vector2(0.2, 0.2),
            roughnessMap: this.textures.specular,
            roughness: 0.6,
            metalness: 0.0,
            clearcoat: 0.1,
            clearcoatRoughness: 0.4
        });
        
        this.earth = new THREE.Mesh(earthGeometry, this.earthMaterial);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.earthGroup.add(this.earth);
        
        this.earthGroup.rotation.z = this.earthTilt;
        
        this.createNightLights();
        this.createAdvancedClouds();
        this.createAdvancedAtmosphere();
        this.createAurora();
        
        this.scene.add(this.earthGroup);
    }
    
    async loadRealisticTextures() {
        const loadTexture = (url) => new Promise((resolve, reject) => {
            textureLoader.load(url, resolve, undefined, reject);
        });
        
        const [day, night, normal, specular, clouds] = await Promise.all([
            loadTexture(TEXTURE_URLS.earthDay),
            loadTexture(TEXTURE_URLS.earthNight),
            loadTexture(TEXTURE_URLS.earthNormal),
            loadTexture(TEXTURE_URLS.earthSpecular),
            loadTexture(TEXTURE_URLS.clouds)
        ]);
        
        [day, night, normal, specular, clouds].forEach(tex => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 16;
        });
        
        this.textures = { day, night, normal, specular, clouds };
        this.texturesLoaded = true;
        this.isRealisticMode = true;
    }
    
    createProceduralTextures() {
        this.textures = {};
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        this.drawProceduralEarth(ctx, canvas.width, canvas.height);
        this.textures.day = new THREE.CanvasTexture(canvas);
        this.textures.day.colorSpace = THREE.SRGBColorSpace;
        
        const normalCanvas = document.createElement('canvas');
        normalCanvas.width = 1024; normalCanvas.height = 512;
        const nctx = normalCanvas.getContext('2d');
        nctx.fillStyle = '#8080ff'; nctx.fillRect(0, 0, 1024, 512);
        this.textures.normal = new THREE.CanvasTexture(normalCanvas);
        
        const specCanvas = document.createElement('canvas');
        specCanvas.width = 1024; specCanvas.height = 512;
        const sctx = specCanvas.getContext('2d');
        sctx.fillStyle = '#666666'; sctx.fillRect(0, 0, 1024, 512);
        sctx.fillStyle = '#ffffff'; sctx.fillRect(0, 300, 1024, 200);
        this.textures.specular = new THREE.CanvasTexture(specCanvas);
        
        this.textures.clouds = this.createProceduralClouds();
        this.texturesLoaded = true;
        this.isRealisticMode = false;
    }
    
    createNightLights() {
        if (!this.textures.night) {
            this.textures.night = this.createCityLightsTexture();
        }
        
        const nightMaterial = new THREE.MeshBasicMaterial({
            map: this.textures.night,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0
        });
        
        const nightGeometry = new THREE.SphereGeometry(10.01, 256, 256);
        this.nightLights = new THREE.Mesh(nightGeometry, nightMaterial);
        this.earthGroup.add(this.nightLights);
    }
    
    createCityLightsTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048; canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const cities = [
            {x: 0.22, y: 0.32, r: 30}, {x: 0.15, y: 0.25, r: 25},
            {x: 0.30, y: 0.65, r: 25}, {x: 0.52, y: 0.25, r: 30},
            {x: 0.56, y: 0.30, r: 35}, {x: 0.65, y: 0.32, r: 40},
            {x: 0.70, y: 0.30, r: 35}, {x: 0.80, y: 0.70, r: 15}
        ];
        
        cities.forEach(city => {
            const cx = city.x * canvas.width;
            const cy = city.y * canvas.height;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, city.r * 3);
            grad.addColorStop(0, 'rgba(255, 220, 150, 0.8)');
            grad.addColorStop(0.3, 'rgba(255, 200, 120, 0.4)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, city.r * 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createAdvancedClouds() {
        const cloudGeometry = new THREE.SphereGeometry(10.12, 256, 256);
        
        const cloudMaterial = new THREE.ShaderMaterial({
            uniforms: {
                cloudTexture: { value: this.textures.clouds },
                time: { value: 0 },
                sunDirection: { value: new THREE.Vector3(1, 0.4, 1).normalize() }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D cloudTexture;
                uniform float time;
                uniform vec3 sunDirection;
                varying vec2 vUv;
                varying vec3 vNormal;
                
                void main() {
                    vec2 flowUv = vUv + vec2(time * 0.0005, 0);
                    float cloud1 = texture2D(cloudTexture, flowUv).r;
                    float cloud2 = texture2D(cloudTexture, flowUv * 2.0 + vec2(0.5)).r;
                    float cloudDensity = cloud1 * 0.6 + cloud2 * 0.4;
                    cloudDensity = smoothstep(0.35, 0.75, cloudDensity);
                    
                    float light = max(0.0, dot(vNormal, sunDirection));
                    vec3 cloudColor = vec3(1.0) * (0.6 + light * 0.4);
                    
                    float fresnel = 1.0 - abs(dot(vNormal, vec3(0, 0, 1)));
                    cloudDensity *= (1.0 - fresnel * 0.3);
                    
                    gl_FragColor = vec4(cloudColor, cloudDensity * 0.85);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.NormalBlending
        });
        
        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.clouds.castShadow = true;
        this.earthGroup.add(this.clouds);
    }
    
    createAdvancedAtmosphere() {
        const rayleighGeometry = new THREE.SphereGeometry(10.6, 128, 128);
        
        const rayleighMaterial = new THREE.ShaderMaterial({
            uniforms: {
                cameraPos: { value: new THREE.Vector3() },
                sunDirection: { value: new THREE.Vector3(1, 0.4, 1).normalize() },
                rayleighColor: { value: new THREE.Color(0x4488ff) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 cameraPos;
                uniform vec3 sunDirection;
                uniform vec3 rayleighColor;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 viewDirection = normalize(cameraPos - vPosition);
                    float cosTheta = dot(viewDirection, vNormal);
                    float phase = 0.75 * (1.0 + cosTheta * cosTheta);
                    
                    float viewAngle = 1.0 - abs(dot(viewDirection, vNormal));
                    float scattering = pow(viewAngle, 3.0) * phase * 0.08;
                    
                    float sunAngle = dot(sunDirection, vNormal);
                    vec3 sunsetColor = mix(rayleighColor, vec3(1.0, 0.5, 0.3), smoothstep(0.0, -0.5, sunAngle));
                    
                    gl_FragColor = vec4(sunsetColor, scattering);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.atmosphere = new THREE.Mesh(rayleighGeometry, rayleighMaterial);
        this.earthGroup.add(this.atmosphere);
    }
    
    createAurora() {
        const particleCount = 3000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const isNorth = Math.random() > 0.5;
            const polarAngle = isNorth ? Math.random() * 0.25 : Math.PI - Math.random() * 0.25;
            const azimuth = Math.random() * Math.PI * 2;
            const radius = 10.3 + Math.random() * 0.8;
            
            positions[i3] = radius * Math.sin(polarAngle) * Math.cos(azimuth);
            positions[i3 + 1] = radius * Math.cos(polarAngle);
            positions[i3 + 2] = radius * Math.sin(polarAngle) * Math.sin(azimuth);
            
            const hue = isNorth ? 0.35 + Math.random() * 0.15 : 0.75 + Math.random() * 0.1;
            colors[i3] = hue < 0.5 ? 0.2 : 0.8;
            colors[i3 + 1] = 0.8 + Math.random() * 0.2;
            colors[i3 + 2] = hue < 0.5 ? 0.4 + Math.random() * 0.3 : 0.9;
            
            sizes[i] = 5 + Math.random() * 15;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                void main() {
                    vColor = color;
                    float wave = sin(time * 2.0 + position.x * 0.5) * 0.3;
                    vec3 newPos = position + vec3(0, wave, 0);
                    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
                    float pulse = 0.7 + 0.3 * sin(time * 3.0 + position.y);
                    gl_PointSize = size * pulse * (200.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    float alpha = smoothstep(0.5, 0.0, dist);
                    gl_FragColor = vec4(vColor, alpha * 0.6);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.aurora = new THREE.Points(geometry, material);
        this.earthGroup.add(this.aurora);
    }
    
    initMoon() {
        const moonGeometry = new THREE.SphereGeometry(2.7, 128, 128);
        
        textureLoader.load(TEXTURE_URLS.moon, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const moonMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.9,
                metalness: 0.0
            });
            this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
            this.moon.position.set(60, 0, 0);
            this.moon.castShadow = true;
            this.moon.receiveShadow = true;
            this.scene.add(this.moon);
        }, undefined, () => {
            const fallbackMaterial = new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.9
            });
            this.moon = new THREE.Mesh(moonGeometry, fallbackMaterial);
            this.moon.position.set(60, 0, 0);
            this.scene.add(this.moon);
        });
    }
    
    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 15;
        this.controls.maxDistance = 200;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.2;
    }
    
    initEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        this.container.addEventListener('mousedown', () => {
            this.controls.autoRotate = false;
        });
        
        this.container.addEventListener('mouseup', () => {
            setTimeout(() => { this.controls.autoRotate = true; }, 3000);
        });
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    updateForEra(year) {
        this.currentYear = year;
        let era = year > 4000 ? 'hadean' : year > 2500 ? 'archean' : year > 541 ? 'proterozoic' :
                   year > 252 ? 'paleozoic' : year > 66 ? 'mesozoic' : year > 0 ? 'cenozoic' : 'future';
        
        const colors = ERA_COLORS[era];
        
        if (era === 'cenozoic' && year <= 0) {
            this.setRealisticMode(true);
        } else {
            this.setRealisticMode(false);
        }
        
        if (this.atmosphere) {
            const glowColor = new THREE.Color(colors.atmosphere);
            this.atmosphere.material.uniforms.rayleighColor.value = glowColor;
        }
        
        if (this.clouds) {
            this.clouds.material.opacity = colors.cloudOpacity * 2;
            this.clouds.visible = colors.cloudOpacity > 0.05;
        }
    }
    
    setRealisticMode(enabled) {
        if (enabled && this.isRealisticMode) return;
        if (!enabled && !this.isRealisticMode) return;
        
        if (enabled && this.texturesLoaded) {
            this.earthMaterial.map = this.textures.day;
            this.earthMaterial.normalMap = this.textures.normal;
            this.earthMaterial.roughnessMap = this.textures.specular;
            if (this.nightLights) this.nightLights.visible = true;
            if (this.clouds) this.clouds.material.uniforms.cloudTexture.value = this.textures.clouds;
            if (this.aurora) this.aurora.visible = true;
            this.isRealisticMode = true;
        } else {
            this.createProceduralTextures();
            this.earthMaterial.map = this.textures.day;
            if (this.nightLights) this.nightLights.visible = false;
            if (this.aurora) this.aurora.visible = false;
            this.isRealisticMode = false;
        }
        this.earthMaterial.needsUpdate = true;
    }
    
    drawProceduralEarth(ctx, width, height) {
        const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
        oceanGrad.addColorStop(0, '#1a3a5c');
        oceanGrad.addColorStop(0.5, '#0d4a8c');
        oceanGrad.addColorStop(1, '#1a3a5c');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, width, height);
        
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, 50);
            grad.addColorStop(0, 'rgba(100, 150, 200, 0.03)');
            grad.addColorStop(1, 'rgba(100, 150, 200, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, 50, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    createProceduralClouds() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = 40 + Math.random() * 80;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        return new THREE.CanvasTexture(canvas);
    }
    
    animate() {
        const delta = this.clock.getDelta();
        this.time += delta;
        
        if (this.clouds) {
            this.clouds.material.uniforms.time.value = this.time;
            this.clouds.rotation.y += 0.0002;
        }
        
        if (this.earthGroup) {
            this.earthGroup.rotation.y += 0.0001;
        }
        
        if (this.moon) {
            const moonAngle = this.time * 0.0005;
            this.moon.position.x = Math.cos(moonAngle) * 60;
            this.moon.position.z = Math.sin(moonAngle) * 60;
            this.moon.rotation.y += 0.0001;
        }
        
        if (this.stars) {
            this.stars.material.uniforms.time.value = this.time;
        }
        
        if (this.milkyWay) {
            this.milkyWay.material.uniforms.time.value = this.time;
            this.milkyWay.rotation.y += 0.00002;
        }
        
        if (this.aurora) {
            this.aurora.material.uniforms.time.value = this.time;
            this.aurora.rotation.y -= 0.0003;
        }
        
        if (this.atmosphere) {
            this.atmosphere.material.uniforms.cameraPos.value = this.camera.position;
        }
        
        if (this.nightLights && this.nightLights.visible) {
            const sunDir = this.sunPosition.clone().normalize();
            const camDir = this.camera.position.clone().normalize();
            const nightVisibility = Math.max(0, -sunDir.dot(camDir));
            this.nightLights.material.opacity = nightVisibility * 1.2;
        }
        
        if (this.controls) this.controls.update();
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
