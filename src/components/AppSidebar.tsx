
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Grid2x2, 
  Folder, 
  Calendar,
  LogOut
} from 'lucide-react';

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Grid2x2,
    description: "Vista general"
  },
  {
    title: "Clientes",
    url: "/projects",
    icon: Folder,
    description: "Gestión de clientes"
  },
  {
    title: "Calendario",
    url: "/calendar",
    icon: Calendar,
    description: "Cronograma de proyectos"
  }
];

export function AppSidebar() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.reload();
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 arch-gradient rounded-xl flex items-center justify-center">
            <Grid2x2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Bubu Agency</h1>
            <p className="text-sm text-sidebar-foreground/60">Gestión de Agencia Digital</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider mb-3">
            Navegación Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-sidebar-accent ${
                      location.pathname === item.url 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                        : 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <Link to={item.url} className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs opacity-60">{item.description}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span className="text-sm">Cerrar Sesión</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-4 pt-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/40 text-center">
            v1.0.0 - Sistema Profesional
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
