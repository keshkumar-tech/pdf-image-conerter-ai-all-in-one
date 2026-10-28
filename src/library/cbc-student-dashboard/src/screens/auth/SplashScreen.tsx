import { Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={require("../../../assets/splash-logo.jpg")} style={styles.logo} resizeMode="contain" />
      <Text style={styles.appName}>Concept Builder Classes</Text>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.star}>✦</Text>
        <View style={styles.line} />
      </View>
      <Text style={styles.tagline}>Build Concepts, Not Just Marks</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", padding: 32 },
  logo: { width: 220, height: 220 },
  appName: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", marginTop: 20, letterSpacing: 0.5, textAlign: "center" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 },
  line: { height: 1.5, width: 60, backgroundColor: "#C9A227" },
  star: { color: "#C9A227", fontSize: 12 },
  tagline: { color: "#C9A227", fontSize: 13, fontWeight: "600", marginTop: 8, letterSpacing: 1, textAlign: "center" },
});
