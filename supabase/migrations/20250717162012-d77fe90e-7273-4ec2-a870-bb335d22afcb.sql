
-- Agregar columna para personas asignadas a los eventos del calendario
ALTER TABLE public.calendar_events 
ADD COLUMN personas_asignadas UUID[] DEFAULT '{}';

-- Crear índice para optimizar búsquedas por personas asignadas
CREATE INDEX idx_calendar_events_personas_asignadas ON public.calendar_events USING GIN (personas_asignadas);
