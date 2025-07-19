
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Eye, AlertTriangle, Send, MessageSquare, Info } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailModalProps {
  task: any;
  tableName: 'marketing_task_camp' | 'community_task' | 'branding_info';
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailModal({ task, tableName, isOpen, onClose }: TaskDetailModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [completionContent, setCompletionContent] = useState('');
  const [correctionFeedback, setCorrectionFeedback] = useState('');
  const [consultedContent, setConsultedContent] = useState('');

  // Verificar roles del usuario
  const isResponsible = task.responsible_user === profile?.id;
  const isAccountable = task.accountable_user === profile?.id;
  const isConsulted = task.consulted_users?.includes(profile?.id);
  const isInformed = task.informed_users?.includes(profile?.id);

  // Completar tarea (Responsable)
  const completeTaskMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from(tableName)
        .update({
          completion_content: content,
          status: 'in_review',
          completed_by: profile?.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();
      
      if (error) throw error;

      // Crear notificaciones para todos los roles
      const notifications = [];
      
      // Notificar al aprobador
      if (task.accountable_user) {
        notifications.push({
          user_id: task.accountable_user,
          task_id: task.id,
          task_table: tableName,
          notification_type: 'task_completed',
          message: `${task.title} ha sido completada y está lista para revisión`
        });
      }

      // Notificar a usuarios informados
      if (task.informed_users?.length > 0) {
        task.informed_users.forEach((userId: string) => {
          notifications.push({
            user_id: userId,
            task_id: task.id,
            task_table: tableName,
            notification_type: 'task_updated',
            message: `La tarea "${task.title}" ha sido actualizada`
          });
        });
      }

      if (notifications.length > 0) {
        await supabase.from('task_notifications').insert(notifications);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${tableName}-tasks`] });
      toast({
        title: "Tarea completada",
        description: "La tarea ha sido marcada como completada y enviada para revisión.",
      });
      setCompletionContent('');
    }
  });

  // Aprobar tarea (Aprobador)
  const approveTaskMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from(tableName)
        .update({
          status: 'completed',
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();
      
      if (error) throw error;

      // Notificar a todos los involucrados
      const notifications = [];
      
      if (task.responsible_user) {
        notifications.push({
          user_id: task.responsible_user,
          task_id: task.id,
          task_table: tableName,
          notification_type: 'task_approved',
          message: `Tu tarea "${task.title}" ha sido aprobada`
        });
      }

      if (task.informed_users?.length > 0) {
        task.informed_users.forEach((userId: string) => {
          notifications.push({
            user_id: userId,
            task_id: task.id,
            task_table: tableName,
            notification_type: 'task_updated',
            message: `La tarea "${task.title}" ha sido finalizada`
          });
        });
      }

      if (notifications.length > 0) {
        await supabase.from('task_notifications').insert(notifications);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${tableName}-tasks`] });
      toast({
        title: "Tarea aprobada",
        description: "La tarea ha sido marcada como completada.",
      });
      onClose();
    }
  });

  // Solicitar corrección (Aprobador)
  const requestCorrectionMutation = useMutation({
    mutationFn: async (feedback: string) => {
      const { data, error } = await supabase
        .from(tableName)
        .update({
          status: 'correction_needed',
          correction_feedback: feedback,
          correction_requested_at: new Date().toISOString(),
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();
      
      if (error) throw error;

      // Notificar al responsable y usuarios informados
      const notifications = [];
      
      if (task.responsible_user) {
        notifications.push({
          user_id: task.responsible_user,
          task_id: task.id,
          task_table: tableName,
          notification_type: 'correction_requested',
          message: `Se ha solicitado una corrección para "${task.title}"`
        });
      }

      if (task.informed_users?.length > 0) {
        task.informed_users.forEach((userId: string) => {
          notifications.push({
            user_id: userId,
            task_id: task.id,
            task_table: tableName,
            notification_type: 'task_updated',
            message: `Se ha solicitado corrección para "${task.title}"`
          });
        });
      }

      if (notifications.length > 0) {
        await supabase.from('task_notifications').insert(notifications);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${tableName}-tasks`] });
      toast({
        title: "Corrección solicitada",
        description: "Se ha enviado la solicitud de corrección al responsable.",
      });
      setCorrectionFeedback('');
    }
  });

  // Accionar Consultado
  const submitConsultedMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from(tableName)
        .update({
          consulted_content: content,
          consulted_by: profile?.id,
          consulted_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();
      
      if (error) throw error;

      // Notificar a responsable, aprobador e informados
      const notifications = [];
      
      if (task.responsible_user) {
        notifications.push({
          user_id: task.responsible_user,
          task_id: task.id,
          task_table: tableName,
          notification_type: 'consulted_action',
          message: `Se ha agregado contenido de consulta a "${task.title}"`
        });
      }

      if (task.accountable_user) {
        notifications.push({
          user_id: task.accountable_user,
          task_id: task.id,
          task_table: tableName,
          notification_type: 'consulted_action',
          message: `Se ha agregado contenido de consulta a "${task.title}"`
        });
      }

      if (task.informed_users?.length > 0) {
        task.informed_users.forEach((userId: string) => {
          notifications.push({
            user_id: userId,
            task_id: task.id,
            task_table: tableName,
            notification_type: 'task_updated',
            message: `Se ha actualizado la consulta de "${task.title}"`
          });
        });
      }

      if (notifications.length > 0) {
        await supabase.from('task_notifications').insert(notifications);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${tableName}-tasks`] });
      toast({
        title: "Contenido de consulta enviado",
        description: "Tu aporte como consultado ha sido registrado.",
      });
      setConsultedContent('');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'correction_needed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'Completada';
      case 'in_progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      case 'in_review': return 'En Revisión';
      case 'correction_needed': return 'Requiere Corrección';
      default: return 'Estado';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {task.title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[75vh] pr-4">
          <div className="space-y-6">
            {/* Información General */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(task.status)}>
                  {getStatusLabel(task.status)}
                </Badge>
                <span className="text-sm text-gray-500">
                  Creada: {new Date(task.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Descripción</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {task.description || 'Sin descripción'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Responsable (R):</Label>
                  <p>{task.responsible_user_profile?.full_name || 'No asignado'}</p>
                </div>
                <div>
                  <Label className="font-medium">Aprobador (A):</Label>
                  <p>{task.accountable_user_profile?.full_name || 'No asignado'}</p>
                </div>
              </div>
              
              {task.due_date && (
                <div>
                  <Label className="font-medium">Fecha límite:</Label>
                  <p className="text-sm">{new Date(task.due_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Contenido del Consultado */}
            {(isConsulted || task.consulted_content || isInformed) && (
              <div className="space-y-3">
                <Label className="text-lg font-semibold flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Consulta (C)
                </Label>
                
                {task.consulted_content ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm">{task.consulted_content}</p>
                    {task.consulted_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Consultado el: {new Date(task.consulted_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Sin contenido de consulta</p>
                )}

                {isConsulted && (
                  <div className="space-y-3">
                    <Label htmlFor="consulted">Agregar contenido de consulta</Label>
                    <Textarea
                      id="consulted"
                      value={consultedContent}
                      onChange={(e) => setConsultedContent(e.target.value)}
                      placeholder="Comparte tu consulta o recomendación..."
                      rows={3}
                    />
                    <Button 
                      onClick={() => submitConsultedMutation.mutate(consultedContent)}
                      disabled={!consultedContent.trim() || submitConsultedMutation.isPending}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {submitConsultedMutation.isPending ? 'Enviando...' : 'Accionar Consultado'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Contenido del Responsable */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Trabajo del Responsable (R)
              </Label>
              
              {task.completion_content ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm">{task.completion_content}</p>
                  {task.completed_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Completado el: {new Date(task.completed_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Sin contenido completado</p>
              )}

              {isResponsible && (task.status === 'pending' || task.status === 'correction_needed') && (
                <div className="space-y-3">
                  {task.status === 'correction_needed' && task.correction_feedback && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Label className="text-sm font-medium text-yellow-800">Feedback de corrección:</Label>
                      <p className="text-sm text-yellow-700 mt-1">{task.correction_feedback}</p>
                    </div>
                  )}
                  <Label htmlFor="completion">Describe cómo completaste la tarea</Label>
                  <Textarea
                    id="completion"
                    value={completionContent}
                    onChange={(e) => setCompletionContent(e.target.value)}
                    placeholder="Describe el trabajo realizado, resultados obtenidos, archivos entregados, etc."
                    rows={4}
                  />
                  <Button 
                    onClick={() => completeTaskMutation.mutate(completionContent)}
                    disabled={!completionContent.trim() || completeTaskMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {completeTaskMutation.isPending ? 'Completando...' : 'Completar Tarea'}
                  </Button>
                </div>
              )}
            </div>

            {/* Acciones del Aprobador */}
            {isAccountable && task.status === 'in_review' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Revisión del Aprobador (A)
                  </Label>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => approveTaskMutation.mutate()}
                      disabled={approveTaskMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {approveTaskMutation.isPending ? 'Aprobando...' : 'Marcar como Completo'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={() => {
                        const correctionSection = document.getElementById('correction-section');
                        if (correctionSection) {
                          correctionSection.style.display = correctionSection.style.display === 'none' ? 'block' : 'none';
                        }
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Mandar Corrección
                    </Button>
                  </div>

                  <div id="correction-section" style={{ display: 'none' }} className="space-y-3">
                    <Label htmlFor="correction">Feedback de corrección</Label>
                    <Textarea
                      id="correction"
                      value={correctionFeedback}
                      onChange={(e) => setCorrectionFeedback(e.target.value)}
                      placeholder="Describe qué necesita ser corregido o mejorado..."
                      rows={3}
                    />
                    <Button 
                      onClick={() => requestCorrectionMutation.mutate(correctionFeedback)}
                      disabled={!correctionFeedback.trim() || requestCorrectionMutation.isPending}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {requestCorrectionMutation.isPending ? 'Enviando...' : 'Enviar Corrección'}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Información para Informados */}
            {isInformed && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-lg font-semibold flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Vista de Informado (I)
                  </Label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Tienes acceso completo a toda la información de esta tarea como usuario informado.
                      Puedes ver el progreso, las consultas y las decisiones tomadas.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
