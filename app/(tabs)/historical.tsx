import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { eliminarFichaje, eliminarTodoHistorial, Fichaje, historialFichajes } from "../../api";
import { AuthContext } from "../../context/AuthContext";

export default function Historical() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  const [grouped, setGrouped] = useState<{ [key: string]: Fichaje[] }>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

      const agrupado: { [key: string]: Fichaje[] } = {};
      list.forEach((f) => {
        const key = new Date(f.fecha).toISOString().split("T")[0];
        if (!agrupado[key]) agrupado[key] = [];
        agrupado[key].push(f);
      });

      console.log("🔹 Historial actualizado:", list.map(f => f._id));
      setGrouped(agrupado);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error historial:", error);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ---------------------------------------------------
  // Confirmación unificada web / móvil
  const confirmAction = async (message: string) => {
    if (Platform.OS === "web") {
      return window.confirm(message);
    } else {
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          "Confirmar",
          message,
          [
            { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
            { text: "Eliminar", style: "destructive", onPress: () => resolve(true) },
          ],
          { cancelable: true }
        );
      });
    }
  };

  const handleEliminarSeleccionados = async () => {
    console.log("🔴 BOTÓN ELIMINAR SELECCIONADOS PRESIONADO");
    if (selectedIds.length === 0) return;

    const ok = await confirmAction(`¿Deseas eliminar ${selectedIds.length} fichaje(s)?`);
    if (!ok) return;

    console.log("✅ Usuario confirmó eliminación de seleccionados");
    try {
      await Promise.all(selectedIds.map((id) => eliminarFichaje(id)));
      await fetchHistorial();
    } catch (err) {
      console.error("Error eliminando fichajes:", err);
    }
  };

  const handleEliminarTodo = async () => {
    console.log("🔴 BOTÓN ELIMINAR TODO PRESIONADO");

    const ok = await confirmAction("¿Deseas eliminar todo el historial?");
    if (!ok) return;

    console.log("✅ Usuario confirmó eliminar todo");
    try {
      await eliminarTodoHistorial();
      await fetchHistorial();
    } catch (err) {
      console.error("Error eliminando historial:", err);
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

            {grouped[dia].map((f) => {
              const isSelected = selectedIds.includes(f._id);
              return (
                <View key={f._id} style={[styles.card, isSelected && styles.cardSelected]}>
                  <Pressable style={styles.checkboxContainer} onPress={() => toggleSelect(f._id)}>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]} />
                  </Pressable>

                  <View style={styles.cardContent}>
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
                </View>
              );
            })}
          </View>
        );
      })}

      {Object.keys(grouped).length > 0 && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handleEliminarSeleccionados}>
            <Text style={styles.buttonText}>Eliminar seleccionados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonRed]} onPress={handleEliminarTodo}>
            <Text style={styles.buttonText}>Eliminar todo</Text>
          </TouchableOpacity>
        </View>
      )}
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
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#FF3B30",
  },
  checkboxContainer: {
    marginRight: 10,
    marginTop: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#999",
    borderRadius: 4,
    backgroundColor: "white",
  },
  checkboxSelected: {
    backgroundColor: "#FF3B30",
    borderColor: "#FF3B30",
  },
  cardContent: {
    flex: 1,
  },
  row: {
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    fontWeight: "600",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#FF9500",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonRed: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
