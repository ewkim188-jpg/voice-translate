# 🎙️ VoiceTranslate — 음성인식 5개국어 번역기

한국어로 말하면 **영어, 중국어, 일본어, 불어, 독일어**로 실시간 번역해주는 웹 앱입니다.

![VoiceTranslate](https://img.shields.io/badge/VoiceTranslate-v1.0-8a65ff?style=for-the-badge)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🎙️ **실시간 음성인식** | 한국어 발화 → 자동 번역 트리거 |
| 🌐 **5개국어 동시 번역** | 🇺🇸 영어 · 🇨🇳 중국어 · 🇯🇵 일본어 · 🇫🇷 불어 · 🇩🇪 독일어 |
| 🔊 **TTS 발음 재생** | 원어민 발음으로 번역 결과 음성 재생 |
| 🎭 **감정 분석** | 긍정 😊 / 부정 😔 / 중립 😐 자동 감지 |
| 📖 **단어 플래시카드** | 단어별 정확한 5개국어 번역 카드 |
| 🎛️ **TTS 속도/피치 조절** | 말하기 속도 슬라이더 제공 |
| ⌨️ **타이핑 모드** | 음성 외 텍스트 직접 입력 지원 |
| 💡 **문화 팁** | 언어별 국가 문화·예절 힌트 |
| ⭐ **즐겨찾기** | localStorage 영구 저장 |
| 🕐 **번역 히스토리** | 최대 50개 기록 저장 및 재사용 |
| 📋 **클립보드 복사** | 언어별 원클릭 복사 |
| 🔗 **URL 공유** | 번역 결과를 링크로 공유 |
| 🌙 **다크/라이트 모드** | 테마 전환 |
| 📱 **반응형 디자인** | 모바일 지원 |

---

## 🚀 사용 방법

### 로컬 실행
별도 설치 없이 `index.html`을 **Chrome 또는 Edge** 브라우저에서 열면 바로 실행됩니다.

### GitHub Pages
`https://ewkim188-jpg.github.io/voice-translate` 에서 온라인으로 사용 가능합니다.

---

## 🛠️ 기술 스택

- **번역 API**: [MyMemory](https://mymemory.translated.net/) (무료, 키 불필요)
- **음성인식**: Web Speech API (`SpeechRecognition`)
- **TTS**: Web Speech API (`SpeechSynthesis`)
- **저장소**: `localStorage`
- **폰트**: Google Fonts (Outfit, Noto Sans KR)

> ⚠️ 음성인식은 **Chrome / Edge** 브라우저에서만 작동합니다.

---

## 📁 파일 구조

```
voice-translate/
├── index.html   ← HTML 구조
├── style.css    ← 스타일 (Glassmorphism 다크 테마)
├── app.js       ← 모든 기능 로직
└── README.md
```

---


