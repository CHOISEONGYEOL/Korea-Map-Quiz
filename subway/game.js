// 수도권 지하철 퀴즈

const GameState = {
    IDLE: 'idle',
    PLAYING: 'playing',
    SHOWING_RESULT: 'showing_result'
};

const GameMode = {
    EXPLORE: 'explore',
    PRACTICE: 'practice',
    QUIZ: 'quiz',
    TEST: 'test'
};

// 주요 환승역 (여러 노선이 만나는 역)
const TRANSFER_STATIONS = [
    '서울역', '시청', '종로3가', '을지로3가', '동대문역사문화공원', '충무로',
    '신도림', '영등포구청', '여의도', '당산', '합정', '홍대입구',
    '왕십리', '성수', '건대입구', '잠실', '삼성', '선릉', '강남', '교대',
    '고속터미널', '사당', '이수', '총신대입구', '노원', '창동', '도봉산',
    '회기', '청량리', '군자', '천호', '잠실새내', '종합운동장', '석촌',
    '가산디지털단지', '대림', '구로디지털단지', '신촌', '공덕', '효창공원앞',
    '이촌', '용산', '연신내', '불광', '디지털미디어시티', '수색',
    '김포공항', '까치산', '오목교', '목동', '발산', '마곡나루',
    '광화문', '경복궁', '안국', '혜화', '동묘앞', '신당',
    '약수', '금호', '옥수', '압구정', '신사', '논현', '신논현',
    '양재', '판교', '정자', '수원', '인천', '부천', '안양',
    '수서', '복정', '모란', '야탑', '오리', '죽전', '기흥', '수지구청',
    '광명', '금정', '산본', '범계', '평촌', '인덕원', '정부과천청사',
    '계양', '검암', '부평구청', '부평', '주안',
    '대곡', '일산', '백석', '마두', '행신', '능곡',
    '망우', '상봉', '중랑', '가평', '춘천'
];

class SubwayQuiz {
    constructor() {
        this.stations = SUBWAY_STATIONS || [];
        this.lines = SUBWAY_LINES || {};
        this.lineColors = LINE_COLORS || {};

        this.topoData = null; // 대한민국 지도 데이터
        this.projection = null;
        this.path = null;

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

        this.svg = null;
        this.width = 0;
        this.height = 0;

        this.mode = null;
        this.selectedLines = ['all'];

        this.zoom = null;
        this.mapGroup = null;
        this.currentZoomScale = 1; // 현재 줌 스케일 추적

        this.init();
    }

    async init() {
        // 지도 데이터 로드
        await this.loadMapData();

        // URL 파라미터로 모드 확인
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
            // 대한민국 시도 TopoJSON 로드
            this.topoData = await d3.json('../korea/data/provinces.json');
            console.log('지도 데이터 로드 완료');
        } catch (error) {
            console.error('지도 데이터 로드 실패:', error);
        }
        console.log('지하철 데이터 준비 완료:', this.stations.length, '개 역');
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

            if (this.state === GameState.PLAYING || this.mode === GameMode.EXPLORE) {
                this.renderMap();
            }
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
                modeDesc.textContent = '자유롭게 노선도를 탐색해보세요';
                instructions.innerHTML = `
                    <h3>둘러보기 방법</h3>
                    <ol>
                        <li>마우스 휠로 확대/축소</li>
                        <li>드래그로 지도 이동</li>
                        <li>역 위에 마우스를 올리면 정보 표시</li>
                    </ol>
                `;
                break;
            case GameMode.PRACTICE:
                modeTitle.textContent = '연습 모드';
                modeDesc.textContent = '시간제한 없이 천천히 연습해보세요';
                break;
            case GameMode.QUIZ:
                modeTitle.textContent = '익숙해지기';
                modeDesc.textContent = '10초 안에 역을 찾아보세요!';
                break;
            case GameMode.TEST:
                modeTitle.textContent = '실전 테스트';
                modeDesc.textContent = '역 이름 없이 위치만 보고 맞춰보세요!';
                break;
        }

        this.createLineFilter();
        document.getElementById('start-btn').onclick = () => this.startGame();
    }

    createLineFilter() {
        const filterOptions = document.getElementById('filter-options');
        filterOptions.innerHTML = '';

        // 전체 옵션
        const allOption = document.createElement('label');
        allOption.className = 'filter-option selected';
        allOption.innerHTML = `
            <input type="radio" name="line-filter" value="all" checked>
            <span class="filter-label">전체 노선</span>
            <span class="filter-sub">${this.stations.length}개역</span>
        `;
        filterOptions.appendChild(allOption);

        // 주요 노선
        const mainLines = ['1호선', '2호선', '3호선', '4호선', '5호선', '6호선', '7호선', '8호선', '9호선', '수인분당', '경의중앙', '신분당'];

        mainLines.forEach(lineName => {
            const lineData = this.lines[lineName];
            if (!lineData) return;

            const stationCount = lineData.stations.length;
            const option = document.createElement('label');
            option.className = 'filter-option';
            option.innerHTML = `
                <input type="radio" name="line-filter" value="${lineName}">
                <span class="filter-label" style="border-left: 4px solid ${lineData.color}; padding-left: 8px;">${lineName}</span>
                <span class="filter-sub">${stationCount}개역</span>
            `;
            filterOptions.appendChild(option);
        });

        filterOptions.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', (e) => {
                filterOptions.querySelectorAll('.filter-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.closest('.filter-option').classList.add('selected');
                this.selectedLines = [e.target.value];
            });
        });
    }

    getFilteredStations() {
        if (this.selectedLines.includes('all')) {
            return this.stations;
        }
        return this.stations.filter(s => this.selectedLines.includes(s.line));
    }

    startGame() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('game-screen').classList.add('active');

        this.score = 0;
        this.currentQuestion = 0;
        this.results = [];
        this.updateScore();

        setTimeout(() => {
            this.setupMap();
            this.renderMap();

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

        // 줌 그룹
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        // 줌 설정
        this.zoom = d3.zoom()
            .scaleExtent([0.5, 20])
            .on('zoom', (event) => {
                this.currentZoomScale = event.transform.k;
                this.mapGroup.attr('transform', event.transform);
                this.updateVisibilityByZoom();
            });

        this.svg.call(this.zoom);

        // 역 좌표로 GeoJSON FeatureCollection 생성 (fitExtent용)
        const filteredStations = this.getFilteredStations().filter(s => s.lat && s.lng);

        const stationFeatures = {
            type: 'FeatureCollection',
            features: filteredStations.map(s => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [s.lng, s.lat]
                },
                properties: { name: s.name }
            }))
        };

        // d3.geoMercator().fitExtent()로 역 범위에 맞게 프로젝션 자동 조정
        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]], stationFeatures);

        this.path = d3.geoPath().projection(this.projection);
    }

    renderMap() {
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const filteredStations = this.getFilteredStations();

        // 지도 그룹 초기화
        this.mapGroup.selectAll('*').remove();

        // 배경 사각형
        this.mapGroup.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', isDarkMode ? '#1a1a2e' : '#f0f4f8');

        // 시도 경계 지도 배경 그리기
        if (this.topoData) {
            const objectName = Object.keys(this.topoData.objects)[0];
            const provinces = topojson.feature(this.topoData, this.topoData.objects[objectName]);

            this.mapGroup.append('g')
                .attr('class', 'map-background')
                .selectAll('path')
                .data(provinces.features)
                .enter()
                .append('path')
                .attr('d', this.path)
                .attr('fill', isDarkMode ? '#2a2a3e' : '#e8eef5')
                .attr('stroke', isDarkMode ? '#3a3a4e' : '#c0c8d0')
                .attr('stroke-width', 0.8);
        }

        // 역 ID → 역 데이터 매핑
        const stationById = {};
        this.stations.forEach(s => {
            stationById[s.id] = s;
        });

        // 노선 그리기 (각 노선별로 순서대로 연결)
        const linesGroup = this.mapGroup.append('g').attr('class', 'lines-group');

        Object.entries(this.lines).forEach(([lineName, lineData]) => {
            // 필터링: 선택된 노선만 또는 전체
            // 지선도 함께 렌더링 (예: '2호선' 선택 시 '2호선-신도림지선', '2호선-성수지선'도 포함)
            const isSelected = this.selectedLines.includes('all') ||
                this.selectedLines.includes(lineName) ||
                this.selectedLines.some(selected => lineName.startsWith(selected + '-'));
            if (!isSelected) {
                return;
            }

            // 노선의 역들을 순서대로 연결 (null 좌표 또는 너무 먼 거리면 선을 끊음)
            const segments = []; // 연속된 좌표 세그먼트들
            let currentSegment = [];
            let prevCoords = null;

            // 거리 임계값 (픽셀 단위) - 이 이상 떨어지면 연결하지 않음
            const MAX_DISTANCE = 120;

            lineData.stations.forEach(stationId => {
                const station = stationById[stationId];
                if (station && station.lat != null && station.lng != null) {
                    const coords = this.projection([station.lng, station.lat]);
                    if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
                        // 이전 좌표와의 거리 체크
                        if (prevCoords) {
                            const dist = Math.sqrt(
                                Math.pow(coords[0] - prevCoords[0], 2) +
                                Math.pow(coords[1] - prevCoords[1], 2)
                            );
                            if (dist > MAX_DISTANCE) {
                                // 너무 멀면 세그먼트 끊기
                                if (currentSegment.length > 1) {
                                    segments.push(currentSegment);
                                }
                                currentSegment = [];
                            }
                        }
                        currentSegment.push(coords);
                        prevCoords = coords;
                    } else {
                        // 투영 실패 시 세그먼트 끊기
                        if (currentSegment.length > 1) {
                            segments.push(currentSegment);
                        }
                        currentSegment = [];
                        prevCoords = null;
                    }
                } else {
                    // null 좌표인 역 - 세그먼트 끊기
                    if (currentSegment.length > 1) {
                        segments.push(currentSegment);
                    }
                    currentSegment = [];
                    prevCoords = null;
                }
            });

            // 마지막 세그먼트 추가
            if (currentSegment.length > 1) {
                segments.push(currentSegment);
            }

            // 각 세그먼트별로 선 그리기
            const lineGenerator = d3.line().curve(d3.curveLinear);

            segments.forEach(points => {
                linesGroup.append('path')
                    .attr('d', lineGenerator(points))
                    .attr('fill', 'none')
                    .attr('stroke', lineData.color)
                    .attr('stroke-width', 3)
                    .attr('stroke-linecap', 'round')
                    .attr('stroke-linejoin', 'round')
                    .attr('opacity', 0.8);
            });
        });

        // 역 점 그리기
        const stationsGroup = this.mapGroup.append('g').attr('class', 'stations-group');

        const stationDots = stationsGroup.selectAll('circle')
            .data(filteredStations)
            .enter()
            .append('circle')
            .attr('cx', d => {
                const coords = this.projection([d.lng, d.lat]);
                return coords ? coords[0] : 0;
            })
            .attr('cy', d => {
                const coords = this.projection([d.lng, d.lat]);
                return coords ? coords[1] : 0;
            })
            .attr('r', 4)
            .attr('fill', d => this.lineColors[d.line] || '#888')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('cursor', 'pointer')
            .attr('class', 'station-dot')
            .attr('data-id', d => d.id);

        // 역 이벤트
        stationDots
            .on('mouseover', (event, d) => {
                if (this.mode !== GameMode.TEST || this.state !== GameState.PLAYING) {
                    this.showTooltip(event, d);
                }
                d3.select(event.target)
                    .attr('r', 8)
                    .attr('stroke-width', 2);
            })
            .on('mouseout', (event) => {
                this.hideTooltip();
                d3.select(event.target)
                    .attr('r', 4)
                    .attr('stroke-width', 1);
            })
            .on('click', (event, d) => {
                if (this.state === GameState.PLAYING && this.mode !== GameMode.EXPLORE) {
                    this.checkAnswer(d);
                }
            });

        // 역 이름 표시 (explore 모드 또는 quiz 모드에서 - 줌에 따라 가시성 조절)
        const labelsGroup = this.mapGroup.append('g').attr('class', 'labels-group');

        labelsGroup.selectAll('text')
            .data(filteredStations)
            .enter()
            .append('text')
            .attr('x', d => {
                const coords = this.projection([d.lng, d.lat]);
                return coords ? coords[0] : 0;
            })
            .attr('y', d => {
                const coords = this.projection([d.lng, d.lat]);
                return coords ? coords[1] - 8 : 0;
            })
            .attr('text-anchor', 'middle')
            .attr('font-size', '9px')
            .attr('font-weight', d => this.isTransferStation(d.name) ? 'bold' : 'normal')
            .attr('fill', isDarkMode ? '#fff' : '#333')
            .attr('stroke', isDarkMode ? '#000' : '#fff')
            .attr('stroke-width', 2)
            .attr('paint-order', 'stroke')
            .attr('pointer-events', 'none')
            .attr('class', d => `station-label ${this.isTransferStation(d.name) ? 'transfer' : 'normal'}`)
            .attr('opacity', 0) // 초기에는 모두 숨김
            .text(d => d.name);

        // 초기 가시성 설정
        this.updateVisibilityByZoom();
    }

    // 환승역인지 확인
    isTransferStation(stationName) {
        // 괄호 제거하고 비교
        const cleanName = stationName.replace(/\([^)]*\)/g, '').trim();
        return TRANSFER_STATIONS.some(ts => cleanName.includes(ts) || ts.includes(cleanName));
    }

    // 줌 레벨에 따른 가시성 업데이트
    // 스케일 기준 (카카오맵 참고):
    // - scale < 1.5: 아무것도 안보임 (4km 척도)
    // - 1.5 <= scale < 3: 환승역만 (2km 척도)
    // - 3 <= scale < 6: 모든 역 이름 (1km 척도)
    // - scale >= 6: 명확한 구분 (500m 척도)
    updateVisibilityByZoom() {
        const scale = this.currentZoomScale;

        // TEST 모드에서는 라벨 숨김
        if (this.mode === GameMode.TEST) {
            this.mapGroup.selectAll('.station-label').attr('opacity', 0);
            return;
        }

        // 줌 레벨별 라벨 표시
        if (scale < 1.5) {
            // 4km 척도: 라벨 모두 숨김
            this.mapGroup.selectAll('.station-label').attr('opacity', 0);
        } else if (scale < 3) {
            // 2km 척도: 환승역만 표시
            this.mapGroup.selectAll('.station-label.transfer').attr('opacity', 1);
            this.mapGroup.selectAll('.station-label.normal').attr('opacity', 0);
        } else if (scale < 6) {
            // 1km 척도: 모든 역 표시 (살짝 투명)
            this.mapGroup.selectAll('.station-label.transfer').attr('opacity', 1);
            this.mapGroup.selectAll('.station-label.normal').attr('opacity', 0.7);
        } else {
            // 500m 이하: 모든 역 선명하게
            this.mapGroup.selectAll('.station-label').attr('opacity', 1);
        }

        // 역 점 크기도 줌에 따라 조절
        const baseRadius = scale < 2 ? 3 : (scale < 4 ? 4 : 5);
        const strokeWidth = scale < 3 ? 0.5 : 1;
        this.mapGroup.selectAll('.station-dot')
            .attr('r', baseRadius)
            .attr('stroke-width', strokeWidth);
    }

    zoomToFit(stations) {
        // 이미 setupMap에서 좌표가 화면에 맞게 계산됨
        // 초기 상태로 리셋
        this.svg.call(this.zoom.transform, d3.zoomIdentity);
    }

    showTooltip(event, station) {
        let tooltip = document.getElementById('station-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'station-tooltip';
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

        const lineColor = this.lineColors[station.line] || '#888';
        tooltip.innerHTML = `
            <div style="border-left: 3px solid ${lineColor}; padding-left: 10px;">
                <strong style="font-size: 15px;">${station.name}</strong><br>
                <span style="color: ${lineColor}; font-weight: 500;">${station.line}</span>
            </div>
        `;
        tooltip.style.left = `${event.clientX + 15}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
        tooltip.style.display = 'block';
    }

    hideTooltip() {
        const tooltip = document.getElementById('station-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    }

    startExploreMode() {
        this.state = GameState.PLAYING;
        document.getElementById('question-text').textContent = '자유롭게 탐색하세요';
        document.getElementById('step-indicator').textContent = '마우스 휠로 확대/축소, 드래그로 이동';
        document.querySelector('.timer-container').style.display = 'none';
        document.querySelector('.stats').style.opacity = '0.3';
    }

    generateQuestions() {
        const filteredStations = this.getFilteredStations();
        const shuffled = [...filteredStations].sort(() => Math.random() - 0.5);
        this.questions = shuffled.slice(0, Math.min(this.totalQuestions, shuffled.length));
    }

    showNextQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
            return;
        }

        this.state = GameState.PLAYING;
        this.currentAnswer = this.questions[this.currentQuestion];

        document.getElementById('question-text').textContent = this.currentAnswer.name;

        const lineColor = this.lineColors[this.currentAnswer.line] || '#888';
        document.getElementById('step-indicator').innerHTML =
            `<span style="color: ${lineColor}; font-weight: bold;">${this.currentAnswer.line}</span> 노선`;
        document.getElementById('question-num').textContent = `${this.currentQuestion + 1}/${this.questions.length}`;

        if (this.mode === GameMode.PRACTICE) {
            this.highlightStation(this.currentAnswer.id, true);
        }

        if (this.mode === GameMode.QUIZ || this.mode === GameMode.TEST) {
            this.startTimer();
        } else {
            document.querySelector('.timer-container').style.display = 'none';
        }

        this.showFeedback('');
    }

    highlightStation(stationId, highlight) {
        const station = this.mapGroup.select(`circle[data-id="${stationId}"]`);
        if (highlight) {
            station.attr('r', 10).attr('stroke', '#FFD700').attr('stroke-width', 3);
        } else {
            station.attr('r', 4).attr('stroke', '#fff').attr('stroke-width', 1);
        }
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
        this.highlightStation(this.currentAnswer.id, true);

        this.results.push({ station: this.currentAnswer, correct: false, timeout: true });
        this.showFeedback(`시간 초과! 정답: ${this.currentAnswer.name}`, false);

        setTimeout(() => {
            this.highlightStation(this.currentAnswer.id, false);
            this.currentQuestion++;
            this.showNextQuestion();
        }, 2000);
    }

    checkAnswer(selectedStation) {
        if (this.state !== GameState.PLAYING) return;

        this.stopTimer();
        this.state = GameState.SHOWING_RESULT;

        const isCorrect = selectedStation.id === this.currentAnswer.id;

        if (isCorrect) {
            const timeBonus = Math.ceil((this.timeRemaining / this.timeLimit) * 10);
            const earnedScore = this.mode === GameMode.PRACTICE ? 10 : timeBonus;
            this.score += earnedScore;
            this.updateScore();
            this.highlightStation(selectedStation.id, true);
            this.showFeedback(`정답! +${earnedScore}점`, true);
        } else {
            d3.select(`.station-dot[data-id="${selectedStation.id}"]`).attr('fill', '#e74c3c');
            this.highlightStation(this.currentAnswer.id, true);
            this.showFeedback(`오답! 정답: ${this.currentAnswer.name}`, false);
        }

        this.results.push({ station: this.currentAnswer, correct: isCorrect, selected: selectedStation });

        setTimeout(() => {
            const station = this.stations.find(s => s.id === selectedStation.id);
            if (station) {
                d3.select(`.station-dot[data-id="${selectedStation.id}"]`)
                    .attr('fill', this.lineColors[station.line] || '#888');
            }
            this.highlightStation(this.currentAnswer.id, false);
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

        details.innerHTML = `
            <div class="result-stat">
                <span>정답률</span>
                <strong>${correctCount}/${this.results.length} (${percent}%)</strong>
            </div>
            <div class="result-list">
                ${this.results.map((r, i) => `
                    <div class="result-item ${r.correct ? 'correct' : 'incorrect'}">
                        <span class="result-num">${i + 1}</span>
                        <span class="result-station">${r.station.name}</span>
                        <span class="result-line" style="color: ${this.lineColors[r.station.line]}">${r.station.line}</span>
                        <span class="result-mark">${r.correct ? '✓' : '✗'}</span>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('restart-btn').onclick = () => this.startGame();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SubwayQuiz();
});
