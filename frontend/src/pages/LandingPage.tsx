import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, FileText, Lock, ArrowRight, AlertTriangle } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleRegisterAccidentClick = () => {
    if (isAuthenticated) {
      navigate('/accidents/new');
    } else {
      navigate('/login?redirect=/accidents/new');
    }
  };

  const handleConsultAccidentsClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login?redirect=/dashboard');
    }
  };

  return (
    <div className="container">
      <section className="hero">
        <h1 className="hero-title">
          Plataforma de Reporte y Seguimiento de <span>Accidentes Personales</span>
        </h1>
        <p className="hero-subtitle">
          Registre incidentes de manera inmediata, segura y transparente. Consulte en tiempo real el estado de sus trámites con total privacidad y respaldo tecnológico.
        </p>

        <div className="hero-actions">
          <button onClick={handleRegisterAccidentClick} className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
            <AlertTriangle size={20} />
            <span>Registrar un accidente</span>
            <ArrowRight size={18} />
          </button>
          <button onClick={handleConsultAccidentsClick} className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
            <FileText size={20} />
            <span>Ingresar para consultar mis accidentes</span>
          </button>
        </div>
      </section>

      <section className="features-grid">
        <div className="card">
          <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
            <ShieldCheck size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            Seguridad y Control de Identidad
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Garantizamos que sus reportes están blindados y únicamente usted puede consultar la información asociada a su cuenta personal.
          </p>
        </div>

        <div className="card">
          <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>
            <FileText size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            Seguimiento de Estados
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Supervise en todo momento la evolución de su siniestro a través de las etapas: Registrado, En revisión y Cerrado.
          </p>
        </div>

        <div className="card">
          <div style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>
            <Lock size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            Protección de Privacidad
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Arquitectura de backend robusta con validación criptográfica y aislamiento riguroso contra referencias inseguras (Anti-IDOR).
          </p>
        </div>
      </section>
    </div>
  );
};

