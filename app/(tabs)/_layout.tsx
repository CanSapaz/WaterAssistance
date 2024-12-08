import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 10,
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
          tabBarIcon: (props: { color: string; size: number }) => (
            <MaterialCommunityIcons name="water" size={props.size} color={props.color} />
          )
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          headerShown: false,
          tabBarIcon: (props: { color: string; size: number }) => (
            <MaterialCommunityIcons name="chart-line" size={props.size} color={props.color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          headerShown: false,
          tabBarIcon: (props: { color: string; size: number }) => (
            <MaterialCommunityIcons name="account-group-outline" size={props.size} color={props.color} />
          ),
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          headerShown: false,
          tabBarIcon: (props: { color: string; size: number }) => (
            <MaterialCommunityIcons name="book-open-page-variant-outline" size={props.size} color={props.color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          tabBarIcon: (props: { color: string; size: number }) => (
            <MaterialCommunityIcons name="cog-outline" size={props.size} color={props.color} />
          ),
        }}
      />
    </Tabs>
  );
}
