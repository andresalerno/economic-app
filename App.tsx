import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';

import { EntryScreen, RegistrationOrigin, RegistrationData } from './src/screens/EntryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { GraphsScreen } from './src/screens/GraphsScreen';
import { colors } from './src/styles/theme';
import { TabKey } from './src/types/navigation';
import { buildCategoryState, CategoryKey } from './src/data/categories';
import { chartItems } from './src/data/charts';

SplashScreen.preventAutoHideAsync().catch(() => null);

type UserProfile = {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  email: string;
  provider: RegistrationOrigin;
};

type UserRecord = {
  password: string;
  profile: UserProfile;
};

const PROFILE_FIELDS: Array<keyof UserProfile> = ['firstName', 'lastName', 'birthDate', 'phone', 'email'];

const demoUserEmail = 'demo@economic.app';
const demoUserPassword = '123456';
const demoProfile: UserProfile = {
  firstName: 'Demo',
  lastName: 'Usuario',
  birthDate: '',
  phone: '',
  email: demoUserEmail,
  provider: 'manual',
};

function computeProfileCompletion(profile: UserProfile) {
  const filled = PROFILE_FIELDS.reduce((count, key) => {
    const value = profile[key];
    return value && value.trim() ? count + 1 : count;
  }, 0);

  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

type AuthenticatedState = {
  userEmail: string;
  activeTab: TabKey;
};

export default function App() {
  const [authState, setAuthState] = useState<AuthenticatedState | null>(null);
  const [userStore, setUserStore] = useState<Record<string, UserRecord>>({
    [demoUserEmail]: {
      password: demoUserPassword,
      profile: demoProfile,
    },
  });
  const [dataPreferences, setDataPreferences] = useState<Record<CategoryKey, boolean>>(() => buildCategoryState(false));
  const [alertPreferences, setAlertPreferences] = useState<Record<CategoryKey, boolean>>(() => buildCategoryState(false));
  const [favoriteChartIds, setFavoriteChartIds] = useState<Record<string, boolean>>({});

  const handleToggleDataPreference = useCallback((key: CategoryKey) => {
    setDataPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleToggleAlertPreference = useCallback((key: CategoryKey) => {
    setAlertPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSetAllDataPreferences = useCallback((value: boolean) => {
    setDataPreferences(buildCategoryState(value));
  }, []);

  const handleSetAllAlertPreferences = useCallback((value: boolean) => {
    setAlertPreferences(buildCategoryState(value));
  }, []);

  const handleToggleFavoriteChart = useCallback((chartId: string) => {
    setFavoriteChartIds((prev) => ({ ...prev, [chartId]: !prev[chartId] }));
  }, []);

  const favoriteCharts = useMemo(() => {
    return chartItems.filter((item) => favoriteChartIds[item.id]);
  }, [favoriteChartIds]);

  const [fontsLoaded] = useFonts({
    'Poppins-ExtraLight': Poppins_200ExtraLight,
    'Poppins-Light': Poppins_300Light,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'Poppins-ExtraBold': Poppins_800ExtraBold,
    'Poppins-Black': Poppins_900Black,
  });

  const handleAuthenticate = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const record = userStore[normalizedEmail];
      const isValid = record?.password === password;

      if (isValid) {
        setAuthState({ userEmail: normalizedEmail, activeTab: 'home' });
      }

      return Boolean(isValid);
    },
    [userStore],
  );

  const handleRegister = useCallback(
    async (data: RegistrationData, origin: RegistrationOrigin) => {
      const normalizedEmail = data.email.trim().toLowerCase();
      const profile: UserProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
        phone: data.phone,
        email: normalizedEmail,
        provider: origin,
      };

      setUserStore((prev) => ({
        ...prev,
        [normalizedEmail]: {
          password: data.password,
          profile,
        },
      }));
      setDataPreferences(buildCategoryState(false));
      setAlertPreferences(buildCategoryState(false));
      setFavoriteChartIds({});
      setAuthState({ userEmail: normalizedEmail, activeTab: 'home' });
    },
    [setAlertPreferences, setDataPreferences, setFavoriteChartIds],
  );

  const handleTabChange = useCallback((tab: TabKey) => {
    setAuthState((current) => (current ? { ...current, activeTab: tab } : current));
  }, []);

  const handleLogout = useCallback(() => {
    setAuthState(null);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const renderAuthenticated = () => {
    if (!authState) {
      return null;
    }

    const activeProfile = userStore[authState.userEmail]?.profile ?? demoProfile;
    const profileCompletion = computeProfileCompletion(activeProfile);
    const displayName = activeProfile.firstName ? activeProfile.firstName : authState.userEmail;

    const screenProps = {
      userEmail: authState.userEmail,
      activeTab: authState.activeTab,
      onTabChange: handleTabChange,
      onLogout: handleLogout,
    } as const;

    switch (authState.activeTab) {
      case 'home':
        return (
          <HomeScreen
            {...screenProps}
            displayName={displayName}
            profileCompletion={profileCompletion}
            dataPreferences={dataPreferences}
            favoriteCharts={favoriteCharts}
            onToggleFavoriteChart={handleToggleFavoriteChart}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            {...screenProps}
            dataPreferences={dataPreferences}
            alertPreferences={alertPreferences}
            onToggleDataPreference={handleToggleDataPreference}
            onToggleAlertPreference={handleToggleAlertPreference}
            onSetAllDataPreferences={handleSetAllDataPreferences}
            onSetAllAlertPreferences={handleSetAllAlertPreferences}
          />
        );
      case 'graph':
        return (
          <GraphsScreen
            {...screenProps}
            favoriteChartIds={favoriteChartIds}
            onToggleFavoriteChart={handleToggleFavoriteChart}
          />
        );
      case 'logout':
        handleLogout();
        return null;
      default:
        return (
          <HomeScreen
            {...screenProps}
            displayName={displayName}
            profileCompletion={profileCompletion}
            dataPreferences={dataPreferences}
            favoriteCharts={favoriteCharts}
            onToggleFavoriteChart={handleToggleFavoriteChart}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.root} onLayout={onLayoutRootView}>
      {authState ? renderAuthenticated() : (
        <EntryScreen onAuthenticate={handleAuthenticate} onRegister={handleRegister} />
      )}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
