// 세계 지도 퀴즈 게임

class WorldMapQuiz {
    constructor() {
        this.currentRegion = null; // asia, europe, africa, northAmerica, southAmerica, oceania, world
        this.currentMode = null; // explore, practice, quiz, test
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

        this.init();
    }

    async init() {
        // URL 파라미터 확인
        const params = new URLSearchParams(window.location.search);
        this.currentRegion = params.get('region');
        this.currentMode = params.get('mode');

        // 테마 설정
        this.setupTheme();

        // 지도 데이터 로드
        await this.loadMapData();

        // 화면 설정
        this.setupScreen();

        // 이벤트 리스너 설정
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

            // 탐색 모드에서 테마 변경시 지도 다시 그리기
            if (this.currentMode === 'explore' && this.topoData) {
                this.drawMap();
            }
        });
    }

    async loadMapData() {
        try {
            const response = await fetch('data/countries-110m.json');
            this.topoData = await response.json();

            // 로딩 완료
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('continent-buttons').classList.remove('hidden');
        } catch (error) {
            console.error('지도 데이터 로드 실패:', error);
            document.getElementById('loading').textContent = '지도 데이터 로드 실패';
        }
    }

    setupScreen() {
        if (this.currentRegion && this.currentMode) {
            // 모드까지 선택된 경우 → 시작 화면 또는 게임 화면
            this.showScreen('start-screen');
            this.updateModeInfo();

            if (this.currentMode === 'explore') {
                // explore 모드는 바로 시작
                this.startGame();
            }
        } else if (this.currentRegion) {
            // 대륙만 선택된 경우 → 모드 선택 화면
            this.showScreen('mode-screen');
            this.updateRegionTitle();
        } else {
            // 아무것도 선택 안됨 → 대륙 선택 화면
            this.showScreen('continent-screen');
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        // 타이머 표시/숨김
        const stats = document.querySelector('.stats');
        if (screenId === 'game-screen') {
            stats.style.display = 'flex';
            if (this.currentMode === 'explore' || this.currentMode === 'practice') {
                stats.classList.add('timer-hidden');
            } else {
                stats.classList.remove('timer-hidden');
            }
        } else {
            stats.style.display = screenId === 'continent-screen' || screenId === 'mode-screen' ? 'none' : 'flex';
        }

        // 테마 토글 표시 (explore 모드 또는 랜딩 화면에서만)
        const themeToggle = document.getElementById('theme-toggle');
        if (this.currentMode === 'explore' || screenId === 'continent-screen') {
            themeToggle.classList.remove('hidden');
        } else {
            themeToggle.classList.add('hidden');
        }
    }

    updateRegionTitle() {
        const regionNames = {
            asia: '아시아',
            europe: '유럽',
            africa: '아프리카',
            northAmerica: '북아메리카',
            southAmerica: '남아메리카',
            oceania: '오세아니아',
            world: '전 세계'
        };

        const title = document.getElementById('region-title');
        title.textContent = `${regionNames[this.currentRegion]} 퀴즈`;

        // 모드 버튼 링크 업데이트
        document.querySelectorAll('.mode-btn').forEach(btn => {
            const mode = btn.dataset.mode;
            btn.href = `?region=${this.currentRegion}&mode=${mode}`;
        });
    }

    updateModeInfo() {
        const regionNames = {
            asia: '아시아',
            europe: '유럽',
            africa: '아프리카',
            northAmerica: '북아메리카',
            southAmerica: '남아메리카',
            oceania: '오세아니아',
            world: '전 세계'
        };

        const modeInfo = {
            explore: {
                title: `${regionNames[this.currentRegion]} 지도 둘러보기`,
                desc: '자유롭게 지도를 탐색해보세요. 국가를 클릭하면 이름이 표시됩니다.'
            },
            practice: {
                title: `${regionNames[this.currentRegion]} 연습 모드`,
                desc: '시간제한 없이 천천히 국가 위치를 맞춰보세요.'
            },
            quiz: {
                title: `${regionNames[this.currentRegion]} 퀴즈`,
                desc: '5초 안에 해당 국가를 찾아 클릭하세요!'
            },
            test: {
                title: `${regionNames[this.currentRegion]} 실전 테스트`,
                desc: '국가 이름 없이 지도만 보고 위치를 맞춰보세요!'
            }
        };

        document.getElementById('mode-title').textContent = modeInfo[this.currentMode].title;
        document.getElementById('mode-description').textContent = modeInfo[this.currentMode].desc;

        // 뒤로가기 버튼 업데이트
        document.getElementById('back-to-mode').href = `?region=${this.currentRegion}`;
        document.getElementById('game-back-btn').href = `?region=${this.currentRegion}`;
    }

    setupEventListeners() {
        // 시작 버튼
        document.getElementById('start-btn')?.addEventListener('click', () => {
            this.startGame();
        });

        // 다시하기 버튼
        document.getElementById('restart-btn')?.addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
    }

    getCountriesForRegion() {
        if (this.currentRegion === 'world') {
            // 전 세계 모든 국가
            return Object.values(COUNTRIES_DATA).flatMap(region => region.countries);
        }
        return COUNTRIES_DATA[this.currentRegion]?.countries || [];
    }

    startGame() {
        this.countries = this.getCountriesForRegion();
        this.currentQuestion = 0;
        this.score = 0;
        this.results = [];

        // 문제 수 설정
        this.totalQuestions = Math.min(10, this.countries.length);

        // 국가 섞기
        this.shuffledCountries = [...this.countries].sort(() => Math.random() - 0.5);

        this.showScreen('game-screen');
        this.drawMap();

        if (this.currentMode !== 'explore') {
            this.updateScore();
            this.nextQuestion();
        }
    }

    drawMap() {
        const container = document.getElementById('map-container');
        const svg = d3.select('#map-svg');
        svg.selectAll('*').remove();

        const width = container.clientWidth;
        const height = Math.min(600, window.innerHeight * 0.6);

        svg.attr('width', width).attr('height', height);

        // 프로젝션 설정 (대륙별로 다르게)
        this.projection = this.getProjection(width, height);
        this.path = d3.geoPath().projection(this.projection);

        // 국가 데이터
        const countries = topojson.feature(this.topoData, this.topoData.objects.countries);

        // 배경 (바다)
        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'var(--bg-tertiary)');

        // 국가 그리기
        const countryPaths = svg.selectAll('.country')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', this.path)
            .attr('fill', d => this.getCountryFill(d))
            .attr('stroke', 'var(--map-stroke)')
            .attr('stroke-width', 0.5)
            .on('click', (event, d) => this.handleCountryClick(d))
            .on('mouseover', function() {
                d3.select(this).attr('stroke-width', 2);
            })
            .on('mouseout', function() {
                d3.select(this).attr('stroke-width', 0.5);
            });

        // 라벨 그리기 (explore 모드 또는 quiz/practice 모드)
        if (this.currentMode !== 'test') {
            this.drawLabels(svg, countries);
        }

        this.svg = svg;
    }

    getProjection(width, height) {
        const projectionSettings = {
            asia: { center: [90, 35], scale: 250 },
            europe: { center: [15, 54], scale: 500 },
            africa: { center: [20, 0], scale: 280 },
            northAmerica: { center: [-100, 45], scale: 280 },
            southAmerica: { center: [-60, -20], scale: 300 },
            oceania: { center: [140, -25], scale: 350 },
            world: { center: [0, 20], scale: 130 }
        };

        const settings = projectionSettings[this.currentRegion] || projectionSettings.world;

        return d3.geoMercator()
            .center(settings.center)
            .scale(settings.scale * Math.min(width, height) / 600)
            .translate([width / 2, height / 2]);
    }

    getCountryFill(feature) {
        const countryId = feature.id;
        const countryInfo = getCountryById(countryId);

        if (!countryInfo) {
            return '#95a5a6'; // 미분류 국가
        }

        // 현재 대륙에 속한 국가만 색상 표시
        if (this.currentRegion === 'world' || countryInfo.continent === this.currentRegion) {
            return getCountryColor(countryId);
        }

        return '#ddd'; // 다른 대륙 국가
    }

    drawLabels(svg, countries) {
        const regionCountryIds = this.getCountriesForRegion().map(c => c.id);

        svg.selectAll('.country-label')
            .data(countries.features.filter(d => regionCountryIds.includes(d.id)))
            .enter()
            .append('text')
            .attr('class', 'country-label region-label')
            .attr('transform', d => {
                const centroid = this.path.centroid(d);
                return `translate(${centroid[0]}, ${centroid[1]})`;
            })
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .text(d => {
                const country = getCountryById(d.id);
                return country ? country.name : '';
            })
            .style('font-size', this.getLabelFontSize());
    }

    getLabelFontSize() {
        const sizes = {
            asia: '8px',
            europe: '7px',
            africa: '7px',
            northAmerica: '8px',
            southAmerica: '9px',
            oceania: '9px',
            world: '6px'
        };
        return sizes[this.currentRegion] || '8px';
    }

    handleCountryClick(feature) {
        const countryId = feature.id;
        const countryInfo = getCountryById(countryId);

        if (this.currentMode === 'explore') {
            // 탐색 모드: 클릭한 국가 이름 표시
            if (countryInfo) {
                this.showFeedback(`${countryInfo.name} (${countryInfo.nameEn})`, 'info');
            }
            return;
        }

        // 퀴즈 모드
        if (this.currentQuestion >= this.totalQuestions) return;

        const currentCountry = this.shuffledCountries[this.currentQuestion];
        const isCorrect = countryId === currentCountry.id;

        this.stopTimer();

        if (isCorrect) {
            this.score += 10;
            this.results.push({ country: currentCountry.name, correct: true });
            this.highlightCountry(countryId, 'correct');
            this.showFeedback('정답입니다!', 'correct');
        } else {
            this.results.push({ country: currentCountry.name, correct: false, answer: countryInfo?.name || '알 수 없음' });
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
        this.svg.selectAll('.country')
            .filter(d => d.id === countryId)
            .classed(className, true);
    }

    nextQuestion() {
        // 이전 하이라이트 제거
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

        const currentCountry = this.shuffledCountries[this.currentQuestion];
        this.results.push({ country: currentCountry.name, correct: false, timeout: true });
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
                    <span>${index + 1}. ${result.country}</span>
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
    new WorldMapQuiz();
});
