// 100대 산 퀴즈 - 드릴다운 방식

const GameState = {
    IDLE: 'idle',
    SELECT_REGION: 'select_region',
    SELECT_PROVINCE: 'select_province',
    SELECT_SUBREGION: 'select_subregion',  // 경기 북부/남부
    SELECT_CITY: 'select_city',            // 시 (성남시, 수원시 등)
    SELECT_GU: 'select_gu',                // 구 (분당구, 영통구 등)
    SELECT_DISTRICT: 'select_district',
    SELECT_MOUNTAIN: 'select_mountain',
    SHOWING_RESULT: 'showing_result'
};

const GameMode = {
    EXPLORE: 'explore',
    PRACTICE: 'practice',
    QUIZ: 'quiz',
    TEST: 'test'
};

// 지역 단축명
const SHORT_NAMES = {
    '서울/인천/경기': '수도권',
    '강원': '강원',
    '대전/세종/충남': '충남권',
    '충북': '충북',
    '대구/경북': '경북권',
    '부산/울산/경남': '경남권',
    '전북': '전북',
    '광주/전남': '전남권',
    '제주': '제주'
};

// 지역 → 시도 코드 매핑
const REGION_CODE_MAP = {
    '서울/인천/경기': { '서울': '11', '인천': '23', '경기': '31' },
    '강원': { '강원': '32' },
    '대전/세종/충남': { '대전': '25', '세종': '29', '충남': '34' },
    '충북': { '충북': '33' },
    '대구/경북': { '대구': '22', '경북': '37' },
    '부산/울산/경남': { '부산': '21', '울산': '26', '경남': '38' },
    '전북': { '전북': '35' },
    '광주/전남': { '광주': '24', '전남': '36' },
    '제주': { '제주': '39' }
};

// 시도 이름 매핑
const PROVINCE_NAMES = {
    '11': '서울', '23': '인천', '31': '경기',
    '32': '강원', '25': '대전', '29': '세종', '34': '충남',
    '33': '충북', '22': '대구', '37': '경북',
    '21': '부산', '26': '울산', '38': '경남',
    '35': '전북', '24': '광주', '36': '전남',
    '39': '제주'
};

// 경기도 북부/남부 구분
const GYEONGGI_NORTH = [
    '고양시덕양구', '고양시일산동구', '고양시일산서구',
    '파주시', '연천군', '포천시', '동두천시', '양주시',
    '의정부시', '구리시', '남양주시', '가평군'
];
const GYEONGGI_SOUTH = [
    '수원시장안구', '수원시권선구', '수원시팔달구', '수원시영통구',
    '성남시수정구', '성남시중원구', '성남시분당구',
    '용인시처인구', '용인시기흥구', '용인시수지구',
    '안양시만안구', '안양시동안구',
    '부천시', '광명시', '평택시', '안산시단원구', '안산시상록구',
    '과천시', '오산시', '시흥시', '군포시', '의왕시',
    '하남시', '이천시', '안성시', '김포시', '화성시',
    '광주시', '양평군', '여주시'
];

// 시→구 드릴다운이 필요한 시 (구가 여러개인 시)
function getBaseCityName(name) {
    // "성남시분당구" → "성남시"
    const match = name.match(/^(.+시).+구$/);
    return match ? match[1] : name;
}

function getGuName(name) {
    // "성남시분당구" → "분당구"
    const match = name.match(/^.+시(.+구)$/);
    return match ? match[1] : null;
}

function hasSiGu(name) {
    // "성남시분당구" 형태인지 확인
    return /^.+시.+구$/.test(name);
}

function getRegionColors() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? REGION_COLORS_DARK : REGION_COLORS;
}

function getSubRegionColors() {
    return document.documentElement.getAttribute('data-theme') === 'dark'
        ? { north: '#3498db', south: '#e74c3c' }
        : { north: '#64B5F6', south: '#F48FB1' };
}

class MountainQuiz {
    constructor() {
        this.mountains = MOUNTAINS || [];
        this.regions = MOUNTAIN_REGIONS || {};
        this.provincesGeo = null;
        this.municipalitiesGeo = null;
        this.projection = null;
        this.path = null;
        this.svg = null;
        this.mapGroup = null;
        this.width = 0;
        this.height = 0;
        this.score = 0;
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.timeLimit = 10000;
        this.timer = null;
        this.timeRemaining = 10000;
        this.state = GameState.IDLE;
        this.currentAnswer = null;
        this.questions = [];
        this.results = [];
        this.mode = null;
        this.selectedFilter = 'all';
        this.selectedRegion = null;
        this.selectedProvince = null;  // 시도 코드 (예: '11', '31')
        this.selectedSubRegion = null; // 경기 북부/남부
        this.selectedCity = null;      // 시 이름 (예: '성남시')
        this.selectedDistrict = null;  // 시군구 코드
        this.currentQuizMountain = null;
        this.init();
    }

    async init() {
        await this.loadMapData();

        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');

        if (mode && Object.values(GameMode).includes(mode)) {
            this.mode = mode;
            this.showStartScreen();
        } else {
            this.showModeScreen();
        }

        this.setupThemeToggle();
    }

    async loadMapData() {
        try {
            const provincesTopo = await d3.json('../data/provinces.json');
            this.provincesGeo = topojson.feature(provincesTopo, provincesTopo.objects[Object.keys(provincesTopo.objects)[0]]);
            const municipalitiesTopo = await d3.json('../data/municipalities.json');
            this.municipalitiesGeo = topojson.feature(municipalitiesTopo, municipalitiesTopo.objects[Object.keys(municipalitiesTopo.objects)[0]]);
            console.log('지도 데이터 로드 완료');
        } catch (error) {
            console.error('지도 데이터 로드 실패:', error);
        }
        console.log('산 데이터 준비 완료:', this.mountains.length, '개 산');
    }

    isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        themeToggle?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            if (newTheme === 'light') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', newTheme);
            }
            localStorage.setItem('theme', newTheme);
        });
    }

    showModeScreen() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('mode-screen').classList.add('active');
    }

    showStartScreen() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('start-screen').classList.add('active');

        const modeTitle = document.getElementById('mode-title');
        const modeDesc = document.getElementById('mode-description');
        const instructions = document.getElementById('instructions');

        switch (this.mode) {
            case GameMode.EXPLORE:
                modeTitle.textContent = '지도 둘러보기';
                modeDesc.textContent = '자유롭게 100대 명산을 탐색해보세요';
                instructions.innerHTML = `
                    <h3>둘러보기 방법</h3>
                    <ol>
                        <li>지역 → 시/도 → 시/군/구 순서로 클릭</li>
                        <li>산 위에 마우스를 올리면 정보 표시</li>
                        <li>뒤로가기로 상위 지역 이동</li>
                    </ol>
                `;
                break;
            case GameMode.PRACTICE:
                modeTitle.textContent = '연습 모드';
                modeDesc.textContent = '시간제한 없이 천천히 연습해보세요';
                break;
            case GameMode.QUIZ:
                modeTitle.textContent = '익숙해지기';
                modeDesc.textContent = '10초 안에 산을 찾아보세요!';
                break;
            case GameMode.TEST:
                modeTitle.textContent = '실전 테스트';
                modeDesc.textContent = '산 이름 없이 위치만 보고 맞춰보세요!';
                break;
        }

        this.createFilter();
        document.getElementById('start-btn').onclick = () => this.startGame();
    }

    createFilter() {
        const filterOptions = document.getElementById('filter-options');
        filterOptions.innerHTML = '';

        const filters = [
            { value: 'all', label: '전체 100대 산', count: this.mountains.length },
            { value: 'forest', label: '산림청 100대 명산', count: this.mountains.filter(m => m.rank.forest).length },
            { value: 'blackyak', label: '블랙야크 100대 명산', count: this.mountains.filter(m => m.rank.blackyak).length },
            { value: 'featured', label: '★ 주요 명산', count: this.mountains.filter(m => m.featured).length }
        ];

        filters.forEach((filter, idx) => {
            const option = document.createElement('label');
            option.className = 'filter-option' + (idx === 0 ? ' selected' : '');
            option.innerHTML = `
                <input type="radio" name="mountain-filter" value="${filter.value}" ${idx === 0 ? 'checked' : ''}>
                <span class="filter-label">${filter.label}</span>
                <span class="filter-sub">${filter.count}개</span>
            `;
            filterOptions.appendChild(option);
        });

        filterOptions.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', (e) => {
                filterOptions.querySelectorAll('.filter-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.closest('.filter-option').classList.add('selected');
                this.selectedFilter = e.target.value;
            });
        });
    }

    getFilteredMountains() {
        let filtered = this.mountains;
        switch (this.selectedFilter) {
            case 'forest':
                filtered = this.mountains.filter(m => m.rank.forest);
                break;
            case 'blackyak':
                filtered = this.mountains.filter(m => m.rank.blackyak);
                break;
            case 'featured':
                filtered = this.mountains.filter(m => m.featured);
                break;
        }
        return filtered;
    }

    addBackButton(onClick) {
        const existingBtn = document.querySelector('.back-btn');
        if (existingBtn) existingBtn.remove();
        const backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.innerHTML = '← 뒤로';
        backBtn.onclick = onClick;
        document.getElementById('map-container').appendChild(backBtn);
    }

    startGame() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('game-screen').classList.add('active');

        this.score = 0;
        this.currentQuestion = 0;
        this.results = [];
        this.selectedRegion = null;
        this.selectedProvince = null;
        this.selectedSubRegion = null;  // 경기 북부/남부
        this.selectedCity = null;
        this.selectedDistrict = null;
        this.currentQuizMountain = null;
        this.updateScore();

        setTimeout(() => {
            this.setupMap();

            if (this.mode === GameMode.EXPLORE) {
                this.startExploreMode();
            } else {
                this.generateQuestions();
                this.showNextQuestion();
            }
        }, 100);
    }

    setupMap() {
        const container = document.getElementById('map-container');
        this.width = container.clientWidth || 800;
        this.height = container.clientHeight || 500;
        if (this.height < 300) this.height = 400;

        d3.select('#map-svg').selectAll('*').remove();

        this.svg = d3.select('#map-svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        this.renderRegionMap();
    }

    // ===== 산 마커 배경 그리기 =====
    renderMountainMarkers(mountains, clickable = false) {
        if (!mountains || mountains.length === 0) return;

        const colors = getRegionColors();
        const isDark = this.isDarkMode();
        const markersGroup = this.mapGroup.append('g').attr('class', 'markers-group');

        markersGroup.selectAll('path.mountain')
            .data(mountains)
            .enter()
            .append('path')
            .attr('class', 'mountain')
            .attr('d', d3.symbol().type(d3.symbolTriangle).size(clickable ? 200 : 80))
            .attr('transform', d => {
                const coords = this.projection([d.lng, d.lat]);
                return coords ? `translate(${coords[0]}, ${coords[1]})` : 'translate(0,0)';
            })
            .attr('fill', d => colors[d.region] || '#888')
            .attr('stroke', clickable ? '#fff' : 'none')
            .attr('stroke-width', clickable ? 2 : 0)
            .attr('opacity', clickable ? 1 : 0.6)
            .attr('cursor', clickable ? 'pointer' : 'default')
            .attr('pointer-events', clickable ? 'auto' : 'none')
            .on('mouseover', clickable ? (event, d) => {
                this.showTooltip(event, d);
                d3.select(event.target)
                    .attr('d', d3.symbol().type(d3.symbolTriangle).size(350))
                    .attr('stroke-width', 3);
            } : null)
            .on('mouseout', clickable ? (event) => {
                this.hideTooltip();
                d3.select(event.target)
                    .attr('d', d3.symbol().type(d3.symbolTriangle).size(200))
                    .attr('stroke-width', 2);
            } : null)
            .on('click', clickable ? (event, d) => {
                if (this.mode !== GameMode.EXPLORE) {
                    this.checkAnswer(d);
                }
            } : null);

        // 산 라벨 (탐색 모드 & 클릭 가능한 경우만)
        if (clickable && this.mode === GameMode.EXPLORE) {
            markersGroup.selectAll('text.mountain-label')
                .data(mountains)
                .enter()
                .append('text')
                .attr('class', 'mountain-label')
                .attr('x', d => {
                    const coords = this.projection([d.lng, d.lat]);
                    return coords ? coords[0] : 0;
                })
                .attr('y', d => {
                    const coords = this.projection([d.lng, d.lat]);
                    return coords ? coords[1] - 15 : 0;
                })
                .attr('text-anchor', 'middle')
                .attr('font-size', '10px')
                .attr('font-weight', d => d.featured ? 'bold' : 'normal')
                .attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 2)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(d => d.name);
        }
    }

    // ===== 드릴다운: 지역 선택 (전국) =====
    renderRegionMap() {
        this.state = GameState.SELECT_REGION;
        this.mapGroup.selectAll('*').remove();
        document.querySelector('.back-btn')?.remove();

        if (this.currentQuizMountain) {
            document.getElementById('question-text').textContent = `"${this.currentQuizMountain.name}" 을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="font-weight: bold;">${this.currentQuizMountain.height}m</span> | 지역을 선택`;
        } else {
            document.getElementById('question-text').textContent = '지역을 선택하세요';
            document.getElementById('step-indicator').textContent = '9개 지역 중 선택';
        }

        const koreaFeatures = this.provincesGeo.features;
        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                { type: 'FeatureCollection', features: koreaFeatures });
        this.path = d3.geoPath().projection(this.projection);

        const colors = getRegionColors();
        const isDark = this.isDarkMode();

        const regionProvinceMap = {
            '서울/인천/경기': ['서울특별시', '인천광역시', '경기도'],
            '강원': ['강원특별자치도', '강원도'],
            '대전/세종/충남': ['대전광역시', '세종특별자치시', '충청남도'],
            '충북': ['충청북도'],
            '대구/경북': ['대구광역시', '경상북도'],
            '부산/울산/경남': ['부산광역시', '울산광역시', '경상남도'],
            '전북': ['전북특별자치도', '전라북도'],
            '광주/전남': ['광주광역시', '전라남도'],
            '제주': ['제주특별자치도']
        };

        // 지역별 배경
        Object.entries(regionProvinceMap).forEach(([regionName, provinces]) => {
            const regionFeatures = koreaFeatures.filter(f => provinces.includes(f.properties.name));

            this.mapGroup.selectAll(`path.region-bg-${regionName.replace(/\//g, '-')}`)
                .data(regionFeatures)
                .enter()
                .append('path')
                .attr('class', 'region-bg')
                .attr('data-region', regionName)
                .attr('d', this.path)
                .attr('fill', colors[regionName] || '#ccc')
                .attr('fill-opacity', 0.4)
                .attr('stroke', isDark ? '#fff' : '#333')
                .attr('stroke-width', 1)
                .attr('pointer-events', 'none');
        });

        // 산 마커 배경
        this.renderMountainMarkers(this.getFilteredMountains(), false);

        // 클릭 영역
        Object.entries(regionProvinceMap).forEach(([regionName, provinces]) => {
            const regionFeatures = koreaFeatures.filter(f => provinces.includes(f.properties.name));

            this.mapGroup.selectAll(`path.region-click-${regionName.replace(/\//g, '-')}`)
                .data(regionFeatures)
                .enter()
                .append('path')
                .attr('class', 'region-click')
                .attr('data-region', regionName)
                .attr('d', this.path)
                .attr('fill', 'transparent')
                .attr('cursor', 'pointer')
                .on('mouseover', () => {
                    this.mapGroup.selectAll(`path.region-bg[data-region="${regionName}"]`)
                        .attr('fill-opacity', 0.7);
                })
                .on('mouseout', () => {
                    this.mapGroup.selectAll(`path.region-bg[data-region="${regionName}"]`)
                        .attr('fill-opacity', 0.4);
                })
                .on('click', () => this.handleRegionClick(regionName));
        });

        // 지역 라벨
        Object.keys(regionProvinceMap).forEach(regionName => {
            const provinces = regionProvinceMap[regionName];
            const regionFeatures = koreaFeatures.filter(f => provinces.includes(f.properties.name));
            if (regionFeatures.length === 0) return;

            const allCentroids = regionFeatures.map(f => this.path.centroid(f)).filter(c => !isNaN(c[0]));
            if (allCentroids.length === 0) return;

            const cx = allCentroids.reduce((sum, c) => sum + c[0], 0) / allCentroids.length;
            const cy = allCentroids.reduce((sum, c) => sum + c[1], 0) / allCentroids.length;

            const displayName = SHORT_NAMES[regionName] || regionName;
            const mountainCount = this.getFilteredMountains().filter(m => m.region === regionName).length;

            this.mapGroup.append('text')
                .attr('x', cx).attr('y', cy)
                .attr('text-anchor', 'middle')
                .attr('font-size', '13px')
                .attr('font-weight', 'bold')
                .attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 3)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(displayName);

            this.mapGroup.append('text')
                .attr('x', cx).attr('y', cy + 14)
                .attr('text-anchor', 'middle')
                .attr('font-size', '10px')
                .attr('fill', isDark ? '#aaa' : '#666')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 2)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(`${mountainCount}개 산`);
        });
    }

    handleRegionClick(regionName) {
        this.selectedRegion = regionName;
        const codeMap = REGION_CODE_MAP[regionName];

        // 시도가 1개면 바로 시군구 선택으로
        if (Object.keys(codeMap).length === 1) {
            this.selectedProvince = Object.values(codeMap)[0];
            this.renderDistrictMap();
        } else {
            this.renderProvinceMap();
        }
    }

    // ===== 드릴다운: 시도 선택 (수도권, 충남권 등) =====
    renderProvinceMap() {
        this.state = GameState.SELECT_PROVINCE;
        this.mapGroup.selectAll('*').remove();

        const regionName = this.selectedRegion;
        const codeMap = REGION_CODE_MAP[regionName];
        const codes = Object.values(codeMap);

        if (this.currentQuizMountain) {
            document.getElementById('question-text').textContent = `"${this.currentQuizMountain.name}" 을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="font-weight: bold;">${this.currentQuizMountain.height}m</span> | ${SHORT_NAMES[regionName]} 시/도 선택`;
        } else {
            document.getElementById('question-text').textContent = `${SHORT_NAMES[regionName]} 시/도를 선택하세요`;
            document.getElementById('step-indicator').textContent = `${codes.length}개 시/도`;
        }

        this.addBackButton(() => {
            this.selectedRegion = null;
            this.renderRegionMap();
        });

        // 시군구 지도 사용
        const municipalityFeatures = this.municipalitiesGeo.features.filter(f =>
            codes.some(code => f.properties.code?.startsWith(code))
        );

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                { type: 'FeatureCollection', features: municipalityFeatures });
        this.path = d3.geoPath().projection(this.projection);

        const isDark = this.isDarkMode();
        const colors = ['#64B5F6', '#81C784', '#FFB74D', '#BA68C8', '#F48FB1'];

        // 시도별로 색상 지정
        const provinceColorMap = new Map();
        Object.entries(codeMap).forEach(([name, code], idx) => {
            provinceColorMap.set(code, colors[idx % colors.length]);
        });

        // 시군구 배경 (시도별 색상)
        this.mapGroup.selectAll('path.municipality-bg')
            .data(municipalityFeatures)
            .enter()
            .append('path')
            .attr('class', 'municipality-bg')
            .attr('d', this.path)
            .attr('fill', d => {
                const code = d.properties.code?.substring(0, 2);
                return provinceColorMap.get(code) || '#ccc';
            })
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#555' : '#bbb')
            .attr('stroke-width', 0.5)
            .attr('pointer-events', 'none');

        // 산 마커
        const regionMountains = this.getFilteredMountains().filter(m => m.region === regionName);
        this.renderMountainMarkers(regionMountains, false);

        // 클릭 영역 (시도별)
        Object.entries(codeMap).forEach(([provinceName, code]) => {
            const provinceFeatures = municipalityFeatures.filter(f => f.properties.code?.startsWith(code));

            this.mapGroup.selectAll(`path.province-click-${code}`)
                .data(provinceFeatures)
                .enter()
                .append('path')
                .attr('class', 'province-click')
                .attr('data-code', code)
                .attr('d', this.path)
                .attr('fill', 'transparent')
                .attr('cursor', 'pointer')
                .on('mouseover', () => {
                    this.mapGroup.selectAll(`path.municipality-bg`)
                        .filter(d => d.properties.code?.startsWith(code))
                        .attr('fill-opacity', 0.6);
                })
                .on('mouseout', () => {
                    this.mapGroup.selectAll(`path.municipality-bg`)
                        .filter(d => d.properties.code?.startsWith(code))
                        .attr('fill-opacity', 0.3);
                })
                .on('click', () => {
                    this.selectedProvince = code;
                    // 경기도면 북부/남부 선택으로
                    if (code === '31') {
                        this.renderSubRegionMap();
                    } else {
                        this.renderDistrictMap();
                    }
                });
        });

        // 시도 라벨
        Object.entries(codeMap).forEach(([provinceName, code]) => {
            const provinceFeatures = municipalityFeatures.filter(f => f.properties.code?.startsWith(code));
            const centroids = provinceFeatures.map(f => this.path.centroid(f)).filter(c => !isNaN(c[0]));
            if (centroids.length === 0) return;

            const cx = centroids.reduce((sum, c) => sum + c[0], 0) / centroids.length;
            const cy = centroids.reduce((sum, c) => sum + c[1], 0) / centroids.length;

            const mountainCount = regionMountains.filter(m => {
                const mCode = this.getMountainProvinceCode(m);
                return mCode === code;
            }).length;

            this.mapGroup.append('text')
                .attr('x', cx).attr('y', cy)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .attr('font-weight', 'bold')
                .attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 3)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(provinceName);

            this.mapGroup.append('text')
                .attr('x', cx).attr('y', cy + 14)
                .attr('text-anchor', 'middle')
                .attr('font-size', '10px')
                .attr('fill', isDark ? '#aaa' : '#666')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 2)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(`${mountainCount}개 산`);
        });
    }

    // ===== 드릴다운: 경기도 북부/남부 선택 =====
    renderSubRegionMap() {
        this.state = GameState.SELECT_SUBREGION;
        this.mapGroup.selectAll('*').remove();

        if (this.currentQuizMountain) {
            document.getElementById('question-text').textContent = `"${this.currentQuizMountain.name}" 을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="font-weight: bold;">${this.currentQuizMountain.height}m</span> | 경기 북부/남부 선택`;
        } else {
            document.getElementById('question-text').textContent = '경기도 지역을 선택하세요';
            document.getElementById('step-indicator').textContent = '북부 또는 남부 선택';
        }

        this.addBackButton(() => {
            this.selectedProvince = null;
            this.renderProvinceMap();
        });

        const gyeonggiDistricts = this.municipalitiesGeo.features.filter(f =>
            f.properties.code?.startsWith('31')
        );
        const northDistricts = gyeonggiDistricts.filter(f => GYEONGGI_NORTH.includes(f.properties.name));
        const southDistricts = gyeonggiDistricts.filter(f => GYEONGGI_SOUTH.includes(f.properties.name));

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                { type: 'FeatureCollection', features: gyeonggiDistricts });
        this.path = d3.geoPath().projection(this.projection);

        const subColors = getSubRegionColors();
        const isDark = this.isDarkMode();

        // 북부 배경
        this.mapGroup.selectAll('path.north')
            .data(northDistricts)
            .enter()
            .append('path')
            .attr('class', 'north subregion')
            .attr('d', this.path)
            .attr('fill', subColors.north)
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#fff' : '#333')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none');

        // 남부 배경
        this.mapGroup.selectAll('path.south')
            .data(southDistricts)
            .enter()
            .append('path')
            .attr('class', 'south subregion')
            .attr('d', this.path)
            .attr('fill', subColors.south)
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#fff' : '#333')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none');

        // 산 마커 배경 (경기도 산만)
        const gyeonggiMountains = this.getFilteredMountains().filter(m =>
            this.getMountainProvinceCode(m) === '31'
        );
        this.renderMountainMarkers(gyeonggiMountains, false);

        // 북부 클릭 영역
        this.mapGroup.selectAll('path.north-click')
            .data(northDistricts)
            .enter()
            .append('path')
            .attr('class', 'north-click')
            .attr('d', this.path)
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', () => {
                this.mapGroup.selectAll('path.north').attr('fill-opacity', 0.6);
            })
            .on('mouseout', () => {
                this.mapGroup.selectAll('path.north').attr('fill-opacity', 0.3);
            })
            .on('click', () => this.handleSubRegionClick('north'));

        // 남부 클릭 영역
        this.mapGroup.selectAll('path.south-click')
            .data(southDistricts)
            .enter()
            .append('path')
            .attr('class', 'south-click')
            .attr('d', this.path)
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', () => {
                this.mapGroup.selectAll('path.south').attr('fill-opacity', 0.6);
            })
            .on('mouseout', () => {
                this.mapGroup.selectAll('path.south').attr('fill-opacity', 0.3);
            })
            .on('click', () => this.handleSubRegionClick('south'));

        // 라벨
        const northCount = gyeonggiMountains.filter(m => {
            const district = this.municipalitiesGeo.features.find(f =>
                f.properties.name === m.city && f.properties.code?.startsWith('31')
            );
            return district && GYEONGGI_NORTH.includes(district.properties.name);
        }).length;

        const southCount = gyeonggiMountains.filter(m => {
            const district = this.municipalitiesGeo.features.find(f =>
                f.properties.name === m.city && f.properties.code?.startsWith('31')
            );
            return district && GYEONGGI_SOUTH.includes(district.properties.name);
        }).length;

        if (northDistricts.length > 0) {
            const northCentroid = d3.geoCentroid({ type: 'FeatureCollection', features: northDistricts });
            const nc = this.projection(northCentroid);
            this.mapGroup.append('text').attr('x', nc[0]).attr('y', nc[1]).attr('text-anchor', 'middle')
                .attr('font-size', '16px').attr('font-weight', 'bold').attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff').attr('stroke-width', 3).attr('paint-order', 'stroke')
                .attr('pointer-events', 'none').text('북부');
            this.mapGroup.append('text').attr('x', nc[0]).attr('y', nc[1] + 18).attr('text-anchor', 'middle')
                .attr('font-size', '11px').attr('fill', isDark ? '#aaa' : '#666')
                .attr('stroke', isDark ? '#000' : '#fff').attr('stroke-width', 2).attr('paint-order', 'stroke')
                .attr('pointer-events', 'none').text(`${northCount}개 산`);
        }
        if (southDistricts.length > 0) {
            const southCentroid = d3.geoCentroid({ type: 'FeatureCollection', features: southDistricts });
            const sc = this.projection(southCentroid);
            this.mapGroup.append('text').attr('x', sc[0]).attr('y', sc[1]).attr('text-anchor', 'middle')
                .attr('font-size', '16px').attr('font-weight', 'bold').attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff').attr('stroke-width', 3).attr('paint-order', 'stroke')
                .attr('pointer-events', 'none').text('남부');
            this.mapGroup.append('text').attr('x', sc[0]).attr('y', sc[1] + 18).attr('text-anchor', 'middle')
                .attr('font-size', '11px').attr('fill', isDark ? '#aaa' : '#666')
                .attr('stroke', isDark ? '#000' : '#fff').attr('stroke-width', 2).attr('paint-order', 'stroke')
                .attr('pointer-events', 'none').text(`${southCount}개 산`);
        }
    }

    handleSubRegionClick(subRegion) {
        this.selectedSubRegion = subRegion;
        this.renderCityMap();  // 경기도는 시 → 구 단계로
    }

    // ===== 드릴다운: 시/군 선택 (경기도용 - 시를 먼저 선택) =====
    renderCityMap() {
        this.state = GameState.SELECT_CITY;
        this.mapGroup.selectAll('*').remove();

        const subRegion = this.selectedSubRegion;
        const targetList = subRegion === 'north' ? GYEONGGI_NORTH : GYEONGGI_SOUTH;

        // 해당 지역 모든 시군구 가져오기
        const allDistricts = this.municipalitiesGeo.features.filter(f =>
            f.properties.code?.startsWith('31') && targetList.includes(f.properties.name)
        );

        // "시" 단위로 그룹화 (성남시분당구 → 성남시)
        const cityMap = new Map();
        allDistricts.forEach(d => {
            const baseName = getBaseCityName(d.properties.name);
            if (!cityMap.has(baseName)) {
                cityMap.set(baseName, []);
            }
            cityMap.get(baseName).push(d);
        });

        if (this.currentQuizMountain) {
            document.getElementById('question-text').textContent = `"${this.currentQuizMountain.name}" 을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="font-weight: bold;">${this.currentQuizMountain.height}m</span> | 경기 ${subRegion === 'north' ? '북부' : '남부'} 시/군 선택`;
        } else {
            document.getElementById('question-text').textContent = `경기 ${subRegion === 'north' ? '북부' : '남부'} 시/군을 선택하세요`;
            document.getElementById('step-indicator').textContent = `${cityMap.size}개 지역`;
        }
        this.addBackButton(() => this.renderSubRegionMap());

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                { type: 'FeatureCollection', features: allDistricts });
        this.path = d3.geoPath().projection(this.projection);

        const colorMap = this.buildCityColorMap(allDistricts);
        const isDark = this.isDarkMode();

        // 시군구 배경 (반투명) - 같은 시는 같은 색
        this.mapGroup.selectAll('path.district')
            .data(allDistricts)
            .enter()
            .append('path')
            .attr('class', d => `district city-${getBaseCityName(d.properties.name).replace(/\s/g, '')}`)
            .attr('d', this.path)
            .attr('fill', d => colorMap.get(getBaseCityName(d.properties.name)) || '#ccc')
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#fff' : '#333')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none');

        // 산 마커 배경
        const districtNames = allDistricts.map(d => d.properties.name);
        const cityMountains = this.getFilteredMountains().filter(m =>
            this.getMountainProvinceCode(m) === '31' && districtNames.includes(m.city)
        );
        this.renderMountainMarkers(cityMountains, false);

        // 클릭 영역 - 같은 "시"는 모두 같은 클릭으로 처리
        this.mapGroup.selectAll('path.district-click')
            .data(allDistricts)
            .enter()
            .append('path')
            .attr('class', 'district-click')
            .attr('d', this.path)
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                const baseName = getBaseCityName(d.properties.name);
                this.mapGroup.selectAll('path.district')
                    .filter(p => getBaseCityName(p.properties.name) === baseName)
                    .attr('fill-opacity', 0.6);
            })
            .on('mouseout', (event, d) => {
                const baseName = getBaseCityName(d.properties.name);
                this.mapGroup.selectAll('path.district')
                    .filter(p => getBaseCityName(p.properties.name) === baseName)
                    .attr('fill-opacity', 0.3);
            })
            .on('click', (event, d) => this.handleCityClick(getBaseCityName(d.properties.name)));

        // 시/군 라벨 (시 단위로만 표시)
        cityMap.forEach((districts, cityName) => {
            const allCoords = districts.flatMap(d => {
                const centroid = this.path.centroid(d);
                return isNaN(centroid[0]) ? [] : [centroid];
            });
            if (allCoords.length === 0) return;

            const cx = allCoords.reduce((sum, c) => sum + c[0], 0) / allCoords.length;
            const cy = allCoords.reduce((sum, c) => sum + c[1], 0) / allCoords.length;

            const displayName = cityName.replace(/시$/, '').replace(/군$/, '');
            const districtNamesInCity = districts.map(d => d.properties.name);
            const mountainCount = cityMountains.filter(m => districtNamesInCity.includes(m.city)).length;

            this.mapGroup.append('text')
                .attr('x', cx).attr('y', cy)
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px')
                .attr('font-weight', 'bold')
                .attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 2)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(displayName);
            if (mountainCount > 0) {
                this.mapGroup.append('text')
                    .attr('x', cx).attr('y', cy + 12)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '9px')
                    .attr('fill', isDark ? '#aaa' : '#666')
                    .attr('stroke', isDark ? '#000' : '#fff')
                    .attr('stroke-width', 2)
                    .attr('paint-order', 'stroke')
                    .attr('pointer-events', 'none')
                    .text(`${mountainCount}산`);
            }
        });
    }

    buildCityColorMap(districts) {
        const colors = this.isDarkMode()
            ? ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22', '#34495e']
            : ['#F8A5A5', '#7FB3D5', '#7DCEA0', '#F7DC6F', '#C9A0DC', '#76D7C4', '#F5B971', '#AEB6BF'];
        const colorMap = new Map();
        districts.forEach(d => {
            const name = getBaseCityName(d.properties.name);
            if (!colorMap.has(name)) colorMap.set(name, colors[colorMap.size % colors.length]);
        });
        return colorMap;
    }

    handleCityClick(cityName) {
        this.selectedCity = cityName;

        // 해당 시에 구가 여러개 있는지 확인
        const targetList = this.selectedSubRegion === 'north' ? GYEONGGI_NORTH : GYEONGGI_SOUTH;
        const guDistricts = this.municipalitiesGeo.features.filter(f =>
            f.properties.code?.startsWith('31') &&
            targetList.includes(f.properties.name) &&
            getBaseCityName(f.properties.name) === cityName &&
            hasSiGu(f.properties.name)
        );

        if (guDistricts.length > 1) {
            // 구가 여러개면 구 선택 화면으로
            this.renderGuMap();
        } else {
            // 구가 없거나 하나면 바로 산 화면으로
            const district = this.municipalitiesGeo.features.find(f =>
                f.properties.code?.startsWith('31') &&
                targetList.includes(f.properties.name) &&
                getBaseCityName(f.properties.name) === cityName
            );
            if (district) {
                this.selectedDistrict = district.properties.code;
                this.renderMountainMap(district.properties.name);
            }
        }
    }

    // ===== 드릴다운: 구 선택 (성남시 → 분당구/수정구/중원구) =====
    renderGuMap() {
        this.state = GameState.SELECT_GU;
        this.mapGroup.selectAll('*').remove();

        const cityName = this.selectedCity;
        const targetList = this.selectedSubRegion === 'north' ? GYEONGGI_NORTH : GYEONGGI_SOUTH;

        const guDistricts = this.municipalitiesGeo.features.filter(f =>
            f.properties.code?.startsWith('31') &&
            targetList.includes(f.properties.name) &&
            getBaseCityName(f.properties.name) === cityName
        );

        if (this.currentQuizMountain) {
            document.getElementById('question-text').textContent = `"${this.currentQuizMountain.name}" 을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="font-weight: bold;">${this.currentQuizMountain.height}m</span> | ${cityName} 구 선택`;
        } else {
            document.getElementById('question-text').textContent = `${cityName} 구를 선택하세요`;
            document.getElementById('step-indicator').textContent = `${guDistricts.length}개 구`;
        }
        this.addBackButton(() => this.renderCityMap());

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                { type: 'FeatureCollection', features: guDistricts });
        this.path = d3.geoPath().projection(this.projection);

        const colorMap = this.buildColorMap(guDistricts);
        const isDark = this.isDarkMode();

        // 구 배경 (반투명)
        this.mapGroup.selectAll('path.district')
            .data(guDistricts)
            .enter()
            .append('path')
            .attr('class', 'district')
            .attr('d', this.path)
            .attr('fill', d => colorMap.get(d.properties.name) || '#ccc')
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#fff' : '#333')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none');

        // 산 마커 배경 - 해당 시에 속한 모든 구의 산
        const guNames = guDistricts.map(d => d.properties.name);
        const cityMountains = this.getFilteredMountains().filter(m =>
            this.getMountainProvinceCode(m) === '31' && guNames.includes(m.city)
        );
        this.renderMountainMarkers(cityMountains, false);

        // 클릭 영역
        this.mapGroup.selectAll('path.district-click')
            .data(guDistricts)
            .enter()
            .append('path')
            .attr('class', 'district-click')
            .attr('d', this.path)
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                this.mapGroup.selectAll('path.district')
                    .filter(p => p.properties.code === d.properties.code)
                    .attr('fill-opacity', 0.6);
            })
            .on('mouseout', (event, d) => {
                this.mapGroup.selectAll('path.district')
                    .filter(p => p.properties.code === d.properties.code)
                    .attr('fill-opacity', 0.3);
            })
            .on('click', (event, d) => {
                this.selectedDistrict = d.properties.code;
                this.renderMountainMap(d.properties.name);
            });

        // 구 라벨
        guDistricts.forEach(d => {
            const centroid = this.path.centroid(d);
            if (isNaN(centroid[0])) return;
            const guName = getGuName(d.properties.name) || d.properties.name;
            const displayName = guName.replace(/구$/, '');
            const mountainCount = cityMountains.filter(m => m.city === d.properties.name).length;

            this.mapGroup.append('text')
                .attr('x', centroid[0]).attr('y', centroid[1])
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 2)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(displayName);
            if (mountainCount > 0) {
                this.mapGroup.append('text')
                    .attr('x', centroid[0]).attr('y', centroid[1] + 14)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '10px')
                    .attr('fill', isDark ? '#aaa' : '#666')
                    .attr('stroke', isDark ? '#000' : '#fff')
                    .attr('stroke-width', 2)
                    .attr('paint-order', 'stroke')
                    .attr('pointer-events', 'none')
                    .text(`${mountainCount}산`);
            }
        });
    }

    getMountainProvinceCode(mountain) {
        // 산의 province 이름으로 코드 찾기
        const provinceNameToCode = {
            '서울특별시': '11', '인천광역시': '23', '경기도': '31',
            '강원특별자치도': '32', '강원도': '32',
            '대전광역시': '25', '세종특별자치시': '29', '충청남도': '34',
            '충청북도': '33',
            '대구광역시': '22', '경상북도': '37',
            '부산광역시': '21', '울산광역시': '26', '경상남도': '38',
            '전북특별자치도': '35', '전라북도': '35',
            '광주광역시': '24', '전라남도': '36',
            '제주특별자치도': '39'
        };
        return provinceNameToCode[mountain.province] || '';
    }

    // ===== 드릴다운: 시군구 선택 =====
    renderDistrictMap() {
        this.state = GameState.SELECT_DISTRICT;
        this.mapGroup.selectAll('*').remove();

        const code = this.selectedProvince;
        const provinceName = PROVINCE_NAMES[code];

        // 해당 시도의 시군구
        const districtFeatures = this.municipalitiesGeo.features.filter(f =>
            f.properties.code?.startsWith(code)
        );

        // 해당 시도의 산
        const provinceMountains = this.getFilteredMountains().filter(m =>
            this.getMountainProvinceCode(m) === code
        );

        if (this.currentQuizMountain) {
            document.getElementById('question-text').textContent = `"${this.currentQuizMountain.name}" 을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="font-weight: bold;">${this.currentQuizMountain.height}m</span> | ${provinceName} 시/군/구 선택`;
        } else {
            document.getElementById('question-text').textContent = `${provinceName} 시/군/구를 선택하세요`;
            document.getElementById('step-indicator').textContent = `${districtFeatures.length}개 지역, ${provinceMountains.length}개 산`;
        }

        // 뒤로가기
        this.addBackButton(() => {
            this.selectedProvince = null;
            const codeMap = REGION_CODE_MAP[this.selectedRegion];
            if (Object.keys(codeMap).length === 1) {
                this.selectedRegion = null;
                this.renderRegionMap();
            } else {
                this.renderProvinceMap();
            }
        });

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                { type: 'FeatureCollection', features: districtFeatures });
        this.path = d3.geoPath().projection(this.projection);

        const isDark = this.isDarkMode();
        const colorMap = this.buildColorMap(districtFeatures);

        // 시군구 배경
        this.mapGroup.selectAll('path.district-bg')
            .data(districtFeatures)
            .enter()
            .append('path')
            .attr('class', 'district-bg')
            .attr('d', this.path)
            .attr('fill', d => colorMap.get(d.properties.name) || '#ccc')
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#666' : '#aaa')
            .attr('stroke-width', 0.5)
            .attr('pointer-events', 'none');

        // 산 마커 (배경)
        this.renderMountainMarkers(provinceMountains, false);

        // 클릭 영역
        this.mapGroup.selectAll('path.district-click')
            .data(districtFeatures)
            .enter()
            .append('path')
            .attr('class', 'district-click')
            .attr('d', this.path)
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                this.mapGroup.selectAll('path.district-bg')
                    .filter(p => p.properties.code === d.properties.code)
                    .attr('fill-opacity', 0.6);
            })
            .on('mouseout', (event, d) => {
                this.mapGroup.selectAll('path.district-bg')
                    .filter(p => p.properties.code === d.properties.code)
                    .attr('fill-opacity', 0.3);
            })
            .on('click', (event, d) => {
                this.selectedDistrict = d.properties.code;
                this.renderMountainMap(d.properties.name);
            });

        // 시군구 라벨
        districtFeatures.forEach(d => {
            const centroid = this.path.centroid(d);
            if (isNaN(centroid[0])) return;

            // 시군구 이름 단축
            let displayName = d.properties.name
                .replace(/특별자치시|광역시|특별시/g, '')
                .replace(/특별자치도|특별자치/g, '');

            // "성남시분당구" -> "분당구" or "분당"
            if (displayName.match(/시.+구$/)) {
                displayName = displayName.replace(/^.+시/, '');
            }
            displayName = displayName.replace(/시$|군$|구$/g, '');

            // 해당 시군구의 산 개수
            const districtMountains = provinceMountains.filter(m => m.city === d.properties.name);

            this.mapGroup.append('text')
                .attr('x', centroid[0]).attr('y', centroid[1])
                .attr('text-anchor', 'middle')
                .attr('font-size', '10px')
                .attr('font-weight', 'bold')
                .attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 2)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(displayName);

            if (districtMountains.length > 0) {
                this.mapGroup.append('text')
                    .attr('x', centroid[0]).attr('y', centroid[1] + 11)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '9px')
                    .attr('fill', isDark ? '#aaa' : '#666')
                    .attr('stroke', isDark ? '#000' : '#fff')
                    .attr('stroke-width', 2)
                    .attr('paint-order', 'stroke')
                    .attr('pointer-events', 'none')
                    .text(`${districtMountains.length}산`);
            }
        });
    }

    buildColorMap(features) {
        const palette = [
            '#AED6F1', '#A9DFBF', '#F9E79F', '#F5B7B1', '#D7BDE2',
            '#A3E4D7', '#FAD7A0', '#D5DBDB', '#ABEBC6', '#F8C471',
            '#BB8FCE', '#85C1E9', '#82E0AA', '#F7DC6F', '#E59866'
        ];
        const colorMap = new Map();
        features.forEach((f, i) => {
            colorMap.set(f.properties.name, palette[i % palette.length]);
        });
        return colorMap;
    }

    // ===== 드릴다운: 산 선택 (최종) =====
    renderMountainMap(districtName) {
        this.state = GameState.SELECT_MOUNTAIN;
        this.mapGroup.selectAll('*').remove();

        const code = this.selectedProvince;
        const districtCode = this.selectedDistrict;

        // 해당 시군구의 산
        const districtMountains = this.getFilteredMountains().filter(m =>
            this.getMountainProvinceCode(m) === code && m.city === districtName
        );

        // 해당 시도의 전체 산 (배경용)
        const provinceMountains = this.getFilteredMountains().filter(m =>
            this.getMountainProvinceCode(m) === code
        );

        // 표시 이름 (간략화)
        const shortName = districtName
            .replace(/특별자치시|광역시|특별시/g, '')
            .replace(/특별자치도|특별자치/g, '');

        if (this.currentQuizMountain) {
            document.getElementById('question-text').textContent = `"${this.currentQuizMountain.name}" 을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="font-weight: bold;">${this.currentQuizMountain.height}m</span> | ${shortName} (${districtMountains.length}개 산)`;
        } else {
            document.getElementById('question-text').textContent = `${shortName} (${districtMountains.length}개 산)`;
            document.getElementById('step-indicator').textContent = '산을 클릭하세요';
        }

        // 뒤로가기 - 경기도는 시/구 드릴다운 경로로
        this.addBackButton(() => {
            this.selectedDistrict = null;
            if (code === '31' && this.selectedSubRegion) {
                // 경기도: 구 선택 화면으로 돌아가거나 시 선택 화면으로
                if (this.selectedCity && hasSiGu(districtName)) {
                    this.renderGuMap();
                } else {
                    this.selectedCity = null;
                    this.renderCityMap();
                }
            } else {
                this.renderDistrictMap();
            }
        });

        // 해당 시군구 feature - code 또는 name으로 찾기
        let districtFeature = this.municipalitiesGeo.features.find(f =>
            f.properties.code === districtCode
        );
        // code로 못 찾으면 name으로 찾기
        if (!districtFeature) {
            districtFeature = this.municipalitiesGeo.features.find(f =>
                f.properties.name === districtName
            );
        }
        console.log('renderMountainMap:', districtName, 'code:', districtCode, 'found:', !!districtFeature);

        // 투영 설정
        const padding = 40;
        if (districtFeature) {
            this.projection = d3.geoMercator()
                .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                    districtFeature);
        }
        this.path = d3.geoPath().projection(this.projection);

        const isDark = this.isDarkMode();

        // 시군구 배경 - 테두리가 잘 보이도록
        if (districtFeature) {
            this.mapGroup.append('path')
                .datum(districtFeature)
                .attr('class', 'district-bg')
                .attr('d', this.path)
                .attr('fill', isDark ? '#2a2a3e' : '#e8eef5')
                .attr('fill-opacity', 1)
                .attr('stroke', isDark ? '#888' : '#666')
                .attr('stroke-width', 2);
        }

        // 클릭 가능한 산 마커
        this.renderMountainMarkers(districtMountains, true);

        // 산이 없으면 메시지 표시
        if (districtMountains.length === 0) {
            this.mapGroup.append('text')
                .attr('x', this.width / 2)
                .attr('y', this.height / 2)
                .attr('text-anchor', 'middle')
                .attr('font-size', '16px')
                .attr('fill', isDark ? '#888' : '#666')
                .text('이 지역에는 등록된 산이 없습니다');
        }
    }

    showTooltip(event, mountain) {
        let tooltip = document.getElementById('mountain-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'mountain-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 10px 14px;
                border-radius: 8px;
                font-size: 14px;
                pointer-events: none;
                z-index: 1000;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(tooltip);
        }

        const colors = getRegionColors();
        const regionColor = colors[mountain.region] || '#888';

        tooltip.innerHTML = `
            <div style="border-left: 3px solid ${regionColor}; padding-left: 10px;">
                <strong style="font-size: 15px;">${mountain.name}</strong>
                ${mountain.featured ? '<span style="color: gold;"> ★</span>' : ''}<br>
                <span style="color: ${regionColor};">${mountain.height}m</span>
                <span style="color: #aaa;"> · ${mountain.city}</span>
            </div>
        `;
        tooltip.style.left = `${event.clientX + 15}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
        tooltip.style.display = 'block';
    }

    hideTooltip() {
        const tooltip = document.getElementById('mountain-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    }

    startExploreMode() {
        document.querySelector('.timer-container').style.display = 'none';
        document.querySelector('.stats').style.opacity = '0.3';
    }

    generateQuestions() {
        const filteredMountains = this.getFilteredMountains();
        const shuffled = [...filteredMountains].sort(() => Math.random() - 0.5);
        this.questions = shuffled.slice(0, Math.min(this.totalQuestions, shuffled.length));
    }

    showNextQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
            return;
        }

        this.state = GameState.SELECT_REGION;
        this.currentAnswer = this.questions[this.currentQuestion];
        this.currentQuizMountain = this.currentAnswer;

        // 드릴다운 상태 초기화
        this.selectedRegion = null;
        this.selectedProvince = null;
        this.selectedSubRegion = null;  // 경기 북부/남부
        this.selectedCity = null;
        this.selectedDistrict = null;

        document.getElementById('question-text').textContent = `"${this.currentAnswer.name}" 을 찾으세요`;
        document.getElementById('step-indicator').innerHTML =
            `<span style="font-weight: bold;">${this.currentAnswer.height}m</span> · ${this.currentAnswer.province}`;
        document.getElementById('question-num').textContent = `${this.currentQuestion + 1}/${this.questions.length}`;

        if (this.mode === GameMode.QUIZ || this.mode === GameMode.TEST) {
            this.startTimer();
        } else {
            document.querySelector('.timer-container').style.display = 'none';
        }

        this.showFeedback('');
        this.renderRegionMap();
    }

    startTimer() {
        this.timeRemaining = this.timeLimit;
        this.updateTimerDisplay();
        document.querySelector('.timer-container').style.display = '';

        this.timer = setInterval(() => {
            this.timeRemaining -= 100;
            this.updateTimerDisplay();
            if (this.timeRemaining <= 0) this.handleTimeout();
        }, 100);
    }

    updateTimerDisplay() {
        const seconds = (this.timeRemaining / 1000).toFixed(1);
        document.getElementById('timer').textContent = seconds;

        const percent = (this.timeRemaining / this.timeLimit) * 100;
        document.getElementById('timer-fill').style.width = `${percent}%`;

        const timerFill = document.getElementById('timer-fill');
        if (percent <= 30) timerFill.style.backgroundColor = '#e74c3c';
        else if (percent <= 60) timerFill.style.backgroundColor = '#f39c12';
        else timerFill.style.backgroundColor = '#2ecc71';
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    handleTimeout() {
        this.stopTimer();
        this.state = GameState.SHOWING_RESULT;

        this.results.push({ mountain: this.currentAnswer, correct: false, timeout: true });
        this.showFeedback(`시간 초과! 정답: ${this.currentAnswer.name}`, false);

        setTimeout(() => {
            this.currentQuizMountain = null;
            this.currentQuestion++;
            this.showNextQuestion();
        }, 2000);
    }

    checkAnswer(selectedMountain) {
        if (this.state !== GameState.SELECT_MOUNTAIN) return;

        this.stopTimer();
        this.state = GameState.SHOWING_RESULT;

        const isCorrect = selectedMountain.id === this.currentAnswer.id;

        if (isCorrect) {
            const timeBonus = Math.ceil((this.timeRemaining / this.timeLimit) * 10);
            const earnedScore = this.mode === GameMode.PRACTICE ? 10 : timeBonus;
            this.score += earnedScore;
            this.updateScore();
            this.showFeedback(`정답! +${earnedScore}점`, true);
        } else {
            this.showFeedback(`오답! 정답: ${this.currentAnswer.name}`, false);
        }

        this.results.push({ mountain: this.currentAnswer, correct: isCorrect, selected: selectedMountain });

        setTimeout(() => {
            this.currentQuizMountain = null;
            this.currentQuestion++;
            this.showNextQuestion();
        }, 1500);
    }

    showFeedback(message, isCorrect = null) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = 'feedback';
        if (isCorrect === true) feedback.classList.add('correct');
        if (isCorrect === false) feedback.classList.add('incorrect');
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    endGame() {
        this.state = GameState.IDLE;
        this.stopTimer();

        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('result-screen').classList.add('active');

        const maxScore = this.questions.length * 10;
        document.getElementById('final-score').textContent = this.score;
        document.querySelector('.max-score').textContent = `/ ${maxScore}`;

        const details = document.getElementById('result-details');
        const correctCount = this.results.filter(r => r.correct).length;
        const percent = Math.round((correctCount / this.results.length) * 100);

        const colors = getRegionColors();

        details.innerHTML = `
            <div class="result-stat">
                <span>정답률</span>
                <strong>${correctCount}/${this.results.length} (${percent}%)</strong>
            </div>
            <div class="result-list">
                ${this.results.map((r, i) => `
                    <div class="result-item ${r.correct ? 'correct' : 'incorrect'}">
                        <span class="result-num">${i + 1}</span>
                        <span class="result-station">${r.mountain.name}</span>
                        <span class="result-line" style="color: ${colors[r.mountain.region]}">${r.mountain.height}m</span>
                        <span class="result-mark">${r.correct ? '✓' : '✗'}</span>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('restart-btn').onclick = () => this.startGame();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MountainQuiz();
});
