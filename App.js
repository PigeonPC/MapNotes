
import React, { useRef, useState } from 'react';
import {
  Alert,
  Button,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [markers, setMarkers] = useState([]); // Sætter use state for markers på kortet
  const [loading, setLoading] = useState(false); // Holder styr på om GPS-lokationen indlæses
  const mapRef = useRef(null); // Reference til kortet, så vi kan flytte det

  // State til formularen for nye markers
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [editingMarkerId, setEditingMarkerId] = useState(null); // Holder styr på hvilken marker der redigeres
  const [viewingMarker, setViewingMarker] = useState(null); // Marker der vises uden redigering
  const [imageUri, setImageUri] = useState(null); // Holder styr på det valgte billede

  function addMarker(event) {
    const coordinate = event.nativeEvent.coordinate; // Finder koordinater for tryk

    setSelectedCoordinate(coordinate); // Gemmer koordinater midlertidigt
    setModalVisible(true); // Åbner formularen
  }


  // Åbner telefonens galleri og vælger et billede
  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      // Gemmer billedets URI hvis brugeren vælger et billede
      if (!result.canceled && result.assets?.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Fejl', 'Kunne ikke åbne billedgalleriet.');
    }
  }


  // Åbner telefonens kamera og tager et billede
  async function takePhoto() {
    try {
      // Spørger brugeren om tilladelse til kameraet
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Ingen tilladelse', 'Appen skal bruge kameraet for at tage billeder.');
        return;
      }

      // Åbner kameraet
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      // Gemmer billedets URI hvis brugeren tager et billede
      if (!result.canceled && result.assets?.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Fejl', 'Kunne ikke åbne kameraet.');
    }
  }


  // Åbner formularen med en eksisterende markers oplysninger
  function editMarker(marker) {
    setEditingMarkerId(marker.id);
    setSelectedCoordinate(marker.coordinate);
    setTitle(marker.title);
    setNote(marker.note);
    setModalVisible(true);
    setImageUri(marker.imageUri || null); // Indlæser markerens eksisterende billede
  }

  // Viser en markers titel og note uden at åbne redigering
  function viewMarker(marker) {
    setViewingMarker(marker);
  }

  // Lukker visningen og åbner redigering
  function startEditing() {
    if (!viewingMarker) return;

    editMarker(viewingMarker);
    setViewingMarker(null);
  }


  // Sletter den valgte marker efter bekræftelse
  function deleteMarker() {
    if (!viewingMarker) return;

    const markerId = viewingMarker.id;

    Alert.alert(
      'Slet marker',
      'Er du sikker på at du vil slette denne marker?',
      [
        {
          text: 'Annuller',
          style: 'cancel',
        },
        {
          text: 'Slet',
          style: 'destructive',
          onPress: () => {
            // Fjerner markeren fra listen
            setMarkers((currentMarkers) =>
              currentMarkers.filter((marker) => marker.id !== markerId)
            );

            setViewingMarker(null); // Lukker notevisningen
          },
        },
      ]
    );
  }


  // Gemmer en ny marker eller opdaterer en eksisterende
  function saveMarker() {
    if (!selectedCoordinate) {
      return;
    }


    const markerData = {
      coordinate: selectedCoordinate,
      title: title.trim() || 'Unavngivet sted', // Standardtitel hvis feltet er tomt
      note: note.trim(), // Noten må gerne være tom
      imageUri, // Gemmer billedets URI sammen med markeren
    };


    if (editingMarkerId !== null) {
      // Opdaterer den eksisterende marker
      setMarkers((currentMarkers) =>
        currentMarkers.map((marker) =>
          marker.id === editingMarkerId
            ? { ...marker, ...markerData }
            : marker
        )
      );
    } else {
      // Tilføjer en ny marker til listen
      setMarkers((currentMarkers) => [
        ...currentMarkers,
        {
          id: Date.now().toString(),
          ...markerData,
        },
      ]);
    }

    closeModal();
  }


  // Lukker formularen og nulstiller felterne
  function closeModal() {
    setModalVisible(false);
    setSelectedCoordinate(null);
    setTitle('');
    setNote('');
    setEditingMarkerId(null);
    setImageUri(null); // Nulstiller billedet når formularen lukkes
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
        showsUserLocation={true} // Viser brugerens aktuelle lokation med en blå prik
      >

        {markers.map((marker) => ( // Viser alle markers på kortet

          <Marker // Viser en pin ved koordinaterne
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => viewMarker(marker)} // Viser markerens oplysninger
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

      {/* Formular til oprettelse af marker */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingMarkerId !== null ? 'Rediger marker' : 'Ny marker'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Titel"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="Skriv en note..."
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
            />



            {/* Vælger billede fra galleri eller tager et nyt med kameraet */}
            <Button
              title="Vælg billede fra galleri"
              onPress={pickImage}
            />

            <Button
              title="Tag billede"
              onPress={takePhoto}
            />


            {/* Viser det valgte billede og giver mulighed for at fjerne det */}
            {imageUri && (
              <View>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.markerImage}
                />
                <Button
                  title="Fjern billede"
                  color="#dc2626"
                  onPress={() => setImageUri(null)}
                />
              </View>
            )}


            <View style={styles.buttonRow}>
              <Button title="Annuller" onPress={closeModal} />
              <Button
                title={editingMarkerId !== null ? 'Gem ændringer' : 'Gem marker'}
                onPress={saveMarker}
              />
            </View>
          </View>
        </View>
      </Modal>


      {/* Viser oplysninger om en eksisterende marker */}
      <Modal
        visible={viewingMarker !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setViewingMarker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {viewingMarker?.title}
            </Text>

            {/* Viser noten hvis der er skrevet en */}
            {viewingMarker?.note ? (
              <Text style={styles.noteText}>
                {viewingMarker.note}
              </Text>
            ) : (
              <Text style={styles.emptyNote}>
                Ingen note tilføjet.
              </Text>
            )}


            {/* Viser billedet der er gemt på markeren */}
            {viewingMarker?.imageUri && (
              <Image
                source={{ uri: viewingMarker.imageUri }}
                style={styles.markerImage}
              />
            )}



            <View style={styles.buttonRow}>
              <Button
                title="Luk"
                onPress={() => setViewingMarker(null)}
              />
              <Button
                title="Slet"
                color="#dc2626"
                onPress={deleteMarker}
              />
              <Button
                title="Rediger"
                onPress={startEditing}
              />
            </View>

          </View>
        </View>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  noteInput: {
    height: 100,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteText: {
    fontSize: 16,
    marginBottom: 20,
  },
  emptyNote: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  markerImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12,
  },
});
