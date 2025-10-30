/**
 * Dashboard theme resolution and merging
 * Handles theme defaults and customizations
 */
/**
 * Default dashboard theme
 */
const DEFAULT_THEME = {
    backgroundColor: '#f8fafc', // slate-50
    cardColor: '#ffffff', // white
    accentColor: '#10b981', // emerald-500
    textColor: '#1f2937', // gray-800
    borderColor: '#e5e7eb', // gray-200
};
/**
 * Resolve dashboard theme by merging config theme with defaults
 * @param config Dashboard configuration (may contain metadata.theme)
 * @returns Fully resolved theme with all properties
 */
export function resolveTheme(config) {
    const metadata = config?.metadata || {};
    const partialTheme = metadata.theme || {};
    return {
        backgroundColor: partialTheme.backgroundColor || DEFAULT_THEME.backgroundColor,
        cardColor: partialTheme.cardColor || DEFAULT_THEME.cardColor,
        accentColor: partialTheme.accentColor || DEFAULT_THEME.accentColor,
        textColor: partialTheme.textColor || DEFAULT_THEME.textColor,
        borderColor: partialTheme.borderColor || DEFAULT_THEME.borderColor,
    };
}
/**
 * Get the default theme
 */
export function getDefaultTheme() {
    return { ...DEFAULT_THEME };
}
/**
 * Merge multiple theme objects (right-most takes precedence)
 */
export function mergeThemes(...themes) {
    const merged = {};
    for (const theme of themes) {
        if (theme.backgroundColor)
            merged.backgroundColor = theme.backgroundColor;
        if (theme.cardColor)
            merged.cardColor = theme.cardColor;
        if (theme.accentColor)
            merged.accentColor = theme.accentColor;
        if (theme.textColor)
            merged.textColor = theme.textColor;
        if (theme.borderColor)
            merged.borderColor = theme.borderColor;
    }
    // Fill in any missing properties with defaults
    return {
        backgroundColor: merged.backgroundColor || DEFAULT_THEME.backgroundColor,
        cardColor: merged.cardColor || DEFAULT_THEME.cardColor,
        accentColor: merged.accentColor || DEFAULT_THEME.accentColor,
        textColor: merged.textColor || DEFAULT_THEME.textColor,
        borderColor: merged.borderColor || DEFAULT_THEME.borderColor,
    };
}
/**
 * Validate theme colors (ensure valid CSS color strings)
 */
export function validateTheme(theme) {
    const colorRegex = /^(#[0-9a-fA-F]{3,8}|rgb|rgba|hsl|hsla)/;
    const colors = [
        theme.backgroundColor,
        theme.cardColor,
        theme.accentColor,
        theme.textColor,
        theme.borderColor,
    ].filter(Boolean);
    return colors.every((color) => colorRegex.test(color));
}
