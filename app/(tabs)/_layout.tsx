import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useContext } from "react";
import { TouchableOpacity } from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function TabsLayout() {
  const { user, loading, logout } = useContext(AuthContext);

  // 🔹 mientras carga, no mostrar nada
  if (loading) return null;

  // 🔹 si no hay usuario, redirige al login público
  if (!user) return <Redirect href="/" />;

  // 🔹 función logout
  const handleLogout = async () => {
    await logout();
  };

  // 🔹 usuario logueado → mostrar tabs
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        tabBarActiveTintColor: "black",
        headerStyle: { backgroundColor: "white" },
        headerShadowVisible: true,
        headerTintColor: "black",
        tabBarStyle: { backgroundColor: "white" },

        // ✅ Agregamos logout en la esquina superior derecha
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="black" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="clockIn"
        options={{
          headerTitle: "Clock In",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="historical"
        options={{
          headerTitle: "Historical",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
