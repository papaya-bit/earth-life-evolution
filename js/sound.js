// ===== 音效管理系统 =====
export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sfxEnabled = true;
        this.musicEnabled = true;
        this.volume = 0.5;
        this.currentAmbience = null;
        this.ambienceSources = {};
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
    }
    
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建主音量控制
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            
            // SFX 音量
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = 0.6;
            this.sfxGain.connect(this.masterGain);
            
            // 音乐音量
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.masterGain);
            
            // 预生成音效
            this.preGenerateSounds();
            
        } catch (error) {
            console.warn('Web Audio API 不支持:', error);
            this.sfxEnabled = false;
            this.musicEnabled = false;
        }
    }
    
    preGenerateSounds() {
        this.sounds = {
            click: () => this.generateTone(800, 0.1, 'sine', 0.3),
            hover: () => this.generateTone(400, 0.05, 'sine', 0.1),
            evolution: () => this.generateEvolutionSound(),
            extinction: () => this.generateExtinctionSound(),
            achievement: () => this.generateAchievementSound(),
            timeTravel: () => this.generateTimeTravelSound(),
            creature: () => this.generateCreatureSound(),
            marine: () => this.generateMarineSound(),
            dinosaur: () => this.generateDinosaurSound(),
            mammal: () => this.generateMammalSound()
        };
    }
    
    // 基础音调生成
    generateTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext || !this.sfxEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // 进化音效 - 上升的旋律
    generateEvolutionSound() {
        if (!this.audioContext || !this.sfxEnabled) return;
        
        const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5
        const duration = 0.3;
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + duration);
            }, index * 100);
        });
    }
    
    // 灭绝音效 - 低沉的轰鸣
    generateExtinctionSound() {
        if (!this.audioContext || !this.sfxEnabled) return;
        
        const duration = 2;
        
        // 低频轰鸣
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(60, this.audioContext.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + duration);
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + duration);
        
        gain1.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        osc1.connect(filter);
        filter.connect(gain1);
        gain1.connect(this.sfxGain);
        
        osc1.start();
        osc1.stop(this.audioContext.currentTime + duration);
        
        // 添加噪声
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 100;
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        
        noise.start();
    }
    
    // 成就解锁音效
    generateAchievementSound() {
        if (!this.audioContext || !this.sfxEnabled) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        const duration = 0.15;
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + duration);
            }, index * 80);
        });
        
        // 添加闪烁效果音
        setTimeout(() => {
            const sparkle = this.audioContext.createOscillator();
            const sparkleGain = this.audioContext.createGain();
            
            sparkle.type = 'sine';
            sparkle.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            sparkle.frequency.exponentialRampToValueAtTime(4000, this.audioContext.currentTime + 0.5);
            
            sparkleGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            sparkleGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            sparkle.connect(sparkleGain);
            sparkleGain.connect(this.sfxGain);
            
            sparkle.start();
            sparkle.stop(this.audioContext.currentTime + 0.5);
        }, 300);
    }
    
    // 时间穿越音效
    generateTimeTravelSound() {
        if (!this.audioContext || !this.sfxEnabled) return;
        
        const duration = 1;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + duration * 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // 生物查看音效
    generateCreatureSound() {
        if (!this.audioContext || !this.sfxEnabled) return;
        
        // 柔和的提示音
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    // 海洋生物音效
    generateMarineSound() {
        if (!this.audioContext || !this.sfxEnabled) return;
        
        // 气泡声
        const duration = 0.5;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // 恐龙音效
    generateDinosaurSound() {
        if (!this.audioContext || !this.sfxEnabled) return;
        
        // 低沉的吼叫
        const duration = 0.8;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(60, this.audioContext.currentTime + duration * 0.5);
        oscillator.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + duration);
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
        filter.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // 哺乳动物音效
    generateMammalSound() {
        if (!this.audioContext || !this.sfxEnabled) return;
        
        // 柔和的叫声
        const duration = 0.4;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(400, this.audioContext.currentTime + duration * 0.3);
        oscillator.frequency.linearRampToValueAtTime(350, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // 播放指定音效
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    // 根据生物类型播放音效
    playCreatureSound(type) {
        switch(type) {
            case 'marine':
                this.play('marine');
                break;
            case 'dinosaur':
                this.play('dinosaur');
                break;
            case 'mammal':
                this.play('mammal');
                break;
            default:
                this.play('creature');
        }
    }
    
    // 环境音效
    playAmbience(type) {
        if (!this.audioContext || !this.musicEnabled) return;
        
        // 停止当前环境音
        this.stopAllAmbience();
        
        switch(type) {
            case 'space':
                this.startSpaceAmbience();
                break;
            case 'earth_rotation':
                this.startEarthRotationAmbience();
                break;
            case 'volcanic':
                this.startVolcanicAmbience();
                break;
            case 'prehistoric':
                this.startPrehistoricAmbience();
                break;
            case 'nature':
                this.startNatureAmbience();
                break;
        }
    }
    
    startSpaceAmbience() {
        // 宇宙背景音 - 非常低沉的嗡嗡声
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 40;
        
        // LFO 调制
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.frequency.value = 0.1;
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        gainNode.gain.value = 0.05;
        
        oscillator.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        oscillator.start();
        lfo.start();
        
        this.ambienceSources.space = { oscillator, lfo, gainNode };
    }
    
    startEarthRotationAmbience() {
        // 地球旋转的轻微风声
        const bufferSize = 2 * this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.1;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        source.start();
        
        this.ambienceSources.earth_rotation = { source, gainNode };
    }
    
    startVolcanicAmbience() {
        // 火山环境音 - 低频隆隆声
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 50;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 100;
        
        // 随机音量变化
        const lfo = this.audioContext.createOscillator();
        lfo.frequency.value = 0.2;
        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = 0.05;
        
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        
        gainNode.gain.value = 0.1;
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        oscillator.start();
        lfo.start();
        
        this.ambienceSources.volcanic = { oscillator, lfo, gainNode };
    }
    
    startPrehistoricAmbience() {
        // 史前环境音 - 风声 + 远处的动物叫声
        this.startNatureAmbience();
        // 可以添加更多史前特有的声音
    }
    
    startNatureAmbience() {
        // 自然环境音 - 风声
        const bufferSize = 5 * this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.05;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 500;
        filter.Q.value = 0.5;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.08;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        source.start();
        
        this.ambienceSources.nature = { source, gainNode };
    }
    
    stopAmbience(type) {
        if (this.ambienceSources[type]) {
            const sources = this.ambienceSources[type];
            Object.values(sources).forEach(source => {
                try {
                    if (source.stop) source.stop();
                    if (source.disconnect) source.disconnect();
                } catch (e) {}
            });
            delete this.ambienceSources[type];
        }
    }
    
    stopAllAmbience() {
        Object.keys(this.ambienceSources).forEach(type => {
            this.stopAmbience(type);
        });
    }
    
    setAmbience(type) {
        if (this.currentAmbience !== type) {
            this.currentAmbience = type;
            this.playAmbience(type);
        }
    }
    
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }
    
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        
        if (this.musicEnabled) {
            this.musicGain.gain.value = 0.3;
            if (this.currentAmbience) {
                this.playAmbience(this.currentAmbience);
            }
        } else {
            this.musicGain.gain.value = 0;
            this.stopAllAmbience();
        }
        
        return this.musicEnabled;
    }
    
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }
}
