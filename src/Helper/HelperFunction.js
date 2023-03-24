import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import messaging from "@react-native-firebase/messaging"
export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const cords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading,
        };
        console;
        resolve(cords);
      },
      error => {
        reject(error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  });

export const locationPermission = () =>
  new Promise(async (resolve, reject) => {
    if (Platform.OS === 'ios') {
      try {
        const permissionStatus = await Geolocation.requestAuthorization(
          'whenInUse',
        );
        if (permissionStatus === 'granted') {
          return resolve('granted');
        }
        reject('Permission not granted');
      } catch (error) {
        return reject(error);
      }
    }
    return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    )
      .then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          resolve('granted');
        }
        return reject('Location Permission denied');
      })
      .catch(error => {
        console.log('Ask Location permission error: ', error);
        return reject(error);
      });
  });


export const NotificationPermission = (()=>{

  new Promise (async (resolve,reject)=>{

    // const authStatus = await messaging().requestPermission();
    // const enabled =
    //   authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //   authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    // if (enabled) {
    //   resolve(enabled)
    // }else{
    //   reject("errorr")
    // }

    
// messaging().requestPermission().then(() => {
//   return messaging().getToken();
// }).then((deviceToken) => {
//   resolve(deviceToken)
//   // Use deviceToken for push notifications
// }).catch((error) => {
//   reject(error)
// });



    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      {
        title: 'App Notification Permission',
        message:
          'Allow App to send notifications',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // User has accepted permission to receive push notifications
        // Get the device registration token
        const registrationToken = await messaging().getToken();
        console.log('FCM Registration Token:', registrationToken);
        resolve(registrationToken)
      } else {
        // User has rejected permission to receive push notifications
        console.log('User rejected permission to receive push notifications');
        reject("User reject permission")
      }
    


  })


})