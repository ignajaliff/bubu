
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from 'lucide-react';

export default function ClientTeam() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Equipo del Cliente</h1>
        <p className="text-muted-foreground mt-1">
          Gestión de miembros asignados a este cliente
        </p>
      </div>

      <Card className="arch-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Miembros del Equipo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Funcionalidad en desarrollo</h3>
            <p className="text-sm">La gestión de equipo estará disponible próximamente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
