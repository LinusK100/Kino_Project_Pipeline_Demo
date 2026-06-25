# Kino-Demo — CI/CD Live-Demo (lokal)

Minimales Kino-Projekt für die Live-Demo des CI/CD-Vortrags:
**UI + Server-API + Daten-Stub**, containerisiert mit Docker, **lokal** per
GitHub Actions auf einen **Self-Hosted-Runner** ausgeliefert
(`docker compose up -d --build` → `http://localhost:8080`).
Kein externes Hosting, keine Server-Zugänge, keine Secrets nötig.

```bash
npm ci && npm start      # http://localhost:3000  ("Jetzt im Kino")
npm test                 # 14 Unit-Tests (Preislogik + Programm)
docker compose up -d --build   # App als Container auf http://localhost:8080
```

- **Einrichten & lokal deployen:** siehe [SETUP.md](SETUP.md)
- **Was du selbst tun musst:** siehe [NOCH-ZU-TUN.md](NOCH-ZU-TUN.md)
- **Demo-Ablauf (Drehbuch):** siehe [DEMO-RUNBOOK.md](DEMO-RUNBOOK.md)

Programmdaten: echtes Kinoprogramm aus dem CineTicket-Prototyp (in `src/db.js`).
Sichtbare Demo-Änderung: Filmtitel von Film 1 in `src/db.js`.
„Build kaputtmachen"-Stelle: Preislogik in `src/price.js` (Tests in
`test/price.test.js` und `test/db.test.js`).

> **Portabilität:** Für ein echtes Remote-Deployment würde nur der letzte
> Schritt ersetzt (Image in eine Registry pushen + per SSH auf einen Server
> ausrollen) und die nötigen Zugangsdaten als GitHub Secrets ergänzt — der
> Rest der Pipeline bleibt identisch.
