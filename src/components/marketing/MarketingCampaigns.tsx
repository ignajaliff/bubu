
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Target, Plus, Edit, BarChart3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NewCampaign {
  title: string;
  campaign_type: string;
  budget: string;
  target_audience: string;
  start_date: string;
  end_date: string;
  responsible_user: string;
  accountable_user: string;
  consulted_users: string;
  description: string;
}

interface MetricsUpdate {
  roi_percentage: string;
  conversions: string;
  ctr_percentage: string;
  metrics_period_start: string;
  metrics_period_end: string;
}

export default function MarketingCampaigns() {
  const { id: clientId } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMetricsDialogOpen, setIsMetricsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  const [newCampaign, setNewCampaign] = useState<NewCampaign>({
    title: '',
    campaign_type: '',
    budget: '',
    target_audience: '',
    start_date: '',
    end_date: '',
    responsible_user: '',
    accountable_user: '',
    consulted_users: '',
    description: ''
  });

  const [metricsUpdate, setMetricsUpdate] = useState<MetricsUpdate>({
    roi_percentage: '',
    conversions: '',
    ctr_percentage: '',
    metrics_period_start: '',
    metrics_period_end: ''
  });

  // Obtener campañas
  const { data: campaigns = [] } = useQuery({
    queryKey: ['marketing-campaigns', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_task_camp')
        .select(`
          *,
          responsible_user_profile:user_profiles!responsible_user(full_name),
          accountable_user_profile:user_profiles!accountable_user(full_name)
        `)
        .eq('client_id', clientId)
        .eq('info_type', 'campaign')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  // Obtener usuarios para asignación
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Crear campaña
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const { data, error } = await supabase
        .from('marketing_task_camp')
        .insert([campaignData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns', clientId] });
      toast({
        title: "Campaña creada",
        description: "La campaña se ha creado exitosamente.",
      });
      setIsDialogOpen(false);
      setNewCampaign({
        title: '',
        campaign_type: '',
        budget: '',
        target_audience: '',
        start_date: '',
        end_date: '',
        responsible_user: '',
        accountable_user: '',
        consulted_users: '',
        description: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la campaña.",
        variant: "destructive",
      });
    },
  });

  // Actualizar métricas
  const updateMetricsMutation = useMutation({
    mutationFn: async ({ campaignId, metrics }: { campaignId: string, metrics: any }) => {
      const { data, error } = await supabase
        .from('marketing_task_camp')
        .update({
          ...metrics,
          metrics_updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns', clientId] });
      toast({
        title: "Métricas actualizadas",
        description: "Las métricas se han actualizado exitosamente.",
      });
      setIsMetricsDialogOpen(false);
      setSelectedCampaign(null);
      setMetricsUpdate({
        roi_percentage: '',
        conversions: '',
        ctr_percentage: '',
        metrics_period_start: '',
        metrics_period_end: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las métricas.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'Completada';
      case 'in_progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      case 'in_review': return 'En Revisión';
      default: return 'Estado';
    }
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.title || !newCampaign.campaign_type) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    const campaignData = {
      client_id: clientId,
      info_type: 'campaign',
      title: newCampaign.title,
      description: newCampaign.description,
      campaign_type: newCampaign.campaign_type,
      budget: newCampaign.budget ? parseFloat(newCampaign.budget) : null,
      target_audience: newCampaign.target_audience,
      start_date: newCampaign.start_date || null,
      end_date: newCampaign.end_date || null,
      responsible_user: newCampaign.responsible_user || null,
      accountable_user: newCampaign.accountable_user || null,
      consulted_users: newCampaign.consulted_users ? [newCampaign.consulted_users] : [],
      status: 'pending',
      priority: 'medium',
      created_by: profile?.id
    };

    createCampaignMutation.mutate(campaignData);
  };

  const handleUpdateMetrics = () => {
    if (!selectedCampaign || !metricsUpdate.roi_percentage || !metricsUpdate.conversions || !metricsUpdate.ctr_percentage) {
      toast({
        title: "Error",
        description: "Por favor completa todas las métricas.",
        variant: "destructive",
      });
      return;
    }

    const metrics = {
      roi_percentage: parseFloat(metricsUpdate.roi_percentage),
      conversions: parseInt(metricsUpdate.conversions),
      ctr_percentage: parseFloat(metricsUpdate.ctr_percentage),
      metrics_period_start: metricsUpdate.metrics_period_start || selectedCampaign.start_date,
      metrics_period_end: metricsUpdate.metrics_period_end || new Date().toISOString().split('T')[0]
    };

    updateMetricsMutation.mutate({ campaignId: selectedCampaign.id, metrics });
  };

  const openMetricsDialog = (campaign: any) => {
    setSelectedCampaign(campaign);
    setMetricsUpdate({
      roi_percentage: campaign.roi_percentage?.toString() || '',
      conversions: campaign.conversions?.toString() || '',
      ctr_percentage: campaign.ctr_percentage?.toString() || '',
      metrics_period_start: campaign.metrics_period_start || campaign.start_date || '',
      metrics_period_end: campaign.metrics_period_end || new Date().toISOString().split('T')[0]
    });
    setIsMetricsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Campañas Activas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Campaña</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Nombre de la Campaña *</Label>
                  <Input
                    id="title"
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                    placeholder="Ej: Campaña Black Friday"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign_type">Tipo de Campaña *</Label>
                  <Select value={newCampaign.campaign_type} onValueChange={(value) => setNewCampaign({...newCampaign, campaign_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lanzamiento de producto">Lanzamiento de producto</SelectItem>
                      <SelectItem value="Promocional">Promocional</SelectItem>
                      <SelectItem value="Awareness">Awareness</SelectItem>
                      <SelectItem value="Retargeting">Retargeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Presupuesto</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="target_audience">Audiencia Objetivo</Label>
                  <Input
                    id="target_audience"
                    value={newCampaign.target_audience}
                    onChange={(e) => setNewCampaign({...newCampaign, target_audience: e.target.value})}
                    placeholder="Ej: Mujeres 25-45 años"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Fecha de Inicio</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newCampaign.start_date}
                    onChange={(e) => setNewCampaign({...newCampaign, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Fecha de Fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newCampaign.end_date}
                    onChange={(e) => setNewCampaign({...newCampaign, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Matriz RACI</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="responsible_user" className="text-sm">Responsable (R)</Label>
                    <Select value={newCampaign.responsible_user} onValueChange={(value) => setNewCampaign({...newCampaign, responsible_user: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Quien ejecuta" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="accountable_user" className="text-sm">Aprobador (A)</Label>
                    <Select value={newCampaign.accountable_user} onValueChange={(value) => setNewCampaign({...newCampaign, accountable_user: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Quien aprueba" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="consulted_users" className="text-sm">Consultado (C)</Label>
                    <Select value={newCampaign.consulted_users} onValueChange={(value) => setNewCampaign({...newCampaign, consulted_users: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Quien consulta" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  placeholder="Describe los objetivos y estrategia de la campaña..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCampaign} disabled={createCampaignMutation.isPending}>
                {createCampaignMutation.isPending ? 'Creando...' : 'Crear Campaña'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog para actualizar métricas */}
      <Dialog open={isMetricsDialogOpen} onOpenChange={setIsMetricsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Métricas</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="roi">ROI (%)</Label>
              <Input
                id="roi"
                type="number"
                step="0.01"
                value={metricsUpdate.roi_percentage}
                onChange={(e) => setMetricsUpdate({...metricsUpdate, roi_percentage: e.target.value})}
                placeholder="15.5"
              />
            </div>
            <div>
              <Label htmlFor="conversions">Conversiones</Label>
              <Input
                id="conversions"
                type="number"
                value={metricsUpdate.conversions}
                onChange={(e) => setMetricsUpdate({...metricsUpdate, conversions: e.target.value})}
                placeholder="1247"
              />
            </div>
            <div>
              <Label htmlFor="ctr">CTR (%)</Label>
              <Input
                id="ctr"
                type="number"
                step="0.01"
                value={metricsUpdate.ctr_percentage}
                onChange={(e) => setMetricsUpdate({...metricsUpdate, ctr_percentage: e.target.value})}
                placeholder="2.3"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="period_start">Desde</Label>
                <Input
                  id="period_start"
                  type="date"
                  value={metricsUpdate.metrics_period_start}
                  onChange={(e) => setMetricsUpdate({...metricsUpdate, metrics_period_start: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="period_end">Hasta</Label>
                <Input
                  id="period_end"
                  type="date"
                  value={metricsUpdate.metrics_period_end}
                  onChange={(e) => setMetricsUpdate({...metricsUpdate, metrics_period_end: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsMetricsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateMetrics} disabled={updateMetricsMutation.isPending}>
              {updateMetricsMutation.isPending ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="arch-card-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{campaign.campaign_type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(campaign.status)}>
                    {getStatusLabel(campaign.status)}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => openMetricsDialog(campaign)}>
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Métricas principales */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        ${campaign.budget ? campaign.budget.toLocaleString() : '0'}
                      </div>
                      <div className="text-xs text-muted-foreground">Presupuesto</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {campaign.roi_percentage ? `${campaign.roi_percentage}%` : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">ROI</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {campaign.conversions || '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">Conversiones</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {campaign.ctr_percentage ? `${campaign.ctr_percentage}%` : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">CTR</div>
                    </div>
                  </div>

                  {campaign.metrics_updated_at && (
                    <div className="text-sm text-gray-500 mb-2">
                      Métricas del {campaign.metrics_period_start ? new Date(campaign.metrics_period_start).toLocaleDateString() : 'inicio'} 
                      {' '} al {campaign.metrics_period_end ? new Date(campaign.metrics_period_end).toLocaleDateString() : 'hoy'}
                      <div className="text-xs">
                        Última actualización: {new Date(campaign.metrics_updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso de campaña</span>
                      <span className="font-medium">{campaign.progress || 0}%</span>
                    </div>
                    <Progress value={campaign.progress || 0} className="h-2" />
                  </div>
                </div>

                {/* Información adicional */}
                <div className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha:</span>
                      <span>
                        {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Sin fecha'} - {' '}
                        {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Sin fecha'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Audiencia:</span>
                      <span>{campaign.target_audience || 'No definida'}</span>
                    </div>
                  </div>
                </div>

                {/* Matriz RACI */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Matriz RACI</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Responsable:</span>
                      <span className="font-medium">{campaign.responsible_user_profile?.full_name || 'No asignado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aprobador:</span>
                      <span className="font-medium">{campaign.accountable_user_profile?.full_name || 'No asignado'}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay campañas aún</h3>
            <p className="text-gray-600 text-center mb-4">
              Comienza creando tu primera campaña de marketing.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Campaña
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
