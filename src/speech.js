import * as Speech from 'expo-speech';

// Uses the text-to-speech engine installed on the phone, so it works offline
// (an English voice must be installed in Android settings).
export function speak(text) {
  try {
    Speech.stop();
    Speech.speak(text, { language: 'en-US', rate: 0.85 });
  } catch (e) {}
}
