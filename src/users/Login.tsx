import React, { useState } from "react"
import config from "../../config/appConfig.json"
import axios from 'axios';
import MainScreen from "../mainScreen/MainScreen";
import {
    Button,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Pressable,
    Modal,
    TextInput,
    ScrollView,
    Alert,
    Image
  } from 'react-native';
  import * as bcrypt from 'react-native-bcrypt';
  import { encode } from 'base-64';



const Login = ({modalLogin, setModalLogin, tokenAPI, setTokenAPI} : any) =>{

    const [token, setToken] = useState('')
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [userToken, setUserToken] = useState('')
    const [modalLogged, setModalLogged] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const loginHandler = () =>{
        var apiURL = config.API_APP
        var loginEndpoint = apiURL + config.USER_PATH + config.LOGIN_PATH
        var hashedPassword = bcrypt.default.hashSync(password,8);
        const data = {
            username : user,
            password : password
        }
        const credencialesAPI = encode(`${tokenAPI}:`);

        const configHeathers = {
            headers: {
              'Authorization': `Basic ${credencialesAPI}`,
            },
          };

        axios.post(loginEndpoint,data, configHeathers).then((response) =>{

            if(response.status == 200){
                setToken(response.data)
                setUser('')
                setPassword('')
                setModalLogged(true)
            }
            else{
                setError('Credenciales incorrectas'); 
            }


        })
        .catch((error) =>{
            console.log(error)
            setError('Credenciales incorrectas')
        })


    }

    const backHandler = () =>{
        setToken('')
        setUser('')
        setPassword('')
        setUserToken('')
        setError(null)

        setModalLogin(false)

    }


    return(
        <Modal animationType="slide" visible = {modalLogin}>
            <View style = {styles.container}>
                <Pressable onPress={backHandler} style={styles.backButton}>
                <Image style = {styles.backButtonImage}
                    source={require('../../assets/images/backButton.png')}
                />
                </Pressable>
                <View style ={styles.textos}>
                    <View style = {styles.loginView}>
                        <Text style = {styles.txtLogin}>Login</Text>
                    </View>
                    
                    <View style = {styles.campo}>
                        <Text style = {styles.label}>Usuario</Text>
                            <TextInput
                            style = {styles.input}
                            placeholder="Usuario"
                            placeholderTextColor={"#666"}
                            value = {user}
                            onChangeText={setUser}
                            />
                    </View>

                    <View style = {styles.campo}>
                        <Text style = {styles.label}>Contraseña</Text>
                            <TextInput
                            style = {styles.input}
                            placeholder="Contraseña"
                            secureTextEntry={true}
                            placeholderTextColor={"#666"}
                            value = {password}
                            onChangeText={setPassword}
                            />
                    </View>

                    {error && <Text style={styles.errorMessage}>{error}</Text>}

                    <Pressable style = {styles.btnSubmit}
                    onPress={loginHandler}
                    >
                        <Text style = {styles.btnSubmitText}>Acceder</Text>
                    </Pressable>
                    <MainScreen
                        modalLogged = {modalLogged}
                        setModalLogged = {setModalLogged}
                        token = {token}
                        setToken = {setToken}
                        tokenAPI = {tokenAPI}
                        setTokenAPI = {setTokenAPI}
                    />
                    

                </View>
            </View>


        </Modal> 


    )

}


const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 0,
        left: -20,
        backgroundColor: 'transparent',
        padding: 10,
      },
      errorMessage: {
        color: 'red',
        fontSize: 16,
      },
      textos:{
        marginTop : -150
      },
      backButtonText: {
        fontSize: 40,
        color: 'black', 
      },
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#CFF1E2',
    },
    loginView:{
        marginBottom : 20
    },
    txtLogin:{
        textAlign : 'center',
        fontSize : 30,
    },
    backButtonImage: {
        width: 60,
        height: 60,
    },
    campo:{
        marginTop : 10,
        marginHorizontal : 30,
    },
    label:{
        color : '#FFF',
        marginBottom : 10,
        marginTop : 15,
        fontSize : 20,
        fontWeight : 'bold'
    },
    input:{
        backgroundColor : '#FFF',
        color : 'black',
        padding : 15,
        borderRadius : 10,
        marginBottom : 15,
        width : 300
    },
    btnSubmit:{
        marginVertical : 50,
        backgroundColor : "#09B9A3",
        paddingVertical : 15,
        marginHorizontal : 30,
        borderRadius : 10
      },
      btnSubmitText: {
        textAlign : 'center',
        color : "#FFF",
        fontWeight : '900',
        textTransform : "uppercase"
      }
})




export default Login