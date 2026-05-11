import React, { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { USERS, ROLE_LABELS } from './users';
import { calcBonus, calcProTeam, parseKennzahlenFile } from './lib/bonusCalc';
import { exportBonus } from './lib/xlsxExport';
import './App.css';

// ── Icons (inline SVG) ────────────────────────────────────────────────────────
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const UploadIcon  = () => <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />;
const TableIcon   = () => <Icon d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />;
const StarIcon    = () => <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const DownloadIcon= () => <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />;
const LogoutIcon  = () => <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />;
const CheckIcon   = () => <Icon d="M20 6L9 17l-5-5" />;
const AlertIcon   = () => <Icon d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />;

// ── Demo data (April 2026) ────────────────────────────────────────────────────
const DEMO_AGENTS = [
  {name:"Alba Krasniqi",skill:"1st-Level",pstd:153.29,lq:32.64,simo:0.9551,frdlk:1.06,antwort:0.6416,vk:4.00,anmelde:173.21},
  {name:"Albion Berisha",skill:"2nd-Level",pstd:128.78,lq:46.75,simo:0.9171,frdlk:1.18,antwort:0.5655,vk:6.50,anmelde:143.43},
  {name:"Anita Halili",skill:"2nd-Level",pstd:138.42,lq:38.55,simo:0.9228,frdlk:1.14,antwort:0.5425,vk:9.00,anmelde:160.35},
  {name:"Arbenita Neziraj",skill:"2nd-Level",pstd:178.97,lq:46.46,simo:0.9241,frdlk:1.08,antwort:0.5978,vk:10.50,anmelde:189.84},
  {name:"Arber Lezi",skill:"2nd-Level",pstd:104.32,lq:49.96,simo:0.8067,frdlk:1.24,antwort:0.6524,vk:2.50,anmelde:191.54},
  {name:"Ardiana Gashi",skill:"2nd-Level",pstd:155.34,lq:35.56,simo:0.9518,frdlk:1.05,antwort:0.5306,vk:1.50,anmelde:178.50},
  {name:"Besnik Islami",skill:"2nd-Level",pstd:211.08,lq:44.24,simo:0.9494,frdlk:1.21,antwort:0.5374,vk:11.50,anmelde:235.72},
  {name:"Besnike Fetahu",skill:"1st-Level",pstd:113.43,lq:32.89,simo:0.8795,frdlk:1.17,antwort:0.5856,vk:0.00,anmelde:130.72},
  {name:"Bleona Fazliu",skill:"2nd-Level",pstd:149.39,lq:40.83,simo:0.9521,frdlk:1.11,antwort:0.5894,vk:0.00,anmelde:171.32},
  {name:"Blerina Bajraktari",skill:"1st-Level",pstd:96.91,lq:36.53,simo:0.9614,frdlk:1.14,antwort:0.5836,vk:7.50,anmelde:110.34},
  {name:"Bujar Thaqi",skill:"1st-Level",pstd:154.74,lq:48.80,simo:0.8283,frdlk:1.22,antwort:0.5489,vk:9.00,anmelde:175.04},
  {name:"Dardan Kabashi",skill:"1st-Level",pstd:60.16,lq:30.05,simo:0.7787,frdlk:1.14,antwort:0.5417,vk:0.00,anmelde:67.56},
  {name:"Donjeta Bajramaj",skill:"2nd-Level",pstd:150.52,lq:42.48,simo:0.9137,frdlk:1.15,antwort:0.5344,vk:9.00,anmelde:167.78},
  {name:"Doruntina Avdija",skill:"1st-Level",pstd:68.40,lq:35.59,simo:0.9723,frdlk:1.02,antwort:0.6164,vk:0.00,anmelde:77.78},
  {name:"Drilon Jashari",skill:"2nd-Level",pstd:124.62,lq:38.95,simo:0.9426,frdlk:1.23,antwort:0.5771,vk:4.00,anmelde:141.01},
  {name:"Egzon Avdylaj",skill:"1st-Level",pstd:129.43,lq:35.90,simo:0.9420,frdlk:1.14,antwort:0.5897,vk:8.00,anmelde:145.60},
  {name:"Egzon Zogaj",skill:"1st-Level",pstd:158.00,lq:30.07,simo:0.7009,frdlk:1.21,antwort:0.5252,vk:17.50,anmelde:187.13},
  {name:"Egzona Bekteshi",skill:"1st-Level",pstd:144.54,lq:26.34,simo:0.8942,frdlk:1.21,antwort:0.5586,vk:0.00,anmelde:167.08},
  {name:"Erleta Hoda",skill:"2nd-Level",pstd:113.39,lq:36.29,simo:0.9378,frdlk:1.09,antwort:0.5191,vk:1.50,anmelde:133.38},
  {name:"Fisnik Nasufaj",skill:"2nd-Level",pstd:130.87,lq:41.30,simo:0.9126,frdlk:1.18,antwort:0.5415,vk:4.50,anmelde:154.70},
  {name:"Granit Pulka",skill:"2nd-Level",pstd:195.89,lq:42.60,simo:0.7816,frdlk:1.17,antwort:0.5435,vk:12.50,anmelde:219.04},
  {name:"Harun Menekshe",skill:"2nd-Level",pstd:139.05,lq:38.83,simo:0.9159,frdlk:1.21,antwort:0.5679,vk:9.00,anmelde:164.34},
  {name:"Marigone Konjuhi",skill:"2nd-Level",pstd:111.89,lq:44.13,simo:0.9518,frdlk:1.15,antwort:0.5397,vk:9.00,anmelde:125.21},
  {name:"Petrit Ferizi",skill:"2nd-Level",pstd:165.69,lq:51.27,simo:0.9404,frdlk:1.19,antwort:0.5339,vk:68.00,anmelde:197.21},
  {name:"Ylfete Kurtaj",skill:"2nd-Level",pstd:117.51,lq:43.28,simo:0.9631,frdlk:1.22,antwort:0.5647,vk:23.00,anmelde:125.80},
].map(a => ({ ...a, payroll:'', ho:'Office', fehltage:0, verspaetung:0, abzugMalus:0, status:'offen' }));

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n, d=2) => typeof n === 'number' ? n.toFixed(d) : '—';
const fmtEur = n => typeof n === 'number' ? n.toFixed(2) + ' €' : '—';
const fmtPct = n => typeof n === 'number' ? (n * 100).toFixed(1) + '%' : '—';

function SkillTag({ skill }) {
  const cls = skill === '1st-Level' ? 'tag-1st' : skill === '2nd-Level' ? 'tag-2nd' : 'tag-oh';
  return <span className={`tag ${cls}`}>{skill.replace('-Level', '')}</span>;
}

function StatusBadge({ status }) {
  const cls = status === 'freigegeben' ? 'badge-ok' : 'badge-warn';
  return <span className={`badge ${cls}`}>{status}</span>;
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err,  setErr]  = useState('');

  const handleLogin = () => {
    const u = USERS[user.trim().toLowerCase()];
    if (u && u.password === pass) { onLogin({ ...u, key: user.trim().toLowerCase() }); }
    else { setErr('Ungültige Zugangsdaten'); }
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-mark">B</div>
        </div>
        <h1 className="login-title">Baruti Bonus Tool</h1>
        <p className="login-sub">Invia Travel · Monatliche Bonusberechnung</p>
        <div className="field">
          <label>Benutzername</label>
          <input value={user} onChange={e => { setUser(e.target.value); setErr(''); }} onKeyDown={e => e.key==='Enter' && handleLogin()} placeholder="z.B. mveliu" autoFocus />
        </div>
        <div className="field">
          <label>Passwort</label>
          <input type="password" value={pass} onChange={e => { setPass(e.target.value); setErr(''); }} onKeyDown={e => e.key==='Enter' && handleLogin()} placeholder="••••••••" />
        </div>
        {err && <p className="login-err">{err}</p>}
        <button className="btn btn-primary btn-full" onClick={handleLogin}>Anmelden</button>
        <p className="login-hint">Demo: <code>admin</code> / <code>baruti2026</code></p>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user,      setUser]      = useState(null);
  const [agents,    setAgents]    = useState([]);
  const [monat,     setMonat]     = useState('April 2026');
  const [tab,       setTab]       = useState('upload');
  const [search,    setSearch]    = useState('');
  const [changelog, setChangelog] = useState([]);
  const [fileInfo,  setFileInfo]  = useState(null);
  const [uploading, setUploading] = useState(false);

  const canEdit = user && user.role !== 'viewer';

  const addLog = useCallback((name, field, oldVal, newVal) => {
    setChangelog(prev => [
      { ts: new Date().toLocaleTimeString('de-DE'), user: user.name, name, field, old: oldVal, new: newVal },
      ...prev.slice(0, 49),
    ]);
  }, [user]);

  const updateAgent = useCallback((name, field, value) => {
    setAgents(prev => prev.map(a => {
      if (a.name !== name) return a;
      addLog(name, field, a[field], value);
      return { ...a, [field]: value };
    }));
  }, [addLog]);

  const toggleStatus = useCallback((name) => {
    setAgents(prev => prev.map(a => {
      if (a.name !== name) return a;
      const newStatus = a.status === 'freigegeben' ? 'offen' : 'freigegeben';
      addLog(name, 'status', a.status, newStatus);
      return { ...a, status: newStatus };
    }));
  }, [addLog]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const parsed = parseKennzahlenFile(wb);
        if (parsed.length > 0) {
          setAgents(parsed);
          setFileInfo({ name: file.name, count: parsed.length, ts: new Date().toLocaleString('de-DE') });
          // Auto-detect month from filename e.g. 042026 → April 2026
          const m = file.name.match(/(\d{2})2026/);
          if (m) {
            const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
            const idx = parseInt(m[1]) - 1;
            if (months[idx]) setMonat(months[idx] + ' 2026');
          }
          setTab('berechnung');
        } else {
          alert('Keine Agenten-Daten gefunden. Bitte prüfe das File-Format.');
        }
      } catch (err) {
        alert('Fehler beim Lesen der Datei: ' + err.message);
      }
      setUploading(false);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const loadDemo = () => {
    setAgents(DEMO_AGENTS.map(a => ({ ...a })));
    setFileInfo({ name: 'Demo-Daten April 2026', count: DEMO_AGENTS.length, ts: new Date().toLocaleString('de-DE') });
    setMonat('April 2026');
    setTab('berechnung');
  };

  const metrics = useMemo(() => {
    if (!agents.length) return null;
    const bonuses = agents.map(a => calcBonus(a).netto);
    return {
      total:    agents.length,
      avgBonus: bonuses.reduce((s,x) => s+x, 0) / bonuses.length,
      pending:  agents.filter(a => a.status === 'offen').length,
      approved: agents.filter(a => a.status === 'freigegeben').length,
      totalBonus: bonuses.reduce((s,x) => s+x, 0),
    };
  }, [agents]);

  const filteredAgents = useMemo(() =>
    agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase())),
    [agents, search]
  );

  const proTeamAgents = useMemo(() =>
    agents.filter(a => calcProTeam(a).stufe > 0),
    [agents]
  );

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="app">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-logo">B</div>
          <div>
            <span className="nav-title">Baruti Bonus Tool</span>
            <span className="nav-sub">Invia Travel</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-user">
            <div className="avatar">{user.initials}</div>
            <div>
              <span className="nav-user-name">{user.name}</span>
              <span className="nav-user-role">{ROLE_LABELS[user.role]}</span>
            </div>
          </div>
          <button className="btn btn-icon" onClick={() => setUser(null)} title="Abmelden">
            <LogoutIcon />
          </button>
        </div>
      </nav>

      <div className="main">
        {/* Tabs */}
        <div className="tabs">
          {[
            { id: 'upload',     icon: <UploadIcon />,   label: 'Daten laden' },
            { id: 'berechnung', icon: <TableIcon />,    label: 'Berechnung' },
            { id: 'proTeam',    icon: <StarIcon />,     label: 'Pro-Team Bonus' },
            { id: 'export',     icon: <DownloadIcon />, label: 'Export' },
          ].map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon}<span>{t.label}</span>
              {t.id === 'berechnung' && metrics?.pending > 0 && (
                <span className="tab-badge">{metrics.pending}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Upload Tab ── */}
        {tab === 'upload' && (
          <div className="tab-pane">
            <div className="grid-2">
              <div>
                <p className="section-label">Kennzahlen-File hochladen</p>
                <label
                  className={`upload-zone ${uploading ? 'loading' : ''}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                >
                  <input type="file" accept=".xlsx,.xls" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
                  <div className="upload-icon"><UploadIcon /></div>
                  {uploading
                    ? <p className="upload-text">Wird verarbeitet...</p>
                    : <>
                        <p className="upload-text">File hier ablegen oder klicken</p>
                        <p className="upload-sub">Invia Travel_BAR_Kennzahlen_MMYYYY.xlsx</p>
                      </>
                  }
                </label>
                {fileInfo && (
                  <div className="status-bar status-ok">
                    <CheckIcon />
                    <span><strong>{fileInfo.name}</strong> · {fileInfo.count} Agenten · {fileInfo.ts}</span>
                  </div>
                )}
                <div style={{ marginTop: '1rem' }}>
                  <button className="btn" onClick={loadDemo}>Demo-Daten laden (April 2026)</button>
                </div>
              </div>

              <div>
                <p className="section-label">Periode</p>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="field">
                    <label>Monat</label>
                    <select value={monat} onChange={e => setMonat(e.target.value)}>
                      {['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'].map(m => (
                        <option key={m}>{m} 2026</option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="section-label">Benutzer-Übersicht</p>
                <div className="card">
                  {Object.entries(USERS).map(([key, u]) => (
                    <div key={key} className="user-row">
                      <div className="avatar sm">{u.initials}</div>
                      <div className="user-info">
                        <span className="user-name">{u.name}</span>
                        <span className="user-role">{ROLE_LABELS[u.role]}</span>
                      </div>
                      {key === user.key && <span className="badge badge-ok">Aktiv</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Berechnung Tab ── */}
        {tab === 'berechnung' && (
          <div className="tab-pane">
            {!agents.length ? (
              <div className="empty-state">
                <AlertIcon />
                <p>Noch keine Daten geladen. Bitte zuerst ein Kennzahlen-File hochladen.</p>
              </div>
            ) : (
              <>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <span className="metric-label">Agenten gesamt</span>
                    <span className="metric-value">{metrics.total}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Ø Bonus / Agent</span>
                    <span className="metric-value">{fmtEur(metrics.avgBonus)}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Gesamtbonus</span>
                    <span className="metric-value">{fmtEur(metrics.totalBonus)}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Ausstehend</span>
                    <span className="metric-value warn">{metrics.pending}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Freigegeben</span>
                    <span className="metric-value ok">{metrics.approved}</span>
                  </div>
                </div>

                <div className="table-toolbar">
                  <input className="search" placeholder="Name suchen..." value={search} onChange={e => setSearch(e.target.value)} />
                  <span className="table-count">{filteredAgents.length} von {agents.length}</span>
                </div>

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th><th>Skill</th><th>Prod.Std</th><th>LQ</th>
                        <th>SIMO</th><th>Bonus Total</th><th>Payroll-Nr.</th>
                        <th>HO/Office</th><th>Fehltage</th><th>Verspät.</th>
                        <th>Bonus Netto</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgents.map(a => {
                        const b = calcBonus(a);
                        return (
                          <tr key={a.name} className={a.status === 'freigegeben' ? 'row-approved' : ''}>
                            <td className="td-name">{a.name}</td>
                            <td><SkillTag skill={a.skill} /></td>
                            <td>{fmt(a.pstd, 1)}</td>
                            <td>{fmt(a.lq, 1)}</td>
                            <td>{fmtPct(a.simo)}</td>
                            <td className="td-num">{fmtEur(b.total)}</td>
                            <td>
                              <input className="cell-input" value={a.payroll} placeholder="—"
                                onChange={e => updateAgent(a.name, 'payroll', e.target.value)}
                                disabled={!canEdit} />
                            </td>
                            <td>
                              <select className="cell-select" value={a.ho}
                                onChange={e => updateAgent(a.name, 'ho', e.target.value)}
                                disabled={!canEdit}>
                                <option>Office</option>
                                <option>Home Office</option>
                              </select>
                            </td>
                            <td>
                              <input className="cell-input num" type="number" min="0" max="30"
                                value={a.fehltage}
                                onChange={e => updateAgent(a.name, 'fehltage', +e.target.value)}
                                disabled={!canEdit} />
                            </td>
                            <td>
                              <input className="cell-input num" type="number" min="0" max="10"
                                value={a.verspaetung}
                                onChange={e => updateAgent(a.name, 'verspaetung', +e.target.value)}
                                disabled={!canEdit} />
                            </td>
                            <td className={`td-num ${b.netto < 0 ? 'neg' : ''}`}>{fmtEur(b.netto)}</td>
                            <td>
                              {canEdit ? (
                                <button
                                  className={`btn-status ${a.status === 'freigegeben' ? 'approved' : 'pending'}`}
                                  onClick={() => toggleStatus(a.name)}>
                                  {a.status === 'freigegeben' ? '✓ Freigabe' : 'Freigabe'}
                                </button>
                              ) : <StatusBadge status={a.status} />}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Pro-Team Tab ── */}
        {tab === 'proTeam' && (
          <div className="tab-pane">
            {!agents.length ? (
              <div className="empty-state"><AlertIcon /><p>Noch keine Daten geladen.</p></div>
            ) : (
              <>
                <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className="metric-card">
                    <span className="metric-label">Qualifizierte Agenten</span>
                    <span className="metric-value">{proTeamAgents.length}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Pro-Team Bonus gesamt</span>
                    <span className="metric-value">{fmtEur(proTeamAgents.reduce((s,a) => s + calcProTeam(a).bonus, 0))}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Ziele-Kriterien</span>
                    <span className="metric-value" style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)' }}>SIMO ≥85% / LQ ≥42 / Shrink ≥88%</span>
                  </div>
                </div>

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th><th>Skill</th>
                        <th>SIMO <small>≥85%</small></th>
                        <th>LQ <small>≥42</small></th>
                        <th>Shrinkage <small>≥88%</small></th>
                        <th>Ziele</th><th>Stufe</th><th>Bonus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proTeamAgents.map(a => {
                        const pt = calcProTeam(a);
                        const Goal = ({ ok, val }) => (
                          <td className={ok ? 'goal-ok' : 'goal-no'}>
                            {ok ? '✓' : '✗'} <small>{val}</small>
                          </td>
                        );
                        return (
                          <tr key={a.name}>
                            <td className="td-name">{a.name}</td>
                            <td><SkillTag skill={a.skill} /></td>
                            <Goal ok={pt.simoOk}   val={fmtPct(a.simo)} />
                            <Goal ok={pt.lqOk}     val={fmt(a.lq, 1)} />
                            <Goal ok={pt.shrinkOk} val={fmtPct(pt.shrink)} />
                            <td style={{ fontWeight: 500 }}>{pt.ziele}</td>
                            <td>{(pt.stufe * 100).toFixed(0)}%</td>
                            <td className="td-num">{fmtEur(pt.bonus)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Export Tab ── */}
        {tab === 'export' && (
          <div className="tab-pane">
            <div className="grid-2">
              <div>
                <p className="section-label">XLSX exportieren</p>
                <div className="card">
                  <div className="field">
                    <label>Dateiname</label>
                    <input id="exp-fname" defaultValue={`${monat.replace(' ','_')}_Bonus_Invia_Travel.xlsx`} />
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Das Export-File enthält:
                    </p>
                    {['Haupttabelle (alphabetisch, mit Formeln)','Pro-Team-Spezial-Bonus Sheet','Parameter-Block (LQ / SIMO / KZB)','Hide-Sheet (Reiseschutz-Codes)'].map(l => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#3B6D11' }}><CheckIcon /></span>{l}
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                    disabled={!agents.length}
                    onClick={() => {
                      const fname = document.getElementById('exp-fname').value;
                      exportBonus(agents, monat, fname);
                    }}>
                    <DownloadIcon /> XLSX herunterladen
                  </button>
                  {!agents.length && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Erst Daten laden</p>}
                </div>
              </div>

              <div>
                <p className="section-label">Freigabe-Fortschritt</p>
                {agents.length > 0 && (
                  <div className="card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span>Freigabe-Status</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{metrics.approved}/{agents.length}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(metrics.approved/agents.length*100).toFixed(0)}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px' }}>
                      <span style={{ color: '#3B6D11' }}>{metrics.approved} freigegeben</span>
                      <span style={{ color: '#BA7517' }}>{metrics.pending} ausstehend</span>
                    </div>
                  </div>
                )}

                <p className="section-label">Änderungsprotokoll</p>
                <div className="card changelog">
                  {changelog.length === 0
                    ? <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Noch keine Änderungen</p>
                    : changelog.slice(0, 8).map((c, i) => (
                        <div key={i} className="log-row">
                          <span className="log-ts">{c.ts}</span>
                          <span className="log-user">{c.user}</span>
                          <span className="log-detail">{c.name} · {c.field}: {String(c.old)} → {String(c.new)}</span>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
