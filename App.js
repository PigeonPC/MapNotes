
import React, { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [markers, setMarkers] = useState([]); // Sætter use state for markers på kortet
  const [loading, setLoading] = useState(false); // Holder styr på om GPS-lokationen indlæses
  const mapRef = useRef(null); // Reference til kortet, så vi kan flytte det

  function addMarker(event) {
    const coordinate = event.nativeEvent.coordinate; // Finder koordinater for tryk

    setMarkers((currentMarkers) => [ // Tilføj ny marker til listen
      ...currentMarkers,
      {
        id: Date.now().toString(),
        coordinate,
      },
    ]);
  }

  // Henter telefonens aktuelle GPS-lokation
  async function getCurrentLocation() {
    try {
      setLoading(true); // Viser at lokationen indlæses

      // Spørger brugeren om tilladelse til at bruge GPS
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Ingen tilladelse', 'Appen skal bruge din lokation.');
        return;
      }

      // Henter telefonens aktuelle position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Gemmer GPS-koordinaterne
      const coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Tilføjer en ny marker på den aktuelle lokation
      setMarkers((currentMarkers) => [
        ...currentMarkers,
        {
          id: Date.now().toString(),
          coordinate,
        },
      ]);

      // Flytter kortet til den aktuelle lokation
      mapRef.current?.animateToRegion({
        ...coordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);

    } catch (error) {
      Alert.alert('Fejl', 'Kunne ikke hente din lokation.');
      console.error(error);
    } finally {
      setLoading(false); // Stopper indlæsningen
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 55.6761,
          longitude: 12.5683,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onLongPress={addMarker} // Reager når man holder på kortet
      >
        {markers.map((marker) => ( // Viser alle markers på kortet
          <Marker // Viser en pin ved koordinaterne
            key={marker.id}
            coordinate={marker.coordinate}
          />
        ))}
      </MapView>

      {/* Knap til at finde brugerens aktuelle lokation */}
      <Pressable
        style={styles.locationButton}
        onPress={getCurrentLocation}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Finder lokation...' : 'Min lokation'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
