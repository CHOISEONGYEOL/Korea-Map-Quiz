// 미국 50개 주 퀴즈 게임 - 지역별 드릴다운 구조
// 한국/세계 지도처럼: 전체 지도 → 지역 클릭 → 해당 지역 확대 → 주 클릭

class USStatesQuiz {
    constructor() {
        this.currentMode = null;
        this.currentRegion = null;
        this.mapView = 'country'; // 'country', 'region', 'subregion'

        this.states = [];
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
        this.targetState = null;
        this.shuffledStates = [];
        this.zoom = null;
        this.mapGroup = null;

        // 지역 필터
        this.selectedRegionFilter = 'all';

        this.init();
    }

    async init() {
        const params = new URLSearchParams(window.location.search);
        this.currentMode = params.get('mode');

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
            const response = await fetch('../data/us-states-10m.json');
            this.topoData = await response.json();
        } catch (error) {
            console.error('지도 데이터 로드 실패:', error);
        }
    }

    setupScreen() {
        if (this.currentMode) {
            if (this.currentMode === 'explore') {
                this.startGame();
            } else {
                this.showScreen('start-screen');
                this.updateModeInfo();
            }
        } else {
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
    }

    updateModeInfo() {
        const modeInfo = {
            explore: {
                title: '미국 지도 둘러보기',
                desc: '지역을 클릭해서 확대하고, 각 주의 위치를 확인해보세요.'
            },
            practice: {
                title: '미국 50개 주 연습',
                desc: '먼저 지역을 클릭한 후, 해당 주를 찾아 클릭하세요. 시간제한 없음!'
            },
            quiz: {
                title: '미국 50개 주 퀴즈',
                desc: '5초 안에 지역 → 주 순서로 클릭하세요!'
            },
            test: {
                title: '미국 50개 주 실전 테스트',
                desc: '주 이름 없이 지도만 보고 맞춰보세요!'
            }
        };

        document.getElementById('mode-title').textContent = modeInfo[this.currentMode].title;
        document.getElementById('mode-description').textContent = modeInfo[this.currentMode].desc;
    }

    setupEventListeners() {
        document.getElementById('start-btn')?.addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restart-btn')?.addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });

        // 지역 필터 설정
        this.setupRegionFilter();
    }

    // 지역 필터 UI 생성
    setupRegionFilter() {
        const filterContainer = document.getElementById('region-filter');
        const filterOptions = document.getElementById('filter-options');
        if (!filterContainer || !filterOptions) return;

        // explore 모드가 아닐 때만 표시
        if (this.currentMode && this.currentMode !== 'explore') {
            filterContainer.classList.remove('hidden');
            this.generateFilterOptions(filterOptions);
        }
    }

    generateFilterOptions(container) {
        container.innerHTML = '';

        // 전체 옵션
        const allLabel = document.createElement('label');
        allLabel.className = 'filter-option selected';
        allLabel.innerHTML = `
            <input type="radio" name="region" value="all" checked>
            <span class="filter-label">전체</span>
            <span class="filter-sub">50개 주</span>
        `;
        container.appendChild(allLabel);

        // 4개 지역 옵션
        for (const [regionKey, region] of Object.entries(US_STATES_DATA.regions)) {
            const stateCount = getRegionStateCount(regionKey);
            const label = document.createElement('label');
            label.className = 'filter-option';
            label.innerHTML = `
                <input type="radio" name="region" value="${regionKey}">
                <span class="filter-label">${region.name}</span>
                <span class="filter-sub">${stateCount}개 주</span>
            `;
            container.appendChild(label);
        }

        // 이벤트 리스너 추가
        container.querySelectorAll('input[name="region"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedRegionFilter = e.target.value;
                container.querySelectorAll('.filter-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.closest('.filter-option').classList.add('selected');
            });
        });
    }

    // 필터가 적용된 주 목록 반환
    getFilteredStates() {
        if (this.selectedRegionFilter === 'all') {
            return getAllStates();
        }
        return getStatesInRegion(this.selectedRegionFilter);
    }

    startGame() {
        // 필터가 적용된 주 목록 사용
        this.states = this.getFilteredStates();
        this.currentQuestion = 0;
        this.score = 0;
        this.results = [];
        this.mapView = 'country';
        this.currentRegion = null;

        this.totalQuestions = Math.min(10, this.states.length);
        this.shuffledStates = [...this.states].sort(() => Math.random() - 0.5);

        this.showScreen('game-screen');
        this.drawCountryMap();

        if (this.currentMode !== 'explore') {
            this.updateScore();
            this.nextQuestion();
        } else {
            document.getElementById('question-text').textContent = '지역을 클릭해서 탐색하세요';
            document.getElementById('state-info').textContent = '';
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
        const self = this;

        this.zoom = d3.zoom()
            .scaleExtent([1, 8])  // 1배 ~ 8배 확대
            .translateExtent([[0, 0], [width, height]])
            .on('zoom', (event) => {
                if (this.mapGroup) {
                    this.mapGroup.attr('transform', event.transform);
                }
            });

        svg.call(this.zoom)
            .on('dblclick.zoom', null);  // 더블클릭 줌 비활성화

        // 줌 리셋 버튼 추가
        this.addZoomResetButton(svg, width);
    }

    // 줌 리셋 버튼
    addZoomResetButton(svg, width) {
        const self = this;
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

    // 전체 미국 지도 그리기 (지역별로 색상 구분)
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

        // 본토용 프로젝션 (알래스카/하와이 제외)
        this.projection = d3.geoAlbersUsa()
            .scale(width * 1.3)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        const states = topojson.feature(this.topoData, this.topoData.objects.states);

        // 알래스카(02), 하와이(15) 분리
        const mainlandStates = states.features.filter(d => {
            const stateId = String(d.id).padStart(2, '0');
            return stateId !== '02' && stateId !== '15';
        });
        const alaska = states.features.find(d => String(d.id).padStart(2, '0') === '02');
        const hawaii = states.features.find(d => String(d.id).padStart(2, '0') === '15');

        // 배경
        this.mapGroup.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'var(--bg-tertiary)');

        // 본토 주 그리기 (지역별 색상)
        this.mapGroup.selectAll('.state')
            .data(mainlandStates)
            .enter()
            .append('path')
            .attr('class', 'state country')
            .attr('d', this.path)
            .attr('fill', d => {
                const stateId = String(d.id).padStart(2, '0');
                return getStateColor(stateId);
            })
            .attr('stroke', 'var(--map-stroke)')
            .attr('stroke-width', 0.8)
            .on('click', (event, d) => this.handleCountryMapClick(d))
            .on('mouseover', function() {
                d3.select(this).attr('stroke-width', 2).style('filter', 'brightness(1.2)');
            })
            .on('mouseout', function() {
                d3.select(this).attr('stroke-width', 0.8).style('filter', 'none');
            });

        // 알래스카 인셋 박스 (좌하단)
        if (alaska) {
            this.drawStateInset(this.mapGroup, alaska, '02', 10, height - 110, 100, 70, '알래스카');
        }

        // 하와이 인셋 박스 (알래스카 오른쪽)
        if (hawaii) {
            this.drawStateInset(this.mapGroup, hawaii, '15', 120, height - 110, 80, 70, '하와이');
        }

        // 지역 라벨 (mapGroup이 아닌 svg에 추가해야 width/height 가져올 수 있음)
        if (this.currentMode !== 'test') {
            this.drawRegionLabels(svg);
        }

        this.svg = svg;

        // 단계 표시
        if (this.currentMode !== 'explore') {
            document.getElementById('state-info').textContent = '▶ 1단계: 지역을 선택하세요';
        }
    }

    // 인셋 박스로 주 그리기 (알래스카/하와이용)
    drawStateInset(svg, feature, stateId, x, y, boxWidth, boxHeight, label) {
        const insetGroup = svg.append('g')
            .attr('class', 'state-inset')
            .attr('transform', `translate(${x}, ${y})`);

        // 박스 배경
        insetGroup.append('rect')
            .attr('width', boxWidth)
            .attr('height', boxHeight)
            .attr('fill', 'rgba(0, 0, 0, 0.3)')
            .attr('stroke', 'var(--border-color)')
            .attr('stroke-width', 1)
            .attr('rx', 5);

        // 해당 주 전용 프로젝션
        const featureCollection = { type: 'FeatureCollection', features: [feature] };
        const insetProjection = d3.geoMercator()
            .fitSize([boxWidth - 10, boxHeight - 20], featureCollection);
        const insetPath = d3.geoPath().projection(insetProjection);

        const self = this;
        insetGroup.append('path')
            .datum(feature)
            .attr('class', 'state country')
            .attr('d', insetPath)
            .attr('transform', 'translate(5, 5)')
            .attr('fill', getStateColor(stateId))
            .attr('stroke', 'var(--map-stroke)')
            .attr('stroke-width', 0.5)
            .attr('data-state-id', stateId)
            .on('click', function() {
                self.handleCountryMapClick(feature);
            })
            .on('mouseover', function() {
                d3.select(this).attr('stroke-width', 1.5).style('filter', 'brightness(1.2)');
            })
            .on('mouseout', function() {
                d3.select(this).attr('stroke-width', 0.5).style('filter', 'none');
            });

        // 라벨 (test 모드 제외)
        if (this.currentMode !== 'test') {
            insetGroup.append('text')
                .attr('class', 'district-label')
                .attr('x', boxWidth / 2)
                .attr('y', boxHeight - 3)
                .attr('text-anchor', 'middle')
                .style('font-size', '9px')
                .text(label);
        }
    }

    drawRegionLabels(svg) {
        const regionLabels = [
            { name: '북동부', x: 0.85, y: 0.25 },
            { name: '남부', x: 0.7, y: 0.7 },
            { name: '중서부', x: 0.5, y: 0.3 },
            { name: '서부', x: 0.2, y: 0.4 }
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
        const stateId = String(feature.id).padStart(2, '0');
        const stateInfo = getStateById(stateId);

        if (!stateInfo) return;

        const regionKey = stateInfo.region;

        if (this.currentMode === 'explore') {
            // 탐색 모드: 해당 지역으로 확대
            this.currentRegion = regionKey;
            this.drawRegionMap(regionKey);
            const region = US_STATES_DATA.regions[regionKey];
            this.showFeedback(`${region.name} 지역으로 이동`, 'info');
            return;
        }

        // 퀴즈 모드: 정답 주가 속한 지역인지 확인
        const targetState = this.shuffledStates[this.currentQuestion];
        const targetInfo = getStateById(targetState.id);

        if (targetInfo.region === regionKey) {
            // 정답 지역 선택!
            this.currentRegion = regionKey;
            this.drawRegionMap(regionKey);
            document.getElementById('state-info').textContent = '▶ 2단계: 주를 선택하세요';
        } else {
            // 틀린 지역
            const correctRegion = US_STATES_DATA.regions[targetInfo.region];
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

        const region = US_STATES_DATA.regions[regionKey];

        const states = topojson.feature(this.topoData, this.topoData.objects.states);
        const regionStateIds = getStatesInRegion(regionKey).map(s => s.id);

        // 해당 지역 주들만 필터링
        let regionFeatures = states.features.filter(d =>
            regionStateIds.includes(String(d.id).padStart(2, '0'))
        );

        // 서부 지역일 때 알래스카/하와이는 인셋으로 분리
        let alaskaFeature = null;
        let hawaiiFeature = null;
        if (regionKey === 'west') {
            alaskaFeature = regionFeatures.find(d => String(d.id).padStart(2, '0') === '02');
            hawaiiFeature = regionFeatures.find(d => String(d.id).padStart(2, '0') === '15');
            // 본토 주만 필터링 (알래스카/하와이 제외)
            regionFeatures = regionFeatures.filter(d => {
                const stateId = String(d.id).padStart(2, '0');
                return stateId !== '02' && stateId !== '15';
            });
        }

        // 지역 주들을 하나의 FeatureCollection으로 만들기
        const regionCollection = {
            type: 'FeatureCollection',
            features: regionFeatures
        };

        // 지역에 맞게 프로젝션 자동 조정 (fitExtent 사용)
        const padding = 40; // 여백
        this.projection = d3.geoAlbersUsa()
            .fitExtent([[padding, padding], [width - padding, height - padding]], regionCollection);

        this.path = d3.geoPath().projection(this.projection);

        // 배경
        this.mapGroup.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'var(--bg-tertiary)');

        // 모든 주 (연한 배경) - 알래스카/하와이 제외
        const bgStates = states.features.filter(d => {
            const stateId = String(d.id).padStart(2, '0');
            return stateId !== '02' && stateId !== '15';
        });
        this.mapGroup.selectAll('.state-bg')
            .data(bgStates)
            .enter()
            .append('path')
            .attr('class', 'state-bg')
            .attr('d', this.path)
            .attr('fill', '#ddd')
            .attr('stroke', '#aaa')
            .attr('stroke-width', 0.3);

        // 해당 지역 주들 (인접 주 색상 분리 적용)
        const colorPalette = this.getColorPalette();
        const colorAssignment = this.assignColorsToFeatures(regionFeatures);

        this.mapGroup.selectAll('.state')
            .data(regionFeatures)
            .enter()
            .append('path')
            .attr('class', 'state country')
            .attr('d', this.path)
            .attr('fill', d => colorPalette[colorAssignment.get(d.id) || 0])
            .attr('stroke', 'var(--map-stroke)')
            .attr('stroke-width', 1)
            .on('click', (event, d) => this.handleStateClick(d))
            .on('mouseover', function() {
                d3.select(this).attr('stroke-width', 2.5).style('filter', 'brightness(1.2)');
            })
            .on('mouseout', function() {
                d3.select(this).attr('stroke-width', 1).style('filter', 'none');
            });

        // 서부 지역일 때 알래스카/하와이 인셋 추가 (왼쪽 절반 차지)
        if (regionKey === 'west') {
            // 왼쪽 영역의 절반을 인셋이 차지하도록 크기 설정
            const insetWidth = Math.floor(width * 0.35);  // 화면 너비의 35%
            const insetMargin = 10;
            const totalInsetHeight = height - 80;  // 뒤로가기 버튼 영역 제외

            // 알래스카가 더 크므로 60%, 하와이 40%
            const alaskaHeight = Math.floor(totalInsetHeight * 0.55);
            const hawaiiHeight = Math.floor(totalInsetHeight * 0.40);
            const gap = 10;  // 두 인셋 사이 간격

            if (alaskaFeature) {
                this.drawRegionStateInset(this.mapGroup, alaskaFeature, '02', insetMargin, 50, insetWidth, alaskaHeight, '알래스카', colorPalette, colorAssignment);
            }
            if (hawaiiFeature) {
                this.drawRegionStateInset(this.mapGroup, hawaiiFeature, '15', insetMargin, 50 + alaskaHeight + gap, insetWidth, hawaiiHeight, '하와이', colorPalette, colorAssignment);
            }
        }

        // 주 라벨 (test 모드 제외)
        if (this.currentMode !== 'test') {
            this.drawStateLabels(this.mapGroup, regionFeatures);
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

    // 지역 상세 지도용 인셋 박스 (색상 할당 적용)
    drawRegionStateInset(svg, feature, stateId, x, y, boxWidth, boxHeight, label, colorPalette, colorAssignment) {
        const insetGroup = svg.append('g')
            .attr('class', 'state-inset')
            .attr('transform', `translate(${x}, ${y})`);

        // 박스 배경
        insetGroup.append('rect')
            .attr('width', boxWidth)
            .attr('height', boxHeight)
            .attr('fill', 'rgba(0, 0, 0, 0.3)')
            .attr('stroke', 'var(--border-color)')
            .attr('stroke-width', 1)
            .attr('rx', 5);

        // 해당 주 전용 프로젝션 - 큰 박스에 맞게 여유 있는 패딩
        const padding = Math.min(boxWidth, boxHeight) * 0.1;
        const featureCollection = { type: 'FeatureCollection', features: [feature] };
        const insetProjection = d3.geoMercator()
            .fitSize([boxWidth - padding * 2, boxHeight - padding * 2 - 15], featureCollection);
        const insetPath = d3.geoPath().projection(insetProjection);

        const self = this;
        insetGroup.append('path')
            .datum(feature)
            .attr('class', 'state country')
            .attr('d', insetPath)
            .attr('transform', `translate(${padding}, ${padding})`)
            .attr('fill', colorPalette[colorAssignment.get(feature.id) || 0])
            .attr('stroke', 'var(--map-stroke)')
            .attr('stroke-width', 1)
            .attr('data-state-id', stateId)
            .on('click', function() {
                self.handleStateClick(feature);
            })
            .on('mouseover', function() {
                d3.select(this).attr('stroke-width', 2).style('filter', 'brightness(1.2)');
            })
            .on('mouseout', function() {
                d3.select(this).attr('stroke-width', 1).style('filter', 'none');
            });

        // 라벨 (test 모드 제외) - 큰 박스에 맞는 크기
        if (this.currentMode !== 'test') {
            const fontSize = Math.max(12, Math.min(16, boxHeight * 0.08));
            insetGroup.append('text')
                .attr('class', 'district-label')
                .attr('x', boxWidth / 2)
                .attr('y', boxHeight - 8)
                .attr('text-anchor', 'middle')
                .style('font-size', `${fontSize}px`)
                .text(label);
        }
    }

    drawStateLabels(svg, features) {
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

        // 선호 방향 힌트 (바다 방향)
        const preferredDirection = {
            '09': 'SE', '44': 'SE', '10': 'E', '24': 'E', '11': 'E',
            '34': 'E', '25': 'E'
        };

        const placedLabels = [];
        const placedLines = [];

        // 지역 크기 계산 (바운딩 박스 면적)
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

        // 중심 라벨이 다른 지역들과 겹치는지 확인
        const centerLabelOverlapsOthers = (feature, centroid, labelWidth, labelHeight) => {
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

        // 크기순 정렬 (큰 지역부터 처리하여 라벨 우선 배치)
        const sortedFeatures = [...features].sort((a, b) => getFeatureSize(b) - getFeatureSize(a));

        sortedFeatures.forEach(d => {
            const centroid = this.path.centroid(d);
            if (isNaN(centroid[0]) || isNaN(centroid[1])) return;

            const stateId = String(d.id).padStart(2, '0');
            const state = getStateById(stateId);
            if (!state) return;

            const stateName = state.name.replace('주', '');
            const labelWidth = stateName.length * 7 + 10;
            const labelHeight = 14;

            // 스마트 판단: 리더 라인이 필요한가?
            const fitsInside = labelFitsInFeature(d, labelWidth, labelHeight);
            const wouldOverlap = centerLabelOverlapsOthers(d, centroid, labelWidth, labelHeight);
            const needsLeaderLine = !fitsInside || wouldOverlap;

            if (needsLeaderLine) {
                // 리더 라인 필요
                const preferredDir = preferredDirection[stateId] || 'E';
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
                    .attr('class', 'state-label district-label')
                    .attr('x', labelX)
                    .attr('y', labelY)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .text(stateName)
                    .style('pointer-events', 'none');
            } else {
                // 리더 라인 불필요 - 중심에 배치
                placedLabels.push({ x: centroid[0] - labelWidth/2, y: centroid[1] - labelHeight/2, width: labelWidth, height: labelHeight });

                svg.append('text')
                    .attr('class', 'state-label district-label')
                    .attr('x', centroid[0])
                    .attr('y', centroid[1])
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .text(stateName)
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

    // 인접 주 색상 분리 알고리즘 - 12색 최대 활용
    assignColorsToFeatures(features) {
        const palette = this.getColorPalette();
        const colorAssignment = new Map();
        const adjacency = new Map();

        features.forEach(f => adjacency.set(f.id, new Set()));

        for (let i = 0; i < features.length; i++) {
            for (let j = i + 1; j < features.length; j++) {
                if (this.areFeaturesAdjacent(features[i], features[j])) {
                    adjacency.get(features[i].id).add(features[j].id);
                    adjacency.get(features[j].id).add(features[i].id);
                }
            }
        }

        const sortedFeatures = [...features].sort((a, b) =>
            adjacency.get(b.id).size - adjacency.get(a.id).size
        );

        // 각 색상 사용 횟수 추적 (균등 분배용)
        const colorUsageCount = new Array(palette.length).fill(0);

        sortedFeatures.forEach(feature => {
            const usedColors = new Set();
            adjacency.get(feature.id).forEach(neighborId => {
                if (colorAssignment.has(neighborId)) {
                    usedColors.add(colorAssignment.get(neighborId));
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

            colorAssignment.set(feature.id, bestColorIndex);
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

    handleStateClick(feature) {
        const stateId = String(feature.id).padStart(2, '0');
        const stateInfo = getStateById(stateId);

        if (this.currentMode === 'explore') {
            if (stateInfo) {
                this.showFeedback(`${stateInfo.name} (${stateInfo.nameEn})`, 'info');
                document.getElementById('state-info').textContent =
                    `${stateInfo.order}번째 가입 (${stateInfo.joinDate}) | ${stateInfo.regionName} - ${stateInfo.subregionName}`;
            }
            return;
        }

        if (this.currentQuestion >= this.totalQuestions) return;

        const currentState = this.shuffledStates[this.currentQuestion];
        const isCorrect = stateId === currentState.id;

        this.stopTimer();

        if (isCorrect) {
            this.score += 10;
            this.results.push({ state: currentState.name, correct: true });
            this.highlightState(stateId, 'correct');
            this.showFeedback('정답입니다!', 'correct');
        } else {
            this.results.push({
                state: currentState.name,
                correct: false,
                answer: stateInfo?.name || '알 수 없음'
            });
            this.highlightState(stateId, 'incorrect');
            this.highlightState(currentState.id, 'highlight');
            this.showFeedback(`오답! 정답은 ${currentState.name}입니다.`, 'incorrect');
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

    highlightState(stateId, className) {
        this.svg.selectAll('.state')
            .filter(d => String(d.id).padStart(2, '0') === stateId)
            .classed(className, true);
    }

    nextQuestion() {
        // 전체 지도로 돌아가기
        this.currentRegion = null;
        this.drawCountryMap();

        this.svg.selectAll('.state')
            .classed('correct', false)
            .classed('incorrect', false)
            .classed('highlight', false);

        const state = this.shuffledStates[this.currentQuestion];
        document.getElementById('question-text').textContent = state.name;
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

        const currentState = this.shuffledStates[this.currentQuestion];
        const stateInfo = getStateById(currentState.id);

        this.results.push({ state: currentState.name, correct: false, timeout: true });

        // 정답 위치 보여주기
        if (this.mapView === 'country') {
            this.currentRegion = stateInfo.region;
            this.drawRegionMap(stateInfo.region);
        }
        this.highlightState(currentState.id, 'highlight');

        this.showFeedback(`시간 초과! 정답은 ${currentState.name}입니다.`, 'timeout');

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
                    <span>${index + 1}. ${result.state}</span>
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
    new USStatesQuiz();
});
