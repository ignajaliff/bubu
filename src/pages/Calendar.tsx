
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User } from 'lucide-react';
import { getProjects } from '@/services/localStorage';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const projects = getProjects();

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const mockEvents = [
    { id: 1, date: 15, title: "Entrega Proyecto Marina", type: "deadline", project: "Complejo Residencial Marina" },
    { id: 2, date: 22, title: "Reunión Cliente Centro Comercial", type: "meeting", project: "Centro Comercial Norte" },
    { id: 3, date: 28, title: "Revisión Estructural", type: "review", project: "Complejo Residencial Marina" },
    { id: 4, date: 5, title: "Inicio Fase Ejecutiva", type: "milestone", project: "Centro Comercial Norte" }
  ];

  const getEventsForDay = (day: number) => {
    return mockEvents.filter(event => event.date === day);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border"></div>);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const events = getEventsForDay(day);
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentDate.getMonth() && 
                     new Date().getFullYear() === currentDate.getFullYear();

      days.push(
        <div key={day} className={`h-24 border border-border p-1 ${isToday ? 'bg-primary/10' : ''}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 2).map(event => (
              <div key={event.id} className={`text-xs p-1 rounded truncate ${
                event.type === 'deadline' ? 'bg-destructive/20 text-destructive' :
                event.type === 'meeting' ? 'bg-primary/20 text-primary' :
                event.type === 'review' ? 'bg-arch-warning/20 text-black' :
                'bg-accent/20 text-accent-foreground'
              }`}>
                {event.title}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-muted-foreground">+{events.length - 2} más</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendario</h1>
          <p className="text-muted-foreground mt-1">
            Cronograma de proyectos y eventos importantes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario Principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Hoy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-0 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="h-10 flex items-center justify-center font-medium text-sm border border-border bg-muted">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0">
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Próximos Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockEvents.slice(0, 4).map(event => (
                <div key={event.id} className="flex items-center space-x-3 p-2 border border-border rounded">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.project}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{event.date}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Proyectos Activos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proyectos Activos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.filter(p => p.status === 'active').slice(0, 3).map(project => (
                <div key={project.id} className="p-2 border border-border rounded">
                  <div className="text-sm font-medium truncate">{project.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-muted-foreground">{project.client}</div>
                    <Badge variant="outline" className="text-xs">{project.progress}%</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
