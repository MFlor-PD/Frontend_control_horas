import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { biometricAuth } from "../utils/biometricAuth"; // 🔹 agregar import biométrico

const DEFAULT_ICON = "https://i.pravatar.cc/150";

export default function EditProfile() {
  const { user, loading, logout, updateUserProfile } = useContext(AuthContext);
  const router = useRouter();

  // --- estado local SOLO para edición ---
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [foto, setFoto] = useState(DEFAULT_ICON);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [valorHora, setValorHora] = useState("0.00");
  const [moneda, setMoneda] = useState("EUR - Euro");
  const [monedaDefault, setMonedaDefault] = useState(false);

  const [monedasLocales, setMonedasLocales] = useState([
    { denominacion: "USD", nombre: "Dólar estadounidense" },
    { denominacion: "EUR", nombre: "Euro" },
    { denominacion: "ARS", nombre: "Peso argentino" },
    { denominacion: "GBP", nombre: "Libra esterlina" },
  ]);

  // 🔹 Estados biométricos
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState("");

  // ---------------------------
  // Carga biométrico
  // ---------------------------
  useEffect(() => {
    const loadBiometric = async () => {
      const enabled = await biometricAuth.isEnabled();
      const type = await biometricAuth.getType();
      setBiometricEnabled(enabled);
      setBiometricType(type);
    };
    loadBiometric();
  }, []);

  // ---------------------------
  // Carga de moneda (se deja igual)
  // ---------------------------
  useEffect(() => {
    const loadMonedaData = async () => {
      const storedMonedas = await AsyncStorage.getItem("monedasLocales");
      const storedMoneda = await AsyncStorage.getItem("moneda");

      if (storedMonedas) setMonedasLocales(JSON.parse(storedMonedas));
      if (storedMoneda) setMoneda(storedMoneda);
    };

    loadMonedaData();
  }, []);

  // ---------------------------
  // Carga de datos SOLO desde BBDD (user)
  // ---------------------------
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
      return;
    }

    if (user) {
      setNombre(user.nombre || "");
      setEmail(user.email || "");
      setFoto(user.foto || DEFAULT_ICON);
      setValorHora(user.valorHora?.toString() || "0.00");
    }
  }, [user, loading]);

  // ---------------------------
  // ImagePicker (solo UI)
  // ---------------------------
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Acceso a galería requerido");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Acceso a cámara requerido");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  // ---------------------------
  // GUARDAR PERFIL
  // ---------------------------
  const handleSave = async () => {
    if (!user) return;

    try {
      // 🔐 cambios sensibles → relogin
      const sensitiveChange =
        nombre !== user.nombre ||
        foto !== (user.foto || DEFAULT_ICON) ||
        email !== user.email ||
        password.length > 0;

      await updateUserProfile({
        nombre,
        email,
        password: password || undefined,
        valorHora: parseFloat(valorHora),
        foto: foto || DEFAULT_ICON,
      });

      await AsyncStorage.setItem("moneda", moneda);

      if (sensitiveChange) {
        await logout();

        Alert.alert(
          "Perfil actualizado",
          "Por seguridad, debes iniciar sesión nuevamente para aplicar los cambios.",
          [
            {
              text: "Aceptar",
              onPress: () => router.replace("/"),
            },
          ]
        );
        return;
      }

      Alert.alert(
        "Perfil actualizado",
        "Tus cambios se guardaron correctamente."
      );
      router.replace("/(tabs)/profile");
    } catch (err: any) {
      console.error("❌ ERROR:", err);
      Alert.alert(
        "Error",
        err.message || "Error al guardar los cambios"
      );
    }
  };

  // ---------------------------
  // AGREGAR MONEDA (se deja igual)
  // ---------------------------
  const [showNuevaMoneda, setShowNuevaMoneda] = useState(false);
  const [nuevaDenominacion, setNuevaDenominacion] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");

  const handleAgregarMoneda = async () => {
    if (!nuevaDenominacion || !nuevoNombre) {
      Alert.alert("Error", "Debe completar ambos campos");
      return;
    }

    const nuevaMoneda = {
      denominacion: nuevaDenominacion,
      nombre: nuevoNombre,
    };

    const nuevasMonedas = [...monedasLocales, nuevaMoneda];

    setMonedasLocales(nuevasMonedas);
    setMoneda(`${nuevaDenominacion} - ${nuevoNombre}`);

    await AsyncStorage.setItem(
      "monedasLocales",
      JSON.stringify(nuevasMonedas)
    );
    await AsyncStorage.setItem(
      "moneda",
      `${nuevaDenominacion} - ${nuevoNombre}`
    );

    setNuevaDenominacion("");
    setNuevoNombre("");
    setShowNuevaMoneda(false);
  };

  // 🔹 Toggle biométrico
  const toggleBiometric = async () => {
    if (biometricEnabled) {
      await biometricAuth.disable();
      setBiometricEnabled(false);
      Alert.alert("Desactivado", "Autenticación biométrica desactivada");
    } else {
      Alert.alert(
        "Habilitar",
        "Para habilitar la autenticación biométrica, cierra sesión y vuelve a iniciar sesión"
      );
    }
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <ScrollView style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Editar Perfil</Text>

        <View style={styles.card}>
          {/* Avatar con badge de edición */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: foto || DEFAULT_ICON }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarBadge} onPress={pickImage}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Cambiar foto de perfil</Text>

          {/* Botones para foto */}
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={20} color="#2B6EF2" />
              <Text style={styles.photoButtonText}>Galería</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={20} color="#2B6EF2" />
              <Text style={styles.photoButtonText}>Cámara</Text>
            </TouchableOpacity>
          </View>

          {/* Separador */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>O</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Input URL */}
          <Text style={styles.label}>Pegar URL de imagen</Text>
          <TextInput
            style={styles.input}
            placeholder="https://ejemplo.com/imagen.jpg"
            value={foto}
            onChangeText={setFoto}
          />

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Nueva contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Valor Hora</Text>
          <TextInput
            style={styles.input}
            value={valorHora}
            onChangeText={setValorHora}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Moneda</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={moneda}
              onValueChange={async (value) => {
                setMoneda(value);
                await AsyncStorage.setItem("moneda", value);
              }}
            >
              {monedasLocales.map((m, index) => (
                <Picker.Item
                  key={index}
                  label={`${m.denominacion} - ${m.nombre}`}
                  value={`${m.denominacion} - ${m.nombre}`}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.defaultCurrencyContainer}>
            <Switch
              value={monedaDefault}
              onValueChange={setMonedaDefault}
            />
            <Text style={styles.defaultCurrencyLabel}>
              Usar como moneda por defecto
            </Text>

            <TouchableOpacity
              style={styles.addCurrencyButton}
              onPress={() => setShowNuevaMoneda(!showNuevaMoneda)}
            >
              <Text style={styles.addCurrencyButtonText}>
                Agregar nueva moneda
              </Text>
            </TouchableOpacity>
          </View>

          {showNuevaMoneda && (
            <View style={styles.nuevaMonedaCard}>
              <TextInput
                style={styles.input}
                placeholder="Denominación ej: USD"
                value={nuevaDenominacion}
                onChangeText={setNuevaDenominacion}
              />
              <TextInput
                style={styles.input}
                placeholder="Nombre ej: Dólar estadounidense"
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
              />
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAgregarMoneda}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowNuevaMoneda(false)}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 🔹 SECCIÓN BIOMÉTRICO */}
          <View style={styles.biometricContainer}>
            <Text style={styles.label}>{biometricType}</Text>
            <View style={styles.biometricRow}>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
              />
              <Text style={styles.biometricLabel}>
                {biometricEnabled ? "Activado" : "Desactivado"}
              </Text>
            </View>
          </View>

        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.saveButton, { marginRight: 5 }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              Guardar Cambios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { marginLeft: 5 }]}
            onPress={() => router.replace("/(tabs)/profile")}
          >
            <Text style={styles.cancelButtonText}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ---- estilos ----
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
  avatarContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#2B6EF2",
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2B6EF2",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  photoButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 15,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  photoButtonText: {
    fontSize: 14,
    color: "#2B6EF2",
    fontWeight: "600",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  separatorText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    backgroundColor: "#FFF",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  eyeButton: { paddingHorizontal: 10 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    marginTop: 5,
    backgroundColor: "#FFF",
  },
  defaultCurrencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    flexWrap: "wrap",
  },
  defaultCurrencyLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  addCurrencyButton: {
    marginLeft: 10,
    backgroundColor: "#2B6EF2",
    padding: 5,
    borderRadius: 8,
  },
  addCurrencyButtonText: { color: "#FFF", fontSize: 12 },
  nuevaMonedaCard: {
    backgroundColor: "#F0F0F0",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#2B6EF2",
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
  },
  saveButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#DDD",
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
  },
  cancelButtonText: {
    color: "#555",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
   biometricContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  biometricRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  biometricLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
});
