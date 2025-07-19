
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
        // Get presentation data
        const { data: presentation, error: presError } = await supabase
          .from('links_temporales')
          .select('*')
          .eq('id', linkId)
          .single();

        if (presError) throw presError;

        setPresentationData(presentation);

        // Get client name
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('name')
          .eq('id', presentation.client_id)
          .single();

        if (clientError) throw clientError;
        setClientName(client.name);

        // Get community content for this client
        const { data: contentData, error: contentError } = await supabase
          .from('community_content')
          .select('*')
          .eq('client_id', presentation.client_id)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando presentación...</p>
        </div>
      </div>
    );
  }

  if (!presentationData || !content.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Presentación no encontrada</h2>
          <p className="text-gray-600">No se pudo cargar la presentación solicitada.</p>
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
    <div>
      <style>{`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', sans-serif;
            background: #f8f9fa;
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 30px rgba(1, 31, 67, 0.1);
            min-height: 100vh;
        }

        .header {
            background: linear-gradient(135deg, #011F43 0%, #1a3a5c 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
        }

        .brand-logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            margin: 0 auto 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            backdrop-filter: blur(10px);
        }

        .header h1 {
            font-size: 2.8rem;
            margin-bottom: 12px;
            font-weight: 600;
            letter-spacing: -1px;
        }

        .header .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            font-weight: 400;
        }

        .strategy-section {
            padding: 50px 40px;
            background: #f8f9fa;
            border-bottom: 3px solid #011F43;
        }

        .strategy-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            max-width: 900px;
            margin: 0 auto;
        }

        .strategy-column h3 {
            color: #011F43;
            font-size: 1.8rem;
            font-weight: 600;
            margin-bottom: 25px;
            text-align: center;
            border-bottom: 2px solid #011F43;
            padding-bottom: 10px;
        }

        .strategy-item {
            background: white;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid #011F43;
            box-shadow: 0 2px 10px rgba(1, 31, 67, 0.1);
            font-weight: 500;
            color: #2c3e50;
        }

        .period-info {
            background: #ecf0f1;
            padding: 30px 40px;
            text-align: center;
            border-bottom: 3px solid #bdc3c7;
        }

        .period-info h2 {
            color: #011F43;
            font-size: 1.8rem;
            margin-bottom: 8px;
            font-weight: 600;
        }

        .period-info p {
            color: #7f8c8d;
            font-size: 1rem;
        }

        .content-section {
            padding: 40px;
        }

        .week-header {
            background: #011F43;
            color: white;
            padding: 20px 30px;
            margin: 40px 0 30px 0;
            border-radius: 8px;
            font-size: 1.2rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
        }

        .week-header:first-child {
            margin-top: 0;
        }

        .week-header::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: -3px;
            width: 100%;
            height: 3px;
            background: #1a3a5c;
            border-radius: 0 0 8px 8px;
        }

        .content-card {
            background: white;
            margin-bottom: 20px;
            border: 1px solid #e0e6ed;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s ease;
            position: relative;
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 0;
        }

        .content-card:hover {
            box-shadow: 0 8px 25px rgba(1, 31, 67, 0.15);
            transform: translateY(-2px);
        }

        .content-card:last-child {
            margin-bottom: 0;
        }

        .card-left {
            display: flex;
            flex-direction: column;
        }

        .card-header {
            background: #f7f9fc;
            padding: 20px 25px;
            border-bottom: 1px solid #e0e6ed;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .post-type {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 2px solid;
        }

        .date-badge {
            background: #011F43;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
        }

        .card-body {
            padding: 25px;
            flex-grow: 1;
        }

        .copy-content {
            font-size: 15px;
            line-height: 1.7;
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: justify;
        }

        .card-right {
            background: #f8f9fa;
            border-left: 1px solid #e0e6ed;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            min-height: 200px;
        }

        .content-placeholder {
            background: #fff;
            border: 2px dashed #011F43;
            border-radius: 8px;
            width: 100%;
            height: 160px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #011F43;
            font-weight: 500;
            font-size: 14px;
            text-align: center;
        }

        .tipo-post, .tipo-foto, .tipo-publicacion {
            background: #011F43;
            color: white;
            border-color: #011F43;
        }

        .tipo-video {
            background: #1a3a5c;
            color: white;
            border-color: #1a3a5c;
        }

        .tipo-story, .tipo-historia {
            background: #2c5282;
            color: white;
            border-color: #2c5282;
        }

        .tipo-reel {
            background: #3d6cb3;
            color: white;
            border-color: #3d6cb3;
        }

        .tipo-carrusel {
            background: #4e7de4;
            color: white;
            border-color: #4e7de4;
        }

        .footer {
            background: #011F43;
            color: white;
            padding: 40px;
            text-align: center;
        }

        .footer .company-info {
            margin-bottom: 15px;
            font-weight: 600;
            font-size: 1.1rem;
        }

        .footer p {
            opacity: 0.85;
            font-size: 14px;
        }

        @media (max-width: 768px) {
            .content-card {
                grid-template-columns: 1fr;
            }
            
            .card-right {
                border-left: none;
                border-top: 1px solid #e0e6ed;
                min-height: auto;
            }
            
            .strategy-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

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
                      Contenido visual pendiente
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
