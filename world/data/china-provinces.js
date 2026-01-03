// 중국 34개 행정구역 데이터 - 지역별 드릴다운 구조
// 동북, 화북, 화동, 중남, 서남, 서북 6대 지역

const CHINA_DATA = {
    name: '중국',
    nameEn: 'China',
    center: [105, 35],
    scale: 600,
    regions: {
        northeast: {
            name: '동북',
            nameEn: 'Northeast',
            color: '#3498db',
            center: [125, 45],
            scale: 800,
            provinces: [
                { id: 'liaoning', name: '랴오닝성', nameEn: 'Liaoning', nameZh: '辽宁省', capital: '선양' },
                { id: 'jilin', name: '지린성', nameEn: 'Jilin', nameZh: '吉林省', capital: '창춘' },
                { id: 'heilongjiang', name: '헤이룽장성', nameEn: 'Heilongjiang', nameZh: '黑龙江省', capital: '하얼빈' }
            ]
        },
        north: {
            name: '화북',
            nameEn: 'North',
            color: '#e74c3c',
            center: [115, 40],
            scale: 900,
            provinces: [
                { id: 'beijing', name: '베이징', nameEn: 'Beijing', nameZh: '北京市', capital: '베이징', type: '직할시' },
                { id: 'tianjin', name: '톈진', nameEn: 'Tianjin', nameZh: '天津市', capital: '톈진', type: '직할시' },
                { id: 'hebei', name: '허베이성', nameEn: 'Hebei', nameZh: '河北省', capital: '스자좡' },
                { id: 'shanxi', name: '산시성', nameEn: 'Shanxi', nameZh: '山西省', capital: '타이위안' },
                { id: 'neimenggu', name: '내몽골자치구', nameEn: 'Inner Mongolia', nameZh: '内蒙古自治区', capital: '후허하오터', type: '자치구' }
            ]
        },
        east: {
            name: '화동',
            nameEn: 'East',
            color: '#2ecc71',
            center: [120, 32],
            scale: 900,
            provinces: [
                { id: 'shanghai', name: '상하이', nameEn: 'Shanghai', nameZh: '上海市', capital: '상하이', type: '직할시' },
                { id: 'jiangsu', name: '장쑤성', nameEn: 'Jiangsu', nameZh: '江苏省', capital: '난징' },
                { id: 'zhejiang', name: '저장성', nameEn: 'Zhejiang', nameZh: '浙江省', capital: '항저우' },
                { id: 'anhui', name: '안후이성', nameEn: 'Anhui', nameZh: '安徽省', capital: '허페이' },
                { id: 'fujian', name: '푸젠성', nameEn: 'Fujian', nameZh: '福建省', capital: '푸저우' },
                { id: 'jiangxi', name: '장시성', nameEn: 'Jiangxi', nameZh: '江西省', capital: '난창' },
                { id: 'shandong', name: '산둥성', nameEn: 'Shandong', nameZh: '山东省', capital: '지난' },
                { id: 'taiwan', name: '대만', nameEn: 'Taiwan', nameZh: '台湾省', capital: '타이베이', type: '성' }
            ]
        },
        southcentral: {
            name: '중남',
            nameEn: 'South Central',
            color: '#f39c12',
            center: [112, 25],
            scale: 800,
            provinces: [
                { id: 'henan', name: '허난성', nameEn: 'Henan', nameZh: '河南省', capital: '정저우' },
                { id: 'hubei', name: '후베이성', nameEn: 'Hubei', nameZh: '湖北省', capital: '우한' },
                { id: 'hunan', name: '후난성', nameEn: 'Hunan', nameZh: '湖南省', capital: '창사' },
                { id: 'guangdong', name: '광둥성', nameEn: 'Guangdong', nameZh: '广东省', capital: '광저우' },
                { id: 'guangxi', name: '광시좡족자치구', nameEn: 'Guangxi', nameZh: '广西壮族自治区', capital: '난닝', type: '자치구' },
                { id: 'hainan', name: '하이난성', nameEn: 'Hainan', nameZh: '海南省', capital: '하이커우' },
                { id: 'hongkong', name: '홍콩', nameEn: 'Hong Kong', nameZh: '香港特别行政区', capital: '홍콩', type: '특별행정구' },
                { id: 'macau', name: '마카오', nameEn: 'Macau', nameZh: '澳门特别行政区', capital: '마카오', type: '특별행정구' }
            ]
        },
        southwest: {
            name: '서남',
            nameEn: 'Southwest',
            color: '#9b59b6',
            center: [102, 28],
            scale: 700,
            provinces: [
                { id: 'chongqing', name: '충칭', nameEn: 'Chongqing', nameZh: '重庆市', capital: '충칭', type: '직할시' },
                { id: 'sichuan', name: '쓰촨성', nameEn: 'Sichuan', nameZh: '四川省', capital: '청두' },
                { id: 'guizhou', name: '구이저우성', nameEn: 'Guizhou', nameZh: '贵州省', capital: '구이양' },
                { id: 'yunnan', name: '윈난성', nameEn: 'Yunnan', nameZh: '云南省', capital: '쿤밍' },
                { id: 'xizang', name: '시짱자치구', nameEn: 'Tibet', nameZh: '西藏自治区', capital: '라싸', type: '자치구' }
            ]
        },
        northwest: {
            name: '서북',
            nameEn: 'Northwest',
            color: '#1abc9c',
            center: [95, 38],
            scale: 500,
            provinces: [
                { id: 'shaanxi', name: '산시성', nameEn: 'Shaanxi', nameZh: '陕西省', capital: '시안' },
                { id: 'gansu', name: '간쑤성', nameEn: 'Gansu', nameZh: '甘肃省', capital: '란저우' },
                { id: 'qinghai', name: '칭하이성', nameEn: 'Qinghai', nameZh: '青海省', capital: '시닝' },
                { id: 'ningxia', name: '닝샤후이족자치구', nameEn: 'Ningxia', nameZh: '宁夏回族自治区', capital: '인촨', type: '자치구' },
                { id: 'xinjiang', name: '신장위구르자치구', nameEn: 'Xinjiang', nameZh: '新疆维吾尔自治区', capital: '우루무치', type: '자치구' }
            ]
        }
    }
};

// 전체 지역 설정 (첫 화면용)
const CHINA_REGION_SETTINGS = {
    center: [105, 35],
    scale: 600
};

// 유틸리티 함수들
function getProvinceById(provinceId) {
    for (const [regionKey, region] of Object.entries(CHINA_DATA.regions)) {
        const province = region.provinces.find(p => p.id === provinceId);
        if (province) {
            return {
                ...province,
                region: regionKey,
                regionName: region.name,
                color: region.color
            };
        }
    }
    return null;
}

function getProvinceColor(provinceId) {
    const province = getProvinceById(provinceId);
    return province ? province.color : '#95a5a6';
}

function getAllProvinces() {
    const provinces = [];
    for (const region of Object.values(CHINA_DATA.regions)) {
        provinces.push(...region.provinces);
    }
    return provinces;
}

function getProvincesInRegion(regionKey) {
    const region = CHINA_DATA.regions[regionKey];
    if (!region) return [];
    return region.provinces;
}

function getRegionProvinceCount(regionKey) {
    return getProvincesInRegion(regionKey).length;
}

function getTotalProvinceCount() {
    return getAllProvinces().length;
}
