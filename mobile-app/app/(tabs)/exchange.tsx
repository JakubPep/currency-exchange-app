import { StyleSheet } from 'react-native';
import { View, Text } from '../../components/Themed';

export default function ExchangeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wymiana walut</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});