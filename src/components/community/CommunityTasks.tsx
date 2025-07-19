
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, User, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';
import TaskActions from '@/components/tasks/TaskActions';

interface CommunityTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  responsible_user: string;
  accountable_user: string;
  consulted_users: string[];
  informed_users: string[];
  platform: string;
  pillar: string;
  content_type: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

type PriorityType = 'high' | 'medium' | 'low';

export default function CommunityTasks() {
  const { id: clientId } = useParams();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as PriorityType,
    due_date: '',
    responsible_user: '',
    accountable_user: '',
    consulted_users: [] as string[],
    informed_users: [] as string[],
    platform: '',
    pillar: '',
    content_type: ''
  });

  // Obtener usuarios
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

  // Obtener tareas de community
  const { data: tasks = [], refetch } = useQuery({
    queryKey: ['community-tasks', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('community_task')
        .select('*')
        .eq('client_id', clientId)
        .eq('info_type', 'task')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('community_task')
        .insert({
          ...formData,
          client_id: clientId,
          info_type: 'task' as any,
          status: 'pending' as any,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Tarea creada correctamente",
      });

      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium' as PriorityType,
        due_date: '',
        responsible_user: '',
        accountable_user: '',
        consulted_users: [],
        informed_users: [],
        platform: '',
        pillar: '',
        content_type: ''
      });
      refetch();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la tarea",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_review': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'correction_needed': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'in_review': return 'En Revisión';
      case 'correction_needed': return 'Necesita Corrección';
      case 'completed': return 'Completada';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Tareas de Community</h2>
            <p className="opacity-90">Gestiona y supervisa todas las tareas del equipo de community</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Tarea</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Título de la tarea"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descripción detallada de la tarea"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select value={formData.priority} onValueChange={(value: PriorityType) => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="due_date">Fecha de Entrega</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsible_user">Responsable</Label>
                    <Select value={formData.responsible_user} onValueChange={(value) => setFormData({...formData, responsible_user: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar responsable" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="accountable_user">Supervisor</Label>
                    <Select value={formData.accountable_user} onValueChange={(value) => setFormData({...formData, accountable_user: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="platform">Plataforma</Label>
                    <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="TikTok">TikTok</SelectItem>
                        <SelectItem value="Twitter">Twitter</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="content_type">Tipo de Contenido</Label>
                    <Select value={formData.content_type} onValueChange={(value) => setFormData({...formData, content_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Post">Post</SelectItem>
                        <SelectItem value="Historia">Historia</SelectItem>
                        <SelectItem value="Reel">Reel</SelectItem>
                        <SelectItem value="Carrusel">Carrusel</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="pillar">Pilar de Contenido</Label>
                    <Input
                      id="pillar"
                      value={formData.pillar}
                      onChange={(e) => setFormData({...formData, pillar: e.target.value})}
                      placeholder="Ej: Educativo, Entretenimiento, Promocional"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Tarea</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Tareas */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow border-l-4 border-l-indigo-400">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(task.status)}
                    <h3 className="font-semibold text-lg text-gray-900">{task.title}</h3>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    {task.due_date && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Vence: {new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {task.platform && (
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Plataforma:</span>
                        <span>{task.platform}</span>
                      </div>
                    )}
                    {task.content_type && (
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Tipo:</span>
                        <span>{task.content_type}</span>
                      </div>
                    )}
                    {task.pillar && (
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Pilar:</span>
                        <span>{task.pillar}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    {task.responsible_user && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <User className="h-4 w-4" />
                        <span>
                          {users.find(u => u.id === task.responsible_user)?.full_name || 'Usuario no encontrado'}
                        </span>
                      </div>
                    )}
                    {(task.consulted_users?.length > 0 || task.informed_users?.length > 0) && (
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>+{(task.consulted_users?.length || 0) + (task.informed_users?.length || 0)} colaboradores</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <TaskActions task={task} tableName="community_task" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <div className="text-slate-400 text-lg mb-2">No hay tareas creadas</div>
          <p className="text-slate-500">Crea la primera tarea para comenzar</p>
        </div>
      )}
    </div>
  );
}
