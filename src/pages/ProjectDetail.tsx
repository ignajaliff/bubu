
import React from 'react';
import { useParams, Link, Routes, Route, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Info, Users, Target, Palette, Calendar } from 'lucide-react';
import { getProject } from '@/services/localStorage';
import { ProjectInfo } from '@/components/project/ProjectInfo';
import { ProjectTeam } from '@/components/project/ProjectTeam';
import { ProjectTasks } from '@/components/project/ProjectTasks';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const project = id ? getProject(id) : null;

  if (!project) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Link to="/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Clientes
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-muted-foreground">Cliente no encontrado</h2>
        </div>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-accent text-accent-foreground',
    paused: 'bg-arch-warning text-black',
    completed: 'bg-primary text-primary-foreground',
    delayed: 'bg-destructive text-destructive-foreground'
  };

  const statusLabels = {
    active: 'Activo',
    paused: 'Pausado',
    completed: 'Completado',
    delayed: 'Retrasado'
  };

  const currentPath = location.pathname;
  const basePath = `/projects/${id}`;

  const navigationItems = [
    { path: '', label: 'Información', icon: Info },
    { path: '/team', label: 'Equipo', icon: Users },
    { path: '/marketing', label: 'Marketing', icon: Target },
    { path: '/branding', label: 'Branding', icon: Palette },
    { path: '/community', label: 'Community', icon: Calendar }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Clientes
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.client}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={statusColors[project.status]}>
            {statusLabels[project.status]}
          </Badge>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Progreso General</div>
            <div className="flex items-center space-x-2 mt-1">
              <Progress value={project.progress} className="w-32" />
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {navigationItems.map((item) => {
              const itemPath = basePath + item.path;
              const isActive = currentPath === itemPath || (item.path === '' && currentPath === basePath);
              
              return (
                <Link
                  key={item.path}
                  to={itemPath}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                    isActive
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Routes>
        <Route path="/" element={<ProjectInfo project={project} />} />
        <Route path="/team" element={<ProjectTeam project={project} />} />
        <Route path="/marketing" element={<ProjectTasks project={project} />} />
        <Route path="/branding" element={<ProjectTasks project={project} />} />
        <Route path="/community" element={<ProjectTasks project={project} />} />
      </Routes>
    </div>
  );
}
