// ===== 地球 3D 模型 - 极致真实感版本 =====
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

// 高质量纹理资源
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
        if (!this.container) {
            throw new Error('Container element not found: ' + containerId);
        }
        
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
        
        // 纹理缓存
        this.textures = {};
    }
    
    async init() {
        console.log('Earth: Starting initialization...');
        
        try {
            this.initScene();
            console.log('Earth: Scene initialized');
            
            this.initCamera();
            console.log('Earth: Camera initialized');
            
            this.initRenderer();
            console.log('Earth: Renderer initialized');
            
            this.initLights();
            console.log('Earth: Lights initialized');
            
            this.initMilkyWay();
            console.log('Earth: MilkyWay initialized');
            
            this.initStars();
            console.log('Earth: Stars initialized');
            
            await this.initEarth();
            console.log('Earth: Earth mesh initialized');
            
            this.initMoon();
            console.log('Earth: Moon initialized');
            
            this.initControls();
            console.log('Earth: Controls initialized');
            
            this.initEventListeners();
            console.log('Earth: Event listeners initialized');
            
            this.updateForEra(0);
            console.log('Earth: Era updated');
            
            console.log('Earth: Initialization complete!');
        } catch (error) {
            console.error('Earth: Initialization failed:', error);
            throw error;
        }
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
    }
    
    initCamera() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        if (width === 0 || height === 0) {
            console.warn('Container has zero size, using default dimensions');
        }
        
        this.camera = new THREE.PerspectiveCamera(45, width / height || 1, 0.1, 5000);
        this.camera.position.set(0, 15, 35);
    }
    
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 600;
        
        this.renderer.setSize(width, height);
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
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);
        
        const earthShine = new THREE.DirectionalLight(0x1a3a5c, 0.4);
        earthShine.position.set(-30, -10, -30);
        this.scene.add(earthShine);
    }
    
    // ===== 银河系背景 =====
    initMilkyWay() {
        try {
            const particleCount = 15000;
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
        } catch (e) {
            console.warn('MilkyWay initialization failed:', e);
        }
    }
    
    // ===== 增强星空 =====
    initStars() {
        try {
            const starCount = 25000;
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
        } catch (e) {
            console.warn('Stars initialization failed:', e);
        }
    }
    
    // ===== 地球系统 =====
    async initEarth() {
        this.earthGroup = new THREE.Group();
        
        // 尝试加载真实纹理，失败则使用程序化纹理
        try {
            await this.loadRealisticTextures();
            console.log('Realistic textures loaded');
        } catch (e) {
            console.warn('Failed to load realistic textures, using procedural:', e.message);
            this.createProceduralTextures();
        }
        
        const earthGeometry = new THREE.SphereGeometry(10, 256, 256);
        
        this.earthMaterial = new THREE.MeshPhysicalMaterial({
            map: this.textures.day,
            normalMap: this.textures.normal,
            normalScale: new THREE.Vector2(0.15, 0.15),
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
        
        // 应用轴倾斜
        this.earthGroup.rotation.z = this.earthTilt;
        
        // 创建其他效果
        this.createNightLights();
        this.createAdvancedClouds();
        this.createAdvancedAtmosphere();
        this.createAurora();
        
        this.scene.add(this.earthGroup);
    }
    
    async loadRealisticTextures() {
        return new Promise((resolve, reject) => {
            const loadedTextures = {};
            let loadedCount = 0;
            const totalTextures = 5;
            const timeout = setTimeout(() => {
                reject(new Error('Texture loading timeout'));
            }, 10000);
            
            const onLoad = (key, texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.anisotropy = 16;
                loadedTextures[key] = texture;
                loadedCount++;
                
                if (loadedCount === totalTextures) {
                    clearTimeout(timeout);
                    this.textures = loadedTextures;
                    this.texturesLoaded = true;
                    this.isRealisticMode = true;
                    resolve();
                }
            };
            
            const onError = (url) => {
                clearTimeout(timeout);
                reject(new Error('Failed to load texture: ' + url));
            };
            
            textureLoader.load(TEXTURE_URLS.earthDay, 
                (t) => onLoad('day', t), 
                undefined, 
                () => onError(TEXTURE_URLS.earthDay));
                
            textureLoader.load(TEXTURE_URLS.earthNight, 
                (t) => onLoad('night', t), 
                undefined, 
                () => onError(TEXTURE_URLS.earthNight));
                
            textureLoader.load(TEXTURE_URLS.earthNormal, 
                (t) => onLoad('normal', t), 
                undefined, 
                () => onError(TEXTURE_URLS.earthNormal));
                
            textureLoader.load(TEXTURE_URLS.earthSpecular, 
                (t) => onLoad('specular', t), 
                undefined, 
                () => onError(TEXTURE_URLS.earthSpecular));
                
            textureLoader.load(TEXTURE_URLS.clouds, 
                (t) => onLoad('clouds', t), 
                undefined, 
                () => onError(TEXTURE_URLS.clouds));
        });
    }
    
    createProceduralTextures() {
        console.log('Creating procedural textures...');
        
        // 白天纹理
        const dayCanvas = document.createElement('canvas');
        dayCanvas.width = 1024;
        dayCanvas.height = 512;
        const dayCtx = dayCanvas.getContext('2d');
        
        // 海洋背景
        const oceanGrad = dayCtx.createLinearGradient(0, 0, 0, 512);
        oceanGrad.addColorStop(0, '#1a3a5c');
        oceanGrad.addColorStop(0.5, '#0d4a8c');
        oceanGrad.addColorStop(1, '#1a3a5c');
        dayCtx.fillStyle = oceanGrad;
        dayCtx.fillRect(0, 0, 1024, 512);
        
        // 添加海洋纹理
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const grad = dayCtx.createRadialGradient(x, y, 0, x, y, 30);
            grad.addColorStop(0, 'rgba(100, 150, 200, 0.05)');
            grad.addColorStop(1, 'rgba(100, 150, 200, 0)');
            dayCtx.fillStyle = grad;
            dayCtx.beginPath();
            dayCtx.arc(x, y, 30, 0, Math.PI * 2);
            dayCtx.fill();
        }
        
        // 大陆
        const continents = [
            {x: 200, y: 160, r: 80}, {x: 300, y: 330, r: 50},
            {x: 550, y: 140, r: 120}, {x: 530, y: 280, r: 60},
            {x: 800, y: 350, r: 40}
        ];
        
        continents.forEach(c => {
            const grad = dayCtx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
            grad.addColorStop(0, 'rgba(60, 120, 60, 0.8)');
            grad.addColorStop(1, 'rgba(60, 120, 60, 0)');
            dayCtx.fillStyle = grad;
            dayCtx.beginPath();
            dayCtx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            dayCtx.fill();
        });
        
        this.textures.day = new THREE.CanvasTexture(dayCanvas);
        this.textures.day.colorSpace = THREE.SRGBColorSpace;
        
        // 法线贴图
        const normalCanvas = document.createElement('canvas');
        normalCanvas.width = 512; normalCanvas.height = 256;
        const nctx = normalCanvas.getContext('2d');
        nctx.fillStyle = '#8080ff'; nctx.fillRect(0, 0, 512, 256);
        this.textures.normal = new THREE.CanvasTexture(normalCanvas);
        
        // 镜面贴图
        const specCanvas = document.createElement('canvas');
        specCanvas.width = 512; specCanvas.height = 256;
        const sctx = specCanvas.getContext('2d');
        sctx.fillStyle = '#444444'; sctx.fillRect(0, 0, 512, 256);
        sctx.fillStyle = '#888888'; sctx.fillRect(0, 150, 512, 106);
        this.textures.specular = new THREE.CanvasTexture(specCanvas);
        
        // 云层
        this.textures.clouds = this.createProceduralClouds();
        
        this.texturesLoaded = true;
        this.isRealisticMode = false;
    }
    
    createProceduralClouds() {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = 30 + Math.random() * 60;
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
    
    createNightLights() {
        try {
            if (!this.textures.night) {
                this.textures.night = this.createCityLightsTexture();
            }
            
            const nightMaterial = new THREE.MeshBasicMaterial({
                map: this.textures.night,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0
            });
            
            const nightGeometry = new THREE.SphereGeometry(10.02, 128, 128);
            this.nightLights = new THREE.Mesh(nightGeometry, nightMaterial);
            this.earthGroup.add(this.nightLights);
        } catch (e) {
            console.warn('Night lights creation failed:', e);
        }
    }
    
    createCityLightsTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const cities = [
            {x: 220, y: 160, r: 30}, {x: 150, y: 125, r: 25},
            {x: 300, y: 330, r: 25}, {x: 520, y: 125, r: 30},
            {x: 560, y: 150, r: 35}, {x: 650, y: 160, r: 40},
            {x: 700, y: 150, r: 35}, {x: 800, y: 350, r: 15}
        ];
        
        cities.forEach(city => {
            const grad = ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, city.r * 3);
            grad.addColorStop(0, 'rgba(255, 220, 150, 0.8)');
            grad.addColorStop(0.3, 'rgba(255, 200, 120, 0.4)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(city.x, city.y, city.r * 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createAdvancedClouds() {
        try {
            const cloudGeometry = new THREE.SphereGeometry(10.1, 128, 128);
            
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
                        float cloud = texture2D(cloudTexture, flowUv).r;
                        cloud = smoothstep(0.3, 0.7, cloud);
                        
                        float light = max(0.0, dot(vNormal, sunDirection));
                        vec3 cloudColor = vec3(0.95) * (0.5 + light * 0.5);
                        
                        gl_FragColor = vec4(cloudColor, cloud * 0.8);
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
        } catch (e) {
            console.warn('Clouds creation failed:', e);
        }
    }
    
    createAdvancedAtmosphere() {
        try {
            const atmosphereGeometry = new THREE.SphereGeometry(10.5, 128, 128);
            
            const atmosphereMaterial = new THREE.ShaderMaterial({
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
                        vec3 viewDir = normalize(cameraPos - vPosition);
                        float viewAngle = 1.0 - abs(dot(viewDir, vNormal));
                        float scattering = pow(viewAngle, 4.0) * 0.15;
                        
                        float sunAngle = dot(sunDirection, vNormal);
                        vec3 color = mix(rayleighColor, vec3(1.0, 0.6, 0.4), smoothstep(0.0, -0.3, sunAngle));
                        
                        gl_FragColor = vec4(color, scattering);
                    }
                `,
                transparent: true,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            this.earthGroup.add(this.atmosphere);
        } catch (e) {
            console.warn('Atmosphere creation failed:', e);
        }
    }
    
    createAurora() {
        try {
            const particleCount = 2000;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            const sizes = new Float32Array(particleCount);
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const isNorth = Math.random() > 0.5;
                const polarAngle = isNorth ? Math.random() * 0.25 : Math.PI - Math.random() * 0.25;
                const azimuth = Math.random() * Math.PI * 2;
                const radius = 10.25 + Math.random() * 0.6;
                
                positions[i3] = radius * Math.sin(polarAngle) * Math.cos(azimuth);
                positions[i3 + 1] = radius * Math.cos(polarAngle);
                positions[i3 + 2] = radius * Math.sin(polarAngle) * Math.sin(azimuth);
                
                if (isNorth) {
                    colors[i3] = 0.2; colors[i3 + 1] = 0.9; colors[i3 + 2] = 0.5;
                } else {
                    colors[i3] = 0.8; colors[i3 + 1] = 0.9; colors[i3 + 2] = 1.0;
                }
                
                sizes[i] = 5 + Math.random() * 10;
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
                        vec3 pos = position + vec3(0, wave, 0);
                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
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
                        gl_FragColor = vec4(vColor, alpha * 0.5);
                    }
                `,
                transparent: true,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            this.aurora = new THREE.Points(geometry, material);
            this.earthGroup.add(this.aurora);
        } catch (e) {
            console.warn('Aurora creation failed:', e);
        }
    }
    
    initMoon() {
        try {
            const moonGeometry = new THREE.SphereGeometry(2.7, 64, 64);
            
            // 使用程序化月球纹理
            const moonCanvas = document.createElement('canvas');
            moonCanvas.width = 512; moonCanvas.height = 256;
            const ctx = moonCanvas.getContext('2d');
            
            // 灰色基础
            ctx.fillStyle = '#888888';
            ctx.fillRect(0, 0, 512, 256);
            
            // 陨石坑
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 256;
                const r = 5 + Math.random() * 20;
                const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
                grad.addColorStop(0, '#666666');
                grad.addColorStop(1, '#888888');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            
            const moonTexture = new THREE.CanvasTexture(moonCanvas);
            const moonMaterial = new THREE.MeshStandardMaterial({
                map: moonTexture,
                roughness: 0.9,
                metalness: 0.0
            });
            
            this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
            this.moon.position.set(60, 0, 0);
            this.moon.castShadow = true;
            this.moon.receiveShadow = true;
            this.scene.add(this.moon);
        } catch (e) {
            console.warn('Moon initialization failed:', e);
        }
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
            if (this.controls) this.controls.autoRotate = false;
        });
        
        this.container.addEventListener('mouseup', () => {
            setTimeout(() => {
                if (this.controls) this.controls.autoRotate = true;
            }, 3000);
        });
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        if (width > 0 && height > 0) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }
    
    updateForEra(year) {
        this.currentYear = year;
        
        let era = year > 4000 ? 'hadean' : 
                  year > 2500 ? 'archean' : 
                  year > 541 ? 'proterozoic' :
                  year > 252 ? 'paleozoic' : 
                  year > 66 ? 'mesozoic' : 
                  year > 0 ? 'cenozoic' : 'future';
        
        const colors = ERA_COLORS[era];
        
        // 现代地球使用真实纹理
        if (era === 'cenozoic' && year <= 0 && this.texturesLoaded) {
            this.isRealisticMode = true;
            if (this.nightLights) this.nightLights.visible = true;
            if (this.aurora) this.aurora.visible = true;
        } else {
            this.isRealisticMode = false;
            if (this.nightLights) this.nightLights.visible = false;
            if (this.aurora) this.aurora.visible = false;
        }
        
        // 更新大气颜色
        if (this.atmosphere && this.atmosphere.material.uniforms) {
            const glowColor = new THREE.Color(colors.atmosphere);
            this.atmosphere.material.uniforms.rayleighColor.value = glowColor;
        }
        
        // 更新云层
        if (this.clouds && this.clouds.material.uniforms) {
            this.clouds.material.opacity = colors.cloudOpacity * 2;
            this.clouds.visible = colors.cloudOpacity > 0.05;
        }
    }
    
    // 添加生物标记（简化版）
    addCreatureMarker(creature) {
        return { creature: creature, element: null };
    }
    
    clearMarkers() {
        // 清理标记
    }
    
    latLonToScreen(lat, lon) {
        return { x: 0, y: 0, visible: false };
    }
    
    animate() {
        const delta = this.clock.getDelta();
        this.time += delta;
        
        // 云层动画
        if (this.clouds && this.clouds.material.uniforms) {
            this.clouds.material.uniforms.time.value = this.time;
            this.clouds.rotation.y += 0.00015;
        }
        
        // 地球自转
        if (this.earthGroup) {
            this.earthGroup.rotation.y += 0.00008;
        }
        
        // 月球轨道
        if (this.moon) {
            const moonAngle = this.time * 0.0003;
            this.moon.position.x = Math.cos(moonAngle) * 60;
            this.moon.position.z = Math.sin(moonAngle) * 60;
        }
        
        // 星空闪烁
        if (this.stars && this.stars.material.uniforms) {
            this.stars.material.uniforms.time.value = this.time;
        }
        
        // 银河系旋转
        if (this.milkyWay && this.milkyWay.material.uniforms) {
            this.milkyWay.material.uniforms.time.value = this.time;
            this.milkyWay.rotation.y += 0.00001;
        }
        
        // 极光动画
        if (this.aurora && this.aurora.material.uniforms) {
            this.aurora.material.uniforms.time.value = this.time;
            this.aurora.rotation.y -= 0.0002;
        }
        
        // 大气层更新
        if (this.atmosphere && this.atmosphere.material.uniforms) {
            this.atmosphere.material.uniforms.cameraPos.value = this.camera.position;
        }
        
        // 城市灯光亮度
        if (this.nightLights && this.nightLights.visible) {
            const sunDir = this.sunPosition.clone().normalize();
            const camDir = this.camera.position.clone().normalize();
            const nightVisibility = Math.max(0, -sunDir.dot(camDir));
            this.nightLights.material.opacity = nightVisibility * 1.2;
        }
        
        // 控制器更新
        if (this.controls) this.controls.update();
        
        // 渲染
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
