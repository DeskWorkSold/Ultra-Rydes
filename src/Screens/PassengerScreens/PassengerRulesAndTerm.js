import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import COLORS from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import {Colors} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

function PassengerRulesAndTerms({}) {

  const navigation = useNavigation()

  return (
    <View>
      <View style={styles.headerContainer}>
        <CustomHeader
          iconname={'arrow-back'}
          color={COLORS.white}
          onPress={() => {
            navigation.goBack();
          }}
          source={require('../../Assets/Images/URWhiteLogo.png')}
        />
      </View>
      <Text style={styles.heading}>Rules and terms</Text>
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'passengerRulesAndTermsDetailScreen',
              'Service Rules',
            )
          }>
          <Text style={styles.text}>Service rules</Text>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'passengerRulesAndTermsDetailScreen',
              'Terms and Conditions',
            )
          }>
          <Text style={styles.text}>Terms and conditions</Text>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'passengerRulesAndTermsDetailScreen',
              'Privacy Policy',
            )
          }>
          <Text style={styles.text}>Privacy Policy</Text>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default PassengerRulesAndTerms;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    height: '100%',
  },
  headerContainer: {
    backgroundColor: COLORS.secondary,
    zIndex: 1,
  },
  heading: {
    color: COLORS.black,
    fontSize: 28,
    padding: 20,
  },
  button: {
    backgroundColor: COLORS.white,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: COLORS.gray,
    borderBottomWidth: 1,
  },
  text: {
    color: Colors.black,
    fontSize: 18,
  },
});
