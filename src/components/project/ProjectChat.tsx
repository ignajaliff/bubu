
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, User } from 'lucide-react';
import { Project, ChatMessage } from '@/types/project';
import { saveProject, getTeamMembers } from '@/services/localStorage';

interface ProjectChatProps {
  project: Project;
}

export function ProjectChat({ project }: ProjectChatProps) {
  const [messages, setMessages] = useState(project.chatMessages || []);
  const [newMessage, setNewMessage] = useState('');
  const teamMembers = getTeamMembers();

  // Simular usuario actual (en un futuro esto vendrá del sistema de auth)
  const currentUser = teamMembers[0] || {
    id: 'current-user',
    name: 'Usuario Actual',
    email: 'usuario@architecflow.com',
    role: 'Arquitecto',
    joinDate: '2024-01-01',
    skills: []
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setNewMessage('');

    // Guardar en localStorage
    const updatedProject = { ...project, chatMessages: updatedMessages };
    saveProject(updatedProject);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getUserInitials = (userName: string) => {
    return userName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span>Chat del Proyecto</span>
            <span className="text-sm text-muted-foreground">
              ({teamMembers.filter(m => project.team.includes(m.id)).length} miembros)
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Sin mensajes aún</h3>
                <p className="text-sm">Inicia la conversación con tu equipo</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium flex-shrink-0">
                    {getUserInitials(message.userName)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">{message.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                    
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                {getUserInitials(currentUser.name)}
              </div>
              
              <div className="flex-1 flex space-x-2">
                <Input
                  placeholder="Escribe tu mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Participantes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {teamMembers
              .filter(member => project.team.includes(member.id))
              .map((member) => (
                <div key={member.id} className="flex items-center space-x-2 bg-muted rounded-full px-3 py-1">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                    {getUserInitials(member.name)}
                  </div>
                  <span className="text-sm">{member.name}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
