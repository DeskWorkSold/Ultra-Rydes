import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import COLORS from '../../Constants/Colors';
import RulesAndTerms from '../../Helper/driverRulesAndTermsContent';

function DriverRulesAndTermsDetail({navigation, route}) {
  let data = route.params;

  console.log(data, 'dataaaa');
  console.log(RulesAndTerms, 'driver');

  return (
    <View>
      <ScrollView>
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
        <Text style={styles.heading}>{data.toUpperCase()}</Text>
        <Text style={[styles.text]}>
          {data == 'Service Rules'
            ? RulesAndTerms.serviceRules
            : data == 'Terms and Conditions'
            ? RulesAndTerms.termsAndConditions
            : RulesAndTerms.privacyPolicy}
        </Text>
      </ScrollView>
    </View>
  );
}

export default DriverRulesAndTermsDetail;

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
    fontSize: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    fontWeight: '800',
  },
  text: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '600',
    padding: 20,
  },
});
