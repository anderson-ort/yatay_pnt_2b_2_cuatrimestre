-- Esto sigue siendo algo que viene de manera historica
-- En los proyectos anteriores.


CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  nombre VARCHAR NOT NULL,
  descripcion VARCHAR,
  categoria VARCHAR,
  precio NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  ingredientes TEXT[],
  imagen VARCHAR,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de productos"
ON productos FOR SELECT USING (true);

CREATE POLICY "Insercion solo autenticada"
ON productos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Actualizacion solo autenticada"
ON productos FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Borrado solo autenticado"
ON productos FOR DELETE USING (auth.role() = 'authenticated');
