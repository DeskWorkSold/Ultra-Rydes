import React, {useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from '../../Components/CustomButton';
import Colors from '../../Constants/Colors';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {Linking} from 'react-native';

export default function DrawerContentPassenger({navigation}) {
  const [passengerData, setPassengerData] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const CurrentUser = auth().currentUser.uid;
    const User = firestore()
      .collection('Passengers')
      .doc(CurrentUser)
      .onSnapshot(async documentSnapshot => {
        const GetUserData = documentSnapshot.data();

        if (GetUserData.profilePicture.length) {
          const url = await storage()
            .ref(GetUserData.profilePicture)
            .getDownloadURL();
          setProfilePicUrl(url);
        }

        setPassengerData(GetUserData);
        setLoading(false);
      });
    return () => User();
  }, []);

  const switchToDriverHandler = async () => {
    try {
      setLoading(true);
      const CurrentUser = auth().currentUser;
      const checkData = firestore()
        .collection('Drivers')
        .doc(CurrentUser.uid)
        .onSnapshot(documentSnapshot => {
          const checkEmpty = documentSnapshot.data();
          if (checkEmpty == null) {
            setLoading(false);
            navigation.navigate('DriverDetailScreen', {uid: CurrentUser.uid});
          } else if (!checkEmpty.vehicleDetails) {
            setLoading(false);
            navigation.navigate('DriverRoutes', {screen: 'DriverVehicleAdd'});
          } else {
            setLoading(false);
            navigation.navigate('DriverRoutes', {screen: 'DriverHomeScreen'});
          }
        });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      {loading ? (
        <View style={styles.activityIndicatorStyles}>
          <ActivityIndicator size="large" color={Colors.fontColor} />
        </View>
      ) : (
        <>
          <View style={styles.rootContainer}>
            <View style={styles.upperContainer}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('PassengerDetailsEdit', {
                    passengerData: passengerData,
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
                {passengerData.firstName} {passengerData.lastName}
              </Text>
            </View>
            <View style={styles.fieldContainer}>
              <View style={styles.fieldItemContainer}>
                <TouchableOpacity
                  style={styles.fieldItem}
                  onPress={() => {
                    navigation.navigate('PassengerHomeScreen');
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
                  onPress={() => {
                    navigation.navigate('PassengerHistory');
                  }}
                  style={styles.fieldItem}>
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
                    navigation.navigate('PassengerSafetyScreen');
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
                    navigation.navigate('PassengerWalletScreen');
                  }}>
                  <MaterialCommunityIcons
                    name="wallet"
                    size={25}
                    color={Colors.white}
                  />
                  <Text style={styles.fieldItemText}>Wallet</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.fieldItemContainer}>
                <TouchableOpacity
                  style={styles.fieldItem}
                  onPress={() => {
                    navigation.navigate('SettingsPassenger');
                  }}>
                  <Ionicons
                    name="settings-outline"
                    size={25}
                    color={Colors.white}
                  />
                  <Text style={styles.fieldItemText}>Setting</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.fieldItemContainer}>
                <TouchableOpacity
                  style={styles.fieldItem}
                  onPress={() => navigation.navigate('PassengerFAQScreen')}>
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
                  onPress={() =>
                    Linking.openURL('mailto:ultraRydes@example.com')
                  }>
                  <MaterialCommunityIcons
                    name="headphones"
                    size={25}
                    color={Colors.white}
                  />
                  <Text style={styles.fieldItemText}>Support</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.btnContainer}>
                <CustomButton
                  text="Driver Mode"
                  onPress={switchToDriverHandler}
                />
              </View>
            </View>
          </View>
        </>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  activityIndicatorStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
