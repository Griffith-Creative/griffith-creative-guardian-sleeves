/**
 * The product spec block, verbatim from the client's spec sheet (Zachary, 2026-08-09).
 *
 * Single source of truth: the homepage and every PDP render this same array, so the
 * numbers cannot drift between pages. Order matches the client's sheet.
 * Labels are keyed to icons in SpecBlock.astro - rename one and add its icon there.
 */

export type Spec = { label: string; value: string };

export const productSpecs: Spec[] = [
  { label: 'Cut', value: '66×91.5mm' },
  { label: 'Box', value: '3.8×2.7in' },
  { label: 'Material', value: 'Polypropylene' },
  { label: 'Finish', value: 'Matte' },
  { label: 'Count', value: '120' },
];

/** One-line spec sentence for meta descriptions and JSON-LD. */
export const specSentence = '66×91.5mm cut. Polypropylene. Matte finish. 120 per pack.';
