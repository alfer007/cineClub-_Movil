import { View, Text, Button } from 'react-native';

export default function DetailsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Pantalla de Detalles</Text>
      <Button title="Volver a Inicio" onPress={() => navigation.goBack()} />
    </View>
  );
}
