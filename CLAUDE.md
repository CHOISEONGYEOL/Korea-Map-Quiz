# CLAUDE.md - 프로젝트 협업 규칙

## 절대규칙

### 1. PR 생성 전 사용자 확인 필수

PR 생성 전 반드시 사용자에게 **"수정된 화면을 직접 확인하셨나요?"**를 물어볼 것.
사용자가 확인했다고 답하기 전에는 절대 PR을 생성하지 않는다.

- **Why:** PR 52개 test plan 항목 중 0개가 실제 체크됨. 코드 레벨 검증만으로는 UX 버그(줌 라벨 크기, 터치 안됨, 인셋 위치 어색함 등)를 잡을 수 없고, 머지 후 발견→재수정 PR이 24% 발생했음.
- **How to apply:** 사용자가 "커밋하고 PR 만들어줘"라고 하면, PR 생성 전에 "배포 환경이나 로컬에서 수정 사항 확인해보셨나요?"를 먼저 물어본다. 확인 완료 응답 후에만 PR을 생성한다.

### 2. 빌드 전 최신 main pull 필수

새 브랜치에서 npm run build 하기 전에 반드시 최신 main을 pull할 것.

- **Why:** 빌드 결과물(assets/)이 Git에 포함되어 있으므로, 이전 PR의 변경사항이 누락되지 않도록 최신 main 기반으로 빌드해야 한다.
- **How to apply:** 브랜치 작업 시 반드시 아래 순서를 따를 것:
  1. `git checkout main && git pull`
  2. `git checkout -b feat/...` (새 브랜치 생성)
  3. 소스 수정
  4. `npm run build`
  5. 커밋

### 3. Playwright MCP 서버 설정 유지 필수

프로젝트 루트의 `.mcp.json`에 Playwright MCP 설정이 반드시 포함되어야 한다. Claude Code에서 브라우저 제어(테스트, 스크린샷 등)를 위해 사용한다.

- **Why:** 기존 Puppeteer MCP(`@modelcontextprotocol/server-puppeteer`)가 deprecated되어 Playwright MCP(`@playwright/mcp`)로 교체함. 설정이 누락되면 브라우저 자동화를 사용할 수 없다.
- **How to apply:**
  - `.mcp.json` 설정:
    ```json
    {
      "mcpServers": {
        "playwright": {
          "type": "stdio",
          "command": "cmd",
          "args": ["/c", "npx", "-y", "@playwright/mcp"],
          "env": {}
        }
      }
    }
    ```
  - Windows에서 반드시 `cmd /c` 래퍼 사용 (없으면 "Connection closed" 에러)
  - `claude mcp add` CLI 명령 사용 시 `/c`가 `C:/`로 변환되는 버그 있음 → `.mcp.json` 직접 편집할 것
  - 설정 변경 후 Claude Code 재시작 필수 (`Ctrl+Shift+P` → `Developer: Reload Window`)
