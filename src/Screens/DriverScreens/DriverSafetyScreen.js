import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Colors from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import Icon from 'react-native-vector-icons/Entypo';
import {Linking} from 'react-native';

function DriverSafetyScreen({navigation}) {
  return (
    <View>
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
        <Text style={styles.textHeading}>SAFETY</Text>
        <View style={{marginTop: 10, alignItems: 'center', height: '70%'}}>
          <Image
            source={require('../../Assets/Images/safety.jpg')}
            style={{height: '50%', width: '100%'}}
          />
          <Text
            style={[styles.textHeading, {textAlign: 'center', fontSize: 28}]}>
            Who do you want to Contact?
          </Text>
          <View style={{width: '90%'}}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignSelf: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
              onPress={() => {
                Linking.openURL(`tel:${911}`);
              }}>
              <View style={{flexDirection: 'row'}}>
                <Icon name="phone" color={Colors.secondary} size={30} />
                <Text style={[styles.text, {marginLeft: 10, fontSize: 20}]}>
                  Ambulance
                </Text>
              </View>
              <Icon name="chevron-right" size={30} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
          <View style={{width: '90%', marginTop: 25}}>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(`tel:${911}`);
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignSelf: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}>
              <View style={{flexDirection: 'row'}}>
                <Icon name="phone" color={Colors.secondary} size={30} />
                <Text style={[styles.text, {marginLeft: 10, fontSize: 20}]}>
                  Police
                </Text>
              </View>
              <Icon name="chevron-right" size={30} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default DriverSafetyScreen;

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 1,
    backgroundColor: Colors.fontColor,
  },
  text: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '500',
  },
  textHeading: {
    color: Colors.secondary,
    fontSize: 32,
    fontWeight: '900',
    padding: 20,
  },
});
