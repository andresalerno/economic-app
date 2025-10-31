import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabBar } from "../components/BottomTabBar";
import { ChartItemCard } from "../components/ChartItemCard";
import { ChartDetailModal } from "../components/ChartDetailModal";
import { HeaderWithLogo } from "../components/HeaderWithLogo";
import { categories, CategoryKey } from "../data/categories";
import { ChartItem, chartItems } from "../data/charts";
import { borderRadius, colors, fontSizes, fonts, spacing } from "../styles/theme";
import { TabKey } from "../types/navigation";

type GraphsScreenProps = {
  userEmail: string;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onLogout: () => void;
  favoriteChartIds: Record<string, boolean>;
  onToggleFavoriteChart: (chartId: string) => void;
};

type CategoryFilter = CategoryKey | "all";
type ValueTypeFilter = "all" | ChartItem["valueType"];

type FilterOption = {
  label: string;
  value: string;
  icon?: string;
};

type FilterSectionProps = {
  label: string;
  options: FilterOption[];
  activeValue: string;
  onSelect: (value: string) => void;
};

const categoryFilterOptions: FilterOption[] = [
  { label: "Todas", value: "all", icon: "view-grid-outline" },
  ...categories.map((category) => ({
    label: category.label,
    value: category.key,
    icon: category.icon,
  })),
];

const metricFilterOptions: FilterOption[] = [
  { label: "Todas", value: "all", icon: "tune-variant" },
  { label: "Percentual", value: "percentage", icon: "percent" },
  { label: "Absoluto", value: "absolute", icon: "numeric" },
];

export function GraphsScreen({
  userEmail,
  activeTab,
  onTabChange,
  onLogout,
  favoriteChartIds,
  onToggleFavoriteChart,
}: GraphsScreenProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [valueTypeFilter, setValueTypeFilter] = useState<ValueTypeFilter>("all");
  const [expandedChart, setExpandedChart] = useState<ChartItem | null>(null);

  const handleToggleFavorite = useCallback(
    (chartId: string) => {
      onToggleFavoriteChart(chartId);
    },
    [onToggleFavoriteChart],
  );

  const handleExpand = useCallback((item: ChartItem) => {
    setExpandedChart(item);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setExpandedChart(null);
  }, []);

  const filteredCharts = useMemo(() => {
    return chartItems.filter((item) => {
      const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
      const typeMatch = valueTypeFilter === "all" || item.valueType === valueTypeFilter;
      return categoryMatch && typeMatch;
    });
  }, [categoryFilter, valueTypeFilter]);

  return (
    <View style={styles.container}>
      <HeaderWithLogo title="Gráficos" greeting={`Ola ${userEmail},`} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.filtersWrapper}>
          <FilterSection
            label="Categoria"
            options={categoryFilterOptions}
            activeValue={categoryFilter}
            onSelect={(value) => setCategoryFilter(value as CategoryFilter)}
          />
          <FilterSection
            label="Tipo de metrica"
            options={metricFilterOptions}
            activeValue={valueTypeFilter}
            onSelect={(value) => setValueTypeFilter(value as ValueTypeFilter)}
          />
        </View>

        <Text style={styles.sectionTitle}>Graficos disponiveis</Text>

        {filteredCharts.length > 0 ? (
          filteredCharts.map((item) => (
            <ChartItemCard
              key={item.id}
              item={item}
              isFavorite={!!favoriteChartIds[item.id]}
              onToggleFavorite={handleToggleFavorite}
              onExpand={() => handleExpand(item)}
            />
          ))
        ) : (
          <Text style={styles.emptyState}>Nenhum grafico encontrado com os filtros selecionados.</Text>
        )}
      </ScrollView>

      <BottomTabBar
        activeKey={activeTab}
        onTabPress={(tab) => {
          if (tab === "logout") {
            onLogout();
            return;
          }
          onTabChange(tab);
        }}
      />
      <ChartDetailModal visible={!!expandedChart} chart={expandedChart} onClose={handleCloseDetail} />
    </View>
  );
}

function FilterSection({ label, options, activeValue, onSelect }: FilterSectionProps) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterOptions}
      >
        {options.map((option) => {
          const isActive = option.value === activeValue;
          const iconColor = isActive ? colors.primary : colors.textSecondary;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              {option.icon && (
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={16}
                  color={iconColor}
                />
              )}
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    paddingHorizontal: spacing.large,
    paddingBottom: spacing.xLarge,
    gap: spacing.medium,
  },
  filtersWrapper: {
    gap: spacing.medium,
  },
  sectionTitle: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
  },
  emptyState: {
    fontSize: fontSizes.regular,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  filterSection: {
    gap: spacing.small / 2,
  },
  filterLabel: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  filterOptions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.small,
    paddingRight: spacing.large,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.small / 2,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small / 1.5,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  filterChipText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
});
