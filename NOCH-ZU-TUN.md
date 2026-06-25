# Noch zu tun — deine Schritte bis zur laufenden (lokalen) Live-Demo

Diese Datei listet **alles auf, was du selbst machen musst**, damit die Demo am
Vortragstag funktioniert. Das Deployment läuft **komplett lokal** auf deinem
Rechner — **kein Server, kein Hosting, keine Secrets**.

Platzhalter in den Befehlen ersetzen:
- `<DEIN-USER>` = deine GitHub-Org bzw. dein GitHub-User
- `<TOKEN>` = das Registrierungs-Token, das GitHub dir beim Anlegen des Runners zeigt

---

## Schritt 0 — Voraussetzungen prüfen *(2 Min.)*

- [ ] **Node ≥ 20:** `node -v`
- [ ] **Docker läuft:** `docker --version && docker compose version`
- [ ] **Git** + GitHub-Account vorhanden

> Mehr braucht es nicht. Es gibt keinen externen Server und keine Zugangsdaten —
> das Deployment läuft vollständig auf deinem eigenen Rechner.

---

## Schritt 1 — Demo-Projekt als GitHub-Repo anlegen *(5 Min.)*

```bash
cd kino-demo
git init
git add -A
git commit -m "Initial: Kino-Demo (lokal)"
git branch -M main
git remote add origin https://github.com/<DEIN-USER>/kino-demo.git
git push -u origin main
```

**So prüfst du es:** Auf GitHub liegen alle Dateien; im Reiter **Actions**
erscheint der Workflow „CI/CD Kino" (er bleibt zunächst *in der Warteschlange*,
bis in Schritt 2 ein Runner läuft).

---

## Schritt 2 — Self-Hosted-Runner registrieren & starten *(8 Min.)*

Der Runner ist dein Rechner. Er führt Tests **und** das lokale Deployment aus.

1. GitHub → Repo → **Settings → Actions → Runners → New self-hosted runner**.
2. Betriebssystem wählen (macOS / Linux / Windows) — GitHub zeigt fertige
   Download- und Konfig-Befehle **inkl. Token**. Sinngemäß:
   ```bash
   mkdir actions-runner && cd actions-runner
   # die curl-/tar-Zeile von der GitHub-Seite hier einfügen (laedt den Runner)

   ./config.sh --url https://github.com/<DEIN-USER>/kino-demo --token <TOKEN>
   #   -> alle Abfragen mit Enter bestaetigen (Label "self-hosted" ist automatisch)

   ./run.sh
   #   -> Fenster OFFEN lassen: solange es laeuft, nimmt der Runner Jobs an
   ```

**So prüfst du es:** Unter Settings → Actions → Runners steht dein Runner auf
**„Idle"** (grün). Der in Schritt 1 wartende Workflow startet jetzt von selbst.

> **Wichtig:** Der Runner-Rechner braucht **Node ≥ 20** und **Docker** auf dem
> PATH (hast du aus Schritt 0). `runs-on: self-hosted` im Workflow sucht genau
> diesen Runner.

---

## Schritt 3 — (empfohlen) Branch Protection auf `main` *(3 Min.)*

GitHub → Repo → **Settings → Branches → Add rule** für `main`:
- [ ] **Require a pull request before merging**
- [ ] **Require status checks to pass before merging** → Check **`test`** wählen
      (erscheint, sobald der Workflow einmal lief)

**Warum:** Das sperrt im „Build kaputtmachen"-Moment den Merge. Für den reinen
Happy-Path nicht zwingend, für den Fehlerfall-Teil der Demo nötig.

**So prüfst du es:** In einem Test-PR ist der Merge-Button gesperrt, solange der
`test`-Check läuft oder rot ist.

---

## Schritt 4 — Ersten Durchlauf prüfen *(2 Min.)*

Du musst hier **nichts pushen**: Der erste Lauf wurde bereits durch den Push aus
Schritt 1 ausgelöst und startet, sobald der Runner läuft (Schritt 2).

Im Reiter **Actions** den Lauf öffnen → `test → deploy` sollten **beide grün**
werden.

**So prüfst du es:** **`http://localhost:8080`** im Browser öffnen → die Kino-App
mit „Jetzt im Kino" erscheint. `docker compose ps` zeigt den Container `kino-ui`.

> Ab jetzt ist `main` durch die Branch Protection (Schritt 3) geschützt: weitere
> Änderungen laufen über einen **Pull Request** — genau wie in der Demo. Einen
> direkten `git push` auf `main` lehnt GitHub dann ab.

---

## Schritt 5 — Generalprobe (am Tag VOR dem Vortrag) *(15 Min.)*

Spiele den kompletten Demo-Ablauf einmal durch (Details: `DEMO-RUNBOOK.md`):

- [ ] **Lokal:** `npm ci && npm test` → 14/14 grün; `docker compose up -d --build`
      → `http://localhost:8080` prüfen; `docker compose down`.
- [ ] **Happy Path:** `./run.sh` läuft → Branch → Filmtitel in `src/db.js`
      ändern → commit/push → PR → `test` grün → mergen → `deploy` grün →
      `http://localhost:8080` neu laden, neuer Titel ist live.
- [ ] **Fehlerfall:** Branch → in `src/price.js` `normal: 12.0` → `13.0` → PR →
      `test` **rot**, Merge gesperrt, App unverändert → zurückändern → grün →
      mergen → Deploy.
- [ ] **Fallbacks proben:** einmal `docker compose up -d --build` von Hand,
      einmal den `act`-Test-Job (Befehl aus `SETUP.md §6`).

---

## Schritt 6 — Fallback-Screenshots erstellen *(10 Min.)*

Für die Fallback-Folien **17/18** der Präsentation aus der Generalprobe
Screenshots ziehen — in dieser Reihenfolge:

1. App **vorher** (alter Filmtitel) auf `http://localhost:8080`
2. **grüner PR-Check** `test`
3. **Actions-Lauf** mit grünem `test` und `deploy`
4. App **nachher** (neuer Filmtitel)
5. **roter Test** + **gesperrter Merge-Button**

Diese Bilder ersetzen in den Folien 17/18 die Platzhalter
(siehe `CICD_Praesentation/README.md`).

---

## Troubleshooting (häufige Stolpersteine)

| Symptom | Ursache | Lösung |
|---|---|---|
| Workflow bleibt „Queued / Waiting" | kein Runner aktiv | `./run.sh` starten; Runner muss „Idle" sein (Schritt 2) |
| `test` rot: *npm: command not found* | Node fehlt auf dem Runner-Rechner | Node ≥ 20 installieren (Schritt 0) |
| `deploy` rot: *docker: command not found* | Docker fehlt/nicht gestartet | Docker Desktop starten (Schritt 0) |
| App nicht unter `:8080` erreichbar | Port belegt / Container down | Port in `docker-compose.yml` ändern; `docker compose ps` / `logs` |
| Merge-Button **nicht** gesperrt | Branch Protection fehlt | Schritt 3 nachholen, Check `test` wählen |
| Live kein Internet/GitHub | — | Fallback: `act -j test -P self-hosted=…` (offline) + `docker compose up -d --build` (siehe SETUP.md §6) |
| `git push origin main` abgelehnt | Branch Protection aktiv (gewollt) | Änderung über einen **Pull Request** mergen, nicht direkt pushen |

---

## Kurz-Checkliste (zum Abhaken)

- [ ] 0. Node + Docker laufen
- [ ] 1. Repo gepusht
- [ ] 2. Self-Hosted-Runner registriert & `./run.sh` läuft („Idle")
- [ ] 3. (empfohlen) Branch Protection auf `main` (Check `test`)
- [ ] 4. Erster Durchlauf grün, App auf `http://localhost:8080`
- [ ] 5. Generalprobe (Happy Path + Fehlerfall + Fallbacks)
- [ ] 6. Fallback-Screenshots in Folien 17/18

> **Kein** Server einrichten, **kein** SSH-Key, **keine** Secrets — all das ist
> mit der lokalen Variante weggefallen.
