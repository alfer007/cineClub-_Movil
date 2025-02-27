import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalles' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
