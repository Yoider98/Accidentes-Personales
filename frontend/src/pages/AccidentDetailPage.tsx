import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Accident } from '../services/api';
import { ArrowLeft, Calendar, MapPin, Phone, User, FileText, ShieldAlert } from 'lucide-react';

export const AccidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [accident, setAccident] = useState<Accident | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAccidentDetail(id);
        setAccident(data);
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar la información del accidente.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Registrado':
        return 'badge-registrado';
      case 'En revisión':
        return 'badge-en-revision';
      case 'Cerrado':
        return 'badge-cerrado';
      default:
        return 'badge-registrado';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'full',
        timeStyle: 'medium'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '2.5rem', marginBottom: '4rem' }}>
      <Link to="/dashboard" className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} />
        <span>Volver al Listado</span>
      </Link>

      {loading ? (
        <div className="card empty-state">
          <p style={{ color: 'var(--text-muted)' }}>Cargando información del siniestro...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ color: 'var(--danger)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <ShieldAlert size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Acceso no disponible
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            {error}
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Regresar a Mis Accidentes
          </Link>
        </div>
      ) : accident ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Radicado #{accident.id.slice(0, 8)}
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                Accidente de tipo {accident.accidentType}
              </h1>
            </div>
            <div>
              <span className={`badge ${getStatusBadgeClass(accident.status)}`} style={{ fontSize: '0.95rem', padding: '0.45rem 1rem' }}>
                {accident.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ color: 'var(--primary)' }}>
                <User size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Persona Afectada</div>
                <div style={{ fontWeight: 600 }}>{accident.affectedName}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ color: 'var(--primary)' }}>
                <Phone size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Teléfono de Contacto</div>
                <div style={{ fontWeight: 600 }}>{accident.affectedPhone}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ color: 'var(--primary)' }}>
                <Calendar size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Fecha del Suceso</div>
                <div style={{ fontWeight: 600 }}>{formatDate(accident.accidentDate)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ color: 'var(--primary)' }}>
                <MapPin size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Lugar del Hecho</div>
                <div style={{ fontWeight: 600 }}>{accident.location}</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 600 }}>
              <FileText size={18} />
              <span>Descripción de los Hechos</span>
            </div>
            <p style={{ color: 'var(--text-main)', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {accident.description}
            </p>
          </div>

          <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Registrado el: {new Date(accident.createdAt).toLocaleString('es-CO')}</span>
            <span>Última actualización: {new Date(accident.updatedAt).toLocaleString('es-CO')}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

