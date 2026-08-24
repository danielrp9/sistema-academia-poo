import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { Usuario, LoginResponse, Role } from '../types';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isColaborador: boolean;
  isCliente: boolean;
  hasRole: (roles: Role[]) => boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storagedToken = localStorage.getItem('@Academia:token');
    const storagedUser = localStorage.getItem('@Academia:user');

    if (storagedToken && storagedUser) {
      setToken(storagedToken);
      try {
        setUser(JSON.parse(storagedUser));
      } catch {
        localStorage.removeItem('@Academia:user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { email, senha });
    const { token: jwtToken, usuarioId, nome, role } = response.data;

    const loggedUser: Usuario = {
      id: usuarioId,
      nome,
      email,
      role,
      ativo: true,
    };

    setToken(jwtToken);
    setUser(loggedUser);

    localStorage.setItem('@Academia:token', jwtToken);
    localStorage.setItem('@Academia:user', JSON.stringify(loggedUser));
  };

  const logout = () => {
    localStorage.removeItem('@Academia:token');
    localStorage.removeItem('@Academia:user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isColaborador = user?.role === 'COLABORADOR';
  const isCliente = user?.role === 'CLIENTE';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin,
        isColaborador,
        isCliente,
        hasRole,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
