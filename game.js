// 게임 상태 관리
const GameState = {
    IDLE: 'idle',
    SELECT_PROVINCE: 'select_province',
    SELECT_SUBREGION: 'select_subregion',
    SELECT_DISTRICT: 'select_district',
    SHOWING_RESULT: 'showing_result'
};

class KoreaMapQuiz {
    constructor() {
        this.score = 0;
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.timeLimit = 5000; // 5초
        this.timer = null;
        this.timeRemaining = 5000;
        this.state = GameState.IDLE;
        this.currentAnswer = null;
        this.selectedProvince = null;
        this.selectedSubRegion = null;
        this.questions = [];
        this.results = [];

        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.scoreEl = document.getElementById('score');
        this.questionNumEl = document.getElementById('question-num');
        this.timerEl = document.getElementById('timer');
        this.timerFillEl = document.getElementById('timer-fill');
        this.questionTextEl = document.getElementById('question-text');
        this.stepIndicatorEl = document.getElementById('step-indicator');
        this.mapContainer = document.getElementById('map-container');
        this.feedbackEl = document.getElementById('feedback');
        this.finalScoreEl = document.getElementById('final-score');
        this.resultDetailsEl = document.getElementById('result-details');
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.startGame());
    }

    startGame() {
        this.score = 0;
        this.currentQuestion = 0;
        this.results = [];
        this.generateQuestions();
        this.showScreen('game');
        this.updateUI();
        this.nextQuestion();
    }

    generateQuestions() {
        const allDistricts = getAllDistricts();
        // 셔플하고 10개 선택
        const shuffled = allDistricts.sort(() => Math.random() - 0.5);
        this.questions = shuffled.slice(0, this.totalQuestions);
    }

    showScreen(screen) {
        this.startScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.resultScreen.classList.remove('active');

        switch (screen) {
            case 'start':
                this.startScreen.classList.add('active');
                break;
            case 'game':
                this.gameScreen.classList.add('active');
                break;
            case 'result':
                this.resultScreen.classList.add('active');
                break;
        }
    }

    updateUI() {
        this.scoreEl.textContent = this.score;
        this.questionNumEl.textContent = `${this.currentQuestion}/${this.totalQuestions}`;
    }

    nextQuestion() {
        if (this.currentQuestion >= this.totalQuestions) {
            this.endGame();
            return;
        }

        this.currentAnswer = this.questions[this.currentQuestion];
        this.selectedProvince = null;
        this.selectedSubRegion = null;
        this.currentQuestion++;
        this.updateUI();

        this.questionTextEl.textContent = this.currentAnswer.name;
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';

        this.state = GameState.SELECT_PROVINCE;
        this.updateStepIndicator();
        this.renderProvinceMap();
        this.startTimer();
    }

    updateStepIndicator() {
        switch (this.state) {
            case GameState.SELECT_PROVINCE:
                this.stepIndicatorEl.textContent = '1단계: 도/광역시를 선택하세요';
                break;
            case GameState.SELECT_SUBREGION:
                this.stepIndicatorEl.textContent = '2단계: 북부/남부를 선택하세요';
                break;
            case GameState.SELECT_DISTRICT:
                this.stepIndicatorEl.textContent = '마지막 단계: 정확한 시/군/구를 선택하세요';
                break;
        }
    }

    startTimer() {
        this.timeRemaining = this.timeLimit;
        this.updateTimerDisplay();

        if (this.timer) clearInterval(this.timer);

        this.timer = setInterval(() => {
            this.timeRemaining -= 100;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                clearInterval(this.timer);
                this.handleTimeout();
            }
        }, 100);
    }

    updateTimerDisplay() {
        const seconds = (this.timeRemaining / 1000).toFixed(1);
        this.timerEl.textContent = seconds;
        const percentage = (this.timeRemaining / this.timeLimit) * 100;
        this.timerFillEl.style.width = `${percentage}%`;

        if (percentage <= 40) {
            this.timerFillEl.classList.add('warning');
        } else {
            this.timerFillEl.classList.remove('warning');
        }
    }

    handleTimeout() {
        this.state = GameState.SHOWING_RESULT;
        this.feedbackEl.textContent = `시간 초과! 정답: ${this.currentAnswer.provinceName} - ${this.currentAnswer.name}`;
        this.feedbackEl.className = 'feedback timeout';

        this.results.push({
            question: this.currentAnswer.name,
            correct: false,
            answer: '시간 초과'
        });

        setTimeout(() => this.nextQuestion(), 2000);
    }

    renderProvinceMap() {
        const svg = this.createSVG();

        for (const [id, province] of Object.entries(PROVINCES)) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', province.path);
            path.setAttribute('fill', province.color);
            path.setAttribute('data-id', id);
            path.setAttribute('data-name', province.name);

            path.addEventListener('click', (e) => this.handleProvinceClick(id, e));
            svg.appendChild(path);

            // 라벨 추가
            const label = this.createLabel(province.name, this.getPathCenter(province.path));
            svg.appendChild(label);
        }

        this.mapContainer.innerHTML = '';
        this.mapContainer.appendChild(svg);
    }

    renderSubRegionSelection(provinceId) {
        const province = PROVINCES[provinceId];
        const svg = this.createSVG();

        // 뒤로가기 버튼
        const backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.textContent = '← 뒤로';
        backBtn.addEventListener('click', () => {
            this.state = GameState.SELECT_PROVINCE;
            this.selectedProvince = null;
            this.updateStepIndicator();
            this.renderProvinceMap();
        });

        for (const [regionId, region] of Object.entries(province.subRegions)) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', region.path);
            path.setAttribute('fill', regionId === 'north' ? '#3498db' : '#e74c3c');
            path.setAttribute('data-id', regionId);

            path.addEventListener('click', () => this.handleSubRegionClick(regionId));
            svg.appendChild(path);

            const label = this.createLabel(region.name, this.getPathCenter(region.path));
            svg.appendChild(label);
        }

        this.mapContainer.innerHTML = '';
        this.mapContainer.appendChild(backBtn);
        this.mapContainer.appendChild(svg);
    }

    renderDistrictMap(provinceId, subRegion = null) {
        const province = PROVINCES[provinceId];
        const svg = this.createSVG();

        // 뒤로가기 버튼
        const backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.textContent = '← 뒤로';
        backBtn.addEventListener('click', () => {
            if (province.hasSubRegions && subRegion) {
                this.state = GameState.SELECT_SUBREGION;
                this.selectedSubRegion = null;
                this.updateStepIndicator();
                this.renderSubRegionSelection(provinceId);
            } else {
                this.state = GameState.SELECT_PROVINCE;
                this.selectedProvince = null;
                this.updateStepIndicator();
                this.renderProvinceMap();
            }
        });

        // 필터링된 시군구만 표시
        const filteredDistricts = Object.entries(province.districts).filter(([id, district]) => {
            if (!subRegion) return true;
            return district.region === subRegion;
        });

        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e67e22', '#16a085', '#8e44ad', '#27ae60'];
        let colorIndex = 0;

        for (const [id, district] of filteredDistricts) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', district.path);
            path.setAttribute('fill', colors[colorIndex % colors.length]);
            path.setAttribute('data-id', id);
            path.setAttribute('data-name', district.name);

            path.addEventListener('click', (e) => this.handleDistrictClick(id, e));
            svg.appendChild(path);

            const label = this.createLabel(district.name, this.getPathCenter(district.path));
            svg.appendChild(label);

            colorIndex++;
        }

        this.mapContainer.innerHTML = '';
        this.mapContainer.appendChild(backBtn);
        this.mapContainer.appendChild(svg);
    }

    createSVG() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '50 50 450 680');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        return svg;
    }

    createLabel(text, position) {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', position.x);
        label.setAttribute('y', position.y);
        label.setAttribute('class', 'map-label');
        label.textContent = text;
        return label;
    }

    getPathCenter(pathData) {
        // 간단한 경로 중심점 계산
        const coords = pathData.match(/[\d.]+/g).map(Number);
        let sumX = 0, sumY = 0, count = 0;

        for (let i = 0; i < coords.length; i += 2) {
            if (i + 1 < coords.length) {
                sumX += coords[i];
                sumY += coords[i + 1];
                count++;
            }
        }

        return { x: sumX / count, y: sumY / count };
    }

    handleProvinceClick(provinceId, event) {
        if (this.state !== GameState.SELECT_PROVINCE) return;

        const correctProvinceId = this.currentAnswer.provinceId;

        if (provinceId === correctProvinceId) {
            this.selectedProvince = provinceId;
            const province = PROVINCES[provinceId];

            // 하이라이트 효과
            event.target.classList.add('selected');

            if (province.hasSubRegions && this.currentAnswer.region) {
                // 북부/남부 선택 필요
                this.state = GameState.SELECT_SUBREGION;
                this.updateStepIndicator();
                setTimeout(() => this.renderSubRegionSelection(provinceId), 300);
            } else {
                // 바로 시군구 선택
                this.state = GameState.SELECT_DISTRICT;
                this.updateStepIndicator();
                setTimeout(() => this.renderDistrictMap(provinceId), 300);
            }
        } else {
            // 틀린 도/광역시 선택
            this.handleWrongAnswer(event.target, `틀렸습니다! ${this.currentAnswer.provinceName}가 정답입니다.`);
        }
    }

    handleSubRegionClick(regionId) {
        if (this.state !== GameState.SELECT_SUBREGION) return;

        const correctRegion = this.currentAnswer.region;

        if (regionId === correctRegion) {
            this.selectedSubRegion = regionId;
            this.state = GameState.SELECT_DISTRICT;
            this.updateStepIndicator();
            setTimeout(() => this.renderDistrictMap(this.selectedProvince, regionId), 300);
        } else {
            const regionName = regionId === 'north' ? '북부' : '남부';
            const correctName = correctRegion === 'north' ? '북부' : '남부';
            this.handleWrongAnswer(null, `틀렸습니다! ${correctName}가 정답입니다.`);
        }
    }

    handleDistrictClick(districtId, event) {
        if (this.state !== GameState.SELECT_DISTRICT) return;

        clearInterval(this.timer);

        const correctDistrictId = this.currentAnswer.id;

        if (districtId === correctDistrictId) {
            // 정답!
            event.target.classList.add('correct');
            this.score += 10;
            this.updateUI();

            this.feedbackEl.textContent = `정답입니다! +10점`;
            this.feedbackEl.className = 'feedback correct';

            this.results.push({
                question: this.currentAnswer.name,
                correct: true,
                answer: this.currentAnswer.name
            });
        } else {
            // 오답
            event.target.classList.add('incorrect');
            const correctDistrict = PROVINCES[this.selectedProvince].districts[correctDistrictId];

            this.feedbackEl.textContent = `틀렸습니다! 정답: ${correctDistrict.name}`;
            this.feedbackEl.className = 'feedback incorrect';

            this.results.push({
                question: this.currentAnswer.name,
                correct: false,
                answer: PROVINCES[this.selectedProvince].districts[districtId].name
            });

            // 정답 위치 표시
            this.highlightCorrectAnswer(correctDistrictId);
        }

        this.state = GameState.SHOWING_RESULT;
        setTimeout(() => this.nextQuestion(), 2000);
    }

    handleWrongAnswer(element, message) {
        clearInterval(this.timer);

        if (element) {
            element.classList.add('incorrect');
        }

        this.feedbackEl.textContent = message;
        this.feedbackEl.className = 'feedback incorrect';

        this.results.push({
            question: this.currentAnswer.name,
            correct: false,
            answer: '잘못된 선택'
        });

        this.state = GameState.SHOWING_RESULT;
        setTimeout(() => this.nextQuestion(), 2000);
    }

    highlightCorrectAnswer(districtId) {
        const paths = this.mapContainer.querySelectorAll('path');
        paths.forEach(path => {
            if (path.getAttribute('data-id') === districtId) {
                path.classList.add('correct');
            }
        });
    }

    endGame() {
        clearInterval(this.timer);
        this.showScreen('result');
        this.finalScoreEl.textContent = this.score;

        // 결과 상세 표시
        let html = '<h3>문제별 결과</h3>';
        this.results.forEach((result, index) => {
            const className = result.correct ? 'correct-result' : 'incorrect-result';
            const icon = result.correct ? '✓' : '✗';
            html += `
                <div class="result-item ${className}">
                    <span>${index + 1}. ${result.question}</span>
                    <span>${icon} ${result.answer}</span>
                </div>
            `;
        });

        const correctCount = this.results.filter(r => r.correct).length;
        html += `<p style="margin-top: 20px; text-align: center;">정답률: ${correctCount}/${this.totalQuestions} (${(correctCount/this.totalQuestions*100).toFixed(0)}%)</p>`;

        this.resultDetailsEl.innerHTML = html;
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new KoreaMapQuiz();
});
