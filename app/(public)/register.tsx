import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { registerUser } from "../../api";
import { AuthContext } from "../../context/AuthContext";

export default function RegisterScreen() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [valorHora, setValorHora] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); 
  const [success, setSuccess] = useState(false); 

  const handleRegister = async () => {
    if (!nombre || !email || !password || !valorHora) {
      setMessage("Todos los campos son obligatorios");
      setSuccess(false);
      return;
    }

    if (isNaN(Number(valorHora)) || Number(valorHora) <= 0) {
      setMessage("Valor hora debe ser un número mayor que 0");
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await registerUser(nombre, email, password, Number(valorHora));
      setMessage("Usuario creado correctamente ✅");
      setSuccess(true);
    } catch (error: any) {
      console.log(error.response?.data);
      const msg = error.response?.data?.message || JSON.stringify(error.response?.data) || "Error desconocido";
      setMessage(`Registro fallido ❌: ${msg}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Email" value={email} keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />

      {/* Contraseña con botón para mostrar/ocultar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Contraseña"
          value={password}
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Valor hora" value={valorHora} keyboardType="numeric" onChangeText={setValorHora} />

      {!success && <Button title={loading ? "Registrando..." : "Registrarse"} onPress={handleRegister} disabled={loading} />}

      {message !== "" && (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ color: success ? "green" : "red", textAlign: "center" }}>{message}</Text>
          {success && <Button title="Volver al login" onPress={() => router.push("/(public)/index")} />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 },
  inputPassword: { flex: 1, paddingVertical: 8, fontSize: 16 },
});
