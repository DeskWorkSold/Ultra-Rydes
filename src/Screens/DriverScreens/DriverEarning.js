import React from 'react';
import {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Colors from '../../Constants/Colors';
import Icon from 'react-native-vector-icons/AntDesign';
import CustomHeader from '../../Components/CustomHeader';
import {FlatList} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
function DriverEarningScreen({route, navigation}) {
  const [allWalletData, setAllWalletData] = useState(true);
  const [allMonthlyData,setAllMonthlyData] = useState(false)

  let data = route.params.data;

  let {allData, monthlyData,todayData} = data;


  const getSortedDetails = () => {


    if (allWalletData) {
      setAllWalletData(false)
      setAllMonthlyData(true)
      return
    }

    if (allMonthlyData) {
      setAllMonthlyData(false)
      return
    }

    if (!allMonthlyData) {
      setAllWalletData(true)
    }



  }


  const renderDepositData = ({item, index}) => {
    let date = item.date.toDate().toString().slice(0, 15);

    if ((item && item.fare) || item.tip || item?.toll) {
      return (
        <View>
          <TouchableOpacity
            style={{
              alignItems: 'flex-start',
              width: '100%',
              paddingHorizontal: 30,
              paddingVertical: 5,
              borderBottomWidth: 1,
              borderColor: Colors.primary,
            }}
          >
            {/* Date is mentioned Here */}
            <Text style={[styles.text, {marginTop: 5}]}>{date}</Text>
            <Text
              style={[
                styles.text,
                {paddingTop: 5, marginBottom: 5, fontSize: 14},
              ]}
            >
              Earning:
              <Text style={{color: Colors.secondary}}> ${item.fare} </Text>
            </Text>
            <Text
              style={[
                styles.text,
                {paddingTop: 5, marginBottom: 5, fontSize: 14},
              ]}
            >
              Tip from Customer:
              <Text style={{color: Colors.secondary}}>
                {' '}
                ${item?.tip ? (Number(item?.tip)).toFixed(2) : 0}{' '}
              </Text>
            </Text>
            <Text
              style={[
                styles.text,
                {paddingTop: 5, marginBottom: 5, fontSize: 14},
              ]}
            >
              Toll:
              <Text style={{color: Colors.secondary}}>
                {' '}
                ${item?.toll ? item?.toll : 0}{' '}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View>
      <ScrollView>
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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              borderBottomColor: Colors.black,
              borderBottomWidth: 3,
            }}
          >
            <Text
              style={{
                color: Colors.secondary,
                fontSize: 32,
                padding: 20,
                fontWeight: '600',
              }}
            >
              Earnings Details
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => getSortedDetails()}
            >
              <Text
                style={{
                  color: Colors.black,
                  paddingRight: 5,
                }}
              >
                {allWalletData ? 'All Data' : allMonthlyData ? 'This Month'  : "Today"}
              </Text>
              <TouchableOpacity>
                <Icon name="down" color={Colors.secondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
          <FlatList
            data={allWalletData ? allData : allMonthlyData ? monthlyData : todayData}
            renderItem={renderDepositData}
            keyExtractor={(item, i) => i}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export default DriverEarningScreen;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.secondary,
    zIndex: 1,
  },
  Heading: {
    color: Colors.secondary,
    fontSize: 28,
    fontWeight: '900',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  text: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
