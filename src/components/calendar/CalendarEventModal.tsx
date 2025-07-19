
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  concepto: string;
  descripcion: string;
  area: string;
  dia: string;
  horario_inicial: string;
  horario_final: string;
}

interface CalendarEventModalProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarEventModal({ event, isOpen, onClose }: CalendarEventModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{event.concepto}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              {event.area}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{format(new Date(event.dia), 'EEEE, dd MMMM yyyy', { locale: es })}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{event.horario_inicial} - {event.horario_final}</span>
            </div>

            {event.descripcion && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Descripción</span>
                </div>
                <p className="text-sm text-gray-600 pl-6">
                  {event.descripcion}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
