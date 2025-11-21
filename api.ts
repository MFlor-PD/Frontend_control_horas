// /app/api.ts
import axios from "axios";

const API_URL = "http://localhost:4000/api/users/login";

// Tipos
export interface User {
  id: string;
  nombre: string;
  email: string;
  valorHora: number;
  foto?: string;
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

// Token JWT global (puedes usar AsyncStorage en app real)
let token: string | null = null;
export const setToken = (newToken: string) => {
  token = newToken;
};

// Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor para enviar token en todas las requests
axiosInstance.interceptors.request.use(config => {
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

export const updateProfile = async (userId: string, nombre: string, foto: string, valorHora: number) => {
  const res = await axiosInstance.put(`/users/me/${userId}`, { nombre, foto, valorHora });
  return res.data as User;
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

export const marcarExtra = async (fichajeId: string) => {
  const res = await axiosInstance.put(`/fichajes/extra/${fichajeId}`);
  return res.data as { message: string; fichaje: Fichaje };
};

export const historialFichajes = async () => {
  const res = await axiosInstance.get("/fichajes/historial");
  return res.data as { historial: Fichaje[]; totales: { semana: number; mes: number } };
};
