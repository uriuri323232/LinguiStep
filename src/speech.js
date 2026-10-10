import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

// Uses the phone's own text-to-speech engine, so it works offline
// (an English voice must be installed in Android settings).
let cfg = { rate: 0.85, haptics: true };
export const configure = (c) => { cfg = { ...cfg, ...c }; };

export function speak(text) {
  try { Speech.stop(); Speech.speak(text, { language: 'en-US', rate: cfg.rate }); } catch (e) {}
}
const run = (fn) => { if (cfg.haptics) { try { fn().catch(() => {}); } catch (e) {} } };
export const tap = () => run(() => Haptics.selectionAsync());
export const good = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const bad = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
