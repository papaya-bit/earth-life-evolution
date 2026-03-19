// ===== 地质事件数据 =====
export class EventData {
    constructor() {
        // 地球历史上的重大事件
        this.events = [
            {
                id: 'earth_formation',
                name: '地球形成',
                year: 4600,
                icon: '🌋',
                type: 'planetary',
                description: '地球从太阳星云中吸积形成，表面是熔岩海洋',
                impact: '地球诞生'
            },
            {
                id: 'moon_formation',
                name: '月球形成',
                year: 4500,
                icon: '🌙',
                type: 'planetary',
                description: '忒伊亚行星撞击地球，碎片形成月球',
                impact: '地球自转轴稳定，潮汐出现'
            },
            {
                id: 'first_oceans',
                name: '原始海洋形成',
                year: 4400,
                icon: '🌊',
                type: 'planetary',
                description: '地球冷却，水蒸气凝结形成原始海洋',
                impact: '为生命起源提供环境'
            },
            {
                id: 'first_life',
                name: '最早生命出现',
                year: 4000,
                icon: '🦠',
                type: 'evolution',
                description: '海底热泉或浅海中出现最早的原核生物',
                impact: '生命起源'
            },
            {
                id: 'photosynthesis',
                name: '光合作用起源',
                year: 3500,
                icon: '☀️',
                type: 'evolution',
                description: '蓝藻等生物发展出光合作用能力',
                impact: '开始改变大气成分'
            },
            {
                id: 'great_oxidation',
                name: '大氧化事件',
                year: 2400,
                icon: '💨',
                type: 'planetary',
                description: '蓝藻大量繁殖，氧气浓度急剧上升',
                impact: '好氧生物出现，厌氧生物大量灭绝'
            },
            {
                id: 'eukaryotes',
                name: '真核细胞出现',
                year: 1800,
                icon: '🔬',
                type: 'evolution',
                description: '细胞核和细胞器出现，细胞结构复杂化',
                impact: '多细胞生命的基础'
            },
            {
                id: 'sexual_reproduction',
                name: '有性繁殖起源',
                year: 1200,
                icon: '💕',
                type: 'evolution',
                description: '生物开始通过有性繁殖产生后代',
                impact: '遗传多样性大幅增加，演化加速'
            },
            {
                id: 'multicellular',
                name: '多细胞生命',
                year: 1000,
                icon: '🧬',
                type: 'evolution',
                description: '细胞开始分工合作，形成多细胞生物',
                impact: '复杂生命形式的起点'
            },
            {
                id: 'snowball_earth1',
                name: '第一次雪球地球',
                year: 720,
                icon: '❄️',
                type: 'climate',
                description: '全球冰冻，冰川覆盖赤道',
                impact: '大规模灭绝，但促进了后来的生命爆发'
            },
            {
                id: 'ediacaran',
                name: '埃迪卡拉生物群',
                year: 635,
                icon: '🫓',
                type: 'evolution',
                description: '最早的大型多细胞生物出现',
                impact: '复杂生命的黎明'
            },
            {
                id: 'cambrian_explosion',
                name: '寒武纪大爆发',
                year: 541,
                icon: '💥',
                type: 'evolution',
                description: '几乎所有现代动物门类在数百万年内迅速出现',
                impact: '现代生态系统的基础建立'
            },
            {
                id: 'great_ordovician',
                name: '奥陶纪生物大辐射',
                year: 485,
                icon: '🐚',
                type: 'evolution',
                description: '海洋生物多样性和丰度大幅增加',
                impact: '海洋生态系统现代化'
            },
            {
                id: 'ordovician_extinction',
                name: '奥陶纪-志留纪灭绝事件',
                year: 444,
                icon: '💀',
                type: 'extinction',
                description: '第二次大灭绝，约85%物种消失',
                impact: '冰川期导致海平面下降，栖息地丧失'
            },
            {
                id: 'first_land_plants',
                name: '植物登陆',
                year: 470,
                icon: '🌱',
                type: 'evolution',
                description: '首批植物从海洋登上陆地',
                impact: '改变了陆地环境，为动物登陆铺路'
            },
            {
                id: 'jawed_fish',
                name: '有颌鱼类出现',
                year: 430,
                icon: '🦈',
                type: 'evolution',
                description: '演化出上下颌，大大提高了捕食效率',
                impact: '开启了新的生态位和捕食方式'
            },
            {
                id: 'first_land_animals',
                name: '动物登陆',
                year: 430,
                icon: '🦎',
                type: 'evolution',
                description: '节肢动物首次登上陆地',
                impact: '陆地生态系统开始形成'
            },
            {
                id: 'devonian_extinction',
                name: '晚泥盆世大灭绝',
                year: 372,
                icon: '💀',
                type: 'extinction',
                description: '约75%物种灭绝，主要影响海洋生物',
                impact: '海洋缺氧事件'
            },
            {
                id: 'first_forests',
                name: '第一批森林',
                year: 385,
                icon: '🌲',
                type: 'evolution',
                description: '古羊齿等高大植物形成森林',
                impact: '深刻改变了大气和土壤'
            },
            {
                id: 'tetrapods',
                name: '四足动物起源',
                year: 395,
                icon: '🐸',
                type: 'evolution',
                description: '鱼类演化出四肢，开始向陆地进军',
                impact: '脊椎动物征服陆地的开始'
            },
            {
                id: 'carboniferous_forests',
                name: '石炭纪雨林',
                year: 350,
                icon: '🌳',
                type: 'climate',
                description: '巨大的蕨类森林覆盖陆地',
                impact: '形成了现代煤矿，大气氧含量达35%'
            },
            {
                id: 'giant_insects',
                name: '巨型昆虫时代',
                year: 320,
                icon: '🦋',
                type: 'evolution',
                description: '高氧环境孕育了巨脉蜻蜓等巨型昆虫',
                impact: '昆虫体型达到历史最大'
            },
            {
                id: 'first_amniotes',
                name: '羊膜动物出现',
                year: 312,
                icon: '🥚',
                type: 'evolution',
                description: '演化出羊膜卵，摆脱对水体的依赖',
                impact: '真正征服陆地的关键'
            },
            {
                id: 'permian_extinction',
                name: '二叠纪大灭绝',
                year: 252,
                icon: '☠️',
                type: 'extinction',
                description: '史上最严重的灭绝事件，96%物种消失',
                impact: '西伯利亚 Traps 火山喷发，温室效应和海洋缺氧'
            },
            {
                id: 'pangea',
                name: '盘古大陆',
                year: 335,
                icon: '🌍',
                type: 'geological',
                description: '所有大陆合并成一个超级大陆',
                impact: '改变了全球气候和洋流模式'
            },
            {
                id: 'first_dinosaurs',
                name: '恐龙出现',
                year: 240,
                icon: '🦖',
                type: 'evolution',
                description: '首批恐龙在阿根廷等地出现',
                impact: '开启了1.7亿年的恐龙时代'
            },
            {
                id: 'first_mammals',
                name: '哺乳动物起源',
                year: 225,
                icon: '🐭',
                type: 'evolution',
                description: '从兽孔类爬行动物演化而来',
                impact: '恒温、毛发、哺乳的革新'
            },
            {
                id: 'triassic_extinction',
                name: '三叠纪-侏罗纪灭绝',
                year: 201,
                icon: '💀',
                type: 'extinction',
                description: '约80%物种灭绝，为恐龙崛起创造机会',
                impact: '恐龙开始统治地球'
            },
            {
                id: 'dinosaurs_dominant',
                name: '恐龙统治',
                year: 201,
                icon: '👑',
                type: 'evolution',
                description: '恐龙成为陆地生态系统的主导者',
                impact: '生态系统达到新的复杂性'
            },
            {
                id: 'first_birds',
                name: '鸟类起源',
                year: 150,
                icon: '🦅',
                type: 'evolution',
                description: '恐龙的一支演化出飞行能力',
                impact: '征服了天空这个生态位'
            },
            {
                id: 'flowering_plants',
                name: '开花植物出现',
                year: 140,
                icon: '🌸',
                type: 'evolution',
                description: '被子植物迅速多样化并占据主导',
                impact: '彻底改变了陆地生态系统'
            },
            {
                id: 'cretaceous_extinction',
                name: '白垩纪大灭绝',
                year: 66,
                icon: '☄️',
                type: 'extinction',
                description: '小行星撞击导致非鸟恐龙灭绝',
                impact: '结束了恐龙时代，哺乳动物崛起'
            },
            {
                id: 'mammals_rise',
                name: '哺乳动物大爆发',
                year: 65,
                icon: '🦌',
                type: 'evolution',
                description: '恐龙灭绝后哺乳动物快速多样化和大型化',
                impact: '新的生态系统格局形成'
            },
            {
                id: 'grasslands',
                name: '草原扩张',
                year: 20,
                icon: '🌾',
                type: 'climate',
                description: '气候变干，草原生态系统扩张',
                impact: '促进了食草动物的演化'
            },
            {
                id: 'hominids',
                name: '人科动物起源',
                year: 7,
                icon: '🦍',
                type: 'evolution',
                description: '人类与黑猩猩的祖先分道扬镳',
                impact: '人类演化的开端'
            },
            {
                id: 'bipedalism',
                name: '直立行走',
                year: 4,
                icon: '🚶',
                type: 'evolution',
                description: '南方古猿开始直立行走',
                impact: '解放双手，大脑开始扩大'
            },
            {
                id: 'stone_tools',
                name: '石器工具',
                year: 3.3,
                icon: '🪨',
                type: 'cultural',
                description: '早期人类开始制造石器',
                impact: '技术时代的黎明'
            },
            {
                id: 'homo_erectus',
                name: '直立人',
                year: 1.9,
                icon: '🔥',
                type: 'evolution',
                description: '掌握用火，开始走出非洲',
                impact: '人类开始征服全球'
            },
            {
                id: 'neanderthals',
                name: '尼安德特人',
                year: 0.4,
                icon: '🧑',
                type: 'evolution',
                description: '人类的近亲在欧洲和西亚繁衍',
                impact: '现代人类有他们的基因'
            },
            {
                id: 'homo_sapiens',
                name: '现代人类',
                year: 0.3,
                icon: '👤',
                type: 'evolution',
                description: '智人在非洲演化形成',
                impact: '人类时代的开始'
            },
            {
                id: 'out_of_africa',
                name: '走出非洲',
                year: 0.07,
                icon: '🌍',
                type: 'cultural',
                description: '现代人类开始迁徙到世界各地',
                impact: '取代了其他人属物种'
            },
            {
                id: 'agriculture',
                name: '农业革命',
                year: 0.012,
                icon: '🌾',
                type: 'cultural',
                description: '人类开始种植作物和驯养动物',
                impact: '定居生活，文明的基础'
            },
            {
                id: 'pyramids',
                name: '金字塔',
                year: 0.0045,
                icon: '🔺',
                type: 'cultural',
                description: '古埃及文明建造金字塔',
                impact: '人类建筑能力的巅峰'
            },
            {
                id: 'industrial',
                name: '工业革命',
                year: 0.00026,
                icon: '🏭',
                type: 'cultural',
                description: '机械化生产取代手工劳动',
                impact: '人类文明进入新纪元'
            },
            {
                id: 'present',
                name: '现在',
                year: 0,
                icon: '🌟',
                type: 'present',
                description: '人类世，生物多样性危机',
                impact: '地球历史上的关键时刻'
            }
        ];
        
        // 按时间排序
        this.events.sort((a, b) => b.year - a.year);
    }
    
    // 获取指定年份附近的事件
    getEventAtYear(year, tolerance = 50) {
        // 对于早期历史使用更大的容差
        if (year > 1000) tolerance = 200;
        else if (year > 500) tolerance = 100;
        else if (year > 100) tolerance = 30;
        else if (year > 10) tolerance = 10;
        else tolerance = 2;
        
        return this.events.find(e => {
            const diff = Math.abs(e.year - year);
            return diff <= tolerance;
        });
    }
    
    // 获取所有事件
    getAllEvents() {
        return this.events;
    }
    
    // 按类型筛选事件
    getEventsByType(type) {
        return this.events.filter(e => e.type === type);
    }
    
    // 获取大灭绝事件
    getExtinctionEvents() {
        return this.events.filter(e => e.type === 'extinction');
    }
    
    // 获取演化里程碑
    getEvolutionMilestones() {
        return this.events.filter(e => e.type === 'evolution');
    }
    
    // 获取特定年代区间的事件
    getEventsInRange(startYear, endYear) {
        return this.events.filter(e => 
            e.year <= startYear && e.year >= endYear
        );
    }
    
    // 搜索事件
    searchEvents(query) {
        const lowerQuery = query.toLowerCase();
        return this.events.filter(e => 
            e.name.toLowerCase().includes(lowerQuery) ||
            e.description.toLowerCase().includes(lowerQuery)
        );
    }
    
    // 根据ID获取事件
    getEventById(id) {
        return this.events.find(e => e.id === id);
    }
    
    // 获取事件统计
    getEventStats() {
        const stats = {};
        this.events.forEach(e => {
            stats[e.type] = (stats[e.type] || 0) + 1;
        });
        return stats;
    }
}
