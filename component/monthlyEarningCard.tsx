//raiz/component/monthlyEarningCard.tsx


import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { historialFichajes } from "../api";

export default function MonthlyEarningsCard() {
  const [loading, setLoading] = useState(true);
  const [ingresosPorMes, setIngresosPorMes] = useState<number[]>(Array(12).fill(0));
  const [totalAnual, setTotalAnual] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await historialFichajes();
        const historial = res.historial || [];

        // Array de 12 meses con valor 0
        const meses = Array(12).fill(0);

        historial.forEach((f) => {
          const fecha = new Date(f.fecha);
          const mes = fecha.getMonth(); // 0..11
          const importe = f.importeDia || 0;

          meses[mes] += importe;
        });

        setIngresosPorMes(meses);
        setTotalAnual(meses.reduce((acc, v) => acc + v, 0));
      } catch (err) {
        console.error("Error obteniendo historial:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color="#2B6EF2" />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Mis Ganancias Estimadas</Text>

      <Text style={styles.amount}>${totalAnual.toFixed(2)}</Text>

      <BarChart
        data={{
          labels: ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
          datasets: [{ data: ingresosPorMes }],
        }}
        width={Dimensions.get("window").width - 60}
        height={220}
        yAxisLabel="$"
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(43, 110, 242, ${opacity})`,
          labelColor: () => "#999",
        }}
        style={{ marginTop: 10, borderRadius: 10 }}
        fromZero={true}
        showValuesOnTopOfBars={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontWeight: "600",
  },
  amount: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#000",
  },
});
