
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
        
        // Transform the data to match our interface
        const transformedPresentation: PresentationData = {
          id: presentationRecord.id,
          link: presentationRecord.link,
          pilares: Array.isArray(presentationRecord.pilares) ? presentationRecord.pilares : [],
          objetivos: Array.isArray(presentationRecord.objetivos) ? presentationRecord.objetivos : [],
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

  // Get date range
  const dates = content.map(item => new Date(item.fecha)).sort();
  const startDate = dates[0]?.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  const endDate = dates[dates.length - 1]?.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });

  const getPostTypeClass = (tipo: string) => {
    const normalized = tipo.toLowerCase().replace(/\s+/g, '-');
    return `tipo-${normalized}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            color: #1e293b;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            min-height: 100vh;
            border-radius: 0;
        }

        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%);
            color: white;
            padding: 60px 50px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }

        .brand-logo {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            position: relative;
            z-index: 1;
        }

        .header h1 {
            font-size: 3.5rem;
            margin-bottom: 16px;
            font-weight: 700;
            letter-spacing: -2px;
            position: relative;
            z-index: 1;
        }

        .header .subtitle {
            font-size: 1.4rem;
            opacity: 0.95;
            font-weight: 400;
            position: relative;
            z-index: 1;
        }

        .strategy-section {
            padding: 60px 50px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-bottom: 1px solid #e2e8f0;
        }

        .strategy-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            max-width: 1000px;
            margin: 0 auto;
        }

        .strategy-column h3 {
            color: #1e40af;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 30px;
            text-align: center;
            position: relative;
            padding-bottom: 15px;
        }

        .strategy-column h3::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 4px;
            background: linear-gradient(90deg, #3b82f6, #6366f1);
            border-radius: 2px;
        }

        .strategy-item {
            background: white;
            padding: 24px;
            margin-bottom: 16px;
            border-radius: 12px;
            border-left: 5px solid #3b82f6;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            font-weight: 500;
            color: #374151;
            transition: all 0.3s ease;
            position: relative;
        }

        .strategy-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .period-info {
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
            padding: 40px 50px;
            text-align: center;
            border-bottom: 1px solid #c7d2fe;
        }

        .period-info h2 {
            color: #1e40af;
            font-size: 2.2rem;
            margin-bottom: 12px;
            font-weight: 700;
            text-transform: capitalize;
        }

        .period-info p {
            color: #4338ca;
            font-size: 1.1rem;
            font-weight: 500;
        }

        .content-section {
            padding: 50px;
            background: white;
        }

        .week-header {
            background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
            color: white;
            padding: 25px 35px;
            margin: 50px 0 35px 0;
            border-radius: 12px;
            font-size: 1.3rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
            box-shadow: 0 10px 15px -3px rgba(30, 64, 175, 0.3);
        }

        .week-header:first-child {
            margin-top: 0;
        }

        .week-header::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: -4px;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, #3b82f6, #6366f1);
            border-radius: 0 0 12px 12px;
        }

        .content-card {
            background: white;
            margin-bottom: 24px;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.3s ease;
            position: relative;
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .content-card:hover {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            transform: translateY(-4px);
        }

        .content-card:last-child {
            margin-bottom: 0;
        }

        .card-left {
            display: flex;
            flex-direction: column;
        }

        .card-header {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 24px 30px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }

        .post-type {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 2px solid;
            position: relative;
            overflow: hidden;
        }

        .post-type::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .post-type:hover::before {
            left: 100%;
        }

        .date-badge {
            background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
            color: white;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.3);
        }

        .card-body {
            padding: 30px;
            flex-grow: 1;
            background: linear-gradient(135deg, #fefefe 0%, #f8fafc 100%);
        }

        .copy-content {
            font-size: 16px;
            line-height: 1.8;
            color: #374151;
            margin-bottom: 20px;
            text-align: justify;
            font-weight: 400;
        }

        .card-right {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-left: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
            min-height: 250px;
        }

        .content-placeholder {
            background: linear-gradient(135deg, #fefefe 0%, #f8fafc 100%);
            border: 3px dashed #3b82f6;
            border-radius: 12px;
            width: 100%;
            height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #3b82f6;
            font-weight: 600;
            font-size: 15px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .content-placeholder::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
            animation: pulse 3s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
        }

        .tipo-post, .tipo-foto, .tipo-publicacion {
            background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
            color: white;
            border-color: #1e40af;
        }

        .tipo-video {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            border-color: #dc2626;
        }

        .tipo-story, .tipo-historia {
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            color: white;
            border-color: #7c3aed;
        }

        .tipo-reel {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            border-color: #059669;
        }

        .tipo-carrusel {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            color: white;
            border-color: #d97706;
        }

        .footer {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: white;
            padding: 50px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid2)"/></svg>');
        }

        .footer .company-info {
            margin-bottom: 20px;
            font-weight: 700;
            font-size: 1.4rem;
            position: relative;
            z-index: 1;
        }

        .footer p {
            opacity: 0.9;
            font-size: 16px;
            position: relative;
            z-index: 1;
        }

        @media (max-width: 768px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header {
                padding: 40px 30px;
            }
            
            .header h1 {
                font-size: 2.5rem;
            }
            
            .strategy-section, .content-section {
                padding: 40px 30px;
            }
            
            .content-card {
                grid-template-columns: 1fr;
            }
            
            .card-right {
                border-left: none;
                border-top: 1px solid #e5e7eb;
                min-height: auto;
            }
            
            .strategy-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="brand-logo">📋</div>
          <h1>Calendario de Contenidos</h1>
          <p className="subtitle">{clientName} • Estrategia de Marketing Digital</p>
        </div>

        {/* Strategy Section */}
        <div className="strategy-section">
          <div className="strategy-grid">
            <div className="strategy-column">
              <h3>Pilares de Contenido</h3>
              {presentationData.pilares.map((pilar, index) => (
                <div key={index} className="strategy-item">{pilar}</div>
              ))}
            </div>
            <div className="strategy-column">
              <h3>Objetivos</h3>
              {presentationData.objetivos.map((objetivo, index) => (
                <div key={index} className="strategy-item">{objetivo}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Period Info */}
        <div className="period-info">
          <h2>{monthYear}</h2>
          <p>{content.length} publicaciones programadas • Distribución estratégica semanal</p>
        </div>

        {/* Content Section */}
        <div className="content-section">
          {Object.entries(contentByWeek).map(([week, weekContent]) => (
            <div key={week}>
              <div className="week-header">
                {week} • {startDate} - {endDate}
              </div>
              
              {weekContent.map((item) => (
                <div key={item.id} className="content-card">
                  <div className="card-left">
                    <div className="card-header">
                      <span className={`post-type ${getPostTypeClass(item.tipo_publicacion)}`}>
                        {item.tipo_publicacion}
                      </span>
                      <span className="date-badge">
                        {new Date(item.fecha).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="copy-content">
                        {item.copy_publicacion || 'Contenido pendiente de redacción'}
                      </div>
                    </div>
                  </div>
                  <div className="card-right">
                    <div className="content-placeholder">
                      Contenido visual<br />pendiente
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="company-info">Tu Agencia Digital</div>
          <p>Propuesta de contenido • {clientName} • {new Date().toLocaleDateString('es-ES')}</p>
        </div>
      </div>
    </div>
  );
}
