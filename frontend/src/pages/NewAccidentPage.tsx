import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { AlertTriangle, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export const NewAccidentPage: React.FC = () => {
  const navigate = useNavigate();

  const [affectedName, setAffectedName] = useState('');
  const [affectedPhone, setAffectedPhone] = useState('');
  const [accidentType, setAccidentType] = useState('Tránsito');
  const [accidentDate, setAccidentDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones en frontend
    if (!affectedName.trim() || affectedName.trim().length < 2) {
      setError('El nombre del afectado es obligatorio (mínimo 2 caracteres).');
      return;
    }
    if (!affectedPhone.trim() || affectedPhone.trim().length < 7) {
      setError('El teléfono de contacto debe tener al menos 7 dígitos.');
      return;
    }
    if (!accidentDate) {
      setError('La fecha y hora del accidente son obligatorias.');
      return;
    }
    if (!location.trim() || location.trim().length < 2) {
      setError('El lugar del accidente es obligatorio.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('La descripción del accidente debe tener al menos 5 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await api.createAccident({
        affectedName: affectedName.trim(),
        affectedPhone: affectedPhone.trim(),
        accidentType,
        accidentDate: new Date(accidentDate).toISOString(),
        location: location.trim(),
        description: description.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el accidente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '720px', marginTop: '2.5rem', marginBottom: '4rem' }}>
      <Link to="/dashboard" className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} />
        <span>Volver a Mis Accidentes</span>
      </Link>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ color: 'var(--primary)' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reportar Accidente Personal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Complete el formulario con la información verídica de los hechos ocurridos
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            <span>Accidente registrado con éxito. Redirigiendo a su panel...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="affectedName">
                Nombre del Afectado *
              </label>
              <input
                id="affectedName"
                type="text"
                required
                className="form-input"
                placeholder="Nombre y Apellido"
                value={affectedName}
                onChange={(e) => setAffectedName(e.target.value)}
                disabled={loading || success}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="affectedPhone">
                Teléfono de Contacto *
              </label>
              <input
                id="affectedPhone"
                type="tel"
                required
                className="form-input"
                placeholder="Ej. +57 3001234567"
                value={affectedPhone}
                onChange={(e) => setAffectedPhone(e.target.value)}
                disabled={loading || success}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="accidentType">
                Tipo de Accidente *
              </label>
              <select
                id="accidentType"
                className="form-select"
                value={accidentType}
                onChange={(e) => setAccidentType(e.target.value)}
                disabled={loading || success}
              >
                <option value="Tránsito">Tránsito (Vehicular / Peatonal)</option>
                <option value="Laboral">Laboral (En jornada de trabajo)</option>
                <option value="Hogar">Doméstico / Hogar</option>
                <option value="Deporte">Deportivo / Recreativo</option>
                <option value="Otro">Otro tipo de siniestro</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="accidentDate">
                Fecha y Hora del Accidente *
              </label>
              <input
                id="accidentDate"
                type="datetime-local"
                required
                className="form-input"
                value={accidentDate}
                onChange={(e) => setAccidentDate(e.target.value)}
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">
              Lugar del Accidente (Dirección o Referencia) *
            </label>
            <input
              id="location"
              type="text"
              required
              className="form-input"
              placeholder="Ej. Av. Calle 26 # 68-35, Bogotá"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading || success}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Descripción de lo Ocurrido *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              className="form-textarea"
              placeholder="Describa con la mayor precisión posible cómo sucedió el incidente..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading || success}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <Link to="/dashboard" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || success}
            >
              {loading ? 'Guardando en servidor...' : (
                <>
                  <Send size={18} />
                  <span>Enviar Reporte</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

