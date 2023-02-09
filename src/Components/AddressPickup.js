import { computeDestinationPoint } from 'geolib';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { ColorSpace } from 'react-native-reanimated';
import Colors from '../Constants/Colors';
import GoogleMapKey from '../Constants/GoogleMapKey';

export default function AddressPickup({
    placeholderText,
    fetchAddress,
}) {

    
    const onPressAddress = (data, details) => {
        
        const lat = details.geometry.location.lat;
        const lng = details.geometry.location.lng;
        console.log(details.formatted_address);
        
        fetchAddress(lat, lng);
    };


    

    return (
        <GooglePlacesAutocomplete
            placeholder={placeholderText}
            onPress={onPressAddress}
            fetchDetails={true}
            query={{
                key: GoogleMapKey.GOOGLE_MAP_KEY,
                language: 'en',
                // components: 'country:pak',
            }}
            styles={{
                textInputContainer: styles.containerStyle,
                textInput: styles.textInputStyle,
                description: { color: 'black' }
            }}
            textInputProps={{
                placeholderTextColor: Colors.gray,
            }}

        />
    );
}
const styles = StyleSheet.create({
    containerStyle: {
        backgroundColor: 'white',
        zIndex: 1
    },

    textInputStyle: {
        zIndex: 1,
        width: '100%',
        padding: 5,
        color: Colors.black,
        fontSize: 14,
        // backgroundColor: 'white',
        borderColor: 'grey',
        borderBottomWidth: 1.2,
        marginVertical: 5,
        // paddingHorizontal: 20,
    },
});