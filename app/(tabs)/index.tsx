import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Index() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>

      {/* Icono redondo */}
      <View style={styles.iconCircle}>
        <Ionicons name="time-outline" size={40} color="#2B6EF2" />
      </View>

      {/* Título */}
      <Text style={styles.title}>Iniciar Sesión</Text>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput 
          placeholder="Tu correo electrónico"
          style={styles.input}
          keyboardType="email-address"
        />
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput 
          placeholder="Tu contraseña"
          secureTextEntry={!showPassword}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color="#999" 
          />
        </TouchableOpacity>
      </View>

      {/* Links */}
      <View style={styles.row}>
        <TouchableOpacity>
          <Text style={styles.linkSmall}>Recordarme</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.linkSmall}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de iniciar sesión */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* Registro */}
      <Text style={styles.footerText}>
        ¿No tienes una cuenta?{" "}
        <Text style={styles.linkBlue}>Regístrate aquí</Text>
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  linkSmall: {
    fontSize: 14,
    color: "#2B6EF2",
  },
  button: {
    width: "100%",
    backgroundColor: "#2B6EF2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 14,
    color: "#555",
  },
  linkBlue: {
    color: "#2B6EF2",
    fontWeight: "600",
  },
});
