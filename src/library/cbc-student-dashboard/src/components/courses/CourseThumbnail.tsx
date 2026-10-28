import { Image, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";

const LOGO = require("../../../assets/splash-logo.jpg");

interface CourseThumbnailProps {
  size?: "card" | "banner";
  type?: "paid" | "free";
  uri?: string | null;
  bannerUri?: string | null;
}

export function CourseThumbnail({ size = "card", type, uri, bannerUri }: CourseThumbnailProps) {
  const isBanner = size === "banner";
  const targetUri = isBanner ? (bannerUri || uri) : (uri || bannerUri);
  const imageSource = targetUri ? { uri: targetUri } : LOGO;
  const isRemote = Boolean(targetUri);

  return (
    <View style={isBanner ? styles.bannerWrap : styles.cardWrap}>
      <Image
        source={imageSource}
        style={
          isBanner
            ? [styles.bannerImg, isRemote && { width: "100%", height: "100%" }]
            : [styles.cardImg, isRemote && { width: "100%", height: "100%" }]
        }
        resizeMode={isRemote ? "cover" : "contain"}
      />
      {type && (
        <View style={[styles.badge, type === "paid" ? styles.paidBadge : styles.freeBadge]}>
          <AppText style={styles.badgeText}>{type === "paid" ? "PAID" : "FREE"}</AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    width: 100,
    height: 92,
    borderRadius: 10,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardImg: { width: 88, height: 88 },
  bannerWrap: {
    width: "100%",
    height: 170,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  bannerImg: { width: 150, height: 150 },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidBadge: { backgroundColor: "#1B2B4B" },
  freeBadge: { backgroundColor: "#12B76A" },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
});
