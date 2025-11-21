import { StyleSheet, Text, View } from "react-native";

export default function historical() {
  return (
    <View
      style={styles.container}
    >
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
  link: {
    fontSize: 16,
    color: "blue",
    marginTop: 10,
  }

});