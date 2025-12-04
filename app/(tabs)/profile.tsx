import { useRouter } from "expo-router";
import { useContext } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function Profile() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  if (!user || loading) return null;

  return (
    <ScrollView style={styles.page}>
      <View style={styles.container}>

        <Text style={styles.headerTitle}>Perfil</Text>

        <View style={styles.card}>
          <Image 
            source={{ uri: user.foto || "https://i.pravatar.cc/150" }} 
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user.nombre}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/profileEdit")}
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>

          {/* Nueva sección: Mi Tarifa por Hora */}
          <View style={styles.tarifaContainer}>
            <Text style={styles.tarifaLabel}>Mi Tarifa por Hora</Text>
            <Text style={styles.tarifaValue}>
              {user.valorHora?.toFixed(2) || "0.00"} {user.moneda || "EUR"}
            </Text>
          </View>
        </View>

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
  headerTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15, textAlign: "center", color: "#000" },
  card: { backgroundColor: "#FFF", padding: 20, borderRadius: 15, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 3, marginBottom: 20, alignItems: "center" },
  avatar: { width: 70, height: 70, borderRadius: 35, marginBottom: 10 },
  userName: { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 5 },
  userEmail: { color: "#666", marginBottom: 15 },
  editButton: { backgroundColor: "#E4ECFF", paddingVertical: 10, borderRadius: 10, width: "60%", alignItems: "center", marginBottom: 15 },
  editButtonText: { color: "#2B6EF2", fontWeight: "600" },
  tarifaContainer: { marginTop: 10, alignItems: "center" },
  tarifaLabel: { fontSize: 14, color: "#555", fontWeight: "600", marginBottom: 5 },
  tarifaValue: { fontSize: 16, fontWeight: "700", color: "#000" },
  footer: { flexDirection: "row", justifyContent: "space-between", paddingBottom: 30 },
  footerLink: { fontSize: 12, color: "#777" },
});
