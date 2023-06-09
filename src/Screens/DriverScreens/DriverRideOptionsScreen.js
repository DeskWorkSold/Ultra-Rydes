import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ToastAndroid,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import CustomButton from '../../Components/CustomButton';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

let height = Dimensions.get('window').height;

function DriverRideOption({ navigation }) {


  const getNotificationPermission = async () => {
    let id = auth().currentUser.uid;

    messaging()
      .hasPermission()
      .then(enabled => {
        if (enabled) {

          messaging()
            .getToken()
            .then(fcmToken => {
              if (fcmToken) {
                firestore()
                  .collection('DriverToken')
                  .doc(id)
                  .set({
                    token: fcmToken,
                    id: id,
                    create_date: new Date(),
                  })
                  .then(() => {
                    console.log('token succssfully saved');
                  })
                  .catch(error => {
                    console.log(error);
                  });
              } else {
                console.log("driver doesn't have a device token yet");
              }
            });
        } else {
          console.log('Permission Denied');
          ToastAndroid.show("Notification Permission not satisfied", ToastAndroid.SHORT)
        }
      });
  };

  useEffect(() => {
    getNotificationPermission()
  }, [])



  const routeToTakesRides = () => {

    let id = auth().currentUser.uid


    firestore().collection("Drivers").doc(id).get().then((doc) => {

      let data = doc.data()


      if (data.driverStatus == "pending") {
        ToastAndroid.show("Your documents has not yet verified you will be able to take rides after your document verification", ToastAndroid.SHORT)
      }
      else if (data?.driverStatus == "blocked") {
        ToastAndroid.show("Your account has been blocked by the admin if you don't know the reason kindly contact to admin", ToastAndroid.SHORT)
      } else {
        navigation.navigate('DriverRoutes', {
          screen: 'DriverHomeScreen',
        });
      }
    })
  };

  const routeToOnTheWay = () => {

    let id = auth().currentUser.uid

    firestore().collection("Drivers").doc(id).get().then((doc) => {

      let data = doc.data()

      if (data.driverStatus == "pending") {
        ToastAndroid.show("Your documents has not yet verified you will be able to take rides after your document verification", ToastAndroid.SHORT)
      }
      else if (data?.driverStatus == "blocked") {
        ToastAndroid.show("Your account has been blocked by the admin if you don't know the reason kindly contact to admin", ToastAndroid.SHORT)
      } else {
        navigation.navigate('DriverRoutes', {
          screen: 'DriverOnTheWayScreen',
        });

      }


    })




  };
  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <CustomHeader
        iconname={navigation.canGoBack() ? 'chevron-back-circle' : null}
        color={Colors.fontColor}
        onPress={() => {
          navigation.canGoBack() ? navigation.goBack() : null;
        }}
        source={require('../../Assets/Images/URWhiteLogo.png')}
      />
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Text style={[styles.textStyle]}>
            Which option you want to choose
          </Text>
        </View>
        <View style={styles.midContainer}>
          <Image
            style={[styles.img, { height: height * 0.2 }]}
            resizeMode="contain"
            source={require('../../Assets/Images/askImg.png')}
          />
        </View>
        <View style={styles.bottomContainer}>
          <CustomButton text="On the way" onPress={() => routeToOnTheWay()} />
          <View style={{ marginVertical: 10 }}></View>
          <CustomButton
            text="Take Rides"
            bgColor
            onPress={() => routeToTakesRides()}
          />
        </View>
      </View>
    </View>
  );
}

export default DriverRideOption;

const styles = StyleSheet.create({
  bottomContainer: {
    alignItems: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  img: {
    width: '100%',
  },
  midContainer: {
    alignItems: 'center',
    width: '100%',
  },
  topContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  textStyle: {
    fontSize: 20,
    margin: 10,
    color: Colors.fontColor,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    maxWidth: '50%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.secondary,
    height: '40%',
    width: '80%',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '90%',
    color: 'white',
    borderWidth: 1,
    borderColor: 'white',
    position: 'absolute',
    bottom: 20,
  },
  buttonOpen: {
    backgroundColor: '#white',
  },

  textStyle1: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '800',
    color: 'white',
  },
});
