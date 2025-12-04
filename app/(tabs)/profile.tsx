import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { deleteUser } from "../../api";
import { AuthContext } from "../../context/AuthContext";

export default function Profile() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [eliminando, setEliminando] = useState(false);

  if (!user || loading) return null;

  // Función externa que elimina el usuario
  const eliminarUsuarioConfirmado = async () => {
    try {
      setEliminando(true);
      await deleteUser(user.id); // Llamada al backend
      setEliminando(false);

      Alert.alert(
        "Usuario eliminado",
        "Tu usuario y toda la información han sido eliminados correctamente.",
        [
          {
            text: "OK",
            onPress: async () => {
              // Limpiar token y context
              await AsyncStorage.removeItem("token");
              router.replace("/"); // Volver al login/index
            },
          },
        ]
      );
    } catch (err) {
      setEliminando(false);
      Alert.alert("Error", "No se pudo eliminar el usuario. Intenta nuevamente.");
      console.error(err);
    }
  };

  // Función que muestra la confirmación antes de eliminar
  const handleEliminarUsuario = () => {
    console.log("Botón presionado!");
    Alert.alert(
      "Confirmar eliminación",
      "¿Seguro que quieres eliminar tu usuario y toda su información? ¡No se podrá recuperar!",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aceptar",
          style: "destructive",
          onPress: eliminarUsuarioConfirmado, // llama a la función externa
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.page}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image source={{ uri: user.foto || "https://i.pravatar.cc/150" }} style={styles.avatar} />
          <Text style={styles.userName}>{user.nombre}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          {/* Botón Editar */}
          <TouchableOpacity style={styles.editButton} onPress={() => router.push("/profileEdit")}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>

          {/* Botón Eliminar Usuario */}
         <TouchableOpacity
  style={styles.deleteButton}
  onPress={async () => {
    console.log("Botón presionado!");
    try {
    setEliminando(true);
    await deleteUser(user.id);
    await AsyncStorage.clear(); // borra todo localmente
    setEliminando(false);
    router.replace("/"); // volver al login
  } catch (err) {
    setEliminando(false);
    Alert.alert("Error", "No se pudo eliminar el usuario. Revisa la consola.");
    console.error(err);
  }
  }}
  disabled={eliminando}
>
  {eliminando ? (
    <ActivityIndicator color="#fff" size="small" />
  ) : (
    <Text style={styles.deleteButtonText}>Eliminar Usuario</Text>
  )}
</TouchableOpacity>

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#F6F7FB" },
  container: { padding: 20 },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
    alignItems: "center",
  },
  avatar: { width: 70, height: 70, borderRadius: 35, marginBottom: 10 },
  userName: { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 5 },
  userEmail: { color: "#666", marginBottom: 15 },
  editButton: {
    backgroundColor: "#E4ECFF",
    paddingVertical: 10,
    borderRadius: 10,
    width: "60%",
    alignItems: "center",
    marginBottom: 15,
  },
  editButtonText: { color: "#2B6EF2", fontWeight: "600" },
  deleteButton: {
    backgroundColor: "#FF5C5C", // rojo/naranja
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  deleteButtonText: { color: "#FFF", fontWeight: "600", fontSize: 12 },
});
