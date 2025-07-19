
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Plus, User, Calendar, Eye, MessageSquare, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';

type TaskStatus = 'pending' | 'in_progress' | 'in_review' | 'completed' | 'correction_needed';

interface NewTask {
  title: string;
  description: string;
  campaign_type: string;
  priority: string;
  due_date: string;
  responsible_user: string;
  accountable_user: string;
  consulted_users: string;
  informed_users: string;
}

export default function MarketingTasks() {
  const { id: clientId } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    campaign_type: '',
    priority: '',
    due_date: '',
    responsible_user: '',
    accountable_user: '',
    consulted_users: '',
    informed_users: ''
  });

  // Obtener tareas
  const { data: tasks = [] } = useQuery({
    queryKey: ['marketing-tasks', clientId, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('marketing_task_camp')
        .select(`
          *,
          responsible_user_profile:user_profiles!responsible_user(full_name),
          accountable_user_profile:user_profiles!accountable_user(full_name)
        `)
        .eq('client_id', clientId)
        .eq('info_type', 'task')
        .order('created_at', { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq('status', filterStatus as TaskStatus);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  // Filtrar tareas según el rol del usuario
  const filteredTasks = tasks.filter(task => {
    // Si es admin, ve todas las tareas
    if (profile?.role === 'admin') {
      return true;
    }
    
    // Si es user, solo ve las tareas donde está asignado en cualquier rol RACI
    return task.responsible_user === profile?.id || 
           task.accountable_user === profile?.id ||
           task.consulted_users?.includes(profile?.id) ||
           task.informed_users?.includes(profile?.id);
  });

  // Obtener usuarios para asignación
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Crear tarea
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const { data, error } = await supabase
        .from('marketing_task_camp')
        .insert([taskData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-tasks', clientId] });
      toast({
        title: "Tarea creada",
        description: "La tarea se ha creado exitosamente.",
      });
      setIsDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        campaign_type: '',
        priority: '',
        due_date: '',
        responsible_user: '',
        accountable_user: '',
        consulted_users: '',
        informed_users: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la tarea.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'correction_needed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'Completada';
      case 'in_progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      case 'in_review': return 'En Revisión';
      case 'correction_needed': return 'Requiere Corrección';
      default: return 'Estado';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Prioridad';
    }
  };

  const getUserRole = (task: any) => {
    const roles = [];
    if (task.responsible_user === profile?.id) roles.push('Responsable');
    if (task.accountable_user === profile?.id) roles.push('Aprobador');
    if (task.consulted_users?.includes(profile?.id)) roles.push('Consultado');
    if (task.informed_users?.includes(profile?.id)) roles.push('Informado');
    return roles.length > 0 ? roles.join(', ') : '';
  };

  const getActionButton = (task: any) => {
    const isResponsible = task.responsible_user === profile?.id;
    const isAccountable = task.accountable_user === profile?.id;
    const isConsulted = task.consulted_users?.includes(profile?.id);
    const isInformed = task.informed_users?.includes(profile?.id);

    let icon = Eye;
    let text = 'Ver Información';
    let variant: any = 'outline';

    if (isResponsible && (task.status === 'pending' || task.status === 'correction_needed')) {
      icon = CheckCircle;
      text = 'Completar';
      variant = 'default';
    } else if (isAccountable && task.status === 'in_review') {
      icon = Eye;
      text = 'Revisar';
      variant = 'default';
    } else if (isConsulted) {
      icon = MessageSquare;
      text = 'Accionar Consultado';
      variant = 'outline';
    } else if (isInformed) {
      icon = Info;
      text = 'Ver Información';
      variant = 'outline';
    }

    const IconComponent = icon;

    return (
      <Button 
        size="sm" 
        variant={variant}
        onClick={() => {
          setSelectedTask(task);
          setIsTaskModalOpen(true);
        }}
      >
        <IconComponent className="h-4 w-4 mr-2" />
        {text}
      </Button>
    );
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.responsible_user) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    const taskData = {
      client_id: clientId,
      info_type: 'task',
      title: newTask.title,
      description: newTask.description,
      campaign_type: newTask.campaign_type,
      priority: newTask.priority || 'medium',
      due_date: newTask.due_date || null,
      responsible_user: newTask.responsible_user,
      accountable_user: newTask.accountable_user || null,
      consulted_users: newTask.consulted_users ? [newTask.consulted_users] : [],
      informed_users: newTask.informed_users ? [newTask.informed_users] : [],
      status: 'pending',
      progress: 0,
      created_by: profile?.id
    };

    createTaskMutation.mutate(taskData);
  };

  return (
    <div className="space-y-6">
      <Card className="arch-card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Tareas de Marketing</span>
            </CardTitle>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Button 
                  variant={filterStatus === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  Todas
                </Button>
                <Button 
                  variant={filterStatus === "pending" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterStatus("pending")}
                >
                  Pendientes
                </Button>
                <Button 
                  variant={filterStatus === "in_review" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterStatus("in_review")}
                >
                  En Revisión
                </Button>
                <Button 
                  variant={filterStatus === "correction_needed" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterStatus("correction_needed")}
                >
                  Correcciones
                </Button>
              </div>
              {profile?.role === 'admin' && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Tarea
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Tarea</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="title">Título de la Tarea *</Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          placeholder="Ej: Crear banners para campaña"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                          placeholder="Describe los detalles de la tarea..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="campaign_type">Tipo de Campaña</Label>
                          <Select value={newTask.campaign_type} onValueChange={(value) => setNewTask({...newTask, campaign_type: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Lanzamiento de producto">Lanzamiento de producto</SelectItem>
                              <SelectItem value="Promocional">Promocional</SelectItem>
                              <SelectItem value="Awareness">Awareness</SelectItem>
                              <SelectItem value="Retargeting">Retargeting</SelectItem>
                              <SelectItem value="General">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="priority">Prioridad</Label>
                          <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="medium">Media</SelectItem>
                              <SelectItem value="low">Baja</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="due_date">Fecha Límite</Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label>Matriz RACI</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label htmlFor="responsible_user" className="text-sm">Responsable (R) *</Label>
                            <Select value={newTask.responsible_user} onValueChange={(value) => setNewTask({...newTask, responsible_user: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Quien ejecuta" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map(user => (
                                  <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="accountable_user" className="text-sm">Aprobador (A)</Label>
                            <Select value={newTask.accountable_user} onValueChange={(value) => setNewTask({...newTask, accountable_user: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Quien aprueba" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map(user => (
                                  <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="consulted_users" className="text-sm">Consultado (C)</Label>
                            <Select value={newTask.consulted_users} onValueChange={(value) => setNewTask({...newTask, consulted_users: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Quien consulta" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map(user => (
                                  <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="informed_users" className="text-sm">Informado (I)</Label>
                            <Select value={newTask.informed_users} onValueChange={(value) => setNewTask({...newTask, informed_users: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Quien se informa" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map(user => (
                                  <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
                        {createTaskMutation.isPending ? 'Creando...' : 'Crear Tarea'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
                <p className="text-gray-600 mb-4">
                  {filterStatus === "all" 
                    ? "No hay tareas asignadas a ti." 
                    : `No hay tareas con estado "${getStatusLabel(filterStatus)}".`
                  }
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.id} className="border border-border hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(task.priority)}`} />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-lg">{task.title}</h4>
                            <Badge className={getStatusColor(task.status)}>
                              {getStatusLabel(task.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Tipo:</span>
                              <div className="font-medium">{task.campaign_type || 'General'}</div>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                Responsable:
                              </span>
                              <div className="font-medium">{task.responsible_user_profile?.full_name || 'No asignado'}</div>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Aprobador:</span>
                              <div className="font-medium">{task.accountable_user_profile?.full_name || 'No asignado'}</div>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Fecha límite:
                              </span>
                              <div className="font-medium">
                                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Sin fecha'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Prioridad: {getPriorityLabel(task.priority)}</span>
                              <span>Progreso: {task.progress || 0}%</span>
                              {getUserRole(task) && (
                                <Badge variant="outline" className="text-xs">
                                  {getUserRole(task)}
                                </Badge>
                              )}
                            </div>
                            
                            {getActionButton(task)}
                          </div>
                          
                          {(task.progress || 0) > 0 && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${task.progress || 0}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles de tarea */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          tableName="marketing_task_camp"
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
