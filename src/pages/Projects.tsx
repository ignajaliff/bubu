
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, Users, Building2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function Projects() {
  const { profile } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Obtener conteo de tareas pendientes por cliente (solo tareas no completadas)
  const { data: taskCounts = {} } = useQuery({
    queryKey: ['client-task-counts', profile?.id],
    queryFn: async () => {
      if (!profile?.id || clients.length === 0) return {};

      const counts: Record<string, number> = {};

      for (const client of clients) {
        // Contar tareas de marketing (solo las no completadas)
        const { count: marketingCount } = await supabase
          .from('marketing_task_camp')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .eq('responsible_user', profile.id)
          .neq('status', 'completed');

        // Contar tareas de branding (solo las no completadas)
        const { count: brandingCount } = await supabase
          .from('branding_info')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .eq('responsible_user', profile.id)
          .neq('status', 'completed');

        // Contar tareas de community (solo las no completadas)
        const { count: communityCount } = await supabase
          .from('community_task')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .eq('responsible_user', profile.id)
          .neq('status', 'completed');

        const totalCount = (marketingCount || 0) + (brandingCount || 0) + (communityCount || 0);
        if (totalCount > 0) {
          counts[client.id] = totalCount;
        }
      }

      return counts;
    },
    enabled: !!profile?.id && clients.length > 0,
  });

  // Configurar actualizaciones en tiempo real
  useEffect(() => {
    const channels = [
      supabase
        .channel('marketing_task_camp_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'marketing_task_camp' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['client-task-counts'] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('branding_info_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'branding_info' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['client-task-counts'] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('community_task_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'community_task' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['client-task-counts'] });
          }
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    delayed: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    active: 'Activo',
    paused: 'Pausado',
    completed: 'Completado',
    delayed: 'Retrasado'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 xl:px-16 py-8 space-y-8">
          {/* Mini navegador */}
          <div className="bg-white border-b border-gray-200 -mx-8 lg:-mx-12 xl:-mx-16 px-8 lg:px-12 xl:px-16 py-4">
            <nav className="flex space-x-8">
              <Link
                to="/dashboard"
                className="px-4 py-2 text-base font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/projects"
                className="px-4 py-2 text-base font-medium rounded-lg bg-blue-100 text-blue-700 transition-colors"
              >
                Clientes
              </Link>
            </nav>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Clientes</h1>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container con márgenes mejorados */}
      <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 xl:px-16 py-8 space-y-8">
        {/* Mini navegador */}
        <div className="bg-white border-b border-gray-200 -mx-8 lg:-mx-12 xl:-mx-16 px-8 lg:px-12 xl:px-16 py-4">
          <nav className="flex space-x-8">
            <Link
              to="/dashboard"
              className={`px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                currentPath === '/dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className={`px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                currentPath === '/projects'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Clientes
            </Link>
          </nav>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Clientes</h1>
            <p className="text-xl text-gray-600 mt-2">Administra todos tus proyectos y clientes</p>
          </div>
          {profile?.role === 'admin' && (
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Cliente
            </Button>
          )}
        </div>

        {clients.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-24">
              <Building2 className="h-20 w-20 text-gray-400 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No hay clientes aún</h3>
              <p className="text-xl text-gray-600 text-center mb-8 max-w-md">
                {profile?.role === 'admin' 
                  ? 'Comienza creando tu primer cliente para gestionar sus proyectos.'
                  : 'No tienes acceso a clientes en este momento.'
                }
              </p>
              {profile?.role === 'admin' && (
                <Button size="lg" className="text-lg px-8 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Primer Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {clients.map((client) => (
              <Link key={client.id} to={`/projects/${client.id}`}>
                <Card className="hover:shadow-xl transition-all duration-300 border-gray-200 h-full hover:scale-105 relative">
                  {/* Notificación de tareas pendientes (solo si hay tareas pendientes) */}
                  {taskCounts[client.id] && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center z-10 animate-pulse">
                      {taskCounts[client.id]}
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {client.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-xl text-gray-900">{client.name}</CardTitle>
                          <p className="text-base text-gray-600">{client.client_name}</p>
                        </div>
                      </div>
                      <Badge className={`${statusColors[client.status as keyof typeof statusColors]} px-3 py-1 text-sm font-medium`}>
                        {statusLabels[client.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-600 text-base line-clamp-2">{client.description}</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-base">
                        <span className="text-gray-600">Progreso</span>
                        <span className="font-semibold text-lg">{client.progress}%</span>
                      </div>
                      <Progress value={client.progress || 0} className="h-3" />
                    </div>

                    <div className="flex items-center justify-between text-base text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>{client.deadline ? new Date(client.deadline).toLocaleDateString() : 'Sin fecha'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>{client.team ? client.team.length : 0} miembros</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-base">
                        <span className="text-gray-600">Fase actual</span>
                        <span className="font-semibold text-blue-600">{client.phase || 'No definida'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
