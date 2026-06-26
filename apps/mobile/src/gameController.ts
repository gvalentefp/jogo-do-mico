import type { MicoView } from "./useMico";

/**
 * Interface comum entre a partida online (useMico) e a partida solo contra a
 * IA (useLocalGame). A GameScreen consome este contrato e nao sabe qual é.
 */
export interface GameController {
  view: MicoView;
  isMyTurn: boolean;
  /** Compra a carta `cardIndex` do alvo (so na sua vez). */
  draw: (cardIndex: number) => void;
  /** Oferece/sacode uma carta da SUA mao para tentar o adversario (null = parar). */
  offer: (cardIndex: number | null) => void;
  /** Indice da carta que `playerId` esta sacudindo agora, ou null. */
  teasingFor: (playerId: string) => number | null;
  /** Sai da partida. */
  leave: () => void;
  /** Recomeca (apenas no modo solo). */
  restart?: () => void;
}
