// "Datenbank" des Kino-Projekts — hier bewusst als In-Memory-Stub.
//
// In der echten Architektur (siehe docker-compose.yml) waere das ein eigener
// DB-Container. Fuer die Live-Demo halten wir es als Stub, damit nichts
// Netzwerk-/Migrations-Bezogenes schiefgehen kann. Die UI bekommt diese Daten
// AUSSCHLIESSLICH ueber die API des Servers (/api/movies) — sie kennt die
// Datenquelle nicht. Das ist Information Hiding in klein.

import { calculatePrice } from './price.js';

// Das Kino-Programm. Der Filmtitel von Eintrag 1 ist die "sichtbare Aenderung"
// in der Demo (siehe DEMO-RUNBOOK.md, Happy Path).
const MOVIES = [
  { id: 1, title: 'Dune: Part Two', category: 'normal', overlength: true },
  { id: 2, title: 'Findet Nemo', category: 'kind', overlength: false },
  { id: 3, title: 'Oppenheimer', category: 'normal', overlength: true },
];

/**
 * Liefert das aktuelle Kino-Programm inkl. berechnetem Ticketpreis.
 * @returns {{id: number, title: string, price: number}[]}
 */
export function getMovies() {
  return MOVIES.map((m) => ({
    id: m.id,
    title: m.title,
    price: calculatePrice({ category: m.category, overlength: m.overlength }),
  }));
}
