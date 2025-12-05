// /app/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://localhost:4000/api";

// ---------------------- TIPOS ---------------------- //
export interface User {
  id: string;
  nombre: string;
  email: string;
  valorHora: number;
  foto?: string;
  password?: string;
}

export interface UpdateProfileResponse {
  user: User;
  token?: string;
  passwordChanged: boolean;
  emailChanged: boolean;
}

export interface Fichaje {
  _id: string;
  usuario: string | User;
  fecha: string;
  inicio: string;
  fin?: string;
  duracionHoras?: number;
  importeDia?: number;
  extra?: boolean;
}

// ---------------------- AXIOS ---------------------- //
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor para enviar token desde AsyncStorage en todas las requests
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------- USERS ---------------------- //
export const registerUser = async (
  nombre: string,
  email: string,
  password: string,
  valorHora: number
) => {
  const res = await axiosInstance.post("/users/register", { nombre, email, password, valorHora });
  return res.data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await axiosInstance.post("/users/login", { email, password });
  return res.data; // { token, user }
};

export const getProfile = async (userId: string) => {
  const res = await axiosInstance.get(`/users/me/${userId}`);
  return res.data as User;
};

export const updateProfile = async (
  userId: string,
  data: {
    nombre?: string;
    email?: string;
    foto?: string;
    password?: string;
    valorHora?: number;
    moneda?: string;
  }
): Promise<UpdateProfileResponse> => {
  const res = await axiosInstance.put(`/users/me/${userId}`, data);
  return res.data as UpdateProfileResponse;
};

export const deleteUser = async (userId: string) => {
  try {
    const res = await axiosInstance.delete(`/users/me/${userId}`);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error eliminando usuario:", error.response?.data || error.message);
    throw error;
  }
};

// ---------------------- FICHAJES ---------------------- //
export const registrarEntrada = async () => {
  const res = await axiosInstance.post("/fichajes/entrada");
  return res.data as { message: string; fichaje: Fichaje };
};

export const registrarSalida = async (fichajeId: string) => {
  const res = await axiosInstance.put(`/fichajes/salida/${fichajeId}`);
  return res.data as { message: string; fichaje: Fichaje };
};

export const marcarExtra = async (fichajeId: string, extra: boolean) => {
  const res = await axiosInstance.put(`/fichajes/extra/${fichajeId}`, { extra });
  return res.data as { message: string; fichaje: Fichaje };
};

export const historialFichajes = async () => {
  const res = await axiosInstance.get("/fichajes/historial");
  return res.data as { historial: Fichaje[]; totales: { semana: number; mes: number } };
};

export const getFichajeActual = async () => {
  try {
    const res = await axiosInstance.get("/fichajes/actual");
    return res.data as { fichajeEnCurso?: Fichaje };
  } catch (error) {
    console.error("Error getFichajeActual:", error);
    return null;
  }
};

export const eliminarFichaje = async (fichajeId: string) => {
  try {
    const res = await axiosInstance.delete(`/fichajes/eliminar/${fichajeId}`);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error eliminando:", error.response?.data || error.message);
    throw error;
  }
};

export const eliminarTodoHistorial = async () => {
  try {
    const res = await axiosInstance.delete("/fichajes/eliminar-historial");
    return res.data;
  } catch (error: any) {
    console.error("❌ Error eliminando todo:", error.response?.data || error.message);
    throw error;
  }
};
