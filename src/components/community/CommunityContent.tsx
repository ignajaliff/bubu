import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye, RefreshCw, FileText, ExternalLink } from 'lucide-react';
import ContentDetailsModal from './ContentDetailsModal';
import StatusChangeModal from './StatusChangeModal';
import PresentationModal from './PresentationModal';

interface CommunityContentRow {
  id: string;
  semana: string;
  fecha: string;
  link: string;
  disenadora: string;
  estado_diseno: string;
  comentarios_diseno: string;
  estado_copies: string;
  comentarios_copies: string;
  tipo_publicacion: string;
  plataforma: string;
  pilar: string;
  referencia: string;
  copy_grafica_video: string;
  copy_publicacion: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

interface PresentationLink {
  id: string;
  client_id: string;
  link: string;
  pilares: string[];
  objetivos: string[];
  created_at: string;
}

export default function CommunityContent() {
  const { id: clientId } = useParams();
  const { toast } = useToast();
  const [content, setContent] = useState<CommunityContentRow[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [presentationLinks, setPresentationLinks] = useState<PresentationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  
  // Estados para los modales
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; content: CommunityContentRow | null }>({ isOpen: false, content: null });
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; content: CommunityContentRow | null }>({ isOpen: false, content: null });

  const [formData, setFormData] = useState({
    semana: '',
    fecha: '',
    link: '',
    disenadora: '',
    estado_diseno: 'Para diseñar',
    comentarios_diseno: '',
    estado_copies: 'Para revisar',
    comentarios_copies: '',
    tipo_publicacion: '',
    plataforma: '',
    pilar: '',
    referencia: '',
    copy_grafica_video: '',
    copy_publicacion: ''
  });

  const [presentationModal, setPresentationModal] = useState({ isOpen: false });
  const [generatingPresentation, setGeneratingPresentation] = useState(false);

  useEffect(() => {
    fetchContent();
    fetchUsers();
    fetchPresentationLinks();
  }, [clientId]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('community_content')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el contenido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPresentationLinks = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_presentation_links', { client_id_param: clientId });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        client_id: item.client_id,
        link: item.link,
        pilares: Array.isArray(item.pilares) ? item.pilares : [],
        objetivos: Array.isArray(item.objetivos) ? item.objetivos : [],
        created_at: item.created_at
      }));
      
      setPresentationLinks(transformedData);
    } catch (error) {
      console.error('Error fetching presentation links:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        description: "Contenido agregado correctamente",
      });

      setIsOpen(false);
      setFormData({
        semana: '',
        fecha: '',
        link: '',
        disenadora: '',
        estado_diseno: 'Para diseñar',
        comentarios_diseno: '',
        estado_copies: 'Para revisar',
        comentarios_copies: '',
        tipo_publicacion: '',
        plataforma: '',
        pilar: '',
        referencia: '',
        copy_grafica_video: '',
        copy_publicacion: ''
      });
      fetchContent();
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el contenido",
        variant: "destructive",
      });
    }
  };

  const refreshContent = () => {
    fetchContent();
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.pilar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.semana.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.estado_diseno === statusFilter;
    const matchesPlatform = platformFilter === 'all' || item.plataforma === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  const handleCreatePresentation = async (data: { pilares: string[], objetivos: string[] }) => {
    setGeneratingPresentation(true);
    
    try {
      // Generate a unique ID for the presentation
      const presentationId = crypto.randomUUID();
      
      // Create the presentation record using raw SQL
      const { error } = await supabase.rpc('create_presentation_link', {
        link_id: presentationId,
        client_id_param: clientId,
        link_url: `/presentation/${presentationId}`,
        pilares_data: data.pilares,
        objetivos_data: data.objetivos,
        created_by_user: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Presentación creada correctamente",
      });

      // Refresh presentation links
      fetchPresentationLinks();

      // Open the presentation in a new tab
      window.open(`/presentation/${presentationId}`, '_blank');
      
      setPresentationModal({ isOpen: false });
    } catch (error) {
      console.error('Error creating presentation:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la presentación",
        variant: "destructive",
      });
    } finally {
      setGeneratingPresentation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Simplified style */}
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Gestión de Contenidos</h2>
        <p className="text-gray-600">Administra y supervisa todo el contenido de redes sociales</p>
      </div>

      {/* Presentation Links Section */}
      {presentationLinks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Presentaciones Creadas</h3>
          <div className="space-y-3">
            {presentationLinks.map((presentation) => (
              <div key={presentation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">
                    Presentación del {new Date(presentation.created_at).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {presentation.pilares.length} pilares • {presentation.objetivos.length} objetivos
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(presentation.link, '_blank')}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Presentación
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros y búsqueda con mejor diseño */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por pilar, referencia o semana..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 md:w-80 border-2 focus:border-purple-400"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 border-2 focus:border-purple-400">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado del diseño" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Para diseñar">Para diseñar</SelectItem>
                <SelectItem value="Para Revisar">Para Revisar</SelectItem>
                <SelectItem value="Para Corregir">Para Corregir</SelectItem>
                <SelectItem value="Aprobado">Aprobado</SelectItem>
                <SelectItem value="Publicado">Publicado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40 border-2 focus:border-purple-400">
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Contenido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Contenido</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="semana">Semana</Label>
                    <Select value={formData.semana} onValueChange={(value) => setFormData({...formData, semana: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar semana" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Semana 1">Semana 1</SelectItem>
                        <SelectItem value="Semana 2">Semana 2</SelectItem>
                        <SelectItem value="Semana 3">Semana 3</SelectItem>
                        <SelectItem value="Semana 4">Semana 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="link">Link</Label>
                    <Input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="disenadora">Diseñadora</Label>
                    <Select value={formData.disenadora} onValueChange={(value) => setFormData({...formData, disenadora: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar diseñadora" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tipo_publicacion">Tipo de Publicación</Label>
                    <Select value={formData.tipo_publicacion} onValueChange={(value) => setFormData({...formData, tipo_publicacion: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Historia">Historia</SelectItem>
                        <SelectItem value="Historia (2)">Historia (2)</SelectItem>
                        <SelectItem value="Historia (3)">Historia (3)</SelectItem>
                        <SelectItem value="Post">Post</SelectItem>
                        <SelectItem value="Carrusel">Carrusel</SelectItem>
                        <SelectItem value="Carrusel (1)">Carrusel (1)</SelectItem>
                        <SelectItem value="Carrusel (3)">Carrusel (3)</SelectItem>
                        <SelectItem value="Carrusel (4)">Carrusel (4)</SelectItem>
                        <SelectItem value="Reel">Reel</SelectItem>
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pilar">Pilar</Label>
                    <Input
                      value={formData.pilar}
                      onChange={(e) => setFormData({...formData, pilar: e.target.value})}
                      placeholder="Ingrese el pilar"
                    />
                  </div>

                  <div>
                    <Label htmlFor="referencia">Referencia</Label>
                    <Input
                      value={formData.referencia}
                      onChange={(e) => setFormData({...formData, referencia: e.target.value})}
                      placeholder="Ingrese la referencia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comentarios_diseno">Comentarios sobre el diseño</Label>
                    <Textarea
                      value={formData.comentarios_diseno}
                      onChange={(e) => setFormData({...formData, comentarios_diseno: e.target.value})}
                      placeholder="Comentarios sobre el diseño..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="comentarios_copies">Comentarios sobre los copies</Label>
                    <Textarea
                      value={formData.comentarios_copies}
                      onChange={(e) => setFormData({...formData, comentarios_copies: e.target.value})}
                      placeholder="Comentarios sobre los copies..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="copy_grafica_video">Copy de la gráfica o video</Label>
                    <Textarea
                      value={formData.copy_grafica_video}
                      onChange={(e) => setFormData({...formData, copy_grafica_video: e.target.value})}
                      placeholder="Copy de la gráfica o video..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="copy_publicacion">Copy de la publicación</Label>
                    <Textarea
                      value={formData.copy_publicacion}
                      onChange={(e) => setFormData({...formData, copy_publicacion: e.target.value})}
                      placeholder="Copy de la publicación..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar Contenido</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabla con mejor diseño */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Semana</TableHead>
                <TableHead className="font-semibold text-slate-700">Fecha</TableHead>
                <TableHead className="font-semibold text-slate-700">Tipo</TableHead>
                <TableHead className="font-semibold text-slate-700">Plataforma</TableHead>
                <TableHead className="font-semibold text-slate-700">Estado Diseño</TableHead>
                <TableHead className="font-semibold text-slate-700">Estado Copies</TableHead>
                <TableHead className="font-semibold text-slate-700">Pilar</TableHead>
                <TableHead className="font-semibold text-slate-700">Diseñadora</TableHead>
                <TableHead className="font-semibold text-slate-700">Link</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item, index) => (
                <TableRow key={item.id} className={`hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                  <TableCell className="font-medium text-slate-900">{item.semana}</TableCell>
                  <TableCell className="text-slate-700">{new Date(item.fecha).toLocaleDateString()}</TableCell>
                  <TableCell className="text-slate-700">{item.tipo_publicacion}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.plataforma === 'Instagram' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.plataforma}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.estado_diseno === 'Aprobado' ? 'bg-green-100 text-green-800' :
                      item.estado_diseno === 'Publicado' ? 'bg-emerald-100 text-emerald-800' :
                      item.estado_diseno === 'Para Corregir' ? 'bg-red-100 text-red-800' :
                      item.estado_diseno === 'Para Revisar' ? 'bg-yellow-100 text-yellow-800' :
                      item.estado_diseno === 'Cancelado' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.estado_diseno}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.estado_copies === 'Aprobado' ? 'bg-green-100 text-green-800' :
                      item.estado_copies === 'Para corregir' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.estado_copies}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-700">{item.pilar}</TableCell>
                  <TableCell className="text-slate-700">
                    {users.find(u => u.id === item.disenadora)?.full_name || 
                     users.find(u => u.id === item.disenadora)?.email || 
                     'No asignado'}
                  </TableCell>
                  <TableCell>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                        Ver link
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailsModal({ isOpen: true, content: item })}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver detalles
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStatusModal({ isOpen: true, content: item })}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Cambiar estados
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <div className="text-slate-400 text-lg mb-2">No se encontraron contenidos</div>
          <p className="text-slate-500">Intenta ajustar los filtros o agregar nuevo contenido</p>
        </div>
      )}

      {/* Create Presentation Section - Simplified style */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Crear Presentación</h3>
          <p className="text-gray-600 mb-4">
            Genera una presentación profesional con todo el contenido planificado
          </p>
          <Button
            onClick={() => setPresentationModal({ isOpen: true })}
            disabled={content.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Crear Presentación
          </Button>
          {content.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Necesitas tener contenido cargado para crear una presentación
            </p>
          )}
        </div>
      </div>

      {/* Modales */}
      <ContentDetailsModal
        content={detailsModal.content}
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, content: null })}
        onUpdate={refreshContent}
      />

      <StatusChangeModal
        content={statusModal.content}
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, content: null })}
        onUpdate={refreshContent}
      />

      {/* New Presentation Modal */}
      <PresentationModal
        isOpen={presentationModal.isOpen}
        onClose={() => setPresentationModal({ isOpen: false })}
        onSubmit={handleCreatePresentation}
        loading={generatingPresentation}
      />
    </div>
  );
}
