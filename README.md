# 📰 Auto Newsletter Generator

AI를 활용한 뉴스레터 자동 생성 도구입니다. 주제만 입력하면 자동으로 5개의 소주제와 상세 내용을 포함한 완성된 뉴스레터를 HTML과 마크다운 형식으로 생성합니다.

## ✨ 주요 기능

- 🤖 **AI 기반 콘텐츠 생성**: Claude AI를 활용한 고품질 뉴스레터 콘텐츠 자동 생성
- 📝 **5개 소주제 자동 구성**: 주제에 맞는 체계적인 소주제 자동 생성
- 🎨 **전문적인 디자인**: 사전 제작된 HTML 템플릿 활용
- 💾 **이중 저장**: 로컬 폴더와 옵시디언 볼트에 자동 저장
- 📊 **마크다운 지원**: HTML과 마크다운 형식 동시 생성

## 📋 생성 규칙

- 주제(H1)에 맞는 **5가지 소주제(H2)** 자동 구성
- 각 소주제의 내용은 **2000자 내외** (한국어 기준)
- 전체 글의 양은 **12000자 이하**
- 주제의 전체 흐름을 고려한 논리적 구성

## 🚀 설치 방법

### 1. 의존성 설치

```bash
cd C:\Users\raingo02\ai-root\newletter
npm install
```

### 2. API Key 설정

Anthropic API Key가 필요합니다:
- [Anthropic Console](https://console.anthropic.com/settings/keys)에서 API Key 발급
- 앱 실행 시 입력하거나 환경변수로 설정

## 💻 사용 방법

### 앱 실행

```bash
npm start
```

### 입력 항목

1. **Anthropic API Key**: Claude AI API 키
2. **주제**: 생성할 뉴스레터의 주제
3. **옵시디언 폴더명**: 옵시디언 볼트 내 저장할 폴더명

### 예시

```
? Anthropic API Key를 입력하세요: sk-ant-xxxxx
? 뉴스레터 주제를 입력하세요: 건강한 식습관의 중요성
? 옵시디언 폴더명을 입력하세요: Newsletter
```

## 📁 프로젝트 구조

```
newletter/
├── src/
│   ├── index.js          # 메인 앱 로직
│   ├── generator.js      # AI 콘텐츠 생성 및 HTML 변환
│   └── storage.js        # 파일 저장 관리
├── templates/
│   └── template.html     # 뉴스레터 HTML 템플릿
├── News Completion/      # 생성된 뉴스레터 저장 폴더
├── package.json
└── README.md
```

## 📂 저장 위치

생성된 뉴스레터는 다음 위치에 저장됩니다:

1. **로컬 저장**:
   - 경로: `C:\Users\raingo02\ai-root\newletter\News Completion\`
   - 파일: HTML 및 마크다운 파일

2. **옵시디언 저장**:
   - 경로: `C:\Users\raingo02\Documents\Obsidian Vault\eBookMaking\[지정한 폴더]\`
   - 파일: 마크다운 파일

## 🎨 템플릿 커스터마이징

`templates/template.html` 파일을 수정하여 디자인을 커스터마이징할 수 있습니다.

## 🔧 기술 스택

- **Node.js**: 런타임 환경
- **Anthropic Claude AI**: 콘텐츠 생성
- **Inquirer.js**: 대화형 CLI
- **Chalk**: 터미널 색상 출력
- **Ora**: 로딩 스피너

## 📝 라이선스

ISC

## 🙋‍♂️ 문의

문제가 발생하거나 개선 사항이 있으면 이슈를 등록해주세요.
