module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@plotpaper/mini-app-sdk": "./mini-app-sdk/index",
          },
        },
      ],
    ],
  };
};
