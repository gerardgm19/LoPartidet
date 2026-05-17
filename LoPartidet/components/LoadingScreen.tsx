import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { makeStyles } from "@/utils/makeStyles";

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
}));

export default function LoadingScreen() {
  const styles = useStyles();
  const colors = useThemeStore((s) => s.colors);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={colors.green} />
    </View>
  );
}
