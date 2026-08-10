/**
 * Retailer data for the Find Us page.
 *
 * The Mapbox token used on the map is read from `import.meta.env.PUBLIC_MAPBOX_TOKEN`.
 * That token is a development-only key - rotate it and add URL restrictions in
 * the Mapbox dashboard before public launch.
 */

export type Retailer = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  lat: number;
  lng: number;
  url?: string;
  phone?: string;
};

export const retailers: Retailer[] = [
  {
    id: 'shipwrecked',
    name: 'Shipwrecked Collectibles',
    address: '31660 Grape St Ste C',
    city: 'Lake Elsinore',
    state: 'CA',
    postalCode: '92532',
    lat: 33.6616378,
    lng: -117.2964809,
    url: 'https://shipwreckedcollectibles.com',
    phone: '(951) 399-3218',
  },
  {
    id: 'hungry-dragon',
    name: 'The Hungry Dragon',
    address: '24620 Jefferson Ave Ste A',
    city: 'Murrieta',
    state: 'CA',
    postalCode: '92562',
    lat: 33.5610420,
    lng: -117.2101533,
    url: 'https://thehungrydragongames.com',
    phone: '(951) 698-7399',
  },
  {
    id: 'elite-games-fallbrook',
    name: 'Elite Games',
    address: '131 W Beech St',
    city: 'Fallbrook',
    state: 'CA',
    postalCode: '92028',
    lat: 33.3785690,
    lng: -117.2522440,
  },
  {
    id: 'sanctum',
    name: 'Sanctum Comics Games & Cards',
    address: '26489 Ynez Rd Suite A',
    city: 'Temecula',
    state: 'CA',
    postalCode: '92591',
    lat: 33.5216179,
    lng: -117.1587182,
    url: 'https://www.sanctumcgc.com',
    phone: '(951) 296-6600',
  },
  {
    id: 'rizo-murrieta',
    name: 'Rizo Sports & TCG - Murrieta',
    address: '40165 Murrieta Hot Springs Rd Unit B',
    city: 'Murrieta',
    state: 'CA',
    postalCode: '92563',
    lat: 33.5554164,
    lng: -117.1708279,
    url: 'https://rizosportsllc.com',
    phone: '(951) 319-6788',
  },
  {
    id: 'rizo-riverside',
    name: 'Rizo Sports & TCG - Riverside',
    address: '5225 Canyon Crest Dr Ste 16',
    city: 'Riverside',
    state: 'CA',
    postalCode: '92507',
    lat: 33.9564665,
    lng: -117.3298018,
    url: 'https://rizosportsllc.com',
    phone: '(951) 462-1001',
  },
  {
    id: 'hobby-legends',
    name: 'Hobby Legends Card Shop',
    address: '1277 W Central Ave',
    city: 'Brea',
    state: 'CA',
    postalCode: '92821',
    lat: 33.9319600,
    lng: -117.9172160,
    url: 'https://hobbylegends.com',
    phone: '(714) 582-2584',
  },
  {
    id: 'jjs-collectibles',
    name: "JJ's Collectibles",
    address: '11893 Valley View St',
    city: 'Garden Grove',
    state: 'CA',
    postalCode: '92845',
    lat: 33.7895526,
    lng: -118.0285816,
    phone: '(714) 750-6162',
  },
  {
    id: 'hidden-collectibles',
    name: 'Hidden Collectibles',
    address: '3505 E Chapman Ave Suite C',
    city: 'Orange',
    state: 'CA',
    postalCode: '92869',
    lat: 33.7878594,
    lng: -117.8158552,
  },
  {
    id: 'sugoi-stuff',
    name: 'Sugoi Stuff! Hobbies and Collectibles',
    address: '7441 Garden Grove Blvd Ste G',
    city: 'Garden Grove',
    state: 'CA',
    postalCode: '92841',
    lat: 33.7737861,
    lng: -117.9865299,
    phone: '(714) 643-7740',
  },
  {
    id: 'atomic-comics',
    name: 'Atomic Comics',
    address: '11414 Artesia Blvd Ste A',
    city: 'Artesia',
    state: 'CA',
    postalCode: '90701',
    lat: 33.8729003,
    lng: -118.0905940,
    phone: '(562) 319-7572',
  },
  {
    id: 'tier-1-games',
    name: 'Tier 1 Games',
    address: '27250 Madison Ave Unit D',
    city: 'Temecula',
    state: 'CA',
    postalCode: '92590',
    lat: 33.5259550,
    lng: -117.1670586,
    url: 'https://tier1games.com',
    phone: '(951) 694-8437',
  },
];

/**
 * Shops Zachary has lined up but has not stocked yet (his 2026-08-09 list, which
 * gave names only). Addresses below were looked up and cross-checked against at
 * least two public listings each; his spellings were "S rank", "Flat earth games
 * b", "Oddasy" and "Crazy nicks". Odyssey Games sits well outside the Riverside
 * and Orange County cluster, so it was held back until Jacob confirmed it.
 *
 * Still missing: the shop he wrote as "Chronical", which matches nothing findable.
 *
 * Same shape as Retailer so the cards render identically to the live ones. They
 * stay off the map on purpose: a pin reads as "buy here today", which is not
 * true yet. Move an entry into `retailers` above the day it starts stocking.
 */
export const upcomingRetailers: Retailer[] = [
  {
    id: 's-rank-games',
    name: 'S Rank Games',
    address: '2448 S Vineyard Ave Ste 101',
    city: 'Ontario',
    state: 'CA',
    postalCode: '91761',
    lat: 34.0290190,
    lng: -117.6127800,
    url: 'https://s-rankgames.com',
    phone: '(909) 773-1933',
  },
  {
    id: 'flat-earth-games',
    name: 'Flat Earth Games',
    address: '12125 Day St Ste K407',
    city: 'Moreno Valley',
    state: 'CA',
    postalCode: '92557',
    lat: 33.9449750,
    lng: -117.2812690,
    phone: '(951) 992-8710',
  },
  {
    id: 'odyssey-games',
    name: 'Odyssey Games',
    address: '1795 E Colorado Blvd',
    city: 'Pasadena',
    state: 'CA',
    postalCode: '91106',
    lat: 34.1462460,
    lng: -118.1133260,
    phone: '(626) 817-9522',
  },
  {
    id: 'krazy-nicks',
    name: "Krazy Nick's Games",
    address: '13327 Artesia Blvd',
    city: 'Cerritos',
    state: 'CA',
    postalCode: '90703',
    lat: 33.8743010,
    lng: -118.0479930,
    phone: '(562) 991-5487',
  },
];
