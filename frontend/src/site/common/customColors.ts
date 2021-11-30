export const getCustomColorValue = (name: string, customColors: { name: string, value: string }[]): string => {
  if (customColors.find(d => d.name === name)) {
    return customColors.find(d => d.name === name).value;
  }
  return null;
};
