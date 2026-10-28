import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";

/** Simple empty placeholder — no list, no emoji, readable on light background. */
export function EmptyCatalogState({ message }: { message: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <AppText style={styles.message}>{message}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F2F4F7",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    paddingHorizontal: 28,
    paddingVertical: 32,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  message: {
    textAlign: "center",
    color: "#344054",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
});
