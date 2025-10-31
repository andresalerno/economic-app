import React, { useCallback, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ChartDetailPoint, ChartItem } from "../data/charts";
import { borderRadius, colors, fontSizes, fonts, spacing } from "../styles/theme";

type ChartDetailModalProps = {
  visible: boolean;
  chart: ChartItem | null;
  onClose: () => void;
};

const CHART_MIN_HEIGHT = 220;
const CHART_PADDING = 24;
const X_AXIS_LABEL_WIDTH = 48;

type ComputedPoint = ChartDetailPoint & {
  x: number;
  y: number;
};

export function ChartDetailModal({ visible, chart, onClose }: ChartDetailModalProps) {
  const [chartSize, setChartSize] = useState({ width: 0, height: CHART_MIN_HEIGHT });

  const handleChartLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setChartSize({ width, height });
  }, []);

  const points = useMemo<ComputedPoint[]>(() => {
    if (!chart || chartSize.width <= CHART_PADDING * 2 || chartSize.height <= CHART_PADDING * 2) {
      return [];
    }
    const source = chart.detailSeries ?? chart.series.map((value, index) => ({
      label: `P${index + 1}`,
      value,
    }));

    const values = source.map((point) => point.value);
    if (values.length === 0) {
      return [];
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    const usableWidth = chartSize.width - CHART_PADDING * 2;
    const usableHeight = chartSize.height - CHART_PADDING * 2;

    return source.map((point, index) => {
      const normalizedX =
        source.length > 1 ? index / (source.length - 1) : 0;
      const normalizedY = (point.value - minValue) / range;
      const x = CHART_PADDING + normalizedX * usableWidth;
      const y = chartSize.height - CHART_PADDING - normalizedY * usableHeight;
      return { ...point, x, y };
    });
  }, [chart, chartSize.height, chartSize.width]);

  const yAxisLabels = useMemo(() => {
    if (!chart || points.length === 0) {
      return [];
    }
    const values = points.map((point) => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    if (maxValue === minValue) {
      return [formatValue(minValue, chart)];
    }
    const midValue = (maxValue + minValue) / 2;
    return [
      formatValue(maxValue, chart),
      formatValue(midValue, chart),
      formatValue(minValue, chart),
    ];
  }, [chart, points]);

  const xAxisLabels = useMemo(() => {
    if (!points.length) {
      return [];
    }
    const lastIndex = points.length - 1;
    if (points.length <= 3) {
      return points.map((point, index) => ({ ...point, index }));
    }
    const middleIndex = Math.floor(lastIndex / 2);
    return [
      { ...points[0], index: 0 },
      { ...points[middleIndex], index: middleIndex },
      { ...points[lastIndex], index: lastIndex },
    ];
  }, [points]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTextWrapper}>
              <Text style={styles.title}>{chart?.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {chart && (
            <>
              <Text style={styles.metaText}>Atualizado em {chart.lastUpdated}</Text>

              <View style={styles.chartWrapper}>
                <View style={styles.yAxis}>
                  {yAxisLabels.map((label, index) => (
                    <Text key={index} style={styles.yAxisLabel}>
                      {label}
                    </Text>
                  ))}
                </View>

                <View style={styles.chartArea} onLayout={handleChartLayout}>
                  <View
                    style={[
                      styles.axisY,
                      {
                        top: CHART_PADDING,
                        bottom: CHART_PADDING,
                        left: CHART_PADDING,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.axisX,
                      {
                        left: CHART_PADDING,
                        right: CHART_PADDING,
                        bottom: CHART_PADDING,
                      },
                    ]}
                  />

                  {points.map((point, index) => {
                    const next = points[index + 1];
                    if (!next) return null;
                    const deltaX = next.x - point.x;
                    const deltaY = next.y - point.y;
                    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    const angle = Math.atan2(deltaY, deltaX);

                    return (
                      <View
                        key={`segment-${point.label}`}
                        style={[
                          styles.segment,
                          {
                            width: length,
                            transform: [
                              { translateX: point.x },
                              { translateY: point.y },
                              { rotateZ: `${angle}rad` },
                            ],
                          },
                        ]}
                      />
                    );
                  })}

                  {points.map((point) => (
                    <View
                      key={`point-${point.label}`}
                      style={[
                        styles.point,
                        {
                          left: point.x - 4,
                          top: point.y - 4,
                        },
                      ]}
                    />
                  ))}

                    {xAxisLabels.map((point) => (
                      <Text
                        key={`xlabel-${point.index}`}
                        style={[
                          styles.xAxisLabel,
                          {
                            left: point.x - X_AXIS_LABEL_WIDTH / 2,
                          },
                        ]}
                      >
                        {point.label}
                      </Text>
                  ))}
                </View>
              </View>

              <View style={styles.footerRow}>
                <View style={styles.shareWrapper}>
                  <View style={styles.shareRow}>
                    <View
                      style={[
                        styles.sourceTag,
                        {
                          borderColor: chart.sourceColor,
                          backgroundColor: `${chart.sourceColor}1A`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sourceTagText,
                          {
                            color: chart.sourceColor,
                          },
                        ]}
                      >
                        {chart.source}
                      </Text>
                    </View>

                    <View style={styles.shareActions}>
                      <Text style={styles.shareLabel}>Compartilhar</Text>
                      <View style={styles.shareButtons}>
                        <TouchableOpacity style={styles.shareButton}>
                          <MaterialCommunityIcons name="instagram" size={22} color="#E1306C" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareButton}>
                          <MaterialCommunityIcons name="linkedin" size={22} color="#0A66C2" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function formatValue(value: number, chart: ChartItem) {
  const decimals = chart.decimals ?? 1;
  const prefix = chart.prefix ?? "";
  const suffix = chart.suffix ?? "";
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(1, 13, 38, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.large,
  },
  content: {
    width: "100%",
    maxWidth: 420,
    borderRadius: borderRadius.large,
    backgroundColor: colors.background,
    padding: spacing.large,
    gap: spacing.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerTextWrapper: {
    flex: 1,
    gap: spacing.small / 2,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.large,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.small / 2,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: colors.textSecondary,
  },
  chartWrapper: {
    flexDirection: "row",
    gap: spacing.small,
  },
  yAxis: {
    width: 60,
    justifyContent: "space-between",
    paddingVertical: spacing.small,
  },
  yAxisLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    color: colors.textSecondary,
  },
  chartArea: {
    flex: 1,
    minHeight: CHART_MIN_HEIGHT,
    height: CHART_MIN_HEIGHT,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.surface,
    position: "relative",
    overflow: "visible",
  },
  axisY: {
    position: "absolute",
    left: CHART_PADDING,
    top: CHART_PADDING,
    bottom: CHART_PADDING,
    width: 1,
    backgroundColor: colors.border,
  },
  axisX: {
    position: "absolute",
    left: CHART_PADDING,
    right: CHART_PADDING,
    bottom: CHART_PADDING,
    height: 1,
    backgroundColor: colors.border,
  },
  segment: {
    position: "absolute",
    height: 2,
    backgroundColor: colors.primary,
  },
  point: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.background,
  },
  xAxisLabel: {
    position: "absolute",
    bottom: -(spacing.medium + fontSizes.small),
    width: X_AXIS_LABEL_WIDTH,
    textAlign: "center",
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  sourceTag: {
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.small / 3,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
  },
  sourceTagText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
  },
  footerRow: {
    flexDirection: "column",
    gap: spacing.small,
    paddingTop: spacing.small,
  },
  shareWrapper: {
    width: "100%",
    gap: spacing.small,
    marginTop: spacing.small,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.medium,
  },
  shareActions: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: spacing.small / 2,
  },
  shareLabel: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    textAlign: "right",
  },
  shareButtons: {
    flexDirection: "row",
    gap: spacing.small,
    flexShrink: 0,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

