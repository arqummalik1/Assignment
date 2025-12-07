import { useTheme } from '@/contexts/ThemeContext';

// Re-export useColorScheme for backward compatibility, but use theme context
export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
}
