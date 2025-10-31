import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, fontSizes, fonts, spacing } from "../styles/theme";

const logo = require("../../assets/logo-principal/MainLine-LightBgSmall.png");

type HeaderWithLogoProps = {
  title: string;
  greeting?: string;
  subtitle?: string;
  style?: ViewStyle;
};

export function HeaderWithLogo({ title, greeting, subtitle, style }: HeaderWithLogoProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: spacing.large,
    paddingTop: spacing.xLarge,
    marginTop: spacing.xLarge,
    marginBottom: spacing.large,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: fontSizes.xLarge,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  logo: {
    width: 120,
    height: 60,
  },
  greeting: {
    marginTop: spacing.small / 2,
    fontSize: fontSizes.medium,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  subtitle: {
    marginTop: spacing.small / 2,
    fontSize: fontSizes.regular,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
});
