// Judge.me reviews client (Widget API, public token).
// Runs at build time (baked into the PDPs) and again in the browser (so a new
// review shows without a redeploy). Same contract as getVariants() in
// lib/shopify.js: every function returns null on any failure and the caller
// keeps whatever it already has on the page.
//
// Requests are plain GETs with the token in the query string on purpose:
// api.judge.me answers CORS for simple requests but 404s the preflight that a
// custom header would trigger (verified 2026-09-28).

import { SHOPIFY_DOMAIN, SHOPIFY_PRODUCT_ID, JUDGEME_PUBLIC_TOKEN } from '../consts';

const ENDPOINT = 'https://api.judge.me/api/v1/widgets/product_review';
export const PER_PAGE = 5;

function endpoint(params) {
  const q = new URLSearchParams({
    api_token: JUDGEME_PUBLIC_TOKEN,
    shop_domain: SHOPIFY_DOMAIN,
    external_id: SHOPIFY_PRODUCT_ID,
    ...params,
  });
  return `${ENDPOINT}?${q}`;
}

async function get(params) {
  const res = await fetch(endpoint(params));
  if (!res.ok) throw new Error(`Judge.me HTTP ${res.status}`);
  return res.json();
}

// ─── Totals ───

const attr = (html, name) => {
  const m = html.match(new RegExp(`${name}=['"]([^'"]*)['"]`));
  return m ? m[1] : null;
};

// The default (HTML) form of the widget carries the totals as data attributes
// on its root and on each histogram row. Only those attributes are read; none
// of Judge.me's markup is ever put on the page.
export function parseSummary(html) {
  const average = Number(attr(html, 'data-average-rating'));
  const count = Number(attr(html, 'data-number-of-reviews'));
  if (!Number.isFinite(average) || !Number.isInteger(count) || count < 0) return null;

  const histogram = [5, 4, 3, 2, 1].map((star) => {
    const row = html.match(
      new RegExp(`data-rating=['"]${star}['"][^>]*data-frequency=['"](\\d+)['"]`),
    );
    return { star, count: row ? Number(row[1]) : 0 };
  });
  return { average, count, histogram };
}

// { average, count, histogram: [{ star, count }] } or null.
export async function getSummary() {
  try {
    const data = await get({ per_page: '1', page: '1' });
    if (typeof data?.widget !== 'string') return null;
    return parseSummary(data.widget);
  } catch {
    return null;
  }
}

// ─── Reviews ───

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

// Everything shown comes out as plain text. A store reply may arrive as HTML,
// so tags are dropped here and the result is only ever written as text.
function plain(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (e) => ENTITIES[e])
    .trim();
}

const isHttps = (url) => typeof url === 'string' && url.startsWith('https://');

// Judge.me's review object (shape captured from the live store 2026-09-29)
// mapped to the few fields the page shows. Returns null for anything that is
// not a usable review.
export function normalizeReview(r) {
  if (!r || typeof r !== 'object') return null;
  const rating = Number(r.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  const photos = (Array.isArray(r.pictures_urls) ? r.pictures_urls : [])
    .map((p) => ({ thumb: p?.small, full: p?.huge }))
    .filter((p) => isHttps(p.thumb) && isHttps(p.full));
  return {
    id: String(r.uuid ?? ''),
    rating,
    title: plain(r.title),
    body: plain(r.body),
    author: plain(r.reviewer_name) || 'Anonymous',
    date: typeof r.created_at === 'string' ? r.created_at : '',
    verified: r.verified_buyer === true,
    photos,
    reply: plain(r.reply_content),
  };
}

// { reviews, page, totalPages } or null.
export async function getReviewPage(page = 1) {
  try {
    const data = await get({ per_page: String(PER_PAGE), page: String(page), json_request: 'true' });
    if (!Array.isArray(data?.reviews)) return null;
    return {
      reviews: data.reviews.map(normalizeReview).filter(Boolean),
      page: Number(data.current_page) || page,
      totalPages: Number(data.total_pages) || 0,
    };
  } catch {
    return null;
  }
}

// Totals plus the first page: { average, count, histogram, reviews, totalPages } or null.
export async function getReviews() {
  const [summary, first] = await Promise.all([getSummary(), getReviewPage(1)]);
  if (!summary || !first) return null;
  return { ...summary, reviews: first.reviews, totalPages: first.totalPages };
}

// All 11 color pages share one product, so the build asks Judge.me once.
let once;
export const getReviewsOnce = () => (once ??= getReviews());

// ─── Display helpers (shared by the Astro components and scripts/reviews.js) ───

// Stars are drawn to the nearest half; the number beside them stays exact.
export const roundToHalf = (rating) => Math.round(Number(rating) * 2) / 2;

// Fill width (percent) of star number `position` (1-5) for a rating.
export function starFill(rating, position) {
  const shown = roundToHalf(rating);
  if (shown >= position) return 100;
  if (shown >= position - 0.5) return 50;
  return 0;
}

export const starsLabel = (rating) => `${Number(Number(rating).toFixed(1))} out of 5 stars`;

export const countLabel = (count) => `${count} ${count === 1 ? 'review' : 'reviews'}`;

// Bars are scaled to the most common rating, so the longest bar fills the row.
export function barWidth(count, histogram) {
  const max = Math.max(...histogram.map((h) => h.count), 1);
  return count > 0 ? Math.max(1, Math.round((count / max) * 100)) : 0;
}

const DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : DATE.format(d);
}

// Splits text into plain runs and email addresses so an address in a store
// reply can be rendered as a mailto link: [{ text }, { text, email: true }].
export function splitEmails(text) {
  const parts = [];
  const re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ text: m[0], email: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

// Five point star on a 24 grid (inner radius 0.45), same shape as the Figma frames.
export const STAR_PATH =
  'M12 0l3.174 7.631 8.239.661-6.277 5.377 1.917 8.039L12 17.4l-7.053 4.308 1.917-8.039L.587 8.292l8.239-.661z';
