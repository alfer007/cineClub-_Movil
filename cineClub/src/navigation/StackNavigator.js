import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import DetailsScreen from "../screens/DetailsScreen";
import RegisterScreen from "../screens/RegisterScreen";
import Dashboard from "../screens/Dashboard";
import AuthLoadingScreen from "../screens/AuthLoadingScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import DetallePelicula from "../components/Inicio/DetallePelicula";
import CarteleraCine from "../components/Inicio/CarteleraCine";
import SeleccionAsientos from "../components/Inicio/SeleccionAsientos";
import EditProfile from "../components/User/EditProfile";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="DetallePelicula" component={DetallePelicula} />
        <Stack.Screen name="CarteleraCine" component={CarteleraCine} />
        <Stack.Screen name="SeleccionAsientos" component={SeleccionAsientos} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
