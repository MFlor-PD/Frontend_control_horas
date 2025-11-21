import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  const [entryReminder, setEntryReminder] = useState(true);
  const [exitReminder, setExitReminder] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/"); // Redirige a login si no hay usuario
    }
  }, [user, loading]);

  if (!user || loading) return null;

  return (
    <ScrollView style={styles.page}>
      <View style={styles.container}>

        {/* Header */}
        <Text style={styles.headerTitle}>Configuración</Text>

        {/* Tarjeta de usuario */}
        <View style={styles.card}>
          <Image 
            source={{ uri: user.foto || "https://i.pravatar.cc/150" }} 
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user.nombre}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Tarifa por hora */}
        <Text style={styles.sectionTitle}>Mi Tarifa por Hora</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Tarifa</Text>
          <View style={styles.rowInput}>
            <TextInput
              value={user.valorHora?.toString() || "0.00"}
              style={styles.input}
              keyboardType="numeric"
            />
            <Text style={styles.suffix}>$</Text>
          </View>

          <Text style={styles.label}>Moneda</Text>
          <View style={styles.rowInput}>
            <Text style={styles.input}>USD - Dólar estadounidense</Text>
            <Ionicons name="chevron-down-outline" size={18} color="#777" />
          </View>
        </View>

        {/* Ganancias estimadas */}
        <Text style={styles.sectionTitle}>Mis Ganancias Estimadas</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.toggleRow}>
              <TouchableOpacity><Text style={styles.toggleActive}>Semana</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.toggleInactive}>Mes</Text></TouchableOpacity>
            </View>
            <Text style={styles.amount}>$1,250.00</Text>
          </View>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="stats-chart-outline" size={80} color="#A7C1FF" />
          </View>
        </View>

        {/* Notificaciones */}
        <Text style={styles.sectionTitle}>Notificaciones y Preferencias</Text>
        <View style={styles.card}>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Recordatorio de entrada</Text>
            <Switch value={entryReminder} onValueChange={setEntryReminder} />
          </View>
          <View style={styles.divider} />
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Recordatorio de salida</Text>
            <Switch value={exitReminder} onValueChange={setExitReminder} />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity>
            <Text style={styles.prefLink}>Cambiar contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLink}>Ayuda</Text>
          <Text style={styles.footerLink}>Términos de Servicio</Text>
          <Text style={styles.footerLink}>Política de Privacidad</Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#F6F7FB" },
  container: { padding: 20 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    color: "#000",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  avatar: { width: 70, height: 70, borderRadius: 35, alignSelf: "center", marginBottom: 10 },
  userName: { fontSize: 18, fontWeight: "700", textAlign: "center", color: "#000" },
  userEmail: { textAlign: "center", color: "#666", marginBottom: 15 },
  editButton: { backgroundColor: "#E4ECFF", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  editButtonText: { color: "#2B6EF2", fontWeight: "600" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, marginTop: 15, color: "#000" },
  inputWrapper: { marginBottom: 20 },
  label: { marginBottom: 5, color: "#555" },
  rowInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  input: { fontSize: 16, color: "#000", flex: 1 },
  suffix: { marginLeft: 10, color: "#777" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  toggleRow: { flexDirection: "row", gap: 15 },
  toggleActive: { color: "#2B6EF2", fontWeight: "700" },
  toggleInactive: { color: "#777" },
  amount: { fontSize: 22, fontWeight: "700", color: "#000" },
  chartPlaceholder: { marginTop: 20, alignItems: "center" },
  prefRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  prefLabel: { fontSize: 15, color: "#000" },
  prefLink: { color: "#2B6EF2", fontWeight: "600", paddingVertical: 10 },
  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 8 },
  saveButton: { backgroundColor: "#2B6EF2", paddingVertical: 15, borderRadius: 10, marginTop: 10, marginBottom: 25 },
  saveButtonText: { color: "#FFF", textAlign: "center", fontWeight: "700", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "space-between", paddingBottom: 30 },
  footerLink: { fontSize: 12, color: "#777" },
});
