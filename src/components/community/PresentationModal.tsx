
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from 'react-router-dom';
import { FileText, Plus, X } from 'lucide-react';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PresentationModal({ isOpen, onClose }: PresentationModalProps) {
  const { id: clientId } = useParams();
  const { toast } = useToast();
  const [pilares, setPilares] = useState<string[]>(['']);
  const [objetivos, setObjetivos] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const addPilar = () => {
    setPilares([...pilares, '']);
  };

  const removePilar = (index: number) => {
    setPilares(pilares.filter((_, i) => i !== index));
  };

  const updatePilar = (index: number, value: string) => {
    const newPilares = [...pilares];
    newPilares[index] = value;
    setPilares(newPilares);
  };

  const addObjetivo = () => {
    setObjetivos([...objetivos, '']);
  };

  const removeObjetivo = (index: number) => {
    setObjetivos(objetivos.filter((_, i) => i !== index));
  };

  const updateObjetivo = (index: number, value: string) => {
    const newObjetivos = [...objetivos];
    newObjetivos[index] = value;
    setObjetivos(newObjetivos);
  };

  const generatePresentation = async () => {
    if (!clientId) return;

    setIsLoading(true);
    try {
      // Filter out empty values
      const filteredPilares = pilares.filter(p => p.trim() !== '');
      const filteredObjetivos = objetivos.filter(o => o.trim() !== '');

      if (filteredPilares.length === 0 || filteredObjetivos.length === 0) {
        toast({
          title: "Error",
          description: "Debes agregar al menos un pilar y un objetivo",
          variant: "destructive",
        });
        return;
      }

      // Get community content data
      const { data: contentData, error: contentError } = await supabase
        .from('community_content')
        .select('*')
        .eq('client_id', clientId)
        .order('fecha', { ascending: true });

      if (contentError) throw contentError;

      // Generate unique link ID
      const linkId = crypto.randomUUID();
      
      // Store the presentation data
      const { error: insertError } = await supabase
        .from('links_temporales')
        .insert({
          id: linkId,
          client_id: clientId,
          link: `/presentation/${linkId}`,
          pilares: filteredPilares,
          objetivos: filteredObjetivos,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (insertError) throw insertError;

      // Generate the presentation link
      const presentationUrl = `${window.location.origin}/presentation/${linkId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(presentationUrl);

      toast({
        title: "¡Presentación creada!",
        description: "El enlace ha sido copiado al portapapeles",
      });

      // Reset form and close modal
      setPilares(['']);
      setObjetivos(['']);
      onClose();

    } catch (error) {
      console.error('Error generating presentation:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la presentación",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Crear Presentación</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pilares Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Pilares de Contenido</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPilar}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {pilares.map((pilar, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={pilar}
                    onChange={(e) => updatePilar(index, e.target.value)}
                    placeholder={`Pilar ${index + 1}`}
                    className="flex-1"
                  />
                  {pilares.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePilar(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Objetivos Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Objetivos</Label>
              <Button type="button" variant="outline" size="sm" onClick={addObjetivo}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {objetivos.map((objetivo, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={objetivo}
                    onChange={(e) => updateObjetivo(index, e.target.value)}
                    placeholder={`Objetivo ${index + 1}`}
                    className="flex-1"
                  />
                  {objetivos.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeObjetivo(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={generatePresentation} 
              disabled={isLoading}
            >
              {isLoading ? "Generando..." : "Crear Presentación"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
