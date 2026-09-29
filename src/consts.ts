// ─── Store inbox ───
// Contact and wholesale forms compose an email to this address in the
// visitor's mail app. Zoho alias on Zachary's mailbox, live 2026-09-02.
export const STORE_EMAIL = 'contact@guardiansleeves.com';

// ─── Shopify Storefront API ───
// The Storefront access token is PUBLIC by design (it ships in browser code).
// Generate it in Shopify admin: Settings → Apps → Develop apps → your app →
// Storefront API → Install → copy the "Storefront API access token".
// Always the myshopify host: guardiansleeves.com points at this site, not Shopify.
export const SHOPIFY_DOMAIN = 'yqu4fd-pn.myshopify.com';
export const SHOPIFY_API_VERSION = '2026-01';
export const SHOPIFY_STOREFRONT_TOKEN = 'b8367d54e68f8ad30ad0e816b09187dc';

// The store sells ONE Shopify product ("Guardian Sleeves") with a single
// "Color" option — every colorway is a variant of it, not its own product.
// data/products.ts maps each color to its variant id; the PDP refreshes price
// and availability live from Shopify so admin edits reflect without a redeploy.
export const PRODUCT_HANDLE = 'guardian-sleeves-black';
export const PRODUCT_OPTION_NAME = 'Color';
// Numeric Shopify id of that one product. Reviews are keyed to it, so every
// color page shares the same pool of reviews.
export const SHOPIFY_PRODUCT_ID = '10137212158247';

// ─── Judge.me reviews (Free plan) ───
// Reviews are collected and stored by Judge.me; this site reads them through
// the Widget API and renders them itself (lib/reviews.js).
// The PUBLIC token is made for browser code. It can only read widgets
// (verified 2026-09-28: private endpoints answer 403 with it).
// Judge.me admin: Settings → Integrations → View API tokens.
export const JUDGEME_PUBLIC_TOKEN = 'TC9lw-hYGyA2tsFws7Gp8OYM2qc';
// Hosted review form for the product, opened by "Write a review".
// Judge.me admin: Settings → Request reviews → Links, QR codes and point of
// sale review collection → the link for "Guardian Sleeves".
// The build stops while this is empty so the button can never ship dead.
export const JUDGEME_REVIEW_URL = '';
