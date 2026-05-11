/* ── Reset & Base ─────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #F7F6F3;
  --surface:   #FFFFFF;
  --border:    rgba(0,0,0,0.09);
  --border-md: rgba(0,0,0,0.16);
  --text:      #1A1A18;
  --text-sec:  #6B6B67;
  --text-hint: #9B9B96;
  --accent:    #1B4F8A;
  --accent-lt: #E6EFF8;
  --ok:        #2D6A1F;
  --ok-bg:     #EBF4E6;
  --warn:      #7A4A00;
  --warn-bg:   #FDF3E0;
  --danger:    #8B1A1A;
  --radius:    8px;
  --radius-lg: 12px;
  --shadow:    0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
}

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');

body { background: var(--bg); color: var(--text); font-size: 14px; line-height: 1.5; }

/* ── Login ────────────────────────────────────────────────────────────────── */
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}
.login-box {
  width: 360px;
  background: var(--surface);
  border: 0.5px solid var(--border-md);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow);
}
.login-logo { display: flex; justify-content: center; margin-bottom: 1.25rem; }
.login-logo-mark {
  width: 44px; height: 44px;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 500;
  letter-spacing: -0.5px;
}
.login-title { font-size: 20px; font-weight: 500; text-align: center; margin-bottom: 4px; }
.login-sub   { font-size: 13px; color: var(--text-sec); text-align: center; margin-bottom: 1.5rem; }
.login-err   { font-size: 12px; color: var(--danger); margin-bottom: 8px; }
.login-hint  { font-size: 11px; color: var(--text-hint); text-align: center; margin-top: 12px; }
.login-hint code { background: var(--bg); padding: 1px 5px; border-radius: 4px; font-family: 'DM Mono', monospace; }

/* ── App shell ───────────────────────────────────────────────────────────── */
.app { min-height: 100vh; display: flex; flex-direction: column; }

.nav {
  background: var(--surface);
  border-bottom: 0.5px solid var(--border);
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky; top: 0; z-index: 100;
}
.nav-brand    { display: flex; align-items: center; gap: 10px; }
.nav-logo     { width: 32px; height: 32px; border-radius: 8px; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 500; }
.nav-title    { font-size: 14px; font-weight: 500; display: block; }
.nav-sub      { font-size: 11px; color: var(--text-sec); display: block; }
.nav-right    { display: flex; align-items: center; gap: 12px; }
.nav-user     { display: flex; align-items: center; gap: 8px; }
.nav-user-name{ font-size: 13px; font-weight: 500; display: block; }
.nav-user-role{ font-size: 11px; color: var(--text-sec); display: block; }

.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--accent-lt); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 500;
}
.avatar.sm { width: 28px; height: 28px; font-size: 10px; }

.main { flex: 1; padding: 1.5rem; max-width: 1400px; margin: 0 auto; width: 100%; }

/* ── Tabs ─────────────────────────────────────────────────────────────────── */
.tabs {
  display: flex; gap: 2px;
  border-bottom: 0.5px solid var(--border);
  margin-bottom: 1.5rem;
}
.tab {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 16px;
  font-size: 13px; color: var(--text-sec);
  background: none; border: none; cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -0.5px;
  transition: color 0.15s;
  position: relative;
}
.tab:hover { color: var(--text); }
.tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 500; }
.tab svg { opacity: 0.6; }
.tab.active svg { opacity: 1; }
.tab-badge {
  background: var(--warn-bg); color: var(--warn);
  font-size: 10px; padding: 1px 6px; border-radius: 10px;
}

/* ── Forms ────────────────────────────────────────────────────────────────── */
.field { margin-bottom: 12px; }
label { font-size: 12px; color: var(--text-sec); display: block; margin-bottom: 4px; }
input, select, textarea {
  width: 100%; padding: 8px 10px;
  border: 0.5px solid var(--border-md);
  border-radius: var(--radius);
  background: var(--surface); color: var(--text);
  font-size: 13px; font-family: inherit;
  transition: border-color 0.15s;
}
input:focus, select:focus { outline: none; border-color: var(--accent); }
input:disabled, select:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Buttons ──────────────────────────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border: 0.5px solid var(--border-md);
  border-radius: var(--radius);
  background: transparent; color: var(--text);
  font-size: 13px; cursor: pointer;
  transition: background 0.12s;
}
.btn:hover { background: var(--bg); }
.btn-primary {
  background: var(--accent); color: #fff;
  border-color: var(--accent);
}
.btn-primary:hover { opacity: 0.88; background: var(--accent); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-full { width: 100%; justify-content: center; }
.btn-icon { padding: 7px; border-color: transparent; }

.btn-status {
  font-size: 11px; padding: 3px 9px;
  border-radius: 20px; cursor: pointer;
  border: 0.5px solid;
  transition: all 0.12s;
}
.btn-status.pending  { border-color: var(--border-md); color: var(--text-sec); background: transparent; }
.btn-status.pending:hover  { border-color: var(--ok); color: var(--ok); }
.btn-status.approved { background: var(--ok-bg); border-color: var(--ok); color: var(--ok); }
.btn-status.approved:hover { opacity: 0.7; }

/* ── Cards & Layout ───────────────────────────────────────────────────────── */
.card {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}
.grid-2   { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.section-label { font-size: 12px; font-weight: 500; color: var(--text-sec); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }

/* ── Metrics ──────────────────────────────────────────────────────────────── */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 1.5rem;
}
.metric-card {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
}
.metric-label { font-size: 11px; color: var(--text-sec); display: block; margin-bottom: 4px; }
.metric-value { font-size: 20px; font-weight: 500; display: block; }
.metric-value.warn { color: var(--warn); }
.metric-value.ok   { color: var(--ok); }

/* ── Upload ───────────────────────────────────────────────────────────────── */
.upload-zone {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border: 1px dashed var(--border-md);
  border-radius: var(--radius-lg);
  padding: 2.5rem 1.5rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  text-align: center;
}
.upload-zone:hover { background: var(--bg); border-color: var(--accent); }
.upload-zone.loading { opacity: 0.6; }
.upload-icon { color: var(--text-sec); margin-bottom: 10px; }
.upload-text { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
.upload-sub  { font-size: 12px; color: var(--text-hint); }

/* ── Status bars ──────────────────────────────────────────────────────────── */
.status-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius);
  font-size: 12px;
  margin-top: 10px;
}
.status-ok { background: var(--ok-bg); color: var(--ok); }

/* ── Table ────────────────────────────────────────────────────────────────── */
.table-toolbar {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 10px;
}
.search { width: 220px; }
.table-count { font-size: 12px; color: var(--text-hint); }

.table-wrap { overflow-x: auto; border: 0.5px solid var(--border); border-radius: var(--radius-lg); }

.data-table {
  width: 100%; border-collapse: collapse;
  font-size: 12px; table-layout: fixed;
}
.data-table th {
  padding: 9px 10px;
  font-size: 11px; font-weight: 500; color: var(--text-sec);
  background: var(--bg);
  border-bottom: 0.5px solid var(--border);
  text-align: left; white-space: nowrap;
}
.data-table td {
  padding: 7px 10px;
  border-bottom: 0.5px solid var(--border);
  vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #FAFAF8; }
.data-table tr.row-approved td { background: #F7FCF4; }

.td-name  { font-weight: 500; }
.td-num   { font-variant-numeric: tabular-nums; text-align: right; font-weight: 500; }
.neg      { color: var(--danger); }

.cell-input {
  padding: 3px 6px; font-size: 12px; border-radius: 5px;
  width: 100%; min-width: 0;
}
.cell-input.num { width: 48px; text-align: center; }
.cell-select { padding: 3px 4px; font-size: 11px; border-radius: 5px; }

/* ── Tags & Badges ────────────────────────────────────────────────────────── */
.tag     { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 11px; }
.tag-1st { background: #E6EFF8; color: #1B4F8A; }
.tag-2nd { background: #EBF4E6; color: #2D6A1F; }
.tag-oh  { background: #F1EFE8; color: #5F5E5A; }
.badge   { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; }
.badge-ok   { background: var(--ok-bg);   color: var(--ok); }
.badge-warn { background: var(--warn-bg); color: var(--warn); }

/* ── Pro-Team ─────────────────────────────────────────────────────────────── */
.goal-ok { color: var(--ok);     font-weight: 500; }
.goal-no { color: var(--text-hint); }
.goal-ok small, .goal-no small { font-weight: 400; color: var(--text-sec); margin-left: 4px; }

/* ── Users ────────────────────────────────────────────────────────────────── */
.user-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0;
  border-bottom: 0.5px solid var(--border);
}
.user-row:last-child { border-bottom: none; }
.user-info  { flex: 1; }
.user-name  { font-size: 13px; font-weight: 500; display: block; }
.user-role  { font-size: 11px; color: var(--text-sec); display: block; }

/* ── Progress ─────────────────────────────────────────────────────────────── */
.progress-bar  { height: 6px; background: var(--bg); border-radius: 10px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--ok); border-radius: 10px; transition: width 0.3s; }

/* ── Changelog ────────────────────────────────────────────────────────────── */
.changelog { max-height: 260px; overflow-y: auto; }
.log-row { padding: 6px 0; border-bottom: 0.5px solid var(--border); display: flex; gap: 8px; flex-wrap: wrap; font-size: 11px; }
.log-row:last-child { border-bottom: none; }
.log-ts   { color: var(--text-hint); white-space: nowrap; }
.log-user { font-weight: 500; color: var(--accent); white-space: nowrap; }
.log-detail { color: var(--text-sec); }

/* ── Empty state ──────────────────────────────────────────────────────────── */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 4rem; gap: 12px; color: var(--text-sec); text-align: center;
}
.empty-state p { font-size: 14px; }

/* ── Tab pane ─────────────────────────────────────────────────────────────── */
.tab-pane { animation: fadeIn 0.15s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

@media (max-width: 900px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .grid-2 { grid-template-columns: 1fr; }
}
