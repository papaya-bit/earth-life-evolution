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
        this.markers = [];
        this.markerMeshes = [];
        this.stars = null;
        this.currentEra = null;
        
        // 地质年代颜色配置
        this.eraConfigs = {
            hadean: {      // 冥古宙 46-40亿年前
                ocean: 0x1a0a2e,
                land: 0x2d1810,
                atmosphere: 0xff4500,
                cloudOpacity: 0.8
            },
            archean: {     // 太古宙 40-25亿年前
                ocean: 0x0d4f4f,
                land: 0x3d2914,
                atmosphere: 0x87ceeb,
                cloudOpacity: 0.6
            },
            proterozoic: { // 元古宙 25-5.41亿年前
                ocean: 0x006994,
                land: 0x2f4f2f,
                atmosphere: 0x87ceeb,
                cloudOpacity: 0.5
            },
            paleozoic: {   // 古生代 5.41-2.52亿年前
                ocean: 0x0077be,
                land: 0x228b22,
                atmosphere: 0x87ceeb,
                cloudOpacity: 0.4
            },
            mesozoic: {    // 中生代 2.52-6600万年前
                ocean: 0x0080ff,
                land: 0x32cd32,
                atmosphere: 0x87ceeb,
                cloudOpacity: 0.3
            },
            cenozoic: {    // 新生代 6600万年前-现在
                ocean: 0x0099ff,
                land: 0x3cb371,
                atmosphere: 0x87ceeb,
                cloudOpacity: 0.25
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
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // 太阳光
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(50, 30, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // 背光（模拟地球反光）
        const backLight = new THREE.DirectionalLight(0x4fc3f7, 0.3);
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
            
            // 随机位置（球形分布）
            const radius = 100 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // 星星颜色（蓝白黄）
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
    
    async initEarth() {
        const earthGroup = new THREE.Group();
        
        // 地球本体
        const earthGeometry = new THREE.SphereGeometry(10, 64, 64);
        
        // 创建地球材质（程序生成纹理）
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x2233ff,
            emissive: 0x112244,
            specular: 0x111111,
            shininess: 10
        });
        
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        earthGroup.add(this.earth);
        
        // 大气层
        const atmosphereGeometry = new THREE.SphereGeometry(10.3, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        earthGroup.add(this.atmosphere);
        
        // 云层
        const cloudGeometry = new THREE.SphereGeometry(10.1, 64, 64);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        earthGroup.add(this.clouds);
        
        this.scene.add(earthGroup);
        this.earthGroup = earthGroup;
        
        // 保存材质引用以便后续更新
        this.earthMaterial = earthMaterial;
        this.atmosphereMaterial = atmosphereMaterial;
        this.cloudMaterial = cloudMaterial;
    }
    
    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 15;
        this.controls.maxDistance = 50;
        this.controls.enablePan = false;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
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
        
        if (year > 4000) {
            config = this.eraConfigs.hadean;
            this.currentEra = 'hadean';
        } else if (year > 2500) {
            config = this.eraConfigs.archean;
            this.currentEra = 'archean';
        } else if (year > 541) {
            config = this.eraConfigs.proterozoic;
            this.currentEra = 'proterozoic';
        } else if (year > 252) {
            config = this.eraConfigs.paleozoic;
            this.currentEra = 'paleozoic';
        } else if (year > 66) {
            config = this.eraConfigs.mesozoic;
            this.currentEra = 'mesozoic';
        } else {
            config = this.eraConfigs.cenozoic;
            this.currentEra = 'cenozoic';
        }
        
        // 更新地球颜色
        this.earthMaterial.color.setHex(config.ocean);
        this.earthMaterial.emissive.setHex(config.land);
        
        // 更新大气颜色
        this.atmosphereMaterial.color.setHex(config.atmosphere);
        
        // 更新云层
        this.cloudMaterial.opacity = config.cloudOpacity;
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
        const ringGeometry = new THREE.RingGeometry(0.3, 0.5, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: creature.color || 0x4fc3f7,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.lookAt(0, 0, 0);
        markerGroup.add(ring);
        
        // 创建中心点
        const dotGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: creature.color || 0x4fc3f7
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        markerGroup.add(dot);
        
        // 创建脉冲环动画
        const pulseRingGeometry = new THREE.RingGeometry(0.5, 0.6, 32);
        const pulseRingMaterial = new THREE.MeshBasicMaterial({
            color: creature.color || 0x4fc3f7,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const pulseRing = new THREE.Mesh(pulseRingGeometry, pulseRingMaterial);
        pulseRing.lookAt(0, 0, 0);
        pulseRing.userData = { isPulse: true, originalScale: 1 };
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
            const distance = marker.mesh.position.distanceTo(this.camera.position);
            const earthDistance = 25; // 相机到地球中心的距离
            
            if (position.z < 1) {
                marker.element.style.display = 'block';
                marker.element.style.left = x + 'px';
                marker.element.style.top = y + 'px';
                
                // 根据距离调整大小
                const scale = Math.max(0.5, 1 - (distance - 15) / 35);
                marker.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
            } else {
                marker.element.style.display = 'none';
            }
        });
    }
    
    animate() {
        // 旋转云层
        if (this.clouds) {
            this.clouds.rotation.y += 0.0005;
        }
        
        // 旋转星星
        if (this.stars) {
            this.stars.rotation.y += 0.0001;
        }
        
        // 标记脉冲动画
        this.markerMeshes.forEach(group => {
            group.children.forEach(child => {
                if (child.userData.isPulse) {
                    const time = Date.now() * 0.002;
                    const scale = 1 + Math.sin(time) * 0.3;
                    child.scale.set(scale, scale, scale);
                    child.material.opacity = 0.4 - (scale - 1) * 0.3;
                }
            });
            
            // 让标记始终面向相机
            group.lookAt(this.camera.position);
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
