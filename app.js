/* ================================================
   VoiceTranslate — app.js
   ================================================ */

'use strict';

// ─── Language Configuration ────────────────────────────────
const LANGUAGES = [
    {
        code: 'en-US', api: 'en',
        name: 'English', native: 'English', flag: '🇺🇸',
        ttsLang: 'en-US',
        romanize: false,
        cultural: '🇺🇸 영어권에서는 직접적이고 명확한 표현을 선호합니다. "Please"와 "Thank you"는 예절의 기본입니다.'
    },
    {
        code: 'zh-CN', api: 'zh',
        name: '中文', native: 'Chinese', flag: '🇨🇳',
        ttsLang: 'zh-CN',
        romanize: true, romanLabel: 'Pinyin',
        cultural: '🇨🇳 중국에서는 체면(面子, miànzi)을 매우 중시합니다. 공식 자리에서는 직함으로 상대를 부르세요.'
    },
    {
        code: 'ja-JP', api: 'ja',
        name: '日本語', native: 'Japanese', flag: '🇯🇵',
        ttsLang: 'ja-JP',
        romanize: true, romanLabel: 'Romaji',
        cultural: '🇯🇵 일본에서는 "스미마셍(すみません)"이 "실례합니다"와 "감사합니다" 두 가지 의미로 쓰입니다.'
    },
    {
        code: 'fr-FR', api: 'fr',
        name: 'Français', native: 'French', flag: '🇫🇷',
        ttsLang: 'fr-FR',
        romanize: false,
        cultural: '🇫🇷 프랑스인들은 인사할 때 볼을 맞대는 "비주(bisou)" 문화가 있습니다. 식사는 천천히, 여유롭게!'
    },
    {
        code: 'de-DE', api: 'de',
        name: 'Deutsch', native: 'German', flag: '🇩🇪',
        ttsLang: 'de-DE',
        romanize: false,
        cultural: '🇩🇪 독일에서는 시간 약속을 매우 중요시합니다. "Pünktlichkeit(퀀클리히카잇)"은 시간 엄수를 의미합니다.'
    }
];

// Simple pinyin/romaji lookup for demonstration
const ROMANIZATION_MAP = {
    ja: { '私': 'Watashi', 'こんにちは': 'Konnichiwa', 'ありがとう': 'Arigatou', 'すみません': 'Sumimasen', 'はい': 'Hai', 'いいえ': 'Iie', '日本語': 'Nihongo' },
};

// Sentiment keywords
const SENTIMENT = {
    positive: ['좋아', '행복', '기쁘', '감사', '사랑', '훌륭', '최고', '좋습니다', '감사합니다', '반가워', '즐거', '멋지', '훌륭', '완벽', '성공', '희망', '기대', '아름답'],
    negative: ['슬프', '화나', '싫어', '나쁘', '최악', '힘들', '어렵', '안타깝', '실망', '걱정', '두렵', '아프', '지루', '실패', '문제', '짜증'],
};

// ─── State ─────────────────────────────────────────────────
let isRecording = false;
let recognition = null;
let currentText = '';
let translations = {};
let history = JSON.parse(localStorage.getItem('vt_history') || '[]');
let favorites = JSON.parse(localStorage.getItem('vt_favorites') || '[]');
let vocabWords = [];
let vocabIndex = 0;
let ttsRate = 1.0;
let ttsPitch = 1.0;

// ─── DOM Elements ──────────────────────────────────────────
const micBtn = document.getElementById('micBtn');
const micHint = document.getElementById('micHint');
const micStatus = document.getElementById('micStatus');
const soundWaves = document.getElementById('soundWaves');
const recognizedBlock = document.getElementById('recognizedBlock');
const recognizedText = document.getElementById('recognizedText');
const sentimentBadge = document.getElementById('sentimentBadge');
const resultsSection = document.getElementById('resultsSection');
const cardsGrid = document.getElementById('cardsGrid');
const loadingOverlay = document.getElementById('loadingOverlay');
const ttsControls = document.getElementById('ttsControls');

const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const translateBtn = document.getElementById('translateBtn');

const historyToggle = document.getElementById('historyToggle');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const historyClose = document.getElementById('historyClose');
const historyBadge = document.getElementById('historyBadge');
const clearHistory = document.getElementById('clearHistory');

const favToggle = document.getElementById('favToggle');
const favPanel = document.getElementById('favPanel');
const favList = document.getElementById('favList');
const favClose = document.getElementById('favClose');
const favBadge = document.getElementById('favBadge');
const clearFav = document.getElementById('clearFav');

const backdrop = document.getElementById('backdrop');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

const voiceTab = document.getElementById('voiceTab');
const textTab = document.getElementById('textTab');
const voicePanel = document.getElementById('voicePanel');
const textPanel = document.getElementById('textPanel');

const saveHistoryBtn = document.getElementById('saveHistoryBtn');
const addFavBtn = document.getElementById('addFavBtn');
const shareBtn = document.getElementById('shareBtn');
const shareModal = document.getElementById('shareModal');
const shareClose = document.getElementById('shareClose');
const shareUrl = document.getElementById('shareUrl');
const copyShareBtn = document.getElementById('copyShareBtn');

const vocabSection = document.getElementById('vocabSection');
const vocabCard = document.getElementById('vocabCard');
const vocabFront = document.getElementById('vocabFront');
const vocabBack = document.getElementById('vocabBack');
const vocabCount = document.getElementById('vocabCount');
const prevVocab = document.getElementById('prevVocab');
const nextVocab = document.getElementById('nextVocab');

const ttsRateInput = document.getElementById('ttsRate');
const ttsPitchInput = document.getElementById('ttsPitch');
const ttsRateVal = document.getElementById('ttsRateVal');
const ttsPitchVal = document.getElementById('ttsPitchVal');

// ─── Init ──────────────────────────────────────────────────
function init() {
    // Check URL params for shared translation
    const params = new URLSearchParams(window.location.search);
    const sharedText = params.get('t');
    if (sharedText) {
        textInput.value = decodeURIComponent(sharedText);
        charCount.textContent = textInput.value.length;
        switchMode('text');
        translateText(textInput.value);
    }

    updateBadges();
    renderHistory();
    renderFavorites();
    setupSpeechRecognition();
}

// ─── Theme Toggle ──────────────────────────────────────────
const SUN_SVG = `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`;
const MOON_SVG = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeIcon.innerHTML = isDark ? MOON_SVG : SUN_SVG;
});

// ─── Mode Tabs ─────────────────────────────────────────────
function switchMode(mode) {
    if (mode === 'voice') {
        voiceTab.classList.add('active');
        textTab.classList.remove('active');
        voicePanel.classList.remove('hidden');
        textPanel.classList.add('hidden');
    } else {
        textTab.classList.add('active');
        voiceTab.classList.remove('active');
        textPanel.classList.remove('hidden');
        voicePanel.classList.add('hidden');
    }
}
voiceTab.addEventListener('click', () => switchMode('voice'));
textTab.addEventListener('click', () => switchMode('text'));

// ─── TTS Controls ──────────────────────────────────────────
ttsRateInput.addEventListener('input', () => {
    ttsRate = parseFloat(ttsRateInput.value);
    ttsRateVal.textContent = ttsRate.toFixed(1) + '×';
});
ttsPitchInput.addEventListener('input', () => {
    ttsPitch = parseFloat(ttsPitchInput.value);
    ttsPitchVal.textContent = ttsPitch.toFixed(1);
});

// ─── Text Input ────────────────────────────────────────────
textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length;
});
translateBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) { showToast('텍스트를 입력해 주세요.', 'error'); return; }
    translateText(text);
});
textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) translateBtn.click();
});

// ─── Speech Recognition ────────────────────────────────────
function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        micBtn.disabled = true;
        micHint.textContent = '⚠️ 이 브라우저는 음성인식을 지원하지 않습니다. Chrome을 사용해 주세요.';
        micHint.style.color = 'var(--danger)';
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        soundWaves.classList.add('active');
        micHint.textContent = '듣고 있습니다... 말씀해 주세요';
        micStatus.textContent = '🔴 녹음 중';
    };

    recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) final += transcript;
            else interim += transcript;
        }
        const display = final || interim;
        showRecognizedText(display);
        if (final) {
            currentText = final;
            translateText(final);
        }
    };

    recognition.onerror = (event) => {
        stopRecording();
        const msgs = {
            'no-speech': '음성이 감지되지 않았습니다. 다시 시도해 주세요.',
            'audio-capture': '마이크에 접근할 수 없습니다. 권한을 확인해 주세요.',
            'not-allowed': '마이크 사용 권한이 거부되었습니다.',
            'network': '네트워크 오류가 발생했습니다.',
        };
        showToast(msgs[event.error] || `오류: ${event.error}`, 'error');
        micStatus.textContent = '';
    };

    recognition.onend = () => {
        stopRecording();
    };
}

function stopRecording() {
    isRecording = false;
    micBtn.classList.remove('recording');
    soundWaves.classList.remove('active');
    micHint.textContent = '클릭하여 한국어로 말하기';
    micStatus.textContent = '';
}

micBtn.addEventListener('click', () => {
    if (!recognition) return;
    if (isRecording) {
        recognition.stop();
        stopRecording();
    } else {
        recognition.start();
    }
});

function showRecognizedText(text) {
    recognizedBlock.style.display = 'block';
    recognizedText.textContent = text;
    analyzeSentiment(text);
}

// ─── Sentiment Analysis ────────────────────────────────────
function analyzeSentiment(text) {
    let posScore = 0, negScore = 0;
    SENTIMENT.positive.forEach(w => { if (text.includes(w)) posScore++; });
    SENTIMENT.negative.forEach(w => { if (text.includes(w)) negScore++; });

    sentimentBadge.className = 'sentiment-badge';
    if (posScore > negScore) {
        sentimentBadge.textContent = '😊 긍정적';
        sentimentBadge.classList.add('sentiment-pos');
    } else if (negScore > posScore) {
        sentimentBadge.textContent = '😔 부정적';
        sentimentBadge.classList.add('sentiment-neg');
    } else {
        sentimentBadge.textContent = '😐 중립';
        sentimentBadge.classList.add('sentiment-neu');
    }
}

// ─── Translation ───────────────────────────────────────────
async function translateText(text) {
    if (!text.trim()) return;
    currentText = text;

    // Show loading
    loadingOverlay.style.display = 'flex';
    showRecognizedText(text);
    analyzeSentiment(text);

    // Build card skeletons
    resultsSection.style.display = 'block';
    buildSkeletonCards();

    try {
        const results = await Promise.allSettled(
            LANGUAGES.map(lang => fetchTranslation(text, lang))
        );

        translations = {};
        cardsGrid.innerHTML = '';

        LANGUAGES.forEach((lang, i) => {
            const result = results[i];
            const translatedText = result.status === 'fulfilled' ? result.value : '번역 실패. 다시 시도해 주세요.';
            translations[lang.api] = translatedText;
            cardsGrid.appendChild(buildCard(lang, translatedText));
        });

        ttsControls.style.display = 'flex';
        buildVocabCards(text);
    } catch (err) {
        showToast('번역 중 오류가 발생했습니다.', 'error');
        console.error(err);
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

async function fetchTranslation(text, lang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ko|${lang.api}&de=voicetranslate@demo.com`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    if (data.responseStatus !== 200) throw new Error(data.responseDetails || 'Translation failed');
    return data.responseData.translatedText;
}

function buildSkeletonCards() {
    cardsGrid.innerHTML = '';
    LANGUAGES.forEach(lang => {
        const card = document.createElement('div');
        card.className = 'lang-card';
        card.setAttribute('data-lang', lang.api);
        card.innerHTML = `
      <div class="card-header">
        <div class="lang-info">
          <span class="lang-flag">${lang.flag}</span>
          <div>
            <div class="lang-name">${lang.native}</div>
            <div class="lang-native">${lang.name}</div>
          </div>
        </div>
      </div>
      <div class="loading-text">
        번역 중<span class="dots"><span></span><span></span><span></span></span>
      </div>
    `;
        cardsGrid.appendChild(card);
    });
}

function buildCard(lang, text) {
    const card = document.createElement('div');
    card.className = 'lang-card';
    card.setAttribute('data-lang', lang.api);

    const romanHtml = lang.romanize ? `<div class="romanization" id="roman-${lang.api}"></div>` : '';
    const culturalHtml = `
    <div class="cultural-tip">
      <div class="cultural-tip-label">💡 문화 팁</div>
      ${lang.cultural}
    </div>
  `;

    card.innerHTML = `
    <div class="card-header">
      <div class="lang-info">
        <span class="lang-flag">${lang.flag}</span>
        <div>
          <div class="lang-name">${lang.native}</div>
          <div class="lang-native">${lang.name}</div>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-btn speak-btn" title="발음 듣기 (TTS)" data-lang="${lang.ttsLang}" data-text="${escapeAttr(text)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </button>
        <button class="card-btn copy-btn" title="복사" data-text="${escapeAttr(text)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="translation-text">${text}</div>
    ${romanHtml}
    ${culturalHtml}
  `;

    // Speak button
    card.querySelector('.speak-btn').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        speakText(btn.dataset.text, btn.dataset.lang);
    });

    // Copy button
    card.querySelector('.copy-btn').addEventListener('click', (e) => {
        copyToClipboard(e.currentTarget.dataset.text, lang.native);
    });

    return card;
}

function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ─── TTS ───────────────────────────────────────────────────
function speakText(text, lang) {
    if (!window.speechSynthesis) { showToast('TTS를 지원하지 않는 브라우저입니다.', 'error'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;
    window.speechSynthesis.speak(utterance);
}

// ─── Clipboard ─────────────────────────────────────────────
async function copyToClipboard(text, langName) {
    try {
        await navigator.clipboard.writeText(text);
        showToast(`${langName} 텍스트가 복사되었습니다! 📋`, 'success');
    } catch {
        showToast('복사에 실패했습니다.', 'error');
    }
}

// ─── Vocab Flashcards ──────────────────────────────────────
// vocabData: array of { word: string, translations: { en, zh, ja, fr, de } }
let vocabData = [];

async function buildVocabCards(sourceText) {
    // Extract unique words (Korean), strip punctuation, filter length
    const rawWords = [...new Set(
        sourceText
            .replace(/[.,!?~…。、！？]/g, '')
            .split(/\s+/)
            .filter(w => w.length >= 1 && w.length <= 10)
    )].slice(0, 6); // max 6 words to limit API calls

    if (rawWords.length === 0) {
        vocabSection.style.display = 'none';
        return;
    }

    vocabWords = rawWords;
    vocabData = rawWords.map(w => ({ word: w, translations: {} }));
    vocabIndex = 0;
    vocabSection.style.display = 'block';
    vocabCard.classList.remove('flipped');

    // Show loading state on card
    vocabFront.innerHTML = `<div class="vocab-word">${rawWords[0]}</div><div class="vocab-hint">번역 불러오는 중...</div>`;
    vocabBack.innerHTML = `<div class="loading-text">번역 중<span class="dots"><span></span><span></span><span></span></span></div>`;

    // Fetch individual word translations for all words × all languages in parallel
    const tasks = [];
    rawWords.forEach((word, wi) => {
        LANGUAGES.forEach(lang => {
            tasks.push(
                fetchTranslation(word, lang)
                    .then(result => { vocabData[wi].translations[lang.api] = result; })
                    .catch(() => { vocabData[wi].translations[lang.api] = '?'; })
            );
        });
    });

    await Promise.allSettled(tasks);

    // Render first card now that translations are ready
    renderVocabCard();
}

function renderVocabCard() {
    const entry = vocabData[vocabIndex];
    if (!entry) return;

    vocabCount.textContent = `${vocabIndex + 1} / ${vocabData.length}`;
    vocabCard.classList.remove('flipped');

    vocabFront.innerHTML = `
        <div class="vocab-word">${entry.word}</div>
        <div class="vocab-hint">카드를 클릭하여 번역 보기 👆</div>
    `;

    // Build per-language translation rows
    const transLines = LANGUAGES.map(l => {
        const t = entry.translations[l.api] || '...';
        return `<span style="display:flex;align-items:center;gap:6px;justify-content:center">${l.flag} <strong>${t}</strong></span>`;
    }).join('');

    vocabBack.innerHTML = `
        <div class="vocab-word" style="font-size:15px;margin-bottom:8px">${entry.word}</div>
        <div class="vocab-translations" style="display:flex;flex-direction:column;gap:4px">${transLines}</div>
    `;
}

vocabCard.addEventListener('click', () => vocabCard.classList.toggle('flipped'));
prevVocab.addEventListener('click', () => {
    vocabIndex = (vocabIndex - 1 + vocabWords.length) % vocabWords.length;
    renderVocabCard();
});
nextVocab.addEventListener('click', () => {
    vocabIndex = (vocabIndex + 1) % vocabWords.length;
    renderVocabCard();
});

// ─── History ───────────────────────────────────────────────
function saveToHistory() {
    if (!currentText) { showToast('저장할 번역이 없습니다.', 'error'); return; }
    const entry = {
        id: Date.now(),
        text: currentText,
        translations: { ...translations },
        time: new Date().toLocaleString('ko-KR'),
    };
    history.unshift(entry);
    if (history.length > 50) history.pop();
    localStorage.setItem('vt_history', JSON.stringify(history));
    updateBadges();
    renderHistory();
    showToast('히스토리에 저장되었습니다! 🕐', 'success');
}

saveHistoryBtn.addEventListener('click', saveToHistory);

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-msg">아직 번역 기록이 없습니다.</p>';
        return;
    }
    historyList.innerHTML = '';
    history.forEach(item => {
        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerHTML = `
      <div class="item-text">${item.text}</div>
      <div class="item-meta">${item.time}</div>
      <div class="item-actions">
        <button class="item-action-btn" onclick="reuseItem('${item.id}')">재사용</button>
        <button class="item-action-btn del" onclick="deleteHistoryItem('${item.id}')">🗑 삭제</button>
      </div>
    `;
        historyList.appendChild(el);
    });
}

window.reuseItem = function (id) {
    const item = history.find(h => h.id === Number(id));
    if (!item) return;
    textInput.value = item.text;
    charCount.textContent = item.text.length;
    switchMode('text');
    translateText(item.text);
    closePanel();
};

window.deleteHistoryItem = function (id) {
    history = history.filter(h => h.id !== Number(id));
    localStorage.setItem('vt_history', JSON.stringify(history));
    updateBadges();
    renderHistory();
};

clearHistory.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('vt_history');
    updateBadges();
    renderHistory();
    showToast('히스토리가 삭제되었습니다.', 'info');
});

// ─── Favorites ─────────────────────────────────────────────
function addToFavorites() {
    if (!currentText) { showToast('저장할 번역이 없습니다.', 'error'); return; }
    if (favorites.find(f => f.text === currentText)) {
        showToast('이미 즐겨찾기에 추가된 항목입니다.', 'info');
        return;
    }
    const entry = {
        id: Date.now(),
        text: currentText,
        translations: { ...translations },
        time: new Date().toLocaleString('ko-KR'),
    };
    favorites.unshift(entry);
    localStorage.setItem('vt_favorites', JSON.stringify(favorites));
    updateBadges();
    renderFavorites();
    showToast('즐겨찾기에 추가되었습니다! ⭐', 'success');
}

addFavBtn.addEventListener('click', addToFavorites);

function renderFavorites() {
    if (favorites.length === 0) {
        favList.innerHTML = '<p class="empty-msg">저장된 즐겨찾기가 없습니다.</p>';
        return;
    }
    favList.innerHTML = '';
    favorites.forEach(item => {
        const el = document.createElement('div');
        el.className = 'fav-item';
        el.innerHTML = `
      <div class="item-text">⭐ ${item.text}</div>
      <div class="item-meta">${item.time}</div>
      <div class="item-actions">
        <button class="item-action-btn" onclick="reuseFav('${item.id}')">재사용</button>
        <button class="item-action-btn del" onclick="deleteFavItem('${item.id}')">🗑 삭제</button>
      </div>
    `;
        favList.appendChild(el);
    });
}

window.reuseFav = function (id) {
    const item = favorites.find(f => f.id === Number(id));
    if (!item) return;
    textInput.value = item.text;
    charCount.textContent = item.text.length;
    switchMode('text');
    translateText(item.text);
    closePanel();
};

window.deleteFavItem = function (id) {
    favorites = favorites.filter(f => f.id !== Number(id));
    localStorage.setItem('vt_favorites', JSON.stringify(favorites));
    updateBadges();
    renderFavorites();
};

clearFav.addEventListener('click', () => {
    favorites = [];
    localStorage.removeItem('vt_favorites');
    updateBadges();
    renderFavorites();
    showToast('즐겨찾기가 삭제되었습니다.', 'info');
});

// ─── Panel Management ──────────────────────────────────────
function openPanel(panel) {
    closePanel();
    panel.classList.add('open');
    backdrop.classList.add('active');
}
function closePanel() {
    historyPanel.classList.remove('open');
    favPanel.classList.remove('open');
    backdrop.classList.remove('active');
}
historyToggle.addEventListener('click', () => openPanel(historyPanel));
favToggle.addEventListener('click', () => openPanel(favPanel));
historyClose.addEventListener('click', closePanel);
favClose.addEventListener('click', closePanel);
backdrop.addEventListener('click', closePanel);

// ─── Share ─────────────────────────────────────────────────
shareBtn.addEventListener('click', () => {
    if (!currentText) { showToast('공유할 번역이 없습니다.', 'error'); return; }
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('t', encodeURIComponent(currentText));
    shareUrl.value = url.toString();
    shareModal.style.display = 'flex';
});
shareClose.addEventListener('click', () => shareModal.style.display = 'none');
shareModal.addEventListener('click', (e) => { if (e.target === shareModal) shareModal.style.display = 'none'; });
copyShareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(shareUrl.value).then(() => showToast('링크가 복사되었습니다! 🔗', 'success'));
});

// ─── Badges & Toast ────────────────────────────────────────
function updateBadges() {
    historyBadge.textContent = history.length;
    favBadge.textContent = favorites.length;
}

let toastTimer = null;
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ─── Start ─────────────────────────────────────────────────
init();
