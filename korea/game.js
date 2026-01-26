// 대한민국 지도 퀴즈 - TopoJSON 버전 (최적화)

// 퀴즈에 사용할 지역 목록 (사용자 정의)
const QUIZ_REGIONS = {
    '서울특별시': ['도봉구', '노원구', '강북구', '은평구', '성북구', '중랑구', '서대문구', '종로구', '동대문구', '강서구', '마포구', '중구', '성동구', '광진구', '강동구', '양천구', '영등포구', '용산구', '동작구', '송파구', '구로구', '금천구', '관악구', '서초구', '강남구'],
    '부산광역시': [],  // 인접 지역으로만 표시
    '대구광역시': [],  // 인접 지역으로만 표시 (달성군 포함)
    '인천광역시': ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군'],
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
    '경상남도': ['거창군', '함양군', '합천군', '창녕군', '밀양시', '양산시', '산청군', '의령군', '함안군', '창원시', '김해시', '하동군', '진주시', '사천시', '고성군', '남해군', '통영시', '거제시'],
    '제주특별자치도': ['제주시', '서귀포시']
};

// 시도별 색상 - 다크 모드용
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
    '경상남도': '#8B4513',
    '제주특별자치도': '#E91E63'
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
    '경상남도': '#AF601A',
    '제주특별자치도': '#F48FB1'
};

// 테마에 따른 시도 색상 반환 (라이트 모드가 기본)
function getProvinceColors() {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDarkMode ? PROVINCE_COLORS_DARK : PROVINCE_COLORS_LIGHT;
}

// 테마에 따른 북부/남부 색상 반환 (라이트 모드가 기본)
function getSubRegionColors() {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDarkMode
        ? { north: '#3498db', south: '#e74c3c' }  // 다크 모드: 진한 파랑/빨강
        : { north: '#64B5F6', south: '#F48FB1' }; // 라이트 모드: 파스텔 블루/핑크
}

// TopoJSON 데이터명 → 실제 표시명 변환 (개명된 지역)
const DISPLAY_NAME_MAP = {
    '남구': '미추홀구',  // 인천 남구 → 미추홀구 (2018년 개명)
};

// 표시명 → TopoJSON 데이터명 역변환
const DATA_NAME_MAP = {
    '미추홀구': '남구',
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
    '38': '경상남도',
    '39': '제주특별자치도',
    '50': '제주특별자치도'  // 일부 데이터에서 50 사용
};

// 북부/남부 구분이 필요한 도 지역 (경기도만 해당)
const LARGE_PROVINCES = ['경기도'];

// 별도 인셋 박스로 표시할 섬 지역
// 인천 강화군/옹진군, 경북 울릉군(울릉도/독도)
const ISLAND_DISTRICTS = ['강화군', '옹진군', '울릉군'];

// 섬 지역 인셋 설정 (소속 시도, 인셋 위치)
const ISLAND_INSET_CONFIG = {
    '강화군': { province: '인천광역시', position: 'center-left-top' },
    '옹진군': { province: '인천광역시', position: 'center-left-bottom' },
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

// 퀴즈 필터용 권역 (사용자가 선택 가능한 범위)
const QUIZ_FILTER_REGIONS = {
    'all': null,  // 전국
    '수도권': ['서울특별시', '경기도', '인천광역시'],
    '충청권': ['충청북도', '충청남도', '대전광역시', '세종특별자치시'],
    '전라권': ['전라북도', '전라남도', '광주광역시'],
    '경상권': ['경상북도', '경상남도', '대구광역시', '부산광역시', '울산광역시'],
    '강원권': ['강원도'],
    '제주권': ['제주특별자치도']
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
        this.combo = 0;
        this.maxComboAchieved = 0;  // 게임 중 달성한 최대 콤보
        this.maxCombo = 10;  // 콤보 상한
        this.baseScore = 100;  // 기본 점수
        this.comboBonus = 10;  // 콤보당 보너스
        this.wrongPenalty = 20;  // 오답 감점
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

        // 4단계 테스트 서브모드 (speed / survival)
        this.testSubMode = 'speed';
        // 스피드 모드용
        this.speedTimeLimit = 60000;  // 60초 총 시간
        this.speedTimer = null;
        this.speedTimeRemaining = 60000;
        // 서바이벌 모드용
        this.lives = 3;
        this.maxLives = 3;

        this.svg = null;
        this.projection = null;
        this.path = null;
        this.zoom = null;
        this.mapGroup = null;

        // 지역 필터 설정
        this.selectedRegionFilter = 'all';

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

        // 창 크기 변경 시 지도 다시 그리기
        window.addEventListener('resize', () => {
            // 게임 화면이 활성화된 경우에만 다시 그리기
            if (this.gameScreen.classList.contains('active')) {
                // 약간의 지연 후 렌더링 (리사이즈 완료 대기)
                clearTimeout(this.resizeTimer);
                this.resizeTimer = setTimeout(() => {
                    this.rerenderCurrentMap();
                }, 100);
            }
        });
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
            case 'practice-blind':
                this.timerEnabled = false;
                this.showLabels = false;
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
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

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
                // 지역 필터로 선택된 권역인지 확인
                if (QUIZ_FILTER_REGIONS[this.selectedGroup]) {
                    this.renderExploreFilteredRegionMap(this.selectedGroup);
                } else {
                    this.renderExploreGroupProvinceSelection(this.selectedGroup);
                }
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
        this.comboEl = document.getElementById('combo');
        this.questionNumEl = document.getElementById('question-num');
        this.timerEl = document.getElementById('timer');
        this.timerFillEl = document.getElementById('timer-fill');
        this.questionTextEl = document.getElementById('question-text');
        this.stepIndicatorEl = document.getElementById('step-indicator');
        this.questionAreaEl = document.querySelector('.question-area');
        this.mapContainer = document.getElementById('map-container');
        this.mapSvg = document.getElementById('map-svg');
        this.feedbackEl = document.getElementById('feedback');
        this.finalScoreEl = document.getElementById('final-score');
        this.resultDetailsEl = document.getElementById('result-details');
        this.modeTitleEl = document.getElementById('mode-title');
        this.modeDescriptionEl = document.getElementById('mode-description');
        this.instructionsEl = document.getElementById('instructions');
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.labelToggleEl = document.getElementById('label-toggle');
        this.testModeSelectEl = document.getElementById('test-mode-select');
        this.choicesContainer = document.getElementById('choices-container');
        this.choicesGrid = document.getElementById('choices-grid');
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.startGame());
        this.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());

        // 지역 필터 이벤트
        const filterOptions = document.querySelectorAll('#region-filter input[name="region"]');
        filterOptions.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedRegionFilter = e.target.value;
                // 선택 상태 UI 업데이트
                document.querySelectorAll('#region-filter .filter-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.closest('.filter-option').classList.add('selected');
            });
        });

        // 이름 표시 토글 이벤트 (연습 모드)
        const labelOptions = document.querySelectorAll('#label-toggle input[name="showLabels"]');
        labelOptions.forEach(radio => {
            radio.addEventListener('change', (e) => {
                // 선택 상태 UI 업데이트
                document.querySelectorAll('#label-toggle .toggle-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.closest('.toggle-option').classList.add('selected');
            });
        });

        // 4단계 테스트 모드 선택 이벤트 (스피드/서바이벌)
        const testModeOptions = document.querySelectorAll('#test-mode-select input[name="testSubMode"]');
        testModeOptions.forEach(radio => {
            radio.addEventListener('change', (e) => {
                // 선택 상태 UI 업데이트
                document.querySelectorAll('#test-mode-select .toggle-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.closest('.toggle-option').classList.add('selected');
            });
        });
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
                        <li>경기도는 <strong>북부/남부</strong>를 선택하세요</li>
                        <li>시/군/구를 클릭하면 지역 정보가 표시됩니다</li>
                        <li>뒤로가기 버튼으로 언제든 돌아갈 수 있어요</li>
                    </ol>
                `,
                buttonText: '탐색 시작'
            },
            practice: {
                title: '연습 모드',
                description: '시간 제한 없이 천천히 문제를 풀어보세요',
                instructions: `
                    <h3>게임 방법</h3>
                    <ol>
                        <li>문제가 출제되면 해당 지역이 속한 <strong>도/광역시</strong>를 먼저 클릭</li>
                        <li>경기도는 <strong>북부/남부</strong> 선택</li>
                        <li>정확한 <strong>시/군/구</strong>를 클릭</li>
                        <li><strong>시간제한 없음!</strong> 틀려도 정답을 찾을 때까지 계속 도전!</li>
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
                        <li>경기도는 <strong>북부/남부</strong> 선택</li>
                        <li>정확한 <strong>시/군/구</strong>를 클릭</li>
                        <li>각 문제당 <strong>5초</strong> 제한시간!</li>
                    </ol>
                `,
                buttonText: '게임 시작'
            },
            test: {
                title: '실전 테스트',
                description: '하이라이트된 지역의 이름을 8개 보기 중에서 맞춰보세요!',
                instructions: `
                    <h3>게임 방법</h3>
                    <ol>
                        <li>지도에서 <strong>빨간색으로 표시된 지역</strong>을 확인하세요</li>
                        <li>아래 <strong>8개의 보기</strong> 중 정답을 선택하세요</li>
                        <li>각 문제당 <strong>5초</strong> 제한시간!</li>
                        <li>틀리면 바로 다음 문제로 넘어갑니다</li>
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

        // 지역 필터 표시 (모든 모드에서 표시)
        const regionFilter = document.getElementById('region-filter');
        if (regionFilter) {
            regionFilter.classList.remove('hidden');
        }

        // 이름 표시 토글 (explore, practice, quiz 모드에서만 표시)
        // test 모드는 8지선다라서 이름 표시 옵션 불필요
        if (this.labelToggleEl) {
            if (this.gameMode === 'test') {
                this.labelToggleEl.classList.add('hidden');
            } else if (this.gameMode === 'explore' || this.gameMode === 'practice' || this.gameMode === 'quiz') {
                this.labelToggleEl.classList.remove('hidden');
            } else {
                this.labelToggleEl.classList.add('hidden');
            }
        }

        // 4단계 테스트 모드 선택 (스피드/서바이벌 - test 모드에서만 표시)
        if (this.testModeSelectEl) {
            if (this.gameMode === 'test') {
                this.testModeSelectEl.classList.remove('hidden');
            } else {
                this.testModeSelectEl.classList.add('hidden');
            }
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

    // 중복되는 지역 이름인지 확인 (실제 전국에서 중복되는 이름만)
    isAmbiguousDistrictName(name) {
        // 전국에서 실제로 중복되는 시군구 이름만 (7개)
        const duplicateNames = [
            '고성군',  // 강원도, 경상남도
            '동구',    // 부산, 대구, 인천, 광주, 대전, 울산
            '서구',    // 부산, 대구, 인천, 광주, 대전
            '남구',    // 부산, 대구, 인천, 광주, 울산
            '북구',    // 부산, 대구, 광주, 울산
            '중구',    // 서울, 부산, 대구, 인천, 대전, 울산
            '강서구',  // 서울, 부산
        ];

        return duplicateNames.includes(name);
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
        // 현재 테마 확인 (라이트 모드가 기본)
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

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

        const colors = isDarkMode ? darkModeColors : lightModeColors;

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
                let cityName = this.extractCityName(originalName);

                // TopoJSON 데이터명 → 표시명 변환 (예: 남구 → 미추홀구)
                const displayName = DISPLAY_NAME_MAP[cityName] || cityName;

                // QUIZ_REGIONS에 표시 이름이 있고, 아직 추가 안 된 경우에만 추가
                if (allowedDistricts.length > 0 && allowedDistricts.includes(displayName)) {
                    const uniqueKey = `${provinceName}-${displayName}`;

                    if (!addedCities.has(uniqueKey)) {
                        addedCities.add(uniqueKey);
                        this.allDistricts.push({
                            name: displayName,  // 표시용 이름 사용 (미추홀구)
                            dataName: cityName,  // TopoJSON 데이터 이름 (남구)
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
        document.body.classList.add('game-active');
        this.score = 0;
        this.combo = 0;
        this.maxComboAchieved = 0;
        this.currentQuestion = 0;
        this.results = [];
        this.practiceAttempts = 0;

        // 이름 표시 옵션 적용 (explore, practice, quiz 모드)
        if (this.gameMode === 'explore' || this.gameMode === 'practice' || this.gameMode === 'quiz') {
            const labelToggle = document.querySelector('#label-toggle input[name="showLabels"]:checked');
            this.showLabels = labelToggle?.value !== 'hide';

            // 라벨 숨김 처리 업데이트
            const mapContainer = document.getElementById('map-container');
            if (this.showLabels) {
                mapContainer?.classList.remove('hide-labels');
            } else {
                mapContainer?.classList.add('hide-labels');
            }
        }

        if (this.gameMode === 'explore') {
            // 탐색 모드: 퀴즈 없이 지도 둘러보기
            this.showScreen('game');
            this.questionTextEl.textContent = '지역을 클릭해서 탐색하세요';
            this.stepIndicatorEl.textContent = '자유 탐색 모드';
            this.state = GameState.SELECT_PROVINCE;

            // 지역 필터가 선택되어 있으면 해당 권역으로 드릴다운
            if (this.selectedRegionFilter !== 'all') {
                this.selectedGroup = this.selectedRegionFilter;
                this.renderExploreFilteredRegionMap(this.selectedRegionFilter);
            } else {
                this.renderExploreProvinceMap();
            }
        } else if (this.gameMode === 'test') {
            // 4단계 실전 테스트: 지역 보여주고 이름 맞추기 (8지선다)
            // 서브모드 읽기 (스피드 / 서바이벌)
            const testSubModeRadio = document.querySelector('#test-mode-select input[name="testSubMode"]:checked');
            this.testSubMode = testSubModeRadio?.value || 'speed';
            console.log('[테스트모드] 게임 시작 - 서브모드:', this.testSubMode);

            // 서브모드별 초기화
            if (this.testSubMode === 'speed') {
                // 스피드 모드: 60초 총 시간, 무제한 문제
                this.speedTimeRemaining = this.speedTimeLimit;
                this.totalQuestions = 9999;  // 무제한 (시간 내 최대한 많이)
            } else {
                // 서바이벌 모드: 목숨 3개, 무제한 문제
                this.lives = this.maxLives;
                this.totalQuestions = 9999;  // 무제한 (목숨 다 떨어질 때까지)
            }

            this.generateQuestions();
            this.showScreen('game');

            // 4단계에서는 "문제: 이 지역의 이름은?" 영역 숨기기
            this.questionAreaEl?.classList.add('hidden');
            if (this.questionAreaEl) {
                this.questionAreaEl.style.display = 'none';
            }
            document.body.classList.add('test-mode');

            this.choicesContainer?.classList.remove('hidden');
            console.log('[테스트모드] 8지선다 컨테이너 표시');
            this.updateUI();

            // 스피드 모드: 전체 타이머 시작
            if (this.testSubMode === 'speed') {
                this.startSpeedTimer();
            }

            this.nextTestQuestion();
        } else {
            // 퀴즈 모드 (practice, quiz)
            this.generateQuestions();
            this.showScreen('game');
            this.choicesContainer?.classList.add('hidden');
            this.updateUI();
            this.nextQuestion();
        }
    }

    generateQuestions() {
        // 지역 필터 적용
        let filteredDistricts = [...this.allDistricts];

        if (this.selectedRegionFilter !== 'all') {
            const allowedProvinces = QUIZ_FILTER_REGIONS[this.selectedRegionFilter];
            if (allowedProvinces) {
                filteredDistricts = this.allDistricts.filter(d =>
                    allowedProvinces.includes(d.provinceName)
                );
            }
        }

        // 매 게임마다 완전히 새로 셔플
        this.shuffleArray(filteredDistricts);

        // 필터된 지역이 10개 미만이면 그만큼만 출제
        const questionCount = Math.min(this.totalQuestions, filteredDistricts.length);
        this.questions = filteredDistricts.slice(0, questionCount);
        this.totalQuestions = questionCount;

        // 디버깅: 생성된 문제 순서 확인
        console.log(`[${this.selectedRegionFilter}] 생성된 문제 순서:`, this.questions.map(q => `${q.provinceName} ${q.name}`));
    }

    showScreen(screen) {
        if (screen !== 'game') {
            document.body.classList.remove('game-active');
        }

        this.modeScreen.classList.remove('active');
        this.startScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.resultScreen.classList.remove('active');

        // quiz, test 모드에서만 stats 표시
        const container = document.querySelector('.container');
        if (screen === 'game' && (this.gameMode === 'quiz' || this.gameMode === 'test')) {
            container.classList.add('show-stats');
        } else {
            container.classList.remove('show-stats');
        }

        switch (screen) {
            case 'mode': this.modeScreen.classList.add('active'); break;
            case 'start': this.startScreen.classList.add('active'); break;
            case 'game': this.gameScreen.classList.add('active'); break;
            case 'result': this.resultScreen.classList.add('active'); break;
        }

        // 4단계 테스트 모드에서는 question-area 숨김
        if (screen === 'game' && this.gameMode === 'test') {
            const questionArea = document.querySelector('.question-area');
            if (questionArea) {
                questionArea.style.display = 'none';
            }
        }
    }

    updateUI() {
        this.scoreEl.textContent = this.score;

        // 4단계 테스트 모드 서브모드별 표시
        if (this.gameMode === 'test') {
            if (this.testSubMode === 'speed') {
                // 스피드 모드: 맞춘 개수만 표시
                this.questionNumEl.textContent = `${this.currentQuestion}문제`;
            } else if (this.testSubMode === 'survival') {
                // 서바이벌 모드: 목숨 표시
                this.questionNumEl.textContent = '❤️'.repeat(this.lives) + '🖤'.repeat(this.maxLives - this.lives);
            }
        } else {
            this.questionNumEl.textContent = `${this.currentQuestion}/${this.totalQuestions}`;
        }
        this.updateComboDisplay();
    }

    updateScore() {
        this.scoreEl.textContent = this.score;
        this.updateComboDisplay();
    }

    updateComboDisplay() {
        if (this.comboEl) {
            this.comboEl.textContent = this.combo;
            // 콤보에 따라 시각적 효과 추가
            if (this.combo >= 10) {
                this.comboEl.className = 'value combo-value combo-max';
            } else if (this.combo >= 5) {
                this.comboEl.className = 'value combo-value combo-high';
            } else if (this.combo >= 3) {
                this.comboEl.className = 'value combo-value combo-mid';
            } else {
                this.comboEl.className = 'value combo-value';
            }
        }
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

        // 지역 필터가 선택되어 있으면 바로 해당 권역으로 드릴다운
        if (this.selectedRegionFilter !== 'all') {
            this.selectedGroup = this.selectedRegionFilter;
            this.state = GameState.SELECT_PROVINCE;
            this.updateStepIndicator();
            this.renderFilteredRegionMap(this.selectedRegionFilter);
        } else {
            // 전국 모드: 지역 그룹 선택부터 시작
            this.state = GameState.SELECT_REGION_GROUP;
            this.updateStepIndicator();
            this.renderRegionGroupMap();
        }

        // 타이머가 활성화된 모드에서만 타이머 시작
        if (this.timerEnabled) {
            this.startTimer();
        }
    }

    // ===== 4단계 실전 테스트 (8지선다) 전용 함수들 =====

    nextTestQuestion() {
        // 문제를 다 풀었는지 확인
        if (this.currentQuestion >= this.questions.length) {
            // 스피드/서바이벌 모드: 문제 다 풀면 다시 셔플해서 계속
            if (this.gameMode === 'test' && (this.testSubMode === 'speed' || this.testSubMode === 'survival')) {
                console.log('[테스트모드] 문제 다 풀음 - 다시 셔플');
                this.generateQuestions();
                this.currentQuestion = 0;
            } else {
                // 일반 모드: 게임 종료
                this.choicesContainer?.classList.add('hidden');
                this.endGame();
                return;
            }
        }

        this.currentAnswer = this.questions[this.currentQuestion];
        this.currentQuestion++;
        this.updateUI();

        // 문제 안내 텍스트
        this.questionTextEl.textContent = '이 지역의 이름은?';
        this.stepIndicatorEl.textContent = `하이라이트된 지역의 이름을 맞춰보세요`;
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';

        // 지도에 해당 지역 하이라이트
        this.renderTestMap();

        // 8지선다 생성
        this.generateTestChoices();

        // 타이머 시작
        console.log('[테스트모드] 타이머 시작 호출');
        this.startTimer();
    }

    renderTestMap() {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = this.mapContainer.clientHeight - 20;

        // 현재 문제의 시도 찾기
        const provinceName = this.currentAnswer.provinceName;
        const provinceCode = Object.keys(CODE_TO_PROVINCE).find(k => CODE_TO_PROVINCE[k] === provinceName);

        // 해당 시도의 모든 시군구 가져오기
        let allDistricts = this.municipalitiesGeo.features.filter(f =>
            f.properties.code.startsWith(provinceCode)
        );

        // 본토만 (섬 제외)
        const districts = allDistricts.filter(f => !ISLAND_DISTRICTS.includes(f.properties.name));
        const islandDistricts = allDistricts.filter(f => ISLAND_DISTRICTS.includes(f.properties.name));

        // 인천의 섬 지역이 있으면 왼쪽에 인셋 박스 공간 확보
        const hasIncheonIslands = provinceName === '인천광역시' && islandDistricts.length > 0;
        const leftMargin = hasIncheonIslands ? 340 : 20;

        // 투영 설정
        const featureCollection = { type: 'FeatureCollection', features: districts };
        this.projection = d3.geoMercator().fitExtent([[leftMargin, 20], [width - 20, height - 20]], featureCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        // 정답 지역 찾기
        const answerName = this.currentAnswer.name;
        const isIslandAnswer = ISLAND_DISTRICTS.includes(answerName);

        // 시군구 그리기
        this.mapGroup.selectAll('.district')
            .data(districts)
            .enter()
            .append('path')
            .attr('class', d => {
                const isAnswer = d.properties.name === answerName;
                return `district ${isAnswer ? 'highlighted-answer' : ''}`;
            })
            .attr('d', this.path)
            .attr('fill', d => {
                const isAnswer = d.properties.name === answerName;
                return isAnswer ? '#FF6B6B' : '#444';
            })
            .attr('stroke', '#666')
            .attr('stroke-width', 0.5);

        // 섬 지역 인셋 박스 렌더링
        const shouldShowInsets = islandDistricts.filter(island => {
            const islandName = island.properties.name;
            if (islandName === '강화군' || islandName === '옹진군') {
                return provinceName === '인천광역시';
            } else if (islandName === '울릉군') {
                return provinceName === '경상북도';
            }
            return false;
        });

        if (shouldShowInsets.length > 0) {
            this.renderTestIslandInsets(shouldShowInsets, answerName, width, height);
        }
    }

    renderTestIslandInsets(islandDistricts, answerName, width, height) {
        const insetSize = 300;
        const padding = 20;
        const gap = 15;

        const centerLeftIslands = islandDistricts.filter(island => {
            const cfg = ISLAND_INSET_CONFIG[island.properties.name];
            return cfg && (cfg.position === 'center-left-top' || cfg.position === 'center-left-bottom');
        });
        const totalCenterHeight = centerLeftIslands.length * insetSize + (centerLeftIslands.length - 1) * gap;
        const centerStartY = (height - totalCenterHeight) / 2;
        let centerLeftIndex = 0;

        islandDistricts.forEach((island, index) => {
            const islandName = island.properties.name;
            const config = ISLAND_INSET_CONFIG[islandName];
            if (!config) return;

            const isAnswer = islandName === answerName;

            let insetX, insetY;
            if (config.position === 'center-left-top' || config.position === 'center-left-bottom') {
                insetX = padding;
                insetY = centerStartY + (centerLeftIndex * (insetSize + gap));
                centerLeftIndex++;
            } else if (config.position === 'top-right') {
                insetX = width - insetSize - padding;
                insetY = padding;
            } else {
                insetX = padding + (index * (insetSize + padding));
                insetY = height - insetSize - padding - 30;
            }

            const insetGroup = this.mapGroup.append('g')
                .attr('class', 'island-inset')
                .attr('transform', `translate(${insetX}, ${insetY})`);

            insetGroup.append('rect')
                .attr('width', insetSize)
                .attr('height', insetSize)
                .attr('fill', 'rgba(0, 0, 0, 0.3)')
                .attr('stroke', isAnswer ? '#FF6B6B' : '#fff')
                .attr('stroke-width', isAnswer ? 3 : 1)
                .attr('rx', 5);

            const islandCollection = { type: 'FeatureCollection', features: [island] };
            const islandProjection = d3.geoMercator()
                .fitSize([insetSize - 20, insetSize - 30], islandCollection);
            const islandPath = d3.geoPath().projection(islandProjection);

            insetGroup.append('path')
                .datum(island)
                .attr('class', `district ${isAnswer ? 'highlighted-answer' : ''}`)
                .attr('d', islandPath)
                .attr('transform', 'translate(10, 5)')
                .attr('fill', isAnswer ? '#FF6B6B' : '#444')
                .attr('stroke', '#666')
                .attr('stroke-width', 0.5);
        });
    }

    generateTestChoices() {
        // 8개의 선택지 생성 (1개 정답 + 7개 오답)
        const correctAnswer = this.currentAnswer.name;
        const provinceName = this.currentAnswer.provinceName;

        // 같은 시도 내 다른 지역들에서 오답 후보 가져오기
        let wrongCandidates = this.allDistricts
            .filter(d => d.provinceName === provinceName && d.name !== correctAnswer)
            .map(d => d.name);

        // 같은 시도 내 후보가 부족하면 다른 시도에서 추가
        if (wrongCandidates.length < 7) {
            const otherDistricts = this.allDistricts
                .filter(d => d.provinceName !== provinceName && d.name !== correctAnswer)
                .map(d => d.name);
            this.shuffleArray(otherDistricts);
            wrongCandidates = [...wrongCandidates, ...otherDistricts];
        }

        // 중복 제거 후 셔플
        wrongCandidates = [...new Set(wrongCandidates)];
        this.shuffleArray(wrongCandidates);

        // 7개 오답 선택
        const wrongAnswers = wrongCandidates.slice(0, 7);

        // 정답과 오답 합쳐서 셔플 (정확히 8개)
        const choices = [correctAnswer, ...wrongAnswers];
        this.shuffleArray(choices);

        // 버튼 생성
        if (!this.choicesGrid) {
            console.error('choicesGrid element not found');
            return;
        }

        this.choicesGrid.innerHTML = '';
        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = `${index + 1}. ${DISPLAY_NAME_MAP[choice] || choice}`;
            btn.dataset.answer = choice;
            btn.addEventListener('click', () => this.handleTestChoice(choice, btn));
            this.choicesGrid.appendChild(btn);
        });

        console.log(`8지선다 생성 완료: ${choices.length}개 선택지`);
    }

    handleTestChoice(selectedAnswer, btnElement) {
        this.stopTimer();

        const correctAnswer = this.currentAnswer.name;
        const isCorrect = selectedAnswer === correctAnswer;

        // 모든 버튼 비활성화
        const allBtns = this.choicesGrid.querySelectorAll('.choice-btn');
        allBtns.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.answer === correctAnswer) {
                btn.classList.add('correct');
            }
        });

        if (isCorrect) {
            btnElement.classList.add('correct');
            // 콤보 증가 (최대 10)
            this.combo = Math.min(this.combo + 1, this.maxCombo);
            this.maxComboAchieved = Math.max(this.maxComboAchieved, this.combo);
            // 점수 계산: 기본 100점 + 콤보 보너스 (콤보 * 10점)
            const comboBonus = (this.combo - 1) * this.comboBonus;
            const earnedScore = this.baseScore + comboBonus;
            this.score += earnedScore;
            this.updateScore();
            this.results.push({
                question: this.currentAnswer.name,
                correct: true,
                earnedScore: earnedScore,
                combo: this.combo
            });
            const comboText = this.combo > 1 ? ` (${this.combo}콤보!)` : '';
            this.showFeedback(`정답! +${earnedScore}점${comboText}`, 'correct');
        } else {
            btnElement.classList.add('incorrect');
            // 오답 감점 (-20점, 0점 미만 방지)
            this.score = Math.max(0, this.score - this.wrongPenalty);
            // 콤보 초기화
            this.combo = 0;
            this.updateScore();

            // 서바이벌 모드: 목숨 감소
            if (this.testSubMode === 'survival') {
                this.lives--;
                this.updateUI();  // 목숨 UI 업데이트
            }

            this.results.push({
                question: this.currentAnswer.name,
                correct: false,
                userAnswer: selectedAnswer,
                penalty: this.wrongPenalty
            });
            const displayName = DISPLAY_NAME_MAP[correctAnswer] || correctAnswer;
            this.showFeedback(`오답! -${this.wrongPenalty}점 정답: ${displayName}`, 'incorrect');

            // 서바이벌 모드: 목숨이 0이면 게임 종료
            if (this.testSubMode === 'survival' && this.lives <= 0) {
                setTimeout(() => this.endGame(), 500);
                return;
            }
        }

        // 0.5초 후 다음 문제 (정답 확인 후 빠르게 진행)
        setTimeout(() => this.nextTestQuestion(), 500);
    }

    handleTestTimeout() {
        console.log('[테스트모드] 타임아웃 발생!');
        // 타임아웃 시 오답 처리
        const correctAnswer = this.currentAnswer.name;

        // 모든 버튼 비활성화 및 정답 표시
        const allBtns = this.choicesGrid.querySelectorAll('.choice-btn');
        allBtns.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.answer === correctAnswer) {
                btn.classList.add('correct');
            }
        });

        // 오답 감점 (-20점, 0점 미만 방지)
        this.score = Math.max(0, this.score - this.wrongPenalty);
        // 콤보 초기화
        this.combo = 0;
        this.updateScore();

        // 서바이벌 모드: 목숨 감소
        if (this.testSubMode === 'survival') {
            this.lives--;
            this.updateUI();  // 목숨 UI 업데이트
        }

        this.results.push({
            question: this.currentAnswer.name,
            correct: false,
            userAnswer: '시간 초과',
            penalty: this.wrongPenalty
        });

        const displayName = DISPLAY_NAME_MAP[correctAnswer] || correctAnswer;
        this.showFeedback(`시간 초과! -${this.wrongPenalty}점 정답: ${displayName}`, 'timeout');

        // 서바이벌 모드: 목숨이 0이면 게임 종료
        if (this.testSubMode === 'survival' && this.lives <= 0) {
            setTimeout(() => this.endGame(), 500);
            return;
        }

        // 0.5초 후 다음 문제 (정답 확인 후 빠르게 진행)
        setTimeout(() => this.nextTestQuestion(), 500);
    }

    // ===== EXPLORE 모드 전용 함수들 =====

    renderExploreProvinceMap() {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = this.mapContainer.clientHeight - 20;

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 줌 기능 설정
        this.setupZoom(this.svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        // 모든 시도 포함 (제주도 포함)
        const allProvinces = this.provincesGeo.features;

        // 본토만으로 지도 크기 계산 (제주도 제외) - 본토를 크게 표시
        const mainlandProvinces = allProvinces.filter(f => f.properties.name !== '제주특별자치도');
        const mainlandCollection = { type: 'FeatureCollection', features: mainlandProvinces };
        const padding = 20;
        this.projection = d3.geoMercator().fitExtent([[padding, padding], [width - padding, height - padding]], mainlandCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.mapGroup.selectAll('.province')
            .data(allProvinces)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => getProvinceColors()[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .attr('data-group', d => PROVINCE_TO_GROUP[d.properties.name] || null)
            .on('click', (event, d) => this.handleExploreRegionGroupClick(d.properties.name));

        // 시도 라벨 (showLabels 옵션 체크)
        if (this.showLabels) {
            this.mapGroup.selectAll('.region-label')
                .data(allProvinces)
                .enter()
                .append('text')
                .attr('class', 'region-label province-label')
                .attr('transform', d => `translate(${this.path.centroid(d)})`)
                .text(d => SHORT_NAMES[d.properties.name] || d.properties.name);
        }
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
        const height = this.mapContainer.clientHeight - 20;

        const groupProvinces = REGION_GROUPS[groupName];

        // 해당 그룹의 모든 시군구 가져오기
        const allDistricts = this.municipalitiesGeo.features.filter(f => {
            const provinceName = CODE_TO_PROVINCE[f.properties.code.substring(0, 2)];
            return groupProvinces.includes(provinceName);
        });

        // 본토 시군구와 섬 시군구 분리
        const mainlandDistricts = allDistricts.filter(f => !ISLAND_DISTRICTS.includes(f.properties.name));
        const islandDistricts = allDistricts.filter(f => ISLAND_DISTRICTS.includes(f.properties.name));

        // 본토 기준으로 projection 설정
        const hasIslands = islandDistricts.length > 0;
        const leftMargin = hasIslands ? 340 : 20;
        const mainlandCollection = { type: 'FeatureCollection', features: mainlandDistricts };
        this.projection = d3.geoMercator().fitExtent([[leftMargin, 20], [width - 20, height - 20]], mainlandCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 줌 기능 설정
        this.setupZoom(this.svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        this.addBackButton(() => {
            this.selectedGroup = null;
            this.feedbackEl.textContent = '';
            this.renderExploreProvinceMap();
        });

        // 시군구를 시도별 색상으로 렌더링
        this.mapGroup.selectAll('.district')
            .data(mainlandDistricts)
            .enter()
            .append('path')
            .attr('class', 'district')
            .attr('d', this.path)
            .attr('fill', d => {
                const provinceName = CODE_TO_PROVINCE[d.properties.code.substring(0, 2)];
                return getProvinceColors()[provinceName] || '#666';
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.3)
            .attr('data-name', d => d.properties.name)
            .attr('data-province', d => CODE_TO_PROVINCE[d.properties.code.substring(0, 2)])
            .on('click', (event, d) => {
                const provinceName = CODE_TO_PROVINCE[d.properties.code.substring(0, 2)];
                this.handleExploreProvinceClick(provinceName);
            });

        // 시도 라벨 (showLabels 옵션 체크)
        if (this.showLabels) {
            const provinceGroups = {};
            mainlandDistricts.forEach(d => {
                const provinceName = CODE_TO_PROVINCE[d.properties.code.substring(0, 2)];
                if (!provinceGroups[provinceName]) {
                    provinceGroups[provinceName] = [];
                }
                provinceGroups[provinceName].push(d);
            });

            Object.entries(provinceGroups).forEach(([provinceName, districts]) => {
                const centroids = districts.map(d => this.path.centroid(d)).filter(c => !isNaN(c[0]));
                if (centroids.length > 0) {
                    const avgX = d3.mean(centroids, c => c[0]);
                    const avgY = d3.mean(centroids, c => c[1]);
                    this.mapGroup.append('text')
                        .attr('class', 'region-label')
                        .attr('transform', `translate(${avgX}, ${avgY})`)
                        .text(SHORT_NAMES[provinceName] || provinceName);
                }
            });
        }

        // 섬 지역 인셋 박스 렌더링
        if (islandDistricts.length > 0) {
            this.renderFilteredRegionIslandInsets(islandDistricts, width, height);
        }
    }

    // Explore 모드: 지역 필터 선택 시 해당 권역 지도 표시
    renderExploreFilteredRegionMap(regionFilter) {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = this.mapContainer.clientHeight - 20;

        const allowedProvinces = QUIZ_FILTER_REGIONS[regionFilter];
        if (!allowedProvinces) {
            this.renderExploreProvinceMap();
            return;
        }

        // 해당 권역의 모든 시군구 가져오기
        const allDistricts = this.municipalitiesGeo.features.filter(f => {
            const provinceName = CODE_TO_PROVINCE[f.properties.code.substring(0, 2)];
            return allowedProvinces.includes(provinceName);
        });

        // 본토 시군구와 섬 시군구 분리
        const mainlandDistricts = allDistricts.filter(f => !ISLAND_DISTRICTS.includes(f.properties.name));
        const islandDistricts = allDistricts.filter(f => ISLAND_DISTRICTS.includes(f.properties.name));

        // 본토 기준으로 projection 설정 (섬 제외)
        const mainlandCollection = { type: 'FeatureCollection', features: mainlandDistricts };
        this.projection = d3.geoMercator().fitExtent([[20, 20], [width - 220, height - 20]], mainlandCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 줌 기능 설정
        this.setupZoom(this.svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        this.addBackButton(() => {
            this.selectedGroup = null;
            this.feedbackEl.textContent = '';
            this.renderExploreProvinceMap();
        });

        // 시군구를 시도별 색상으로 렌더링 (본토만)
        this.mapGroup.selectAll('.district')
            .data(mainlandDistricts)
            .enter()
            .append('path')
            .attr('class', 'district')
            .attr('d', this.path)
            .attr('fill', d => {
                const provinceName = CODE_TO_PROVINCE[d.properties.code.substring(0, 2)];
                return getProvinceColors()[provinceName] || '#666';
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.3)
            .attr('data-name', d => d.properties.name)
            .attr('data-province', d => CODE_TO_PROVINCE[d.properties.code.substring(0, 2)])
            .on('click', (event, d) => {
                const provinceName = CODE_TO_PROVINCE[d.properties.code.substring(0, 2)];
                this.handleExploreProvinceClick(provinceName);
            });

        // 시도 라벨 (showLabels 옵션 체크)
        if (this.showLabels) {
            const provinceGroups = {};
            mainlandDistricts.forEach(d => {
                const provinceName = CODE_TO_PROVINCE[d.properties.code.substring(0, 2)];
                if (!provinceGroups[provinceName]) {
                    provinceGroups[provinceName] = [];
                }
                provinceGroups[provinceName].push(d);
            });

            Object.entries(provinceGroups).forEach(([provinceName, districts]) => {
                // 해당 시도의 모든 시군구 중심점 평균으로 라벨 위치 결정
                const centroids = districts.map(d => this.path.centroid(d)).filter(c => !isNaN(c[0]));
                if (centroids.length > 0) {
                    const avgX = d3.mean(centroids, c => c[0]);
                    const avgY = d3.mean(centroids, c => c[1]);
                    this.mapGroup.append('text')
                        .attr('class', 'region-label')
                        .attr('transform', `translate(${avgX}, ${avgY})`)
                        .text(SHORT_NAMES[provinceName] || provinceName);
                }
            });
        }

        // 섬 지역 인셋 박스 렌더링
        if (islandDistricts.length > 0) {
            this.renderFilteredRegionIslandInsets(islandDistricts, width, height);
        }

        this.feedbackEl.textContent = `${regionFilter} 지역을 탐색하세요`;
    }

    // 권역 지도용 섬 인셋 박스 렌더링
    renderFilteredRegionIslandInsets(islandDistricts, width, height) {
        const insetSize = 300;
        const padding = 20;
        const gap = 15;

        // 중앙 정렬 계산
        const totalHeight = islandDistricts.length * insetSize + (islandDistricts.length - 1) * gap;
        const startY = (height - totalHeight) / 2;

        islandDistricts.forEach((island, index) => {
            const islandName = island.properties.name;
            const provinceName = CODE_TO_PROVINCE[island.properties.code.substring(0, 2)];
            const color = getProvinceColors()[provinceName] || '#666';

            const insetX = padding;
            const insetY = startY + (index * (insetSize + gap));

            const insetGroup = this.mapGroup.append('g')
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
                .fitSize([insetSize - 30, insetSize - 40], islandCollection);
            const islandPath = d3.geoPath().projection(islandProjection);

            const self = this;
            insetGroup.append('path')
                .datum(island)
                .attr('class', 'district')
                .attr('d', islandPath)
                .attr('transform', 'translate(15, 10)')
                .attr('fill', color)
                .attr('stroke', '#fff')
                .attr('stroke-width', 0.5)
                .attr('data-name', islandName)
                .on('click', function () {
                    self.handleExploreProvinceClick(provinceName);
                })
                .on('mouseenter', function () {
                    d3.select(this)
                        .attr('stroke-width', '2px')
                        .style('filter', 'brightness(1.2)');
                })
                .on('mouseleave', function () {
                    d3.select(this)
                        .attr('stroke-width', '0.5px')
                        .style('filter', null);
                });

            // 라벨 표시 (showLabels 옵션 체크)
            if (this.showLabels) {
                insetGroup.append('text')
                    .attr('class', 'district-label')
                    .attr('x', insetSize / 2)
                    .attr('y', insetSize - 8)
                    .attr('text-anchor', 'middle')
                    .text(islandName);
            }
        });
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
        const height = this.mapContainer.clientHeight - 20;

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
        this.projection = d3.geoMercator().fitExtent([[20, 20], [width - 20, height - 20]], allFeatures);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 줌 기능 설정
        this.setupZoom(this.svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

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

        this.mapGroup.selectAll('.north')
            .data(northFeatures)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', getSubRegionColors().north)
            .on('click', () => this.renderExploreDistricts(provinceName, 'north'));

        this.mapGroup.selectAll('.south')
            .data(southFeatures)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', getSubRegionColors().south)
            .on('click', () => this.renderExploreDistricts(provinceName, 'south'));

        // 북부/남부 라벨 (showLabels 옵션 체크)
        if (this.showLabels) {
            const northCenter = d3.geoCentroid({ type: 'FeatureCollection', features: northFeatures });
            const southCenter = d3.geoCentroid({ type: 'FeatureCollection', features: southFeatures });

            this.mapGroup.append('text')
                .attr('class', 'region-label')
                .attr('transform', `translate(${this.projection(northCenter)})`)
                .text(`${SHORT_NAMES[provinceName]} 북부`);

            this.mapGroup.append('text')
                .attr('class', 'region-label')
                .attr('transform', `translate(${this.projection(southCenter)})`)
                .text(`${SHORT_NAMES[provinceName]} 남부`);
        }
    }

    renderExploreDistricts(provinceName, subRegion = null) {
        // 현재 subRegion 저장 (테마 변경 시 재렌더링용)
        this.currentSubRegion = subRegion;

        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = this.mapContainer.clientHeight - 20;

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

        // 인천의 섬 지역이 있으면 왼쪽에 인셋 박스 공간 확보
        const hasIncheonIslands = provinceName === '인천광역시' && islandDistricts.length > 0;
        const leftMargin = hasIncheonIslands ? 340 : 20; // 인셋 박스 300px + 여백

        const featureCollection = { type: 'FeatureCollection', features: districts };
        this.projection = d3.geoMercator().fitExtent([[leftMargin, 20], [width - 20, height - 20]], featureCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 줌 기능 설정
        this.setupZoom(this.svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

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
        this.mapGroup.selectAll('.district')
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

        // 시 단위 라벨 (각 시마다 하나씩만) - showLabels 옵션 체크
        if (this.showLabels) {
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

                this.mapGroup.append('text')
                    .attr('class', 'district-label')
                    .attr('transform', `translate(${this.projection(center)})`)
                    .text(DISPLAY_NAME_MAP[cityName] || cityName);
            });
        }

        // 섬 지역 인셋 박스 렌더링 (Explore 모드)
        // 울릉군은 경북 북부에서만 표시, 강화군/옹진군은 인천에서 항상 표시
        const shouldShowInsets = islandDistricts.filter(island => {
            const islandName = island.properties.name;
            if (islandName === '울릉군') {
                return provinceName === '경상북도' && subRegion === 'north';
            } else if (islandName === '강화군' || islandName === '옹진군') {
                // 인천 섬 지역은 항상 인셋으로 표시
                return provinceName === '인천광역시';
            }
            return !subRegion;
        });

        if (shouldShowInsets.length > 0) {
            this.renderExploreIslandInsets(shouldShowInsets, cityColorMap, width, height, provinceName);
        }
    }

    // Explore 모드용 섬 지역 인셋 박스 렌더링
    renderExploreIslandInsets(islandDistricts, cityColorMap, width, height, provinceName) {
        const insetSize = 300; // 인셋 박스 크기 대폭 확대
        const padding = 20;
        const gap = 15; // 인셋 박스 간 간격

        // 인천 섬 지역(center-left) 개수로 전체 높이 계산하여 중앙 정렬
        const centerLeftIslands = islandDistricts.filter(island => {
            const cfg = ISLAND_INSET_CONFIG[island.properties.name];
            return cfg && (cfg.position === 'center-left-top' || cfg.position === 'center-left-bottom');
        });
        const totalCenterHeight = centerLeftIslands.length * insetSize + (centerLeftIslands.length - 1) * gap;
        const centerStartY = (height - totalCenterHeight) / 2;
        let centerLeftIndex = 0;

        islandDistricts.forEach((island, index) => {
            const islandName = island.properties.name;
            const config = ISLAND_INSET_CONFIG[islandName];
            if (!config) return;

            let insetX, insetY;
            if (config.position === 'top-left') {
                insetX = padding;
                insetY = padding;
            } else if (config.position === 'bottom-left') {
                insetX = padding;
                insetY = height - insetSize - padding - 30;
            } else if (config.position === 'top-right') {
                insetX = width - insetSize - padding;
                insetY = padding;
            } else if (config.position === 'center-left-top' || config.position === 'center-left-bottom') {
                // 왼쪽 중앙에 세로로 나란히 배치 (화면 중앙 정렬)
                insetX = padding;
                insetY = centerStartY + (centerLeftIndex * (insetSize + gap));
                centerLeftIndex++;
            } else {
                insetX = padding + (index * (insetSize + padding));
                insetY = height - insetSize - padding - 30;
            }

            const insetGroup = this.mapGroup.append('g')
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
                .on('click', function () {
                    self.feedbackEl.textContent = `${SHORT_NAMES[provinceName]} ${islandName}`;
                    self.feedbackEl.className = 'feedback correct';
                    d3.selectAll('.district').classed('selected', false);
                    d3.select(this).classed('selected', true);
                })
                .on('mouseenter', function () {
                    d3.select(this)
                        .attr('stroke-width', '2px')
                        .style('filter', 'brightness(1.2)');
                })
                .on('mouseleave', function () {
                    d3.select(this)
                        .attr('stroke-width', '0.5px')
                        .style('filter', null);
                });

            // 라벨 표시 (showLabels 옵션 체크)
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
                this.stepIndicatorEl.textContent = '경기 북부/남부를 선택하세요';
                break;
            case GameState.SELECT_DISTRICT:
                this.stepIndicatorEl.textContent = '마지막 단계: 정확한 시/군/구를 선택하세요';
                break;
        }
    }

    startTimer() {
        console.log('[타이머] 시작 - timeLimit:', this.timeLimit, 'gameMode:', this.gameMode);
        this.timeRemaining = this.timeLimit;
        this.updateTimerDisplay();

        if (this.timer) clearInterval(this.timer);

        this.timer = setInterval(() => {
            this.timeRemaining -= 100;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                console.log('[타이머] 시간 초과! handleTimeout 호출');
                clearInterval(this.timer);
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
                // 문제 타이머도 정지
                this.stopTimer();
                // 게임 종료
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

    updateSpeedTimerDisplay() {
        // 스피드 모드에서는 전체 남은 시간을 표시
        const seconds = Math.ceil(this.speedTimeRemaining / 1000);
        // 타이머 라벨을 "남은 시간"으로 표시하고 값은 초 단위
        this.timerEl.textContent = `${seconds}초`;
        const percentage = (this.speedTimeRemaining / this.speedTimeLimit) * 100;
        this.timerFillEl.style.width = `${percentage}%`;

        if (percentage <= 20) {
            this.timerFillEl.classList.add('warning');
        } else {
            this.timerFillEl.classList.remove('warning');
        }
    }

    showFeedback(message, type) {
        this.feedbackEl.textContent = message;
        this.feedbackEl.className = `feedback ${type}`;
    }

    updateTimerDisplay() {
        // 스피드 모드에서는 전체 타이머만 표시 (문제별 타이머는 표시 안 함)
        if (this.gameMode === 'test' && this.testSubMode === 'speed') {
            return;  // 스피드 모드에서는 updateSpeedTimerDisplay에서 처리
        }

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
        // 4단계 실전 테스트 모드는 별도 처리
        if (this.gameMode === 'test') {
            this.handleTestTimeout();
            return;
        }

        this.state = GameState.SHOWING_RESULT;
        const backBtn = this.mapContainer.querySelector('.back-btn');
        if (backBtn) backBtn.remove();

        // 오답 감점 (-20점, 0점 미만 방지)
        this.score = Math.max(0, this.score - this.wrongPenalty);
        // 콤보 초기화
        this.combo = 0;
        this.updateScore();

        const displayName = this.getDisplayName(this.currentAnswer.name, this.currentAnswer.provinceName);
        this.feedbackEl.textContent = `시간 초과! -${this.wrongPenalty}점 정답: ${displayName}`;
        this.feedbackEl.className = 'feedback timeout';

        this.results.push({
            question: displayName,
            correct: false,
            answer: '시간 초과',
            penalty: this.wrongPenalty
        });

        setTimeout(() => this.nextQuestion(), 2000);
    }

    // 지역 그룹 선택 지도 렌더링
    renderRegionGroupMap() {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = this.mapContainer.clientHeight - 20;

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 줌 기능 설정
        this.setupZoom(this.svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        // 모든 시도 포함 (제주도 포함)
        const allProvinces = this.provincesGeo.features;

        // 본토만으로 지도 크기 계산 (제주도 제외) - 본토를 크게 표시
        const mainlandProvinces = allProvinces.filter(f => f.properties.name !== '제주특별자치도');
        const mainlandCollection = { type: 'FeatureCollection', features: mainlandProvinces };
        this.projection = d3.geoMercator().fitExtent([[20, 20], [width - 20, height - 20]], mainlandCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.mapGroup.selectAll('.province')
            .data(allProvinces)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => getProvinceColors()[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .attr('data-group', d => PROVINCE_TO_GROUP[d.properties.name] || null)
            .on('click', (event, d) => this.handleRegionGroupClick(d.properties.name, event));

        // 시도 라벨 (showLabels 옵션 체크)
        if (this.showLabels) {
            this.mapGroup.selectAll('.region-label')
                .data(allProvinces)
                .enter()
                .append('text')
                .attr('class', 'region-label province-label')
                .attr('transform', d => `translate(${this.path.centroid(d)})`)
                .text(d => SHORT_NAMES[d.properties.name] || d.properties.name);
        }
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
        const height = this.mapContainer.clientHeight - 20;

        // 해당 그룹의 시도들만 필터링
        const groupProvinces = REGION_GROUPS[groupName];
        const filteredProvinces = this.provincesGeo.features.filter(f =>
            groupProvinces.includes(f.properties.name)
        );

        const featureCollection = { type: 'FeatureCollection', features: filteredProvinces };
        this.projection = d3.geoMercator().fitExtent([[20, 20], [width - 20, height - 20]], featureCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 줌 기능 설정
        this.setupZoom(this.svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        // 뒤로가기 버튼
        this.addBackButton(() => {
            this.selectedGroup = null;
            this.state = GameState.SELECT_REGION_GROUP;
            this.updateStepIndicator();
            this.renderRegionGroupMap();
        });

        // 그룹 내 시도 그리기
        this.mapGroup.selectAll('.province')
            .data(filteredProvinces)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => getProvinceColors()[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleGroupProvinceClick(d.properties.name, event));

        // 시도 라벨 (showLabels 옵션 체크)
        if (this.showLabels) {
            this.mapGroup.selectAll('.region-label')
                .data(filteredProvinces)
                .enter()
                .append('text')
                .attr('class', 'region-label')
                .attr('transform', d => `translate(${this.path.centroid(d)})`)
                .text(d => SHORT_NAMES[d.properties.name] || d.properties.name);
        }
    }

    // 필터 선택된 권역 지도 렌더링 (QUIZ_FILTER_REGIONS 사용)
    renderFilteredRegionMap(filterName) {
        d3.select(this.mapSvg).selectAll('*').remove();

        const width = this.mapContainer.clientWidth - 40;
        const height = this.mapContainer.clientHeight - 20;

        // QUIZ_FILTER_REGIONS에서 해당 권역의 시도들 가져오기
        const filterProvinces = QUIZ_FILTER_REGIONS[filterName];
        if (!filterProvinces) {
            console.error('Invalid filter:', filterName);
            return;
        }

        const filteredProvinces = this.provincesGeo.features.filter(f =>
            filterProvinces.includes(f.properties.name)
        );

        const featureCollection = { type: 'FeatureCollection', features: filteredProvinces };
        this.projection = d3.geoMercator().fitExtent([[20, 20], [width - 20, height - 20]], featureCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 줌 기능 설정
        this.setupZoom(this.svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        // 권역 내 시도 그리기
        this.mapGroup.selectAll('.province')
            .data(filteredProvinces)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => getProvinceColors()[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleFilteredProvinceClick(d.properties.name, event));

        // 시도 라벨 (showLabels 옵션 체크)
        if (this.showLabels) {
            this.mapGroup.selectAll('.region-label')
                .data(filteredProvinces)
                .enter()
                .append('text')
                .attr('class', 'region-label')
                .attr('transform', d => `translate(${this.path.centroid(d)})`)
                .text(d => SHORT_NAMES[d.properties.name] || d.properties.name);
        }
    }

    // 필터된 권역에서 시도 클릭 처리
    handleFilteredProvinceClick(provinceName, event) {
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
                // 콤보 증가 및 점수 계산
                this.combo = Math.min(this.combo + 1, this.maxCombo);
            this.maxComboAchieved = Math.max(this.maxComboAchieved, this.combo);
                const comboBonus = (this.combo - 1) * this.comboBonus;
                const earnedScore = this.baseScore + comboBonus;
                this.score += earnedScore;
                this.updateScore();
                this.results.push({
                    question: this.currentAnswer.name,
                    correct: true,
                    earnedScore: earnedScore,
                    combo: this.combo
                });
                const comboText = this.combo > 1 ? ` (${this.combo}콤보!)` : '';
                this.showFeedback(`정답입니다! +${earnedScore}점${comboText} ${this.getDisplayName(this.currentAnswer.name, provinceName)}`, 'correct');
                setTimeout(() => this.nextQuestion(), 1500);
                return;
            }

            // 큰 도 지역은 북부/남부 선택으로
            if (LARGE_PROVINCES.includes(provinceName)) {
                this.state = GameState.SELECT_SUBREGION;
                this.updateStepIndicator();
                setTimeout(() => this.renderSubRegionSelection(provinceName), 300);
            } else {
                // 광역시 등은 바로 시군구 선택으로
                this.state = GameState.SELECT_DISTRICT;
                this.updateStepIndicator();
                setTimeout(() => this.renderDistrictMap(provinceName), 300);
            }
        } else {
            this.handleWrongAnswer(event.target, `틀렸습니다! ${SHORT_NAMES[correctProvince]}을(를) 선택하세요.`);
        }
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
                // 콤보 증가 및 점수 계산
                this.combo = Math.min(this.combo + 1, this.maxCombo);
            this.maxComboAchieved = Math.max(this.maxComboAchieved, this.combo);
                const comboBonus = (this.combo - 1) * this.comboBonus;
                const earnedScore = this.baseScore + comboBonus;
                this.score += earnedScore;
                this.updateScore();
                this.results.push({
                    question: this.currentAnswer.name,
                    correct: true,
                    earnedScore: earnedScore,
                    combo: this.combo
                });
                const comboText = this.combo > 1 ? ` (${this.combo}콤보!)` : '';
                this.showFeedback(`정답입니다! +${earnedScore}점${comboText} ${this.getDisplayName(this.currentAnswer.name, provinceName)}`, 'correct');
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
        const height = this.mapContainer.clientHeight - 20;

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 줌 기능 설정
        this.setupZoom(this.svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        // 모든 시도 포함 (제주도 포함)
        const allProvinces = this.provincesGeo.features;

        // 본토 기준으로 지도 크기 조정 (제주도 제외하여 본토가 더 크게 보이도록)
        const mainlandProvinces = allProvinces.filter(f => f.properties.name !== '제주특별자치도');
        const mainlandCollection = { type: 'FeatureCollection', features: mainlandProvinces };
        this.projection = d3.geoMercator().fitExtent([[20, 20], [width - 20, height - 20]], mainlandCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.mapGroup.selectAll('.province')
            .data(allProvinces)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', d => getProvinceColors()[d.properties.name] || '#666')
            .attr('data-name', d => d.properties.name)
            .on('click', (event, d) => this.handleProvinceClick(d.properties.name, event));

        // 시도 라벨 (showLabels 옵션 체크)
        if (this.showLabels) {
            this.mapGroup.selectAll('.region-label')
                .data(allProvinces)
                .enter()
                .append('text')
                .attr('class', 'region-label')
                .attr('transform', d => `translate(${this.path.centroid(d)})`)
                .text(d => SHORT_NAMES[d.properties.name] || d.properties.name);
        }
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
                // 콤보 증가 및 점수 계산
                this.combo = Math.min(this.combo + 1, this.maxCombo);
            this.maxComboAchieved = Math.max(this.maxComboAchieved, this.combo);
                const comboBonus = (this.combo - 1) * this.comboBonus;
                const earnedScore = this.baseScore + comboBonus;
                this.score += earnedScore;
                this.updateScore();
                this.results.push({
                    question: this.currentAnswer.name,
                    correct: true,
                    earnedScore: earnedScore,
                    combo: this.combo
                });
                const comboText = this.combo > 1 ? ` (${this.combo}콤보!)` : '';
                this.showFeedback(`정답입니다! +${earnedScore}점${comboText} ${this.getDisplayName(this.currentAnswer.name, provinceName)}`, 'correct');
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
        const height = this.mapContainer.clientHeight - 20;

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
        this.projection = d3.geoMercator().fitExtent([[20, 20], [width - 20, height - 20]], allFeatures);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 줌 기능 설정
        this.setupZoom(this.svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

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
        this.mapGroup.selectAll('.north')
            .data(northFeatures)
            .enter()
            .append('path')
            .attr('class', 'province')
            .attr('d', this.path)
            .attr('fill', getSubRegionColors().north)
            .on('click', (event) => this.handleSubRegionClick('north', event));

        // 남부 그리기
        this.mapGroup.selectAll('.south')
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

            this.mapGroup.append('text')
                .attr('class', 'region-label subregion-label')
                .attr('transform', `translate(${this.projection(northCenter)})`)
                .text(`${SHORT_NAMES[provinceName]} 북부`);

            this.mapGroup.append('text')
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
        const height = this.mapContainer.clientHeight - 20;

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

        // 인천의 섬 지역이 있으면 왼쪽에 인셋 박스 공간 확보
        const hasIncheonIslands = provinceName === '인천광역시' && islandDistricts.length > 0;
        const leftMargin = hasIncheonIslands ? 340 : 20;

        // 투영 설정 (본토 기준)
        const featureCollection = { type: 'FeatureCollection', features: districts };
        this.projection = d3.geoMercator().fitExtent([[leftMargin, 20], [width - 20, height - 20]], featureCollection);
        this.path = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.mapSvg)
            .attr('width', width)
            .attr('height', height);

        // 줌 기능 설정
        this.setupZoom(this.svg, width, height);

        // 지도 그룹 생성 (줌 적용 대상)
        this.mapGroup = this.svg.append('g').attr('class', 'map-group');

        // 뒤로가기 버튼
        this.addBackButton(() => {
            if (LARGE_PROVINCES.includes(provinceName) && subRegion) {
                this.state = GameState.SELECT_SUBREGION;
                this.updateStepIndicator();
                this.renderSubRegionSelection(provinceName);
            } else if (this.selectedRegionFilter && this.selectedRegionFilter !== 'all') {
                // 필터 선택된 권역이면 필터 지도로 돌아가기
                this.state = GameState.SELECT_PROVINCE;
                this.selectedProvince = null;
                this.updateStepIndicator();
                this.renderFilteredRegionMap(this.selectedRegionFilter);
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
        this.mapGroup.selectAll('.district')
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

                this.mapGroup.append('text')
                    .attr('class', 'district-label')
                    .attr('transform', `translate(${this.projection(center)})`)
                    .text(DISPLAY_NAME_MAP[cityName] || cityName);
            });
        }

        // 섬 지역 인셋 박스 렌더링
        // 울릉군은 경북 북부에서만 표시, 옹진군은 인천에서 항상 표시
        const shouldShowInsets = islandDistricts.filter(island => {
            const islandName = island.properties.name;
            if (islandName === '울릉군') {
                // 경북에서 북부 선택 시에만 표시
                return provinceName === '경상북도' && subRegion === 'north';
            } else if (islandName === '강화군' || islandName === '옹진군') {
                // 인천 섬 지역은 인천에서 항상 표시
                return provinceName === '인천광역시';
            }
            return !subRegion; // 기본적으로 subRegion 없을 때만
        });

        if (shouldShowInsets.length > 0) {
            this.renderIslandInsets(shouldShowInsets, cityColorMap, width, height);
        }
    }

    // 섬 지역 인셋 박스 렌더링
    renderIslandInsets(islandDistricts, cityColorMap, width, height) {
        const insetSize = 300; // 인셋 박스 크기 대폭 확대
        const padding = 20;
        const gap = 15; // 인셋 박스 간 간격

        // 인천 섬 지역(center-left) 개수로 전체 높이 계산하여 중앙 정렬
        const centerLeftIslands = islandDistricts.filter(island => {
            const cfg = ISLAND_INSET_CONFIG[island.properties.name];
            return cfg && (cfg.position === 'center-left-top' || cfg.position === 'center-left-bottom');
        });
        const totalCenterHeight = centerLeftIslands.length * insetSize + (centerLeftIslands.length - 1) * gap;
        const centerStartY = (height - totalCenterHeight) / 2;
        let centerLeftIndex = 0;

        islandDistricts.forEach((island, index) => {
            const islandName = island.properties.name;
            const config = ISLAND_INSET_CONFIG[islandName];
            if (!config) return;

            // 인셋 위치 결정
            let insetX, insetY;
            if (config.position === 'top-left') {
                insetX = padding;
                insetY = padding;
            } else if (config.position === 'bottom-left') {
                insetX = padding;
                insetY = height - insetSize - padding - 30;
            } else if (config.position === 'top-right') {
                insetX = width - insetSize - padding;
                insetY = padding;
            } else if (config.position === 'center-left-top' || config.position === 'center-left-bottom') {
                // 왼쪽 중앙에 세로로 나란히 배치 (화면 중앙 정렬)
                insetX = padding;
                insetY = centerStartY + (centerLeftIndex * (insetSize + gap));
                centerLeftIndex++;
            } else {
                insetX = padding + (index * (insetSize + padding));
                insetY = height - insetSize - padding - 30;
            }

            // 인셋 그룹 생성
            const insetGroup = this.mapGroup.append('g')
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
                .on('mouseenter', function () {
                    d3.select(this)
                        .attr('stroke-width', '2px')
                        .style('filter', 'brightness(1.2)');
                })
                .on('mouseleave', function () {
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

    // 줌 기능 설정
    setupZoom(svg, width, height) {
        this.zoom = d3.zoom()
            .scaleExtent([0.5, 8])  // 축소(0.5배)부터 확대(8배)까지 가능
            .on('zoom', (event) => {
                if (this.mapGroup) {
                    this.mapGroup.attr('transform', event.transform);
                }
            });

        svg.call(this.zoom)
            .on('dblclick.zoom', null);

        this.addZoomResetButton(svg, width);
    }

    // 줌 리셋 버튼 추가
    addZoomResetButton(svg, width) {
        const resetBtn = svg.append('g')
            .attr('class', 'zoom-reset-btn')
            .attr('transform', `translate(${width - 40}, 10)`)
            .style('cursor', 'pointer')
            .on('click', () => {
                svg.transition()
                    .duration(300)
                    .call(this.zoom.transform, d3.zoomIdentity);
            });

        resetBtn.append('rect')
            .attr('width', 30)
            .attr('height', 30)
            .attr('rx', 5)
            .attr('fill', 'rgba(0, 0, 0, 0.5)')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1);

        resetBtn.append('text')
            .attr('x', 15)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '16px')
            .text('⟲');
    }

    handleDistrictClick(districtName, event) {
        if (this.state !== GameState.SELECT_DISTRICT) return;

        const correctDistrict = this.currentAnswer.name;
        const displayName = this.getDisplayName(this.currentAnswer.name, this.currentAnswer.provinceName);

        // 클릭한 지역을 시 단위로 변환해서 비교 (예: "수원시장안구" -> "수원시")
        let clickedCity = this.extractCityName(districtName);
        // TopoJSON 데이터명 → 표시명 변환 (예: 남구 → 미추홀구)
        clickedCity = DISPLAY_NAME_MAP[clickedCity] || clickedCity;
        const isCorrect = (clickedCity === correctDistrict) || (districtName === correctDistrict);

        // 연습 모드인지 확인
        const isPracticeMode = this.gameMode === 'practice' || this.gameMode === 'practice-blind';

        if (isCorrect) {
            clearInterval(this.timer);
            const backBtn = this.mapContainer.querySelector('.back-btn');
            if (backBtn) backBtn.remove();

            d3.select(event.target).classed('correct', true);

            // 콤보 증가 및 점수 계산
            this.combo = Math.min(this.combo + 1, this.maxCombo);
            this.maxComboAchieved = Math.max(this.maxComboAchieved, this.combo);
            const comboBonus = (this.combo - 1) * this.comboBonus;
            const earnedScore = this.baseScore + comboBonus;
            this.score += earnedScore;
            this.updateUI();

            const comboText = this.combo > 1 ? ` (${this.combo}콤보!)` : '';
            this.feedbackEl.textContent = `정답입니다! +${earnedScore}점${comboText}`;
            this.feedbackEl.className = 'feedback correct';

            // 연습 모드에서 여러 번 틀린 경우 결과 기록 업데이트
            if (isPracticeMode && this.practiceAttempts > 0) {
                this.results.push({
                    question: displayName,
                    correct: false,
                    answer: `${this.practiceAttempts}번 틀린 후 정답`
                });
            } else {
                this.results.push({
                    question: displayName,
                    correct: true,
                    answer: districtName,
                    earnedScore: earnedScore,
                    combo: this.combo
                });
            }

            this.practiceAttempts = 0; // 초기화
            this.state = GameState.SHOWING_RESULT;
            setTimeout(() => this.nextQuestion(), 2000);
        } else {
            d3.select(event.target).classed('incorrect', true);

            if (isPracticeMode) {
                // 연습 모드: 틀려도 계속 클릭 가능, 감점 없음
                this.practiceAttempts = (this.practiceAttempts || 0) + 1;
                this.feedbackEl.textContent = `틀렸습니다! 다시 찾아보세요.`;
                this.feedbackEl.className = 'feedback incorrect';
                // state를 유지하여 계속 클릭 가능
            } else {
                // 퀴즈/테스트 모드: 감점 및 콤보 초기화
                clearInterval(this.timer);
                const backBtn = this.mapContainer.querySelector('.back-btn');
                if (backBtn) backBtn.remove();

                // 오답 감점 (-20점, 0점 미만 방지)
                this.score = Math.max(0, this.score - this.wrongPenalty);
                // 콤보 초기화
                this.combo = 0;
                this.updateScore();

                this.feedbackEl.textContent = `틀렸습니다! -${this.wrongPenalty}점 정답: ${displayName}`;
                this.feedbackEl.className = 'feedback incorrect';

                this.results.push({
                    question: displayName,
                    correct: false,
                    answer: districtName,
                    penalty: this.wrongPenalty
                });

                // 정답 하이라이트 (해당 시의 모든 구를 하이라이트)
                d3.selectAll('.district')
                    .filter(d => {
                        const name = d.properties.name;
                        const cityName = this.extractCityName(name);
                        return name === correctDistrict || cityName === correctDistrict;
                    })
                    .classed('highlight', true);

                this.state = GameState.SHOWING_RESULT;
                setTimeout(() => this.nextQuestion(), 2000);
            }
        }
    }

    handleWrongAnswer(element, message) {
        // 연습 모드인지 확인
        const isPracticeMode = this.gameMode === 'practice' || this.gameMode === 'practice-blind';

        if (element) {
            d3.select(element).classed('incorrect', true);
        }

        if (isPracticeMode) {
            // 연습 모드: 틀려도 계속 클릭 가능, 감점 없음
            this.practiceAttempts = (this.practiceAttempts || 0) + 1;
            this.feedbackEl.textContent = message.replace('틀렸습니다!', '틀렸습니다!').replace('가 정답입니다.', '을(를) 선택하세요.');
            this.feedbackEl.className = 'feedback incorrect';
            // state를 유지하여 계속 클릭 가능
        } else {
            // 퀴즈/테스트 모드: 감점 및 콤보 초기화
            clearInterval(this.timer);
            const backBtn = this.mapContainer.querySelector('.back-btn');
            if (backBtn) backBtn.remove();

            // 오답 감점 (-20점, 0점 미만 방지)
            this.score = Math.max(0, this.score - this.wrongPenalty);
            // 콤보 초기화
            this.combo = 0;
            this.updateScore();

            this.feedbackEl.textContent = `${message} -${this.wrongPenalty}점`;
            this.feedbackEl.className = 'feedback incorrect';

            const displayName = this.getDisplayName(this.currentAnswer.name, this.currentAnswer.provinceName);
            this.results.push({
                question: displayName,
                correct: false,
                answer: '잘못된 선택',
                penalty: this.wrongPenalty
            });

            this.state = GameState.SHOWING_RESULT;
            setTimeout(() => this.nextQuestion(), 2000);
        }
    }

    endGame() {
        clearInterval(this.timer);
        this.stopSpeedTimer();  // 스피드 모드 타이머 정리

        // 4단계 test-mode 정리
        document.body.classList.remove('test-mode');
        this.questionAreaEl?.classList.remove('hidden');
        if (this.questionAreaEl) {
            this.questionAreaEl.style.display = '';
        }

        this.showScreen('result');
        this.finalScoreEl.textContent = this.score;

        const correctCount = this.results.filter(r => r.correct).length;
        const totalAnswered = this.results.length;

        // 게임 통계 요약
        let html = '<div class="game-stats">';

        // 4단계 테스트 모드: 서브모드별 다른 통계 표시
        if (this.gameMode === 'test' && this.testSubMode === 'speed') {
            // 스피드 모드 결과
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
        } else if (this.gameMode === 'test' && this.testSubMode === 'survival') {
            // 서바이벌 모드 결과
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
            // 기존 모드 결과 표시
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
            const className = result.correct ? 'correct-result' : 'incorrect-result';
            const icon = result.correct ? '✓' : '✗';
            let scoreText = '';
            if (result.earnedScore) {
                scoreText = ` (+${result.earnedScore}점)`;
            } else if (result.penalty) {
                scoreText = ` (-${result.penalty}점)`;
            }
            html += `
                <div class="result-item ${className}">
                    <span>${index + 1}. ${result.question}</span>
                    <span>${icon}${scoreText}</span>
                </div>
            `;
        });

        this.resultDetailsEl.innerHTML = html;
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new KoreaMapQuiz();
});
