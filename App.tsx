// App.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold,
  Nunito_800ExtraBold, Nunito_900Black,
} from "@expo-google-fonts/nunito";
import {
  Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold,
} from "@expo-google-fonts/outfit";

import { AuthScreen } from "@/screens/AuthScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { LessonScreen } from "@/screens/LessonScreen";
import { FlashcardScreen } from "@/screens/FlashcardScreen";
import { QuizScreen } from "@/screens/QuizScreen";
import { BadgesScreen } from "@/screens/BadgesScreen";
import { BottomNav, type Screen } from "@/components/BottomNav";
import { colors, fonts, radius } from "@/theme";
import { restoreAuthSession, signOut, subscribeToAuthChanges } from "@/lib/auth";

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold,
    Nunito_800ExtraBold, Nunito_900Black,
    Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold,
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((session) => {
      setIsAuthenticated(Boolean(session));
      setAuthError(null);
    });

    void restoreAuthSession().then((session) => {
      setIsAuthenticated(Boolean(session));
    }).catch((sessionError: unknown) => {
      setAuthError(sessionError instanceof Error ? sessionError.message : "No se pudo restaurar la sesión.");
    }).finally(() => setAuthChecked(true));

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setAuthError(null);
    } catch (signOutError) {
      setAuthError(signOutError instanceof Error ? signOutError.message : "No se pudo cerrar la sesión.");
    }
  };

  if (!fontsLoaded || !authChecked) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />

      {!isAuthenticated ? (
        <SafeAreaView style={s.authContainer} edges={["top"]}>
          <AuthScreen authError={authError} />
        </SafeAreaView>
      ) : (
        <SafeAreaView style={s.root} edges={["top"]}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.logo}>LSM</Text>
              <View style={s.proBadge}>
                <Text style={s.proBadgeTxt}>PRO</Text>
              </View>
            </View>
            <Pressable
              onPress={() => void handleSignOut()}
              style={({ pressed }) => [s.logoutBtn, pressed && { backgroundColor: colors.primary }]}
            >
              <Text style={s.logoutTxt}>Salir 🚪</Text>
            </Pressable>
          </View>
          {!!authError && (
            <Text style={s.authError}>No se pudo cerrar la sesión: {authError}</Text>
          )}

          {/* Scrollable main */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {currentScreen === "home" && <HomeScreen onNavigate={setCurrentScreen} />}
            {currentScreen === "lesson" && <LessonScreen />}
            {currentScreen === "flashcard" && <FlashcardScreen />}
            {currentScreen === "quiz" && <QuizScreen />}
            {currentScreen === "badges" && <BadgesScreen />}
          </ScrollView>

          <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  authContainer: { flex: 1, backgroundColor: colors.background },
  root: { flex: 1, backgroundColor: colors.shellBg },
  header: {
    backgroundColor: colors.headerBg,
    borderBottomWidth: 3, borderBottomColor: colors.black,
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  authError: {
    backgroundColor: "#ff4d6d22", color: colors.primary,
    paddingHorizontal: 16, paddingVertical: 8, fontSize: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: {
    fontSize: 22, fontFamily: fonts.nunitoBlack, color: colors.accent,
    textShadowColor: colors.black, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0,
  },
  proBadge: {
    backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.black,
  },
  proBadgeTxt: { color: "#fff", fontSize: 10, fontFamily: fonts.nunitoBlack },
  logoutBtn: {
    backgroundColor: colors.logoutBg, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.sm, borderWidth: 2, borderColor: colors.black,
  },
  logoutTxt: { color: "#ddd", fontSize: 12, fontFamily: fonts.nunitoBlack },
  scrollContent: { padding: 16, paddingBottom: 120 },
});