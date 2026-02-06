module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@contexts': './src/contexts',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@types': './src/types',
            '@utils': './src/utils',
            '@assets': './src/assets',
            '@data': './src/data',
          },
        },
      ],
    ],
  };
};
