import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { loginUser } from "../../api"; // tu función de login que hace POST
import { AuthContext } from "../../context/AuthContext";

export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa email y contraseña");
      return;
    }

    try {
      
      const data = await loginUser(email, password); // llamada a tu API
      await login(data); // guarda token + user en AsyncStorage y contexto
      router.replace("/clockIn");

    } catch (err: any) {
      if (err.response) {
        Alert.alert("Error", err.response.data?.error || "Usuario o contraseña incorrectos");
      } else if (err.request) {
        Alert.alert("Error", "No se pudo conectar al servidor");
      } else {
        Alert.alert("Error", "Ocurrió un error inesperado");
      }
    }
  };

  const handleRegister = () => {
     router.push("/register");
    
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="time-outline" size={40} color="#2B6EF2" />
      </View>

      <Text style={styles.title}>Iniciar Sesión</Text>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          placeholder="Tu correo electrónico"
          style={styles.input}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          placeholder="Tu contraseña"
          secureTextEntry={!showPassword}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        ¿No tienes una cuenta?{" "}
        <Text style={styles.linkBlue} onPress={handleRegister}>
          Regístrate aquí
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30, backgroundColor: "#FFF" },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#E8F0FF", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 30, color: "#000" },
  inputContainer: { width: "100%", backgroundColor: "#F5F7FA", borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, flexDirection: "row", alignItems: "center", marginBottom: 15, borderWidth: 1, borderColor: "#DADFE6" },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
  button: { width: "100%", backgroundColor: "#2B6EF2", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginBottom: 20 },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  footerText: { fontSize: 14, color: "#555" },
  linkBlue: { color: "#2B6EF2", fontWeight: "600" },
});
