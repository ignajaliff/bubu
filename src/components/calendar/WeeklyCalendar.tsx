
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronLeft, ChevronRight, X, UserPlus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import CalendarEventModal from './CalendarEventModal';
import DaySummary from './DaySummary';

interface WeeklyCalendarProps {
  area: 'Marketing' | 'Branding' | 'Community';
}

interface CalendarEvent {
  id: string;
  concepto: string;
  descripcion: string;
  area: string;
  dia: string;
  horario_inicial: string;
  horario_final: string;
  personas_asignadas: string[];
}

interface Task {
  id: string;
  title: string;
  due_date: string;
  priority: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

export default function WeeklyCalendar({ area }: WeeklyCalendarProps) {
  const { id: clientId } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const [newEvent, setNewEvent] = useState({
    concepto: '',
    descripcion: '',
    horario_inicial: '',
    horario_final: '',
    personas_asignadas: [] as string[]
  });

  const [assignedUsers, setAssignedUsers] = useState<Array<{id: string, name: string}>>([]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Hours from 6am to 11pm
  const calendarHours = Array.from({ length: 18 }, (_, i) => i + 6);

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

  // Obtener eventos del calendario
  const { data: calendarEvents = [] } = useQuery({
    queryKey: ['calendar-events', clientId, area],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('client_id', clientId)
        .eq('area', area)
        .order('horario_inicial');
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  // Obtener tareas del área correspondiente
  const { data: tasks = [] } = useQuery({
    queryKey: [`${area.toLowerCase()}-tasks`, clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const tableName = area === 'Marketing' ? 'marketing_task_camp' : 
                       area === 'Branding' ? 'branding_info' : 'community_task';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('id, title, due_date, priority')
        .eq('client_id', clientId)
        .eq('info_type', 'task')
        .not('due_date', 'is', null)
        .order('due_date');
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  // Crear evento
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([eventData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', clientId, area] });
      toast({
        title: "Evento creado",
        description: "El evento se ha agregado al calendario exitosamente.",
      });
      setIsDialogOpen(false);
      setNewEvent({
        concepto: '',
        descripcion: '',
        horario_inicial: '',
        horario_final: '',
        personas_asignadas: []
      });
      setAssignedUsers([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el evento.",
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = () => {
    if (!newEvent.concepto || !newEvent.horario_inicial || !newEvent.horario_final || !selectedDate) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      client_id: clientId,
      concepto: newEvent.concepto,
      descripcion: newEvent.descripcion,
      area: area,
      dia: format(selectedDate, 'yyyy-MM-dd'),
      horario_inicial: newEvent.horario_inicial,
      horario_final: newEvent.horario_final,
      personas_asignadas: newEvent.personas_asignadas,
      created_by: profile?.id
    };

    createEventMutation.mutate(eventData);
  };

  const addAssignedUser = () => {
    setAssignedUsers([...assignedUsers, { id: '', name: '' }]);
  };

  const removeAssignedUser = (index: number) => {
    const updatedUsers = assignedUsers.filter((_, i) => i !== index);
    setAssignedUsers(updatedUsers);
    
    const updatedIds = updatedUsers.map(user => user.id).filter(id => id);
    setNewEvent(prev => ({ ...prev, personas_asignadas: updatedIds }));
  };

  const updateAssignedUser = (index: number, userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUsers = [...assignedUsers];
      updatedUsers[index] = { id: userId, name: user.full_name || user.email };
      setAssignedUsers(updatedUsers);
      
      const updatedIds = updatedUsers.map(user => user.id).filter(id => id);
      setNewEvent(prev => ({ ...prev, personas_asignadas: updatedIds }));
    }
  };

  const openCreateDialog = (date?: Date) => {
    setSelectedDate(date || new Date());
    setIsDialogOpen(true);
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return calendarEvents.filter(event => event.dia === dateStr);
  };

  const getTasksForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(task => task.due_date === dateStr);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateEventHeight = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(diffInHours * 60, 30); // Mínimo 30px de altura
  };

  const calculateEventTop = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    return ((hours - 6) * 60) + minutes; // Restar 6 porque empezamos a las 6am
  };

  return (
    <div className="space-y-6">
      <Card className="arch-card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>Calendario de {area}</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {format(weekStart, 'dd MMM', { locale: es })} - {format(addDays(weekStart, 6), 'dd MMM yyyy', { locale: es })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2">
            {/* Header de horas */}
            <div className="text-center font-medium text-sm py-2">Hora</div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="text-center font-medium text-sm py-2">
                <div>{format(day, 'EEE', { locale: es })}</div>
                <div className="text-lg">{format(day, 'dd')}</div>
              </div>
            ))}

            {/* Horas del día (6am - 11pm) */}
            {calendarHours.map((hour) => (
              <React.Fragment key={hour}>
                <div className="text-xs text-gray-500 py-2 border-t">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const dayTasks = getTasksForDay(day);
                  const hourEvents = dayEvents.filter(event => {
                    const eventHour = parseInt(event.horario_inicial.split(':')[0]);
                    return eventHour === hour;
                  });

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="relative border-t border-gray-100 min-h-[60px] hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedDate(day);
                        setNewEvent(prev => ({ ...prev, horario_inicial: `${hour.toString().padStart(2, '0')}:00` }));
                        setIsDialogOpen(true);
                      }}
                    >
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 bg-blue-500 text-white text-xs p-1 rounded shadow cursor-pointer z-10"
                          style={{
                            height: `${calculateEventHeight(event.horario_inicial, event.horario_final)}px`,
                            top: `${calculateEventTop(event.horario_inicial) - ((hour - 6) * 60)}px`
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          <div className="font-medium truncate">{event.concepto}</div>
                          <div className="opacity-75">{event.horario_inicial} - {event.horario_final}</div>
                        </div>
                      ))}
                      
                      {/* Mostrar tareas solo en la primera hora del día */}
                      {hour === 6 && dayTasks.map((task, index) => (
                        <div
                          key={task.id}
                          className={`absolute right-1 text-white text-xs p-1 rounded shadow ${getPriorityColor(task.priority)}`}
                          style={{
                            top: `${index * 25}px`,
                            width: '70%',
                            fontSize: '10px'
                          }}
                        >
                          <div className="truncate">{task.title}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botón flotante para agregar evento */}
      <Button
        onClick={() => openCreateDialog()}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Resumen del día */}
      <DaySummary 
        selectedDate={selectedDate} 
        tasks={tasks} 
        events={calendarEvents}
        area={area}
      />

      {/* Dialog para crear evento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Agregar Evento - {selectedDate && format(selectedDate, 'dd/MM/yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="concepto">Concepto *</Label>
              <Input
                id="concepto"
                value={newEvent.concepto}
                onChange={(e) => setNewEvent(prev => ({ ...prev, concepto: e.target.value }))}
                placeholder="Ej: Reunión con cliente"
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={newEvent.descripcion}
                onChange={(e) => setNewEvent(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Detalles del evento..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horario_inicial">Hora Inicial *</Label>
                <Input
                  id="horario_inicial"
                  type="time"
                  value={newEvent.horario_inicial}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, horario_inicial: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="horario_final">Hora Final *</Label>
                <Input
                  id="horario_final"
                  type="time"
                  value={newEvent.horario_final}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, horario_final: e.target.value }))}
                />
              </div>
            </div>
            
            {/* Personas Asignadas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Personas Asignadas</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAssignedUser}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Agregar Persona
                </Button>
              </div>
              
              {assignedUsers.map((assignedUser, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Select
                    value={assignedUser.id}
                    onValueChange={(value) => updateAssignedUser(index, value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAssignedUser(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateEvent} disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? 'Creando...' : 'Crear Evento'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para ver detalles del evento */}
      {selectedEvent && (
        <CalendarEventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
