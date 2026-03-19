// ===== 地球 3D 模型 - 修复版 =====
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
        this.markers = [];
        this.stars = null;
        this.currentYear = 4600;
        this.clock = new THREE.Clock();
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
        
        // 初始设置为现代地球
        this.updateForEra(0);
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050508);
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
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
    }
    
    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.sunLight.position.set(50, 30, 50);
        this.sunLight.castShadow = true;
        this.scene.add(this.sunLight);
        
        const fillLight = new THREE.DirectionalLight(0x88ccff, 0.4);
        fillLight.position.set(-30, 0, -30);
        this.scene.add(fillLight);
    }
    
    initStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 3000;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const radius = 80 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 0.5,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }
    
    async initEarth() {
        this.earthGroup = new THREE.Group();
        
        // 创建地球纹理
        this.earthMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.8,
            metalness: 0.1
        });
        
        // 地球几何体
        const earthGeometry = new THREE.SphereGeometry(10, 128, 128);
        this.earth = new THREE.Mesh(earthGeometry, this.earthMaterial);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.earthGroup.add(this.earth);
        
        // 大气层
        const atmosphereGeometry = new THREE.SphereGeometry(10.5, 64, 64);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.earthGroup.add(this.atmosphere);
        
        // 云层
        const cloudGeometry = new THREE.SphereGeometry(10.2, 64, 64);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.clouds.visible = true;
        this.earthGroup.add(this.clouds);
        
        // 为地球创建纹理
        this.generateEarthTexture();
        
        this.scene.add(this.earthGroup);
    }
    
    generateEarthTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        this.earthCanvas = canvas;
        this.earthContext = canvas.getContext('2d');
        
        // 创建纹理
        this.earthTexture = new THREE.CanvasTexture(canvas);
        this.earthMaterial.map = this.earthTexture;
        this.earthMaterial.needsUpdate = true;
    }
    
    drawEarthTexture(colors) {
        const ctx = this.earthContext;
        const width = this.earthCanvas.width;
        const height = this.earthCanvas.height;
        
        // 清空
        ctx.clearRect(0, 0, width, height);
        
        // 海洋背景
        const oceanColor = '#' + colors.ocean.toString(16).padStart(6, '0');
        ctx.fillStyle = oceanColor;
        ctx.fillRect(0, 0, width, height);
        
        // 如果不是熔岩时代，绘制大陆
        if (!colors.hasLava) {
            const landColor = '#' + colors.land.toString(16).padStart(6, '0');
            ctx.fillStyle = landColor;
            
            // 绘制简化的大陆
            const continents = [
                { x: 0.2, y: 0.3, w: 0.2, h: 0.25 }, // 北美
                { x: 0.28, y: 0.6, w: 0.12, h: 0.2 }, // 南美
                { x: 0.48, y: 0.35, w: 0.22, h: 0.25 }, // 欧亚
                { x: 0.52, y: 0.55, w: 0.1, h: 0.18 }, // 非洲
                { x: 0.75, y: 0.65, w: 0.12, h: 0.1 }, // 澳洲
            ];
            
            continents.forEach(cont => {
                ctx.beginPath();
                ctx.ellipse(
                    cont.x * width, 
                    cont.y * height, 
                    cont.w * width * 0.5, 
                    cont.h * height * 0.5, 
                    0, 0, Math.PI * 2
                );
                ctx.fill();
            });
        } else {
            // 熔岩效果 - 绘制一些红色斑点
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = 20 + Math.random() * 80;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${0.3 + Math.random() * 0.4})`;
                ctx.fill();
            }
        }
        
        // 更新纹理
        this.earthTexture.needsUpdate = true;
    }
    
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
        
        // 更新地球纹理
        this.drawEarthTexture(colors);
        
        // 更新材质颜色
        this.earthMaterial.color.setHex(colors.hasLava ? 0xff4500 : 0xffffff);
        
        // 更新大气层
        if (this.atmosphere) {
            this.atmosphere.material.color.setHex(colors.atmosphere);
            this.atmosphere.material.opacity = colors.hasLava ? 0.3 : 0.15;
        }
        
        // 更新云层
        if (this.clouds) {
            this.clouds.material.opacity = colors.cloudOpacity;
            this.clouds.visible = colors.cloudOpacity > 0.05;
        }
        
        // 更新光照
        if (this.sunLight) {
            if (colors.hasLava) {
                this.sunLight.intensity = 0.8;
                this.sunLight.color.setHex(0xffaa66);
            } else {
                this.sunLight.intensity = 1.5;
                this.sunLight.color.setHex(0xffffff);
            }
        }
    }
    
    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 15;
        this.controls.maxDistance = 60;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
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
        return { creature: creature, element: null };
    }
    
    clearMarkers() {
        this.markers = [];
    }
    
    latLonToScreen(lat, lon) {
        // 简化的坐标转换
        return { x: 0, y: 0, visible: false };
    }
    
    animate() {
        const delta = this.clock.getDelta();
        
        // 云层旋转
        if (this.clouds && this.clouds.visible) {
            this.clouds.rotation.y += 0.0005;
        }
        
        // 地球自转
        if (this.earthGroup) {
            this.earthGroup.rotation.y += 0.0002;
        }
        
        // 星星闪烁
        if (this.stars) {
            this.stars.rotation.y += 0.0001;
        }
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
