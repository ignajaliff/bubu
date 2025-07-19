
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X } from 'lucide-react';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { pilares: string[], objetivos: string[] }) => void;
  loading: boolean;
}

export default function PresentationModal({ isOpen, onClose, onSubmit, loading }: PresentationModalProps) {
  const [pilares, setPilares] = useState<string[]>(['']);
  const [objetivos, setObjetivos] = useState<string[]>(['']);

  const addPilar = () => {
    setPilares([...pilares, '']);
  };

  const removePilar = (index: number) => {
    if (pilares.length > 1) {
      setPilares(pilares.filter((_, i) => i !== index));
    }
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
    if (objetivos.length > 1) {
      setObjetivos(objetivos.filter((_, i) => i !== index));
    }
  };

  const updateObjetivo = (index: number, value: string) => {
    const newObjetivos = [...objetivos];
    newObjetivos[index] = value;
    setObjetivos(newObjetivos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty values
    const filteredPilares = pilares.filter(p => p.trim() !== '');
    const filteredObjetivos = objetivos.filter(o => o.trim() !== '');
    
    if (filteredPilares.length === 0 || filteredObjetivos.length === 0) {
      alert('Por favor, complete al menos un pilar y un objetivo');
      return;
    }
    
    onSubmit({ pilares: filteredPilares, objetivos: filteredObjetivos });
  };

  const handleClose = () => {
    setPilares(['']);
    setObjetivos(['']);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Presentación de Contenidos</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pilares Section */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Pilares de Contenido</Label>
            <div className="space-y-3">
              {pilares.map((pilar, index) => (
                <div key={index} className="flex gap-2 items-center">
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPilar}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Pilar
              </Button>
            </div>
          </div>

          {/* Objetivos Section */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Objetivos</Label>
            <div className="space-y-3">
              {objetivos.map((objetivo, index) => (
                <div key={index} className="flex gap-2 items-center">
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjetivo}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Objetivo
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Generando...' : 'Crear Presentación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
