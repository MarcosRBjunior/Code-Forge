import assert from "node:assert/strict";
import { INITIAL_STATE, schedule, previewLabels, addDays, type CardState } from "../src/lib/srs";

let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok  ", name); };

t("sequência de acertos cresce: 1, 6, depois ease", () => {
  let s: CardState = INITIAL_STATE;
  const seq: number[] = [];
  for (let i = 0; i < 5; i++) { s = schedule(s, 3); seq.push(s.intervalDays); }
  assert.deepEqual(seq.slice(0, 2), [1, 6]);
  assert.equal(seq[2], 15); // 6 * 2.5
  assert.ok(seq[3] > seq[2] && seq[4] > seq[3]);
});

t("errar zera a sequência, conta lapso e reduz facilidade", () => {
  const s = schedule({ ease: 2.5, intervalDays: 20, reps: 4, lapses: 0 }, 1);
  assert.deepEqual(s, { ease: 2.3, intervalDays: 0, reps: 0, lapses: 1 });
});

t("depois de errar, o primeiro acerto volta para 1 dia", () => {
  const s = schedule(schedule({ ease: 2.5, intervalDays: 20, reps: 4, lapses: 0 }, 1), 3);
  assert.equal(s.intervalDays, 1);
});

t("facilidade nunca fica abaixo de 1,3", () => {
  let s: CardState = INITIAL_STATE;
  for (let i = 0; i < 20; i++) s = schedule(s, 1);
  assert.equal(s.ease, 1.3);
});

t("difícil cresce pouco e reduz facilidade", () => {
  const s = schedule({ ease: 2.5, intervalDays: 10, reps: 3, lapses: 0 }, 2);
  assert.equal(s.intervalDays, 12);
  assert.ok(Math.abs(s.ease - 2.35) < 1e-9);
});

t("fácil dá intervalo maior que bom", () => {
  const base = { ease: 2.5, intervalDays: 10, reps: 3, lapses: 0 };
  assert.ok(schedule(base, 4).intervalDays > schedule(base, 3).intervalDays);
});

t("acerto nunca encolhe o intervalo", () => {
  const s = schedule({ ease: 1.3, intervalDays: 2, reps: 5, lapses: 3 }, 3);
  assert.ok(s.intervalDays >= 3);
});

t("intervalo tem teto de 365 dias", () => {
  const s = schedule({ ease: 2.8, intervalDays: 300, reps: 9, lapses: 0 }, 4);
  assert.equal(s.intervalDays, 365);
});

t("previewLabels descreve as quatro notas", () => {
  assert.deepEqual(previewLabels(INITIAL_STATE), { 1: "hoje", 2: "1 dia", 3: "1 dia", 4: "4 dias" });
});

t("addDays atravessa mês e ano", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
});

console.log(`\n${n} testes passaram`);
