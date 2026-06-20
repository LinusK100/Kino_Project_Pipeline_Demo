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
          <h2 class="title">${m.title}</h2>
          <p class="price">ab ${euro(m.price)}</p>
          <button class="btn">Tickets</button>
        </article>`
      )
      .join('');
  } catch {
    target.innerHTML = '<p class="loading">Programm konnte nicht geladen werden.</p>';
  }
}

loadMovies();
