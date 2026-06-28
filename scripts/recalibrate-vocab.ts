/**
 * Recalibrate vocabulary difficulty levels using AI.
 * Maps each word to 1-5 stars based on frequency + AMIRAM exam calibration.
 *
 * Calibration guide:
 *   ★     = top 2000 COCA words — basic daily use (change, help, important)
 *   ★★    = AWL sublist 1-3 — common academic (analyze, demonstrate, hypothesis)
 *   ★★★   = AWL sublist 4-7, AMIRAM mid — intermediate academic (consensus, paradigm, alleviate)
 *   ★★★★  = AWL sublist 8-10, AMIRAM hard — advanced (laconic, pervasive, elucidate)
 *   ★★★★★ = GRE-level, rare — very advanced (obfuscate, sycophant, insouciant)
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx ts-node -r dotenv/config scripts/recalibrate-vocab.ts
 *
 * Output: SQL UPDATE statements (review before applying).
 * Redirect:  ... > vocab-fixes.sql
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface VocabWord {
  id: string;
  word: string;
  definition: string;
  hebrew_translation: string;
  example_sentence: string;
  category: string;
  difficulty_level: number;
}

interface CalibrationResult {
  id: string;
  word: string;
  old_level: number;
  new_level: number;
  reason: string;
}

const SYSTEM_PROMPT = `You are calibrating difficulty levels for an Israeli AMIRAM English exam prep app.

Rate each English word 1-5 based on these criteria:

★ (1) = Top 2000 most common English words. Known by beginners. Examples: big, help, change, start, learn, basic connectors like "however", "although"
★★ (2) = Common academic/formal words (AWL sublists 1-3). High school / first-year university students know these. Examples: analyze, demonstrate, hypothesis, strategy, potential, evidence, indicate, significant, theory
★★★ (3) = Intermediate academic (AWL 4-7, AMIRAM mid-level). Requires solid academic English. Examples: consensus, paradigm, alleviate, coherent, autonomous, discrepancy, criterion, methodology, empirical, adversary
★★★★ (4) = Advanced academic (AWL 8-10, AMIRAM hard). Graduate-level or GRE prep. Examples: laconic, pervasive, elucidate, recalcitrant, acumen, cogent, aver, tenuous, insipid, efficacious
★★★★★ (5) = Rare/literary/GRE-level. Not expected in everyday academic contexts. Examples: obfuscate, sycophant, insouciant, vitriolic, pusillanimous, loquacious, sanguine, pellucid, truculent

IMPORTANT calibration notes:
- "hypothesis", "dilemma", "candid", "wary", "irony", "timid" should be ★★ (2) — common academic
- "paradigm", "consensus", "resilient", "alleviate" should be ★★★ (3) — intermediate
- "laconic", "pervasive", "elucidate", "pedagogy" should be ★★★★ (4) — advanced
- "obfuscate", "sycophant", "insouciant" should be ★★★★★ (5) — rare

Return JSON array with one object per word:
[{"id": "...", "new_level": 1-5, "reason": "brief reason (max 10 words)"}]`;

async function calibrateBatch(words: VocabWord[]): Promise<CalibrationResult[]> {
  const wordList = words.map(w =>
    `ID:${w.id} | "${w.word}" (${w.category}) | Definition: ${w.definition}`
  ).join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Rate these ${words.length} words:\n\n${wordList}` },
    ],
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content ?? '{"results":[]}';
  let parsed: { results?: { id: string; new_level: number; reason: string }[] } | { id: string; new_level: number; reason: string }[];

  try {
    parsed = JSON.parse(content) as typeof parsed;
  } catch {
    return [];
  }

  const items = Array.isArray(parsed) ? parsed : (parsed as { results?: { id: string; new_level: number; reason: string }[] }).results ?? [];

  return items.map(item => {
    const w = words.find(w => w.id === item.id);
    if (!w) return null;
    return {
      id: w.id,
      word: w.word,
      old_level: w.difficulty_level,
      new_level: Math.max(1, Math.min(5, item.new_level)) as 1 | 2 | 3 | 4 | 5,
      reason: item.reason ?? '',
    };
  }).filter((x): x is CalibrationResult => x !== null);
}

async function main() {
  console.error('Fetching all vocabulary words...');
  const allWords: VocabWord[] = [];
  let from = 0;
  const PAGE = 1000;

  while (true) {
    const { data } = await supabase
      .from('vocabulary')
      .select('id, word, definition, hebrew_translation, example_sentence, category, difficulty_level')
      .order('word')
      .range(from, from + PAGE - 1);
    const rows = (data ?? []) as VocabWord[];
    allWords.push(...rows);
    if (rows.length < PAGE) break;
    from += PAGE;
  }

  console.error(`Found ${allWords.length} vocabulary words. Starting calibration...`);

  const BATCH = 30; // words per API call
  const changed: CalibrationResult[] = [];
  let processed = 0;

  for (let i = 0; i < allWords.length; i += BATCH) {
    const batch = allWords.slice(i, i + BATCH);
    const results = await calibrateBatch(batch);

    for (const r of results) {
      if (r.new_level !== r.old_level) {
        changed.push(r);
      }
    }

    processed += batch.length;
    if (processed % 150 === 0) {
      console.error(`Progress: ${processed}/${allWords.length}...`);
    }

    await new Promise(r => setTimeout(r, 400)); // rate limit
  }

  console.error(`\nWords changing level: ${changed.length} out of ${allWords.length}\n`);

  // Distribution summary
  const newDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const w of allWords) {
    const result = changed.find(c => c.id === w.id);
    const lvl = result ? result.new_level : w.difficulty_level;
    newDist[lvl] = (newDist[lvl] ?? 0) + 1;
  }
  console.error('New distribution:', newDist);

  // Output SQL
  if (changed.length === 0) {
    console.log('-- No level changes needed!');
    return;
  }

  console.log('-- Auto-generated by recalibrate-vocab.ts');
  console.log('-- Review before applying!\n');
  console.log(`-- Total changes: ${changed.length}`);
  console.log(`-- New distribution: ★=${newDist[1]} ★★=${newDist[2]} ★★★=${newDist[3]} ★★★★=${newDist[4]} ★★★★★=${newDist[5]}\n`);

  // Group by level change for readability
  for (let from_l = 1; from_l <= 5; from_l++) {
    for (let to_l = 1; to_l <= 5; to_l++) {
      if (from_l === to_l) continue;
      const group = changed.filter(c => c.old_level === from_l && c.new_level === to_l);
      if (!group.length) continue;

      console.log(`-- Level ${from_l} → ${to_l} (${group.length} words):`);
      const ids = group.map(c => `'${c.id}'`).join(', ');
      console.log(`UPDATE vocabulary SET difficulty_level = ${to_l} WHERE id IN (${ids});`);
      console.log(`-- Words: ${group.map(c => c.word).join(', ')}\n`);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
