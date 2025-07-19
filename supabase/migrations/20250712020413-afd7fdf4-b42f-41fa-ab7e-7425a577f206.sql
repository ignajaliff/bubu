
-- Insertar clientes ficticios
INSERT INTO public.clients (name, client_name, description, phase, progress, team, deadline, status, type, budget) VALUES
(
  'TechCorp Solutions',
  'María González',
  'Empresa de tecnología especializada en desarrollo de software empresarial y consultoría digital.',
  'Desarrollo',
  75,
  ARRAY['Juan Pérez', 'Ana López', 'Carlos Ruiz'],
  '2024-12-31',
  'active',
  'commercial',
  150000.00
),
(
  'Green Energy Co.',
  'Roberto Silva',
  'Compañía dedicada a soluciones de energía renovable y sostenibilidad ambiental.',
  'Planificación',
  45,
  ARRAY['Laura Martín', 'Diego Castro'],
  '2025-03-15',
  'active',
  'industrial',
  280000.00
),
(
  'Urban Design Studio',
  'Elena Rodríguez',
  'Estudio de arquitectura y diseño urbano especializado en espacios comerciales modernos.',
  'Finalización',
  90,
  ARRAY['Pedro Sánchez', 'Carmen Díaz', 'Miguel Torres', 'Isabel Vega'],
  '2024-11-30',
  'active',
  'commercial',
  95000.00
);

-- Insertar información de marketing ficticia (usando los IDs de los clientes recién creados)
INSERT INTO public.marketing_info (client_id, info_type, title, description, status, priority, campaign_type, budget, start_date, end_date, target_audience) 
SELECT 
  c.id,
  'campaign'::info_type,
  'Campaña Q4 2024',
  'Campaña de lanzamiento para el último trimestre del año',
  'in_progress'::task_status,
  'high'::priority_level,
  'Digital',
  25000.00,
  '2024-10-01',
  '2024-12-31',
  'Empresas medianas y grandes'
FROM public.clients c WHERE c.name = 'TechCorp Solutions';

INSERT INTO public.marketing_info (client_id, info_type, title, description, status, priority, due_date) 
SELECT 
  c.id,
  'task'::info_type,
  'Crear contenido para redes sociales',
  'Desarrollar 20 posts para Instagram y LinkedIn',
  'pending'::task_status,
  'medium'::priority_level,
  '2024-11-15'
FROM public.clients c WHERE c.name = 'TechCorp Solutions';

INSERT INTO public.marketing_info (client_id, info_type, title, description, status, priority, campaign_type, budget, start_date, end_date, target_audience) 
SELECT 
  c.id,
  'campaign'::info_type,
  'Campaña Energía Verde',
  'Campaña de concienciación sobre energías renovables',
  'pending'::task_status,
  'high'::priority_level,
  'Tradicional + Digital',
  45000.00,
  '2025-01-01',
  '2025-06-30',
  'Empresas industriales y gobierno'
FROM public.clients c WHERE c.name = 'Green Energy Co.';

-- Insertar información de branding ficticia
INSERT INTO public.branding_info (client_id, info_type, title, description, status, priority, brand_element_type, colors, fonts) 
SELECT 
  c.id,
  'brand_element'::info_type,
  'Rediseño de logo corporativo',
  'Actualización completa de la identidad visual corporativa',
  'in_progress'::task_status,
  'high'::priority_level,
  'Logo',
  '{"primary": "#2563eb", "secondary": "#64748b", "accent": "#f59e0b"}'::jsonb,
  '{"primary": "Inter", "secondary": "Roboto"}'::jsonb
FROM public.clients c WHERE c.name = 'TechCorp Solutions';

INSERT INTO public.branding_info (client_id, info_type, title, description, status, priority, brand_element_type) 
SELECT 
  c.id,
  'brand_element'::info_type,
  'Manual de marca',
  'Creación del manual de uso de marca corporativa',
  'pending'::task_status,
  'medium'::priority_level,
  'Guidelines'
FROM public.clients c WHERE c.name = 'Urban Design Studio';

-- Insertar información de community ficticia
INSERT INTO public.community_info (client_id, info_type, title, description, status, priority, platform, pillar, content_type) 
SELECT 
  c.id,
  'content_week'::info_type,
  'Contenido semanal - Innovación Tech',
  'Posts semanales sobre innovación tecnológica',
  'in_progress'::task_status,
  'medium'::priority_level,
  'LinkedIn',
  'Innovación',
  'Educativo'
FROM public.clients c WHERE c.name = 'TechCorp Solutions';

INSERT INTO public.community_info (client_id, info_type, title, description, status, priority, platform, pillar, content_type) 
SELECT 
  c.id,
  'task'::info_type,
  'Gestión de comentarios',
  'Responder comentarios y mensajes en redes sociales',
  'pending'::task_status,
  'low'::priority_level,
  'Instagram',
  'Engagement',
  'Interacción'
FROM public.clients c WHERE c.name = 'Green Energy Co.';
