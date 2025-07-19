
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export default function Presentation() {
  const { linkId } = useParams();

  const { data: presentationData, isLoading, error } = useQuery({
    queryKey: ['presentation', linkId],
    queryFn: async () => {
      if (!linkId) throw new Error('No link ID provided');
      
      // Get presentation data
      const { data: linkData, error: linkError } = await supabase
        .from('links_temporales')
        .select('*')
        .eq('id', linkId)
        .single();

      if (linkError) throw linkError;

      // Get community content for this client
      const { data: contentData, error: contentError } = await supabase
        .from('community_content')
        .select('*')
        .eq('client_id', linkData.client_id)
        .order('fecha', { ascending: true });

      if (contentError) throw contentError;

      return { linkData, contentData };
    },
    enabled: !!linkId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando presentación...</p>
        </div>
      </div>
    );
  }

  if (error || !presentationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">No se pudo cargar la presentación</p>
        </div>
      </div>
    );
  }

  const { linkData, contentData } = presentationData;

  // Group content by week
  const contentByWeek = contentData.reduce((acc: any, content: any) => {
    const week = content.semana;
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(content);
    return acc;
  }, {});

  // Generate content blocks for template
  const generateContentBlocks = () => {
    return Object.keys(contentByWeek).map(week => {
      const weekContent = contentByWeek[week];
      const contentItems = weekContent.map((content: any) => `
        <div class="content-item">
          <div class="content-header">
            <h4>${content.tipo_publicacion} - ${content.plataforma}</h4>
            <span class="content-date">${new Date(content.fecha).toLocaleDateString()}</span>
          </div>
          ${content.copy_publicacion ? `<p class="content-copy">${content.copy_publicacion}</p>` : ''}
          ${content.pilar ? `<span class="content-pillar">${content.pilar}</span>` : ''}
          ${content.referencia ? `<p class="content-reference">Ref: ${content.referencia}</p>` : ''}
        </div>
      `).join('');

      return `
        <div class="week-section">
          <h3>Semana ${week}</h3>
          <div class="week-content">
            ${contentItems}
          </div>
        </div>
      `;
    }).join('');
  };

  // Safely parse pilares and objetivos as arrays
  const pilares = Array.isArray(linkData.pilares) ? linkData.pilares : [];
  const objetivos = Array.isArray(linkData.objetivos) ? linkData.objetivos : [];

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Presentación de Contenidos</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5rem;
                margin-bottom: 10px;
                font-weight: 300;
            }
            
            .header p {
                font-size: 1.2rem;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px;
            }
            
            .section {
                margin-bottom: 40px;
            }
            
            .section h2 {
                color: #667eea;
                font-size: 1.8rem;
                margin-bottom: 20px;
                border-bottom: 3px solid #667eea;
                padding-bottom: 10px;
            }
            
            .pillars-grid, .objectives-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .pillar-card, .objective-card {
                background: #f8f9ff;
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #667eea;
                transition: transform 0.2s ease;
            }
            
            .pillar-card:hover, .objective-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            }
            
            .week-section {
                margin-bottom: 30px;
                background: #f9f9f9;
                border-radius: 12px;
                padding: 25px;
            }
            
            .week-section h3 {
                color: #764ba2;
                font-size: 1.4rem;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
            }
            
            .week-section h3:before {
                content: "📅";
                margin-right: 10px;
            }
            
            .week-content {
                display: grid;
                gap: 15px;
            }
            
            .content-item {
                background: white;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
                position: relative;
            }
            
            .content-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .content-header h4 {
                color: #333;
                font-size: 1.1rem;
            }
            
            .content-date {
                background: #667eea;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
            }
            
            .content-copy {
                margin: 10px 0;
                color: #555;
                font-style: italic;
            }
            
            .content-pillar {
                background: #764ba2;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.8rem;
                display: inline-block;
                margin-top: 8px;
            }
            
            .content-reference {
                margin-top: 8px;
                color: #666;
                font-size: 0.9rem;
            }
            
            .footer {
                background: #f8f9ff;
                padding: 30px;
                text-align: center;
                color: #666;
                border-top: 1px solid #eee;
            }
            
            @media (max-width: 768px) {
                .header h1 {
                    font-size: 2rem;
                }
                
                .pillars-grid, .objectives-grid {
                    grid-template-columns: 1fr;
                }
                
                .content {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Presentación de Contenidos</h1>
                <p>Estrategia de Community Management</p>
            </div>
            
            <div class="content">
                <div class="section">
                    <h2>🎯 Pilares de Contenido</h2>
                    <div class="pillars-grid">
                        ${pilares.map((pilar: string, index: number) => `
                            <div class="pillar-card">
                                <h3>Pilar ${index + 1}</h3>
                                <p>${pilar}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="section">
                    <h2>🚀 Objetivos</h2>
                    <div class="objectives-grid">
                        ${objetivos.map((objetivo: string, index: number) => `
                            <div class="objective-card">
                                <h3>Objetivo ${index + 1}</h3>
                                <p>${objetivo}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="section">
                    <h2>📅 Calendario de Contenidos</h2>
                    ${generateContentBlocks()}
                </div>
            </div>
            
            <div class="footer">
                <p>Presentación generada el ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: htmlTemplate }}
      className="min-h-screen"
    />
  );
}
