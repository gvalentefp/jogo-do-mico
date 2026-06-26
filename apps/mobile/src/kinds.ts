/** Rotulo + emoji por especie (para exibir as cartas na mao). */
const MAP: Record<string, { label: string; emoji: string }> = {
  leao: { label: "Leão", emoji: "🦁" },
  tigre: { label: "Tigre", emoji: "🐯" },
  elefante: { label: "Elefante", emoji: "🐘" },
  girafa: { label: "Girafa", emoji: "🦒" },
  zebra: { label: "Zebra", emoji: "🦓" },
  hipopotamo: { label: "Hipopótamo", emoji: "🦛" },
  macaco: { label: "Macaco", emoji: "🐵" },
  papagaio: { label: "Papagaio", emoji: "🦜" },
  tucano: { label: "Tucano", emoji: "🐦" },
  jacare: { label: "Jacaré", emoji: "🐊" },
  tartaruga: { label: "Tartaruga", emoji: "🐢" },
  cobra: { label: "Cobra", emoji: "🐍" },
  onca: { label: "Onça", emoji: "🐆" },
  lobo: { label: "Lobo", emoji: "🐺" },
  raposa: { label: "Raposa", emoji: "🦊" },
  coruja: { label: "Coruja", emoji: "🦉" },
  urso: { label: "Urso", emoji: "🐻" },
  panda: { label: "Panda", emoji: "🐼" },
  pinguim: { label: "Pinguim", emoji: "🐧" },
  golfinho: { label: "Golfinho", emoji: "🐬" },
  mico: { label: "Mico", emoji: "🐒" },
};

export function kindLabel(kind: string): string {
  return MAP[kind]?.label ?? kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function kindEmoji(kind: string): string {
  return MAP[kind]?.emoji ?? "🐾";
}
