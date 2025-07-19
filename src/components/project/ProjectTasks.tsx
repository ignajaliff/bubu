
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Calendar, User, Plus, AlertCircle } from 'lucide-react';
import { Project, Task } from '@/types/project';
import { saveProject, updateProjectProgress, getTeamMembers } from '@/services/localStorage';

interface ProjectTasksProps {
  project: Project;
}

export function ProjectTasks({ project }: ProjectTasksProps) {
  const [tasks, setTasks] = useState(project.tasks);
  const teamMembers = getTeamMembers();

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : undefined
        };
        return updatedTask;
      }
      return task;
    });

    setTasks(updatedTasks);
    
    // Actualizar proyecto en localStorage
    const updatedProject = { ...project, tasks: updatedTasks };
    saveProject(updatedProject);
    updateProjectProgress(project.id);
  };

  const parentTasks = tasks.filter(task => task.isParentTask);
  const completedParentTasks = parentTasks.filter(task => task.completed);
  const overallProgress = parentTasks.length > 0 
    ? (completedParentTasks.reduce((sum, task) => sum + task.progressWeight, 0))
    : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-arch-warning text-black';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAssigneeName = (userId: string) => {
    const member = teamMembers.find(m => m.id === userId);
    return member ? member.name : userId;
  };

  const isOverdue = (dueDate: string, completed: boolean) => {
    if (completed) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Resumen de Progreso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span>Progreso General</span>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progreso del Proyecto</span>
              <span className="text-sm font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{parentTasks.length}</div>
                <div className="text-xs text-muted-foreground">Tareas Principales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{completedParentTasks.length}</div>
                <div className="text-xs text-muted-foreground">Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-arch-warning">{parentTasks.length - completedParentTasks.length}</div>
                <div className="text-xs text-muted-foreground">Pendientes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tareas Principales */}
      <Card>
        <CardHeader>
          <CardTitle>Tareas Principales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {parentTasks.map((task) => (
              <div key={task.id} className={`p-4 border rounded-lg transition-all ${
                task.completed ? 'bg-muted/30 border-muted' : 'border-border hover:shadow-md'
              }`}>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {task.progressWeight}%
                        </Badge>
                        {isOverdue(task.dueDate, task.completed) && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className={isOverdue(task.dueDate, task.completed) ? 'text-destructive' : ''}>
                            {task.dueDate}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>
                            {task.assignedTo.map(userId => getAssigneeName(userId)).join(', ')}
                          </span>
                        </div>
                      </div>
                      
                      {task.completed && task.completedAt && (
                        <div className="text-xs text-accent">
                          Completada: {new Date(task.completedAt).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {parentTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No hay tareas creadas</h3>
              <p className="text-sm mb-4">Crea la primera tarea principal para este proyecto</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Tarea Principal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subtareas (si las hay) */}
      {tasks.some(task => !task.isParentTask) && (
        <Card>
          <CardHeader>
            <CardTitle>Subtareas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.filter(task => !task.isParentTask).map((task) => (
                <div key={task.id} className={`p-3 border rounded-lg ${
                  task.completed ? 'bg-muted/20 border-muted' : 'border-border'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleTaskToggle(task.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
