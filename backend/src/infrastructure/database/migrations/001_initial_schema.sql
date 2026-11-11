-- Extension para generacion de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de Accidentes
CREATE TABLE IF NOT EXISTS accidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affected_name VARCHAR(255) NOT NULL,
  affected_phone VARCHAR(50) NOT NULL,
  accident_type VARCHAR(100) NOT NULL,
  accident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Registrado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT check_accident_status CHECK (status IN ('Registrado', 'En revisión', 'Cerrado'))
);

-- Indices de optimizacion y control Anti-IDOR
CREATE INDEX IF NOT EXISTS idx_accidents_user_id ON accidents(user_id);
CREATE INDEX IF NOT EXISTS idx_accidents_status ON accidents(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
