// ===== 地球 3D 模型 - 增强版 =====
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 板块漂移数据 - 关键地质年代的大陆位置
const PLATE_DRIFT_DATA = {
    // 盘古大陆 (3亿年前)
    pangea: {
        year: 300,
        plates: [
            { name: 'Laurasia', lat: 30, lon: 0, rotation: 0, shape: 'north', color: '#5d4e37' },
            { name: 'Gondwana', lat: -30, lon: 0, rotation: 0, shape: 'south', color: '#4a3f2e' }
        ]
    },
    // 侏罗纪 (2亿年前)
    jurassic: {
        year: 200,
        plates: [
            { name: 'North America', lat: 40, lon: -60, rotation: -30, shape: 'na', color: '#5d4e37' },
            { name: 'South America', lat: -20, lon: -40, rotation: 20, shape: 'sa', color: '#4a3f2e' },
            { name: 'Africa', lat: 0, lon: 10, rotation: 10, shape: 'africa', color: '#6b5b4a' },
            { name: 'Eurasia', lat: 45, lon: 60, rotation: -15, shape: 'eurasia', color: '#5d4e37' },
            { name: 'Antarctica', lat: -60, lon: 0, rotation: 0, shape: 'antarctica', color: '#e8e8e8' },
            { name: 'India', lat: -30, lon: 40, rotation: 45, shape: 'india', color: '#5d4e37' },
            { name: 'Australia', lat: -40, lon: 120, rotation: 10, shape: 'australia', color: '#5d4e37' }
        ]
    },
    // 白垩纪 (1亿年前)
    cretaceous: {
        year: 100,
        plates: [
            { name: 'North America', lat: 50, lon: -100, rotation: -15, shape: 'na', color: '#5d4e37' },
            { name: 'South America', lat: -15, lon: -55, rotation: 15, shape: 'sa', color: '#4a3f2e' },
            { name: 'Africa', lat: 5, lon: 10, rotation: 5, shape: 'africa', color: '#6b5b4a' },
            { name: 'Eurasia', lat: 50, lon: 80, rotation: -10, shape: 'eurasia', color: '#5d4e37' },
            { name: 'India', lat: -10, lon: 70, rotation: 30, shape: 'india', color: '#5d4e37' },
            { name: 'Antarctica', lat: -65, lon: 0, rotation: 0, shape: 'antarctica', color: '#e8e8e8' },
            { name: 'Australia', lat: -50, lon: 130, rotation: 5, shape: 'australia', color: '#5d4e37' }
        ]
    },
    // 现代
    modern: {
        year: 0,
        plates: [
            { name: 'North America', lat: 45, lon: -100, rotation: 0, shape: 'na', color: '#5d4e37' },
            { name: 'South America', lat: -15, lon: -60, rotation: 0, shape: 'sa', color: '#4a3f2e' },
            { name: 'Europe', lat: 50, lon: 10, rotation: 0, shape: 'europe', color: '#5d4e37' },
            { name: 'Asia', lat: 45, lon: 90, rotation: 0, shape: 'asia', color: '#5d4e37' },
            { name: 'Africa', lat: 5, lon: 20, rotation: 0, shape: 'africa', color: '#6b5b4a' },
            { name: 'Australia', lat: -25, lon: 135, rotation: 0, shape: 'australia', color: '#5d4e37' },
            { name: 'Antarctica', lat: -80, lon: 0, rotation: 0, shape: 'antarctica', color: '#f0f0f0' }
        ]
    }
};

// 年代阶段配置
const ERA_CONFIGS = {
    hadean: { // 冥古宙 46-40亿年前
        oceanColor: '#1a0f0f',
        oceanColorDeep: '#0d0505',
        landColor: '#ff4500',
        atmosphereColor: 0xff2200,
        atmosphereOpacity: 0.4,
        cloudOpacity: 0,
        glowIntensity: 0.8,
        hasLava: true,
        hasContinents: false
    },
    archean: { // 太古宙 40-25亿年前
        oceanColor: '#0a3a5c',
        oceanColorDeep: '#051d2e',
        landColor: '#4a3728',
        atmosphereColor: 0x4a90a4,
        atmosphereOpacity: 0.25,
        cloudOpacity: 0.1,
        glowIntensity: 0.3,
        hasLava: false,
        hasContinents: true,
        continentCoverage: 0.1
    },
    proterozoic: { // 元古宙 25-5.41亿年前
        oceanColor: '#0d4a7c',
        oceanColorDeep: '#062540',
        landColor: '#5a4a3a',
        atmosphereColor: 0x4fc3f7,
        atmosphereOpacity: 0.2,
        cloudOpacity: 0.2,
        glowIntensity: 0.2,
        hasLava: false,
        hasContinents: true,
        continentCoverage: 0.25
    },
    paleozoic: { // 古生代 5.41-2.52亿年前 - 盘古大陆
        oceanColor: '#1565c0',
        oceanColorDeep: '#0d3d73',
        landColor: '#6b8e4e',
        atmosphereColor: 0x87ceeb,
        atmosphereOpacity: 0.18,
        cloudOpacity: 0.3,
        glowIntensity: 0.15,
        hasLava: false,
        hasContinents: true,
        continentCoverage: 0.35,
        plateStage: 'pangea'
    },
    mesozoic: { // 中生代 2.52-0.66亿年前 - 板块分离
        oceanColor: '#1976d2',
        oceanColorDeep: '#0e4680',
        landColor: '#7cb342',
        atmosphereColor: 0x87ceeb,
        atmosphereOpacity: 0.15,
        cloudOpacity: 0.35,
        glowIntensity: 0.12,
        hasLava: false,
        hasContinents: true,
        continentCoverage: 0.4,
        plateStage: 'jurassic'
    },
    cenozoic: { // 新生代
        oceanColor: '#1e88e5',
        oceanColorDeep: '#115293',
        landColor: '#8bc34a',
        atmosphereColor: 0x87ceeb,
        atmosphereOpacity: 0.12,
        cloudOpacity: 0.4,
        glowIntensity: 0.1,
        hasLava: false,
        hasContinents: true,
        continentCoverage: 0.45,
        plateStage: 'modern'
    },
    future: { // 未来温室
        oceanColor: '#0d5a9c',
        oceanColorDeep: '#073560',
        landColor: '#9e8b6a',
        atmosphereColor: 0xffaa44,
        atmosphereOpacity: 0.3,
        cloudOpacity: 0.2,
        glowIntensity: 0.25,
        hasLava: false,
        hasContinents: true,
        continentCoverage: 0.4
    }
};

export class Earth {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.earth = null;
        this.atmosphere = null;
        this.clouds = null;
        this.plateGroup = null;
        this.plates = [];
        this.markers = [];
        this.stars = null;
        this.currentEra = null;
        this.currentYear = 4600;
        this.textures = {};
        this.clock = new THREE.Clock();
        
        // 板块漂移插值
        this.plateTransition = {
            active: false,
            progress: 0,
            fromStage: null,
            toStage: null,
            duration: 3.0 // 秒
        };
    }
    
    async init() {
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initLights();
        this.initStars();
        await this.initEarth();
        this.initControls();
        this.initEventListeners();
        
        // 预生成所有年代的纹理
        this.preGenerateTextures();
        
        // 初始设置为冥古宙
        this.updateForEra(4600);
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050508);
        this.scene.fog = new THREE.FogExp2(0x050508, 0.002);
    }
    
    initCamera() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 28);
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
        this.renderer.toneMappingExposure = 1.1;
        this.container.appendChild(this.renderer.domElement);
    }
    
    initLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // 主太阳光
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
        this.sunLight.position.set(50, 30, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.bias = -0.0001;
        this.scene.add(this.sunLight);
        
        // 补光
        const fillLight = new THREE.DirectionalLight(0x88ccff, 0.4);
        fillLight.position.set(-30, 0, -30);
        this.scene.add(fillLight);
        
        // 边缘光
        const rimLight = new THREE.DirectionalLight(0x4fc3f7, 0.3);
        rimLight.position.set(0, -50, 0);
        this.scene.add(rimLight);
    }
    
    initStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 5000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const radius = 80 + Math.random() * 150;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // 星星颜色变化
            const temp = Math.random();
            if (temp > 0.9) {
                // 蓝色星星
                colors[i3] = 0.7;
                colors[i3 + 1] = 0.8;
                colors[i3 + 2] = 1.0;
            } else if (temp > 0.7) {
                // 黄色星星
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.9;
                colors[i3 + 2] = 0.6;
            } else if (temp > 0.5) {
                // 红色星星
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.6;
                colors[i3 + 2] = 0.5;
            } else {
                // 白色星星
                colors[i3] = 0.95;
                colors[i3 + 1] = 0.95;
                colors[i3 + 2] = 1.0;
            }
            
            sizes[i] = 0.3 + Math.random() * 0.7;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // 自定义星星着色器
        const starMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(time + position.x) * 0.3);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }
    
    async initEarth() {
        this.earthGroup = new THREE.Group();
        
        // 地球几何体 - 高精度
        const earthGeometry = new THREE.IcosahedronGeometry(10, 128);
        
        // 地球材质 - 使用自定义着色器实现精细地形
        this.earthMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: null },
                uNormalMap: { value: null },
                uHeightMap: { value: null },
                uTime: { value: 0 },
                uHasLava: { value: false },
                uLavaIntensity: { value: 0 },
                uOceanColor: { value: new THREE.Color(0x1e88e5) },
                uLandColor: { value: new THREE.Color(0x5d4e37) },
                uSunPosition: { value: new THREE.Vector3(50, 30, 50) }
            },
            vertexShader: this.getEarthVertexShader(),
            fragmentShader: this.getEarthFragmentShader()
        });
        
        this.earth = new THREE.Mesh(earthGeometry, this.earthMaterial);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.earthGroup.add(this.earth);
        
        // 海洋表面（稍大一些）
        const oceanGeometry = new THREE.IcosahedronGeometry(10.02, 64);
        this.oceanMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1976d2,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.2,
            thickness: 2,
            clearcoat: 1,
            clearcoatRoughness: 0.1
        });
        this.ocean = new THREE.Mesh(oceanGeometry, this.oceanMaterial);
        this.ocean.visible = false; // 只在有水的时候显示
        this.earthGroup.add(this.ocean);
        
        // 大气层
        this.initAtmosphere();
        
        // 云层
        this.initClouds();
        
        // 板块组
        this.initPlates();
        
        this.scene.add(this.earthGroup);
    }
    
    initAtmosphere() {
        const atmosphereGeometry = new THREE.IcosahedronGeometry(10.5, 64);
        
        this.atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uAtmosphereColor: { value: new THREE.Color(0x87ceeb) },
                uOpacity: { value: 0.15 },
                uGlowIntensity: { value: 0.5 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uAtmosphereColor;
                uniform float uOpacity;
                uniform float uGlowIntensity;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 viewDir = normalize(-vPosition);
                    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
                    vec3 color = uAtmosphereColor * fresnel * uGlowIntensity;
                    gl_FragColor = vec4(color, fresnel * uOpacity);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, this.atmosphereMaterial);
        this.earthGroup.add(this.atmosphere);
    }
    
    initClouds() {
        const cloudGeometry = new THREE.IcosahedronGeometry(10.2, 64);
        
        this.cloudMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uCloudOpacity: { value: 0.4 },
                uCloudDensity: { value: 0.5 }
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
                uniform float uTime;
                uniform float uCloudOpacity;
                uniform float uCloudDensity;
                varying vec2 vUv;
                varying vec3 vNormal;
                
                // Simplex noise function
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    vec3 i = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    i = mod289(i);
                    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
                }
                
                void main() {
                    vec3 pos = vec3(vUv * 10.0, uTime * 0.05);
                    float noise = snoise(pos);
                    noise += snoise(pos * 2.0) * 0.5;
                    noise += snoise(pos * 4.0) * 0.25;
                    noise = noise * 0.5 + 0.5;
                    
                    float cloud = smoothstep(0.4, 0.7, noise);
                    float alpha = cloud * uCloudOpacity;
                    
                    vec3 color = vec3(1.0, 1.0, 1.0);
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.NormalBlending
        });
        
        this.clouds = new THREE.Mesh(cloudGeometry, this.cloudMaterial);
        this.clouds.visible = false;
        this.earthGroup.add(this.clouds);
    }
    
    initPlates() {
        // 板块组用于板块漂移动画
        this.plateGroup = new THREE.Group();
        this.earthGroup.add(this.plateGroup);
    }
    
    // 地球顶点着色器
    getEarthVertexShader() {
        return `
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            varying float vElevation;
            
            uniform float uTime;
            uniform bool uHasLava;
            
            // 噪声函数
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                i = mod289(i);
                vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }
            
            float fbm(vec3 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                for(int i = 0; i < 4; i++) {
                    value += amplitude * snoise(p * frequency);
                    amplitude *= 0.5;
                    frequency *= 2.0;
                }
                return value;
            }
            
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                
                // 地形高度
                float elevation = fbm(position * 0.5);
                vElevation = elevation;
                
                vec3 newPosition = position;
                
                // 熔岩流动效果
                if(uHasLava) {
                    float lavaFlow = snoise(position * 2.0 + uTime * 0.3);
                    newPosition += normal * lavaFlow * 0.15;
                } else {
                    // 普通地形起伏
                    newPosition += normal * elevation * 0.08;
                }
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `;
    }
    
    // 地球片段着色器
    getEarthFragmentShader() {
        return `
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            varying float vElevation;
            
            uniform float uTime;
            uniform bool uHasLava;
            uniform float uLavaIntensity;
            uniform vec3 uOceanColor;
            uniform vec3 uLandColor;
            uniform vec3 uSunPosition;
            uniform sampler2D uTexture;
            uniform sampler2D uNormalMap;
            uniform sampler2D uHeightMap;
            
            // 噪声函数
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                i = mod289(i);
                vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }
            
            // 计算大陆分布
            float continentNoise(vec3 p) {
                float c1 = snoise(p * 1.5);
                float c2 = snoise(p * 3.0 + 100.0) * 0.5;
                float c3 = snoise(p * 6.0 + 200.0) * 0.25;
                return smoothstep(-0.1, 0.3, c1 + c2 + c3);
            }
            
            void main() {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(uSunPosition);
                vec3 viewDir = normalize(-vPosition);
                
                // 基础光照
                float NdotL = max(dot(normal, lightDir), 0.0);
                
                // 边缘光
                float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
                
                vec3 color;
                
                if(uHasLava) {
                    // 熔岩星球效果
                    float lava = snoise(vWorldPosition * 2.0 + uTime * 0.2);
                    float lavaFlow = snoise(vWorldPosition * 4.0 - uTime * 0.3);
                    
                    vec3 lavaColor1 = vec3(1.0, 0.4, 0.0); // 亮橙色
                    vec3 lavaColor2 = vec3(0.8, 0.0, 0.0); // 深红色
                    vec3 rockColor = vec3(0.1, 0.05, 0.05); // 黑岩
                    
                    float lavaMask = smoothstep(0.2, 0.5, lava + lavaFlow * 0.3);
                    color = mix(rockColor, mix(lavaColor2, lavaColor1, lavaFlow), lavaMask);
                    
                    // 发光
                    color += lavaMask * vec3(0.5, 0.2, 0.0) * fresnel * 2.0;
                } else {
                    // 正常地球
                    float continent = continentNoise(vWorldPosition);
                    
                    // 海洋深度变化
                    float oceanDepth = snoise(vWorldPosition * 3.0) * 0.3 + 0.7;
                    vec3 deepOcean = uOceanColor * 0.6;
                    vec3 shallowOcean = uOceanColor;
                    vec3 oceanColor = mix(deepOcean, shallowOcean, oceanDepth);
                    
                    // 陆地颜色变化（基于纬度模拟温度带）
                    float latitude = abs(normalize(vWorldPosition).y);
                    vec3 tropical = uLandColor;
                    vec3 temperate = mix(uLandColor, vec3(0.4, 0.5, 0.3), 0.3);
                    vec3 polar = vec3(0.9, 0.95, 1.0);
                    
                    vec3 landColor;
                    if(latitude < 0.3) landColor = tropical;
                    else if(latitude < 0.7) landColor = temperate;
                    else landColor = mix(temperate, polar, (latitude - 0.7) / 0.3);
                    
                    // 山脉
                    float mountain = pow(max(0.0, vElevation), 2.0) * continent;
                    vec3 mountainColor = vec3(0.5, 0.45, 0.4);
                    landColor = mix(landColor, mountainColor, mountain);
                    
                    // 雪地
                    if(latitude > 0.75) {
                        landColor = mix(landColor, polar, (latitude - 0.75) / 0.25);
                    }
                    
                    color = mix(oceanColor, landColor, continent);
                    
                    // 添加地形细节
                    float detail = snoise(vWorldPosition * 10.0) * 0.05;
                    color += detail;
                }
                
                // 光照着色
                color = color * (0.3 + 0.7 * NdotL);
                
                // 大气散射
                color += vec3(0.4, 0.7, 1.0) * fresnel * 0.2;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }
    
    preGenerateTextures() {
        // 预生成各年代纹理
        for (const [key, config] of Object.entries(ERA_CONFIGS)) {
            this.textures[key] = this.generateEraTexture(config);
        }
    }
    
    generateEraTexture(config) {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // 海洋渐变
        const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        oceanGrad.addColorStop(0, config.oceanColor);
        oceanGrad.addColorStop(0.5, config.oceanColorDeep);
        oceanGrad.addColorStop(1, config.oceanColor);
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 添加海洋深度纹理
        this.addOceanDepth(ctx, canvas.width, canvas.height);
        
        // 如果有大陆，绘制大陆
        if (config.hasContinents) {
            this.drawContinents(ctx, canvas.width, canvas.height, config);
        }
        
        // 添加细节
        this.addTerrainDetail(ctx, canvas.width, canvas.height, config);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }
    
    addOceanDepth(ctx, width, height) {
        // 添加海底地形
        ctx.globalCompositeOperation = 'overlay';
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 10 + Math.random() * 50;
            const alpha = 0.02 + Math.random() * 0.03;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
    }
    
    drawContinents(ctx, width, height, config) {
        const coverage = config.continentCoverage || 0.3;
        
        // 简化的大陆形状
        const continents = [
            { x: 0.25, y: 0.35, w: 0.25, h: 0.35 }, // 北美/欧亚
            { x: 0.35, y: 0.65, w: 0.15, h: 0.25 }, // 南美/非洲
            { x: 0.65, y: 0.4, w: 0.2, h: 0.3 },   // 亚洲
            { x: 0.75, y: 0.7, w: 0.12, h: 0.15 }  // 澳洲
        ];
        
        ctx.fillStyle = config.landColor;
        
        for (const cont of continents) {
            if (Math.random() > coverage * 2) continue;
            
            const cx = cont.x * width;
            const cy = cont.y * height;
            const cw = cont.w * width;
            const ch = cont.h * height;
            
            ctx.beginPath();
            
            // 不规则边缘
            const points = [];
            const numPoints = 20;
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                const varX = 0.7 + Math.random() * 0.6;
                const varY = 0.7 + Math.random() * 0.6;
                points.push({
                    x: cx + Math.cos(angle) * cw * varX * 0.5,
                    y: cy + Math.sin(angle) * ch * varY * 0.5
                });
            }
            
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 0; i < points.length; i++) {
                const p0 = points[i];
                const p1 = points[(i + 1) % points.length];
                const midX = (p0.x + p1.x) / 2;
                const midY = (p0.y + p1.y) / 2;
                ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
            }
            ctx.closePath();
            ctx.fill();
            
            // 海岸线细节
            ctx.strokeStyle = this.darkenColor(config.landColor, 20);
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    
    addTerrainDetail(ctx, width, height, config) {
        // 山脉和地形细节
        if (config.hasContinents) {
            ctx.globalCompositeOperation = 'multiply';
            
            // 添加山脉纹理
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = 30 + Math.random() * 80;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(100, 90, 80, 0.1)';
                ctx.fill();
            }
            
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    // 辅助函数
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min((num >> 16) + amt, 255);
        const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
        const B = Math.min((num & 0x0000FF) + amt, 255);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    updateForEra(year) {
        this.currentYear = year;
        
        let config;
        if (year > 4000) config = ERA_CONFIGS.hadean;
        else if (year > 2500) config = ERA_CONFIGS.archean;
        else if (year > 541) config = ERA_CONFIGS.proterozoic;
        else if (year > 252) config = ERA_CONFIGS.paleozoic;
        else if (year > 66) config = ERA_CONFIGS.mesozoic;
        else if (year > 0) config = ERA_CONFIGS.cenozoic;
        else config = ERA_CONFIGS.future;
        
        // 更新地球材质
        if (this.earthMaterial) {
            this.earthMaterial.uniforms.uHasLava.value = config.hasLava;
            this.earthMaterial.uniforms.uOceanColor.value.set(config.oceanColor);
            this.earthMaterial.uniforms.uLandColor.value.set(config.landColor);
        }
        
        // 更新大气层
        if (this.atmosphereMaterial) {
            this.atmosphereMaterial.uniforms.uAtmosphereColor.value.set(config.atmosphereColor);
            this.atmosphereMaterial.uniforms.uOpacity.value = config.atmosphereOpacity;
            this.atmosphereMaterial.uniforms.uGlowIntensity.value = config.glowIntensity;
        }
        
        // 更新云层
        if (this.cloudMaterial) {
            this.cloudMaterial.uniforms.uCloudOpacity.value = config.cloudOpacity;
            this.clouds.visible = config.cloudOpacity > 0.05;
        }
        
        // 更新海洋
        if (this.ocean) {
            this.ocean.visible = !config.hasLava && config.continentCoverage > 0;
            if (this.ocean.visible) {
                this.oceanMaterial.color.set(config.oceanColor);
            }
        }
        
        // 更新光照
        if (this.sunLight) {
            if (config.hasLava) {
                this.sunLight.intensity = 0.8;
                this.sunLight.color.setHex(0xffaa66);
            } else {
                this.sunLight.intensity = 1.8;
                this.sunLight.color.setHex(0xffffff);
            }
        }
        
        // 处理板块漂移
        this.updatePlateDrift(year, config);
    }
    
    updatePlateDrift(year, config) {
        // 根据年代确定板块阶段
        let targetStage = null;
        if (year > 300) targetStage = 'pangea';
        else if (year > 150) targetStage = 'jurassic';
        else if (year > 50) targetStage = 'cretaceous';
        else targetStage = 'modern';
        
        // 如果不是板块相关的年代，隐藏板块组
        if (!config.plateStage) {
            if (this.plateGroup) {
                this.plateGroup.visible = false;
            }
            return;
        }
        
        this.plateGroup.visible = true;
        
        // 这里可以实现平滑的板块过渡动画
        // 目前使用简单的可见性控制
    }
    
    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 15;
        this.controls.maxDistance = 60;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.enablePan = false;
    }
    
    initEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    addCreatureMarker(creature) {
        // 简化的标记实现
        const marker = {
            creature: creature,
            element: null
        };
        return marker;
    }
    
    clearMarkers() {
        this.markers = [];
    }
    
    animate() {
        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // 更新着色器时间
        if (this.earthMaterial) {
            this.earthMaterial.uniforms.uTime.value = elapsedTime;
        }
        
        if (this.cloudMaterial) {
            this.cloudMaterial.uniforms.uTime.value = elapsedTime;
        }
        
        if (this.stars && this.stars.material.uniforms) {
            this.stars.material.uniforms.time.value = elapsedTime;
        }
        
        // 云层旋转
        if (this.clouds && this.clouds.visible) {
            this.clouds.rotation.y += 0.001;
        }
        
        // 地球自转
        if (this.earthGroup) {
            this.earthGroup.rotation.y += 0.0005;
        }
        
        // 控制器更新
        if (this.controls) {
            this.controls.update();
        }
        
        // 渲染
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
