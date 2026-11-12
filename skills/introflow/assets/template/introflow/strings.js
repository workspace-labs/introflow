/* introflow: every word the page prints itself, in English and Arabic.
   Dates use fixed month names, never the computer's language, so the same file prints the same page anywhere. */
(function (root) {
  "use strict";

  var WORDS = {
    en: {
      lang: "en", dir: "ltr",
      intro: "Project introduction",
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
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September",
        "October", "November", "December"]
    },
    ar: {
      lang: "ar", dir: "rtl",
      intro: "تعريف بالمشروع",
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
