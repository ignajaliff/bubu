
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';
import CommunityContent from '@/components/community/CommunityContent';

export default function ClientCommunity() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const hash = location.hash.replace('#', '');
    return hash || 'content';
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
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Contenidos</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Calendario</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-8">
          <CommunityContent />
        </TabsContent>

        <TabsContent value="calendar" className="mt-8">
          <WeeklyCalendar area="Community" />
        </TabsContent>

      </Tabs>
    </div>
  );
}
