// ===== 时间轴系统 =====
export class Timeline {
    constructor() {
        // 地质年代数据
        this.eras = [
            {
                name: '冥古宙',
                start: 4600,
                end: 4000,
                description: '地球形成初期，熔岩海洋，无生命',
                color: '#ff5722'
            },
            {
                name: '太古宙',
                start: 4000,
                end: 2500,
                description: '最早的生命出现，原核生物',
                color: '#795548'
            },
            {
                name: '元古宙',
                start: 2500,
                end: 541,
                description: '真核生物出现，大气含氧',
                color: '#607d8b'
            },
            {
                name: '寒武纪',
                start: 541,
                end: 485,
                description: '生命大爆发，几乎所有门类出现',
                color: '#4caf50'
            },
            {
                name: '奥陶纪',
                start: 485,
                end: 444,
                description: '海洋生物繁盛，鱼类出现',
                color: '#8bc34a'
            },
            {
                name: '志留纪',
                start: 444,
                end: 419,
                description: '植物登陆，有颌鱼类',
                color: '#cddc39'
            },
            {
                name: '泥盆纪',
                start: 419,
                end: 359,
                description: '鱼类时代，四足动物登陆',
                color: '#ffeb3b'
            },
            {
                name: '石炭纪',
                start: 359,
                end: 299,
                description: '森林覆盖，巨型昆虫',
                color: '#ffc107'
            },
            {
                name: '二叠纪',
                start: 299,
                end: 252,
                description: '盘古大陆，最大灭绝事件',
                color: '#ff9800'
            },
            {
                name: '三叠纪',
                start: 252,
                end: 201,
                description: '恐龙出现，哺乳动物起源',
                color: '#ff5722'
            },
            {
                name: '侏罗纪',
                start: 201,
                end: 145,
                description: '恐龙统治，鸟类起源',
                color: '#f44336'
            },
            {
                name: '白垩纪',
                start: 145,
                end: 66,
                description: '开花植物，恐龙灭绝',
                color: '#e91e63'
            },
            {
                name: '古近纪',
                start: 66,
                end: 23,
                description: '哺乳动物兴起，草原扩张',
                color: '#9c27b0'
            },
            {
                name: '新近纪',
                start: 23,
                end: 2.6,
                description: '人科动物出现',
                color: '#673ab7'
            },
            {
                name: '第四纪',
                start: 2.6,
                end: 0,
                description: '人类时代，冰期循环',
                color: '#3f51b5'
            }
        ];
        
        // 重要时间节点（用于滑块标记）
        this.milestones = [
            { year: 4600, label: '46亿年前', era: '冥古宙' },
            { year: 4000, label: '40亿年前', era: '太古宙' },
            { year: 2500, label: '25亿年前', era: '元古宙' },
            { year: 541, label: '5.41亿年前', era: '寒武纪' },
            { year: 485, label: '4.85亿年前', era: '奥陶纪' },
            { year: 444, label: '4.44亿年前', era: '志留纪' },
            { year: 419, label: '4.19亿年前', era: '泥盆纪' },
            { year: 359, label: '3.59亿年前', era: '石炭纪' },
            { year: 299, label: '2.99亿年前', era: '二叠纪' },
            { year: 252, label: '2.52亿年前', era: '三叠纪' },
            { year: 201, label: '2.01亿年前', era: '侏罗纪' },
            { year: 145, label: '1.45亿年前', era: '白垩纪' },
            { year: 66, label: '6600万年前', era: '古近纪' },
            { year: 23, label: '2300万年前', era: '新近纪' },
            { year: 0, label: '现在', era: '第四纪' }
        ];
    }
    
    // 获取指定年代所属的地质年代
    getEra(year) {
        // 处理滑块的非线性映射
        const realYear = this.sliderToYear(year);
        
        for (const era of this.eras) {
            if (realYear <= era.start && realYear >= era.end) {
                return era;
            }
        }
        return this.eras[this.eras.length - 1];
    }
    
    // 获取年代信息
    getEraInfo(year) {
        const era = this.getEra(year);
        return {
            name: era.name,
            description: era.description,
            color: era.color,
            period: `${era.start}-${era.end}百万年前`
        };
    }
    
    // 滑块值转实际年份（处理非线性时间压缩）
    sliderToYear(sliderValue) {
        // 滑块0-4600映射到实际年份，但压缩近期历史
        // 使用指数函数让早期历史占据更多滑块空间
        const normalized = sliderValue / 4600;
        if (normalized > 0.9) {
            // 最近10%的滑块对应0-66百万年
            return (1 - normalized) / 0.1 * 66;
        } else if (normalized > 0.7) {
            // 70-90%对应66-252百万年
            return 66 + (0.9 - normalized) / 0.2 * (252 - 66);
        } else if (normalized > 0.5) {
            // 50-70%对应252-541百万年
            return 252 + (0.7 - normalized) / 0.2 * (541 - 252);
        } else if (normalized > 0.3) {
            // 30-50%对应541-2500百万年
            return 541 + (0.5 - normalized) / 0.2 * (2500 - 541);
        } else if (normalized > 0.1) {
            // 10-30%对应2500-4000百万年
            return 2500 + (0.3 - normalized) / 0.2 * (4000 - 2500);
        } else {
            // 0-10%对应4000-4600百万年
            return 4000 + (0.1 - normalized) / 0.1 * (4600 - 4000);
        }
    }
    
    // 实际年份转滑块值
    yearToSlider(year) {
        if (year <= 66) {
            return 4600 - (year / 66) * 0.1 * 4600;
        } else if (year <= 252) {
            return 4600 * 0.9 - ((year - 66) / (252 - 66)) * 0.2 * 4600;
        } else if (year <= 541) {
            return 4600 * 0.7 - ((year - 252) / (541 - 252)) * 0.2 * 4600;
        } else if (year <= 2500) {
            return 4600 * 0.5 - ((year - 541) / (2500 - 541)) * 0.2 * 4600;
        } else if (year <= 4000) {
            return 4600 * 0.3 - ((year - 2500) / (4000 - 2500)) * 0.2 * 4600;
        } else {
            return 4600 * 0.1 - ((year - 4000) / (4600 - 4000)) * 0.1 * 4600;
        }
    }
    
    // 获取所有年代
    getAllEras() {
        return this.eras;
    }
    
    // 获取里程碑
    getMilestones() {
        return this.milestones;
    }
    
    // 格式化年份显示
    formatYear(year) {
        if (year >= 1000) {
            return (year / 1000).toFixed(1) + '亿年前';
        } else if (year >= 1) {
            return Math.round(year) + '百万年前';
        } else if (year > 0) {
            return Math.round(year * 1000) + '万年前';
        } else {
            return '现在';
        }
    }
    
    // 获取相邻年代
    getAdjacentEras(year) {
        const currentEra = this.getEra(year);
        const index = this.eras.indexOf(currentEra);
        
        return {
            previous: index > 0 ? this.eras[index - 1] : null,
            current: currentEra,
            next: index < this.eras.length - 1 ? this.eras[index + 1] : null
        };
    }
    
    // 检查是否处于某个重要时期
    isImportantPeriod(year) {
        const importantPeriods = [
            { start: 541, end: 520, name: '寒武纪大爆发' },
            { start: 375, end: 360, name: '晚泥盆世大灭绝' },
            { start: 252, end: 251, name: '二叠纪大灭绝' },
            { start: 201, end: 199, name: '三叠纪-侏罗纪灭绝' },
            { start: 66, end: 65, name: '白垩纪大灭绝' },
            { start: 7, end: 6, name: '人科动物起源' },
            { start: 0.3, end: 0, name: '现代人类' }
        ];
        
        for (const period of importantPeriods) {
            if (year <= period.start && year >= period.end) {
                return period;
            }
        }
        return null;
    }
}
