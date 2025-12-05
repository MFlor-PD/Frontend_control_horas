import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import { updateProfile as apiUpdateProfile, UpdateProfileResponse, User } from "../api"; // importa tu api.ts

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: { token: string; user: User }) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>; // ✅ datos locales
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  updateUser: async () => {}, // ✅ default
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // CARGA INICIAL
  const loadUserFromStorage = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log("Error leyendo AsyncStorage:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // LOGIN
  const login = async (data: { token: string; user: User }) => {
    try {
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.log("Error en login:", error);
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.log("Error en logout:", error);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  // ACTUALIZAR DATOS LOCALES (nombre, foto, moneda, etc.)
  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.log("Error actualizando datos locales:", error);
    }
  };

  // ACTUALIZAR PERFIL (backend)
  const updateUserProfile = async (data: Partial<User> & { password?: string }) => {
    if (!user) return;

    try {
      const response: UpdateProfileResponse = await apiUpdateProfile(user.id, data);

      // Actualizar AsyncStorage con el usuario del backend
      await AsyncStorage.setItem("user", JSON.stringify(response.user));

      // Si cambió password, guardar token nuevo
      if (response.passwordChanged && response.token) {
        await AsyncStorage.setItem("token", response.token);
        setToken(response.token);
      }

      // Si cambió email, forzar logout
      if (response.emailChanged) {
        await logout();
        return;
      }

      // Actualizar estado
      setUser(response.user);
    } catch (error) {
      console.log("Error actualizando perfil:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUserProfile, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
