// Guardian Sleeves colorway catalog.
// The store is a SINGLE Shopify product with a "Color" option (see consts.ts);
// each colorway below is one variant of it. `optionValue` must match the Color
// value in Shopify exactly — that string is how the PDP resolves the live
// variant (price/availability) on load. `variantId` is the fallback rendered
// for SEO/no-JS, then reconfirmed live. When Zachary adds a color in Shopify,
// add a row here with its exact Color value and variant id.
import { PRODUCT_HANDLE } from '../consts';

export { PRODUCT_HANDLE };

export interface Colorway {
  slug: string; // URL segment under /products/
  name: string; // display name
  colorName: string; // short color label for the selector
  optionValue: string; // exact Shopify "Color" option value for this variant
  swatch: string; // hex for swatch dots (sampled from the open-box loose sleeve — the true matte color; Orange/Purple/Lilac lifted slightly to stay legible at dot size)
  variantId: string; // Shopify variant id for Add to Cart
  price: string; // fallback price, rendered for SEO/no-JS then refreshed live
  live: boolean; // buyable (all colors are live variants today)
}

const V = (id: string) => `gid://shopify/ProductVariant/${id}`;

export const COLORWAYS: Colorway[] = [
  { slug: 'guardian-black',      name: 'Guardian Black',       colorName: 'Black',       optionValue: 'Black',       swatch: '#0F0F10', variantId: V('51700666073383'), price: '10.99', live: true },
  { slug: 'guardian-white',      name: 'Guardian White',       colorName: 'White',       optionValue: 'White',       swatch: '#ECECEA', variantId: V('51700666106151'), price: '10.99', live: true },
  { slug: 'guardian-red',        name: 'Guardian Red',         colorName: 'Red',         optionValue: 'Red',         swatch: '#540B0B', variantId: V('51700666138919'), price: '10.99', live: true },
  { slug: 'guardian-green',      name: 'Guardian Green',       colorName: 'Green',       optionValue: 'Green',       swatch: '#104220', variantId: V('51700666171687'), price: '10.99', live: true },
  { slug: 'guardian-blue',       name: 'Guardian Blue',        colorName: 'Blue',        optionValue: 'Blue',        swatch: '#131F6A', variantId: V('51700666204455'), price: '10.99', live: true },
  { slug: 'guardian-orange',     name: 'Guardian Orange',      colorName: 'Orange',      optionValue: 'Orange',      swatch: '#C2531F', variantId: V('51700666237223'), price: '10.99', live: true },
  { slug: 'guardian-purple',     name: 'Guardian Purple',      colorName: 'Purple',      optionValue: 'Purple',      swatch: '#4B3A8C', variantId: V('51700666269991'), price: '10.99', live: true },
  { slug: 'guardian-pink',       name: 'Guardian Sakura Pink', colorName: 'Sakura Pink', optionValue: 'Sakura Pink', swatch: '#B66775', variantId: V('51700666302759'), price: '10.99', live: true },
  { slug: 'guardian-light-blue', name: 'Guardian Lake Blue',   colorName: 'Lake Blue',   optionValue: 'Lake Blue',   swatch: '#8AA2D7', variantId: V('51700666335527'), price: '10.99', live: true },
  { slug: 'guardian-teal',       name: 'Guardian Mint',        colorName: 'Mint',        optionValue: 'Mint',        swatch: '#28817C', variantId: V('51700666368295'), price: '10.99', live: true },
  { slug: 'guardian-magenta',    name: 'Guardian Lilac',       colorName: 'Lilac',       optionValue: 'Lilac',       swatch: '#9E7FC8', variantId: V('51700666401063'), price: '10.99', live: true },
];

// Product photos live at src/assets/images/products/<slug>/NN-<shot>.jpg and
// are globbed so adding a photo never requires touching code. Sorted by the
// numeric prefix, and the <shot> half of the filename is what names the view
// in alt text, so the gallery stays correct when the order differs by color
// (Black has no box front, Mint is still on the older set).
const photoModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/products/*/*.{jpg,jpeg,png}',
  { eager: true }
);

const SHOT_LABELS: Record<string, string> = {
  box: 'box front',
  sleeve: 'sleeve and sleeved card',
  front: 'front',
  angle: '3/4 angle',
  open: 'open box with sleeve',
  back: 'back',
};

export interface ProductPhoto {
  image: ImageMetadata;
  label: string;
}

export function photosFor(slug: string): ProductPhoto[] {
  return Object.keys(photoModules)
    .filter((path) => path.includes(`/products/${slug}/`))
    .sort()
    .map((path) => {
      const shot = path.split('/').pop()!.replace(/^\d+-/, '').replace(/\.\w+$/, '');
      return { image: photoModules[path].default, label: SHOT_LABELS[shot] ?? 'product' };
    });
}

// Catalog card images: one square box front per colorway, cropped so the box
// occupies the same fraction of every card. Mint still uses the older composite
// because the reshoot did not cover it, and Black has no box front at all.
const cardModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/cards/*.{jpg,jpeg,png}',
  { eager: true }
);

export function cardFor(slug: string): ImageMetadata | undefined {
  const path = Object.keys(cardModules).find((p) => p.endsWith(`/${slug}.jpg`));
  return path ? cardModules[path].default : photosFor(slug)[0]?.image;
}
