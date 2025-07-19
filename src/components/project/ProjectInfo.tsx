
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, User, FileText, Building, Target } from 'lucide-react';
import { Project } from '@/types/project';

interface ProjectInfoProps {
  project: Project;
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  const typeLabels = {
    residential: 'B2C',
    commercial: 'B2B',
    industrial: 'Corporativo',
    urban: 'Startup'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Información General */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <span>Información del Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Descripción del Proyecto</h4>
              <p className="text-sm">
                {project.description || 'Sin descripción disponible'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Fase Actual</h4>
                <Badge variant="outline">{project.phase}</Badge>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Tipo de Cliente</h4>
                <Badge variant="secondary">{typeLabels[project.type]}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Fecha de Inicio</div>
                  <div className="text-sm font-medium">{project.startDate}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Fecha Límite</div>
                  <div className="text-sm font-medium">{project.deadline}</div>
                </div>
              </div>
            </div>

            {project.budget && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Presupuesto</div>
                  <div className="text-sm font-medium">
                    €{project.budget.toLocaleString('es-ES')}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Servicios y Entregables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Servicios y Entregables</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.plans && project.plans.length > 0 ? (
              <div className="space-y-3">
                {project.plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{plan.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Servicio • Versión {plan.version} • {plan.uploadDate}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {plan.type === 'architectural' ? 'estrategia' : 
                       plan.type === 'structural' ? 'branding' : 
                       plan.type === 'electrical' ? 'marketing' : 'community'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay servicios configurados aún</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información del Cliente */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Datos del Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.clientData ? (
              <>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Empresa</h4>
                  <p className="text-sm">{project.clientData.name}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Email</h4>
                  <p className="text-sm">{project.clientData.email}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Teléfono</h4>
                  <p className="text-sm">{project.clientData.phone}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Dirección</h4>
                  <p className="text-sm">{project.clientData.address}</p>
                </div>
                
                {project.clientData.company && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Grupo Empresarial</h4>
                    <p className="text-sm">{project.clientData.company}</p>
                  </div>
                )}
                
                {project.clientData.notes && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Notas</h4>
                    <p className="text-sm bg-muted p-2 rounded-md">{project.clientData.notes}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay datos del cliente disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
