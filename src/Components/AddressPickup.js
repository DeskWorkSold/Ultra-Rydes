import {computeDestinationPoint} from 'geolib';
import React, { useEffect, useState } from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import { TextInput } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Colors from '../Constants/Colors';
import { View } from 'react-native';
import GoogleMapKey from '../Constants/GoogleMapKey';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function AddressPickup({ placeholderText, fetchAddress, type, style }) {
  const [predefinedPlaces, setPredefinedPlaces] = useState([]);

  const onPressAddress = (data, details) => {
    const lat = details.geometry.location.lat;
    const lng = details.geometry.location.lng;
    console.log(details.formatted_address);
    fetchAddress(lat, lng);
  };



  
  navigator.geolocation = require('react-native-geolocation-service')
const homePlace = {
  description: 'Home',
  geometry: { location: { lat: 48.8152937, lng: 2.4597668 } },
};
const workPlace = {
  description: 'Work',
  geometry: { location: { lat: 48.8496818, lng: 2.2940881 } },
};
const Resturant = {
  description: 'Resturant',
  geometry: { location: { lat: 48.8496818, lng: 2.2940881 } },
};



  const getPredefinedPlaces = () => {
    let id = auth().currentUser.uid;

    firestore()
      .collection('AddPlaces')
      .doc(id)
      .onSnapshot(querysnapshot => {
        if (querysnapshot._exists) {
          let data = querysnapshot.data().places;
          setPredefinedPlaces(data);
        }
      });
  };

  useEffect(() => {
    getPredefinedPlaces();
  }, []);

  return !type ? (
    <GooglePlacesAutocomplete
      placeholder={placeholderText}
      currentLocation={true}
      currentLocationLabel={`Your Location`}
      onPress={onPressAddress}
      fetchDetails={true}
      predefinedPlaces={predefinedPlaces}
      query={{
        key: GoogleMapKey.GOOGLE_MAP_KEY,
        language: 'en',
      }}
      styles={{
        container: styles.containerStyle, // Update container instead of textInputContainer
        textInput: styles.textInputStyle,
        description: { color: 'black' },
      }}
      textInputProps={{
        placeholderTextColor: type && type == 'route' ? Colors.black : Colors.gray,
        multiline: true, // Enable multiline input
        numberOfLines: 3, // Set the number of lines to 2
      }}
    />
  ) : (
    <View style={styles.containerStyle}>
      <TextInput
        editable={false}
        placeholder={placeholderText}
        placeholderTextColor="black"
        style={[styles.textInputStyle]}
        multiline={true}
        numberOfLines={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'white',
    zIndex: 1,
    width: Dimensions.get('window').width,
  },

  textInputStyle: {
    zIndex: 1,
    padding: 5,
    color: Colors.black,
    fontSize: 14,
    borderColor: 'grey',
    borderBottomWidth: 1.2,
    marginVertical: 5,
    minHeight: 50,
    maxHeight:70
  },
});