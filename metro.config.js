// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Polyfill node built-ins that some libraries (like @ide/backoff) try to require
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  assert: require.resolve('assert/'),
};

module.exports = config;
