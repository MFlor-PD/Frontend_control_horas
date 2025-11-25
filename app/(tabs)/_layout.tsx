import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function TabsLayout() {
  const { user, loading } = useContext(AuthContext);

  // 🔹 mientras carga, no mostrar nada
  if (loading) return null;

  // 🔹 si no hay usuario, redirige al login público
  if (!user) return <Redirect href="/" />;

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
