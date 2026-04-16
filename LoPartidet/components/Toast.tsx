import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { makeStyles } from "@/utils/makeStyles";

type Props = {
  message: string;
  visible: boolean;
  onHide: () => void;
};

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  text: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
}));

export function Toast({ message, visible, onHide }: Props) {
  const styles = useStyles();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onHide());
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}
