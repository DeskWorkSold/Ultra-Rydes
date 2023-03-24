import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {StackActions, useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import COLORS from '../../Constants/Colors';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/AntDesign';
export default function SettingsPassenger() {
  

  const [DriverData, setDriverData] = useState({});

  const navigation = useNavigation()

  useEffect(() => {
    let id = auth().currentUser.uid;

    firestore()
      .collection('Drivers')
      .doc(id)
      .onSnapshot(querySnapshot => {
        let data = querySnapshot.data();

        setDriverData(data);
      });
  }, []);

  const signOutHandler = async () => {
    await auth()
      .signOut()
      .then(() =>
        navigation.dispatch(StackActions.replace('GetStartedScreen')),
      );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CustomHeader
          iconname={'menu'}
          color={Colors.white}
          onPress={() => {
            navigation.toggleDrawer();
          }}
          source={require('../../Assets/Images/URWhiteLogo.png')}
        />
      </View>
      <View>
        <Text style={styles.heading}>Settings</Text>
      </View>
      <View style={styles.fieldItemContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            Alert.alert('', 'Do you want to use a new phone number', [
              {
                text: 'Cancel',
                onPress: () => console.log('cancel pressed'),
                style: 'cancel',
              },
              {
                text: 'Ok',
                onPress: () =>
                  navigation.navigate(
                    'driverPhoneNumberChangeScreen',
                    DriverData,
                  ),
              },
            ])
          }>
          <View>
            <Text style={styles.text}>Phone Number</Text>
            <Text style={[styles.text, {fontSize: 14, color: COLORS.gray}]}>
              {DriverData.phoneNumber}
            </Text>
          </View>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('passengerLanguageScreen')}
          style={styles.button}>
          <View>
            <Text style={styles.text}>Language</Text>
            <Text style={[styles.text, {fontSize: 14, color: Colors.gray}]}>
              Default Language
            </Text>
          </View>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('driverRulesAndTermsScreen')}>
          <View>
            <Text style={styles.text}> Rules and Terms </Text>
          </View>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {justifyContent: 'flex-start'}]}
          onPress={signOutHandler}>
          <MaterialCommunityIcons
            name="logout"
            size={25}
            color={Colors.secondary}
          />
          <Text
            style={[
              styles.fieldItemText,
              {color: COLORS.secondary, fontWeight: '600', fontSize: 22},
            ]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  fieldItemContainer: {
    width: '100%',
    marginTop: 20,
  },
  fieldItemText: {
    fontSize: 18,
    marginLeft: 10,
    color: Colors.black,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContainer: {
    zIndex: 1,
    backgroundColor: Colors.fontColor,
  },
  heading: {
    color: COLORS.secondary,
    fontSize: 28,
    padding: 20,
  },
  button: {
    backgroundColor: COLORS.white,
    padding: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  text: {
    color: Colors.black,
    fontSize: 18,
  },
});
