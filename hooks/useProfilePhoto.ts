// hooks/useProfilePhoto.ts
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const useProfilePhoto = () => {

  const pickImage = async (): Promise<string | undefined> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos acceso a la galería para seleccionar la foto."
        );
        return undefined;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        return result.assets[0].uri; // retornamos la URI
      }

      return undefined;
    } catch (err) {
      console.error("Error seleccionando foto:", err);
      return undefined;
    }
  };

  return { pickImage };
};
