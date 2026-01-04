#!/usr/bin/env node
/**
 * 지하철 데이터 처리 스크립트
 * - 국토교통부 도시철도 전체노선 (순번 정보)
 * - GitHub 좌표 데이터 (위경도)
 * → stations.js, lines.js 생성
 */

const fs = require('fs');

// 노선 색상 정의
const LINE_COLORS = {
    '1호선': '#0052A4',
    '2호선': '#00A84D',
    '3호선': '#EF7C1C',
    '4호선': '#00A5DE',
    '5호선': '#996CAC',
    '6호선': '#CD7C2F',
    '7호선': '#747F00',
    '8호선': '#E6186C',
    '9호선': '#BDB092',
    '공항': '#0090D2',
    '경의중앙': '#77C4A3',
    '경춘': '#0C8E72',
    '수인분당': '#FABE00',
    '신분당': '#D4003B',
    '우이신설': '#B7C452',
    '김포골드': '#AD8605',
    '서해': '#8FC31F',
    '신림': '#6789CA',
    'GTX-A': '#9A6292',
    '인천1호선': '#759CCE',
    '인천2호선': '#ED8B00',
};

function normalizeLineName(lineName) {
    if (lineName.includes('공항') && lineName.includes('철도')) return '공항';
    if (lineName.includes('경의') || (lineName.includes('중앙') && !lineName.includes('호선'))) return '경의중앙';
    if (lineName.includes('경춘')) return '경춘';
    // 신분당을 먼저 체크해야 함! (분당보다 먼저)
    if (lineName.includes('신분당')) return '신분당';
    // 수인분당 또는 분당선 (신분당 제외)
    if (lineName.includes('수인') || lineName === '분당선' || lineName === '수인분당') return '수인분당';
    if (lineName.includes('우이')) return '우이신설';
    if (lineName.includes('김포')) return '김포골드';
    if (lineName.includes('서해')) return '서해';
    if (lineName.includes('신림')) return '신림';
    if (lineName.toUpperCase().includes('GTX')) return 'GTX-A';
    if (lineName.includes('인천')) {
        const match = lineName.match(/(\d+)/);
        if (match) return `인천${match[1]}호선`;
    }
    const match = lineName.match(/(\d+)호선/);
    if (match) return `${match[1]}호선`;
    return lineName;
}

function normalizeStationName(name) {
    return name.replace(/\([^)]*\)/g, '').trim();
}

function parseCSV(content, hasHeader = true) {
    const lines = content.trim().split('\n');
    const result = [];
    const headers = hasHeader ? lines[0].split(',').map(h => h.trim()) : null;
    const startIdx = hasHeader ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (hasHeader) {
            const obj = {};
            headers.forEach((h, idx) => {
                obj[h] = values[idx] || '';
            });
            result.push(obj);
        } else {
            result.push(values);
        }
    }
    return result;
}

function loadCoordinates() {
    const content = fs.readFileSync('station_coordinates.csv', 'utf-8');
    const data = parseCSV(content);
    const coords = {};

    for (const row of data) {
        const line = row.line;
        const name = row.name;
        const lat = parseFloat(row.lat);
        const lng = parseFloat(row.lng);

        const normLine = normalizeLineName(line);
        const normName = normalizeStationName(name);

        const key = `${normLine}|${normName}`;
        coords[key] = { lat, lng };

        // 역명만으로도 저장 (fallback)
        if (!coords[normName]) {
            coords[normName] = { lat, lng };
        }
    }

    return coords;
}

function loadLineOrder() {
    const content = fs.readFileSync('subway_lines.csv', 'utf-8');
    // BOM 제거
    const cleanContent = content.replace(/^\uFEFF/, '');
    const data = parseCSV(cleanContent);
    const lines = {};

    for (const row of data) {
        const region = row['권역명'];
        const regionCode = row['권역'];
        const lineName = row['노선명'];
        const order = parseInt(row['순번']);
        const stationName = row['역명'];
        const operator = row['철도운영기관명'];

        const normLine = normalizeLineName(lineName);
        const normStation = normalizeStationName(stationName);

        const key = `${regionCode}|${normLine}`;
        if (!lines[key]) {
            lines[key] = [];
        }

        lines[key].push({
            order,
            station: normStation,
            originalName: stationName,
            operator,
            region,
            regionCode
        });
    }

    // 순번으로 정렬
    for (const key in lines) {
        lines[key].sort((a, b) => a.order - b.order);
    }

    return lines;
}

function main() {
    console.log('좌표 데이터 로드 중...');
    const coords = loadCoordinates();
    console.log(`  → ${Object.keys(coords).length} 항목 로드됨`);

    console.log('노선 순서 데이터 로드 중...');
    const lines = loadLineOrder();
    console.log(`  → ${Object.keys(lines).length} 노선 로드됨`);

    let matched = 0;
    const unmatched = [];
    const stations = [];
    const linesData = {};
    let stationId = 0;

    for (const [key, stationsList] of Object.entries(lines)) {
        const [regionCode, lineName] = key.split('|');

        // MVP: 수도권만
        if (regionCode !== '01') continue;

        const lineStations = [];

        for (const s of stationsList) {
            stationId++;
            const normName = s.station;

            // 좌표 찾기
            const coordKey = `${lineName}|${normName}`;
            let coord = coords[coordKey] || coords[normName];

            if (!coord) {
                unmatched.push(`${lineName} - ${s.originalName}`);
                continue;
            }

            matched++;

            const stationData = {
                id: stationId,
                name: s.originalName,
                line: lineName,
                lat: coord.lat,
                lng: coord.lng,
                order: s.order
            };
            stations.push(stationData);
            lineStations.push(stationId);
        }

        if (lineStations.length > 0) {
            linesData[lineName] = {
                name: lineName,
                color: LINE_COLORS[lineName] || '#888888',
                stations: lineStations
            };
        }
    }

    console.log(`\n매칭 결과:`);
    console.log(`  - 매칭 성공: ${matched}`);
    console.log(`  - 매칭 실패: ${unmatched.length}`);

    if (unmatched.length > 0) {
        console.log(`\n매칭 실패 역 (처음 20개):`);
        unmatched.slice(0, 20).forEach(name => {
            console.log(`  - ${name}`);
        });
    }

    // stations.js 저장
    const stationsContent = `// 수도권 지하철역 데이터 (자동 생성됨)
// 출처: 국토교통부 도시철도 전체노선 + GitHub 좌표 데이터

const SUBWAY_STATIONS = ${JSON.stringify(stations, null, 2)};
`;
    fs.writeFileSync('stations.js', stationsContent, 'utf-8');
    console.log(`\nstations.js 저장됨 (${stations.length}개 역)`);

    // lines.js 저장
    const linesContent = `// 수도권 지하철 노선 데이터 (자동 생성됨)
// 출처: 국토교통부 도시철도 전체노선

const SUBWAY_LINES = ${JSON.stringify(linesData, null, 2)};

// 노선 색상
const LINE_COLORS = ${JSON.stringify(LINE_COLORS, null, 2)};
`;
    fs.writeFileSync('lines.js', linesContent, 'utf-8');
    console.log(`lines.js 저장됨 (${Object.keys(linesData).length}개 노선)`);
}

main();
