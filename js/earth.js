// ===== 地球 3D 模型 - 太空级真实感版本 =====
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 年代颜色配置
const ERA_COLORS = {
    hadean: {
        ocean: 0x1a0f0f,
        land: 0xff4500,
        atmosphere: 0xff2200,
        hasLava: true,
        cloudOpacity: 0
    },
    archean: {
        ocean: 0x0a3a5c,
        land: 0x4a3728,
        atmosphere: 0x4a90a4,
        hasLava: false,
        cloudOpacity: 0.1
    },
    proterozoic: {
        ocean: 0x0d4a7c,
        land: 0x5a4a3a,
        atmosphere: 0x4fc3f7,
        hasLava: false,
        cloudOpacity: 0.2
    },
    paleozoic: {
        ocean: 0x1565c0,
        land: 0x6b8e4e,
        atmosphere: 0x87ceeb,
        hasLava: false,
        cloudOpacity: 0.3
    },
    mesozoic: {
        ocean: 0x1976d2,
        land: 0x7cb342,
        atmosphere: 0x87ceeb,
        hasLava: false,
        cloudOpacity: 0.35
    },
    cenozoic: {
        ocean: 0x1e88e5,
        land: 0x8bc34a,
        atmosphere: 0x87ceeb,
        hasLava: false,
        cloudOpacity: 0.4
    },
    future: {
        ocean: 0x0d5a9c,
        land: 0x9e8b6a,
        atmosphere: 0xffaa44,
        hasLava: false,
        cloudOpacity: 0.2
    }
};

// 纹理加载器
const textureLoader = new THREE.TextureLoader();

// NASA 及高质量纹理资源路径
const TEXTURE_URLS = {
    // 8K 地球纹理 (来自 github.com/mrdoob/three.js/dev/examples/textures/planets)
    earthDay: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    earthNight: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_night_2048.jpg',
    earthNormal: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
    earthSpecular: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
    clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
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
        this.nightLights = null;
        this.markers = [];
        this.stars = null;
        this.currentYear = 4600;
        this.clock = new THREE.Clock();
        this.texturesLoaded = false;
        this.isRealisticMode = false; // 是否使用真实纹理模式
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
        
        // 初始设置为现代地球（真实纹理模式）
        this.updateForEra(0);
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        // 使用纯黑色背景，让地球更突出
        this.scene.background = new THREE.Color(0x020204);
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
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);
    }
    
    initLights() {
        // 环境光 - 模拟星空微弱照明
        const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
        this.scene.add(ambientLight);
        
        // 主光源 - 太阳光
        this.sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
        this.sunLight.position.set(50, 30, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);
        
        // 补光 - 地球反射光（模拟月球反射）
        const fillLight = new THREE.DirectionalLight(0x1a3a5c, 0.3);
        fillLight.position.set(-30, 0, -30);
        this.scene.add(fillLight);
        
        // 边缘光 - 突出大气层
        const rimLight = new THREE.DirectionalLight(0x87ceeb, 0.5);
        rimLight.position.set(0, 50, 0);
        this.scene.add(rimLight);
    }
    
    initStars() {
        // 创建更真实的星空背景
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 8000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const radius = 100 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // 星星颜色变化（蓝白、白、微黄、微红）
            const starType = Math.random();
            if (starType < 0.7) {
                // 白色
                colors[i3] = 0.9 + Math.random() * 0.1;
                colors[i3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i3 + 2] = 1.0;
            } else if (starType < 0.85) {
                // 蓝色
                colors[i3] = 0.7;
                colors[i3 + 1] = 0.8;
                colors[i3 + 2] = 1.0;
            } else if (starType < 0.95) {
                // 黄色
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.9;
                colors[i3 + 2] = 0.7;
            } else {
                // 红色
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.6;
                colors[i3 + 2] = 0.5;
            }
            
            sizes[i] = 0.5 + Math.random() * 1.5;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // 使用着色器材质实现闪烁效果
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
                    float twinkle = 0.8 + 0.2 * sin(time * 2.0 + position.x * 0.1);
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
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }
    
    async initEarth() {
        this.earthGroup = new THREE.Group();
        
        // 加载真实纹理
        try {
            await this.loadRealisticTextures();
        } catch (e) {
            console.warn('Failed to load realistic textures, using procedural fallback:', e);
            this.createProceduralTextures();
        }
        
        // 地球几何体 - 使用高细分度
        const earthGeometry = new THREE.SphereGeometry(10, 256, 256);
        
        // 地球材质 - 物理渲染
        this.earthMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.day,
            normalMap: this.textures.normal,
            normalScale: new THREE.Vector2(0.15, 0.15),
            roughnessMap: this.textures.specular,
            roughness: 0.8,
            metalness: 0.1,
            metalnessMap: this.textures.specular,
        });
        
        this.earth = new THREE.Mesh(earthGeometry, this.earthMaterial);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.earthGroup.add(this.earth);
        
        // 夜晚城市灯光层
        if (this.textures.night) {
            const nightMaterial = new THREE.MeshBasicMaterial({
                map: this.textures.night,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.8
            });
            this.nightLights = new THREE.Mesh(earthGeometry, nightMaterial);
            this.earthGroup.add(this.nightLights);
        }
        
        // 云层
        this.createClouds();
        
        // 大气层光晕
        this.createAtmosphere();
        
        this.scene.add(this.earthGroup);
    }
    
    async loadRealisticTextures() {
        const loadTexture = (url) => {
            return new Promise((resolve, reject) => {
                textureLoader.load(url, resolve, undefined, reject);
            });
        };
        
        const [day, night, normal, specular, clouds] = await Promise.all([
            loadTexture(TEXTURE_URLS.earthDay),
            loadTexture(TEXTURE_URLS.earthNight),
            loadTexture(TEXTURE_URLS.earthNormal),
            loadTexture(TEXTURE_URLS.earthSpecular),
            loadTexture(TEXTURE_URLS.clouds)
        ]);
        
        // 设置纹理参数
        [day, night, normal, specular, clouds].forEach(tex => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        });
        
        this.textures = { day, night, normal, specular, clouds };
        this.texturesLoaded = true;
        this.isRealisticMode = true;
    }
    
    createProceduralTextures() {
        // 当无法加载外部纹理时的降级方案
        this.textures = {};
        
        // 创建程序化的白天纹理
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // 绘制简化但相对真实的地球
        this.drawProceduralEarth(ctx, canvas.width, canvas.height);
        
        this.textures.day = new THREE.CanvasTexture(canvas);
        this.textures.day.colorSpace = THREE.SRGBColorSpace;
        
        // 创建法线贴图
        const normalCanvas = document.createElement('canvas');
        normalCanvas.width = 1024;
        normalCanvas.height = 512;
        const normalCtx = normalCanvas.getContext('2d');
        normalCtx.fillStyle = '#8080ff';
        normalCtx.fillRect(0, 0, 1024, 512);
        this.textures.normal = new THREE.CanvasTexture(normalCanvas);
        
        // 创建镜面贴图
        const specCanvas = document.createElement('canvas');
        specCanvas.width = 1024;
        specCanvas.height = 512;
        const specCtx = specCanvas.getContext('2d');
        specCtx.fillStyle = '#666666';
        specCtx.fillRect(0, 0, 1024, 512);
        // 海洋区域更反光
        specCtx.fillStyle = '#ffffff';
        specCtx.fillRect(0, 300, 1024, 200);
        this.textures.specular = new THREE.CanvasTexture(specCanvas);
        
        // 创建云层纹理
        this.textures.clouds = this.createProceduralClouds();
        
        this.texturesLoaded = true;
        this.isRealisticMode = false;
    }
    
    drawProceduralEarth(ctx, width, height) {
        // 海洋背景 - 使用渐变更真实的蓝色
        const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
        oceanGrad.addColorStop(0, '#1a3a5c');
        oceanGrad.addColorStop(0.3, '#0d5a9c');
        oceanGrad.addColorStop(0.5, '#0d4a8c');
        oceanGrad.addColorStop(0.7, '#0d5a9c');
        oceanGrad.addColorStop(1, '#1a3a5c');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, width, height);
        
        // 添加海洋纹理（波浪感）
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 20 + Math.random() * 80;
            const alpha = 0.02 + Math.random() * 0.04;
            
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, `rgba(100, 150, 200, ${alpha})`);
            grad.addColorStop(1, `rgba(100, 150, 200, 0)`);
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 绘制大陆 - 使用更真实的形状
        const continents = [
            { name: 'north_america', x: 0.20, y: 0.32, size: 0.18 },
            { name: 'south_america', x: 0.29, y: 0.65, size: 0.12 },
            { name: 'eurasia', x: 0.58, y: 0.28, size: 0.28 },
            { name: 'africa', x: 0.53, y: 0.55, size: 0.15 },
            { name: 'australia', x: 0.80, y: 0.70, size: 0.10 },
            { name: 'antarctica', x: 0.50, y: 0.92, size: 0.20 }
        ];
        
        continents.forEach(cont => {
            this.drawDetailedContinent(ctx, width, height, cont);
        });
    }
    
    drawDetailedContinent(ctx, width, height, cont) {
        const cx = cont.x * width;
        const cy = cont.y * height;
        const size = cont.size * Math.min(width, height);
        
        // 根据纬度调整颜色（温度带）
        const latitude = (cont.y - 0.5) * 2;
        const isTropical = Math.abs(latitude) < 0.3;
        const isTemperate = Math.abs(latitude) < 0.6;
        
        // 基础陆地色
        let baseColor, midColor, edgeColor;
        if (isTropical) {
            baseColor = '#2d5016';
            midColor = '#3a6b1a';
            edgeColor = '#4a7a25';
        } else if (isTemperate) {
            baseColor = '#4a5d23';
            midColor = '#5a7a30';
            edgeColor = '#6a8a40';
        } else {
            baseColor = '#6a5a3a';
            midColor = '#7a6a4a';
            edgeColor = '#8a7a5a';
        }
        
        // 绘制大陆主体
        const landGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
        landGrad.addColorStop(0, midColor);
        landGrad.addColorStop(0.6, midColor);
        landGrad.addColorStop(1, edgeColor);
        
        ctx.fillStyle = landGrad;
        ctx.beginPath();
        
        // 使用噪声函数创建不规则海岸线
        const points = 32;
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const noise = 0.7 + Math.sin(angle * 5) * 0.1 + Math.cos(angle * 7) * 0.08 + 
                         Math.sin(angle * 13) * 0.05 + (Math.random() - 0.5) * 0.1;
            const r = size * noise;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r * 0.8;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // 绘制山脉
        if (cont.name === 'eurasia' || cont.name === 'north_america' || cont.name === 'south_america') {
            this.drawMountainRanges(ctx, cx, cy, size);
        }
        
        // 沙漠（副热带高压带）
        if (Math.abs(Math.abs(latitude) - 0.4) < 0.15 && cont.name !== 'antarctica') {
            this.drawDesertAreas(ctx, cx, cy, size);
        }
        
        // 极地冰盖
        if (Math.abs(latitude) > 0.75 || cont.name === 'antarctica') {
            this.drawPolarIce(ctx, cx, cy, size);
        }
    }
    
    drawMountainRanges(ctx, cx, cy, size) {
        // 喜马拉雅/阿尔卑斯风格山脉
        ctx.fillStyle = 'rgba(100, 110, 100, 0.6)';
        for (let i = 0; i < 5; i++) {
            const mx = cx + (Math.random() - 0.5) * size * 0.6;
            const my = cy + (Math.random() - 0.5) * size * 0.4;
            const mw = size * (0.2 + Math.random() * 0.2);
            const mh = size * (0.1 + Math.random() * 0.1);
            
            const mtnGrad = ctx.createLinearGradient(mx - mw, my - mh, mx + mw, my + mh);
            mtnGrad.addColorStop(0, 'rgba(80, 90, 80, 0)');
            mtnGrad.addColorStop(0.3, 'rgba(100, 110, 100, 0.5)');
            mtnGrad.addColorStop(0.5, 'rgba(120, 130, 120, 0.7)');
            mtnGrad.addColorStop(0.7, 'rgba(100, 110, 100, 0.5)');
            mtnGrad.addColorStop(1, 'rgba(80, 90, 80, 0)');
            
            ctx.fillStyle = mtnGrad;
            ctx.beginPath();
            ctx.ellipse(mx, my, mw, mh, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
            
            // 雪峰
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.ellipse(mx, my - mh * 0.3, mw * 0.3, mh * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawDesertAreas(ctx, cx, cy, size) {
        ctx.fillStyle = 'rgba(194, 168, 120, 0.5)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, size * 0.4, size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 沙丘纹理
        for (let i = 0; i < 20; i++) {
            const dx = cx + (Math.random() - 0.5) * size * 0.6;
            const dy = cy + (Math.random() - 0.5) * size * 0.4;
            ctx.fillStyle = 'rgba(184, 158, 110, 0.3)';
            ctx.beginPath();
            ctx.ellipse(dx, dy, 15, 8, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawPolarIce(ctx, cx, cy, size) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.ellipse(cx, cy - size * 0.2, size * 0.7, size * 0.4, 0, 0, Math.PI, true);
        ctx.fill();
    }
    
    createProceduralClouds() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // 透明背景
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制云带
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = 30 + Math.random() * 80;
            
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createClouds() {
        const cloudGeometry = new THREE.SphereGeometry(10.15, 128, 128);
        
        // 使用透明度贴图实现云洞效果
        const cloudMaterial = new THREE.MeshPhongMaterial({
            map: this.textures.clouds,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.NormalBlending
        });
        
        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.clouds.visible = true;
        this.earthGroup.add(this.clouds);
    }
    
    createAtmosphere() {
        // 大气层光晕 - 使用着色器实现瑞利散射效果
        const atmosphereGeometry = new THREE.SphereGeometry(10.8, 128, 128);
        
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                c: { value: 0.6 },
                p: { value: 4.0 },
                glowColor: { value: new THREE.Color(0x44aaff) },
                viewVector: { value: new THREE.Vector3(0, 0, 28) }
            },
            vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(c - dot(vNormal, vNormel), p);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, intensity);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.earthGroup.add(this.atmosphere);
        
        // 内部大气层（更柔和）
        const innerAtmosphereGeometry = new THREE.SphereGeometry(10.3, 128, 128);
        const innerAtmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide
        });
        this.innerAtmosphere = new THREE.Mesh(innerAtmosphereGeometry, innerAtmosphereMaterial);
        this.earthGroup.add(this.innerAtmosphere);
    }
    
    // 年代切换时更新纹理
    updateForEra(year) {
        this.currentYear = year;
        
        // 确定年代
        let era;
        if (year > 4000) era = 'hadean';
        else if (year > 2500) era = 'archean';
        else if (year > 541) era = 'proterozoic';
        else if (year > 252) era = 'paleozoic';
        else if (year > 66) era = 'mesozoic';
        else if (year > 0) era = 'cenozoic';
        else era = 'future';
        
        const colors = ERA_COLORS[era];
        
        // 只有现代地球（cenozoic 0年）使用真实纹理
        if (era === 'cenozoic' && year <= 0) {
            this.setRealisticMode(true);
        } else {
            this.setRealisticMode(false);
            this.drawEarthTexture(colors);
        }
        
        // 更新大气层颜色
        if (this.atmosphere) {
            const glowColor = new THREE.Color(colors.atmosphere);
            this.atmosphere.material.uniforms.glowColor.value = glowColor;
            this.innerAtmosphere.material.color = glowColor;
        }
        
        // 更新云层
        if (this.clouds) {
            this.clouds.material.opacity = colors.cloudOpacity * 2;
            this.clouds.visible = colors.cloudOpacity > 0.05;
        }
        
        // 更新光照
        if (this.sunLight) {
            if (colors.hasLava) {
                this.sunLight.intensity = 1.0;
                this.sunLight.color.setHex(0xffaa66);
            } else {
                this.sunLight.intensity = 2.0;
                this.sunLight.color.setHex(0xffffff);
            }
        }
    }
    
    setRealisticMode(enabled) {
        if (enabled && this.isRealisticMode) return;
        if (!enabled && !this.isRealisticMode) return;
        
        if (enabled && this.texturesLoaded) {
            // 切换到真实纹理
            this.earthMaterial.map = this.textures.day;
            this.earthMaterial.normalMap = this.textures.normal;
            this.earthMaterial.roughnessMap = this.textures.specular;
            this.earthMaterial.metalnessMap = this.textures.specular;
            this.earthMaterial.roughness = 0.8;
            this.earthMaterial.metalness = 0.1;
            this.earthMaterial.color.setHex(0xffffff);
            
            if (this.nightLights) {
                this.nightLights.visible = true;
            }
            if (this.clouds && this.textures.clouds) {
                this.clouds.material.map = this.textures.clouds;
            }
            this.isRealisticMode = true;
        } else {
            // 切换到程序化纹理
            this.createProceduralTextures();
            this.earthMaterial.map = this.textures.day;
            this.earthMaterial.normalMap = this.textures.normal;
            this.earthMaterial.roughnessMap = this.textures.specular;
            this.earthMaterial.metalnessMap = this.textures.specular;
            
            if (this.nightLights) {
                this.nightLights.visible = false;
            }
            this.isRealisticMode = false;
        }
        
        this.earthMaterial.needsUpdate = true;
    }
    
    drawEarthTexture(colors) {
        if (this.isRealisticMode) return;
        
        const canvas = this.earthCanvas || document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        this.earthCanvas = canvas;
        const ctx = canvas.getContext('2d');
        
        if (colors.hasLava) {
            this.drawLavaSurface(ctx, canvas.width, canvas.height);
        } else {
            this.drawProceduralEarthWithColors(ctx, canvas.width, canvas.height, colors);
        }
        
        if (this.textures && this.textures.day) {
            this.textures.day.image = canvas;
            this.textures.day.needsUpdate = true;
        }
    }
    
    drawProceduralEarthWithColors(ctx, width, height, colors) {
        const oceanColor = '#' + colors.ocean.toString(16).padStart(6, '0');
        const landColor = '#' + colors.land.toString(16).padStart(6, '0');
        
        // 海洋背景
        ctx.fillStyle = oceanColor;
        ctx.fillRect(0, 0, width, height);
        
        // 简化的大陆渲染
        // ... (使用colors中的颜色)
    }
    
    drawLavaSurface(ctx, width, height) {
        const lavaBase = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
        lavaBase.addColorStop(0, '#4a2000');
        lavaBase.addColorStop(0.5, '#2a1000');
        lavaBase.addColorStop(1, '#1a0500');
        ctx.fillStyle = lavaBase;
        ctx.fillRect(0, 0, width, height);
        
        // 熔岩流动纹理
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 20 + Math.random() * 100;
            
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, 'rgba(255, 100, 0, 0.6)');
            grad.addColorStop(0.5, 'rgba(200, 50, 0, 0.3)');
            grad.addColorStop(1, 'rgba(100, 20, 0, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 12;
        this.controls.maxDistance = 80;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.3;
        
        // 限制垂直角度，避免从太下方看
        this.controls.minPolarAngle = Math.PI * 0.1;
        this.controls.maxPolarAngle = Math.PI * 0.9;
    }
    
    initEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // 鼠标交互时暂停自动旋转
        this.container.addEventListener('mousedown', () => {
            this.controls.autoRotate = false;
        });
        
        this.container.addEventListener('mouseup', () => {
            setTimeout(() => {
                this.controls.autoRotate = true;
            }, 2000);
        });
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        // 更新大气层着色器的视图向量
        if (this.atmosphere) {
            this.atmosphere.material.uniforms.viewVector.value = this.camera.position;
        }
    }
    
    addCreatureMarker(creature) {
        return { creature: creature, element: null };
    }
    
    clearMarkers() {
        this.markers = [];
    }
    
    latLonToScreen(lat, lon) {
        return { x: 0, y: 0, visible: false };
    }
    
    animate() {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        
        // 云层旋转（比地球稍快）
        if (this.clouds && this.clouds.visible) {
            this.clouds.rotation.y += 0.0003;
        }
        
        // 地球自转
        if (this.earthGroup) {
            this.earthGroup.rotation.y += 0.0001;
        }
        
        // 星星闪烁动画
        if (this.stars) {
            this.stars.material.uniforms.time.value = time;
            this.stars.rotation.y += 0.00005;
        }
        
        // 大气层光晕随视角更新
        if (this.atmosphere) {
            this.atmosphere.material.uniforms.viewVector.value = this.camera.position;
        }
        
        // 城市灯光随昼夜变化（根据太阳位置）
        if (this.nightLights && this.nightLights.visible) {
            const sunDirection = new THREE.Vector3(50, 30, 50).normalize();
            // 夜晚面朝向相机时增强亮度
            const cameraDirection = this.camera.position.clone().normalize();
            const nightVisibility = Math.max(0, -sunDirection.dot(cameraDirection));
            this.nightLights.material.opacity = 0.6 + nightVisibility * 0.4;
        }
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
