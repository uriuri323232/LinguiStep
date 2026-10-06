import { createContext, useContext } from 'react';

export const light = {
  bg: '#F4F6FF', card: '#FFFFFF', ink: '#121936', muted: '#6B7597', line: '#E2E7F6',
  accent: '#5B5CF0', accent2: '#8B5CF6', sun: '#FFB020', good: '#12B981', goodSoft: '#D8F6EB',
  bad: '#F43F5E', badSoft: '#FFE3E8', soft: '#ECEFFF', shadow: '#4B4DD8', onAccent: '#FFFFFF',
};
export const dark = {
  bg: '#0C1122', card: '#161D38', ink: '#F1F4FF', muted: '#9AA5C9', line: '#263054',
  accent: '#7B7CFF', accent2: '#A78BFA', sun: '#FFC24A', good: '#2DD4A0', goodSoft: '#12372F',
  bad: '#FF6B85', badSoft: '#42202B', soft: '#1E2748', shadow: '#000000', onAccent: '#0C1122',
};
export const ThemeContext = createContext(light);
export const useTheme = () => useContext(ThemeContext);
export const radius = 20;
