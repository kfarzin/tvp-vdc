/**
 * Pool of 50 distinctive colors for network visualization
 * Each color is carefully selected to be visually distinct from others
 */
export const NETWORK_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Light Blue
  '#F8B739', // Orange
  '#52B788', // Green
  '#E94B3C', // Crimson
  '#6C5CE7', // Indigo
  '#A8E6CF', // Pale Green
  '#FFD93D', // Golden Yellow
  '#FF6B9D', // Pink
  '#95E1D3', // Aquamarine
  '#F38181', // Coral
  '#AA96DA', // Lavender
  '#FCBAD3', // Light Pink
  '#A8D8EA', // Baby Blue
  '#FFB6B9', // Pastel Red
  '#BAE1FF', // Powder Blue
  '#C7CEEA', // Periwinkle
  '#FFDAC1', // Peach
  '#B5EAD7', // Seafoam
  '#FF9FF3', // Fuchsia
  '#54A0FF', // Bright Blue
  '#48DBFB', // Cyan
  '#1DD1A1', // Emerald
  '#5F27CD', // Deep Purple
  '#00D2D3', // Teal
  '#FF9F43', // Mango
  '#EE5A6F', // Watermelon
  '#C44569', // Plum
  '#786FA6', // Gray Purple
  '#F8EFBA', // Cream
  '#63CDDA', // Turquoise Blue
  '#CF6679', // Rose
  '#F5CD79', // Sand
  '#A29BFE', // Periwinkle Blue
  '#6C5B7B', // Dusty Purple
  '#FD79A8', // Hot Pink
  '#FDCB6E', // Mustard
  '#E17055', // Terra Cotta
  '#74B9FF', // Sky
  '#A29BFE', // Soft Purple
  '#55EFC4', // Light Green
  '#81ECEC', // Light Cyan
  '#FAB1A0', // Salmon Pink
  '#DFE6E9', // Light Gray
] as const;

/**
 * Get a unique color for a new network that hasn't been used yet
 * @param usedColors Array of colors already assigned to existing networks
 * @returns A color from the pool that hasn't been used, or the first color if all are used
 */
export function getUniqueNetworkColor(usedColors: string[]): string {
  const availableColors = NETWORK_COLORS.filter(color => !usedColors.includes(color));
  
  if (availableColors.length > 0) {
    // Return a random available color
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }
  
  // If all colors are used (more than 50 networks), return the first color
  // In practice, this is unlikely to happen
  return NETWORK_COLORS[0];
}

/**
 * Get all colors currently used by networks
 * @param networks Record of network definitions
 * @returns Array of colors in use
 */
export function getUsedNetworkColors(networks: Record<string, any>): string[] {
  return Object.values(networks)
    .map(network => network?.color)
    .filter((color): color is string => typeof color === 'string');
}
