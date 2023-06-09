import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useLayoutEffect, useState } from 'react'
import { Avatar } from '@rneui/themed'
import { TouchableOpacity } from 'react-native'
import {AntDesign, FontAwesome, Ionicons} from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import * as firebase from 'firebase/compat';
import { db, auth } from "../firebase"




const ChatScreen = ({navigation, route}) => {
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'chat',
      headerTitleAlign: 'left',
      headerTitle: () => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Avatar rounded source={{uri: messages[0]?.data.photoURL ||
            "https://i.ibb.co/fQkwn3m/user-1.png" }} />
          <Text
            style={{color: "white", marginLeft: 10, fontWeight: "700"}}
          >
            {route.params.chatName}
          </Text>
        </View>
      ),
      headerRight: () => (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: "space-between",
            width: 70,
            marginRight: 8,
          }}
        >
          <TouchableOpacity>
            <FontAwesome name='video-camera' size={24} color="white"/>
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name='call' size={24} color="white"/>
          </TouchableOpacity>
        </View>
      )
    })
  }, [navigation, messages])

  const sendMessage = () => {
    Keyboard.dismiss();

    db.collection('chats').doc(route.params.id).collection('messages').add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      message: input,
      displayName: auth.currentUser.displayName,
      email: auth.currentUser.email,
      photoURL: auth.currentUser.photoURL
    })

    setInput('')
  }


  useLayoutEffect(() => {
    const unsubscribe = db.collection('chats').doc(route.params.id)
    .collection('messages').orderBy('timestamp').onSnapshot((snapshot) => 
      setMessages(
        snapshot.docs.map( doc => ({
          id: doc.id,
          data: doc.data()
        })) 
      )
    );

    return unsubscribe;
  }, [route])


  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <StatusBar style='light' />

      <View
        // behavior={Platform.OS === 'ios' ? 'padding':'height'}
        // keyboardVerticalOffset={90}   // for keyboardAvoidingView
        style={styles.container}
      >
        <>
          <ScrollView contentContainerStyle={{ paddingTop: 15 }}>
             {/* Chat goes here */}
             {messages.map(({id, data}) => (
               data.email === auth.currentUser.email ? (
                  <View key={id} style={styles.reciever} >
                    <Avatar 
                      rounded
                      size={30}
                      position="absolute"
                      bottom={-15}
                      right={-5}

                      // For WEB
                        containerStyle={{
                          position: "absolute",
                          bottom: -15,
                          right: -5
                        }}
                      // ---

                      source={{
                        uri: data.photoURL,
                      }}
                    />
                    <Text style={styles.recieverText} >{data.message}</Text>
                  </View>
               ) : (
                  <View key={id} style={styles.sender} >
                    <Avatar 
                      rounded
                      size={30}
                      position="absolute"
                      bottom={-15}
                      left={-5}

                      // For WEB
                        containerStyle={{
                          position: "absolute",
                          bottom: -15,
                          right: -5
                        }}
                      // ---

                      source={{
                        uri: data.photoURL,
                      }}
                    />
                    <Text style={styles.senderText} >{data.message}</Text>
                    <Text style={styles.senderName} >{data.displayName}</Text>
                  </View>
               )
             ))}
          </ScrollView>
          <View style={styles.footer}>
            <TextInput
              placeholder='Signal Message'
              style={styles.textInput}
              value={input}
              onChangeText={(text) => setInput(text)}
              onSubmitEditing={sendMessage}
            />

            <TouchableOpacity onPress={sendMessage} activeOpacity={0.5}>
              <Ionicons name='send' size={24} color="#2B68E6" />
            </TouchableOpacity>
          </View>

        </>
      </View>

    </View>
  )
}

export default ChatScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reciever: {
    padding: 15,
    backgroundColor: "#ECECEC",
    alignSelf: "flex-end",
    borderRadius: 20,
    marginRight: 15,
    marginBottom: 20,
    maxWidth: "80%",
    position: "relative",
  },
  recieverText: {
    color: "black",
    fontWeight: 500,
    marginLeft: 10,
  },
  sender: {
    padding: 15,
    backgroundColor: "#2B68E6",
    alignSelf: "flex-start",
    borderRadius: 20,
    margin: 15,
    maxWidth: "80%",
    position: "relative",
  },
  senderText: {
    color: "white",
    fontWeight: 500,
    marginLeft: 10,
    marginBottom: 15, 
  },
  senderName: {
    left: 10,
    paddingRight: 10,
    fontSize: 10,
    color: 'white'
  },
  footer: {
    flexDirection: 'row',
    alignItems: "center",
    width: "100%",
    padding: 15,
  },
  textInput: {
    bottom: 0,
    backgroundColor: '#ECECEC',
    color: 'grey',
    padding: 10,
    borderRadius: 30,
    height: 40,
    flex: 1,
    marginRight: 15,
    borderColor: 'transparent',
    borderWidth: 1,
  }
})