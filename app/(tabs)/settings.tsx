import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Platform, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthSync, setHealthSync] = useState(false);
  const [useBiometric, setUseBiometric] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricSettings();
  }, []);

  const loadBiometricSettings = async () => {
    try {
      const value = await AsyncStorage.getItem('useBiometric');
      if (value !== null) {
        setUseBiometric(value === 'true');
      }
    } catch (error) {
      console.error('Biyometrik ayarları yüklenirken hata:', error);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        setIsBiometricAvailable(true);
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Parmak İzi');
        }
      } else {
        setIsBiometricAvailable(false);
        if (!hasHardware) {
          Alert.alert(
            'Biyometrik Donanım Bulunamadı',
            'Cihazınızda biyometrik kimlik doğrulama donanımı bulunmuyor.'
          );
        } else if (!isEnrolled) {
          Alert.alert(
            'Biyometrik Veri Bulunamadı',
            'Lütfen önce cihaz ayarlarından parmak izi veya yüz tanıma verilerinizi kaydedin.',
            [
              {
                text: 'Ayarlara Git',
                onPress: () => {
                  // Android için ayarlar sayfasına yönlendirme
                  if (Platform.OS === 'android') {
                    Linking.sendIntent('android.settings.SECURITY_SETTINGS');
                  }
                  // iOS için ayarlar uygulamasına yönlendirme
                  else if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  }
                }
              },
              {
                text: 'İptal',
                style: 'cancel'
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Biyometrik kontrol hatası:', error);
      setIsBiometricAvailable(false);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value && isBiometricAvailable) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Biyometrik kimlik doğrulamayı etkinleştir',
          cancelLabel: 'İptal',
          disableDeviceFallback: true,
        });

        if (result.success) {
          setUseBiometric(true);
          await AsyncStorage.setItem('useBiometric', 'true');
          Alert.alert(
            'Başarılı',
            'Biyometrik kimlik doğrulama etkinleştirildi',
            [{ text: 'Tamam' }]
          );
        }
      } catch (error) {
        console.error('Kimlik doğrulama hatası:', error);
        Alert.alert('Hata', 'Kimlik doğrulama sırasında bir hata oluştu');
      }
    } else if (!value) {
      setUseBiometric(false);
      await AsyncStorage.setItem('useBiometric', 'false');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Ayarlar</Text>
      
      {/* Hesap Ayarları */}
      <Text style={[styles.sectionTitle, { color: colors.secondary }]}>HESAP</Text>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="account-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Profil Ayarları</Text>
              <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                Kişisel bilgilerinizi düzenleyin
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Görünüm Ayarları */}
      <Text style={[styles.sectionTitle, { color: colors.secondary }]}>GÖRÜNÜM</Text>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons
                name={theme === 'dark' ? 'weather-night' : 'white-balance-sunny'}
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Karanlık Mod</Text>
              <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                {theme === 'dark' ? 'Karanlık tema aktif' : 'Aydınlık tema aktif'}
              </Text>
            </View>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
            ios_backgroundColor={colors.border}
          />
        </View>
      </View>

      {/* Bildirim Ayarları */}
      <Text style={[styles.sectionTitle, { color: colors.secondary }]}>BİLDİRİMLER</Text>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="bell-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Bildirimler</Text>
              <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                Su içme hatırlatıcıları
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
            ios_backgroundColor={colors.border}
          />
        </View>
      </View>

      {/* Sağlık ve Veri */}
      <Text style={[styles.sectionTitle, { color: colors.secondary }]}>SAĞLIK VE VERİ</Text>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="heart-pulse" size={22} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Sağlık Senkronizasyonu</Text>
              <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                Apple Health/Google Fit ile senkronize et
              </Text>
            </View>
          </View>
          <Switch
            value={healthSync}
            onValueChange={setHealthSync}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
            ios_backgroundColor={colors.border}
          />
        </View>

        <TouchableOpacity style={[styles.settingRow, styles.buttonRow]} onPress={() => {}}>
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="cloud-upload-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Verileri Yedekle</Text>
              <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                Son yedekleme: Bugün 13:45
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, styles.buttonRow]} onPress={() => {}}>
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="file-export-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Verileri Dışa Aktar</Text>
              <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                CSV veya PDF olarak kaydet
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Güvenlik */}
      <Text style={[styles.sectionTitle, { color: colors.secondary }]}>GÜVENLİK</Text>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="fingerprint" size={22} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Biyometrik Kilit</Text>
              <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                {isBiometricAvailable ? `${biometricType} ile güvenli giriş` : 'Kullanılamıyor'}
              </Text>
            </View>
          </View>
          <Switch
            value={useBiometric}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
            ios_backgroundColor={colors.border}
            disabled={!isBiometricAvailable}
          />
        </View>
      </View>

      {/* Hakkında ve Destek */}
      <Text style={[styles.sectionTitle, { color: colors.secondary }]}>HAKKINDA VE DESTEK</Text>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={[styles.settingRow, styles.buttonRow]} onPress={() => {}}>
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="help-circle-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Yardım Merkezi</Text>
              <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                SSS ve kullanım kılavuzu
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, styles.buttonRow]} onPress={() => {}}>
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="information-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Uygulama Hakkında</Text>
              <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                Sürüm 1.0.0
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonRow: {
    paddingVertical: 8,
    marginTop: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
});
