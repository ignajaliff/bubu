
-- Agregar columna para usuarios informados en las tres tablas
ALTER TABLE marketing_info 
ADD COLUMN informed_users UUID[] DEFAULT '{}';

ALTER TABLE community_info 
ADD COLUMN informed_users UUID[] DEFAULT '{}';

ALTER TABLE branding_info 
ADD COLUMN informed_users UUID[] DEFAULT '{}';

-- Agregar columna para el contenido del consultado
ALTER TABLE marketing_info 
ADD COLUMN consulted_content TEXT,
ADD COLUMN consulted_by UUID REFERENCES user_profiles(id),
ADD COLUMN consulted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE community_info 
ADD COLUMN consulted_content TEXT,
ADD COLUMN consulted_by UUID REFERENCES user_profiles(id),
ADD COLUMN consulted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE branding_info 
ADD COLUMN consulted_content TEXT,
ADD COLUMN consulted_by UUID REFERENCES user_profiles(id),
ADD COLUMN consulted_at TIMESTAMP WITH TIME ZONE;

-- Actualizar las políticas RLS para permitir acceso a usuarios informados y consultados
CREATE POLICY "Users can update consulted content in marketing tasks" 
  ON marketing_info 
  FOR UPDATE 
  USING (consulted_users @> ARRAY[auth.uid()]);

CREATE POLICY "Users can update consulted content in community tasks" 
  ON community_info 
  FOR UPDATE 
  USING (consulted_users @> ARRAY[auth.uid()]);

CREATE POLICY "Users can update consulted content in branding tasks" 
  ON branding_info 
  FOR UPDATE 
  USING (consulted_users @> ARRAY[auth.uid()]);

-- Agregar notificaciones para roles consultados e informados
ALTER TABLE task_notifications 
DROP CONSTRAINT IF EXISTS task_notifications_notification_type_check;

ALTER TABLE task_notifications 
ADD CONSTRAINT task_notifications_notification_type_check 
CHECK (notification_type IN ('task_completed', 'correction_requested', 'task_approved', 'consulted_action', 'task_updated'));
