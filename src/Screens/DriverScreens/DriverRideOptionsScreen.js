import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import CustomButton from '../../Components/CustomButton';

let height = Dimensions.get('window').height;

function DriverRideOption({navigation}) {

  
  const routeToTakesRides = () => {
    navigation.navigate('DriverRoutes', {
      screen: 'DriverHomeScreen',
    });
  };

  const routeToOnTheWay = () => {
    navigation.navigate('DriverRoutes', {
      screen: 'DriverOnTheWayScreen',
    });
  };
  return (
    <View style={{flex: 1, backgroundColor: Colors.white}}>
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
            style={[styles.img, {height: height * 0.2}]}
            resizeMode="contain"
            source={require('../../Assets/Images/askImg.png')}
          />
        </View>
        <View style={styles.bottomContainer}>
          <CustomButton text="On the way" onPress={() => routeToOnTheWay()} />
          <View style={{marginVertical: 10}}></View>
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
