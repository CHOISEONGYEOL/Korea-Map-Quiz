// 대한민국 지도 퀴즈 - TopoJSON 버전 (최적화)

// 시도별 색상
const PROVINCE_COLORS = {
    '서울특별시': '#FF6B6B',
    '부산광역시': '#4ECDC4',
    '대구광역시': '#9B59B6',
    '인천광역시': '#3498DB',
    '광주광역시': '#E67E22',
    '대전광역시': '#F1C40F',
    '울산광역시': '#1ABC9C',
    '세종특별자치시': '#2980B9',
    '경기도': '#27AE60',
    '강원도': '#8E44AD',
    '충청북도': '#D35400',
    '충청남도': '#C0392B',
    '전라북도': '#2ECC71',
    '전라남도': '#1E8449',
    '경상북도': '#B8860B',
    '경상남도': '#8B4513',
    '제주특별자치도': '#FF7F50'
};

// 시도 약칭
const SHORT_NAMES = {
    '서울특별시': '서울',
    '부산광역시': '부산',
    '대구광역시': '대구',
    '인천광역시': '인천',
    '광주광역시': '광주',
    '대전광역시': '대전',
    '울산광역시': '울산',
    '세종특별자치시': '세종',
    '경기도': '경기',
    '강원도': '강원',
    '충청북도': '충북',
    '충청남도': '충남',
    '전라북도': '전북',
    '전라남도': '전남',
    '경상북도': '경북',
    '경상남도': '경남',
    '제주특별자치도': '제주'
};

// 시도코드로 시도명 매핑 (시군구 코드 앞 2자리)
const CODE_TO_PROVINCE = {
    '11': '서울특별시',
    '26': '부산광역시',
    '27': '대구광역시',
    '28': '인천광역시',
    '29': '광주광역시',
    '30': '대전광역시',
    '31': '울산광역시',
    '36': '세종특별자치시',
    '41': '경기도',
    '42': '강원도',
    '43': '충청북도',
    '44': '충청남도',
    '45': '전라북도',
    '46': '전라남도',
    '47': '경상북도',
    '48': '경상남도',
    '50': '제주특별자치도'
};

// 북부/남부 구분이 필요한 도 지역
const LARGE_PROVINCES = ['경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도'];

// 게임 상태
const GameState = {
    IDLE: 'idle',
    SELECT_PROVINCE: 'select_province',
    SELECT_SUBREGION: 'select_subregion',
    SELECT_DISTRICT: 'select_district',
    SHOWING_RESULT: 'showing_result'
};

class KoreaMapQuiz {
    constructor() {
        this.provincesTopo = null;    // 시도 TopoJSON
        this.municipalitiesTopo = null; // 시군구 TopoJSON
        this.provincesGeo = null;     // 시도 GeoJSON (변환됨)
        this.municipalitiesGeo = null; // 시군구 GeoJSON (변환됨)
        this.allDistricts = [];       // 모든 시군구 목록

        this.score = 0;
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.timeLimit = 5000;
        this.timer = null;
        this.timeRemaining = 5000;
        this.state = GameState.IDLE;
        this.currentAnswer = null;
        this.selectedProvince = null;
        this.correctSubRegion = null;
        this.questions = [];
        this.results = [];

        this.svg = null;
        this.projection = null;
        this.path = null;

        this.initElements();
        this.initEventListeners();
        this.loadData();
    }

    initElements() {
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.loadingEl = document.getElementById('loading');
        this.scoreEl = document.getElementById('score');
        this.questionNumEl = document.getElementById('question-num');
        this.timerEl = document.getElementById('timer');
        this.timerFillEl = document.getElementById('timer-fill');
        this.questionTextEl = document.getElementById('question-text');
        this.stepIndicatorEl = document.getElementById('step-indicator');
        this.mapContainer = document.getElementById('map-container');
        this.mapSvg = document.getElementById('map-svg');
        this.feedbackEl = document.getElementById('feedback');
        this.finalScoreEl = document.getElementById('final-score');
        this.resultDetailsEl = document.getElementById('result-details');
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.startGame());
    }

    async loadData() {
        this.loadingEl.textContent = '지도 데이터 로딩 중...';

        try {
            // 로컬 TopoJSON 파일 로드
            const [provincesRes, municipalitiesRes] = await Promise.all([
                fetch('data/provinces.json'),
                fetch('data/municipalities.json')
            ]);

            this.provincesTopo = await provincesRes.json();
            this.municipalitiesTopo = await municipalitiesRes.json();

            // TopoJSON -> GeoJSON 변환
            const provincesKey = Object.keys(this.provincesTopo.objects)[0];
            const municipalitiesKey = Object.keys(this.municipalitiesTopo.objects)[0];

            this.provincesGeo = topojson.feature(this.provincesTopo, this.provincesTopo.objects[provincesKey]);
            this.municipalitiesGeo = topojson.feature(this.municipalitiesTopo, this.municipalitiesTopo.objects[municipalitiesKey]);

            // 시군구 목록 생성
            this.buildDistrictList();

            this.loadingEl.classList.add('hidden');
            this.startBtn.disabled = false;

            console.log(`로드 완료: ${this.provincesGeo.features.length}개 시도, ${this.allDistricts.length}개 시군구`);

        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            this.loadingEl.textContent = '지도 데이터 로딩 실패. 페이지를 새로고침해주세요.';
        }
    }

    buildDistrictList() {
        this.allDistricts = [];

        this.municipalitiesGeo.features.forEach(feature => {
            const name = feature.properties.name;
            const code = feature.properties.code;
            const provinceCode = code.substring(0, 2);
            const provinceName = CODE_TO_PROVINCE[provinceCode];

            if (provinceName) {
                this.allDistricts.push({
                    name: name,
                    provinceName: provinceName,
                    code: code,
                    feature: feature
                });
            }
        });
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
        const shuffled = [...this.allDistricts].sort(() => Math.random() - 0.5);
        this.questions = shuffled.slice(0, this.totalQuestions);
    }

    showScreen(screen) {
        this.startScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.resultScreen.classList.remove('active');

        switch (screen) {
            case 'start': this.startScreen.classList.add('active'); break;
            case 'game': this.gameScreen.classList.add('active'); break;
            case 'result': this.resultScreen.classList.add('active'); break;
        }
    }

    updateUI() {
        this.scoreEl.textContent = this.score;
        this.questionNumEl.textContent = `${this.currentQuestion}/${this.totalQuestions}`;
    }

    nextQuestion() {
        // 뒤로가기 버튼 제거
        const backBtn = this.mapContainer.querySelector('.back-btn');
        if (backBtn) backBtn.remove();

        if (this.currentQuestion >= this.totalQuestions) {
            this.endGame();
            return;
        }

        this.currentAnswer = this.questions[this.currentQuestion];
        this.selectedProvince = null;
        this.correctSubRegion = null;
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
        const backBtn = this.mapContainer.querySelector('.back-btn');
        if (backBtn) backBtn.remove();

        this.feedbackEl.textContent = `시간 초과! 정답: ${SHORT_NAMES[this.currentAnswer.provinceName]} ${this.currentAnswer.name}`;
        this.feedbackEl.className = 'feedback timeout';

        this.results.push({
            question: this.currentAnswer.name,
            correct: false,
            answer: '시간 초과'
        });

        setTimeout(() => this.nextQuestion(), 2000);
    }

    renderProvinceMap() {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 대한민국 중심 투영
        this.projection = d3.geoMercator()
            .center([127.5, 36.0])
            .scale(5500)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        // 시도 경계 그리기
        this.svg.selectAll('.province')
            .data(this.provincesGeo.features)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => PROVINCE_COLORS[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleProvinceClick(d.properties.name, event));

        // 시도 라벨
        this.svg.selectAll('.region-label')
            .data(this.provincesGeo.features)
            .enter()
            .append('text')
            .attr('class', 'region-label')
            .attr('transform', d => `translate(${this.path.centroid(d)})`)
            .text(d => SHORT_NAMES[d.properties.name] || d.properties.name);
    }

    handleProvinceClick(provinceName, event) {
        if (this.state !== GameState.SELECT_PROVINCE) return;

        const correctProvince = this.currentAnswer.provinceName;

        if (provinceName === correctProvince) {
            this.selectedProvince = provinceName;
            d3.selectAll('.province').classed('selected', false);
            d3.select(event.target).classed('selected', true);

            if (LARGE_PROVINCES.includes(provinceName)) {
                this.state = GameState.SELECT_SUBREGION;
                this.updateStepIndicator();
                setTimeout(() => this.renderSubRegionSelection(provinceName), 300);
            } else {
                this.state = GameState.SELECT_DISTRICT;
                this.updateStepIndicator();
                setTimeout(() => this.renderDistrictMap(provinceName), 300);
            }
        } else {
            this.handleWrongAnswer(event.target, `틀렸습니다! ${SHORT_NAMES[correctProvince]}가 정답입니다.`);
        }
    }

    renderSubRegionSelection(provinceName) {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        // 해당 시도의 시군구만 필터링
        const provinceCode = Object.keys(CODE_TO_PROVINCE).find(k => CODE_TO_PROVINCE[k] === provinceName);
        const districts = this.municipalitiesGeo.features.filter(f =>
            f.properties.code.startsWith(provinceCode)
        );

        // 위도 기준으로 북부/남부 구분
        const centroids = districts.map(f => ({
            feature: f,
            lat: d3.geoCentroid(f)[1]
        }));
        const avgLat = d3.mean(centroids, d => d.lat);

        const northFeatures = centroids.filter(d => d.lat >= avgLat).map(d => d.feature);
        const southFeatures = centroids.filter(d => d.lat < avgLat).map(d => d.feature);

        // 정답 시군구가 북부인지 남부인지 확인
        const answerCentroid = d3.geoCentroid(this.currentAnswer.feature);
        this.correctSubRegion = answerCentroid[1] >= avgLat ? 'north' : 'south';

        // 투영 설정
        const allFeatures = { type: 'FeatureCollection', features: districts };
        this.projection = d3.geoMercator().fitSize([width - 40, height - 40], allFeatures);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 뒤로가기 버튼
        this.addBackButton(() => {
            this.state = GameState.SELECT_PROVINCE;
            this.selectedProvince = null;
            this.updateStepIndicator();
            this.renderProvinceMap();
        });

        // 북부 그리기
        this.svg.selectAll('.north')
            .data(northFeatures)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', '#3498db')
            .on('click', (event) => this.handleSubRegionClick('north', event));

        // 남부 그리기
        this.svg.selectAll('.south')
            .data(southFeatures)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', '#e74c3c')
            .on('click', (event) => this.handleSubRegionClick('south', event));

        // 라벨
        const northCenter = d3.geoCentroid({ type: 'FeatureCollection', features: northFeatures });
        const southCenter = d3.geoCentroid({ type: 'FeatureCollection', features: southFeatures });

        this.svg.append('text')
            .attr('class', 'region-label')
            .attr('transform', `translate(${this.projection(northCenter)})`)
            .text(`${SHORT_NAMES[provinceName]} 북부`);

        this.svg.append('text')
            .attr('class', 'region-label')
            .attr('transform', `translate(${this.projection(southCenter)})`)
            .text(`${SHORT_NAMES[provinceName]} 남부`);
    }

    handleSubRegionClick(region, event) {
        if (this.state !== GameState.SELECT_SUBREGION) return;

        if (region === this.correctSubRegion) {
            this.state = GameState.SELECT_DISTRICT;
            this.updateStepIndicator();
            setTimeout(() => this.renderDistrictMap(this.selectedProvince, region), 300);
        } else {
            const correctName = this.correctSubRegion === 'north' ? '북부' : '남부';
            this.handleWrongAnswer(event.target, `틀렸습니다! ${correctName}가 정답입니다.`);
        }
    }

    renderDistrictMap(provinceName, subRegion = null) {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        // 해당 시도의 시군구 필터링
        const provinceCode = Object.keys(CODE_TO_PROVINCE).find(k => CODE_TO_PROVINCE[k] === provinceName);
        let districts = this.municipalitiesGeo.features.filter(f =>
            f.properties.code.startsWith(provinceCode)
        );

        // 북부/남부 필터링
        if (subRegion) {
            const centroids = districts.map(f => ({
                feature: f,
                lat: d3.geoCentroid(f)[1]
            }));
            const avgLat = d3.mean(centroids, d => d.lat);

            if (subRegion === 'north') {
                districts = centroids.filter(d => d.lat >= avgLat).map(d => d.feature);
            } else {
                districts = centroids.filter(d => d.lat < avgLat).map(d => d.feature);
            }
        }

        // 투영 설정
        const featureCollection = { type: 'FeatureCollection', features: districts };
        this.projection = d3.geoMercator().fitSize([width - 40, height - 40], featureCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 뒤로가기 버튼
        this.addBackButton(() => {
            if (LARGE_PROVINCES.includes(provinceName) && subRegion) {
                this.state = GameState.SELECT_SUBREGION;
                this.updateStepIndicator();
                this.renderSubRegionSelection(provinceName);
            } else {
                this.state = GameState.SELECT_PROVINCE;
                this.selectedProvince = null;
                this.updateStepIndicator();
                this.renderProvinceMap();
            }
        });

        // 색상 배열
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e67e22', '#16a085', '#8e44ad', '#27ae60', '#d35400', '#c0392b', '#2980b9', '#f1c40f'];

        // 시군구 그리기
        this.svg.selectAll('.district')
            .data(districts)
            .enter()
            .append('path')
            .attr('class', 'district')
            .attr('d', this.path)
            .attr('fill', (d, i) => colors[i % colors.length])
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleDistrictClick(d.properties.name, event));

        // 시군구 라벨
        this.svg.selectAll('.district-label')
            .data(districts)
            .enter()
            .append('text')
            .attr('class', 'district-label')
            .attr('transform', d => `translate(${this.path.centroid(d)})`)
            .text(d => d.properties.name);
    }

    addBackButton(onClick) {
        let existingBtn = this.mapContainer.querySelector('.back-btn');
        if (existingBtn) existingBtn.remove();

        const backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.textContent = '← 뒤로';
        backBtn.onclick = () => {
            backBtn.remove();
            onClick();
        };
        this.mapContainer.insertBefore(backBtn, this.mapSvg);
    }

    handleDistrictClick(districtName, event) {
        if (this.state !== GameState.SELECT_DISTRICT) return;

        clearInterval(this.timer);
        const backBtn = this.mapContainer.querySelector('.back-btn');
        if (backBtn) backBtn.remove();

        const correctDistrict = this.currentAnswer.name;

        if (districtName === correctDistrict) {
            d3.select(event.target).classed('correct', true);
            this.score += 10;
            this.updateUI();

            this.feedbackEl.textContent = `정답입니다! +10점`;
            this.feedbackEl.className = 'feedback correct';

            this.results.push({
                question: this.currentAnswer.name,
                correct: true,
                answer: districtName
            });
        } else {
            d3.select(event.target).classed('incorrect', true);

            this.feedbackEl.textContent = `틀렸습니다! 정답: ${correctDistrict}`;
            this.feedbackEl.className = 'feedback incorrect';

            this.results.push({
                question: this.currentAnswer.name,
                correct: false,
                answer: districtName
            });

            // 정답 하이라이트
            d3.selectAll('.district')
                .filter(d => d.properties.name === correctDistrict)
                .classed('highlight', true);
        }

        this.state = GameState.SHOWING_RESULT;
        setTimeout(() => this.nextQuestion(), 2000);
    }

    handleWrongAnswer(element, message) {
        clearInterval(this.timer);
        const backBtn = this.mapContainer.querySelector('.back-btn');
        if (backBtn) backBtn.remove();

        if (element) {
            d3.select(element).classed('incorrect', true);
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

    endGame() {
        clearInterval(this.timer);
        this.showScreen('result');
        this.finalScoreEl.textContent = this.score;

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
