import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import COLORS from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import {Colors} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

function DriverFAQ({navigation}) {
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
            navigation.navigate('driverFaqDetail', 'How to use the app')
          }
        >
          <Text style={styles.text}>How to use the app</Text>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'driverFaqDetail',
              'Complete the trip',
            )
          }
        >
          <Text style={styles.text}>Complete the trip</Text>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('driverFaqDetail', 'How to Complain')
          }
        >
          <Text style={styles.text}>How to Complain</Text>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'driverFaqDetail',
              'Benefit Of Using',
            )
          }
        >
          <Text style={styles.text}>Benefit of using</Text>
          <Icon name="right" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'driverFaqDetail',
              'Feature of the app',
            )
          }
        >
          <Text style={styles.text}>Feature of the app</Text>
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

export default DriverFAQ;

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