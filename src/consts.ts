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
