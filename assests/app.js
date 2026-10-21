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
  const btn = "cursor-pointer appearance-none select-none disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation transition-all";
  const primary = btn + " rounded-full bg-pine-dark px-4 sm:px-[18px] py-2.5 sm:py-3 font-semibold text-paper active:scale-[0.98] shadow-sm";
  const ghost = btn + " rounded-full border border-line bg-transparent px-3.5 sm:px-4 py-2.5 sm:py-3 active:scale-[0.98]";
  const textBtn = "cursor-pointer border-0 bg-transparent px-2 py-1.5 text-muted hover:text-ink active:scale-95 touch-manipulation rounded-lg";
  const eyebrow = "m-0 text-xs sm:text-[13px] font-bold text-pine tracking-wide";
  const sheet =
    "anim-card rounded-2xl sm:rounded-[22px] border border-line bg-card p-4 sm:p-[22px] shadow-[0_8px_30px_rgba(36,32,22,0.06)]";
  const heading =
    "m-0 mt-2 mb-3 sm:mb-[18px] font-serif text-[clamp(24px,5vw,36px)] leading-[1.2] font-[650] tracking-[-0.02em]";
  const chip =
    "cursor-pointer select-none rounded-full border border-line bg-transparent px-3 sm:px-3.5 py-1.5 sm:py-2 text-sm sm:text-base aria-pressed:border-transparent aria-pressed:bg-pine-dark aria-pressed:text-paper touch-manipulation active:scale-[0.97] transition-all";

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
    modal: null,
    hint: "",
    filter: "wrong",
    startedAt: null,
    keepScore: true,
    minutes: 0,
    deadline: null,
    timeUp: false,
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
      '<div class="my-2 mb-4 grid gap-3">' +
      images
        .map(function (image) {
          return (
            '<figure class="m-0 overflow-hidden rounded-[14px] border border-line bg-white"><button type="button" class="relative block w-full cursor-zoom-in border-0 bg-white p-2 text-center" data-action="zoom" data-src="' +
            esc(image.src) +
            '" data-alt="' +
            esc(image.alt) +
            '"><img class="mx-auto max-h-[220px] sm:max-h-[340px] w-auto max-w-full object-contain" src="' +
            esc(image.src) +
            '" alt="' +
            esc(image.alt) +
            '"><span class="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-neutral-900/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm sm:hidden">🔍 Phóng to</span></button>' +
            (image.caption
              ? '<figcaption class="px-3 pb-2.5 text-[12px] sm:text-[13px] text-[#3d4a43]">' + esc(image.caption) + "</figcaption>"
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
          '<button type="button" class="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4 border-x-0 border-t border-b-0 border-line bg-transparent px-2 py-3.5 sm:py-[18px] text-left last:border-b active:bg-card/90 sm:hover:bg-card/70 transition-colors" data-action="open-lesson" data-id="' +
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
          '</span><span class="text-muted text-lg shrink-0" aria-hidden="true">→</span></button>'
        );
      })
      .join("");

    return (
      '<div><p class="' +
      eyebrow +
      '">Sinh học 12 · Năm học 2026–2027</p><h1 class="mt-2 mb-2 sm:mb-3 font-serif text-[clamp(28px,7vw,50px)] leading-[1.18] font-[650] tracking-[-0.03em]">Ôn tập giữa học kì I</h1><p class="m-0 max-w-[46rem] text-[15px] sm:text-[17px] text-muted leading-relaxed">Làm trắc nghiệm theo định hướng ôn tập. Mỗi câu có đáp án và giải thích ngắn, kể cả các câu gắn với hình trong đề.</p><div class="mt-5 sm:mt-7 flex flex-wrap gap-3 sm:gap-7"><div class="flex-1 sm:flex-initial min-w-[70px] rounded-xl border border-line/60 bg-card/60 sm:border-0 sm:bg-transparent p-2.5 sm:p-0 text-center sm:text-left"><b class="block font-serif text-[26px] sm:text-[32px] leading-none">' +
      SINH12.lessons.length +
      '</b><span class="text-xs sm:text-sm text-muted">bài</span></div><div class="flex-1 sm:flex-initial min-w-[70px] rounded-xl border border-line/60 bg-card/60 sm:border-0 sm:bg-transparent p-2.5 sm:p-0 text-center sm:text-left"><b class="block font-serif text-[26px] sm:text-[32px] leading-none">' +
      total +
      '</b><span class="text-xs sm:text-sm text-muted">câu</span></div><div class="flex-1 sm:flex-initial min-w-[70px] rounded-xl border border-line/60 bg-card/60 sm:border-0 sm:bg-transparent p-2.5 sm:p-0 text-center sm:text-left"><b class="block font-serif text-[26px] sm:text-[32px] leading-none">3</b><span class="text-xs sm:text-sm text-muted">dạng</span></div></div></div><div class="mt-7 sm:mt-9"><button type="button" class="' +
      primary +
      ' w-full rounded-2xl py-3.5 sm:py-4 text-base font-semibold shadow-md active:scale-[0.99]" data-action="open-lesson" data-id="all">Làm cả 5 bài (40 câu)</button><div class="mt-4 sm:mt-[18px]">' +
      cards +
      "</div></div>"
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
      '<div class="mb-3.5 flex items-center justify-between gap-3"><button type="button" class="' +
      textBtn +
      ' font-medium" data-action="home">← Danh sách bài</button></div><article class="' +
      sheet +
      '"><p class="' +
      eyebrow +
      '">Chọn cách làm</p><h1 class="' +
      heading +
      '">' +
      esc(title) +
      '</h1><div class="mb-4 grid gap-2.5"><label class="grid cursor-pointer grid-cols-[auto_1fr] items-start gap-3 rounded-[14px] border border-line p-3 sm:p-3.5 active:bg-pine-soft/40 transition-colors"><input class="mt-1 h-4 w-4 accent-pine" type="radio" name="mode" data-action="set-mode" value="practice"' +
      (state.mode === "practice" ? " checked" : "") +
      '><span class="grid text-sm sm:text-base"><b>Luyện tập</b><small class="text-muted">Kiểm tra từng câu và xem giải thích ngay.</small></span></label><label class="grid cursor-pointer grid-cols-[auto_1fr] items-start gap-3 rounded-[14px] border border-line p-3 sm:p-3.5 active:bg-pine-soft/40 transition-colors"><input class="mt-1 h-4 w-4 accent-pine" type="radio" name="mode" data-action="set-mode" value="exam"' +
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
      "cursor-pointer appearance-none select-none disabled:cursor-not-allowed grid w-full grid-cols-[auto_1fr] items-center gap-3 rounded-[14px] border p-3 sm:p-3.5 text-left text-sm sm:text-base active:scale-[0.99] touch-manipulation transition-all ";
    const picked = state.answers[q.id] === index;
    if (!revealed) return base + (picked ? "border-pine bg-pine-soft font-medium shadow-xs" : "border-line bg-card hover:bg-card/80");
    if (index === q.correct) return base + "border-pine bg-pine-soft font-semibold";
    if (picked) return base + "border-rose bg-rose-soft";
    return base + "border-line bg-card/60 opacity-60";
  }

  function renderQuiz() {
    const q = state.questions[state.index];
    const revealed = !!state.checked[q.id];
    const where =
      (state.lessonId === "all" ? "Bài " + q.lessonIndex + " · " : "") +
      "Phần " +
      q.part +
      " · Câu " +
      q.n;
    const dots = state.questions
      .map(function (item, index) {
        const isCurrent = index === state.index;
        let cls =
          "relative flex items-center justify-center shrink-0 cursor-pointer rounded-full p-0 leading-none transition-all touch-manipulation ";
        cls += "h-7 w-7 sm:h-5 sm:w-5 ";

        let dotCls = "block rounded-full transition-all ";
        if (isCurrent) {
          dotCls += "h-4 w-4 sm:h-3.5 sm:w-3.5 ring-2 ring-ink ring-offset-2 ring-offset-paper ";
        } else {
          dotCls += "h-3 w-3 sm:h-2.5 sm:w-2.5 opacity-80 ";
        }

        if (state.checked[item.id]) {
          dotCls += isCorrect(item) ? "bg-pine" : "bg-rose";
        } else if (isAnswered(item)) {
          dotCls += "bg-gold";
        } else {
          dotCls += "bg-line";
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
          '"><span class="' +
          dotCls +
          '"></span></button>'
        );
      })
      .join("");

    let body = "";
    if (q.type === "mcq") {
      body = q.options
        .map(function (option, index) {
          return (
            '<button type="button" class="' +
            optionClass(q, index, revealed) +
            '" data-action="pick" data-index="' +
            index +
            '"' +
            (revealed ? " disabled" : "") +
            '><span class="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-[10px] bg-paper font-bold text-xs sm:text-sm">' +
            letters[index] +
            '</span><span class="leading-snug break-words">' +
            esc(option) +
            "</span></button>"
          );
        })
        .join("");
      body = '<div class="grid gap-2.5">' + body + "</div>";
    } else if (q.type === "tf") {
      const answer = state.answers[q.id] || [null, null, null, null];
      body = q.items
        .map(function (item, index) {
          const value = answer[index];
          let row = "grid gap-2.5 rounded-[14px] border p-3 sm:p-3.5 ";
          let note = "";
          if (revealed) {
            row += value === item.correct ? "border-pine bg-pine-soft" : "border-rose bg-rose-soft";
            note = '<p class="m-0 text-xs sm:text-sm text-muted leading-relaxed">' + esc(item.explain) + "</p>";
          } else {
            row += "border-line bg-card";
          }
          return (
            '<div class="' +
            row +
            '"><p class="m-0 text-sm sm:text-base leading-relaxed"><b>' +
            marks[index] +
            ")</b> " +
            esc(item.text) +
            '</p><div class="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto"><button type="button" class="' +
            chip +
            ' min-h-[42px] sm:min-h-0 flex items-center justify-center font-medium" data-action="tf" data-index="' +
            index +
            '" data-value="true"' +
            (value === true ? ' aria-pressed="true"' : "") +
            (revealed ? " disabled" : "") +
            '>Đúng</button><button type="button" class="' +
            chip +
            ' min-h-[42px] sm:min-h-0 flex items-center justify-center font-medium" data-action="tf" data-index="' +
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
          ? '<p class="mt-4 rounded-[14px] bg-pine-soft px-4 py-3.5 text-sm sm:text-base font-medium text-pine-dark">✓ Đúng. Đáp án: ' + esc(q.sample) + ".</p>"
          : '<p class="mt-4 rounded-[14px] border border-rose bg-rose-soft px-4 py-3.5 text-sm sm:text-base text-rose font-medium">✕ Chưa đúng. Đáp án: ' +
            esc(q.sample) +
            ".</p>";
      }
      body =
        '<label class="grid gap-2 font-semibold text-sm sm:text-base"><span>Nhập số đáp án</span><input class="w-full sm:w-[280px] rounded-xl border border-line bg-paper sm:bg-card px-4 py-3 text-base sm:text-lg focus:outline-pine focus:border-pine touch-manipulation" ' +
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

    const explain =
      revealed && q.explain
        ? '<div class="explain mt-4 rounded-[14px] bg-gold-soft px-3.5 sm:px-4 py-3 sm:py-3.5 whitespace-pre-line text-sm sm:text-base"><p class="' +
          eyebrow +
          '">Giải thích</p><p class="m-0 mt-1 whitespace-pre-line leading-relaxed">' +
          esc(q.explain) +
          "</p></div>"
        : "";

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
        ? '<button type="button" class="' + textBtn + ' font-medium text-pine hover:text-pine-dark" data-action="ask-finish">Nộp bài</button>'
        : '<span class="w-12"></span>';
    const left = state.deadline ? state.deadline - Date.now() : 0;
    const clockHtml = state.deadline
      ? '<p class="m-0 mt-0.5 text-xs sm:text-sm font-bold tracking-wide tabular-nums ' +
        (left <= 60000 ? "text-rose" : "text-ink") +
        '" data-clock>' +
        formatClock(left) +
        "</p>"
      : "";

    return (
      '<div><div class="mb-3.5 flex items-center justify-between gap-2 sm:gap-3"><button type="button" class="' +
      textBtn +
      ' font-medium" data-action="home">← Dừng</button><div class="text-center"><p class="' +
      eyebrow +
      ' text-[11px] sm:text-[13px]">' +
      esc(state.mode === "exam" ? "Kiểm tra" : "Luyện tập") +
      '</p><strong class="text-sm sm:text-base">' +
      (state.index + 1) +
      " / " +
      state.questions.length +
      "</strong>" +
      clockHtml +
      "</div>" +
      submit +
      '</div><div class="mb-3.5 h-1.5 overflow-hidden rounded-full bg-line/80"><span class="block h-full bg-pine transition-all duration-300" style="width:' +
      ((state.index + 1) / state.questions.length) * 100 +
      '%"></span></div><article class="' +
      sheet +
      '"><p class="text-xs sm:text-sm text-muted font-medium">' +
      esc(where) +
      " · " +
      esc(PARTS[q.part]) +
      "</p>" +
      (q.context ? '<p class="text-sm sm:text-base text-muted">' + esc(q.context) + "</p>" : "") +
      figureHtml(q.images) +
      tableHtml(q.table) +
      '<h1 class="m-0 mt-2 mb-3.5 sm:mb-[18px] font-serif text-[clamp(20px,4.5vw,28px)] leading-[1.25] font-[650] tracking-[-0.02em] whitespace-pre-line">' +
      esc(q.prompt || q.lead || "") +
      "</h1>" +
      (q.prompt && q.lead ? '<p class="text-sm sm:text-base text-muted">' + esc(q.lead) + "</p>" : "") +
      body +
      explain +
      "</article>" +
      (state.hint ? '<p class="mx-1 my-2.5 text-sm font-semibold text-rose">' + esc(state.hint) + "</p>" : "") +
      '<div class="mt-4"><div class="dots flex items-center gap-1.5 sm:gap-2 overflow-x-auto px-1 pt-2 pb-2.5">' +
      dots +
      '</div><p class="mt-1 text-[12px] sm:text-[13px] text-muted text-center sm:text-left"><span class="sm:hidden">💡 Vuốt sang trái/phải hoặc chạm chấm để đổi câu</span><span class="hidden sm:inline">Phím A–D để chọn, Enter để tiếp tục.</span></p></div>' +
      '<div class="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-card/95 backdrop-blur-md px-3.5 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:static sm:mt-4 sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:shadow-none safe-bottom">' +
      '<div class="mx-auto flex max-w-[920px] items-center justify-between gap-3">' +
      '<button type="button" class="' +
      ghost +
      ' px-4 py-2.5 sm:px-5 sm:py-3 shrink-0" data-action="prev"' +
      (state.index === 0 ? " disabled" : "") +
      '>← Trước</button><button type="button" class="' +
      primary +
      ' flex-1 sm:flex-initial px-5 py-2.5 sm:px-8 sm:py-3 text-center justify-center text-sm sm:text-base font-semibold" data-action="' +
      primaryAction +
      '">' +
      primaryLabel +
      '</button></div></div></div>'
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

    const scoreTone = tone === "ok" ? "text-pine" : tone === "mid" ? "text-gold" : "text-rose";
    return (
      '<div class="mb-3.5 flex items-center justify-between gap-3"><button type="button" class="' +
      textBtn +
      ' font-medium" data-action="home">← Danh sách bài</button></div><article class="' +
      sheet +
      '"><p class="' +
      eyebrow +
      '">Kết quả ôn tập</p><div class="flex items-baseline gap-3"><p class="m-0 font-serif text-[56px] sm:text-[72px] leading-none font-[650] ' +
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
      ' w-full sm:w-auto py-3 text-center justify-center text-sm sm:text-base" data-action="retry">Làm lại bài này</button><button type="button" class="' +
      ghost +
      ' w-full sm:w-auto py-3 text-center justify-center text-sm sm:text-base"' +
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
      '<div class="fixed inset-0 z-30 grid place-items-end sm:place-items-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs"><div class="w-full max-w-md rounded-2xl sm:rounded-[22px] border border-line bg-card p-5 shadow-[0_16px_40px_rgba(36,32,22,0.2)] safe-bottom" role="dialog" aria-modal="true"><h2 class="m-0 font-serif text-[22px] sm:text-[28px] leading-tight font-bold">Còn ' +
      left +
      ' câu chưa hoàn thành</h2><p class="mt-2 text-xs sm:text-sm text-muted">Những câu bỏ trống sẽ được tính là chưa đúng.</p><div class="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-2.5"><button type="button" class="' +
      primary +
      ' order-1 sm:order-3 py-3 text-center justify-center text-sm sm:text-base font-semibold" data-action="finish">Nộp bài ngay</button><button type="button" class="' +
      ghost +
      ' order-2 sm:order-2 py-3 text-center justify-center text-sm sm:text-base" data-action="jump-blank">Làm tiếp câu trống</button><button type="button" class="' +
      ghost +
      ' order-3 sm:order-1 py-3 text-center justify-center text-sm sm:text-base border-transparent sm:border-line" data-action="close-modal">Ở lại</button></div></div></div>'
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
        scroller.scrollLeft = Math.max(
          0,
          current.offsetLeft - scroller.clientWidth / 2 + current.offsetWidth / 2
        );
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
    const summary = summaryOf(state.questions);
    state.filter = summary.wrong.length ? "wrong" : "all";
    if (state.keepScore !== false) saveScore(summary);
    render();
  }

  function onClick(event) {
    const node = event.target.closest("[data-action]");
    if (!node) return;
    const action = node.dataset.action;
    const q = state.questions[state.index];

    if (action === "home") {
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
      render();
      const box = document.querySelector(".explain, .banner");
      if (box) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else if (action === "next") {
      if (state.index < state.questions.length - 1) {
        state.index += 1;
        state.hint = "";
        render();
      }
    } else if (action === "prev") {
      if (state.index > 0) {
        state.index -= 1;
        state.hint = "";
        render();
      }
    } else if (action === "jump") {
      state.index = Number(node.dataset.index);
      state.hint = "";
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
