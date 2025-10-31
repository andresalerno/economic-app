import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { borderRadius, colors, fonts, shadow, spacing } from "../styles/theme";
import { TabItems, TabKey } from "../types/navigation";

type BottomTabBarProps = {
  activeKey: TabKey;
  onTabPress: (key: TabKey) => void;
};

export function BottomTabBar({ activeKey, onTabPress }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {TabItems.map(({ key, label, icon }) => {
          const isActive = key === activeKey;

          return (
            <TouchableOpacity
              key={key}
              style={[styles.tab, isActive && styles.tabActive]}
              activeOpacity={0.8}
              onPress={() => onTabPress(key)}
            >
              <MaterialCommunityIcons
                name={icon as any}
                size={24}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.large,
    paddingBottom: spacing.large,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.small,
    ...shadow.medium,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.small,
    borderRadius: borderRadius.medium,
    gap: spacing.small / 2,
  },
  tabActive: {
    backgroundColor: colors.cinzaClaro,
  },
  label: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 12,
  },
  labelActive: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
});
