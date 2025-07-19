
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Search, Filter, Download, Eye, Folder, Image, FileType } from 'lucide-react';

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const mockDocuments = [
    {
      id: "doc1",
      name: "Planta Arquitectónica General - Marina",
      type: "plan",
      format: "DWG",
      size: "2.4 MB",
      uploadDate: "2024-03-15",
      project: "Complejo Residencial Marina",
      uploadedBy: "Ana García",
      version: "v2.1"
    },
    {
      id: "doc2",
      name: "Estructura Torre A - Marina",
      type: "plan",
      format: "DWG",
      size: "3.2 MB",
      uploadDate: "2024-04-02",
      project: "Complejo Residencial Marina",
      uploadedBy: "Luis Martín",
      version: "v1.3"
    },
    {
      id: "doc3",
      name: "Memoria Técnica - Centro Comercial",
      type: "document",
      format: "PDF",
      size: "1.8 MB",
      uploadDate: "2024-05-10",
      project: "Centro Comercial Norte",
      uploadedBy: "Carlos Ruiz",
      version: "v1.0"
    },
    {
      id: "doc4",
      name: "Renders Exteriores - Marina",
      type: "image",
      format: "JPG",
      size: "8.5 MB",
      uploadDate: "2024-06-15",
      project: "Complejo Residencial Marina",
      uploadedBy: "María Santos",
      version: "Final"
    },
    {
      id: "doc5",
      name: "Especificaciones Técnicas",
      type: "document",
      format: "DOCX",
      size: "956 KB",
      uploadDate: "2024-07-20",
      project: "Centro Comercial Norte",
      uploadedBy: "Sara López",
      version: "v2.0"
    },
    {
      id: "doc6",
      name: "Instalaciones Eléctricas - Planta",
      type: "plan",
      format: "DWG",
      size: "1.7 MB",
      uploadDate: "2024-08-05",
      project: "Complejo Residencial Marina",
      uploadedBy: "Sara López",
      version: "v1.1"
    }
  ];

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string, format: string) => {
    switch (type) {
      case 'plan':
        return <FileType className="h-5 w-5 text-primary" />;
      case 'image':
        return <Image className="h-5 w-5 text-accent" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'plan': return 'Plano';
      case 'image': return 'Imagen';
      case 'document': return 'Documento';
      default: return 'Archivo';
    }
  };

  const documentTypes = [
    { key: "all", label: "Todos", count: mockDocuments.length },
    { key: "plan", label: "Planos", count: mockDocuments.filter(d => d.type === 'plan').length },
    { key: "document", label: "Documentos", count: mockDocuments.filter(d => d.type === 'document').length },
    { key: "image", label: "Imágenes", count: mockDocuments.filter(d => d.type === 'image').length }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Biblioteca de Documentos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todos los archivos y documentos de tus proyectos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Folder className="h-4 w-4 mr-2" />
            Nueva Carpeta
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Subir Archivo
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{mockDocuments.length}</div>
            <div className="text-sm text-muted-foreground">Archivos Totales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {mockDocuments.filter(d => d.type === 'plan').length}
            </div>
            <div className="text-sm text-muted-foreground">Planos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {Math.round(mockDocuments.reduce((sum, doc) => {
                const size = parseFloat(doc.size.replace(/[^\d.]/g, ''));
                return sum + (doc.size.includes('MB') ? size : size / 1000);
              }, 0) * 10) / 10}
            </div>
            <div className="text-sm text-muted-foreground">MB Almacenados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">2</div>
            <div className="text-sm text-muted-foreground">Proyectos Activos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {documentTypes.map((type) => (
              <Badge
                key={type.key}
                variant={typeFilter === type.key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTypeFilter(type.key)}
              >
                {type.label} ({type.count})
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  {getTypeIcon(doc.type, doc.format)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {doc.format}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(doc.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      <span>{doc.project}</span>
                      <span>•</span>
                      <span>Subido por {doc.uploadedBy}</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.version}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron documentos</h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar los filtros o sube nuevos archivos
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Subir Primer Archivo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
