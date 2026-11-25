// Ad copy per campaign domain (Hebrew). Shared by make-ad-images.mjs (banners) and make-ad-files.mjs (Meta copy).
// Rules (from the AI-clarity review, 2026-11-18, marketing/ads/review-ai-clarity-2026-11-18.md):
// - The banner tag carries the category: "AI {who}". Hooks stay pain-first and don't say "AI".
// - Every subline names who does the work: "AI ש…" or "אנחנו בונים…", never a bare "המערכת".
// - Hooks readable in about two seconds (≈8 words). No avatar, no invented results; the only numbers are the reader's own.
// - Don't put "טרנספורמציית AI" on ads; "בתוך המערכות / התוכנה / ה-ERP שכבר יש לכם" is the credible phrasing.
// `title` is the Meta headline under the image (≤40 chars); `body` is optional Meta primary text when it differs from hook + subline.
export const HOOKS = {
  accounting: {
    who: 'למשרדי רואי חשבון',
    headline: { body: 'עונת הדוחות שוב עוצרת את כל המשרד? אנחנו מאתרים איפה AI חוסך עבודה, בונים את זה בתוך התוכנה שכבר יש לכם ודואגים שהצוות באמת משתמש.', title: 'AI בתוך התוכנה שכבר יש לכם' },
    hooks: [
      { id: 'studied', h: 'למדתם ראיית חשבון. לא הקלדת קבלות.', s: 'AI שמוריד מהצוות את ההקלדה וההתאמות, בתוך התוכנה שכבר יש לכם.', title: 'AI בתוך התוכנה שכבר יש לכם' },
      { id: 'season', h: 'עונת הדוחות מתחילה. המסמכים עדיין לא.', s: 'AI שאוסף מהלקוחות את המסמכים ושולח תזכורות. אדם מטפל רק במה שחסר.', title: 'AI שאוסף את המסמכים במקומכם' },
      { id: 'reminder', h: 'תזכורת שלישית לאותו לקוח על אותה קבלה?', s: 'תנו ל-AI לרדוף. אנחנו בונים את זה בתוך התוכנה שכבר יש לכם.', title: 'AI שרודף אחרי המסמכים במקומכם',
        body: 'תזכורת שלישית לאותו לקוח על אותה קבלה? תנו ל-AI לרדוף, בתוך התוכנה שכבר יש לכם. הצוות חוזר לעבודה המקצועית.' },
      // Campaign review 2026-11-25: two hooks from the first two real leads. `keying` is the situation lead #2 picked on the page;
      // `onprem` answers lead #1's question. It promises a fit check, never a ready-made integration.
      { id: 'keying', h: 'העובדים מבלים את היום בהקלדה ובהתאמות?', s: 'AI מציע רישומים והתאמות בנק בתוך התוכנה שלכם. איש מקצוע מאשר כל חריג.', title: 'פחות הקלדה והתאמות, עם AI' },
      { id: 'onprem', h: 'חשבשבת מותקנת אצלכם במשרד, לא בענן?', s: 'אנחנו בונים AI לצד התוכנה שכבר יש לכם, ובודקים התאמה לגרסה שלכם.', title: 'בודקים התאמה גם לחשבשבת מקומית',
        body: 'חשבשבת מותקנת אצלכם במשרד, לא בענן? אנחנו בונים AI שעובד לצד התוכנה שכבר יש לכם, ואת ההתאמה לגרסה ולהתקנה שלכם בודקים בשיחה הראשונה.' },
    ],
  },
  distribution: {
    who: 'לחברות הפצה ויבוא',
    headline: { body: 'עדיין מקלידים הזמנות והצעות מחיר ידנית? אנחנו מאתרים איפה AI חוסך עבודה ובונים את זה בתוך ה-ERP שכבר יש לכם.', title: 'AI בתוך ה-ERP שכבר יש לכם' },
    hooks: [
      { id: 'twice', h: 'כל הזמנה מוקלדת פעמיים. פעם אחת מיותרת.', s: 'AI קורא הזמנות מהמייל ומכין אותן ב-ERP. אדם מאשר רק חריגים.', title: 'הזמנות מהמייל ישר ל-ERP, עם AI' },
      { id: 'growth', h: 'יותר לקוחות. לא יותר מקלידים.', s: 'AI שעושה את ההקלדה החוזרת, בתוך ה-ERP שכבר יש לכם.', title: 'AI בתוך ה-ERP שכבר יש לכם' },
      { id: 'quote', h: 'הלקוח ביקש הצעת מחיר. היא עדיין בדרך.', s: 'AI מכין טיוטת הצעה מהמחירון שלכם. איש מכירות מאשר ושולח.', title: 'הצעות מחיר מהמחירון, עם AI' },
    ],
  },
  // General service campaign (Google "AI for business"): lands on the home page, for owners and managers of any 10-200 person company.
  // The headline banner carries the home page's H1; the hooks are the home page's "situations", in the reader's words.
  business: {
    who: 'לעסקים',
    // The headline ad repeats the home page's H1 with "AI" added (h: the banner line; without it the banner uses the page's H1).
    headline: { h: 'העסק שלכם יכול לעבוד חכם יותר עם AI.', body: 'העסק שלכם יכול לעבוד חכם יותר עם AI: פחות עבודה ידנית, פחות עלויות ושירות טוב יותר. מאתרים איפה הולכים זמן וכסף, ובונים AI שעושה את העבודה החוזרת בתוך המערכות שכבר יש לכם.', title: 'העסק שלכם יכול לעבוד חכם יותר עם AI' },
    hooks: [
      { id: 'tools', h: 'קניתם כלי AI. שום דבר לא באמת השתנה.', s: 'אנחנו בונים AI בתוך העבודה עצמה, ומלווים את הצוות עד שמשתמשים בו.', title: 'AI שהצוות באמת משתמש בו' },
      { id: 'manual', h: 'כל לקוח חדש מוסיף עוד עבודה ידנית.', s: 'AI שעושה את החלק החוזר, בתוך המערכות שכבר יש לכם. אדם בודק חריגים.', title: 'AI בתוך המערכות שכבר יש לכם' },
      { id: 'vendor', h: 'כל ספק AI ימליץ על המוצר שלו. מי ימליץ לכם?', s: 'מבט עצמאי: מה שווה לבנות, מה לא עכשיו ומה בכלל לא.', title: 'מה שווה לבנות עם AI, ומה לא' },
      // Customer service (segment review 2026-11-22): an angle inside the general campaign, not a segment of its own. Lands on the
      // use case page's customer-service example, whose headline it repeats. Not on Google: "בוט"/"צ'אטבוט" searches are cheap-bot shoppers.
      { id: 'service', h: 'הנציגים מחפשים תשובות במקום לעזור ללקוחות?', s: 'AI מוצא את התשובה ומנסח מענה. הנציג בודק ושולח.', title: 'AI שמנסח תשובות ללקוחות', page: '/business-use-case', anchor: 'ex-2',
        body: 'הנציגים מחפשים תשובות במקום לעזור ללקוחות? AI מוצא את התשובה בהזמנות, במדיניות ובמסמכים שלכם ומנסח מענה, והנציג בודק ושולח.' },
    ],
  },
  insurance: {
    who: 'לסוכנויות ביטוח',
    hooks: [
      { id: 'sell', h: 'סוכן ביטוח צריך למכור. לא להעתיק פוליסות.', s: 'AI שמוריד מהצוות את הניירת, בלי לסכן מידע של לקוחות.', title: 'AI שמוריד מהצוות את הניירת' },
      { id: 'renewals', h: 'עונת חידושים. כל חברת ביטוח, פורמט אחר.', s: 'AI קורא את המסמכים של כל חברה. אדם מאשר רק את מה שלא מתאים.', title: 'AI שקורא את מסמכי החידוש' },
      { id: 'chatgpt', h: 'ChatGPT כבר במשרד. מישהו החליט מה מותר?', s: 'כללים ברורים, כלים מאושרים, ו-AI שמוטמע בעבודה באמת.', title: 'AI בסוכנות, עם כללים ברורים' },
    ],
  },
  law: {
    who: 'למשרדי עורכי דין',
    // Campaign test from 2026-11-22. Don't paraphrase the Bar's Sept 2026 AI opinion in ads until its primary text is checked.
    headline: { body: 'כל ספק מציע למשרד שלכם כלי AI. איזה מהם אמיתי? משווים את הכלים על המסמכים שלכם, בוחרים מה שווה את הסיכון ומכניסים אותו לעבודה, עם חיסיון וסודיות מובנים.', title: 'איזה כלי AI באמת שווה למשרד?' },
    hooks: [
      { id: 'search', h: 'שעה של שותף בכיר על חיפוש בתיק ישן?', s: 'AI שמחפש בתיקים ובחוות הדעת של המשרד, בתוך המערכת שלכם.', title: 'AI שמחפש בתיקים של המשרד' },
      { id: 'drafts', h: 'שותף בכיר מעצב טיוטה בעשר בלילה?', s: 'AI מכין טיוטה ראשונה מהתבניות של המשרד. עורך דין עובר על כל אחת.', title: 'טיוטה ראשונה מהתבניות, עם AI' },
      { id: 'privilege', h: 'ChatGPT כבר על תיקי לקוחות. ומה עם החיסיון?', s: 'מדיניות AI ברורה וכלים מאושרים ומאובטחים, לפני ולא אחרי.', title: 'AI במשרד, עם חיסיון מובנה' },
    ],
  },
  'real-estate': {
    who: 'ליזמים ולחברות בנייה',
    hooks: [
      // Mostly connecting existing data: the tag carries "AI", the subline doesn't overclaim it.
      { id: 'excel', h: '10 פרויקטים. 10 אקסלים. אין תמונת מצב אחת.', s: 'דוח אחד שמתעדכן מעצמו. אנחנו בונים, בלי להחליף מערכות.', title: 'דוח פרויקטים שמתעדכן מעצמו' },
      { id: 'report', h: 'דוח הפרויקטים החודשי לא צריך לקחת שבוע.', s: 'AI אוסף תקציב, לו״ז והתקדמות לדוח אחד. בלי להחליף מערכות.', title: 'AI שמרכיב את דוח הפרויקטים' },
      { id: 'bills', h: 'חשבון חלקי נכנס. המערכת בודקת, המהנדס מאשר.', s: 'AI משווה כל חשבון חלקי לחוזה, לפני שמשלמים.', title: 'AI שבודק חשבונות חלקיים' },
    ],
  },
};
export const CTA_END = 'שיחה של 30 דקות עם ערן נחום, בלי התחייבות.';
