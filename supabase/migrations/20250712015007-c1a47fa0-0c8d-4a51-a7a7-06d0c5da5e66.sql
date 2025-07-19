
-- Crear enum para roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Crear enum para tipos de información en las páginas
CREATE TYPE info_type AS ENUM ('campaign', 'task', 'calendar_event', 'content_week', 'brand_element');

-- Crear enum para estados de tareas
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'in_review', 'completed');

-- Crear enum para prioridades
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  description TEXT,
  phase TEXT,
  progress INTEGER DEFAULT 0,
  team TEXT[] DEFAULT '{}',
  deadline DATE,
  status TEXT DEFAULT 'active',
  type TEXT DEFAULT 'commercial',
  start_date DATE DEFAULT CURRENT_DATE,
  budget DECIMAL(10,2),
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para información de Marketing
CREATE TABLE public.marketing_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  info_type info_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  
  -- Campos específicos para campañas
  campaign_type TEXT,
  budget DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  target_audience TEXT,
  
  -- Campos RACI
  responsible_user UUID REFERENCES public.user_profiles(id),
  accountable_user UUID REFERENCES public.user_profiles(id),
  consulted_users UUID[] DEFAULT '{}',
  
  -- Campos adicionales
  metadata JSONB DEFAULT '{}',
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para información de Branding
CREATE TABLE public.branding_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  info_type info_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  
  -- Campos RACI
  responsible_user UUID REFERENCES public.user_profiles(id),
  accountable_user UUID REFERENCES public.user_profiles(id),
  consulted_users UUID[] DEFAULT '{}',
  
  -- Campos específicos para branding
  brand_element_type TEXT,
  colors JSONB DEFAULT '{}',
  fonts JSONB DEFAULT '{}',
  
  metadata JSONB DEFAULT '{}',
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para información de Community
CREATE TABLE public.community_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  info_type info_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  
  -- Campos RACI
  responsible_user UUID REFERENCES public.user_profiles(id),
  accountable_user UUID REFERENCES public.user_profiles(id),
  consulted_users UUID[] DEFAULT '{}',
  
  -- Campos específicos para community
  platform TEXT,
  pillar TEXT,
  content_type TEXT,
  
  metadata JSONB DEFAULT '{}',
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_info ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para clients
CREATE POLICY "All users can view clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Admins can manage clients" ON public.clients FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Políticas RLS para marketing_info
CREATE POLICY "All users can view marketing info" ON public.marketing_info FOR SELECT USING (true);
CREATE POLICY "Admins can manage marketing info" ON public.marketing_info FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Users can update assigned tasks" ON public.marketing_info FOR UPDATE USING (
  responsible_user = auth.uid() OR accountable_user = auth.uid()
);

-- Políticas RLS para branding_info
CREATE POLICY "All users can view branding info" ON public.branding_info FOR SELECT USING (true);
CREATE POLICY "Admins can manage branding info" ON public.branding_info FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Users can update assigned branding tasks" ON public.branding_info FOR UPDATE USING (
  responsible_user = auth.uid() OR accountable_user = auth.uid()
);

-- Políticas RLS para community_info
CREATE POLICY "All users can view community info" ON public.community_info FOR SELECT USING (true);
CREATE POLICY "Admins can manage community info" ON public.community_info FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Users can update assigned community tasks" ON public.community_info FOR UPDATE USING (
  responsible_user = auth.uid() OR accountable_user = auth.uid()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_info_updated_at BEFORE UPDATE ON public.marketing_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branding_info_updated_at BEFORE UPDATE ON public.branding_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_info_updated_at BEFORE UPDATE ON public.community_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
