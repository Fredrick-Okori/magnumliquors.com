-- ============================================================================
-- MAGNUM FINE WINE & SPIRITS — COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Categories: Whiskey, Rum, Vodka, Liqueur, Gin, Tequila, Brandy, Champagne, Wine
-- Includes: Hierarchical Categories, Subcategories, Products Table, Orders with
--           15% Commission, Stock Deduction Triggers, and Permissive RLS Policies
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. HIERARCHICAL CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories (parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories (display_order);

-- 3. SEED 9 PRIMARY PRODUCT CATEGORIES
INSERT INTO public.categories (name, slug, description, display_order) VALUES
  ('Whiskey', 'whiskey', 'Single malts, scotch, bourbon, rye, and premium aged whiskies', 1),
  ('Rum', 'rum', 'Aged dark rums, spiced rums, white rums, and premium Caribbean blends', 2),
  ('Vodka', 'vodka', 'Ultra-premium grain, potato, and artisanal distilled zero-impurity vodkas', 3),
  ('Liqueur', 'liqueur', 'Herbal digestifs, cream liqueurs, aperitifs, and fruit cordials', 4),
  ('Gin', 'gin', 'London dry, botanical craft gins, and infused aromatic spirits', 5),
  ('Tequila', 'tequila', '100% Blue Weber agave tequilas, añejos, reposados, and artisanal mezcals', 6),
  ('Brandy', 'brandy', 'Prestige French cognacs, armagnacs, and aged fruit brandies', 7),
  ('Champagne', 'champagne', 'Authentic French champagne, vintage cuvées, and prestige sparkling wines', 8),
  ('Wine', 'wine', 'Grand cru reds, crisp estate whites, rosés, and fortified cellar reserves', 9)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- 4. SEED POPULAR SUBCATEGORIES FOR EACH MAIN CATEGORY

-- Whiskey Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('Single Malt Scotch', 'single-malt-scotch', 'Distilled in Scotland at a single distillery from malted barley', 1),
  ('Bourbon & American Whiskey', 'bourbon-american-whiskey', 'Corn-rich, charred American oak aged whiskey', 2),
  ('Blended Scotch', 'blended-scotch', 'Master-blended malts and grains for signature smoothness', 3),
  ('Irish Whiskey', 'irish-whiskey', 'Triple-distilled Irish smooth spirits', 4),
  ('Japanese Whisky', 'japanese-whisky', 'Meticulously crafted spirits of Japanese precision', 5),
  ('Rye Whiskey', 'rye-whiskey', 'Spicy, bold grain profile whiskies', 6)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'whiskey'
ON CONFLICT (slug) DO NOTHING;

-- Rum Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('Dark & Aged Rum', 'dark-aged-rum', 'Rich oak barrel matured sipping rums', 1),
  ('Spiced Rum', 'spiced-rum', 'Infused with vanilla, cinnamon, and tropical spices', 2),
  ('White Rum', 'white-rum', 'Clean, crisp rums ideal for classic cocktails', 3),
  ('Overproof & Agricole', 'overproof-agricole', 'Pure sugar cane juice and high-proof expressions', 4)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'rum'
ON CONFLICT (slug) DO NOTHING;

-- Vodka Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('Classic Grain Vodka', 'classic-grain-vodka', 'Crisp winter wheat and rye vodkas', 1),
  ('Flavored Vodka', 'flavored-vodka', 'Infused with natural citrus, berry, and vanilla botanicals', 2),
  ('Craft & Potato Vodka', 'craft-potato-vodka', 'Creamy, full-bodied artisanal pot-distilled vodkas', 3)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'vodka'
ON CONFLICT (slug) DO NOTHING;

-- Liqueur Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('Herbal & Amaro', 'herbal-amaro', 'Bitter herbal digestifs, vermouths, and botanical amari', 1),
  ('Cream Liqueurs', 'cream-liqueurs', 'Silky Irish dairy and decadent caramel creams', 2),
  ('Coffee & Nut Liqueurs', 'coffee-nut-liqueurs', 'Roasted espresso, almond amaretto, and hazelnut', 3),
  ('Fruit & Triple Sec', 'fruit-triple-sec', 'Orange Curaçao, citrus cordials, and berry liqueurs', 4)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'liqueur'
ON CONFLICT (slug) DO NOTHING;

-- Gin Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('London Dry Gin', 'london-dry-gin', 'Juniper-forward crisp classic gin style', 1),
  ('Botanical & Floral Gin', 'botanical-floral-gin', 'Contemporary craft gins with cucumber, rose, and citrus', 2),
  ('Old Tom & Navy Strength', 'old-tom-navy-strength', 'Slightly sweetened heritage or 57%+ high proof gin', 3),
  ('Pink & Flavored Gin', 'pink-flavored-gin', 'Berry, rhubarb, and citrus fruit-forward gins', 4)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'gin'
ON CONFLICT (slug) DO NOTHING;

-- Tequila Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('Blanco / Silver', 'blanco-silver-tequila', 'Unaged, pure cooked agave and mineral crispness', 1),
  ('Reposado', 'reposado-tequila', 'Mellowed in oak barrels for 2 to 11 months', 2),
  ('Añejo', 'anejo-tequila', 'Deeply aged in oak for 1 to 3 years for rich vanilla notes', 3),
  ('Extra Añejo', 'extra-anejo-tequila', 'Prestige ultra-aged tequilas aged over 3 years', 4),
  ('Artisanal Mezcal', 'artisanal-mezcal', 'Smoky Oaxaca pit-roasted agave spirits', 5),
  ('Cristalino', 'cristalino-tequila', 'Aged tequila filtered for crystal clarity with velvety oak depth', 6)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'tequila'
ON CONFLICT (slug) DO NOTHING;

-- Brandy Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('Cognac VS / VSOP', 'cognac-vs-vsop', 'French Limousin oak aged vibrant eaux-de-vie', 1),
  ('Cognac XO & Hors d''Âge', 'cognac-xo-prestige', 'Decades-matured luxury prestige cognacs', 2),
  ('Armagnac', 'armagnac', 'Gascony single continuous distilled rustic French brandy', 3),
  ('Pisco & Grappa', 'pisco-grappa', 'Aromatic South American & Italian pomace brandies', 4)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'brandy'
ON CONFLICT (slug) DO NOTHING;

-- Champagne Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('Brut Non-Vintage', 'brut-non-vintage', 'Classic crisp Champagne house cuvées', 1),
  ('Blanc de Blancs', 'blanc-de-blancs', '100% Chardonnay radiant French champagne', 2),
  ('Rosé Champagne', 'rose-champagne', 'Pinot Noir tinted delicate berry sparkling champagne', 3),
  ('Vintage Prestige Cuvée', 'vintage-prestige-cuvee', 'Single exceptional harvest prestige releases', 4),
  ('Prosecco & Cava', 'prosecco-cava', 'Italian Glera and Spanish traditional sparkling wines', 5)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'champagne'
ON CONFLICT (slug) DO NOTHING;

-- Wine Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('Red Wine', 'red-wine', 'Cabernet Sauvignon, Merlot, Pinot Noir, Syrah, Bordeaux', 1),
  ('White Wine', 'white-wine', 'Chardonnay, Sauvignon Blanc, Pinot Grigio, Riesling', 2),
  ('Rosé Wine', 'rose-wine', 'Provence style crisp dry pink wines', 3),
  ('Fortified & Dessert Wine', 'fortified-dessert-wine', 'Tawny Port, Sherry, Madeira, and Sauternes', 4)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'wine'
ON CONFLICT (slug) DO NOTHING;

-- 5. PRODUCTS TABLE (Directly populated via /dashboard/products/create)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    producer VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Whiskey',
    price VARCHAR(50) NOT NULL,
    numeric_price NUMERIC(10, 2) NOT NULL,
    old_price VARCHAR(50),
    badge VARCHAR(100),
    abv VARCHAR(50) NOT NULL,
    volume VARCHAR(50) NOT NULL,
    vintage VARCHAR(100),
    cask VARCHAR(255),
    rating VARCHAR(255),
    description TEXT,
    tasting_notes JSONB DEFAULT '{"nose": "", "palate": "", "finish": "", "pairing": ""}'::jsonb,
    image_url TEXT NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    stock_quantity INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products (in_stock);

-- 6. ORDERS TABLE WITH 15% SYSTEM COMMISSION
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(100) NOT NULL,
    delivery_address TEXT NOT NULL,
    order_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash on Delivery',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    total_amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount_ugx NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.15,
    system_commission_usd NUMERIC(10, 2) GENERATED ALWAYS AS (ROUND(total_amount_usd * 0.15, 2)) STORED,
    system_commission_ugx NUMERIC(15, 2) GENERATED ALWAYS AS (ROUND(total_amount_ugx * 0.15, 2)) STORED,
    net_payout_usd NUMERIC(10, 2) GENERATED ALWAYS AS (ROUND(total_amount_usd * 0.85, 2)) STORED,
    net_payout_ugx NUMERIC(15, 2) GENERATED ALWAYS AS (ROUND(total_amount_ugx * 0.85, 2)) STORED,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. EXPENSES TABLE (Managed directly via /dashboard/expenses)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Operations & Maintenance',
    amount_ugx NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    recorded_by VARCHAR(255) NOT NULL DEFAULT 'Store Staff',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash',
    voucher_number VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Approved',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses (date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (category);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES — PERMISSIVE FOR APP OPERATIONS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Drop prior strict policies if any
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Manage Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Read In-Stock Products" ON public.products;
DROP POLICY IF EXISTS "Public Manage Products" ON public.products;
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Manage Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Read Expenses" ON public.expenses;
DROP POLICY IF EXISTS "Public Manage Expenses" ON public.expenses;

-- Permissive Policies allowing Read, Insert, Update, Delete for Dashboard & Storefront
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Manage Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read In-Stock Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Manage Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Manage Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Public Manage Expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

-- Financial Ledger Policies (Allows automated trigger entries when orders are placed)
ALTER TABLE IF EXISTS public.financial_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Ledger" ON public.financial_ledger;
DROP POLICY IF EXISTS "Public Manage Ledger" ON public.financial_ledger;
CREATE POLICY "Public Read Ledger" ON public.financial_ledger FOR SELECT USING (true);
CREATE POLICY "Public Manage Ledger" ON public.financial_ledger FOR ALL USING (true) WITH CHECK (true);

