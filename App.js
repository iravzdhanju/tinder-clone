import React from "react";
import { AuthProvider } from "./hooks/useAuth";
import { LogBox } from "react-native";
LogBox.ignoreAllLogs(); // Ignore log notification by message
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./RootNavigation";
import StackNavigator from "./StackNavigator";

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <AuthProvider>
        <StackNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
