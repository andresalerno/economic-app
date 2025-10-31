import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { borderRadius, colors, fontSizes, fonts, spacing } from "../styles/theme";

type CategoryPreferenceCardProps = {
  label: string;
  icon: string;
  dataEnabled: boolean;
  alertEnabled: boolean;
  onToggleData: () => void;
  onToggleAlert: () => void;
};

export function CategoryPreferenceCard({
  label,
  icon,
  dataEnabled,
  alertEnabled,
  onToggleData,
  onToggleAlert,
}: CategoryPreferenceCardProps) {
  return (
    <View style={styles.row}>
      <View style={styles.categoryInfo}>
        <MaterialCommunityIcons name={icon as any} size={24} color={colors.primary} />
        <Text style={styles.title}>{label}</Text>
      </View>

      <Switch
        style={styles.switch}
        value={dataEnabled}
        onValueChange={onToggleData}
        trackColor={{ false: colors.cinzaClaro, true: colors.primary }}
        thumbColor={dataEnabled ? colors.background : colors.surface}
      />

      <Switch
        style={styles.switch}
        value={alertEnabled}
        onValueChange={onToggleAlert}
        trackColor={{ false: colors.cinzaClaro, true: colors.primary }}
        thumbColor={alertEnabled ? colors.background : colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginBottom: spacing.small,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    gap: spacing.small,
  },
  categoryInfo: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.small,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
    color: colors.textPrimary,
  },
  switch: {
    flex: 1,
  },
});
