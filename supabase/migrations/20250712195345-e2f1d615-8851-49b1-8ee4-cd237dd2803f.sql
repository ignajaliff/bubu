
-- Agregar campos de métricas a las campañas de marketing
ALTER TABLE public.marketing_info 
ADD COLUMN roi_percentage NUMERIC,
ADD COLUMN conversions INTEGER,
ADD COLUMN ctr_percentage NUMERIC,
ADD COLUMN metrics_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN metrics_period_start DATE,
ADD COLUMN metrics_period_end DATE,
ADD COLUMN progress INTEGER DEFAULT 0;

-- Actualizar función de trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para marketing_info si no existe
DROP TRIGGER IF EXISTS update_marketing_info_updated_at ON public.marketing_info;
CREATE TRIGGER update_marketing_info_updated_at
    BEFORE UPDATE ON public.marketing_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
