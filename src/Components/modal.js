import React, {useState} from 'react';
import {Alert, Modal, StyleSheet, Text, Pressable, View, TouchableOpacity} from 'react-native';

const AppModal = (Prop) => {

    const {modalVisible,close,fare,confirm} = Prop
    
    const [selected,setSelected] = useState({
        bidWithMinimumDeduction : false,
        bidWithMidDeduction : false,
        bidWithMaximumDeduction : false
    })

    const {bidWithMaximumDeduction,bidWithMidDeduction,bidWithMinimumDeduction} = selected

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
            close()
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{flexDirection:"row",justifyContent:"space-around",width:"100%",marginBottom:20,alignItems:"center"}} >
                <TouchableOpacity onPress={() => setSelected({...selected,bidWithMinimumDeduction:selected.bidWithMinimumDeduction?false:true,bidWithMaximumDeduction:false,bidWithMidDeduction:false}) } style={{borderWidth:1,borderColor:"white",borderRadius:10,padding:20,paddingHorizontal:10,backgroundColor:selected.bidWithMinimumDeduction? "green" : "white",width:"30%"}} >
                    <Text style={{color:"black",fontSize:18,fontWeight:"600",textAlign:"center"}} >
                        {(fare * (97/100)).toFixed(2)}$
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelected({...selected,bidWithMidDeduction:selected.bidWithMidDeduction?false:true,bidWithMaximumDeduction:false,bidWithMinimumDeduction:false  }) }  style={{borderWidth:1,borderColor:"white",borderRadius:10,padding:20,paddingHorizontal:10,backgroundColor:selected.bidWithMidDeduction? "green" : "white",width:"30%"}} >
                    <Text style={{color:"black",fontSize:18,fontWeight:"600"}} >
                        {(fare * (94/100)).toFixed(2)}$
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelected({...selected,bidWithMaximumDeduction:selected.bidWithMaximumDeduction?false:true,bidWithMidDeduction:false,bidWithMinimumDeduction:false}) } style={{borderWidth:1,borderColor:"white",borderRadius:10,padding:20,paddingHorizontal:10,backgroundColor:selected.bidWithMaximumDeduction? "green" : "white",width:"30%"}} >
                    <Text style={{color:"black",fontSize:18,fontWeight:"600"}} >
                        {(fare * (90/100)).toFixed(2)}$
                    </Text>
                </TouchableOpacity>
                </View>
           
          <Pressable
              style={[styles.buttonClose,styles.button,{padding:15}]}
              onPress={()=>confirm(selected)}
              
              
              >
              <Text style={[styles.textStyle]}>Confirm Bid Fare</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'black',
    borderRadius: 20,
    width:"85%",
    padding: 35,
    paddingHorizontal:20,
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
    borderRadius: 15,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    width:"70%",
    padding:15
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default AppModal;