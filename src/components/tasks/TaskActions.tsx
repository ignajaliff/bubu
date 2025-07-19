
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye, MessageSquare, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import TaskDetailModal from './TaskDetailModal';

interface TaskActionsProps {
  task: any;
  tableName: 'marketing_task_camp' | 'community_task' | 'branding_info';
}

export default function TaskActions({ task, tableName }: TaskActionsProps) {
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verificar roles del usuario
  const isResponsible = task.responsible_user === profile?.id;
  const isAccountable = task.accountable_user === profile?.id;
  const isConsulted = task.consulted_users?.includes(profile?.id);
  const isInformed = task.informed_users?.includes(profile?.id);

  // Determinar el botón apropiado según el rol
  const getActionButton = () => {
    let icon = Eye;
    let text = 'Ver Información';
    let variant: any = 'outline';

    if (isResponsible && (task.status === 'pending' || task.status === 'correction_needed')) {
      icon = CheckCircle;
      text = 'Completar';
      variant = 'default';
    } else if (isAccountable && task.status === 'in_review') {
      icon = Eye;
      text = 'Revisar';
      variant = 'default';
    } else if (isConsulted) {
      icon = MessageSquare;
      text = 'Accionar Consultado';
      variant = 'outline';
    } else if (isInformed) {
      icon = Info;
      text = 'Ver Información';
      variant = 'outline';
    }

    const IconComponent = icon;

    return (
      <Button 
        size="sm" 
        variant={variant}
        onClick={() => setIsModalOpen(true)}
      >
        <IconComponent className="h-4 w-4 mr-2" />
        {text}
      </Button>
    );
  };

  return (
    <div className="flex items-center space-x-2">
      {getActionButton()}
      
      {task.completion_content && (
        <Badge variant="outline" className="text-xs">
          Completado: {task.completion_content.substring(0, 30)}...
        </Badge>
      )}

      <TaskDetailModal
        task={task}
        tableName={tableName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
