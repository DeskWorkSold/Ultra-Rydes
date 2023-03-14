import React from 'react';
import {View, Text, StyleSheet,TouchableOpacity} from 'react-native';
import Colors from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import Icon from 'react-native-vector-icons/AntDesign';

function PassengerLanguageScreen({route, navigation}) {
  return (
    <View>
      <View style={styles.headerContainer}>
        <CustomHeader
          iconname={'arrow-back'}
          color={Colors.white}
          onPress={() => {
            navigation.goBack();
          }}
          source={require('../../Assets/Images/URWhiteLogo.png')}
        />
      </View>
          <View>
      <Text style={styles.heading}>
      Languages
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('passengerLanguageScreen')}
        style={[styles.button,{alignItems:"center"}]}
      >
        <View>
          <Text style={styles.text}>English</Text>
          <Text style={[styles.text, {fontSize: 14, color: Colors.gray}]}>
            Default Language
          </Text>
        </View>
        <Icon name="right" size={20} color={Colors.black} />
      </TouchableOpacity>
    </View>


          <Text style={[styles.text,{marginTop:20,fontSize:16,padding:20,textAlign:"center",}]} >
                We are soon going to launch our app in other languages as well... 
          </Text>

    </View>
  );
}

export default PassengerLanguageScreen;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.secondary,
    zIndex: 1,
  },
  heading: {
    color: Colors.secondary,
    fontSize: 28,
    padding: 20,
  },
  button: {
    backgroundColor: Colors.white,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: Colors.gray,
    borderBottomWidth: 1,
    marginTop: 10,
  },
  text: {
    color: Colors.black,
    fontSize: 18,
  },
});