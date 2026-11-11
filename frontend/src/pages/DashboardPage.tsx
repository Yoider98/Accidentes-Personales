import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Accident } from '../services/api';
import { PlusCircle, FileText, AlertCircle, Calendar, MapPin, Eye } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccidents = async () => {
      try {
        setLoading(true);
        const data = await api.listAccidents();
        setAccidents(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar sus accidentes.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccidents();
  }, []);

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
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container" style={{ marginTop: '2.5rem', marginBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700 }}>Mis Accidentes Personales</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Consulte y supervise el estado de los incidentes asociados exclusivamente a su cuenta
          </p>
        </div>
        <Link to="/accidents/new" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Reportar Nuevo Accidente</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card empty-state">
          <p style={{ color: 'var(--text-muted)' }}>Cargando registros de accidentes...</p>
        </div>
      ) : accidents.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <FileText size={48} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Aún no tiene accidentes registrados
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.75rem' }}>
            Si ha experimentado un accidente personal o necesita reportar un caso, puede crearlo inmediatamente desde aquí.
          </p>
          <Link to="/accidents/new" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Registrar mi primer accidente</span>
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Persona Afectada</th>
                  <th>Tipo</th>
                  <th>Fecha del Siniestro</th>
                  <th>Lugar</th>
                  <th>Estado Actual</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {accidents.map((acc) => (
                  <tr key={acc.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{acc.affectedName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{acc.affectedPhone}</div>
                    </td>
                    <td>{acc.accidentType}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                        <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
                        <span>{formatDate(acc.accidentDate)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                        <MapPin size={15} style={{ color: 'var(--text-muted)' }} />
                        <span>{acc.location}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(acc.status)}`}>
                        {acc.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/accidents/${acc.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        <Eye size={16} />
                        <span>Ver Detalle</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

