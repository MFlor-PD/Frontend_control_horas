import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getFichajeActual,
  registrarEntrada,
  registrarSalida,
} from "../../api";
import { AuthContext } from "../../context/AuthContext";

const DEFAULT_ICON = "https://i.pravatar.cc/150";

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

  const animatedValue = useRef(new Animated.Value(0)).current;

  // 🔐 Redirección si no hay sesión
  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user]);

  // ⏱️ Fichaje activo
  useEffect(() => {
    if (!user) return;

    const fetchActivo = async () => {
      try {
        const data = await getFichajeActual();
        if (data?.fichajeEnCurso) {
          setWorking(true);
          setFichajeId(data.fichajeEnCurso._id);

          // Calcular segundos desde la fecha UTC
          const inicioDate = new Date(data.fichajeEnCurso.fecha);
          const diff = Math.floor((Date.now() - inicioDate.getTime()) / 1000);
          setSeconds(diff);

          startInterval();
        }
      } catch (err) {
        console.error("Error getFichajeActual:", err);
      }
    };

    fetchActivo();
  }, [user]);

  const startInterval = () => {
    if (intervalRef.current !== null) return;
    intervalRef.current = setInterval(
      () => setSeconds((s) => s + 1),
      1000
    ) as unknown as number;
  };

  const stopInterval = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: seconds,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [seconds]);

  const formatHHMMSS = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  const ficharEntrada = async () => {
    try {
      const data = await registrarEntrada();
      setWorking(true);
      setFichajeId(data.fichaje._id);
      setSeconds(0);
      startInterval();
    } catch (err) {
      console.error("Error entrada:", err);
    }
  };

  const ficharSalida = async () => {
    if (!fichajeId) return;

    try {
      const data = await registrarSalida(fichajeId);
      const duracion = data.fichaje.duracionHoras || 0;

      stopInterval();
      setWorking(false);
      setFichajeId(null);
      setSeconds(0);

      setHorasHoy((h) => h + duracion);
      setHorasSemana((h) => h + duracion);
      setHorasMes((h) => h + duracion);
    } catch (err) {
      console.error("Error salida:", err);
    }
  };

  const handlePress = () => {
    working ? ficharSalida() : ficharEntrada();
  };

  const resetTotales = () => {
    setHorasHoy(0);
    setHorasSemana(0);
    setHorasMes(0);
  };

  if (loading || !user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.userHeader}>
        <Image
          source={{ uri: user.foto || DEFAULT_ICON }}
          style={styles.userAvatar}
        />
        <Text style={styles.userGreeting}>Hola, {user.nombre}</Text>
      </View>

      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: working ? "green" : "gray" },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: working ? "green" : "gray" },
            ]}
          >
            {working ? "Trabajando" : "Fuera de turno"}
          </Text>
        </View>
      </View>

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

      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horas Hoy</Text>
          <Text style={styles.cardValue}>{horasHoy.toFixed(2)}h</Text>
          <Text style={styles.cardApprox}>
            aprox. {(horasHoy * (user.valorHora || 0)).toFixed(2)}{" "}
            {user.moneda || "EUR"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horas Semana</Text>
          <Text style={styles.cardValue}>{horasSemana.toFixed(2)}h</Text>
          <Text style={styles.cardApprox}>
            aprox. {(horasSemana * (user.valorHora || 0)).toFixed(2)}{" "}
            {user.moneda || "EUR"}
          </Text>
        </View>

        <View style={styles.cardLarge}>
          <Text style={styles.cardTitle}>Horas Mes</Text>
          <Text style={styles.cardValue}>{horasMes.toFixed(2)}h</Text>
          <Text style={styles.cardApprox}>
            aprox. {(horasMes * (user.valorHora || 0)).toFixed(2)}{" "}
            {user.moneda || "EUR"}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: "center", marginTop: 25 }}>
        <TouchableOpacity
          onPress={resetTotales}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: "#888",
            borderRadius: 30,
          }}
        >
          <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>
            Reset
          </Text>
        </TouchableOpacity>
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
  statusContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 50 },
  statusText: { fontWeight: "600" },
  buttonWrapper: { alignItems: "center", marginBottom: 10 },
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
  cardApprox: {
    marginTop: 5,
    fontSize: 14,
    color: "#777",
    fontWeight: "500",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  userAvatar: { width: 50, height: 50, borderRadius: 25 },
  userGreeting: { fontSize: 18, fontWeight: "700" },
});
