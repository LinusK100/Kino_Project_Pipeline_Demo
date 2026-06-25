// "Datenbank" des Kino-Projekts — hier bewusst als In-Memory-Stub.
//
// Die Filmdaten stammen aus dem CineTicket-Prototyp
// (cineticket-prototyp/src/mocks/data/seed.ts): echte Kinotitel mit Metadaten
// (Genre, Laufzeit, FSK, Bewertung). In der echten Architektur (siehe
// docker-compose.yml) waere das ein eigener DB-Container; fuer die Live-Demo
// halten wir es als Stub, damit nichts Netzwerk-/Migrations-Bezogenes
// schiefgehen kann. Die UI bekommt diese Daten AUSSCHLIESSLICH ueber die API
// des Servers (/api/movies) — sie kennt die Datenquelle nicht. Das ist
// Information Hiding in klein.

import { calculatePrice, isOverlength } from './price.js';

// Das aktuelle Kino-Programm (Quelle: CineTicket-Prototyp). Der Filmtitel von
// Eintrag 1 ist die "sichtbare Aenderung" in der Demo (siehe DEMO-RUNBOOK.md).
const MOVIES = [
  { id: 1, title: 'Venom: The Last Dance — Directors Cut', genres: ['Action', 'Sci-Fi'], durationMinutes: 109, ageRating: 'FSK 12', rating: 6.8 },
  { id: 2, title: 'Der wilde Roboter', genres: ['Animation', 'Familie'], durationMinutes: 102, ageRating: 'FSK 0', rating: 8.4 },
  { id: 3, title: 'Smile 2', genres: ['Horror', 'Mystery'], durationMinutes: 132, ageRating: 'FSK 16', rating: 7.0 },
  { id: 4, title: 'Deadpool & Wolverine', genres: ['Action', 'Komödie'], durationMinutes: 128, ageRating: 'FSK 16', rating: 7.7 },
  { id: 5, title: 'Vaiana 2', genres: ['Animation', 'Familie'], durationMinutes: 100, ageRating: 'FSK 0', rating: 7.1 },
  { id: 6, title: 'Gladiator II', genres: ['Action', 'Drama'], durationMinutes: 148, ageRating: 'FSK 16', rating: 7.0 },
  { id: 7, title: 'Red One – Alarmstufe Weihnachten', genres: ['Action', 'Komödie'], durationMinutes: 123, ageRating: 'FSK 12', rating: 6.9 },
  { id: 8, title: 'Terrifier 3', genres: ['Horror', 'Thriller'], durationMinutes: 125, ageRating: 'FSK 18', rating: 7.0 },
];

// Vereinfachte Ableitung der Preiskategorie fuer die Demo: Filme ohne
// Altersbeschraenkung (FSK 0 = Familienfilme) laufen zum Kinderpreis, der Rest
// zum Normalpreis. ("Ermaessigt" ist ein Kunden- und kein Film-Merkmal und
// bleibt daher als Kategorie in price.js erhalten.)
function categoryFor(movie) {
  return movie.ageRating === 'FSK 0' ? 'kind' : 'normal';
}

/**
 * Liefert das aktuelle Kino-Programm inkl. berechnetem Ticketpreis.
 * @returns {{id:number,title:string,genre:string,durationMinutes:number,ageRating:string,rating:number,overlength:boolean,price:number}[]}
 */
export function getMovies() {
  return MOVIES.map((m) => {
    const overlength = isOverlength(m.durationMinutes);
    return {
      id: m.id,
      title: m.title,
      genre: m.genres.join(' · '),
      durationMinutes: m.durationMinutes,
      ageRating: m.ageRating,
      rating: m.rating,
      overlength,
      price: calculatePrice({ category: categoryFor(m), overlength }),
    };
  });
}
