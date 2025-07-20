
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CommunityContentRow {
  id: string;
  semana: string;
  fecha: string;
  tipo_publicacion: string;
  copy_publicacion: string;
  plataforma: string;
  pilar: string;
}

interface PresentationData {
  id: string;
  link: string;
  pilares: string[];
  objetivos: string[];
  client_id: string;
}

export default function Presentation() {
  const { linkId } = useParams();
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [content, setContent] = useState<CommunityContentRow[]>([]);
  const [clientName, setClientName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresentationData = async () => {
      if (!linkId) return;

      try {
        // Get presentation data using RPC function
        const { data: presentation, error: presError } = await supabase
          .rpc('get_presentation_by_id', { link_id: linkId });

        if (presError) throw presError;
        if (!presentation || presentation.length === 0) throw new Error('Presentation not found');

        const presentationRecord = presentation[0];
        
        // Transform the data to match our interface with proper type handling
        const transformedPresentation: PresentationData = {
          id: presentationRecord.id,
          link: presentationRecord.link,
          pilares: Array.isArray(presentationRecord.pilares) 
            ? presentationRecord.pilares.filter((item): item is string => typeof item === 'string')
            : [],
          objetivos: Array.isArray(presentationRecord.objetivos) 
            ? presentationRecord.objetivos.filter((item): item is string => typeof item === 'string')
            : [],
          client_id: presentationRecord.client_id
        };
        
        setPresentationData(transformedPresentation);

        // Get client name
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('name')
          .eq('id', transformedPresentation.client_id)
          .single();

        if (clientError) throw clientError;
        setClientName(client.name);

        // Get community content for this client
        const { data: contentData, error: contentError } = await supabase
          .from('community_content')
          .select('*')
          .eq('client_id', transformedPresentation.client_id)
          .order('fecha', { ascending: true });

        if (contentError) throw contentError;
        setContent(contentData || []);

      } catch (error) {
        console.error('Error fetching presentation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresentationData();
  }, [linkId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Cargando presentación...</p>
        </div>
      </div>
    );
  }

  if (!presentationData || !content.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Presentación no encontrada</h2>
          <p className="text-gray-600 text-lg">No se pudo cargar la presentación solicitada o no hay contenido disponible.</p>
        </div>
      </div>
    );
  }

  // Group content by week
  const contentByWeek = content.reduce((acc, item) => {
    const week = item.semana || 'Sin semana';
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(item);
    return acc;
  }, {} as Record<string, CommunityContentRow[]>);

  // Get month and year from first content date
  const firstDate = content[0]?.fecha ? new Date(content[0].fecha) : new Date();
  const monthYear = firstDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const getPostTypeClass = (tipo: string) => {
    const normalized = tipo.toLowerCase().replace(/\s+/g, '-');
    return `tipo-${normalized}`;
  };

  // Function to get date range for each week
  const getWeekDateRange = (weekContent: CommunityContentRow[]) => {
    const dates = weekContent.map(item => new Date(item.fecha)).sort((a, b) => a.getTime() - b.getTime());
    const startDate = dates[0]?.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    const endDate = dates[dates.length - 1]?.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    return { startDate, endDate };
  };

  // Replace placeholders in the HTML template
  let htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Planificación Mensual - ${clientName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: #f8fafc;
            color: #0f3043;
            line-height: 1.6;
            scroll-behavior: smooth;
        }

        .container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
        }

        /* HERO SECTION */
        .hero {
            background: white;
            color: #0f3043;
            padding: 120px 40px 80px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .hero-content {
            position: relative;
            z-index: 2;
            max-width: 800px;
            margin: 0 auto;
        }

        .hero h1 {
            font-size: 5rem;
            font-weight: 900;
            margin-bottom: 32px;
            letter-spacing: -2px;
            color: #0f3043;
        }

        .hero .subtitle {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 60px;
            color: #0f3043;
        }

        .hero-stats {
            display: grid;
            grid-template-columns: 1fr 2fr 1fr;
            gap: 32px;
            margin-top: 60px;
            max-width: 900px;
            margin-left: auto;
            margin-right: auto;
        }

        .stat-card {
            background: rgba(15, 48, 67, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(15, 48, 67, 0.2);
            padding: 24px;
            border-radius: 16px;
            text-align: center;
        }

        .stat-card.middle-card {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .stat-number {
            font-size: 3rem;
            font-weight: 800;
            color: #0f3043;
            display: block;
        }

        .stat-label {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            color: #0f3043;
            margin-top: 8px;
        }

        /* STRATEGY SECTION */
        .strategy-section {
            padding: 100px 40px;
            background: white;
        }

        .section-header {
            text-align: center;
            margin-bottom: 80px;
        }

        .section-title {
            font-size: 3.5rem;
            font-weight: 800;
            color: #0f3043;
            margin-bottom: 20px;
            letter-spacing: -1px;
        }

        .section-subtitle {
            font-size: 1.2rem;
            color: #0f3043;
            max-width: 600px;
            margin: 0 auto;
        }

        .strategy-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 60px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .strategy-column {
            text-align: center;
        }

        .strategy-column h3 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #0f3043;
            margin-bottom: 40px;
            position: relative;
            display: inline-block;
        }

        .strategy-column h3::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 4px;
            background: #0f3043;
            border-radius: 2px;
        }

        .strategy-list {
            text-align: left;
            max-width: 500px;
            margin: 0 auto;
        }

        .strategy-item {
            font-size: 18px;
            font-weight: 500;
            color: #0f3043;
            margin-bottom: 16px;
            padding-left: 24px;
            position: relative;
        }

        .strategy-item::before {
            content: '-';
            position: absolute;
            left: 0;
            font-weight: 700;
            color: #0f3043;
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 100px 40px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .week-header {
            background: transparent;
            color: #0f3043;
            border: 2px solid #0f3043;
            padding: 32px 40px;
            margin: 80px 0 40px 0;
            border-radius: 16px;
            text-align: center;
            font-size: 2rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .week-header:first-child {
            margin-top: 0;
        }

        .content-cards-grid {
            display: grid;
            gap: 32px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .content-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            transition: all 0.4s ease;
            display: grid;
            grid-template-columns: 2fr 1fr;
            min-height: 300px;
        }

        .content-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .card-left {
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 16px;
        }

        .post-type {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .date-badge {
            background: #0f3043;
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 700;
        }

        .copy-content {
            font-size: 18px;
            line-height: 1.7;
            color: #0f3043;
            margin-bottom: 24px;
            flex-grow: 1;
        }

        .hashtags {
            color: #0f3043;
            font-size: 14px;
            font-weight: 500;
            padding-top: 24px;
            border-top: 2px solid #f3f4f6;
        }

        .card-right {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            position: relative;
        }

        .content-placeholder {
            background: white;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            width: 100%;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0f3043;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
        }

        /* Tipos de contenido */
        .tipo-foto {
            background: #0f3043;
            color: white;
        }

        .tipo-video {
            background: #dc2626;
            color: white;
        }

        .tipo-story {
            background: #059669;
            color: white;
        }

        .tipo-reel {
            background: #7c3aed;
            color: white;
        }

        .tipo-carrusel {
            background: #ea580c;
            color: white;
        }

        .tipo-publicacion {
            background: #0f3043;
            color: white;
        }

        .tipo-post {
            background: #0f3043;
            color: white;
        }

        .tipo-historia {
            background: #059669;
            color: white;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
            .hero {
                padding: 80px 20px 60px 20px;
            }

            .hero h1 {
                font-size: 3rem;
                letter-spacing: -1px;
            }

            .hero .subtitle {
                font-size: 1.5rem;
            }

            .hero-stats {
                grid-template-columns: 1fr;
                gap: 20px;
                margin-top: 40px;
            }

            .strategy-section {
                padding: 60px 20px;
            }

            .section-title {
                font-size: 2.5rem;
            }

            .strategy-grid {
                grid-template-columns: 1fr;
                gap: 40px;
            }

            .strategy-column h3 {
                font-size: 2rem;
            }

            .strategy-item {
                font-size: 16px;
            }

            .content-section {
                padding: 60px 20px;
            }

            .week-header {
                padding: 24px 20px;
                font-size: 1.5rem;
                margin: 60px 0 32px 0;
            }

            .content-card {
                grid-template-columns: 1fr;
                min-height: auto;
            }

            .card-left {
                padding: 24px;
            }

            .card-right {
                padding: 24px;
                border-top: 2px solid #f3f4f6;
            }

            .content-placeholder {
                height: 150px;
                font-size: 14px;
            }

            .copy-content {
                font-size: 16px;
            }
        }

        @media (min-width: 1200px) {
            .hero {
                padding: 140px 40px 100px 40px;
            }

            .hero h1 {
                font-size: 6rem;
            }

            .strategy-section, .content-section {
                padding: 120px 40px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HERO SECTION -->
        <div class="hero">
            <div class="hero-content">
                <h1>PLANIFICACIÓN MENSUAL</h1>
                <p class="subtitle">${clientName}</p>
                
                <div class="hero-stats">
                    <div class="stat-card">
                        <span class="stat-number">${content.length}</span>
                        <span class="stat-label">Publicaciones</span>
                    </div>
                    <div class="stat-card middle-card">
                        <span class="stat-number">${monthYear.toUpperCase()}</span>
                        <span class="stat-label">Período</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">4</span>
                        <span class="stat-label">Semanas</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- STRATEGY SECTION -->
        <div class="strategy-section">
            <div class="section-header">
                <h2 class="section-title">Estrategia de Contenido</h2>
                <p class="section-subtitle">Pilares fundamentales y objetivos estratégicos para maximizar el impacto de tu presencia digital</p>
            </div>
            
            <div class="strategy-grid">
                <div class="strategy-column">
                    <h3>Pilares de Contenido</h3>
                    <div class="strategy-list">
                        ${presentationData.pilares.map(pilar => 
                          `<div class="strategy-item"><strong>${pilar}</strong></div>`
                        ).join('')}
                    </div>
                </div>
                <div class="strategy-column">
                    <h3>Objetivos Clave</h3>
                    <div class="strategy-list">
                        ${presentationData.objetivos.map(objetivo => 
                          `<div class="strategy-item"><strong>${objetivo}</strong></div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- CONTENT SECTION -->
        <div class="content-section">
            ${Object.entries(contentByWeek).map(([week, weekContent]) => {
              const { startDate, endDate } = getWeekDateRange(weekContent);
              return `
                <div class="week-header">
                    ${week} • ${startDate} - ${endDate}
                </div>

                <div class="content-cards-grid">
                    ${weekContent.map((item) => `
                        <div class="content-card">
                            <div class="card-left">
                                <div class="card-header">
                                    <span class="post-type ${getPostTypeClass(item.tipo_publicacion)}">
                                        ${item.tipo_publicacion.toUpperCase()}
                                    </span>
                                    <span class="date-badge">${new Date(item.fecha).toLocaleDateString('es-ES')}</span>
                                </div>
                                <div class="copy-content">
                                    ${item.copy_publicacion || 'Contenido pendiente de redacción'}
                                </div>
                                <div class="hashtags">
                                    #${item.pilar} #${item.plataforma} #ContenidoDigital
                                </div>
                            </div>
                            <div class="card-right">
                                <div class="content-placeholder">
                                    Contenido visual<br/>pendiente
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
              `;
            }).join('')}
        </div>
    </div>
</body>
</html>`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div dangerouslySetInnerHTML={{ __html: htmlTemplate }} />
    </div>
  );
}
