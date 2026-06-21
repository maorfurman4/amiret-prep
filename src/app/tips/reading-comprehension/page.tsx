'use client';

import Link from 'next/link';
import { BackNav } from '@/components/BackNav';

export default function ReadingComprehensionTipsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <BackNav backHref="/tips" backLabel="אסטרטגיות" />
      <div className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-8">

          {/* Header */}
          <div className="text-center">
            <div className="text-4xl mb-3">📖</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">הבנת הנקרא</h1>
            <p className="text-slate-500 text-sm">Reading Comprehension | קריאה אסטרטגית ויעילה</p>
          </div>

          {/* Reading approach */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">סדר הקריאה המומלץ</h2>
            <ol className="space-y-3">
              {[
                {
                  n: '1',
                  title: 'סרוק את הכותרת',
                  body: '5 שניות בלבד. הכותרת נותנת לך את הנושא הכללי ומכינה את המוח לקליטת המידע.',
                },
                {
                  n: '2',
                  title: 'קרא את הפסקה האחרונה',
                  body: 'הפסקה האחרונה לרוב מכילה את המסקנה או את הרעיון המרכזי. קרא אותה לפני שמתחיל.',
                },
                {
                  n: '3',
                  title: 'קרא את השאלות תחילה',
                  body: 'לפני שקוראים את הקטע! כך תדע מה לחפש — חסוך זמן יקר ע"י ידיעה מראש מה רלוונטי.',
                },
                {
                  n: '4',
                  title: 'קרא את הקטע עם מטרה',
                  body: 'כעת קרא את הקטע כאשר השאלות "פתוחות" בראשך. סמן (בראשך) היכן יש תשובות לשאלות שראית.',
                },
              ].map(item => (
                <li key={item.n} className="border-l-4 border-emerald-500 bg-emerald-50/50 p-4 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {item.n}
                    </span>
                    <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed pr-8">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* 3 question types */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">3 סוגי שאלות וכיצד לגשת לכל אחת</h2>
            <div className="space-y-4">
              {[
                {
                  type: 'רעיון מרכזי (Main Idea)',
                  color: 'border-emerald-500 bg-emerald-50/50',
                  how: 'חפש מה עובר כחוט שני לאורך כל הקטע. התשובה תהיה רחבה מספיק לכסות את כל הקטע — לא רק פרט אחד.',
                  signal: 'מילות מפתח בשאלה: "mainly about", "primary purpose", "best title"',
                },
                {
                  type: 'פרט ספציפי (Specific Detail)',
                  color: 'border-blue-500 bg-blue-50/50',
                  how: 'אל תסמוך על הזיכרון — חזור לקטע וחפש את המידע הספציפי. בדרך כלל המידע מופיע מפורשות בטקסט.',
                  signal: 'מילות מפתח: "according to the passage", "the author states", "which of the following"',
                },
                {
                  type: 'מילה בהקשר (Vocabulary in Context)',
                  color: 'border-purple-500 bg-purple-50/50',
                  how: 'אל תסמוך על הגדרה שאתה מכיר! קרא את המשפט ובדוק איזה מילה מתאימה להקשר הספציפי. לפעמים המשמעות שונה מהרגיל.',
                  signal: 'מילות מפתח: "the word X most likely means", "as used in paragraph Y"',
                },
              ].map((item, i) => (
                <div key={i} className={`border-l-4 p-4 rounded-r-xl ${item.color}`}>
                  <div className="font-bold text-slate-800 text-sm mb-2">{item.type}</div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-2">{item.how}</p>
                  <p className="text-slate-400 text-xs italic">{item.signal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Elimination method */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">שיטת האלימינציה</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              לא בטוח? סלק תשובות שגויות ובחר מתוך מה שנותר. 4 דגלים אדומים לתשובות שגויות:
            </p>
            <div className="space-y-2">
              {[
                { flag: 'קיצוני מדי', desc: '"always" / "never" / "all" / "completely" — הטקסט כמעט אף פעם לא טוען טענות כל-כך מוחלטות.' },
                { flag: 'לא הוזכר', desc: 'נשמע הגיוני אבל פשוט לא מופיע בקטע. זיכרון שלך ≠ מה שכתוב.' },
                { flag: 'הפוך', desc: 'ההפך המדויק ממה שאמר הכותב — מלכודת קלאסית.' },
                { flag: 'מסיט', desc: 'קשור לנושא אבל לא ממש עונה על השאלה שנשאלה.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-red-400 font-bold text-xs mt-0.5 flex-shrink-0">✕</span>
                  <div>
                    <span className="font-semibold text-slate-700 text-sm">{item.flag}: </span>
                    <span className="text-slate-500 text-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time management */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-3">ניהול זמן</h2>
            <div className="border-l-4 border-emerald-500 bg-emerald-50/50 p-4 rounded-r-xl mb-3">
              <p className="font-bold text-slate-800 text-sm mb-1">~3 דקות לפסקה (כולל שאלות)</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                חלק את הזמן: ~1.5 דקות לקריאת הקטע, ~1.5 דקות לענות על השאלות.
                אם שאלה אחת גוזלת יותר מדקה — סמן ועבור הלאה. חזור אליה בסוף.
              </p>
            </div>
            <div className="border-l-4 border-orange-400 bg-orange-50/50 p-4 rounded-r-xl">
              <p className="font-bold text-slate-800 text-sm mb-1">אל תתקע על קטע קשה</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                בחינה אדפטיבית — שאלה לא מענה לא פוגעת פחות משאלה עם תשובה שגויה. עדיף לנחש ולעבור הלאה.
              </p>
            </div>
          </div>

          {/* Back link */}
          <div className="text-center pb-4">
            <Link href="/tips" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              ← חזרה לכל האסטרטגיות
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
