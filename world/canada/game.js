// 캐나다 13개 주/준주 퀴즈 게임

class CanadaProvincesQuiz {
    constructor() {
        this.currentMode = null;
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
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
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

        const stats = document.querySelector('.stats');
        if (screenId === 'game-screen') {
            stats.style.display = 'flex';
            if (this.currentMode === 'explore' || this.currentMode === 'practice') {
                stats.classList.add('timer-hidden');
            } else {
                stats.classList.remove('timer-hidden');
            }
        } else {
            stats.style.display = screenId === 'mode-screen' ? 'none' : 'flex';
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
    }

    setupEventListeners() {
        document.getElementById('start-btn')?.addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restart-btn')?.addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
    }

    startGame() {
        this.provinces = getAllProvinces();
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
            document.getElementById('question-text').textContent = '지도를 클릭해서 탐색하세요';
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

    drawMap() {
        const container = document.getElementById('map-container');
        const svg = d3.select('#map-svg');
        svg.selectAll('*').remove();

        const width = container.clientWidth;
        const height = Math.min(500, window.innerHeight * 0.55);

        svg.attr('width', width).attr('height', height);

        // 캐나다 중심 투영 (줌아웃)
        this.projection = d3.geoMercator()
            .center([-96, 62])
            .scale(width * 0.35)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        // 배경
        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'var(--bg-tertiary)');

        // 주/준주 그리기 (인접 색상 분리 적용)
        const colorPalette = this.getColorPalette();
        const colorAssignment = this.assignColorsToFeatures(this.topoData.features);

        svg.selectAll('.province')
            .data(this.topoData.features)
            .enter()
            .append('path')
            .attr('class', 'province country')
            .attr('d', this.path)
            .attr('fill', d => colorPalette[colorAssignment.get(d.properties.name) || 0])
            .attr('stroke', 'var(--map-stroke)')
            .attr('stroke-width', 0.8)
            .on('click', (event, d) => this.handleProvinceClick(d))
            .on('mouseover', function() {
                d3.select(this).attr('stroke-width', 2).style('filter', 'brightness(1.2)');
            })
            .on('mouseout', function() {
                d3.select(this).attr('stroke-width', 0.8).style('filter', 'none');
            });

        // 라벨 (test 모드 제외)
        if (this.currentMode !== 'test') {
            this.drawProvinceLabels(svg);
        }

        this.svg = svg;
    }

    drawProvinceLabels(svg) {
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

        // 선호 방향 힌트 (대서양 방향)
        const preferredDirection = {
            'PE': 'SE', 'NS': 'SE', 'NB': 'E', 'NL': 'E'
        };

        // 큰 지역 오프셋 (형태상 중심이 어색한 경우)
        const labelOffsets = {
            'NT': { dx: 0, dy: 40 },
            'NU': { dx: -60, dy: 60 },
            'YT': { dx: 0, dy: 30 },
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
        const sortedFeatures = [...this.topoData.features].sort((a, b) => getFeatureSize(b) - getFeatureSize(a));

        sortedFeatures.forEach(d => {
            const centroid = this.path.centroid(d);
            if (isNaN(centroid[0]) || isNaN(centroid[1])) return;

            const provinceId = this.getProvinceIdFromName(d.properties.name);
            const province = getProvinceById(provinceId);
            if (!province) return;

            const labelWidth = province.name.length * 6 + 10;
            const labelHeight = 14;
            const offset = labelOffsets[provinceId];

            // 스마트 판단: 리더 라인이 필요한가?
            const fitsInside = labelFitsInFeature(d, labelWidth, labelHeight);
            const wouldOverlap = centerLabelOverlapsOthers(centroid, labelWidth, labelHeight);
            const needsLeaderLine = !fitsInside || wouldOverlap;

            if (needsLeaderLine) {
                const preferredDir = preferredDirection[provinceId] || 'E';
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
                    .text(province.name)
                    .style('pointer-events', 'none');
            } else {
                // 리더 라인 불필요 - 오프셋 적용 가능
                const finalX = centroid[0] + (offset ? offset.dx : 0);
                const finalY = centroid[1] + (offset ? offset.dy : 0);

                placedLabels.push({ x: finalX - labelWidth/2, y: finalY - labelHeight/2, width: labelWidth, height: labelHeight });

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
