// 미국 50개 주 데이터 - 지역별 드릴다운 구조
// Census Bureau 기준 4대 지역 + 9개 세부지역

const US_STATES_DATA = {
    name: '미국',
    nameEn: 'United States',
    center: [-98, 39],
    scale: 800,
    regions: {
        northeast: {
            name: '북동부',
            nameEn: 'Northeast',
            color: '#3498db',  // 파랑
            center: [-74, 42],
            scale: 1800,
            subregions: {
                newEngland: {
                    name: '뉴잉글랜드',
                    nameEn: 'New England',
                    center: [-71, 43],
                    scale: 2500,
                    states: [
                        { id: '09', name: '코네티컷주', nameEn: 'Connecticut', order: 5, joinDate: '1788-01-09' },
                        { id: '23', name: '메인주', nameEn: 'Maine', order: 23, joinDate: '1820-03-15' },
                        { id: '25', name: '매사추세츠주', nameEn: 'Massachusetts', order: 6, joinDate: '1788-02-06' },
                        { id: '33', name: '뉴햄프셔주', nameEn: 'New Hampshire', order: 9, joinDate: '1788-06-21' },
                        { id: '44', name: '로드아일랜드주', nameEn: 'Rhode Island', order: 13, joinDate: '1790-05-09' },
                        { id: '50', name: '버몬트주', nameEn: 'Vermont', order: 14, joinDate: '1791-03-04' }
                    ]
                },
                midAtlantic: {
                    name: '중부대서양',
                    nameEn: 'Mid-Atlantic',
                    center: [-76, 41],
                    scale: 2000,
                    states: [
                        { id: '34', name: '뉴저지주', nameEn: 'New Jersey', order: 3, joinDate: '1787-12-18' },
                        { id: '36', name: '뉴욕주', nameEn: 'New York', order: 11, joinDate: '1788-07-26' },
                        { id: '42', name: '펜실베이니아주', nameEn: 'Pennsylvania', order: 2, joinDate: '1787-12-12' }
                    ]
                }
            }
        },
        south: {
            name: '남부',
            nameEn: 'South',
            color: '#e74c3c',  // 빨강
            center: [-86, 33],
            scale: 1200,
            subregions: {
                southAtlantic: {
                    name: '남부대서양',
                    nameEn: 'South Atlantic',
                    center: [-80, 34],
                    scale: 1400,
                    states: [
                        { id: '10', name: '델라웨어주', nameEn: 'Delaware', order: 1, joinDate: '1787-12-07' },
                        { id: '12', name: '플로리다주', nameEn: 'Florida', order: 27, joinDate: '1845-03-03' },
                        { id: '13', name: '조지아주', nameEn: 'Georgia', order: 4, joinDate: '1788-01-02' },
                        { id: '24', name: '메릴랜드주', nameEn: 'Maryland', order: 7, joinDate: '1788-04-28' },
                        { id: '37', name: '노스캐롤라이나주', nameEn: 'North Carolina', order: 12, joinDate: '1789-11-21' },
                        { id: '45', name: '사우스캐롤라이나주', nameEn: 'South Carolina', order: 8, joinDate: '1788-05-23' },
                        { id: '51', name: '버지니아주', nameEn: 'Virginia', order: 10, joinDate: '1788-06-25' },
                        { id: '54', name: '웨스트버지니아주', nameEn: 'West Virginia', order: 35, joinDate: '1863-06-20' }
                    ]
                },
                eastSouthCentral: {
                    name: '동남중부',
                    nameEn: 'East South Central',
                    center: [-87, 34],
                    scale: 1600,
                    states: [
                        { id: '01', name: '앨라배마주', nameEn: 'Alabama', order: 22, joinDate: '1819-12-14' },
                        { id: '21', name: '켄터키주', nameEn: 'Kentucky', order: 15, joinDate: '1792-06-05' },
                        { id: '28', name: '미시시피주', nameEn: 'Mississippi', order: 20, joinDate: '1817-12-10' },
                        { id: '47', name: '테네시주', nameEn: 'Tennessee', order: 16, joinDate: '1796-06-01' }
                    ]
                },
                westSouthCentral: {
                    name: '서남중부',
                    nameEn: 'West South Central',
                    center: [-96, 32],
                    scale: 1200,
                    states: [
                        { id: '05', name: '아칸소주', nameEn: 'Arkansas', order: 25, joinDate: '1836-06-15' },
                        { id: '22', name: '루이지애나주', nameEn: 'Louisiana', order: 18, joinDate: '1812-04-30' },
                        { id: '40', name: '오클라호마주', nameEn: 'Oklahoma', order: 46, joinDate: '1907-11-16' },
                        { id: '48', name: '텍사스주', nameEn: 'Texas', order: 28, joinDate: '1845-12-29' }
                    ]
                }
            }
        },
        midwest: {
            name: '중서부',
            nameEn: 'Midwest',
            color: '#2ecc71',  // 초록
            center: [-92, 43],
            scale: 1100,
            subregions: {
                eastNorthCentral: {
                    name: '동북중부',
                    nameEn: 'East North Central',
                    center: [-85, 42],
                    scale: 1400,
                    states: [
                        { id: '17', name: '일리노이주', nameEn: 'Illinois', order: 21, joinDate: '1818-12-03' },
                        { id: '18', name: '인디애나주', nameEn: 'Indiana', order: 19, joinDate: '1816-12-11' },
                        { id: '26', name: '미시간주', nameEn: 'Michigan', order: 26, joinDate: '1837-01-26' },
                        { id: '39', name: '오하이오주', nameEn: 'Ohio', order: 17, joinDate: '1803-03-01' },
                        { id: '55', name: '위스콘신주', nameEn: 'Wisconsin', order: 30, joinDate: '1848-05-29' }
                    ]
                },
                westNorthCentral: {
                    name: '서북중부',
                    nameEn: 'West North Central',
                    center: [-98, 44],
                    scale: 1000,
                    states: [
                        { id: '19', name: '아이오와주', nameEn: 'Iowa', order: 29, joinDate: '1846-12-28' },
                        { id: '20', name: '캔자스주', nameEn: 'Kansas', order: 34, joinDate: '1861-01-29' },
                        { id: '27', name: '미네소타주', nameEn: 'Minnesota', order: 32, joinDate: '1858-05-11' },
                        { id: '29', name: '미주리주', nameEn: 'Missouri', order: 24, joinDate: '1821-08-10' },
                        { id: '31', name: '네브래스카주', nameEn: 'Nebraska', order: 37, joinDate: '1867-03-01' },
                        { id: '38', name: '노스다코타주', nameEn: 'North Dakota', order: 39, joinDate: '1889-11-02' },
                        { id: '46', name: '사우스다코타주', nameEn: 'South Dakota', order: 40, joinDate: '1889-11-02' }
                    ]
                }
            }
        },
        west: {
            name: '서부',
            nameEn: 'West',
            color: '#f1c40f',  // 노랑
            center: [-115, 40],
            scale: 800,
            subregions: {
                mountain: {
                    name: '산악지역',
                    nameEn: 'Mountain',
                    center: [-110, 40],
                    scale: 900,
                    states: [
                        { id: '04', name: '애리조나주', nameEn: 'Arizona', order: 48, joinDate: '1912-02-14' },
                        { id: '08', name: '콜로라도주', nameEn: 'Colorado', order: 38, joinDate: '1876-08-01' },
                        { id: '16', name: '아이다호주', nameEn: 'Idaho', order: 43, joinDate: '1890-07-03' },
                        { id: '30', name: '몬태나주', nameEn: 'Montana', order: 41, joinDate: '1889-11-08' },
                        { id: '32', name: '네바다주', nameEn: 'Nevada', order: 36, joinDate: '1864-10-31' },
                        { id: '35', name: '뉴멕시코주', nameEn: 'New Mexico', order: 47, joinDate: '1912-01-06' },
                        { id: '49', name: '유타주', nameEn: 'Utah', order: 45, joinDate: '1896-01-04' },
                        { id: '56', name: '와이오밍주', nameEn: 'Wyoming', order: 44, joinDate: '1890-07-10' }
                    ]
                },
                pacific: {
                    name: '태평양연안',
                    nameEn: 'Pacific',
                    center: [-122, 40],
                    scale: 900,
                    states: [
                        { id: '02', name: '알래스카주', nameEn: 'Alaska', order: 49, joinDate: '1959-01-03' },
                        { id: '06', name: '캘리포니아주', nameEn: 'California', order: 31, joinDate: '1850-09-09' },
                        { id: '15', name: '하와이주', nameEn: 'Hawaii', order: 50, joinDate: '1959-08-21' },
                        { id: '41', name: '오리건주', nameEn: 'Oregon', order: 33, joinDate: '1859-02-14' },
                        { id: '53', name: '워싱턴주', nameEn: 'Washington', order: 42, joinDate: '1889-11-11' }
                    ]
                }
            }
        }
    }
};

// 전체 지역 설정 (첫 화면용)
const US_REGION_SETTINGS = {
    center: [-98, 39],
    scale: 800
};

// 유틸리티 함수들
function getStateById(stateId) {
    for (const [regionKey, region] of Object.entries(US_STATES_DATA.regions)) {
        for (const [subregionKey, subregion] of Object.entries(region.subregions)) {
            const state = subregion.states.find(s => s.id === stateId);
            if (state) {
                return {
                    ...state,
                    region: regionKey,
                    regionName: region.name,
                    subregion: subregionKey,
                    subregionName: subregion.name,
                    color: region.color
                };
            }
        }
    }
    return null;
}

function getStateColor(stateId) {
    const state = getStateById(stateId);
    return state ? state.color : '#95a5a6';
}

function getAllStates() {
    const states = [];
    for (const region of Object.values(US_STATES_DATA.regions)) {
        for (const subregion of Object.values(region.subregions)) {
            states.push(...subregion.states);
        }
    }
    return states;
}

function getStatesInRegion(regionKey) {
    const region = US_STATES_DATA.regions[regionKey];
    if (!region) return [];
    const states = [];
    for (const subregion of Object.values(region.subregions)) {
        states.push(...subregion.states);
    }
    return states;
}

function getStatesInSubregion(regionKey, subregionKey) {
    return US_STATES_DATA.regions[regionKey]?.subregions[subregionKey]?.states || [];
}

function getRegionStateCount(regionKey) {
    return getStatesInRegion(regionKey).length;
}

function getSubregionStateCount(regionKey, subregionKey) {
    return getStatesInSubregion(regionKey, subregionKey).length;
}
