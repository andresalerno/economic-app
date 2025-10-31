// src/styles/theme.ts

// Definindo as cores principais
export const colors = {
  azulNoite: '#010D26',
  laranja: '#F26938',
  azul: '#03225E',
  cinzaClaro: '#e6e2e2',
  cinzaMedio: '#9A9DB1',
  laranjaImpacto: '#F2522E',
  verde: '#00D2B6',
  roxo: '#8A2BE2',
  background: '#FFFFFF',
  surface: '#F1F1F1',
  primary: '#F26938',
  textPrimary: '#010D26',
  textSecondary: '#9A9DB1',
  textTertiary: '#999999',
  border: '#e6e2e2',

  degradeQuentePrimario: ['#F2522E', '#F26938'],
  degradeFrioPrimario: ['#010D26', '#03225E'],
  degradeDFS: ['#03225E', '#F2522E'],
  degradeDFA: ['#011640', '#00D2B6'],
  degradeDFIA: ['#011640', '#8A2BE2'],
};

export const fonts = {
  extralight: 'Poppins-ExtraLight',
  light: 'Poppins-Light',
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  extrabold: 'Poppins-ExtraBold',
  black: 'Poppins-Black',
};

export const fontSizes = {
  small: 12,
  regular: 16,
  medium: 18,
  large: 24,
  xLarge: 32,
};

export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
  xLarge: 32,
};

export const borderRadius = {
  small: 4,
  medium: 8,
  large: 16,
};

export const shadow = {
  light: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  heavy: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
};

export const theme = {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  shadow,
};
