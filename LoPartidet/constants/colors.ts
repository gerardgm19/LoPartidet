export type ColorPalette = {
  black: string;
  surface: string;
  card: string;
  green: string;
  greenDim: string;
  white: string;
  muted: string;
  border: string;
};

export const darkColors: ColorPalette = {
  black: "#0A0A0A",
  surface: "#141414",
  card: "#1C1C1C",
  green: "#00E676",
  greenDim: "#00C853",
  white: "#F5F5F5",
  muted: "#6B6B6B",
  border: "#2A2A2A",
};

export const lightColors: ColorPalette = {
  black: "#F2F2F7",   // screen background (iOS light gray)
  surface: "#FFFFFF", // tab bar, modals
  card: "#FFFFFF",    // cards
  green: "#00A854",   // accent — darker for legibility on white
  greenDim: "#007A3D",
  white: "#0D0D0D",   // primary text
  muted: "#8E8E93",   // secondary text
  border: "#D1D1D6",  // borders / separators
};

// Static fallback used only in non-component contexts (e.g. constants/match.ts).
// Component code should always use useThemeStore(s => s.colors).
export const Colors = darkColors;
