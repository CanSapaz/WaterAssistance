import { useEffect, useState } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useBiometricAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkBiometricAuth();
  }, []);

  const checkBiometricAuth = async () => {
    try {
      const isBiometricEnabled = await AsyncStorage.getItem('useBiometric');
      
      if (isBiometricEnabled === 'true') {
        const rnBiometrics = new ReactNativeBiometrics();
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: 'Lütfen kimliğinizi doğrulayın',
          cancelButtonText: 'İptal'
        });

        setIsAuthenticated(success);
        return success;
      }
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Biyometrik doğrulama hatası:', error);
      setIsAuthenticated(true);
      return true;
    }
  };

  return {
    isAuthenticated,
    checkBiometricAuth
  };
};
