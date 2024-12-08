import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useState } from 'react';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function TabLayout() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('home');

  const TabBarIcon = ({ name, color, size, active }: { name: string; color: string; size: number; active: boolean }) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            scale: withSpring(active ? 1.2 : 1)
          }
        ]
      };
    });

    return (
      <View style={[styles.iconContainer, animatedStyle]}>
        <MaterialCommunityIcons name={name} size={size} color={color} />
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text + '80',
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          elevation: 0,
          height: 65,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          ...Platform.select({
            android: {
              elevation: 8,
            },
          }),
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarIcon: (props) => (
            <TabBarIcon 
              name="water" 
              size={24} 
              color={props.color} 
              active={activeTab === 'home'} 
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={[props.style]}
              onPress={() => {
                setActiveTab('home');
                if (props.onPress) {
                  props.onPress();
                }
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          headerShown: false,
          tabBarIcon: (props) => (
            <TabBarIcon 
              name="chart-line" 
              size={24} 
              color={props.color} 
              active={activeTab === 'analysis'} 
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={[props.style]}
              onPress={() => {
                setActiveTab('analysis');
                if (props.onPress) {
                  props.onPress();
                }
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <View style={styles.centerButtonContainer}>
              <LinearGradient
                colors={[colors.primary, colors.primary + '80']}
                style={styles.centerButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons 
                  name="trophy" 
                  size={28} 
                  color="white" 
                />
              </LinearGradient>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={[props.style]}
              onPress={() => {
                setActiveTab('book');
                if (props.onPress) {
                  props.onPress();
                }
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          headerShown: false,
          tabBarIcon: (props) => (
            <TabBarIcon 
              name="account-group" 
              size={24} 
              color={props.color} 
              active={activeTab === 'friends'} 
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={[props.style]}
              onPress={() => {
                setActiveTab('friends');
                if (props.onPress) {
                  props.onPress();
                }
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          tabBarIcon: (props) => (
            <TabBarIcon 
              name="cog" 
              size={24} 
              color={props.color} 
              active={activeTab === 'settings'} 
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={[props.style]}
              onPress={() => {
                setActiveTab('settings');
                if (props.onPress) {
                  props.onPress();
                }
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
