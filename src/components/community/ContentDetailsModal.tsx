
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit3 } from 'lucide-react';

interface ContentDetailsModalProps {
  content: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ContentDetailsModal({ content, isOpen, onClose, onUpdate }: ContentDetailsModalProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    comentarios_diseno: content?.comentarios_diseno || '',
    comentarios_copies: content?.comentarios_copies || '',
    copy_grafica_video: content?.copy_grafica_video || '',
    copy_publicacion: content?.copy_publicacion || ''
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('community_content')
        .update(editData)
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Los detalles se han actualizado correctamente",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los detalles",
        variant: "destructive",
      });
    }
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalles del Contenido</span>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica (solo lectura) */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-slate-600">Semana</Label>
              <p className="text-lg font-semibold text-slate-900">{content.semana}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Fecha</Label>
              <p className="text-lg font-semibold text-slate-900">
                {new Date(content.fecha).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Tipo</Label>
              <p className="text-lg font-semibold text-slate-900">{content.tipo_publicacion}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Plataforma</Label>
              <p className="text-lg font-semibold text-slate-900">{content.plataforma}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Pilar</Label>
              <p className="text-lg font-semibold text-slate-900">{content.pilar || 'No especificado'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Referencia</Label>
              <p className="text-lg font-semibold text-slate-900">{content.referencia || 'No especificado'}</p>
            </div>
          </div>

          {/* Campos editables */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="comentarios_diseno" className="text-sm font-medium text-slate-700">
                Comentarios sobre el diseño
              </Label>
              {isEditing ? (
                <Textarea
                  id="comentarios_diseno"
                  value={editData.comentarios_diseno}
                  onChange={(e) => setEditData({...editData, comentarios_diseno: e.target.value})}
                  placeholder="Agregar comentarios sobre el diseño..."
                  rows={3}
                  className="mt-2"
                />
              ) : (
                <div className="mt-2 p-3 bg-white border rounded-md min-h-[80px]">
                  {content.comentarios_diseno || 'Sin comentarios'}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="comentarios_copies" className="text-sm font-medium text-slate-700">
                Comentarios sobre los copies
              </Label>
              {isEditing ? (
                <Textarea
                  id="comentarios_copies"
                  value={editData.comentarios_copies}
                  onChange={(e) => setEditData({...editData, comentarios_copies: e.target.value})}
                  placeholder="Agregar comentarios sobre los copies..."
                  rows={3}
                  className="mt-2"
                />
              ) : (
                <div className="mt-2 p-3 bg-white border rounded-md min-h-[80px]">
                  {content.comentarios_copies || 'Sin comentarios'}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="copy_grafica_video" className="text-sm font-medium text-slate-700">
                Copy de la gráfica o video
              </Label>
              {isEditing ? (
                <Textarea
                  id="copy_grafica_video"
                  value={editData.copy_grafica_video}
                  onChange={(e) => setEditData({...editData, copy_grafica_video: e.target.value})}
                  placeholder="Agregar copy de la gráfica o video..."
                  rows={4}
                  className="mt-2"
                />
              ) : (
                <div className="mt-2 p-3 bg-white border rounded-md min-h-[100px]">
                  {content.copy_grafica_video || 'Sin copy'}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="copy_publicacion" className="text-sm font-medium text-slate-700">
                Copy de la publicación
              </Label>
              {isEditing ? (
                <Textarea
                  id="copy_publicacion"
                  value={editData.copy_publicacion}
                  onChange={(e) => setEditData({...editData, copy_publicacion: e.target.value})}
                  placeholder="Agregar copy de la publicación..."
                  rows={4}
                  className="mt-2"
                />
              ) : (
                <div className="mt-2 p-3 bg-white border rounded-md min-h-[100px]">
                  {content.copy_publicacion || 'Sin copy'}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Guardar Cambios
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
