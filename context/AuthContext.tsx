import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;        // SOLO para carga inicial
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: any) => Promise<void>; // Función para actualizar el usuario
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🚀 CARGA INICIAL (solo se ejecuta una vez)
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
      setLoading(false); // termina la carga inicial
    }
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // 🔥 LOGIN
  const login = async (data: any) => {
    try {
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.log("Error en login:", error);
    }
  };

  // 🔥 LOGOUT
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

  // 🔄 ACTUALIZAR USUARIO
  const updateUser = async (data: any) => {
    try {
      setUser(data); // Actualiza estado local
      await AsyncStorage.setItem("user", JSON.stringify(data)); // Actualiza AsyncStorage
    } catch (error) {
      console.log("Error actualizando usuario:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
