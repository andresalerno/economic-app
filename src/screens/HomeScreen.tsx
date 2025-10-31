import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabBar } from "../components/BottomTabBar";
import { ChartItemCard } from "../components/ChartItemCard";
import { HeaderWithLogo } from "../components/HeaderWithLogo";
import { borderRadius, colors, fontSizes, fonts, spacing } from "../styles/theme";
import { TabKey } from "../types/navigation";
import { categories, CategoryKey } from "../data/categories";
import { ChartItem } from "../data/charts";

type HomeScreenProps = {
  userEmail: string;
  displayName: string;
  profileCompletion: number;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onLogout: () => void;
  dataPreferences: Record<CategoryKey, boolean>;
  favoriteCharts: ChartItem[];
  onToggleFavoriteChart: (chartId: string) => void;
};

export function HomeScreen({
  userEmail,
  displayName,
  profileCompletion,
  activeTab,
  onTabChange,
  onLogout,
  dataPreferences,
  favoriteCharts,
  onToggleFavoriteChart,
}: HomeScreenProps) {
  const selectedCategories = categories.filter((category) => dataPreferences[category.key]);
  const completionSubtitle =
    profileCompletion >= 100
      ? 'Cadastro completo!'
      : `Cadastro ${profileCompletion}% completo`;

  return (
    <View style={styles.container}>
      <HeaderWithLogo
        title="Home"
        greeting={`Ola ${displayName},`}
        subtitle={completionSubtitle}
      />

      <View style={styles.body}>
        <View style={styles.favoritesWrapper}>
          <Text style={styles.sectionTitle}>Graficos favoritos</Text>
          {favoriteCharts.length > 0 ? (
            <View style={styles.favoritesList}>
              {favoriteCharts.map((chart) => (
                <ChartItemCard
                  key={chart.id}
                  item={chart}
                  highlighted
                  isFavorite
                  onToggleFavorite={onToggleFavoriteChart}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyFavorites}>
              <MaterialCommunityIcons name="star-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.emptyFavoritesTitle}>Nenhum favorito por aqui ainda</Text>
              <Text style={styles.emptyFavoritesSubtitle}>
                Visite a aba Graficos, encontre indicadores do seu interesse e toque na estrela para acompanhar tudo por aqui.
              </Text>
            </View>
          )}
        </View>

        {selectedCategories.length > 0 && (
          <View style={styles.selectedCategoriesWrapper}>
            <Text style={styles.selectedCategoriesTitle}>Categorias selecionadas</Text>
            <View style={styles.selectedCategoriesContainer}>
              {selectedCategories.map((category) => (
                <View key={category.key} style={styles.selectedCategoryCard}>
                  <MaterialCommunityIcons name={category.icon as any} size={20} color={colors.primary} />
                  <Text style={styles.selectedCategoryLabel}>{category.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.large,
    gap: spacing.large,
  },
  sectionTitle: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
  },
  favoritesWrapper: {
    gap: spacing.medium,
  },
  favoritesList: {
    gap: spacing.medium,
  },
  emptyFavorites: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.large,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    alignItems: "center",
    gap: spacing.small,
  },
  emptyFavoritesTitle: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  emptyFavoritesSubtitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  selectedCategoriesWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.large,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    gap: spacing.medium,
  },
  selectedCategoriesTitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
    textTransform: "uppercase",
  },
  selectedCategoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.small,
    justifyContent: "space-between",
  },
  selectedCategoryCard: {
    flexBasis: "48%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.small,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  selectedCategoryLabel: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSizes.regular,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
});
