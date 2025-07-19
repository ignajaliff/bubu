
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface DaySummaryProps {
  selectedDate: Date | null;
  tasks: Task[];
  events: CalendarEvent[];
  area: string;
}

export default function DaySummary({ selectedDate, tasks, events, area }: DaySummaryProps) {
  if (!selectedDate) return null;

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayEvents = events.filter(event => event.dia === dateStr);
  const dayTasks = tasks.filter(task => task.due_date === dateStr);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="arch-card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Resumen del {format(selectedDate, 'dd \'de\' MMMM, yyyy', { locale: es })}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Eventos del día */}
          <div>
            <h4 className="font-medium mb-3 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Eventos ({dayEvents.length})</span>
            </h4>
            {dayEvents.length > 0 ? (
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <div key={event.id} className="p-3 border border-border rounded-lg bg-blue-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-blue-900">{event.concepto}</h5>
                        <p className="text-sm text-blue-700 mt-1">
                          {event.horario_inicial} - {event.horario_final}
                        </p>
                        {event.descripcion && (
                          <p className="text-sm text-gray-600 mt-2">{event.descripcion}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        Evento
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay eventos programados para este día</p>
            )}
          </div>

          {/* Tareas del día */}
          <div>
            <h4 className="font-medium mb-3 flex items-center space-x-2">
              <CheckSquare className="h-4 w-4" />
              <span>Tareas de {area} ({dayTasks.length})</span>
            </h4>
            {dayTasks.length > 0 ? (
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <div key={task.id} className="p-3 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium">{task.title}</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Fecha límite: {format(new Date(task.due_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority === 'high' ? 'Alta' : 
                         task.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay tareas programadas para este día</p>
            )}
          </div>

          {/* Resumen total */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{dayEvents.length}</div>
                <div className="text-sm text-blue-600">Eventos</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{dayTasks.length}</div>
                <div className="text-sm text-green-600">Tareas</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
