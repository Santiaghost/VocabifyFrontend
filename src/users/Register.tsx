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
import { encode } from "base-64";


const Register = ({modalRegister, setModalRegister, tokenAPI, setTokenAPI} : any) =>{

    const [token, setToken] = useState('')
    const [user, setUser] = useState('')
    const [email, setEmail] = useState('')
    const [telefono, setTelefono] = useState('')
    const [password, setPassword] = useState('')
    const [confirmpassword, setConfirmPassword] = useState('')
    const [userToken, setUserToken] = useState('')
    const [modalLogged, setModalLogged] = useState(false)
    const [errorEmail, setErrorEmail] = useState<string | null>(null);
    const [errorTelefono, setErrorTelefono] = useState<string | null>(null);
    const [errorUsuario, setErrorUsuario] = useState<string | null>(null);
    const [errorPassword, setErrorPassword] = useState<string | null>(null);
    const [errorConfirmPassword, setErrorConfirmPassword] = useState<string | null>(null);
    const [errorSubmit, setErrorSubmit] = useState<string | null>(null);


    function contieneSoloNumeros(str: string): boolean {
        return /^[0-9]+$/.test(str);
    }

    const backHandler = () =>{
        setToken('')
        setUser('')
        setEmail('')
        setTelefono('')
        setPassword('')
        setConfirmPassword('')
        setUserToken('')
        setErrorEmail(null)
        setErrorTelefono(null)
        setErrorUsuario(null)
        setErrorPassword(null)
        setErrorConfirmPassword(null)
        setErrorSubmit(null)

        setModalRegister(false)

    }

    const registerHandler = () =>{
        var hayError = false
        if(!email.includes("@")){
            setErrorEmail('El formato de email es incorrecto')
            hayError = true
        }
        if(telefono != '' && !contieneSoloNumeros(telefono)){
            setErrorTelefono('El teléfono debe ser un numéro')
            hayError = true
        }
        if(user == ''){
            setErrorUsuario('Este campo es obligatorio')
            hayError = true
        }
        if(email == ''){
            setErrorEmail('Este campo es obligatorio')
            hayError = true
        }
        if(password == ''){
            setErrorPassword('Este campo es obligatorio')
            hayError = true
        }
        if(confirmpassword == ''){
            setErrorConfirmPassword('Este campo es obligatorio')
            hayError = true
        }
        if(password != confirmpassword){
            setErrorSubmit('Las contraseñas deben coincidir')
            hayError = true
        }


        if(!hayError){
            var apiURL = config.API_APP
            var registerEndpoint = apiURL + config.USER_PATH + config.REGISTER_PATH    
            var hashedPassword = bcrypt.default.hashSync(password,8);
            const data = {
                username : user,
                email : email,
                phone : telefono,
                password : hashedPassword
            }
            console.log(registerEndpoint)
            console.log(tokenAPI)
            const credencialesAPI = encode(`${tokenAPI}:`);

            const configHeathers = {
                headers: {
                'Authorization': `Basic ${credencialesAPI}`,
                },
            };
    
            axios.post(registerEndpoint,data, configHeathers).then((response) =>{
    
                if(response.status == 200){
                    setToken(response.data)
                    setUser('')
                    setEmail('')
                    setTelefono('')
                    setPassword('')
                    setConfirmPassword('')
                    setModalLogged(true)
                }
                else{
                    setErrorSubmit('Usuario o email en uso')
                }
    
    
            })
            .catch((error) =>{
                setErrorSubmit('Usuario o email en uso')
            })
        }



    }


    return(
        <Modal animationType="slide" visible = {modalRegister}>
                <View style = {styles.container}>
                    <Pressable onPress={backHandler} style={styles.backButton}>
                    <Image style = {styles.backButtonImage}
                        source={require('../../assets/images/backButton.png')}
                    />
                    </Pressable>
                    <ScrollView>

                    <View style ={styles.textos}>
                        <View style = {styles.loginView}>
                            <Text style = {styles.txtLogin}>Registro</Text>
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
                                {errorUsuario && <Text style={styles.errorMessage}>{errorUsuario}</Text>}
                        </View>

                        <View style = {styles.campo}>
                            <Text style = {styles.label}>Email</Text>
                                <TextInput
                                style = {styles.input}
                                placeholder="Email"
                                placeholderTextColor={"#666"}
                                value = {email}
                                onChangeText={setEmail}
                                />
                                {errorEmail && <Text style={styles.errorMessage}>{errorEmail}</Text>}
                        </View>

                        <View style = {styles.campo}>
                            <Text style = {styles.label}>Teléfono(opcional)</Text>
                                <TextInput
                                style = {styles.input}
                                placeholder="Teléfono"
                                placeholderTextColor={"#666"}
                                keyboardType="number-pad"
                                value = {telefono}
                                onChangeText={setTelefono}
                                />
                                {errorTelefono && <Text style={styles.errorMessage}>{errorTelefono}</Text>}
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
                                {errorPassword && <Text style={styles.errorMessage}>{errorConfirmPassword}</Text>}
                        </View>

                        <View style = {styles.campo}>
                            <Text style = {styles.label}>Repita Contraseña</Text>
                                <TextInput
                                style = {styles.input}
                                placeholder="Contraseña"
                                secureTextEntry={true}
                                placeholderTextColor={"#666"}
                                value = {confirmpassword}
                                onChangeText={setConfirmPassword}
                                />
                                {errorConfirmPassword && <Text style={styles.errorMessage}>{errorConfirmPassword}</Text>}
                        </View>

                        {errorSubmit && <Text style={styles.errorMessage}>{errorSubmit}</Text>}
                        <Pressable style = {styles.btnSubmit}
                        onPress={registerHandler}
                        >
                            <Text style = {styles.btnSubmitText}>Registrarse</Text>
                        </Pressable>
                        <MainScreen
                            modalLogged = {modalLogged}
                            setModalLogged = {setModalLogged}
                            token = {token}
                            setToken = {setToken}
                            setTokenAPI = {setTokenAPI}
                        />
                        

                    </View>
                    </ScrollView>
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
        marginTop : 30
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




export default Register