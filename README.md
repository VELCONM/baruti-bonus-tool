# Baruti Bonus Tool — Invia Travel

Webbasiertes Tool zur monatlichen Bonus-Berechnung für Invia Travel Agenten.

## Features

- 📂 **Kennzahlen-File hochladen** — BAR_Kennzahlen_MMYYYY.xlsx direkt parsen
- 🧮 **Automatische Berechnung** — LQ, SIMO, KZB, VK-Bonus, Pro-Team-Bonus
- ✏️ **Fehlende Werte eintragen** — Fehltage, Verspätungen, Payroll-Nr., HO/Office
- ✅ **Freigabe-Workflow** — Agent für Agent freigeben
- 📋 **Änderungsprotokoll** — wer hat was geändert
- 📥 **XLSX-Export** — fertiges Bonus-File mit Formeln

---

## Deployment auf Vercel (5 Minuten)

### Voraussetzungen
- GitHub-Account (kostenlos)
- Vercel-Account (kostenlos unter vercel.com)

### Schritt 1 — Repository anlegen
1. Gehe zu github.com → "New repository"
2. Name: `baruti-bonus-tool`
3. Diesen Projektordner hochladen (oder per Git push)

### Schritt 2 — Vercel verbinden
1. Gehe zu vercel.com → "New Project"
2. GitHub-Repo `baruti-bonus-tool` auswählen
3. Framework: **Create React App** (wird automatisch erkannt)
4. Klick auf **Deploy**
5. Nach ~2 Minuten läuft das Tool unter `baruti-bonus-tool.vercel.app`

### Schritt 3 — Benutzer einrichten
Öffne `src/users.js` und trage eure Teammitglieder ein:

```js
export const USERS = {
  mveliu: { password: "dein-passwort", name: "Muhamet Veliu", role: "admin", initials: "MV" },
  agashi: { password: "dein-passwort", name: "Arber Gashi",   role: "editor", initials: "AG" },
  // weitere Benutzer...
};
```

Rollen:
- `admin`  — alles (bearbeiten, freigeben, exportieren)
- `editor` — bearbeiten + exportieren
- `viewer` — nur lesen

Nach Änderungen in `users.js` einfach in GitHub pushen → Vercel deployt automatisch.

---

## Lokale Entwicklung

```bash
npm install
npm start
# → http://localhost:3000
```

## Build für Produktion

```bash
npm run build
# → /build Ordner, bereit für Vercel/Netlify/beliebigen Static Host
```

---

## Datensicherheit

- Alle Berechnungen laufen **im Browser** — keine Daten verlassen den Rechner
- Kennzahlen-Files werden nicht gespeichert oder übertragen
- Passwörter in `src/users.js` sind nur für einfachen Zugungsschutz gedacht
- Für erhöhte Sicherheit: Microsoft Azure AD Integration möglich (Folgeschritt)

---

## Monatlicher Workflow

1. Neues Kennzahlen-File `MMYYYY.xlsx` in SharePoint ablegen
2. Tool öffnen → "Daten laden" → File hochladen
3. Fehlende Werte eintragen (Fehltage, Verspätungen, Payroll-Nr.)
4. Agenten freigeben (✓)
5. XLSX exportieren → fertig

## Support

Bei Fragen oder Anpassungen: Muhamet Veliu (Baruti AG)
