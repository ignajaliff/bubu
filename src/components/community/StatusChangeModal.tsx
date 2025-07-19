
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from 'lucide-react';

interface StatusChangeModalProps {
  content: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function StatusChangeModal({ content, isOpen, onClose, onUpdate }: StatusChangeModalProps) {
  const { toast } = useToast();
  const [statusData, setStatusData] = useState({
    estado_diseno: content?.estado_diseno || '',
    estado_copies: content?.estado_copies || ''
  });

  const handleStatusChange = async () => {
    try {
      const { error } = await supabase
        .from('community_content')
        .update(statusData)
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Los estados se han actualizado correctamente",
      });

      onClose();
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los estados",
        variant: "destructive",
      });
    }
  };

  if (!content) return null;

  const designStatusOptions = [
    'Para diseñar',
    'Para Revisar',
    'Para Corregir',
    'Aprobado',
    'Publicado',
    'Cancelado'
  ];

  const copiesStatusOptions = [
    'Para revisar',
    'Para corregir',
    'Aprobado'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <span>Cambiar Estados</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">
              {content.semana} - {content.tipo_publicacion}
            </h3>
            <p className="text-sm text-blue-600">
              {content.plataforma} • {new Date(content.fecha).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="estado_diseno" className="text-sm font-medium">
                Estado del Diseño
              </Label>
              <Select
                value={statusData.estado_diseno}
                onValueChange={(value) => setStatusData({...statusData, estado_diseno: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Seleccionar estado del diseño" />
                </SelectTrigger>
                <SelectContent>
                  {designStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estado_copies" className="text-sm font-medium">
                Estado de los Copies
              </Label>
              <Select
                value={statusData.estado_copies}
                onValueChange={(value) => setStatusData({...statusData, estado_copies: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Seleccionar estado de los copies" />
                </SelectTrigger>
                <SelectContent>
                  {copiesStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleStatusChange}>
              Confirmar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
