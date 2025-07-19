
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Target, CheckSquare, AlertCircle } from 'lucide-react';

// Eventos de calendario para marketing
const marketingEvents = [
  { 
    date: new Date(2024, 11, 20), 
    title: "Lanzamiento Campaña Q2", 
    type: "campaign",
    status: "scheduled",
    campaign: "Campaña Q2 2024"
  },
  { 
    date: new Date(2024, 11, 22), 
    title: "Revisión métricas semanales", 
    type: "review",
    status: "scheduled",
    campaign: "General"
  },
  { 
    date: new Date(2024, 11, 25), 
    title: "Entrega creativos Black Friday", 
    type: "deadline",
    status: "urgent",
    campaign: "Black Friday 2024"
  },
  { 
    date: new Date(2024, 11, 28), 
    title: "Optimización campañas activas", 
    type: "optimization",
    status: "scheduled",
    campaign: "Múltiples"
  },
  { 
    date: new Date(2024, 11, 30), 
    title: "Reporte mensual de performance", 
    type: "report",
    status: "scheduled",
    campaign: "General"
  }
];

export default function MarketingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getEventColor = (type: string, status: string) => {
    if (status === 'urgent') return 'bg-red-100 text-red-800 border-red-200';
    
    switch (type) {
      case 'campaign': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-green-100 text-green-800 border-green-200';
      case 'deadline': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'optimization': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'report': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'campaign': return <Target className="h-4 w-4" />;
      case 'review': return <CheckSquare className="h-4 w-4" />;
      case 'deadline': return <AlertCircle className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'report': return <CheckSquare className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return marketingEvents.filter(event => 
      event.date.toDateString() === selectedDate.toDateString()
    );
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return marketingEvents
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <Card className="arch-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span>Calendario de Marketing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full"
                modifiers={{
                  eventDay: marketingEvents.map(event => event.date)
                }}
                modifiersStyles={{
                  eventDay: { 
                    backgroundColor: 'rgb(59 130 246 / 0.1)',
                    color: 'rgb(59 130 246)',
                    fontWeight: 'bold'
                  }
                }}
              />
            </div>
            <div className="space-y-6">
              {/* Eventos del día seleccionado */}
              <div>
                <h4 className="font-medium mb-3">
                  Eventos del {selectedDate?.toLocaleDateString() || 'día seleccionado'}
                </h4>
                <div className="space-y-2">
                  {getSelectedDateEvents().length > 0 ? (
                    getSelectedDateEvents().map((event, index) => (
                      <div key={index} className="p-3 border border-border rounded-lg">
                        <div className="flex items-start space-x-2">
                          {getEventIcon(event.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.campaign}
                            </p>
                            <Badge 
                              className={`${getEventColor(event.type, event.status)} text-xs mt-2`}
                              variant="outline"
                            >
                              {event.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay eventos para este día
                    </p>
                  )}
                </div>
              </div>

              {/* Próximos eventos */}
              <div>
                <h4 className="font-medium mb-3">Próximos Eventos</h4>
                <div className="space-y-3">
                  {getUpcomingEvents().map((event, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`w-3 h-3 rounded-full ${
                        event.type === 'campaign' ? 'bg-blue-500' :
                        event.type === 'review' ? 'bg-green-500' :
                        event.type === 'deadline' ? 'bg-orange-500' :
                        event.type === 'optimization' ? 'bg-purple-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            {event.date.toLocaleDateString()}
                          </p>
                          <Badge 
                            className={`${getEventColor(event.type, event.status)} text-xs`}
                            variant="outline"
                          >
                            {event.status === 'urgent' ? 'Urgente' : event.campaign}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen del mes */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Este Mes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Campañas activas:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entregas pendientes:</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reuniones programadas:</span>
                    <span className="font-medium">8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
