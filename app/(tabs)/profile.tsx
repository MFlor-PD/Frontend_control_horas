

// app/(tabs)/profile.tsx
// app/(tabs)/profile.tsx
import { useRouter } from "expo-router";
import { useContext } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { deleteUser } from "../../api";
import MonthlyEarningsCard from "../../component/monthlyEarningCard";
import { AuthContext } from "../../context/AuthContext";

const DEFAULT_ICON = "https://i.pravatar.cc/150";

export default function Profile() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  if (loading) return null;
  if (!user) {
    router.replace("/");
    return null;
  }

  return (
    <ScrollView style={styles.page}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image
            source={{ uri: user.foto || DEFAULT_ICON }}
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

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={async () => {
              try {
                await deleteUser(user.id);
                router.replace("/");
              } catch (err) {
                Alert.alert("Error", "No se pudo eliminar el usuario.");
                console.error(err);
              }
            }}
          >
            <Text style={styles.deleteButtonText}>Eliminar Usuario</Text>
          </TouchableOpacity>
        </View>

        <MonthlyEarningsCard />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#F6F7FB" },
  container: { padding: 20 },
  card: { backgroundColor: "#FFF", padding: 20, borderRadius: 15, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 3, marginBottom: 20, alignItems: "center" },
  avatar: { width: 70, height: 70, borderRadius: 35, marginBottom: 10 },
  userName: { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 5 },
  userEmail: { color: "#666", marginBottom: 15 },
  editButton: { backgroundColor: "#E4ECFF", paddingVertical: 10, borderRadius: 10, width: "60%", alignItems: "center", marginBottom: 15 },
  editButtonText: { color: "#2B6EF2", fontWeight: "600" },
  deleteButton: { backgroundColor: "#FF5C5C", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: "flex-end", marginTop: 10 },
  deleteButtonText: { color: "#FFF", fontWeight: "600", fontSize: 12 },
});
