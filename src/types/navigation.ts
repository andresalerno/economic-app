export type TabKey = "home" | "settings" | "graph" | "logout";

export type TabDefinition = {
  key: TabKey;
  label: string;
  icon: string;
};

export const TabItems: TabDefinition[] = [
  { key: "home", label: "Home", icon: "home-variant" },
  { key: "settings", label: "Meu espaço", icon: "cog" },
  { key: "graph", label: "Gráficos", icon: "chart-bar" },
  { key: "logout", label: "Sair", icon: "exit-to-app" },
];
