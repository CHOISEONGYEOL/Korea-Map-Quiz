// UN 회원국 기준 국가 데이터 - 3단계 구조 (대륙 → 하위지역 → 국가)
// 하위지역은 UN geoscheme 기준

const WORLD_DATA = {
    // ==================== 아시아 (Asia) ====================
    asia: {
        name: '아시아',
        nameEn: 'Asia',
        color: '#e74c3c',
        subregions: {
            eastAsia: {
                name: '동아시아',
                nameEn: 'East Asia',
                center: [125, 38],
                scale: 700,
                countries: [
                    { id: '392', name: '일본', nameEn: 'Japan' },
                    { id: '410', name: '대한민국', nameEn: 'South Korea' },
                    { id: '408', name: '북한', nameEn: 'North Korea' },
                    { id: '496', name: '몽골', nameEn: 'Mongolia' }
                ]
            },
            southeastAsia: {
                name: '동남아시아',
                nameEn: 'Southeast Asia',
                center: [115, 5],
                scale: 700,
                countries: [
                    { id: '104', name: '미얀마', nameEn: 'Myanmar' },
                    { id: '764', name: '태국', nameEn: 'Thailand' },
                    { id: '704', name: '베트남', nameEn: 'Vietnam' },
                    { id: '418', name: '라오스', nameEn: 'Laos' },
                    { id: '116', name: '캄보디아', nameEn: 'Cambodia' },
                    { id: '458', name: '말레이시아', nameEn: 'Malaysia' },
                    { id: '702', name: '싱가포르', nameEn: 'Singapore' },
                    { id: '360', name: '인도네시아', nameEn: 'Indonesia' },
                    { id: '608', name: '필리핀', nameEn: 'Philippines' },
                    { id: '096', name: '브루나이', nameEn: 'Brunei' },
                    { id: '626', name: '동티모르', nameEn: 'Timor-Leste' }
                ]
            },
            southAsia: {
                name: '남아시아',
                nameEn: 'South Asia',
                center: [78, 22],
                scale: 700,
                countries: [
                    { id: '356', name: '인도', nameEn: 'India' },
                    { id: '586', name: '파키스탄', nameEn: 'Pakistan' },
                    { id: '050', name: '방글라데시', nameEn: 'Bangladesh' },
                    { id: '144', name: '스리랑카', nameEn: 'Sri Lanka' },
                    { id: '524', name: '네팔', nameEn: 'Nepal' },
                    { id: '064', name: '부탄', nameEn: 'Bhutan' },
                    { id: '462', name: '몰디브', nameEn: 'Maldives' },
                    { id: '004', name: '아프가니스탄', nameEn: 'Afghanistan' }
                ]
            },
            centralAsia: {
                name: '중앙아시아',
                nameEn: 'Central Asia',
                center: [65, 42],
                scale: 700,
                countries: [
                    { id: '398', name: '카자흐스탄', nameEn: 'Kazakhstan' },
                    { id: '860', name: '우즈베키스탄', nameEn: 'Uzbekistan' },
                    { id: '795', name: '투르크메니스탄', nameEn: 'Turkmenistan' },
                    { id: '417', name: '키르기스스탄', nameEn: 'Kyrgyzstan' },
                    { id: '762', name: '타지키스탄', nameEn: 'Tajikistan' }
                ]
            },
            westAsia: {
                name: '서아시아',
                nameEn: 'West Asia',
                center: [45, 30],
                scale: 800,
                countries: [
                    { id: '792', name: '튀르키예', nameEn: 'Turkey' },
                    { id: '364', name: '이란', nameEn: 'Iran' },
                    { id: '368', name: '이라크', nameEn: 'Iraq' },
                    { id: '682', name: '사우디아라비아', nameEn: 'Saudi Arabia' },
                    { id: '887', name: '예멘', nameEn: 'Yemen' },
                    { id: '512', name: '오만', nameEn: 'Oman' },
                    { id: '784', name: '아랍에미리트', nameEn: 'UAE' },
                    { id: '634', name: '카타르', nameEn: 'Qatar' },
                    { id: '048', name: '바레인', nameEn: 'Bahrain' },
                    { id: '414', name: '쿠웨이트', nameEn: 'Kuwait' },
                    { id: '760', name: '시리아', nameEn: 'Syria' },
                    { id: '422', name: '레바논', nameEn: 'Lebanon' },
                    { id: '400', name: '요르단', nameEn: 'Jordan' },
                    { id: '376', name: '이스라엘', nameEn: 'Israel' },
                    { id: '275', name: '팔레스타인', nameEn: 'Palestine' },
                    { id: '196', name: '키프로스', nameEn: 'Cyprus' },
                    { id: '051', name: '아르메니아', nameEn: 'Armenia' },
                    { id: '268', name: '조지아', nameEn: 'Georgia' },
                    { id: '031', name: '아제르바이잔', nameEn: 'Azerbaijan' }
                ]
            }
        }
    },

    // ==================== 유럽 (Europe) ====================
    europe: {
        name: '유럽',
        nameEn: 'Europe',
        color: '#3498db',
        subregions: {
            northernEurope: {
                name: '북유럽',
                nameEn: 'Northern Europe',
                center: [15, 62],
                scale: 800,
                countries: [
                    { id: '752', name: '스웨덴', nameEn: 'Sweden' },
                    { id: '578', name: '노르웨이', nameEn: 'Norway' },
                    { id: '246', name: '핀란드', nameEn: 'Finland' },
                    { id: '208', name: '덴마크', nameEn: 'Denmark' },
                    { id: '352', name: '아이슬란드', nameEn: 'Iceland' },
                    { id: '233', name: '에스토니아', nameEn: 'Estonia' },
                    { id: '428', name: '라트비아', nameEn: 'Latvia' },
                    { id: '440', name: '리투아니아', nameEn: 'Lithuania' }
                ]
            },
            westernEurope: {
                name: '서유럽',
                nameEn: 'Western Europe',
                center: [3, 48],
                scale: 1200,
                countries: [
                    { id: '250', name: '프랑스', nameEn: 'France' },
                    { id: '276', name: '독일', nameEn: 'Germany' },
                    { id: '528', name: '네덜란드', nameEn: 'Netherlands' },
                    { id: '056', name: '벨기에', nameEn: 'Belgium' },
                    { id: '442', name: '룩셈부르크', nameEn: 'Luxembourg' },
                    { id: '756', name: '스위스', nameEn: 'Switzerland' },
                    { id: '040', name: '오스트리아', nameEn: 'Austria' },
                    { id: '438', name: '리히텐슈타인', nameEn: 'Liechtenstein' },
                    { id: '492', name: '모나코', nameEn: 'Monaco' }
                ]
            },
            southernEurope: {
                name: '남유럽',
                nameEn: 'Southern Europe',
                center: [12, 42],
                scale: 1000,
                countries: [
                    { id: '380', name: '이탈리아', nameEn: 'Italy' },
                    { id: '724', name: '스페인', nameEn: 'Spain' },
                    { id: '620', name: '포르투갈', nameEn: 'Portugal' },
                    { id: '300', name: '그리스', nameEn: 'Greece' },
                    { id: '020', name: '안도라', nameEn: 'Andorra' },
                    { id: '674', name: '산마리노', nameEn: 'San Marino' },
                    { id: '336', name: '바티칸', nameEn: 'Vatican City' },
                    { id: '470', name: '몰타', nameEn: 'Malta' },
                    { id: '705', name: '슬로베니아', nameEn: 'Slovenia' },
                    { id: '191', name: '크로아티아', nameEn: 'Croatia' },
                    { id: '070', name: '보스니아 헤르체고비나', nameEn: 'Bosnia and Herzegovina' },
                    { id: '688', name: '세르비아', nameEn: 'Serbia' },
                    { id: '499', name: '몬테네그로', nameEn: 'Montenegro' },
                    { id: '008', name: '알바니아', nameEn: 'Albania' },
                    { id: '807', name: '북마케도니아', nameEn: 'North Macedonia' }
                ]
            },
            easternEurope: {
                name: '동유럽',
                nameEn: 'Eastern Europe',
                center: [25, 52],
                scale: 800,
                countries: [
                    { id: '804', name: '우크라이나', nameEn: 'Ukraine' },
                    { id: '616', name: '폴란드', nameEn: 'Poland' },
                    { id: '642', name: '루마니아', nameEn: 'Romania' },
                    { id: '203', name: '체코', nameEn: 'Czechia' },
                    { id: '348', name: '헝가리', nameEn: 'Hungary' },
                    { id: '100', name: '불가리아', nameEn: 'Bulgaria' },
                    { id: '703', name: '슬로바키아', nameEn: 'Slovakia' },
                    { id: '112', name: '벨라루스', nameEn: 'Belarus' },
                    { id: '498', name: '몰도바', nameEn: 'Moldova' }
                ]
            },
            britishIsles: {
                name: '영국·아일랜드',
                nameEn: 'British Isles',
                center: [-5, 54],
                scale: 1400,
                countries: [
                    { id: '826', name: '영국', nameEn: 'United Kingdom' },
                    { id: '372', name: '아일랜드', nameEn: 'Ireland' }
                ]
            }
        }
    },

    // ==================== 아프리카 (Africa) ====================
    africa: {
        name: '아프리카',
        nameEn: 'Africa',
        color: '#f39c12',
        subregions: {
            northAfrica: {
                name: '북아프리카',
                nameEn: 'North Africa',
                center: [10, 28],
                scale: 700,
                countries: [
                    { id: '818', name: '이집트', nameEn: 'Egypt' },
                    { id: '434', name: '리비아', nameEn: 'Libya' },
                    { id: '788', name: '튀니지', nameEn: 'Tunisia' },
                    { id: '012', name: '알제리', nameEn: 'Algeria' },
                    { id: '504', name: '모로코', nameEn: 'Morocco' },
                    { id: '729', name: '수단', nameEn: 'Sudan' }
                ]
            },
            westAfrica: {
                name: '서아프리카',
                nameEn: 'West Africa',
                center: [-5, 10],
                scale: 900,
                countries: [
                    { id: '566', name: '나이지리아', nameEn: 'Nigeria' },
                    { id: '288', name: '가나', nameEn: 'Ghana' },
                    { id: '384', name: '코트디부아르', nameEn: "Côte d'Ivoire" },
                    { id: '686', name: '세네갈', nameEn: 'Senegal' },
                    { id: '466', name: '말리', nameEn: 'Mali' },
                    { id: '854', name: '부르키나파소', nameEn: 'Burkina Faso' },
                    { id: '562', name: '니제르', nameEn: 'Niger' },
                    { id: '324', name: '기니', nameEn: 'Guinea' },
                    { id: '204', name: '베냉', nameEn: 'Benin' },
                    { id: '768', name: '토고', nameEn: 'Togo' },
                    { id: '694', name: '시에라리온', nameEn: 'Sierra Leone' },
                    { id: '430', name: '라이베리아', nameEn: 'Liberia' },
                    { id: '478', name: '모리타니', nameEn: 'Mauritania' },
                    { id: '270', name: '감비아', nameEn: 'Gambia' },
                    { id: '624', name: '기니비사우', nameEn: 'Guinea-Bissau' },
                    { id: '132', name: '카보베르데', nameEn: 'Cabo Verde' }
                ]
            },
            centralAfrica: {
                name: '중앙아프리카',
                nameEn: 'Central Africa',
                center: [18, 0],
                scale: 800,
                countries: [
                    { id: '180', name: '콩고민주공화국', nameEn: 'DR Congo' },
                    { id: '120', name: '카메룬', nameEn: 'Cameroon' },
                    { id: '140', name: '중앙아프리카공화국', nameEn: 'Central African Republic' },
                    { id: '148', name: '차드', nameEn: 'Chad' },
                    { id: '178', name: '콩고', nameEn: 'Congo' },
                    { id: '266', name: '가봉', nameEn: 'Gabon' },
                    { id: '226', name: '적도기니', nameEn: 'Equatorial Guinea' },
                    { id: '678', name: '상투메프린시페', nameEn: 'São Tomé and Príncipe' },
                    { id: '024', name: '앙골라', nameEn: 'Angola' }
                ]
            },
            eastAfrica: {
                name: '동아프리카',
                nameEn: 'East Africa',
                center: [38, -2],
                scale: 800,
                countries: [
                    { id: '404', name: '케냐', nameEn: 'Kenya' },
                    { id: '834', name: '탄자니아', nameEn: 'Tanzania' },
                    { id: '800', name: '우간다', nameEn: 'Uganda' },
                    { id: '231', name: '에티오피아', nameEn: 'Ethiopia' },
                    { id: '706', name: '소말리아', nameEn: 'Somalia' },
                    { id: '646', name: '르완다', nameEn: 'Rwanda' },
                    { id: '108', name: '부룬디', nameEn: 'Burundi' },
                    { id: '728', name: '남수단', nameEn: 'South Sudan' },
                    { id: '232', name: '에리트레아', nameEn: 'Eritrea' },
                    { id: '262', name: '지부티', nameEn: 'Djibouti' },
                    { id: '174', name: '코모로', nameEn: 'Comoros' },
                    { id: '480', name: '모리셔스', nameEn: 'Mauritius' },
                    { id: '690', name: '세이셸', nameEn: 'Seychelles' },
                    { id: '450', name: '마다가스카르', nameEn: 'Madagascar' }
                ]
            },
            southernAfrica: {
                name: '남아프리카',
                nameEn: 'Southern Africa',
                center: [25, -22],
                scale: 900,
                countries: [
                    { id: '710', name: '남아프리카공화국', nameEn: 'South Africa' },
                    { id: '516', name: '나미비아', nameEn: 'Namibia' },
                    { id: '072', name: '보츠와나', nameEn: 'Botswana' },
                    { id: '716', name: '짐바브웨', nameEn: 'Zimbabwe' },
                    { id: '894', name: '잠비아', nameEn: 'Zambia' },
                    { id: '508', name: '모잠비크', nameEn: 'Mozambique' },
                    { id: '454', name: '말라위', nameEn: 'Malawi' },
                    { id: '748', name: '에스와티니', nameEn: 'Eswatini' },
                    { id: '426', name: '레소토', nameEn: 'Lesotho' }
                ]
            }
        }
    },

    // ==================== 북아메리카 (North America) ====================
    northAmerica: {
        name: '북아메리카',
        nameEn: 'North America',
        color: '#2ecc71',
        subregions: {
            mexico: {
                name: '멕시코',
                nameEn: 'Mexico',
                center: [-102, 24],
                scale: 800,
                countries: [
                    { id: '484', name: '멕시코', nameEn: 'Mexico' }
                ]
            },
            centralAmerica: {
                name: '중앙아메리카',
                nameEn: 'Central America',
                center: [-87, 14],
                scale: 1400,
                countries: [
                    { id: '320', name: '과테말라', nameEn: 'Guatemala' },
                    { id: '084', name: '벨리즈', nameEn: 'Belize' },
                    { id: '340', name: '온두라스', nameEn: 'Honduras' },
                    { id: '222', name: '엘살바도르', nameEn: 'El Salvador' },
                    { id: '558', name: '니카라과', nameEn: 'Nicaragua' },
                    { id: '188', name: '코스타리카', nameEn: 'Costa Rica' },
                    { id: '591', name: '파나마', nameEn: 'Panama' }
                ]
            },
            caribbean: {
                name: '카리브해',
                nameEn: 'Caribbean',
                center: [-72, 18],
                scale: 1400,
                countries: [
                    { id: '192', name: '쿠바', nameEn: 'Cuba' },
                    { id: '388', name: '자메이카', nameEn: 'Jamaica' },
                    { id: '332', name: '아이티', nameEn: 'Haiti' },
                    { id: '214', name: '도미니카공화국', nameEn: 'Dominican Republic' },
                    { id: '044', name: '바하마', nameEn: 'Bahamas' },
                    { id: '780', name: '트리니다드토바고', nameEn: 'Trinidad and Tobago' },
                    { id: '052', name: '바베이도스', nameEn: 'Barbados' },
                    { id: '662', name: '세인트루시아', nameEn: 'Saint Lucia' },
                    { id: '670', name: '세인트빈센트그레나딘', nameEn: 'St. Vincent & Grenadines' },
                    { id: '308', name: '그레나다', nameEn: 'Grenada' },
                    { id: '028', name: '앤티가바부다', nameEn: 'Antigua and Barbuda' },
                    { id: '212', name: '도미니카연방', nameEn: 'Dominica' },
                    { id: '659', name: '세인트키츠네비스', nameEn: 'Saint Kitts and Nevis' }
                ]
            }
        }
    },

    // ==================== 남아메리카 (South America) ====================
    southAmerica: {
        name: '남아메리카',
        nameEn: 'South America',
        color: '#9b59b6',
        subregions: {
            northernSouthAmerica: {
                name: '북부 남미',
                nameEn: 'Northern South America',
                center: [-65, 5],
                scale: 800,
                countries: [
                    { id: '862', name: '베네수엘라', nameEn: 'Venezuela' },
                    { id: '170', name: '콜롬비아', nameEn: 'Colombia' },
                    { id: '218', name: '에콰도르', nameEn: 'Ecuador' },
                    { id: '328', name: '가이아나', nameEn: 'Guyana' },
                    { id: '740', name: '수리남', nameEn: 'Suriname' }
                ]
            },
            westernSouthAmerica: {
                name: '서부 남미',
                nameEn: 'Western South America',
                center: [-72, -15],
                scale: 600,
                countries: [
                    { id: '604', name: '페루', nameEn: 'Peru' },
                    { id: '068', name: '볼리비아', nameEn: 'Bolivia' },
                    { id: '152', name: '칠레', nameEn: 'Chile' }
                ]
            },
            easternSouthAmerica: {
                name: '동부 남미',
                nameEn: 'Eastern South America',
                center: [-50, -15],
                scale: 550,
                countries: [
                    { id: '076', name: '브라질', nameEn: 'Brazil' },
                    { id: '032', name: '아르헨티나', nameEn: 'Argentina' },
                    { id: '858', name: '우루과이', nameEn: 'Uruguay' },
                    { id: '600', name: '파라과이', nameEn: 'Paraguay' }
                ]
            }
        }
    },

    // ==================== 오세아니아 (Oceania) ====================
    oceania: {
        name: '오세아니아',
        nameEn: 'Oceania',
        color: '#1abc9c',
        subregions: {
            australasia: {
                name: '오스트랄라시아',
                nameEn: 'Australasia',
                center: [140, -28],
                scale: 600,
                countries: [
                    { id: '036', name: '호주', nameEn: 'Australia' },
                    { id: '554', name: '뉴질랜드', nameEn: 'New Zealand' }
                ]
            },
            melanesia: {
                name: '멜라네시아',
                nameEn: 'Melanesia',
                center: [160, -8],
                scale: 1000,
                countries: [
                    { id: '598', name: '파푸아뉴기니', nameEn: 'Papua New Guinea' },
                    { id: '242', name: '피지', nameEn: 'Fiji' },
                    { id: '090', name: '솔로몬제도', nameEn: 'Solomon Islands' },
                    { id: '548', name: '바누아투', nameEn: 'Vanuatu' }
                ]
            },
            micronesia: {
                name: '미크로네시아',
                nameEn: 'Micronesia',
                center: [155, 8],
                scale: 1400,
                countries: [
                    { id: '583', name: '미크로네시아', nameEn: 'Micronesia' },
                    { id: '584', name: '마셜제도', nameEn: 'Marshall Islands' },
                    { id: '585', name: '팔라우', nameEn: 'Palau' },
                    { id: '296', name: '키리바시', nameEn: 'Kiribati' },
                    { id: '520', name: '나우루', nameEn: 'Nauru' }
                ]
            },
            polynesia: {
                name: '폴리네시아',
                nameEn: 'Polynesia',
                center: [-170, -15],
                scale: 1000,
                countries: [
                    { id: '882', name: '사모아', nameEn: 'Samoa' },
                    { id: '776', name: '통가', nameEn: 'Tonga' },
                    { id: '798', name: '투발루', nameEn: 'Tuvalu' }
                ]
            }
        }
    }
};

// 대륙 전체 설정 (대륙 선택 화면용)
const CONTINENT_SETTINGS = {
    asia: { center: [90, 30], scale: 200 },
    europe: { center: [15, 52], scale: 400 },
    africa: { center: [20, 0], scale: 250 },
    northAmerica: { center: [-80, 18], scale: 900 },  // 멕시코+중앙아메리카+카리브해 한 화면에
    southAmerica: { center: [-60, -20], scale: 280 },
    oceania: { center: [150, -20], scale: 350 },
    world: { center: [0, 20], scale: 120 }
};

// 유틸리티 함수들

// 대륙의 모든 국가 가져오기
function getAllCountriesInContinent(continentKey) {
    const continent = WORLD_DATA[continentKey];
    if (!continent) return [];

    const countries = [];
    for (const subregion of Object.values(continent.subregions)) {
        countries.push(...subregion.countries);
    }
    return countries;
}

// 하위지역의 국가 가져오기
function getCountriesInSubregion(continentKey, subregionKey) {
    return WORLD_DATA[continentKey]?.subregions[subregionKey]?.countries || [];
}

// 국가 ID로 국가 정보 찾기
function getCountryById(countryId) {
    for (const [continentKey, continent] of Object.entries(WORLD_DATA)) {
        for (const [subregionKey, subregion] of Object.entries(continent.subregions)) {
            const country = subregion.countries.find(c => c.id === countryId);
            if (country) {
                return {
                    ...country,
                    continent: continentKey,
                    continentName: continent.name,
                    subregion: subregionKey,
                    subregionName: subregion.name,
                    color: continent.color
                };
            }
        }
    }
    return null;
}

// 국가 색상 가져오기
function getCountryColor(countryId) {
    const info = getCountryById(countryId);
    return info ? info.color : '#95a5a6';
}

// 전체 국가 수
function getTotalCountryCount() {
    let count = 0;
    for (const continent of Object.values(WORLD_DATA)) {
        for (const subregion of Object.values(continent.subregions)) {
            count += subregion.countries.length;
        }
    }
    return count;
}

// 대륙별 국가 수
function getContinentCountryCount(continentKey) {
    return getAllCountriesInContinent(continentKey).length;
}

// 하위지역별 국가 수
function getSubregionCountryCount(continentKey, subregionKey) {
    return getCountriesInSubregion(continentKey, subregionKey).length;
}

// 전 세계 모든 국가 가져오기
function getAllWorldCountries() {
    const countries = [];
    for (const continentKey of Object.keys(WORLD_DATA)) {
        countries.push(...getAllCountriesInContinent(continentKey));
    }
    return countries;
}

// 전 세계 국가 수
function getWorldCountryCount() {
    return getAllWorldCountries().length;
}
