// Ticketpreis-Berechnung — eine "tiefe Module" mit ganz einfacher Schnittstelle.
//
// Bewusst EINE Quelle der Wahrheit (DRY): Es gibt nur diese eine Stelle, an der
// ein Preis entsteht. Keine kopierte Preislogik in der UI oder im Server.
// Genau solche "hausgemachte" (accidental) Komplexitaet faengt der Unit-Test in
// test/price.test.js ab — und damit auch der "Build kaputtmachen"-Moment der Demo.

export const BASE_PRICES = {
  normal: 12.0, // Standardticket
  ermaessigt: 9.0, // Schueler, Studierende
  kind: 7.0, // bis 12 Jahre
};

export const OVERLENGTH_SURCHARGE = 1.5; // Zuschlag fuer Ueberlaenge (> 150 Min.)

/**
 * Berechnet den Ticketpreis fuer eine Vorstellung.
 * @param {{category?: string, overlength?: boolean}} opts
 * @returns {number} Preis in Euro, auf zwei Nachkommastellen gerundet
 */
export function calculatePrice({ category = 'normal', overlength = false } = {}) {
  const base = BASE_PRICES[category];
  if (base === undefined) {
    throw new Error(`Unbekannte Preiskategorie: ${category}`);
  }
  const price = base + (overlength ? OVERLENGTH_SURCHARGE : 0);
  return Math.round(price * 100) / 100;
}
