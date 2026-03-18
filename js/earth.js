// ===== 地球 3D 模型 =====
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
        this.plateBoundaries = null;
        this.markers = [];
        this.markerMeshes = [];
        this.stars = null;
        this.currentEra = null;
        
        // 地质年代大陆配置 - 模拟板块漂移
        this.plateConfigs = {
            hadean: {
                // 冥古宙 - 熔岩海洋，几乎没有固体地壳
                continents: [],
                oceanColor: '#1a0a2e',
                landColor: '#2d1810',
                atmosphere: 0xff4500,
                description: '熔岩海洋'
            },
            archean: {
                // 太古宙 - 原始大陆萌芽
                continents: [
                    { name: '原始克拉通', x: 0.3, y: 0.4, size: 0.15, shape: 'irregular' }
                ],
                oceanColor: '#0d3d3d',
                landColor: '#3d2914',
                atmosphere: 0x87ceeb,
                description: '原始大陆萌芽'
            },
            proterozoic: {
                // 元古宙 - 哥伦比亚超大陆(18-15亿年前) -> 罗迪尼亚超大陆(11-7.5亿年前)
                continents: [
                    { name: '北陆', x: 0.2, y: 0.3, size: 0.25, shape: 'round' },
                    { name: '南陆', x: 0.7, y: 0.6, size: 0.2, shape: 'round' },
                    { name: '赤道陆块', x: 0.5, y: 0.5, size: 0.15, shape: 'elongated' }
                ],
                oceanColor: '#006994',
                landColor: '#2f4f2f',
                atmosphere: 0x87ceeb,
                description: '超大陆形成'
            },
            paleozoic: {
                // 古生代 - 潘吉亚超大陆(3-1.75亿年前)
                continents: [
                    // 劳亚古陆 (北)
                    { name: '劳亚古陆', x: 0.3, y: 0.25, size: 0.35, shape: 'complex' },
                    // 冈瓦纳古陆 (南)
                    { name: '冈瓦纳', x: 0.6, y: 0.7, size: 0.4, shape: 'complex' },
                    // 一些小地块
                    { name: '华北板块', x: 0.8, y: 0.35, size: 0.08, shape: 'round' },
                    { name: '扬子板块', x: 0.75, y: 0.4, size: 0.06, shape: 'round' }
                ],
                oceanColor: '#0077be',
                landColor: '#228b22',
                atmosphere: 0x87ceeb,
                description: '潘吉亚超大陆'
            },
            mesozoic: {
                // 中生代 - 盘古大陆分裂
                continents: [
                    // 劳亚古陆开始分裂
                    { name: '北美', x: 0.15, y: 0.35, size: 0.2, shape: 'triangle' },
                    { name: '欧亚', x: 0.55, y: 0.25, size: 0.28, shape: 'complex' },
                    // 冈瓦纳开始分裂
                    { name: '南美', x: 0.25, y: 0.7, size: 0.12, shape: 'elongated' },
                    { name: '非洲', x: 0.5, y: 0.6, size: 0.18, shape: 'round' },
                    { name: '印度', x: 0.7, y: 0.55, size: 0.08, shape: 'triangle' },
                    { name: '澳洲', x: 0.85, y: 0.75, size: 0.1, shape: 'round' },
                    { name: '南极', x: 0.5, y: 0.9, size: 0.15, shape: 'round' }
                ],
                oceanColor: '#0080ff',
                landColor: '#32cd32',
                atmosphere: 0x87ceeb,
                description: '大陆开始分裂'
            },
            cenozoic: {
                // 新生代 - 现代大陆格局
                continents: [
                    { name: '北美洲', x: 0.18, y: 0.32, size: 0.18, shape: 'complex' },
                    { name: '南美洲', x: 0.28, y: 0.68, size: 0.12, shape: 'elongated' },
                    { name: '欧洲', x: 0.52, y: 0.28, size: 0.1, shape: 'round' },
                    { name: '非洲', x: 0.52, y: 0.58, size: 0.18, shape: 'round' },
                    { name: '亚洲', x: 0.72, y: 0.32, size: 0.3, shape: 'complex' },
                    { name: '澳洲', x: 0.85, y: 0.72, size: 0.1, shape: 'round' },
                    { name: '南极洲', x: 0.5, y: 0.92, size: 0.2, shape: 'round' },
                    { name: '格陵兰', x: 0.35, y: 0.15, size: 0.05, shape: 'round' },
                    { name: '印度', x: 0.68, y: 0.48, size: 0.06, shape: 'triangle' }
                ],
                oceanColor: '#0099ff',
                landColor: '#3cb371',
                atmosphere: 0x87ceeb,
                description: '现代大陆格局'
            }
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
        
        // 初始设置为冥古宙
        this.updateForEra(4600);
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
    }
    
    initCamera() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 25);
    }
    
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }
    
    initLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // 太阳光
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(50, 30, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // 背光（模拟地球反光）
        const backLight = new THREE.DirectionalLight(0x4fc3f7, 0.25);
        backLight.position.set(-50, 0, -50);
        this.scene.add(backLight);
    }
    
    initStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 3000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            const radius = 100 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            const colorType = Math.random();
            if (colorType < 0.7) {
                colors[i3] = 0.9 + Math.random() * 0.1;
                colors[i3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i3 + 2] = 1;
            } else if (colorType < 0.9) {
                colors[i3] = 1;
                colors[i3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i3 + 2] = 0.7 + Math.random() * 0.2;
            } else {
                colors[i3] = 0.7 + Math.random() * 0.2;
                colors[i3 + 1] = 0.8 + Math.random() * 0.1;
                colors[i3 + 2] = 1;
            }
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }
    
    // 生成大陆纹理
    generateContinentTexture(config) {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // 海洋背景
        ctx.fillStyle = config.oceanColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制大陆
        config.continents.forEach(continent => {
            this.drawContinent(ctx, continent, canvas.width, canvas.height, config.landColor);
        });
        
        // 添加一些噪点纹理
        this.addNoiseTexture(ctx, canvas.width, canvas.height);
        
        return canvas;
    }
    
    drawContinent(ctx, continent, width, height, color) {
        const cx = continent.x * width;
        const cy = continent.y * height;
        const size = continent.size * Math.min(width, height);
        
        ctx.fillStyle = color;
        ctx.beginPath();
        
        switch(continent.shape) {
            case 'round':
                // 不规则圆形
                for (let i = 0; i <= 360; i += 10) {
                    const angle = (i * Math.PI) / 180;
                    const radiusVar = size * (0.8 + Math.random() * 0.4);
                    const x = cx + Math.cos(angle) * radiusVar;
                    const y = cy + Math.sin(angle) * radiusVar * 0.6; // 考虑投影变形
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                break;
                
            case 'triangle':
                // 三角形（如印度板块）
                ctx.moveTo(cx, cy - size * 0.8);
                ctx.lineTo(cx - size * 0.7, cy + size * 0.5);
                ctx.lineTo(cx + size * 0.7, cy + size * 0.5);
                break;
                
            case 'elongated':
                // 长条形（如南美洲）
                ctx.ellipse(cx, cy, size * 0.4, size * 1.2, Math.random() * 0.5, 0, Math.PI * 2);
                break;
                
            case 'complex':
            default:
                // 复杂形状 - 使用多个圆组合
                const numBlobs = 3 + Math.floor(Math.random() * 3);
                for (let i = 0; i < numBlobs; i++) {
                    const angle = (i / numBlobs) * Math.PI * 2;
                    const dist = size * 0.4;
                    const bx = cx + Math.cos(angle) * dist;
                    const by = cy + Math.sin(angle) * dist * 0.6;
                    const blobSize = size * (0.5 + Math.random() * 0.3);
                    ctx.moveTo(bx + blobSize, by);
                    ctx.arc(bx, by, blobSize, 0, Math.PI * 2);
                }
                break;
        }
        
        ctx.closePath();
        ctx.fill();
        
        // 添加海岸线细节
        ctx.strokeStyle = this.darkenColor(color, 20);
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 添加内部纹理（河流/山脉）
        ctx.fillStyle = this.darkenColor(color, 10);
        for (let i = 0; i < 5; i++) {
            const rx = cx + (Math.random() - 0.5) * size;
            const ry = cy + (Math.random() - 0.5) * size * 0.6;
            const rs = size * 0.1 * Math.random();
            ctx.beginPath();
            ctx.arc(rx, ry, rs, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 添加噪点纹理
    addNoiseTexture(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 15;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // 颜色加深辅助函数
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x00FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    async initEarth() {
        const earthGroup = new THREE.Group();
        
        // 地球本体
        const earthGeometry = new THREE.SphereGeometry(10, 128, 128);
        
        // 创建基础材质
        this.earthMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0x333333,
            shininess: 25
        });
        
        this.earth = new THREE.Mesh(earthGeometry, this.earthMaterial);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        earthGroup.add(this.earth);
        
        // 大气层
        const atmosphereGeometry = new THREE.SphereGeometry(10.4, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.12,
            side: THREE.BackSide
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        earthGroup.add(this.atmosphere);
        
        // 云层
        const cloudGeometry = new THREE.SphereGeometry(10.15, 64, 64);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide
        });
        
        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        earthGroup.add(this.clouds);
        
        this.scene.add(earthGroup);
        this.earthGroup = earthGroup;
    }
    
    // 更新板块边界发光效果
    updatePlateBoundaries(config) {
        if (this.plateBoundaries) {
            this.earthGroup.remove(this.plateBoundaries);
            this.plateBoundaries = null;
        }
        
        if (config.continents.length === 0) return;
        
        // 创建板块边界发光效果
        const boundaryGeometry = new THREE.SphereGeometry(10.05, 64, 64);
        
        // 创建发光纹理
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // 透明背景
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 在板块边缘绘制发光线条
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
        ctx.lineWidth = 4;
        ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
        ctx.shadowBlur = 10;
        
        config.continents.forEach(continent => {
            const cx = continent.x * canvas.width;
            const cy = continent.y * canvas.height;
            const size = continent.size * Math.min(canvas.width, canvas.height) * 0.5;
            
            ctx.beginPath();
            ctx.arc(cx, cy, size, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        const boundaryTexture = new THREE.CanvasTexture(canvas);
        const boundaryMaterial = new THREE.MeshBasicMaterial({
            map: boundaryTexture,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        
        this.plateBoundaries = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
        this.earthGroup.add(this.plateBoundaries);
    }
    
    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 15;
        this.controls.maxDistance = 50;
        this.controls.enablePan = false;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.3;
    }
    
    initEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    updateForEra(year) {
        let config;
        let eraName;
        
        if (year > 4000) {
            config = this.plateConfigs.hadean;
            eraName = 'hadean';
        } else if (year > 2500) {
            config = this.plateConfigs.archean;
            eraName = 'archean';
        } else if (year > 541) {
            config = this.plateConfigs.proterozoic;
            eraName = 'proterozoic';
        } else if (year > 252) {
            config = this.plateConfigs.paleozoic;
            eraName = 'paleozoic';
        } else if (year > 66) {
            config = this.plateConfigs.mesozoic;
            eraName = 'mesozoic';
        } else {
            config = this.plateConfigs.cenozoic;
            eraName = 'cenozoic';
        }
        
        this.currentEra = eraName;
        
        // 生成新纹理
        const textureCanvas = this.generateContinentTexture(config);
        const texture = new THREE.CanvasTexture(textureCanvas);
        texture.needsUpdate = true;
        
        this.earthMaterial.map = texture;
        this.earthMaterial.needsUpdate = true;
        
        // 更新大气颜色
        this.atmosphere.material.color.setHex(config.atmosphere);
        
        // 更新板块边界
        this.updatePlateBoundaries(config);
        
        return config.description;
    }
    
    addCreatureMarker(creature) {
        // 将经纬度转换为3D坐标
        const phi = (90 - creature.lat) * (Math.PI / 180);
        const theta = (creature.lon + 180) * (Math.PI / 180);
        
        const radius = 10.5;
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));
        
        // 创建标记组
        const markerGroup = new THREE.Group();
        markerGroup.position.set(x, y, z);
        
        // 创建发光环
        const ringGeometry = new THREE.RingGeometry(0.25, 0.4, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: creature.color || 0x4fc3f7,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.lookAt(0, 0, 0);
        markerGroup.add(ring);
        
        // 创建中心点
        const dotGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: creature.color || 0x4fc3f7,
            emissive: creature.color || 0x4fc3f7,
            emissiveIntensity: 0.5
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        markerGroup.add(dot);
        
        // 创建脉冲环动画
        const pulseRingGeometry = new THREE.RingGeometry(0.4, 0.55, 32);
        const pulseRingMaterial = new THREE.MeshBasicMaterial({
            color: creature.color || 0x4fc3f7,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const pulseRing = new THREE.Mesh(pulseRingGeometry, pulseRingMaterial);
        pulseRing.lookAt(0, 0, 0);
        pulseRing.userData = { isPulse: true, originalScale: 1, phase: Math.random() * Math.PI * 2 };
        markerGroup.add(pulseRing);
        
        this.earthGroup.add(markerGroup);
        
        // 创建HTML标签
        const label = document.createElement('div');
        label.className = 'creature-marker';
        label.innerHTML = `
            <div class="marker-ring">
                <span class="marker-icon">${creature.icon}</span>
            </div>
            <div class="marker-label">${creature.name}</div>
        `;
        label.style.cssText = `
            position: absolute;
            transform: translate(-50%, -50%);
            cursor: pointer;
            z-index: 50;
            pointer-events: auto;
        `;
        
        // 保存标记引用
        const markerObj = {
            mesh: markerGroup,
            element: label,
            creature: creature,
            screenPosition: new THREE.Vector3()
        };
        
        this.markers.push(markerObj);
        this.markerMeshes.push(markerGroup);
        document.getElementById('app').appendChild(label);
        
        return markerObj;
    }
    
    clearMarkers() {
        // 移除3D标记
        this.markerMeshes.forEach(mesh => {
            this.earthGroup.remove(mesh);
        });
        this.markerMeshes = [];
        
        // 移除HTML标签
        this.markers.forEach(marker => {
            if (marker.element && marker.element.parentNode) {
                marker.element.parentNode.removeChild(marker.element);
            }
        });
        this.markers = [];
    }
    
    updateMarkerPositions() {
        this.markers.forEach(marker => {
            // 获取标记在屏幕上的位置
            const position = marker.mesh.position.clone();
            position.applyMatrix4(this.earthGroup.matrixWorld);
            position.project(this.camera);
            
            const x = (position.x * 0.5 + 0.5) * this.container.clientWidth;
            const y = (-position.y * 0.5 + 0.5) * this.container.clientHeight;
            
            // 检查是否在地球背面
            if (position.z < 1) {
                marker.element.style.display = 'block';
                marker.element.style.left = x + 'px';
                marker.element.style.top = y + 'px';
                
                // 根据距离调整大小
                const distance = this.camera.position.distanceTo(marker.mesh.position);
                const scale = Math.max(0.5, 1 - (distance - 15) / 35);
                marker.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
                marker.element.style.opacity = '1';
            } else {
                marker.element.style.display = 'none';
            }
        });
    }
    
    animate() {
        // 旋转云层
        if (this.clouds) {
            this.clouds.rotation.y += 0.0003;
        }
        
        // 旋转星星
        if (this.stars) {
            this.stars.rotation.y += 0.0001;
        }
        
        // 标记脉冲动画
        const time = Date.now() * 0.001;
        this.markerMeshes.forEach(group => {
            group.children.forEach(child => {
                if (child.userData.isPulse) {
                    const phase = child.userData.phase || 0;
                    const scale = 1 + Math.sin(time * 2 + phase) * 0.25;
                    child.scale.set(scale, scale, scale);
                    child.material.opacity = 0.5 - (scale - 1) * 0.8;
                }
            });
        });
        
        // 更新标记位置
        this.updateMarkerPositions();
        
        // 更新控制器
        if (this.controls) {
            this.controls.update();
        }
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }
}
