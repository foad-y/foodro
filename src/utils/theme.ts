import config from '../../site.config.json'

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  primarytext: string;
  secondarytext: string;
  tertiarytext: string;
  gradiantbtnfrom: string;
  gradiantbtnto: string;
}

export interface ThemePreset extends ThemeColors {
  label: string;
}

function hexToRgb(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export function applyColors(colors: ThemeColors): void {
  const root = document.documentElement;
  const mappings: Record<keyof ThemeColors, string> = {
    primary: '--color-primary',
    secondary: '--color-secondary',
    tertiary: '--color-tertiary',
    border: '--color-border',
    success: '--color-success',
    error: '--color-error',
    warning: '--color-warning',
    primarytext: '--color-primarytext',
    secondarytext: '--color-secondarytext',
    tertiarytext: '--color-tertiarytext',
    gradiantbtnfrom: '--color-gradiantbtnfrom',
    gradiantbtnto: '--color-gradiantbtnto',
  };
  Object.entries(mappings).forEach(([key, cssVar]) => {
    const value = colors[key as keyof ThemeColors];
    root.style.setProperty(cssVar, value);
    root.style.setProperty(`${cssVar}-rgb`, hexToRgb(value));
  });
}

export function applyTheme(): void {
  const themeName = (config as any).theme as string | undefined;
  const presets = (config as any).presets as Record<string, ThemePreset> | undefined;

  let colors: ThemeColors;
  if (themeName && themeName !== 'custom' && presets && presets[themeName]) {
    colors = presets[themeName];
  } else {
    colors = config.colors as ThemeColors;
  }

  applyColors(colors);
  document.title = config.marketName;
  applyFavicon(config.favicon);
}

export function applyPreset(presetName: string): void {
  const presets = (config as any).presets as Record<string, ThemePreset> | undefined;
  if (!presets || !presets[presetName]) return;
  applyColors(presets[presetName]);
}

export function resetTheme(): void {
  applyTheme();
}

export function getPresets(): Record<string, ThemePreset> {
  return ((config as any).presets as Record<string, ThemePreset>) || {};
}

export function getCurrentColors(): ThemeColors {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  return {
    primary: style.getPropertyValue('--color-primary').trim(),
    secondary: style.getPropertyValue('--color-secondary').trim(),
    tertiary: style.getPropertyValue('--color-tertiary').trim(),
    border: style.getPropertyValue('--color-border').trim(),
    success: style.getPropertyValue('--color-success').trim(),
    error: style.getPropertyValue('--color-error').trim(),
    warning: style.getPropertyValue('--color-warning').trim(),
    primarytext: style.getPropertyValue('--color-primarytext').trim(),
    secondarytext: style.getPropertyValue('--color-secondarytext').trim(),
    tertiarytext: style.getPropertyValue('--color-tertiarytext').trim(),
    gradiantbtnfrom: style.getPropertyValue('--color-gradiantbtnfrom').trim(),
    gradiantbtnto: style.getPropertyValue('--color-gradiantbtnto').trim(),
  };
}

function applyFavicon(href: string): void {
  document.querySelectorAll("link[rel*='icon']").forEach((el) => el.remove());
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = href;
  document.head.appendChild(link);
}