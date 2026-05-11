import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { calcBonus, calcProTeam, PARAMS } from './bonusCalc';

const DARK_BLUE  = 'FF1F3864';
const MID_BLUE   = 'FF2E75B6';
const LIGHT_BLUE = 'FFD9E2F3';
const LIGHT_GREY = 'FFF2F2F2';
const YELLOW     = 'FFFFF2CC';
const WHITE      = 'FFFFFFFF';

function cellStyle(bg, bold = false, size = 9, color = 'FF000000') {
  return {
    font:      { name: 'Arial', sz: size, bold, color: { rgb: color } },
    fill:      { fgColor: { rgb: bg }, patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top:    { style: 'thin', color: { rgb: 'FFBFBFBF' } },
      bottom: { style: 'thin', color: { rgb: 'FFBFBFBF' } },
      left:   { style: 'thin', color: { rgb: 'FFBFBFBF' } },
      right:  { style: 'thin', color: { rgb: 'FFBFBFBF' } },
    },
  };
}

function euroFmt()   { return '#,##0.00 €'; }
function pctFmt()    { return '0.00%'; }
function numFmt()    { return '#,##0.00'; }

export function exportBonus(agents, monat, filename) {
  const wb = XLSX.utils.book_new();
  const monatLabel = monat || 'Monat 2026';

  // ── Row layout ──────────────────────────────────────────────────────────────
  const n       = agents.length;
  const R1      = 1;  // 0-indexed
  const Rn      = R1 + n - 1;
  const RS      = Rn + 1;
  const RPB     = Rn + 2;
  const pl      = Rn + 6;   // LQ param value row (0-idx)
  const pk      = Rn + 9;
  const ps      = Rn + 12;
  const pm      = Rn + 15;

  // ── Main sheet ──────────────────────────────────────────────────────────────
  const wsData = [];

  // Header row
  const headers = [
    'Payroll-Nr.','Name (TP)','Midoco User','HO/Office','Monat','Skill',
    'Produktive\nStunden','LQ-Wert','Bonus\npro Std','Ergebnis LQ',
    'SIMO-Wert','SIMO\npro Std','Ergebnis\nSIMO','KZB\nFrdlk',
    'KZB\nAntwort%','KZB-Malus\npro Std','Ergebnis KZB','VK',
    'Zwischenwert 1','Fehltage','Malus','Zwischenwert 2','Verspätung',
    'Malus','Abzug','Bonus-Total','Abzug Malus\n'+monatLabel.replace(/ /g,''),
    'Bonus nach\nAbzug',
  ];
  wsData.push(headers);

  // Month serial
  const [mName, mYear] = monatLabel.split(' ');
  const monthMap = { Januar:0,Februar:1,März:2,April:3,Mai:4,Juni:5,Juli:6,August:7,September:8,Oktober:9,November:10,Dezember:11 };
  const mDate = new Date(parseInt(mYear||2026), monthMap[mName]||0, 1);
  const monatSerial = Math.floor((mDate - new Date(1899,11,30)) / 86400000);

  // Data rows
  const excelR1 = 2; // 1-indexed Excel row for first data row
  agents.forEach((a, idx) => {
    const r = excelR1 + idx;
    const plE = pl + 2, pkE = pk + 2, psE = ps + 2, pmE = pm + 2; // 1-indexed for formulas

    wsData.push([
      a.payroll || '',
      a.name,
      a.name,
      a.ho || 'Office',
      monatSerial,
      a.skill,
      a.pstd,
      a.lq,
      { f: `MAX(MIN($C$${plE}-$B$${plE},H${r}-$B$${plE}),0)*$D$${plE}` },
      { f: `I${r}*G${r}` },
      a.simo,
      { f: `IF(K${r}>0,IF(K${r}<$B$${psE},$C$${psE})+MAX(0,(K${r}-$B$${pmE})/(1-$B$${pmE}))*$C$${pmE},0)` },
      { f: `L${r}*G${r}` },
      a.frdlk,
      a.antwort,
      { f: `MIN($D$${pkE}*MAX(0,N${r}-$C$${pkE}),IF(O${r}<$B$${pkE},$D$${pkE},0))` },
      { f: `P${r}*G${r}` },
      a.vk || 0,
      { f: `SUM(R${r}+Q${r}+M${r}+J${r})` },
      a.fehltage || 0,
      { f: `IF(T${r}>=3,"100%",IF(T${r}=2,"40%",IF(T${r}=1,"20%","0%")))` },
      { f: `SUM(S${r}-(S${r}*(U${r})))` },
      a.verspaetung || 0,
      { f: `IF(W${r}=2, 15%, IF(W${r}=3, 30%, IF(W${r}>=4, 100%, 0%)))` },
      { f: `SUM(V${r}*X${r})` },
      { f: `MAX(0, V${r} - Y${r})` },
      a.abzugMalus || 0,
      { f: `Z${r}-AA${r}` },
    ]);
  });

  // Sum row
  const sumR = RS + 2;
  wsData.push(new Array(28).fill(null).map((_, ci) =>
    [25, 26, 27].includes(ci) ? { f: `SUM(${String.fromCharCode(65+ci)}${excelR1}:${String.fromCharCode(65+ci)}${excelR1+n-1})` } : null
  ));

  // PRO Bonus ref
  const proTeamAgents = agents.filter(a => calcProTeam(a).stufe > 0);
  wsData.push(new Array(27).fill(null).concat([{ f: `'Pro-Team-Spezial-Bonus'!Q${2+proTeamAgents.length}` }]));
  wsData.push([]); // blank

  // Parameter block
  const paramRows = [
    [], ['LQ'], ['MinLQ','MaxLQ','X LQ'], [PARAMS.LQ.min, PARAMS.LQ.max, PARAMS.LQ.x],
    [], ['KZB'], ['Antwortrate','MinKZB','X KZB'], [PARAMS.KZB.antMin, PARAMS.KZB.frdlkMin, PARAMS.KZB.x],
    [], ['SIMO-Malus'], ['MinSIMO','X MinSIMO'], [PARAMS.SIMO_MIN.min, PARAMS.SIMO_MIN.x],
    [], ['SIMO-Bonus'], ['MaxSIMO','X SIMO'], [PARAMS.SIMO_MAX.max, PARAMS.SIMO_MAX.x],
    [], ['Reiseschutz'], ['EV','JV'], [PARAMS.VK.ev, PARAMS.VK.jv],
  ];
  paramRows.forEach(r => wsData.push([null, ...r]));

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [
    {wch:10},{wch:22},{wch:20},{wch:12},{wch:14},{wch:12},
    {wch:12},{wch:10},{wch:10},{wch:12},
    {wch:10},{wch:10},{wch:12},{wch:12},
    {wch:12},{wch:12},{wch:12},{wch:10},
    {wch:14},{wch:10},{wch:8},{wch:14},{wch:10},
    {wch:8},{wch:10},{wch:12},{wch:12},{wch:12},
  ];

  // Number formats
  for (let r = excelR1; r < excelR1 + n; r++) {
    const cols = {
      E: 'MMM YYYY', G: numFmt(), H: numFmt(), I: euroFmt(), J: euroFmt(),
      K: pctFmt(), L: euroFmt(), M: euroFmt(), N: numFmt(), O: pctFmt(),
      P: euroFmt(), Q: euroFmt(), R: euroFmt(), S: euroFmt(),
      U: pctFmt(), V: euroFmt(), X: pctFmt(), Y: euroFmt(),
      Z: euroFmt(), AA: euroFmt(), AB: euroFmt(),
    };
    Object.entries(cols).forEach(([col, fmt]) => {
      const addr = col + r;
      if (ws[addr]) ws[addr].z = fmt;
    });
  }

  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws, monatLabel.split(' ')[0]);

  // ── Pro-Team Sheet ──────────────────────────────────────────────────────────
  const PT_PARAM = proTeamAgents.length + 4;
  const PT_SIMO_V   = PT_PARAM + 2;
  const PT_LQ_V     = PT_PARAM + 4;
  const PT_SHRINK_V = PT_PARAM + 6;
  const PT_STUFEN   = PT_PARAM + 8;

  const ptData = [[
    'Payroll-Nr.','Name (TP)','Midoco User','PSS User','Monat','Skill',
    'SIMO-Ergebnis','Ziel ≥85%?','LQ Ergebnis','Ziel ≥42?',
    'Anmeldezeit','Produktive Zeit','Shrinkage','Ziel ≥88%?',
    'Ziele erreicht','Bonus-Stufe','Bonus erreicht',
  ]];

  const mainSheet = monatLabel.split(' ')[0];

  proTeamAgents.forEach((a, idx) => {
    const mr = excelR1 + agents.indexOf(a);
    const r  = 2 + idx;
    ptData.push([
      a.payroll || '',
      a.name,
      a.name,
      '',
      monatSerial,
      a.skill,
      { f: `${mainSheet}!K${mr}` },
      { f: `IF(G${r}>=$B$${PT_SIMO_V},"JA","Nein")` },
      { f: `${mainSheet}!H${mr}` },
      { f: `IF(I${r}>=$B$${PT_LQ_V},"JA","Nein")` },
      a.anmelde,
      { f: `${mainSheet}!G${mr}` },
      { f: `L${r}/K${r}` },
      { f: `IF(M${r}>=$B$${PT_SHRINK_V},"JA","Nein")` },
      { f: `COUNTIF(H${r}:H${r},"JA")+COUNTIF(J${r}:J${r},"JA")+COUNTIF(N${r}:N${r},"JA")` },
      { f: `IF(O${r}=3,$C$${PT_STUFEN+3},IF(O${r}=2,$C$${PT_STUFEN+2},IF(O${r}=1,$C$${PT_STUFEN+1},$C$${PT_STUFEN})))` },
      { f: `P${r}*L${r}` },
    ]);
  });

  // Sum
  const ptSumR = 2 + proTeamAgents.length;
  ptData.push(new Array(16).fill(null).concat([{ f: `SUM(Q2:Q${ptSumR-1})` }]));

  // Pro-Team parameters
  ptData.push([], ['Zielwerte']);
  ptData.push(['Min. SIMO',   PARAMS.PRO_TEAM.simoZiel]);
  ptData.push([]);
  ptData.push(['Min. LQ',     PARAMS.PRO_TEAM.lqZiel]);
  ptData.push([]);
  ptData.push(['Min. Shrinkage', PARAMS.PRO_TEAM.shrinkZiel]);
  ptData.push([]);
  ptData.push(['Bonus-Stufen']);
  Object.entries(PARAMS.PRO_TEAM.stufen).forEach(([z, s]) =>
    ptData.push([`${z} Ziele`, s])
  );

  const wsPt = XLSX.utils.aoa_to_sheet(ptData);
  wsPt['!cols'] = [{wch:10},{wch:22},{wch:20},{wch:14},{wch:14},{wch:12},{wch:14},{wch:12},{wch:12},{wch:12},{wch:12},{wch:14},{wch:12},{wch:12},{wch:14},{wch:12},{wch:14}];
  XLSX.utils.book_append_sheet(wb, wsPt, 'Pro-Team-Spezial-Bonus');

  // ── Hide Sheet ──────────────────────────────────────────────────────────────
  const wsHide = XLSX.utils.aoa_to_sheet([
    [null,'BDVJ',2.5], [null,'BDV',1.5],
    [null,'Allianz',1.5], [null,'Allianzj',2.5], [null,'HMI',1.5],
  ]);
  XLSX.utils.book_append_sheet(wb, wsHide, 'Hide');

  // ── Save ────────────────────────────────────────────────────────────────────
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), filename || `${monatLabel.replace(' ','_')}_Bonus_Invia_Travel.xlsx`);
}
