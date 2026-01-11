// 수도권 지하철 퀴즈 - 드릴다운 방식

const GameState = {
    IDLE: 'idle',
    SELECT_PROVINCE: 'select_province',
    SELECT_SUBREGION: 'select_subregion',
    SELECT_DISTRICT: 'select_district',
    SELECT_STATION: 'select_station',
    SHOWING_RESULT: 'showing_result'
};

const GameMode = {
    EXPLORE: 'explore',
    PRACTICE: 'practice',
    QUIZ: 'quiz',
    TEST: 'test'
};

// 시도별 색상
const PROVINCE_COLORS = { '서울특별시': '#F8A5A5', '경기도': '#7DCEA0', '인천광역시': '#7FB3D5' };
const PROVINCE_COLORS_DARK = { '서울특별시': '#FF6B6B', '경기도': '#27AE60', '인천광역시': '#3498DB' };
const SHORT_NAMES = { '서울특별시': '서울', '경기도': '경기', '인천광역시': '인천' };

// 경기도 북부/남부 구분
const GYEONGGI_NORTH = ['연천군', '포천시', '가평군', '동두천시', '양주시', '파주시', '의정부시', '남양주시', '고양시', '고양시덕양구', '고양시일산동구', '고양시일산서구', '구리시', '김포시'];
const GYEONGGI_SOUTH = ['하남시', '양평군', '부천시', '광명시', '시흥시', '안양시', '안양시동안구', '안양시만안구', '과천시', '의왕시', '성남시', '성남시분당구', '성남시수정구', '성남시중원구', '광주시', '여주시', '군포시', '안산시', '안산시단원구', '안산시상록구', '수원시', '수원시권선구', '수원시영통구', '수원시장안구', '수원시팔달구', '용인시', '용인시기흥구', '용인시수지구', '용인시처인구', '이천시', '화성시', '오산시', '평택시', '안성시'];

function getBaseCityName(name) { const m = name.match(/^(.+시).+구$/); return m ? m[1] : name; }
function getGuName(name) { const m = name.match(/^.+시(.+구)$/); return m ? m[1] : null; }
function hasSiGu(name) { return /^.+시.+구$/.test(name); }
function getProvinceColors() { return document.documentElement.getAttribute('data-theme') === 'dark' ? PROVINCE_COLORS_DARK : PROVINCE_COLORS; }
function getSubRegionColors() { return document.documentElement.getAttribute('data-theme') === 'dark' ? { north: '#3498db', south: '#e74c3c' } : { north: '#64B5F6', south: '#F48FB1' }; }

class SubwayQuiz {
    constructor() {
        this.stations = SUBWAY_STATIONS || [];
        this.lines = SUBWAY_LINES || {};
        this.lineColors = LINE_COLORS || {};
        this.provincesGeo = null;
        this.municipalitiesGeo = null;
        this.metroMunicipalities = [];
        this.projection = null;
        this.path = null;
        this.svg = null;
        this.mapGroup = null;
        this.width = 0;
        this.height = 0;
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
        this.mode = null;
        this.selectedLines = ['all'];
        this.selectedProvince = null;
        this.selectedSubRegion = null;
        this.selectedCity = null;  // 시 (성남시, 수원시 등)
        this.selectedDistrict = null;  // 구 (분당구, 영통구 등) 또는 시군구 전체
        this.currentQuizStation = null;  // 현재 퀴즈에서 찾아야 할 역
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
            const provincesTopo = await d3.json('../data/provinces.json');
            this.provincesGeo = topojson.feature(provincesTopo, provincesTopo.objects[Object.keys(provincesTopo.objects)[0]]);
            const municipalitiesTopo = await d3.json('../data/municipalities.json');
            this.municipalitiesGeo = topojson.feature(municipalitiesTopo, municipalitiesTopo.objects[Object.keys(municipalitiesTopo.objects)[0]]);
            this.metroMunicipalities = this.municipalitiesGeo.features.filter(f => f.properties.code && ['11', '31', '23'].some(pc => f.properties.code.startsWith(pc)));
            this.mapStationsToDistricts();
            console.log('지도 데이터 로드 완료:', this.metroMunicipalities.length, '개 수도권 시군구');
        } catch (error) {
            console.error('지도 데이터 로드 실패:', error);
        }
        console.log('지하철 데이터 준비 완료:', this.stations.length, '개 역');
    }

    mapStationsToDistricts() {
        this.stations.forEach(station => {
            if (!station.lat || !station.lng) return;
            const point = [station.lng, station.lat];
            for (const district of this.metroMunicipalities) {
                if (d3.geoContains(district, point)) {
                    station.districtCode = district.properties.code;
                    station.districtName = district.properties.name;
                    station.provinceName = this.getProvinceFromCode(district.properties.code);
                    break;
                }
            }
            if (!station.districtName) { station.districtName = '미분류'; station.provinceName = '미분류'; }
        });
        console.log('역-시군구 매핑 완료:', this.stations.filter(s => s.districtName !== '미분류').length, '/', this.stations.length);
    }

    getProvinceFromCode(code) {
        if (!code) return '미분류';
        if (code.startsWith('11')) return '서울특별시';
        if (code.startsWith('31')) return '경기도';
        if (code.startsWith('23')) return '인천광역시';
        return '미분류';
    }

    isDarkMode() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

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
        let filtered = this.stations.filter(s => s.lat && s.lng && s.districtName !== '미분류');
        if (!this.selectedLines.includes('all')) filtered = filtered.filter(s => this.selectedLines.includes(s.line));
        return filtered;
    }

    buildColorMap(districts) {
        const colors = this.isDarkMode() ? ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'] : ['#F8A5A5', '#7FB3D5', '#7DCEA0', '#F7DC6F', '#C9A0DC', '#76D7C4', '#F5B971', '#AEB6BF'];
        const colorMap = new Map();
        districts.forEach(d => { const name = getBaseCityName(d.properties.name); if (!colorMap.has(name)) colorMap.set(name, colors[colorMap.size % colors.length]); });
        return colorMap;
    }

    addBackButton(onClick) {
        const existingBtn = document.querySelector('.back-btn');
        if (existingBtn) existingBtn.remove();
        const backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.innerHTML = '← 뒤로';
        backBtn.onclick = onClick;
        document.getElementById('map-container').appendChild(backBtn);
    }

    startGame() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('game-screen').classList.add('active');

        this.score = 0;
        this.currentQuestion = 0;
        this.results = [];
        this.selectedProvince = null;
        this.selectedSubRegion = null;
        this.selectedCity = null;
        this.selectedDistrict = null;
        this.currentQuizStation = null;
        this.updateScore();

        setTimeout(() => {
            this.setupMap();

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

        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        // 드릴다운 모드: 시도 선택 화면부터 시작
        this.renderProvinceMap();
    }

    // ===== 노선도 배경 그리기 (라벨 없이) =====
    // filterStations: 해당 지역에 속한 역들만 표시
    renderSubwayBackground(filterStations = null) {
        const stations = filterStations || this.stations.filter(s => s.lat && s.lng && s.districtName !== '미분류');
        if (!stations || stations.length === 0) return;

        const stationById = {};
        this.stations.forEach(s => { stationById[s.id] = s; });

        // 해당 역들이 속한 노선 목록
        const linesToDraw = new Set();
        stations.forEach(s => linesToDraw.add(s.line));

        // 해당 역들의 ID Set (노선 그릴 때 이 역들만 연결)
        const stationIdSet = new Set(stations.map(s => s.id));

        // 노선 그리기 (해당 지역 내의 역들만 연결)
        const linesGroup = this.mapGroup.append('g').attr('class', 'bg-lines-group');

        linesToDraw.forEach(lineName => {
            const lineData = this.lines[lineName];
            if (!lineData) return;

            const segments = [];
            let currentSegment = [];
            let prevCoords = null;
            const MAX_DISTANCE = 200;

            lineData.stations.forEach(stationId => {
                const s = stationById[stationId];
                // 해당 지역 내의 역만 포함
                if (s && s.lat != null && s.lng != null && stationIdSet.has(s.id)) {
                    const coords = this.projection([s.lng, s.lat]);
                    if (coords && !isNaN(coords[0])) {
                        if (prevCoords) {
                            const dist = Math.sqrt(Math.pow(coords[0] - prevCoords[0], 2) + Math.pow(coords[1] - prevCoords[1], 2));
                            if (dist > MAX_DISTANCE) {
                                if (currentSegment.length > 1) segments.push(currentSegment);
                                currentSegment = [];
                            }
                        }
                        currentSegment.push(coords);
                        prevCoords = coords;
                    } else {
                        if (currentSegment.length > 1) segments.push(currentSegment);
                        currentSegment = [];
                        prevCoords = null;
                    }
                }
            });
            if (currentSegment.length > 1) segments.push(currentSegment);

            const lineGenerator = d3.line().curve(d3.curveLinear);
            segments.forEach(points => {
                linesGroup.append('path')
                    .attr('d', lineGenerator(points))
                    .attr('fill', 'none')
                    .attr('stroke', lineData.color)
                    .attr('stroke-width', 2)
                    .attr('stroke-linecap', 'round')
                    .attr('opacity', 0.5)
                    .attr('pointer-events', 'none');
            });
        });

        // 역 점 그리기 - 해당 지역 역만
        const stationsGroup = this.mapGroup.append('g').attr('class', 'bg-stations-group');

        stationsGroup.selectAll('circle')
            .data(stations)
            .enter()
            .append('circle')
            .attr('cx', d => { const c = this.projection([d.lng, d.lat]); return c ? c[0] : 0; })
            .attr('cy', d => { const c = this.projection([d.lng, d.lat]); return c ? c[1] : 0; })
            .attr('r', 3)
            .attr('fill', d => this.lineColors[d.line] || '#888')
            .attr('opacity', 0.7)
            .attr('pointer-events', 'none');
    }

    // ===== 드릴다운: 시도 선택 =====
    renderProvinceMap() {
        this.state = GameState.SELECT_PROVINCE;
        this.mapGroup.selectAll('*').remove();
        document.querySelector('.back-btn')?.remove();

        // 퀴즈 모드면 역 이름 표시, 아니면 안내 문구
        if (this.currentQuizStation) {
            const lineColor = this.lineColors[this.currentQuizStation.line] || '#888';
            document.getElementById('question-text').textContent = `"${this.currentQuizStation.name}" 역을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="color: ${lineColor}; font-weight: bold;">${this.currentQuizStation.line}</span> | 시/도를 선택`;
        } else {
            document.getElementById('question-text').textContent = '시/도를 선택하세요';
            document.getElementById('step-indicator').textContent = '서울, 경기, 인천 중 선택';
        }

        const metroProvinces = this.provincesGeo.features.filter(f =>
            ['서울특별시', '경기도', '인천광역시'].includes(f.properties.name)
        );

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                { type: 'FeatureCollection', features: metroProvinces });
        this.path = d3.geoPath().projection(this.projection);

        const colors = getProvinceColors();
        const isDark = this.isDarkMode();

        // 시도 배경 (반투명)
        this.mapGroup.selectAll('path.province')
            .data(metroProvinces)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => colors[d.properties.name] || '#ccc')
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#fff' : '#333')
            .attr('stroke-width', 2)
            .attr('pointer-events', 'none');

        // 노선도 배경
        this.renderSubwayBackground();

        // 클릭 영역 (투명)
        this.mapGroup.selectAll('path.province-click')
            .data(metroProvinces)
            .enter()
            .append('path')
            .attr('class', 'province-click')
            .attr('d', this.path)
            .attr('fill', 'transparent')
            .attr('stroke', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this.parentNode).selectAll('path.province')
                    .filter(p => p.properties.name === d.properties.name)
                    .attr('fill-opacity', 0.6);
            })
            .on('mouseout', function(event, d) {
                d3.select(this.parentNode).selectAll('path.province')
                    .filter(p => p.properties.name === d.properties.name)
                    .attr('fill-opacity', 0.3);
            })
            .on('click', (event, d) => this.handleProvinceClick(d.properties.name));

        // 시도 라벨
        metroProvinces.forEach(f => {
            const centroid = this.path.centroid(f);
            const name = SHORT_NAMES[f.properties.name] || f.properties.name;
            const stationCount = this.stations.filter(s => s.provinceName === f.properties.name && s.districtName !== '미분류').length;
            this.mapGroup.append('text')
                .attr('x', centroid[0])
                .attr('y', centroid[1])
                .attr('text-anchor', 'middle')
                .attr('font-size', '18px')
                .attr('font-weight', 'bold')
                .attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 3)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(name);
            this.mapGroup.append('text')
                .attr('x', centroid[0])
                .attr('y', centroid[1] + 20)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('fill', isDark ? '#aaa' : '#666')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 2)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(`${stationCount}개 역`);
        });
    }

    handleProvinceClick(provinceName) {
        this.selectedProvince = provinceName;
        if (provinceName === '경기도') {
            this.renderSubRegionMap();
        } else {
            this.renderDistrictMap();
        }
    }

    // ===== 드릴다운: 경기도 북부/남부 선택 =====
    renderSubRegionMap() {
        this.state = GameState.SELECT_SUBREGION;
        this.mapGroup.selectAll('*').remove();

        if (this.currentQuizStation) {
            const lineColor = this.lineColors[this.currentQuizStation.line] || '#888';
            document.getElementById('question-text').textContent = `"${this.currentQuizStation.name}" 역을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="color: ${lineColor}; font-weight: bold;">${this.currentQuizStation.line}</span> | 경기 북부/남부 선택`;
        } else {
            document.getElementById('question-text').textContent = '경기도 지역을 선택하세요';
            document.getElementById('step-indicator').textContent = '북부 또는 남부 선택';
        }

        this.addBackButton(() => this.renderProvinceMap());

        const gyeonggiDistricts = this.metroMunicipalities.filter(f => f.properties.code?.startsWith('31'));
        const northDistricts = gyeonggiDistricts.filter(f => GYEONGGI_NORTH.includes(f.properties.name));
        const southDistricts = gyeonggiDistricts.filter(f => GYEONGGI_SOUTH.includes(f.properties.name));

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                { type: 'FeatureCollection', features: gyeonggiDistricts });
        this.path = d3.geoPath().projection(this.projection);

        const subColors = getSubRegionColors();
        const isDark = this.isDarkMode();

        // 북부 배경 (반투명)
        this.mapGroup.selectAll('path.north')
            .data(northDistricts)
            .enter()
            .append('path')
            .attr('class', 'north subregion')
            .attr('d', this.path)
            .attr('fill', subColors.north)
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#fff' : '#333')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none');

        // 남부 배경 (반투명)
        this.mapGroup.selectAll('path.south')
            .data(southDistricts)
            .enter()
            .append('path')
            .attr('class', 'south subregion')
            .attr('d', this.path)
            .attr('fill', subColors.south)
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#fff' : '#333')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none');

        // 노선도 배경 (경기도 역만)
        const gyeonggiStations = this.stations.filter(s => s.provinceName === '경기도' && s.lat && s.lng && s.districtName !== '미분류');
        this.renderSubwayBackground(gyeonggiStations);

        // 북부 클릭 영역
        this.mapGroup.selectAll('path.north-click')
            .data(northDistricts)
            .enter()
            .append('path')
            .attr('class', 'north-click')
            .attr('d', this.path)
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', () => {
                this.mapGroup.selectAll('path.north').attr('fill-opacity', 0.6);
            })
            .on('mouseout', () => {
                this.mapGroup.selectAll('path.north').attr('fill-opacity', 0.3);
            })
            .on('click', () => this.handleSubRegionClick('north'));

        // 남부 클릭 영역
        this.mapGroup.selectAll('path.south-click')
            .data(southDistricts)
            .enter()
            .append('path')
            .attr('class', 'south-click')
            .attr('d', this.path)
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', () => {
                this.mapGroup.selectAll('path.south').attr('fill-opacity', 0.6);
            })
            .on('mouseout', () => {
                this.mapGroup.selectAll('path.south').attr('fill-opacity', 0.3);
            })
            .on('click', () => this.handleSubRegionClick('south'));

        // 라벨
        const northCount = this.stations.filter(s => GYEONGGI_NORTH.includes(s.districtName) && s.districtName !== '미분류').length;
        const southCount = this.stations.filter(s => GYEONGGI_SOUTH.includes(s.districtName) && s.districtName !== '미분류').length;

        if (northDistricts.length > 0) {
            const northCentroid = d3.geoCentroid({ type: 'FeatureCollection', features: northDistricts });
            const nc = this.projection(northCentroid);
            this.mapGroup.append('text').attr('x', nc[0]).attr('y', nc[1]).attr('text-anchor', 'middle')
                .attr('font-size', '16px').attr('font-weight', 'bold').attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff').attr('stroke-width', 3).attr('paint-order', 'stroke')
                .attr('pointer-events', 'none').text('북부');
            this.mapGroup.append('text').attr('x', nc[0]).attr('y', nc[1] + 18).attr('text-anchor', 'middle')
                .attr('font-size', '11px').attr('fill', isDark ? '#aaa' : '#666')
                .attr('stroke', isDark ? '#000' : '#fff').attr('stroke-width', 2).attr('paint-order', 'stroke')
                .attr('pointer-events', 'none').text(`${northCount}개 역`);
        }
        if (southDistricts.length > 0) {
            const southCentroid = d3.geoCentroid({ type: 'FeatureCollection', features: southDistricts });
            const sc = this.projection(southCentroid);
            this.mapGroup.append('text').attr('x', sc[0]).attr('y', sc[1]).attr('text-anchor', 'middle')
                .attr('font-size', '16px').attr('font-weight', 'bold').attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff').attr('stroke-width', 3).attr('paint-order', 'stroke')
                .attr('pointer-events', 'none').text('남부');
            this.mapGroup.append('text').attr('x', sc[0]).attr('y', sc[1] + 18).attr('text-anchor', 'middle')
                .attr('font-size', '11px').attr('fill', isDark ? '#aaa' : '#666')
                .attr('stroke', isDark ? '#000' : '#fff').attr('stroke-width', 2).attr('paint-order', 'stroke')
                .attr('pointer-events', 'none').text(`${southCount}개 역`);
        }
    }

    handleSubRegionClick(subRegion) {
        this.selectedSubRegion = subRegion;
        this.renderCityMap();  // 경기도는 시 → 구 단계로
    }

    // ===== 드릴다운: 시/군 선택 (경기도용 - 시를 먼저 선택) =====
    renderCityMap() {
        this.state = GameState.SELECT_DISTRICT;
        this.mapGroup.selectAll('*').remove();

        const subRegion = this.selectedSubRegion;
        const targetList = subRegion === 'north' ? GYEONGGI_NORTH : GYEONGGI_SOUTH;

        // 모든 시군구 가져오기
        const allDistricts = this.metroMunicipalities.filter(f =>
            f.properties.code?.startsWith('31') && targetList.includes(f.properties.name)
        );

        // "시" 단위로 그룹화 (성남시분당구 → 성남시)
        const cityMap = new Map();
        allDistricts.forEach(d => {
            const baseName = getBaseCityName(d.properties.name);
            if (!cityMap.has(baseName)) {
                cityMap.set(baseName, []);
            }
            cityMap.get(baseName).push(d);
        });

        if (this.currentQuizStation) {
            const lineColor = this.lineColors[this.currentQuizStation.line] || '#888';
            document.getElementById('question-text').textContent = `"${this.currentQuizStation.name}" 역을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="color: ${lineColor}; font-weight: bold;">${this.currentQuizStation.line}</span> | 경기 ${subRegion === 'north' ? '북부' : '남부'} 시/군 선택`;
        } else {
            document.getElementById('question-text').textContent = `경기 ${subRegion === 'north' ? '북부' : '남부'} 시/군을 선택하세요`;
            document.getElementById('step-indicator').textContent = `${cityMap.size}개 지역`;
        }
        this.addBackButton(() => this.renderSubRegionMap());

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                { type: 'FeatureCollection', features: allDistricts });
        this.path = d3.geoPath().projection(this.projection);

        const colorMap = this.buildColorMap(allDistricts);
        const isDark = this.isDarkMode();

        // 시군구 배경 (반투명) - 같은 시는 같은 색
        this.mapGroup.selectAll('path.district')
            .data(allDistricts)
            .enter()
            .append('path')
            .attr('class', d => `district city-${getBaseCityName(d.properties.name).replace(/\s/g, '')}`)
            .attr('d', this.path)
            .attr('fill', d => colorMap.get(getBaseCityName(d.properties.name)) || '#ccc')
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#fff' : '#333')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none');

        // 노선도 배경 - districtCode로 필터링
        const districtCodes = allDistricts.map(d => d.properties.code);
        const provinceStations = this.stations.filter(s =>
            districtCodes.includes(s.districtCode) && s.lat && s.lng && s.districtName !== '미분류'
        );
        console.log(`renderCityMap: ${subRegion} - ${districtCodes.length}개 구, ${provinceStations.length}개 역`);
        this.renderSubwayBackground(provinceStations);

        // 클릭 영역 - 같은 "시"는 모두 같은 클릭으로 처리
        this.mapGroup.selectAll('path.district-click')
            .data(allDistricts)
            .enter()
            .append('path')
            .attr('class', 'district-click')
            .attr('d', this.path)
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                const baseName = getBaseCityName(d.properties.name);
                this.mapGroup.selectAll('path.district')
                    .filter(p => getBaseCityName(p.properties.name) === baseName)
                    .attr('fill-opacity', 0.6);
            })
            .on('mouseout', (event, d) => {
                const baseName = getBaseCityName(d.properties.name);
                this.mapGroup.selectAll('path.district')
                    .filter(p => getBaseCityName(p.properties.name) === baseName)
                    .attr('fill-opacity', 0.3);
            })
            .on('click', (event, d) => this.handleCityClick(getBaseCityName(d.properties.name)));

        // 시/군 라벨 (시 단위로만 표시)
        cityMap.forEach((districts, cityName) => {
            // 해당 시의 모든 구역을 합쳐서 중심점 계산
            const allCoords = districts.flatMap(d => {
                const centroid = this.path.centroid(d);
                return isNaN(centroid[0]) ? [] : [centroid];
            });
            if (allCoords.length === 0) return;

            const cx = allCoords.reduce((sum, c) => sum + c[0], 0) / allCoords.length;
            const cy = allCoords.reduce((sum, c) => sum + c[1], 0) / allCoords.length;

            const displayName = cityName.replace(/시$/, '').replace(/군$/, '');
            const stationCount = this.stations.filter(s =>
                getBaseCityName(s.districtName) === cityName && s.districtName !== '미분류'
            ).length;

            this.mapGroup.append('text')
                .attr('x', cx).attr('y', cy)
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px')
                .attr('font-weight', 'bold')
                .attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 2)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(displayName);
            if (stationCount > 0) {
                this.mapGroup.append('text')
                    .attr('x', cx).attr('y', cy + 12)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '9px')
                    .attr('fill', isDark ? '#aaa' : '#666')
                    .attr('stroke', isDark ? '#000' : '#fff')
                    .attr('stroke-width', 2)
                    .attr('paint-order', 'stroke')
                    .attr('pointer-events', 'none')
                    .text(`${stationCount}역`);
            }
        });
    }

    handleCityClick(cityName) {
        this.selectedCity = cityName;

        // 해당 시에 구가 여러개 있는지 확인
        const targetList = this.selectedSubRegion === 'north' ? GYEONGGI_NORTH : GYEONGGI_SOUTH;
        const guDistricts = this.metroMunicipalities.filter(f =>
            f.properties.code?.startsWith('31') &&
            targetList.includes(f.properties.name) &&
            getBaseCityName(f.properties.name) === cityName &&
            hasSiGu(f.properties.name)
        );

        if (guDistricts.length > 1) {
            // 구가 여러개면 구 선택 화면으로
            this.renderGuMap();
        } else {
            // 구가 없거나 하나면 바로 역 화면으로
            const district = this.metroMunicipalities.find(f =>
                f.properties.code?.startsWith('31') &&
                targetList.includes(f.properties.name) &&
                getBaseCityName(f.properties.name) === cityName
            );
            if (district) {
                this.selectedDistrict = { name: district.properties.name, code: district.properties.code };
                this.renderStationMap();
            }
        }
    }

    // ===== 드릴다운: 구 선택 (성남시 → 분당구/수정구/중원구) =====
    renderGuMap() {
        this.state = GameState.SELECT_DISTRICT;
        this.mapGroup.selectAll('*').remove();

        const cityName = this.selectedCity;
        const targetList = this.selectedSubRegion === 'north' ? GYEONGGI_NORTH : GYEONGGI_SOUTH;

        const guDistricts = this.metroMunicipalities.filter(f =>
            f.properties.code?.startsWith('31') &&
            targetList.includes(f.properties.name) &&
            getBaseCityName(f.properties.name) === cityName
        );

        if (this.currentQuizStation) {
            const lineColor = this.lineColors[this.currentQuizStation.line] || '#888';
            document.getElementById('question-text').textContent = `"${this.currentQuizStation.name}" 역을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="color: ${lineColor}; font-weight: bold;">${this.currentQuizStation.line}</span> | ${cityName} 구 선택`;
        } else {
            document.getElementById('question-text').textContent = `${cityName} 구를 선택하세요`;
            document.getElementById('step-indicator').textContent = `${guDistricts.length}개 구`;
        }
        this.addBackButton(() => this.renderCityMap());

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                { type: 'FeatureCollection', features: guDistricts });
        this.path = d3.geoPath().projection(this.projection);

        const colorMap = this.buildColorMap(guDistricts);
        const isDark = this.isDarkMode();

        // 구 배경 (반투명)
        this.mapGroup.selectAll('path.district')
            .data(guDistricts)
            .enter()
            .append('path')
            .attr('class', 'district')
            .attr('d', this.path)
            .attr('fill', d => colorMap.get(d.properties.name) || '#ccc')
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#fff' : '#333')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none');

        // 노선도 배경 - 해당 시에 속한 모든 구의 역 (districtCode로 필터링)
        const guCodes = guDistricts.map(d => d.properties.code);
        const cityStations = this.stations.filter(s =>
            guCodes.includes(s.districtCode) && s.lat && s.lng && s.districtName !== '미분류'
        );
        console.log(`renderGuMap: ${cityName} - ${guCodes.length}개 구, ${cityStations.length}개 역`);
        this.renderSubwayBackground(cityStations);

        // 클릭 영역
        this.mapGroup.selectAll('path.district-click')
            .data(guDistricts)
            .enter()
            .append('path')
            .attr('class', 'district-click')
            .attr('d', this.path)
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this.parentNode).selectAll('path.district')
                    .filter(p => p.properties.code === d.properties.code)
                    .attr('fill-opacity', 0.6);
            })
            .on('mouseout', function(event, d) {
                d3.select(this.parentNode).selectAll('path.district')
                    .filter(p => p.properties.code === d.properties.code)
                    .attr('fill-opacity', 0.3);
            })
            .on('click', (event, d) => this.handleDistrictClick(d.properties.name, d.properties.code));

        // 구 라벨
        guDistricts.forEach(d => {
            const centroid = this.path.centroid(d);
            if (isNaN(centroid[0])) return;
            const guName = getGuName(d.properties.name) || d.properties.name;
            const displayName = guName.replace(/구$/, '');
            const stationCount = this.stations.filter(s => s.districtCode === d.properties.code && s.districtName !== '미분류').length;

            this.mapGroup.append('text')
                .attr('x', centroid[0]).attr('y', centroid[1])
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 2)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(displayName);
            if (stationCount > 0) {
                this.mapGroup.append('text')
                    .attr('x', centroid[0]).attr('y', centroid[1] + 14)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '10px')
                    .attr('fill', isDark ? '#aaa' : '#666')
                    .attr('stroke', isDark ? '#000' : '#fff')
                    .attr('stroke-width', 2)
                    .attr('paint-order', 'stroke')
                    .attr('pointer-events', 'none')
                    .text(`${stationCount}역`);
            }
        });
    }

    // ===== 드릴다운: 시군구 선택 (서울/인천용) =====
    renderDistrictMap() {
        this.state = GameState.SELECT_DISTRICT;
        this.mapGroup.selectAll('*').remove();

        const provinceName = this.selectedProvince;

        let districts;
        let backFn;
        let provinceStations;
        let regionLabel;

        if (provinceName === '서울특별시') {
            districts = this.metroMunicipalities.filter(f => f.properties.code?.startsWith('11'));
            backFn = () => this.renderProvinceMap();
            regionLabel = '서울시 구';
            provinceStations = this.stations.filter(s => s.provinceName === '서울특별시' && s.lat && s.lng && s.districtName !== '미분류');
        } else if (provinceName === '인천광역시') {
            districts = this.metroMunicipalities.filter(f => f.properties.code?.startsWith('23'));
            backFn = () => this.renderProvinceMap();
            regionLabel = '인천시 구/군';
            provinceStations = this.stations.filter(s => s.provinceName === '인천광역시' && s.lat && s.lng && s.districtName !== '미분류');
        } else {
            return;
        }

        if (this.currentQuizStation) {
            const lineColor = this.lineColors[this.currentQuizStation.line] || '#888';
            document.getElementById('question-text').textContent = `"${this.currentQuizStation.name}" 역을 찾으세요`;
            document.getElementById('step-indicator').innerHTML =
                `<span style="color: ${lineColor}; font-weight: bold;">${this.currentQuizStation.line}</span> | ${regionLabel} 선택`;
        } else {
            document.getElementById('question-text').textContent = `${regionLabel}를 선택하세요`;
            document.getElementById('step-indicator').textContent = `${districts?.length || 0}개 지역`;
        }
        this.addBackButton(backFn);

        if (!districts || districts.length === 0) {
            console.error('No districts found');
            return;
        }

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]],
                { type: 'FeatureCollection', features: districts });
        this.path = d3.geoPath().projection(this.projection);

        const colorMap = this.buildColorMap(districts);
        const isDark = this.isDarkMode();

        // 시군구 배경 (반투명)
        this.mapGroup.selectAll('path.district')
            .data(districts)
            .enter()
            .append('path')
            .attr('class', 'district')
            .attr('d', this.path)
            .attr('fill', d => colorMap.get(d.properties.name) || '#ccc')
            .attr('fill-opacity', 0.3)
            .attr('stroke', isDark ? '#fff' : '#333')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none');

        // 노선도 배경
        this.renderSubwayBackground(provinceStations);

        // 클릭 영역 (투명)
        this.mapGroup.selectAll('path.district-click')
            .data(districts)
            .enter()
            .append('path')
            .attr('class', 'district-click')
            .attr('d', this.path)
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this.parentNode).selectAll('path.district')
                    .filter(p => p.properties.code === d.properties.code)
                    .attr('fill-opacity', 0.6);
            })
            .on('mouseout', function(event, d) {
                d3.select(this.parentNode).selectAll('path.district')
                    .filter(p => p.properties.code === d.properties.code)
                    .attr('fill-opacity', 0.3);
            })
            .on('click', (event, d) => this.handleDistrictClick(d.properties.name, d.properties.code));

        // 시군구 라벨
        districts.forEach(d => {
            const centroid = this.path.centroid(d);
            if (isNaN(centroid[0])) return;
            const name = d.properties.name.replace(/구$/, '').replace(/군$/, '');
            const stationCount = this.stations.filter(s => s.districtCode === d.properties.code && s.districtName !== '미분류').length;
            this.mapGroup.append('text')
                .attr('x', centroid[0])
                .attr('y', centroid[1])
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px')
                .attr('font-weight', 'bold')
                .attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 2)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(name);
            if (stationCount > 0) {
                this.mapGroup.append('text')
                    .attr('x', centroid[0])
                    .attr('y', centroid[1] + 12)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '9px')
                    .attr('fill', isDark ? '#aaa' : '#666')
                    .attr('stroke', isDark ? '#000' : '#fff')
                    .attr('stroke-width', 2)
                    .attr('paint-order', 'stroke')
                    .attr('pointer-events', 'none')
                    .text(`${stationCount}역`);
            }
        });
    }

    handleDistrictClick(districtName, districtCode) {
        this.selectedDistrict = { name: districtName, code: districtCode };
        this.renderStationMap();
    }

    // ===== 드릴다운: 역 표시 =====
    renderStationMap() {
        this.state = GameState.SELECT_STATION;
        this.mapGroup.selectAll('*').remove();

        const { name: districtName, code: districtCode } = this.selectedDistrict;

        // 해당 districtCode로 역 필터링 (시도 혼동 방지)
        const districtStations = this.stations.filter(s =>
            s.districtCode === districtCode && s.districtName !== '미분류'
        );

        // 퀴즈 모드면 찾아야 할 역 이름 표시, 아니면 지역 정보 표시
        if (this.currentQuizStation) {
            document.getElementById('question-text').textContent = `"${this.currentQuizStation.name}" 역을 찾으세요`;
            document.getElementById('step-indicator').textContent = `${this.currentQuizStation.line} | ${districtStations.length}개 역 중 하나`;
        } else {
            document.getElementById('question-text').textContent = `${districtName} (${districtStations.length}개 역)`;
            document.getElementById('step-indicator').textContent = '마우스 휠로 확대/축소, 드래그로 이동';
        }

        // 뒤로가기: 경기도면 구/시 선택으로, 아니면 구 선택으로
        this.addBackButton(() => {
            this.svg.on('.zoom', null);
            if (this.selectedProvince === '경기도') {
                if (this.selectedCity && hasSiGu(districtName)) {
                    this.renderGuMap();
                } else {
                    this.renderCityMap();
                }
            } else {
                this.renderDistrictMap();
            }
        });

        // 해당 구/군의 지도
        const districtFeature = this.metroMunicipalities.find(f => f.properties.code === districtCode);
        if (!districtFeature) {
            console.error('District not found:', districtCode);
            return;
        }

        const padding = 40;
        this.projection = d3.geoMercator()
            .fitExtent([[padding, padding], [this.width - padding, this.height - padding]], districtFeature);
        this.path = d3.geoPath().projection(this.projection);

        // 줌 설정
        const zoom = d3.zoom()
            .scaleExtent([0.5, 10])
            .on('zoom', (event) => {
                this.mapGroup.attr('transform', event.transform);
            });
        this.svg.call(zoom);

        const isDark = this.isDarkMode();

        // 배경 지도
        this.mapGroup.append('path')
            .datum(districtFeature)
            .attr('d', this.path)
            .attr('fill', isDark ? '#2a2a3e' : '#e8eef5')
            .attr('stroke', isDark ? '#fff' : '#333')
            .attr('stroke-width', 2);

        // 노선 그리기
        const stationById = {};
        this.stations.forEach(s => { stationById[s.id] = s; });

        const linesGroup = this.mapGroup.append('g').attr('class', 'lines-group');
        const drawnLines = new Set();

        districtStations.forEach(station => {
            if (drawnLines.has(station.line)) return;
            drawnLines.add(station.line);

            const lineData = this.lines[station.line];
            if (!lineData) return;

            const segments = [];
            let currentSegment = [];
            let prevCoords = null;
            const MAX_DISTANCE = 80;

            lineData.stations.forEach(stationId => {
                const s = stationById[stationId];
                if (s && s.lat != null && s.lng != null) {
                    const coords = this.projection([s.lng, s.lat]);
                    if (coords && !isNaN(coords[0])) {
                        if (prevCoords) {
                            const dist = Math.sqrt(Math.pow(coords[0] - prevCoords[0], 2) + Math.pow(coords[1] - prevCoords[1], 2));
                            if (dist > MAX_DISTANCE) {
                                if (currentSegment.length > 1) segments.push(currentSegment);
                                currentSegment = [];
                            }
                        }
                        currentSegment.push(coords);
                        prevCoords = coords;
                    } else {
                        if (currentSegment.length > 1) segments.push(currentSegment);
                        currentSegment = [];
                        prevCoords = null;
                    }
                } else {
                    if (currentSegment.length > 1) segments.push(currentSegment);
                    currentSegment = [];
                    prevCoords = null;
                }
            });
            if (currentSegment.length > 1) segments.push(currentSegment);

            const lineGenerator = d3.line().curve(d3.curveLinear);
            segments.forEach(points => {
                linesGroup.append('path')
                    .attr('d', lineGenerator(points))
                    .attr('fill', 'none')
                    .attr('stroke', lineData.color)
                    .attr('stroke-width', 3)
                    .attr('stroke-linecap', 'round')
                    .attr('opacity', 0.8);
            });
        });

        // 역 점
        const stationsGroup = this.mapGroup.append('g').attr('class', 'stations-group');

        stationsGroup.selectAll('circle')
            .data(districtStations)
            .enter()
            .append('circle')
            .attr('cx', d => { const c = this.projection([d.lng, d.lat]); return c ? c[0] : 0; })
            .attr('cy', d => { const c = this.projection([d.lng, d.lat]); return c ? c[1] : 0; })
            .attr('r', 6)
            .attr('fill', d => this.lineColors[d.line] || '#888')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('cursor', 'pointer')
            .attr('class', 'station-dot')
            .attr('data-id', d => d.id)
            .on('mouseover', (event, d) => {
                this.showTooltip(event, d);
                d3.select(event.target).attr('r', 9).attr('stroke-width', 3);
            })
            .on('mouseout', (event) => {
                this.hideTooltip();
                d3.select(event.target).attr('r', 6).attr('stroke-width', 2);
            })
            .on('click', (event, d) => {
                if (this.mode !== GameMode.EXPLORE) {
                    this.checkAnswer(d);
                }
            });

        // 역 라벨 (탐색 모드에서만 표시, 퀴즈/연습 모드에서는 숨김)
        if (this.mode === GameMode.EXPLORE) {
            const labelsGroup = this.mapGroup.append('g').attr('class', 'labels-group');

            labelsGroup.selectAll('text')
                .data(districtStations)
                .enter()
                .append('text')
                .attr('x', d => { const c = this.projection([d.lng, d.lat]); return c ? c[0] : 0; })
                .attr('y', d => { const c = this.projection([d.lng, d.lat]); return c ? c[1] - 12 : 0; })
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px')
                .attr('font-weight', 'bold')
                .attr('fill', isDark ? '#fff' : '#333')
                .attr('stroke', isDark ? '#000' : '#fff')
                .attr('stroke-width', 2)
                .attr('paint-order', 'stroke')
                .attr('pointer-events', 'none')
                .text(d => d.name);
        }
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
                // 전체 노선일 때 마우스 오버 시 해당 역 이름 표시
                if (this.selectedLines.includes('all')) {
                    this.mapGroup.selectAll('.station-label')
                        .filter(label => label.id === d.id)
                        .attr('opacity', 1);
                }
                // 동그라미 확대 (기존 8 → 6으로 축소)
                const currentR = parseFloat(d3.select(event.target).attr('r')) || 4;
                d3.select(event.target)
                    .attr('r', Math.min(currentR * 1.5, 6))
                    .attr('stroke-width', 2);
            })
            .on('mouseout', (event, d) => {
                this.hideTooltip();
                // 전체 노선일 때 마우스 아웃 시 해당 역 이름 숨김
                if (this.selectedLines.includes('all') && this.currentZoomScale < 6) {
                    this.mapGroup.selectAll('.station-label')
                        .filter(label => label.id === d.id)
                        .attr('opacity', 0);
                }
                // 동그라미 원래 크기로
                this.updateVisibilityByZoom();
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

        // 전체 노선일 때는 라벨 항상 숨김 (마우스 호버로만 표시)
        const isAllLines = this.selectedLines.includes('all');

        // 줌 레벨별 라벨 표시
        if (isAllLines) {
            // 전체 노선: 아무리 확대해도 라벨 모두 숨김 (마우스 호버로만 표시)
            this.mapGroup.selectAll('.station-label').attr('opacity', 0);
        } else if (scale < 1.5) {
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

        // ============================================================
        // ⚠️⚠️⚠️ 2호선 보호 코드 - 절대 수정 금지! ⚠️⚠️⚠️
        // 2호선은 아래 하드코딩된 값만 사용. 어떤 수정도 금지!
        // ============================================================
        const is2HoSeon = this.selectedLines.includes('2호선');

        if (is2HoSeon) {
            // ★★★ 2호선 전용 - 이 값들은 절대 변경하지 마세요! ★★★
            const radius2 = scale < 2 ? 3 : (scale < 4 ? 4 : 5);
            const strokeWidth2 = scale < 3 ? 0.5 : 1;
            this.mapGroup.selectAll('.station-dot')
                .attr('r', radius2)
                .attr('stroke-width', strokeWidth2);
            // 2호선 글씨 크기: 9px 고정 (원본 그대로)
            this.mapGroup.selectAll('.station-label')
                .attr('font-size', '9px');
        } else {
            // 다른 노선들: 프로젝션 스케일 비율로 크기 조정
            // 2호선 프로젝션 스케일: 240230 (기준값)
            const BASE_PROJECTION_SCALE = 240230;
            let projectionRatio = (this.currentProjectionScale || BASE_PROJECTION_SCALE) / BASE_PROJECTION_SCALE;

            // 전체 노선은 최소 비율로, 다른 노선은 넉넉하게
            if (isAllLines) {
                // 전체 노선: 비율 그대로 적용 (작게)
                projectionRatio = Math.max(0.15, projectionRatio);
            } else {
                // 다른 노선: 비율 최소값 0.5 → 2호선처럼 넉넉하게
                projectionRatio = Math.max(0.5, projectionRatio);
            }

            // 동그라미 크기 (2호선 기준 4px * 비율)
            const baseRadius = 4 * projectionRatio;
            const clampedRadius = Math.max(1.5, Math.min(8, baseRadius / scale));
            this.mapGroup.selectAll('.station-dot')
                .attr('r', clampedRadius)
                .attr('stroke-width', Math.max(0.2, projectionRatio / scale));

            // 글씨 크기 (2호선 기준 9px * 비율)
            const baseFontSize = 9 * projectionRatio;
            const adjustedFontSize = baseFontSize / scale;
            const clampedFontSize = Math.max(3, Math.min(14, adjustedFontSize));
            this.mapGroup.selectAll('.station-label')
                .attr('font-size', `${clampedFontSize}px`);
        }
        // ============================================================
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
        // 드릴다운 모드에서는 renderProvinceMap이 이미 호출됨
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
        this.currentQuizStation = this.currentAnswer;  // 드릴다운에서 사용

        // 드릴다운 상태 초기화
        this.selectedProvince = null;
        this.selectedSubRegion = null;
        this.selectedCity = null;
        this.selectedDistrict = null;

        const lineColor = this.lineColors[this.currentAnswer.line] || '#888';
        document.getElementById('question-text').textContent = `"${this.currentAnswer.name}" 역을 찾으세요`;
        document.getElementById('step-indicator').innerHTML =
            `<span style="color: ${lineColor}; font-weight: bold;">${this.currentAnswer.line}</span> 노선`;
        document.getElementById('question-num').textContent = `${this.currentQuestion + 1}/${this.questions.length}`;

        if (this.mode === GameMode.QUIZ || this.mode === GameMode.TEST) {
            this.startTimer();
        } else {
            document.querySelector('.timer-container').style.display = 'none';
        }

        this.showFeedback('');

        // 드릴다운 시작 (시도 선택부터)
        this.renderProvinceMap();
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

        this.results.push({ station: this.currentAnswer, correct: false, timeout: true });
        this.showFeedback(`시간 초과! 정답: ${this.currentAnswer.name}`, false);

        setTimeout(() => {
            this.currentQuizStation = null;
            this.svg.on('.zoom', null);
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
            this.currentQuizStation = null;  // 퀴즈 상태 초기화
            this.svg.on('.zoom', null);  // 줌 리셋
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
