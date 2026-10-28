import { Linking, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import type { MainTabParamList, RootStackParamList } from "@/navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "WhatsappTab">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function WhatsappTabScreen({}: Props) {
  return (
    <Screen>
      <AppText variant="h1">WhatsApp Support</AppText>
      <AppText variant="muted" style={{ marginTop: 6, marginBottom: 24 }}>
        Get instant help on WhatsApp.
      </AppText>
      <Card style={{ borderColor: "#25D366", backgroundColor: "#25D36610" }}>
        <AppText variant="h3">Chat with us</AppText>
        <AppText variant="muted" style={{ marginTop: 8 }}>
          Tap below to open WhatsApp and message our support team.
        </AppText>
        <View style={{ marginTop: 16 }}>
          <Button
            label="Open WhatsApp"
            fullWidth
            onPress={() => Linking.openURL("https://wa.me/919876543210?text=Hi%20Concept%20Builder%20Classes")}
          />
        </View>
      </Card>
    </Screen>
  );
}
