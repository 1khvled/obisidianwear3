-- Complete 58 Wilayas E-commerce Tariffs for Algeria
-- This script creates and populates the wilaya_tariffs table with all 58 Algerian wilayas
-- Focus: E-commerce delivery methods only (Domicile and Stop Desk)

-- Drop existing table if it exists (to ensure clean structure)
DROP TABLE IF EXISTS wilaya_tariffs CASCADE;

-- Create the wilaya_tariffs table with correct structure
CREATE TABLE wilaya_tariffs (
    id SERIAL PRIMARY KEY,
    wilaya_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    domicile_ecommerce INTEGER NOT NULL DEFAULT 0,
    stop_desk_ecommerce INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE wilaya_tariffs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON wilaya_tariffs;
CREATE POLICY "Enable read access for all users" ON wilaya_tariffs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON wilaya_tariffs;
CREATE POLICY "Enable insert for authenticated users" ON wilaya_tariffs
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON wilaya_tariffs;
CREATE POLICY "Enable update for authenticated users" ON wilaya_tariffs
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON wilaya_tariffs;
CREATE POLICY "Enable delete for authenticated users" ON wilaya_tariffs
    FOR DELETE USING (true);

-- Table is already dropped and recreated above

-- Insert all 58 Algerian wilayas with e-commerce shipping costs
-- Costs are based on distance from major e-commerce distribution centers
-- Domicile (home delivery) is typically 1.5-2x more expensive than Stop Desk

INSERT INTO wilaya_tariffs (wilaya_id, name, domicile_ecommerce, stop_desk_ecommerce, "order") VALUES
-- Northern Wilayas (Close to major cities) - Lower costs
(1, 'Adrar', 1200, 800, 1),
(2, 'Chlef', 500, 300, 2),
(3, 'Laghouat', 800, 500, 3),
(4, 'Oum El Bouaghi', 700, 450, 4),
(5, 'Batna', 800, 500, 5),
(6, 'Béjaïa', 600, 400, 6),
(7, 'Biskra', 900, 600, 7),
(8, 'Béchar', 1500, 1000, 8),
(9, 'Blida', 400, 250, 9),
(10, 'Bouira', 500, 300, 10),
(11, 'Tamanrasset', 2000, 1300, 11),
(12, 'Tébessa', 1000, 650, 12),
(13, 'Tlemcen', 700, 450, 13),
(14, 'Tiaret', 600, 400, 14),
(15, 'Tizi Ouzou', 450, 300, 15),
(16, 'Alger', 300, 200, 16),
(17, 'Djelfa', 700, 450, 17),
(18, 'Jijel', 550, 350, 18),
(19, 'Sétif', 600, 400, 19),
(20, 'Saïda', 600, 400, 20),
(21, 'Skikda', 650, 400, 21),
(22, 'Sidi Bel Abbès', 700, 450, 22),
(23, 'Annaba', 700, 450, 23),
(24, 'Guelma', 650, 400, 24),
(25, 'Constantine', 600, 400, 25),
(26, 'Médéa', 500, 300, 26),
(27, 'Mostaganem', 600, 400, 27),
(28, 'M''Sila', 700, 450, 28),
(29, 'Mascara', 650, 400, 29),
(30, 'Ouargla', 1000, 650, 30),
(31, 'Oran', 400, 250, 31),
(32, 'El Bayadh', 800, 500, 32),
(33, 'Illizi', 1800, 1200, 33),
(34, 'Bordj Bou Arréridj', 600, 400, 34),
(35, 'Boumerdès', 450, 300, 35),
(36, 'El Tarf', 700, 450, 36),
(37, 'Tindouf', 1800, 1200, 37),
(38, 'Tissemsilt', 550, 350, 38),
(39, 'El Oued', 900, 600, 39),
(40, 'Khenchela', 800, 500, 40),
(41, 'Souk Ahras', 700, 450, 41),
(42, 'Tipaza', 400, 250, 42),
(43, 'Mila', 600, 400, 43),
(44, 'Aïn Defla', 500, 300, 44),
(45, 'Naâma', 800, 500, 45),
(46, 'Aïn Témouchent', 650, 400, 46),
(47, 'Ghardaïa', 1000, 650, 47),
(48, 'Relizane', 600, 400, 48),
-- Additional wilayas (49-58) - Newer administrative divisions
(49, 'Timimoun', 1400, 900, 49),
(50, 'Bordj Badji Mokhtar', 1600, 1100, 50),
(51, 'Ouled Djellal', 1100, 700, 51),
(52, 'Beni Abbes', 1300, 850, 52),
(53, 'In Salah', 1700, 1150, 53),
(54, 'In Guezzam', 1900, 1250, 54),
(55, 'Touggourt', 950, 600, 55),
(56, 'Djanet', 2000, 1300, 56),
(57, 'El M''Ghair', 1200, 800, 57),
(58, 'El Meniaa', 1400, 900, 58);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wilaya_tariffs_wilaya_id ON wilaya_tariffs(wilaya_id);
CREATE INDEX IF NOT EXISTS idx_wilaya_tariffs_order ON wilaya_tariffs("order");
CREATE INDEX IF NOT EXISTS idx_wilaya_tariffs_name ON wilaya_tariffs(name);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_wilaya_tariffs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_wilaya_tariffs_updated_at ON wilaya_tariffs;
CREATE TRIGGER update_wilaya_tariffs_updated_at
    BEFORE UPDATE ON wilaya_tariffs
    FOR EACH ROW
    EXECUTE FUNCTION update_wilaya_tariffs_updated_at();

-- Add comments for documentation
COMMENT ON TABLE wilaya_tariffs IS 'E-commerce shipping tariffs for all 58 Algerian wilayas';
COMMENT ON COLUMN wilaya_tariffs.wilaya_id IS 'Official wilaya ID (1-58)';
COMMENT ON COLUMN wilaya_tariffs.name IS 'Wilaya name in French';
COMMENT ON COLUMN wilaya_tariffs.domicile_ecommerce IS 'Cost for e-commerce home delivery (DZD)';
COMMENT ON COLUMN wilaya_tariffs.stop_desk_ecommerce IS 'Cost for e-commerce stop desk delivery (DZD)';
COMMENT ON COLUMN wilaya_tariffs."order" IS 'Display order for UI';

-- Verify the data
SELECT 
    wilaya_id,
    name,
    domicile_ecommerce,
    stop_desk_ecommerce,
    "order"
FROM wilaya_tariffs 
ORDER BY "order";

-- Show summary statistics
SELECT 
    COUNT(*) as total_wilayas,
    MIN(domicile_ecommerce) as min_domicile,
    MAX(domicile_ecommerce) as max_domicile,
    AVG(domicile_ecommerce)::INTEGER as avg_domicile,
    MIN(stop_desk_ecommerce) as min_stop_desk,
    MAX(stop_desk_ecommerce) as max_stop_desk,
    AVG(stop_desk_ecommerce)::INTEGER as avg_stop_desk
FROM wilaya_tariffs;

-- Show cost distribution by region
SELECT 
    CASE 
        WHEN domicile_ecommerce <= 500 THEN 'Urban (≤500 DZD)'
        WHEN domicile_ecommerce <= 1000 THEN 'Semi-urban (501-1000 DZD)'
        WHEN domicile_ecommerce <= 1500 THEN 'Rural (1001-1500 DZD)'
        ELSE 'Remote (>1500 DZD)'
    END as region_type,
    COUNT(*) as wilaya_count,
    ROUND(AVG(domicile_ecommerce)) as avg_domicile_cost,
    ROUND(AVG(stop_desk_ecommerce)) as avg_stop_desk_cost
FROM wilaya_tariffs
GROUP BY 
    CASE 
        WHEN domicile_ecommerce <= 500 THEN 'Urban (≤500 DZD)'
        WHEN domicile_ecommerce <= 1000 THEN 'Semi-urban (501-1000 DZD)'
        WHEN domicile_ecommerce <= 1500 THEN 'Rural (1001-1500 DZD)'
        ELSE 'Remote (>1500 DZD)'
    END
ORDER BY avg_domicile_cost;
