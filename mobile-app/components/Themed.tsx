import { Text as DefaultText, View as DefaultView, useColorScheme } from 'react-native';

export function useThemeColor() {
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  return {
    text: isDark ? '#fff' : '#000',
    background: isDark ? '#121212' : '#fff',
    card: isDark ? '#1e1e1e' : '#fff',
    primary: '#007AFF',
    border: isDark ? '#2c2c2c' : '#e1e1e1',
    placeholder: isDark ? '#666' : '#999',
  };
}

export function Text(props: DefaultText['props']) {
  const { style, ...otherProps } = props;
  const colors = useThemeColor();

  return <DefaultText style={[{ color: colors.text }, style]} {...otherProps} />;
}

export function View(props: DefaultView['props']) {
  const { style, ...otherProps } = props;
  const colors = useThemeColor();

  return <DefaultView style={[{ backgroundColor: colors.background }, style]} {...otherProps} />;
}