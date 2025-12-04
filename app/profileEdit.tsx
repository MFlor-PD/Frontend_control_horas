import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
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
import { useProfilePhoto } from "../hooks/useProfilePhoto";

export default function EditProfile() {
  const { user, loading, updateUser } = useContext(AuthContext);
  const router = useRouter();
  const { pickImage } = useProfilePhoto();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [foto, setFoto] = useState("");
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

  const [showNuevaMoneda, setShowNuevaMoneda] = useState(false);
  const [nuevaDenominacion, setNuevaDenominacion] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/"); 
    } else if (user) {
      setNombre(user.nombre || "");
      setEmail(user.email || "");
      setFoto(user.foto || "");
      setValorHora(user.valorHora?.toString() || "0.00");
      setMoneda(user.moneda || "EUR - Euro");
      setMonedaDefault(false);
    }
  }, [user, loading]);

  if (!user || loading) return null;

  const handleSaveLocal = async () => {
    const updatedUser = {
      ...user,
      nombre,
      email,
      foto,
      valorHora: parseFloat(valorHora),
      moneda,
    };
    await updateUser(updatedUser);
    Alert.alert("Perfil actualizado", "Los cambios se han guardado localmente.");
    router.replace("/(tabs)/profile");
  };

  const handleAgregarMoneda = () => {
    if (!nuevaDenominacion || !nuevoNombre) {
      Alert.alert("Error", "Debe completar ambos campos");
      return;
    }
    setMonedasLocales([...monedasLocales, { denominacion: nuevaDenominacion, nombre: nuevoNombre }]);
    setMoneda(`${nuevaDenominacion} - ${nuevoNombre}`);
    setNuevaDenominacion("");
    setNuevoNombre("");
    setShowNuevaMoneda(false);
  };

  return (
    <ScrollView style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Editar Perfil</Text>

        <View style={styles.card}>
          {/* Imagen dinámica */}
          <TouchableOpacity onPress={async () => {
            const uri = await pickImage();
            if(uri) setFoto(uri);
          }}>
            <Image source={{ uri: foto || "https://i.pravatar.cc/150" }} style={styles.avatar} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="URL de la foto"
            value={foto}
            onChangeText={setFoto}
          />

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
            <Picker selectedValue={moneda} onValueChange={setMoneda}>
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
            <Switch value={monedaDefault} onValueChange={setMonedaDefault} />
            <Text style={styles.defaultCurrencyLabel}>Usar como moneda por defecto</Text>

            <TouchableOpacity style={styles.addCurrencyButton} onPress={() => setShowNuevaMoneda(!showNuevaMoneda)}>
              <Text style={styles.addCurrencyButtonText}>Agregar nueva moneda</Text>
            </TouchableOpacity>
          </View>

          {showNuevaMoneda && (
            <View style={styles.nuevaMonedaCard}>
              <TextInput style={styles.input} placeholder="Denominación ej: USD" value={nuevaDenominacion} onChangeText={setNuevaDenominacion} />
              <TextInput style={styles.input} placeholder="Nombre ej: Dólar estadounidense" value={nuevoNombre} onChangeText={setNuevoNombre} />
              <View style={styles.buttonsRow}>
                <TouchableOpacity style={styles.saveButton} onPress={handleAgregarMoneda}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowNuevaMoneda(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={[styles.saveButton, { flex: 1, marginRight: 5 }]} onPress={handleSaveLocal}>
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
  defaultCurrencyContainer: { flexDirection: "row", alignItems: "center", marginTop: 10, flexWrap: "wrap" },
  defaultCurrencyLabel: { marginLeft: 10, fontSize: 14, color: "#555", fontWeight: "500" },
  addCurrencyButton: { marginLeft: 10, backgroundColor: "#2B6EF2", padding: 5, borderRadius: 8 },
  addCurrencyButtonText: { color: "#FFF", fontSize: 12 },
  nuevaMonedaCard: { backgroundColor: "#F0F0F0", padding: 15, borderRadius: 10, marginTop: 10 },
  buttonsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  saveButton: { backgroundColor: "#2B6EF2", paddingVertical: 10, borderRadius: 10, flex: 1, marginRight: 5 },
  saveButtonText: { color: "#FFF", textAlign: "center", fontWeight: "700", fontSize: 16 },
  cancelButton: { backgroundColor: "#DDD", paddingVertical: 10, borderRadius: 10, flex: 1, marginLeft: 5 },
  cancelButtonText: { color: "#555", textAlign: "center", fontWeight: "700", fontSize: 16 },
});
