(function () {
  const PARTS = {
    I: "Điền từ khuyết (Cloze Test)",
    II: "Sắp xếp câu & hội thoại (Arrangement)",
    III: "Đọc hiểu văn bản (Reading)",
  };
  const ORDER = ["I", "II", "III"];
  const EXAMS = {
    de1: { title: "Đề số 1", count: 40, desc: "Cấu trúc chuẩn Đề thi Tốt nghiệp THPT 2025" },
    de2: { title: "Đề số 2", count: 40, desc: "Cấu trúc chuẩn Đề thi Tốt nghiệp THPT 2025" },
    de3: { title: "Đề số 3", count: 31, desc: "Ôn tập tổng hợp nâng cao kiến thức" },
  };
  const letters = ["A", "B", "C", "D"];
  const STORE = "english12-scores";
  const SESSION = "english12-session";

  const btn =
    "cursor-pointer appearance-none select-none disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation transition-all inline-flex items-center justify-center";
  const primary =
    btn +
    " h-10 rounded-xl bg-primary hover:bg-primary-hover px-4 sm:px-5 text-sm sm:text-base font-semibold text-primary-text active:scale-[0.98] shadow-sm";
  const ghost =
    btn +
    " h-10 rounded-xl border border-line bg-card hover:bg-surface-muted text-ink px-4 sm:px-5 text-sm sm:text-base font-medium active:scale-[0.98]";
  const textBtn =
    "cursor-pointer border-0 bg-transparent px-2.5 h-10 inline-flex items-center text-muted hover:text-primary active:scale-95 touch-manipulation rounded-lg transition-colors";
  const eyebrow =
    "m-0 text-xs sm:text-[13px] font-bold text-primary tracking-wide";
  const sheet =
    "anim-card rounded-2xl sm:rounded-[22px] border border-line bg-card p-4 sm:p-[22px] shadow-[0_8px_30px_rgba(79,70,229,0.06)]";
  const heading =
    "m-0 mt-2 mb-3 sm:mb-[18px] font-serif text-[clamp(24px,5vw,36px)] leading-[1.2] font-[650] tracking-[-0.02em] text-ink";
  const chip =
    "cursor-pointer select-none rounded-full border border-line bg-card text-ink px-3 sm:px-3.5 py-1.5 sm:py-2 text-sm sm:text-base aria-pressed:border-transparent aria-pressed:bg-primary aria-pressed:text-primary-text touch-manipulation active:scale-[0.97] transition-all";

  function parseQuestion(text) {
    const promptRegex =
      /\n\n((?:Choose the option|Which of the following|The word|The phrase|Where in|In which paragraph|According to|What|Who of|Underlined)[^\n]*[\s\S]*)$/i;
    const match = text.match(promptRegex);
    if (match) {
      const passage = text.slice(0, match.index).trim();
      const prompt = match[1].trim();
      return { passage: passage, prompt: prompt };
    }
    return { passage: "", prompt: text.trim() };
  }

  function getPart(q) {
    if (/blank \(\d+\)/i.test(q.question)) return "I";
    if (
      /^[a-e]\.\s/m.test(q.question) &&
      Object.values(q.options || {}).every(function (opt) {
        return /^[a-e]\s*-\s*[a-e]/i.test(opt);
      })
    ) {
      return "II";
    }
    return "III";
  }

  function normalize(raw) {
    return (raw || []).map(function (q) {
      const parsed = parseQuestion(q.question);
      const optKeys = letters.filter(function (k) {
        return q.options && q.options[k] != null;
      });
      const options = optKeys.map(function (k) {
        return q.options[k];
      });
      const correct = optKeys.indexOf(String(q.answer).trim().toUpperCase());

      return {
        id: "english-" + q.id,
        n: q.id,
        part: getPart(q),
        examSet: q.id <= 40 ? "de1" : q.id <= 80 ? "de2" : "de3",
        passage: parsed.passage,
        prompt: parsed.prompt,
        options: options,
        correct: correct >= 0 ? correct : 0,
        explain: q.note || "",
      };
    });
  }

  let bank = normalize(window.ENGLISH_QUESTIONS || []);
  const byId = new Map();
  function reindexBank() {
    byId.clear();
    bank.forEach(function (q) {
      byId.set(q.id, q);
    });
  }
  reindexBank();

  const state = {
    view: "home",
    mode: "practice",
    shuffleQuestions: false,
    selectedSet: "all", // "all" | "de1" | "de2" | "de3" | "part"
    parts: ["I", "II", "III"],
    questions: [],
    index: 0,
    answers: {},
    checked: {},
    bookmarks: {},
    modal: null,
    hint: "",
    filter: "wrong",
    startedAt: null,
    keepScore: true,
    minutes: 0,
    deadline: null,
    timeUp: false,
    soundEnabled: localStorage.getItem("sinh12-sound") !== "false",
    lastCheckAnim: "",
    keepScroll: false,
  };

  let timerId = null;
  const app = document.getElementById("app");

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const hold = copy[i];
      copy[i] = copy[j];
      copy[j] = hold;
    }
    return copy;
  }

  function questionsForCurrentConfig(doShuffle) {
    let source = bank;
    if (state.selectedSet === "de1") {
      source = bank.filter(function (q) {
        return q.examSet === "de1";
      });
    } else if (state.selectedSet === "de2") {
      source = bank.filter(function (q) {
        return q.examSet === "de2";
      });
    } else if (state.selectedSet === "de3") {
      source = bank.filter(function (q) {
        return q.examSet === "de3";
      });
    }

    const selectedParts = {};
    state.parts.forEach(function (p) {
      selectedParts[p] = true;
    });

    const filtered = source.filter(function (q) {
      return selectedParts[q.part];
    });

    return doShuffle ? shuffle(filtered) : filtered;
  }

  function isAnswered(q) {
    const answer = state.answers[q.id];
    return Number.isInteger(answer);
  }

  function isCorrect(q) {
    const answer = state.answers[q.id];
    return answer === q.correct;
  }

  function isMarkedCorrect(q) {
    return !!state.checked[q.id] && isCorrect(q);
  }

  function summaryOf(list) {
    const correct = list.filter(isMarkedCorrect).length;
    const wrong = list.filter(function (q) {
      return !isMarkedCorrect(q);
    });
    return {
      correct: correct,
      total: list.length,
      wrong: wrong,
      percent: list.length ? Math.round((correct / list.length) * 100) : 0,
    };
  }

  function formatClock(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  function formatWhen(at) {
    try {
      return new Date(at).toLocaleDateString("vi-VN");
    } catch (error) {
      return "";
    }
  }

  function loadScores() {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || {};
    } catch (error) {
      return {};
    }
  }

  function scoreKey() {
    return state.selectedSet + ":" + state.parts.join("+");
  }

  function saveScore(summary) {
    const scores = loadScores();
    scores[scoreKey()] = {
      correct: summary.correct,
      total: summary.total,
      percent: summary.percent,
      at: Date.now(),
    };
    localStorage.setItem(STORE, JSON.stringify(scores));
  }

  function persist() {
    if (state.view === "home") {
      sessionStorage.removeItem(SESSION);
      return;
    }
    sessionStorage.setItem(
      SESSION,
      JSON.stringify({
        view: state.view,
        mode: state.mode,
        selectedSet: state.selectedSet,
        shuffleQuestions: state.shuffleQuestions,
        parts: state.parts,
        ids: state.questions.map(function (q) {
          return q.id;
        }),
        index: state.index,
        answers: state.answers,
        checked: state.checked,
        bookmarks: state.bookmarks,
        filter: state.filter,
        startedAt: state.startedAt,
        keepScore: state.keepScore,
        minutes: state.minutes,
        deadline: state.deadline,
        timeUp: state.timeUp,
      })
    );
  }

  function restore() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION) || "null");
      if (!saved || !saved.ids || !saved.ids.length) return;
      const questions = saved.ids
        .map(function (id) {
          return byId.get(id);
        })
        .filter(Boolean);
      if (!questions.length) return;
      state.view = saved.view || "quiz";
      state.mode = saved.mode || "practice";
      state.selectedSet = saved.selectedSet || "all";
      state.shuffleQuestions = !!saved.shuffleQuestions;
      state.parts = saved.parts || ["I", "II", "III"];
      state.questions = questions;
      state.index = Math.min(saved.index || 0, questions.length - 1);
      state.answers = saved.answers || {};
      state.checked = saved.checked || {};
      state.bookmarks = saved.bookmarks || {};
      state.filter = saved.filter || "wrong";
      state.startedAt = saved.startedAt || Date.now();
      state.keepScore = saved.keepScore !== false;
      state.minutes = saved.minutes || 0;
      state.deadline = saved.deadline || null;
      state.timeUp = !!saved.timeUp;
    } catch (error) {}
  }

  function playTone(freq, delay, duration) {
    if (!state.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!playTone.ctx && AudioCtx) playTone.ctx = new AudioCtx();
      const audio = playTone.ctx;
      if (!audio) return;
      if (audio.state === "suspended") audio.resume();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const start = audio.currentTime + delay;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(start);
      osc.stop(start + duration);
    } catch (error) {}
  }

  function soundBtn() {
    return (
      '<button type="button" class="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-muted hover:bg-surface-muted hover:text-ink transition-colors" data-action="toggle-sound" title="' +
      (state.soundEnabled ? "Tắt âm thanh" : "Bật âm thanh") +
      '" aria-label="Bật tắt âm thanh">' +
      (state.soundEnabled
        ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 text-primary"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-7.5l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>') +
      "</button>"
    );
  }

  function themeBtn() {
    const dark = document.documentElement.classList.contains("dark");
    return (
      '<button type="button" class="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-muted hover:bg-surface-muted hover:text-ink transition-colors" data-action="toggle-theme" title="' +
      (dark ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối") +
      '" aria-label="Đổi giao diện">' +
      (dark
        ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 text-primary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>') +
      "</button>"
    );
  }

  function headerHtml(subtitle, right) {
    return (
      '<div class="mb-4 flex items-center justify-between gap-3 border-b border-line pb-3">' +
      '<a href="index.html" class="flex min-w-0 items-center gap-2.5 group" title="Chọn môn học">' +
      '<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-text text-sm font-bold shadow-sm">Anh</span>' +
      '<span class="leading-tight"><strong class="block text-sm sm:text-base group-hover:text-primary transition-colors">Tiếng Anh 12</strong><span class="text-[11px] sm:text-xs text-muted">' +
      esc(subtitle || "Luyện đề") +
      "</span></span></a>" +
      '<div class="flex items-center gap-2">' +
      (right || "") +
      soundBtn() +
      themeBtn() +
      "</div></div>"
    );
  }

  function countPart(part) {
    return bank.filter(function (q) {
      return q.part === part;
    }).length;
  }

  function countExam(exam) {
    return bank.filter(function (q) {
      return q.examSet === exam;
    }).length;
  }

  function renderHome() {
    const scores = loadScores();

    // Cards for Exams
    const examCards = ["de1", "de2", "de3"]
      .map(function (key) {
        const exam = EXAMS[key];
        const score = scores[key + ":I+II+III"] || scores[key];
        return (
          '<div class="rounded-2xl border border-line bg-card p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-primary/40 transition-colors">' +
          '<div><div class="flex items-center justify-between gap-2 mb-2"><span class="rounded-lg bg-selected-soft px-2.5 py-1 text-xs font-bold text-primary">' +
          exam.title +
          '</span><span class="text-xs text-muted font-medium">' +
          countExam(key) +
          " câu</span></div>" +
          '<h2 class="text-base font-bold sm:text-lg text-ink">' +
          exam.title +
          "</h2>" +
          '<p class="mt-1 text-xs sm:text-sm text-muted leading-relaxed">' +
          exam.desc +
          "</p>" +
          (score
            ? '<p class="mt-2 text-xs font-semibold text-primary">Lần trước ' +
              score.correct +
              "/" +
              score.total +
              " (" +
              score.percent +
              "%) · " +
              formatWhen(score.at) +
              "</p>"
            : "") +
          '</div><button type="button" class="' +
          primary +
          ' mt-4 w-full" data-action="open-exam" data-exam="' +
          key +
          '">Luyện đề này</button></div>'
        );
      })
      .join("");

    // Cards for Question Types (Parts)
    const partCards = ORDER.map(function (part) {
      const score = scores["part:" + part] || scores["all:" + part];
      return (
        '<button type="button" class="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3.5 border-x-0 border-t border-b-0 border-line bg-transparent px-3.5 py-3.5 text-left hover:bg-surface-muted transition-colors last:border-b" data-action="open-part" data-part="' +
        part +
        '"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-selected-soft font-serif text-lg font-bold text-primary">' +
        part +
        '</span><span class="grid gap-0.5"><strong class="text-sm sm:text-base text-ink">Phần ' +
        part +
        " · " +
        PARTS[part] +
        '</strong><span class="text-xs sm:text-sm text-muted">' +
        countPart(part) +
        " câu</span>" +
        (score
          ? '<span class="text-xs sm:text-sm font-semibold text-primary">Lần trước ' +
            score.correct +
            "/" +
            score.total +
            " (" +
            score.percent +
            "%) · " +
            formatWhen(score.at) +
            "</span>"
          : "") +
        '</span><span class="text-muted text-lg">→</span></button>'
      );
    }).join("");

    const allScore = scores["all:I+II+III"];

    return (
      "<div>" +
      headerHtml("Luyện đề Tiếng Anh", "") +
      '<p class="' +
      eyebrow +
      '">Tiếng Anh 12 · Global Success</p><h1 class="mt-2 mb-2 font-serif text-[clamp(28px,7vw,50px)] leading-[1.18] font-[650] tracking-[-0.03em]">Luyện đề Tiếng Anh</h1><p class="m-0 max-w-2xl text-[15px] text-muted sm:text-[17px]">Ôn luyện trắc nghiệm tiếng Anh 12 theo cấu trúc đề thi tốt nghiệp THPT mới: điền từ thông báo/quảng cáo, sắp xếp hội thoại và đọc hiểu văn bản.</p>' +
      '<div class="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">' +
      '<div class="rounded-xl border border-line bg-card p-3 text-center"><b class="block font-serif text-[26px] leading-none text-primary">' +
      countPart("I") +
      '</b><span class="text-xs text-muted font-medium">Điền từ</span></div>' +
      '<div class="rounded-xl border border-line bg-card p-3 text-center"><b class="block font-serif text-[26px] leading-none text-primary">' +
      countPart("II") +
      '</b><span class="text-xs text-muted font-medium">Sắp xếp câu</span></div>' +
      '<div class="rounded-xl border border-line bg-card p-3 text-center"><b class="block font-serif text-[26px] leading-none text-primary">' +
      countPart("III") +
      '</b><span class="text-xs text-muted font-medium">Đọc hiểu</span></div>' +
      '<div class="rounded-xl border border-line bg-card p-3 text-center"><b class="block font-serif text-[26px] leading-none text-ink">' +
      bank.length +
      '</b><span class="text-xs text-muted font-medium">Tổng số câu</span></div>' +
      "</div>" +
      '<div class="mt-7"><div class="flex items-center justify-between mb-3"><p class="m-0 text-xs font-bold tracking-wider text-muted uppercase">Luyện theo Đề thi chuẩn tốt nghiệp (50 phút)</p><button type="button" class="text-xs font-semibold text-primary hover:underline cursor-pointer" data-action="open-all">Làm tất cả 111 câu →</button></div><div class="grid gap-3 sm:grid-cols-3">' +
      examCards +
      "</div></div>" +
      '<div class="mt-8"><p class="mb-2.5 px-1 text-xs font-bold tracking-wider text-muted uppercase">Luyện theo Dạng bài thi</p><div class="overflow-hidden rounded-xl border border-line bg-card">' +
      partCards +
      "</div></div></div>"
    );
  }

  function renderPrep() {
    const selected = {};
    state.parts.forEach(function (part) {
      selected[part] = true;
    });
    const chosen = questionsForCurrentConfig(false);

    let setTitle = "Toàn bộ ngân hàng câu hỏi";
    if (state.selectedSet === "de1") setTitle = "Đề số 1 (40 câu)";
    else if (state.selectedSet === "de2") setTitle = "Đề số 2 (40 câu)";
    else if (state.selectedSet === "de3") setTitle = "Đề số 3 (31 câu)";
    else if (state.selectedSet === "part") {
      setTitle =
        "Dạng bài: " +
        state.parts
          .map(function (p) {
            return PARTS[p];
          })
          .join(", ");
    }

    const boxes = ORDER.map(function (part) {
      return (
        '<label class="grid cursor-pointer grid-cols-[auto_1fr] items-start gap-3 rounded-[14px] border border-line p-3 hover:bg-surface-muted transition-colors"><input class="mt-1 h-4 w-4 accent-primary" type="checkbox" data-action="toggle-part" data-part="' +
        part +
        '"' +
        (selected[part] ? " checked" : "") +
        '><span class="grid text-sm sm:text-base"><b>Phần ' +
        part +
        " · " +
        PARTS[part] +
        '</b><small class="text-muted">' +
        countPart(part) +
        " câu trong ngân hàng</small></span></label>"
      );
    }).join("");

    const times = [0, 15, 30, 45, 50, 60]
      .map(function (minutes) {
        return (
          '<button type="button" class="' +
          chip +
          '" data-action="set-time" data-minutes="' +
          minutes +
          '"' +
          (state.minutes === minutes ? ' aria-pressed="true"' : "") +
          ">" +
          (minutes ? minutes + " phút" : "Không giới hạn") +
          "</button>"
        );
      })
      .join("");

    const timeRow =
      state.mode === "exam"
        ? '<div class="mb-4"><p class="' +
          eyebrow +
          '">Thời gian làm bài</p><div class="mt-2 flex flex-wrap gap-2">' +
          times +
          "</div></div>"
        : "";

    return (
      "<div>" +
      headerHtml(
        "Chọn cách làm",
        '<button type="button" class="' +
          textBtn +
          '" data-action="home">← Danh sách</button>'
      ) +
      '<article class="' +
      sheet +
      '"><p class="' +
      eyebrow +
      '">Thiết lập bài thi</p><h1 class="' +
      heading +
      '">' +
      esc(setTitle) +
      '</h1><div class="mb-4 grid gap-2.5"><label class="grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-[14px] border border-line p-3 hover:bg-surface-muted transition-colors"><input class="mt-1 h-4 w-4 accent-primary" type="radio" name="mode" data-action="set-mode" value="practice"' +
      (state.mode === "practice" ? " checked" : "") +
      '><span><b class="text-ink">Luyện tập</b><small class="block text-muted">Kiểm tra từng câu và xem đáp án ngay.</small></span></label><label class="grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-[14px] border border-line p-3 hover:bg-surface-muted transition-colors"><input class="mt-1 h-4 w-4 accent-primary" type="radio" name="mode" data-action="set-mode" value="exam"' +
      (state.mode === "exam" ? " checked" : "") +
      '><span><b class="text-ink">Kiểm tra tính giờ</b><small class="block text-muted">Làm hết rồi mới nộp. Chấm điểm và xem đáp án sau khi nộp.</small></span></label></div>' +
      timeRow +
      (state.mode === "exam"
        ? '<p class="mb-4 rounded-[14px] border border-line bg-selected-soft px-3.5 py-3 text-sm text-ink">Chế độ kiểm tra sẽ tự động xáo ngẫu nhiên thứ tự câu hỏi để mô phỏng thi thật.</p>'
        : '<label class="mb-4 grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-[14px] border border-line p-3 hover:bg-surface-muted transition-colors"><input class="mt-1 h-4 w-4 accent-primary" type="checkbox" data-action="toggle-shuffle"' +
          (state.shuffleQuestions ? " checked" : "") +
          '><span><b class="text-ink">Xáo trộn thứ tự câu hỏi</b><small class="block text-muted">Đảo ngẫu nhiên thứ tự các câu hỏi.</small></span></label>') +
      '<div class="mb-4"><p class="' +
      eyebrow +
      ' mb-2">Các phần câu hỏi tham gia</p><div class="grid gap-2.5">' +
      boxes +
      "</div></div>" +
      '<button type="button" class="' +
      primary +
      ' w-full" data-action="start"' +
      (chosen.length ? "" : " disabled") +
      ">Bắt đầu · " +
      chosen.length +
      " câu</button></article></div>"
    );
  }

  function optionClass(q, index, revealed) {
    const base =
      "cursor-pointer appearance-none select-none disabled:cursor-not-allowed grid w-full grid-cols-[auto_1fr] items-center gap-3 rounded-xl border p-3 text-left text-sm sm:text-base transition-all ";
    const picked = state.answers[q.id] === index;
    if (!revealed) {
      return (
        base +
        (picked
          ? "border-selected bg-selected-soft ring-1 ring-selected font-medium text-ink"
          : "border-line bg-card hover:bg-surface-muted text-ink")
      );
    }
    if (index === q.correct) {
      return (
        base +
        "border-success bg-success-soft font-semibold text-success ring-1 ring-success"
      );
    }
    if (picked) {
      return (
        base +
        "border-danger bg-danger-soft text-danger ring-1 ring-danger font-medium"
      );
    }
    return base + "border-line bg-card opacity-50";
  }

  function renderQuiz() {
    const q = state.questions[state.index];
    if (!q) return "";
    const revealed = !!state.checked[q.id];
    const flagged = !!state.bookmarks[q.id];

    const dots = state.questions
      .map(function (item, index) {
        const current = index === state.index;
        const checked = !!state.checked[item.id];
        let cls =
          "relative flex h-9 w-full items-center justify-center rounded-xl border text-xs font-semibold sm:h-10 sm:text-sm cursor-pointer transition-all ";
        if (current) {
          cls +=
            "border-selected bg-selected-soft text-primary ring-2 ring-primary font-bold";
        } else if (state.bookmarks[item.id]) {
          cls += "border-bookmark/40 bg-bookmark-soft text-bookmark";
        } else if (checked) {
          cls += isCorrect(item)
            ? "border-success/30 bg-success-soft text-success"
            : "border-danger/30 bg-danger-soft text-danger";
        } else if (isAnswered(item)) {
          cls += "border-selected/40 bg-selected-soft text-primary";
        } else {
          cls += "border-line bg-card text-muted hover:bg-surface-muted";
        }
        return (
          '<button type="button" class="' +
          cls +
          '"' +
          (current ? ' data-current="true"' : "") +
          ' data-action="jump" data-index="' +
          index +
          '">' +
          (index + 1) +
          "</button>"
        );
      })
      .join("");

    let passageHtml = "";
    if (q.passage) {
      const isCloze = q.part === "I";
      passageHtml =
        '<div class="mb-4 rounded-xl border border-line bg-surface-muted/60 p-3.5 sm:p-4 text-[15px] sm:text-base leading-relaxed text-secondary">' +
        '<div class="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M3.5 3A1.5 1.5 0 0 0 2 4.5v11A1.5 1.5 0 0 0 3.5 17h13a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 16.5 3h-13ZM4 5.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-2Zm.5 4.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1Zm0 3h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1 0-1Z" /></svg>' +
        "<span>" +
        (isCloze ? "Đoạn văn điền khuyết" : "Văn bản đọc hiểu") +
        "</span></div>" +
        '<div class="font-serif italic text-ink/90 whitespace-pre-line text-[15px] sm:text-base leading-relaxed">' +
        esc(q.passage) +
        "</div></div>";
    }

    const isTf = q.options.length === 2;
    const gridCls = isTf ? "grid gap-2.5 sm:grid-cols-2" : "grid gap-2.5";

    const body =
      '<div class="' +
      gridCls +
      '">' +
      q.options
        .map(function (option, index) {
          return (
            '<button type="button" class="' +
            optionClass(q, index, revealed) +
            '" data-action="pick" data-index="' +
            index +
            '"' +
            (revealed ? " disabled" : "") +
            '><span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-muted font-bold text-ink">' +
            letters[index] +
            "</span><span class=\"leading-normal font-normal\">" +
            esc(option) +
            "</span></button>"
          );
        })
        .join("") +
      "</div>";

    const explain =
      revealed && q.explain
        ? '<div class="mt-4 rounded-[14px] bg-bookmark-soft px-4 py-3.5 text-ink"><p class="' +
          eyebrow +
          '">Ghi chú</p><p class="m-0 whitespace-pre-line text-sm sm:text-base">' +
          esc(q.explain) +
          "</p></div>"
        : "";

    let primaryLabel = "Kiểm tra";
    let primaryAction = "check";
    if (state.mode === "exam") {
      primaryLabel =
        state.index === state.questions.length - 1 ? "Nộp bài" : "Câu tiếp";
      primaryAction =
        state.index === state.questions.length - 1 ? "ask-finish" : "next";
    } else if (revealed) {
      primaryLabel =
        state.index === state.questions.length - 1 ? "Xem kết quả" : "Câu tiếp";
      primaryAction =
        state.index === state.questions.length - 1 ? "ask-finish" : "next";
    }

    const left = state.deadline ? state.deadline - Date.now() : 0;
    const clock = state.deadline
      ? '<p class="m-0 mt-0.5 font-bold tabular-nums ' +
        (left <= 60000 ? "text-danger" : "text-primary") +
        '" data-clock>' +
        formatClock(left) +
        "</p>"
      : "";

    const backBtn =
      '<button type="button" class="' +
      textBtn +
      '" data-action="back-prep" title="Quay lại phần chọn luyện đề hoặc kiểm tra">← Đổi cách làm</button>';

    const submit =
      state.mode === "exam"
        ? '<div class="flex items-center gap-2">' +
          backBtn +
          '<button type="button" class="' +
          textBtn +
          '" data-action="ask-finish">Nộp bài</button>' +
          "</div>"
        : backBtn;

    const answeredCount = state.questions.filter(isAnswered).length;

    return (
      "<div>" +
      headerHtml(
        (state.mode === "exam" ? "Kiểm tra" : "Luyện tập") +
          " · " +
          (state.index + 1) +
          "/" +
          state.questions.length,
        submit
      ) +
      (clock ? '<div class="mb-3 text-center">' + clock + "</div>" : "") +
      '<div class="mb-3.5 h-1 overflow-hidden rounded-full bg-line"><span class="block h-full bg-primary transition-all duration-200" style="width:' +
      ((state.index + 1) / state.questions.length) * 100 +
      '%"></span></div>' +
      '<div class="flex flex-col gap-3 lg:flex-row">' +
      '<aside class="order-2 w-full shrink-0 lg:order-1 lg:w-[310px]"><div class="rounded-2xl border border-line bg-card p-3.5 lg:sticky lg:top-4">' +
      '<div class="mb-2.5 flex items-center justify-between border-b border-line pb-3"><div><h2 class="text-sm font-bold text-ink">Bảng câu hỏi</h2><span class="text-xs text-muted">Bấm số để chuyển câu</span></div><span class="rounded-lg bg-selected-soft px-2.5 py-1 text-xs font-bold text-primary">' +
      answeredCount +
      " / " +
      state.questions.length +
      '</span></div><div class="dots grid max-h-[min(520px,calc(100vh-280px))] grid-cols-5 gap-2 overflow-y-auto py-1.5">' +
      dots +
      '</div><button type="button" class="' +
      (flagged
        ? "border-bookmark/40 bg-bookmark-soft text-bookmark"
        : "border-line bg-surface-muted text-muted") +
      ' mt-3 h-10 w-full rounded-xl border text-sm font-medium transition-colors" data-action="toggle-bookmark">' +
      (flagged ? "Đã đánh dấu câu " : "Đánh dấu câu ") +
      (state.index + 1) +
      "</button></div></aside>" +
      '<div class="order-1 min-w-0 flex-1 lg:order-2"><article class="' +
      sheet +
      (state.lastCheckAnim ? " " + state.lastCheckAnim : "") +
      '"><div class="mb-3 flex flex-wrap items-center gap-2"><span class="rounded-lg bg-selected-soft px-2.5 py-1 text-xs font-semibold text-primary">Câu ' +
      (state.index + 1) +
      '</span><span class="text-xs text-muted">Phần ' +
      q.part +
      " · " +
      esc(PARTS[q.part]) +
      " · Đề câu " +
      q.n +
      "</span></div>" +
      passageHtml +
      '<h1 class="m-0 mt-2 mb-4 font-serif text-[clamp(19px,2.8vw,26px)] leading-snug font-[650] whitespace-pre-line text-ink">' +
      esc(q.prompt) +
      "</h1>" +
      body +
      explain +
      "</article>" +
      (state.hint
        ? '<p class="mx-1 my-2.5 text-danger font-medium text-sm">' +
          esc(state.hint) +
          "</p>"
        : "") +
      '<div class="mt-3 flex justify-between gap-2.5"><button type="button" class="' +
      ghost +
      '" data-action="prev"' +
      (state.index === 0 ? " disabled" : "") +
      '>Trước</button><button type="button" class="' +
      primary +
      '" data-action="' +
      primaryAction +
      '">' +
      primaryLabel +
      "</button></div></div></div></div>"
    );
  }

  function answerText(q) {
    const answer = state.answers[q.id];
    return Number.isInteger(answer)
      ? letters[answer] + ". " + q.options[answer]
      : "Chưa chọn";
  }

  function correctText(q) {
    return letters[q.correct] + ". " + q.options[q.correct];
  }

  function renderResult() {
    const summary = summaryOf(state.questions);
    const tone =
      summary.percent >= 80
        ? "text-success"
        : summary.percent >= 50
          ? "text-bookmark"
          : "text-danger";
    const line =
      summary.percent >= 80
        ? "Excellent! Bạn đang nắm rất vững kiến thức và kỹ năng làm bài."
        : summary.percent >= 50
          ? "Good job! Hãy xem kỹ lại các câu sai rồi luyện thêm một lượt nữa."
          : "Keep practicing! Nên xem lại từ vựng, ngữ pháp và rèn thêm kỹ năng đọc hiểu.";

    const spent = state.startedAt
      ? formatClock(Date.now() - state.startedAt)
      : "";

    const list = state.questions.filter(function (q) {
      return state.filter === "wrong" ? !isMarkedCorrect(q) : true;
    });

    const reviews = list.length
      ? list
          .map(function (q) {
            const ok = isMarkedCorrect(q);
            return (
              '<details class="mb-2.5 rounded-[14px] border border-line bg-card px-3.5 py-3"' +
              (ok ? "" : " open") +
              '><summary class="flex cursor-pointer items-center gap-2.5"><span class="rounded-full px-2.5 py-0.5 text-[13px] font-bold ' +
              (ok
                ? "bg-success-soft text-success"
                : "bg-danger-soft text-danger") +
              '">' +
              (ok ? "Đúng" : "Sai") +
              "</span><span class=\"font-medium text-ink\">Câu " +
              q.n +
              " · Phần " +
              q.part +
              '</span></summary><div class="pt-2">' +
              (q.passage
                ? '<div class="my-2 rounded-lg bg-surface-muted p-2.5 text-xs sm:text-sm font-serif italic text-secondary whitespace-pre-line max-h-48 overflow-y-auto">' +
                  esc(q.passage) +
                  "</div>"
                : "") +
              '<p class="m-0 mt-1 font-semibold text-ink text-sm sm:text-base whitespace-pre-line">' +
              esc(q.prompt) +
              '</p><p class="m-0 mt-2 text-sm text-secondary"><b>Bạn chọn:</b> ' +
              esc(answerText(q)) +
              '</p><p class="m-0 mt-1 text-sm font-medium text-success"><b>Đáp án chính xác:</b> ' +
              esc(correctText(q)) +
              "</p>" +
              (q.explain
                ? '<p class="m-0 mt-2 text-xs sm:text-sm text-muted bg-bookmark-soft p-2 rounded-lg">' +
                  esc(q.explain) +
                  "</p>"
                : "") +
              "</div></details>"
            );
          })
          .join("")
      : '<p class="text-muted py-4 text-center">Không có câu sai trong lượt thi này.</p>';

    return (
      "<div>" +
      headerHtml(
        "Kết quả",
        '<div class="flex items-center gap-2"><button type="button" class="' +
          textBtn +
          '" data-action="back-prep" title="Quay lại phần chọn luyện đề hoặc kiểm tra">← Đổi cách làm</button><button type="button" class="' +
          textBtn +
          '" data-action="home">← Danh sách</button></div>'
      ) +
      '<article class="' +
      sheet +
      '"><p class="' +
      eyebrow +
      '">Kết quả ôn tập</p><p class="m-0 font-serif text-[72px] leading-none font-[650] ' +
      tone +
      '">' +
      summary.correct +
      '<span class="text-[0.4em] text-muted">/' +
      summary.total +
      '</span></p><p class="mt-1 text-[22px] font-bold ' +
      tone +
      '">' +
      summary.percent +
      "%</p><p class=\"text-ink font-medium\">" +
      line +
      '</p><ul class="m-0 grid list-none gap-1.5 p-0 text-sm text-muted"><li>' +
      (state.mode === "exam" ? "Chế độ kiểm tra" : "Chế độ luyện tập") +
      "</li>" +
      (spent ? "<li>Thời gian làm bài: " + spent + "</li>" : "") +
      (state.minutes ? "<li>Giới hạn: " + state.minutes + " phút</li>" : "") +
      (state.timeUp ? "<li>Hết giờ làm bài, hệ thống đã tự nộp</li>" : "") +
      '</ul><div class="mt-4 flex flex-wrap gap-2.5"><button type="button" class="' +
      primary +
      '" data-action="retry">Làm lại</button><button type="button" class="' +
      ghost +
      '" data-action="back-prep">Đổi cách làm</button><button type="button" class="' +
      ghost +
      '" data-action="retry-wrong"' +
      (summary.wrong.length ? "" : " disabled") +
      ">Ôn " +
      summary.wrong.length +
      ' câu sai</button></div><div class="mt-4 flex gap-2"><button type="button" class="' +
      chip +
      '" data-action="filter" data-filter="wrong"' +
      (state.filter === "wrong" ? ' aria-pressed="true"' : "") +
      '>Câu sai</button><button type="button" class="' +
      chip +
      '" data-action="filter" data-filter="all"' +
      (state.filter === "all" ? ' aria-pressed="true"' : "") +
      '>Tất cả</button></div><div class="mt-[18px]">' +
      reviews +
      "</div></article></div>"
    );
  }

  function renderModal() {
    if (!state.modal) return "";
    const left = state.questions.filter(function (q) {
      return state.mode === "exam" ? !isAnswered(q) : !state.checked[q.id];
    }).length;
    if (!left) return "";
    return (
      '<div class="fixed inset-0 z-30 grid place-items-end bg-black/55 p-4 sm:place-items-center"><div class="w-full max-w-md rounded-[22px] border border-line bg-card p-5 shadow-2xl" role="dialog" aria-modal="true"><h2 class="m-0 font-serif text-[28px] leading-tight text-ink">Còn ' +
      left +
      ' câu chưa xong</h2><p class="text-muted text-sm mt-1">Những câu bỏ trống sẽ được tính là chưa đúng điểm.</p><div class="mt-4 flex flex-wrap gap-2.5 justify-end"><button type="button" class="' +
      ghost +
      '" data-action="close-modal">Ở lại</button><button type="button" class="' +
      ghost +
      '" data-action="jump-blank">Tới câu đó</button><button type="button" class="' +
      primary +
      '" data-action="finish">Nộp bài</button></div></div></div>'
    );
  }

  function render() {
    const top = window.scrollY;
    const views = {
      home: renderHome,
      prep: renderPrep,
      quiz: renderQuiz,
      result: renderResult,
    };
    app.innerHTML = views[state.view]() + renderModal();
    persist();
    if (state.view === "quiz") {
      const current = document.querySelector("[data-current]");
      if (current && current.scrollIntoView) {
        current.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
      window.scrollTo(0, state.keepScroll ? top : 0);
    } else {
      window.scrollTo(0, 0);
    }
    state.keepScroll = false;
    armTimer();
  }

  function armTimer() {
    clearInterval(timerId);
    timerId = null;
    if (!state.deadline || state.view !== "quiz") return;
    const tick = function () {
      const left = state.deadline - Date.now();
      const node = document.querySelector("[data-clock]");
      if (node) {
        node.textContent = formatClock(left);
        node.classList.toggle("text-danger", left <= 60000);
        node.classList.toggle("text-primary", left > 60000);
      }
      if (left <= 0) {
        clearInterval(timerId);
        state.timeUp = true;
        finish();
      }
    };
    tick();
    timerId = setInterval(tick, 250);
  }

  function start(questions, keepScore) {
    state.keepScore = keepScore !== false;
    state.questions = questions;
    state.index = 0;
    state.answers = {};
    state.checked = {};
    state.bookmarks = {};
    state.modal = null;
    state.hint = "";
    state.filter = "wrong";
    state.startedAt = Date.now();
    state.timeUp = false;
    state.deadline =
      state.mode === "exam" && state.minutes > 0
        ? Date.now() + state.minutes * 60000
        : null;
    state.view = "quiz";
    render();
  }

  function askFinish() {
    const left = state.questions.filter(function (q) {
      return state.mode === "exam" ? !isAnswered(q) : !state.checked[q.id];
    }).length;
    if (left) {
      state.modal = "finish";
      state.keepScroll = true;
      render();
      return;
    }
    finish();
  }

  function finish() {
    if (state.mode === "exam") {
      state.questions.forEach(function (q) {
        state.checked[q.id] = true;
      });
    }
    state.modal = null;
    state.view = "result";
    state.lastCheckAnim = "";
    const summary = summaryOf(state.questions);
    state.filter = summary.wrong.length ? "wrong" : "all";
    if (state.keepScore !== false) saveScore(summary);
    if (summary.percent >= 80) playTone(784, 0, 0.2);
    else if (summary.percent >= 50) playTone(523, 0, 0.16);
    else playTone(262, 0, 0.2);
    render();
  }

  function firstBlank() {
    return state.questions.findIndex(function (q) {
      return state.mode === "exam" ? !isAnswered(q) : !state.checked[q.id];
    });
  }

  function onClick(event) {
    const node = event.target.closest("[data-action]");
    if (!node) return;
    const action = node.dataset.action;
    const q = state.questions[state.index];

    if (action === "toggle-sound") {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem("sinh12-sound", state.soundEnabled);
      state.keepScroll = true;
      render();
    } else if (action === "toggle-theme") {
      const dark = !document.documentElement.classList.contains("dark");
      document.documentElement.classList.toggle("dark", dark);
      localStorage.setItem("sinh12-theme", dark ? "dark" : "light");
      state.keepScroll = true;
      render();
    } else if (action === "toggle-bookmark" && q) {
      state.bookmarks[q.id] = !state.bookmarks[q.id];
      state.keepScroll = true;
      render();
    } else if (action === "home") {
      state.view = "home";
      state.modal = null;
      render();
    } else if (action === "back-prep") {
      state.view = "prep";
      state.modal = null;
      render();
    } else if (action === "open-exam") {
      state.selectedSet = node.dataset.exam;
      state.parts = ["I", "II", "III"];
      state.mode = "exam";
      state.shuffleQuestions = true;
      state.minutes = 50;
      state.view = "prep";
      render();
    } else if (action === "open-all") {
      state.selectedSet = "all";
      state.parts = ["I", "II", "III"];
      state.mode = "practice";
      state.shuffleQuestions = false;
      state.minutes = 0;
      state.view = "prep";
      render();
    } else if (action === "open-part") {
      state.selectedSet = "all";
      state.parts = [node.dataset.part];
      state.mode = "practice";
      state.shuffleQuestions = false;
      state.minutes = 0;
      state.view = "prep";
      render();
    } else if (action === "set-time") {
      state.minutes = Number(node.dataset.minutes) || 0;
      state.keepScroll = true;
      render();
    } else if (action === "start") {
      const chosen = questionsForCurrentConfig(
        state.mode === "exam" ? false : state.shuffleQuestions
      );
      if (state.mode === "exam") {
        const mixed = shuffle(chosen);
        if (mixed.length) start(mixed);
      } else if (chosen.length) {
        start(chosen);
      }
    } else if (action === "pick") {
      if (!q || state.checked[q.id]) return;
      state.answers[q.id] = Number(node.dataset.index);
      state.hint = "";
      state.keepScroll = true;
      render();
    } else if (action === "check") {
      if (!q) return;
      if (!isAnswered(q)) {
        state.hint = "Hãy chọn một đáp án trước khi kiểm tra.";
        state.keepScroll = true;
        render();
        return;
      }
      state.checked[q.id] = true;
      state.hint = "";
      state.keepScroll = true;
      const ok = isCorrect(q);
      state.lastCheckAnim = ok ? "anim-correct" : "anim-wrong";
      playTone(ok ? 660 : 280, 0, 0.16);
      render();
    } else if (action === "next") {
      if (state.index < state.questions.length - 1) {
        state.index += 1;
        state.hint = "";
        state.lastCheckAnim = "";
        render();
      }
    } else if (action === "prev") {
      if (state.index > 0) {
        state.index -= 1;
        state.hint = "";
        state.lastCheckAnim = "";
        render();
      }
    } else if (action === "jump") {
      state.index = Number(node.dataset.index);
      state.hint = "";
      state.lastCheckAnim = "";
      state.modal = null;
      render();
    } else if (action === "ask-finish") {
      askFinish();
    } else if (action === "close-modal") {
      state.modal = null;
      state.keepScroll = true;
      render();
    } else if (action === "jump-blank") {
      const index = firstBlank();
      state.modal = null;
      if (index >= 0) state.index = index;
      render();
    } else if (action === "finish") {
      finish();
    } else if (action === "retry") {
      const again = questionsForCurrentConfig(
        state.mode === "exam" ? false : state.shuffleQuestions
      );
      start(state.mode === "exam" ? shuffle(again) : again, true);
    } else if (action === "retry-wrong") {
      const wrong = state.questions.filter(function (item) {
        return !isMarkedCorrect(item);
      });
      if (!wrong.length) return;
      state.mode = "practice";
      state.deadline = null;
      state.minutes = 0;
      start(wrong, false);
    } else if (action === "filter") {
      state.filter = node.dataset.filter;
      state.keepScroll = true;
      render();
    }
  }

  app.addEventListener("click", onClick);

  app.addEventListener("change", function (event) {
    const node = event.target;
    if (node.dataset.action === "set-mode") {
      state.mode = node.value;
      if (state.mode === "practice") {
        state.minutes = 0;
      } else {
        state.shuffleQuestions = true;
        if (!state.minutes) state.minutes = 50;
      }
      state.keepScroll = true;
      render();
    }
    if (node.dataset.action === "toggle-shuffle") {
      state.shuffleQuestions = node.checked;
      state.keepScroll = true;
      render();
    }
    if (node.dataset.action === "toggle-part") {
      const selected = new Set(state.parts);
      if (node.checked) selected.add(node.dataset.part);
      else selected.delete(node.dataset.part);
      state.parts = ORDER.filter(function (part) {
        return selected.has(part);
      });
      state.keepScroll = true;
      render();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (state.view !== "quiz" || state.modal) return;
    const q = state.questions[state.index];
    if (!q || event.target.closest("input, textarea")) return;
    const key = event.key.toUpperCase();
    if (
      !state.checked[q.id] &&
      letters.indexOf(key) >= 0 &&
      letters.indexOf(key) < q.options.length
    ) {
      state.answers[q.id] = letters.indexOf(key);
      state.hint = "";
      state.keepScroll = true;
      render();
    } else if (event.key === "Enter") {
      const action =
        state.mode === "exam"
          ? state.index === state.questions.length - 1
            ? "ask-finish"
            : "next"
          : state.checked[q.id]
            ? state.index === state.questions.length - 1
              ? "ask-finish"
              : "next"
            : "check";
      document.querySelector('[data-action="' + action + '"]')?.click();
    } else if (event.key === "ArrowLeft") {
      document.querySelector('[data-action="prev"]')?.click();
    } else if (event.key === "ArrowRight") {
      if (state.mode === "exam" || state.checked[q.id]) {
        document.querySelector('[data-action="next"]')?.click();
      }
    }
  });

  // Fetch fallback if english-data.js wasn't loaded or bank is empty
  if (!bank.length && typeof fetch !== "undefined") {
    fetch("docs/english-questions.json")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        window.ENGLISH_QUESTIONS = data;
        bank = normalize(data);
        reindexBank();
        restore();
        render();
      })
      .catch(function () {
        restore();
        render();
      });
  } else {
    restore();
    render();
  }
})();
