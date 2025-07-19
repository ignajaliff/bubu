
import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Grid2x2, Users, Target, Palette, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    title: "Dashboard",
    url: "",
    icon: Grid2x2,
    description: "Vista general del cliente"
  },
  {
    title: "Equipo",
    url: "/team",
    icon: Users,
    description: "Miembros asignados"
  },
  {
    title: "Marketing",
    url: "/marketing",
    icon: Target,
    description: "Campañas y performance"
  },
  {
    title: "Branding",
    url: "/branding",
    icon: Palette,
    description: "Identidad visual"
  },
  {
    title: "Community",
    url: "/community",
    icon: Calendar,
    description: "Redes sociales"
  }
];

export function ClientLayout({ children }: ClientLayoutProps) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const { data: client } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cliente no encontrado</h2>
          <Link to="/projects">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Clientes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const basePath = `/projects/${id}`;
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      {/* Header optimizado para PC */}
      <header className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-12 py-6">
          <div className="flex items-center justify-between">
            {/* Info del cliente */}
            <div className="flex items-center space-x-6">
              <Link to="/projects" className="inline-flex">
                <Button variant="outline" size="lg" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-300">
                  <ArrowLeft className="h-5 w-5 mr-3" />
                  Volver a Clientes
                </Button>
              </Link>
              
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {client.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
                <p className="text-lg text-gray-600">{client.client_name}</p>
              </div>
            </div>

            {/* Navegación del cliente optimizada para PC */}
            <nav className="flex items-center space-x-3">
              {navigationItems.map((item) => {
                const itemPath = basePath + item.url;
                const isActive = currentPath === itemPath || (item.url === '' && currentPath === basePath);
                
                return (
                  <Link
                    key={item.title}
                    to={itemPath}
                    className={`flex items-center space-x-3 px-8 py-4 rounded-xl transition-all duration-200 text-base font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Usuario, notificaciones y progreso */}
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-600">Progreso General</div>
                <div className="text-gray-900 font-semibold text-lg">{client.progress}%</div>
              </div>
              
              {/* Notificaciones */}
              <NotificationDropdown 
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{profile?.full_name}</div>
                  <div className="text-xs text-gray-600 capitalize">{profile?.role}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal optimizado para PC */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-12 py-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
