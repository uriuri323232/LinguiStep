import { I18nManager } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// The whole UI is Hebrew (right-to-left). Make sure the layout is RTL on every device.
if (!I18nManager.isRTL) { I18nManager.allowRTL(true); I18nManager.forceRTL(true); }

registerRootComponent(App);
