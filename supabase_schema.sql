-- ============================================================================
-- MAGNUM FINE WINE & SPIRITS — COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Categories: Whiskey, Rum, Vodka, Liqueur, Gin, Tequila, Brandy, Champagne, Wine
-- Includes: Hierarchical Categories, Subcategories, Products Table, Orders with
--           10% Developer Agreement Commission, Expenses, Profiles, and Permissive RLS
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
  ('London Dry Gin', 'london-dry-gin', 'Classic juniper-forward crisp distilled gin', 1),
  ('Botanical & Floral Gin', 'botanical-floral-gin', 'Infused with cucumber, rose, elderflower, and rare botanicals', 2),
  ('Plymouth & Navy Strength', 'plymouth-navy-strength', 'Full-proof, robust character maritime gins', 3),
  ('Old Tom & Aged Gin', 'old-tom-aged-gin', 'Slightly sweetened and barrel-aged historical gin', 4)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'gin'
ON CONFLICT (slug) DO NOTHING;

-- Tequila & Mezcal Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('Blanco / Silver Tequila', 'blanco-silver-tequila', 'Unaged, pure agave sweetness and pepper notes', 1),
  ('Reposado Tequila', 'reposado-tequila', 'Rested in oak barrels for 2-12 months', 2),
  ('Añejo & Extra Añejo', 'anejo-extra-anejo', 'Complex vanilla, caramel and oak aged luxury tequilas', 3),
  ('Artisanal Mezcal', 'artisanal-mezcal', 'Smoky, earthen-pit roasted wild agave spirits', 4)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'tequila'
ON CONFLICT (slug) DO NOTHING;

-- Brandy & Cognac Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('VS & VSOP Cognac', 'vs-vsop-cognac', 'Vibrant fruit and warm spice French brandies', 1),
  ('XO & Prestige Cognac', 'xo-prestige-cognac', 'Decades-old master cellar selections', 2),
  ('Armagnac & Calvados', 'armagnac-calvados', 'Single-distilled rustic gascon spirits and normandy apple brandies', 3)
) AS v(name, slug, description, display_order)
WHERE c.slug = 'brandy'
ON CONFLICT (slug) DO NOTHING;

-- Champagne & Sparkling Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order)
SELECT v.name, v.slug, v.description, c.id, v.display_order
FROM public.categories c
CROSS JOIN (VALUES
  ('Brut Champagne', 'brut-champagne', 'Crisp, mineral, and dry sparkling French wine', 1),
  ('Rosé Champagne', 'rose-champagne', 'Red berry and brioche effervescence', 2),
  ('Vintage & Prestige Cuvée', 'vintage-prestige-cuvee', 'Dom Pérignon, Cristal, and grand cru single-year vintages', 3),
  ('Prosecco & Cava', 'prosecco-cava', 'Refreshing Italian and Spanish sparkling wines', 4)
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

-- 5. PRODUCTS TABLE & COLUMN MIGRATIONS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all expected columns exist on public.products regardless of past schema state
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS producer VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS origin VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Whiskey';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS numeric_price NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS old_price VARCHAR(50);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge VARCHAR(100);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS abv NUMERIC DEFAULT 40.0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS volume VARCHAR(50);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS volume_ml INT DEFAULT 750;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vintage VARCHAR(100);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cask VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tasting_notes JSONB DEFAULT '{"nose": "", "palate": "", "finish": "", "pairing": ""}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 50;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quantity_in_stock INT DEFAULT 50;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pack_size VARCHAR(50) DEFAULT 'Bottle';

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);

-- 6. ORDERS TABLE (10% Developer Platform Agreement Commission)
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
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.10,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount_usd NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount_ugx NUMERIC(15, 2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2) DEFAULT 0.10;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS system_commission_usd NUMERIC(10, 2) GENERATED ALWAYS AS (ROUND(total_amount_usd * 0.10, 2)) STORED;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS system_commission_ugx NUMERIC(15, 2) GENERATED ALWAYS AS (ROUND(total_amount_ugx * 0.10, 2)) STORED;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS net_payout_usd NUMERIC(10, 2) GENERATED ALWAYS AS (ROUND(total_amount_usd * 0.90, 2)) STORED;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS net_payout_ugx NUMERIC(15, 2) GENERATED ALWAYS AS (ROUND(total_amount_ugx * 0.90, 2)) STORED;

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at);

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

-- 8. USER PROFILES TABLE (Mirrors Supabase Authentication Users Collection)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role VARCHAR(50) DEFAULT 'Sales',
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES — PERMISSIVE FOR APP OPERATIONS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Manage Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Manage Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Public Manage Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Manage Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Manage Orders" ON public.orders;
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Manage Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Expenses" ON public.expenses;
DROP POLICY IF EXISTS "Public Manage Expenses" ON public.expenses;
CREATE POLICY "Public Read Expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Public Manage Expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public Manage Profiles" ON public.profiles;
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Manage Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 10. AUTOMATIC TRIGGER TO SYNC AUTH.USERS DIRECTLY INTO PUBLIC.PROFILES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'Sales'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
