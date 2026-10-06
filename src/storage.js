import AsyncStorage from '@react-native-async-storage/async-storage';

// Everything is stored on the device. Failures are ignored so the app never crashes on storage errors.
export async function load(key, fallback) {
  try {
    const v = await AsyncStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch (e) {
    return fallback;
  }
}
export async function save(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}
