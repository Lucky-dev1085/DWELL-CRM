export const parseColor = (input: string): string | number[] => {
  const m = input.match(/^#([0-9a-f]{6})$/i)[1];
  if (m) {
    return [
      parseInt(m.substr(0, 2), 16),
      parseInt(m.substr(2, 2), 16),
      parseInt(m.substr(4, 2), 16),
    ];
  }
  return '';
};

export const shadowDreamy = (color: string): string => {
  const colorRgb = parseColor(color);
  return (`box-shadow: 0 1px 2px rgba(${colorRgb.toString()}, 0.07),
              0 2px 4px rgba(${colorRgb.toString()}, 0.07),
              0 4px 8px rgba(${colorRgb.toString()}, 0.07),
              0 8px 16px rgba(${colorRgb.toString()}, 0.07),
              0 16px 32px rgba(${colorRgb.toString()}, 0.07),
              0 32px 64px rgba(${colorRgb.toString()}, 0.07);
`);
};

export const shadowSharp = (color: string): string => {
  const colorRgb = parseColor(color);
  return (
    `box-shadow: 0 1px 1px rgba(${colorRgb.toString()}, 0.25),
              0 2px 2px rgba(${colorRgb.toString()}, 0.20),
              0 4px 4px rgba(${colorRgb.toString()}, 0.15),
              0 8px 8px rgba(${colorRgb.toString()}, 0.10),
              0 16px 16px rgba(${colorRgb.toString()}, 0.05);
`);
};

export const shadowSmooth = (color: string): string => {
  const colorRgb = parseColor(color);
  return (`box-shadow: 0 2.8px 2.2px rgba(${colorRgb.toString()}, 0.02),
              0 6.7px 5.3px rgba(${colorRgb.toString()}, 0.028),
              0 12.5px 10px rgba(${colorRgb.toString()}, 0.035),
              0 22.3px 17.9px rgba(${colorRgb.toString()}, 0.042),
              0 41.8px 33.4px rgba(${colorRgb.toString()}, 0.05),
              0 100px 80px rgba(${colorRgb.toString()}, 0.07);
`);
};

export const shadowDropdown = (color: string): string => {
  const colorRgb = parseColor(color);
  return (`box-shadow: 2px 5px 45px rgba(${parseColor('#243782').toString()}, .12),
              0 1px 2px rgba(${colorRgb.toString()}, 0.07),
              0 2px 4px rgba(${colorRgb.toString()}, 0.07),
              0 4px 8px rgba(${colorRgb.toString()}, 0.07),
              0 8px 16px rgba(${colorRgb.toString()}, 0.07),
              0 16px 32px rgba(${colorRgb.toString()}, 0.07),
              0 32px 64px rgba(${colorRgb.toString()}, 0.07);
`);
};

export const shadowDiffuse = (color: string): string => {
  const colorRgb = parseColor(color);
  return (`box-shadow: 0 1px 1px rgba(${colorRgb.toString()}, 0.08),
              0 2px 2px rgba(${colorRgb.toString()}, 0.12),
              0 4px 4px rgba(${colorRgb.toString()}, 0.16),
              0 8px 8px rgba(${colorRgb.toString()}, 0.20);
`);
};
