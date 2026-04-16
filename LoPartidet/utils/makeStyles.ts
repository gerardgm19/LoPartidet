import { useMemo } from "react";
import { useThemeStore } from "@/store/themeStore";
import { ColorPalette } from "@/constants/colors";

/**
 * Creates a typed styles hook from a factory that receives the current color palette.
 *
 * Usage:
 *   const useStyles = makeStyles((colors) => StyleSheet.create({ ... }));
 *
 *   function MyComponent() {
 *     const styles = useStyles();
 *     ...
 *   }
 */
export function makeStyles<T>(factory: (colors: ColorPalette) => T): () => T {
  return function useStyles(): T {
    const colors = useThemeStore((s) => s.colors);
    return useMemo(() => factory(colors), [colors]);
  };
}
