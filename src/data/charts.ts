import { colors } from "../styles/theme";
import { CategoryKey } from "./categories";

export type ChartDetailPoint = {
  label: string;
  value: number;
};

export type ChartItem = {
  id: string;
  name: string;
  lastUpdated: string;
  series: number[];
  category: CategoryKey;
  valueType: "percentage" | "absolute";
  source: string;
  sourceColor: string;
  detailSeries?: ChartDetailPoint[];
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export const chartPalette = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: colors.primary,
} as const;

export const chartItems: ChartItem[] = [
  {
    id: "selic-history",
    name: "Taxa Selic (historico)",
    lastUpdated: "15/10/2025",
    series: [13.75, 13.25, 12.75, 11.25, 10.75, 10.5],
    category: "macroeconomia",
    valueType: "percentage",
    source: "Banco Central do Brasil",
    sourceColor: "#0EA5E9",
    suffix: "%",
    decimals: 2,
    detailSeries: [
      { label: "Nov/24", value: 12.75 },
      { label: "Dez/24", value: 12.50 },
      { label: "Jan/25", value: 12.25 },
      { label: "Fev/25", value: 12.00 },
      { label: "Mar/25", value: 11.75 },
      { label: "Abr/25", value: 11.25 },
      { label: "Mai/25", value: 10.75 },
      { label: "Jun/25", value: 10.50 },
      { label: "Jul/25", value: 10.50 },
      { label: "Ago/25", value: 10.25 },
      { label: "Set/25", value: 10.00 },
      { label: "Out/25", value: 9.75 },
    ],
  },
  {
    id: "ipca-monthly",
    name: "IPCA mensal",
    lastUpdated: "02/10/2025",
    series: [0.21, 0.12, 0.36, -0.08, 0.47, 0.52],
    category: "macroeconomia",
    valueType: "percentage",
    source: "IBGE",
    sourceColor: "#8B5CF6",
    suffix: "%",
    decimals: 2,
    detailSeries: [
      { label: "Nov/24", value: 0.33 },
      { label: "Dez/24", value: 0.40 },
      { label: "Jan/25", value: 0.52 },
      { label: "Fev/25", value: 0.18 },
      { label: "Mar/25", value: 0.12 },
      { label: "Abr/25", value: -0.05 },
      { label: "Mai/25", value: 0.21 },
      { label: "Jun/25", value: 0.28 },
      { label: "Jul/25", value: 0.35 },
      { label: "Ago/25", value: 0.41 },
      { label: "Set/25", value: 0.47 },
      { label: "Out/25", value: 0.52 },
    ],
  },
  {
    id: "gdp-quarterly",
    name: "PIB trimestral",
    lastUpdated: "28/09/2025",
    series: [2.1, 1.8, 2.4, 2.9, 3.2, 3.4],
    category: "macroeconomia",
    valueType: "percentage",
    source: "IBGE",
    sourceColor: "#8B5CF6",
    suffix: "%",
    decimals: 1,
    detailSeries: [
      { label: "4T/22", value: 2.1 },
      { label: "1T/23", value: 1.8 },
      { label: "2T/23", value: 2.0 },
      { label: "3T/23", value: 2.2 },
      { label: "4T/23", value: 2.4 },
      { label: "1T/24", value: 2.6 },
      { label: "2T/24", value: 2.8 },
      { label: "3T/24", value: 2.9 },
      { label: "4T/24", value: 3.0 },
      { label: "1T/25", value: 3.1 },
      { label: "2T/25", value: 3.2 },
      { label: "3T/25", value: 3.4 },
    ],
  },
  {
    id: "agribusiness-export",
    name: "Exportacoes do agro (US$ bi)",
    lastUpdated: "12/10/2025",
    series: [12.8, 11.6, 13.1, 14.0, 14.3, 15.2],
    category: "agro",
    valueType: "absolute",
    source: "MAPA/Secex",
    sourceColor: "#F59E0B",
    prefix: "US$ ",
    suffix: " bi",
    decimals: 1,
    detailSeries: [
      { label: "Nov/24", value: 12.1 },
      { label: "Dez/24", value: 12.5 },
      { label: "Jan/25", value: 11.8 },
      { label: "Fev/25", value: 11.6 },
      { label: "Mar/25", value: 12.0 },
      { label: "Abr/25", value: 12.7 },
      { label: "Mai/25", value: 13.1 },
      { label: "Jun/25", value: 13.6 },
      { label: "Jul/25", value: 14.0 },
      { label: "Ago/25", value: 14.2 },
      { label: "Set/25", value: 14.7 },
      { label: "Out/25", value: 15.2 },
    ],
  },
];
