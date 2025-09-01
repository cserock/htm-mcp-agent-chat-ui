# 🖥️ tbb-mcp-agent-chat-ui

`tbb-mcp-agent-chat-ui` 는 `messages` 키를 가진 모든 LangGraph 서버와 채팅 인터페이스를 통해 대화할 수 있는 Next.js 애플리케이션입니다.

> [!NOTE]
> tbb-mcp-agent-chat-ui는 LangGraph 의 공식 템플릿인 [Agent Chat UI](https://github.com/langchain-ai/agent-chat-ui) 의 포크 버전입니다.

## 🔥 기존 Agent Chat UI 와 다른 점

- .env 에서 로고 이미지, 타이틀 설정 가능
- Vision Model 을 위한 이미지 파일 업로드 기능 추가
- 사용자 별 쓰레드 구분 (LocalStorage 로 UserID 관리)

## 설정

의존성 설치:

```bash
npm install

or

yarn

or

pnpm install
```

앱 실행:

```bash
# dev
npm run dev

or

yarn dev

or

pnpm dev

# producttion
# build
pnpm build

# start
pnpm start:prod

# stop
pnpm stop:prod
```




앱은 `http://localhost:3000`에서 사용할 수 있습니다.

## 💁 사용법

앱이 실행되면 다음 정보를 입력하라는 메시지가 표시됩니다:

- **Deployment URL**: 대화하고 싶은 LangGraph 서버의 URL입니다. 이는 프로덕션 또는 개발 URL일 수 있습니다.
- **Assistant/Graph ID**: 채팅 인터페이스를 통해 실행을 가져오고 제출할 때 사용할 그래프의 이름 또는 어시스턴트의 ID입니다.
- **LangSmith API 키**: (배포된 LangGraph 서버에 연결할 때만 필요) LangGraph 서버로 전송된 요청을 인증할 때 사용할 LangSmith API 키입니다.

이러한 값을 입력한 후 `Continue`를 클릭하세요. 그러면 LangGraph 서버와 채팅을 시작할 수 있는 채팅창으로 이동합니다.

## ⚙️ 환경 변수

다음 환경 변수를 설정하여 초기 입력값을 우회할 수 있습니다:

```bash
NEXT_PUBLIC_API_URL=http://localhost:2024
NEXT_PUBLIC_ASSISTANT_ID=agent
```

> [!TIP]
> 프로덕션 LangGraph 서버에 연결하려면 [프로덕션으로 전환](#프로덕션으로-전환) 섹션을 읽어보세요.

이러한 변수를 사용하려면:

1. `.env.example` 파일을 `.env`라는 새 파일로 복사하세요
2. `.env` 파일에 값을 입력하세요
3. 애플리케이션을 다시 시작하세요

이러한 환경 변수가 설정되면 애플리케이션은 초기 입력값 대신 이 변수들을 사용합니다.

```
# .env

# LangGraph API URL
NEXT_PUBLIC_API_URL=http://localhost:2024
# LangGraph Graph or Assistant ID
NEXT_PUBLIC_ASSISTANT_ID=agent
# 앱 이름
NEXT_PUBLIC_APP_NAME=teddynote LAB
# 앱 로고
NEXT_PUBLIC_APP_LOGO=/teddynote-logo.png
LANGSMITH_API_KEY=
```