import React, { useState } from "react"
import config from "../../config/appConfig.json"
import axios from 'axios';
import MainScreen from "../mainScreen/MainScreen";
import {Usuario} from "../mainScreen/MainScreen"
import ImagePicker from 'react-native-image-crop-picker';
import { PermissionsAndroid } from 'react-native';
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



const UserProfile = ({ modalProfile, setModalProfile, setUserProperties, userProperties , fotoPerfil, setfotoPerfil , mostrarImagen, tokenAPI }: { modalProfile: any, setModalProfile: any, setUserProperties :any, userProperties: any, fotoPerfil : any , setfotoPerfil : any , mostrarImagen : any, tokenAPI: any }) =>{

    const [telefono,setTelefono] = useState(userProperties?.telefono)
    const [userName, setUserName] = useState(userProperties?.nombreUsuario)
    const [email, setEmail] = useState(userProperties?.correo)
    const [password,setPassword] = useState('')
    const [confirmpassword,setConfirmPassword] = useState('')
    const [errorTelefono, setErrorTelefono] = useState<string | null>(null);
    const [errorPassword, setErrorPassword] = useState<string | null>(null);
    const [errorConfirmPassword, setErrorConfirmPassword] = useState<string | null>(null);
    const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
    const [successSubmit, setSuccessSubmit] = useState<string | null>(null);


    function contieneSoloNumeros(str: string): boolean {
      return /^[0-9]+$/.test(str);
    }

    const backHandler = () =>{
        setTelefono(userProperties?.telefono)
        setEmail(userProperties?.correo)
        setUserName(userProperties?.userName)
        setPassword('')
        setConfirmPassword('')
        setErrorTelefono(null)
        setErrorPassword(null)
        setErrorConfirmPassword(null)
        setErrorSubmit(null)
        setModalProfile(false)
        setSuccessSubmit(null)
    }

    const updateProfileHandler = () =>{
      setErrorSubmit(null)
      setSuccessSubmit(null)
      var hayError = false
      if(telefono != '' && !contieneSoloNumeros(telefono)){
        setErrorTelefono('El teléfono debe ser un numéro')
        hayError = true
      }
      if(password != confirmpassword){
        setErrorSubmit('Las contraseñas deben coincidir')
        hayError = true
      }

      if(!hayError){
        setTelefono(telefono)
        var apiURL = config.API_APP
        var registerEndpoint = apiURL + config.USER_PATH + config.UPDATE_USER_PATH
        var hashedPassword = bcrypt.default.hashSync(password,8);            
        const data = {
            username : userProperties?.nombreUsuario,
            email : userProperties?.correo,
            phone : telefono,
            password : hashedPassword
        }
        const credencialesAPI = encode(`${tokenAPI}:`);
        const configHeathers = {
          headers: {
              'Authorization': `Basic ${credencialesAPI}`,
          },
        };

        axios.put(registerEndpoint,data, configHeathers).then((response) =>{
            if(response.status == 200){
              setSuccessSubmit('El usuario se ha actualizado correctamente!')
            }
            else{
                setErrorSubmit('Error al actualizar el usuario')
            }


        })
        .catch((error) =>{
            setErrorSubmit('Error al actualizar el usuario')
        })
    }

    }

    const setPicture = async (apiURL : any , formData : any) =>{
      const credencialesAPI = encode(`${tokenAPI}:`);
      const response = await axios.post(apiURL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Basic ${credencialesAPI}`
        },
      });

    }

    const openImagePicker = async () => {
        try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              {
                title: 'Permiso de almacenamiento',
                message: 'Necesitamos acceso al almacenamiento para seleccionar imágenes.',
                buttonNeutral: 'Pregúntame después',
                buttonNegative: 'Cancelar',
                buttonPositive: 'OK',
              },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                ImagePicker.openPicker({
                    width: 300,
                    height: 400,
                    cropping: true
                  }).then(image => {
                    console.log(image);
                    if (image.path) {
                      setfotoPerfil(image.path);
                      var apiUrl = config.API_APP + config.USER_PATH + config.UPLOAD_IMAGE_PATH
                      const formData = new FormData();
                      const extension = image.path.split('.').pop();
                      var nombreArchivo = userProperties?.nombreUsuario.replace('.','') + "." + extension
                      formData.append('imagen', {
                        uri: image.path,
                        type: image.mime,
                        name: nombreArchivo, 
                      });
                      formData.append('username', userProperties?.nombreUsuario);
                      setPicture(apiUrl, formData)

                    }
                  }).catch(error => {
                    console.log(error);
                  });
                console.log('hola')
            } else {
              console.log('Permiso denegado');
            }
          } catch (err) {
            console.warn(err);
          }

    }
    return (
        <Modal animationType="slide" visible = {modalProfile}>
                <View style = {styles.container}>
                    <Pressable onPress={backHandler} style={styles.backButton}>
                        <Image style = {styles.backButtonImage}
                            source={require('../../assets/images/backButton.png')}
                        />
                    </Pressable>
                    <ScrollView>

                    <View style ={styles.textos}>
                        <View style = {styles.profileView}>
                            <Text style = {styles.txtProfile}>Página de perfil de Usuario</Text>
                        </View>
                        <View style = {styles.imageContainer}>
                        {mostrarImagen ? (
                            <Image
                            source={{ uri: fotoPerfil }}
                            style={styles.userImage} 
                            />
                          ) : (
                            <Image
                            source={require('../../assets/images/profile.png')}
                            style={styles.userImage} 
                            />
                          )            
                          }                           
                            <Pressable style={styles.editButton} onPress={openImagePicker} >
                                <Image
                                source={require('../../assets/images/editIcon.png')} 
                                style={styles.editIcon}
                                />
                            </Pressable>

                        </View>

                        <View style = {styles.campo}>
                            <Text style = {styles.label}>Usuario</Text>
                                <TextInput
                                style = {styles.input}
                                placeholder={userProperties?.nombreUsuario}
                                placeholderTextColor={"#666"}
                                value = {userProperties?.nombreUsuario}
                                editable = {false}
                                />
                        </View>

                        <View style = {styles.campo}>
                            <Text style = {styles.label}>Email</Text>
                                <TextInput
                                style = {styles.input}
                                placeholder={userProperties?.correo}
                                placeholderTextColor={"#666"}
                                value = {userProperties?.correo}
                                editable = {false}
                                />
                        </View>

                        <View style = {styles.campo}>
                            <Text style = {styles.label}>Teléfono</Text>
                                <TextInput
                                style = {styles.input}
                                placeholder={userProperties?.telefono}
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
                        {successSubmit && <Text style={styles.successMessage}>{successSubmit}</Text>}
                        <Pressable style = {styles.btnSubmit}
                        onPress={updateProfileHandler}
                        >
                            <Text style = {styles.btnSubmitText}>Actualizar</Text>
                        </Pressable>
                        

                    </View>
                    </ScrollView>
                </View>

        </Modal> 


    )

}

export default UserProfile


const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 0,
        left: -20,
        backgroundColor: 'transparent',
        padding: 10,
      },
      editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'transparent', 
        padding: 8,
        borderRadius: 20, 
      },
      editIcon: {
        width: 40, 
        height: 40, 
        tintColor: 'black',
        position: 'absolute',
        bottom: 10, 
        right: 75, 
      },
      errorMessage: {
        color: 'red',
        fontSize: 16,
      },
      successMessage: {
        color: 'green',
        fontSize: 16,
      },
      imageContainer :{
        marginTop : 10,
        marginHorizontal : 30,
        alignItems: 'center', 
        justifyContent: 'center', 
      },
      textos:{
        marginTop : 60
      },
      backButtonText: {
        fontSize: 40,
        color: 'black', 
      },
      userImage: {
        width: 200, 
        height: 200,
        marginTop: 10,
        borderRadius: 90 
    },
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#CFF1E2',
    },
    profileView:{
        marginBottom : 20
    },
    txtProfile:{
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