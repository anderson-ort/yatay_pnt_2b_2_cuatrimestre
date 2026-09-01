CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  nombre VARCHAR not null,
  descripcion VARCHAR,
  categoria VARCHAR,
  precio NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  ingredientes TEXT[],
  imagen VARCHAR,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Activar ROW LEVEL SECURITY
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Lectura publica (catalogo visible sin autenticacion)
CREATE POLICY "Lectura publica de productos"
ON productos FOR SELECT
USING (true);

-- Insercion solo para usuarios autenticados
CREATE POLICY "Insercion solo autenticada"
ON PRODUCTOS FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Actualizacion solo para usuarios autenticados
CREATE POLICY "Actualizacion solo autenticada"
ON PRODUCTOS FOR UPDATE
USING (auth.role() = 'authenticated');

-- Borrado solo para usuarios autenticados
CREATE POLICY "Borrado solo autenticado"
ON PRODUCTOS FOR DELETE
USING (auth.role() = 'authenticated');


INSERT INTO PRODUCTOS (nombre, descripcion, categoria, precio, stock, ingredientes, imagen) VALUES
('Magnesio Bisglicinato 400mg', 'Forma de magnesio de alta absorcion, ideal para descanso y relajacion muscular.', 'minerales', 8500.00, 60, array['magnesio bisglicinato', 'capsula vegetal'], 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'),
('Omega 3 Aceite de Pescado', 'Concentrado de EPA y DHA para salud cardiovascular y cognitiva.', 'acidos grasos', 9200.00, 45, array['aceite de pescado', 'vitamina e'], 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600'),
('Vitamina D3 2000UI', 'Soporte para sistema inmune y salud osea, formato gotas.', 'vitaminas', 6300.00, 80, array['colecalciferol', 'aceite de oliva'], 'https://images.unsplash.com/photo-1550572017-9a3f3f9f3f3f?w=600'),
('Complejo B Activado', 'Vitaminas del grupo B en sus formas metiladas activas, para energia y sistema nervioso.', 'vitaminas', 10500.00, 30, array['metilcobalamina', 'metilfolato', 'p5p'], 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600'),
('Ashwagandha KSM-66', 'Adaptogeno tradicional para manejo del estres y equilibrio hormonal.', 'adaptogenos', 11800.00, 40, array['extracto de ashwagandha', 'raiz'], 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600'),
('Colageno Hidrolizado', 'Peptidos de colageno tipo I y III para piel, articulaciones y cabello.', 'proteinas', 13500.00, 25, array['colageno bovino hidrolizado', 'vitamina c'], 'https://images.unsplash.com/photo-1622484212385-1c3a0e1f5b8b?w=600'),
('Probioticos 20 Billones UFC', 'Mezcla multicepa para equilibrio de la flora intestinal.', 'digestivo', 12400.00, 35, array['lactobacillus', 'bifidobacterium'], 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600'),
('Zinc Quelado 25mg', 'Mineral esencial para sistema inmune y salud de la piel.', 'minerales', 5400.00, 70, array['zinc bisglicinato'], 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600'),
('Melatonina 3mg', 'Apoyo natural para conciliar el sueno, formato sublingual.', 'descanso', 7100.00, 50, array['melatonina', 'manitol'], 'https://images.unsplash.com/photo-1607619056574-8c8e9e5e1e1e?w=600'),
('Cúrcuma con Piperina', 'Curcumina de alta biodisponibilidad para soporte antiinflamatorio natural.', 'antiinflamatorios', 8900.00, 55, array['curcumina', 'piperina', 'cascara vegetal'], 'https://images.unsplash.com/photo-1615485500704-8e990f9900f4?w=600');