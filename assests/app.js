(function () {
  const PARTS = {
    I: "Nhiều lựa chọn",
    II: "Đúng / Sai",
    III: "Trả lời ngắn",
  };
  const STORE = "sinh12-gk1-scores";
  const SESSION = "sinh12-gk1-session";
  const letters = ["A", "B", "C", "D"];
  const marks = ["a", "b", "c", "d"];
  const btn = "cursor-pointer appearance-none select-none disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation transition-all inline-flex items-center justify-center";
  const primary = btn + " h-10 rounded-xl bg-primary hover:bg-primary-hover px-4 sm:px-5 text-sm sm:text-base font-semibold text-primary-text active:scale-[0.98] shadow-sm";
  const ghost = btn + " h-10 rounded-xl border border-line bg-card hover:bg-surface-muted text-ink px-4 sm:px-5 text-sm sm:text-base font-medium active:scale-[0.98]";
  const textBtn = "cursor-pointer border-0 bg-transparent px-2.5 h-10 inline-flex items-center text-muted hover:text-primary active:scale-95 touch-manipulation rounded-lg transition-colors";
  const eyebrow = "m-0 text-xs sm:text-[13px] font-bold text-primary tracking-wide";
  const sheet =
    "anim-card rounded-2xl sm:rounded-[22px] border border-line bg-card p-4 sm:p-[22px] shadow-[0_8px_30px_rgba(22,101,52,0.04)]";
  const heading =
    "m-0 mt-2 mb-3 sm:mb-[18px] font-serif text-[clamp(24px,5vw,36px)] leading-[1.2] font-[650] tracking-[-0.02em] text-ink";
  const chip =
    "cursor-pointer select-none rounded-full border border-line bg-card text-ink px-3 sm:px-3.5 py-1.5 sm:py-2 text-sm sm:text-base aria-pressed:border-transparent aria-pressed:bg-primary aria-pressed:text-primary-text touch-manipulation active:scale-[0.97] transition-all";

  const byId = new Map();
  SINH12.lessons.forEach(function (lesson) {
    lesson.questions.forEach(function (q) {
      q.lessonId = lesson.id;
      q.lessonIndex = lesson.index;
      q.lessonTitle = lesson.title;
      byId.set(q.id, q);
    });
  });

  const state = {
    view: "home",
    lessonId: null,
    mode: "practice",
    parts: ["I", "II", "III"],
    questions: [],
    index: 0,
    answers: {},
    checked: {},
    bookmarks: {},
    theme: localStorage.getItem("sinh12-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
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
  };

  let timerId = null;

  const app = document.getElementById("app");

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Audio Synthesizer (Web Audio API - Không cần file MP3 bên ngoài)
  const SoundFX = (function () {
    let ctx = null;
    function getContext() {
      try {
        if (!ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) ctx = new AudioCtx();
        }
        if (ctx && ctx.state === "suspended") {
          ctx.resume();
        }
        return ctx;
      } catch (e) {
        return null;
      }
    }

    function playTone(freq, type, startTime, duration, startVol, endVol) {
      try {
        const audio = getContext();
        if (!audio) return;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = type || "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(startVol || 0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endVol || 0.0001), startTime + duration);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      } catch (e) {}
    }

    return {
      playCorrect: function () {
        if (!state.soundEnabled) return;
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;
        // Hợp âm vui tươi, trong trẻo: C5 -> E5 -> G5 -> C6
        playTone(523.25, "sine", now, 0.16, 0.18, 0.01);
        playTone(659.25, "sine", now + 0.07, 0.18, 0.2, 0.01);
        playTone(783.99, "sine", now + 0.14, 0.22, 0.22, 0.01);
        playTone(1046.5, "triangle", now + 0.22, 0.35, 0.24, 0.001);
      },
      playPartial: function () {
        if (!state.soundEnabled) return;
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;
        // Âm hưởng ấm áp, động viên
        playTone(523.25, "sine", now, 0.18, 0.16, 0.01);
        playTone(659.25, "sine", now + 0.09, 0.24, 0.18, 0.001);
      },
      playWrong: function () {
        if (!state.soundEnabled) return;
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;
        // Âm trầm êm ái, không gây chói tai: Eb4 -> C4
        playTone(311.13, "sine", now, 0.18, 0.16, 0.01);
        playTone(261.63, "triangle", now + 0.11, 0.26, 0.18, 0.001);
      },
      playVictory: function () {
        if (!state.soundEnabled) return;
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;
        // Fanfare chúc mừng chiến thắng rộn ràng
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach(function (f, i) {
          playTone(f, "triangle", now + i * 0.1, 0.28, 0.2, 0.01);
        });
        playTone(1046.5, "sine", now + 0.4, 0.65, 0.25, 0.001);
      },
      playGood: function () {
        if (!state.soundEnabled) return;
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;
        // Giai điệu hoàn thành tốt
        playTone(440, "sine", now, 0.18, 0.15, 0.01);
        playTone(554.37, "sine", now + 0.1, 0.22, 0.18, 0.01);
        playTone(659.25, "sine", now + 0.22, 0.35, 0.2, 0.001);
      },
      playEncourage: function () {
        if (!state.soundEnabled) return;
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;
        // Giai điệu nhẹ nhàng khích lệ
        playTone(392, "sine", now, 0.2, 0.15, 0.01);
        playTone(440, "sine", now + 0.14, 0.3, 0.18, 0.001);
      }
    };
  })();

  // Hiệu ứng pháo hoa giấy (Confetti) khi đạt kết quả cao
  function launchConfetti() {
    let canvas = document.getElementById("confetti-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "confetti-canvas";
      canvas.className = "fixed inset-0 pointer-events-none z-50 w-full h-full";
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext("2d");
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = ["#22c55e", "#166534", "#3b82f6", "#eab308", "#ec4899", "#8b5cf6", "#f97316"];
    const particles = [];
    for (let i = 0; i < 75; i++) {
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 260,
        y: height * 0.35,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 5,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.28,
        opacity: 1,
      });
    }

    const startTime = Date.now();
    function animate() {
      ctx.clearRect(0, 0, width, height);
      const elapsed = Date.now() - startTime;
      let alive = false;

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.rotation += p.rotationSpeed;
        if (elapsed > 1800) {
          p.opacity -= 0.02;
        }

        if (p.opacity > 0 && p.y < height + 50) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
          ctx.restore();
        }
      });

      if (alive && elapsed < 3200) {
        requestAnimationFrame(animate);
      } else {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }
    requestAnimationFrame(animate);
  }

  function soundBtnHtml() {
    return (
      '<button type="button" class="cursor-pointer inline-flex items-center justify-center h-10 w-10 rounded-xl border border-line bg-card text-muted hover:text-ink hover:bg-surface-muted transition-colors" data-action="toggle-sound" title="' +
      (state.soundEnabled ? "Tắt âm thanh" : "Bật âm thanh") +
      '" aria-label="Toggle sound">' +
      (state.soundEnabled
        ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 text-primary"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-7.5l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>') +
      "</button>"
    );
  }

  function themeBtnHtml() {
    const isDark = document.documentElement.classList.contains("dark");
    return (
      '<button type="button" class="cursor-pointer inline-flex items-center justify-center h-10 w-10 rounded-xl border border-line bg-card text-muted hover:text-ink hover:bg-surface-muted transition-colors" data-action="toggle-theme" title="' +
      (isDark ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối") +
      '" aria-label="Toggle theme">' +
      (isDark
        ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 text-primary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>') +
      "</button>"
    );
  }

  function headerHtml(subtitle, rightContent) {
    return (
      '<div class="mb-4 flex items-center justify-between gap-3 border-b border-line pb-3 sm:pb-3.5">' +
      '<div class="flex items-center gap-2.5">' +
      '<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-text shadow-xs">' +
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-5.25 6.557c0 1.25.9 2.25 2.25 2.25h6c1.35 0 2.25-1 2.25-2.25" /></svg>' +
      "</span>" +
      '<div class="leading-tight">' +
      '<strong class="block text-sm sm:text-base font-bold text-ink">Biology Practice</strong>' +
      '<span class="text-[11px] sm:text-xs text-muted">' +
      esc(subtitle || "Ôn tập Sinh học 12") +
      "</span>" +
      "</div>" +
      "</div>" +
      '<div class="flex items-center gap-2">' +
      (rightContent || "") +
      soundBtnHtml() +
      themeBtnHtml() +
      "</div>" +
      "</div>"
    );
  }

  function loadScores() {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveScore(summary) {
    const scores = loadScores();
    scores[state.lessonId] = {
      correct: summary.correct,
      total: summary.total,
      percent: summary.percent,
      at: Date.now(),
    };
    localStorage.setItem(STORE, JSON.stringify(scores));
  }

  function persist() {
    if (state.view === "home" || state.view === "prep") {
      sessionStorage.removeItem(SESSION);
      return;
    }
    sessionStorage.setItem(
      SESSION,
      JSON.stringify({
        view: state.view,
        lessonId: state.lessonId,
        mode: state.mode,
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
      if (!saved || !saved.ids) return;
      const questions = saved.ids.map(function (id) {
        return byId.get(id);
      });
      if (questions.some(function (q) {
        return !q;
      })) return;
      state.view = saved.view;
      state.lessonId = saved.lessonId;
      state.mode = saved.mode;
      state.parts = saved.parts;
      state.questions = questions;
      state.index = saved.index || 0;
      state.answers = saved.answers || {};
      state.checked = saved.checked || {};
      state.bookmarks = saved.bookmarks || {};
      state.filter = saved.filter || "wrong";
      state.startedAt = saved.startedAt;
      state.keepScore = saved.keepScore !== false;
      state.minutes = saved.minutes || 0;
      state.deadline = saved.deadline || null;
      state.timeUp = !!saved.timeUp;
    } catch (error) {
      sessionStorage.removeItem(SESSION);
    }
  }

  function lessonById(id) {
    return SINH12.lessons.filter(function (lesson) {
      return lesson.id === id;
    })[0];
  }

  function questionsFor(lessonId, parts) {
    const source = lessonId === "all" ? SINH12.lessons : [lessonById(lessonId)];
    return source.flatMap(function (lesson) {
      return lesson.questions.filter(function (q) {
        return parts.indexOf(q.part) !== -1;
      });
    });
  }

  function isAnswered(q) {
    const answer = state.answers[q.id];
    if (q.type === "mcq") return Number.isInteger(answer);
    if (q.type === "tf") {
      return Array.isArray(answer) && answer.length === 4 && answer.every(function (value) {
        return value === true || value === false;
      });
    }
    return typeof answer === "string" && answer.trim() !== "";
  }

  function tfCorrectCount(q) {
    const answer = state.answers[q.id] || [];
    return q.items.filter(function (item, index) {
      return answer[index] === item.correct;
    }).length;
  }

  function isCorrect(q) {
    const answer = state.answers[q.id];
    if (q.type === "mcq") return answer === q.correct;
    if (q.type === "tf") return tfCorrectCount(q) === 4;
    if (q.type === "short") return q.grade(answer || "");
    return false;
  }

  function isMarkedCorrect(q) {
    return !!state.checked[q.id] && isCorrect(q);
  }

  function summaryOf(list) {
    let correct = 0;
    let tfHit = 0;
    let tfTotal = 0;
    const wrong = [];
    list.forEach(function (q) {
      const ok = isMarkedCorrect(q);
      if (ok) correct += 1;
      else wrong.push(q);
      if (q.type === "tf") {
        tfTotal += 4;
        tfHit += state.checked[q.id] ? tfCorrectCount(q) : 0;
      }
    });
    return {
      correct: correct,
      total: list.length,
      wrong: wrong,
      tfHit: tfHit,
      tfTotal: tfTotal,
      percent: list.length ? Math.round((correct / list.length) * 100) : 0,
    };
  }

  function formatWhen(stamp) {
    return new Date(stamp).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  }

  function clock(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return minutes + " phút " + String(seconds).padStart(2, "0") + " giây";
  }

  function formatClock(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  function armTimer() {
    clearInterval(timerId);
    timerId = null;
    if (state.view !== "quiz" || !state.deadline) return;
    const tick = function () {
      const left = state.deadline - Date.now();
      if (left <= 0) {
        clearInterval(timerId);
        timerId = null;
        state.timeUp = true;
        finish();
        return;
      }
      const node = document.querySelector("[data-clock]");
      if (!node) return;
      node.textContent = formatClock(left);
      node.classList.toggle("text-rose", left <= 60000);
      node.classList.toggle("text-ink", left > 60000);
    };
    tick();
    if (state.view !== "quiz") return;
    timerId = setInterval(tick, 250);
  }

  function figureHtml(images) {
    if (!images || !images.length) return "";
    return (
      '<div class="my-2 mb-3.5 grid gap-3">' +
      images
        .map(function (image) {
          return (
            '<figure class="m-0 overflow-hidden rounded-[14px] border border-line bg-white shadow-xs"><button type="button" class="relative block w-full cursor-zoom-in border-0 bg-white p-2 sm:p-2.5 text-center" data-action="zoom" data-src="' +
            esc(image.src) +
            '" data-alt="' +
            esc(image.alt) +
            '"><img class="mx-auto max-h-[190px] sm:max-h-[220px] lg:max-h-[240px] w-auto max-w-full object-contain" src="' +
            esc(image.src) +
            '" alt="' +
            esc(image.alt) +
            '"><span class="absolute right-2 bottom-2 inline-flex items-center gap-1.5 rounded-full bg-neutral-900/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm sm:hidden"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-3.5 w-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" /></svg>Phóng to</span></button>' +
            (image.caption
              ? '<figcaption class="px-3 pb-2 text-[12px] sm:text-[13px] text-muted text-center">' + esc(image.caption) + "</figcaption>"
              : "") +
            "</figure>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function tableHtml(table) {
    if (!table) return "";
    return (
      '<div class="mb-3 overflow-x-auto rounded-xl border border-line bg-card/40 p-0.5"><table class="w-full min-w-[280px] border-collapse text-[13px] sm:text-[15px]"><caption class="mb-1.5 p-1 text-left text-[12px] sm:text-[13px] text-muted">' +
      esc(table.caption) +
      "</caption><thead><tr>" +
      table.headers
        .map(function (header) {
          return '<th class="border-b border-line px-2.5 py-2 text-left font-semibold">' + esc(header) + "</th>";
        })
        .join("") +
      "</tr></thead><tbody>" +
      table.rows
        .map(function (row) {
          return (
            "<tr>" +
            row
              .map(function (cell) {
                return '<td class="border-b border-line px-2.5 py-2 text-left">' + esc(cell) + "</td>";
              })
              .join("") +
            "</tr>"
          );
        })
        .join("") +
      "</tbody></table></div>"
    );
  }

  function renderHome() {
    const scores = loadScores();
    const total = SINH12.lessons.reduce(function (sum, lesson) {
      return sum + lesson.questions.length;
    }, 0);
    const cards = SINH12.lessons
      .map(function (lesson) {
        const counts = { I: 0, II: 0, III: 0 };
        lesson.questions.forEach(function (q) {
          counts[q.part] += 1;
        });
        const score = scores[lesson.id];
        return (
          '<button type="button" class="group grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4 border-x-0 border-t border-b-0 border-line bg-transparent px-2 py-3.5 sm:py-[18px] text-left last:border-b active:bg-card/90 sm:hover:bg-card/70 transition-colors" data-action="open-lesson" data-id="' +
          lesson.id +
          '"><span class="font-serif text-[24px] sm:text-[28px] font-bold text-pine">' +
          String(lesson.index).padStart(2, "0") +
          '</span><span class="grid gap-0.5"><strong class="text-sm sm:text-base leading-snug">' +
          esc(lesson.title) +
          '</strong><span class="text-xs sm:text-sm text-muted">' +
          counts.I +
          " lựa chọn · " +
          counts.II +
          " đúng/sai · " +
          counts.III +
          " trả lời ngắn</span>" +
          (score
            ? '<span class="text-xs sm:text-sm font-medium text-pine">Lần trước ' +
              score.correct +
              "/" +
              score.total +
              " (" +
              score.percent +
              "%) · " +
              formatWhen(score.at) +
              "</span>"
            : "") +
          '</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 text-muted shrink-0 group-hover:text-primary transition-colors"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg></button>'
        );
      })
      .join("");

    return (
      '<div>' +
      headerHtml("Luyện đề Sinh học", "") +
      '<p class="' +
      eyebrow +
      '">Sinh học 12 · Năm học 2026–2027</p><h1 class="mt-2 mb-2 sm:mb-3 font-serif text-[clamp(28px,7vw,50px)] leading-[1.18] font-[650] tracking-[-0.03em] text-ink">Ôn tập giữa học kì I</h1><p class="m-0 max-w-[46rem] text-[15px] sm:text-[17px] text-muted leading-relaxed">Làm trắc nghiệm theo định hướng ôn tập. Mỗi câu có đáp án và giải thích ngắn, kể cả các câu gắn với hình trong đề.</p><div class="mt-5 sm:mt-7 flex flex-wrap gap-3 sm:gap-7"><div class="flex-1 sm:flex-initial min-w-[70px] rounded-xl border border-line/60 bg-card/60 sm:border-0 sm:bg-transparent p-2.5 sm:p-0 text-center sm:text-left"><b class="block font-serif text-[26px] sm:text-[32px] leading-none text-ink">' +
      SINH12.lessons.length +
      '</b><span class="text-xs sm:text-sm text-muted">bài</span></div><div class="flex-1 sm:flex-initial min-w-[70px] rounded-xl border border-line/60 bg-card/60 sm:border-0 sm:bg-transparent p-2.5 sm:p-0 text-center sm:text-left"><b class="block font-serif text-[26px] sm:text-[32px] leading-none text-ink">' +
      total +
      '</b><span class="text-xs sm:text-sm text-muted">câu</span></div><div class="flex-1 sm:flex-initial min-w-[70px] rounded-xl border border-line/60 bg-card/60 sm:border-0 sm:bg-transparent p-2.5 sm:p-0 text-center sm:text-left"><b class="block font-serif text-[26px] sm:text-[32px] leading-none text-ink">3</b><span class="text-xs sm:text-sm text-muted">dạng</span></div></div></div>' +
      // Featured Card matching Image 1 & 4
      '<div class="mt-7 sm:mt-8 rounded-2xl border border-line bg-card p-4 sm:p-5 shadow-xs">' +
      '<div class="flex items-start justify-between gap-3">' +
      '<div>' +
      '<h2 class="text-base sm:text-lg font-bold text-ink">Đề thi thử · Sinh học 2026</h2>' +
      '<p class="mt-0.5 text-xs sm:text-sm text-muted">40 câu hỏi · 50 phút · Cấu trúc chuẩn THPT</p>' +
      '</div>' +
      '<span class="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-muted border border-line">Tổng hợp</span>' +
      '</div>' +
      '<div class="mt-3.5 mb-3.5 h-1.5 overflow-hidden rounded-full bg-line">' +
      '<span class="block h-full bg-primary" style="width: 100%"></span>' +
      '</div>' +
      '<div class="flex items-center gap-2.5">' +
      '<button type="button" class="' + primary + ' flex-1 rounded-xl text-center justify-center font-semibold" data-action="open-lesson" data-id="all">Tiếp tục làm bài</button>' +
      '<button type="button" class="h-10 w-10 shrink-0 rounded-xl border border-line bg-card flex items-center justify-center text-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer" title="Lưu đề" data-action="open-lesson" data-id="all">' +
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>' +
      '</button>' +
      '</div>' +
      '</div>' +
      // Lessons list
      '<div class="mt-6 sm:mt-7">' +
      '<p class="text-xs font-bold text-muted uppercase tracking-wider mb-2.5 px-1">Luyện tập theo từng bài</p>' +
      '<div class="rounded-xl border border-line bg-card divide-y divide-line overflow-hidden">' +
      cards +
      "</div></div></div>"
    );
  }

  function renderPrep() {
    const lesson = state.lessonId === "all" ? null : lessonById(state.lessonId);
    const title = lesson ? "Bài " + lesson.index + ". " + lesson.title : "Cả 5 bài";
    const selected = {};
    state.parts.forEach(function (part) {
      selected[part] = true;
    });
    const pool = questionsFor(state.lessonId, ["I", "II", "III"]);
    const counts = { I: 0, II: 0, III: 0 };
    pool.forEach(function (q) {
      counts[q.part] += 1;
    });
    const chosen = questionsFor(state.lessonId, state.parts);
    const partBoxes = ["I", "II", "III"]
      .map(function (part) {
        return (
          '<label class="grid cursor-pointer grid-cols-[auto_1fr] items-start gap-3 rounded-[14px] border border-line p-3 sm:p-3.5 active:bg-pine-soft/40 transition-colors"><input class="mt-1 h-4 w-4 accent-pine" type="checkbox" data-action="toggle-part" data-part="' +
          part +
          '"' +
          (selected[part] ? " checked" : "") +
          '><span class="grid text-sm sm:text-base"><b>Phần ' +
          part +
          " · " +
          PARTS[part] +
          '</b><small class="text-muted">' +
          counts[part] +
          " câu</small></span></label>"
        );
      })
      .join("");
    const timeChoices = [0, 15, 30, 45, 60]
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
        ? '<div class="mb-4"><p class="' + eyebrow + '">Thời gian làm bài</p><div class="mt-2 flex flex-wrap gap-2">' +
          timeChoices +
          "</div></div>"
        : "";

    return (
      '<div>' +
      headerHtml(title, '<button type="button" class="' + textBtn + ' font-medium" data-action="home">← Danh sách bài</button>') +
      '<article class="' +
      sheet +
      '"><p class="' +
      eyebrow +
      '">Chọn cách làm</p><h1 class="' +
      heading +
      '">' +
      esc(title) +
      '</h1><div class="mb-4 grid gap-2.5"><label class="grid cursor-pointer grid-cols-[auto_1fr] items-start gap-3 rounded-[14px] border border-line p-3 sm:p-3.5 active:bg-pine-soft/40 transition-colors"><input class="mt-1 h-4 w-4 accent-primary" type="radio" name="mode" data-action="set-mode" value="practice"' +
      (state.mode === "practice" ? " checked" : "") +
      '><span class="grid text-sm sm:text-base"><b>Luyện tập</b><small class="text-muted">Kiểm tra từng câu và xem giải thích ngay.</small></span></label><label class="grid cursor-pointer grid-cols-[auto_1fr] items-start gap-3 rounded-[14px] border border-line p-3 sm:p-3.5 active:bg-pine-soft/40 transition-colors"><input class="mt-1 h-4 w-4 accent-primary" type="radio" name="mode" data-action="set-mode" value="exam"' +
      (state.mode === "exam" ? " checked" : "") +
      '><span class="grid text-sm sm:text-base"><b>Kiểm tra</b><small class="text-muted">Làm hết bài rồi mới nộp. Đáp án hiện sau khi nộp.</small></span></label></div>' +
      timeRow +
      '<div class="mb-4 grid gap-2.5">' +
      partBoxes +
      '</div><button type="button" class="' +
      primary +
      ' w-full rounded-2xl py-3.5 sm:py-4 text-base font-semibold shadow-md active:scale-[0.99]" data-action="start"' +
      (chosen.length ? "" : " disabled") +
      ">Bắt đầu · " +
      chosen.length +
      " câu</button></article>"
    );
  }

  function optionClass(q, index, revealed) {
    const base =
      "cursor-pointer appearance-none select-none disabled:cursor-not-allowed grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border p-3 sm:p-3.5 text-left text-sm sm:text-base active:scale-[0.99] touch-manipulation transition-all ";
    const picked = state.answers[q.id] === index;
    if (!revealed) {
      if (picked) {
        return base + "border-selected bg-selected-soft font-medium text-ink shadow-xs ring-1 ring-selected";
      }
      return base + "border-line bg-card hover:border-selected/40 hover:bg-surface-muted text-ink";
    }
    if (index === q.correct) {
      return base + "border-success bg-success-soft font-semibold text-ink ring-1 ring-success/40";
    }
    if (picked) {
      return base + "border-danger bg-danger-soft text-ink ring-1 ring-danger/40";
    }
    return base + "border-line bg-card/60 opacity-60 text-ink";
  }

  function renderQuiz() {
    const q = state.questions[state.index];
    const revealed = !!state.checked[q.id];
    const isFlagged = !!state.bookmarks[q.id];
    const where =
      (state.lessonId === "all" ? "Bài " + q.lessonIndex + " · " : "") +
      "Phần " +
      q.part +
      " · Câu " +
      q.n;

    const dots = state.questions
      .map(function (item, index) {
        const isCurrent = index === state.index;
        const flagged = !!state.bookmarks[item.id];
        const answered = isAnswered(item);
        const checked = !!state.checked[item.id];
        const correct = checked && isCorrect(item);

        let cls =
          "relative flex items-center justify-center shrink-0 cursor-pointer rounded-xl p-0 font-semibold text-xs sm:text-sm transition-all touch-manipulation ";
        cls += "h-9 sm:h-10 w-full ";

        if (isCurrent) {
          cls += "ring-2 ring-selected bg-selected-soft text-selected font-bold shadow-xs ";
        } else if (flagged) {
          cls += "bg-bookmark-soft text-bookmark border border-bookmark/40 font-semibold ";
        } else if (checked) {
          cls += correct ? "bg-success-soft text-success border border-success/30 " : "bg-danger-soft text-danger border border-danger/30 ";
        } else if (answered) {
          cls += "bg-success-soft text-success border border-success/30 ";
        } else {
          cls += "bg-card border border-line text-muted hover:border-primary/50 ";
        }

        return (
          '<button type="button" class="' +
          cls +
          '"' +
          (isCurrent ? ' data-current="true"' : "") +
          ' data-action="jump" data-index="' +
          index +
          '" aria-label="Câu ' +
          (index + 1) +
          '">' +
          (index + 1) +
          (flagged ? '<span class="absolute top-1 right-1 block h-2 w-2 rounded-full bg-bookmark ring-1.5 ring-card"></span>' : '') +
          '</button>'
        );
      })
      .join("");

    let body = "";
    if (q.type === "mcq") {
      const picked = state.answers[q.id];
      body = q.options
        .map(function (option, index) {
          const isSelected = picked === index;
          const isCorrectAnswer = revealed && index === q.correct;
          let badgeCls = "bg-surface-muted text-muted font-bold border border-line";
          let trailingIcon =
            '<span class="opacity-0 group-hover:opacity-40 transition-opacity text-muted inline-flex items-center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5"><circle cx="12" cy="12" r="9" /></svg></span>';

          if (revealed) {
            if (isCorrectAnswer) {
              badgeCls = "bg-success text-white font-bold";
              trailingIcon =
                '<span class="text-success inline-flex items-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" /></svg></span>';
            } else if (isSelected) {
              badgeCls = "bg-danger text-white font-bold";
              trailingIcon =
                '<span class="text-danger inline-flex items-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clip-rule="evenodd" /></svg></span>';
            }
          } else if (isSelected) {
            badgeCls = "bg-selected text-white font-bold";
            trailingIcon =
              '<span class="text-selected inline-flex items-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" clip-rule="evenodd" /></svg></span>';
          }

          return (
            '<button type="button" class="' +
            optionClass(q, index, revealed) +
            ' group" data-action="pick" data-index="' +
            index +
            '"' +
            (revealed ? " disabled" : "") +
            '><span class="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg ' +
            badgeCls +
            ' text-xs sm:text-sm transition-colors">' +
            letters[index] +
            '</span><span class="leading-snug break-words text-ink font-normal">' +
            esc(option) +
            "</span>" +
            trailingIcon +
            "</button>"
          );
        })
        .join("");
      body = '<div class="grid gap-2.5">' + body + "</div>";
    } else if (q.type === "tf") {
      const answer = state.answers[q.id] || [null, null, null, null];
      body = q.items
        .map(function (item, index) {
          const value = answer[index];
          let row = "grid gap-2.5 rounded-xl border p-3 sm:p-3.5 transition-colors ";
          let note = "";
          if (revealed) {
            row += value === item.correct ? "border-success bg-success-soft/80" : "border-danger bg-danger-soft/80";
            note = '<p class="m-0 text-xs sm:text-sm text-muted leading-relaxed">' + esc(item.explain) + "</p>";
          } else {
            row += "border-line bg-card";
          }
          return (
            '<div class="' +
            row +
            '"><p class="m-0 text-sm sm:text-base leading-relaxed text-ink"><b>' +
            marks[index] +
            ")</b> " +
            esc(item.text) +
            '</p><div class="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto"><button type="button" class="' +
            chip +
            ' h-10 px-4 inline-flex items-center justify-center font-medium" data-action="tf" data-index="' +
            index +
            '" data-value="true"' +
            (value === true ? ' aria-pressed="true"' : "") +
            (revealed ? " disabled" : "") +
            '>Đúng</button><button type="button" class="' +
            chip +
            ' h-10 px-4 inline-flex items-center justify-center font-medium" data-action="tf" data-index="' +
            index +
            '" data-value="false"' +
            (value === false ? ' aria-pressed="true"' : "") +
            (revealed ? " disabled" : "") +
            ">Sai</button></div>" +
            note +
            "</div>"
          );
        })
        .join("");
      body = '<div class="grid gap-2.5">' + body + "</div>";
    } else {
      const value = state.answers[q.id] || "";
      let mark = "";
      if (revealed) {
        mark = isCorrect(q)
          ? '<p class="mt-3 sm:mt-4 rounded-xl bg-success-soft border border-success/30 px-4 py-3.5 text-sm sm:text-base font-medium text-success">✓ Đúng. Đáp án: ' + esc(q.sample) + ".</p>"
          : '<p class="mt-3 sm:mt-4 rounded-xl border border-danger bg-danger-soft px-4 py-3.5 text-sm sm:text-base text-danger font-medium">✕ Chưa đúng. Đáp án: ' +
            esc(q.sample) +
            ".</p>";
      }
      body =
        '<label class="grid gap-2 font-semibold text-sm sm:text-base text-ink"><span>Nhập số đáp án</span><input class="w-full sm:w-[280px] rounded-xl border border-line bg-card px-4 py-3 text-base sm:text-lg text-ink focus:outline-primary focus:border-primary touch-manipulation" ' +
        (revealed ? "readonly" : "") +
        ' inputmode="numeric" autocomplete="off" enterkeyhint="done" data-short="' +
        esc(q.id) +
        '" value="' +
        esc(value) +
        '" placeholder="Ví dụ: ' +
        esc(q.sample) +
        '"></label>' +
        mark;
    }

    let feedbackBanner = "";
    if (revealed && state.mode === "practice") {
      if (q.type === "tf") {
        const hit = tfCorrectCount(q);
        if (hit === 4) {
          feedbackBanner =
            '<div class="mt-3.5 flex items-center gap-2.5 rounded-xl bg-success-soft border border-success/30 px-3.5 py-2.5 text-success font-semibold text-xs sm:text-sm anim-correct">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 shrink-0"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" /></svg>' +
            '<span>Chính xác hoàn toàn! Bạn làm đúng cả 4/4 ý.</span></div>';
        } else if (hit > 0) {
          feedbackBanner =
            '<div class="mt-3.5 flex items-center gap-2.5 rounded-xl bg-bookmark-soft border border-bookmark/30 px-3.5 py-2.5 text-bookmark font-semibold text-xs sm:text-sm anim-partial">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>' +
            '<span>Bạn làm đúng ' + hit + '/4 ý. Xem các ý cần lưu ý nhé!</span></div>';
        } else {
          feedbackBanner =
            '<div class="mt-3.5 flex items-center gap-2.5 rounded-xl bg-danger-soft border border-danger/30 px-3.5 py-2.5 text-danger font-semibold text-xs sm:text-sm anim-wrong">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 shrink-0"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clip-rule="evenodd" /></svg>' +
            '<span>Chưa chính xác ý nào. Đọc kỹ phần giải thích bên dưới nhé!</span></div>';
        }
      } else {
        const ok = isCorrect(q);
        if (ok) {
          feedbackBanner =
            '<div class="mt-3.5 flex items-center gap-2.5 rounded-xl bg-success-soft border border-success/30 px-3.5 py-2.5 text-success font-semibold text-xs sm:text-sm anim-correct">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 shrink-0"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" /></svg>' +
            '<span>Chính xác! Bạn đã chọn đúng đáp án.</span></div>';
        } else {
          feedbackBanner =
            '<div class="mt-3.5 flex items-center gap-2.5 rounded-xl bg-danger-soft border border-danger/30 px-3.5 py-2.5 text-danger font-semibold text-xs sm:text-sm anim-wrong">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 shrink-0"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clip-rule="evenodd" /></svg>' +
            '<span>Chưa chính xác! Xem đáp án đúng và giải thích chi tiết bên dưới.</span></div>';
        }
      }
    }

    const explain =
      revealed && q.explain
        ? '<div class="explain mt-3 sm:mt-4 rounded-xl bg-surface-muted border border-line px-3.5 sm:px-4 py-3 sm:py-3.5 whitespace-pre-line text-sm sm:text-base text-ink"><p class="' +
          eyebrow +
          '">💡 Giải thích chi tiết</p><p class="m-0 mt-1.5 whitespace-pre-line leading-relaxed text-ink">' +
          esc(q.explain) +
          "</p></div>"
        : (!revealed && state.mode === "practice"
            ? '<p class="mt-2.5 text-xs text-muted leading-relaxed">💡 Chọn đáp án rồi bấm "Kiểm tra" để xem kết quả và giải thích.</p>'
            : '<p class="mt-2.5 text-xs text-muted leading-relaxed">Minh họa trạng thái đáp án được chọn, kết quả công bố khi nộp bài.</p>');

    let primaryLabel = "Kiểm tra";
    let primaryAction = "check";
    if (state.mode === "exam") {
      primaryLabel = state.index === state.questions.length - 1 ? "Nộp bài" : "Câu tiếp →";
      primaryAction = state.index === state.questions.length - 1 ? "ask-finish" : "next";
    } else if (revealed) {
      primaryLabel = state.index === state.questions.length - 1 ? "Xem kết quả" : "Câu tiếp →";
      primaryAction = state.index === state.questions.length - 1 ? "ask-finish" : "next";
    }

    const submit =
      state.mode === "exam"
        ? '<button type="button" class="' + primary + ' px-3.5 sm:px-4 text-xs sm:text-sm font-semibold" data-action="ask-finish">Nộp bài</button>'
        : '<button type="button" class="' + textBtn + ' font-medium text-xs sm:text-sm" data-action="home">← Dừng bài</button>';
    const left = state.deadline ? state.deadline - Date.now() : 0;
    const clockHtml = state.deadline
      ? '<p class="m-0 text-xs sm:text-sm font-bold tracking-wide tabular-nums ' +
        (left <= 60000 ? "text-danger" : "text-primary") +
        '" data-clock>' +
        formatClock(left) +
        "</p>"
      : "";

    const answeredCount = state.questions.filter(function (item) {
      return isAnswered(item);
    }).length;

    const sidebarHtml =
      '<aside class="w-full lg:w-[310px] xl:w-[340px] shrink-0 order-2 lg:order-1 mt-2 lg:mt-0">' +
      '<div class="rounded-2xl border border-line bg-card p-3.5 sm:p-4 shadow-xs lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:flex lg:flex-col">' +
      '<div class="flex items-center justify-between pb-3 mb-2.5 border-b border-line/70">' +
      '<div>' +
      '<h2 class="text-sm sm:text-[15px] font-bold text-ink flex items-center gap-2">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4.5 w-4.5 text-primary shrink-0"><path fill-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" /></svg>' +
      'Bảng câu hỏi</h2>' +
      '<span class="text-xs text-muted">Bấm số để chuyển câu</span>' +
      '</div>' +
      '<span class="inline-flex items-center rounded-lg bg-success-soft px-2.5 py-1 text-xs font-bold text-success border border-success/20">' +
      answeredCount +
      ' / ' +
      state.questions.length +
      '</span>' +
      '</div>' +
      '<div class="dots grid grid-cols-5 gap-2 max-h-[min(520px,calc(100vh-280px))] overflow-y-auto py-1.5 pr-1.5">' +
      dots +
      '</div>' +
      '<div class="mt-3.5 pt-3 border-t border-line/70 text-xs text-muted space-y-2.5">' +
      '<div class="grid grid-cols-2 gap-x-2 gap-y-1.5">' +
      '<span class="inline-flex items-center gap-1.5"><span class="h-3 w-3 rounded bg-success-soft border border-success/40 shrink-0"></span> Đã làm</span>' +
      '<span class="inline-flex items-center gap-1.5"><span class="h-3 w-3 rounded bg-selected-soft ring-1 ring-selected shrink-0"></span> Đang chọn</span>' +
      '<span class="inline-flex items-center gap-1.5"><span class="h-3 w-3 rounded bg-bookmark-soft border border-bookmark/40 shrink-0"></span> Đánh dấu</span>' +
      '<span class="inline-flex items-center gap-1.5"><span class="h-3 w-3 rounded bg-card border border-line shrink-0"></span> Chưa làm</span>' +
      '</div>' +
      '<button type="button" class="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-line h-10 ' +
      (isFlagged
        ? 'bg-bookmark-soft text-bookmark border-bookmark/40 font-semibold'
        : 'bg-surface-muted hover:bg-card text-muted hover:text-ink') +
      ' text-xs sm:text-[13px] transition-colors cursor-pointer" data-action="toggle-bookmark">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z" clip-rule="evenodd" /></svg>' +
      '<span>' +
      (isFlagged ? 'Đã đánh dấu câu ' + (state.index + 1) : 'Đánh dấu câu ' + (state.index + 1)) +
      '</span>' +
      '</button>' +
      '</div>' +
      '</div>' +
      '</aside>';

    const mainAreaHtml =
      '<div class="flex-1 min-w-0 order-1 lg:order-2 flex flex-col gap-3 sm:gap-3.5">' +
      '<article class="' +
      sheet +
      (state.lastCheckAnim ? " " + state.lastCheckAnim : "") +
      '">' +
      '<div class="mb-3 flex items-center justify-between gap-2 flex-wrap">' +
      '<div class="flex items-center gap-2">' +
      '<span class="inline-flex items-center rounded-lg bg-success-soft px-2.5 py-1 text-xs font-semibold text-success border border-success/20">' +
      'Câu ' +
      (state.index + 1) +
      '</span>' +
      '<span class="text-xs text-muted font-medium">' +
      esc(where) +
      ' · ' +
      esc(PARTS[q.part]) +
      '</span>' +
      '</div>' +
      '<button type="button" class="' +
      (isFlagged
        ? 'bg-bookmark-soft text-bookmark border-bookmark/40 font-semibold'
        : 'bg-card text-muted hover:text-ink border-line hover:border-primary/40') +
      ' inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors" data-action="toggle-bookmark" title="Đánh dấu để xem lại sau">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z" clip-rule="evenodd" /></svg>' +
      '<span>' +
      (isFlagged ? 'Đã đánh dấu' : 'Đánh dấu xem lại') +
      '</span>' +
      '</button>' +
      '</div>' +
      (q.context ? '<p class="m-0 mb-3 text-sm sm:text-base text-muted leading-relaxed">' + esc(q.context) + '</p>' : '') +
      figureHtml(q.images) +
      tableHtml(q.table) +
      '<h1 class="m-0 mt-1 mb-3.5 font-serif text-[clamp(18px,2vw,22px)] leading-[1.4] font-[650] tracking-[-0.02em] whitespace-pre-line text-ink">' +
      esc(q.prompt || q.lead || '') +
      '</h1>' +
      (q.prompt && q.lead ? '<p class="m-0 mt-2 mb-3 text-sm sm:text-base text-muted leading-relaxed">' + esc(q.lead) + '</p>' : '') +
      body +
      feedbackBanner +
      explain +
      '</article>' +
      (state.hint ? '<p class="mx-1 my-1 text-sm font-semibold text-danger">' + esc(state.hint) + '</p>' : '') +
      // Bottom Controls
      '<div class="flex items-center justify-between gap-3 pt-0.5">' +
      '<button type="button" class="' +
      ghost +
      ' px-4 sm:px-6 shrink-0" data-action="prev"' +
      (state.index === 0 ? ' disabled' : '') +
      '>← Câu trước</button>' +
      '<button type="button" class="' +
      primary +
      ' flex-1 sm:flex-initial px-6 sm:px-8 text-center" data-action="' +
      primaryAction +
      '">' +
      primaryLabel +
      '</button>' +
      '</div>' +
      '</div>';

    return (
      '<div>' +
      headerHtml(state.lessonId === "all" ? "Đề tổng hợp cả 5 bài" : (lessonById(state.lessonId) ? lessonById(state.lessonId).title : "Ôn tập"), submit) +
      // Stat row: TIẾN ĐỘ, THỜI GIAN CÒN
      '<div class="mb-3 flex items-center justify-between gap-3 text-xs sm:text-sm">' +
      '<div class="flex items-center gap-4">' +
      '<div><span class="block text-[10px] sm:text-[11px] font-bold text-muted uppercase tracking-wider">Tiến độ</span><strong class="text-xs sm:text-sm text-ink">' +
      (state.index + 1) + ' / ' + state.questions.length + ' câu</strong></div>' +
      (state.deadline ? '<div><span class="block text-[10px] sm:text-[11px] font-bold text-muted uppercase tracking-wider">Thời gian còn</span>' + clockHtml + '</div>' : '') +
      '</div>' +
      '<span class="text-xs text-muted font-medium">' + esc(state.mode === "exam" ? "Chế độ Kiểm tra" : "Chế độ Luyện tập") + '</span>' +
      '</div>' +
      // Progress Bar
      '<div class="mb-4 h-1.5 overflow-hidden rounded-full bg-line"><span class="block h-full bg-primary transition-all duration-300" style="width:' +
      ((state.index + 1) / state.questions.length) * 100 +
      '%"></span></div>' +
      // 2-Column Split: Bảng câu hỏi bên trái, Câu hỏi và Nút thao tác bên phải
      '<div class="flex flex-col lg:flex-row lg:items-start lg:gap-6">' +
      sidebarHtml +
      mainAreaHtml +
      '</div></div>'
    );
  }

  function answerText(q) {
    const answer = state.answers[q.id];
    if (q.type === "mcq") {
      if (!Number.isInteger(answer)) return "Chưa chọn";
      return letters[answer] + ". " + q.options[answer];
    }
    if (q.type === "tf") {
      return q.items
        .map(function (item, index) {
          const value = answer ? answer[index] : null;
          const label = value === true ? "Đúng" : value === false ? "Sai" : "—";
          return marks[index] + " " + label;
        })
        .join(" · ");
    }
    return answer && String(answer).trim() ? String(answer) : "Chưa nhập";
  }

  function solutionHtml(q) {
    if (q.type === "tf") {
      return q.items
        .map(function (item, index) {
          return '<p class="m-0 mt-2"><b>' + marks[index] + ".</b> " + esc(item.explain) + "</p>";
        })
        .join("");
    }
    return q.explain ? '<p class="m-0 mt-2 whitespace-pre-line">' + esc(q.explain) + "</p>" : "";
  }

  function correctText(q) {
    if (q.type === "mcq") return letters[q.correct] + ". " + q.options[q.correct];
    if (q.type === "tf") {
      return q.items
        .map(function (item, index) {
          return marks[index] + " " + (item.correct ? "Đúng" : "Sai");
        })
        .join(" · ");
    }
    return q.sample;
  }

  function renderResult() {
    const summary = summaryOf(state.questions);
    const tone = summary.percent >= 80 ? "ok" : summary.percent >= 50 ? "mid" : "bad";
    const line =
      summary.percent >= 80
        ? "Bạn đang nắm chắc phần này."
        : summary.percent >= 50
          ? "Xem lại các câu chưa đúng rồi làm thêm một lượt."
          : "Nên đọc giải thích, rồi làm lại từng bài.";
    const spent = state.startedAt ? clock(Date.now() - state.startedAt) : "";
    const list = state.questions.filter(function (q) {
      if (state.filter === "wrong") return !isMarkedCorrect(q);
      return true;
    });
    const reviews = list.length
      ? list
          .map(function (q) {
            const ok = isMarkedCorrect(q);
            const extra =
              q.type === "tf" ? " · " + tfCorrectCount(q) + "/4 ý" : "";
            return (
              "<details" +
              (ok ? "" : " open") +
              ' class="mb-2.5 rounded-[14px] border border-line bg-paper px-3.5 py-3"><summary class="flex cursor-pointer items-center gap-2.5"><span class="rounded-full px-2.5 py-0.5 text-[13px] font-bold ' +
              (ok ? "bg-pine-soft text-pine" : "bg-rose-soft text-rose") +
              '">' +
              (ok ? "Đúng" : "Sai") +
              extra +
              '</span><span>Bài ' +
              q.lessonIndex +
              " · Phần " +
              q.part +
              " · Câu " +
              q.n +
              "</span></summary><p class=\"m-0 mt-2.5\">" +
              esc(q.prompt || q.lead) +
              '</p><p class="m-0 mt-2"><b>Bạn chọn:</b> ' +
              esc(answerText(q)) +
              '</p><p class="m-0 mt-2"><b>Đáp án:</b> ' +
              esc(correctText(q)) +
              "</p>" +
              solutionHtml(q) +
              "</details>"
            );
          })
          .join("")
      : '<p class="text-muted">Không có câu sai trong lượt này.</p>';

    const scoreTone = tone === "ok" ? "text-success" : tone === "mid" ? "text-bookmark" : "text-danger";

    let tierBannerHtml = "";
    if (summary.percent >= 80) {
      tierBannerHtml =
        '<div class="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/15 via-primary/10 to-amber-500/15 border border-success/30 p-3.5 sm:p-4 anim-celebrate">' +
        '<div class="flex items-center gap-3.5">' +
        '<div class="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md shadow-amber-500/30 anim-trophy-bounce text-2xl sm:text-3xl">' +
        '🏆' +
        '</div>' +
        '<div>' +
        '<span class="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success border border-success/30">🎉 Xuất sắc</span>' +
        '<h3 class="text-sm sm:text-base font-bold text-ink mt-0.5 mb-0.5">Bạn làm đúng ' + summary.correct + '/' + summary.total + ' câu (' + summary.percent + '%)</h3>' +
        '<p class="text-xs text-muted m-0">Kiến thức của bạn rất vững vàng, chúc mừng bạn!</p>' +
        '</div>' +
        '</div>' +
        '</div>';
    } else if (summary.percent >= 50) {
      tierBannerHtml =
        '<div class="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/10 via-primary/10 to-emerald-500/10 border border-selected/30 p-3.5 sm:p-4">' +
        '<div class="flex items-center gap-3.5">' +
        '<div class="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 anim-thumb-float text-2xl sm:text-3xl">' +
        '👍' +
        '</div>' +
        '<div>' +
        '<span class="inline-flex items-center gap-1 rounded-full bg-selected-soft px-2.5 py-0.5 text-xs font-bold text-selected border border-selected/30">✨ Khá tốt</span>' +
        '<h3 class="text-sm sm:text-base font-bold text-ink mt-0.5 mb-0.5">Bạn làm đúng ' + summary.correct + '/' + summary.total + ' câu (' + summary.percent + '%)</h3>' +
        '<p class="text-xs text-muted m-0">Bạn đã nắm được phần lớn kiến thức, ôn thêm một chút nữa nhé!</p>' +
        '</div>' +
        '</div>' +
        '</div>';
    } else {
      tierBannerHtml =
        '<div class="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-amber-500/10 border border-bookmark/30 p-3.5 sm:p-4">' +
        '<div class="flex items-center gap-3.5">' +
        '<div class="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 anim-bulb-glow text-2xl sm:text-3xl">' +
        '💡' +
        '</div>' +
        '<div>' +
        '<span class="inline-flex items-center gap-1 rounded-full bg-bookmark-soft px-2.5 py-0.5 text-xs font-bold text-bookmark border border-bookmark/30">💪 Cần cố gắng</span>' +
        '<h3 class="text-sm sm:text-base font-bold text-ink mt-0.5 mb-0.5">Bạn làm đúng ' + summary.correct + '/' + summary.total + ' câu (' + summary.percent + '%)</h3>' +
        '<p class="text-xs text-muted m-0">Đừng nản lòng, bấm "Ôn ' + summary.wrong.length + ' câu sai" phía dưới để làm lại nhé!</p>' +
        '</div>' +
        '</div>' +
        '</div>';
    }

    return (
      '<div>' +
      headerHtml("Kết quả bài thi", '<button type="button" class="' + textBtn + ' font-medium" data-action="home">← Danh sách bài</button>') +
      '<article class="' +
      sheet +
      '"><p class="' +
      eyebrow +
      '">Kết quả ôn tập</p>' +
      tierBannerHtml +
      '<div class="flex items-baseline gap-3"><p class="m-0 font-serif text-[56px] sm:text-[72px] leading-none font-[650] ' +
      scoreTone +
      '">' +
      summary.correct +
      '<span class="text-[0.4em] text-muted font-normal">/' +
      summary.total +
      '</span></p><p class="m-0 text-xl sm:text-[24px] font-bold ' +
      scoreTone +
      '">' +
      summary.percent +
      "%</p></div><p class=\"mt-2 text-sm sm:text-base leading-relaxed\">" +
      line +
      '</p><ul class="m-0 mt-3 grid list-none gap-1.5 p-0 text-xs sm:text-sm text-muted"><li>' +
      (state.mode === "exam" ? "Chế độ kiểm tra" : "Chế độ luyện tập") +
      "</li>" +
      (summary.tfTotal
        ? "<li>Ý đúng/sai (Phần II): " + summary.tfHit + "/" + summary.tfTotal + " ý</li>"
        : "") +
      (spent ? "<li>Thời gian làm: " + spent + "</li>" : "") +
      (state.minutes ? "<li>Giới hạn: " + state.minutes + " phút</li>" : "") +
      (state.timeUp ? "<li>Hết giờ làm bài</li>" : "") +
      '</ul><div class="mt-5 flex flex-col sm:flex-row gap-2.5"><button type="button" class="' +
      primary +
      ' w-full sm:w-auto px-5 text-center justify-center" data-action="retry">Làm lại bài này</button><button type="button" class="' +
      ghost +
      ' w-full sm:w-auto px-5 text-center justify-center"' +
      (summary.wrong.length ? "" : " disabled") +
      ' data-action="retry-wrong">Ôn ' +
      summary.wrong.length +
      ' câu sai</button></div><div class="mt-5 flex gap-2"><button type="button" class="' +
      chip +
      '" data-action="filter" data-filter="wrong"' +
      (state.filter === "wrong" ? ' aria-pressed="true"' : "") +
      '>Câu sai (' +
      summary.wrong.length +
      ')</button><button type="button" class="' +
      chip +
      '" data-action="filter" data-filter="all"' +
      (state.filter === "all" ? ' aria-pressed="true"' : "") +
      '>Tất cả (' +
      summary.total +
      ")</button></div><div class=\"mt-4 sm:mt-[18px]\">" +
      reviews +
      "</div></article>"
    );
  }

  function renderModal() {
    if (!state.modal) return "";
    const left = state.questions.filter(function (q) {
      return state.mode === "exam" ? !isAnswered(q) : !state.checked[q.id];
    }).length;
    if (!left) return "";
    return (
      '<div class="fixed inset-0 z-30 grid place-items-end sm:place-items-center bg-black/65 p-3 sm:p-4 backdrop-blur-sm">' +
      '<div class="w-full max-w-[560px] rounded-2xl sm:rounded-3xl border border-line bg-card p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] safe-bottom anim-card" role="dialog" aria-modal="true">' +
      '<div class="flex items-start gap-3.5 sm:gap-4">' +
      '<span class="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-bookmark-soft text-bookmark border border-bookmark/30 shadow-xs">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-6 w-6"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>' +
      '</span>' +
      '<div class="flex-1 min-w-0">' +
      '<h2 class="m-0 font-serif text-[20px] sm:text-[24px] leading-snug font-bold text-ink">Còn ' +
      left +
      ' câu chưa hoàn thành</h2>' +
      '<p class="mt-1.5 mb-0 text-xs sm:text-sm text-muted leading-relaxed">Những câu bỏ trống sẽ được tính là chưa đúng. Bạn có muốn tiếp tục làm bài hay nộp ngay?</p>' +
      '</div>' +
      '</div>' +
      '<div class="mt-5 pt-3 border-t border-line/70 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">' +
      '<button type="button" class="' +
      ghost +
      ' w-full sm:w-auto px-4 whitespace-nowrap" data-action="close-modal">Ở lại</button>' +
      '<button type="button" class="' +
      ghost +
      ' w-full sm:w-auto px-4 sm:px-5 font-semibold text-primary border-primary/40 bg-primary/5 hover:bg-primary/10 whitespace-nowrap" data-action="jump-blank">Làm tiếp câu trống</button>' +
      '<button type="button" class="' +
      primary +
      ' w-full sm:w-auto px-5 whitespace-nowrap font-semibold" data-action="finish">Nộp bài ngay</button>' +
      '</div>' +
      '</div>' +
      '</div>'
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
      const scroller = document.querySelector(".dots");
      if (current && scroller) {
        if (typeof current.scrollIntoView === "function") {
          current.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      }
      if (state.keepScroll) {
        window.scrollTo(0, top);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      window.scrollTo(0, 0);
    }
    state.keepScroll = false;
    armTimer();
  }

  function start(questions, keepScore) {
    state.keepScore = keepScore !== false;
    state.questions = questions;
    state.index = 0;
    state.answers = {};
    state.checked = {};
    state.modal = null;
    state.hint = "";
    state.filter = "wrong";
    state.startedAt = Date.now();
    state.timeUp = false;
    state.deadline =
      state.mode === "exam" && state.minutes > 0 ? Date.now() + state.minutes * 60000 : null;
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

    // Phát âm thanh và hiệu ứng animation dựa theo số lượng câu đúng / tỷ lệ phần trăm
    if (summary.percent >= 80) {
      SoundFX.playVictory();
      setTimeout(launchConfetti, 250);
    } else if (summary.percent >= 50) {
      SoundFX.playGood();
    } else {
      SoundFX.playEncourage();
    }

    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onClick(event) {
    const node = event.target.closest("[data-action]");
    if (!node) return;
    const action = node.dataset.action;
    const q = state.questions[state.index];

    if (action === "toggle-sound") {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem("sinh12-sound", state.soundEnabled);
      if (state.soundEnabled) {
        SoundFX.playCorrect();
      }
      state.keepScroll = true;
      render();
      return;
    } else if (action === "toggle-theme") {
      state.theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("sinh12-theme", state.theme);
      if (state.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      state.keepScroll = true;
      render();
      return;
    } else if (action === "toggle-bookmark") {
      if (q) {
        state.bookmarks[q.id] = !state.bookmarks[q.id];
        state.keepScroll = true;
        render();
      }
      return;
    } else if (action === "home") {
      state.view = "home";
      state.modal = null;
      render();
    } else if (action === "open-lesson") {
      state.lessonId = node.dataset.id;
      state.mode = node.dataset.id === "all" ? "exam" : "practice";
      state.parts = ["I", "II", "III"];
      state.view = "prep";
      render();
    } else if (action === "set-time") {
      state.minutes = Number(node.dataset.minutes) || 0;
      state.keepScroll = true;
      render();
    } else if (action === "start") {
      const chosen = questionsFor(state.lessonId, state.parts);
      if (chosen.length) start(chosen);
    } else if (action === "pick") {
      if (state.checked[q.id]) return;
      state.answers[q.id] = Number(node.dataset.index);
      state.hint = "";
      state.keepScroll = true;
      render();
    } else if (action === "tf") {
      if (state.checked[q.id]) return;
      const current = (state.answers[q.id] || [null, null, null, null]).slice();
      current[Number(node.dataset.index)] = node.dataset.value === "true";
      state.answers[q.id] = current;
      state.hint = "";
      state.keepScroll = true;
      render();
    } else if (action === "check") {
      if (!isAnswered(q)) {
        state.hint =
          q.type === "tf"
            ? "Hãy chọn Đúng hoặc Sai cho cả 4 ý."
            : q.type === "short"
              ? "Hãy nhập đáp án trước đã."
              : "Hãy chọn một đáp án trước đã.";
        state.keepScroll = true;
        render();
        return;
      }
      state.checked[q.id] = true;
      state.hint = "";
      state.keepScroll = true;

      // Kích hoạt âm thanh và hiệu ứng animation tương ứng
      if (q.type === "tf") {
        const hit = tfCorrectCount(q);
        if (hit === 4) {
          SoundFX.playCorrect();
          state.lastCheckAnim = "anim-correct";
        } else if (hit > 0) {
          SoundFX.playPartial();
          state.lastCheckAnim = "anim-partial";
        } else {
          SoundFX.playWrong();
          state.lastCheckAnim = "anim-wrong";
        }
      } else {
        const ok = isCorrect(q);
        if (ok) {
          SoundFX.playCorrect();
          state.lastCheckAnim = "anim-correct";
        } else {
          SoundFX.playWrong();
          state.lastCheckAnim = "anim-wrong";
        }
      }

      render();
      const box = document.querySelector(".explain, .banner");
      if (box) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
      render();
    } else if (action === "ask-finish") {
      askFinish();
    } else if (action === "finish") {
      finish();
    } else if (action === "close-modal") {
      state.modal = null;
      state.keepScroll = true;
      render();
    } else if (action === "jump-blank") {
      const index = state.questions.findIndex(function (item) {
        return state.mode === "exam" ? !isAnswered(item) : !state.checked[item.id];
      });
      state.modal = null;
      if (index >= 0) state.index = index;
      state.lastCheckAnim = "";
      render();
    } else if (action === "retry") {
      start(state.questions.slice());
    } else if (action === "retry-wrong") {
      const wrong = state.questions.filter(function (item) {
        return !isMarkedCorrect(item);
      });
      if (!wrong.length) return;
      state.mode = "practice";
      start(wrong, false);
    } else if (action === "filter") {
      state.filter = node.dataset.filter;
      state.keepScroll = true;
      render();
    } else if (action === "zoom") {
      const dialog = document.getElementById("zoom");
      const image = dialog.querySelector("img");
      image.src = node.dataset.src;
      image.alt = node.dataset.alt || "";
      dialog.showModal();
    }
  }

  app.addEventListener("click", onClick);
  app.addEventListener("input", function (event) {
    const input = event.target.closest("[data-short]");
    if (!input) return;
    state.answers[input.dataset.short] = input.value;
    persist();
  });
  app.addEventListener("change", function (event) {
    const node = event.target;
    if (node.dataset.action === "set-mode") {
      state.mode = node.value;
      state.keepScroll = true;
      render();
    }
    if (node.dataset.action === "toggle-part") {
      const selected = new Set(state.parts);
      if (node.checked) selected.add(node.dataset.part);
      else selected.delete(node.dataset.part);
      state.parts = ["I", "II", "III"].filter(function (part) {
        return selected.has(part);
      });
      state.keepScroll = true;
      render();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (state.view !== "quiz" || state.modal) return;
    const q = state.questions[state.index];
    if (!q) return;
    const typing = event.target.matches("input, textarea");
    if (event.key === "Enter") {
      event.preventDefault();
      const button = document.querySelector('[data-action="check"], [data-action="next"], [data-action="ask-finish"]');
      if (button) button.click();
      return;
    }
    if (typing || q.type !== "mcq" || state.checked[q.id]) return;
    const key = event.key.toLowerCase();
    const map = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
    if (map[key] === undefined) return;
    state.answers[q.id] = map[key];
    state.hint = "";
    state.keepScroll = true;
    render();
  });

  let touchStartX = 0;
  let touchStartY = 0;

  app.addEventListener(
    "touchstart",
    function (event) {
      if (state.view !== "quiz" || state.modal) return;
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true }
  );

  app.addEventListener(
    "touchend",
    function (event) {
      if (state.view !== "quiz" || state.modal) return;
      const target = event.target;
      if (target.closest("input, textarea, table, .dots, [data-action='zoom']")) return;
      const touch = event.changedTouches[0];
      const diffX = touch.clientX - touchStartX;
      const diffY = touch.clientY - touchStartY;
      if (Math.abs(diffX) > 48 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX < 0) {
          if (state.mode === "exam" || state.checked[state.questions[state.index].id]) {
            if (state.index < state.questions.length - 1) {
              state.index += 1;
              state.hint = "";
              render();
            } else if (state.mode === "exam") {
              askFinish();
            }
          }
        } else {
          if (state.index > 0) {
            state.index -= 1;
            state.hint = "";
            render();
          }
        }
      }
    },
    { passive: true }
  );

  document.getElementById("zoom").addEventListener("click", function (event) {
    if (event.target.dataset.action === "close-zoom" || event.target === event.currentTarget) {
      event.currentTarget.close();
    }
  });

  restore();
  render();
})();
