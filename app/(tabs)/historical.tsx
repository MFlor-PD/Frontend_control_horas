import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  eliminarFichaje,
  eliminarTodoHistorial,
  Fichaje,
  historialFichajes,
  marcarExtra,
} from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { generarFichajesPDF } from "../../utils/generarFichajePdf";
import { generarFichajesExcel } from "../../utils/generarFichajesExcel";

const DEFAULT_ICON = "https://i.pravatar.cc/150";

export default function Historical() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  const [fichajes, setFichajes] = useState<Fichaje[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
    else if (user) fetchHistorial();
  }, [loading, user]);

  const fetchHistorial = async () => {
    try {
      const data = await historialFichajes();
      const list = data.historial || [];
      // Ordenar por fecha descendente (más reciente primero)
      setFichajes(list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
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

  const toggleExtra = async (f: Fichaje) => {
    try {
      const data = await marcarExtra(f._id, !f.extra);
      setFichajes((prev) =>
        prev.map((item) => (item._id === f._id ? data.fichaje : item))
      );
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
    const ok = await confirmAction(
      `¿Deseas eliminar ${selectedIds.length} fichaje(s)?`
    );
    if (!ok) return;
    await Promise.all(selectedIds.map((id) => eliminarFichaje(id)));
    fetchHistorial();
  };

  const handleEliminarTodo = async () => {
    const ok = await confirmAction("¿Deseas eliminar todo el historial?");
    if (!ok) return;
    await eliminarTodoHistorial();
    fetchHistorial();
  };

  const fichajesParaExportar: Fichaje[] = (
    selectedIds.length > 0
      ? fichajes.filter((f) => selectedIds.includes(f._id))
      : fichajes
  ).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  if (!user || loading) return null;

  const formatTime = (isoString?: string) =>
    isoString
      ? new Date(isoString).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--";

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header fijo */}
      <View style={styles.header}>
        <View style={styles.userHeader}>
          <Image source={{ uri: user.foto || DEFAULT_ICON }} style={styles.userAvatar} />
          <Text style={styles.userGreeting}>Hola, {user.nombre}</Text>
        </View>
        <Text style={styles.title}>Historial de Fichajes</Text>
      </View>

      {/* Contenido scrolleable */}
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
      >
        {fichajes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay fichajes en el historial</Text>
          </View>
        ) : (
          <>
            {fichajes.map((f) => {
              const isSelected = selectedIds.includes(f._id);

              return (
                <View key={f._id} style={[styles.card, isSelected && styles.cardSelected]}>
                  <Pressable style={styles.checkboxContainer} onPress={() => toggleSelect(f._id)}>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]} />
                  </Pressable>

                  <View style={styles.cardContent}>
                    <Text style={styles.dateText}>{formatDate(f.fecha)}</Text>
                    <Text style={styles.row}>
                      <Text style={styles.label}>Entrada: </Text>
                      {formatTime(f.inicio)}
                    </Text>
                    <Text style={styles.row}>
                      <Text style={styles.label}>Salida: </Text>
                      {formatTime(f.fin)}
                    </Text>
                    <Text style={styles.row}>
                      <Text style={styles.label}>Total: </Text>
                      {f.duracionHoras?.toFixed(2) || "0"}h
                    </Text>
                  </View>

                  <Pressable style={styles.extraContainer} onPress={() => toggleExtra(f)}>
                    <View style={[styles.checkbox, f.extra && styles.checkboxSelected]} />
                    <Text style={styles.extraLabel}>Extra</Text>
                  </Pressable>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Botones fijos en la parte inferior con scroll horizontal */}
      {fichajes.length > 0 && (
        <View style={styles.bottomButtonsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonsScrollContent}
          >
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleEliminarSeleccionados}
              disabled={selectedIds.length === 0}
            >
              <Text style={styles.buttonText}>
                {selectedIds.length > 0 ? `Eliminar (${selectedIds.length})` : "Eliminar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.buttonRed]} 
              onPress={handleEliminarTodo}
            >
              <Text style={styles.buttonText}>Eliminar todo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonGreen]}
              onPress={() => generarFichajesPDF(fichajesParaExportar, user)}
            >
              <Text style={styles.buttonText}>
                {selectedIds.length > 0 ? "PDF" : "PDF completo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonDarkGreen]}
              onPress={() => generarFichajesExcel(fichajesParaExportar, user)}
            >
              <Text style={styles.buttonText}>
                {selectedIds.length > 0 ? "Excel" : "Excel completo"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F3F5F7" 
  },
  header: {
    backgroundColor: "#F3F5F7",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  userHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 10, 
    gap: 10 
  },
  userAvatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25 
  },
  userGreeting: { 
    fontSize: 18, 
    fontWeight: "700" 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 5 
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  card: { 
    backgroundColor: "white", 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 10, 
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row", 
    alignItems: "flex-start"
  },
  cardSelected: { 
    borderWidth: 2, 
    borderColor: "#FF3B30" 
  },
  checkboxContainer: { 
    marginRight: 10, 
    marginTop: 5 
  },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderWidth: 1.5, 
    borderColor: "#999", 
    borderRadius: 4, 
    backgroundColor: "white" 
  },
  checkboxSelected: { 
    backgroundColor: "#FF3B30", 
    borderColor: "#FF3B30" 
  },
  cardContent: { 
    flex: 1 
  },
  dateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    marginBottom: 8,
  },
  row: { 
    fontSize: 16, 
    marginBottom: 5 
  },
  label: { 
    fontWeight: "600" 
  },
  extraContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 5, 
    gap: 5 
  },
  extraLabel: { 
    fontSize: 14, 
    fontWeight: "600" 
  },
  bottomButtonsContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingVertical: 12,
    paddingHorizontal: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonsScrollContent: {
    paddingHorizontal: 10,
    gap: 10,
  },
  button: { 
    backgroundColor: "#FF9500", 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    alignItems: "center",
    minWidth: 120,
    elevation: 2,
  },
  buttonRed: { 
    backgroundColor: "#FF3B30" 
  },
  buttonGreen: {
    backgroundColor: "#4CAF50",
  },
  buttonDarkGreen: {
    backgroundColor: "#2E7D32",
  },
  buttonText: { 
    color: "white", 
    fontWeight: "600", 
    fontSize: 14 
  },
});