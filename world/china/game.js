// 중국 34개 행정구역 퀴즈 게임 - 지역별 드릴다운 구조
// 한국/미국 지도처럼: 전체 지도 → 지역 클릭 → 해당 지역 확대 → 성 클릭

class ChinaQuiz {
    constructor() {
        this.currentMode = null;
        this.currentRegion = null;
        this.mapView = 'country'; // 'country', 'region'
        this.selectedRegionFilter = 'all';

        this.provinces = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.totalQuestions = 10;
        this.timer = null;
        this.timeLeft = 5;
        this.results = [];
        this.topoData = null;
        this.svg = null;
        this.projection = null;
        this.path = null;
        this.targetProvince = null;
        this.shuffledProvinces = [];
        this.zoom = null;
        this.mapGroup = null;

        // 헤더 제목 요소
        this.headerTitleEl = null;

        this.init();
    }

    async init() {
        const params = new URLSearchParams(window.location.search);
        this.currentMode = params.get('mode');

        // 헤더 제목 요소 참조
        this.headerTitleEl = document.getElementById('header-title');

        this.setupTheme();
        await this.loadMapData();
        this.setupScreen();
        this.setupEventListeners();
    }

    setupTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            if (newTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            localStorage.setItem('theme', newTheme);

            if (this.topoData) {
                this.redrawCurrentMap();
            }
        });
    }

    async loadMapData() {
        try {
            // 중국 성별 지도 데이터 로드 (jsdelivr CDN)
            const response = await fetch('https://cdn.jsdelivr.net/gh/longwosion/geojson-map-china@master/china.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            this.topoData = await response.json();
            console.log('지도 데이터 로드 성공');
        } catch (error) {
            console.error('지도 데이터 로드 실패:', error);
            alert('지도 데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
        }
    }

    setupScreen() {
        if (this.currentMode) {
            // 모드가 선택됨
            if (this.currentMode === 'explore') {
                this.startGame();
            } else {
                this.showScreen('start-screen');
                this.updateModeInfo();
            }
        } else {
            // 모드 선택 화면
            this.showScreen('mode-screen');
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        // quiz, test 모드에서만 stats 표시
        const container = document.querySelector('.container');
        const stats = document.querySelector('.stats');
        if (screenId === 'game-screen' && (this.currentMode === 'quiz' || this.currentMode === 'test')) {
            container.classList.add('show-stats');
            stats.classList.remove('timer-hidden');
        } else {
            container.classList.remove('show-stats');
        }

        const themeToggle = document.getElementById('theme-toggle');
        if (this.currentMode === 'explore' || screenId === 'mode-screen') {
            themeToggle.classList.remove('hidden');
        } else {
            themeToggle.classList.add('hidden');
        }

        // 모드 선택 화면(랜딩)에서는 헤더 제목 숨김
        if (screenId === 'mode-screen') {
            container.classList.add('hide-header');
        } else {
            container.classList.remove('hide-header');
        }
    }

    updateModeInfo() {
        const modeInfo = {
            explore: {
                title: '중국 지도 둘러보기',
                desc: '지역을 클릭해서 확대하고, 각 성의 위치를 확인해보세요.'
            },
            practice: {
                title: '중국 34개 행정구역 연습',
                desc: '먼저 지역을 클릭한 후, 해당 성을 찾아 클릭하세요. 시간제한 없음!'
            },
            quiz: {
                title: '중국 34개 행정구역 퀴즈',
                desc: '5초 안에 지역 → 성 순서로 클릭하세요!'
            },
            test: {
                title: '중국 34개 행정구역 실전 테스트',
                desc: '성 이름 없이 지도만 보고 맞춰보세요!'
            }
        };

        document.getElementById('mode-title').textContent = modeInfo[this.currentMode].title;
        document.getElementById('mode-description').textContent = modeInfo[this.currentMode].desc;

        // 헤더 제목을 모드명으로 변경
        const modeNames = {
            explore: '지도 둘러보기',
            practice: '연습 모드',
            quiz: '익숙해지기',
            test: '실전 테스트'
        };
        if (this.headerTitleEl && modeNames[this.currentMode]) {
            this.headerTitleEl.textContent = modeNames[this.currentMode];
        }
    }

    setupEventListeners() {
        document.getElementById('start-btn')?.addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restart-btn')?.addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });

        this.setupRegionFilter();
    }

    setupRegionFilter() {
        const filterContainer = document.getElementById('region-filter');
        const filterOptions = document.getElementById('filter-options');

        if (!filterContainer || !filterOptions) return;

        // 모드에 따라 필터 표시 여부 결정
        if (this.currentMode && this.currentMode !== 'explore') {
            filterContainer.classList.remove('hidden');
            this.generateFilterOptions(filterOptions);
        }
    }

    generateFilterOptions(container) {
        container.innerHTML = '';

        // 전체 옵션
        const allOption = document.createElement('label');
        allOption.className = 'filter-option selected';
        allOption.innerHTML = `
            <input type="radio" name="region" value="all" checked>
            <span class="filter-label">전체</span>
            <span class="filter-sub">34개 행정구역</span>
        `;
        container.appendChild(allOption);

        // 지역별 옵션 생성
        for (const [regionKey, region] of Object.entries(CHINA_DATA.regions)) {
            const option = document.createElement('label');
            option.className = 'filter-option';
            option.innerHTML = `
                <input type="radio" name="region" value="${regionKey}">
                <span class="filter-label">${region.name}</span>
                <span class="filter-sub">${region.provinces.length}개 지역</span>
            `;
            container.appendChild(option);
        }

        // 이벤트 리스너 추가
        container.querySelectorAll('.filter-option').forEach(option => {
            option.addEventListener('click', () => {
                container.querySelectorAll('.filter-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                const radio = option.querySelector('input[type="radio"]');
                radio.checked = true;
                this.selectedRegionFilter = radio.value;
            });
        });
    }

    getFilteredProvinces() {
        if (this.selectedRegionFilter === 'all') {
            return getAllProvinces();
        }
        return getProvincesInRegion(this.selectedRegionFilter);
    }

    startGame() {
        // 지도 데이터 로드 확인
        if (!this.topoData) {
            console.error('지도 데이터가 아직 로드되지 않았습니다');
            alert('지도 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        // 필터링된 행정구역 가져오기
        this.provinces = this.getFilteredProvinces();
        this.currentQuestion = 0;
        this.score = 0;
        this.results = [];
        this.mapView = 'country';
        this.currentRegion = null;

        this.totalQuestions = Math.min(10, this.provinces.length);
        this.shuffledProvinces = [...this.provinces].sort(() => Math.random() - 0.5);

        this.showScreen('game-screen');
        this.drawCountryMap();

        if (this.currentMode !== 'explore') {
            this.updateScore();
            this.nextQuestion();
        } else {
            document.getElementById('question-text').textContent = '지역을 클릭해서 탐색하세요';
            document.getElementById('province-info').textContent = '';
        }
    }

    redrawCurrentMap() {
        if (this.mapView === 'country') {
            this.drawCountryMap();
        } else if (this.mapView === 'region') {
            this.drawRegionMap(this.currentRegion);
        }
    }

    // 줌 기능 설정
    setupZoom(svg, width, height) {
        this.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [width, height]])
            .on('zoom', (event) => {
                if (this.mapGroup) {
                    this.mapGroup.attr('transform', event.transform);
                }
            });

        svg.call(this.zoom)
            .on('dblclick.zoom', null);

        this.addZoomResetButton(svg, width);
    }

    addZoomResetButton(svg, width) {
        const btnGroup = svg.append('g')
            .attr('class', 'zoom-reset-btn')
            .attr('transform', `translate(${width - 40}, 10)`)
            .attr('cursor', 'pointer')
            .on('click', () => {
                svg.transition().duration(300).call(this.zoom.transform, d3.zoomIdentity);
            });

        btnGroup.append('rect')
            .attr('width', 30)
            .attr('height', 30)
            .attr('rx', 5)
            .attr('fill', 'var(--bg-secondary)')
            .attr('stroke', 'var(--border-color)')
            .attr('stroke-width', 1);

        btnGroup.append('text')
            .attr('x', 15)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--text-primary)')
            .attr('font-size', '14px')
            .text('⟲');
    }

    // 전체 중국 지도 그리기 (지역별로 색상 구분)
    drawCountryMap() {
        this.mapView = 'country';
        const container = document.getElementById('map-container');
        const svg = d3.select('#map-svg');
        svg.selectAll('*').remove();

        const width = container.clientWidth;
        const height = Math.min(500, window.innerHeight * 0.55);

        svg.attr('width', width).attr('height', height);

        // 줌 기능 설정
        this.setupZoom(svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = svg.append('g').attr('class', 'map-group');

        // 중국 전체 보기 프로젝션
        this.projection = d3.geoMercator()
            .center([105, 35])
            .scale(width * 0.55)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        // 배경
        this.mapGroup.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'var(--bg-tertiary)');

        // GeoJSON 형식인지 TopoJSON인지 확인
        let features;
        if (this.topoData.type === 'FeatureCollection') {
            features = this.topoData.features;
        } else if (this.topoData.objects) {
            const objectKey = Object.keys(this.topoData.objects)[0];
            features = topojson.feature(this.topoData, this.topoData.objects[objectKey]).features;
        } else {
            console.error('지도 데이터 형식을 인식할 수 없습니다');
            return;
        }

        // 성 그리기 (지역별 색상)
        this.mapGroup.selectAll('.province')
            .data(features)
            .enter()
            .append('path')
            .attr('class', 'province country')
            .attr('d', this.path)
            .attr('fill', d => {
                const provinceName = d.properties.name;
                const provinceInfo = this.findProvinceByName(provinceName);
                return provinceInfo ? provinceInfo.color : '#95a5a6';
            })
            .attr('stroke', 'var(--map-stroke)')
            .attr('stroke-width', 0.8)
            .on('click', (event, d) => {
                // 클릭 = 선택 + 동작
                d3.selectAll('.province').classed('selected', false);
                d3.select(event.target).classed('selected', true);
                const provinceName = d.properties.name;
                const regionKey = this.getRegionByProvinceName(provinceName);
                const region = regionKey ? CHINA_DATA.regions[regionKey] : null;
                const regionName = region ? region.name : '';
                if (this.currentMode === 'explore') {
                    this.showFeedback(`${regionName} 선택됨`, 'info');
                } else {
                    this.handleCountryMapClick(d);
                }
            })
            .on('mouseover', function() {
                d3.select(this).attr('stroke-width', 2).style('filter', 'brightness(1.2)');
            })
            .on('mouseout', function() {
                d3.select(this).attr('stroke-width', 0.8).style('filter', 'none');
            });

        // 지역 라벨 (mapGroup이 아닌 svg에 추가해야 width/height 가져올 수 있음)
        if (this.currentMode !== 'test') {
            this.drawRegionLabels(svg);
        }

        this.svg = svg;

        // 단계 표시
        if (this.currentMode !== 'explore') {
            document.getElementById('province-info').textContent = '▶ 1단계: 지역을 선택하세요';
        }
    }

    findProvinceByName(name) {
        // 중국 성 이름 매핑 (지도 데이터의 이름 → 우리 데이터)
        // 알리바바 DataV GeoJSON은 "北京市", "河北省" 등 접미사가 붙음
        const nameMap = {
            '北京市': 'beijing', '天津市': 'tianjin', '河北省': 'hebei', '山西省': 'shanxi',
            '内蒙古自治区': 'neimenggu', '辽宁省': 'liaoning', '吉林省': 'jilin', '黑龙江省': 'heilongjiang',
            '上海市': 'shanghai', '江苏省': 'jiangsu', '浙江省': 'zhejiang', '安徽省': 'anhui',
            '福建省': 'fujian', '江西省': 'jiangxi', '山东省': 'shandong', '河南省': 'henan',
            '湖北省': 'hubei', '湖南省': 'hunan', '广东省': 'guangdong',
            '广西壮族自治区': 'guangxi', '海南省': 'hainan', '重庆市': 'chongqing',
            '四川省': 'sichuan', '贵州省': 'guizhou', '云南省': 'yunnan',
            '西藏自治区': 'xizang', '陕西省': 'shaanxi', '甘肃省': 'gansu',
            '青海省': 'qinghai', '宁夏回族自治区': 'ningxia', '新疆维吾尔自治区': 'xinjiang',
            '香港特别行政区': 'hongkong', '澳门特别行政区': 'macau', '台湾省': 'taiwan'
        };

        const id = nameMap[name];
        if (id) {
            return getProvinceById(id);
        }
        return null;
    }

    getRegionByProvinceName(name) {
        const provinceInfo = this.findProvinceByName(name);
        return provinceInfo ? provinceInfo.region : null;
    }

    drawRegionLabels(svg) {
        const regionLabels = [
            { name: '동북', x: 0.72, y: 0.18 },
            { name: '화북', x: 0.58, y: 0.32 },
            { name: '화동', x: 0.62, y: 0.58 },
            { name: '중남', x: 0.56, y: 0.72 },
            { name: '서남', x: 0.4, y: 0.65 },
            { name: '서북', x: 0.35, y: 0.35 }
        ];

        const width = +svg.attr('width');
        const height = +svg.attr('height');

        regionLabels.forEach(label => {
            svg.append('text')
                .attr('class', 'district-label')
                .attr('x', width * label.x)
                .attr('y', height * label.y)
                .attr('text-anchor', 'middle')
                .style('pointer-events', 'none')
                .text(label.name);
        });
    }

    handleCountryMapClick(feature) {
        const provinceName = feature.properties.name;
        const regionKey = this.getRegionByProvinceName(provinceName);

        if (!regionKey) return;

        if (this.currentMode === 'explore') {
            // 탐색 모드: 해당 지역으로 확대
            this.currentRegion = regionKey;
            this.drawRegionMap(regionKey);
            const region = CHINA_DATA.regions[regionKey];
            this.showFeedback(`${region.name} 지역으로 이동`, 'info');
            return;
        }

        // 퀴즈 모드: 정답 성이 속한 지역인지 확인
        const targetProvince = this.shuffledProvinces[this.currentQuestion];
        const targetInfo = getProvinceById(targetProvince.id);

        if (targetInfo.region === regionKey) {
            // 정답 지역 선택!
            this.currentRegion = regionKey;
            this.drawRegionMap(regionKey);
            document.getElementById('province-info').textContent = '▶ 2단계: 성을 선택하세요';
        } else {
            // 틀린 지역
            const correctRegion = CHINA_DATA.regions[targetInfo.region];
            this.showFeedback(`틀렸습니다! ${correctRegion.name} 지역을 선택하세요.`, 'incorrect');
        }
    }

    // 지역 확대 지도 그리기
    drawRegionMap(regionKey) {
        this.mapView = 'region';
        this.currentRegion = regionKey;

        const container = document.getElementById('map-container');
        const svg = d3.select('#map-svg');
        svg.selectAll('*').remove();

        const width = container.clientWidth;
        const height = Math.min(500, window.innerHeight * 0.55);

        svg.attr('width', width).attr('height', height);

        // 줌 기능 설정
        this.setupZoom(svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = svg.append('g').attr('class', 'map-group');

        const region = CHINA_DATA.regions[regionKey];

        // GeoJSON 또는 TopoJSON 처리
        let features;
        if (this.topoData.type === 'FeatureCollection') {
            features = this.topoData.features;
        } else if (this.topoData.objects) {
            const objectKey = Object.keys(this.topoData.objects)[0];
            features = topojson.feature(this.topoData, this.topoData.objects[objectKey]).features;
        } else {
            return;
        }

        // 해당 지역 성들만 필터링
        const regionProvinceIds = region.provinces.map(p => p.id);
        const regionFeatures = features.filter(d => {
            const provinceName = d.properties.name;
            const provinceInfo = this.findProvinceByName(provinceName);
            return provinceInfo && regionProvinceIds.includes(provinceInfo.id);
        });

        // 지역에 맞게 프로젝션 자동 조정
        const regionCollection = {
            type: 'FeatureCollection',
            features: regionFeatures
        };

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [width - padding, height - padding]], regionCollection);

        this.path = d3.geoPath().projection(this.projection);

        // 배경
        this.mapGroup.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'var(--bg-tertiary)');

        // 모든 성 (연한 배경)
        this.mapGroup.selectAll('.province-bg')
            .data(features)
            .enter()
            .append('path')
            .attr('class', 'province-bg')
            .attr('d', this.path)
            .attr('fill', '#ddd')
            .attr('stroke', '#aaa')
            .attr('stroke-width', 0.3);

        // 해당 지역 성들 (인접 성 색상 분리 적용)
        const colorPalette = this.getColorPalette();
        const colorAssignment = this.assignColorsToFeatures(regionFeatures);

        this.mapGroup.selectAll('.province')
            .data(regionFeatures)
            .enter()
            .append('path')
            .attr('class', 'province country')
            .attr('d', this.path)
            .attr('fill', d => colorPalette[colorAssignment.get(d.properties.name) || 0])
            .attr('stroke', 'var(--map-stroke)')
            .attr('stroke-width', 1)
            .on('click', (event, d) => {
                // 클릭 = 선택 + 동작
                d3.selectAll('.province').classed('selected', false);
                d3.select(event.target).classed('selected', true);
                const provinceInfo = this.findProvinceByName(d.properties.name);
                const name = provinceInfo ? provinceInfo.name : d.properties.name;
                if (this.currentMode === 'explore') {
                    this.showFeedback(`${name} 선택됨`, 'info');
                } else {
                    this.handleProvinceClick(d);
                }
            })
            .on('mouseover', function() {
                d3.select(this).attr('stroke-width', 2.5).style('filter', 'brightness(1.2)');
            })
            .on('mouseout', function() {
                d3.select(this).attr('stroke-width', 1).style('filter', 'none');
            });

        // 성 라벨 (test 모드 제외)
        if (this.currentMode !== 'test') {
            this.drawProvinceLabels(this.mapGroup, regionFeatures);
        }

        // 뒤로가기 버튼 (줌 그룹 밖에 배치)
        svg.append('rect')
            .attr('x', 10)
            .attr('y', 10)
            .attr('width', 80)
            .attr('height', 30)
            .attr('rx', 5)
            .attr('fill', 'var(--bg-secondary)')
            .attr('stroke', 'var(--border-color)')
            .attr('cursor', 'pointer')
            .on('click', () => this.goBackToCountry());

        svg.append('text')
            .attr('x', 50)
            .attr('y', 28)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--text-primary)')
            .attr('font-size', '12px')
            .attr('cursor', 'pointer')
            .text('← 뒤로')
            .on('click', () => this.goBackToCountry());

        this.svg = svg;
    }

    drawProvinceLabels(svg, features) {
        // 스마트 리더 라인 시스템: 필요한 경우에만 자동 생성
        const DIRECTIONS = [
            { name: 'E',  dx: 70,  dy: 0 },
            { name: 'W',  dx: -70, dy: 0 },
            { name: 'SE', dx: 50,  dy: 50 },
            { name: 'SW', dx: -50, dy: 50 },
            { name: 'NE', dx: 50,  dy: -50 },
            { name: 'NW', dx: -50, dy: -50 },
            { name: 'S',  dx: 0,   dy: 70 },
            { name: 'N',  dx: 0,   dy: -70 },
        ];

        // 선호 방향 힌트 (겹침 방지 최적화)
        const preferredDirection = {
            // 화북 - 밀집 지역
            'beijing': 'NE',
            'tianjin': 'E',
            'hebei': 'S',
            // 동부 해안
            'shanghai': 'E',
            'jiangsu': 'SE',
            'zhejiang': 'SE',
            'fujian': 'SE',
            'shandong': 'NE',
            // 특별행정구/대만
            'hongkong': 'SE',
            'macau': 'SW',
            'taiwan': 'E',
            // 남부
            'hainan': 'S',
            'guangdong': 'S',
            // 서부/내륙
            'ningxia': 'W',
            'chongqing': 'SW',
            'guizhou': 'SW',
            // 동북
            'liaoning': 'SE',
            'jilin': 'NE',
        };

        const placedLabels = [];
        const placedLines = [];

        // 지역 크기 계산
        const getFeatureSize = (feature) => {
            const bounds = this.path.bounds(feature);
            if (!bounds || isNaN(bounds[0][0])) return 0;
            return (bounds[1][0] - bounds[0][0]) * (bounds[1][1] - bounds[0][1]);
        };

        // 라벨이 지역 내부에 들어가는지 확인
        const labelFitsInFeature = (feature, labelWidth, labelHeight) => {
            const bounds = this.path.bounds(feature);
            if (!bounds || isNaN(bounds[0][0])) return false;
            const featureWidth = bounds[1][0] - bounds[0][0];
            const featureHeight = bounds[1][1] - bounds[0][1];
            return featureWidth > labelWidth * 1.2 && featureHeight > labelHeight * 1.2;
        };

        // 선분 교차 확인
        const linesIntersect = (line1, line2) => {
            const { x1: a1, y1: b1, x2: a2, y2: b2 } = line1;
            const { x1: c1, y1: d1, x2: c2, y2: d2 } = line2;
            const denom = (a2 - a1) * (d2 - d1) - (b2 - b1) * (c2 - c1);
            if (Math.abs(denom) < 0.001) return false;
            const t = ((c1 - a1) * (d2 - d1) - (d1 - b1) * (c2 - c1)) / denom;
            const u = -((a2 - a1) * (d1 - b1) - (b2 - b1) * (c1 - a1)) / denom;
            return t > 0.05 && t < 0.95 && u > 0.05 && u < 0.95;
        };

        // 라벨 겹침 확인
        const labelsOverlap = (rect1, rect2) => {
            return !(rect1.x + rect1.width < rect2.x || rect2.x + rect2.width < rect1.x ||
                     rect1.y + rect1.height < rect2.y || rect2.y + rect2.height < rect1.y);
        };

        // 중심 라벨이 다른 라벨과 겹치는지 확인
        const centerLabelOverlapsOthers = (centroid, labelWidth, labelHeight) => {
            const labelRect = {
                x: centroid[0] - labelWidth/2,
                y: centroid[1] - labelHeight/2,
                width: labelWidth,
                height: labelHeight
            };
            for (const placed of placedLabels) {
                if (labelsOverlap(labelRect, placed)) return true;
            }
            return false;
        };

        // 최적 방향 찾기
        const findBestDirection = (centroid, preferredDir, labelWidth, labelHeight) => {
            const sortedDirs = [...DIRECTIONS].sort((a, b) => {
                if (a.name === preferredDir) return -1;
                if (b.name === preferredDir) return 1;
                return 0;
            });

            for (const dir of sortedDirs) {
                const labelX = centroid[0] + dir.dx;
                const labelY = centroid[1] + dir.dy;
                const labelRect = { x: labelX - labelWidth/2, y: labelY - labelHeight/2, width: labelWidth, height: labelHeight };
                const newLine = { x1: centroid[0], y1: centroid[1], x2: labelX, y2: labelY };

                let hasConflict = false;
                for (const placed of placedLabels) {
                    if (labelsOverlap(labelRect, placed)) { hasConflict = true; break; }
                }
                if (!hasConflict) {
                    for (const placed of placedLines) {
                        if (linesIntersect(newLine, placed)) { hasConflict = true; break; }
                    }
                }
                if (!hasConflict) return dir;
            }
            return sortedDirs[0];
        };

        // 크기순 정렬 (큰 지역부터 처리)
        const sortedFeatures = [...features].sort((a, b) => getFeatureSize(b) - getFeatureSize(a));

        sortedFeatures.forEach(d => {
            const centroid = this.path.centroid(d);
            if (isNaN(centroid[0]) || isNaN(centroid[1])) return;

            const provinceInfo = this.findProvinceByName(d.properties.name);
            if (!provinceInfo) return;

            const provinceName = provinceInfo.name.replace('성', '').replace('자치구', '').replace('특별행정구', '');
            const labelWidth = provinceName.length * 8 + 10;
            const labelHeight = 14;

            // 스마트 판단: 리더 라인이 필요한가?
            const fitsInside = labelFitsInFeature(d, labelWidth, labelHeight);
            const wouldOverlap = centerLabelOverlapsOthers(centroid, labelWidth, labelHeight);
            const needsLeaderLine = !fitsInside || wouldOverlap;

            if (needsLeaderLine) {
                const preferredDir = preferredDirection[provinceInfo.id] || 'E';
                const bestDir = findBestDirection(centroid, preferredDir, labelWidth, labelHeight);

                const labelX = centroid[0] + bestDir.dx;
                const labelY = centroid[1] + bestDir.dy;

                placedLines.push({ x1: centroid[0], y1: centroid[1], x2: labelX, y2: labelY });
                placedLabels.push({ x: labelX - labelWidth/2, y: labelY - labelHeight/2, width: labelWidth, height: labelHeight });

                svg.append('line')
                    .attr('class', 'leader-line')
                    .attr('x1', centroid[0])
                    .attr('y1', centroid[1])
                    .attr('x2', labelX)
                    .attr('y2', labelY)
                    .attr('stroke', 'var(--map-label-color)')
                    .attr('stroke-width', 1)
                    .attr('opacity', 0.7)
                    .style('pointer-events', 'none');

                svg.append('text')
                    .attr('class', 'province-label district-label')
                    .attr('x', labelX)
                    .attr('y', labelY)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .text(provinceName)
                    .style('pointer-events', 'none');
            } else {
                placedLabels.push({ x: centroid[0] - labelWidth/2, y: centroid[1] - labelHeight/2, width: labelWidth, height: labelHeight });

                svg.append('text')
                    .attr('class', 'province-label district-label')
                    .attr('x', centroid[0])
                    .attr('y', centroid[1])
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .text(provinceName)
                    .style('pointer-events', 'none');
            }
        });
    }

    // 12색 조합 (한국 지도와 동일)
    getColorPalette() {
        const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';

        const darkModeColors = [
            '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c',
            '#e67e22', '#e91e63', '#00bcd4', '#8bc34a', '#ff5722', '#bdc3c7',
        ];

        const lightModeColors = [
            '#F48FB1', '#81C784', '#64B5F6', '#FFD54F', '#BA68C8', '#4DD0E1',
            '#FFB74D', '#F06292', '#4DB6AC', '#AED581', '#9575CD', '#A1887F',
        ];

        return isLightMode ? lightModeColors : darkModeColors;
    }

    // 인접 성 색상 분리 알고리즘 - 12색 최대 활용
    assignColorsToFeatures(features) {
        const palette = this.getColorPalette();
        const colorAssignment = new Map();
        const adjacency = new Map();

        features.forEach(f => adjacency.set(f.properties.name, new Set()));

        for (let i = 0; i < features.length; i++) {
            for (let j = i + 1; j < features.length; j++) {
                if (this.areFeaturesAdjacent(features[i], features[j])) {
                    adjacency.get(features[i].properties.name).add(features[j].properties.name);
                    adjacency.get(features[j].properties.name).add(features[i].properties.name);
                }
            }
        }

        const sortedFeatures = [...features].sort((a, b) =>
            adjacency.get(b.properties.name).size - adjacency.get(a.properties.name).size
        );

        // 각 색상 사용 횟수 추적 (균등 분배용)
        const colorUsageCount = new Array(palette.length).fill(0);

        sortedFeatures.forEach(feature => {
            const usedColors = new Set();
            adjacency.get(feature.properties.name).forEach(neighborName => {
                if (colorAssignment.has(neighborName)) {
                    usedColors.add(colorAssignment.get(neighborName));
                }
            });

            // 사용 가능한 색상들 중에서 가장 적게 사용된 색상 선택
            let bestColorIndex = 0;
            let minUsage = Infinity;
            for (let i = 0; i < palette.length; i++) {
                if (!usedColors.has(i) && colorUsageCount[i] < minUsage) {
                    minUsage = colorUsageCount[i];
                    bestColorIndex = i;
                }
            }

            colorAssignment.set(feature.properties.name, bestColorIndex);
            colorUsageCount[bestColorIndex]++;
        });

        return colorAssignment;
    }

    areFeaturesAdjacent(f1, f2) {
        const bounds1 = this.path.bounds(f1);
        const bounds2 = this.path.bounds(f2);

        const margin = 5;
        if (bounds1[1][0] + margin < bounds2[0][0] || bounds2[1][0] + margin < bounds1[0][0] ||
            bounds1[1][1] + margin < bounds2[0][1] || bounds2[1][1] + margin < bounds1[0][1]) {
            return false;
        }

        const coords1 = this.extractCoordinates(f1);
        const coords2 = this.extractCoordinates(f2);

        const threshold = 3;
        for (const p1 of coords1) {
            for (const p2 of coords2) {
                const dist = Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
                if (dist < threshold) return true;
            }
        }
        return false;
    }

    extractCoordinates(feature) {
        const coords = [];
        const geometry = feature.geometry;

        const processCoords = (coordArray) => {
            const step = Math.max(1, Math.floor(coordArray.length / 50));
            for (let i = 0; i < coordArray.length; i += step) {
                const projected = this.projection(coordArray[i]);
                if (projected && !isNaN(projected[0])) coords.push(projected);
            }
        };

        if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach(ring => processCoords(ring));
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(polygon => polygon.forEach(ring => processCoords(ring)));
        }

        return coords;
    }

    goBackToCountry() {
        if (this.currentMode === 'explore') {
            this.drawCountryMap();
            this.showFeedback('전체 지도로 돌아왔습니다', 'info');
        }
        // 퀴즈 모드에서는 뒤로가기 불가
    }

    handleProvinceClick(feature) {
        const provinceName = feature.properties.name;
        const provinceInfo = this.findProvinceByName(provinceName);

        if (this.currentMode === 'explore') {
            if (provinceInfo) {
                this.showFeedback(`${provinceInfo.name} (${provinceInfo.nameEn})`, 'info');
                document.getElementById('province-info').textContent =
                    `${provinceInfo.nameZh} | ${provinceInfo.type || '성'} | 수도: ${provinceInfo.capital}`;
            }
            return;
        }

        if (this.currentQuestion >= this.totalQuestions) return;

        const currentProvince = this.shuffledProvinces[this.currentQuestion];
        const isCorrect = provinceInfo && provinceInfo.id === currentProvince.id;

        this.stopTimer();

        if (isCorrect) {
            this.score += 10;
            this.results.push({ province: currentProvince.name, correct: true });
            this.highlightProvince(provinceName, 'correct');
            this.showFeedback('정답입니다!', 'correct');
        } else {
            this.results.push({
                province: currentProvince.name,
                correct: false,
                answer: provinceInfo?.name || '알 수 없음'
            });
            this.highlightProvince(provinceName, 'incorrect');
            this.highlightProvinceById(currentProvince.id, 'highlight');
            this.showFeedback(`오답! 정답은 ${currentProvince.name}입니다.`, 'incorrect');
        }

        this.updateScore();

        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < this.totalQuestions) {
                this.nextQuestion();
            } else {
                this.endGame();
            }
        }, 1500);
    }

    highlightProvince(provinceName, className) {
        this.svg.selectAll('.province')
            .filter(d => d.properties.name === provinceName)
            .classed(className, true);
    }

    highlightProvinceById(provinceId, className) {
        const province = getProvinceById(provinceId);
        if (!province) return;

        // 이름 매핑 역으로 찾기
        const nameMap = {
            'beijing': '北京', 'tianjin': '天津', 'hebei': '河北', 'shanxi': '山西',
            'neimenggu': '内蒙古', 'liaoning': '辽宁', 'jilin': '吉林', 'heilongjiang': '黑龙江',
            'shanghai': '上海', 'jiangsu': '江苏', 'zhejiang': '浙江', 'anhui': '安徽',
            'fujian': '福建', 'jiangxi': '江西', 'shandong': '山东', 'henan': '河南',
            'hubei': '湖北', 'hunan': '湖南', 'guangdong': '广东', 'guangxi': '广西',
            'hainan': '海南', 'chongqing': '重庆', 'sichuan': '四川', 'guizhou': '贵州',
            'yunnan': '云南', 'xizang': '西藏', 'shaanxi': '陕西', 'gansu': '甘肃',
            'qinghai': '青海', 'ningxia': '宁夏', 'xinjiang': '新疆',
            'hongkong': '香港', 'macau': '澳门', 'taiwan': '台湾'
        };

        const zhName = nameMap[provinceId];
        if (zhName) {
            this.highlightProvince(zhName, className);
        }
    }

    nextQuestion() {
        // 전체 지도로 돌아가기
        this.currentRegion = null;
        this.drawCountryMap();

        this.svg.selectAll('.province')
            .classed('correct', false)
            .classed('incorrect', false)
            .classed('highlight', false);

        const province = this.shuffledProvinces[this.currentQuestion];
        document.getElementById('question-text').textContent = province.name;
        document.getElementById('question-num').textContent = `${this.currentQuestion + 1}/${this.totalQuestions}`;

        this.clearFeedback();

        if (this.currentMode === 'quiz' || this.currentMode === 'test') {
            this.startTimer();
        }
    }

    startTimer() {
        this.timeLeft = 5;
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            this.timeLeft -= 0.1;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 100);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimerDisplay() {
        const timerEl = document.getElementById('timer');
        const timerFill = document.getElementById('timer-fill');

        timerEl.textContent = Math.max(0, this.timeLeft).toFixed(1);
        timerFill.style.width = `${(this.timeLeft / 5) * 100}%`;

        if (this.timeLeft <= 2) {
            timerFill.classList.add('warning');
        } else {
            timerFill.classList.remove('warning');
        }
    }

    handleTimeout() {
        this.stopTimer();

        const currentProvince = this.shuffledProvinces[this.currentQuestion];
        const provinceInfo = getProvinceById(currentProvince.id);

        this.results.push({ province: currentProvince.name, correct: false, timeout: true });

        // 정답 위치 보여주기
        if (this.mapView === 'country') {
            this.currentRegion = provinceInfo.region;
            this.drawRegionMap(provinceInfo.region);
        }
        this.highlightProvinceById(currentProvince.id, 'highlight');

        this.showFeedback(`시간 초과! 정답은 ${currentProvince.name}입니다.`, 'timeout');

        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < this.totalQuestions) {
                this.nextQuestion();
            } else {
                this.endGame();
            }
        }, 1500);
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
    }

    clearFeedback() {
        const feedback = document.getElementById('feedback');
        feedback.textContent = '';
        feedback.className = 'feedback';
    }

    endGame() {
        this.showScreen('result-screen');
        document.getElementById('final-score').textContent = this.score;

        const details = document.getElementById('result-details');
        details.innerHTML = '<h3>결과 상세</h3>';

        this.results.forEach((result, index) => {
            const resultClass = result.correct ? 'correct-result' : 'incorrect-result';
            let resultText = result.correct ? '정답' : (result.timeout ? '시간초과' : `오답 (${result.answer})`);
            details.innerHTML += `
                <div class="result-item ${resultClass}">
                    <span>${index + 1}. ${result.province}</span>
                    <span>${resultText}</span>
                </div>
            `;
        });
    }

    resetGame() {
        this.currentQuestion = 0;
        this.score = 0;
        this.results = [];
        this.currentRegion = null;
        this.mapView = 'country';
        this.stopTimer();
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new ChinaQuiz();
});
