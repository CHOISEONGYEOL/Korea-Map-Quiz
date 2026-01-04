// 캐나다 13개 주/준주 퀴즈 게임

class CanadaProvincesQuiz {
    constructor() {
        this.currentMode = null;
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
                this.drawMap();
            }
        });
    }

    async loadMapData() {
        try {
            // Natural Earth 캐나다 주/준주 데이터 사용
            const response = await fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/canada.geojson');
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
                title: '캐나다 지도 둘러보기',
                desc: '각 주와 준주의 위치를 확인해보세요.'
            },
            practice: {
                title: '캐나다 주/준주 연습',
                desc: '시간제한 없이 천천히 주/준주를 찾아보세요.'
            },
            quiz: {
                title: '캐나다 주/준주 퀴즈',
                desc: '5초 안에 주/준주를 찾아 클릭하세요!'
            },
            test: {
                title: '캐나다 주/준주 실전 테스트',
                desc: '주/준주 이름 없이 지도만 보고 맞춰보세요!'
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
            <span class="filter-sub">13개 지역</span>
        `;
        container.appendChild(allOption);

        // 지역별 옵션 생성
        for (const [regionKey, region] of Object.entries(CANADA_DATA.regions)) {
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
        // 필터링된 주/준주 가져오기
        this.provinces = this.getFilteredProvinces();
        this.currentQuestion = 0;
        this.score = 0;
        this.results = [];

        this.totalQuestions = Math.min(10, this.provinces.length);
        this.shuffledProvinces = [...this.provinces].sort(() => Math.random() - 0.5);

        this.showScreen('game-screen');
        this.drawMap();

        if (this.currentMode !== 'explore') {
            this.updateScore();
            this.nextQuestion();
        } else {
            if (this.selectedRegionFilter !== 'all') {
                document.getElementById('question-text').textContent = '주/준주를 클릭해서 탐색하세요';
            } else {
                document.getElementById('question-text').textContent = '지도를 클릭해서 탐색하세요';
            }
            document.getElementById('province-info').textContent = '';
        }
    }

    // 캐나다 주/준주 ID 매핑 (GeoJSON name → 우리 데이터 id)
    getProvinceIdFromName(name) {
        const nameMapping = {
            'Alberta': 'AB',
            'British Columbia': 'BC',
            'Manitoba': 'MB',
            'New Brunswick': 'NB',
            'Newfoundland and Labrador': 'NL',
            'Nova Scotia': 'NS',
            'Ontario': 'ON',
            'Prince Edward Island': 'PE',
            'Quebec': 'QC',
            'Saskatchewan': 'SK',
            'Northwest Territories': 'NT',
            'Nunavut': 'NU',
            'Yukon': 'YT',
            // 대체 이름들
            'Yukon Territory': 'YT',
            'Québec': 'QC'
        };
        return nameMapping[name] || null;
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

    drawMap() {
        const container = document.getElementById('map-container');
        const svg = d3.select('#map-svg');
        svg.selectAll('*').remove();

        const width = container.clientWidth;
        const height = Math.min(380, window.innerHeight * 0.42);

        svg.attr('width', width).attr('height', height);

        // 줌 기능 설정
        this.setupZoom(svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = svg.append('g').attr('class', 'map-group');

        // 캐나다 중심 투영 (줌아웃)
        this.projection = d3.geoMercator()
            .center([-96, 62])
            .scale(width * 0.35)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        // 배경
        this.mapGroup.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'var(--bg-tertiary)');

        // 주/준주 그리기 (인접 색상 분리 적용)
        const colorPalette = this.getColorPalette();
        const colorAssignment = this.assignColorsToFeatures(this.topoData.features);

        this.mapGroup.selectAll('.province')
            .data(this.topoData.features)
            .enter()
            .append('path')
            .attr('class', 'province country')
            .attr('d', this.path)
            .attr('fill', d => colorPalette[colorAssignment.get(d.properties.name) || 0])
            .attr('stroke', 'var(--map-stroke)')
            .attr('stroke-width', 0.8)
            .on('click', (event, d) => {
                if (this.currentMode === 'explore') {
                    // 탐색 모드: 클릭은 선택만
                    d3.selectAll('.province').classed('selected', false);
                    d3.select(event.target).classed('selected', true);
                }
                this.handleProvinceClick(d);
            })
            .on('mouseover', function() {
                d3.select(this).attr('stroke-width', 2).style('filter', 'brightness(1.2)');
            })
            .on('mouseout', function() {
                d3.select(this).attr('stroke-width', 0.8).style('filter', 'none');
            });

        // 라벨 (test 모드 제외)
        if (this.currentMode !== 'test') {
            this.drawProvinceLabels(this.mapGroup);
        }

        this.svg = svg;
    }

    drawProvinceLabels(svg) {
        // 모든 라벨에 리더 라인 적용 (겹침 방지를 위해 적극적으로 사용)
        // 각 지역별 고정 리더 라인 위치 지정
        const leaderLineConfig = {
            // 북부 준주 - 넓어서 내부 배치 가능
            'NU': { useLeader: false, offset: { dx: -60, dy: 150 } },
            'NT': { useLeader: false, offset: { dx: 0, dy: 30 } },
            'YT': { useLeader: true, direction: 'W', distance: 60 },

            // 서부 주 - 모두 리더라인으로 아래쪽에 배치
            'BC': { useLeader: true, direction: 'SW', distance: 100 },
            'AB': { useLeader: true, direction: 'S', distance: 110 },
            'SK': { useLeader: true, direction: 'S', distance: 130 },
            'MB': { useLeader: true, direction: 'SE', distance: 100 },

            // 중부/동부 주
            'ON': { useLeader: true, direction: 'S', distance: 100 },
            'QC': { useLeader: true, direction: 'E', distance: 80 },

            // 대서양 주 - 겹치지 않게 각자 다른 방향
            'NL': { useLeader: true, direction: 'E', distance: 80 },
            'NB': { useLeader: true, direction: 'SW', distance: 80 },
            'NS': { useLeader: true, direction: 'S', distance: 90 },
            'PE': { useLeader: true, direction: 'N', distance: 70 },
        };

        // 방향별 오프셋
        const directionOffsets = {
            'N':  { dx: 0,   dy: -1 },
            'NE': { dx: 0.7, dy: -0.7 },
            'E':  { dx: 1,   dy: 0 },
            'SE': { dx: 0.7, dy: 0.7 },
            'S':  { dx: 0,   dy: 1 },
            'SW': { dx: -0.7, dy: 0.7 },
            'W':  { dx: -1,  dy: 0 },
            'NW': { dx: -0.7, dy: -0.7 },
        };

        this.topoData.features.forEach(d => {
            const centroid = this.path.centroid(d);
            if (isNaN(centroid[0]) || isNaN(centroid[1])) return;

            const provinceId = this.getProvinceIdFromName(d.properties.name);
            const province = getProvinceById(provinceId);
            if (!province) return;

            const config = leaderLineConfig[provinceId];
            if (!config) return;

            if (config.useLeader) {
                // 리더 라인 사용
                const dir = directionOffsets[config.direction] || directionOffsets['E'];
                const labelX = centroid[0] + dir.dx * config.distance;
                const labelY = centroid[1] + dir.dy * config.distance;

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
                    .text(province.name)
                    .style('pointer-events', 'none');
            } else {
                // 오프셋만 적용 (큰 북부 지역)
                const offset = config.offset || { dx: 0, dy: 0 };
                const finalX = centroid[0] + offset.dx;
                const finalY = centroid[1] + offset.dy;

                svg.append('text')
                    .attr('class', 'province-label district-label')
                    .attr('x', finalX)
                    .attr('y', finalY)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .text(province.name)
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

    // 인접 주/준주 색상 분리 알고리즘 - 12색 최대 활용
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

    handleProvinceClick(feature) {
        const provinceId = this.getProvinceIdFromName(feature.properties.name);
        const provinceInfo = getProvinceById(provinceId);

        if (this.currentMode === 'explore') {
            if (provinceInfo) {
                this.showFeedback(`${provinceInfo.name} (${provinceInfo.nameEn})`, 'info');
                document.getElementById('province-info').textContent =
                    `${provinceInfo.regionName} 지역`;
            }
            return;
        }

        if (this.currentQuestion >= this.totalQuestions) return;

        const currentProvince = this.shuffledProvinces[this.currentQuestion];
        const isCorrect = provinceId === currentProvince.id;

        this.stopTimer();

        if (isCorrect) {
            this.score += 10;
            this.results.push({ province: currentProvince.name, correct: true });
            this.highlightProvince(feature.properties.name, 'correct');
            this.showFeedback('정답입니다!', 'correct');
        } else {
            this.results.push({
                province: currentProvince.name,
                correct: false,
                answer: provinceInfo?.name || '알 수 없음'
            });
            this.highlightProvince(feature.properties.name, 'incorrect');
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

    highlightProvince(name, className) {
        this.svg.selectAll('.province')
            .filter(d => d.properties.name === name)
            .classed(className, true);
    }

    highlightProvinceById(provinceId, className) {
        this.svg.selectAll('.province')
            .filter(d => this.getProvinceIdFromName(d.properties.name) === provinceId)
            .classed(className, true);
    }

    nextQuestion() {
        this.drawMap();

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

        this.results.push({ province: currentProvince.name, correct: false, timeout: true });

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
        this.stopTimer();
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new CanadaProvincesQuiz();
});
