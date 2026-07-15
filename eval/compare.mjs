import fs from 'node:fs/promises';

const review = JSON.parse(await fs.readFile(new URL('./human-review.json', import.meta.url), 'utf8'));
const results = JSON.parse(await fs.readFile(new URL('./latest-results.json', import.meta.url), 'utf8'));
const human = new Map(review.cases.map((item) => [item.id, item]));
const rows = results.rows.map((row) => {
  const item = human.get(row.id);
  const humanPass = Boolean(item?.hardRequirementsPassed && item.score >= review.passScore);
  const judge = row.attempts?.[0]?.llmJudge;
  const judgePass = judge?.passed === true;
  return { id: row.id, humanPass, humanScore: item?.score ?? null, judgePass, judgeScore: judge?.score ?? null, agreement: humanPass === judgePass, humanReason: item?.reason || '', judgeReason: judge?.reason || '' };
});
const agreement = rows.filter((row) => row.agreement).length;
const output = { generatedAt: new Date().toISOString(), total: rows.length, agreement, agreementRate: agreement / rows.length * 100, rows };
await fs.writeFile(new URL('./comparison.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`평가 일치: ${agreement}/${rows.length} (${output.agreementRate.toFixed(0)}%)`);
for (const row of rows.filter((item) => !item.agreement)) console.log(`불일치 ${row.id}: 사람=${row.humanPass ? 'PASS' : 'FAIL'}, LLM=${row.judgePass ? 'PASS' : 'FAIL'}`);
