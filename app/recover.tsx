import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { requestPasswordRecovery, resetPassword } from "../api";

export default function Recover() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");       // correo del usuario registrado
  const [destino, setDestino] = useState("");   // correo donde quieres recibir el código
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email || !destino) return Alert.alert("Error", "Completa ambos correos");
    try {
      setLoading(true);
      await requestPasswordRecovery(email, destino);
      Alert.alert("Correo enviado", "Revisa tu bandeja de entrada, el código expira en 5 minutos");
      setStep(2); // pasar al siguiente paso
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email || !code || !newPassword) return Alert.alert("Error", "Completa todos los campos");
    try {
      setLoading(true);
      await resetPassword(email, code, newPassword); // ahora envía los 3 parámetros
      Alert.alert("Éxito", "Contraseña cambiada correctamente");
      router.push("/clockIn");
      setStep(1); // volver al paso inicial
      setEmail("");
      setDestino("");
      setCode("");
      setNewPassword("");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>

      {step === 1 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Correo del usuario"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Correo destino"
            keyboardType="email-address"
            value={destino}
            onChangeText={setDestino}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Enviando..." : "Enviar código"}</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Correo del usuario"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Código recibido"
            value={code}
            onChangeText={setCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Procesando..." : "Cambiar contraseña"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30, backgroundColor: "#FFF" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 15, color: "#000" },
  input: { width: "100%", backgroundColor: "#F5F7FA", borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: "#DADFE6" },
  button: { width: "100%", backgroundColor: "#2B6EF2", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
