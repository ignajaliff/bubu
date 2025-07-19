
-- Crear tabla para almacenar los links temporales de presentaciones
CREATE TABLE public.links_temporales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID,
  link TEXT NOT NULL,
  pilares JSONB DEFAULT '[]'::jsonb,
  objetivos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Habilitar RLS
ALTER TABLE public.links_temporales ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos pueden ver links temporales" 
ON public.links_temporales 
FOR SELECT 
USING (true);

CREATE POLICY "Admins pueden gestionar links temporales" 
ON public.links_temporales 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_profiles.id = auth.uid() 
  AND user_profiles.role = 'admin'::user_role
));

CREATE POLICY "Usuarios pueden insertar links temporales" 
ON public.links_temporales 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger para updated_at
CREATE TRIGGER update_links_temporales_updated_at
BEFORE UPDATE ON public.links_temporales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
