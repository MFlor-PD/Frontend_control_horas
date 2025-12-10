import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { loginUser } from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { biometricAuth } from "../../utils/biometricAuth";
import { showAlert } from "../../utils/showAlerts";

export default function Index() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState("");

  const { login } = useContext(AuthContext);

  // ✅ Chequear biométrico al cargar
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await biometricAuth.isAvailable();
      const enabled = await biometricAuth.isEnabled();
      const type = await biometricAuth.getType();

      setBiometricAvailable(available);
      setBiometricEnabled(enabled);
      setBiometricType(type);

      // Login automático si está activo
      if (available && enabled) {
        handleBiometricLogin();
      }
    };

    checkBiometric();
  }, []);

  // ✅ Login normal (NO se rompe nada)
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa email y contraseña");
      return;
    }

    try {
      const data = await loginUser(email, password);
      await login(data as any);

      // Ofrecer habilitar biométrico
      if (biometricAvailable && !biometricEnabled) {
        Alert.alert(
          `Habilitar ${biometricType}`,
          `¿Deseas usar ${biometricType} para iniciar sesión la próxima vez?`,
          [
            { text: "No", style: "cancel" },
            {
              text: "Sí",
              onPress: async () => {
                await biometricAuth.enable(email, password);
                setBiometricEnabled(true);
              },
            },
          ]
        );
      }

      router.replace("/clockIn");

    } catch (err: any) {
      if (err.response && err.response.data?.error) {
        const errorMsg = err.response.data.error;

        if (errorMsg === "Usuario no encontrado") {
          showAlert("Error", "Correo electrónico incorrecto");
        } else if (errorMsg === "Contraseña incorrecta") {
          showAlert("Error", "Contraseña incorrecta");
        } else {
          showAlert("Error", errorMsg);
        }

      } else if (err.request) {
        showAlert("Error", "No se pudo conectar al servidor");
      } else {
        showAlert("Error", "Ocurrió un error inesperado");
      }
    }
  };

  // ✅ Login biométrico
  const handleBiometricLogin = async () => {
    const authenticated = await biometricAuth.authenticate();
    if (!authenticated) return;

    const credentials = await biometricAuth.getCredentials();
    if (!credentials) return;

    try {
      const data = await loginUser(
        credentials.email,
        credentials.password
      );

      await login(data as any);
      router.replace("/clockIn");

    } catch {
      Alert.alert(
        "Error",
        "No se pudo iniciar sesión con biométrico. Inicia sesión normalmente."
      );
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
        <Ionicons
          name="mail-outline"
          size={20}
          color="#999"
          style={styles.inputIcon}
        />
        <TextInput
          placeholder="Tu correo electrónico"
          style={styles.input}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#999"
          style={styles.inputIcon}
        />
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

      {/* Botón login */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* ✅ Botón biométrico */}
      {biometricAvailable && biometricEnabled && (
        <TouchableOpacity
          style={{ marginTop: 12, alignItems: "center" }}
          onPress={handleBiometricLogin}
        >
          <Ionicons
            name={
              biometricType === "Face ID"
                ? "scan-outline"
                : "finger-print-outline"
            }
            size={34}
            color="#2B6EF2"
          />
          <Text style={{ marginTop: 4, color: "#2B6EF2", fontWeight: "600" }}>
            Usar {biometricType}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.footerText}>
        ¿No tienes una cuenta?{" "}
        <Text style={styles.linkBlue} onPress={handleRegister}>
          Regístrate aquí
        </Text>
      </Text>

      <Text style={[styles.footerText, { marginTop: 5 }]}>
        ¿Olvidaste tu contraseña?{" "}
        <Text
          style={styles.linkBlue}
          onPress={() => router.push("../recover")}
        >
          Recuperar cuenta
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#FFF",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
    color: "#000",
  },
  inputContainer: {
    width: "100%",
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DADFE6",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
  button: {
    width: "100%",
    backgroundColor: "#2B6EF2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  footerText: { fontSize: 14, color: "#555", marginTop: 10 },
  linkBlue: { color: "#2B6EF2", fontWeight: "600" },
});
