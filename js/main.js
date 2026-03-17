// ===== 地球生命演化史 - 主入口 =====
import { Earth } from './earth.js';
import { Timeline } from './timeline.js';
import { CreatureData } from './creatures.js';
import { EventData } from './events.js';

class LifeOnEarthApp {
    constructor() {
        this.earth = null;
        this.timeline = null;
        this.creatureData = new CreatureData();
        this.eventData = new EventData();
        this.isPlaying = false;
        this.animationSpeed = 3;
        this.currentYear = 4600; // 百万年前
        this.creatureMarkers = [];
        
        this.init();
    }
    
    async init() {
        this.showLoading();
        
        try {
            // 初始化 3D 地球
            this.earth = new Earth('canvas-container');
            await this.earth.init();
            
            // 初始化时间轴
            this.timeline = new Timeline();
            
            // 绑定事件
            this.bindEvents();
            
            // 初始渲染
            this.updateScene(this.currentYear);
            
            // 隐藏加载画面
            this.hideLoading();
            
            // 开始渲染循环
            this.animate();
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('初始化失败，请刷新页面重试');
        }
    }
    
    showLoading() {
        const loading = document.getElementById('loading');
        const progress = document.querySelector('.loading-progress');
        const text = document.getElementById('loading-text');
        
        const steps = [
            { text: '初始化 3D 引擎', progress: 20 },
            { text: '加载地球纹理', progress: 40 },
            { text: '构建生物数据库', progress: 60 },
            { text: '准备时间轴数据', progress: 80 },
            { text: '即将完成...', progress: 100 }
        ];
        
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex >= steps.length) {
                clearInterval(interval);
                return;
            }
            text.textContent = steps[stepIndex].text;
            progress.style.width = steps[stepIndex].progress + '%';
            stepIndex++;
        }, 300);
    }
    
    hideLoading() {
        const loading = document.getElementById('loading');
        loading.classList.add('hidden');
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }
    
    showError(message) {
        const loading = document.getElementById('loading');
        loading.innerHTML = `
            <div class="loading-content">
                <div style="font-size: 3rem; margin-bottom: 20px;">😞</div>
                <h2>出错了</h2>
                <p>${message}</p>
                <button onclick="location.reload()" 
                    style="padding: 12px 30px; background: var(--primary); 
                           border: none; border-radius: 8px; color: white; 
                           cursor: pointer; font-size: 1rem; margin-top: 20px;">
                    刷新页面
                </button>
            </div>
        `;
    }
    
    bindEvents() {
        // 播放/暂停按钮
        document.getElementById('play-btn').addEventListener('click', () => this.play());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        
        // 速度滑块
        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            document.getElementById('speed-value').textContent = this.animationSpeed + 'x';
        });
        
        // 时间轴滑块
        const timelineSlider = document.getElementById('timeline-slider');
        timelineSlider.addEventListener('input', (e) => {
            this.currentYear = parseInt(e.target.value);
            this.updateScene(this.currentYear);
        });
        
        // 时间标记点击
        document.querySelectorAll('.mark').forEach(mark => {
            mark.addEventListener('click', () => {
                const year = parseInt(mark.dataset.year);
                this.currentYear = year;
                document.getElementById('timeline-slider').value = year;
                this.updateScene(year);
            });
        });
        
        // 关闭弹窗
        document.querySelector('.close-btn').addEventListener('click', () => {
            document.getElementById('creature-modal').classList.remove('active');
        });
        
        document.getElementById('creature-modal').addEventListener('click', (e) => {
            if (e.target.id === 'creature-modal') {
                document.getElementById('creature-modal').classList.remove('active');
            }
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.isPlaying ? this.pause() : this.play();
            }
        });
    }
    
    play() {
        this.isPlaying = true;
        document.getElementById('play-btn').style.display = 'none';
        document.getElementById('pause-btn').style.display = 'flex';
    }
    
    pause() {
        this.isPlaying = false;
        document.getElementById('play-btn').style.display = 'flex';
        document.getElementById('pause-btn').style.display = 'none';
    }
    
    updateScene(year) {
        // 更新时间显示
        this.updateTimeDisplay(year);
        
        // 更新事件指示器
        this.updateEventIndicator(year);
        
        // 更新生物标记
        this.updateCreatureMarkers(year);
        
        // 更新地球外观（根据地质年代）
        if (this.earth) {
            this.earth.updateForEra(year);
        }
        
        // 更新时间轴标记高亮
        this.updateTimelineHighlight(year);
    }
    
    updateTimeDisplay(year) {
        const yearDisplay = document.getElementById('current-year');
        const eraDisplay = document.getElementById('current-era');
        
        if (year >= 1000) {
            yearDisplay.textContent = (year / 1000).toFixed(1) + '亿年前';
        } else if (year >= 1) {
            yearDisplay.textContent = Math.round(year) + '百万年前';
        } else {
            yearDisplay.textContent = '现在';
        }
        
        const era = this.timeline.getEra(year);
        eraDisplay.textContent = era.name;
    }
    
    updateEventIndicator(year) {
        const event = this.eventData.getEventAtYear(year);
        const indicator = document.getElementById('current-event');
        
        if (event) {
            indicator.querySelector('.event-icon').textContent = event.icon;
            indicator.querySelector('.event-text').textContent = event.name + ' - ' + event.description;
            indicator.querySelector('.event-text').classList.add('highlight');
            setTimeout(() => {
                indicator.querySelector('.event-text').classList.remove('highlight');
            }, 2000);
        } else {
            indicator.querySelector('.event-icon').textContent = '🌍';
            indicator.querySelector('.event-text').textContent = this.getEraDescription(year);
        }
    }
    
    getEraDescription(year) {
        if (year > 4000) return '地球形成初期 - 熔岩海洋';
        if (year > 2500) return '太古宙 - 最早的生命出现';
        if (year > 541) return '元古宙 - 复杂细胞演化';
        if (year > 485) return '寒武纪 - 生命大爆发';
        if (year > 444) return '奥陶纪 - 海洋生物繁盛';
        if (year > 419) return '志留纪 - 植物登陆';
        if (year > 359) return '泥盆纪 - 鱼类时代';
        if (year > 299) return '石炭纪 - 森林覆盖';
        if (year > 252) return '二叠纪 - 盘古大陆';
        if (year > 201) return '三叠纪 - 恐龙出现';
        if (year > 145) return '侏罗纪 - 恐龙统治';
        if (year > 66) return '白垩纪 - 开花植物';
        if (year > 23) return '古近纪 - 哺乳动物兴起';
        if (year > 0) return '新近纪 - 草原扩张';
        return '第四纪 - 人类时代';
    }
    
    updateCreatureMarkers(year) {
        // 清除旧标记
        this.clearCreatureMarkers();
        
        // 获取当前年代的生物
        const creatures = this.creatureData.getCreaturesAtYear(year);
        
        // 在地球上创建标记
        creatures.forEach(creature => {
            const marker = this.earth.addCreatureMarker(creature);
            if (marker) {
                marker.element.addEventListener('click', () => {
                    this.showCreatureDetail(creature);
                });
                this.creatureMarkers.push(marker);
            }
        });
    }
    
    clearCreatureMarkers() {
        this.creatureMarkers.forEach(marker => {
            if (marker.element && marker.element.parentNode) {
                marker.element.parentNode.removeChild(marker.element);
            }
        });
        this.creatureMarkers = [];
        this.earth.clearMarkers();
    }
    
    updateTimelineHighlight(year) {
        document.querySelectorAll('.mark').forEach(mark => {
            const markYear = parseInt(mark.dataset.year);
            const prevYear = mark.previousElementSibling ? 
                parseInt(mark.previousElementSibling.dataset.year) : 4600;
            
            if (year <= prevYear && year >= markYear) {
                mark.classList.add('active');
            } else {
                mark.classList.remove('active');
            }
        });
    }
    
    showCreatureDetail(creature) {
        const modal = document.getElementById('creature-modal');
        
        document.getElementById('creature-name').textContent = creature.name;
        document.getElementById('creature-period').textContent = creature.period;
        document.getElementById('creature-size').textContent = creature.size;
        document.getElementById('creature-desc').textContent = creature.description;
        document.getElementById('creature-diet').textContent = creature.diet;
        document.getElementById('creature-habitat').textContent = creature.habitat;
        document.getElementById('creature-status').textContent = creature.status;
        
        modal.classList.add('active');
        
        // 初始化生物3D预览
        this.initCreaturePreview(creature);
    }
    
    initCreaturePreview(creature) {
        // 这里可以加载生物的3D模型
        // 为简化，先用 Canvas 绘制一个示意图
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        // 背景
        const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 200);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0d1b2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);
        
        // 根据生物类型绘制不同图案
        this.drawCreatureIcon(ctx, creature, 200, 200);
        
        const container = document.getElementById('creature-canvas');
        container.innerHTML = '';
        container.appendChild(canvas);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.borderRadius = '20px 0 0 0';
    }
    
    drawCreatureIcon(ctx, creature, x, y) {
        ctx.save();
        ctx.translate(x, y);
        
        // 发光效果
        ctx.shadowColor = creature.color || '#4fc3f7';
        ctx.shadowBlur = 30;
        
        switch(creature.type) {
            case 'marine':
                // 绘制鱼形
                this.drawFish(ctx, creature);
                break;
            case 'dinosaur':
                // 绘制恐龙
                this.drawDinosaur(ctx, creature);
                break;
            case 'mammal':
                // 绘制哺乳动物
                this.drawMammal(ctx, creature);
                break;
            case 'plant':
                // 绘制植物
                this.drawPlant(ctx, creature);
                break;
            default:
                // 默认圆形
                ctx.beginPath();
                ctx.arc(0, 0, 50, 0, Math.PI * 2);
                ctx.fillStyle = creature.color || '#4fc3f7';
                ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawFish(ctx, creature) {
        ctx.fillStyle = creature.color || '#4fc3f7';
        
        // 身体
        ctx.beginPath();
        ctx.ellipse(0, 0, 60, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 尾巴
        ctx.beginPath();
        ctx.moveTo(-50, 0);
        ctx.lineTo(-90, -25);
        ctx.lineTo(-90, 25);
        ctx.closePath();
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(35, -8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(37, -8, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 鳍
        ctx.fillStyle = creature.color || '#4fc3f7';
        ctx.beginPath();
        ctx.moveTo(10, -25);
        ctx.lineTo(-10, -50);
        ctx.lineTo(-20, -25);
        ctx.closePath();
        ctx.fill();
    }
    
    drawDinosaur(ctx, creature) {
        ctx.fillStyle = creature.color || '#81c784';
        
        // 身体
        ctx.beginPath();
        ctx.ellipse(0, 20, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 头
        ctx.beginPath();
        ctx.ellipse(50, -20, 35, 25, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // 脖子
        ctx.beginPath();
        ctx.moveTo(20, -10);
        ctx.lineTo(35, -35);
        ctx.lineTo(45, -25);
        ctx.lineTo(30, 0);
        ctx.closePath();
        ctx.fill();
        
        // 尾巴
        ctx.beginPath();
        ctx.moveTo(-45, 20);
        ctx.lineTo(-100, 40);
        ctx.lineTo(-100, 60);
        ctx.lineTo(-40, 50);
        ctx.closePath();
        ctx.fill();
        
        // 腿
        ctx.fillRect(-30, 50, 20, 40);
        ctx.fillRect(10, 50, 20, 40);
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(60, -25, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(62, -25, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawMammal(ctx, creature) {
        ctx.fillStyle = creature.color || '#ffb74d';
        
        // 身体
        ctx.beginPath();
        ctx.ellipse(0, 10, 45, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 头
        ctx.beginPath();
        ctx.arc(45, -15, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // 耳朵
        ctx.beginPath();
        ctx.ellipse(35, -40, 10, 18, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(55, -40, 10, 18, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 腿
        ctx.fillRect(-25, 35, 15, 30);
        ctx.fillRect(10, 35, 15, 30);
        
        // 尾巴
        ctx.beginPath();
        ctx.moveTo(-40, 10);
        ctx.quadraticCurveTo(-80, 5, -90, 20);
        ctx.lineTo(-85, 30);
        ctx.quadraticCurveTo(-75, 20, -35, 25);
        ctx.closePath();
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(50, -20, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(51, -20, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawPlant(ctx, creature) {
        ctx.fillStyle = creature.color || '#81c784';
        
        // 茎
        ctx.fillRect(-5, 0, 10, 100);
        
        // 叶子
        for (let i = 0; i < 5; i++) {
            const y = 20 + i * 20;
            const side = i % 2 === 0 ? 1 : -1;
            
            ctx.beginPath();
            ctx.ellipse(side * 25, y, 25, 10, side * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 树冠（如果是树）
        if (creature.size && creature.size.includes('米')) {
            ctx.beginPath();
            ctx.arc(0, -30, 60, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(-40, -10, 40, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(40, -10, 40, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 更新地球渲染
        if (this.earth) {
            this.earth.animate();
        }
        
        // 播放模式：推进时间
        if (this.isPlaying) {
            const decrement = 0.5 * this.animationSpeed;
            this.currentYear = Math.max(0, this.currentYear - decrement);
            
            document.getElementById('timeline-slider').value = this.currentYear;
            this.updateScene(this.currentYear);
            
            // 到达现代时自动暂停
            if (this.currentYear <= 0) {
                this.pause();
            }
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    new LifeOnEarthApp();
});
