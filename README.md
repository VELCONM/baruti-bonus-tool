// ─── Bonus-Berechnungslogik ───────────────────────────────────────────────────
// Entspricht exakt der Excel-Formellogik aus den Kennzahlen-Files

export const PARAMS = {
  LQ:        { min: 35,   max: 50,   x: 0.1  },
  KZB:       { antMin: 0.5, frdlkMin: 1.5, x: -1.0 },
  SIMO_MIN:  { min: 0.65, x: -1.0 },
  SIMO_MAX:  { max: 0.75, x:  1.6  },
  VK:        { ev: 1.5,   jv: 2.5  },
  PRO_TEAM:  {
    simoZiel:    0.85,
    lqZiel:      42,
    shrinkZiel:  0.88,
    stufen: { 0: 0, 1: 0, 2: 0.3, 3: 0.6 },
  },
  FEHLTAGE:    { 0: 0, 1: 0.20, 2: 0.40 }, // >=3 => 100%
  VERSPAETUNG: { 2: 0.15, 3: 0.30 },        // >=4 => 100%
};

export function calcLqPph(lq) {
  return Math.max(Math.min(PARAMS.LQ.max - PARAMS.LQ.min, lq - PARAMS.LQ.min), 0) * PARAMS.LQ.x;
}

export function calcSimoPph(simo) {
  if (simo <= 0) return 0;
  const part1 = simo < PARAMS.SIMO_MIN.min ? PARAMS.SIMO_MIN.x : 0;
  const part2 = Math.max(0, (simo - PARAMS.SIMO_MAX.max) / (1 - PARAMS.SIMO_MAX.max)) * PARAMS.SIMO_MAX.x;
  return part1 + part2;
}

export function calcKzbPph(frdlk, antwort) {
  const cond1 = PARAMS.KZB.x * Math.max(0, frdlk - PARAMS.KZB.frdlkMin);
  const cond2 = antwort < PARAMS.KZB.antMin ? PARAMS.KZB.x : 0;
  return Math.min(cond1, cond2);
}

export function calcFehltagesMalus(n) {
  if (n >= 3) return 1.0;
  return PARAMS.FEHLTAGE[n] || 0;
}

export function calcVerspaetungsMalus(n) {
  if (n >= 4) return 1.0;
  if (n === 3) return 0.30;
  if (n === 2) return 0.15;
  return 0;
}

export function calcBonus(agent) {
  const { pstd, lq, simo, frdlk, antwort, vk } = agent;
  const fehltage    = agent.fehltage    || 0;
  const verspaetung = agent.verspaetung || 0;
  const abzugMalus  = agent.abzugMalus  || 0;

  const lqPph   = calcLqPph(lq);
  const simoPph = calcSimoPph(simo);
  const kzbPph  = calcKzbPph(frdlk, antwort);

  const ergebnisLq   = lqPph   * pstd;
  const ergebnisSimo = simoPph * pstd;
  const ergebnisKzb  = kzbPph  * pstd;

  const zw1 = ergebnisLq + ergebnisSimo + ergebnisKzb + (vk || 0);

  const flPct = calcFehltagesMalus(fehltage);
  const zw2   = zw1 * (1 - flPct);

  const vpPct  = calcVerspaetungsMalus(verspaetung);
  const abzug  = zw2 * vpPct;
  const total  = Math.max(0, zw2 - abzug);
  const netto  = total - abzugMalus;

  return { lqPph, simoPph, kzbPph, ergebnisLq, ergebnisSimo, ergebnisKzb, zw1, zw2, abzug, total, netto };
}

export function calcProTeam(agent) {
  const { pstd, lq, simo, anmelde } = agent;
  const shrink   = anmelde > 0 ? pstd / anmelde : 0;
  const simoOk   = simo   >= PARAMS.PRO_TEAM.simoZiel;
  const lqOk     = lq     >= PARAMS.PRO_TEAM.lqZiel;
  const shrinkOk = shrink >= PARAMS.PRO_TEAM.shrinkZiel;
  const ziele    = (simoOk ? 1 : 0) + (lqOk ? 1 : 0) + (shrinkOk ? 1 : 0);
  const stufe    = PARAMS.PRO_TEAM.stufen[ziele] || 0;
  return { shrink, simoOk, lqOk, shrinkOk, ziele, stufe, bonus: stufe * pstd };
}

// ─── Kennzahlen-File Parser ───────────────────────────────────────────────────
// Liest BAR_Kennzahlen_MMYYYY.xlsx und extrahiert alle Agenten-Werte
export function parseKennzahlenFile(workbook) {
  const ws = workbook.Sheets[workbook.SheetNames[0]];
  const data = [];

  // xlsx to array
  const range = workbook.utils
    ? workbook.utils.decode_range(ws['!ref'])
    : { s: { r: 0, c: 0 }, e: { r: 500, c: 100 } };

  const rows = [];
  for (let r = range.s.r; r <= range.e.r; r++) {
    const row = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[_cellAddress(r, c)];
      row.push(cell ? cell.v : null);
    }
    rows.push(row);
  }

  // Find agent tables by scanning for "Nice_Employee_Name" headers
  const prodHours = {}, simoVals = {}, lqVals = {}, kzbFrdlk = {}, kzbAntwort = {},
        evCounts = {}, jvCounts = {}, anmeldeTimes = {}, skills = {};

  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      if (cell !== 'Nice_Employee_Name') return;

      // Check columns in this row for table type
      const colVals = row.slice(ci + 1, ci + 20).map(v => String(v || ''));
      const hasProdStd  = colVals.some(v => v.includes('Produktivstunde'));
      const hasLQ       = colVals.some(v => v === 'LQ');
      const hasSimo     = colVals.some(v => v.includes('SiMo'));
      const hasFrdlk    = colVals.some(v => v.includes('Freundlichkeit'));
      const hasAnmelde  = colVals.some(v => v.includes('Anmeldezeit'));

      let prodCol = -1, lqCol = -1, simoCol = -1, frdlkCol = -1, antwortCol = -1, anmeldeCol = -1;
      for (let c2 = ci + 1; c2 < Math.min(ci + 20, row.length); c2++) {
        const h = String(row[c2] || '');
        if (h.includes('Produktivstunde') && !h.includes('volle')) prodCol = c2;
        if (h === 'LQ') lqCol = c2;
        if (h.includes('SiMo') && !h.includes('Bonus')) simoCol = c2;
        if (h.includes('Freundlichkeit') && h.includes('Note')) frdlkCol = c2;
        if (h.includes('Antworten') && h.includes('mgl')) antwortCol = c2;
        if (h.includes('Anmeldezeit')) anmeldeCol = c2;
      }

      // Read agent rows
      for (let r2 = ri + 1; r2 < Math.min(ri + 100, rows.length); r2++) {
        const aRow = rows[r2];
        const name = aRow[ci];
        if (!name || String(name).trim() === '' || String(name).trim() === 'Gesamt') break;
        const n = String(name).trim();

        if (prodCol >= 0 && typeof aRow[prodCol] === 'number' && aRow[prodCol] > 0)
          prodHours[n] = aRow[prodCol];
        if (lqCol >= 0 && typeof aRow[lqCol] === 'number')
          lqVals[n] = aRow[lqCol];
        if (simoCol >= 0 && typeof aRow[simoCol] === 'number')
          simoVals[n] = aRow[simoCol];
        if (frdlkCol >= 0 && typeof aRow[frdlkCol] === 'number')
          kzbFrdlk[n] = aRow[frdlkCol];
        if (antwortCol >= 0 && typeof aRow[antwortCol] === 'number')
          kzbAntwort[n] = aRow[antwortCol];
        if (anmeldeCol >= 0 && typeof aRow[anmeldeCol] === 'number' && aRow[anmeldeCol] > 0)
          anmeldeTimes[n] = aRow[anmeldeCol];
      }
    });
  });

  // Determine skill from department
  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const s = String(cell || '');
      if (s.includes('1st Level') || s.includes('1st-Level')) {
        for (let r2 = ri + 1; r2 < ri + 60 && r2 < rows.length; r2++) {
          const n = String(rows[r2][ci] || '').trim();
          if (!n || n === 'Gesamt') break;
          if (!skills[n]) skills[n] = '1st-Level';
        }
      }
      if (s.includes('2nd Level') || s.includes('2nd-Level')) {
        for (let r2 = ri + 1; r2 < ri + 60 && r2 < rows.length; r2++) {
          const n = String(rows[r2][ci] || '').trim();
          if (!n || n === 'Gesamt') break;
          if (!skills[n]) skills[n] = '2nd-Level';
        }
      }
    });
  });

  // Parse VK (Verkauf) - EV and JV counts
  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      if (cell !== 'Nice_Employee_Name') return;
      let evCol = -1, jvCol = -1;
      for (let c2 = ci + 1; c2 < Math.min(ci + 25, row.length); c2++) {
        const h = String(row[c2] || '');
        if (h.includes('Einzel') || h === 'Reiseschutz Einzel') evCol = c2;
        if (h.includes('Jahr') || h === 'Reiseschutz Jahr') jvCol = c2;
      }
      if (evCol < 0 || jvCol < 0) return;
      for (let r2 = ri + 1; r2 < Math.min(ri + 80, rows.length); r2++) {
        const n = String(rows[r2][ci] || '').trim();
        if (!n || n === 'Gesamt') break;
        if (typeof rows[r2][evCol] === 'number') evCounts[n] = rows[r2][evCol];
        if (typeof rows[r2][jvCol] === 'number') jvCounts[n] = rows[r2][jvCol];
      }
    });
  });

  // Build agent list
  const allNames = [...new Set([...Object.keys(prodHours), ...Object.keys(simoVals)])];
  return allNames
    .filter(n => prodHours[n] > 1)
    .sort((a, b) => a.localeCompare(b))
    .map(name => ({
      name,
      skill:     skills[name]    || '1st-Level',
      pstd:      prodHours[name] || 0,
      lq:        lqVals[name]    || 0,
      simo:      simoVals[name]  || 0,
      frdlk:     kzbFrdlk[name]  || 1.0,
      antwort:   kzbAntwort[name] > 1 ? kzbAntwort[name] / 100 : (kzbAntwort[name] || 0.6),
      vk:        (evCounts[name] || 0) * 1.5 + (jvCounts[name] || 0) * 2.5,
      anmelde:   anmeldeTimes[name] || 0,
      payroll:   '',
      ho:        'Office',
      fehltage:  0,
      verspaetung: 0,
      abzugMalus: 0,
      status:    'offen',
    }));
}

function _cellAddress(r, c) {
  let col = '';
  let n = c + 1;
  while (n > 0) {
    col = String.fromCharCode(((n - 1) % 26) + 65) + col;
    n = Math.floor((n - 1) / 26);
  }
  return col + (r + 1);
}
