// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for web platform
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx', 'json'],
  platforms: ['ios', 'android', 'web'],
  resolveRequest: (context, moduleName, platform) => {
    // Handle React Native internal modules for web
    if (platform === 'web') {
      // Redirect React Native Platform to react-native-web
      if (moduleName.includes('react-native/Libraries/Utilities/Platform')) {
        return {
          filePath: path.resolve(__dirname, 'node_modules/react-native-web/dist/modules/Platform/index.js'),
          type: 'sourceFile',
        };
      }

      // Redirect other React Native internals
      if (moduleName.includes('react-native/Libraries/')) {
        try {
          return context.resolveRequest(context, 'react-native-web', platform);
        } catch (e) {
          // Fall back to default resolution
        }
      }
    }

    // Default resolution
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
