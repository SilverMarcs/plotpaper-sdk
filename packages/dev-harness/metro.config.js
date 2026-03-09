const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Resolve @plotpaper/mini-app-sdk to our local mock SDK
config.resolver.extraNodeModules = {
  "@plotpaper/mini-app-sdk": path.resolve(__dirname, "mini-app-sdk"),
};

module.exports = config;
