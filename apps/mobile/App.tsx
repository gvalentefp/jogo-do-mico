import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { JungleBackground, useAppFonts } from "./src/ui";
import { useMico } from "./src/useMico";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ConnectScreen } from "./src/screens/ConnectScreen";
import { RulesScreen } from "./src/screens/RulesScreen";
import { LobbyScreen } from "./src/screens/LobbyScreen";
import { GameScreen } from "./src/screens/GameScreen";
import { GameOverScreen } from "./src/screens/GameOverScreen";
import { colors } from "./src/theme";

type Route = "home" | "create" | "join" | "rules";

export default function App() {
  const fontsLoaded = useAppFonts();
  const mico = useMico();
  const { view } = mico;
  const [route, setRoute] = useState<Route>("home");

  // Ao sair de uma sessão conectada, volta para o início.
  const wasConnected = useRef(false);
  const connected = view.status === "connected";
  useEffect(() => {
    if (wasConnected.current && !connected) setRoute("home");
    wasConnected.current = connected;
  }, [connected]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <JungleBackground>
        {!fontsLoaded ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={colors.onDark} />
          </View>
        ) : connected ? (
          view.game?.phase === "finished" ? (
            <GameOverScreen mico={mico} />
          ) : view.game ? (
            <GameScreen mico={mico} />
          ) : (
            <LobbyScreen mico={mico} />
          )
        ) : route === "create" || route === "join" ? (
          <ConnectScreen
            mode={route}
            onBack={() => setRoute("home")}
            onConnect={mico.connect}
            connecting={view.status === "connecting"}
            error={
              view.error ??
              (view.status === "closed"
                ? "Não foi possível conectar. Verifique o IP do host e a rede."
                : null)
            }
          />
        ) : route === "rules" ? (
          <RulesScreen onBack={() => setRoute("home")} />
        ) : (
          <HomeScreen
            onCreate={() => setRoute("create")}
            onJoin={() => setRoute("join")}
            onRules={() => setRoute("rules")}
          />
        )}
      </JungleBackground>
    </GestureHandlerRootView>
  );
}
