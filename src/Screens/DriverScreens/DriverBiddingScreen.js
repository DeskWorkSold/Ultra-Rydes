import React, { useState, useRef, useEffect } from 'react'
import { Text, View, StyleSheet, Dimensions, FlatList, Touchable, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView, TextInput } from 'react-native'
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import AddressPickup from '../../Components/AddressPickup';
import CustomButton from '../../Components/CustomButton';
import { locationPermission, getCurrentLocation } from '../../Helper/HelperFunction';
import Geocoder from 'react-native-geocoding';
// import { TextInput } from 'react-native-paper';

export default function DriverBiddingScreen({ navigation, route }) {




    
    const { passengerState } = route.params;
    
    useEffect(() => {
        gettingFormattedAddress();
    }, [passengerState])

    console.log(passengerState,"passenger")

    const gettingFormattedAddress = () => {
        Geocoder.init(GoogleMapKey.GOOGLE_MAP_KEY);
        Geocoder.from(passengerState.pickupCords.latitude, passengerState.pickupCords.longitude)
            .then(json => {
                var addressPickup = json.results[0].formatted_address;
                setpickUpLocation(addressPickup);
            })
            .catch(error => console.warn(error));
        Geocoder.from(passengerState.dropLocationCords.latitude, passengerState.dropLocationCords.longitude)
            .then(json => {
                var addressDropOff = json.results[0].formatted_address;
                setdropOffLocation(addressDropOff);
            })
            .catch(error => console.warn(error));
    }


    console.log(pickUpLocation,"pickup")
    console.log(dropOffLocation,"dropoFF")
    

    const [pickUpLocation, setpickUpLocation] = useState('')
    const [dropOffLocation, setdropOffLocation] = useState('')
    const screen = Dimensions.get('window');
    const ASPECT_RATIO = screen.width / screen.height;
    const LATITUDE_DELTA = 0.04;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
    const [state, setState] = useState({
        pickupCords: passengerState.pickupCords,
        dropLocationCords: passengerState.dropLocationCords,
    });
    const { pickupCords, dropLocationCords } = state;

    const sendRequest = () => {
        console.log('Request Sent');

    }
    const mapRef = useRef();


    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <CustomHeader iconname={'menu'} color={Colors.white} onPress={() => { navigation.toggleDrawer(); }}
                    source={require('../../Assets/Images/URWhiteLogo.png')}
                />
            </View>
            <View style={styles.mapContainer}>
                {state.pickupCords && (
                    <MapView
                        ref={mapRef}
                        style={StyleSheet.absoluteFill}
                        initialRegion={{
                            ...pickupCords,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA,
                        }}
                    >
                        <Marker
                            coordinate={pickupCords}
                        />
                        {/* <Marker
                        coordinate={dropLocationCords}
                    /> */}
                        {Object.keys(dropLocationCords).length > 0 && (
                            
                            <Marker
                                coordinate={dropLocationCords}
                            // image={ImagePath.isGreenMarker}
                            />
                        )}
                        {Object.keys(dropLocationCords).length > 0 && (<MapViewDirections
                            origin={pickupCords}
                            destination={dropLocationCords}
                            apikey={GoogleMapKey.GOOGLE_MAP_KEY}
                            strokeColor={Colors.black}
                            strokeWidth={3}
                            optimizeWayPoints={true}
                            onReady={result => {
                                mapRef.current.fitToCoordinates(result.coordinates, {
                                    edgePadding: {
                                        right: 30,
                                        bottom: 100,
                                        left: 30,
                                        top: 100
                                    }
                                })
                            }}
                        />)}
                    </MapView>)}
            </View>
            <View style={styles.bottomCard}>
                <KeyboardAvoidingView>
                    <ScrollView
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                    >
                        <KeyboardAvoidingView>
                            {/* <ScrollView
                                    nestedScrollEnabled={true}
                                    keyboardShouldPersistTaps="handled"
                                > */}
                            <TextInput
                                placeholder='PickUp Location'
                                placeholderTextColor={Colors.gray}
                                value={pickUpLocation}
                                onChangeText={setpickUpLocation}
                                selectionColor={Colors.black}
                                activeUnderlineColor={Colors.gray}
                                style={styles.textInputStyle}
                                editable={false}
                            />
                            <TextInput
                                placeholder='Destination Location'
                                placeholderTextColor={Colors.gray}
                                value={dropOffLocation}
                                onChangeText={setdropOffLocation}
                                selectionColor={Colors.black}
                                activeUnderlineColor={Colors.gray}
                                style={styles.textInputStyle}
                                editable={false}
                            />

                            {/* </ScrollView> */}
                            <View style={styles.btnContainer}>
                                <CustomButton text="Request" onPress={sendRequest} />
                            </View>
                        </KeyboardAvoidingView>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    btnContainer: {
        marginTop: 5,
        width: '100%',
        alignItems: 'center'//
    },
    bottomCard: {
        width: '100%',
        padding: 20,
        backgroundColor: Colors.white,
        elevation: 20,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20//
    },
    container: {
        flex: 1,//
    },
    headerContainer: {
        zIndex: 1,
        backgroundColor: Colors.fontColor//
    },
    mapContainer: {
        flex: 1//
    },
    textInputStyle: {
        zIndex: 1,
        width: '100%',
        color: Colors.black,
        fontSize: 14,
        backgroundColor: 'white',
        borderColor: 'grey',
        borderBottomWidth: 1,
        paddingLeft: 10//
    },
})