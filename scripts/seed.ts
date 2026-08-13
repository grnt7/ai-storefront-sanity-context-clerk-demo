/**
 * Seeds the Trailhead dataset: categories, brands, products (with images),
 * the Trail Guide agent config, and the Sanity Context document.
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
  ["hiking-boots", "Hiking Boots", "Ankle support and grip for rough trails."],
  ["trail-runners", "Trail Runners", "Light, fast footwear for moving quick."],
  ["backpacks", "Backpacks", "Daypacks to expedition haulers."],
  ["jackets", "Jackets", "Shells, insulation, and layers."],
  ["tents-shelters", "Tents & Shelters", "Homes for the backcountry."],
  ["camp-trail", "Camp & Trail", "Stoves, cookware, poles, and essentials."],
] as const;

const brands = [
  ["cairn-supply-co", "Cairn Supply Co.", "Footwear built for long miles."],
  ["north-fork", "North Fork", "Packs and shelters since forever."],
  ["switchback", "Switchback", "Technical layers that breathe."],
  ["ember-pine", "Ember & Pine", "Camp comfort, cast iron to down."],
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
  image: string; // unsplash photo id
}

const products: SeedProduct[] = [
  {
    id: "ridgeline-mid",
    title: "Ridgeline Mid Hiking Boot",
    sku: "BOOT-RDG-001",
    category: "hiking-boots",
    brand: "cairn-supply-co",
    price: 169,
    sizes: ["8", "9", "10", "10.5", "11", "12"],
    colors: ["Moss", "Slate"],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 412,
    short: "Broken-in comfort straight out of the box.",
    description:
      "The Ridgeline Mid is the boot we recommend when someone says comfy. A plush cushioned midsole, a roomy toe box, and a soft padded collar mean zero break-in period — it feels like your favorite sneakers with real trail grip. Waterproof leather upper, aggressive lug outsole, and mid-height ankle support for loaded day hikes and light backpacking.",
    features: [
      "Zero break-in comfort",
      "Waterproof full-grain leather",
      "Cushioned EVA midsole",
      "Roomy toe box",
      "Vibram outsole",
    ],
    tags: ["comfortable", "waterproof", "day-hiking", "beginner-friendly"],
    image: "1520639888713-7851133b1ed0",
  },
  {
    id: "mosswalker-low",
    title: "Mosswalker Low",
    sku: "BOOT-MSW-002",
    category: "hiking-boots",
    brand: "cairn-supply-co",
    price: 139,
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["Sand", "Charcoal"],
    inStock: true,
    rating: 4.6,
    reviewCount: 288,
    short: "A soft, flexible low-cut for easy trails.",
    description:
      "Soft and forgiving, the Mosswalker Low is a lightweight low-cut hiker for well-kept trails and travel days. Flexible sole, breathable mesh panels, and a snug heel cup. Not for heavy loads — for comfortable, easy miles.",
    features: [
      "Ultra-lightweight",
      "Breathable mesh",
      "Flexible sole",
      "Recycled laces",
    ],
    tags: ["comfortable", "lightweight", "summer", "casual"],
    image: "1606890658317-7d14490b76fd",
  },
  {
    id: "granite-peak-pro",
    title: "Granite Peak Pro",
    sku: "BOOT-GRP-003",
    category: "hiking-boots",
    brand: "cairn-supply-co",
    price: 189,
    sizes: ["8", "9", "10", "10.5", "11", "12"],
    colors: ["Granite"],
    inStock: false,
    rating: 4.7,
    reviewCount: 197,
    short: "Plush support for big-mile days. Restocking soon.",
    description:
      "A crowd favorite for comfort on long-distance hikes — cushioned like a trail runner but supportive like a boot. Currently out of stock while we wait on the next production run.",
    features: [
      "Cushioned ride",
      "Waterproof membrane",
      "Shock-absorbing heel",
    ],
    tags: ["comfortable", "long-distance", "waterproof"],
    image: "1533240332313-0db49b459ad6",
  },
  {
    id: "summit-ridge-gtx",
    title: "Summit Ridge GTX",
    sku: "BOOT-SMT-004",
    category: "hiking-boots",
    brand: "north-fork",
    price: 249,
    sizes: ["8", "9", "10", "11", "12"],
    colors: ["Slate", "Rust"],
    inStock: true,
    rating: 4.5,
    reviewCount: 156,
    short: "A stiff alpine boot for technical terrain.",
    description:
      "Built for scree fields, snow crossings, and heavy packs. The Summit Ridge GTX is deliberately stiff — a mountaineering-adjacent boot with a rigid shank, full rand, and crampon compatibility. Expect a break-in period; this one prioritizes protection over plushness.",
    features: [
      "Rigid alpine shank",
      "Crampon-compatible",
      "Full rubber rand",
      "Gore-Tex lined",
    ],
    tags: ["technical", "alpine", "winter", "waterproof"],
    image: "1553545985-1e0d8781d5db",
  },
  {
    id: "creekside-leather",
    title: "Creekside Leather Boot",
    sku: "BOOT-CRK-005",
    category: "hiking-boots",
    brand: "ember-pine",
    price: 199,
    compareAtPrice: 229,
    sizes: ["8", "9", "10", "11"],
    colors: ["Chestnut"],
    inStock: true,
    rating: 4.4,
    reviewCount: 121,
    short: "Classic full-grain leather, built to outlast you.",
    description:
      "A heritage-style boot in full-grain leather with a stitched-down sole. Gets better with every season — after the classic leather break-in. Resoleable, restorable, and handsome enough for town.",
    features: [
      "Full-grain leather",
      "Resoleable construction",
      "Brass hardware",
    ],
    tags: ["heritage", "durable", "town-to-trail"],
    image: "1542840410-3092f99611a3",
  },
  {
    id: "featherline-trail-runner",
    title: "Featherline Trail Runner",
    sku: "RUN-FTH-001",
    category: "trail-runners",
    brand: "cairn-supply-co",
    price: 129,
    sizes: ["7", "8", "9", "10", "10.5", "11", "12"],
    colors: ["Ash", "Blaze"],
    inStock: true,
    featured: true,
    rating: 4.7,
    reviewCount: 340,
    short: "Marshmallow-soft cushioning at race weight.",
    description:
      "Maximum cushion, minimum weight. The Featherline pairs a marshmallow-soft midsole with a grippy, mud-shedding outsole. The most comfortable way to move fast on trail — many hikers size up and wear these instead of boots all summer.",
    features: [
      "Max-cushion midsole",
      "230g per shoe",
      "Mud-shedding lugs",
      "Wide fit available",
    ],
    tags: ["comfortable", "lightweight", "running", "summer"],
    image: "1539185441755-769473a23570",
  },
  {
    id: "scree-dancer",
    title: "Scree Dancer",
    sku: "RUN-SCR-002",
    category: "trail-runners",
    brand: "switchback",
    price: 145,
    sizes: ["8", "9", "10", "11"],
    colors: ["Ember"],
    inStock: true,
    rating: 4.3,
    reviewCount: 98,
    short: "Precise, sticky, and fast on technical rock.",
    description:
      "A technical trail shoe with a sticky rubber outsole and a snug performance fit for scrambles and ridgelines. Firmer underfoot than the Featherline — built for precision, not plush.",
    features: ["Sticky rubber outsole", "Rock plate", "Performance fit"],
    tags: ["technical", "scrambling", "grip"],
    image: "1542291026-7eec264c27ff",
  },
  {
    id: "wayfarer-45",
    title: "Wayfarer 45L Pack",
    sku: "PACK-WAY-001",
    category: "backpacks",
    brand: "north-fork",
    price: 179,
    sizes: ["One Size"],
    colors: ["Pine", "Sand"],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 265,
    short: "The weekend pack that carries like a daypack.",
    description:
      "45 liters of thoughtfully organized space with a ventilated back panel and a hip belt that actually transfers weight. Comfortable with 15kg, hydration-compatible, and rain-cover included. Our best-selling overnight pack.",
    features: [
      "Ventilated back panel",
      "Load-transfer hip belt",
      "Included rain cover",
      "Hydration compatible",
    ],
    tags: ["weekend", "comfortable-carry", "organized"],
    image: "1553062407-98eeb64c6a62",
  },
  {
    id: "daybreak-22",
    title: "Daybreak 22L Daypack",
    sku: "PACK-DAY-002",
    category: "backpacks",
    brand: "north-fork",
    price: 89,
    sizes: ["One Size"],
    colors: ["Moss", "Charcoal", "Blaze"],
    inStock: true,
    rating: 4.6,
    reviewCount: 402,
    short: "Everyday-to-trail daypack with a laptop sleeve.",
    description:
      "The one bag rule: trailhead on Saturday, commute on Monday. 22 liters, stretch side pockets, a padded 16-inch laptop sleeve, and a whistle buckle for the safety-minded.",
    features: ["Laptop sleeve", "Stretch pockets", "Whistle buckle"],
    tags: ["daypack", "commute", "versatile"],
    image: "1622260614153-03223fb72052",
  },
  {
    id: "portage-65",
    title: "Portage 65L Expedition Pack",
    sku: "PACK-PRT-003",
    category: "backpacks",
    brand: "north-fork",
    price: 239,
    sizes: ["One Size"],
    colors: ["Granite"],
    inStock: true,
    rating: 4.5,
    reviewCount: 87,
    short: "Big, burly, and comfortable under real loads.",
    description:
      "For week-long routes and shoulder-season loads. An adjustable torso, dual aluminum stays, and a bomber hip belt keep 20kg+ comfortable. Front-zip access so you stop unpacking everything to find the stove.",
    features: [
      "Adjustable torso",
      "Dual aluminum stays",
      "Front-zip access",
    ],
    tags: ["expedition", "heavy-loads", "week-long"],
    image: "1501554728187-ce583db33af7",
  },
  {
    id: "stormline-shell",
    title: "Stormline Rain Shell",
    sku: "JKT-STM-001",
    category: "jackets",
    brand: "switchback",
    price: 159,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blaze", "Pine", "Slate"],
    inStock: true,
    featured: true,
    rating: 4.7,
    reviewCount: 310,
    short: "A 3-layer shell that actually breathes.",
    description:
      "Three-layer waterproof-breathable protection with pit zips, a helmet-compatible hood, and a packable stuff pocket. Quiet fabric, athletic cut, and taped seams — the shell you stop thinking about when the weather turns.",
    features: [
      "3-layer waterproof",
      "Pit zips",
      "Packs into own pocket",
      "Taped seams",
    ],
    tags: ["rain", "waterproof", "packable", "windproof"],
    image: "1547949003-9792a18a2601",
  },
  {
    id: "ember-down-jacket",
    title: "Ember Down Jacket",
    sku: "JKT-EMB-002",
    category: "jackets",
    brand: "ember-pine",
    price: 229,
    compareAtPrice: 279,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Rust", "Charcoal"],
    inStock: true,
    rating: 4.9,
    reviewCount: 178,
    short: "800-fill warmth, currently on sale.",
    description:
      "Responsibly sourced 800-fill down in a ripstop shell. Warm enough for winter belays, light enough to forget it is in your pack. Elastic cuffs, insulated hand pockets, and a stuff sack included.",
    features: [
      "800-fill RDS down",
      "295g total weight",
      "Stuff sack included",
    ],
    tags: ["winter", "warm", "packable", "sale"],
    image: "1544923246-77307dd654cb",
  },
  {
    id: "windrow-fleece",
    title: "Windrow Fleece",
    sku: "JKT-WND-003",
    category: "jackets",
    brand: "switchback",
    price: 79,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Oat", "Moss"],
    inStock: true,
    rating: 4.4,
    reviewCount: 233,
    short: "The cozy grid-fleece midlayer for everything.",
    description:
      "A grid-fleece midlayer that breathes on the up and warms on the down. Soft against skin, thumb loops, and a chest pocket for snacks. The most comfortable layer in the store, full stop.",
    features: ["Grid fleece", "Thumb loops", "Chest pocket"],
    tags: ["comfortable", "cozy", "midlayer", "all-season"],
    image: "1556905055-8f358a7a47b2",
  },
  {
    id: "two-pines-tent",
    title: "Two Pines Tent (2P)",
    sku: "TNT-TWP-001",
    category: "tents-shelters",
    brand: "north-fork",
    price: 299,
    sizes: ["One Size"],
    colors: ["Pine"],
    inStock: true,
    rating: 4.8,
    reviewCount: 143,
    short: "A roomy two-person tent that pitches in minutes.",
    description:
      "Freestanding, two doors, two vestibules, and near-vertical walls so both sleepers get real space. Pitches in under five minutes, stands up to sustained wind, and weighs 1.9kg split between two packs.",
    features: [
      "Freestanding",
      "Two doors + vestibules",
      "1.9kg trail weight",
    ],
    tags: ["backpacking", "two-person", "storm-worthy"],
    image: "1504280390367-361c6d9f38f4",
  },
  {
    id: "solo-fly-tarp",
    title: "Solo Fly Tarp",
    sku: "TNT-SFT-002",
    category: "tents-shelters",
    brand: "north-fork",
    price: 119,
    sizes: ["One Size"],
    colors: ["Slate"],
    inStock: true,
    rating: 4.2,
    reviewCount: 64,
    short: "Ultralight shelter for minimalists.",
    description:
      "A 480g silnylon tarp with cat-cut edges and twelve tie-outs. Pairs with trekking poles for an endlessly configurable shelter. For hikers who count grams and enjoy the puzzle.",
    features: ["480g", "Silnylon", "12 tie-outs"],
    tags: ["ultralight", "minimalist", "solo"],
    image: "1478131143081-80f7f84ca84d",
  },
  {
    id: "ember-stove-kit",
    title: "Ember Stove Kit",
    sku: "CMP-EMB-001",
    category: "camp-trail",
    brand: "ember-pine",
    price: 64,
    sizes: ["One Size"],
    colors: ["Steel"],
    inStock: true,
    rating: 4.6,
    reviewCount: 289,
    short: "Boils a liter in under three minutes.",
    description:
      "A compact canister stove with a piezo igniter, folding pot supports, and a nesting 0.9L pot. Simmers properly — not just full blast — so camp dinners taste like dinners.",
    features: ["Piezo igniter", "Nesting 0.9L pot", "True simmer control"],
    tags: ["cooking", "compact", "fast-boil"],
    image: "1510312305653-8ed496efae75",
  },
  {
    id: "enamel-cook-set",
    title: "Enamel Cook Set",
    sku: "CMP-ENM-002",
    category: "camp-trail",
    brand: "ember-pine",
    price: 49,
    sizes: ["One Size"],
    colors: ["Cream", "Pine"],
    inStock: true,
    rating: 4.5,
    reviewCount: 176,
    short: "Two mugs, two plates, one very good campfire.",
    description:
      "Classic speckled enamelware: two mugs, two deep plates, and a pot with lid. Heavy enough to feel permanent, pretty enough for the gram. Car camping royalty.",
    features: ["Speckled enamel", "Campfire-safe", "Nesting set"],
    tags: ["car-camping", "cooking", "gift"],
    image: "1523987355523-c7b5b0dd90a7",
  },
  {
    id: "timberline-poles",
    title: "Timberline Trekking Poles",
    sku: "CMP-TMB-003",
    category: "camp-trail",
    brand: "cairn-supply-co",
    price: 99,
    sizes: ["One Size"],
    colors: ["Carbon"],
    inStock: true,
    rating: 4.7,
    reviewCount: 205,
    short: "Carbon poles your knees will thank you for.",
    description:
      "Carbon-fiber trekking poles with cork grips, flick locks, and interchangeable baskets. Save your knees on descents and double as tarp supports.",
    features: ["Carbon fiber", "Cork grips", "Flick locks"],
    tags: ["knee-friendly", "carbon", "tarp-compatible"],
    image: "1551632811-561732d1e306",
  },
];

const AGENT_SYSTEM_PROMPT = `You are the Trail Guide, the shopping assistant for Trailhead, an outdoor gear store.

## Your capabilities
- Search products by name, category, price, size, features, or vibe
- Compare products and make honest recommendations
- Answer questions about availability, sizing, and specs
- Look up the signed-in shopper's own orders when asked

## How to respond
- Always use available tools to look up real content — never guess or make up products
- Combine hard filters (price, size, inStock) with semantic ranking in a single GROQ query when the shopper mixes constraints with vibes (e.g. "comfy boots under $200, size 10")
- Be warm, brief, and practical — like a good outfitter, not a salesperson
- When recommending, lead with one best pick and explain why in a sentence
- Say "out of stock" ONLY when a product exists and its inStock field is false. If we do not carry an item at all, say we don't carry it — never call it out of stock
- If nothing matches, say so honestly and suggest the closest alternative`;

const CONTEXT_INSTRUCTIONS = `Product catalog notes:
- price is a number in USD. A product is on sale when compareAtPrice > price.
- sizes is an array of strings — footwear uses US sizes like "9", "10", "10.5"; apparel uses "S"/"M"/"L"/"XL"; gear uses "One Size". Filter with: "10" in sizes.
- Availability: filter inStock == true by default; only surface out-of-stock items when the shopper asks.
- category and brand are references. Filter via category->slug.current == "hiking-boots". Category slugs: hiking-boots, trail-runners, backpacks, jackets, tents-shelters, camp-trail.
- For comfort/vibe/use-case language ("comfy", "for rainy weather", "beginner"), combine hard filters with semantic ranking in ONE query:
  *[_type == "product" && price < 200 && "10" in sizes && inStock] | score(text::semanticSimilarity("comfy hiking boots")) | order(_score desc) { _id, _type, title, price }[0...5]
- Always project _id and _type so products can be rendered as cards.
- rating (0-5) and reviewCount indicate popularity; description holds the richest text for semantic matching.`;

async function run() {
  console.log(`Seeding ${projectId}/${dataset}…`);

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

  // Trail Guide base system prompt (editable in Studio)
  tx.createOrReplace({
    _id: "agent-config.trail-guide",
    _type: "agent.config",
    name: "Trail Guide",
    slug: { _type: "slug", current: "trail-guide" },
    systemPrompt: AGENT_SYSTEM_PROMPT,
  });

  // Sanity Context document: scopes + instructs the MCP endpoint
  tx.createOrReplace({
    _id: "agent-context.storefront",
    _type: "sanity.agentContext",
    name: "Trail Guide Storefront",
    slug: { _type: "slug", current: "storefront" },
    groqFilter: '_type in ["product", "category", "brand"]',
    instructions: CONTEXT_INSTRUCTIONS,
  });

  await tx.commit();

  console.log("\nDone. Seeded:");
  console.log(`  ${categories.length} categories, ${brands.length} brands`);
  console.log(`  ${products.length} products`);
  console.log("  1 agent.config (trail-guide)");
  console.log("  1 sanity.agentContext (storefront)");
  console.log("\nNext steps:");
  console.log("  1. npx sanity schema deploy");
  console.log(
    `  2. Set SANITY_CONTEXT_MCP_URL=https://api.sanity.io/v2026-03-03/context/mcp/${projectId}/${dataset}/storefront?embeddings=true`,
  );
  console.log("  3. npm run dev and open http://localhost:3000");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
