
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Target, 
  Users, 
  Calendar,
  FileText,
  Palette,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { getProject } from '@/services/localStorage';

const clientMetrics = [
  {
    title: "Campañas Activas",
    value: 3,
    subtitle: "2 performance, 1 awareness",
    icon: Target,
    trend: { value: 15, isPositive: true },
    color: 'blue' as const
  },
  {
    title: "ROI Promedio",
    value: "4.2x",
    subtitle: "Último trimestre",
    icon: TrendingUp,
    trend: { value: 8, isPositive: true },
    color: 'green' as const
  },
  {
    title: "Engagement Rate",
    value: "6.8%",
    subtitle: "Redes sociales",
    icon: MessageSquare,
    trend: { value: 12, isPositive: true },
    color: 'purple' as const
  },
  {
    title: "Próximas Entregas",
    value: 5,
    subtitle: "Esta semana",
    icon: Calendar,
    color: 'orange' as const
  }
];

const activeCampaigns = [
  {
    name: "Google Ads - Performance",
    type: "PPC",
    status: "active",
    progress: 75,
    budget: "€5,000",
    performance: "ROAS 4.2x"
  },
  {
    name: "Facebook Ads - Awareness",
    type: "Social",
    status: "active", 
    progress: 45,
    budget: "€3,500",
    performance: "Reach 50K"
  },
  {
    name: "Email Marketing",
    type: "Email",
    status: "active",
    progress: 90,
    budget: "€800",
    performance: "Open Rate 24%"
  }
];

const upcomingDeliverables = [
  { title: "Reporte mensual Google Ads", deadline: "Mañana", priority: "high", type: "Marketing" },
  { title: "Diseños campaña Black Friday", deadline: "3 días", priority: "high", type: "Branding" },
  { title: "Content Calendar Diciembre", deadline: "1 semana", priority: "medium", type: "Community" },
  { title: "Análisis competencia", deadline: "1 semana", priority: "low", type: "Marketing" }
];

export default function ClientDashboard() {
  const { id } = useParams<{ id: string }>();
  const client = id ? getProject(id) : null;

  if (!client) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-muted-foreground">Cliente no encontrado</h2>
      </div>
    );
  }

  const getMetricIcon = (IconComponent: any, color: string) => {
    const colorClasses = {
      blue: 'text-blue-500',
      green: 'text-green-500', 
      purple: 'text-purple-500',
      orange: 'text-orange-500'
    };
    return <IconComponent className={`h-5 w-5 ${colorClasses[color as keyof typeof colorClasses]}`} />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header del Cliente */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
          <p className="text-muted-foreground mt-1">{client.client}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className="bg-accent text-accent-foreground">
            Activo
          </Badge>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Progreso General</div>
            <div className="flex items-center space-x-2 mt-1">
              <Progress value={client.progress} className="w-32" />
              <span className="text-sm font-medium">{client.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas del Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {clientMetrics.map((metric, index) => (
          <Card key={index} className="arch-card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                {getMetricIcon(metric.icon, metric.color)}
                {metric.trend && (
                  <div className={`flex items-center text-xs ${
                    metric.trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {metric.trend.value}%
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.title}</p>
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sección Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campañas Activas */}
        <div className="lg:col-span-2">
          <Card className="arch-card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Campañas Activas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCampaigns.map((campaign, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">{campaign.type}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Activa
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Progreso</span>
                      <span className="text-sm font-medium">{campaign.progress}%</span>
                    </div>
                    <Progress value={campaign.progress} className="mb-3" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Presupuesto: {campaign.budget}</span>
                      <span className="font-medium text-green-600">{campaign.performance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximas Entregas */}
        <div>
          <Card className="arch-card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Próximas Entregas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeliverables.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      item.priority === 'high' ? 'bg-destructive' :
                      item.priority === 'medium' ? 'bg-arch-warning' : 'bg-accent'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-muted-foreground">{item.deadline}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
