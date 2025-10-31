import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { ChartItem, chartPalette } from "../data/charts";
import { borderRadius, colors, fontSizes, fonts, shadow, spacing } from "../styles/theme";

export type ChartItemCardProps = {
  item: ChartItem;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onExpand?: (item: ChartItem) => void;
  highlighted?: boolean;
  highlightColor?: string;
};

export function ChartItemCard({
  item,
  isFavorite = false,
  onToggleFavorite,
  onExpand,
  highlighted = false,
  highlightColor,
}: ChartItemCardProps) {
  const series = item.series.length > 0 ? item.series : [0];
  const last = series[series.length - 1] ?? 0;
  const prev = series[series.length - 2] ?? last;
  const up = last >= prev;
  const decimals = item.decimals ?? 1;
  const labelValue = `${item.prefix ?? ""}${last.toFixed(decimals)}${item.suffix ?? ""}`;
  const trendColor = up ? chartPalette.positive : chartPalette.negative;
  const accentColor = highlightColor ?? colors.primary;
  const sourceColor = item.sourceColor;
  const sourceBackground = `${sourceColor}1A`;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.card,
          highlighted && styles.cardHighlighted,
          highlighted && { borderLeftColor: accentColor },
        ]}
      >
        <View style={styles.info}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.value}>{labelValue}</Text>
          <Text style={styles.meta}>Atualizado em {item.lastUpdated}</Text>
          <View style={[styles.sourceTag, { backgroundColor: sourceBackground, borderColor: sourceColor }]}>
            <Text style={[styles.sourceTagText, { color: sourceColor }]}>{item.source}</Text>
          </View>
          <View style={styles.trendRow}>
            <Feather
              name={up ? "arrow-up-right" : "arrow-down-right"}
              size={16}
              color={trendColor}
            />
            <Text style={[styles.trendText, { color: trendColor }]}>{up ? "Alta" : "Queda"}</Text>
          </View>
        </View>

        <Sparkline data={series} />

        <View style={styles.expandBar} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => onExpand?.(item)}
            accessibilityRole="button"
            accessibilityLabel={`Expandir ${item.name}`}
            style={styles.expandButton}
            hitSlop={hitSlop}
          >
            <Feather name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onToggleFavorite?.(item.id)}
        accessibilityLabel={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        style={styles.favoriteButton}
        hitSlop={hitSlop}
      >
        <Ionicons
          name={isFavorite ? "star" : "star-outline"}
          size={22}
          color={isFavorite ? "#f59e0b" : colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const hitSlop = { top: 10, right: 10, bottom: 10, left: 10 };

type SparklineProps = {
  data: number[];
};

function Sparkline({ data }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <View style={styles.sparklineWrapper}>
      <View style={styles.sparkline}>
        {data.map((value, index) => {
          const normalized = (value - min) / range;
          const height = Math.max(4, normalized * 36);

          return (
            <View
              key={index}
              style={[styles.sparklineBar, { height }]}
              accessibilityRole="none"
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    borderLeftWidth: 0,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
    gap: spacing.medium,
    ...shadow.light,
  },
  cardHighlighted: {
    borderLeftWidth: 4,
  },
  info: {
    flex: 1,
    gap: spacing.small / 2,
  },
  title: {
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
    fontSize: fontSizes.regular,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    color: colors.primary,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: colors.textSecondary,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sourceTag: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.small / 3,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourceTagText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
  },
  trendText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
  },
  sparklineWrapper: {
    height: 50,
    width: 90,
    paddingVertical: spacing.small / 2,
    justifyContent: "center",
  },
  sparkline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  sparklineBar: {
    flex: 1,
    borderRadius: borderRadius.small,
    backgroundColor: chartPalette.neutral,
  },
  expandBar: {
    position: "absolute",
    right: spacing.small,
    bottom: spacing.small,
  },
  expandButton: {
    padding: spacing.small / 2,
    borderRadius: borderRadius.medium,
    backgroundColor: "transparent",
  },
  favoriteButton: {
    position: "absolute",
    top: -spacing.small,
    right: spacing.small,
    borderRadius: borderRadius.large,
    backgroundColor: colors.background,
    padding: spacing.small / 2,
    ...shadow.light,
  },
});
