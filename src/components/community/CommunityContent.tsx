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
import { Plus, Search, Filter } from 'lucide-react';

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

export default function CommunityContent() {
  const { id: clientId } = useParams();
  const { toast } = useToast();
  const [content, setContent] = useState<CommunityContentRow[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

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

  useEffect(() => {
    fetchContent();
    fetchUsers();
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

  const filteredContent = content.filter(item => {
    const matchesSearch = item.pilar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.semana.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.estado_diseno === statusFilter;
    const matchesPlatform = !platformFilter || item.plataforma === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por pilar, referencia o semana..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 md:w-80"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Estado del diseño" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              <SelectItem value="Para diseñar">Para diseñar</SelectItem>
              <SelectItem value="Para Revisar">Para Revisar</SelectItem>
              <SelectItem value="Para Corregir">Para Corregir</SelectItem>
              <SelectItem value="Aprobado">Aprobado</SelectItem>
              <SelectItem value="Publicado">Publicado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
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

      {/* Tabla */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semana</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Estado Diseño</TableHead>
                <TableHead>Estado Copies</TableHead>
                <TableHead>Pilar</TableHead>
                <TableHead>Diseñadora</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.semana}</TableCell>
                  <TableCell>{new Date(item.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{item.tipo_publicacion}</TableCell>
                  <TableCell>{item.plataforma}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.estado_diseno === 'Aprobado' ? 'bg-green-100 text-green-800' :
                      item.estado_diseno === 'Para Corregir' ? 'bg-red-100 text-red-800' :
                      item.estado_diseno === 'Para Revisar' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.estado_diseno}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.estado_copies === 'Aprobado' ? 'bg-green-100 text-green-800' :
                      item.estado_copies === 'Para corregir' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.estado_copies}
                    </span>
                  </TableCell>
                  <TableCell>{item.pilar}</TableCell>
                  <TableCell>
                    {users.find(u => u.id === item.disenadora)?.full_name || 
                     users.find(u => u.id === item.disenadora)?.email || 
                     'No asignado'}
                  </TableCell>
                  <TableCell>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Ver link
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron contenidos
        </div>
      )}
    </div>
  );
}