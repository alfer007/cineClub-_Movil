import { registerRootComponent } from 'expo';
import StackNavigator from './src/navigation/StackNavigator';

export default function App() {
  return <StackNavigator />;
}

registerRootComponent(App);
