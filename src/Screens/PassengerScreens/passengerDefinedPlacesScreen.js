import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ToastAndroid, ActivityIndicator, Dimensions} from 'react-native';
import Colors from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import {useState} from 'react';
import {useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Geocoder from 'react-native-geocoding';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import CustomButton from '../../Components/CustomButton';
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

function PassengerDefinedPlaces({navigation}) {
  const [placesData, setPlaceData] = useState([]);
  const [loading,setLoading] = useState(false)

  const getPlacesData = () => {
    let id = auth().currentUser.uid;
    setLoading(true)
    firestore()
      .collection('AddPlaces')
      .doc(id)
      .onSnapshot(querySnapshot => {
          console.log(querySnapshot,"queer")
          if (querySnapshot._exists) {
              let data = querySnapshot.data().places;
              let myData = [];
          data &&
            data.length > 0 &&
            data.map((e, i) => {
              let {geometry} = e;
              let {location} = geometry;
              myData.push(e)
              Geocoder.init(GoogleMapKey.GOOGLE_MAP_KEY);
              Geocoder.from(location.lat, location.lng)
                .then(json => {
                  var addressPickup = json.results[0].formatted_address;
                  e.address = addressPickup;
                })
                .catch(error => console.warn(error));                
            });
            
            setPlaceData(myData)
            setLoading(false)
        }
      });
      setLoading(false)
  };

  console.log(placesData, 'places  ');

  useEffect(() => {
    getPlacesData()
  }, []);


const deletePlace = (data,index) => {
    setLoading(true)
    let id = auth().currentUser.uid
      console.log(data,"data")
      firestore().collection("AddPlaces").doc(id).get().then(querySnapshot=>{
        let firebaseData = querySnapshot.data().places

       firebaseData =  firebaseData && firebaseData.length>0 && firebaseData.filter((e,i)=>{
          
          return index !== i
        
        })

        let myData = {
         places :  firebaseData
        }

          firestore().collection("AddPlaces").doc(id).set(myData).then((res)=>{
            setPlaceData(placesData && placesData.length>0 && placesData.filter((j,ind)=>{
              return ind !== index
            }))
              ToastAndroid.show("Place Successfully Deleted",ToastAndroid.SHORT)
              setLoading(false)
            }).catch((error)=>{
              setLoading(false)
            console.log(error)
          })
      })

}


const editPlace = (data,index) => {

      navigation.navigate("passengerAddPlacesScreen",{data:data,index:index})

}


  return (
    loading && placesData.length == 0 ?  <>
    <View style={{height:Dimensions.get('window').height,width:"100%",alignItems:"center",justifyContent:"center"}} >
     <ActivityIndicator size="large" color={Colors.secondary} />
     </View>
      </>
    :
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
      <Text style={styles.Heading}>My Places</Text>
      <View style={{alignItems:"center",marginTop:10}} >
      <CustomButton
        text = "Add Places" 
        onPress={()=>navigation.navigate('passengerAddPlacesScreen')}
      />
      </View>
      {placesData && placesData.length > 0 ? (
        <View style={{width:"100%",alignItems:"center",marginTop:20,justifyContent:"center"}} >
          <View  style={{flexDirection:"row",width:"90%",justifyContent:"center",marginBottom:10}} >
                                <Text style={[styles.text,{width:"60%",color:Colors.black,fontWeight:"600",fontSize:18}]} numberOfLines={1} >
                                    Place Name
                                </Text>
                                <View style={{width:"40%",flexDirection:"row",justifyContent:"space-between"}} >
                                <Text style={[styles.text,{color:Colors.black,fontWeight:"600",fontSize:18}]} numberOfLines={1} >
                                    Edit
                                </Text>
                                <Text style={[styles.text,{color:Colors.black,fontWeight:"600",fontSize:18}]} numberOfLines={1} >
                                    Delete
                                </Text>
                                </View>
                        </View>

            {
                placesData && placesData.length>0 && placesData.map((e,i)=>{
                    console.log(e,"eee")
                    return (
                        <View key={i} style={{flexDirection:"row",width:"90%",justifyContent:"center"}} >
                                <Text style={[styles.text,{width:"60%"}]} numberOfLines={1} >
                                    {e?.description}
                                </Text>
                                <View style={{width:"40%",flexDirection:"row",justifyContent:"space-between"}} >
                                    <TouchableOpacity onPress={()=>editPlace(e,i)} >
                                            <Icon name="archive-edit" color={Colors.black} size={30}  />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={()=>deletePlace(e,i)} >
                                            {loading ? <ActivityIndicator size={"large"} color={Colors.secondary} /> : <Icon name="delete" color={Colors.black} size={30}  />}
                                    </TouchableOpacity>
                                </View>
                        </View>
                    )
                })
            }

        </View>
      ) : (
        <View
          style={{
            width: '100%',
            height: '75%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={styles.Heading}>No Places Added Yet</Text>
        </View>
      )}
    </View>
  );
}
export default PassengerDefinedPlaces;

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 1,
    backgroundColor: Colors.fontColor,
  },
  Heading: {
    color: Colors.secondary,
    fontSize: 28,
    fontWeight: '900',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  text: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '500',
    
  },
});