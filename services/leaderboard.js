/**
 * 리더보드 서비스 (Supabase 연동)
 * Supabase CDN 버전 사용
 */

class LeaderboardService {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.init();
    }

    init() {
        // Supabase 클라이언트 초기화
        if (typeof SUPABASE_CONFIG !== 'undefined' &&
            SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' &&
            window.supabase) {
            try {
                this.supabase = window.supabase.createClient(
                    SUPABASE_CONFIG.url,
                    SUPABASE_CONFIG.anonKey
                );
                this.initialized = true;
                console.log('[Leaderboard] Supabase 연결 성공');
            } catch (error) {
                console.error('[Leaderboard] Supabase 연결 실패:', error);
            }
        } else {
            console.warn('[Leaderboard] Supabase 설정이 완료되지 않았습니다. config.js를 확인하세요.');
        }
    }

    /**
     * 점수 저장
     * @param {Object} entry - 점수 정보
     * @param {string} entry.topic - 게임 종류 ('korea', 'world')
     * @param {string} entry.mode - 게임 모드 ('speed', 'survival')
     * @param {number} entry.score - 점수
     * @param {number} entry.correctCount - 정답 수
     * @param {number} entry.maxCombo - 최대 콤보
     * @param {string} entry.nickname - 닉네임
     * @returns {Promise<boolean>} - 저장 성공 여부
     */
    async saveScore(entry) {
        if (!this.supabase) {
            console.warn('[Leaderboard] Supabase가 초기화되지 않았습니다.');
            return false;
        }

        try {
            const { error } = await this.supabase
                .from('leaderboard')
                .insert({
                    topic: entry.topic,
                    mode: entry.mode,
                    score: entry.score,
                    correct_count: entry.correctCount || 0,
                    max_combo: entry.maxCombo || 0,
                    nickname: entry.nickname,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.error('[Leaderboard] 점수 저장 실패:', error);
                return false;
            }

            console.log('[Leaderboard] 점수 저장 성공:', entry);
            return true;
        } catch (error) {
            console.error('[Leaderboard] 점수 저장 오류:', error);
            return false;
        }
    }

    /**
     * 리더보드 조회
     * @param {string} topic - 게임 종류 ('korea', 'world')
     * @param {string} mode - 게임 모드 ('speed', 'survival')
     * @param {number} limit - 조회 개수 (기본 100)
     * @returns {Promise<Array>} - 리더보드 엔트리 배열
     */
    async getLeaderboard(topic, mode, limit = 100) {
        if (!this.supabase) {
            console.warn('[Leaderboard] Supabase가 초기화되지 않았습니다.');
            return [];
        }

        try {
            const { data, error } = await this.supabase
                .from('leaderboard')
                .select('*')
                .eq('topic', topic)
                .eq('mode', mode)
                .order('score', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Leaderboard] 조회 실패:', error);
                return [];
            }

            return (data || []).map(row => ({
                id: row.id,
                topic: row.topic,
                mode: row.mode,
                score: row.score,
                correctCount: row.correct_count,
                maxCombo: row.max_combo,
                nickname: row.nickname,
                date: row.created_at
            }));
        } catch (error) {
            console.error('[Leaderboard] 조회 오류:', error);
            return [];
        }
    }

    /**
     * 현재 점수의 순위 확인
     * @param {string} topic - 게임 종류
     * @param {string} mode - 게임 모드
     * @param {number} score - 현재 점수
     * @returns {Promise<number>} - 순위 (1부터 시작, 101 이상이면 TOP 100 밖)
     */
    async checkRank(topic, mode, score) {
        if (!this.supabase) {
            return 101; // Supabase 미연결 시 순위권 밖
        }

        try {
            const { count, error } = await this.supabase
                .from('leaderboard')
                .select('*', { count: 'exact', head: true })
                .eq('topic', topic)
                .eq('mode', mode)
                .gt('score', score);

            if (error) {
                console.error('[Leaderboard] 순위 확인 실패:', error);
                return 101;
            }

            return (count || 0) + 1; // 나보다 높은 점수 + 1 = 내 순위
        } catch (error) {
            console.error('[Leaderboard] 순위 확인 오류:', error);
            return 101;
        }
    }

    /**
     * 리더보드가 사용 가능한지 확인
     * @returns {boolean}
     */
    isAvailable() {
        return this.initialized && this.supabase !== null;
    }
}

// 전역 인스턴스 생성
const leaderboardService = new LeaderboardService();
