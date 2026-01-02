// 대한민국 지도 퀴즈 - D3.js 버전

// GeoJSON 데이터 URL (raqoon886/Local_HangJeongDong)
const GEOJSON_BASE_URL = 'https://raw.githubusercontent.com/raqoon886/Local_HangJeongDong/master/';

// 시도별 GeoJSON 파일명
const PROVINCE_FILES = {
    '서울특별시': 'hangjeongdong_서울특별시.geojson',
    '부산광역시': 'hangjeongdong_부산광역시.geojson',
    '대구광역시': 'hangjeongdong_대구광역시.geojson',
    '인천광역시': 'hangjeongdong_인천광역시.geojson',
    '광주광역시': 'hangjeongdong_광주광역시.geojson',
    '대전광역시': 'hangjeongdong_대전광역시.geojson',
    '울산광역시': 'hangjeongdong_울산광역시.geojson',
    '세종특별자치시': 'hangjeongdong_세종특별자치시.geojson',
    '경기도': 'hangjeongdong_경기도.geojson',
    '강원도': 'hangjeongdong_강원도.geojson',
    '충청북도': 'hangjeongdong_충청북도.geojson',
    '충청남도': 'hangjeongdong_충청남도.geojson',
    '전라북도': 'hangjeongdong_전라북도.geojson',
    '전라남도': 'hangjeongdong_전라남도.geojson',
    '경상북도': 'hangjeongdong_경상북도.geojson',
    '경상남도': 'hangjeongdong_경상남도.geojson',
    '제주특별자치도': 'hangjeongdong_제주특별자치도.geojson'
};

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
        this.geoData = {};           // 시도별 GeoJSON 데이터
        this.provinceGeoData = null; // 시도 경계 데이터 (병합된)
        this.allDistricts = [];      // 모든 시군구 목록
        this.score = 0;
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.timeLimit = 5000;
        this.timer = null;
        this.timeRemaining = 5000;
        this.state = GameState.IDLE;
        this.currentAnswer = null;
        this.selectedProvince = null;
        this.selectedSubRegion = null;
        this.questions = [];
        this.results = [];

        this.svg = null;
        this.projection = null;
        this.path = null;

        this.initElements();
        this.initEventListeners();
        this.loadAllGeoData();
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

    async loadAllGeoData() {
        this.loadingEl.textContent = '지도 데이터 로딩 중... (0/17)';

        let loaded = 0;
        const total = Object.keys(PROVINCE_FILES).length;

        try {
            // 모든 시도 데이터 병렬 로드
            const promises = Object.entries(PROVINCE_FILES).map(async ([name, file]) => {
                const url = GEOJSON_BASE_URL + file;
                const response = await fetch(url);
                const data = await response.json();
                this.geoData[name] = data;
                loaded++;
                this.loadingEl.textContent = `지도 데이터 로딩 중... (${loaded}/${total})`;
            });

            await Promise.all(promises);

            // 시군구 목록 생성
            this.buildDistrictList();

            // 시도 경계 데이터 생성
            this.buildProvinceGeoData();

            this.loadingEl.classList.add('hidden');
            this.startBtn.disabled = false;

        } catch (error) {
            console.error('GeoJSON 로딩 실패:', error);
            this.loadingEl.textContent = '지도 데이터 로딩 실패. 페이지를 새로고침해주세요.';
        }
    }

    buildDistrictList() {
        this.allDistricts = [];

        for (const [provinceName, geoData] of Object.entries(this.geoData)) {
            // 시군구별로 그룹화
            const districtMap = new Map();

            geoData.features.forEach(feature => {
                const props = feature.properties;
                const sggnm = props.sggnm; // 시군구명

                if (!districtMap.has(sggnm)) {
                    districtMap.set(sggnm, {
                        name: sggnm,
                        provinceName: provinceName,
                        features: []
                    });
                }
                districtMap.get(sggnm).features.push(feature);
            });

            // 목록에 추가
            districtMap.forEach((district, name) => {
                this.allDistricts.push({
                    name: name,
                    provinceName: provinceName,
                    fullName: `${provinceName} ${name}`
                });
            });
        }

        console.log(`총 ${this.allDistricts.length}개 시군구 로드됨`);
    }

    buildProvinceGeoData() {
        // 각 시도의 외곽선을 생성
        const features = [];

        for (const [provinceName, geoData] of Object.entries(this.geoData)) {
            // 해당 시도의 모든 geometry를 하나로 합침
            const mergedFeature = {
                type: 'Feature',
                properties: {
                    name: provinceName
                },
                geometry: {
                    type: 'MultiPolygon',
                    coordinates: []
                }
            };

            geoData.features.forEach(feature => {
                if (feature.geometry.type === 'Polygon') {
                    mergedFeature.geometry.coordinates.push(feature.geometry.coordinates);
                } else if (feature.geometry.type === 'MultiPolygon') {
                    mergedFeature.geometry.coordinates.push(...feature.geometry.coordinates);
                }
            });

            features.push(mergedFeature);
        }

        this.provinceGeoData = {
            type: 'FeatureCollection',
            features: features
        };
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
        // 셔플하고 10개 선택
        const shuffled = [...this.allDistricts].sort(() => Math.random() - 0.5);
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
        this.feedbackEl.textContent = `시간 초과! 정답: ${this.currentAnswer.provinceName} ${this.currentAnswer.name}`;
        this.feedbackEl.className = 'feedback timeout';

        this.results.push({
            question: this.currentAnswer.name,
            correct: false,
            answer: '시간 초과'
        });

        setTimeout(() => this.nextQuestion(), 2000);
    }

    renderProvinceMap() {
        // SVG 초기화
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 대한민국 중심 좌표로 투영 설정
        this.projection = d3.geoMercator()
            .center([127.5, 36.0])
            .scale(5000)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        // 시도 경계 그리기
        const provinces = this.svg.selectAll('.province')
            .data(this.provinceGeoData.features)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => PROVINCE_COLORS[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleProvinceClick(d.properties.name, event));

        // 시도 라벨
        this.svg.selectAll('.region-label')
            .data(this.provinceGeoData.features)
            .enter()
            .append('text')
            .attr('class', 'region-label')
            .attr('transform', d => {
                const centroid = this.path.centroid(d);
                return `translate(${centroid[0]}, ${centroid[1]})`;
            })
            .text(d => this.getShortProvinceName(d.properties.name));
    }

    getShortProvinceName(name) {
        const shortNames = {
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
        return shortNames[name] || name;
    }

    handleProvinceClick(provinceName, event) {
        if (this.state !== GameState.SELECT_PROVINCE) return;

        const correctProvince = this.currentAnswer.provinceName;

        if (provinceName === correctProvince) {
            this.selectedProvince = provinceName;

            // 선택 표시
            d3.selectAll('.province').classed('selected', false);
            d3.select(event.target).classed('selected', true);

            if (LARGE_PROVINCES.includes(provinceName)) {
                // 큰 도는 북부/남부 선택
                this.state = GameState.SELECT_SUBREGION;
                this.updateStepIndicator();
                setTimeout(() => this.renderSubRegionSelection(provinceName), 300);
            } else {
                // 바로 시군구 선택
                this.state = GameState.SELECT_DISTRICT;
                this.updateStepIndicator();
                setTimeout(() => this.renderDistrictMap(provinceName), 300);
            }
        } else {
            this.handleWrongAnswer(event.target, `틀렸습니다! ${this.getShortProvinceName(correctProvince)}가 정답입니다.`);
        }
    }

    renderSubRegionSelection(provinceName) {
        // SVG 초기화
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        // 해당 시도의 GeoJSON만 사용
        const provinceData = this.geoData[provinceName];

        // 북부/남부 구분 (위도 기준)
        const allCoords = [];
        provinceData.features.forEach(f => {
            const centroid = d3.geoCentroid(f);
            allCoords.push({ feature: f, lat: centroid[1] });
        });

        const avgLat = d3.mean(allCoords, d => d.lat);

        const northFeatures = allCoords.filter(d => d.lat >= avgLat).map(d => d.feature);
        const southFeatures = allCoords.filter(d => d.lat < avgLat).map(d => d.feature);

        // 북부/남부 MultiPolygon 생성
        const createMultiPolygon = (features) => {
            const coords = [];
            features.forEach(f => {
                if (f.geometry.type === 'Polygon') {
                    coords.push(f.geometry.coordinates);
                } else if (f.geometry.type === 'MultiPolygon') {
                    coords.push(...f.geometry.coordinates);
                }
            });
            return {
                type: 'Feature',
                geometry: { type: 'MultiPolygon', coordinates: coords }
            };
        };

        const northGeo = createMultiPolygon(northFeatures);
        const southGeo = createMultiPolygon(southFeatures);

        // 정답의 위도 확인
        const answerDistricts = provinceData.features.filter(f =>
            f.properties.sggnm === this.currentAnswer.name
        );

        if (answerDistricts.length > 0) {
            const answerCentroid = d3.geoCentroid(answerDistricts[0]);
            this.correctSubRegion = answerCentroid[1] >= avgLat ? 'north' : 'south';
        }

        // 투영 설정
        const combinedFeatures = { type: 'FeatureCollection', features: provinceData.features };
        this.projection = d3.geoMercator().fitSize([width, height], combinedFeatures);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 뒤로가기 버튼
        const backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.textContent = '← 뒤로';
        backBtn.onclick = () => {
            backBtn.remove();
            this.state = GameState.SELECT_PROVINCE;
            this.selectedProvince = null;
            this.updateStepIndicator();
            this.renderProvinceMap();
        };
        this.mapContainer.insertBefore(backBtn, this.mapSvg);

        // 북부 그리기
        this.svg.append('path')
            .datum(northGeo)
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', '#3498db')
            .attr('data-region', 'north')
            .on('click', (event) => this.handleSubRegionClick('north', event));

        // 남부 그리기
        this.svg.append('path')
            .datum(southGeo)
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', '#e74c3c')
            .attr('data-region', 'south')
            .on('click', (event) => this.handleSubRegionClick('south', event));

        // 라벨
        this.svg.append('text')
            .attr('class', 'region-label')
            .attr('transform', `translate(${this.path.centroid(northGeo)})`)
            .text(`${this.getShortProvinceName(provinceName)} 북부`);

        this.svg.append('text')
            .attr('class', 'region-label')
            .attr('transform', `translate(${this.path.centroid(southGeo)})`)
            .text(`${this.getShortProvinceName(provinceName)} 남부`);
    }

    handleSubRegionClick(region, event) {
        if (this.state !== GameState.SELECT_SUBREGION) return;

        // 뒤로가기 버튼 제거
        const backBtn = this.mapContainer.querySelector('.back-btn');
        if (backBtn) backBtn.remove();

        if (region === this.correctSubRegion) {
            this.selectedSubRegion = region;
            this.state = GameState.SELECT_DISTRICT;
            this.updateStepIndicator();
            setTimeout(() => this.renderDistrictMap(this.selectedProvince, region), 300);
        } else {
            const regionName = region === 'north' ? '북부' : '남부';
            const correctName = this.correctSubRegion === 'north' ? '북부' : '남부';
            this.handleWrongAnswer(event.target, `틀렸습니다! ${correctName}가 정답입니다.`);
        }
    }

    renderDistrictMap(provinceName, subRegion = null) {
        // SVG 초기화
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        const provinceData = this.geoData[provinceName];

        // 시군구별로 그룹화하고 필터링
        let features = provinceData.features;

        if (subRegion) {
            // 북부/남부 필터링
            const allCoords = [];
            provinceData.features.forEach(f => {
                const centroid = d3.geoCentroid(f);
                allCoords.push({ feature: f, lat: centroid[1] });
            });
            const avgLat = d3.mean(allCoords, d => d.lat);

            if (subRegion === 'north') {
                features = allCoords.filter(d => d.lat >= avgLat).map(d => d.feature);
            } else {
                features = allCoords.filter(d => d.lat < avgLat).map(d => d.feature);
            }
        }

        // 시군구별로 병합
        const districtMap = new Map();
        features.forEach(f => {
            const sggnm = f.properties.sggnm;
            if (!districtMap.has(sggnm)) {
                districtMap.set(sggnm, []);
            }
            districtMap.get(sggnm).push(f);
        });

        // 각 시군구의 MultiPolygon 생성
        const districtFeatures = [];
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e67e22', '#16a085', '#8e44ad', '#27ae60', '#d35400', '#c0392b', '#2980b9', '#f1c40f'];
        let colorIndex = 0;

        districtMap.forEach((districtFeatureList, name) => {
            const coords = [];
            districtFeatureList.forEach(f => {
                if (f.geometry.type === 'Polygon') {
                    coords.push(f.geometry.coordinates);
                } else if (f.geometry.type === 'MultiPolygon') {
                    coords.push(...f.geometry.coordinates);
                }
            });

            districtFeatures.push({
                type: 'Feature',
                properties: { name: name },
                geometry: { type: 'MultiPolygon', coordinates: coords },
                color: colors[colorIndex % colors.length]
            });
            colorIndex++;
        });

        // 투영 설정
        const featureCollection = { type: 'FeatureCollection', features: districtFeatures };
        this.projection = d3.geoMercator().fitSize([width - 40, height - 40], featureCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 뒤로가기 버튼
        let existingBtn = this.mapContainer.querySelector('.back-btn');
        if (existingBtn) existingBtn.remove();

        const backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.textContent = '← 뒤로';
        backBtn.onclick = () => {
            backBtn.remove();
            if (LARGE_PROVINCES.includes(provinceName) && subRegion) {
                this.state = GameState.SELECT_SUBREGION;
                this.selectedSubRegion = null;
                this.updateStepIndicator();
                this.renderSubRegionSelection(provinceName);
            } else {
                this.state = GameState.SELECT_PROVINCE;
                this.selectedProvince = null;
                this.updateStepIndicator();
                this.renderProvinceMap();
            }
        };
        this.mapContainer.insertBefore(backBtn, this.mapSvg);

        // 시군구 그리기
        this.svg.selectAll('.district')
            .data(districtFeatures)
            .enter()
            .append('path')
            .attr('class', 'district')
            .attr('d', this.path)
            .attr('fill', d => d.color)
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleDistrictClick(d.properties.name, event));

        // 시군구 라벨
        this.svg.selectAll('.district-label')
            .data(districtFeatures)
            .enter()
            .append('text')
            .attr('class', 'district-label')
            .attr('transform', d => `translate(${this.path.centroid(d)})`)
            .text(d => d.properties.name);
    }

    handleDistrictClick(districtName, event) {
        if (this.state !== GameState.SELECT_DISTRICT) return;

        clearInterval(this.timer);

        // 뒤로가기 버튼 제거
        const backBtn = this.mapContainer.querySelector('.back-btn');
        if (backBtn) backBtn.remove();

        const correctDistrict = this.currentAnswer.name;

        if (districtName === correctDistrict) {
            // 정답!
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
            // 오답
            d3.select(event.target).classed('incorrect', true);

            this.feedbackEl.textContent = `틀렸습니다! 정답: ${correctDistrict}`;
            this.feedbackEl.className = 'feedback incorrect';

            this.results.push({
                question: this.currentAnswer.name,
                correct: false,
                answer: districtName
            });

            // 정답 위치 하이라이트
            d3.selectAll('.district')
                .filter(d => d.properties.name === correctDistrict)
                .classed('highlight', true);
        }

        this.state = GameState.SHOWING_RESULT;
        setTimeout(() => this.nextQuestion(), 2000);
    }

    handleWrongAnswer(element, message) {
        clearInterval(this.timer);

        // 뒤로가기 버튼 제거
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
