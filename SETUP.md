# SETUP — Kino-Demo (CI/CD, lokal)

Minimales Kino-Projekt für die Live-Demo: eine **UI**, ein **Server mit API**
und ein **Daten-Stub** (statt eigener DB-Container), containerisiert per Docker.
Die Pipeline läuft über **GitHub Actions**, das Deployment passiert aber
**komplett lokal** auf eurem Rechner über einen **Self-Hosted-Runner** — es gibt
**kein externes Hosting, keine Server-Zugänge und keine Secrets**.

```
kino-demo/
├── src/
│   ├── server.js   # Node-Server (Standardbibliothek, keine Frameworks)
│   ├── price.js    # Ticketpreis-Logik  ← der "Build kaputtmachen"-Test trifft hier
│   └── db.js       # "Datenbank"-Stub (In-Memory), echtes Programm aus CineTicket
├── public/         # UI: index.html / app.js / styles.css ("Jetzt im Kino")
├── test/price.test.js          # Unit-Tests Preislogik (node --test)
├── test/db.test.js             # Unit-Tests Datenschicht/Programm
├── Dockerfile                  # baut das Image "kino-ui:local"
├── docker-compose.yml          # baut + startet den Container lokal (Port 8080)
└── .github/workflows/deploy.yml  # test → deploy (self-hosted, lokal)
```

---

## 1. Voraussetzungen

- **Node.js ≥ 20** (`node -v`) — das Projekt hat **keine** Laufzeit-Abhängigkeiten.
- **Docker + Docker Compose** lokal installiert und gestartet
  (`docker --version`, `docker compose version`).
- **Git** und ein **GitHub-Repository** mit aktivierten Actions.
- Das ist alles. **Kein** Server, **kein** Cloud-Account, **keine** Secrets.

---

## 2. Lokal starten (ohne Pipeline)

**Variante A — direkt mit Node:**
```bash
cd kino-demo
npm ci          # Abhängigkeiten aus dem Lockfile (hier: nur Node-Standard)
npm start       # Server auf http://localhost:3000
npm test        # 14 Unit-Tests, müssen grün sein
```

**Variante B — als Container (so wie der Deploy):**
```bash
docker compose up -d --build   # baut Image + startet Container
# → App auf http://localhost:8080
docker compose logs -f         # Logs ansehen
docker compose down            # wieder stoppen
```

Im Browser erscheint die Überschrift **„Jetzt im Kino"** mit drei Filmkarten,
deren Daten live von `/api/movies` kommen.

---

## 3. Pipeline lokal einrichten (Self-Hosted-Runner)

Damit `git push` die Pipeline auslöst und der Lauf in der GitHub-Actions-UI
sichtbar ist, registrierst du **einmalig** einen Self-Hosted-Runner auf deinem
Rechner. Er führt sowohl die Tests als auch das lokale Deployment aus.

### 3a. Repo anlegen und pushen
```bash
cd kino-demo
git init && git add -A && git commit -m "Initial: Kino-Demo (lokal)"
git branch -M main
git remote add origin https://github.com/<DEIN-USER>/kino-demo.git
git push -u origin main
```

### 3b. Self-Hosted-Runner registrieren
GitHub → Repo → **Settings → Actions → Runners → New self-hosted runner**.
GitHub zeigt dir die fertigen Befehle für dein Betriebssystem (macOS/Linux/Win),
inklusive **Download** und einem **Token**. Sinngemäß:

```bash
# 1. Runner-Paket herunterladen + entpacken (Befehle kommen von GitHub)
mkdir actions-runner && cd actions-runner
# curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/...
# tar xzf actions-runner.tar.gz

# 2. Registrieren (Token aus der GitHub-Seite einsetzen)
./config.sh --url https://github.com/<DEIN-USER>/kino-demo --token <TOKEN>
#   -> Labels mit Enter bestaetigen; "self-hosted" wird automatisch gesetzt

# 3. Runner starten (laeuft im Vordergrund; Fenster offen lassen)
./run.sh
```

> Der Workflow nutzt `runs-on: self-hosted` — er sucht sich also genau diesen
> Runner. Solange `./run.sh` läuft, nimmt er Jobs an.
>
> **Wichtig:** Der Runner-Rechner braucht **Node ≥ 20** und **Docker** auf dem
> PATH (beides hast du aus Schritt 1).

### 3c. (optional) Branch Protection auf `main`
Settings → **Branches → Add rule** für `main`:
- *Require a pull request before merging*
- *Require status checks to pass* → Check **`test`** auswählen.

Das ist der Hebel, der im "Build kaputtmachen"-Moment den Merge blockiert.
Für die reine Happy-Path-Demo nicht zwingend, für den Fehlerfall empfohlen.

### 3d. Erster Durchlauf
Den ersten Lauf hat bereits der Push aus 3a ausgelöst; er startet, sobald der
Runner aus 3b läuft. Im Reiter **Actions** läuft `test → deploy` durch — danach
ist die App unter **`http://localhost:8080`** erreichbar. Du musst hier nichts
erneut pushen.

> Ab jetzt ist `main` durch 3c geschützt: weitere Änderungen laufen über einen
> **Pull Request** (genau wie in der Demo), einen direkten `git push` auf `main`
> lehnt GitHub dann ab.

---

## 4. Secrets / Zugangsdaten

**Für den lokalen Betrieb sind keine Secrets nötig.** Es gibt keinen
Server-Login und kein Registry-Token. `.env` ist optional (nur der Port).

> **Konzept (für den Vortrag):** Würde man auf einen echten Server ausrollen,
> käme genau hier wieder Secrets-Handling ins Spiel — Server-Adresse, SSH-Key
> bzw. Registry-Token als **GitHub Secrets**. Das ändert nur den letzten
> Pipeline-Schritt, nicht den Rest.

---

## 5. Anzupassende Stellen (TODO-Marker)

| Datei | TODO |
|---|---|
| `docker-compose.yml` | Port `8080` ändern, falls belegt; optionaler DB-Container |
| `.github/workflows/deploy.yml` | nur für echtes Remote-Deployment: letzten Schritt ersetzen |
| `src/db.js` | bei Bedarf an echte DB statt Stub anbinden |

---

## 6. Fallback-Wege (wenn live etwas klemmt)

**Fallback 1 — manuelles Deployment ohne Pipeline:**
```bash
docker compose up -d --build   # App direkt lokal starten
```
Dazu einen **vorab aufgenommenen Pipeline-Lauf** (Screenshots/Video aus dem
Actions-Tab) zeigen, um den automatischen Teil zu belegen.

**Fallback 2 — Pipeline offline mit `act`:**
```bash
brew install act          # einmalig (macOS); sonst: https://github.com/nektos/act
# Das self-hosted-Label auf ein act-Runner-Image mappen (sonst findet act
# keinen Runner) und nur den Test-Job ausführen:
act -j test -P self-hosted=catthehacker/ubuntu:act-latest
```
`act` braucht **kein** GitHub und kein Internet (nur Docker) und zeigt den
Test-Job in der Konsole — ideal, falls das WLAN streikt. Der `deploy`-Job
(`docker compose`) ist unter `act` nur eingeschränkt nutzbar; für den
sichtbaren Deploy dann Fallback 1.

---

## 7. Vorab-Test des kompletten Durchlaufs (Tag vor dem Vortrag!)

**A — Lokal (1 Min.):**
```bash
npm ci && npm test                 # 14/14 grün
docker compose up -d --build       # App auf http://localhost:8080 prüfen
docker compose down
```

**B — Die Pipeline einmal echt durchlaufen lassen:**
1. `./run.sh` im Runner-Ordner starten.
2. Branch anlegen, Filmtitel in `src/db.js` ändern, committen, pushen, PR.
3. PR mergen → im **Actions**-Tab `test → deploy` grün durchlaufen sehen.
4. `http://localhost:8080` neu laden → geänderter Titel ist live.

**C — Den Fehlerfall einmal proben:**
1. In `src/price.js` `normal: 12.0` → `13.0` ändern, committen, PR öffnen.
2. Check **`test`** wird **rot**, Merge blockiert, **kein** Deploy.
3. Änderung zurücknehmen → grün → mergen → Deploy.

**D — Fallback proben:** einmal `docker compose up -d --build` von Hand und
einmal den `act`-Test-Job (Befehl aus §6) ausführen; Screenshots für die
Fallback-Folien (17/18) ziehen.

> **Faustregel:** Wenn A–C am Vortag einmal grün durchliefen, überrascht dich
> live nichts mehr.
