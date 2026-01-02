// 대한민국 지도 퀴즈 - TopoJSON 버전 (최적화)

// 퀴즈에 사용할 지역 목록 (사용자 정의)
const QUIZ_REGIONS = {
    '서울특별시': ['도봉구', '노원구', '강북구', '은평구', '성북구', '중랑구', '서대문구', '종로구', '동대문구', '강서구', '마포구', '중구', '성동구', '광진구', '강동구', '양천구', '영등포구', '용산구', '동작구', '송파구', '구로구', '금천구', '관악구', '서초구', '강남구'],
    '부산광역시': [],  // 인접 지역으로만 표시
    '대구광역시': [],  // 인접 지역으로만 표시 (달성군 포함)
    '인천광역시': [],  // 인접 지역으로만 표시 (강화군, 옹진군 포함)
    '광주광역시': [],  // 인접 지역으로만 표시
    '대전광역시': [],  // 인접 지역으로만 표시
    '울산광역시': [],  // 인접 지역으로만 표시
    '세종특별자치시': [],  // 인접 지역으로만 표시
    '경기도': ['연천군', '포천시', '가평군', '동두천시', '양주시', '파주시', '의정부시', '남양주시', '고양시', '구리시', '김포시', '하남시', '양평군', '부천시', '광명시', '시흥시', '안양시', '과천시', '의왕시', '성남시', '광주시', '여주시', '군포시', '안산시', '수원시', '용인시', '이천시', '화성시', '오산시', '평택시', '안성시'],
    '강원도': ['고성군', '철원군', '화천군', '양구군', '속초시', '인제군', '양양군', '춘천시', '홍천군', '강릉시', '횡성군', '평창군', '원주시', '정선군', '동해시', '영월군', '태백시', '삼척시'],
    '충청북도': ['제천시', '단양군', '충주시', '음성군', '진천군', '증평군', '괴산군', '청주시', '보은군', '옥천군', '영동군'],
    '충청남도': ['당진시', '아산시', '천안시', '서산시', '예산군', '홍성군', '태안군', '청양군', '공주시', '보령시', '부여군', '논산시', '계룡시', '서천군', '금산군'],
    '전라북도': ['군산시', '익산시', '완주군', '진안군', '무주군', '김제시', '전주시', '부안군', '정읍시', '임실군', '장수군', '고창군', '순창군', '남원시'],
    '전라남도': ['영광군', '장성군', '담양군', '곡성군', '구례군', '함평군', '화순군', '순천시', '광양시', '신안군', '무안군', '나주시', '목포시', '영암군', '장흥군', '보성군', '여수시', '진도군', '해남군', '강진군', '고흥군', '완도군'],
    '경상북도': ['봉화군', '울진군', '영주시', '예천군', '문경시', '안동시', '영양군', '상주시', '의성군', '청송군', '영덕군', '김천시', '구미시', '군위군', '칠곡군', '영천시', '포항시', '성주군', '고령군', '경산시', '경주시', '청도군', '울릉군'],
    '경상남도': ['거창군', '함양군', '합천군', '창녕군', '밀양시', '양산시', '산청군', '의령군', '함안군', '창원시', '김해시', '하동군', '진주시', '사천시', '고성군', '남해군', '통영시', '거제시']
};

// 시도별 색상 (제주도 제외) - 다크 모드용
const PROVINCE_COLORS_DARK = {
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
    '경상남도': '#8B4513'
};

// 시도별 색상 - 라이트 모드용 (중간 톤 파스텔)
const PROVINCE_COLORS_LIGHT = {
    '서울특별시': '#F8A5A5',
    '부산광역시': '#7FCDCD',
    '대구광역시': '#C9A0DC',
    '인천광역시': '#7FB3D5',
    '광주광역시': '#F5B971',
    '대전광역시': '#F7DC6F',
    '울산광역시': '#76D7C4',
    '세종특별자치시': '#85C1E9',
    '경기도': '#7DCEA0',
    '강원도': '#BB8FCE',
    '충청북도': '#E59866',
    '충청남도': '#EC7063',
    '전라북도': '#82E0AA',
    '전라남도': '#58D68D',
    '경상북도': '#D4AC0D',
    '경상남도': '#AF601A'
};

// 테마에 따른 시도 색상 반환
function getProvinceColors() {
    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    return isLightMode ? PROVINCE_COLORS_LIGHT : PROVINCE_COLORS_DARK;
}

// 테마에 따른 북부/남부 색상 반환
function getSubRegionColors() {
    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    return isLightMode
        ? { north: '#64B5F6', south: '#F48FB1' }  // 라이트 모드: 파스텔 블루/핑크
        : { north: '#3498db', south: '#e74c3c' }; // 다크 모드: 진한 파랑/빨강
}

// 시도 약칭 (제주도 제외)
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
    '경상남도': '경남'
};

// 시도코드로 시도명 매핑 (시군구 코드 앞 2자리, 제주도 제외)
// TopoJSON 데이터의 코드 체계에 맞춤
const CODE_TO_PROVINCE = {
    '11': '서울특별시',
    '21': '부산광역시',
    '22': '대구광역시',
    '23': '인천광역시',
    '24': '광주광역시',
    '25': '대전광역시',
    '26': '울산광역시',
    '29': '세종특별자치시',
    '31': '경기도',
    '32': '강원도',
    '33': '충청북도',
    '34': '충청남도',
    '35': '전라북도',
    '36': '전라남도',
    '37': '경상북도',
    '38': '경상남도'
};

// 북부/남부 구분이 필요한 도 지역
const LARGE_PROVINCES = ['경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도'];

// 별도 인셋 박스로 표시할 섬 지역
// 인천 옹진군, 경북 울릉군(울릉도/독도)
const ISLAND_DISTRICTS = ['옹진군', '울릉군'];

// 섬 지역 인셋 설정 (소속 시도, 인셋 위치)
const ISLAND_INSET_CONFIG = {
    '옹진군': { province: '인천광역시', position: 'bottom-left' },
    '울릉군': { province: '경상북도', position: 'top-right' }
};

// 클릭 편의를 위한 지역 그룹 (첫 클릭 시 묶어서 표시)
const REGION_GROUPS = {
    '수도권': ['서울특별시', '경기도', '인천광역시'],
    '충청권': ['충청남도', '대전광역시', '세종특별자치시'],
    '경북권': ['경상북도', '대구광역시'],
    '전남권': ['전라남도', '광주광역시'],
    '경남권': ['경상남도', '부산광역시', '울산광역시']
};

// 그룹에 속한 지역 → 그룹명 역매핑
const PROVINCE_TO_GROUP = {};
Object.entries(REGION_GROUPS).forEach(([groupName, provinces]) => {
    provinces.forEach(province => {
        PROVINCE_TO_GROUP[province] = groupName;
    });
});

// 그룹 약칭
const GROUP_SHORT_NAMES = {
    '수도권': '수도권',
    '충청권': '충청권',
    '경북권': '경북권',
    '전남권': '전남권',
    '경남권': '경남권'
};

// 게임 상태
const GameState = {
    IDLE: 'idle',
    SELECT_REGION_GROUP: 'select_region_group',  // 새로운 상태: 지역 그룹 선택
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

        // 모드 설정
        this.gameMode = this.parseGameMode();
        this.timerEnabled = true;
        this.showLabels = true;
        this.applyModeSettings();

        // 테마 초기화
        this.initTheme();

        this.initElements();
        this.initEventListeners();
        this.loadData();
    }

    parseGameMode() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('mode'); // explore, practice, quiz, test, or null
    }

    applyModeSettings() {
        switch (this.gameMode) {
            case 'explore':
                this.timerEnabled = false;
                this.showLabels = true;
                break;
            case 'practice':
                this.timerEnabled = false;
                this.showLabels = true;
                break;
            case 'quiz':
                this.timerEnabled = true;
                this.showLabels = true;
                break;
            case 'test':
                this.timerEnabled = true;
                this.showLabels = false;
                break;
            default:
                // 모드가 없으면 모드 선택 화면 표시
                break;
        }

        // 타이머 숨김 처리
        if (!this.timerEnabled) {
            document.querySelector('.stats')?.classList.add('timer-hidden');
        }

        // 라벨 숨김 처리 (test 모드)
        if (!this.showLabels) {
            document.getElementById('map-container')?.classList.add('hide-labels');
        }

        // 테마 토글 버튼 표시 여부 (랜딩 페이지와 explore 모드에서만 표시)
        if (this.gameMode && this.gameMode !== 'explore') {
            document.getElementById('theme-toggle')?.classList.add('hidden');
        }
    }

    initTheme() {
        // 저장된 테마가 있으면 사용, 없으면 시스템 설정 따름
        const savedTheme = localStorage.getItem('korea-quiz-theme');

        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // 시스템 다크 모드 설정 확인
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }

        // 시스템 테마 변경 감지 (사용자가 직접 설정하지 않은 경우만)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('korea-quiz-theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        this.setTheme(newTheme);
        localStorage.setItem('korea-quiz-theme', newTheme);

        // 테마 변경 시 지도 다시 렌더링 (explore 모드에서만)
        if (this.gameMode === 'explore' && this.gameScreen.classList.contains('active')) {
            this.rerenderCurrentMap();
        }
    }

    // 현재 상태에 맞게 지도 다시 렌더링
    rerenderCurrentMap() {
        if (this.state === GameState.SELECT_PROVINCE || this.state === GameState.IDLE) {
            if (this.selectedGroup) {
                this.renderExploreGroupProvinceSelection(this.selectedGroup);
            } else {
                this.renderExploreProvinceMap();
            }
        } else if (this.state === GameState.SELECT_SUBREGION) {
            this.renderExploreSubRegion(this.selectedProvince);
        } else if (this.state === GameState.SELECT_DISTRICT) {
            this.renderExploreDistricts(this.selectedProvince, this.currentSubRegion);
        }
    }

    initElements() {
        this.modeScreen = document.getElementById('mode-screen');
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.loadingEl = document.getElementById('loading');
        this.modeButtonsEl = document.getElementById('mode-buttons');
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
        this.modeTitleEl = document.getElementById('mode-title');
        this.modeDescriptionEl = document.getElementById('mode-description');
        this.instructionsEl = document.getElementById('instructions');
        this.themeToggleBtn = document.getElementById('theme-toggle');
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.startGame());
        this.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());
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

            // 모드에 따라 다른 화면 표시
            if (this.gameMode) {
                this.setupModeUI();
                this.showScreen('start');
            } else {
                // 모드 선택 화면 표시
                this.modeButtonsEl.classList.remove('hidden');
            }

                console.log(`로드 완료: ${this.provincesGeo.features.length}개 시도, ${this.allDistricts.length}개 시군구`);

        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            this.loadingEl.textContent = '지도 데이터 로딩 실패. 페이지를 새로고침해주세요.';
        }
    }

    setupModeUI() {
        const modeConfig = {
            explore: {
                title: '지도 둘러보기',
                description: '전국 지도를 자유롭게 클릭하며 지역을 탐색해보세요',
                instructions: `
                    <h3>탐색 방법</h3>
                    <ol>
                        <li>원하는 <strong>도/광역시</strong>를 클릭하세요</li>
                        <li>도 지역의 경우 <strong>북부/남부</strong>를 선택하세요</li>
                        <li>시/군/구를 클릭하면 지역 정보가 표시됩니다</li>
                        <li>뒤로가기 버튼으로 언제든 돌아갈 수 있어요</li>
                    </ol>
                `,
                buttonText: '탐색 시작'
            },
            practice: {
                title: '연습 모드',
                description: '시간제한 없이 천천히 문제를 풀어보세요',
                instructions: `
                    <h3>게임 방법</h3>
                    <ol>
                        <li>문제가 출제되면 해당 지역이 속한 <strong>도/광역시</strong>를 먼저 클릭</li>
                        <li>도 지역의 경우 <strong>북부/남부</strong> 선택</li>
                        <li>마지막으로 정확한 <strong>시/군/구</strong>를 클릭</li>
                        <li><strong>시간제한 없음!</strong> 천천히 풀어보세요</li>
                    </ol>
                `,
                buttonText: '연습 시작'
            },
            quiz: {
                title: '익숙해지기',
                description: '5초 제한시간 내에 정답을 맞춰보세요',
                instructions: `
                    <h3>게임 방법</h3>
                    <ol>
                        <li>문제가 출제되면 해당 지역이 속한 <strong>도/광역시</strong>를 먼저 클릭</li>
                        <li>도 지역의 경우 <strong>북부/남부</strong> 선택</li>
                        <li>마지막으로 정확한 <strong>시/군/구</strong>를 클릭</li>
                        <li>각 문제당 <strong>5초</strong> 제한시간!</li>
                    </ol>
                `,
                buttonText: '게임 시작'
            },
            test: {
                title: '실전 테스트',
                description: '지역 이름 없이 지도 모양만 보고 맞춰보세요!',
                instructions: `
                    <h3>게임 방법</h3>
                    <ol>
                        <li>문제가 출제되면 해당 지역이 속한 <strong>도/광역시</strong>를 먼저 클릭</li>
                        <li>도 지역의 경우 <strong>북부/남부</strong> 선택</li>
                        <li>시/군/구를 클릭 - <strong>이름이 표시되지 않습니다!</strong></li>
                        <li>각 문제당 <strong>5초</strong> 제한시간!</li>
                    </ol>
                `,
                buttonText: '테스트 시작'
            }
        };

        const config = modeConfig[this.gameMode];
        if (config) {
            this.modeTitleEl.textContent = config.title;
            this.modeDescriptionEl.textContent = config.description;
            this.instructionsEl.innerHTML = config.instructions;
            this.startBtn.textContent = config.buttonText;
        }
    }

    // "수원시장안구" -> "수원시" 로 변환 (시 단위로 통합)
    extractCityName(name) {
        // "OO시XX구" 패턴 감지 (예: 수원시장안구, 성남시분당구)
        const match = name.match(/^(.+시).+구$/);
        if (match) {
            return match[1]; // "수원시" 반환
        }
        return name; // 변환 불필요한 경우 원래 이름 반환
    }

    // 중복되는 지역 이름인지 확인 (동구, 서구 등 + 고성군처럼 여러 도에 있는 시군)
    isAmbiguousDistrictName(name) {
        // 여러 시도에 동일한 이름으로 존재하는 시군구
        const duplicateNames = [
            '고성군',  // 강원도, 경상남도
        ];
        // 광역시/특별시의 구 이름 (여러 도시에 동일한 이름 존재)
        const ambiguousGuNames = ['동구', '서구', '남구', '북구', '중구', '달서구', '수영구', '해운대구', '사하구', '사상구', '금정구', '연제구', '동래구', '부산진구', '영도구', '강서구', '기장군'];

        // 중복 이름이거나, 광역시 구 이름이거나, 짧은 구 이름 패턴
        return duplicateNames.includes(name) || ambiguousGuNames.includes(name) || /^[가-힣]{1,3}구$/.test(name);
    }

    // 문제 출제용 표시 이름 생성 (중복 구 이름에는 시도 약칭 추가)
    getDisplayName(districtName, provinceName) {
        // 광역시/특별시의 구인 경우 (QUIZ_REGIONS에서 빈 배열인 곳 제외하고 구 이름만 있는 경우)
        if (this.isAmbiguousDistrictName(districtName)) {
            const shortName = SHORT_NAMES[provinceName] || provinceName;
            return `${shortName} ${districtName}`;
        }
        return districtName;
    }

    // 색상 매핑: 인접해도 구분 잘 되는 색상 배열 사용
    buildColorMap(districts) {
        // 현재 테마 확인
        const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';

        // 다크 모드용 색상 (네온/밝은 톤 - 어두운 배경에 적합)
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

        // 라이트 모드용 색상 (중간 톤 파스텔 - 조금 더 진한)
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

        const colors = isLightMode ? lightModeColors : darkModeColors;

        // 시 단위로 그룹화
        const cityFeatures = new Map();
        districts.forEach(d => {
            const cityName = this.extractCityName(d.properties.name);
            if (!cityFeatures.has(cityName)) {
                cityFeatures.set(cityName, []);
            }
            cityFeatures.get(cityName).push(d);
        });

        const cityNames = [...cityFeatures.keys()];

        // 인접 관계 계산 (경계가 닿는지 확인)
        const adjacency = new Map();
        cityNames.forEach(city => adjacency.set(city, new Set()));

        // 각 시의 대표 지역 중심점으로 근접성 판단
        const cityCentroids = new Map();
        cityNames.forEach(cityName => {
            const features = cityFeatures.get(cityName);
            const collection = { type: 'FeatureCollection', features };
            cityCentroids.set(cityName, d3.geoCentroid(collection));
        });

        // 근접한 지역 찾기 (거리 기반)
        for (let i = 0; i < cityNames.length; i++) {
            for (let j = i + 1; j < cityNames.length; j++) {
                const city1 = cityNames[i];
                const city2 = cityNames[j];
                const c1 = cityCentroids.get(city1);
                const c2 = cityCentroids.get(city2);

                // 위경도 거리 계산 (약 0.25도 이내면 인접으로 간주 - 실제 경계 접촉 지역만)
                const dist = Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2));
                if (dist < 0.25) {
                    adjacency.get(city1).add(city2);
                    adjacency.get(city2).add(city1);
                }
            }
        }

        // 그래프 컬러링 (균등 분배 + 웰시-파월 방식)
        const cityColorMap = new Map();

        // 색상 사용 횟수 추적
        const colorUsageCount = new Map();
        colors.forEach(color => colorUsageCount.set(color, 0));

        // 인접 지역 수가 많은 순서대로 정렬 (웰시-파월)
        const sortedCities = [...cityNames].sort((a, b) =>
            adjacency.get(b).size - adjacency.get(a).size
        );

        sortedCities.forEach(cityName => {
            const neighbors = adjacency.get(cityName);
            const usedColors = new Set();

            neighbors.forEach(neighbor => {
                if (cityColorMap.has(neighbor)) {
                    usedColors.add(cityColorMap.get(neighbor));
                }
            });

            // 사용 가능한 색상 중 가장 적게 사용된 색상 선택 (균등 분배)
            let selectedColor = null;
            let minUsage = Infinity;

            for (const color of colors) {
                if (!usedColors.has(color)) {
                    const usage = colorUsageCount.get(color);
                    if (usage < minUsage) {
                        minUsage = usage;
                        selectedColor = color;
                    }
                }
            }

            // 모든 색상이 인접에서 사용된 경우 가장 적게 사용된 색상 선택
            if (!selectedColor) {
                let minUsageOverall = Infinity;
                for (const color of colors) {
                    const usage = colorUsageCount.get(color);
                    if (usage < minUsageOverall) {
                        minUsageOverall = usage;
                        selectedColor = color;
                    }
                }
            }

            cityColorMap.set(cityName, selectedColor);
            colorUsageCount.set(selectedColor, colorUsageCount.get(selectedColor) + 1);
        });

        return cityColorMap;
    }

    buildDistrictList() {
        this.allDistricts = [];
        const addedCities = new Set(); // 이미 추가된 시 이름 추적 (중복 방지)

        this.municipalitiesGeo.features.forEach(feature => {
            const originalName = feature.properties.name;
            const code = feature.properties.code;
            const provinceCode = code.substring(0, 2);
            const provinceName = CODE_TO_PROVINCE[provinceCode];

            if (provinceName && QUIZ_REGIONS[provinceName]) {
                const allowedDistricts = QUIZ_REGIONS[provinceName];

                // "시+구" 패턴인 경우 시 단위로 변환
                const cityName = this.extractCityName(originalName);

                // QUIZ_REGIONS에 시 이름이 있고, 아직 추가 안 된 경우에만 추가
                if (allowedDistricts.length > 0 && allowedDistricts.includes(cityName)) {
                    const uniqueKey = `${provinceName}-${cityName}`;

                    if (!addedCities.has(uniqueKey)) {
                        addedCities.add(uniqueKey);
                        this.allDistricts.push({
                            name: cityName,  // 시 단위 이름 사용
                            originalName: originalName,  // 원래 이름 보관
                            provinceName: provinceName,
                            code: code,
                            feature: feature
                        });
                    }
                }
            }
        });

        // 초기 목록도 완전히 셔플 (시도별 순서 제거)
        this.shuffleArray(this.allDistricts);

        console.log(`퀴즈 대상 시군구: ${this.allDistricts.length}개`);
        console.log('셔플 후 처음 10개:', this.allDistricts.slice(0, 10).map(d => `${d.provinceName} ${d.name}`));
    }

    // Fisher-Yates 셔플 알고리즘
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    startGame() {
        this.score = 0;
        this.currentQuestion = 0;
        this.results = [];

        if (this.gameMode === 'explore') {
            // 탐색 모드: 퀴즈 없이 지도 둘러보기
            this.showScreen('game');
            this.questionTextEl.textContent = '지역을 클릭해서 탐색하세요';
            this.stepIndicatorEl.textContent = '자유 탐색 모드';
            this.state = GameState.SELECT_PROVINCE;
            this.renderExploreProvinceMap();
        } else {
            // 퀴즈 모드
            this.generateQuestions();
            this.showScreen('game');
            this.updateUI();
            this.nextQuestion();
        }
    }

    generateQuestions() {
        // 매 게임마다 완전히 새로 셔플
        const shuffled = [...this.allDistricts];
        this.shuffleArray(shuffled);
        this.questions = shuffled.slice(0, this.totalQuestions);

        // 디버깅: 생성된 문제 순서 확인
        console.log('생성된 문제 순서:', this.questions.map(q => `${q.provinceName} ${q.name}`));
    }

    showScreen(screen) {
        this.modeScreen.classList.remove('active');
        this.startScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.resultScreen.classList.remove('active');

        switch (screen) {
            case 'mode': this.modeScreen.classList.add('active'); break;
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
        this.selectedGroup = null;
        this.correctSubRegion = null;
        this.currentQuestion++;
        this.updateUI();

        // 문제 표시: 중복 가능한 구 이름에는 시도 약칭 추가
        const displayName = this.getDisplayName(this.currentAnswer.name, this.currentAnswer.provinceName);
        this.questionTextEl.textContent = displayName;
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';

        // 지역 그룹 선택부터 시작
        this.state = GameState.SELECT_REGION_GROUP;
        this.updateStepIndicator();
        this.renderRegionGroupMap();

        // 타이머가 활성화된 모드에서만 타이머 시작
        if (this.timerEnabled) {
            this.startTimer();
        }
    }

    // ===== EXPLORE 모드 전용 함수들 =====

    renderExploreProvinceMap() {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        this.projection = d3.geoMercator()
            .center([127.5, 36.0])
            .scale(5500)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        const filteredProvinces = this.provincesGeo.features.filter(f =>
            f.properties.name !== '제주특별자치도'
        );

        this.svg.selectAll('.province')
            .data(filteredProvinces)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => getProvinceColors()[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .attr('data-group', d => PROVINCE_TO_GROUP[d.properties.name] || null)
            .on('click', (event, d) => this.handleExploreRegionGroupClick(d.properties.name));

        this.svg.selectAll('.region-label')
            .data(filteredProvinces)
            .enter()
            .append('text')
            .attr('class', 'region-label province-label')
            .attr('transform', d => `translate(${this.path.centroid(d)})`)
            .text(d => SHORT_NAMES[d.properties.name] || d.properties.name);
    }

    handleExploreRegionGroupClick(provinceName) {
        const clickedGroup = PROVINCE_TO_GROUP[provinceName];

        if (clickedGroup) {
            // 그룹에 속한 지역 클릭 → 그룹 내 선택 화면으로
            this.selectedGroup = clickedGroup;
            this.feedbackEl.textContent = `${GROUP_SHORT_NAMES[clickedGroup]} 선택됨`;
            this.feedbackEl.className = 'feedback';
            setTimeout(() => this.renderExploreGroupProvinceSelection(clickedGroup), 300);
        } else {
            // 독립 지역 클릭 → 기존 동작
            this.handleExploreProvinceClick(provinceName);
        }
    }

    // Explore 모드: 그룹 내 시도 선택
    renderExploreGroupProvinceSelection(groupName) {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        const groupProvinces = REGION_GROUPS[groupName];
        const filteredProvinces = this.provincesGeo.features.filter(f =>
            groupProvinces.includes(f.properties.name)
        );

        const featureCollection = { type: 'FeatureCollection', features: filteredProvinces };
        this.projection = d3.geoMercator().fitSize([width - 40, height - 40], featureCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        this.addBackButton(() => {
            this.selectedGroup = null;
            this.feedbackEl.textContent = '';
            this.renderExploreProvinceMap();
        });

        this.svg.selectAll('.province')
            .data(filteredProvinces)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => getProvinceColors()[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleExploreProvinceClick(d.properties.name));

        this.svg.selectAll('.region-label')
            .data(filteredProvinces)
            .enter()
            .append('text')
            .attr('class', 'region-label')
            .attr('transform', d => `translate(${this.path.centroid(d)})`)
            .text(d => SHORT_NAMES[d.properties.name] || d.properties.name);
    }

    handleExploreProvinceClick(provinceName) {
        this.selectedProvince = provinceName;
        this.feedbackEl.textContent = `${provinceName} 선택됨`;
        this.feedbackEl.className = 'feedback';

        if (LARGE_PROVINCES.includes(provinceName)) {
            setTimeout(() => this.renderExploreSubRegion(provinceName), 300);
        } else {
            setTimeout(() => this.renderExploreDistricts(provinceName), 300);
        }
    }

    renderExploreSubRegion(provinceName) {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        const provinceCode = Object.keys(CODE_TO_PROVINCE).find(k => CODE_TO_PROVINCE[k] === provinceName);
        const districts = this.municipalitiesGeo.features.filter(f =>
            f.properties.code.startsWith(provinceCode) &&
            !ISLAND_DISTRICTS.includes(f.properties.name)
        );

        const centroids = districts.map(f => ({
            feature: f,
            lat: d3.geoCentroid(f)[1]
        }));
        const avgLat = d3.mean(centroids, d => d.lat);

        const northFeatures = centroids.filter(d => d.lat >= avgLat).map(d => d.feature);
        const southFeatures = centroids.filter(d => d.lat < avgLat).map(d => d.feature);

        const allFeatures = { type: 'FeatureCollection', features: districts };
        this.projection = d3.geoMercator().fitSize([width - 40, height - 40], allFeatures);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        this.addBackButton(() => {
            this.selectedProvince = null;
            this.feedbackEl.textContent = '';
            // 그룹에 속한 지역이면 그룹 선택 화면으로, 아니면 전국 지도로
            if (this.selectedGroup) {
                this.renderExploreGroupProvinceSelection(this.selectedGroup);
            } else {
                this.renderExploreProvinceMap();
            }
        });

        this.svg.selectAll('.north')
            .data(northFeatures)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', getSubRegionColors().north)
            .on('click', () => this.renderExploreDistricts(provinceName, 'north'));

        this.svg.selectAll('.south')
            .data(southFeatures)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', getSubRegionColors().south)
            .on('click', () => this.renderExploreDistricts(provinceName, 'south'));

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

    renderExploreDistricts(provinceName, subRegion = null) {
        // 현재 subRegion 저장 (테마 변경 시 재렌더링용)
        this.currentSubRegion = subRegion;

        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        const provinceCode = Object.keys(CODE_TO_PROVINCE).find(k => CODE_TO_PROVINCE[k] === provinceName);
        let allDistricts = this.municipalitiesGeo.features.filter(f =>
            f.properties.code.startsWith(provinceCode)
        );

        // 본토 시군구 (섬 제외)
        let districts = allDistricts.filter(f => !ISLAND_DISTRICTS.includes(f.properties.name));

        // 해당 시도에 속한 섬 지역 찾기
        const islandDistricts = allDistricts.filter(f => ISLAND_DISTRICTS.includes(f.properties.name));

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

        const featureCollection = { type: 'FeatureCollection', features: districts };
        this.projection = d3.geoMercator().fitSize([width - 40, height - 40], featureCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        this.addBackButton(() => {
            if (LARGE_PROVINCES.includes(provinceName) && subRegion) {
                this.renderExploreSubRegion(provinceName);
            } else if (this.selectedGroup) {
                // 그룹에 속한 지역이면 그룹 선택 화면으로
                this.selectedProvince = null;
                this.feedbackEl.textContent = '';
                this.renderExploreGroupProvinceSelection(this.selectedGroup);
            } else {
                // 독립 지역이면 전국 지도로
                this.selectedProvince = null;
                this.feedbackEl.textContent = '';
                this.renderExploreProvinceMap();
            }
        });

        // 색상 매핑 (섬 포함)
        const allDistrictsForColor = [...districts, ...islandDistricts];
        const cityColorMap = this.buildColorMap(allDistrictsForColor);

        // 시군구 그리기 (같은 시는 경계선 없이 한 덩어리처럼)
        this.svg.selectAll('.district')
            .data(districts)
            .enter()
            .append('path')
            .attr('class', d => {
                const cityName = this.extractCityName(d.properties.name);
                return `district city-${cityName.replace(/\s/g, '-')}`;
            })
            .attr('d', this.path)
            .attr('fill', d => {
                const cityName = this.extractCityName(d.properties.name);
                return cityColorMap.get(cityName);
            })
            .attr('stroke', d => {
                const cityName = this.extractCityName(d.properties.name);
                return cityColorMap.get(cityName); // 같은 색으로 경계선 숨김
            })
            .attr('data-city', d => this.extractCityName(d.properties.name))
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleExploreDistrictClick(d, provinceName))
            .on('mouseenter', (event, d) => {
                // 같은 시의 모든 구 하이라이트
                const cityName = this.extractCityName(d.properties.name);
                d3.selectAll(`.district[data-city="${cityName}"]`)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', '2px')
                    .style('filter', 'brightness(1.2)');
            })
            .on('mouseleave', (event, d) => {
                // 하이라이트 해제
                const cityName = this.extractCityName(d.properties.name);
                const color = cityColorMap.get(cityName);
                d3.selectAll(`.district[data-city="${cityName}"]`)
                    .attr('stroke', color)
                    .attr('stroke-width', '0.5px')
                    .style('filter', null);
            });

        // 시 단위 라벨 (각 시마다 하나씩만)
        const cityNames = [...cityColorMap.keys()];
        cityNames.forEach(cityName => {
            // 섬 지역은 인셋에서 라벨 표시
            if (ISLAND_DISTRICTS.includes(cityName)) return;

            const cityDistricts = districts.filter(d =>
                this.extractCityName(d.properties.name) === cityName
            );
            if (cityDistricts.length === 0) return;

            const cityCollection = { type: 'FeatureCollection', features: cityDistricts };
            const center = d3.geoCentroid(cityCollection);

            this.svg.append('text')
                .attr('class', 'district-label')
                .attr('transform', `translate(${this.projection(center)})`)
                .text(cityName);
        });

        // 섬 지역 인셋 박스 렌더링 (Explore 모드)
        // 울릉군은 경북 북부에서만 표시, 옹진군은 인천에서 항상 표시
        const shouldShowInsets = islandDistricts.filter(island => {
            const islandName = island.properties.name;
            if (islandName === '울릉군') {
                return provinceName === '경상북도' && subRegion === 'north';
            } else if (islandName === '옹진군') {
                return provinceName === '인천광역시' && !subRegion;
            }
            return !subRegion;
        });

        if (shouldShowInsets.length > 0) {
            this.renderExploreIslandInsets(shouldShowInsets, cityColorMap, width, height, provinceName);
        }
    }

    // Explore 모드용 섬 지역 인셋 박스 렌더링
    renderExploreIslandInsets(islandDistricts, cityColorMap, width, height, provinceName) {
        const insetSize = 80;
        const padding = 10;

        islandDistricts.forEach((island, index) => {
            const islandName = island.properties.name;
            const config = ISLAND_INSET_CONFIG[islandName];
            if (!config) return;

            let insetX, insetY;
            if (config.position === 'bottom-left') {
                insetX = padding;
                insetY = height - insetSize - padding - 30;
            } else if (config.position === 'top-right') {
                insetX = width - insetSize - padding;
                insetY = padding;
            } else {
                insetX = padding + (index * (insetSize + padding));
                insetY = height - insetSize - padding - 30;
            }

            const insetGroup = this.svg.append('g')
                .attr('class', 'island-inset')
                .attr('transform', `translate(${insetX}, ${insetY})`);

            insetGroup.append('rect')
                .attr('width', insetSize)
                .attr('height', insetSize)
                .attr('fill', 'rgba(0, 0, 0, 0.3)')
                .attr('stroke', '#fff')
                .attr('stroke-width', 1)
                .attr('rx', 5);

            const islandCollection = { type: 'FeatureCollection', features: [island] };
            const islandProjection = d3.geoMercator()
                .fitSize([insetSize - 20, insetSize - 30], islandCollection);
            const islandPath = d3.geoPath().projection(islandProjection);

            const color = cityColorMap.get(islandName) || '#666';
            const self = this;
            insetGroup.append('path')
                .datum(island)
                .attr('class', 'district')
                .attr('d', islandPath)
                .attr('transform', 'translate(10, 5)')
                .attr('fill', color)
                .attr('stroke', '#fff')
                .attr('stroke-width', 0.5)
                .attr('data-city', islandName)
                .attr('data-name', islandName)
                .on('click', function() {
                    self.feedbackEl.textContent = `${SHORT_NAMES[provinceName]} ${islandName}`;
                    self.feedbackEl.className = 'feedback correct';
                    d3.selectAll('.district').classed('selected', false);
                    d3.select(this).classed('selected', true);
                })
                .on('mouseenter', function() {
                    d3.select(this)
                        .attr('stroke-width', '2px')
                        .style('filter', 'brightness(1.2)');
                })
                .on('mouseleave', function() {
                    d3.select(this)
                        .attr('stroke-width', '0.5px')
                        .style('filter', null);
                });

            insetGroup.append('text')
                .attr('class', 'district-label')
                .attr('x', insetSize / 2)
                .attr('y', insetSize - 5)
                .attr('text-anchor', 'middle')
                .text(islandName);
        });
    }

    handleExploreDistrictClick(d, provinceName) {
        const districtName = d.properties.name;
        this.feedbackEl.textContent = `${SHORT_NAMES[provinceName]} ${districtName}`;
        this.feedbackEl.className = 'feedback correct';

        // 선택된 지역 하이라이트
        d3.selectAll('.district').classed('selected', false);
        d3.selectAll('.district')
            .filter(data => data.properties.name === districtName)
            .classed('selected', true);
    }

    // ===== 기존 퀴즈 함수들 =====

    updateStepIndicator() {
        switch (this.state) {
            case GameState.SELECT_REGION_GROUP:
                this.stepIndicatorEl.textContent = '1단계: 지역을 선택하세요';
                break;
            case GameState.SELECT_PROVINCE:
                this.stepIndicatorEl.textContent = '2단계: 도/광역시를 선택하세요';
                break;
            case GameState.SELECT_SUBREGION:
                this.stepIndicatorEl.textContent = '3단계: 북부/남부를 선택하세요';
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

        const displayName = this.getDisplayName(this.currentAnswer.name, this.currentAnswer.provinceName);
        this.feedbackEl.textContent = `시간 초과! 정답: ${displayName}`;
        this.feedbackEl.className = 'feedback timeout';

        this.results.push({
            question: displayName,
            correct: false,
            answer: '시간 초과'
        });

        setTimeout(() => this.nextQuestion(), 2000);
    }

    // 지역 그룹 선택 지도 렌더링
    renderRegionGroupMap() {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        this.projection = d3.geoMercator()
            .center([127.5, 36.0])
            .scale(5500)
            .translate([width / 2, height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        // 시도 경계 그리기 (제주도 제외)
        const filteredProvinces = this.provincesGeo.features.filter(f =>
            f.properties.name !== '제주특별자치도'
        );

        this.svg.selectAll('.province')
            .data(filteredProvinces)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => getProvinceColors()[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .attr('data-group', d => PROVINCE_TO_GROUP[d.properties.name] || null)
            .on('click', (event, d) => this.handleRegionGroupClick(d.properties.name, event));

        // 시도 라벨
        this.svg.selectAll('.region-label')
            .data(filteredProvinces)
            .enter()
            .append('text')
            .attr('class', 'region-label province-label')
            .attr('transform', d => `translate(${this.path.centroid(d)})`)
            .text(d => SHORT_NAMES[d.properties.name] || d.properties.name);
    }

    handleRegionGroupClick(provinceName, event) {
        if (this.state !== GameState.SELECT_REGION_GROUP) return;

        const correctProvince = this.currentAnswer.provinceName;
        const correctGroup = PROVINCE_TO_GROUP[correctProvince];
        const clickedGroup = PROVINCE_TO_GROUP[provinceName];

        // 정답 표시용 문자열 미리 계산
        const correctHint = correctGroup
            ? GROUP_SHORT_NAMES[correctGroup]
            : SHORT_NAMES[correctProvince];

        // 그룹에 속한 지역인 경우
        if (clickedGroup) {
            if (clickedGroup === correctGroup) {
                // 올바른 그룹 클릭
                this.selectedGroup = clickedGroup;
                d3.selectAll('.province').classed('selected', false);

                // 해당 그룹의 모든 지역 하이라이트
                REGION_GROUPS[clickedGroup].forEach(prov => {
                    d3.selectAll(`.province[data-name="${prov}"]`).classed('selected', true);
                });

                // 그룹 내 지역 선택 단계로
                this.state = GameState.SELECT_PROVINCE;
                this.updateStepIndicator();
                setTimeout(() => this.renderGroupProvinceSelection(clickedGroup), 300);
            } else {
                // 틀린 그룹 클릭 (정답이 다른 그룹이거나 독립 지역)
                this.handleWrongAnswer(event.target, `틀렸습니다! ${correctHint}을 선택하세요.`);
            }
        } else {
            // 그룹에 속하지 않은 독립 지역 (충북, 전북, 강원)
            if (provinceName === correctProvince) {
                // 정답인 경우 바로 다음 단계로
                this.selectedProvince = provinceName;
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
                // 틀린 독립 지역
                this.handleWrongAnswer(event.target, `틀렸습니다! ${correctHint}을 선택하세요.`);
            }
        }
    }

    // 그룹 내 세부 지역 선택 렌더링
    renderGroupProvinceSelection(groupName) {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = 600;

        // 해당 그룹의 시도들만 필터링
        const groupProvinces = REGION_GROUPS[groupName];
        const filteredProvinces = this.provincesGeo.features.filter(f =>
            groupProvinces.includes(f.properties.name)
        );

        const featureCollection = { type: 'FeatureCollection', features: filteredProvinces };
        this.projection = d3.geoMercator().fitSize([width - 40, height - 40], featureCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 뒤로가기 버튼
        this.addBackButton(() => {
            this.selectedGroup = null;
            this.state = GameState.SELECT_REGION_GROUP;
            this.updateStepIndicator();
            this.renderRegionGroupMap();
        });

        // 그룹 내 시도 그리기
        this.svg.selectAll('.province')
            .data(filteredProvinces)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => getProvinceColors()[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleGroupProvinceClick(d.properties.name, event));

        // 시도 라벨
        this.svg.selectAll('.region-label')
            .data(filteredProvinces)
            .enter()
            .append('text')
            .attr('class', 'region-label')
            .attr('transform', d => `translate(${this.path.centroid(d)})`)
            .text(d => SHORT_NAMES[d.properties.name] || d.properties.name);
    }

    handleGroupProvinceClick(provinceName, event) {
        if (this.state !== GameState.SELECT_PROVINCE) return;

        const correctProvince = this.currentAnswer.provinceName;

        if (provinceName === correctProvince) {
            this.selectedProvince = provinceName;
            d3.selectAll('.province').classed('selected', false);
            d3.select(event.target).classed('selected', true);

            // 세종시는 하위 시군구가 없으므로 바로 정답 처리
            if (provinceName === '세종특별자치시') {
                this.stopTimer();
                d3.select(event.target).classed('correct', true);
                this.score += 10;
                this.updateScore();
                this.results.push({
                    question: this.currentAnswer.name,
                    correct: true
                });
                this.showFeedback(`정답입니다! ${this.getDisplayName(this.currentAnswer.name, provinceName)}`, 'correct');
                setTimeout(() => this.nextQuestion(), 1500);
            } else if (LARGE_PROVINCES.includes(provinceName)) {
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

        // 시도 경계 그리기 (제주도 제외)
        const filteredProvinces = this.provincesGeo.features.filter(f =>
            f.properties.name !== '제주특별자치도'
        );

        this.svg.selectAll('.province')
            .data(filteredProvinces)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => getProvinceColors()[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleProvinceClick(d.properties.name, event));

        // 시도 라벨 (제주도 제외)
        this.svg.selectAll('.region-label')
            .data(filteredProvinces)
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

            // 세종시는 하위 시군구가 없으므로 바로 정답 처리
            if (provinceName === '세종특별자치시') {
                this.stopTimer();
                d3.select(event.target).classed('correct', true);
                this.score += 10;
                this.updateScore();
                this.results.push({
                    question: this.currentAnswer.name,
                    correct: true
                });
                this.showFeedback(`정답입니다! ${this.getDisplayName(this.currentAnswer.name, provinceName)}`, 'correct');
                setTimeout(() => this.nextQuestion(), 1500);
            } else if (LARGE_PROVINCES.includes(provinceName)) {
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

        // 해당 시도의 시군구만 필터링 (섬 지역은 별도 인셋으로 표시하므로 본토만)
        const provinceCode = Object.keys(CODE_TO_PROVINCE).find(k => CODE_TO_PROVINCE[k] === provinceName);
        const districts = this.municipalitiesGeo.features.filter(f =>
            f.properties.code.startsWith(provinceCode) &&
            !ISLAND_DISTRICTS.includes(f.properties.name)
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
            this.selectedProvince = null;
            // 그룹에 속한 지역이면 그룹 선택 화면으로, 아니면 전국 지도로
            if (this.selectedGroup) {
                this.state = GameState.SELECT_PROVINCE;
                this.updateStepIndicator();
                this.renderGroupProvinceSelection(this.selectedGroup);
            } else {
                this.state = GameState.SELECT_REGION_GROUP;
                this.updateStepIndicator();
                this.renderRegionGroupMap();
            }
        });

        // 북부 그리기
        this.svg.selectAll('.north')
            .data(northFeatures)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', getSubRegionColors().north)
            .on('click', (event) => this.handleSubRegionClick('north', event));

        // 남부 그리기
        this.svg.selectAll('.south')
            .data(southFeatures)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', getSubRegionColors().south)
            .on('click', (event) => this.handleSubRegionClick('south', event));

        // 라벨 (test 모드에서는 숨김)
        if (this.showLabels) {
            const northCenter = d3.geoCentroid({ type: 'FeatureCollection', features: northFeatures });
            const southCenter = d3.geoCentroid({ type: 'FeatureCollection', features: southFeatures });

            this.svg.append('text')
                .attr('class', 'region-label subregion-label')
                .attr('transform', `translate(${this.projection(northCenter)})`)
                .text(`${SHORT_NAMES[provinceName]} 북부`);

            this.svg.append('text')
                .attr('class', 'region-label subregion-label')
                .attr('transform', `translate(${this.projection(southCenter)})`)
                .text(`${SHORT_NAMES[provinceName]} 남부`);
        }
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

        // 해당 시도의 시군구 필터링 (본토만, 섬 지역은 인셋으로 따로 표시)
        const provinceCode = Object.keys(CODE_TO_PROVINCE).find(k => CODE_TO_PROVINCE[k] === provinceName);
        let allDistricts = this.municipalitiesGeo.features.filter(f =>
            f.properties.code.startsWith(provinceCode)
        );

        // 본토 시군구 (섬 제외)
        let districts = allDistricts.filter(f => !ISLAND_DISTRICTS.includes(f.properties.name));

        // 해당 시도에 속한 섬 지역 찾기
        const islandDistricts = allDistricts.filter(f => ISLAND_DISTRICTS.includes(f.properties.name));

        // 북부/남부 필터링 (섬은 필터링 대상에서 제외)
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

        // 투영 설정 (본토 기준)
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
            } else if (this.selectedGroup) {
                // 그룹에 속한 지역이면 그룹 선택 화면으로
                this.state = GameState.SELECT_PROVINCE;
                this.selectedProvince = null;
                this.updateStepIndicator();
                this.renderGroupProvinceSelection(this.selectedGroup);
            } else {
                // 독립 지역이면 전국 지도로
                this.state = GameState.SELECT_REGION_GROUP;
                this.selectedProvince = null;
                this.updateStepIndicator();
                this.renderRegionGroupMap();
            }
        });

        // 색상 매핑 (섬 포함)
        const allDistrictsForColor = [...districts, ...islandDistricts];
        const cityColorMap = this.buildColorMap(allDistrictsForColor);

        // 시군구 그리기 (같은 시는 경계선 없이 한 덩어리처럼)
        this.svg.selectAll('.district')
            .data(districts)
            .enter()
            .append('path')
            .attr('class', d => {
                const cityName = this.extractCityName(d.properties.name);
                return `district city-${cityName.replace(/\s/g, '-')}`;
            })
            .attr('d', this.path)
            .attr('fill', d => {
                const cityName = this.extractCityName(d.properties.name);
                return cityColorMap.get(cityName);
            })
            .attr('stroke', d => {
                const cityName = this.extractCityName(d.properties.name);
                return cityColorMap.get(cityName); // 같은 색으로 경계선 숨김
            })
            .attr('data-city', d => this.extractCityName(d.properties.name))
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleDistrictClick(d.properties.name, event))
            .on('mouseenter', (event, d) => {
                // 같은 시의 모든 구 하이라이트
                const cityName = this.extractCityName(d.properties.name);
                d3.selectAll(`.district[data-city="${cityName}"]`)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', '2px')
                    .style('filter', 'brightness(1.2)');
            })
            .on('mouseleave', (event, d) => {
                // 하이라이트 해제
                const cityName = this.extractCityName(d.properties.name);
                const color = cityColorMap.get(cityName);
                d3.selectAll(`.district[data-city="${cityName}"]`)
                    .attr('stroke', color)
                    .attr('stroke-width', '0.5px')
                    .style('filter', null);
            });

        // 시 단위 라벨 (각 시마다 하나씩만, test 모드에서는 숨김)
        if (this.showLabels) {
            const cityNames = [...cityColorMap.keys()];
            cityNames.forEach(cityName => {
                // 섬 지역은 인셋에서 라벨 표시
                if (ISLAND_DISTRICTS.includes(cityName)) return;

                // 해당 시의 모든 구 찾기
                const cityDistricts = districts.filter(d =>
                    this.extractCityName(d.properties.name) === cityName
                );
                if (cityDistricts.length === 0) return;

                // 시의 중심점 계산
                const cityCollection = { type: 'FeatureCollection', features: cityDistricts };
                const center = d3.geoCentroid(cityCollection);

                this.svg.append('text')
                    .attr('class', 'district-label')
                    .attr('transform', `translate(${this.projection(center)})`)
                    .text(cityName);
            });
        }

        // 섬 지역 인셋 박스 렌더링
        // 울릉군은 경북 북부에서만 표시, 옹진군은 인천에서 항상 표시
        const shouldShowInsets = islandDistricts.filter(island => {
            const islandName = island.properties.name;
            if (islandName === '울릉군') {
                // 경북에서 북부 선택 시에만 표시
                return provinceName === '경상북도' && subRegion === 'north';
            } else if (islandName === '옹진군') {
                // 인천은 LARGE_PROVINCES가 아니므로 subRegion 없이 표시
                return provinceName === '인천광역시' && !subRegion;
            }
            return !subRegion; // 기본적으로 subRegion 없을 때만
        });

        if (shouldShowInsets.length > 0) {
            this.renderIslandInsets(shouldShowInsets, cityColorMap, width, height);
        }
    }

    // 섬 지역 인셋 박스 렌더링
    renderIslandInsets(islandDistricts, cityColorMap, width, height) {
        const insetSize = 80; // 인셋 박스 크기
        const padding = 10;

        islandDistricts.forEach((island, index) => {
            const islandName = island.properties.name;
            const config = ISLAND_INSET_CONFIG[islandName];
            if (!config) return;

            // 인셋 위치 결정
            let insetX, insetY;
            if (config.position === 'bottom-left') {
                insetX = padding;
                insetY = height - insetSize - padding - 30; // 30은 뒤로가기 버튼 공간
            } else if (config.position === 'top-right') {
                insetX = width - insetSize - padding;
                insetY = padding;
            } else {
                insetX = padding + (index * (insetSize + padding));
                insetY = height - insetSize - padding - 30;
            }

            // 인셋 그룹 생성
            const insetGroup = this.svg.append('g')
                .attr('class', 'island-inset')
                .attr('transform', `translate(${insetX}, ${insetY})`);

            // 인셋 배경 박스
            insetGroup.append('rect')
                .attr('width', insetSize)
                .attr('height', insetSize)
                .attr('fill', 'rgba(0, 0, 0, 0.3)')
                .attr('stroke', '#fff')
                .attr('stroke-width', 1)
                .attr('rx', 5);

            // 섬 지역용 투영 설정
            const islandCollection = { type: 'FeatureCollection', features: [island] };
            const islandProjection = d3.geoMercator()
                .fitSize([insetSize - 20, insetSize - 30], islandCollection);
            const islandPath = d3.geoPath().projection(islandProjection);

            // 섬 지역 그리기
            const color = cityColorMap.get(islandName) || '#666';
            insetGroup.append('path')
                .datum(island)
                .attr('class', 'district')
                .attr('d', islandPath)
                .attr('transform', 'translate(10, 5)')
                .attr('fill', color)
                .attr('stroke', '#fff')
                .attr('stroke-width', 0.5)
                .attr('data-city', islandName)
                .attr('data-name', islandName)
                .on('click', (event) => this.handleDistrictClick(islandName, event))
                .on('mouseenter', function() {
                    d3.select(this)
                        .attr('stroke-width', '2px')
                        .style('filter', 'brightness(1.2)');
                })
                .on('mouseleave', function() {
                    d3.select(this)
                        .attr('stroke-width', '0.5px')
                        .style('filter', null);
                });

            // 섬 이름 라벨 (test 모드에서는 숨김)
            if (this.showLabels) {
                insetGroup.append('text')
                    .attr('class', 'district-label')
                    .attr('x', insetSize / 2)
                    .attr('y', insetSize - 5)
                    .attr('text-anchor', 'middle')
                    .text(islandName);
            }
        });
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
        const displayName = this.getDisplayName(this.currentAnswer.name, this.currentAnswer.provinceName);

        // 클릭한 지역을 시 단위로 변환해서 비교 (예: "수원시장안구" -> "수원시")
        const clickedCity = this.extractCityName(districtName);
        const isCorrect = (clickedCity === correctDistrict) || (districtName === correctDistrict);

        if (isCorrect) {
            d3.select(event.target).classed('correct', true);
            this.score += 10;
            this.updateUI();

            this.feedbackEl.textContent = `정답입니다! +10점`;
            this.feedbackEl.className = 'feedback correct';

            this.results.push({
                question: displayName,
                correct: true,
                answer: districtName
            });
        } else {
            d3.select(event.target).classed('incorrect', true);

            this.feedbackEl.textContent = `틀렸습니다! 정답: ${displayName}`;
            this.feedbackEl.className = 'feedback incorrect';

            this.results.push({
                question: displayName,
                correct: false,
                answer: districtName
            });

            // 정답 하이라이트 (해당 시의 모든 구를 하이라이트)
            d3.selectAll('.district')
                .filter(d => {
                    const name = d.properties.name;
                    const cityName = this.extractCityName(name);
                    return name === correctDistrict || cityName === correctDistrict;
                })
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

        const displayName = this.getDisplayName(this.currentAnswer.name, this.currentAnswer.provinceName);
        this.results.push({
            question: displayName,
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
