// raiz/hooks/useProfilePhoto.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

const DEFAULT_ICON = "https://i.pravatar.cc/150";

export const useProfilePhoto = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [foto, setFoto] = useState(DEFAULT_ICON);
  const [nombre, setNombre] = useState("");

  // Cargar datos locales al iniciar (solo una vez)
  useEffect(() => {
    const loadLocalData = async () => {
      try {
        const fotoLocal = await AsyncStorage.getItem("fotoPerfil");
        const nombreLocal = await AsyncStorage.getItem("nombrePerfil");

        setFoto(fotoLocal || DEFAULT_ICON);
        setNombre(nombreLocal || user?.nombre || "");

        // Actualizamos el contexto si existe user
        if (user) {
          updateUser({
            ...user,
            foto: fotoLocal || DEFAULT_ICON,
            nombre: nombreLocal || user.nombre || "",
          });
        }
      } catch (err) {
        console.error("Error cargando datos locales:", err);
      }
    };

    loadLocalData();
    // arreglo vacío para que solo corra al montar
  }, []);

  // Seleccionar imagen desde galería
  const pickImage = async (): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos acceso a la galería.");
        return foto;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        setFoto(uri);
        await AsyncStorage.setItem("fotoPerfil", uri);
        if (user) updateUser({ ...user, foto: uri });
        return uri;
      }

      return foto;
    } catch (err) {
      console.error(err);
      return foto;
    }
  };

  const setLocalNombre = async (nuevoNombre: string) => {
    setNombre(nuevoNombre);
    await AsyncStorage.setItem("nombrePerfil", nuevoNombre);
    if (user) updateUser({ ...user, nombre: nuevoNombre });
  };

  const resetToDefault = async () => {
    setFoto(DEFAULT_ICON);
    setNombre("");
    await AsyncStorage.removeItem("fotoPerfil");
    await AsyncStorage.removeItem("nombrePerfil");
    if (user) updateUser({ ...user, foto: DEFAULT_ICON, nombre: "" });
  };

  return {
    pickImage,
    foto,
    nombre,
    setLocalNombre,
    resetToDefault,
  };
};
