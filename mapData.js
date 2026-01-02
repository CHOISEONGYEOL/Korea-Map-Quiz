// 대한민국 지도 데이터
// 실제 지리적 위치를 반영한 SVG 경로 데이터

const PROVINCES = {
    seoul: {
        name: "서울특별시",
        color: "#FF6B6B",
        path: "M 195 155 L 200 150 L 210 148 L 218 152 L 220 160 L 216 168 L 208 172 L 198 170 L 192 164 Z",
        hasSubRegions: false,
        districts: {
            jongno: { name: "종로구", path: "M 200 152 L 208 150 L 214 155 L 210 162 L 202 160 Z" },
            jung: { name: "중구", path: "M 202 160 L 210 162 L 212 168 L 206 170 L 200 166 Z" },
            yongsan: { name: "용산구", path: "M 198 166 L 206 170 L 204 178 L 196 176 L 194 170 Z" },
            seongdong: { name: "성동구", path: "M 212 160 L 220 158 L 224 166 L 218 172 L 210 168 Z" },
            gwangjin: { name: "광진구", path: "M 220 156 L 228 154 L 232 164 L 224 170 L 218 162 Z" },
            dongdaemun: { name: "동대문구", path: "M 212 152 L 222 150 L 226 158 L 218 164 L 210 158 Z" },
            jungnang: { name: "중랑구", path: "M 222 148 L 232 146 L 236 156 L 228 162 L 220 154 Z" },
            seongbuk: { name: "성북구", path: "M 206 146 L 216 144 L 222 152 L 214 158 L 204 154 Z" },
            gangbuk: { name: "강북구", path: "M 198 144 L 208 142 L 214 150 L 206 156 L 196 152 Z" },
            dobong: { name: "도봉구", path: "M 204 136 L 214 134 L 220 142 L 212 148 L 202 144 Z" },
            nowon: { name: "노원구", path: "M 214 134 L 226 132 L 232 144 L 222 152 L 212 146 Z" },
            eunpyeong: { name: "은평구", path: "M 186 148 L 198 144 L 204 154 L 194 162 L 184 156 Z" },
            seodaemun: { name: "서대문구", path: "M 188 158 L 200 154 L 206 164 L 196 172 L 186 166 Z" },
            mapo: { name: "마포구", path: "M 182 164 L 194 160 L 200 172 L 190 180 L 180 174 Z" },
            yangcheon: { name: "양천구", path: "M 176 178 L 188 174 L 194 186 L 184 192 L 174 186 Z" },
            gangseo: { name: "강서구", path: "M 168 172 L 182 168 L 190 182 L 178 190 L 166 184 Z" },
            guro: { name: "구로구", path: "M 178 188 L 192 184 L 200 198 L 188 204 L 176 196 Z" },
            geumcheon: { name: "금천구", path: "M 190 198 L 202 194 L 210 208 L 198 214 L 188 206 Z" },
            yeongdeungpo: { name: "영등포구", path: "M 184 176 L 198 172 L 206 188 L 194 196 L 182 188 Z" },
            dongjak: { name: "동작구", path: "M 196 186 L 210 182 L 218 198 L 206 206 L 194 198 Z" },
            gwanak: { name: "관악구", path: "M 200 200 L 216 196 L 224 214 L 210 222 L 198 212 Z" },
            seocho: { name: "서초구", path: "M 210 190 L 228 186 L 238 208 L 222 218 L 208 204 Z" },
            gangnam: { name: "강남구", path: "M 222 180 L 244 176 L 254 200 L 236 212 L 220 196 Z" },
            songpa: { name: "송파구", path: "M 238 172 L 260 168 L 270 194 L 252 206 L 236 190 Z" },
            gangdong: { name: "강동구", path: "M 252 164 L 272 160 L 282 188 L 264 200 L 250 184 Z" }
        }
    },
    busan: {
        name: "부산광역시",
        color: "#4ECDC4",
        path: "M 355 445 L 375 435 L 395 445 L 400 465 L 390 485 L 365 490 L 350 475 L 348 455 Z",
        hasSubRegions: false,
        districts: {
            jung_bu: { name: "중구", path: "M 368 458 L 378 455 L 383 465 L 375 472 L 366 467 Z" },
            seo: { name: "서구", path: "M 358 462 L 368 458 L 375 470 L 366 478 L 356 472 Z" },
            dong: { name: "동구", path: "M 375 452 L 386 448 L 392 460 L 382 468 L 373 462 Z" },
            yeongdo: { name: "영도구", path: "M 368 475 L 382 470 L 390 488 L 376 496 L 364 486 Z" },
            busanjin: { name: "부산진구", path: "M 362 448 L 376 442 L 386 458 L 374 468 L 360 460 Z" },
            dongnae: { name: "동래구", path: "M 368 435 L 382 428 L 394 445 L 380 456 L 366 448 Z" },
            nam: { name: "남구", path: "M 376 465 L 390 458 L 400 478 L 386 488 L 374 478 Z" },
            buk: { name: "북구", path: "M 358 432 L 372 425 L 385 442 L 372 454 L 356 445 Z" },
            haeundae: { name: "해운대구", path: "M 382 425 L 400 415 L 415 438 L 398 455 L 380 442 Z" },
            saha: { name: "사하구", path: "M 348 458 L 364 450 L 375 472 L 360 486 L 345 475 Z" },
            geumjeong: { name: "금정구", path: "M 365 418 L 382 408 L 398 428 L 382 445 L 362 435 Z" },
            gangseo_bu: { name: "강서구", path: "M 335 445 L 355 435 L 368 458 L 352 475 L 332 462 Z" },
            yeonje: { name: "연제구", path: "M 372 442 L 386 435 L 396 452 L 384 462 L 370 455 Z" },
            suyeong: { name: "수영구", path: "M 388 452 L 404 445 L 415 468 L 400 480 L 386 468 Z" },
            sasang: { name: "사상구", path: "M 352 435 L 368 425 L 382 448 L 366 462 L 350 452 Z" },
            gijang: { name: "기장군", path: "M 392 400 L 418 385 L 435 418 L 415 445 L 390 432 Z" }
        }
    },
    daegu: {
        name: "대구광역시",
        color: "#9B59B6",
        path: "M 305 355 L 335 345 L 355 365 L 350 395 L 320 405 L 295 385 Z",
        hasSubRegions: false,
        districts: {
            jung_dg: { name: "중구", path: "M 320 368 L 332 364 L 340 376 L 330 384 L 318 378 Z" },
            dong_dg: { name: "동구", path: "M 332 358 L 350 350 L 362 370 L 348 384 L 330 372 Z" },
            seo_dg: { name: "서구", path: "M 305 372 L 320 365 L 332 382 L 318 395 L 302 385 Z" },
            nam_dg: { name: "남구", path: "M 318 382 L 335 375 L 348 395 L 332 408 L 315 398 Z" },
            buk_dg: { name: "북구", path: "M 312 352 L 335 342 L 352 362 L 335 378 L 310 368 Z" },
            suseong: { name: "수성구", path: "M 338 372 L 360 362 L 375 388 L 355 405 L 335 392 Z" },
            dalseo: { name: "달서구", path: "M 295 378 L 318 368 L 335 395 L 312 412 L 292 398 Z" },
            dalseong: { name: "달성군", path: "M 280 362 L 310 348 L 332 378 L 308 405 L 278 388 Z" }
        }
    },
    incheon: {
        name: "인천광역시",
        color: "#3498DB",
        path: "M 140 155 L 175 145 L 190 168 L 182 198 L 148 208 L 128 182 Z",
        hasSubRegions: false,
        districts: {
            jung_ic: { name: "중구", path: "M 155 168 L 168 162 L 178 178 L 166 188 L 152 180 Z" },
            dong_ic: { name: "동구", path: "M 168 158 L 182 152 L 192 172 L 178 184 L 165 174 Z" },
            michuhol: { name: "미추홀구", path: "M 158 182 L 175 175 L 186 198 L 170 210 L 155 198 Z" },
            yeonsu: { name: "연수구", path: "M 172 195 L 190 188 L 202 218 L 182 230 L 168 212 Z" },
            namdong: { name: "남동구", path: "M 180 178 L 198 170 L 212 198 L 192 215 L 176 198 Z" },
            bupyeong: { name: "부평구", path: "M 168 158 L 186 150 L 200 175 L 182 192 L 165 178 Z" },
            gyeyang: { name: "계양구", path: "M 175 145 L 195 138 L 208 165 L 188 180 L 172 162 Z" },
            seo_ic: { name: "서구", path: "M 145 162 L 168 155 L 180 180 L 162 195 L 142 182 Z" },
            ganghwa: { name: "강화군", path: "M 115 120 L 152 108 L 168 142 L 142 162 L 108 148 Z" },
            ongjin: { name: "옹진군", path: "M 95 175 L 128 165 L 145 202 L 118 222 L 88 205 Z" }
        }
    },
    gwangju: {
        name: "광주광역시",
        color: "#E67E22",
        path: "M 180 405 L 215 392 L 235 418 L 222 448 L 188 455 L 170 432 Z",
        hasSubRegions: false,
        districts: {
            dong_gj: { name: "동구", path: "M 202 415 L 218 408 L 228 428 L 215 440 L 198 430 Z" },
            seo_gj: { name: "서구", path: "M 182 425 L 200 418 L 212 442 L 196 455 L 178 442 Z" },
            nam_gj: { name: "남구", path: "M 195 438 L 215 430 L 228 455 L 210 468 L 192 458 Z" },
            buk_gj: { name: "북구", path: "M 192 402 L 215 392 L 232 418 L 212 435 L 188 422 Z" },
            gwangsan: { name: "광산구", path: "M 168 418 L 195 405 L 215 438 L 190 458 L 165 442 Z" }
        }
    },
    daejeon: {
        name: "대전광역시",
        color: "#F1C40F",
        path: "M 225 300 L 260 288 L 280 315 L 268 348 L 235 358 L 215 332 Z",
        hasSubRegions: false,
        districts: {
            dong_dj: { name: "동구", path: "M 252 308 L 272 298 L 285 325 L 268 342 L 248 328 Z" },
            jung_dj: { name: "중구", path: "M 238 318 L 258 308 L 275 338 L 255 355 L 235 340 Z" },
            seo_dj: { name: "서구", path: "M 222 332 L 245 322 L 262 352 L 242 368 L 218 355 Z" },
            yuseong: { name: "유성구", path: "M 228 295 L 255 285 L 275 315 L 252 335 L 225 318 Z" },
            daedeok: { name: "대덕구", path: "M 252 290 L 278 280 L 298 312 L 275 332 L 250 315 Z" }
        }
    },
    ulsan: {
        name: "울산광역시",
        color: "#1ABC9C",
        path: "M 365 375 L 405 362 L 428 395 L 418 432 L 378 442 L 355 412 Z",
        hasSubRegions: false,
        districts: {
            jung_us: { name: "중구", path: "M 382 395 L 400 388 L 412 408 L 398 422 L 378 412 Z" },
            nam_us: { name: "남구", path: "M 378 415 L 398 405 L 415 432 L 395 448 L 375 435 Z" },
            dong_us: { name: "동구", path: "M 400 385 L 422 375 L 438 405 L 418 422 L 398 408 Z" },
            buk_us: { name: "북구", path: "M 375 382 L 398 372 L 415 398 L 395 415 L 372 402 Z" },
            ulju: { name: "울주군", path: "M 355 365 L 395 350 L 428 388 L 405 428 L 365 438 L 345 402 Z" }
        }
    },
    sejong: {
        name: "세종특별자치시",
        color: "#2980B9",
        path: "M 218 268 L 250 255 L 268 282 L 255 310 L 225 318 L 208 292 Z",
        hasSubRegions: false,
        districts: {
            sejong_all: { name: "세종시", path: "M 218 268 L 250 255 L 268 282 L 255 310 L 225 318 L 208 292 Z" }
        }
    },
    gyeonggi: {
        name: "경기도",
        color: "#27AE60",
        path: "M 148 108 L 238 92 L 278 145 L 272 225 L 228 268 L 162 278 L 118 222 L 125 148 Z",
        hasSubRegions: true,
        subRegions: {
            north: {
                name: "경기 북부",
                path: "M 148 108 L 238 92 L 262 135 L 252 185 L 205 195 L 158 202 L 128 158 Z"
            },
            south: {
                name: "경기 남부",
                path: "M 158 195 L 205 188 L 252 180 L 272 225 L 228 268 L 162 278 L 125 228 Z"
            }
        },
        districts: {
            // 경기 북부
            goyang: { name: "고양시", region: "north", path: "M 168 142 L 195 132 L 212 158 L 195 175 L 165 168 Z" },
            paju: { name: "파주시", region: "north", path: "M 138 125 L 175 112 L 195 145 L 172 168 L 135 155 Z" },
            gimpo: { name: "김포시", region: "north", path: "M 128 152 L 162 142 L 178 172 L 158 195 L 125 182 Z" },
            yangju: { name: "양주시", region: "north", path: "M 195 118 L 228 105 L 248 138 L 225 162 L 192 148 Z" },
            uijeongbu: { name: "의정부시", region: "north", path: "M 205 148 L 232 138 L 248 165 L 228 185 L 202 172 Z" },
            dongducheon: { name: "동두천시", region: "north", path: "M 208 112 L 235 102 L 252 128 L 232 148 L 205 135 Z" },
            pocheon: { name: "포천시", region: "north", path: "M 228 98 L 268 85 L 292 125 L 262 158 L 225 138 Z" },
            yeoncheon: { name: "연천군", region: "north", path: "M 188 92 L 225 80 L 248 112 L 222 138 L 185 122 Z" },
            gapyeong: { name: "가평군", region: "north", path: "M 255 108 L 298 92 L 325 138 L 292 175 L 252 155 Z" },
            namyangju: { name: "남양주시", region: "north", path: "M 235 158 L 278 145 L 305 188 L 272 218 L 232 198 Z" },
            guri: { name: "구리시", region: "north", path: "M 228 178 L 252 168 L 268 195 L 248 212 L 225 198 Z" },

            // 경기 남부
            suwon: { name: "수원시", region: "south", path: "M 198 218 L 228 205 L 248 238 L 225 262 L 195 248 Z" },
            seongnam: { name: "성남시", region: "south", path: "M 222 192 L 262 178 L 288 218 L 258 252 L 218 232 Z" },
            anyang: { name: "안양시", region: "south", path: "M 188 205 L 218 195 L 235 228 L 212 252 L 185 238 Z" },
            bucheon: { name: "부천시", region: "south", path: "M 165 188 L 195 178 L 215 212 L 192 235 L 162 222 Z" },
            gwangmyeong: { name: "광명시", region: "south", path: "M 175 205 L 198 198 L 212 225 L 192 242 L 172 232 Z" },
            pyeongtaek: { name: "평택시", region: "south", path: "M 172 268 L 218 252 L 248 298 L 212 328 L 168 308 Z" },
            siheung: { name: "시흥시", region: "south", path: "M 152 218 L 185 208 L 208 248 L 178 275 L 148 258 Z" },
            ansan: { name: "안산시", region: "south", path: "M 142 248 L 178 238 L 202 278 L 168 308 L 138 288 Z" },
            hwaseong: { name: "화성시", region: "south", path: "M 162 258 L 212 245 L 245 298 L 205 335 L 158 312 Z" },
            osan: { name: "오산시", region: "south", path: "M 212 255 L 238 245 L 258 278 L 238 298 L 208 285 Z" },
            yongin: { name: "용인시", region: "south", path: "M 235 225 L 285 212 L 315 268 L 278 308 L 232 282 Z" },
            gunpo: { name: "군포시", region: "south", path: "M 188 235 L 215 228 L 232 262 L 212 282 L 185 268 Z" },
            uiwang: { name: "의왕시", region: "south", path: "M 202 228 L 228 218 L 248 255 L 225 275 L 198 262 Z" },
            hanam: { name: "하남시", region: "south", path: "M 248 188 L 278 178 L 298 218 L 272 242 L 245 225 Z" },
            gwangju_gg: { name: "광주시", region: "south", path: "M 268 212 L 308 198 L 338 252 L 302 288 L 265 268 Z" },
            icheon: { name: "이천시", region: "south", path: "M 295 232 L 342 218 L 375 275 L 338 315 L 292 292 Z" },
            yeoju: { name: "여주시", region: "south", path: "M 318 262 L 368 248 L 402 308 L 362 352 L 315 325 Z" },
            anseong: { name: "안성시", region: "south", path: "M 262 292 L 315 278 L 352 335 L 308 375 L 258 352 Z" }
        }
    },
    gangwon: {
        name: "강원특별자치도",
        color: "#8E44AD",
        path: "M 285 78 L 415 45 L 465 135 L 438 258 L 345 308 L 275 242 L 268 145 Z",
        hasSubRegions: true,
        subRegions: {
            north: {
                name: "강원 북부 (영서)",
                path: "M 285 78 L 365 58 L 398 118 L 375 188 L 308 218 L 275 158 Z"
            },
            south: {
                name: "강원 남부 (영동)",
                path: "M 365 55 L 415 45 L 465 135 L 438 258 L 345 308 L 308 215 L 375 182 L 398 115 Z"
            }
        },
        districts: {
            // 강원 북부 (영서)
            chuncheon: { name: "춘천시", region: "north", path: "M 295 128 L 342 115 L 368 158 L 338 195 L 292 175 Z" },
            wonju: { name: "원주시", region: "north", path: "M 302 212 L 358 195 L 392 252 L 352 298 L 298 275 Z" },
            hongcheon: { name: "홍천군", region: "north", path: "M 318 158 L 385 142 L 418 198 L 375 242 L 315 218 Z" },
            hoengseong: { name: "횡성군", region: "north", path: "M 328 218 L 388 202 L 422 262 L 378 308 L 325 285 Z" },
            cheorwon: { name: "철원군", region: "north", path: "M 272 85 L 318 72 L 345 115 L 318 152 L 268 132 Z" },
            hwacheon: { name: "화천군", region: "north", path: "M 305 88 L 358 75 L 388 125 L 355 165 L 302 142 Z" },
            yanggu: { name: "양구군", region: "north", path: "M 338 82 L 392 68 L 425 122 L 388 162 L 335 138 Z" },
            inje: { name: "인제군", region: "north", path: "M 368 98 L 428 82 L 462 148 L 418 198 L 365 168 Z" },

            // 강원 남부 (영동)
            gangneung: { name: "강릉시", region: "south", path: "M 395 168 L 458 152 L 488 218 L 442 268 L 388 238 Z" },
            donghae: { name: "동해시", region: "south", path: "M 412 248 L 462 235 L 488 285 L 452 318 L 408 295 Z" },
            sokcho: { name: "속초시", region: "south", path: "M 418 108 L 462 95 L 485 138 L 455 168 L 415 148 Z" },
            samcheok: { name: "삼척시", region: "south", path: "M 398 295 L 455 278 L 488 348 L 448 402 L 392 368 Z" },
            taebaek: { name: "태백시", region: "south", path: "M 378 312 L 428 298 L 458 358 L 422 402 L 372 378 Z" },
            yeongwol: { name: "영월군", region: "south", path: "M 342 298 L 402 282 L 438 348 L 392 402 L 338 372 Z" },
            jeongseon: { name: "정선군", region: "south", path: "M 368 252 L 432 235 L 468 308 L 422 365 L 362 332 Z" },
            pyeongchang: { name: "평창군", region: "south", path: "M 358 212 L 425 195 L 462 265 L 415 318 L 352 285 Z" },
            goseong: { name: "고성군", region: "south", path: "M 398 68 L 448 52 L 478 105 L 445 148 L 395 125 Z" },
            yangyang: { name: "양양군", region: "south", path: "M 408 125 L 465 108 L 498 172 L 458 218 L 405 188 Z" }
        }
    },
    chungbuk: {
        name: "충청북도",
        color: "#D35400",
        path: "M 255 218 L 345 198 L 392 268 L 372 348 L 295 375 L 242 318 Z",
        hasSubRegions: true,
        subRegions: {
            north: {
                name: "충북 북부",
                path: "M 255 218 L 345 198 L 375 258 L 342 305 L 278 318 L 248 272 Z"
            },
            south: {
                name: "충북 남부",
                path: "M 278 312 L 342 298 L 375 252 L 392 268 L 372 348 L 295 375 L 245 335 Z"
            }
        },
        districts: {
            // 충북 북부
            cheongju: { name: "청주시", region: "north", path: "M 268 262 L 322 248 L 358 305 L 318 352 L 265 328 Z" },
            chungju: { name: "충주시", region: "north", path: "M 305 218 L 368 202 L 405 268 L 362 318 L 302 292 Z" },
            jecheon: { name: "제천시", region: "north", path: "M 345 208 L 412 192 L 452 262 L 405 318 L 342 288 Z" },
            jincheon: { name: "진천군", region: "north", path: "M 258 238 L 305 225 L 335 278 L 298 318 L 255 295 Z" },
            goesan: { name: "괴산군", region: "north", path: "M 295 272 L 358 258 L 395 318 L 352 365 L 292 338 Z" },
            eumseong: { name: "음성군", region: "north", path: "M 275 235 L 335 222 L 368 282 L 328 328 L 272 302 Z" },
            jeungpyeong: { name: "증평군", region: "north", path: "M 268 285 L 312 275 L 338 318 L 305 352 L 265 328 Z" },
            danyang: { name: "단양군", region: "north", path: "M 372 235 L 438 218 L 478 292 L 432 352 L 368 318 Z" },

            // 충북 남부
            boeun: { name: "보은군", region: "south", path: "M 292 328 L 352 312 L 388 372 L 345 418 L 288 392 Z" },
            okcheon: { name: "옥천군", region: "south", path: "M 268 348 L 328 332 L 365 395 L 322 442 L 265 415 Z" },
            yeongdong: { name: "영동군", region: "south", path: "M 295 385 L 358 368 L 398 438 L 352 488 L 292 458 Z" }
        }
    },
    chungnam: {
        name: "충청남도",
        color: "#C0392B",
        path: "M 115 248 L 218 228 L 262 302 L 245 385 L 158 412 L 95 348 Z",
        hasSubRegions: true,
        subRegions: {
            north: {
                name: "충남 북부",
                path: "M 115 248 L 218 228 L 252 292 L 225 345 L 148 368 L 105 308 Z"
            },
            south: {
                name: "충남 남부",
                path: "M 148 362 L 225 338 L 252 285 L 262 302 L 245 385 L 158 412 L 100 355 Z"
            }
        },
        districts: {
            // 충남 북부
            cheonan: { name: "천안시", region: "north", path: "M 202 258 L 252 245 L 282 305 L 248 345 L 198 322 Z" },
            gongju: { name: "공주시", region: "north", path: "M 195 318 L 255 302 L 292 365 L 252 412 L 192 385 Z" },
            asan: { name: "아산시", region: "north", path: "M 172 268 L 228 255 L 262 318 L 225 358 L 168 332 Z" },
            dangjin: { name: "당진시", region: "north", path: "M 135 252 L 195 238 L 228 298 L 188 342 L 132 318 Z" },
            seosan: { name: "서산시", region: "north", path: "M 108 278 L 172 262 L 205 328 L 162 378 L 105 348 Z" },
            taean: { name: "태안군", region: "north", path: "M 82 305 L 138 292 L 172 358 L 128 408 L 78 378 Z" },
            yesan: { name: "예산군", region: "north", path: "M 165 318 L 222 302 L 258 368 L 215 418 L 162 392 Z" },
            hongseong: { name: "홍성군", region: "north", path: "M 125 342 L 185 328 L 222 395 L 178 445 L 122 418 Z" },

            // 충남 남부
            buyeo: { name: "부여군", region: "south", path: "M 178 388 L 242 372 L 278 442 L 235 498 L 175 468 Z" },
            cheongyang: { name: "청양군", region: "south", path: "M 168 362 L 232 345 L 268 415 L 225 468 L 165 438 Z" },
            seocheon: { name: "서천군", region: "south", path: "M 118 402 L 182 385 L 222 458 L 175 512 L 115 482 Z" },
            nonsan: { name: "논산시", region: "south", path: "M 202 428 L 268 412 L 308 488 L 262 545 L 198 515 Z" },
            geumsan: { name: "금산군", region: "south", path: "M 245 398 L 312 382 L 355 458 L 305 518 L 242 488 Z" },
            gyeryong: { name: "계룡시", region: "south", path: "M 225 375 L 272 362 L 302 418 L 268 458 L 222 438 Z" }
        }
    },
    jeonbuk: {
        name: "전북특별자치도",
        color: "#2ECC71",
        path: "M 128 398 L 242 368 L 305 448 L 285 535 L 185 568 L 115 495 Z",
        hasSubRegions: true,
        subRegions: {
            north: {
                name: "전북 북부",
                path: "M 128 398 L 242 368 L 285 438 L 245 498 L 162 525 L 118 465 Z"
            },
            south: {
                name: "전북 남부",
                path: "M 162 518 L 245 492 L 285 432 L 305 448 L 285 535 L 185 568 L 115 512 Z"
            }
        },
        districts: {
            // 전북 북부
            jeonju: { name: "전주시", region: "north", path: "M 195 418 L 255 402 L 292 468 L 252 518 L 192 492 Z" },
            gunsan: { name: "군산시", region: "north", path: "M 108 412 L 178 395 L 218 468 L 172 522 L 105 492 Z" },
            iksan: { name: "익산시", region: "north", path: "M 162 402 L 232 385 L 275 458 L 228 512 L 158 485 Z" },
            gimje: { name: "김제시", region: "north", path: "M 142 452 L 212 435 L 255 512 L 205 568 L 138 538 Z" },
            wanju: { name: "완주군", region: "north", path: "M 208 398 L 282 378 L 325 458 L 278 522 L 205 492 Z" },
            buan: { name: "부안군", region: "north", path: "M 102 468 L 172 452 L 215 532 L 162 588 L 98 555 Z" },
            jeongeup: { name: "정읍시", region: "north", path: "M 155 498 L 232 478 L 278 562 L 225 622 L 152 592 Z" },

            // 전북 남부
            gochang: { name: "고창군", region: "south", path: "M 128 548 L 205 528 L 252 615 L 195 675 L 125 645 Z" },
            namwon: { name: "남원시", region: "south", path: "M 232 518 L 312 495 L 362 585 L 305 655 L 228 622 Z" },
            imsil: { name: "임실군", region: "south", path: "M 218 492 L 295 472 L 342 555 L 288 622 L 215 592 Z" },
            sunchang: { name: "순창군", region: "south", path: "M 205 555 L 282 535 L 328 622 L 272 688 L 202 655 Z" },
            muju: { name: "무주군", region: "south", path: "M 282 438 L 358 418 L 408 508 L 352 578 L 278 548 Z" },
            jinan: { name: "진안군", region: "south", path: "M 262 478 L 342 458 L 392 548 L 338 618 L 258 588 Z" },
            jangsu: { name: "장수군", region: "south", path: "M 288 538 L 368 518 L 418 612 L 362 682 L 285 652 Z" }
        }
    },
    jeonnam: {
        name: "전라남도",
        color: "#1E8449",
        path: "M 95 545 L 232 508 L 318 608 L 298 705 L 175 752 L 72 668 Z",
        hasSubRegions: true,
        subRegions: {
            north: {
                name: "전남 북부",
                path: "M 95 545 L 232 508 L 292 588 L 258 665 L 162 695 L 88 625 Z"
            },
            south: {
                name: "전남 남부",
                path: "M 162 688 L 258 658 L 292 582 L 318 608 L 298 705 L 175 752 L 72 682 L 88 632 Z"
            }
        },
        districts: {
            // 전남 북부
            mokpo: { name: "목포시", region: "north", path: "M 92 605 L 132 595 L 155 632 L 125 658 L 88 642 Z" },
            yeosu: { name: "여수시", region: "north", path: "M 275 652 L 335 635 L 378 712 L 328 762 L 268 732 Z" },
            suncheon: { name: "순천시", region: "north", path: "M 252 608 L 318 588 L 362 672 L 312 732 L 248 702 Z" },
            naju: { name: "나주시", region: "north", path: "M 172 582 L 238 562 L 282 645 L 235 702 L 168 672 Z" },
            gwangyang: { name: "광양시", region: "north", path: "M 285 618 L 348 598 L 395 685 L 342 745 L 282 715 Z" },
            damyang: { name: "담양군", region: "north", path: "M 205 538 L 275 518 L 318 602 L 268 662 L 202 632 Z" },
            gokseong: { name: "곡성군", region: "north", path: "M 235 568 L 305 548 L 352 635 L 298 698 L 232 665 Z" },
            gurye: { name: "구례군", region: "north", path: "M 268 555 L 342 535 L 392 625 L 335 688 L 265 655 Z" },
            hampyeong: { name: "함평군", region: "north", path: "M 142 585 L 208 568 L 252 652 L 202 712 L 138 682 Z" },
            yeonggwang: { name: "영광군", region: "north", path: "M 112 555 L 178 538 L 225 625 L 172 688 L 108 655 Z" },
            jangseong: { name: "장성군", region: "north", path: "M 172 555 L 242 535 L 288 622 L 235 685 L 168 652 Z" },
            muan: { name: "무안군", region: "north", path: "M 105 598 L 168 582 L 212 668 L 162 728 L 102 698 Z" },

            // 전남 남부
            sinan: { name: "신안군", region: "south", path: "M 52 625 L 115 608 L 158 702 L 108 768 L 48 735 Z" },
            jindo: { name: "진도군", region: "south", path: "M 72 695 L 138 678 L 185 775 L 132 838 L 68 808 Z" },
            haenam: { name: "해남군", region: "south", path: "M 115 698 L 185 678 L 232 775 L 178 842 L 112 812 Z" },
            yeongam: { name: "영암군", region: "south", path: "M 138 665 L 205 648 L 252 742 L 198 808 L 135 778 Z" },
            gangjin: { name: "강진군", region: "south", path: "M 168 702 L 238 682 L 285 778 L 228 848 L 165 815 Z" },
            jangheung: { name: "장흥군", region: "south", path: "M 205 688 L 278 668 L 328 768 L 272 838 L 202 805 Z" },
            boseong: { name: "보성군", region: "south", path: "M 235 672 L 308 652 L 358 752 L 302 825 L 232 792 Z" },
            goheung: { name: "고흥군", region: "south", path: "M 268 715 L 348 695 L 402 802 L 342 875 L 265 842 Z" },
            wando: { name: "완도군", region: "south", path: "M 172 785 L 242 765 L 292 868 L 235 942 L 168 908 Z" }
        }
    },
    gyeongbuk: {
        name: "경상북도",
        color: "#B8860B",
        path: "M 312 268 L 448 238 L 502 368 L 468 468 L 358 502 L 298 418 Z",
        hasSubRegions: true,
        subRegions: {
            north: {
                name: "경북 북부",
                path: "M 312 268 L 448 238 L 488 338 L 432 418 L 348 448 L 305 368 Z"
            },
            south: {
                name: "경북 남부",
                path: "M 348 442 L 432 412 L 488 332 L 502 368 L 468 468 L 358 502 L 302 435 Z"
            }
        },
        districts: {
            // 경북 북부
            pohang: { name: "포항시", region: "north", path: "M 428 318 L 488 298 L 525 378 L 482 432 L 425 402 Z" },
            gyeongju: { name: "경주시", region: "north", path: "M 408 385 L 478 362 L 518 448 L 468 512 L 405 478 Z" },
            gimcheon: { name: "김천시", region: "north", path: "M 298 348 L 362 328 L 402 408 L 355 468 L 295 438 Z" },
            andong: { name: "안동시", region: "north", path: "M 348 288 L 422 268 L 465 358 L 415 425 L 345 392 Z" },
            gumi: { name: "구미시", region: "north", path: "M 318 378 L 388 358 L 432 442 L 378 508 L 315 475 Z" },
            yeongju: { name: "영주시", region: "north", path: "M 335 268 L 408 248 L 452 338 L 398 405 L 332 372 Z" },
            yeongcheon: { name: "영천시", region: "north", path: "M 392 378 L 462 358 L 508 448 L 455 518 L 388 485 Z" },
            sangju: { name: "상주시", region: "north", path: "M 305 308 L 378 288 L 422 378 L 368 448 L 302 415 Z" },
            mungyeong: { name: "문경시", region: "north", path: "M 322 282 L 395 262 L 438 352 L 385 422 L 318 388 Z" },
            uiseong: { name: "의성군", region: "north", path: "M 348 338 L 425 318 L 472 408 L 418 478 L 345 445 Z" },
            yeongyang: { name: "영양군", region: "north", path: "M 402 298 L 472 278 L 518 368 L 462 438 L 398 405 Z" },
            yeongdeok: { name: "영덕군", region: "north", path: "M 432 288 L 502 268 L 548 358 L 492 428 L 428 395 Z" },
            bonghwa: { name: "봉화군", region: "north", path: "M 378 265 L 455 245 L 502 338 L 448 412 L 375 378 Z" },
            cheongsong: { name: "청송군", region: "north", path: "M 388 328 L 462 308 L 508 402 L 452 472 L 385 438 Z" },
            uljin: { name: "울진군", region: "north", path: "M 458 258 L 535 238 L 585 345 L 528 428 L 455 392 Z" },

            // 경북 남부
            gyeongsan: { name: "경산시", region: "south", path: "M 378 438 L 448 418 L 495 508 L 442 575 L 375 542 Z" },
            gunwi: { name: "군위군", region: "south", path: "M 352 398 L 425 378 L 472 468 L 418 538 L 348 505 Z" },
            chilgok: { name: "칠곡군", region: "south", path: "M 335 425 L 405 405 L 452 498 L 398 565 L 332 532 Z" },
            seongju: { name: "성주군", region: "south", path: "M 318 458 L 392 438 L 442 532 L 385 602 L 315 568 Z" },
            goryeong: { name: "고령군", region: "south", path: "M 328 498 L 402 478 L 452 575 L 395 648 L 325 612 Z" },
            cheongdo: { name: "청도군", region: "south", path: "M 385 478 L 458 458 L 508 558 L 452 632 L 382 598 Z" }
        }
    },
    gyeongnam: {
        name: "경상남도",
        color: "#8B4513",
        path: "M 248 492 L 392 455 L 458 562 L 428 665 L 305 712 L 225 628 Z",
        hasSubRegions: true,
        subRegions: {
            north: {
                name: "경남 북부",
                path: "M 248 492 L 392 455 L 438 545 L 388 622 L 295 655 L 238 578 Z"
            },
            south: {
                name: "경남 남부",
                path: "M 295 648 L 388 615 L 438 538 L 458 562 L 428 665 L 305 712 L 228 645 L 238 585 Z"
            }
        },
        districts: {
            // 경남 북부
            changwon: { name: "창원시", region: "north", path: "M 338 558 L 412 538 L 462 632 L 405 702 L 335 668 Z" },
            jinju: { name: "진주시", region: "north", path: "M 272 578 L 352 555 L 402 652 L 345 722 L 268 688 Z" },
            gimhae: { name: "김해시", region: "north", path: "M 352 528 L 425 508 L 475 605 L 418 675 L 348 642 Z" },
            miryang: { name: "밀양시", region: "north", path: "M 365 498 L 442 478 L 495 578 L 438 652 L 362 618 Z" },
            geoje: { name: "거제시", region: "north", path: "M 398 668 L 472 648 L 525 758 L 468 832 L 395 795 Z" },
            yangsan: { name: "양산시", region: "north", path: "M 385 515 L 458 495 L 512 598 L 455 672 L 382 638 Z" },
            uiryeong: { name: "의령군", region: "north", path: "M 305 545 L 378 525 L 428 622 L 372 695 L 302 662 Z" },
            haman: { name: "함안군", region: "north", path: "M 318 582 L 395 562 L 445 662 L 388 735 L 315 702 Z" },
            changnyeong: { name: "창녕군", region: "north", path: "M 342 532 L 418 512 L 468 612 L 412 685 L 338 652 Z" },
            hapcheon: { name: "합천군", region: "north", path: "M 285 508 L 365 488 L 418 588 L 358 665 L 282 632 Z" },

            // 경남 남부
            tongyeong: { name: "통영시", region: "south", path: "M 365 702 L 442 682 L 495 788 L 438 862 L 362 825 Z" },
            sacheon: { name: "사천시", region: "south", path: "M 308 685 L 385 665 L 438 772 L 378 848 L 305 812 Z" },
            goseong_gn: { name: "고성군", region: "south", path: "M 345 698 L 422 678 L 475 788 L 418 865 L 342 828 Z" },
            namhae: { name: "남해군", region: "south", path: "M 288 728 L 362 708 L 415 818 L 355 895 L 285 858 Z" },
            hadong: { name: "하동군", region: "south", path: "M 262 698 L 342 678 L 395 788 L 335 865 L 258 828 Z" },
            sancheong: { name: "산청군", region: "south", path: "M 272 632 L 352 612 L 405 718 L 345 795 L 268 758 Z" },
            hamyang: { name: "함양군", region: "south", path: "M 255 588 L 338 568 L 392 678 L 332 755 L 252 718 Z" },
            geochang: { name: "거창군", region: "south", path: "M 278 545 L 358 525 L 412 632 L 352 712 L 275 675 Z" }
        }
    },
    jeju: {
        name: "제주특별자치도",
        color: "#FF7F50",
        path: "M 135 745 L 258 732 L 285 798 L 255 858 L 148 872 L 115 812 Z",
        hasSubRegions: false,
        districts: {
            jeju_city: { name: "제주시", path: "M 135 745 L 258 732 L 278 785 L 198 802 L 128 788 Z" },
            seogwipo: { name: "서귀포시", path: "M 128 788 L 198 802 L 278 785 L 285 798 L 255 858 L 148 872 L 115 812 Z" }
        }
    }
};

// 모든 시군구 목록 생성
function getAllDistricts() {
    const districts = [];
    for (const [provinceId, province] of Object.entries(PROVINCES)) {
        for (const [districtId, district] of Object.entries(province.districts)) {
            districts.push({
                id: districtId,
                name: district.name,
                provinceId: provinceId,
                provinceName: province.name,
                region: district.region || null
            });
        }
    }
    return districts;
}

// 지역 색상
const REGION_COLORS = {
    seoul: "#FF6B6B",
    busan: "#4ECDC4",
    daegu: "#9B59B6",
    incheon: "#3498DB",
    gwangju: "#E67E22",
    daejeon: "#F1C40F",
    ulsan: "#1ABC9C",
    sejong: "#2980B9",
    gyeonggi: "#27AE60",
    gangwon: "#8E44AD",
    chungbuk: "#D35400",
    chungnam: "#C0392B",
    jeonbuk: "#2ECC71",
    jeonnam: "#1E8449",
    gyeongbuk: "#B8860B",
    gyeongnam: "#8B4513",
    jeju: "#FF7F50"
};
