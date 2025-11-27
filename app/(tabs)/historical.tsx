import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Fichaje, historialFichajes } from "../../api";
import { AuthContext } from "../../context/AuthContext";

export default function Historical() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  const [grouped, setGrouped] = useState<{ [key: string]: Fichaje[] }>({});

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    } else if (user) {
      fetchHistorial();
    }
  }, [loading, user]);

  const fetchHistorial = async () => {
    try {
      const data = await historialFichajes();
      const list = data.historial || [];

      // Agrupar fichajes por día
      const agrupado: { [key: string]: Fichaje[] } = {};
      list.forEach((f) => {
        const key = new Date(f.fecha).toISOString().split("T")[0]; // YYYY-MM-DD
        if (!agrupado[key]) agrupado[key] = [];
        agrupado[key].push(f);
      });

      setGrouped(agrupado);
    } catch (error) {
      console.error("Error historial:", error);
    }
  };

  if (!user || loading) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Historial de Fichajes</Text>

      {Object.keys(grouped).map((dia) => {
        const fecha = new Date(dia).toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <View key={dia} style={styles.dayBlock}>
            <Text style={styles.dayTitle}>{fecha}</Text>

            {grouped[dia].map((f) => (
              <View key={f._id} style={styles.card}>
                <Text style={styles.row}>
                  <Text style={styles.label}>Entrada: </Text>{f.inicio}
                </Text>
                <Text style={styles.row}>
                  <Text style={styles.label}>Salida: </Text>{f.fin || "--"}
                </Text>
                <Text style={styles.row}>
                  <Text style={styles.label}>Total: </Text>{f.duracionHoras?.toFixed(2) || "0"}h
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F5F7",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  dayBlock: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  row: {
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    fontWeight: "600",
  },
});
