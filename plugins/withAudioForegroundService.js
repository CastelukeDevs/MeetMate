const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withAudioForegroundService(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;

    const app = manifest.manifest.application[0];

    if (!app.service) app.service = [];

    const existingService = app.service.find(
      (s) => s.$["android:name"] === "expo.modules.audio.AudioRecordingService",
    );

    if (existingService) {
      existingService.$["android:foregroundServiceType"] = "microphone";
    }

    return config;
  });
};
