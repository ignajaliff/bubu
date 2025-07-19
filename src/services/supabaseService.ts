
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Función para crear datos ficticios en desarrollo
export async function seedDatabase() {
  // Verificar si ya existen clientes para evitar duplicados
  const { data: existingClients } = await supabase
    .from('clients')
    .select('id')
    .limit(1);

  if (existingClients && existingClients.length > 0) {
    console.log('Database already seeded');
    return;
  }

  // Insertar información de marketing ficticia usando los tipos correctos
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name');

  if (clients && clients.length > 0) {
    const techCorpClient = clients.find(c => c.name === 'TechCorp Solutions');
    const greenEnergyClient = clients.find(c => c.name === 'Green Energy Co.');

    if (techCorpClient) {
      const marketingData: Database['public']['Tables']['marketing_task_camp']['Insert'][] = [
        {
          client_id: techCorpClient.id,
          info_type: 'campaign',
          title: 'Campaña Q4 2024 - Adicional',
          description: 'Campaña adicional para reforzar presencia digital',
          status: 'pending',
          priority: 'medium',
          campaign_type: 'Social Media',
          budget: 15000,
          start_date: '2024-11-01',
          end_date: '2024-12-15',
          target_audience: 'Startups y empresas tech'
        },
        {
          client_id: techCorpClient.id,
          info_type: 'task',
          title: 'Análisis de competencia',
          description: 'Investigar y analizar estrategias de la competencia',
          status: 'pending',
          priority: 'high',
          due_date: '2024-11-20'
        }
      ];

      await supabase.from('marketing_task_camp').insert(marketingData);
    }

    if (greenEnergyClient) {
      const brandingData: Database['public']['Tables']['branding_info']['Insert'][] = [
        {
          client_id: greenEnergyClient.id,
          info_type: 'brand_element',
          title: 'Paleta de colores sostenible',
          description: 'Desarrollo de paleta de colores que refleje sostenibilidad',
          status: 'in_progress',
          priority: 'medium',
          brand_element_type: 'Colors',
          colors: { primary: '#22c55e', secondary: '#16a34a', accent: '#84cc16' }
        }
      ];

      await supabase.from('branding_info').insert(brandingData);

      const communityData: Database['public']['Tables']['community_task']['Insert'][] = [
        {
          client_id: greenEnergyClient.id,
          info_type: 'content_week',
          title: 'Semana de la sostenibilidad',
          description: 'Contenido semanal enfocado en consejos de sostenibilidad',
          status: 'pending',
          priority: 'medium',
          platform: 'Instagram',
          pillar: 'Educación',
          content_type: 'Tips'
        }
      ];

      await supabase.from('community_task').insert(communityData);
    }
  }

  console.log('Additional sample data seeded successfully!');
}

// Función auxiliar para obtener clientes
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Función auxiliar para obtener información de marketing por cliente
export async function getMarketingInfo(clientId: string) {
  const { data, error } = await supabase
    .from('marketing_task_camp')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Función auxiliar para obtener información de branding por cliente
export async function getBrandingInfo(clientId: string) {
  const { data, error } = await supabase
    .from('branding_info')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Función auxiliar para obtener información de community por cliente
export async function getCommunityInfo(clientId: string) {
  const { data, error } = await supabase
    .from('community_task')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
