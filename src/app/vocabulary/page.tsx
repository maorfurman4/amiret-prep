const CATEGORIES = [
  {
    id: 'academic',
    titleHe: 'אקדמי',
    titleEn: 'Academic',
    icon: '🎓',
    words: [
      { word: 'hypothesis', meaning: 'השערה', example: 'The scientist tested her hypothesis about climate change.' },
      { word: 'methodology', meaning: 'מתודולוגיה, שיטת מחקר', example: 'The study used a qualitative methodology.' },
      { word: 'empirical', meaning: 'אמפירי, מבוסס ניסיון', example: 'Empirical evidence supports the theory.' },
      { word: 'synthesis', meaning: 'סינתזה, שילוב', example: 'The paper offered a synthesis of existing research.' },
      { word: 'critique', meaning: 'ביקורת, ניתוח ביקורתי', example: 'The professor gave a detailed critique of the essay.' },
      { word: 'paradigm', meaning: 'פרדיגמה, תפיסת עולם', example: 'The discovery shifted the scientific paradigm.' },
      { word: 'premise', meaning: 'הנחת יסוד', example: 'The argument rests on a false premise.' },
      { word: 'consensus', meaning: 'קונצנזוס, הסכמה', example: 'There is scientific consensus on global warming.' },
      { word: 'inference', meaning: 'הסקה, מסקנה', example: 'We can draw an inference from the available data.' },
      { word: 'abstract', meaning: 'תקציר; מופשט', example: 'Read the abstract before the full paper.' },
    ],
  },
  {
    id: 'science',
    titleHe: 'מדע וטבע',
    titleEn: 'Science & Nature',
    icon: '🔬',
    words: [
      { word: 'ecosystem', meaning: 'מערכת אקולוגית', example: 'The coral reef is a complex ecosystem.' },
      { word: 'fossil', meaning: 'מאובן', example: 'Fossils provide clues about prehistoric life.' },
      { word: 'organism', meaning: 'אורגניזם, יצור חי', example: 'Single-celled organisms are the simplest life forms.' },
      { word: 'particle', meaning: 'חלקיק', example: 'Physicists study subatomic particles.' },
      { word: 'radiation', meaning: 'קרינה', example: 'Solar radiation affects the Earth\'s climate.' },
      { word: 'predator', meaning: 'טורף', example: 'Lions are apex predators on the savanna.' },
      { word: 'erosion', meaning: 'סחיפה, שחיקה', example: 'Water erosion carved the canyon over millions of years.' },
      { word: 'habitat', meaning: 'בית גידול, סביבת מחייה', example: 'Deforestation destroys the habitat of many species.' },
      { word: 'evolution', meaning: 'אבולוציה, התפתחות', example: 'Darwin\'s theory of evolution changed biology forever.' },
      { word: 'photosynthesis', meaning: 'פוטוסינתזה', example: 'Plants use photosynthesis to convert sunlight into energy.' },
    ],
  },
  {
    id: 'society',
    titleHe: 'חברה ופוליטיקה',
    titleEn: 'Society & Politics',
    icon: '🏛️',
    words: [
      { word: 'legislation', meaning: 'חקיקה, חוק', example: 'New legislation was passed to protect the environment.' },
      { word: 'democracy', meaning: 'דמוקרטיה', example: 'Democracy relies on free and fair elections.' },
      { word: 'reform', meaning: 'רפורמה, תיקון', example: 'The government proposed major economic reforms.' },
      { word: 'constitution', meaning: 'חוקה', example: 'The constitution guarantees freedom of speech.' },
      { word: 'sovereignty', meaning: 'ריבונות', example: 'Each nation has the right to sovereignty.' },
      { word: 'oppression', meaning: 'דיכוי', example: 'The movement fought against political oppression.' },
      { word: 'ideology', meaning: 'אידיאולוגיה', example: 'Political parties often differ in ideology.' },
      { word: 'segregation', meaning: 'הפרדה', example: 'Racial segregation was abolished in the 1960s.' },
      { word: 'referendum', meaning: 'משאל עם', example: 'Citizens voted in a referendum on independence.' },
      { word: 'bureaucracy', meaning: 'בירוקרטיה', example: 'The application was delayed due to bureaucracy.' },
    ],
  },
  {
    id: 'arts',
    titleHe: 'אמנות ותרבות',
    titleEn: 'Arts & Culture',
    icon: '🎨',
    words: [
      { word: 'aesthetic', meaning: 'אסתטי, קשור ליופי', example: 'The museum has a minimalist aesthetic.' },
      { word: 'genre', meaning: 'ז\'אנר, סוג', example: 'Mystery is her favorite literary genre.' },
      { word: 'portrayal', meaning: 'תיאור, הצגה', example: 'The film\'s portrayal of war was very realistic.' },
      { word: 'narrative', meaning: 'נרטיב, סיפור', example: 'The narrative of the novel spans three generations.' },
      { word: 'compose', meaning: 'להלחין; לחבר', example: 'Beethoven composed his ninth symphony while deaf.' },
      { word: 'satire', meaning: 'סאטירה', example: 'The play was a sharp satire of political corruption.' },
      { word: 'metaphor', meaning: 'מטפורה', example: 'He used the storm as a metaphor for conflict.' },
      { word: 'mural', meaning: 'ציור קיר', example: 'A colorful mural decorated the school wall.' },
      { word: 'sculpture', meaning: 'פסל, פיסול', example: 'The sculpture was carved from a single block of marble.' },
      { word: 'allegory', meaning: 'אלגוריה, משל', example: 'Animal Farm is an allegory about totalitarianism.' },
    ],
  },
  {
    id: 'economy',
    titleHe: 'כלכלה ועסקים',
    titleEn: 'Economy & Business',
    icon: '💼',
    words: [
      { word: 'commodity', meaning: 'סחורה, מצרך', example: 'Oil is a valuable commodity in world markets.' },
      { word: 'surplus', meaning: 'עודף', example: 'The country had a trade surplus last year.' },
      { word: 'inflation', meaning: 'אינפלציה', example: 'High inflation erodes purchasing power.' },
      { word: 'fiscal', meaning: 'פיסקלי, תקציבי', example: 'The government announced a new fiscal policy.' },
      { word: 'entrepreneur', meaning: 'יזם', example: 'She became a successful entrepreneur at age 25.' },
      { word: 'recession', meaning: 'מיתון', example: 'The economy entered a recession after the crisis.' },
      { word: 'subsidy', meaning: 'סובסידיה, תמיכה ממשלתית', example: 'Farmers receive government subsidies.' },
      { word: 'monopoly', meaning: 'מונופול', example: 'The company held a monopoly on the local market.' },
      { word: 'dividend', meaning: 'דיבידנד, רווח מניות', example: 'Shareholders received a quarterly dividend.' },
      { word: 'revenue', meaning: 'הכנסות', example: 'The company\'s revenue grew by 20% this year.' },
    ],
  },
  {
    id: 'health',
    titleHe: 'בריאות ורפואה',
    titleEn: 'Health & Medicine',
    icon: '🏥',
    words: [
      { word: 'chronic', meaning: 'כרוני, ממושך', example: 'She suffers from chronic back pain.' },
      { word: 'diagnosis', meaning: 'אבחנה', example: 'An early diagnosis improves treatment outcomes.' },
      { word: 'therapeutic', meaning: 'טיפולי, מרפא', example: 'Exercise has therapeutic effects on depression.' },
      { word: 'epidemic', meaning: 'מגיפה, התפרצות', example: 'The flu epidemic spread rapidly through the city.' },
      { word: 'immune', meaning: 'חסין, בעל חסינות', example: 'Vaccines help the body become immune to disease.' },
      { word: 'symptom', meaning: 'תסמין', example: 'Fever is a common symptom of infection.' },
      { word: 'prognosis', meaning: 'פרוגנוזה, תחזית רפואית', example: 'The doctor gave a positive prognosis.' },
      { word: 'contagious', meaning: 'מדבק', example: 'The virus is highly contagious.' },
      { word: 'deteriorate', meaning: 'להידרדר, להחמיר', example: 'The patient\'s condition began to deteriorate.' },
      { word: 'rehabilitation', meaning: 'שיקום', example: 'Physical rehabilitation helped him walk again.' },
    ],
  },
];

export default function VocabularyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-5 sticky top-0 z-10">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          📖 אוצר מילים
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          מילים חשובות לאמירנט — מאורגנות לפי נושא
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {CATEGORIES.map(cat => (
          <section key={cat.id}>
            {/* Category header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {cat.titleHe}
                </h2>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">
                  {cat.titleEn}
                </span>
              </div>
            </div>

            {/* Word cards */}
            <div className="space-y-2">
              {cat.words.map(({ word, meaning, example }) => (
                <div
                  key={word}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <span className="font-bold text-blue-700 dark:text-blue-400 text-base">
                      {word}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 text-sm font-medium text-left shrink-0">
                      {meaning}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed italic">
                    {example}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
