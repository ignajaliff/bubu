-- Crear tabla community_content con todas las columnas requeridas
CREATE TABLE public.community_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID,
  semana TEXT NOT NULL CHECK (semana IN ('Semana 1', 'Semana 2', 'Semana 3', 'Semana 4')),
  fecha DATE NOT NULL,
  link TEXT,
  disenadora UUID,
  estado_diseno TEXT NOT NULL DEFAULT 'Para diseñar' CHECK (estado_diseno IN ('Para diseñar', 'Para Revisar', 'Para Corregir', 'Aprobado', 'Publicado', 'Cancelado')),
  comentarios_diseno TEXT,
  estado_copies TEXT NOT NULL DEFAULT 'Para revisar' CHECK (estado_copies IN ('Para revisar', 'Para corregir', 'Aprobado')),
  comentarios_copies TEXT,
  tipo_publicacion TEXT NOT NULL CHECK (tipo_publicacion IN ('Historia', 'Historia (2)', 'Historia (3)', 'Post', 'Carrusel', 'Carrusel (1)', 'Carrusel (3)', 'Carrusel (4)', 'Reel')),
  plataforma TEXT NOT NULL CHECK (plataforma IN ('Instagram', 'Facebook')),
  pilar TEXT,
  referencia TEXT,
  copy_grafica_video TEXT,
  copy_publicacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Habilitar RLS
ALTER TABLE public.community_content ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos pueden ver contenido community" 
ON public.community_content 
FOR SELECT 
USING (true);

CREATE POLICY "Admins pueden gestionar contenido community" 
ON public.community_content 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_profiles.id = auth.uid() 
  AND user_profiles.role = 'admin'::user_role
));

CREATE POLICY "Usuarios pueden insertar contenido community" 
ON public.community_content 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios pueden actualizar contenido community asignado" 
ON public.community_content 
FOR UPDATE 
USING (disenadora = auth.uid() OR created_by = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_community_content_updated_at
BEFORE UPDATE ON public.community_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Renombrar tablas existentes
ALTER TABLE public.community_info RENAME TO community_task;
ALTER TABLE public.marketing_info RENAME TO marketing_task_camp;