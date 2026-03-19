// ===== 地球生命演化史 - 主入口（增强版）=====
import { Earth } from './earth.js';
import { Timeline } from './timeline.js';
import { CreatureData } from './creatures.js';
import { EventData } from './events.js';
import { SoundManager } from './sound.js';

class LifeOnEarthApp {
    constructor() {
        this.earth = null;
        this.timeline = null;
        this.creatureData = new CreatureData();
        this.eventData = new EventData();
        this.soundManager = new SoundManager();
        this.isPlaying = false;
        this.animationSpeed = 3;
        this.currentYear = 4600;
        this.creatureMarkers = [];
        this.searchQuery = '';
        this.filterType = 'all';
        this.visitedCreatures = new Set();
        this.achievements = new Set();
        
        this.init();
    }
    
    async init() {
        this.showLoading();
        
        try {
            // 初始化音效
            await this.soundManager.init();
            
            // 初始化 3D 地球
            this.earth = new Earth('canvas-container');
            await this.earth.init();
            
            // 初始化时间轴
            this.timeline = new Timeline();
            
            // 绑定事件
            this.bindEvents();
            
            // 初始化搜索功能
            this.initSearch();
            
            // 初始化音效控制
            this.initSoundControls();
            
            // 初始渲染
            this.updateScene(this.currentYear);
            
            // 隐藏加载画面
            this.hideLoading();
            
            // 播放背景音乐
            this.soundManager.playAmbience('space');
            
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
            { text: '初始化 3D 引擎', progress: 15 },
            { text: '加载地球纹理', progress: 30 },
            { text: '构建生物数据库', progress: 50 },
            { text: '准备时间轴数据', progress: 70 },
            { text: '初始化音效系统', progress: 85 },
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
    
    initSoundControls() {
        // 添加音效控制面板
        const controlPanel = document.createElement('div');
        controlPanel.className = 'sound-control';
        controlPanel.innerHTML = `
            <button id="sound-toggle" class="sound-btn" title="切换音效">
                🔊
            </button>
            <button id="music-toggle" class="sound-btn" title="切换背景音乐">
                🎵
            </button>
        `;
        document.body.appendChild(controlPanel);
        
        // 绑定事件
        document.getElementById('sound-toggle').addEventListener('click', () => {
            this.soundManager.toggleSFX();
            this.updateSoundButton('sound-toggle', this.soundManager.sfxEnabled);
        });
        
        document.getElementById('music-toggle').addEventListener('click', () => {
            this.soundManager.toggleMusic();
            this.updateSoundButton('music-toggle', this.soundManager.musicEnabled);
        });
    }
    
    updateSoundButton(id, enabled) {
        const btn = document.getElementById(id);
        btn.style.opacity = enabled ? '1' : '0.5';
    }
    
    initSearch() {
        // 创建搜索面板
        const searchPanel = document.createElement('div');
        searchPanel.className = 'search-panel';
        searchPanel.innerHTML = `
            <div class="search-box">
                <input type="text" id="search-input" placeholder="搜索生物、事件..." />
                <button id="search-btn">🔍</button>
            </div>
            <div class="filter-tabs">
                <button class="filter-tab active" data-filter="all">全部</button>
                <button class="filter-tab" data-filter="marine">海洋</button>
                <button class="filter-tab" data-filter="land">陆地</button>
                <button class="filter-tab" data-filter="dinosaur">恐龙</button>
                <button class="filter-tab" data-filter="mammal">哺乳</button>
            </div>
            <div id="search-results" class="search-results"></div>
        `;
        
        // 插入到主面板之前
        const timePanel = document.querySelector('.time-panel');
        timePanel.parentNode.insertBefore(searchPanel, timePanel);
        
        // 绑定搜索事件
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            this.performSearch();
        });
        
        searchBtn.addEventListener('click', () => {
            this.performSearch();
        });
        
        // 绑定筛选标签
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterType = tab.dataset.filter;
                this.performSearch();
            });
        });
    }
    
    performSearch() {
        const resultsContainer = document.getElementById('search-results');
        
        if (!this.searchQuery && this.filterType === 'all') {
            resultsContainer.innerHTML = '';
            resultsContainer.classList.remove('active');
            return;
        }
        
        // 搜索生物
        const creatures = this.creatureData.searchCreatures(this.searchQuery, this.filterType);
        
        // 搜索事件
        const events = this.searchQuery ? this.eventData.searchEvents(this.searchQuery) : [];
        
        if (creatures.length === 0 && events.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">未找到匹配结果</div>';
        } else {
            let html = '';
            
            if (creatures.length > 0) {
                html += '<div class="result-section"><h4>生物</h4>';
                creatures.slice(0, 8).forEach(creature => {
                    html += `
                        <div class="result-item" data-id="${creature.id}" data-type="creature">
                            <span class="result-icon">${creature.icon}</span>
                            <div class="result-info">
                                <span class="result-name">${creature.name}</span>
                                <span class="result-period">${creature.period}</span>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            if (events.length > 0) {
                html += '<div class="result-section"><h4>事件</h4>';
                events.slice(0, 5).forEach(event => {
                    html += `
                        <div class="result-item" data-id="${event.id}" data-type="event">
                            <span class="result-icon">${event.icon}</span>
                            <div class="result-info">
                                <span class="result-name">${event.name}</span>
                                <span class="result-period">${this.timeline.formatYear(event.year)}</span>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            resultsContainer.innerHTML = html;
            
            // 绑定点击事件
            resultsContainer.querySelectorAll('.result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.id;
                    const type = item.dataset.type;
                    
                    if (type === 'creature') {
                        const creature = this.creatureData.getCreatureById(id);
                        if (creature) {
                            this.jumpToYear(creature.startYear);
                            setTimeout(() => this.showCreatureDetail(creature), 500);
                        }
                    } else {
                        const event = this.eventData.getEventById(id);
                        if (event) {
                            this.jumpToYear(event.year);
                        }
                    }
                    
                    resultsContainer.classList.remove('active');
                });
            });
        }
        
        resultsContainer.classList.add('active');
    }
    
    jumpToYear(year) {
        this.currentYear = year;
        document.getElementById('timeline-slider').value = year;
        this.updateScene(year);
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
            } else if (e.key === 'Escape') {
                document.getElementById('creature-modal').classList.remove('active');
                document.getElementById('search-results').classList.remove('active');
            }
        });
        
        // 添加成就提示
        this.initAchievements();
    }
    
    initAchievements() {
        this.achievementList = [
            { id: 'first_creature', name: '初探生命', desc: '查看第一个生物详情', icon: '🔍' },
            { id: 'time_traveler', name: '时空旅者', desc: '浏览10个不同年代', icon: '⏰' },
            { id: 'extinction_survivor', name: '灭绝幸存者', desc: '查看所有大灭绝事件', icon: '💀' },
            { id: 'dino_fan', name: '恐龙迷', desc: '查看5种恐龙', icon: '🦖' },
            { id: 'human_ancestor', name: '寻根问祖', desc: '查看人类进化历程', icon: '👤' }
        ];
    }
    
    checkAchievements(type, data) {
        switch(type) {
            case 'view_creature':
                if (!this.achievements.has('first_creature')) {
                    this.unlockAchievement('first_creature');
                }
                if (data.type === 'dinosaur') {
                    const dinoCount = Array.from(this.visitedCreatures).filter(id => {
                        const c = this.creatureData.getCreatureById(id);
                        return c && c.type === 'dinosaur';
                    }).length;
                    if (dinoCount >= 5 && !this.achievements.has('dino_fan')) {
                        this.unlockAchievement('dino_fan');
                    }
                }
                break;
            case 'view_era':
                // 记录访问的年代
                break;
        }
    }
    
    unlockAchievement(id) {
        if (this.achievements.has(id)) return;
        
        this.achievements.add(id);
        const achievement = this.achievementList.find(a => a.id === id);
        
        if (achievement) {
            this.showAchievementNotification(achievement);
            this.soundManager.play('achievement');
        }
    }
    
    showAchievementNotification(achievement) {
        const notif = document.createElement('div');
        notif.className = 'achievement-notification';
        notif.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">解锁成就</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        `;
        document.body.appendChild(notif);
        
        setTimeout(() => notif.classList.add('show'), 100);
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 500);
        }, 4000);
    }
    
    play() {
        this.isPlaying = true;
        document.getElementById('play-btn').style.display = 'none';
        document.getElementById('pause-btn').style.display = 'flex';
        this.soundManager.playAmbience('earth_rotation');
    }
    
    pause() {
        this.isPlaying = false;
        document.getElementById('play-btn').style.display = 'flex';
        document.getElementById('pause-btn').style.display = 'none';
        this.soundManager.stopAmbience('earth_rotation');
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
        
        // 更新背景音效
        this.updateAmbience(year);
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
            
            // 播放事件音效
            if (event.type === 'extinction') {
                this.soundManager.play('extinction');
            } else if (event.type === 'evolution') {
                this.soundManager.play('evolution');
            }
            
            setTimeout(() => {
                indicator.querySelector('.event-text').classList.remove('highlight');
            }, 2000);
        } else {
            indicator.querySelector('.event-icon').textContent = '🌍';
            indicator.querySelector('.event-text').textContent = this.getEraDescription(year);
        }
    }
    
    updateAmbience(year) {
        // 根据年代切换环境音效
        if (year > 4000) {
            this.soundManager.setAmbience('volcanic');
        } else if (year > 66) {
            this.soundManager.setAmbience('prehistoric');
        } else {
            this.soundManager.setAmbience('nature');
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
                this.createMarkerElement(marker, creature);
                this.creatureMarkers.push(marker);
            }
        });
    }
    
    createMarkerElement(marker, creature) {
        // 创建DOM标记元素
        const element = document.createElement('div');
        element.className = 'creature-marker';
        element.innerHTML = `
            <div class="marker-ring" style="border-color: #${creature.color.toString(16).padStart(6, '0')}">
                <span class="marker-icon">${creature.icon}</span>
            </div>
            <div class="marker-label">${creature.name}</div>
            <div class="marker-preview">
                <h4>${creature.name}</h4>
                <p>${creature.period}</p>
            </div>
        `;
        
        // 添加到容器
        const container = document.getElementById('canvas-container');
        container.appendChild(element);
        
        // 绑定点击事件
        element.addEventListener('click', () => {
            this.showCreatureDetail(creature);
            this.soundManager.play('click');
        });
        
        // 保存元素引用以便更新位置
        marker.element = element;
        
        // 初始位置更新
        this.updateMarkerPosition(marker);
    }
    
    updateMarkerPosition(marker) {
        if (!marker.element || !this.earth) return;
        
        // 将经纬度转换为屏幕坐标
        const pos = this.earth.latLonToScreen(marker.creature.lat, marker.creature.lon);
        if (pos) {
            marker.element.style.left = pos.x + 'px';
            marker.element.style.top = pos.y + 'px';
            marker.element.style.display = pos.visible ? 'block' : 'none';
        }
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
        this.visitedCreatures.add(creature.id);
        this.checkAchievements('view_creature', creature);
        
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
        
        // 播放生物音效
        this.soundManager.playCreatureSound(creature.type);
    }
    
    initCreaturePreview(creature) {
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
        
        // 根据生物类型绘制详细的示意图
        this.drawDetailedCreature(ctx, creature, 200, 200);
        
        const container = document.getElementById('creature-canvas');
        container.innerHTML = '';
        container.appendChild(canvas);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.borderRadius = '20px 0 0 0';
        
        // 添加生物信息标签
        this.addCreatureTags(creature);
    }
    
    addCreatureTags(creature) {
        // 添加分类标签到弹窗
        const infoSection = document.querySelector('.creature-info');
        let tagsContainer = infoSection.querySelector('.creature-taxonomy');
        
        if (!tagsContainer) {
            tagsContainer = document.createElement('div');
            tagsContainer.className = 'creature-taxonomy';
            infoSection.insertBefore(tagsContainer, infoSection.querySelector('.creature-meta'));
        }
        
        const tags = [creature.type];
        if (creature.diet) tags.push(creature.diet);
        if (creature.habitat) tags.push(creature.habitat.split('、')[0]);
        
        tagsContainer.innerHTML = tags.map(tag => 
            `<span class="taxonomy-tag">${tag}</span>`
        ).join('');
    }
    
    drawDetailedCreature(ctx, creature, x, y) {
        ctx.save();
        ctx.translate(x, y);
        
        // 发光效果
        ctx.shadowColor = '#' + creature.color.toString(16).padStart(6, '0');
        ctx.shadowBlur = 40;
        
        // 根据生物类型绘制
        switch(creature.type) {
            case 'marine':
                this.drawMarineCreature(ctx, creature);
                break;
            case 'dinosaur':
                this.drawDinosaurCreature(ctx, creature);
                break;
            case 'mammal':
                this.drawMammalCreature(ctx, creature);
                break;
            case 'plant':
                this.drawPlantCreature(ctx, creature);
                break;
            case 'bird':
                this.drawBirdCreature(ctx, creature);
                break;
            case 'insect':
                this.drawInsectCreature(ctx, creature);
                break;
            case 'reptile':
                this.drawReptileCreature(ctx, creature);
                break;
            default:
                this.drawGenericCreature(ctx, creature);
        }
        
        ctx.restore();
    }
    
    drawMarineCreature(ctx, creature) {
        const color = '#' + creature.color.toString(16).padStart(6, '0');
        ctx.fillStyle = color;
        
        // 流线型身体
        ctx.beginPath();
        ctx.ellipse(0, 0, 80, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 尾巴
        ctx.beginPath();
        ctx.moveTo(-70, 0);
        ctx.lineTo(-130, -30);
        ctx.quadraticCurveTo(-110, 0, -130, 30);
        ctx.closePath();
        ctx.fill();
        
        // 背鳍
        ctx.beginPath();
        ctx.moveTo(-20, -35);
        ctx.lineTo(10, -80);
        ctx.lineTo(30, -35);
        ctx.closePath();
        ctx.fill();
        
        // 胸鳍
        ctx.beginPath();
        ctx.ellipse(30, 20, 25, 12, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(50, -10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(53, -10, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 鳃
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(30, 5 + i * 8, 15, -Math.PI * 0.3, Math.PI * 0.3);
            ctx.stroke();
        }
    }
    
    drawDinosaurCreature(ctx, creature) {
        const color = '#' + creature.color.toString(16).padStart(6, '0');
        ctx.fillStyle = color;
        
        // 身体
        ctx.beginPath();
        ctx.ellipse(0, 30, 70, 55, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 脖子
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.quadraticCurveTo(60, -40, 80, -70);
        ctx.lineTo(100, -60);
        ctx.quadraticCurveTo(75, -30, 60, 10);
        ctx.closePath();
        ctx.fill();
        
        // 头
        ctx.beginPath();
        ctx.ellipse(95, -75, 35, 25, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(105, -80, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(107, -80, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 尾巴
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-60, 20);
        ctx.quadraticCurveTo(-130, 30, -150, 70);
        ctx.lineTo(-140, 85);
        ctx.quadraticCurveTo(-110, 50, -50, 50);
        ctx.closePath();
        ctx.fill();
        
        // 腿
        ctx.fillRect(-40, 75, 25, 60);
        ctx.fillRect(15, 75, 25, 60);
        
        // 纹理
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(-30 + i * 25, 20, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawMammalCreature(ctx, creature) {
        const color = '#' + creature.color.toString(16).padStart(6, '0');
        ctx.fillStyle = color;
        
        // 身体
        ctx.beginPath();
        ctx.ellipse(0, 20, 65, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 头
        ctx.beginPath();
        ctx.ellipse(55, -25, 40, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 耳朵
        ctx.beginPath();
        ctx.ellipse(40, -55, 15, 25, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(75, -55, 15, 25, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 腿
        ctx.fillRect(-35, 60, 20, 55);
        ctx.fillRect(15, 60, 20, 55);
        ctx.fillRect(-45, 65, 18, 50);
        ctx.fillRect(25, 65, 18, 50);
        
        // 尾巴
        ctx.beginPath();
        ctx.moveTo(-60, 10);
        ctx.quadraticCurveTo(-110, 0, -120, 30);
        ctx.lineTo(-115, 45);
        ctx.quadraticCurveTo(-100, 20, -55, 30);
        ctx.closePath();
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(65, -30, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(67, -30, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // 鼻子
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(90, -20, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawPlantCreature(ctx, creature) {
        const color = '#' + creature.color.toString(16).padStart(6, '0');
        
        // 茎
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-8, 0, 16, 120);
        
        // 叶子
        ctx.fillStyle = color;
        const leafPositions = [
            { y: 30, side: 1, size: 1 },
            { y: 55, side: -1, size: 0.9 },
            { y: 80, side: 1, size: 0.8 },
            { y: 105, side: -1, size: 0.7 }
        ];
        
        leafPositions.forEach(leaf => {
            ctx.save();
            ctx.translate(0, leaf.y);
            ctx.scale(leaf.side * leaf.size, leaf.size);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(40, -10, 70, 5);
            ctx.quadraticCurveTo(45, 15, 0, 8);
            ctx.closePath();
            ctx.fill();
            
            // 叶脉
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 4);
            ctx.quadraticCurveTo(35, 2, 60, 5);
            ctx.stroke();
            
            ctx.restore();
        });
        
        // 树冠
        ctx.beginPath();
        ctx.arc(0, -30, 70, 0, Math.PI * 2);
        ctx.arc(-45, -10, 50, 0, Math.PI * 2);
        ctx.arc(45, -10, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(-20, -50, 25, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawBirdCreature(ctx, creature) {
        const color = '#' + creature.color.toString(16).padStart(6, '0');
        ctx.fillStyle = color;
        
        // 身体
        ctx.beginPath();
        ctx.ellipse(0, 0, 45, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 翅膀（展开）
        ctx.beginPath();
        ctx.moveTo(-20, -10);
        ctx.quadraticCurveTo(-80, -60, -120, -20);
        ctx.quadraticCurveTo(-80, 10, -20, 10);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(20, -10);
        ctx.quadraticCurveTo(80, -60, 120, -20);
        ctx.quadraticCurveTo(80, 10, 20, 10);
        ctx.fill();
        
        // 头
        ctx.beginPath();
        ctx.ellipse(35, -35, 25, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 喙
        ctx.fillStyle = '#ffb74d';
        ctx.beginPath();
        ctx.moveTo(55, -35);
        ctx.lineTo(85, -30);
        ctx.lineTo(55, -25);
        ctx.closePath();
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(40, -40, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(42, -40, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 尾巴
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-40, 10);
        ctx.lineTo(-80, 40);
        ctx.lineTo(-70, 55);
        ctx.lineTo(-35, 30);
        ctx.closePath();
        ctx.fill();
    }
    
    drawInsectCreature(ctx, creature) {
        const color = '#' + creature.color.toString(16).padStart(6, '0');
        ctx.fillStyle = color;
        
        // 身体分段
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(-50, 5, 25, 20, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(50, -5, 20, 15, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // 腿
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-20 + i * 20, 25);
            ctx.lineTo(-30 + i * 20, 60);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(-20 + i * 20, -25);
            ctx.lineTo(-30 + i * 20, -60);
            ctx.stroke();
        }
        
        // 翅膀
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.ellipse(0, -35, 60, 40, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.ellipse(10, -35, 60, 40, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 触角
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-70, -10);
        ctx.quadraticCurveTo(-100, -30, -110, -60);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-70, 0);
        ctx.quadraticCurveTo(-100, -20, -105, -50);
        ctx.stroke();
    }
    
    drawReptileCreature(ctx, creature) {
        const color = '#' + creature.color.toString(16).padStart(6, '0');
        ctx.fillStyle = color;
        
        // 身体（较长）
        ctx.beginPath();
        ctx.ellipse(0, 0, 90, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 头
        ctx.beginPath();
        ctx.ellipse(80, -15, 35, 28, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // 尾
        ctx.beginPath();
        ctx.moveTo(-80, 10);
        ctx.quadraticCurveTo(-140, 20, -160, 60);
        ctx.lineTo(-150, 70);
        ctx.quadraticCurveTo(-130, 35, -75, 25);
        ctx.closePath();
        ctx.fill();
        
        // 腿
        ctx.fillRect(-40, 30, 18, 45);
        ctx.fillRect(20, 30, 18, 45);
        ctx.fillRect(-50, 35, 15, 40);
        ctx.fillRect(35, 35, 15, 40);
        
        // 鳞片纹理
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 3; j++) {
                ctx.beginPath();
                ctx.arc(-60 + i * 25, -15 + j * 12, 6, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(90, -20, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(92, -20, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawGenericCreature(ctx, creature) {
        const color = '#' + creature.color.toString(16).padStart(6, '0');
        ctx.fillStyle = color;
        
        // 默认圆形生物
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();
        
        // 内部图案
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(-20, -20, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(20, -10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(22, -10, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 更新地球渲染
        if (this.earth) {
            this.earth.animate();
        }
        
        // 更新标记位置
        this.creatureMarkers.forEach(marker => {
            this.updateMarkerPosition(marker);
        });
        
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
