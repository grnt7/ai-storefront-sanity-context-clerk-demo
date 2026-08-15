/**
 * Seeds the Frame & Roll dataset: categories, brands, products (with images),
 * the Pack Guide agent config, and the Sanity Context document.
 *
 * Usage: npm run seed
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-03-03",
  token,
  useCdn: false,
});

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1400&q=80&auto=format&fit=crop`;

async function uploadImage(
  url: string,
  filename: string,
): Promise<{ _type: "image"; asset: { _type: "reference"; _ref: string } } | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const asset = await client.assets.upload("image", buffer, { filename });
    return {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    };
  } catch (err) {
    console.warn(`  ! image failed for ${filename}: ${String(err)}`);
    return undefined;
  }
}

const categories = [
  ["frame-bags", "Frame Bags", "Triangle and full-frame storage for gravel and MTB."],
  ["handlebar-bags", "Handlebar Bags", "Rolls, pockets, and harness systems up front."],
  ["seat-packs", "Seat Packs", "Wedge and cargo bags for the rear triangle."],
  ["panniers", "Panniers & Rack Bags", "Rack-mounted haulers for long tours."],
  ["hydration", "Hydration & Feed", "Stem bags, fork cages, and on-bike snacks."],
  ["accessories", "Accessories", "Dry sacks, repair rolls, and organizers."],
  ["urban-backpacks", "Urban Backpacks", "Commuter and daypack carry for city riders."],
] as const;

const brands = [
  ["gravel-works", "Gravel Works", "Rugged frame and handlebar bags for mixed terrain."],
  ["rack-route", "Rack & Route", "Panniers and rack systems built for loaded miles."],
  ["overnight-co", "Overnight Co.", "Ultralight seat packs and minimal overnight kits."],
  ["seal-stitch", "Seal & Stitch", "Fully welded waterproof bikepacking bags."],
  ["metro-line", "Metro Line", "Commuter backpacks built for bikes, trains, and desk days."],
] as const;

interface SeedProduct {
  id: string;
  title: string;
  sku: string;
  category: (typeof categories)[number][0];
  brand: (typeof brands)[number][0];
  price: number;
  compareAtPrice?: number;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured?: boolean;
  rating: number;
  reviewCount: number;
  short: string;
  description: string;
  features: string[];
  tags: string[];
  image: string; // Unsplash photo id (photo-{id})
}

/** Curated Unsplash images — one distinct bikepacking/cycling photo per product */
const PRODUCT_IMAGES = {
  "triangle-frame-3l": "1742451421711-9dd6b3816ead", // Bikepacking rig, frame bags visible
  "full-frame-6l": "1703269698600-a8e3cbaaee9a", // Fully loaded touring bike on gravel
  "bolt-top-tube-2l": "1421429167374-8fc8ab6d0f66", // Close-up bicycle cockpit / bars
  "handlebar-roll-15l": "1630450225954-c7cf1ae533f2", // Bikepacking on gravel road
  "aero-handlebar-8l": "1638121944685-e8c10a1dd47e", // Loaded bike in open field
  "harness-roll-12l": "1657100643310-1b15caf87f13", // Adventure bike leaned against wall
  "wedge-dry-8l": "1697475338645-57cc545fb3c2", // Close-up rear bag on bike
  "aero-wedge-5l": "1697475339098-c19882a3057e", // Silhouette, compact rear load
  "cargo-seat-14l": "1697475338985-3cac4ffbf7b6", // Silhouette, larger rear bag
  "front-rack-10l": "1761796995655-bef1f14fc8c3", // Cyclist with loaded bike + gear
  "rear-pannier-pair-40l": "1522545623436-1b4a9e14c6df", // Touring bike on adventure terrain
  "quick-release-saddle-22l": "1697475338842-2b2df5747d01", // Silhouette, saddle-bag setup
  "stem-feed-1l": "1675798227643-da319f8ee8f7", // Close-up handlebar / front-end work
  "fork-cage-750ml": "1727464996663-7f3488b2c5d9", // Bike with bottle on frame
  "dry-stuff-sack-5l": "1478131143081-80f7f84ca84d", // Ultralight waterproof shelter / dry gear
  "repair-roll": "1562615193-cbeef074a501", // Bicycle tools and gear laid out
  "metro-commuter-18l": "1541397436527-c5d6df584ce1", // Commuter with backpack at subway station
  "city-roll-top-22l": "1631798266508-34b3cdcb6509", // City cyclist past tall buildings
  "bike-rack-pack-24l": "1626947926675-9ac09f3e26d3", // Man on city bicycle
  "night-ride-16l": "1726350985882-63f16e454a8e", // Night city cycling
  "campus-daypack-20l": "1581468611910-5daa8a08a323", // Urban street with backpack
  "courier-pro-26l": "1715645973877-e0c3eab4eec1", // Pedestrian crossing with backpack
} as const satisfies Record<string, string>;

const products: SeedProduct[] = [
  {
    id: "triangle-frame-3l",
    title: "Triangle Frame Bag 3L",
    sku: "FRM-TRI-003",
    category: "frame-bags",
    brand: "gravel-works",
    price: 89,
    sizes: ["3L", "One Size"],
    colors: ["Black", "Olive"],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 312,
    short: "Snug triangle fit with one-handed zip access.",
    description:
      "A welded 3L triangle bag that fills dead space in the front triangle without rattling on washboard gravel. Internal divider, hose port for a bladder, and a reflective pull tab. Fits most medium and large hardtail and gravel frames.",
    features: ["Welded seam construction", "Hose port", "Internal divider", "No-rattle mounting"],
    tags: ["gravel", "frame-fit", "water-resistant", "beginner-friendly"],
    image: PRODUCT_IMAGES["triangle-frame-3l"],
  },
  {
    id: "full-frame-6l",
    title: "Full Frame Bag 6L",
    sku: "FRM-FUL-006",
    category: "frame-bags",
    brand: "gravel-works",
    price: 119,
    sizes: ["6L", "One Size"],
    colors: ["Slate", "Rust"],
    inStock: true,
    rating: 4.7,
    reviewCount: 198,
    short: "Maximum frame capacity for multi-day routes.",
    description:
      "Six liters of frame storage with a full-length zipper and soft-sided expansion panels. Carries a rain shell, tools, and a day of snacks without touching your water bottles. Best on XL gravel frames and hardtails with open triangles.",
    features: ["6L capacity", "Expansion panels", "Tool sleeve", "Reflective piping"],
    tags: ["multi-day", "capacity", "gravel", "touring"],
    image: PRODUCT_IMAGES["full-frame-6l"],
  },
  {
    id: "bolt-top-tube-2l",
    title: "Bolt-On Top Tube 2L",
    sku: "FRM-TOP-002",
    category: "frame-bags",
    brand: "overnight-co",
    price: 64,
    sizes: ["2L", "One Size"],
    colors: ["Black"],
    inStock: true,
    rating: 4.5,
    reviewCount: 144,
    short: "Phone, snacks, and a spare tube within reach.",
    description:
      "A low-profile top-tube bag with bolt-on mounts and a clear map pocket. Two liters — enough for ride food and a mini pump without crowding your knees on steep climbs.",
    features: ["Bolt-on mounts", "Map pocket", "U-lock loop", "Lightweight 95g"],
    tags: ["day-ride", "compact", "snacks", "navigation"],
    image: PRODUCT_IMAGES["bolt-top-tube-2l"],
  },
  {
    id: "handlebar-roll-15l",
    title: "Handlebar Roll 15L",
    sku: "HB-RLL-015",
    category: "handlebar-bags",
    brand: "seal-stitch",
    price: 149,
    sizes: ["15L", "One Size"],
    colors: ["Yellow", "Black"],
    inStock: false,
    rating: 4.6,
    reviewCount: 167,
    short: "Waterproof roll for sleeping kit. Restocking soon.",
    description:
      "A fully welded 15L handlebar roll with a harness that clears most drop-bar brake levers. Currently out of stock while we wait on the next production run — a crowd favorite for overnight bikepacking.",
    features: ["Fully welded waterproof", "Harness included", "Compression straps", "15L capacity"],
    tags: ["waterproof", "overnight", "sleep-system", "bikepacking"],
    image: PRODUCT_IMAGES["handlebar-roll-15l"],
  },
  {
    id: "aero-handlebar-8l",
    title: "Aero Handlebar Pocket 8L",
    sku: "HB-AER-008",
    category: "handlebar-bags",
    brand: "gravel-works",
    price: 99,
    sizes: ["8L", "One Size"],
    colors: ["Olive", "Charcoal"],
    inStock: true,
    featured: true,
    rating: 4.7,
    reviewCount: 223,
    short: "Streamlined front load that stays quiet on rough roads.",
    description:
      "An 8L aero pocket with a rigid back panel and quick-access side entry. Mounts to aerobars or a standard harness — ideal for a puffy, cook kit, or a day's worth of layers on fast gravel overnights.",
    features: ["Rigid back panel", "Side entry", "Harness compatible", "8L capacity"],
    tags: ["gravel", "aero", "overnight", "quiet-mount"],
    image: PRODUCT_IMAGES["aero-handlebar-8l"],
  },
  {
    id: "harness-roll-12l",
    title: "Harness Roll 12L",
    sku: "HB-HRN-012",
    category: "handlebar-bags",
    brand: "overnight-co",
    price: 79,
    sizes: ["12L", "One Size"],
    colors: ["Sand", "Black"],
    inStock: true,
    rating: 4.4,
    reviewCount: 89,
    short: "Simple roll-and-strap system for any bar setup.",
    description:
      "A minimalist 12L roll with a universal harness — no proprietary mounts, just straps that work on flat bars, drops, and carbon forks with clearance. Packs flat when empty.",
    features: ["Universal harness", "Packs flat", "12L capacity", "210D ripstop"],
    tags: ["minimalist", "versatile", "ultralight", "budget"],
    image: PRODUCT_IMAGES["harness-roll-12l"],
  },
  {
    id: "wedge-dry-8l",
    title: "Wedge Dry Seat Pack 8L",
    sku: "SEAT-WDG-008",
    category: "seat-packs",
    brand: "seal-stitch",
    price: 109,
    sizes: ["8L", "One Size"],
    colors: ["Black", "Orange"],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 401,
    short: "Welded waterproof wedge — our best-selling seat pack.",
    description:
      "An 8L welded wedge that mounts to your seatpost and rails without sway. Roll-top closure, internal stiffener, and a tail light loop. Keeps your spare layers dry through Pacific Northwest drizzle and desert dust storms alike.",
    features: ["Welded waterproof", "Roll-top", "Tail light loop", "Anti-sway mount"],
    tags: ["waterproof", "best-seller", "overnight", "all-weather"],
    image: PRODUCT_IMAGES["wedge-dry-8l"],
  },
  {
    id: "aero-wedge-5l",
    title: "Aero Wedge 5L",
    sku: "SEAT-AER-005",
    category: "seat-packs",
    brand: "overnight-co",
    price: 74,
    sizes: ["5L", "One Size"],
    colors: ["Charcoal"],
    inStock: true,
    rating: 4.5,
    reviewCount: 156,
    short: "Low-profile wedge for fast overnights and credit-card tours.",
    description:
      "Five liters in a slim profile that disappears behind your saddle. Just enough for a bivy, wind shell, and emergency calories — the pack we recommend for sub-24-hour routes and fast gravel camps.",
    features: ["Slim profile", "5L capacity", "142g", "Quick-release mount"],
    tags: ["fast-packing", "minimal", "overnight", "gravel"],
    image: PRODUCT_IMAGES["aero-wedge-5l"],
  },
  {
    id: "cargo-seat-14l",
    title: "Cargo Seat Pack 14L",
    sku: "SEAT-CRG-014",
    category: "seat-packs",
    brand: "gravel-works",
    price: 129,
    compareAtPrice: 159,
    sizes: ["14L", "One Size"],
    colors: ["Olive"],
    inStock: true,
    rating: 4.6,
    reviewCount: 112,
    short: "Big-volume rear storage — currently on sale.",
    description:
      "Fourteen liters of expandable seat-pack capacity with external lash points for a dry bag or sleeping pad. A bomber choice for week-long dirt tours when you need kitchen and sleep system off the handlebars.",
    features: ["14L expandable", "Lash points", "Roll + buckle closure", "Sale"],
    tags: ["multi-day", "capacity", "touring", "sale"],
    image: PRODUCT_IMAGES["cargo-seat-14l"],
  },
  {
    id: "front-rack-10l",
    title: "Front Rack Bag 10L",
    sku: "PAN-FRT-010",
    category: "panniers",
    brand: "rack-route",
    price: 119,
    sizes: ["10L", "One Size"],
    colors: ["Wax Tan", "Black"],
    inStock: true,
    rating: 4.5,
    reviewCount: 87,
    short: "Classic randonneur front load for low-rider racks.",
    description:
      "A 10L waxed canvas front bag with quick-release KLICKfix mounts. Keeps weight forward for stable handling on long paved tours — bread, maps, and a spare tube always within reach.",
    features: ["KLICKfix mounts", "Waxed canvas", "Map sleeve", "10L capacity"],
    tags: ["touring", "randonneur", "front-load", "classic"],
    image: PRODUCT_IMAGES["front-rack-10l"],
  },
  {
    id: "rear-pannier-pair-40l",
    title: "Rear Pannier Pair 40L",
    sku: "PAN-RR-040",
    category: "panniers",
    brand: "rack-route",
    price: 279,
    sizes: ["40L", "One Size"],
    colors: ["Black"],
    inStock: true,
    rating: 4.4,
    reviewCount: 64,
    short: "Bombproof double panniers for fully loaded expedition tours.",
    description:
      "Forty liters split across a matched pair — rigid back panels, welded seams, and rack hooks that survive cobbles and corrugated roads. Built for months on the road, not weekend gravel sprints.",
    features: ["40L pair", "Rigid back panels", "Welded seams", "Expedition-grade hooks"],
    tags: ["expedition", "touring", "heavy-load", "durable"],
    image: PRODUCT_IMAGES["rear-pannier-pair-40l"],
  },
  {
    id: "quick-release-saddle-22l",
    title: "Quick-Release Saddlebag 22L",
    sku: "PAN-QR-022",
    category: "panniers",
    brand: "rack-route",
    price: 189,
    sizes: ["22L", "One Size"],
    colors: ["Slate", "Olive"],
    inStock: true,
    featured: true,
    rating: 4.7,
    reviewCount: 131,
    short: "Rack-free rear hauler with car-camping capacity.",
    description:
      "Twenty-two liters mounted to a quick-release saddle rail system — no rear rack required. Transforms a gravel bike into a light tourer. Side pockets for tools, roll-top main compartment, and a shoulder strap for off-bike carry.",
    features: ["22L capacity", "No rack needed", "Shoulder strap", "Side tool pockets"],
    tags: ["gravel", "rack-free", "touring", "versatile"],
    image: PRODUCT_IMAGES["quick-release-saddle-22l"],
  },
  {
    id: "stem-feed-1l",
    title: "Stem Feed Bag 1L",
    sku: "HYD-STM-001",
    category: "hydration",
    brand: "overnight-co",
    price: 34,
    sizes: ["1L", "One Size"],
    colors: ["Blaze", "Black", "Olive"],
    inStock: true,
    rating: 4.8,
    reviewCount: 520,
    short: "Gels, bars, and a phone — right at your fingertips.",
    description:
      "The stem bag everyone puts on every build. One liter, drawcord closure, insulated liner option, and a stiff opening that stays open while you ride. Our single best-selling accessory.",
    features: ["Drawcord top", "Insulated liner", "Stiff opening", "1L capacity"],
    tags: ["snacks", "best-seller", "accessory", "everyday"],
    image: PRODUCT_IMAGES["stem-feed-1l"],
  },
  {
    id: "fork-cage-750ml",
    title: "Fork Bottle Cage Bag 750ml",
    sku: "HYD-FRK-075",
    category: "hydration",
    brand: "gravel-works",
    price: 42,
    sizes: ["750ml", "One Size"],
    colors: ["Black"],
    inStock: true,
    rating: 4.3,
    reviewCount: 98,
    short: "Extra water or stove fuel on fork-mounted cages.",
    description:
      "A 750ml insulated sleeve that straps to standard fork cage mounts. Carry a third bottle, a fuel canister, or a compact cook system without frame bag real estate.",
    features: ["Insulated sleeve", "Fork cage mount", "750ml", "Drain grommet"],
    tags: ["hydration", "fork-mount", "cooking", "ultralight"],
    image: PRODUCT_IMAGES["fork-cage-750ml"],
  },
  {
    id: "dry-stuff-sack-5l",
    title: "Dry Stuff Sack Set 5L",
    sku: "ACC-DRY-005",
    category: "accessories",
    brand: "seal-stitch",
    price: 38,
    sizes: ["5L", "One Size"],
    colors: ["Yellow"],
    inStock: true,
    rating: 4.6,
    reviewCount: 211,
    short: "Three welded dry sacks for organized bikepacking.",
    description:
      "A set of three welded 5L dry sacks in high-vis yellow — electronics, sleep clothes, and first aid each get their own waterproof home inside any frame or handlebar bag.",
    features: ["Set of 3", "Welded seams", "5L each", "High-vis"],
    tags: ["organization", "waterproof", "accessory", "value"],
    image: PRODUCT_IMAGES["dry-stuff-sack-5l"],
  },
  {
    id: "repair-roll",
    title: "Repair Roll Organizer",
    sku: "ACC-RPR-001",
    category: "accessories",
    brand: "gravel-works",
    price: 29,
    sizes: ["One Size"],
    colors: ["Black"],
    inStock: true,
    rating: 4.7,
    reviewCount: 178,
    short: "Tools, tubes, and tire levers — rolled and ready.",
    description:
      "A fold-out organizer with elastic loops for multi-tools, tire levers, patches, and a spare tube. Slides into any frame bag or wedge so you stop digging for the CO2 inflator at dusk.",
    features: ["Elastic loops", "Fits any frame bag", "Fold-out layout", "29g"],
    tags: ["tools", "organization", "repair", "essential"],
    image: PRODUCT_IMAGES["repair-roll"],
  },
  {
    id: "metro-commuter-18l",
    title: "Metro Commuter 18L",
    sku: "URB-MET-018",
    category: "urban-backpacks",
    brand: "metro-line",
    price: 98,
    sizes: ["18L", "One Size"],
    colors: ["Black", "Navy"],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 267,
    short: "Padded laptop sleeve and U-lock loop for daily rides.",
    description:
      "An 18L commuter pack with a suspended laptop sleeve, ventilated back panel, and a dedicated U-lock strap. Slim enough for crowded trains, tough enough for year-round bike commutes. Reflective pulls and a sternum strap keep you visible and stable in traffic.",
    features: ["15\" laptop sleeve", "U-lock strap", "Ventilated back panel", "Reflective pulls"],
    tags: ["commuter", "laptop", "city", "everyday"],
    image: PRODUCT_IMAGES["metro-commuter-18l"],
  },
  {
    id: "city-roll-top-22l",
    title: "City Roll Top 22L",
    sku: "URB-ROL-022",
    category: "urban-backpacks",
    brand: "metro-line",
    price: 109,
    sizes: ["22L", "One Size"],
    colors: ["Charcoal", "Rust"],
    inStock: true,
    rating: 4.7,
    reviewCount: 184,
    short: "Welded roll-top that shrugs off rain on wet city streets.",
    description:
      "A 22L welded roll-top with a magnetic sternum clip and side bottle pockets. Expands for gym gear or groceries, cinches down for a light laptop-and-lunch load. The pack we recommend when your commute outlasts the forecast.",
    features: ["Welded roll-top", "Magnetic sternum clip", "Side bottle pockets", "22L capacity"],
    tags: ["waterproof", "commuter", "weatherproof", "versatile"],
    image: PRODUCT_IMAGES["city-roll-top-22l"],
  },
  {
    id: "bike-rack-pack-24l",
    title: "Bike Rack Pack 24L",
    sku: "URB-RCK-024",
    category: "urban-backpacks",
    brand: "metro-line",
    price: 119,
    sizes: ["24L", "One Size"],
    colors: ["Olive", "Black"],
    inStock: true,
    rating: 4.6,
    reviewCount: 142,
    short: "Clips to a rear rack, converts to a shoulder bag off the bike.",
    description:
      "Twenty-four liters that mount to a standard rear rack with quick-release hooks, then detach into a shoulder bag for the office. Internal organizer, rain cover included, and a low center of gravity so your city bike stays predictable with a full load.",
    features: ["Rack quick-release", "Shoulder carry mode", "Rain cover", "24L capacity"],
    tags: ["rack-mount", "commuter", "convertible", "city"],
    image: PRODUCT_IMAGES["bike-rack-pack-24l"],
  },
  {
    id: "night-ride-16l",
    title: "Night Ride 16L",
    sku: "URB-NGT-016",
    category: "urban-backpacks",
    brand: "metro-line",
    price: 89,
    sizes: ["16L", "One Size"],
    colors: ["Black"],
    inStock: false,
    rating: 4.5,
    reviewCount: 96,
    short: "360° reflectivity for late-shift commutes — restocking soon.",
    description:
      "A compact 16L pack wrapped in 360° reflective panels and a blinky light loop. Just enough for a change of clothes, wallet, and keys on night rides home. Currently out of stock while we wait on the next reflective fabric run.",
    features: ["360° reflectivity", "Tail light loop", "16L capacity", "Compact profile"],
    tags: ["reflective", "night-ride", "commuter", "visibility"],
    image: PRODUCT_IMAGES["night-ride-16l"],
  },
  {
    id: "campus-daypack-20l",
    title: "Campus Daypack 20L",
    sku: "URB-CMP-020",
    category: "urban-backpacks",
    brand: "metro-line",
    price: 79,
    compareAtPrice: 99,
    sizes: ["20L", "One Size"],
    colors: ["Sand", "Forest"],
    inStock: true,
    rating: 4.4,
    reviewCount: 203,
    short: "Light daypack for campus hops and short city rides — on sale.",
    description:
      "Twenty liters of simple organization: front zip pocket, internal tablet sleeve, and mesh side pockets for a water bottle. Light enough to forget on your back between lectures and light enough to ride with all afternoon.",
    features: ["Tablet sleeve", "Front organizer", "Mesh side pockets", "Sale"],
    tags: ["daypack", "campus", "lightweight", "sale"],
    image: PRODUCT_IMAGES["campus-daypack-20l"],
  },
  {
    id: "courier-pro-26l",
    title: "Courier Pro 26L",
    sku: "URB-CRR-026",
    category: "urban-backpacks",
    brand: "metro-line",
    price: 129,
    sizes: ["26L", "One Size"],
    colors: ["Black", "Wax Tan"],
    inStock: true,
    featured: true,
    rating: 4.7,
    reviewCount: 118,
    short: "Insulated main compartment for delivery shifts and long commutes.",
    description:
      "A 26L messenger-inspired pack with an insulated main compartment, cross-body stabilizer strap, and a quick-access phone pocket at the chest. Built for couriers and power commuters who need hot food, cold groceries, or a full work kit on one route.",
    features: ["Insulated compartment", "Cross-body stabilizer", "Chest phone pocket", "26L capacity"],
    tags: ["courier", "insulated", "commuter", "capacity"],
    image: PRODUCT_IMAGES["courier-pro-26l"],
  },
];

const AGENT_SYSTEM_PROMPT = `You are the Pack Guide, the shopping assistant for Frame & Roll, a bikepacking, adventure bags, and urban commuter carry store.

## Your capabilities
- Search bags by mount type, capacity, price, features, or riding style
- Compare products and make honest recommendations for gravel, MTB, touring, and city commuter setups
- Answer questions about availability, capacity (sizes field), and waterproofing
- Look up the signed-in shopper's own orders when they are signed in

## How to respond
- Always use available tools to look up real content — never guess or make up products
- Combine hard filters (price, capacity in sizes, inStock) with semantic ranking in a single GROQ query when the shopper mixes constraints with vibes (e.g. "waterproof seat pack under $120")
- Be warm, brief, and practical — like a seasoned bikepacker at the trailhead, not a salesperson
- When recommending, lead with one best pick and explain why in a sentence
- Say "out of stock" ONLY when a product exists and its inStock field is false. If we do not carry an item at all, say we don't carry it — never call it out of stock
- If nothing matches, say so honestly and suggest the closest alternative
- Guests can chat without signing in. If they ask about their orders but are not signed in, tell them to use the Sign in button in the site header — never invent order details`;

const CONTEXT_INSTRUCTIONS = `Product catalog notes:
- price is a number in USD. A product is on sale when compareAtPrice > price.
- sizes is an array of strings — capacity uses liter labels like "3L", "8L", "15L"; some items also include "One Size". Filter with: "8L" in sizes.
- Availability: filter inStock == true by default; only surface out-of-stock items when the shopper asks.
- category and brand are references. Filter via category->slug.current == "seat-packs". Category slugs: frame-bags, handlebar-bags, seat-packs, panniers, hydration, accessories, urban-backpacks.
- urban-backpacks are off-bike daypacks and commuter packs (laptop sleeves, roll-tops, rack-mount convertibles) — not frame or handlebar bags. Route city riders and transit commuters there.
- For comfort/vibe/use-case language ("waterproof", "overnight gravel", "fast packing"), combine hard filters with semantic ranking in ONE query:
  *[_type == "product" && price < 120 && "8L" in sizes && inStock] | score(text::semanticSimilarity("waterproof seat pack overnight")) | order(_score desc) { _id, _type, title, price }[0...5]
- Always project _id and _type so products can be rendered as cards.
- rating (0-5) and reviewCount indicate popularity; description holds the richest text for semantic matching.`;

/** Legacy Trailhead catalog IDs — removed before seeding bikepacking data */
const LEGACY_IDS = [
  "category.hiking-boots",
  "category.trail-runners",
  "category.backpacks",
  "category.jackets",
  "category.tents-shelters",
  "category.camp-trail",
  "brand.cairn-supply-co",
  "brand.north-fork",
  "brand.switchback",
  "brand.ember-pine",
  "product.ridgeline-mid",
  "product.mosswalker-low",
  "product.granite-peak-pro",
  "product.summit-ridge-gtx",
  "product.creekside-leather",
  "product.featherline-trail-runner",
  "product.scree-dancer",
  "product.wayfarer-45",
  "product.daybreak-22",
  "product.portage-65",
  "product.stormline-shell",
  "product.ember-down-jacket",
  "product.windrow-fleece",
  "product.two-pines-tent",
  "product.solo-fly-tarp",
  "product.ember-stove-kit",
  "product.enamel-cook-set",
  "product.timberline-poles",
  "agent-config.trail-guide",
];

async function run() {
  console.log(`Seeding ${projectId}/${dataset}…`);

  for (const id of LEGACY_IDS) {
    try {
      await client.delete(id);
      console.log(`  − removed legacy ${id}`);
    } catch {
      // Document may not exist on fresh datasets
    }
  }

  const tx = client.transaction();

  for (const [slug, title, description] of categories) {
    tx.createOrReplace({
      _id: `category.${slug}`,
      _type: "category",
      title,
      slug: { _type: "slug", current: slug },
      description,
    });
  }

  for (const [slug, title, description] of brands) {
    tx.createOrReplace({
      _id: `brand.${slug}`,
      _type: "brand",
      title,
      slug: { _type: "slug", current: slug },
      description,
    });
  }

  console.log("• categories and brands queued");

  for (const p of products) {
    console.log(`• ${p.title}`);
    const image = await uploadImage(unsplash(p.image), `${p.id}.jpg`);
    tx.createOrReplace({
      _id: `product.${p.id}`,
      _type: "product",
      title: p.title,
      slug: { _type: "slug", current: p.id },
      sku: p.sku,
      shortDescription: p.short,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      sizes: p.sizes,
      colors: p.colors,
      inStock: p.inStock,
      featured: p.featured ?? false,
      rating: p.rating,
      reviewCount: p.reviewCount,
      features: p.features,
      tags: p.tags,
      category: { _type: "reference", _ref: `category.${p.category}` },
      brand: { _type: "reference", _ref: `brand.${p.brand}` },
      ...(image ? { image } : {}),
    });
  }

  tx.createOrReplace({
    _id: "agent-config.pack-guide",
    _type: "agent.config",
    name: "Pack Guide",
    slug: { _type: "slug", current: "pack-guide" },
    systemPrompt: AGENT_SYSTEM_PROMPT,
  });

  tx.createOrReplace({
    _id: "agent-context.storefront",
    _type: "sanity.agentContext",
    name: "Pack Guide Storefront",
    slug: { _type: "slug", current: "storefront" },
    groqFilter: '_type in ["product", "category", "brand"]',
    instructions: CONTEXT_INSTRUCTIONS,
  });

  await tx.commit();

  console.log("\nDone. Seeded:");
  console.log(`  ${categories.length} categories, ${brands.length} brands`);
  console.log(`  ${products.length} products`);
  console.log("  1 agent.config (pack-guide)");
  console.log("  1 sanity.agentContext (storefront)");
  console.log("\nNext steps:");
  console.log("  1. npx sanity schema deploy");
  console.log(
    `  2. Set SANITY_CONTEXT_MCP_URL=https://api.sanity.io/v2026-03-03/context/mcp/${projectId}/${dataset}/storefront?embeddings=true`,
  );
  console.log("  3. Set AGENT_CONFIG_SLUG=pack-guide in .env.local");
  console.log("  4. npm run dev and open http://localhost:3000");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
