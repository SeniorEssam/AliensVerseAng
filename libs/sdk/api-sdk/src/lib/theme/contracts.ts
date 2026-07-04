export interface PlatformThemeContract {
  colors: {
    primary: { default: string; light: string; dark: string; contrast: string };
    secondary: { default: string; light: string; dark: string; contrast: string };
    background: { default: string; surface: string; surfaceHover: string; paper: string };
    text: { primary: string; secondary: string; disabled: string };
    status: { success: string; warning: string; danger: string; info: string };
  };
  typography: {
    fontFamily: string;
    headings: { h1: string; h2: string; h3: string; h4: string };
    body: { base: string; small: string };
  };
  spacing: {
    xs: string; sm: string; md: string; lg: string; xl: string;
  };
  radius: {
    sm: string; md: string; lg: string; pill: string;
  };
  shadows: {
    sm: string; md: string; lg: string;
  };
  safeArea: {
    top: string; bottom: string; left: string; right: string;
  };
  animations: {
    transitionFast: string; transitionNormal: string; transitionSlow: string;
  };
}

export interface ThemeConfiguration {
  version: 1;
  theme: Partial<PlatformThemeContract>;
}

/**
 * Sensible default theme that ensures the platform always has usable styles,
 * even if the backend returns an empty or partial theme.
 */
export const DEFAULT_THEME: PlatformThemeContract = {
  colors: {
    primary:    { default: '#6366f1', light: '#818cf8', dark: '#4f46e5', contrast: '#ffffff' },
    secondary:  { default: '#64748b', light: '#94a3b8', dark: '#475569', contrast: '#ffffff' },
    background: { default: '#ffffff', surface: '#f8fafc', surfaceHover: '#f1f5f9', paper: '#ffffff' },
    text:       { primary: '#0f172a', secondary: '#475569', disabled: '#94a3b8' },
    status:     { success: '#22c55e', warning: '#f59e0b', danger: '#ef4444', info: '#3b82f6' },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    headings: { h1: '2.25rem', h2: '1.875rem', h3: '1.5rem', h4: '1.25rem' },
    body:     { base: '1rem', small: '0.875rem' },
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '3rem' },
  radius:  { sm: '0.25rem', md: '0.5rem', lg: '1rem', pill: '9999px' },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },
  safeArea:    { top: '0px', bottom: '0px', left: '0px', right: '0px' },
  animations:  { transitionFast: '150ms ease', transitionNormal: '300ms ease', transitionSlow: '500ms ease' },
};

/**
 * Deep merges a partial incoming theme on top of defaults.
 * Any missing property in `incoming` will be filled from `defaults`.
 */
export function deepMergeTheme(
  defaults: PlatformThemeContract,
  incoming: Partial<PlatformThemeContract> | undefined | null
): PlatformThemeContract {
  if (!incoming) return { ...defaults };

  const result: any = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof PlatformThemeContract)[]) {
    const defaultVal = (defaults as any)[key];
    const incomingVal = (incoming as any)[key];

    if (incomingVal === undefined || incomingVal === null) {
      continue; // keep default
    }

    if (typeof defaultVal === 'object' && defaultVal !== null && !Array.isArray(defaultVal)) {
      result[key] = deepMergeTheme(defaultVal, incomingVal);
    } else {
      result[key] = incomingVal;
    }
  }
  return result;
}
