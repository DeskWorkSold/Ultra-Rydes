import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import COLORS from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import {Colors} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

function DriverRulesAndTerms({navigation}) {
  return (
    <View>
      <View style={styles.headerContainer}>
        <CustomHeader
          iconname={'menu'}
          color={COLORS.white}
          onPress={() => {
            navigation.toggleDrawer();
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
              'driverRulesAndTermsDetailScreen',
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
              'driverRulesAndTermsDetailScreen',
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
              'driverRulesAndTermsDetailScreen',
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

export default DriverRulesAndTerms;

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
