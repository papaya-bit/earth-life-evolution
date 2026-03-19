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
        
        // ===== 1. 绘制海洋（带深度渐变）=====
        this.drawOcean(ctx, width, height, colors);
        
        // ===== 2. 绘制大陆（带温度带和地形）=====
        if (!colors.hasLava) {
            this.drawContinentsWithDetail(ctx, width, height, colors);
        } else {
            this.drawLavaSurface(ctx, width, height);
        }
        
        // ===== 3. 添加全局纹理细节 =====
        this.addGlobalTexture(ctx, width, height, colors);
        
        // 更新纹理
        this.earthTexture.needsUpdate = true;
    }
    
    drawOcean(ctx, width, height, colors) {
        const oceanColor = '#' + colors.ocean.toString(16).padStart(6, '0');
        
        // 基础海洋色
        ctx.fillStyle = oceanColor;
        ctx.fillRect(0, 0, width, height);
        
        // 添加海洋深度变化（浅海到深海）
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 30 + Math.random() * 100;
            
            // 深海区域更暗
            const depth = Math.random();
            const alpha = 0.02 + depth * 0.05;
            
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, `rgba(0, 30, 60, ${alpha})`);
            grad.addColorStop(1, `rgba(0, 30, 60, 0)`);
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 海底山脉（海岭）
        ctx.strokeStyle = 'rgba(100, 120, 140, 0.1)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            let x = Math.random() * width;
            let y = Math.random() * height;
            ctx.moveTo(x, y);
            
            for (let j = 0; j < 10; j++) {
                x += (Math.random() - 0.5) * 200;
                y += (Math.random() - 0.5) * 100;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    
    drawContinentsWithDetail(ctx, width, height, colors) {
        const baseLandColor = colors.land;
        
        // 大陆数据（简化版世界地图）
        const continents = [
            // 北美
            { 
                x: 0.18, y: 0.28, w: 0.22, h: 0.28, 
                mountains: [{x: 0.15, y: 0.35, h: 0.8}, {x: -0.1, y: 0.15, h: 0.5}],
                shape: 'irregular'
            },
            // 南美  
            { 
                x: 0.28, y: 0.62, w: 0.12, h: 0.25,
                mountains: [{x: -0.05, y: -0.1, h: 0.9}],
                shape: 'triangle'
            },
            // 欧亚
            { 
                x: 0.55, y: 0.30, w: 0.28, h: 0.22,
                mountains: [{x: 0.1, y: 0.05, h: 1.0}, {x: -0.15, y: 0.1, h: 0.7}],
                shape: 'complex'
            },
            // 非洲
            { 
                x: 0.52, y: 0.55, w: 0.14, h: 0.22,
                mountains: [{x: 0, y: -0.15, h: 0.6}],
                shape: 'oval'
            },
            // 澳洲
            { 
                x: 0.78, y: 0.68, w: 0.10, h: 0.08,
                mountains: [{x: -0.02, y: -0.02, h: 0.4}],
                shape: 'oval'
            },
            // 南极
            {
                x: 0.5, y: 0.92, w: 0.4, h: 0.12,
                mountains: [],
                shape: 'cap',
                isPolar: true
            }
        ];
        
        continents.forEach(cont => {
            const cx = cont.x * width;
            const cy = cont.y * height;
            const cw = cont.w * width;
            const ch = cont.h * height;
            
            // 创建大陆的渐变填充
            const landGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(cw, ch) * 0.7);
            
            // 根据纬度调整颜色（温度带）
            const latitude = (cont.y - 0.5) * 2; // -1 到 1
            const tempFactor = 1 - Math.abs(latitude) * 0.3; // 赤道更绿，极地更黄/白
            
            // 基础陆地色
            const r = ((baseLandColor >> 16) & 0xff) * tempFactor;
            const g = ((baseLandColor >> 8) & 0xff) * (0.8 + tempFactor * 0.2);
            const b = (baseLandColor & 0xff) * (0.7 + tempFactor * 0.3);
            
            const midColor = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
            const edgeColor = `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.75)}, ${Math.floor(b * 0.8)})`;
            
            landGrad.addColorStop(0, midColor);
            landGrad.addColorStop(0.7, midColor);
            landGrad.addColorStop(1, edgeColor);
            
            // 绘制大陆形状
            ctx.fillStyle = landGrad;
            ctx.beginPath();
            this.drawContinentShape(ctx, cx, cy, cw, ch, cont.shape);
            ctx.fill();
            
            // 绘制海岸线效果
            ctx.strokeStyle = `rgba(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 0.7)}, 0.6)`;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // 绘制山脉
            cont.mountains.forEach(mtn => {
                const mx = cx + mtn.x * cw;
                const my = cy + mtn.y * ch;
                const mh = mtn.h;
                
                this.drawMountainRange(ctx, mx, my, cw * 0.4, ch * 0.15, mh);
            });
            
            // 极地冰盖
            if (cont.isPolar || Math.abs(latitude) > 0.7) {
                this.drawIceCap(ctx, cx, cy, cw * 0.6, ch * 0.3);
            }
            
            // 沙漠（副热带高压带，纬度约30度）
            if (Math.abs(Math.abs(latitude) - 0.5) < 0.15) {
                this.drawDesert(ctx, cx, cy * 0.9, cw * 0.7, ch * 0.3);
            }
        });
    }
    
    drawContinentShape(ctx, cx, cy, w, h, shape) {
        if (shape === 'triangle') {
            // 三角形（南美）
            ctx.moveTo(cx, cy - h * 0.4);
            ctx.quadraticCurveTo(cx + w * 0.6, cy, cx + w * 0.3, cy + h * 0.5);
            ctx.quadraticCurveTo(cx, cy + h * 0.4, cx - w * 0.3, cy + h * 0.5);
            ctx.quadraticCurveTo(cx - w * 0.6, cy, cx, cy - h * 0.4);
        } else if (shape === 'cap') {
            // 帽形（南极）
            ctx.ellipse(cx, cy, w * 0.9, h * 0.8, 0, 0, Math.PI, false);
            ctx.lineTo(cx - w * 0.9, cy);
        } else {
            // 不规则椭圆
            const points = 16;
            for (let i = 0; i <= points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const varW = 0.7 + Math.sin(angle * 3) * 0.15 + Math.cos(angle * 5) * 0.1;
                const varH = 0.75 + Math.cos(angle * 4) * 0.15 + Math.sin(angle * 6) * 0.1;
                
                const x = cx + Math.cos(angle) * w * 0.5 * varW;
                const y = cy + Math.sin(angle) * h * 0.5 * varH;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
    }
    
    drawMountainRange(ctx, x, y, w, h, height) {
        // 山脉阴影
        const grad = ctx.createLinearGradient(x - w/2, y - h, x + w/2, y + h);
        const shade = Math.floor(100 * height);
        grad.addColorStop(0, `rgba(${shade}, ${shade + 20}, ${shade + 10}, 0)`);
        grad.addColorStop(0.3, `rgba(${shade}, ${shade + 20}, ${shade + 10}, 0.4)`);
        grad.addColorStop(0.5, `rgba(${shade + 40}, ${shade + 50}, ${shade + 45}, 0.6)`);
        grad.addColorStop(0.7, `rgba(${shade}, ${shade + 20}, ${shade + 10}, 0.4)`);
        grad.addColorStop(1, `rgba(${shade}, ${shade + 20}, ${shade + 10}, 0)`);
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 雪峰
        if (height > 0.7) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.ellipse(x, y - h * 0.2, w * 0.4, h * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawIceCap(ctx, x, y, w, h) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(x, y - h * 0.3, w * 0.8, h * 0.6, 0, 0, Math.PI, true);
        ctx.fill();
        
        // 冰盖纹理
        ctx.fillStyle = 'rgba(240, 248, 255, 0.3)';
        for (let i = 0; i < 20; i++) {
            const ix = x + (Math.random() - 0.5) * w;
            const iy = y - Math.random() * h;
            ctx.beginPath();
            ctx.arc(ix, iy, 5 + Math.random() * 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawDesert(ctx, x, y, w, h) {
        ctx.fillStyle = 'rgba(194, 178, 128, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x, y, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawLavaSurface(ctx, width, height) {
        // 熔岩表面
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
        
        // 裂缝
        ctx.strokeStyle = 'rgba(255, 80, 0, 0.4)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            let x = Math.random() * width;
            let y = Math.random() * height;
            ctx.moveTo(x, y);
            
            for (let j = 0; j < 5; j++) {
                x += (Math.random() - 0.5) * 150;
                y += (Math.random() - 0.5) * 150;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    
    addGlobalTexture(ctx, width, height, colors) {
        // 添加细微的噪点纹理让表面更有质感
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 16) { // 每4个像素处理一次，降低性能消耗
            const noise = (Math.random() - 0.5) * 8;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        
        ctx.putImageData(imageData, 0, 0);
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
