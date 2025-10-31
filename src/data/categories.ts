export type CategoryKey = "agro" | "macroeconomia" | "microeconomia" | "internacionais";

export type CategoryDefinition = {
  key: CategoryKey;
  label: string;
  icon: string;
};

export const categories: CategoryDefinition[] = [
  { key: "agro", label: "Agro", icon: "tractor" },
  { key: "macroeconomia", label: "Macroeconomia", icon: "chart-line" },
  { key: "microeconomia", label: "Microeconomia", icon: "chart-bar" },
  { key: "internacionais", label: "Internacionais", icon: "earth" },
];

export function buildCategoryState(initial = false): Record<CategoryKey, boolean> {
  return categories.reduce<Record<CategoryKey, boolean>>((acc, category) => {
    acc[category.key] = initial;
    return acc;
  }, {} as Record<CategoryKey, boolean>);
}
