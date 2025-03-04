import { registerRootComponent } from 'expo';
import React, { useEffect } from "react";
import StackNavigator from './src/navigation/StackNavigator';
import { MenuProvider } from 'react-native-popup-menu'; 
import { StatusBar, Platform } from "react-native";
import * as NavigationBar from 'expo-navigation-bar';

export default function App() {
  useEffect(() => {
    const hideNavigationBar = async () => {
      if (Platform.OS === "android") {
        await NavigationBar.setVisibilityAsync('hidden'); // 🔹 Oculta la barra de navegación inferior
        await NavigationBar.setBehaviorAsync('overlay-swipe'); // 🔹 Permite mostrarla con swipe
      }
    };

    hideNavigationBar();

    const listener = NavigationBar.addVisibilityListener((event) => {
      if (event.visibility === 'visible') {
        setTimeout(() => {
          hideNavigationBar(); // 🔹 Oculta la barra después de 2 segundos
        }, 2000);
      }
    });

    return () => {
      listener.remove(); // 🔹 Limpia el listener cuando el componente se desmonta
    };
  }, []);


  return (
    <MenuProvider>
      <StatusBar hidden={false} backgroundColor="white" barStyle="dark-content"/>
      <StackNavigator />
    </MenuProvider>
  );
}

registerRootComponent(App);
