#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
지하철 데이터 처리 스크립트
- 국토교통부 도시철도 전체노선 (순번 정보)
- GitHub 좌표 데이터 (위경도)
→ stations.js, lines.js 생성
"""

import csv
import json
import re
from collections import defaultdict

# 노선 색상 정의
LINE_COLORS = {
    '1호선': '#0052A4',
    '2호선': '#00A84D',
    '3호선': '#EF7C1C',
    '4호선': '#00A5DE',
    '5호선': '#996CAC',
    '6호선': '#CD7C2F',
    '7호선': '#747F00',
    '8호선': '#E6186C',
    '9호선': '#BDB092',
    '공항': '#0090D2',  # 공항철도
    '경의중앙': '#77C4A3',
    '경춘': '#0C8E72',
    '수인분당': '#FABE00',
    '신분당': '#D4003B',
    '우이신설': '#B7C452',
    '김포골드': '#AD8605',
    '서해': '#8FC31F',
    '신림': '#6789CA',
    'GTX-A': '#9A6292',
    # 부산
    '부산1호선': '#F06A00',
    '부산2호선': '#81BF48',
    '부산3호선': '#BB8C00',
    '부산4호선': '#217DCB',
    '부산김해경전철': '#8E50A4',
    '동해선': '#0054A6',
    # 대구
    '대구1호선': '#D93F5C',
    '대구2호선': '#00AA80',
    '대구3호선': '#FFB100',
    # 대전
    '대전1호선': '#007448',
    # 광주
    '광주1호선': '#009088',
    # 기타
    '인천1호선': '#759CCE',
    '인천2호선': '#ED8B00',
}

def normalize_line_name(line_name):
    """노선명 정규화"""
    # 공항철도 → 공항
    if '공항' in line_name and '철도' in line_name:
        return '공항'
    # 경의중앙선 → 경의중앙
    if '경의' in line_name or '중앙' in line_name:
        return '경의중앙'
    # 경춘선 → 경춘
    if '경춘' in line_name:
        return '경춘'
    # 수인분당선 → 수인분당
    if '수인' in line_name or '분당' in line_name:
        return '수인분당'
    # 신분당선 → 신분당
    if '신분당' in line_name:
        return '신분당'
    # 우이신설경전철 → 우이신설
    if '우이' in line_name:
        return '우이신설'
    # 김포도시철도 → 김포골드
    if '김포' in line_name:
        return '김포골드'
    # 서해선 → 서해
    if '서해' in line_name:
        return '서해'
    # 신림선 → 신림
    if '신림' in line_name:
        return '신림'
    # GTX
    if 'GTX' in line_name.upper():
        return 'GTX-A'
    # 인천1호선, 인천2호선
    if '인천' in line_name:
        match = re.search(r'(\d+)', line_name)
        if match:
            return f'인천{match.group(1)}호선'
    # 1호선, 2호선 등
    match = re.search(r'(\d+)호선', line_name)
    if match:
        return f'{match.group(1)}호선'
    return line_name

def normalize_station_name(name):
    """역명 정규화 - 괄호 제거"""
    # 괄호 안 내용 제거
    name = re.sub(r'\([^)]*\)', '', name)
    name = name.strip()
    return name

def load_coordinates():
    """좌표 데이터 로드"""
    coords = {}
    with open('station_coordinates.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            line = row['line']
            name = row['name']
            lat = float(row['lat'])
            lng = float(row['lng'])

            # 노선명 정규화
            norm_line = normalize_line_name(line)
            norm_name = normalize_station_name(name)

            key = (norm_line, norm_name)
            coords[key] = {'lat': lat, 'lng': lng}

            # 역명만으로도 저장 (fallback용)
            if norm_name not in coords:
                coords[norm_name] = {'lat': lat, 'lng': lng}

    return coords

def load_line_order():
    """노선 순서 데이터 로드"""
    lines = defaultdict(list)

    with open('subway_lines.csv', 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            region = row['권역명']
            line_name = row['노선명']
            order = int(row['순번'])
            station_name = row['역명']
            operator = row['철도운영기관명']

            # 노선명 정규화
            norm_line = normalize_line_name(line_name)
            norm_station = normalize_station_name(station_name)

            # 권역 코드 추출
            region_code = row['권역']

            lines[(region_code, norm_line)].append({
                'order': order,
                'station': norm_station,
                'original_name': station_name,
                'operator': operator,
                'region': region
            })

    # 순번으로 정렬
    for key in lines:
        lines[key].sort(key=lambda x: x['order'])

    return lines

def main():
    print("좌표 데이터 로드 중...")
    coords = load_coordinates()
    print(f"  → {len(coords)} 항목 로드됨")

    print("노선 순서 데이터 로드 중...")
    lines = load_line_order()
    print(f"  → {len(lines)} 노선 로드됨")

    # 통계
    matched = 0
    unmatched = []

    # stations.js 데이터 생성
    stations = []
    station_id = 0

    # lines.js 데이터 생성
    lines_data = {}

    for (region_code, line_name), stations_list in lines.items():
        if region_code != '01':  # MVP: 수도권만
            continue

        line_stations = []

        for s in stations_list:
            station_id += 1
            norm_name = s['station']

            # 좌표 찾기
            key = (line_name, norm_name)
            if key in coords:
                coord = coords[key]
                matched += 1
            elif norm_name in coords:
                coord = coords[norm_name]
                matched += 1
            else:
                unmatched.append(f"{line_name} - {s['original_name']}")
                continue

            station_data = {
                'id': station_id,
                'name': s['original_name'],
                'line': line_name,
                'lat': coord['lat'],
                'lng': coord['lng'],
                'order': s['order']
            }
            stations.append(station_data)
            line_stations.append(station_id)

        if line_stations:
            lines_data[line_name] = {
                'name': line_name,
                'color': LINE_COLORS.get(line_name, '#888888'),
                'stations': line_stations
            }

    print(f"\n매칭 결과:")
    print(f"  - 매칭 성공: {matched}")
    print(f"  - 매칭 실패: {len(unmatched)}")

    if unmatched[:20]:
        print(f"\n매칭 실패 역 (처음 20개):")
        for name in unmatched[:20]:
            print(f"  - {name}")

    # stations.js 저장
    with open('stations.js', 'w', encoding='utf-8') as f:
        f.write('// 수도권 지하철역 데이터 (자동 생성됨)\n')
        f.write('// 출처: 국토교통부 도시철도 전체노선 + GitHub 좌표 데이터\n\n')
        f.write('const SUBWAY_STATIONS = ')
        json.dump(stations, f, ensure_ascii=False, indent=2)
        f.write(';\n')

    print(f"\nstations.js 저장됨 ({len(stations)}개 역)")

    # lines.js 저장
    with open('lines.js', 'w', encoding='utf-8') as f:
        f.write('// 수도권 지하철 노선 데이터 (자동 생성됨)\n')
        f.write('// 출처: 국토교통부 도시철도 전체노선\n\n')
        f.write('const SUBWAY_LINES = ')
        json.dump(lines_data, f, ensure_ascii=False, indent=2)
        f.write(';\n\n')
        f.write('// 노선 색상\n')
        f.write('const LINE_COLORS = ')
        json.dump(LINE_COLORS, f, ensure_ascii=False, indent=2)
        f.write(';\n')

    print(f"lines.js 저장됨 ({len(lines_data)}개 노선)")

if __name__ == '__main__':
    main()
