import { useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

const TAP_TARGET = 5;

export default function AboutUs() {
  const [tapCount, setTapCount] = useState(0);
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;

  const handleLogoTap = () => {
    const next = tapCount + 1;
    if (next < TAP_TARGET) {
      setTapCount(next);
      return;
    }

    setTapCount(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(spinValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.4,
          duration: 180,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.85,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1.15,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.elastic(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(glowValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(glowValue, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const glowBorder = glowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.green, "#ffffff"],
  });

  const dotsRemaining = TAP_TARGET - 1 - tapCount;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>About us</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.body}>
          <TouchableWithoutFeedback onPress={handleLogoTap}>
            {/* Outer view: JS-driver border color animation */}
            <Animated.View style={[styles.logoWrapper, { borderColor: glowBorder }]}>
              {/* Inner view: native-driver transform animation */}
              <Animated.View
                style={[
                  styles.logoInner,
                  { transform: [{ rotate: spin }, { scale: scaleValue }] },
                ]}
              >
                {/* Outer ring */}
                <View style={styles.outerRing} />
                {/* Field lines */}
                <View style={styles.fieldLineH} />
                <View style={styles.fieldLineV} />
                {/* Center circle */}
                <View style={styles.centerCircle} />
                {/* Initials */}
                <View style={styles.initialsWrapper}>
                  <Text style={styles.initials}>LP</Text>
                </View>
              </Animated.View>
            </Animated.View>
          </TouchableWithoutFeedback>

          <Text style={styles.appName}>LoPartidet</Text>
          <Text style={styles.appTagline}>Find your game. Play your way.</Text>

          {tapCount > 0 && (
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>
                {dotsRemaining} more {dotsRemaining === 1 ? "tap" : "taps"}...
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              LoPartidet connects football players to organize and join local matches. Whether you're
              looking for a quick Futsal game or a full Fut 11, we've got you covered.
            </Text>
          </View>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.credit}>Made with ♥ for football lovers</Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const LOGO_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  title: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  logoWrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: 3,
    borderColor: Colors.green,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoInner: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  outerRing: {
    position: "absolute",
    width: LOGO_SIZE - 24,
    height: LOGO_SIZE - 24,
    borderRadius: (LOGO_SIZE - 24) / 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldLineH: {
    position: "absolute",
    width: LOGO_SIZE,
    height: 1,
    backgroundColor: Colors.border,
  },
  fieldLineV: {
    position: "absolute",
    width: 1,
    height: LOGO_SIZE,
    backgroundColor: Colors.border,
  },
  centerCircle: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  initialsWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: Colors.green,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
  },
  appName: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 8,
  },
  appTagline: {
    color: Colors.muted,
    fontSize: 14,
  },
  tapHint: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tapHintText: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
    gap: 12,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
  },
  infoText: {
    color: Colors.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  version: {
    color: Colors.border,
    fontSize: 12,
  },
  credit: {
    color: Colors.muted,
    fontSize: 13,
  },
});
