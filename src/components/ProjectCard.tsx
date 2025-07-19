
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Clock, Target } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  name: string;
  client: string;
  phase: string;
  progress: number;
  team: string[];
  deadline: string;
  status: 'active' | 'paused' | 'completed' | 'delayed';
  type: 'residential' | 'commercial' | 'industrial' | 'urban';
}

export function ProjectCard({
  id,
  name,
  client,
  phase,
  progress,
  team,
  deadline,
  status,
  type
}: ProjectCardProps) {
  const statusColors = {
    active: 'bg-accent text-accent-foreground',
    paused: 'bg-arch-warning text-black',
    completed: 'bg-primary text-primary-foreground',
    delayed: 'bg-destructive text-destructive-foreground'
  };

  const typeLabels = {
    residential: 'B2C',
    commercial: 'B2B',
    industrial: 'Corporativo',
    urban: 'Startup'
  };

  const statusLabels = {
    active: 'Activo',
    paused: 'Pausado',
    completed: 'Completado',
    delayed: 'Retrasado'
  };

  return (
    <Link to={`/projects/${id}`}>
      <Card className="arch-card-shadow hover:shadow-lg transition-all duration-200 cursor-pointer group animate-fade-in">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                {name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{client}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge className={statusColors[status]}>
                {statusLabels[status]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {typeLabels[type]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Fase: {phase}</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{team.length} miembros</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{deadline}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Próxima entrega en 5 días
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
