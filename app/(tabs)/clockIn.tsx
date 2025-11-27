// app/(tabs)/clockIn.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Fichaje,
  getFichajeActual,
  historialFichajes,
  registrarEntrada,
  registrarSalida,
} from "../../api";
import { AuthContext } from "../../context/AuthContext";

export default function ClockIn() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  const [working, setWorking] = useState(false);
  const [fichajeId, setFichajeId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const intervalRef = useRef<number | null>(null);

  const [horasHoy, setHorasHoy] = useState(0);
  const [horasSemana, setHorasSemana] = useState(0);
  const [horasMes, setHorasMes] = useState(0);

  // 🔥 Animated value para animar el cronómetro
  const animatedValue = useRef(new Animated.Value(0)).current;

  const animateTick = () => {
    Animated.timing(animatedValue, {
      toValue: seconds,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  // Formatear HH:MM:SS
  const formatHHMMSS = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    return (
      String(h).padStart(2, "0") +
      ":" +
      String(m).padStart(2, "0") +
      ":" +
      String(s).padStart(2, "0")
    );
  };

  // Redirigir si no hay usuario
  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user]);

  // Ver si hay un fichaje en curso
  useEffect(() => {
    if (!user) return;

    const fetchActivo = async () => {
      try {
        const data = await getFichajeActual();
        if (data?.fichajeEnCurso) {
          setWorking(true);
          setFichajeId(data.fichajeEnCurso._id);

          const inicio = data.fichajeEnCurso.inicio;
          const fecha = data.fichajeEnCurso.fecha;

          const inicioDate = new Date(fecha);
          const [h, m] = inicio.split(":");
          inicioDate.setHours(Number(h), Number(m), 0, 0);

          const ahora = new Date();
          const diff = Math.floor((ahora.getTime() - inicioDate.getTime()) / 1000);

          setSeconds(diff);
          startInterval();
        }
      } catch (error) {
        console.error("Error getFichajeActual:", error);
      }
    };

    fetchActivo();
    fetchTotales();
  }, [user]);

  // Intervalo cronómetro
  const startInterval = () => {
    if (intervalRef.current !== null) return;

    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000) as unknown as number;
  };

  const stopInterval = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Animación cada segundo
  useEffect(() => {
    animateTick();
  }, [seconds]);

  // Totales
  const fetchTotales = async () => {
    try {
      const data = await historialFichajes();
      const hoyStr = new Date().toDateString();

      const horasDia = data.historial
        .filter((f: Fichaje) => new Date(f.fecha).toDateString() === hoyStr)
        .reduce((acc: number, f: Fichaje) => acc + (f.duracionHoras || 0), 0);

      const horasSemana = data.historial.reduce(
        (acc: number, f: Fichaje) => acc + (f.duracionHoras || 0),
        0
      );

      setHorasHoy(horasDia);
      setHorasSemana(horasSemana);
      setHorasMes(horasSemana);
    } catch (error) {
      console.error("Error historial:", error);
    }
  };

  const ficharEntrada = async () => {
    try {
      const data = await registrarEntrada();
      setWorking(true);
      setFichajeId(data.fichaje._id);

      setSeconds(0);
      startInterval();
      fetchTotales();
    } catch (error) {
      console.error("Error entrada:", error);
    }
  };

  const ficharSalida = async () => {
    if (!fichajeId) return;

    try {
      await registrarSalida(fichajeId);
      stopInterval();

      setWorking(false);
      setFichajeId(null);
      setSeconds(0);

      fetchTotales();
    } catch (error) {
      console.error("Error salida:", error);
    }
  };

  const handlePress = () => {
    working ? ficharSalida() : ficharEntrada();
  };

  if (loading || !user) return null;

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="person-outline" size={20} color="#000" />
          <Text style={styles.headerText}>Hola, {user.nombre}</Text>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: working ? "green" : "gray" },
            ]}
          />
          <Text
            style={[styles.statusText, { color: working ? "green" : "gray" }]}
          >
            {working ? "Trabajando" : "Fuera de turno"}
          </Text>
        </View>
      </View>

      {/* 🔥 CRONÓMETRO ARRIBA DEL BOTÓN */}
      {working && (
        <Animated.Text
          style={{
            fontSize: 38,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
            opacity: animatedValue.interpolate({
              inputRange: [seconds - 1, seconds],
              outputRange: [0.4, 1],
            }),
          }}
        >
          {formatHHMMSS(seconds)}
        </Animated.Text>
      )}

      {/* BOTÓN */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            { backgroundColor: working ? "green" : "#FF4D4D" },
          ]}
          onPress={handlePress}
        >
          <Text style={styles.buttonText}>
            {working ? "FICHAR SALIDA" : "FICHAR ENTRADA"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* TARJETAS */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horas Hoy</Text>
          <Text style={styles.cardValue}>{horasHoy.toFixed(2)}h</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horas Semana</Text>
          <Text style={styles.cardValue}>{horasSemana.toFixed(2)}h</Text>
        </View>

        <View style={styles.cardLarge}>
          <Text style={styles.cardTitle}>Horas Mes</Text>
          <Text style={styles.cardValue}>{horasMes.toFixed(2)}h</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F3F5F7" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerText: { fontSize: 16, fontWeight: "600" },
  statusContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 50 },
  statusText: { fontWeight: "600" },

  buttonWrapper: { alignItems: "center", marginBottom: 30 },
  mainButton: {
    paddingVertical: 16,
    borderRadius: 50,
    width: "80%",
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "600" },

  cardsContainer: { alignItems: "center", gap: 20 },
  card: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  cardLarge: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  cardTitle: { color: "#555", fontSize: 15, fontWeight: "500" },
  cardValue: { fontSize: 28, fontWeight: "700", marginTop: 5 },
});
