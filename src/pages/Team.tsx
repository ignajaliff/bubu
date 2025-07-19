
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Mail, Calendar, Award, UserPlus, Filter } from 'lucide-react';
import { getTeamMembers, getProjects } from '@/services/localStorage';

export default function Team() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  const teamMembers = getTeamMembers();
  const projects = getProjects();

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const getProjectsForMember = (memberId: string) => {
    return projects.filter(project => project.team.includes(memberId));
  };

  const roles = [...new Set(teamMembers.map(m => m.role))];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Equipos</h1>
          <p className="text-muted-foreground mt-1">
            Administra y coordina tu equipo de trabajo
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Miembro
        </Button>
      </div>

      {/* Estadísticas del Equipo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{teamMembers.length}</div>
            <div className="text-sm text-muted-foreground">Miembros Totales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{roles.length}</div>
            <div className="text-sm text-muted-foreground">Roles Diferentes</div>
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
            <div className="text-3xl font-bold text-primary">
              {Math.round([...new Set(teamMembers.flatMap(m => m.skills))].length)}
            </div>
            <div className="text-sm text-muted-foreground">Habilidades Únicas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar miembros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={roleFilter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setRoleFilter("all")}
            >
              Todos
            </Badge>
            {roles.map((role) => (
              <Badge
                key={role}
                variant={roleFilter === role.toLowerCase() ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setRoleFilter(role.toLowerCase())}
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Miembros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => {
          const memberProjects = getProjectsForMember(member.id);
          
          return (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-medium">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{member.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{member.role}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Desde {member.joinDate}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{memberProjects.length} proyectos activos</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center space-x-1 mb-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Habilidades:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {memberProjects.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="text-sm text-muted-foreground mb-2">Proyectos actuales:</div>
                        <div className="space-y-1">
                          {memberProjects.slice(0, 2).map(project => (
                            <div key={project.id} className="text-xs bg-muted p-2 rounded truncate">
                              {project.name}
                            </div>
                          ))}
                          {memberProjects.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{memberProjects.length - 2} más
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron miembros</h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar los filtros o agregar nuevos miembros al equipo
            </p>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Miembro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
