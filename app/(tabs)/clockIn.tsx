import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function ClockIn() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/"); // Redirige a login si no hay usuario
    }
  }, [user, loading]);

  if (!user || loading) return null;

  const displayName = user?.nombre || user?.email || "Usuario";

  const handlePress = () => {
    setWorking(!working); // alterna entre iniciar y finalizar
    // aquí podrías iniciar o parar tu cronómetro
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="person-outline" size={20} color="#000" />
          <Text style={styles.headerText}>Hola, {displayName}</Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: working ? "green" : "gray" }]} />
          <Text style={[styles.statusText, { color: working ? "green" : "gray" }]}>
            {working ? "Trabajando" : "Fuera de turno"}
          </Text>
        </View>
      </View>

      {/* BOTÓN FICHAR */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            { backgroundColor: working ? "green" : "#FF4D4D" }, // rojo si no trabaja, verde si trabaja
          ]}
          onPress={handlePress}
        >
          <Text style={styles.buttonText}>
            {working ? "FICHAR SALIDA" : "FICHAR ENTRADA"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* TARJETAS DE HORAS */}
      <View style={styles.cardsContainer}>
        {/* Horas Hoy */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horas Hoy</Text>
          <Text style={styles.cardValue}>04h 15m</Text>
          <Text style={styles.cardSub}>Aprox. 42.50€</Text>
        </View>

        {/* Horas Semana */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horas Semana</Text>
          <Text style={styles.cardValue}>24h</Text>
          <Text style={styles.cardSub}>Aprox. 240.00€</Text>
        </View>

        {/* Horas Mes */}
        <View style={styles.cardLarge}>
          <Text style={styles.cardTitle}>Horas Mes</Text>
          <Text style={styles.cardValue}>96h</Text>
          <Text style={styles.cardSub}>Aprox. 960.00€</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F5F7",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 40,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 50,
    backgroundColor: "green",
  },
  statusText: {
    color: "green",
    fontWeight: "600",
  },

  buttonWrapper: {
    alignItems: "center",
    marginBottom: 40,
  },
  mainButton: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 16,
    borderRadius: 50,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  cardsContainer: {
    alignItems: "center",
    gap: 20,
  },
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
    marginTop: 10,
  },
  cardTitle: {
    color: "#555",
    fontSize: 15,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 5,
  },
  cardSub: {
    color: "#999",
    marginTop: 5,
  },
});
