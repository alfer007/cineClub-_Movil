import { registerRootComponent } from 'expo';
import StackNavigator from './src/navigation/StackNavigator';
import { MenuProvider } from 'react-native-popup-menu'; 

export default function App() {
  return (
    <MenuProvider>
      <StackNavigator />
    </MenuProvider>
  );
}

registerRootComponent(App);
