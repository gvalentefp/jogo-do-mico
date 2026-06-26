import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { JungleBackground, useAppFonts } from "./src/ui";
import { useMico } from "./src/useMico";
import { useLocalGame } from "./src/useLocalGame";
import type { GameController } from "./src/gameController";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ConnectScreen } from "./src/screens/ConnectScreen";
import { RulesScreen } from "./src/screens/RulesScreen";
import { SoloSetupScreen } from "./src/screens/SoloSetupScreen";
import { LobbyScreen } from "./src/screens/LobbyScreen";
import { GameScreen } from "./src/screens/GameScreen";
import { GameOverScreen } from "./src/screens/GameOverScreen";
import { colors } from "./src/theme";

type Route = "home" | "create" | "join" | "rules" | "solo";

/** Partida offline contra a IA (monta o hook local isoladamente). */
function SoloGame({ name, botCount, onExit }: {
  name: string; botCount: number; onExit: () => void;
}) {
  const local = useLocalGame({ humanName: name, botCount, onExit });
  const ctrl: GameController = {
    view: local.view, isMyTurn: local.isMyTurn, draw: local.draw,
    offer: local.offer, teasingFor: local.teasingFor, leave: local.leave,
    restart: local.restart,
  };
  if (!local.view.game) {
    return <Center><ActivityIndicator size="large" color={colors.onDark} /></Center>;
  }
  return local.view.game.phase === "finished"
    ? <GameOverScreen ctrl={ctrl} />
    : <GameScreen ctrl={ctrl} />;
}

export default function App() {
  const fontsLoaded = useAppFonts();
  const mico = useMico();
  const { view } = mico;
  const [route, setRoute] = useState<Route>("home");
  const [solo, setSolo] = useState<{ name: string; botCount: number } | null>(null);

  // Ao sair de uma sessão online conectada, volta para o início.
  const wasConnected = useRef(false);
  const connected = view.status === "connected";
  useEffect(() => {
    if (wasConnected.current && !connected) setRoute("home");
    wasConnected.current = connected;
  }, [connected]);

  const onlineCtrl: GameController = {
    view: mico.view, isMyTurn: mico.isMyTurn, draw: mico.draw,
    offer: mico.offer, teasingFor: mico.teasingFor, leave: mico.leave,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <JungleBackground>
        {!fontsLoaded ? (
          <Center><ActivityIndicator size="large" color={colors.onDark} /></Center>
        ) : solo ? (
          <SoloGame
            name={solo.name}
            botCount={solo.botCount}
            onExit={() => { setSolo(null); setRoute("home"); }}
          />
        ) : connected ? (
          view.game?.phase === "finished" ? (
            <GameOverScreen ctrl={onlineCtrl} />
          ) : view.game ? (
            <GameScreen ctrl={onlineCtrl} />
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
        ) : route === "solo" ? (
          <SoloSetupScreen
            onBack={() => setRoute("home")}
            onStart={(name, botCount) => setSolo({ name, botCount })}
          />
        ) : (
          <HomeScreen
            onSolo={() => setRoute("solo")}
            onCreate={() => setRoute("create")}
            onJoin={() => setRoute("join")}
            onRules={() => setRoute("rules")}
          />
        )}
      </JungleBackground>
    </GestureHandlerRootView>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {children}
    </View>
  );
}
