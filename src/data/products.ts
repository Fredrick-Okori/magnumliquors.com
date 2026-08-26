export interface Product {
  id: string;
  name: string;
  producer: string;
  origin: string;
  category: string;
  price: string;
  numericPrice: number;
  oldPrice?: string;
  badge?: string;
  abv: string;
  volume: string;
  vintage?: string;
  cask?: string;
  rating: string;
  description: string;
  tastingNotes: {
    nose: string;
    palate: string;
    finish: string;
    pairing: string;
  };
  image: string;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Don Julio 70 Añejo Cristalino",
    producer: "Don Julio Distillery",
    origin: "Jalisco, Mexico",
    category: "Spirits",
    price: "$85.00",
    numericPrice: 85.00,
    badge: "Cristalino Reserve",
    abv: "40.0% ABV",
    volume: "750 ml",
    vintage: "70th Anniversary",
    cask: "Recharred American White Oak",
    rating: "98 Pts • World Tequila Awards",
    description:
      "The world's first Añejo Cristalino Tequila, created to commemorate 70 years of tequila making. Matured 18 months in American white oak barrels and charcoal-filtered to achieve a clear appearance with rich vanilla and toasted oak.",
    tastingNotes: {
      nose: "Crisp agave, wild honey, melted butterscotch, and warm vanilla bean.",
      palate: "Smooth caramel, toasted oak, cooked agave, and white pepper spice.",
      finish: "Clean, silky finish with lingering roasted agave and sweet vanilla glow.",
      pairing: "Sip neat in a tulip glass or alongside dark Mexican chocolate.",
    },
    image: "/products/premium-liquor-don-julio-70-uganda.jpg",
    inStock: true,
  },
  {
    id: "2",
    name: "Don Julio 1942 Extra Añejo",
    producer: "Don Julio Distillery",
    origin: "Jalisco, Mexico",
    category: "Spirits",
    price: "$195.00",
    numericPrice: 195.00,
    badge: "Limited Allocation",
    abv: "40.0% ABV",
    volume: "750 ml",
    vintage: "Prestige Reserve",
    cask: "Hand-Selected Small Barrels",
    rating: "99/100 • Double Gold Winner",
    description:
      "Celebrated in exclusive cocktail lounges worldwide. Handcrafted in homage to the year Don Julio González began his tequila journey. Aged for a minimum of two and a half years in small oak barrels.",
    tastingNotes: {
      nose: "Rich caramel, chocolate, warm roasted agave, and Madagascar vanilla.",
      palate: "Silky palate of dark chocolate, cinnamon, sweet agave, and toasted oak.",
      finish: "Lingering, velvety finish with notes of oak spice and warm honey.",
      pairing: "Best served neat in a heavy snifter glass.",
    },
    image: "/products/premium-liquor-don-julio-uganda.jpg",
    inStock: true,
  },
  {
    id: "3",
    name: "Hennessy Very Special (V.S) Cognac",
    producer: "Maison Hennessy",
    origin: "Cognac, France",
    category: "Spirits",
    price: "$55.00",
    numericPrice: 55.00,
    badge: "Staff Pick",
    abv: "40.0% ABV",
    volume: "750 ml",
    vintage: "Maison Master Blend",
    cask: "French Limousin Oak",
    rating: "96 Pts • San Francisco Spirits Competition",
    description:
      "The flagship Cognac from Maison Hennessy, blended from up to 40 eaux-de-vie aged in French oak barrels. Vibrant, intense, and round with harmonious oak and toasted almond aromas.",
    tastingNotes: {
      nose: "Toasted almonds, fresh oak, cinnamon spice, and bright grape top notes.",
      palate: "Full-bodied floral notes, vanilla creme, roasted nuts, and warm fruit.",
      finish: "Subtle oak warmth with a smooth, satisfying finish.",
      pairing: "Enjoy neat, on ice, or mixed in a classic Hennessy Sidecar.",
    },
    image: "/products/hennesy-transparent-2.png",
    inStock: true,
  },
  {
    id: "4",
    name: "Glenfiddich 18 Year Old Single Malt",
    producer: "Glenfiddich Distillery",
    origin: "Speyside, Scotland",
    category: "Spirits",
    price: "$130.00",
    numericPrice: 130.00,
    badge: "18 Year Reserve",
    abv: "40.0% ABV",
    volume: "750 ml",
    vintage: "18 Year",
    cask: "Oloroso Sherry & Bourbon Casks",
    rating: "97 Pts • International Wine & Spirit Competition",
    description:
      "An exceptionally rare single malt Scotch whisky matured in Spanish Oloroso wood and traditional American oak. Married in small wooden vats for at least three months for extraordinary depth.",
    tastingNotes: {
      nose: "Ripe orchard fruit, baked apple, dried fig, and rich oak spice.",
      palate: "Luxurious dried fruit, candied peel, cinnamon, and warm malt.",
      finish: "Warming, long, and remarkably elegant finish.",
      pairing: "Sip neat alongside artisanal dark chocolate or aged blue cheese.",
    },
    image: "/products/glen-fiddich.jpg",
    inStock: true,
  },
  {
    id: "5",
    name: "Ruinart Blanc de Blancs Champagne",
    producer: "Maison Ruinart",
    origin: "Champagne, France",
    category: "Wine",
    price: "$110.00",
    numericPrice: 110.00,
    badge: "Prestige Cuvee",
    abv: "12.5% ABV",
    volume: "750 ml",
    vintage: "Non-Vintage",
    cask: "Crayères Chalk Cellars",
    rating: "95 Pts • Wine Spectator",
    description:
      "The emblem of Ruinart taste. Crafted exclusively from 100% Premier Cru Chardonnay grapes. Packaged in a iconic transparent bottle showcasing its luminous pale gold color.",
    tastingNotes: {
      nose: "Fresh lemon, white peach, jasmine flowers, and subtle brioche toast.",
      palate: "Crisp white nectarine, citrus oil, creamy mineral texture, and fine bubbles.",
      finish: "Long, persistent, and delicately salty finish.",
      pairing: "Sensational with sea bass carpaccio, oysters, or grilled scallops.",
    },
    image: "/products/ruinart.jpg",
    inStock: true,
  },
  {
    id: "6",
    name: "Tequila Ocho Extra Añejo El Bajío",
    producer: "Tequila Ocho",
    origin: "Jalisco, Mexico",
    category: "Spirits",
    price: "$175.00",
    numericPrice: 175.00,
    badge: "Single Estate",
    abv: "40.0% ABV",
    volume: "750 ml",
    vintage: "2018 Harvest",
    cask: "Used American Whiskey Barrels",
    rating: "98 Pts • Beverage Testing Institute",
    description:
      "A single-estate extra añejo tequila harvested exclusively from the El Bajío field. Matured 3 years in oak barrels to showcase the terroir of the agave.",
    tastingNotes: {
      nose: "Dried apricot, dark honey, toasted walnut, and rich agave notes.",
      palate: "Rich butterscotch, roasted coffee bean, clove, and sweet oak.",
      finish: "Expansive, long-lasting finish with lingering spice.",
      pairing: "Enjoy neat as an after-dinner digestif.",
    },
    image: "/products/TequilaOchoSingleEstateElBajio2018ExtraAnejoTequila1.webp",
    inStock: true,
  },
  {
    id: "7",
    name: "Bottega Gold Prosecco Superiore",
    producer: "Bottega Spa",
    origin: "Veneto, Italy",
    category: "Wine",
    price: "$34.99",
    numericPrice: 34.99,
    badge: "Staff Pick",
    abv: "11.0% ABV",
    volume: "750 ml",
    vintage: "2022",
    cask: "Stainless Steel Autoclave",
    rating: "92 Pts • Falstaff",
    description:
      "Prestige sparkling Prosecco presented in an iconic mirror-finished gold bottle. Crafted from Glera grapes grown in the Valdobbiadene hills.",
    tastingNotes: {
      nose: "Crisp green apple, Williams pear, acacia flowers, and fresh lily.",
      palate: "Harmonious balance of lively acidity, ripe peach, and fine perlage.",
      finish: "Clean and refreshing with lingering fruity sweetness.",
      pairing: "Perfect for celebrations, aperitifs, or light seafood starters.",
    },
    image: "/products/bottega.jpg",
    inStock: true,
  },
  {
    id: "8",
    name: "Luc Belaire Rare Rosé",
    producer: "Maison Belaire",
    origin: "Provence-Alpes-Côte d'Azur, France",
    category: "Wine",
    price: "$42.00",
    numericPrice: 42.00,
    abv: "12.5% ABV",
    volume: "750 ml",
    vintage: "Non-Vintage",
    cask: "Press Coeur Blend",
    rating: "93 Pts • Wine Enthusiast",
    description:
      "A stunning French sparkling rosé crafted from Grenache, Cinsault, and Syrah grapes. Bottled in an elegant sleek black bottle with pink foil accents.",
    tastingNotes: {
      nose: "Fresh strawberry, raspberry, blackcurrant, and subtle floral blossom.",
      palate: "Sweet red berry compote, velvety mousse, and balanced acidity.",
      finish: "Smooth and crisp with lingering berry sweetness.",
      pairing: "Serve chilled as a party aperitif or paired with berry desserts.",
    },
    image: "/products/belair-rose.jpg",
    inStock: true,
  },
  {
    id: "9",
    name: "Da Luca Prosecco DOC",
    producer: "Da Luca Cellars",
    origin: "Veneto, Italy",
    category: "Wine",
    price: "$18.99",
    numericPrice: 18.99,
    abv: "11.0% ABV",
    volume: "750 ml",
    vintage: "DOC NV",
    cask: "Stainless Steel",
    rating: "90 Pts • Decanter",
    description:
      "A vibrant Italian sparkling wine sourced from top vineyards in northern Italy. Light, bubbly, and packed with orchard fruit freshness.",
    tastingNotes: {
      nose: "White peach, jasmine, green apple, and citrus peel.",
      palate: "Zesty lemon, honeydew melon, and delicate persistent bubbles.",
      finish: "Crisp, dry, and invigorating finish.",
      pairing: "Great for brunch mimosas, charcuterie boards, or sushi.",
    },
    image: "/products/da-luca.jpg",
    inStock: true,
  },
  {
    id: "10",
    name: "Amor di Amanti Prosecco",
    producer: "Amor di Amanti",
    origin: "Veneto, Italy",
    category: "Wine",
    price: "$19.50",
    numericPrice: 19.50,
    abv: "11.0% ABV",
    volume: "750 ml",
    vintage: "Extra Dry",
    cask: "Charmat Method Tank",
    rating: "91 Pts • International Wine Challenge",
    description:
      "An enchanting Extra Dry Prosecco with aromatic bouquet and creamy effervescence. Crafted in the heart of the Treviso wine province.",
    tastingNotes: {
      nose: "Golden delicious apple, pear, and sweet almond blossom.",
      palate: "Soft, round palate of yellow plum, honeyed citrus, and fine mousse.",
      finish: "Delicate finish with sweet fruit nuances.",
      pairing: "Pairs wonderfully with antipasti, creamy pasta, or fresh fruit.",
    },
    image: "/products/amor-di-amanti.jpg",
    inStock: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
