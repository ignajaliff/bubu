
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, Square, Timer, Calendar, User, TrendingUp } from 'lucide-react';
import { getProjects, getTeamMembers } from '@/services/localStorage';

export default function TimeTracking() {
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  
  const projects = getProjects();
  const teamMembers = getTeamMembers();

  const mockTimeEntries = [
    {
      id: "time1",
      projectId: "1",
      projectName: "Complejo Residencial Marina",
      task: "Diseño estructural Torre A",
      userId: "luis-martin",
      userName: "Luis Martín",
      date: "2024-12-20",
      startTime: "09:00",
      endTime: "12:30",
      duration: "3h 30m",
      description: "Cálculos estructurales de cimentación"
    },
    {
      id: "time2",
      projectId: "1",
      projectName: "Complejo Residencial Marina",
      task: "Revisión planos arquitectónicos",
      userId: "ana-garcia",
      userName: "Ana García",
      date: "2024-12-20",
      startTime: "14:00",
      endTime: "17:00",
      duration: "3h 00m",
      description: "Revisión de distribución interior"
    },
    {
      id: "time3",
      projectId: "2",
      projectName: "Centro Comercial Norte",
      task: "Desarrollo conceptual",
      userId: "maria-santos",
      userName: "María Santos",
      date: "2024-12-19",
      startTime: "10:00",
      endTime: "13:00",
      duration: "3h 00m",
      description: "Bocetos iniciales del centro comercial"
    },
    {
      id: "time4",
      projectId: "2",
      projectName: "Centro Comercial Norte",
      task: "Análisis urbanístico",
      userId: "carlos-ruiz",
      userName: "Carlos Ruiz",
      date: "2024-12-19",
      startTime: "15:30",
      endTime: "18:00",
      duration: "2h 30m",
      description: "Estudio normativo y restricciones"
    },
    {
      id: "time5",
      projectId: "1",
      projectName: "Complejo Residencial Marina",
      task: "Instalaciones especiales",
      userId: "sara-lopez",
      userName: "Sara López",
      date: "2024-12-18",
      startTime: "09:30",
      endTime: "16:00",
      duration: "6h 30m",
      description: "Diseño sistema domótica y seguridad"
    }
  ];

  const handleTimerControl = (action: 'start' | 'pause' | 'stop', projectId?: string) => {
    switch (action) {
      case 'start':
        setActiveTimer(projectId || null);
        // En una app real, aquí se iniciaría el timer
        break;
      case 'pause':
        // En una app real, aquí se pausaría el timer
        break;
      case 'stop':
        setActiveTimer(null);
        setCurrentTime("00:00:00");
        break;
    }
  };

  const getTotalHoursForProject = (projectId: string) => {
    const entries = mockTimeEntries.filter(entry => entry.projectId === projectId);
    // Simplificado: en una app real calcularías las horas reales
    return entries.length * 3.2; // Aproximación
  };

  const getTotalHoursForUser = (userId: string) => {
    const entries = mockTimeEntries.filter(entry => entry.userId === userId);
    return entries.length * 3.2; // Aproximación
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Control de Tiempos</h1>
          <p className="text-muted-foreground mt-1">
            Registra y analiza el tiempo dedicado a cada proyecto
          </p>
        </div>
        <Button>
          <Timer className="h-4 w-4 mr-2" />
          Nueva Entrada
        </Button>
      </div>

      {/* Timer Activo */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Timer Actual</h3>
              <div className="text-3xl font-mono font-bold text-primary mb-2">
                {currentTime}
              </div>
              {activeTimer && (
                <div className="text-sm text-muted-foreground">
                  Trabajando en: {projects.find(p => p.id === activeTimer)?.name}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {!activeTimer ? (
                <Button 
                  size="lg"
                  onClick={() => handleTimerControl('start', '1')}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleTimerControl('pause')}
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    Pausar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="lg"
                    onClick={() => handleTimerControl('stop')}
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Detener
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {mockTimeEntries.length * 3.2}h
            </div>
            <div className="text-sm text-muted-foreground">Esta Semana</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {Math.round(mockTimeEntries.length * 3.2 / 5 * 10) / 10}h
            </div>
            <div className="text-sm text-muted-foreground">Promedio Diario</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {projects.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Proyectos Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">85%</div>
            <div className="text-sm text-muted-foreground">Productividad</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tiempo por Proyecto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Tiempo por Proyecto</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.filter(p => p.status === 'active').map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 border border-border rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">{project.name}</div>
                    <div className="text-xs text-muted-foreground">{project.client}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">
                      {getTotalHoursForProject(project.id)}h
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Esta semana
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tiempo por Miembro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Tiempo por Miembro</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.slice(0, 5).map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">
                      {getTotalHoursForUser(member.id)}h
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Esta semana
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entradas Recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Entradas Recientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTimeEntries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm">{entry.task}</h4>
                    <Badge variant="outline" className="text-xs">
                      {entry.projectName}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{entry.userName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{entry.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{entry.startTime} - {entry.endTime}</span>
                    </div>
                  </div>
                  
                  {entry.description && (
                    <div className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">
                      {entry.description}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-lg text-primary">
                    {entry.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
