
-- Agregar columnas necesarias para el flujo RACI
ALTER TABLE marketing_info 
ADD COLUMN completion_content TEXT,
ADD COLUMN correction_feedback TEXT,
ADD COLUMN completed_by UUID REFERENCES user_profiles(id),
ADD COLUMN reviewed_by UUID REFERENCES user_profiles(id),
ADD COLUMN correction_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE community_info 
ADD COLUMN completion_content TEXT,
ADD COLUMN correction_feedback TEXT,
ADD COLUMN completed_by UUID REFERENCES user_profiles(id),
ADD COLUMN reviewed_by UUID REFERENCES user_profiles(id),
ADD COLUMN correction_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE branding_info 
ADD COLUMN completion_content TEXT,
ADD COLUMN correction_feedback TEXT,
ADD COLUMN completed_by UUID REFERENCES user_profiles(id),
ADD COLUMN reviewed_by UUID REFERENCES user_profiles(id),
ADD COLUMN correction_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;

-- Actualizar el enum de task_status para incluir los nuevos estados
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'correction_needed';

-- Crear una tabla para notificaciones
CREATE TABLE IF NOT EXISTS public.task_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  task_id UUID NOT NULL,
  task_table TEXT NOT NULL CHECK (task_table IN ('marketing_info', 'community_info', 'branding_info')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('task_completed', 'correction_requested', 'task_approved')),
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para notificaciones
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.task_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.task_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas para insertar notificaciones (solo usuarios autenticados)
CREATE POLICY "Authenticated users can create notifications" 
  ON public.task_notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
