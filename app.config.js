
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'MapNotes skal bruge adgang til dine billeder.',
        cameraPermission: 'MapNotes skal bruge kameraet til at tage billeder af steder.',
        microphonePermission: false,
      },
    ],
  ],
});
