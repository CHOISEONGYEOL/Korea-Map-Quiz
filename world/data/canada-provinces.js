// 캐나다 13개 주/준주 데이터
// 10개 주(Province) + 3개 준주(Territory)

const CANADA_DATA = {
    name: '캐나다',
    nameEn: 'Canada',
    center: [-96, 60],
    scale: 400,
    regions: {
        atlantic: {
            name: '대서양 연안',
            nameEn: 'Atlantic Canada',
            color: '#e74c3c',  // 빨강
            provinces: [
                { id: 'NL', name: '뉴펀들랜드 래브라도주', nameEn: 'Newfoundland and Labrador' },
                { id: 'PE', name: '프린스에드워드아일랜드주', nameEn: 'Prince Edward Island' },
                { id: 'NS', name: '노바스코샤주', nameEn: 'Nova Scotia' },
                { id: 'NB', name: '뉴브런즈윅주', nameEn: 'New Brunswick' }
            ]
        },
        central: {
            name: '중부',
            nameEn: 'Central Canada',
            color: '#f1c40f',  // 노랑
            provinces: [
                { id: 'QC', name: '퀘벡주', nameEn: 'Quebec' },
                { id: 'ON', name: '온타리오주', nameEn: 'Ontario' }
            ]
        },
        prairies: {
            name: '프레리',
            nameEn: 'Prairie Provinces',
            color: '#e67e22',  // 주황
            provinces: [
                { id: 'MB', name: '매니토바주', nameEn: 'Manitoba' },
                { id: 'SK', name: '서스캐처원주', nameEn: 'Saskatchewan' },
                { id: 'AB', name: '앨버타주', nameEn: 'Alberta' }
            ]
        },
        pacific: {
            name: '태평양 연안',
            nameEn: 'Pacific Canada',
            color: '#9b59b6',  // 보라
            provinces: [
                { id: 'BC', name: '브리티시컬럼비아주', nameEn: 'British Columbia' }
            ]
        },
        northern: {
            name: '북부 준주',
            nameEn: 'Northern Territories',
            color: '#1abc9c',  // 민트
            provinces: [
                { id: 'YT', name: '유콘 준주', nameEn: 'Yukon' },
                { id: 'NT', name: '노스웨스트 준주', nameEn: 'Northwest Territories' },
                { id: 'NU', name: '누나부트 준주', nameEn: 'Nunavut' }
            ]
        }
    }
};

// 유틸리티 함수들
function getProvinceById(provinceId) {
    for (const [regionKey, region] of Object.entries(CANADA_DATA.regions)) {
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
    for (const region of Object.values(CANADA_DATA.regions)) {
        provinces.push(...region.provinces);
    }
    return provinces;
}

function getProvincesInRegion(regionKey) {
    const region = CANADA_DATA.regions[regionKey];
    return region ? region.provinces : [];
}

function getRegionProvinceCount(regionKey) {
    return getProvincesInRegion(regionKey).length;
}
