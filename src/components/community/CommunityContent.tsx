import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, Eye, FileText, ExternalLink } from 'lucide-react';
import ContentDetailsModal from './ContentDetailsModal';
import StatusChangeModal from './StatusChangeModal';
import PresentationModal from './PresentationModal';

interface CommunityContentItem {
  id: string;
  semana: string;
  fecha: string;
  tipo_publicacion: string;
  plataforma: string;
  pilar: string;
  referencia: string;
  copy_publicacion: string;
  comentarios_diseno: string;
  comentarios_copies: string;
  copy_grafica_video: string;
  estado_diseno: string;
  estado_copies: string;
  link: string;
}

export default function CommunityContent() {
  const { id: clientId } = useParams();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    semana: '',
    fecha: '',
    tipo_publicacion: '',
    plataforma: '',
    pilar: '',
    referencia: '',
    copy_publicacion: '',
    comentarios_diseno: '',
    comentarios_copies: '',
    copy_grafica_video: '',
    estado_diseno: 'Pendiente',
    estado_copies: 'Pendiente',
    link: ''
  });

  const { data: content = [], refetch } = useQuery({
    queryKey: ['community-content', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('community_content')
        .select('*')
        .eq('client_id', clientId)
        .order('fecha', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.semana.trim() || !formData.fecha.trim() || !formData.tipo_publicacion.trim() || !formData.plataforma.trim()) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('community_content')
        .insert([{
          ...formData,
          client_id: clientId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Contenido creado correctamente",
      });

      setIsDialogOpen(false);
      setFormData({
        semana: '',
        fecha: '',
        tipo_publicacion: '',
        plataforma: '',
        pilar: '',
        referencia: '',
        copy_publicacion: '',
        comentarios_diseno: '',
        comentarios_copies: '',
        copy_grafica_video: '',
        estado_diseno: 'Pendiente',
        estado_copies: 'Pendiente',
        link: ''
      });
      refetch();
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el contenido",
        variant: "destructive",
      });
    }
  };

  const handleOpenDetailsModal = (contentItem: any) => {
    setSelectedContent(contentItem);
    setIsDetailsModalOpen(true);
  };

  const handleOpenStatusModal = (contentItem: any) => {
    setSelectedContent(contentItem);
    setIsStatusModalOpen(true);
  };

  const handleCloseModals = () => {
    setSelectedContent(null);
    setIsDetailsModalOpen(false);
    setIsStatusModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Gestión de Contenidos</h2>
            <p className="opacity-90">Planifica y gestiona todo el contenido de redes sociales</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => setIsPresentationModalOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Crear Presentación
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-purple-600 hover:bg-gray-100">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Contenido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Contenido</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="semana">Semana</Label>
                      <Input
                        id="semana"
                        value={formData.semana}
                        onChange={(e) => setFormData({...formData, semana: e.target.value})}
                        placeholder="Número de semana"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="fecha">Fecha</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="tipo_publicacion">Tipo de Publicación</Label>
                      <Select value={formData.tipo_publicacion} onValueChange={(value) => setFormData({...formData, tipo_publicacion: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Post">Post</SelectItem>
                          <SelectItem value="Historia">Historia</SelectItem>
                          <SelectItem value="Reel">Reel</SelectItem>
                          <SelectItem value="Carrusel">Carrusel</SelectItem>
                          <SelectItem value="Video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="plataforma">Plataforma</Label>
                      <Select value={formData.plataforma} onValueChange={(value) => setFormData({...formData, plataforma: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar plataforma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="TikTok">TikTok</SelectItem>
                          <SelectItem value="Twitter">Twitter</SelectItem>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="pilar">Pilar de Contenido</Label>
                      <Input
                        id="pilar"
                        value={formData.pilar}
                        onChange={(e) => setFormData({...formData, pilar: e.target.value})}
                        placeholder="Ej: Educativo, Entretenimiento, Promocional"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="referencia">Referencia</Label>
                      <Input
                        id="referencia"
                        value={formData.referencia}
                        onChange={(e) => setFormData({...formData, referencia: e.target.value})}
                        placeholder="Link de referencia o idea original"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="copy_publicacion">Copy de Publicación</Label>
                      <Textarea
                        id="copy_publicacion"
                        value={formData.copy_publicacion}
                        onChange={(e) => setFormData({...formData, copy_publicacion: e.target.value})}
                        placeholder="Escribe el copy de la publicación"
                        rows={4}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="link">Link (opcional)</Label>
                      <Input
                        id="link"
                        type="url"
                        value={formData.link}
                        onChange={(e) => setFormData({...formData, link: e.target.value})}
                        placeholder="Enlace a la publicación (si aplica)"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Crear Contenido</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Lista de Contenido */}
      <div className="grid gap-4">
        {content.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow border-l-4 border-l-purple-400">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{item.tipo_publicacion} en {item.plataforma}</h3>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      Semana {item.semana}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{item.copy_publicacion?.substring(0, 100)}...</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(item.fecha).toLocaleDateString()}</span>
                    </div>
                    {item.pilar && (
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Pilar:</span>
                        <span>{item.pilar}</span>
                      </div>
                    )}
                    {item.referencia && (
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Ref:</span>
                        <span>{item.referencia}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <Button variant="secondary" size="sm" onClick={() => handleOpenDetailsModal(item)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    {item.link && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver Publicación
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <Button variant="outline" size="icon" onClick={() => handleOpenStatusModal(item)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.333 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.689-2.779-.217-2.779-1.643v-3.155a2.25 2.25 0 012.25-2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.476 1.114a.75.75 0 01-.793-.137l-1.433-.8c-.667-.37-.667-1.307 0-1.677l1.432-.799c.421-.212.585-.674.476-1.114l-1.105-4.423c-.125-.501-.575-.852-1.091-.852H6.75a2.25 2.25 0 01-2.25-2.25V5.653z" clipRule="evenodd" /></svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {content.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <div className="text-slate-400 text-lg mb-2">No hay contenido creado</div>
          <p className="text-slate-500">Crea el primer contenido para comenzar</p>
        </div>
      )}

      <ContentDetailsModal
        content={selectedContent}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        onUpdate={refetch}
      />

      <StatusChangeModal
        content={selectedContent}
        isOpen={isStatusModalOpen}
        onClose={handleCloseModals}
        onUpdate={refetch}
      />

      {/* Presentation Modal */}
      <PresentationModal 
        isOpen={isPresentationModalOpen}
        onClose={() => setIsPresentationModalOpen(false)}
      />
    </div>
  );
}
