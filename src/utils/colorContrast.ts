/**
 * Color Contrast Utilities for WCAG Compliance
 * Checks and fixes color contrast issues according to WCAG 2.1 Level AA
 */

export interface ContrastResult {
  ratio: number;
  passes: boolean;
  level: 'AA' | 'AAA' | 'fail';
  requiredRatio: number;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle shorthand hex (e.g., #fff)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Calculate relative luminance according to WCAG
 */
export function getLuminance(r: number, g: number, b: number): number {
  // Normalize RGB values
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(normalizeColor(color1) ?? color1);
  const rgb2 = hexToRgb(normalizeColor(color2) ?? color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG requirements
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param isLargeText - Whether text is 18pt+ or 14pt+ bold
 */
export function checkContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 3 : 4.5;
  
  return {
    ratio,
    passes: ratio >= requiredRatio,
    level: ratio >= 7 ? 'AAA' : ratio >= requiredRatio ? 'AA' : 'fail',
    requiredRatio
  };
}

/**
 * Adjust color brightness
 */
function adjustBrightness(r: number, g: number, b: number, amount: number): { r: number; g: number; b: number } {
  return {
    r: Math.max(0, Math.min(255, r + amount)),
    g: Math.max(0, Math.min(255, g + amount)),
    b: Math.max(0, Math.min(255, b + amount))
  };
}

/**
 * Make a color darker
 */
function darkenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const adjusted = adjustBrightness(rgb.r, rgb.g, rgb.b, -amount);
  return rgbToHex(adjusted.r, adjusted.g, adjusted.b);
}

/**
 * Make a color lighter
 */
function lightenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const adjusted = adjustBrightness(rgb.r, rgb.g, rgb.b, amount);
  return rgbToHex(adjusted.r, adjusted.g, adjusted.b);
}

/**
 * Auto-fix color contrast by adjusting foreground or background
 * Returns both adjusted foreground and background (one will be original, one adjusted)
 */
export function fixContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): { foreground: string; background: string; ratio: number } {
  const targetRatio = isLargeText ? 3 : 4.5;
  
  // Try adjusting foreground first (darken if on light background, lighten if on dark)
  const bgLuminance = (() => {
    const rgb = hexToRgb(background);
    return rgb ? getLuminance(rgb.r, rgb.g, rgb.b) : 0.5;
  })();
  
  const isLightBackground = bgLuminance > 0.5;
  
  // Try adjusting foreground
  let adjustedForeground = foreground;
  let currentRatio = getContrastRatio(adjustedForeground, background);
  let step = 0;
  const maxSteps = 50;
  
  while (currentRatio < targetRatio && step < maxSteps) {
    adjustedForeground = isLightBackground 
      ? darkenColor(adjustedForeground, 5)
      : lightenColor(adjustedForeground, 5);
    
    currentRatio = getContrastRatio(adjustedForeground, background);
    step++;
  }
  
  // If adjusting foreground worked, return it
  if (currentRatio >= targetRatio) {
    return {
      foreground: adjustedForeground,
      background,
      ratio: currentRatio
    };
  }
  
  // If not, try adjusting background
  let adjustedBackground = background;
  currentRatio = getContrastRatio(foreground, adjustedBackground);
  step = 0;
  
  while (currentRatio < targetRatio && step < maxSteps) {
    adjustedBackground = isLightBackground
      ? lightenColor(adjustedBackground, 5)
      : darkenColor(adjustedBackground, 5);
    
    currentRatio = getContrastRatio(foreground, adjustedBackground);
    step++;
  }
  
  return {
    foreground,
    background: adjustedBackground,
    ratio: currentRatio
  };
}

/**
 * Extract color from CSS color value (handles rgb, rgba, hex)
 */
export function normalizeColor(color: string): string | null {
  // Strip !important and whitespace before processing
  color = color.trim().replace(/\s*!important\s*$/i, '').trim();

  // Handle hex
  if (color.startsWith('#')) {
    return color;
  }
  
  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return rgbToHex(r, g, b);
  }
  
  // Handle named colors (basic set)
  const namedColors: Record<string, string> = {
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'green': '#008000',
    'blue': '#0000ff',
    'yellow': '#ffff00',
    'gray': '#808080',
    'grey': '#808080',
    'purple': '#800080',
    'orange': '#ffa500',
  };
  
  return namedColors[color.toLowerCase()] || null;
}
