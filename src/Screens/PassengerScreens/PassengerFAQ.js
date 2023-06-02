import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import COLORS from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import {Colors} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

function PassengerFAQ({navigation}) {
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
      <Text style={styles.heading}>Help</Text>
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('passengerFaqDetail', 'driver Do not Respond')
          }
        >
          <Text style={styles.text}>Driver do not respond</Text>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'passengerFaqDetail',
              'How To Leave A Review for a driver',
            )
          }
        >
          <Text style={styles.text}>How to leave a review for a driver</Text>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('passengerFaqDetail', 'How to Complain')
          }
        >
          <Text style={styles.text}>How to Complain</Text>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'passengerFaqDetail',
              'How to find belonging I left behind',
            )
          }
        >
          <Text style={styles.text}>How to find belongings I left behind</Text>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>
      <Text style={styles.heading}>Feedback</Text>

      <TouchableOpacity
        style={[
          styles.button,
          {justifyContent: 'flex-start', width: '100%', alignItems: 'center'},
        ]}
        onPress={() => Linking.openURL('mailto:ultraRydes@gmail.com')}
      >
        <MaterialIcon name="email" size={20} color={COLORS.black} />
        <Text style={[styles.text, {marginLeft: 10}]}>Write to email</Text>
      </TouchableOpacity>
    </View>
  );
}

export default PassengerFAQ;

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