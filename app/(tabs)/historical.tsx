import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function Historical() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/"); // Redirige a login si no hay usuario
    }
  }, [user, loading]);

  if (!user || loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Historical</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
  },
});
