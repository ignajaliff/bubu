
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { LogOut, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header optimizado para PC */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-16 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-600" />
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{profile?.full_name || profile?.email}</div>
                  <div className="text-xs text-gray-600 capitalize">{profile?.role}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
