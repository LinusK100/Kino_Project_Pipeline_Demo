// Holt das Kino-Programm vom Server und rendert die Filmkarten.
// Die UI kennt die Datenquelle (Stub oder echte DB) nicht — nur die API.

const euro = (n) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

async function loadMovies() {
  const target = document.querySelector('#movies');
  try {
    const res = await fetch('/api/movies');
    const { movies } = await res.json();
    target.innerHTML = movies
      .map(
        (m) => `
        <article class="card">
          <div class="card-head">
            <h2 class="title">${m.title}</h2>
            <span class="fsk">${m.ageRating}</span>
          </div>
          <p class="meta">${m.genre} · ${m.durationMinutes} Min.${
            m.overlength ? ' · <span class="tag">Überlänge</span>' : ''
          }</p>
          <p class="rating">★ ${m.rating.toFixed(1)}</p>
          <p class="price">ab ${euro(m.price)}</p>
          <button class="btn">Tickets</button>
        </article>`
      )
      .join('');
  } catch {
    target.innerHTML = '<p class="loading">Programm konnte nicht geladen werden.</p>';
  }
}

// Zeigt im Footer Version + Startzeit des laufenden Containers — nach einem
// Deploy aendern sich beide sichtbar (zusaetzlicher Beweis "neu ausgeliefert").
async function loadBuildInfo() {
  try {
    const res = await fetch('/api/health');
    const { version, startedAt } = await res.json();
    const v = String(version).slice(0, 7); // kurzer Commit-SHA, falls gesetzt
    const t = new Date(startedAt).toLocaleTimeString('de-DE');
    document.querySelector('#build').textContent =
      `CI/CD-Demo · Kino-Projekt · Version ${v} · Server gestartet ${t}`;
  } catch {
    /* Footer behaelt den statischen Text aus index.html */
  }
}

loadMovies();
loadBuildInfo();
