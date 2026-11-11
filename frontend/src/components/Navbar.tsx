import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, User, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="brand">
          <ShieldAlert size={28} />
          <span>AccidentesSeguros</span>
        </Link>

        <nav>
          <ul className="nav-links">
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/dashboard" className="btn btn-secondary">
                    <LayoutDashboard size={18} />
                    <span>Mis Accidentes</span>
                  </Link>
                </li>
                <li>
                  <Link to="/accidents/new" className="btn btn-primary">
                    <PlusCircle size={18} />
                    <span>Reportar Accidente</span>
                  </Link>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <User size={18} />
                  <span style={{ fontWeight: 500 }}>{user?.fullName}</span>
                </li>
                <li>
                  <button onClick={handleLogout} className="btn btn-outline" title="Cerrar sesión">
                    <LogOut size={18} />
                    <span>Salir</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="btn btn-secondary">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary">
                    Crear Cuenta
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

