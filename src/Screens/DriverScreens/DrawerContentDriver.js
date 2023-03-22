import React, {useState, useEffect} from 'react';
import {Text, StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from '../../Components/CustomButton';
import firestore from '@react-native-firebase/firestore';
import auth, {firebase} from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import Colors from '../../Constants/Colors';
import {Linking} from 'react-native';

export default function DrawerContentDriver({navigation}) {
  const [driverData, setDriverData] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  useEffect(() => {
    const CurrentUser = auth().currentUser.uid;
    const User = firestore()
      .collection('Drivers')
      .doc(CurrentUser)
      .onSnapshot(async documentSnapshot => {
        const GetUserData = documentSnapshot.data();

        if (GetUserData.profilePicture.length) {
          const url = await storage()
            .ref(GetUserData.profilePicture)
            .getDownloadURL();
          setProfilePicUrl(url);
        }

        setDriverData(GetUserData);
      });
    return () => User();
  }, []);
  const passengerModeHandler = async () => {
    try {
      const CurrentUser = auth().currentUser;
      const checkData = firestore()
        .collection('Passengers')
        .doc(CurrentUser.uid)
        .onSnapshot(documentSnapshot => {
          const checkEmpty = documentSnapshot.data();
          if (checkEmpty == null) {
            // setLoading(false)
            navigation.navigate('PassengerDetailScreen', {
              uid: CurrentUser.uid,
            });
          } else {
            // setLoading(false)
            navigation.navigate('PassengerRoutes', {
              screen: 'PassengerHomeScreen',
            });
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <View style={styles.upperContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('DriverDetailsEdit', {
              driverData: driverData,
              profilePicUrl: profilePicUrl,
            });
          }}>
          <Image
            source={
              profilePicUrl
                ? {uri: profilePicUrl}
                : require('../../Assets/Images/dummyPic.png')
            }
            style={styles.proPicStyles}
          />
        </TouchableOpacity>
        <Text style={styles.proName}>
          {driverData.firstName} {driverData.lastName}
        </Text>
      </View>
      <View style={styles.fieldContainer}>
        <View style={styles.fieldItemContainer}>
          <TouchableOpacity
            style={styles.fieldItem}
            onPress={() => {
              navigation.navigate('DriverHomeScreen');
            }}>
            <MaterialCommunityIcons
              name="city"
              size={25}
              color={Colors.white}
            />
            <Text style={styles.fieldItemText}>City</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.fieldItemContainer}>
          <TouchableOpacity
            style={styles.fieldItem}
            onPress={() => {
              navigation.navigate('DriverHistory');
            }}>
            <MaterialCommunityIcons
              name="history"
              size={25}
              color={Colors.white}
            />
            <Text style={styles.fieldItemText}>History</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.fieldItemContainer}>
          <TouchableOpacity
            style={styles.fieldItem}
            onPress={() => {
              navigation.navigate('DriverSafetyScreen');
            }}>
            <MaterialCommunityIcons
              name="security"
              size={25}
              color={Colors.white}
            />
            <Text style={styles.fieldItemText}>Safety</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.fieldItemContainer}>
          <TouchableOpacity
            style={styles.fieldItem}
            onPress={() => {
              navigation.navigate('DriverVehicleEdit', {
                vehicleDetails: driverData.vehicleDetails,
              });
            }}>
            <Ionicons
              name="md-car-sport-sharp"
              size={25}
              color={Colors.white}
            />
            <Text style={styles.fieldItemText}>Vehicle</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.fieldItemContainer}>
          <TouchableOpacity
            style={styles.fieldItem}
            onPress={() => {
              navigation.navigate('SettingsDriver');
            }}>
            <Ionicons name="settings-outline" size={25} color={Colors.white} />
            <Text style={styles.fieldItemText}>Setting</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.fieldItemContainer}>
          <TouchableOpacity
            style={styles.fieldItem}
            onPress={() => {
              navigation.navigate('DriverWalletScreen');
            }}>
            <Ionicons name="wallet" size={25} color={Colors.white} />
            <Text style={styles.fieldItemText}>Wallet</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.fieldItemContainer}>
          <TouchableOpacity style={styles.fieldItem} onPress={()=>navigation.navigate("DriverFAQScreen")} >
            <MaterialCommunityIcons
              name="message-question-outline"
              size={25}
              color={Colors.white}
            />
            <Text style={styles.fieldItemText}>FAQ</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.fieldItemContainer}>
          <TouchableOpacity
            style={styles.fieldItem}
            onPress={() => Linking.openURL('mailto:ultraRydes@example.com')}>
            <MaterialCommunityIcons
              name="headphones"
              size={25}
              color={Colors.white}
            />
            <Text style={styles.fieldItemText}>Support</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.btnContainer}>
          <CustomButton text="Passenger Mode" onPress={passengerModeHandler} />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  btnContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldContainer: {
    flex: 1,
  },
  fieldItemContainer: {
    width: '100%',
    padding: 20,
  },
  fieldItemText: {
    fontSize: 18,
    marginLeft: 20,
    color: Colors.white,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proPicStyles: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  proName: {
    fontFamily: 'Poppins-Medium',
    marginLeft: 20,
    fontSize: 20,
    color: Colors.white,
  },
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.drawerContainerColor,
  },
  upperContainer: {
    width: '100%',
    height: '10%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
});
