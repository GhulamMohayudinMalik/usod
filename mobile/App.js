import React, { useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ThreatsScreen from './screens/ThreatsScreen';
import LogsScreen from './screens/LogsScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import AIInsightsScreen from './screens/AIInsightsScreen';
import UsersScreen from './screens/UsersScreen';
import SecurityScreen from './screens/SecurityScreen';
import SecurityLabScreen from './screens/SecurityLabScreen';
import BackupScreen from './screens/BackupScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import SettingsScreen from './screens/SettingsScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const Stack = createStackNavigator();

function MainNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Dashboard');
  const [username, setUsername] = useState('User');

  const handleLogin = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentRoute('Dashboard');
    setSidebarVisible(false);
  };

  const handleMenuPress = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleSidebarClose = () => {
    setSidebarVisible(false);
  };

  const handleNavigation = (routeName) => {
    if (routeName === 'Login') {
      handleLogout();
    } else {
      setCurrentRoute(routeName);
    }
  };

  const renderScreen = () => {
    switch (currentRoute) {
      case 'Dashboard':
        return <DashboardScreen username={username} />;
      case 'Threats':
        return <ThreatsScreen />;
      case 'Logs':
        return <LogsScreen />;
      case 'Analytics':
        return <AnalyticsScreen />;
      case 'AIInsights':
        return <AIInsightsScreen />;
      case 'Users':
        return <UsersScreen />;
      case 'Security':
        return <SecurityScreen />;
      case 'SecurityLab':
        return <SecurityLabScreen />;
      case 'Backup':
        return <BackupScreen />;
      case 'ChangePassword':
        return <ChangePasswordScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen username={username} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#111827' }}>
          <LoginScreen onLogin={handleLogin} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#111827' }}>
        <Header onMenuPress={handleMenuPress} username={username} />
        {renderScreen()}
        <Sidebar
          visible={sidebarVisible}
          onClose={handleSidebarClose}
          onNavigate={handleNavigation}
          activeRoute={currentRoute}
        />
      </View>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#111827" />
      <MainNavigator />
    </NavigationContainer>
  );
}
