// /raiz/app/(tabs)/historical.tsx
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { eliminarFichaje, eliminarTodoHistorial, Fichaje, historialFichajes, marcarExtra } from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { useProfilePhoto } from "../../hooks/useProfilePhoto";

const DEFAULT_ICON = "https://i.pravatar.cc/150";

export default function Historical() {
  const { user, loading, updateUser } = useContext(AuthContext);
  const router = useRouter();

  const [grouped, setGrouped] = useState<{ [key: string]: Fichaje[] }>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { pickImage } = useProfilePhoto();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
    else if (user) fetchHistorial();
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
      setGrouped(agrupado);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error historial:", error);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleExtra = async (f: Fichaje) => {
  try {
    const data = await marcarExtra(f._id, !f.extra); // toggle
    setGrouped(prev => {
      const key = new Date(f.fecha).toISOString().split("T")[0];
      return {
        ...prev,
        [key]: prev[key].map(item => item._id === f._id ? data.fichaje : item),
      };
    });
  } catch (err) {
    console.error("Error toggle extra:", err);
  }
};

  const confirmAction = async (message: string) => {
    if (Platform.OS === "web") return window.confirm(message);
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
  };

  const handleEliminarSeleccionados = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirmAction(`¿Deseas eliminar ${selectedIds.length} fichaje(s)?`);
    if (!ok) return;
    try {
      await Promise.all(selectedIds.map((id) => eliminarFichaje(id)));
      await fetchHistorial();
    } catch (err) {
      console.error("Error eliminando fichajes:", err);
    }
  };

  const handleEliminarTodo = async () => {
    const ok = await confirmAction("¿Deseas eliminar todo el historial?");
    if (!ok) return;
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
      <TouchableOpacity
        style={styles.userHeader}
        onPress={async () => {
          const uri = await pickImage();
          if (uri && user) await updateUser({ ...user, foto: uri });
        }}
      >
        <Image source={{ uri: user.foto || DEFAULT_ICON }} style={styles.userAvatar} />
        <Text style={styles.userGreeting}>Hola, {user.nombre}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Historial de Fichajes</Text>

      {Object.keys(grouped).map((dia) => {
        const fecha = new Date(dia).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
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
                    <Text style={styles.row}><Text style={styles.label}>Entrada: </Text>{f.inicio}</Text>
                    <Text style={styles.row}><Text style={styles.label}>Salida: </Text>{f.fin || "--"}</Text>
                    <Text style={styles.row}><Text style={styles.label}>Total: </Text>{f.duracionHoras?.toFixed(2) || "0"}h</Text>
                  </View>
                  {/* Checkbox extra */}
                  <Pressable style={styles.extraContainer} onPress={() => toggleExtra(f)}>
                    <View style={[styles.checkbox, f.extra && styles.checkboxSelected]} />
                    <Text style={styles.extraLabel}>Extra</Text>
                  </Pressable>
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
  container: { flex: 1, padding: 20, backgroundColor: "#F3F5F7" },
  userHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15, gap: 10 },
  userAvatar: { width: 50, height: 50, borderRadius: 25 },
  userGreeting: { fontSize: 18, fontWeight: "700" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 15 },
  dayBlock: { marginBottom: 20 },
  dayTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  card: { backgroundColor: "white", borderRadius: 12, padding: 15, marginBottom: 10, elevation: 3, flexDirection: "row", alignItems: "flex-start", position: "relative" },
  cardSelected: { borderWidth: 2, borderColor: "#FF3B30" },
  checkboxContainer: { marginRight: 10, marginTop: 5 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: "#999", borderRadius: 4, backgroundColor: "white" },
  checkboxSelected: { backgroundColor: "#FF3B30", borderColor: "#FF3B30" },
  cardContent: { flex: 1 },
  row: { fontSize: 16, marginBottom: 5 },
  label: { fontWeight: "600" },
  extraContainer: { flexDirection: "row", alignItems: "center", marginTop: 5, gap: 5 },
  extraLabel: { fontSize: 14, fontWeight: "600" },
  buttonsContainer: { flexDirection: "row", justifyContent: "center", marginTop: 10, marginBottom: 30 },
  button: { backgroundColor: "#FF9500", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, alignItems: "center", marginHorizontal: 5 },
  buttonRed: { backgroundColor: "#FF3B30" },
  buttonText: { color: "white", fontWeight: "600", fontSize: 14 },
});
