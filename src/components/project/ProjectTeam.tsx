
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Calendar, Award } from 'lucide-react';
import { Project } from '@/types/project';
import { getTeamMembers } from '@/services/localStorage';

interface ProjectTeamProps {
  project: Project;
}

export function ProjectTeam({ project }: ProjectTeamProps) {
  const allMembers = getTeamMembers();
  const projectMembers = allMembers.filter(member => project.team.includes(member.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Equipo del Proyecto ({projectMembers.length} miembros)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{member.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{member.role}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Desde {member.joinDate}</span>
                        </div>
                        
                        <div className="flex items-start space-x-1">
                          <Award className="h-3 w-3 text-muted-foreground mt-0.5" />
                          <div className="flex flex-wrap gap-1">
                            {member.skills.slice(0, 2).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                                {skill}
                              </Badge>
                            ))}
                            {member.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{member.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {projectMembers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No hay miembros asignados</h3>
              <p className="text-sm">Asigna miembros del equipo a este proyecto</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas del equipo */}
      {projectMembers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{projectMembers.length}</div>
              <div className="text-sm text-muted-foreground">Miembros Activos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round([...new Set(projectMembers.flatMap(m => m.skills))].length)}
              </div>
              <div className="text-sm text-muted-foreground">Habilidades Únicas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(projectMembers.reduce((acc, member) => {
                  const joinYear = new Date(member.joinDate).getFullYear();
                  const experience = new Date().getFullYear() - joinYear + 1;
                  return acc + experience;
                }, 0) / projectMembers.length)}
              </div>
              <div className="text-sm text-muted-foreground">Años Promedio</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
