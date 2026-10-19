
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const [markers, setMarkers] = useState([]); //Sætter use state for markers på kortet

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

  return (
    <View style={styles.container}>
      <MapView
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
          <Marker //Viser en pin ved koordinaterne
            key={marker.id}
            coordinate={marker.coordinate}
          />
        ))}
      </MapView>
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
});
