/* introflow: every word the page prints itself, in English and Arabic.
   Dates use fixed month names, never the computer's language, so the same file prints the same page anywhere. */
(function (root) {
  "use strict";

  var WORDS = {
    en: {
      lang: "en", dir: "ltr",
      intro: "Project introduction",
      description: "Project description",
      inside: "Inside",
      introduction: "Introduction",
      conclusion: "Conclusion",
      insideSub: "{p} pages, for {n} windows.",
      insideOne: "{p} pages, for one window.",
      theProject: "The project",
      partOf: "Part {n} of {m}",
      windowOf: "Window {n} of {m}",
      sees: "What you see",
      does: "What you do",
      closer: "A closer look",
      inThisWindow: "In this window",
      features: "Features",
      continued: "{t}, continued",
      preparedFor: "Prepared for {t}",
      preparedBy: "by {t}",
      draft: "Draft for review",
      approvedOn: "Approved · {date}",
      who: "Who it is for, and why",
      what: "What it does",
      different: "What makes it different",
      toConfirm: "To confirm",
      pageOf: "Page {n} of {m}",
      shotMissing: "Screenshot missing",
      madeWith: "Made with introflow · by WorkSpace Labs",
      printHint: "To save as PDF: Print → Save as PDF · Paper A4 · Landscape · Margins None · Background graphics on.",
      paperApp: "App colour", paperWhite: "White paper",
      cantDraw: "introflow can't draw this introduction yet",
      fixThese: "Fix these in intro.md, copy it into this page again, and reload.",
      line: "Line {n}: ",
      notDrawn: "The page could not be drawn: ",
      fitCover: "The cover is too full: the name, the about line and the facts do not all fit. Shorten the about line.",
      fitPage: "The page \"{t}\" is too full. Shorten its longest lines.",
      cover: "The cover",
      fitBlock: "\"{t}\": one paragraph or card is too long to fit a page, even alone. Shorten it, or split it in two.",
      fitName: "The name \"{t}\" is too wide for the cover: even at its smallest size (30 px) it would reach the screens. Use a shorter name, or write it in small letters after the first (\"Walkway\", not \"WALKWAY\").",
      fitWide: "{t}: some words are wider than their place, run off the page or meet the screens. Shorten them, or put a space inside a very long word.",
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September",
        "October", "November", "December"]
    },
    ar: {
      lang: "ar", dir: "rtl",
      intro: "تعريف بالمشروع",
      description: "وصف المشروع",
      inside: "المحتويات",
      introduction: "مقدمة",
      conclusion: "الخاتمة",
      insideSub: "{p} صفحة، لـ {n} نافذة.",
      insideOne: "{p} صفحات، لنافذة واحدة.",
      theProject: "المشروع",
      partOf: "الجزء {n} من {m}",
      windowOf: "النافذة {n} من {m}",
      sees: "ما تراه",
      does: "ما تفعله",
      closer: "نظرة أقرب",
      inThisWindow: "في هذه النافذة",
      features: "الميزات",
      continued: "{t} (تابع)",
      preparedFor: "أُعدّ لـ {t}",
      preparedBy: "إعداد {t}",
      draft: "مسودة للمراجعة",
      approvedOn: "معتمد · {date}",
      who: "لمن هو، ولماذا",
      what: "ماذا يفعل",
      different: "ما الذي يميّزه",
      toConfirm: "بانتظار التأكيد",
      pageOf: "صفحة {n} من {m}",
      shotMissing: "لقطة الشاشة غير متوفرة",
      madeWith: "صُنع باستخدام introflow · من WorkSpace Labs",
      printHint: "للحفظ بصيغة PDF: طباعة ← حفظ بصيغة PDF · الورق A4 · أفقي · الهوامش بلا · رسومات الخلفية مفعّلة.",
      paperApp: "لون التطبيق", paperWhite: "ورق أبيض",
      cantDraw: "لا يستطيع introflow رسم هذا التعريف بعد",
      fixThese: "صحّح ما يلي في intro.md، ثم انسخه إلى هذه الصفحة مرة أخرى وأعد تحميلها.",
      line: "السطر {n}: ",
      notDrawn: "تعذّر رسم الصفحة: ",
      fitCover: "الغلاف ممتلئ: الاسم وسطر الوصف والحقائق لا تتسع معًا. اختصر سطر الوصف.",
      fitPage: "الصفحة «{t}» ممتلئة. اختصر أطول سطورها.",
      cover: "الغلاف",
      fitBlock: "«{t}»: فقرة أو بطاقة واحدة أطول من أن تتسع في صفحة ولو وحدها. اختصرها أو اقسمها إلى اثنتين.",
      fitName: "الاسم «{t}» أعرض من مكانه في الغلاف: حتى بأصغر حجم له (30 بكسل) يصل إلى الشاشات. استخدم اسمًا أقصر، أو اكتب الاسم اللاتيني بأحرف صغيرة بعد الحرف الأول.",
      fitWide: "{t}: بعض الكلمات أعرض من مكانها، أو تخرج من الصفحة، أو تلامس الشاشات. اختصرها، أو ضع مسافة داخل الكلمة الطويلة جدًا.",
      months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر",
        "أكتوبر", "نوفمبر", "ديسمبر"]
    }
  };

  function words(language) { return WORDS[language] || WORDS.en; }

  function fill(template, values) {
    return template.replace(/\{(\w+)\}/g, function (_, key) { return values[key] === undefined ? "" : values[key]; });
  }

  // "2026-11-12" → "12 November 2026" (or "12 نوفمبر 2026"). Built by hand, never from the computer's locale.
  function day(iso, language) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) return "";
    return Number(m[3]) + " " + words(language).months[Number(m[2]) - 1] + " " + m[1];
  }

  var api = { WORDS: WORDS, words: words, fill: fill, day: day };
  root.Introflow = root.Introflow || {};
  root.Introflow.strings = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
