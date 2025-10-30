/**
 * Dashboard theme resolution and merging
 * Handles theme defaults and customizations
 */
import type { DashboardTheme, ResolvedTheme } from './types';
/**
 * Resolve dashboard theme by merging config theme with defaults
 * @param config Dashboard configuration (may contain metadata.theme)
 * @returns Fully resolved theme with all properties
 */
export declare function resolveTheme(config: any): ResolvedTheme;
/**
 * Get the default theme
 */
export declare function getDefaultTheme(): ResolvedTheme;
/**
 * Merge multiple theme objects (right-most takes precedence)
 */
export declare function mergeThemes(...themes: Partial<DashboardTheme>[]): ResolvedTheme;
/**
 * Validate theme colors (ensure valid CSS color strings)
 */
export declare function validateTheme(theme: Partial<DashboardTheme>): boolean;
