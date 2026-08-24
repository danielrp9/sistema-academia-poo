import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Salas } from './pages/Salas';
import { Planos } from './pages/Planos';
import { Usuarios } from './pages/Usuarios';
import { Agendamentos } from './pages/Agendamentos';
import { Catraca } from './pages/Catraca';
import { Financeiro } from './pages/Financeiro';
import { Produtos } from './pages/Produtos';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Privadas */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/salas" element={<Salas />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/agendamentos" element={<Agendamentos />} />
              <Route path="/catraca" element={<Catraca />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/produtos" element={<Produtos />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
