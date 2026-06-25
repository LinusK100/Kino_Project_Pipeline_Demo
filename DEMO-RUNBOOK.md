# DEMO-RUNBOOK — Live-Demo CI/CD (Kino-Projekt, lokal)

Drehbuch für die Live-Demo im Vortrag. Eine einzige Kette, der das Publikum
folgt: **kleine sichtbare Änderung → commit → push → Pipeline (Test → Deploy) →
in der laufenden App sichtbar.** Danach der bewusste Fehlerfall.

Das Deployment läuft **lokal** auf deinem Rechner über einen
**Self-Hosted-Runner**; die App erscheint unter **`http://localhost:8080`**.
Kein Server, keine Secrets.

> Gesamtdauer: **~6–8 Minuten**. Die Pipeline läuft lokal meist **~1–2 Min.**
> (kein Registry-Push). Diese Wartezeit wird **mit Reden gefüllt** (Talking
> Points unten), nicht stumm abgewartet.

---

## 0. Vorbereitung VOR dem Vortrag (Setup einmalig: siehe SETUP.md)

Auf dem Bildschirm offen und vorbereitet:

- [ ] **Terminal 1 — Runner läuft:** im `actions-runner/`-Ordner `./run.sh`
      gestartet (zeigt „Listening for Jobs"). **Fenster offen lassen.**
- [ ] **Terminal 2 — Repo:** im Projektordner, auf `main`, sauberer Stand
      (`git status` leer, `git pull` gemacht).
- [ ] **Browser-Tab 1 — laufende App:** `http://localhost:8080`
      („Jetzt im Kino", Film 1 = *Venom: The Last Dance*).
- [ ] **Browser-Tab 2 — GitHub Actions:** Repo → Reiter **Actions**.
- [ ] **Browser-Tab 3 — GitHub Code/PR:** Repo-Startseite.
- [ ] **Editor** offen mit `src/db.js` und `src/price.js`.
- [ ] Schriftgröße in Terminal & Editor groß genug (Beamer!).
- [ ] **Generalprobe** (SETUP.md §7) am Vortag einmal grün durchgelaufen.
- [ ] **Fallback-Screenshots** griffbereit (Präsentations-Folien 17/18).

Einstiegssatz: *„Wir haben gerade die Pipeline Schritt für Schritt gebaut. Jetzt
zeige ich, dass sie wirklich läuft — von meiner Änderung bis zur laufenden App,
vollautomatisch. Das Deployment passiert hier lokal über einen eigenen Runner;
für einen echten Server würde sich nur der letzte Schritt ändern."*

---

## TEIL 1 — Happy Path: Änderung läuft automatisch live (~3–4 Min.)

### Schritt 1 — Ausgangszustand zeigen · *~20 s*
- **Bildschirm:** Tab 1 (App, `localhost:8080`), auf *Venom: The Last Dance* zeigen.
- **Sagen:** *„Das ist die laufende Version — echtes Kinoprogramm mit Genre,
  Länge, FSK und Bewertung, das der Server live liefert. Merkt euch den ersten
  Film. Diesen Titel ändere ich jetzt — und starte den Container danach mit
  keinem einzigen Handgriff selbst."*

### Schritt 2 — Branch anlegen · *~10 s*
- **Terminal 2:**
  ```bash
  git switch -c feature/filmtitel
  ```
- **Sagen:** *„Ich arbeite nicht direkt auf main, sondern auf einem Branch —
  genau das Trunk-/Feature-Branch-Thema von vorhin."*

### Schritt 3 — Sichtbare Änderung machen · *~30 s*
- **Editor:** `src/db.js`, Titel von Film 1 ändern, z. B.
  `'Venom: The Last Dance'` → `'Venom: The Last Dance — IMAX-Fassung'`.
- **Sagen:** *„Eine winzige, klar sichtbare Änderung. Wichtig: Der Titel kommt
  aus dem Server über die API — die UI kennt die Datenquelle gar nicht.
  Information Hiding in klein."*

### Schritt 4 — (optional) lokal testen · *~10 s*
- **Terminal 2:** `npm test` → kurz die grünen Haken zeigen.
- **Sagen:** *„Lokal schon grün. Aber verlassen will ich mich nicht darauf —
  das macht gleich die CI verbindlich für alle."*

### Schritt 5 — Commit & Push · *~20 s*
- **Terminal 2:**
  ```bash
  git commit -am "feat(ui): Filmtitel aktualisiert (KINO-42)"
  git push -u origin feature/filmtitel
  ```
- **Sagen:** *„Commit und push. Ab hier passiert alles automatisch."*

### Schritt 6 — Pull Request öffnen, CI beobachten · *~40–60 s*
- **Bildschirm:** Tab 3 → den vorgeschlagenen **PR öffnen**. Auf den
  laufenden Check **`test`** zeigen.
- **Sagen (während die CI läuft):** *„Das ist Continuous Integration: Bei jedem
  PR laufen automatisch `checkout`, `npm ci` und `npm test` — hier auf meinem
  eigenen Runner. `npm ci` installiert reproduzierbar aus dem Lockfile, nicht
  ‚läuft bei mir'. Der Merge-Button bleibt gesperrt, bis der Check grün ist:
  das ist Branch Protection, unser Qualitätstor."*
- **Warten** bis der Check **grün** ist.

### Schritt 7 — Mergen · *~10 s*
- **Bildschirm:** **Squash and merge** → bestätigen.
- **Sagen:** *„Jetzt ist die Änderung auf main. Und auf main heißt: ausliefern."*

### Schritt 8 — Pipeline auf main beobachten · *~1–2 Min.*
- **Bildschirm:** Tab 2 (**Actions**) → den neuen Lauf öffnen. Zwei Jobs
  nacheinander: **`test` → `deploy`**.
- **Sagen, Job für Job:**
  - bei **test:** *„Erst nochmal die volle Testsuite auf main — das Tor, bevor
    überhaupt deployt wird."*
  - bei **deploy:** *„`deploy` baut jetzt das Docker-Image und startet den
    Container neu — mit `docker compose up -d --build`, lokal auf diesem Rechner.
    Kein Hand-Deploy, keine Schneeflocke. Genau dieser eine Schritt würde für
    einen echten Server ausgetauscht; der Rest bliebe gleich."*
  - beim **Smoke-Test** (letzter Schritt in `deploy`): *„Und der Deploy prüft
    sich selbst: Er fragt die `/api/health`-API ab und wird nur grün, wenn der
    neue Container wirklich antwortet. Ein Container, der nicht hochkommt, macht
    den Deploy rot — statt eine kaputte App still auszuliefern."*
- **Realistische Dauer:** `test` ~30–40 s, `deploy` (Image-Build + Health-Check)
  ~30–60 s.

### Schritt 9 — Ergebnis live zeigen · *~20 s*
- **Bildschirm:** Tab 1 (App, `localhost:8080`) → **neu laden** (Hard-Reload, ⇧⌘R).
- **Sagen:** *„Und da ist der neue Titel — live. Vom Commit bis zur laufenden
  App: wenige Minuten, vollautomatisch. Das ist Continuous Delivery/Deployment."*
- **Optional zeigen:** Im Footer stehen jetzt eine neue **Version** (der
  Commit-SHA) und eine frische **Startzeit** — beweist, dass wirklich ein neuer
  Container ausgeliefert wurde, nicht nur der Browser-Cache.

---

## TEIL 2 — „Build kaputtmachen": das Sicherheitsnetz zeigen (~2–3 Min.)

> Ziel: Das Publikum sieht, dass ein roter Test den Deploy **verhindert**.

### Schritt 10 — Fehler einbauen · *~30 s*
- **Terminal 2:** `git switch -c fix/preis`
- **Editor:** `src/price.js`, `normal: 12.0` → `normal: 13.0` ändern.
- **Sagen:** *„Ich greife bewusst die Preislogik an — ein typisches Beispiel für
  hausgemachte Komplexität: ein Wert an einer Stelle geändert, der Rest erwartet
  noch den alten. Genau solche Regressionen soll die Pipeline abfangen."*

### Schritt 11 — Commit, Push, PR · *~30 s*
- **Terminal 2:**
  ```bash
  git commit -am "fix: Preis angepasst"
  git push -u origin fix/preis
  ```
- **Bildschirm:** PR öffnen.

### Schritt 12 — Roten Test zeigen · *~40–60 s*
- **Bildschirm:** Im PR / Actions zusehen, wie **`test` rot** wird
  (5 Tests schlagen fehl: 3 aus der Preislogik, 2 aus dem Programm — die
  Datenschicht ist mitgetestet). Auf den **gesperrten Merge-Button** zeigen.
- **Sagen:** *„Rot. Und der Merge ist gesperrt. Der kaputte Stand kommt nicht
  nach main — und damit startet der `deploy`-Job gar nicht erst."*

### Schritt 13 — Beweis: App unverändert · *~15 s*
- **Bildschirm:** Tab 1 (App, `localhost:8080`) neu laden → **nichts hat sich
  geändert**.
- **Sagen:** *„Die laufende App ist beim Alten — `deploy` ist nie gelaufen. Der
  rote Test ist kein Ärgernis, er ist das Feature: Er hält ein kaputtes Kino vom
  Live-Gang ab und hält main jederzeit lieferbar."*

### Schritt 14 — Fix → grün → Deploy · *~60 s*
- **Editor:** `normal: 13.0` → zurück auf `12.0`.
- **Terminal 2:** `git commit -am "fix: Preislogik korrigiert" && git push`
- **Bildschirm:** CI wird **grün** → PR **mergen** → `deploy` läuft →
  App neu laden, alles wieder normal.
- **Schlusssatz:** *„Grün, gemergt, deployed. Das ist der ganze Zyklus: Das
  Sicherheitsnetz hat gehalten, und der Weg zurück in die laufende App war
  genauso automatisch wie vorhin."*

---

## FALLBACK — wenn live etwas klemmt

**Auslöser:** kein WLAN, GitHub/Actions langsam, Runner nimmt keinen Job an,
Pipeline hängt > ~2 Min.

**Sofort umschalten auf (gestaffelt):**

0. **Lauf wiederholen / manuell starten (schnellster Griff):** Im **Actions**-Tab
   beim hängenden Lauf **„Re-run jobs"**, oder über **„Run workflow"**
   (`workflow_dispatch`) einen frischen Lauf auf dem Branch auslösen — ohne neuen
   Commit. Hilft, wenn der Runner einen Job verschluckt hat.

1. **Präsentations-Folien 17/18 (`[FALLBACK]`)** mit den vorbereiteten
   Screenshots — den exakt gleichen Ablauf daran erzählen. Reihenfolge =
   Schritte oben: App vorher → grüner PR-Check → Actions `test`/`deploy` grün →
   App nachher → roter Test + blockierter Merge.

2. **Fallback 1 — manuelles Deployment ohne Pipeline:**
   ```bash
   docker compose up -d --build
   ```
   Zeigt die deployte App auf `http://localhost:8080`. Dazu einen **vorab
   aufgenommenen Pipeline-Lauf** (Screenshots/Video) zeigen, um den
   automatischen Teil zu belegen.

3. **Fallback 2 — Pipeline offline mit `act`:**
   ```bash
   # self-hosted-Label auf ein act-Image mappen, nur den Test-Job ausführen:
   act -j test -P self-hosted=catthehacker/ubuntu:act-latest
   ```
   Braucht **kein** GitHub und kein Internet (nur Docker). Zeigt den Test-Job in
   der Konsole; für den sichtbaren Deploy danach Fallback 1.

**Goldene Regel:** Nie live debuggen. Beim ersten Hänger ruhig auf den Fallback
wechseln — die **eine Kernaussage** zählt, nicht die fehlerfreie Mechanik:
> *Eine kleine Änderung läuft automatisch und überprüft bis in die laufende App;
> ein roter Test stoppt sie.*
