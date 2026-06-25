// Unit-Tests fuer die Ticketpreis-Logik (Node-eigener Test-Runner, node:test).
//
// Dieser Test ist das Sicherheitsnetz der Pipeline. Im "Build kaputtmachen"-
// Moment der Demo wird genau hier (oder in src/price.js) eine Regression
// eingebaut, sodass ein Test rot wird und der Deploy blockiert.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePrice, isOverlength } from '../src/price.js';

test('Normalpreis betraegt 12,00 Euro', () => {
  assert.equal(calculatePrice({ category: 'normal' }), 12.0);
});

test('Ermaessigter Preis betraegt 9,00 Euro', () => {
  assert.equal(calculatePrice({ category: 'ermaessigt' }), 9.0);
});

test('Kinderticket betraegt 7,00 Euro', () => {
  assert.equal(calculatePrice({ category: 'kind' }), 7.0);
});

test('Ueberlaenge-Zuschlag von 1,50 Euro wird addiert', () => {
  assert.equal(calculatePrice({ category: 'normal', overlength: true }), 13.5);
});

test('Standard ist Normalpreis ohne Zuschlag', () => {
  assert.equal(calculatePrice(), 12.0);
});

test('Unbekannte Kategorie wirft einen Fehler', () => {
  assert.throws(() => calculatePrice({ category: 'gold' }));
});

test('Ueberlaenge: Film ueber 120 Min. gilt als Ueberlaenge', () => {
  assert.equal(isOverlength(132), true);
});

test('Ueberlaenge: genau 120 Min. ist noch keine Ueberlaenge', () => {
  assert.equal(isOverlength(120), false);
});

test('Ueberlaenge: kurzer Film ist keine Ueberlaenge', () => {
  assert.equal(isOverlength(100), false);
});
