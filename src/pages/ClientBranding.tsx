
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Image, Type, Calendar as CalendarIcon } from 'lucide-react';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';

export default function ClientBranding() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const hash = location.hash.replace('#', '');
    return hash || 'elements';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`${location.pathname}#${value}`, { replace: true });
  };

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="elements" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Elementos</span>
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center space-x-2">
            <Image className="h-4 w-4" />
            <span>Assets</span>
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="flex items-center space-x-2">
            <Type className="h-4 w-4" />
            <span>Guías</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Calendario</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="mt-8">
          <div className="text-center py-12">
            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Elementos de Branding</h3>
            <p className="text-gray-600">Aquí se mostrarán los elementos de branding del cliente</p>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-8">
          <div className="text-center py-12">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Assets Visuales</h3>
            <p className="text-gray-600">Aquí se mostrarán los assets visuales del cliente</p>
          </div>
        </TabsContent>

        <TabsContent value="guidelines" className="mt-8">
          <div className="text-center py-12">
            <Type className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Guías de Estilo</h3>
            <p className="text-gray-600">Aquí se mostrarán las guías de estilo del cliente</p>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-8">
          <WeeklyCalendar area="Branding" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
