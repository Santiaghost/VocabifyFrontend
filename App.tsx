import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Pressable } from 'react-native';
import Login from './src/users/Login'
import Register from './src/users/Register';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainScreen from './src/mainScreen/MainScreen';
import axios from 'axios';
import config from "./config/appConfig.json"
import Config from 'react-native-config';


const App = () => {
  const [modalLogin, setModalLogin] = useState(false)
  const [modalRegister, setModalRegister] = useState(false)
  const [modalLogged, setModalLogged] = useState(false)
  const [token, setToken] = useState<string|null>(null)
  const [tokenAPI, setTokenAPI] = useState<string|null>(null)
  const [recargarComponente, setRecargarComponente] = useState(false)


  const saveAPIToken = async (apiToken : any) =>{
    AsyncStorage.setItem('tokenAPI', JSON.stringify(apiToken))
  }
  const deleteAPIToken = async () =>{
      AsyncStorage.removeItem('tokenAPI')
  }


  useEffect(() => {
     recuperarTokenAPI()
     recuperarTokenUsuario()
  },[recargarComponente])

  const recuperarTokenUsuario = async() =>{
    const usuario = await AsyncStorage.getItem('tokenUsuario');
    if(usuario !=null){
      var tokUser = usuario.replace(/"/g, '')
      setToken(tokUser)
      const apiToken = await AsyncStorage.getItem('tokenAPI');
      if(apiToken != null){
        var tokAPI = apiToken.replace(/"/g, '')
        console.log(tokAPI)
        setTokenAPI(tokAPI)
      }
      setModalLogged(true)
    }
    
  }


  const recuperarTokenAPI = async() =>{
    var url = config.API_APP + config.API_CONTROLLER_PATH + config.LOGIN_PATH
    console.log(Config.REACT_APP_API_USERNAME)
    var data = {
      username : config.API_USERNAME ,
      password : config.API_PASSWORD
    }
    axios.post(url,data).then((response) =>{
      if(response.status == 200){
        setTokenAPI(response.data)
        saveAPIToken(response.data)
      }
    });
    
    
  }


  function alert(arg0: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/images/idiomas.jpg')}
        style={styles.logo}
      />
      <Text style={styles.welcomeText}>Vocabify</Text>
      <TouchableOpacity onPress={() => setModalLogin(true)} style={styles.loginButton}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>¿No tienes cuenta? </Text>
        <Pressable style={styles.signupPressable} onPress={() => setModalRegister(true)}>
          <Text style={styles.signupLink}>Cree una aquí</Text>
        </Pressable>
      </View>

      <Login
        modalLogin = {modalLogin}
        setModalLogin = {setModalLogin}
        tokenAPI = {tokenAPI}
        setTokenAPI = {setTokenAPI}
      />
      <Register
        modalRegister = {modalRegister}
        setModalRegister = {setModalRegister}
        tokenAPI = {tokenAPI}
        setTokenAPI = {setTokenAPI}
      />
      <MainScreen
          modalLogged = {modalLogged}
          setModalLogged = {setModalLogged}
          token = {token}
          setToken = {setToken}
          tokenAPI = {tokenAPI}
          setTokenAPI = {setTokenAPI}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CFF1E2',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: -20,
    backgroundColor: 'transparent',
    padding: 10,
  },
  backButtonText: {
    fontSize: 40,
    color: 'black', 
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
  },
  signupText: {
    fontSize: 14,
    marginRight: 5,
  },
  signupPressable: {
    alignItems: 'center',
  },
  signupLink: {
    color: 'blue',
  },
  backButtonImage: {
    width: 60,
    height: 60,
  },
});

export default App;
