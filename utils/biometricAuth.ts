import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export const biometricAuth = {
  // Verificar si el dispositivo soporta biométricos
  async isAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  },

  // Obtener tipo de biométrico disponible
  async getType(): Promise<string> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Huella dactilar';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biométrico';
  },

  // Autenticar con biométrico
  async authenticate(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticarse',
        fallbackLabel: 'Usar contraseña',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Error biométrico:', error);
      return false;
    }
  },

  // Verificar si está habilitado
  async isEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  },

  // Habilitar biométrico y guardar credenciales
  async enable(email: string, password: string): Promise<void> {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    await AsyncStorage.setItem(
      BIOMETRIC_CREDENTIALS_KEY,
      JSON.stringify({ email, password })
    );
  },

  // Deshabilitar biométrico
  async disable(): Promise<void> {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    await AsyncStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY);
  },

  // Obtener credenciales guardadas
  async getCredentials(): Promise<{ email: string; password: string } | null> {
    const credentials = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
    return credentials ? JSON.parse(credentials) : null;
  },
};