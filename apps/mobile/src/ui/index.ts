import {
  useFonts,
  Baloo2_400Regular,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";

export * from "./graphics";
export * from "./components";
export * from "./JungleBackground";
export * from "./MicoCard";

/** Carrega as fontes Baloo 2 (a "voz" tipografica do app). */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Baloo2_400Regular,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });
  return loaded;
}
