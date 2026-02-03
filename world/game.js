// 세계 지도 퀴즈 게임 - 완전한 드릴다운 구조
// 전 세계 지도 → 대륙 클릭 → 하위지역 클릭 → 국가 클릭

class WorldMapQuiz {
    constructor() {
        this.currentContinent = null;
        this.currentSubregion = null;
        this.currentMode = null;

        // 현재 지도 뷰 상태: 'world' → 'continent' → 'subregion'
        this.mapView = 'world';

        this.countries = [];
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
        this.zoom = null;
        this.mapGroup = null;

        // 퀴즈 상태
        this.targetCountry = null;
        this.shuffledCountries = [];

        // 지역 필터
        this.selectedSubregionFilter = 'all';

        // 헤더 제목 요소
        this.headerTitleEl = null;

        // 이름 표시 옵션
        this.showLabels = true;

        // 콤보 시스템
        this.combo = 0;
        this.maxComboAchieved = 0;

        // 4단계 테스트 서브모드 (speed / survival)
        this.testSubMode = 'speed';
        this.maxLives = 3;
        this.speedTimeLimit = 60000;  // 60초 총 시간
        this.speedTimer = null;
        this.speedTimeRemaining = 60000;
        this.lives = 3;

        // UI 요소 참조
        this.comboEl = null;
        this.choicesContainer = null;
        this.choicesGrid = null;
        this.labelToggleEl = null;
        this.testModeSelectEl = null;

        this.init();

        // 창 크기 변경 시 지도 다시 그리기
        window.addEventListener('resize', () => {
            // 게임 화면이 활성화된 경우에만 다시 그리기
            if (document.getElementById('game-screen').classList.contains('active')) {
                // 약간의 지연 후 렌더링
                clearTimeout(this.resizeTimer);
                this.resizeTimer = setTimeout(() => {
                    this.redrawCurrentMap();
                }, 100);
            }
        });
    }

    async init() {
        const params = new URLSearchParams(window.location.search);
        this.currentContinent = params.get('continent');
        this.currentMode = params.get('mode');

        // 헤더 제목 요소 참조
        this.headerTitleEl = document.getElementById('header-title');

        // UI 요소 참조
        this.comboEl = document.getElementById('combo');
        this.choicesContainer = document.getElementById('choices-container');
        this.choicesGrid = document.getElementById('choices-grid');
        this.labelToggleEl = document.getElementById('label-toggle');
        this.testModeSelectEl = document.getElementById('test-mode-select');

        this.setupTheme();
        await this.loadMapData();
        this.setupScreen();
        this.setupEventListeners();
        this.setupLabelToggle();
        this.setupTestModeSelect();
    }

    setupTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('theme');

        // 저장된 테마가 dark인 경우만 다크 모드 적용 (기본: 라이트)
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
            const response = await fetch('data/countries-110m.json');
            this.topoData = await response.json();

            document.getElementById('loading').classList.add('hidden');
            document.getElementById('continent-buttons').classList.remove('hidden');

            this.updateCountryCounts();
        } catch (error) {
            console.error('지도 데이터 로드 실패:', error);
            document.getElementById('loading').textContent = '지도 데이터 로드 실패';
        }
    }

    setupScreen() {
        if (this.currentContinent && this.currentMode) {
            // 대륙 + 모드 선택됨 → 게임 시작 화면
            this.showScreen('start-screen');
            this.updateModeInfo();

            if (this.currentMode === 'explore') {
                this.startGame();
            }
        } else if (this.currentContinent) {
            // 대륙만 선택됨 → 모드 선택 화면
            this.showScreen('mode-screen');
            this.updateModeScreen();
        } else {
            // 아무것도 없음 → 대륙 선택
            this.showScreen('continent-screen');
        }
    }

    updateCountryCounts() {
        for (const continentKey of Object.keys(WORLD_DATA)) {
            const count = getContinentCountryCount(continentKey);
            const el = document.getElementById(`${continentKey}-count`);
            if (el) el.textContent = `${count}개국`;
        }
        // 전 세계 국가 수
        const worldCount = getWorldCountryCount();
        const worldEl = document.getElementById('world-count');
        if (worldEl) worldEl.textContent = `${worldCount}개국`;
    }

    showScreen(screenId) {
        if (screenId !== 'game-screen') {
            document.body.classList.remove('game-active');
        }

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
        if (this.currentMode === 'explore' || screenId === 'continent-screen') {
            themeToggle.classList.remove('hidden');
        } else {
            themeToggle.classList.add('hidden');
        }

        // 대륙 선택 화면(랜딩)에서는 헤더 제목 숨김
        if (screenId === 'continent-screen') {
            container.classList.add('hide-header');
        } else {
            container.classList.remove('hide-header');
        }
    }

    updateModeScreen() {
        if (this.currentContinent === 'world') {
            document.getElementById('region-title').textContent = '전 세계 퀴즈';
            const countryCount = getWorldCountryCount();
            const subtitleEl = document.querySelector('#mode-screen > p');
            if (subtitleEl) {
                subtitleEl.textContent = `${countryCount}개국 학습하기`;
            }
        } else {
            const continent = WORLD_DATA[this.currentContinent];
            if (!continent) return;

            document.getElementById('region-title').textContent = `${continent.name} 퀴즈`;

            // 국가 수 표시
            const countryCount = getAllCountriesInContinent(this.currentContinent).length;
            const subtitleEl = document.querySelector('#mode-screen > p');
            if (subtitleEl) {
                subtitleEl.textContent = `${countryCount}개국 학습하기`;
            }
        }

        document.querySelectorAll('.mode-btn').forEach(btn => {
            const mode = btn.dataset.mode;
            btn.href = `?continent=${this.currentContinent}&mode=${mode}`;
        });
    }

    updateModeInfo() {
        const continentName = this.currentContinent === 'world' ? '전 세계' : WORLD_DATA[this.currentContinent]?.name;
        if (!continentName) return;

        const modeInfo = {
            explore: {
                title: `${continentName} 지도 둘러보기`,
                desc: this.currentContinent === 'world'
                    ? '대륙을 클릭해서 확대하고, 국가 위치를 확인해보세요.'
                    : '지역을 클릭해서 확대하고, 국가 위치를 확인해보세요.'
            },
            practice: {
                title: `${continentName} 연습 모드`,
                desc: this.currentContinent === 'world'
                    ? '먼저 대륙을 클릭한 후, 해당 국가를 찾아 클릭하세요. 시간제한 없음!'
                    : '먼저 지역을 클릭한 후, 해당 국가를 찾아 클릭하세요. 시간제한 없음!'
            },
            quiz: {
                title: `${continentName} 퀴즈`,
                desc: this.currentContinent === 'world'
                    ? '5초 안에 대륙 → 국가 순서로 클릭하세요!'
                    : '5초 안에 지역 → 국가 순서로 클릭하세요!'
            },
            test: {
                title: `${continentName} 실전 테스트`,
                desc: '국가 이름 없이 지도만 보고 맞춰보세요!'
            }
        };

        document.getElementById('mode-title').textContent = modeInfo[this.currentMode].title;
        document.getElementById('mode-description').textContent = modeInfo[this.currentMode].desc;
        document.getElementById('back-to-mode').href = `?continent=${this.currentContinent}`;
        document.getElementById('game-back-btn').href = `?continent=${this.currentContinent}`;

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

        // 뒤로가기 버튼 (지도에서)
        document.getElementById('map-back-btn')?.addEventListener('click', () => {
            this.goBackToContinent();
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

    // 이름 표시 옵션 설정
    setupLabelToggle() {
        if (!this.labelToggleEl) return;

        // 1~3단계에서만 표시 (explore, practice, quiz)
        if (this.currentMode && ['explore', 'practice', 'quiz'].includes(this.currentMode)) {
            this.labelToggleEl.classList.remove('hidden');
        } else {
            this.labelToggleEl.classList.add('hidden');
        }

        // 라디오 버튼 이벤트 리스너
        const radioButtons = this.labelToggleEl.querySelectorAll('input[name="showLabels"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.showLabels = e.target.value === 'show';
                // 선택 스타일 업데이트
                this.labelToggleEl.querySelectorAll('.toggle-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.closest('.toggle-option').classList.add('selected');
            });
        });
    }

    // 4단계 테스트 모드 선택 설정
    setupTestModeSelect() {
        if (!this.testModeSelectEl) return;

        // 4단계에서만 표시
        if (this.currentMode === 'test') {
            this.testModeSelectEl.classList.remove('hidden');
        } else {
            this.testModeSelectEl.classList.add('hidden');
        }

        // 라디오 버튼 이벤트 리스너
        const radioButtons = this.testModeSelectEl.querySelectorAll('input[name="testSubMode"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.testSubMode = e.target.value;
                // 선택 스타일 업데이트
                this.testModeSelectEl.querySelectorAll('.toggle-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.closest('.toggle-option').classList.add('selected');
            });
        });
    }

    generateFilterOptions(container) {
        container.innerHTML = '';

        // 대륙별로 다른 필터 옵션 생성
        const continentData = WORLD_DATA[this.currentContinent];
        if (!continentData) return;

        // 전체 옵션
        const allLabel = document.createElement('label');
        allLabel.className = 'filter-option selected';
        const totalCount = this.currentContinent === 'world'
            ? getAllWorldCountries().length
            : Object.values(continentData.subregions).reduce((sum, sr) => sum + sr.countries.length, 0);
        allLabel.innerHTML = `
            <input type="radio" name="subregion" value="all" checked>
            <span class="filter-label">전체</span>
            <span class="filter-sub">${totalCount}개국</span>
        `;
        container.appendChild(allLabel);

        // 하위 지역별 옵션
        if (continentData.subregions) {
            for (const [subregionKey, subregion] of Object.entries(continentData.subregions)) {
                const label = document.createElement('label');
                label.className = 'filter-option';
                label.innerHTML = `
                    <input type="radio" name="subregion" value="${subregionKey}">
                    <span class="filter-label">${subregion.name}</span>
                    <span class="filter-sub">${subregion.countries.length}개국</span>
                `;
                container.appendChild(label);
            }
        }

        // 이벤트 리스너 추가
        container.querySelectorAll('input[name="subregion"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedSubregionFilter = e.target.value;
                container.querySelectorAll('.filter-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.closest('.filter-option').classList.add('selected');
            });
        });
    }

    // 필터가 적용된 국가 목록 반환
    getFilteredCountries() {
        const continentData = WORLD_DATA[this.currentContinent];
        if (!continentData) return [];

        if (this.selectedSubregionFilter === 'all') {
            if (this.currentContinent === 'world') {
                return getAllWorldCountries();
            }
            return Object.values(continentData.subregions).flatMap(sr => sr.countries);
        }

        const subregion = continentData.subregions[this.selectedSubregionFilter];
        return subregion ? subregion.countries : [];
    }

    startGame() {
        document.body.classList.add('game-active');

        // 콤보 초기화
        this.combo = 0;
        this.maxComboAchieved = 0;

        // 4단계 테스트 모드 서브모드 읽기
        if (this.currentMode === 'test') {
            const testSubModeRadio = document.querySelector('#test-mode-select input[name="testSubMode"]:checked');
            this.testSubMode = testSubModeRadio?.value || 'speed';
            console.log('[테스트모드] 게임 시작 - 서브모드:', this.testSubMode);

            // 서브모드별 초기화
            if (this.testSubMode === 'speed') {
                this.speedTimeRemaining = this.speedTimeLimit;
                this.totalQuestions = 9999;  // 무제한 (시간 내 최대한 많이)
            } else {
                this.lives = this.maxLives;
                this.totalQuestions = 9999;  // 무제한 (목숨 다 떨어질 때까지)
            }

            document.body.classList.add('test-mode');
            this.choicesContainer?.classList.remove('hidden');
        } else {
            document.body.classList.remove('test-mode');
            this.choicesContainer?.classList.add('hidden');
        }

        if (this.currentContinent === 'world') {
            // 전 세계 모드 - 필터 적용
            this.countries = this.getFilteredCountries().length > 0
                ? this.getFilteredCountries()
                : getAllWorldCountries();
            this.currentQuestion = 0;
            this.score = 0;
            this.results = [];
            this.mapView = 'world';
            this.currentSubregion = null;
            this.selectedContinent = null;

            if (this.currentMode !== 'test') {
                this.totalQuestions = Math.min(10, this.countries.length);
            }
            this.shuffledCountries = [...this.countries].sort(() => Math.random() - 0.5);

            this.showScreen('game-screen');
            this.drawWorldMap();

            if (this.currentMode === 'test') {
                // 4단계: 8지선다 시작
                this.updateScore();
                if (this.testSubMode === 'speed') {
                    this.startSpeedTimer();
                }
                this.nextTestQuestion();
            } else if (this.currentMode !== 'explore') {
                this.updateScore();
                this.nextQuestion();
            } else {
                document.getElementById('question-text').textContent = '대륙을 클릭해서 탐색하세요';
                document.getElementById('step-indicator').textContent = '';
            }
        } else {
            const continent = WORLD_DATA[this.currentContinent];
            if (!continent) return;

            // 대륙 모드 - 필터 적용
            this.countries = this.getFilteredCountries().length > 0
                ? this.getFilteredCountries()
                : getAllCountriesInContinent(this.currentContinent);
            this.currentQuestion = 0;
            this.score = 0;
            this.results = [];
            this.currentSubregion = null;

            if (this.currentMode !== 'test') {
                this.totalQuestions = Math.min(10, this.countries.length);
            }
            this.shuffledCountries = [...this.countries].sort(() => Math.random() - 0.5);

            this.showScreen('game-screen');

            // 지역 필터가 선택되어 있으면 바로 해당 지역으로 드릴다운
            if (this.selectedSubregionFilter !== 'all') {
                this.mapView = 'subregion';
                this.currentSubregion = this.selectedSubregionFilter;
                this.drawSubregionMap(this.selectedSubregionFilter);
            } else {
                // 전체 모드: 대륙 지도부터 시작
                this.mapView = 'continent';
                this.drawContinentMap();
            }

            if (this.currentMode === 'test') {
                // 4단계: 8지선다 시작
                this.updateScore();
                if (this.testSubMode === 'speed') {
                    this.startSpeedTimer();
                }
                this.nextTestQuestion();
            } else if (this.currentMode !== 'explore') {
                this.updateScore();
                this.nextQuestion();
            } else {
                if (this.selectedSubregionFilter !== 'all') {
                    document.getElementById('question-text').textContent = '국가를 클릭해서 탐색하세요';
                } else {
                    document.getElementById('question-text').textContent = '지역을 클릭해서 탐색하세요';
                }
                document.getElementById('step-indicator').textContent = '';
            }
        }
    }

    redrawCurrentMap() {
        if (this.mapView === 'world') {
            this.drawWorldMap();
        } else if (this.mapView === 'continent') {
            this.drawContinentMap();
        } else {
            this.drawSubregionMap(this.currentSubregion);
        }
    }

    // 줌 기능 설정 (핀치 줌 + 마우스 휠)
    setupZoom(svg, width, height) {
        this.zoom = d3.zoom()
            .scaleExtent([0.5, 8])
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

    // 지도 영역 높이 계산 (다른 요소들 높이를 제외한 가용 공간)
    calculateMapHeight() {
        const container = document.getElementById('map-container');
        // 컨테이너의 실제 높이가 있으면 사용
        if (container.clientHeight > 100) {
            return container.clientHeight - 32; // padding 제외
        }
        // 없으면 뷰포트에서 계산
        const header = document.querySelector('header');
        const questionArea = document.querySelector('.question-area');
        const feedback = document.querySelector('.feedback');
        const backBtns = document.querySelector('.game-back-btns');

        let usedHeight = 40; // 기본 여백
        if (header) usedHeight += header.offsetHeight;
        if (questionArea) usedHeight += questionArea.offsetHeight + 16;
        if (feedback) usedHeight += 60; // 피드백 영역 예상 높이
        if (backBtns) usedHeight += backBtns.offsetHeight + 20;

        return Math.max(300, window.innerHeight - usedHeight);
    }

    // 전 세계 지도 그리기 (대륙별로 색상 구분)
    drawWorldMap() {
        this.mapView = 'world';
        const container = document.getElementById('map-container');
        const svg = d3.select('#map-svg');
        svg.selectAll('*').remove();

        const width = container.clientWidth;
        const height = this.calculateMapHeight();

        svg.attr('width', width).attr('height', height);

        // 줌 기능 설정
        this.setupZoom(svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = svg.append('g').attr('class', 'map-group');

        const settings = CONTINENT_SETTINGS.world;

        this.projection = d3.geoMercator()
            .center(settings.center)
            .scale(settings.scale * Math.min(width, height) / 600)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        const countries = topojson.feature(this.topoData, this.topoData.objects.countries);

        // 배경
        this.mapGroup.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'var(--bg-tertiary)');

        // 대륙별로 국가 그리기 (12색 조합 사용)
        const palette = this.getColorPalette();
        const continentKeys = Object.keys(WORLD_DATA);

        for (let i = 0; i < continentKeys.length; i++) {
            const continentKey = continentKeys[i];
            const continent = WORLD_DATA[continentKey];
            const countryIds = getAllCountriesInContinent(continentKey).map(c => c.id);
            const continentColor = palette[i % palette.length];

            this.mapGroup.selectAll(`.continent-${continentKey}`)
                .data(countries.features.filter(d => countryIds.includes(String(d.id))))
                .enter()
                .append('path')
                .attr('class', `country continent-country`)
                .attr('data-continent', continentKey)
                .attr('d', this.path)
                .attr('fill', continentColor)
                .attr('stroke', 'var(--map-stroke)')
                .attr('stroke-width', 0.5)
                .on('click', (event, d) => {
                    // 클릭 = 선택 + 드릴다운
                    d3.selectAll('.country').classed('selected', false);
                    d3.select(event.target).classed('selected', true);
                    this.handleWorldMapClick(continentKey, d);
                })
                .on('mouseover', function () {
                    d3.select(this).attr('stroke-width', 1.5).style('filter', 'brightness(1.2)');
                })
                .on('mouseout', function () {
                    d3.select(this).attr('stroke-width', 0.5).style('filter', 'none');
                });
        }

        // 대륙 라벨 (showLabels 반영)
        if (this.currentMode !== 'test' && this.showLabels) {
            this.drawContinentLabels(this.mapGroup);
        }

        this.svg = svg;

        // 단계 표시
        if (this.currentMode !== 'explore') {
            document.getElementById('step-indicator').textContent = '▶ 1단계: 대륙을 선택하세요';
        }
    }

    drawContinentLabels(mapGroup) {
        const labelPositions = {
            asia: { x: 0.65, y: 0.35 },
            europe: { x: 0.52, y: 0.25 },
            africa: { x: 0.52, y: 0.55 },
            northAmerica: { x: 0.2, y: 0.3 },
            southAmerica: { x: 0.28, y: 0.7 },
            oceania: { x: 0.82, y: 0.7 }
        };

        const svg = d3.select('#map-svg');
        const width = +svg.attr('width');
        const height = +svg.attr('height');

        for (const [continentKey, continent] of Object.entries(WORLD_DATA)) {
            const pos = labelPositions[continentKey];
            if (pos) {
                mapGroup.append('text')
                    .attr('class', 'continent-label district-label')
                    .attr('x', width * pos.x)
                    .attr('y', height * pos.y)
                    .attr('text-anchor', 'middle')
                    .text(continent.name)
                    .style('pointer-events', 'none');
            }
        }
    }

    handleWorldMapClick(continentKey, feature) {
        if (this.currentMode === 'explore') {
            // 탐색 모드: 해당 대륙으로 확대
            this.selectedContinent = continentKey;
            this.currentContinent = continentKey;
            this.mapView = 'continent';
            this.drawContinentMap();
            const continent = WORLD_DATA[continentKey];
            this.showFeedback(`${continent.name}으로 이동`, 'info');
            return;
        }

        // 퀴즈 모드: 정답 국가가 속한 대륙인지 확인
        const targetCountry = this.shuffledCountries[this.currentQuestion];
        const targetInfo = getCountryById(targetCountry.id);

        if (targetInfo.continent === continentKey) {
            // 정답 대륙 선택!
            this.selectedContinent = continentKey;
            const originalContinent = this.currentContinent;
            this.currentContinent = continentKey;
            this.drawContinentMap();
            this.currentContinent = originalContinent; // 원래 값 복원
            document.getElementById('step-indicator').textContent = '▶ 2단계: 지역을 선택하세요';
        } else {
            // 틀린 대륙
            const correctContinent = WORLD_DATA[targetInfo.continent];
            this.showFeedback(`틀렸습니다! ${correctContinent.name}을 선택하세요.`, 'incorrect');
        }
    }

    // 대륙 전체 지도 그리기 (하위지역별로 색상 구분)
    drawContinentMap() {
        this.mapView = 'continent';
        const container = document.getElementById('map-container');
        const svg = d3.select('#map-svg');
        svg.selectAll('*').remove();

        const width = container.clientWidth;
        const height = this.calculateMapHeight();

        svg.attr('width', width).attr('height', height);

        // 줌 기능 설정
        this.setupZoom(svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = svg.append('g').attr('class', 'map-group');

        // 전 세계 모드에서는 selectedContinent 사용, 아니면 currentContinent 사용
        const activeContinentKey = this.selectedContinent || this.currentContinent;
        const continent = WORLD_DATA[activeContinentKey];
        const settings = CONTINENT_SETTINGS[activeContinentKey];

        if (!continent || !settings) return;

        this.projection = d3.geoMercator()
            .center(settings.center)
            .scale(settings.scale * Math.min(width, height) / 600)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        const countries = topojson.feature(this.topoData, this.topoData.objects.countries);

        // 배경
        this.mapGroup.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'var(--bg-tertiary)');

        // 모든 국가 (연한 배경)
        this.mapGroup.selectAll('.country-bg')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('class', 'country-bg')
            .attr('d', this.path)
            .attr('fill', '#ddd')
            .attr('stroke', '#aaa')
            .attr('stroke-width', 0.3);

        // 하위지역별로 국가 그리기
        const subregionColors = this.generateSubregionColors(continent);

        for (const [subregionKey, subregion] of Object.entries(continent.subregions)) {
            const countryIds = subregion.countries.map(c => String(c.id));
            const color = subregionColors[subregionKey];

            this.mapGroup.selectAll(`.subregion-${subregionKey}`)
                .data(countries.features.filter(d => countryIds.includes(String(d.id))))
                .enter()
                .append('path')
                .attr('class', `country subregion-country`)
                .attr('data-subregion', subregionKey)
                .attr('d', this.path)
                .attr('fill', color)
                .attr('stroke', 'var(--map-stroke)')
                .attr('stroke-width', 0.8)
                .on('click', (event, d) => {
                    // 클릭 = 선택 + 드릴다운
                    d3.selectAll('.country').classed('selected', false);
                    d3.select(event.target).classed('selected', true);
                    this.handleContinentMapClick(subregionKey, d);
                })
                .on('mouseover', function () {
                    d3.select(this).attr('stroke-width', 2).style('filter', 'brightness(1.2)');
                })
                .on('mouseout', function () {
                    d3.select(this).attr('stroke-width', 0.8).style('filter', 'none');
                });
        }

        // 하위지역 라벨 (explore 모드 또는 test가 아닌 경우, showLabels 반영)
        if (this.currentMode !== 'test' && this.showLabels) {
            this.drawSubregionLabels(this.mapGroup, continent);
        }

        // 전 세계 모드 + 탐색 모드일 때 뒤로가기 버튼 추가 (줌 그룹 밖)
        if (this.currentContinent === 'world' && this.currentMode === 'explore') {
            svg.append('rect')
                .attr('x', 10)
                .attr('y', 10)
                .attr('width', 80)
                .attr('height', 30)
                .attr('rx', 5)
                .attr('fill', 'var(--bg-secondary)')
                .attr('stroke', 'var(--border-color)')
                .attr('cursor', 'pointer')
                .on('click', () => this.goBackToContinent());

            svg.append('text')
                .attr('x', 50)
                .attr('y', 28)
                .attr('text-anchor', 'middle')
                .attr('fill', 'var(--text-primary)')
                .attr('font-size', '12px')
                .attr('cursor', 'pointer')
                .text('← 뒤로')
                .on('click', () => this.goBackToContinent());
        }

        this.svg = svg;

        // 단계 표시
        if (this.currentMode !== 'explore') {
            document.getElementById('step-indicator').textContent = '▶ 1단계: 지역을 선택하세요';
        }
    }

    // 12색 조합 (한국 지도와 동일)
    getColorPalette() {
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

        // 다크 모드용 색상 (네온/밝은 톤)
        const darkModeColors = [
            '#e74c3c', // 빨강
            '#3498db', // 파랑
            '#2ecc71', // 초록
            '#f1c40f', // 노랑
            '#9b59b6', // 보라
            '#1abc9c', // 민트
            '#e67e22', // 주황
            '#e91e63', // 핑크
            '#00bcd4', // 시안
            '#8bc34a', // 라임
            '#ff5722', // 딥오렌지
            '#bdc3c7', // 연회색
        ];

        // 라이트 모드용 색상 (파스텔 톤)
        const lightModeColors = [
            '#F48FB1', // 파스텔 핑크
            '#81C784', // 파스텔 그린
            '#64B5F6', // 파스텔 블루
            '#FFD54F', // 파스텔 옐로우
            '#BA68C8', // 파스텔 퍼플
            '#4DD0E1', // 파스텔 시안
            '#FFB74D', // 파스텔 오렌지
            '#F06292', // 파스텔 로즈
            '#4DB6AC', // 파스텔 틸
            '#AED581', // 파스텔 라임
            '#9575CD', // 파스텔 인디고
            '#A1887F', // 파스텔 브라운
        ];

        return isDarkMode ? darkModeColors : lightModeColors;
    }

    // 인접 국가 색상 분리 알고리즘 - 12색 최대 활용
    assignColorsToFeatures(features) {
        const palette = this.getColorPalette();
        const colorAssignment = new Map(); // feature id → color index

        // 인접 관계 계산
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

        // 각 색상 사용 횟수 추적 (균등 분배용)
        const colorUsageCount = new Array(palette.length).fill(0);

        // 인접 국가 수가 많은 순서로 정렬
        const sortedFeatures = [...features].sort((a, b) => {
            return adjacency.get(b.id).size - adjacency.get(a.id).size;
        });

        sortedFeatures.forEach(feature => {
            // 인접 국가들이 사용한 색상 수집
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

    // 두 피처가 인접한지 확인 (경계 공유) - 좌표 비교 방식
    areFeaturesAdjacent(f1, f2) {
        // 바운딩 박스가 겹치지 않으면 빠르게 제외
        const bounds1 = this.path.bounds(f1);
        const bounds2 = this.path.bounds(f2);

        // 약간의 여유를 두고 바운딩 박스 체크 (5px)
        const margin = 5;
        if (bounds1[1][0] + margin < bounds2[0][0] || bounds2[1][0] + margin < bounds1[0][0] ||
            bounds1[1][1] + margin < bounds2[0][1] || bounds2[1][1] + margin < bounds1[0][1]) {
            return false;
        }

        // 실제 경계 좌표 추출하여 근접 여부 확인
        const coords1 = this.extractCoordinates(f1);
        const coords2 = this.extractCoordinates(f2);

        // 두 폴리곤의 경계점이 가까운지 확인 (임계값: 3px)
        const threshold = 3;
        for (const p1 of coords1) {
            for (const p2 of coords2) {
                const dist = Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
                if (dist < threshold) {
                    return true;
                }
            }
        }
        return false;
    }

    // GeoJSON 피처에서 투영된 좌표 추출 (샘플링)
    extractCoordinates(feature) {
        const coords = [];
        const geometry = feature.geometry;

        const processCoords = (coordArray) => {
            // 모든 좌표를 사용하면 느려지므로 샘플링
            const step = Math.max(1, Math.floor(coordArray.length / 50));
            for (let i = 0; i < coordArray.length; i += step) {
                const projected = this.projection(coordArray[i]);
                if (projected && !isNaN(projected[0])) {
                    coords.push(projected);
                }
            }
        };

        if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach(ring => processCoords(ring));
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(polygon => {
                polygon.forEach(ring => processCoords(ring));
            });
        }

        return coords;
    }

    generateSubregionColors(continent) {
        const palette = this.getColorPalette();
        const subregions = Object.keys(continent.subregions);
        const colors = {};

        subregions.forEach((key, index) => {
            colors[key] = palette[index % palette.length];
        });

        return colors;
    }

    drawSubregionLabels(mapGroup, continent) {
        const countries = topojson.feature(this.topoData, this.topoData.objects.countries);

        for (const [subregionKey, subregion] of Object.entries(continent.subregions)) {
            const countryIds = subregion.countries.map(c => String(c.id));
            const subregionCountries = countries.features.filter(d => countryIds.includes(String(d.id)));

            if (subregionCountries.length === 0) continue;

            // 하위지역의 중심점 계산
            let totalX = 0, totalY = 0, count = 0;
            subregionCountries.forEach(feature => {
                const centroid = this.path.centroid(feature);
                if (!isNaN(centroid[0]) && !isNaN(centroid[1])) {
                    totalX += centroid[0];
                    totalY += centroid[1];
                    count++;
                }
            });

            if (count > 0) {
                mapGroup.append('text')
                    .attr('class', 'subregion-label district-label')
                    .attr('x', totalX / count)
                    .attr('y', totalY / count)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .text(subregion.name)
                    .style('pointer-events', 'none');
            }
        }
    }

    handleContinentMapClick(subregionKey, feature) {
        // 전 세계 모드에서는 selectedContinent 사용
        const activeContinentKey = this.selectedContinent || this.currentContinent;

        if (this.currentMode === 'explore') {
            // 탐색 모드: 해당 하위지역으로 확대
            this.currentSubregion = subregionKey;
            this.drawSubregionMap(subregionKey);
            const subregion = WORLD_DATA[activeContinentKey].subregions[subregionKey];
            this.showFeedback(`${subregion.name} 지역으로 이동`, 'info');
            return;
        }

        // 퀴즈 모드: 정답 국가가 속한 지역인지 확인
        const targetCountry = this.shuffledCountries[this.currentQuestion];
        const targetInfo = getCountryById(targetCountry.id);

        if (targetInfo.subregion === subregionKey) {
            // 정답 지역 선택!
            this.currentSubregion = subregionKey;
            this.drawSubregionMap(subregionKey);
            document.getElementById('step-indicator').textContent = '▶ 3단계: 국가를 선택하세요';
        } else {
            // 틀린 지역
            const correctSubregion = WORLD_DATA[activeContinentKey].subregions[targetInfo.subregion];
            this.showFeedback(`틀렸습니다! ${correctSubregion.name} 지역을 선택하세요.`, 'incorrect');
        }
    }

    // 하위지역 확대 지도 그리기
    drawSubregionMap(subregionKey) {
        this.mapView = 'subregion';
        this.currentSubregion = subregionKey;

        const container = document.getElementById('map-container');
        const svg = d3.select('#map-svg');
        svg.selectAll('*').remove();

        const width = container.clientWidth;
        const height = this.calculateMapHeight();

        svg.attr('width', width).attr('height', height);

        // 줌 기능 설정
        this.setupZoom(svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = svg.append('g').attr('class', 'map-group');

        // 전 세계 모드에서는 selectedContinent 사용
        const activeContinentKey = this.selectedContinent || this.currentContinent;
        const continent = WORLD_DATA[activeContinentKey];
        const subregion = continent.subregions[subregionKey];

        this.projection = d3.geoMercator()
            .center(subregion.center)
            .scale(subregion.scale * Math.min(width, height) / 600)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        const countries = topojson.feature(this.topoData, this.topoData.objects.countries);
        const subregionCountryIds = subregion.countries.map(c => String(c.id));

        // 배경
        this.mapGroup.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'var(--bg-tertiary)');

        // 모든 국가 (연한 배경)
        this.mapGroup.selectAll('.country-bg')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('class', 'country-bg')
            .attr('d', this.path)
            .attr('fill', '#ddd')
            .attr('stroke', '#aaa')
            .attr('stroke-width', 0.3);

        // 해당 지역 국가들 (인접 국가 색상 분리 알고리즘 적용)
        const countryPalette = this.getColorPalette();
        const countryFeatures = countries.features.filter(d => subregionCountryIds.includes(String(d.id)));

        // 인접 국가 색상 분리
        const colorAssignment = this.assignColorsToFeatures(countryFeatures);

        // 테스트 모드에서는 정답 국가만 색상 표시, 나머지는 옅은 회색
        const targetId = this.currentMode === 'test' && this.targetCountry ? String(this.targetCountry.id) : null;

        this.mapGroup.selectAll('.country')
            .data(countryFeatures)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', this.path)
            .attr('fill', d => {
                if (targetId && String(d.id) !== targetId) {
                    return '#e0e0e0'; // 테스트 모드: 다른 국가는 옅은 회색
                }
                return countryPalette[colorAssignment.get(d.id) || 0];
            })
            .attr('stroke', 'var(--map-stroke)')
            .attr('stroke-width', 1)
            .on('click', (event, d) => {
                // 클릭 = 선택 + 동작
                d3.selectAll('.country').classed('selected', false);
                d3.select(event.target).classed('selected', true);
                const countryInfo = getCountryById(String(d.id));
                const name = countryInfo ? countryInfo.name : `국가 ${d.id}`;
                if (this.currentMode === 'explore') {
                    this.showFeedback(`${name} 선택됨`, 'info');
                } else {
                    this.handleCountryClick(d);
                }
            })
            .on('mouseover', function () {
                d3.select(this).attr('stroke-width', 2.5).style('filter', 'brightness(1.2)');
            })
            .on('mouseout', function () {
                d3.select(this).attr('stroke-width', 1).style('filter', 'none');
            });

        // 국가 라벨 (test 모드 제외, showLabels 옵션 반영)
        if (this.currentMode !== 'test' && this.showLabels) {
            this.drawCountryLabels(this.mapGroup, countries.features.filter(d => subregionCountryIds.includes(String(d.id))));
        }

        // 뒤로가기 버튼 (줌 그룹 밖)
        svg.append('rect')
            .attr('x', 10)
            .attr('y', 10)
            .attr('width', 80)
            .attr('height', 30)
            .attr('rx', 5)
            .attr('fill', 'var(--bg-secondary)')
            .attr('stroke', 'var(--border-color)')
            .attr('cursor', 'pointer')
            .on('click', () => this.goBackToContinent());

        svg.append('text')
            .attr('x', 50)
            .attr('y', 28)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--text-primary)')
            .attr('font-size', '12px')
            .attr('cursor', 'pointer')
            .text('← 뒤로')
            .on('click', () => this.goBackToContinent());

        this.svg = svg;
    }

    drawCountryLabels(mapGroup, features) {
        // 스마트 리더 라인 시스템: 필요한 경우에만 자동 생성
        const DIRECTIONS = [
            { name: 'E', dx: 70, dy: 0 },
            { name: 'W', dx: -70, dy: 0 },
            { name: 'SE', dx: 50, dy: 50 },
            { name: 'SW', dx: -50, dy: 50 },
            { name: 'NE', dx: 50, dy: -50 },
            { name: 'NW', dx: -50, dy: -50 },
            { name: 'S', dx: 0, dy: 70 },
            { name: 'N', dx: 0, dy: -70 },
        ];

        // 선호 방향 힌트 (바다/빈 공간 방향)
        const preferredDirection = {
            // 서아시아 - 지중해/홍해 방향
            '376': 'W', '275': 'W', '400': 'W', '422': 'W', '196': 'W',
            '414': 'E', '48': 'E', '634': 'E', '784': 'E',
            // 동남아시아
            '702': 'W', '096': 'E', '626': 'E',
            // 유럽
            '442': 'W', '020': 'W', '492': 'W', '674': 'E', '336': 'E', '470': 'E',
            '705': 'W', '807': 'W', '499': 'W', '8': 'W',
            // 카리브해
            '44': 'E', '388': 'W', '332': 'W', '214': 'E', '630': 'E',
            '780': 'E', '52': 'E', '662': 'E', '670': 'E', '308': 'E',
            '28': 'E', '659': 'E', '212': 'E',
            // 아프리카
            '728': 'E', '226': 'W', '266': 'W', '624': 'W', '270': 'W', '132': 'W',
            '690': 'E', '174': 'E', '480': 'E', '678': 'W', '748': 'E', '426': 'E',
            '262': 'E', '232': 'E', '646': 'W', '108': 'W', '768': 'W', '204': 'W',
            // 오세아니아
            '242': 'E', '90': 'E', '548': 'E', '882': 'E', '776': 'E', '296': 'E',
            '583': 'W', '584': 'E', '585': 'W', '520': 'E', '798': 'E',
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

        // 중심 라벨이 다른 라벨과 겹치는지 확인
        const centerLabelOverlapsOthers = (centroid, labelWidth, labelHeight) => {
            const labelRect = {
                x: centroid[0] - labelWidth / 2,
                y: centroid[1] - labelHeight / 2,
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
                const labelRect = { x: labelX - labelWidth / 2, y: labelY - labelHeight / 2, width: labelWidth, height: labelHeight };
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

            const country = getCountryById(String(d.id));
            if (!country) return;

            const labelWidth = country.name.length * 7 + 10;
            const labelHeight = 14;

            // 스마트 판단: 리더 라인이 필요한가?
            const fitsInside = labelFitsInFeature(d, labelWidth, labelHeight);
            const wouldOverlap = centerLabelOverlapsOthers(centroid, labelWidth, labelHeight);
            const needsLeaderLine = !fitsInside || wouldOverlap;

            if (needsLeaderLine) {
                // 리더 라인 필요
                const preferredDir = preferredDirection[String(d.id)] || 'E';
                const bestDir = findBestDirection(centroid, preferredDir, labelWidth, labelHeight);

                const labelX = centroid[0] + bestDir.dx;
                const labelY = centroid[1] + bestDir.dy;

                placedLines.push({ x1: centroid[0], y1: centroid[1], x2: labelX, y2: labelY });
                placedLabels.push({ x: labelX - labelWidth / 2, y: labelY - labelHeight / 2, width: labelWidth, height: labelHeight });

                mapGroup.append('line')
                    .attr('class', 'leader-line')
                    .attr('x1', centroid[0])
                    .attr('y1', centroid[1])
                    .attr('x2', labelX)
                    .attr('y2', labelY)
                    .attr('stroke', 'var(--map-label-color)')
                    .attr('stroke-width', 1)
                    .attr('opacity', 0.7)
                    .style('pointer-events', 'none');

                mapGroup.append('text')
                    .attr('class', 'country-label district-label')
                    .attr('x', labelX)
                    .attr('y', labelY)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .text(country.name)
                    .style('pointer-events', 'none');
            } else {
                // 리더 라인 불필요 - 중심에 배치
                placedLabels.push({ x: centroid[0] - labelWidth / 2, y: centroid[1] - labelHeight / 2, width: labelWidth, height: labelHeight });

                mapGroup.append('text')
                    .attr('class', 'country-label district-label')
                    .attr('x', centroid[0])
                    .attr('y', centroid[1])
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .text(country.name)
                    .style('pointer-events', 'none');
            }
        });
    }

    goBackToContinent() {
        if (this.currentMode === 'explore' || this.currentMode === 'practice') {
            if (this.currentContinent === 'world') {
                // 전 세계 모드
                if (this.mapView === 'subregion') {
                    // 하위지역 → 대륙 (selectedContinent 유지)
                    this.currentSubregion = null;
                    this.drawContinentMap();
                    this.showFeedback('대륙 지도로 돌아왔습니다', 'info');
                } else if (this.selectedContinent) {
                    // 대륙 → 전체 지도
                    this.selectedContinent = null;
                    this.drawWorldMap();
                    this.showFeedback('전 세계 지도로 돌아왔습니다', 'info');
                }
            } else {
                this.drawContinentMap();
                this.showFeedback('대륙 지도로 돌아왔습니다', 'info');
            }
        }
        // quiz/test 모드에서는 뒤로가기 불가
    }

    handleCountryClick(feature) {
        const countryId = String(feature.id);
        const countryInfo = getCountryById(countryId);

        // 4단계 테스트 모드에서는 지도 클릭 무시 (8지선다 버튼 사용)
        if (this.currentMode === 'test') {
            return;
        }

        // 미국 클릭시 미국 주 퀴즈로 이동
        if (countryId === '840') {
            if (this.currentMode === 'explore') {
                if (confirm('미국 50개 주 퀴즈로 이동하시겠습니까?')) {
                    window.location.href = 'usa/';
                }
            }
            return;
        }

        if (this.currentMode === 'explore') {
            if (countryInfo) {
                this.showFeedback(`${countryInfo.name} (${countryInfo.nameEn})`, 'info');
            }
            return;
        }

        if (this.currentQuestion >= this.totalQuestions) return;

        const currentCountry = this.shuffledCountries[this.currentQuestion];
        const isCorrect = countryId === String(currentCountry.id);

        this.stopTimer();

        if (isCorrect) {
            this.combo++;
            if (this.combo > this.maxComboAchieved) {
                this.maxComboAchieved = this.combo;
            }
            const earnedScore = 10 + (this.combo - 1) * 2;
            this.score += earnedScore;
            this.results.push({ country: currentCountry.name, correct: true, earnedScore: earnedScore });
            this.highlightCountry(countryId, 'correct');
            this.showFeedback(`정답! +${earnedScore}점 (콤보 ${this.combo})`, 'correct');
        } else {
            this.combo = 0;
            this.results.push({
                country: currentCountry.name,
                correct: false,
                answer: countryInfo?.name || '알 수 없음'
            });
            this.highlightCountry(countryId, 'incorrect');
            this.highlightCountry(currentCountry.id, 'highlight');
            this.showFeedback(`오답! 정답은 ${currentCountry.name}입니다.`, 'incorrect');
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

    highlightCountry(countryId, className) {
        const targetId = String(countryId);
        this.svg.selectAll('.country')
            .filter(d => String(d.id) === targetId)
            .classed(className, true);
    }

    nextQuestion() {
        // 지도 초기화
        this.currentSubregion = null;
        this.selectedContinent = null;

        if (this.currentContinent === 'world') {
            // 전 세계 모드: 전체 세계 지도로 돌아가기
            this.drawWorldMap();
        } else {
            // 특정 대륙 모드: 대륙 지도로 돌아가기
            this.drawContinentMap();
        }

        this.svg.selectAll('.country')
            .classed('correct', false)
            .classed('incorrect', false)
            .classed('highlight', false);

        const country = this.shuffledCountries[this.currentQuestion];
        document.getElementById('question-text').textContent = country.name;
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
                if (this.currentMode === 'test') {
                    this.handleTestTimeout();
                } else {
                    this.handleTimeout();
                }
            }
        }, 100);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // 스피드 모드 전용: 60초 전체 타이머
    startSpeedTimer() {
        this.speedTimeRemaining = this.speedTimeLimit;
        this.updateSpeedTimerDisplay();

        if (this.speedTimer) clearInterval(this.speedTimer);

        this.speedTimer = setInterval(() => {
            this.speedTimeRemaining -= 100;
            this.updateSpeedTimerDisplay();

            if (this.speedTimeRemaining <= 0) {
                console.log('[스피드모드] 60초 종료!');
                clearInterval(this.speedTimer);
                this.speedTimer = null;
                this.stopTimer();
                this.endGame();
            }
        }, 100);
    }

    stopSpeedTimer() {
        if (this.speedTimer) {
            clearInterval(this.speedTimer);
            this.speedTimer = null;
        }
    }

    // 스피드 모드 타이머 일시정지
    pauseSpeedTimer() {
        if (this.speedTimer) {
            clearInterval(this.speedTimer);
            this.speedTimer = null;
            this.speedTimerPaused = true;
        }
    }

    // 스피드 모드 타이머 재개
    resumeSpeedTimer() {
        if (this.speedTimerPaused && this.speedTimeRemaining > 0) {
            this.speedTimerPaused = false;
            this.speedTimer = setInterval(() => {
                this.speedTimeRemaining -= 100;
                this.updateSpeedTimerDisplay();

                if (this.speedTimeRemaining <= 0) {
                    console.log('[스피드모드] 60초 종료!');
                    clearInterval(this.speedTimer);
                    this.speedTimer = null;
                    this.stopTimer();
                    this.endGame();
                }
            }, 100);
        }
    }

    updateSpeedTimerDisplay() {
        const seconds = Math.ceil(this.speedTimeRemaining / 1000);
        document.getElementById('question-num').textContent = `⏱️${seconds}초 | ${this.currentQuestion}문제`;
    }

    updateSurvivalDisplay() {
        const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(this.maxLives - this.lives);
        document.getElementById('question-num').textContent = `${hearts} | ${this.currentQuestion}문제`;
    }

    // 4단계 실전 테스트: 다음 문제 (8지선다)
    nextTestQuestion() {
        if (this.currentQuestion >= this.shuffledCountries.length) {
            // 문제가 부족하면 다시 셔플
            this.shuffledCountries = [...this.countries].sort(() => Math.random() - 0.5);
            this.currentQuestion = 0;
        }

        const targetCountry = this.shuffledCountries[this.currentQuestion];
        this.targetCountry = targetCountry;

        // 정답 국가의 정보 가져오기 (대륙, 하위지역)
        const countryInfo = getCountryById(targetCountry.id);

        // 해당 국가가 있는 하위지역 지도 그리기
        if (countryInfo) {
            this.selectedContinent = countryInfo.continent;
            this.currentSubregion = countryInfo.subregion;
            this.drawSubregionMap(countryInfo.subregion);
        }

        // 지도에서 해당 국가 하이라이트 (지도 그린 후)
        setTimeout(() => {
            this.highlightTargetCountry(targetCountry.id);
        }, 50);

        // 8지선다 생성
        this.generateChoices(targetCountry);

        // 질문 텍스트 설정
        document.getElementById('question-text').textContent = '이 나라의 이름은?';
        document.getElementById('step-indicator').textContent = '지도에서 하이라이트된 국가를 찾으세요';

        // UI 업데이트
        if (this.testSubMode === 'speed') {
            this.updateSpeedTimerDisplay();
        } else {
            this.updateSurvivalDisplay();
        }

        // 문제별 5초 타이머 시작
        this.startTimer();
    }

    // 정답 국가 하이라이트
    highlightTargetCountry(countryId) {
        // 기존 하이라이트 제거
        this.svg?.selectAll('.country')
            .classed('target-highlight', false)
            .classed('correct', false)
            .classed('incorrect', false);

        // 새 타겟 하이라이트 (String으로 변환하여 타입 일치)
        const targetId = String(countryId);
        this.svg?.selectAll('.country')
            .filter(d => String(d.id) === targetId)
            .classed('target-highlight', true);
    }

    // 8지선다 보기 생성
    generateChoices(correctCountry) {
        if (!this.choicesGrid) return;

        // 오답 후보들 (정답 제외)
        const correctId = String(correctCountry.id);
        const otherCountries = this.countries.filter(c => String(c.id) !== correctId);
        const shuffledOthers = [...otherCountries].sort(() => Math.random() - 0.5);
        const wrongAnswers = shuffledOthers.slice(0, 7);

        // 정답 + 오답 7개 = 8개 셔플
        const choices = [correctCountry, ...wrongAnswers].sort(() => Math.random() - 0.5);

        // 버튼 생성
        this.choicesGrid.innerHTML = '';
        choices.forEach(country => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = country.name;
            btn.dataset.countryId = country.id;
            btn.addEventListener('click', () => this.handleChoiceClick(country));
            this.choicesGrid.appendChild(btn);
        });
    }

    // 8지선다 보기 클릭 처리
    handleChoiceClick(selectedCountry) {
        this.stopTimer();

        // 스피드 모드: 정답/오답 표시 동안 타이머 일시정지
        if (this.testSubMode === 'speed') {
            this.pauseSpeedTimer();
        }

        const isCorrect = String(selectedCountry.id) === String(this.targetCountry.id);

        // 버튼 스타일 업데이트
        const buttons = this.choicesGrid.querySelectorAll('.choice-btn');
        const targetId = String(this.targetCountry.id);
        const selectedId = String(selectedCountry.id);
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.countryId === targetId) {
                btn.classList.add('correct');
            } else if (btn.dataset.countryId === selectedId && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            this.combo++;
            if (this.combo > this.maxComboAchieved) {
                this.maxComboAchieved = this.combo;
            }
            const earnedScore = 10 + (this.combo - 1) * 2;  // 콤보 보너스
            this.score += earnedScore;
            this.results.push({
                country: this.targetCountry.name,
                correct: true,
                earnedScore: earnedScore
            });
            this.showFeedback(`정답! +${earnedScore}점 (콤보 ${this.combo})`, 'correct');
        } else {
            this.combo = 0;
            this.results.push({
                country: this.targetCountry.name,
                correct: false,
                answer: selectedCountry.name
            });
            this.showFeedback(`오답! 정답은 ${this.targetCountry.name}`, 'incorrect');

            if (this.testSubMode === 'survival') {
                this.lives--;
                if (this.lives <= 0) {
                    setTimeout(() => this.endGame(), 2000);
                    return;
                }
            }
        }

        this.updateScore();
        this.currentQuestion++;

        // 2초 후 다음 문제 (정답 충분히 확인)
        setTimeout(() => {
            this.clearFeedback();
            if (this.testSubMode === 'survival' && this.lives <= 0) {
                return;  // 이미 게임 종료 처리됨
            }
            // 스피드 모드: 타이머 재개
            if (this.testSubMode === 'speed') {
                this.resumeSpeedTimer();
            }
            this.nextTestQuestion();
        }, 2000);
    }

    // 테스트 모드 타임아웃 처리
    handleTestTimeout() {
        this.stopTimer();

        // 스피드 모드: 정답 표시 동안 타이머 일시정지
        if (this.testSubMode === 'speed') {
            this.pauseSpeedTimer();
        }

        this.combo = 0;
        this.results.push({
            country: this.targetCountry.name,
            correct: false,
            timeout: true
        });
        this.showFeedback(`시간 초과! 정답은 ${this.targetCountry.name}`, 'timeout');

        // 정답 버튼 표시
        const buttons = this.choicesGrid?.querySelectorAll('.choice-btn');
        const targetId = String(this.targetCountry.id);
        buttons?.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.countryId === targetId) {
                btn.classList.add('correct');
            }
        });

        if (this.testSubMode === 'survival') {
            this.lives--;
            if (this.lives <= 0) {
                setTimeout(() => this.endGame(), 2000);
                return;
            }
        }

        this.currentQuestion++;

        // 2초 후 다음 문제 (정답 충분히 확인)
        setTimeout(() => {
            this.clearFeedback();
            if (this.testSubMode === 'survival' && this.lives <= 0) {
                return;
            }
            // 스피드 모드: 타이머 재개
            if (this.testSubMode === 'speed') {
                this.resumeSpeedTimer();
            }
            this.nextTestQuestion();
        }, 2000);
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
        this.combo = 0;

        const currentCountry = this.shuffledCountries[this.currentQuestion];
        const countryInfo = getCountryById(currentCountry.id);

        this.results.push({ country: currentCountry.name, correct: false, timeout: true });

        // 정답 위치 보여주기
        if (this.mapView === 'world') {
            // 전 세계 지도에서 타임아웃 → 해당 대륙의 하위지역 지도로 이동
            this.selectedContinent = countryInfo.continent;
            const originalContinent = this.currentContinent;
            this.currentContinent = countryInfo.continent;
            this.currentSubregion = countryInfo.subregion;
            this.drawSubregionMap(countryInfo.subregion);
            this.currentContinent = originalContinent;
        } else if (this.mapView === 'continent') {
            this.currentSubregion = countryInfo.subregion;
            this.drawSubregionMap(countryInfo.subregion);
        }
        this.highlightCountry(currentCountry.id, 'highlight');

        this.showFeedback(`시간 초과! 정답은 ${currentCountry.name}입니다.`, 'timeout');

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
        if (this.comboEl) {
            this.comboEl.textContent = this.combo;
        }
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== 게임 종료 =====

    endGame() {
        this.stopTimer();
        this.stopSpeedTimer();

        document.body.classList.remove('test-mode');
        this.choicesContainer?.classList.add('hidden');

        this.showScreen('result-screen');
        document.getElementById('final-score').textContent = this.score;

        const details = document.getElementById('result-details');
        const correctCount = this.results.filter(r => r.correct).length;
        const totalAnswered = this.results.length;

        let html = '<div class="game-stats">';

        // 4단계 테스트 모드: 서브모드별 다른 통계 표시
        if (this.currentMode === 'test' && this.testSubMode === 'speed') {
            html += `<div class="stat-summary">
                <span class="stat-label">⚡ 스피드 모드</span>
                <span class="stat-value">${totalAnswered}문제</span>
            </div>`;
            html += `<div class="stat-summary">
                <span class="stat-label">정답</span>
                <span class="stat-value">${correctCount}개</span>
            </div>`;
            html += `<div class="stat-summary">
                <span class="stat-label">정답률</span>
                <span class="stat-value">${totalAnswered > 0 ? (correctCount / totalAnswered * 100).toFixed(0) : 0}%</span>
            </div>`;
            html += `<div class="stat-summary">
                <span class="stat-label">최대 콤보</span>
                <span class="stat-value combo-highlight">${this.maxComboAchieved}</span>
            </div>`;
        } else if (this.currentMode === 'test' && this.testSubMode === 'survival') {
            html += `<div class="stat-summary">
                <span class="stat-label">❤️ 서바이벌 모드</span>
                <span class="stat-value">${totalAnswered}문제</span>
            </div>`;
            html += `<div class="stat-summary">
                <span class="stat-label">정답</span>
                <span class="stat-value">${correctCount}개</span>
            </div>`;
            html += `<div class="stat-summary">
                <span class="stat-label">최대 콤보</span>
                <span class="stat-value combo-highlight">${this.maxComboAchieved}</span>
            </div>`;
        } else {
            html += `<div class="stat-summary">
                <span class="stat-label">정답</span>
                <span class="stat-value">${correctCount}/${this.totalQuestions}</span>
            </div>`;
            html += `<div class="stat-summary">
                <span class="stat-label">정답률</span>
                <span class="stat-value">${(correctCount / this.totalQuestions * 100).toFixed(0)}%</span>
            </div>`;
            html += `<div class="stat-summary">
                <span class="stat-label">최대 콤보</span>
                <span class="stat-value combo-highlight">${this.maxComboAchieved}</span>
            </div>`;
        }
        html += '</div>';

        html += '<h3>문제별 결과</h3>';
        this.results.forEach((result, index) => {
            const resultClass = result.correct ? 'correct-result' : 'incorrect-result';
            let resultText = result.correct ? '정답' : (result.timeout ? '시간초과' : `오답 (${result.answer})`);
            let scoreText = '';
            if (result.earnedScore) {
                scoreText = ` (+${result.earnedScore}점)`;
            }
            html += `
                <div class="result-item ${resultClass}">
                    <span>${index + 1}. ${result.country}</span>
                    <span>${resultText}${scoreText}</span>
                </div>
            `;
        });

        details.innerHTML = html;
    }

    resetGame() {
        this.currentQuestion = 0;
        this.score = 0;
        this.results = [];
        this.currentSubregion = null;
        this.mapView = 'continent';
        this.combo = 0;
        this.maxComboAchieved = 0;
        this.lives = this.maxLives;
        this.speedTimeRemaining = this.speedTimeLimit;
        this.stopTimer();
        this.stopSpeedTimer();
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new WorldMapQuiz();
});
