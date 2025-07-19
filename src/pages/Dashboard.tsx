
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { AlertTriangle, Users, Target, Calendar, CheckSquare, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

export default function Dashboard() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { profile } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Obtener clientes
  const { data: clients = [] } = useQuery({
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

  // Obtener tareas urgentes (solo para admins)
  const { data: urgentTasks = [] } = useQuery({
    queryKey: ['urgent-tasks'],
    queryFn: async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data, error } = await supabase
        .from('marketing_task_camp')
        .select(`
          *,
          clients (
            name,
            client_name
          )
        `)
        .eq('info_type', 'task')
        .neq('status', 'completed')
        .lte('due_date', nextWeek.toISOString().split('T')[0])
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: profile?.role === 'admin',
  });

  // Obtener tareas asignadas al usuario actual
  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-assigned-tasks', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Obtener tareas de marketing
      const { data: marketingTasks } = await supabase
        .from('marketing_task_camp')
        .select(`
          *,
          clients (
            name,
            client_name
          )
        `)
        .or(`responsible_user.eq.${profile.id},accountable_user.eq.${profile.id}`)
        .neq('status', 'completed')
        .order('due_date', { ascending: true });

      // Obtener tareas de branding
      const { data: brandingTasks } = await supabase
        .from('branding_info')
        .select(`
          *,
          clients (
            name,
            client_name
          )
        `)
        .or(`responsible_user.eq.${profile.id},accountable_user.eq.${profile.id}`)
        .neq('status', 'completed')
        .order('due_date', { ascending: true });

      // Obtener tareas de community
      const { data: communityTasks } = await supabase
        .from('community_task')
        .select(`
          *,
          clients (
            name,
            client_name
          )
        `)
        .or(`responsible_user.eq.${profile.id},accountable_user.eq.${profile.id}`)
        .neq('status', 'completed')
        .order('due_date', { ascending: true });

      return [
        ...(marketingTasks || []).map(task => ({ ...task, area: 'Marketing' })),
        ...(brandingTasks || []).map(task => ({ ...task, area: 'Branding' })),
        ...(communityTasks || []).map(task => ({ ...task, area: 'Community' }))
      ];
    },
    enabled: !!profile?.id,
  });

  // Calcular métricas generales (solo para admins)
  const totalClients = profile?.role === 'admin' ? clients.length : 0;
  const activeClients = profile?.role === 'admin' ? clients.filter(client => client.status === 'active').length : 0;
  const completedProjects = profile?.role === 'admin' ? clients.filter(client => client.status === 'completed').length : 0;
  const avgProgress = profile?.role === 'admin' && clients.length > 0 
    ? Math.round(clients.reduce((sum, client) => sum + (client.progress || 0), 0) / clients.length)
    : 0;

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'text-red-600 bg-red-50';
    if (daysLeft <= 2) return 'text-red-600 bg-red-50';
    if (daysLeft <= 5) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 xl:px-16 py-8 space-y-8">
        {/* Mini navegador */}
        <div className="bg-white border-b border-gray-200 -mx-8 lg:-mx-12 xl:-mx-16 px-8 lg:px-12 xl:px-16 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex space-x-8">
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
            </div>
            
            {/* Notificaciones */}
            <NotificationDropdown 
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
          </nav>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xl text-gray-600 mt-2">
            {profile?.role === 'admin' 
              ? 'Resumen general de tu agencia de marketing' 
              : 'Tus tareas y responsabilidades asignadas'
            }
          </p>
        </div>

        {/* Métricas principales - Solo para admins */}
        {profile?.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <MetricCard
              title="Total Clientes"
              value={totalClients.toString()}
              icon={Users}
              subtitle={`${activeClients} activos`}
              color="blue"
            />
            <MetricCard
              title="Proyectos Completados"
              value={completedProjects.toString()}
              icon={CheckSquare}
              subtitle="Este mes"
              color="green"
            />
            <MetricCard
              title="Progreso Promedio"
              value={`${avgProgress}%`}
              icon={Target}
              subtitle="Todos los clientes"
              color="purple"
            />
            <MetricCard
              title="Tareas Urgentes"
              value={urgentTasks.length.toString()}
              icon={AlertTriangle}
              subtitle="Próximos 7 días"
              color="orange"
            />
          </div>
        )}

        {/* Métricas para usuarios regulares */}
        {profile?.role === 'user' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MetricCard
              title="Mis Tareas Pendientes"
              value={myTasks.filter(t => t.status === 'pending' || t.status === 'correction_needed').length.toString()}
              icon={CheckSquare}
              subtitle="Requieren tu atención"
              color="blue"
            />
            <MetricCard
              title="En Revisión"
              value={myTasks.filter(t => t.status === 'in_review' && t.accountable_user === profile?.id).length.toString()}
              icon={AlertTriangle}
              subtitle="Esperando tu aprobación"
              color="orange"
            />
            <MetricCard
              title="Notificaciones"
              value={unreadCount.toString()}
              icon={Bell}
              subtitle="Sin leer"
              color="purple"
            />
          </div>
        )}

        {/* Notificaciones recientes */}
        {notifications.length > 0 && (
          <Card className="arch-card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <span>Notificaciones Recientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mis tareas asignadas */}
        {myTasks.length > 0 && (
          <Card className="arch-card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span>Mis Tareas Asignadas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTasks.slice(0, 5).map((task) => {
                  const daysLeft = task.due_date ? getDaysUntilDue(task.due_date) : null;
                  const isResponsible = task.responsible_user === profile?.id;
                  const isAccountable = task.accountable_user === profile?.id;
                  
                  return (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-lg text-gray-900">{task.title}</h4>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {task.area}
                            </span>
                            {isResponsible && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Responsable
                              </span>
                            )}
                            {isAccountable && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                Aprobador
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Cliente: {task.clients?.name || 'N/A'}</span>
                            {task.due_date && (
                              <>
                                <span>•</span>
                                <span>Vence: {new Date(task.due_date).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {daysLeft !== null && (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(daysLeft)}`}>
                            {daysLeft < 0 
                              ? `Vencida hace ${Math.abs(daysLeft)} días`
                              : daysLeft === 0 
                              ? 'Vence hoy'
                              : `${daysLeft} días restantes`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tareas urgentes - Solo para admins */}
        {profile?.role === 'admin' && (
          <Card className="arch-card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Tareas Urgentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {urgentTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">¡Excelente trabajo!</h3>
                  <p className="text-gray-600">No hay tareas urgentes en este momento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {urgentTasks.map((task) => {
                    const daysLeft = getDaysUntilDue(task.due_date);
                    return (
                      <div key={task.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-900">{task.title}</h4>
                            <p className="text-gray-600 mt-1">{task.description}</p>
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                              <span>Cliente: {task.clients?.name || 'N/A'}</span>
                              <span>•</span>
                              <span>Vence: {new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(daysLeft)}`}>
                            {daysLeft < 0 
                              ? `Vencida hace ${Math.abs(daysLeft)} días`
                              : daysLeft === 0 
                              ? 'Vence hoy'
                              : `${daysLeft} días restantes`
                            }
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resumen de clientes recientes - Solo para admins */}
        {profile?.role === 'admin' && (
          <Card className="arch-card-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Clientes Recientes</span>
                </CardTitle>
                <Link to="/projects">
                  <Button variant="outline">Ver Todos</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.slice(0, 6).map((client) => (
                  <Link key={client.id} to={`/projects/${client.id}`}>
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{client.name}</h4>
                          <p className="text-sm text-gray-600">{client.client_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progreso: {client.progress || 0}%</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          client.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : client.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status === 'active' ? 'Activo' : 
                           client.status === 'completed' ? 'Completado' : 
                           client.status === 'paused' ? 'Pausado' : 'Estado'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
