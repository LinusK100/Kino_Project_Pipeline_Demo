// Unit-Tests fuer die Datenschicht (das Kino-Programm aus src/db.js).
//
// Sichert zu, dass aus den echten Filmdaten (CineTicket) korrekte Preise
// entstehen. Auch diese Tests gehen im "Build kaputtmachen"-Moment rot, wenn
// die Preislogik veraendert wird — die Pipeline schuetzt also Daten UND Logik.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMovies } from '../src/db.js';

test('Programm enthaelt alle acht Filme', () => {
  assert.equal(getMovies().length, 8);
});

test('Jeder Film hat Titel, Genre und einen positiven Preis', () => {
  for (const m of getMovies()) {
    assert.ok(m.title.length > 0, `Titel fehlt: ${JSON.stringify(m)}`);
    assert.ok(m.genre.length > 0, `Genre fehlt: ${m.title}`);
    assert.ok(m.price > 0, `Preis nicht positiv: ${m.title}`);
  }
});

test('Venom (FSK 12, 109 Min.) kostet den Normalpreis 12,00 Euro', () => {
  const venom = getMovies().find((m) => m.title.startsWith('Venom'));
  assert.equal(venom.price, 12.0);
});

test('Familienfilm (FSK 0) laeuft zum Kinderpreis 7,00 Euro', () => {
  const family = getMovies().find((m) => m.ageRating === 'FSK 0');
  assert.equal(family.price, 7.0);
});

test('Ueberlaengen-Film (Gladiator II, 148 Min.) bekommt den Zuschlag (13,50 Euro)', () => {
  const long = getMovies().find((m) => m.title === 'Gladiator II');
  assert.equal(long.overlength, true);
  assert.equal(long.price, 13.5);
});
