
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  color = 'blue'
}: MetricCardProps) {
  const colorClasses = {
    blue: 'text-primary bg-primary/10',
    green: 'text-accent bg-accent/10',
    orange: 'text-arch-warning bg-arch-warning/10',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <Card className="arch-card-shadow hover:shadow-lg transition-all duration-200 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {trend && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive 
                ? 'text-accent bg-accent/10' 
                : 'text-destructive bg-destructive/10'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
