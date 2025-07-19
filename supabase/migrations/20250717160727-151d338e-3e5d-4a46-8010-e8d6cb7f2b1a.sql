
-- Crear tabla para eventos del calendario
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) NOT NULL,
  concepto TEXT NOT NULL,
  descripcion TEXT,
  area TEXT NOT NULL CHECK (area IN ('Marketing', 'Branding', 'Community')),
  dia DATE NOT NULL,
  horario_inicial TIME NOT NULL,
  horario_final TIME NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Política para que los admins puedan gestionar todos los eventos
CREATE POLICY "Admins can manage calendar events" 
  ON public.calendar_events 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  ));

-- Política para que todos los usuarios puedan ver los eventos
CREATE POLICY "All users can view calendar events" 
  ON public.calendar_events 
  FOR SELECT 
  USING (true);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
