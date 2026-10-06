import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

// Uses the phone's own text-to-speech engine, so it works offline
// (an English voice must be installed in Android settings).
export function speak(text) {
  try { Speech.stop(); Speech.speak(text, { language: 'en-US', rate: 0.85 }); } catch (e) {}
}
export const tap = () => { Haptics.selectionAsync().catch(() => {}); };
export const good = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); };
export const bad = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); };
