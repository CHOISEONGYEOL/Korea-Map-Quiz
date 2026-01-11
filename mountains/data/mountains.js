// 100대 산 데이터
// 지역 구분: 서울/인천/경기, 강원, 대전/세종/충남, 충북, 대구/경북, 부산/울산/경남, 전북, 광주/전남, 제주

const MOUNTAIN_REGIONS = {
    '서울/인천/경기': {
        code: 'capital',
        subRegions: ['서울', '인천', '경기북부', '경기남부']
    },
    '강원': {
        code: 'gangwon',
        subRegions: ['영서북부', '영서남부', '영동']
    },
    '대전/세종/충남': {
        code: 'chungnam',
        subRegions: null
    },
    '충북': {
        code: 'chungbuk',
        subRegions: null
    },
    '대구/경북': {
        code: 'gyeongbuk',
        subRegions: ['대구', '경북북부', '경북남부']
    },
    '부산/울산/경남': {
        code: 'gyeongnam',
        subRegions: ['부산/울산', '경남동부', '경남서부']
    },
    '전북': {
        code: 'jeonbuk',
        subRegions: null
    },
    '광주/전남': {
        code: 'jeonnam',
        subRegions: null
    },
    '제주': {
        code: 'jeju',
        subRegions: null
    }
};

// 100대 산 목록
// ★: 산림청 100대 명산
// ✦: 블랙야크 100대 명산
const MOUNTAINS = [
    // ===== 서울/인천/경기 (22개) =====
    { id: 1, name: '감악산', region: '서울/인천/경기', subRegion: '경기북부', province: '경기도', city: '파주시', height: 675, rank: { forest: 1, blackyak: 1, sanha: 1, wolgan: 1 }, featured: true, lat: 37.9597, lng: 126.9567 },
    { id: 2, name: '관악산', region: '서울/인천/경기', subRegion: '서울', province: '서울특별시', city: '관악구', height: 632, rank: { forest: 2, blackyak: 2, sanha: 2, wolgan: 2 }, featured: true, lat: 37.4431, lng: 126.9642 },
    { id: 3, name: '광교산', region: '서울/인천/경기', subRegion: '경기남부', province: '경기도', city: '수원시', height: 582, rank: { blackyak: 3 }, featured: false, lat: 37.3125, lng: 127.0153 },
    { id: 4, name: '검단산', region: '서울/인천/경기', subRegion: '경기남부', province: '경기도', city: '하남시', height: 657, rank: { blackyak: 4 }, featured: false, lat: 37.5067, lng: 127.1875 },
    { id: 5, name: '고려산', region: '서울/인천/경기', subRegion: '인천', province: '인천광역시', city: '강화군', height: 436, rank: { blackyak: 3 }, featured: false, lat: 37.7208, lng: 126.4292 },
    { id: 6, name: '남한산', region: '서울/인천/경기', subRegion: '경기남부', province: '경기도', city: '광주시', height: 522, rank: { blackyak: 5, wolgan: 4 }, featured: false, lat: 37.4789, lng: 127.1792 },
    { id: 7, name: '도봉산', region: '서울/인천/경기', subRegion: '서울', province: '서울특별시', city: '도봉구', height: 740, rank: { forest: 3, blackyak: 3, sanha: 6, wolgan: 5 }, featured: true, lat: 37.6978, lng: 127.0153 },
    { id: 8, name: '마니산', region: '서울/인천/경기', subRegion: '인천', province: '인천광역시', city: '강화군', height: 469, rank: { forest: 4, blackyak: 4, sanha: 7, wolgan: 6 }, featured: true, lat: 37.6125, lng: 126.4306 },
    { id: 9, name: '명지산', region: '서울/인천/경기', subRegion: '경기북부', province: '경기도', city: '가평군', height: 1267, rank: { forest: 5, blackyak: 5, sanha: 8, wolgan: 7 }, featured: true, lat: 37.9583, lng: 127.3889 },
    { id: 10, name: '백운산', region: '서울/인천/경기', subRegion: '경기남부', province: '경기도', city: '포천시', height: 904, rank: { forest: 6, sanha: 9 }, featured: true, lat: 37.9361, lng: 127.3125 },
    { id: 11, name: '북한산', region: '서울/인천/경기', subRegion: '서울', province: '서울특별시', city: '강북구', height: 837, rank: { forest: 7, blackyak: 6, sanha: 10, wolgan: 8 }, featured: true, lat: 37.6597, lng: 126.9875 },
    { id: 12, name: '불암산', region: '서울/인천/경기', subRegion: '서울', province: '서울특별시', city: '노원구', height: 508, rank: { blackyak: 11 }, featured: false, lat: 37.6528, lng: 127.0722 },
    { id: 13, name: '서리산', region: '서울/인천/경기', subRegion: '경기북부', province: '경기도', city: '남양주시', height: 832, rank: { sanha: 9 }, featured: false, lat: 37.7736, lng: 127.2153 },
    { id: 14, name: '수락산', region: '서울/인천/경기', subRegion: '서울', province: '서울특별시', city: '노원구', height: 638, rank: { blackyak: 7, sanha: 12, wolgan: 10 }, featured: true, lat: 37.6875, lng: 127.0667 },
    { id: 15, name: '수리산', region: '서울/인천/경기', subRegion: '경기남부', province: '경기도', city: '안양시', height: 475, rank: { blackyak: 13 }, featured: false, lat: 37.3736, lng: 126.9208 },
    { id: 16, name: '소요산', region: '서울/인천/경기', subRegion: '경기북부', province: '경기도', city: '동두천시', height: 587, rank: { forest: 8, blackyak: 8, sanha: 14, wolgan: 11 }, featured: true, lat: 37.9458, lng: 127.0792 },
    { id: 17, name: '용문산', region: '서울/인천/경기', subRegion: '경기남부', province: '경기도', city: '양평군', height: 1157, rank: { forest: 9, blackyak: 9, sanha: 15, wolgan: 12 }, featured: true, lat: 37.5375, lng: 127.5750 },
    { id: 18, name: '운악산', region: '서울/인천/경기', subRegion: '경기북부', province: '경기도', city: '포천시', height: 936, rank: { forest: 10, blackyak: 10, sanha: 16 }, featured: true, lat: 37.9125, lng: 127.2583 },
    { id: 19, name: '유명산', region: '서울/인천/경기', subRegion: '경기남부', province: '경기도', city: '가평군', height: 862, rank: { forest: 11, blackyak: 11, sanha: 17 }, featured: true, lat: 37.5792, lng: 127.4958 },
    { id: 20, name: '연인산', region: '서울/인천/경기', subRegion: '경기북부', province: '경기도', city: '가평군', height: 1068, rank: { blackyak: 12, sanha: 18, wolgan: 13 }, featured: true, lat: 37.8208, lng: 127.4417 },
    { id: 21, name: '천마산', region: '서울/인천/경기', subRegion: '경기남부', province: '경기도', city: '남양주시', height: 812, rank: { forest: 12, blackyak: 13, sanha: 19, wolgan: 14 }, featured: true, lat: 37.6292, lng: 127.2625 },
    { id: 22, name: '청계산', region: '서울/인천/경기', subRegion: '서울', province: '서울특별시', city: '서초구', height: 618, rank: { forest: 14, sanha: 20, wolgan: 15 }, featured: true, lat: 37.4417, lng: 127.0500 },
    { id: 23, name: '축령산', region: '서울/인천/경기', subRegion: '경기남부', province: '경기도', city: '남양주시', height: 879, rank: { forest: 13, sanha: 21 }, featured: false, lat: 37.7042, lng: 127.3167 },
    { id: 24, name: '화악산', region: '서울/인천/경기', subRegion: '경기북부', province: '경기도', city: '가평군', height: 1468, rank: { forest: 14, blackyak: 15, sanha: 22, wolgan: 16 }, featured: true, lat: 37.9597, lng: 127.5125 },

    // ===== 강원 (20개) =====
    { id: 25, name: '가리산', region: '강원', subRegion: '영서남부', province: '강원특별자치도', city: '홍천군', height: 1051, rank: { forest: 15, blackyak: 16, sanha: 23, wolgan: 17 }, featured: true, lat: 37.7792, lng: 128.0625 },
    { id: 26, name: '가리왕산', region: '강원', subRegion: '영서남부', province: '강원특별자치도', city: '정선군', height: 1561, rank: { forest: 16, blackyak: 17, sanha: 24, wolgan: 18 }, featured: true, lat: 37.4625, lng: 128.5625 },
    { id: 27, name: '감악산', region: '강원', subRegion: '영서북부', province: '강원특별자치도', city: '원주시', height: 930, rank: { wolgan: 18 }, featured: false, lat: 37.3708, lng: 127.9958 },
    { id: 28, name: '계방산', region: '강원', subRegion: '영서남부', province: '강원특별자치도', city: '평창군', height: 1577, rank: { forest: 17, blackyak: 19, sanha: 25, wolgan: 19 }, featured: true, lat: 37.7292, lng: 128.4875 },
    { id: 29, name: '공작산', region: '강원', subRegion: '영서북부', province: '강원특별자치도', city: '홍천군', height: 887, rank: { forest: 18 }, featured: false, lat: 37.7736, lng: 127.9042 },
    { id: 30, name: '금대봉', region: '강원', subRegion: '영동', province: '강원특별자치도', city: '태백시', height: 1418, rank: { blackyak: 20 }, featured: false, lat: 37.1375, lng: 128.9458 },
    { id: 31, name: '대암산', region: '강원', subRegion: '영서북부', province: '강원특별자치도', city: '인제군', height: 1304, rank: { forest: 19, wolgan: 21 }, featured: false, lat: 38.1125, lng: 128.1208 },
    { id: 32, name: '덕항산', region: '강원', subRegion: '영동', province: '강원특별자치도', city: '삼척시', height: 1071, rank: { forest: 20, blackyak: 20 }, featured: false, lat: 37.2417, lng: 129.0542 },
    { id: 33, name: '두타산', region: '강원', subRegion: '영동', province: '강원특별자치도', city: '동해시', height: 1353, rank: { forest: 21, blackyak: 21, sanha: 26, wolgan: 22 }, featured: true, lat: 37.3833, lng: 129.0125 },
    { id: 34, name: '마대산', region: '강원', subRegion: '영서남부', province: '강원특별자치도', city: '정선군', height: 1052, rank: { wolgan: 23 }, featured: false, lat: 37.3292, lng: 128.7208 },
    { id: 35, name: '민둥산', region: '강원', subRegion: '영서남부', province: '강원특별자치도', city: '정선군', height: 1119, rank: { sanha: 27, wolgan: 24 }, featured: false, lat: 37.3958, lng: 128.7583 },
    { id: 36, name: '석화산', region: '강원', subRegion: '영서남부', province: '강원특별자치도', city: '정선군', height: 1190, rank: { wolgan: 25 }, featured: false, lat: 37.3583, lng: 128.8375 },
    { id: 37, name: '명성산', region: '강원', subRegion: '영서북부', province: '강원특별자치도', city: '철원군', height: 923, rank: { forest: 22, sanha: 28, wolgan: 26 }, featured: true, lat: 38.0958, lng: 127.3375 },
    { id: 38, name: '선자령', region: '강원', subRegion: '영동', province: '강원특별자치도', city: '평창군', height: 1157, rank: { sanha: 29 }, featured: false, lat: 37.6917, lng: 128.7292 },
    { id: 39, name: '방태산', region: '강원', subRegion: '영서북부', province: '강원특별자치도', city: '인제군', height: 1444, rank: { forest: 23, blackyak: 22, sanha: 30 }, featured: true, lat: 37.9042, lng: 128.3583 },
    { id: 40, name: '백덕산', region: '강원', subRegion: '영서남부', province: '강원특별자치도', city: '평창군', height: 1350, rank: { forest: 24, blackyak: 23, wolgan: 27 }, featured: true, lat: 37.3917, lng: 128.3042 },
    { id: 41, name: '백운산', region: '강원', subRegion: '영서남부', province: '강원특별자치도', city: '원주시', height: 1087, rank: { forest: 25, blackyak: 24 }, featured: false, lat: 37.2042, lng: 127.9875 },
    { id: 42, name: '삼악산', region: '강원', subRegion: '영서북부', province: '강원특별자치도', city: '춘천시', height: 654, rank: { forest: 26, blackyak: 25, sanha: 31, wolgan: 28 }, featured: true, lat: 37.8708, lng: 127.7250 },
    { id: 43, name: '설악산', region: '강원', subRegion: '영동', province: '강원특별자치도', city: '속초시', height: 1708, rank: { forest: 27, blackyak: 26, sanha: 32, wolgan: 29 }, featured: true, lat: 38.1194, lng: 128.4653 },
    { id: 44, name: '오대산', region: '강원', subRegion: '영동', province: '강원특별자치도', city: '평창군', height: 1563, rank: { forest: 28, blackyak: 27, sanha: 33, wolgan: 30 }, featured: true, lat: 37.7972, lng: 128.5431 },
    { id: 45, name: '노인봉', region: '강원', subRegion: '영동', province: '강원특별자치도', city: '강릉시', height: 1338, rank: { blackyak: 28, wolgan: 31 }, featured: false, lat: 37.8125, lng: 128.5708 },
    { id: 46, name: '오봉산', region: '강원', subRegion: '영서북부', province: '강원특별자치도', city: '춘천시', height: 779, rank: { forest: 29, blackyak: 29, sanha: 34 }, featured: true, lat: 37.9208, lng: 127.8375 },
    { id: 47, name: '용화산', region: '강원', subRegion: '영서북부', province: '강원특별자치도', city: '화천군', height: 878, rank: { forest: 30, blackyak: 30 }, featured: false, lat: 38.0042, lng: 127.5375 },
    { id: 48, name: '점봉산', region: '강원', subRegion: '영서북부', province: '강원특별자치도', city: '인제군', height: 1424, rank: { forest: 31, wolgan: 32 }, featured: false, lat: 38.0375, lng: 128.4292 },
    { id: 49, name: '치악산', region: '강원', subRegion: '영서남부', province: '강원특별자치도', city: '원주시', height: 1288, rank: { forest: 32, blackyak: 31, sanha: 35, wolgan: 33 }, featured: true, lat: 37.3708, lng: 128.0542 },
    { id: 50, name: '태백산', region: '강원', subRegion: '영동', province: '강원특별자치도', city: '태백시', height: 1567, rank: { forest: 33, blackyak: 32, sanha: 36, wolgan: 34 }, featured: true, lat: 37.0958, lng: 128.9153 },
    { id: 51, name: '태화산', region: '강원', subRegion: '영서남부', province: '강원특별자치도', city: '영월군', height: 1027, rank: { forest: 34, blackyak: 33 }, featured: false, lat: 37.2042, lng: 128.3542 },
    { id: 52, name: '팔봉산', region: '강원', subRegion: '영서북부', province: '강원특별자치도', city: '홍천군', height: 328, rank: { forest: 35, blackyak: 34, sanha: 37, wolgan: 35 }, featured: true, lat: 37.7333, lng: 127.8208 },
    { id: 53, name: '함백산', region: '강원', subRegion: '영동', province: '강원특별자치도', city: '정선군', height: 1573, rank: { blackyak: 35, wolgan: 36 }, featured: false, lat: 37.1708, lng: 128.9042 },

    // ===== 대전/세종/충남 (10개) =====
    { id: 54, name: '가야산', region: '대전/세종/충남', subRegion: null, province: '충청남도', city: '서산시', height: 678, rank: { forest: 36, sanha: 38 }, featured: false, lat: 36.7292, lng: 126.6625 },
    { id: 55, name: '광덕산', region: '대전/세종/충남', subRegion: null, province: '충청남도', city: '천안시', height: 699, rank: { sanha: 37 }, featured: false, lat: 36.7708, lng: 127.0542 },
    { id: 56, name: '계룡산', region: '대전/세종/충남', subRegion: null, province: '충청남도', city: '계룡시', height: 845, rank: { forest: 36, blackyak: 38, sanha: 39, wolgan: 37 }, featured: true, lat: 36.3417, lng: 127.2042 },
    { id: 57, name: '대둔산', region: '대전/세종/충남', subRegion: null, province: '충청남도', city: '논산시', height: 878, rank: { forest: 37, blackyak: 39, sanha: 40, wolgan: 38 }, featured: true, lat: 36.1208, lng: 127.3208 },
    { id: 58, name: '덕숭산', region: '대전/세종/충남', subRegion: null, province: '충청남도', city: '예산군', height: 495, rank: { forest: 38, sanha: 41, wolgan: 39 }, featured: true, lat: 36.6792, lng: 126.6458 },
    { id: 59, name: '서대산', region: '대전/세종/충남', subRegion: null, province: '충청남도', city: '금산군', height: 904, rank: { forest: 39, sanha: 42, wolgan: 40 }, featured: true, lat: 36.1958, lng: 127.4542 },
    { id: 60, name: '오서산', region: '대전/세종/충남', subRegion: null, province: '충청남도', city: '보령시', height: 791, rank: { blackyak: 40, sanha: 43 }, featured: false, lat: 36.4208, lng: 126.6833 },
    { id: 61, name: '용봉산', region: '대전/세종/충남', subRegion: null, province: '충청남도', city: '홍성군', height: 381, rank: { blackyak: 41, sanha: 44 }, featured: false, lat: 36.5958, lng: 126.6875 },
    { id: 62, name: '진악산', region: '대전/세종/충남', subRegion: null, province: '충청남도', city: '금산군', height: 732, rank: { wolgan: 41 }, featured: false, lat: 36.1083, lng: 127.4833 },
    { id: 63, name: '칠갑산', region: '대전/세종/충남', subRegion: null, province: '충청남도', city: '청양군', height: 561, rank: { forest: 40, blackyak: 42, sanha: 45, wolgan: 42 }, featured: true, lat: 36.4083, lng: 126.8625 },

    // ===== 충북 (12개) =====
    { id: 64, name: '구병산', region: '충북', subRegion: null, province: '충청북도', city: '보은군', height: 876, rank: { forest: 41, blackyak: 43, sanha: 46 }, featured: true, lat: 36.5208, lng: 127.7792 },
    { id: 65, name: '금수산', region: '충북', subRegion: null, province: '충청북도', city: '제천시', height: 1016, rank: { forest: 42, blackyak: 44, sanha: 47 }, featured: true, lat: 37.0042, lng: 128.1542 },
    { id: 66, name: '도락산', region: '충북', subRegion: null, province: '충청북도', city: '단양군', height: 964, rank: { forest: 43, blackyak: 45, sanha: 48 }, featured: true, lat: 36.9792, lng: 128.2708 },
    { id: 67, name: '민주지산', region: '충북', subRegion: null, province: '충청북도', city: '영동군', height: 1242, rank: { forest: 44, blackyak: 46, sanha: 49, wolgan: 43 }, featured: true, lat: 36.0542, lng: 127.8958 },
    { id: 68, name: '소백산', region: '충북', subRegion: null, province: '충청북도', city: '단양군', height: 1440, rank: { forest: 45, blackyak: 47, sanha: 50, wolgan: 44 }, featured: true, lat: 36.9542, lng: 128.4833 },
    { id: 69, name: '속리산', region: '충북', subRegion: null, province: '충청북도', city: '보은군', height: 1058, rank: { forest: 46, blackyak: 48, sanha: 51, wolgan: 45 }, featured: true, lat: 36.5375, lng: 127.8708 },
    { id: 70, name: '월악산', region: '충북', subRegion: null, province: '충청북도', city: '제천시', height: 1097, rank: { forest: 47, blackyak: 49, sanha: 52, wolgan: 46 }, featured: true, lat: 36.8792, lng: 128.0958 },
    { id: 71, name: '천태산', region: '충북', subRegion: null, province: '충청북도', city: '영동군', height: 715, rank: { forest: 48, blackyak: 50, sanha: 53 }, featured: true, lat: 36.1208, lng: 127.7917 },
    { id: 72, name: '청화산', region: '충북', subRegion: null, province: '충청북도', city: '괴산군', height: 984, rank: { blackyak: 51 }, featured: false, lat: 36.8208, lng: 127.9542 },
    { id: 73, name: '칠보산', region: '충북', subRegion: null, province: '충청북도', city: '보은군', height: 778, rank: { blackyak: 52, sanha: 54 }, featured: false, lat: 36.4708, lng: 127.8042 },
    { id: 74, name: '황정산', region: '충북', subRegion: null, province: '충청북도', city: '단양군', height: 959, rank: {}, featured: false, lat: 36.9792, lng: 128.3833 },
    { id: 75, name: '희양산', region: '충북', subRegion: null, province: '충청북도', city: '괴산군', height: 999, rank: { forest: 49, wolgan: 47 }, featured: false, lat: 36.7792, lng: 128.0292 },

    // ===== 대구/경북 (18개) =====
    { id: 76, name: '가야산', region: '대구/경북', subRegion: '경북남부', province: '경상북도', city: '성주군', height: 1433, rank: { forest: 50, blackyak: 53, sanha: 55, wolgan: 48 }, featured: true, lat: 35.8208, lng: 128.1208 },
    { id: 77, name: '금오산', region: '대구/경북', subRegion: '경북남부', province: '경상북도', city: '구미시', height: 977, rank: { forest: 51, blackyak: 54, sanha: 56, wolgan: 49 }, featured: true, lat: 36.1042, lng: 128.3458 },
    { id: 78, name: '경주남산', region: '대구/경북', subRegion: '경북남부', province: '경상북도', city: '경주시', height: 468, rank: { forest: 52, blackyak: 55, sanha: 57, wolgan: 50 }, featured: true, lat: 35.7833, lng: 129.2125 },
    { id: 79, name: '내연산', region: '대구/경북', subRegion: '경북남부', province: '경상북도', city: '포항시', height: 710, rank: { forest: 53, blackyak: 56, sanha: 58, wolgan: 51 }, featured: true, lat: 36.1417, lng: 129.2917 },
    { id: 80, name: '대야산', region: '대구/경북', subRegion: '경북북부', province: '경상북도', city: '문경시', height: 931, rank: { forest: 54, blackyak: 57, sanha: 59 }, featured: true, lat: 36.5792, lng: 127.9625 },
    { id: 81, name: '문수산', region: '대구/경북', subRegion: '경북북부', province: '경상북도', city: '봉화군', height: 1206, rank: { wolgan: 52 }, featured: false, lat: 36.9958, lng: 128.8958 },
    { id: 82, name: '비슬산', region: '대구/경북', subRegion: '대구', province: '대구광역시', city: '달성군', height: 1084, rank: { forest: 55, blackyak: 58, sanha: 60, wolgan: 53 }, featured: true, lat: 35.7208, lng: 128.4958 },
    { id: 83, name: '성인봉', region: '대구/경북', subRegion: '경북남부', province: '경상북도', city: '울릉군', height: 984, rank: { forest: 56, wolgan: 54 }, featured: false, lat: 37.5042, lng: 130.8667 },
    { id: 84, name: '운문산', region: '대구/경북', subRegion: '경북남부', province: '경상북도', city: '청도군', height: 1188, rank: { forest: 57, sanha: 61, wolgan: 55 }, featured: true, lat: 35.6583, lng: 128.9542 },
    { id: 85, name: '응봉산', region: '대구/경북', subRegion: '경북북부', province: '경상북도', city: '봉화군', height: 998, rank: { forest: 58, blackyak: 59, sanha: 62, wolgan: 56 }, featured: true, lat: 36.9708, lng: 128.7958 },
    { id: 86, name: '일월산', region: '대구/경북', subRegion: '경북북부', province: '경상북도', city: '영양군', height: 1219, rank: { wolgan: 57 }, featured: false, lat: 36.7833, lng: 129.1083 },
    { id: 87, name: '조령산', region: '대구/경북', subRegion: '경북북부', province: '경상북도', city: '문경시', height: 1017, rank: { blackyak: 60, sanha: 63, wolgan: 58 }, featured: true, lat: 36.7458, lng: 128.0542 },
    { id: 88, name: '주왕산', region: '대구/경북', subRegion: '경북북부', province: '경상북도', city: '청송군', height: 721, rank: { forest: 59, blackyak: 61, sanha: 64, wolgan: 59 }, featured: true, lat: 36.4042, lng: 129.1625 },
    { id: 89, name: '주흘산', region: '대구/경북', subRegion: '경북북부', province: '경상북도', city: '문경시', height: 1106, rank: { forest: 60, blackyak: 62, sanha: 65, wolgan: 60 }, featured: true, lat: 36.7375, lng: 128.0292 },
    { id: 90, name: '청량산', region: '대구/경북', subRegion: '경북북부', province: '경상북도', city: '봉화군', height: 870, rank: { forest: 61, blackyak: 63, sanha: 66, wolgan: 61 }, featured: true, lat: 36.8208, lng: 128.9375 },
    { id: 91, name: '토함산', region: '대구/경북', subRegion: '경북남부', province: '경상북도', city: '경주시', height: 745, rank: { wolgan: 62 }, featured: false, lat: 35.7792, lng: 129.3208 },
    { id: 92, name: '팔공산', region: '대구/경북', subRegion: '대구', province: '대구광역시', city: '동구', height: 1193, rank: { forest: 62, blackyak: 64, sanha: 67, wolgan: 63 }, featured: true, lat: 35.9917, lng: 128.6958 },
    { id: 93, name: '황악산', region: '대구/경북', subRegion: '경북남부', province: '경상북도', city: '김천시', height: 1111, rank: { forest: 63, blackyak: 65, sanha: 68 }, featured: true, lat: 36.0958, lng: 127.9875 },
    { id: 94, name: '황장산', region: '대구/경북', subRegion: '경북북부', province: '경상북도', city: '문경시', height: 1077, rank: { forest: 64 }, featured: false, lat: 36.8458, lng: 128.1292 },

    // ===== 부산/울산/경남 (17개) =====
    { id: 95, name: '가지산', region: '부산/울산/경남', subRegion: '경남동부', province: '울산광역시', city: '울주군', height: 1241, rank: { forest: 65, blackyak: 66, sanha: 69, wolgan: 64 }, featured: true, lat: 35.6042, lng: 129.0333 },
    { id: 96, name: '계룡산', region: '부산/울산/경남', subRegion: '경남동부', province: '경상남도', city: '거제시', height: 566, rank: { wolgan: 65 }, featured: false, lat: 34.8542, lng: 128.6417 },
    { id: 97, name: '금산', region: '부산/울산/경남', subRegion: '경남동부', province: '경상남도', city: '남해군', height: 705, rank: { forest: 66, sanha: 70, wolgan: 66 }, featured: true, lat: 34.7458, lng: 127.9833 },
    { id: 98, name: '금정산', region: '부산/울산/경남', subRegion: '부산/울산', province: '부산광역시', city: '금정구', height: 802, rank: { forest: 67, blackyak: 67, sanha: 71, wolgan: 67 }, featured: true, lat: 35.2792, lng: 129.0542 },
    { id: 99, name: '남덕유산', region: '부산/울산/경남', subRegion: '경남서부', province: '경상남도', city: '거창군', height: 1508, rank: { sanha: 72 }, featured: false, lat: 35.8542, lng: 127.7583 },
    { id: 100, name: '남산제일봉', region: '부산/울산/경남', subRegion: '경남서부', province: '경상남도', city: '합천군', height: 1010, rank: { sanha: 73 }, featured: false, lat: 35.8125, lng: 128.0792 },
    { id: 101, name: '무학산', region: '부산/울산/경남', subRegion: '경남동부', province: '경상남도', city: '창원시', height: 767, rank: { forest: 68 }, featured: false, lat: 35.2292, lng: 128.5583 },
    { id: 102, name: '미륵산', region: '부산/울산/경남', subRegion: '경남동부', province: '경상남도', city: '통영시', height: 461, rank: { forest: 69, sanha: 74 }, featured: false, lat: 34.8208, lng: 128.3958 },
    { id: 103, name: '신불산', region: '부산/울산/경남', subRegion: '경남동부', province: '울산광역시', city: '울주군', height: 1159, rank: { forest: 70, blackyak: 68, sanha: 75, wolgan: 68 }, featured: true, lat: 35.5458, lng: 129.0542 },
    { id: 104, name: '연화산', region: '부산/울산/경남', subRegion: '경남동부', province: '경상남도', city: '고성군', height: 528, rank: { forest: 71, wolgan: 69 }, featured: false, lat: 35.0292, lng: 128.2958 },
    { id: 105, name: '재약산', region: '부산/울산/경남', subRegion: '경남동부', province: '경상남도', city: '밀양시', height: 1189, rank: { forest: 72, blackyak: 69, sanha: 76, wolgan: 70 }, featured: true, lat: 35.5458, lng: 128.9958 },
    { id: 106, name: '지리산', region: '부산/울산/경남', subRegion: '경남서부', province: '경상남도', city: '산청군', height: 1915, rank: { forest: 73, blackyak: 70, sanha: 77, wolgan: 71 }, featured: true, lat: 35.3369, lng: 127.7306 },
    { id: 107, name: '통영지리산', region: '부산/울산/경남', subRegion: '경남동부', province: '경상남도', city: '통영시', height: 398, rank: { forest: 74, sanha: 78, wolgan: 72 }, featured: true, lat: 34.8042, lng: 128.3458 },
    { id: 108, name: '천성산', region: '부산/울산/경남', subRegion: '경남동부', province: '경상남도', city: '양산시', height: 922, rank: { forest: 75, blackyak: 71, sanha: 79 }, featured: true, lat: 35.4542, lng: 129.0708 },
    { id: 109, name: '천주산', region: '부산/울산/경남', subRegion: '경남동부', province: '경상남도', city: '창원시', height: 640, rank: { wolgan: 73 }, featured: false, lat: 35.2375, lng: 128.7167 },
    { id: 110, name: '천황산', region: '부산/울산/경남', subRegion: '경남동부', province: '경상남도', city: '밀양시', height: 1189, rank: { wolgan: 74 }, featured: false, lat: 35.5458, lng: 129.0042 },
    { id: 111, name: '화왕산', region: '부산/울산/경남', subRegion: '경남동부', province: '경상남도', city: '창녕군', height: 757, rank: { forest: 76, blackyak: 72, sanha: 80, wolgan: 75 }, featured: true, lat: 35.5458, lng: 128.5708 },
    { id: 112, name: '황매산', region: '부산/울산/경남', subRegion: '경남서부', province: '경상남도', city: '합천군', height: 1108, rank: { forest: 77, blackyak: 73, sanha: 81, wolgan: 76 }, featured: true, lat: 35.5042, lng: 128.0208 },
    { id: 113, name: '황석산', region: '부산/울산/경남', subRegion: '경남서부', province: '경상남도', city: '함양군', height: 1190, rank: { forest: 78, blackyak: 74 }, featured: false, lat: 35.4292, lng: 127.7708 },

    // ===== 전북 (18개) =====
    { id: 114, name: '강천산', region: '전북', subRegion: null, province: '전북특별자치도', city: '순창군', height: 584, rank: { forest: 79, sanha: 82, wolgan: 77 }, featured: true, lat: 35.4208, lng: 127.0042 },
    { id: 115, name: '구봉산', region: '전북', subRegion: null, province: '전북특별자치도', city: '진안군', height: 1002, rank: { blackyak: 75 }, featured: false, lat: 35.7625, lng: 127.4458 },
    { id: 116, name: '내장산', region: '전북', subRegion: null, province: '전북특별자치도', city: '정읍시', height: 763, rank: { forest: 80, blackyak: 76, sanha: 83, wolgan: 78 }, featured: true, lat: 35.4917, lng: 126.8875 },
    { id: 117, name: '덕유산', region: '전북', subRegion: null, province: '전북특별자치도', city: '무주군', height: 1614, rank: { forest: 81, blackyak: 77, sanha: 84, wolgan: 79 }, featured: true, lat: 35.8625, lng: 127.7458 },
    { id: 118, name: '마이산', region: '전북', subRegion: null, province: '전북특별자치도', city: '진안군', height: 686, rank: { forest: 82, blackyak: 78, sanha: 85, wolgan: 80 }, featured: true, lat: 35.7667, lng: 127.4125 },
    { id: 119, name: '만행산', region: '전북', subRegion: null, province: '전북특별자치도', city: '남원시', height: 909, rank: { wolgan: 81 }, featured: false, lat: 35.4083, lng: 127.5458 },
    { id: 120, name: '모악산', region: '전북', subRegion: null, province: '전북특별자치도', city: '김제시', height: 794, rank: { forest: 83, blackyak: 79, sanha: 86, wolgan: 82 }, featured: true, lat: 35.7417, lng: 127.0625 },
    { id: 121, name: '방장산', region: '전북', subRegion: null, province: '전북특별자치도', city: '고창군', height: 743, rank: { forest: 84, blackyak: 80 }, featured: false, lat: 35.4208, lng: 126.8292 },
    { id: 122, name: '백암산', region: '전북', subRegion: null, province: '전북특별자치도', city: '장성군', height: 741, rank: { forest: 85, blackyak: 81 }, featured: false, lat: 35.3875, lng: 126.8958 },
    { id: 123, name: '백운산', region: '전북', subRegion: null, province: '전북특별자치도', city: '완주군', height: 1025, rank: { wolgan: 83 }, featured: false, lat: 35.8958, lng: 127.2083 },
    { id: 124, name: '변산', region: '전북', subRegion: null, province: '전북특별자치도', city: '부안군', height: 509, rank: { forest: 86, blackyak: 82, sanha: 87, wolgan: 84 }, featured: true, lat: 35.6708, lng: 126.5708 },
    { id: 125, name: '선운산', region: '전북', subRegion: null, province: '전북특별자치도', city: '고창군', height: 336, rank: { forest: 87, blackyak: 83, sanha: 88, wolgan: 85 }, featured: true, lat: 35.5042, lng: 126.5958 },
    { id: 126, name: '신무산', region: '전북', subRegion: null, province: '전북특별자치도', city: '완주군', height: 897, rank: { wolgan: 86 }, featured: false, lat: 35.9125, lng: 127.2625 },
    { id: 127, name: '운장산', region: '전북', subRegion: null, province: '전북특별자치도', city: '진안군', height: 1126, rank: { forest: 88, blackyak: 84 }, featured: false, lat: 35.8542, lng: 127.4042 },
    { id: 128, name: '바래봉', region: '전북', subRegion: null, province: '전북특별자치도', city: '남원시', height: 1167, rank: { blackyak: 85, sanha: 89 }, featured: false, lat: 35.3292, lng: 127.6125 },
    { id: 129, name: '반야봉', region: '전북', subRegion: null, province: '전북특별자치도', city: '남원시', height: 1732, rank: { blackyak: 86 }, featured: false, lat: 35.3125, lng: 127.5958 },
    { id: 130, name: '장안산', region: '전북', subRegion: null, province: '전북특별자치도', city: '장수군', height: 1237, rank: { forest: 89, blackyak: 87, sanha: 90, wolgan: 87 }, featured: true, lat: 35.6417, lng: 127.6125 },
    { id: 131, name: '적상산', region: '전북', subRegion: null, province: '전북특별자치도', city: '무주군', height: 1034, rank: { forest: 90, wolgan: 88 }, featured: false, lat: 35.9042, lng: 127.6958 },
    { id: 132, name: '천상데미', region: '전북', subRegion: null, province: '전북특별자치도', city: '남원시', height: 910, rank: { wolgan: 89 }, featured: false, lat: 35.3083, lng: 127.7042 },

    // ===== 광주/전남 (14개) =====
    { id: 133, name: '깃대봉', region: '광주/전남', subRegion: null, province: '전라남도', city: '신안군', height: 639, rank: { forest: 91 }, featured: false, lat: 34.6833, lng: 125.9958 },
    { id: 134, name: '달마산', region: '광주/전남', subRegion: null, province: '전라남도', city: '해남군', height: 489, rank: { blackyak: 88, wolgan: 91 }, featured: false, lat: 34.3917, lng: 126.5625 },
    { id: 135, name: '덕룡산', region: '광주/전남', subRegion: null, province: '전라남도', city: '강진군', height: 432, rank: { blackyak: 89 }, featured: false, lat: 34.6208, lng: 126.7208 },
    { id: 136, name: '동악산', region: '광주/전남', subRegion: null, province: '전라남도', city: '곡성군', height: 735, rank: { blackyak: 90 }, featured: false, lat: 35.2708, lng: 127.2583 },
    { id: 137, name: '두륜산', region: '광주/전남', subRegion: null, province: '전라남도', city: '해남군', height: 703, rank: { forest: 92, blackyak: 91, sanha: 92, wolgan: 90 }, featured: true, lat: 34.4958, lng: 126.6208 },
    { id: 138, name: '무등산', region: '광주/전남', subRegion: null, province: '광주광역시', city: '동구', height: 1187, rank: { forest: 93, blackyak: 92, sanha: 93, wolgan: 91 }, featured: true, lat: 35.1292, lng: 126.9875 },
    { id: 139, name: '병풍산', region: '광주/전남', subRegion: null, province: '전라남도', city: '담양군', height: 822, rank: { wolgan: 92 }, featured: false, lat: 35.2792, lng: 126.9458 },
    { id: 140, name: '불갑산', region: '광주/전남', subRegion: null, province: '전라남도', city: '영광군', height: 516, rank: { blackyak: 93, wolgan: 93 }, featured: false, lat: 35.0708, lng: 126.5375 },
    { id: 141, name: '백운산', region: '광주/전남', subRegion: null, province: '전라남도', city: '광양시', height: 1218, rank: { forest: 94, blackyak: 94, sanha: 94, wolgan: 94 }, featured: true, lat: 35.1042, lng: 127.6208 },
    { id: 142, name: '영취산', region: '광주/전남', subRegion: null, province: '전라남도', city: '여수시', height: 510, rank: { wolgan: 95 }, featured: false, lat: 34.7917, lng: 127.6542 },
    { id: 143, name: '월출산', region: '광주/전남', subRegion: null, province: '전라남도', city: '영암군', height: 809, rank: { forest: 95, blackyak: 95, sanha: 95, wolgan: 96 }, featured: true, lat: 34.7667, lng: 126.7042 },
    { id: 144, name: '조계산', region: '광주/전남', subRegion: null, province: '전라남도', city: '순천시', height: 887, rank: { forest: 96, blackyak: 96, sanha: 96, wolgan: 97 }, featured: true, lat: 35.0125, lng: 127.2958 },
    { id: 145, name: '제암산', region: '광주/전남', subRegion: null, province: '전라남도', city: '보성군', height: 779, rank: { sanha: 98 }, featured: false, lat: 34.8125, lng: 127.0875 },
    { id: 146, name: '천관산', region: '광주/전남', subRegion: null, province: '전라남도', city: '장흥군', height: 724, rank: { forest: 97, blackyak: 97, sanha: 97, wolgan: 99 }, featured: true, lat: 34.5542, lng: 126.9125 },
    { id: 147, name: '추월산', region: '광주/전남', subRegion: null, province: '전라남도', city: '담양군', height: 731, rank: { forest: 98, wolgan: 98 }, featured: false, lat: 35.3458, lng: 126.9292 },
    { id: 148, name: '축령산', region: '광주/전남', subRegion: null, province: '전라남도', city: '장성군', height: 621, rank: { forest: 98 }, featured: false, lat: 35.2625, lng: 126.8542 },
    { id: 149, name: '팔영산', region: '광주/전남', subRegion: null, province: '전라남도', city: '고흥군', height: 609, rank: { forest: 99, blackyak: 99, sanha: 99 }, featured: true, lat: 34.5625, lng: 127.4708 },

    // ===== 제주 (1개) =====
    { id: 150, name: '한라산', region: '제주', subRegion: null, province: '제주특별자치도', city: '제주시', height: 1950, rank: { forest: 100, blackyak: 100, sanha: 100, wolgan: 100 }, featured: true, lat: 33.3617, lng: 126.5292 }
];

// 지역별 색상
const REGION_COLORS = {
    '서울/인천/경기': '#F8A5A5',
    '강원': '#7DCEA0',
    '대전/세종/충남': '#F7DC6F',
    '충북': '#BB8FCE',
    '대구/경북': '#85C1E9',
    '부산/울산/경남': '#F5B7B1',
    '전북': '#A9DFBF',
    '광주/전남': '#FAD7A0',
    '제주': '#AED6F1'
};

const REGION_COLORS_DARK = {
    '서울/인천/경기': '#E74C3C',
    '강원': '#27AE60',
    '대전/세종/충남': '#F39C12',
    '충북': '#8E44AD',
    '대구/경북': '#3498DB',
    '부산/울산/경남': '#E91E63',
    '전북': '#1ABC9C',
    '광주/전남': '#D35400',
    '제주': '#2980B9'
};
