
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, CheckSquare, Calendar as CalendarIcon } from 'lucide-react';
import MarketingCampaigns from '@/components/marketing/MarketingCampaigns';
import MarketingTasks from '@/components/marketing/MarketingTasks';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';

export default function ClientMarketing() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get active tab from URL hash or default to campaigns
  const getActiveTab = () => {
    const hash = location.hash.replace('#', '');
    return hash || 'campaigns';
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
    navigate(`${location.pathname}#${value}`, {
      replace: true
    });
  };
  
  return (
    <div className="space-y-8">
      {/* Sub-navegación con tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="campaigns" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Campañas</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4" />
            <span>Tareas</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Calendario</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-6">
          <MarketingCampaigns />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <MarketingTasks />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <WeeklyCalendar area="Marketing" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
