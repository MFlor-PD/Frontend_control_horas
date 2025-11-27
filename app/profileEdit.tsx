// app/profileEdit.tsx
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { updateProfile } from "../api";
import { AuthContext } from "../context/AuthContext";

export default function EditProfile() {
  const { user, loading, updateUser, logout } = useContext(AuthContext);
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [foto, setFoto] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [valorHora, setValorHora] = useState("");
  const [moneda, setMoneda] = useState("USD - Dólar estadounidense");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/"); 
    } else if (user) {
      setNombre(user.nombre);
      setEmail(user.email);
      setFoto(user.foto || "");
      setValorHora(user.valorHora?.toString() || "0.00");
      setMoneda(user.moneda || "USD - Dólar estadounidense");
    }
  }, [user, loading]);

  if (!user || loading) return null;

  const handleSave = async () => {
    try {
      const updatedUser = await updateProfile(user.id, {
        nombre,
        email,
        foto,
        password: password || undefined,
        valorHora: parseFloat(valorHora),
        moneda,
      });

      if (password) {
        Alert.alert(
          "Perfil actualizado",
          "La contraseña se ha cambiado. Por seguridad, vuelve a iniciar sesión."
        );
        await logout(); // borra token y user
        router.replace("/"); // va a login
      } else {
        // Actualizamos el contexto para reflejar los cambios
        await updateUser(updatedUser);
        Alert.alert("Perfil actualizado", "Los cambios se han guardado correctamente.");
        router.replace("/(tabs)/profile");
      }

    } catch (err: any) {
      Alert.alert("Error", err.message || "Error al guardar los cambios");
    }
  };

  return (
    <ScrollView style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Editar Perfil</Text>

        <View style={styles.card}>
          <Image source={{ uri: foto || "https://i.pravatar.cc/150" }} style={styles.avatar} />
          <TextInput style={styles.input} placeholder="URL de la foto" value={foto} onChangeText={setFoto} />

          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Nueva contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Valor Hora</Text>
          <TextInput style={styles.input} value={valorHora} onChangeText={setValorHora} keyboardType="numeric" />

          <Text style={styles.label}>Moneda</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={moneda} onValueChange={(itemValue) => setMoneda(itemValue)}>
              <Picker.Item label="USD - Dólar estadounidense" value="USD - Dólar estadounidense" />
              <Picker.Item label="EUR - Euro" value="EUR - Euro" />
              <Picker.Item label="ARS - Peso argentino" value="ARS - Peso argentino" />
              <Picker.Item label="GBP - Libra esterlina" value="GBP - Libra esterlina" />
            </Picker>
          </View>
        </View>

        {/* Botones Guardar y Cancelar */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={[styles.saveButton, { flex: 1, marginRight: 5 }]} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]} onPress={() => router.replace("/(tabs)/profile")}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#F6F7FB" },
  container: { padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15, textAlign: "center", color: "#000" },
  card: { backgroundColor: "#FFF", padding: 20, borderRadius: 15, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 3, marginBottom: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35, alignSelf: "center", marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 10, color: "#555" },
  input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 10, marginTop: 5, backgroundColor: "#FFF" },
  passwordContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  eyeButton: { paddingHorizontal: 10 },
  pickerContainer: { borderWidth: 1, borderColor: "#DDD", borderRadius: 10, marginTop: 5, backgroundColor: "#FFF" },
  buttonsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  saveButton: { backgroundColor: "#2B6EF2", paddingVertical: 15, borderRadius: 10 },
  saveButtonText: { color: "#FFF", textAlign: "center", fontWeight: "700", fontSize: 16 },
  cancelButton: { backgroundColor: "#DDD", paddingVertical: 15, borderRadius: 10 },
  cancelButtonText: { color: "#555", textAlign: "center", fontWeight: "700", fontSize: 16 },
});
