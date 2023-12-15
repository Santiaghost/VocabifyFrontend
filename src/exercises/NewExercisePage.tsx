import React, { useEffect, useState } from "react"
import config from "../../config/appConfig.json"
import axios from 'axios';
import MainScreen from "../mainScreen/MainScreen";
import {Usuario} from "../mainScreen/MainScreen"
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker';
import { PermissionsAndroid, TouchableOpacity } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {debounce} from 'lodash'
import throttle from 'lodash/throttle';
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
import { encode } from "base-64";


  

  const NewExercisesPage = ({modalNewExercisePage,setModalNewExercisePage , userProperties, setUserProperties, tokenAPI} : any) =>{

    interface Apartado {
      enunciado : string,
      respuesta : string,
      errorEnunciado : boolean,
      opciones : string[],
      errorOpciones : boolean,
      imagenAdicional? : string
      tipoImagen? : string
    }

    const [enunciado, setEnunciado] = useState('')
    const [idioma, setIdioma] = useState('Español')
    const [tipoEjercicio, setTipoEjercicio] = useState('Rellenar')
    const [nivel, setNivel] = useState('Básico')
    const [error, setError] = useState<string | null>(null);
    const [apartados, setApartados] = useState< Apartado[]>(
        []
      );
    const [tipoTest, setTipoTest] = useState(false);

    const[errorApartados, setErrorApartados] = useState<string | null>(null);

    const modificaEnunciadoApartado = (valorEnunciado : any , index : any) =>{
      setTimeout(() => {
        var apartadosAux = apartados
        apartadosAux[index].enunciado = valorEnunciado
        if(tipoEjercicio == "Rellenar" && !valorEnunciado.includes('_')){
          apartadosAux[index].errorEnunciado = true
        }
        else{
          apartadosAux[index].errorEnunciado = false
        }
        setApartados(apartadosAux)
        } , 5000)
      
    }

    const openImagePicker = async (index: any) => {
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
                  if (image.path) {
                    var apartadosAux = apartados
                    apartadosAux[index].imagenAdicional = image.path
                    apartadosAux[index].tipoImagen = image.mime
                    setApartados(apartadosAux)
                  }
                }).catch(error => {
                  console.log(error);
                });
          } else {
            console.log('Permiso denegado');
          }
        } catch (err) {
          console.warn(err);
        }

  }



    const modificaRespuestaEnunciado = (valorRespuesta : any , index : any) =>{
      setTimeout(() => {
        var apartadosAux = apartados
        apartadosAux[index].respuesta = valorRespuesta
        setApartados(apartadosAux)
      }, 5000)
    }

    const editarOpcion = (valorOpcion : any, indexApartado : any, indexOpcion : any) =>{
      setTimeout(() => {
        var apartadosAux = apartados
        apartadosAux[indexApartado].opciones[indexOpcion] = valorOpcion
        setApartados(apartadosAux)
      },5000)
    }

    const addApartado = () => {
      setError(null)
      if(apartados.length < 10){
        const nuevoApartado = {
          enunciado : "",
          respuesta : "",
          opciones : [],
          errorEnunciado : false,
          errorOpciones : false
        }
        setApartados([...apartados, nuevoApartado]);
        setErrorApartados(null)
      }
      else{
        setErrorApartados("No se pueden añadir más de 10 apartados")
      }

    };
    const handleDeleteApartado = (index: number) => {
      const nuevosApartados = [...apartados];
      nuevosApartados.splice(index, 1);
      setApartados(nuevosApartados);
      setErrorApartados(null);
    };

    const cambiarTipoTest = (itemvalue : any) =>{
      if(itemvalue == "Test"){
        setTipoTest(true)
      }
      else{
        setTipoTest(false)
      }
    }

    const addOpcion = (indexApartado : any) => {
      setError(null)
      if(apartados[indexApartado].opciones.length < 5){
        const nuevaOpcion = ""
        const updatedApartados = [...apartados];
        updatedApartados[indexApartado].opciones.push(nuevaOpcion);
        updatedApartados[indexApartado].errorOpciones = false;
        setApartados(updatedApartados); 
      }
      else{
        apartados[indexApartado].errorOpciones = true;
      }
    };
  
    const handleDeleteOpcion = (indexOpcion: number, indexApartado : number) => {
      const updatedApartados = [...apartados];
      updatedApartados[indexApartado].opciones.splice(indexOpcion,1)
      updatedApartados[indexApartado].errorOpciones = false
      setApartados(updatedApartados); 
    };

    const backHandler = () =>{
      setEnunciado('')
      setIdioma('Español')
      setTipoEjercicio('Rellenar')
      setNivel('Básico')
      setError(null)
      setErrorApartados(null)
      setTipoTest(false)
      setApartados([])

      setModalNewExercisePage(false)

    }

    const fotoApartadoHandler = (index : any) =>{
      openImagePicker(index)
    }

    const showAlert = () => {
      Alert.alert(
        'Nuevo ejercicio',
        'El ejercicio se añadió correctamente',
        [
          {
            text: 'Aceptar',
            onPress: undefined, 
          },
        ]
      );
    };

    const uploadPicture = async (apiURL : any , formData : any) =>{
      try{
        const credencialesAPI = encode(`${tokenAPI}:`);
        const response = await axios.post(apiURL, formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Basic ${credencialesAPI}`
          },
        });
      }
      catch (error){
        console.log(error)
      }

    }

    const nuevoEjercicioHandler = () =>{
      setError(null)
      if(apartados.length < 1 ){
        setError("El ejercicio debe tener al menos un apartado")
      }
      else{
        apartados.forEach((apartado, indice) =>{
            if(apartado.opciones.length < 2 && tipoEjercicio == "Test"){
              setError("Los apartados deben tener al menos dos opciones")
            }
          })
          if(error != null){

          }
          else{
            const data = {
                titulo : enunciado,
                idioma : idioma,
                nivel : nivel,
                tipoejercicio : tipoEjercicio,
                apartados : apartados
            }
            var addExerciseEndpoint = config.API_APP + config.USER_PATH + config.USER_ADD_EXERCISES_PATH + "?username=" + userProperties.nombreUsuario
            const credencialesAPI = encode(`${tokenAPI}:`);

            const configHeathers = {
                headers: {
                    'Authorization': `Basic ${credencialesAPI}`,
                },
            };
            axios.put(addExerciseEndpoint,data, configHeathers).then((response) =>{
                  if(response.status == 200){
                    var indice = 0
                    response.data.apartados.map((apartadoFoto: { imagenAdicional: string | undefined; id: any; }) => {
                      if(apartadoFoto.imagenAdicional != undefined){
                        const formData = new FormData();
                        var addPhotoEndpoint = config.API_APP + config.APARTADOS_PATH + config.IMAGEN_APARTADOS_PATH
                        const extension = apartadoFoto.imagenAdicional?.split('.').pop();
                        var nombreArchivo = "temporal" + "." + extension
                        formData.append('imagen', {
                          uri: apartadoFoto.imagenAdicional,
                          type : apartados[indice].tipoImagen,
                          name: nombreArchivo, 
                        });
                        formData.append('idApartado', apartadoFoto.id);
                        uploadPicture(addPhotoEndpoint,formData)

                      }
                      indice += 1
                    });
                    backHandler()
                    showAlert()
                  }
                  else{
                      setError('Ha ocurrido un problema'); 
                  }
              })
              .catch((error) =>{
                  setError('Ha ocurrido un problema')
              })
  
          }

      }
    }

    return(
        <Modal visible = {modalNewExercisePage} animationType="slide">
            <View style = {styles.container}>
                <Pressable onPress={backHandler} style={styles.backButton}>
                    <Image style = {styles.backButtonImage}
                        source={require('../../assets/images/backButton.png')}
                    />
                </Pressable>
                    <ScrollView>
                    <View style ={styles.textos}>
                        <View style = {styles.exerciseView}>
                            <Text style = {styles.txtexercise}>Nuevo Ejercicio</Text>
                        </View>
                        
                        <View style = {styles.campo}>
                            <Text style = {styles.label}>Enunciado</Text>
                                <TextInput
                                style = {styles.input}
                                placeholder="Enunciado"
                                placeholderTextColor={"#666"}
                                value = {enunciado}
                                onChangeText={setEnunciado}
                                />
                        </View>

                        <View style = {styles.campo}>
                            <Text style={styles.label}>Idioma</Text>
                            <Picker style = {styles.picker}
                            selectedValue={idioma}
                            onValueChange={(itemValue, itemIndex) =>
                                setIdioma(itemValue)
                            }>
                                <Picker.Item label="Español" value="Español" />
                                <Picker.Item label="Inglés" value="Inglés" />
                                <Picker.Item label="Francés" value="Francés" />
                                <Picker.Item label="Italiano" value="Italiano" />
                                <Picker.Item label="Alemán" value="Alemán" />
                                <Picker.Item label="Portugués" value="Portugués" />
                                <Picker.Item label="Ruso" value="Ruso" />
                            </Picker>
                        </View>

                        <View style = {styles.campo}>
                            <Text style={styles.label}>Nivel</Text>
                            <Picker style = {styles.picker}
                            selectedValue={nivel}
                            onValueChange={(itemValue, itemIndex) =>
                                setNivel(itemValue)
                            }>
                                <Picker.Item label="Básico" value="Básico" />
                                <Picker.Item label="Fácil" value="Fácil" />
                                <Picker.Item label="Intermedio" value="Intermedio" />
                                <Picker.Item label="Difícil" value="Difícil" />
                                <Picker.Item label="Avanzado" value="Avanzado" />
                            </Picker>
                        </View>


                        <View style={styles.campo}>
                            <Text style={styles.label}>Tipo de Ejercicio</Text>
                            <Picker
                                style={styles.picker}
                                selectedValue={tipoEjercicio}
                                onValueChange={(itemValue, itemIndex) => {
                                    setTipoEjercicio(itemValue);
                                    cambiarTipoTest(itemValue); 
                                }}
                            >
                                <Picker.Item label="Rellenar" value="Rellenar" />
                                <Picker.Item label="Test" value="Test" />
                                <Picker.Item label="Responder" value="Responder" />
                            </Picker>
                        </View>
                            <View style={styles.campo}>
                                <View style = {styles.apartadosHeader}>
                                    <Text style={styles.label}>Apartados     </Text>
                                    <Pressable style = {styles.btnNuevoApartado}
                                        onPress={addApartado}
                                        >
                                        <Text style = {styles.btnSubmitText}>+</Text>
                                    </Pressable>
                                </View>
                                {apartados.map((apartado, index) => (
                                    <View key={index} style={styles.apartadoContainer}>
                                        <TextInput
                                        style={styles.apartadoInput}
                                        placeholder={`Enunciado${index + 1}`}
                                        placeholderTextColor={"#666"}
                                        onChangeText={(event) => modificaEnunciadoApartado(event,index)}
                                        />
                                        <TextInput
                                        style={styles.respuestaInput}
                                        placeholder={`Respuesta${index + 1}`}
                                        placeholderTextColor={"#666"}
                                        onChangeText={(event) => modificaRespuestaEnunciado(event,index)}
                                        />
                                        <Pressable style={styles.btnFoto} onPress={() => fotoApartadoHandler(index)}>
                                        <Image
                                              source={require('../../assets/images/camarita.png')}
                                              style = {styles.cameraIcon}
                                          />
                                            <Text style={styles.btnSubmitText}>Añadir foto</Text>
                                        </Pressable>
                                        {apartado.errorEnunciado && <Text style={styles.errorMessage}>Al ser una pregunta de rellenar debes poner un caracter '_' indicando donde va la respuesta</Text>}
                                        {errorApartados && <Text style={styles.errorMessage}>{errorApartados}</Text>}
                                        <TouchableOpacity style = {styles.deleteContainer}
                                        onPress={() => handleDeleteApartado(index)}
                                        >
                                        {tipoTest && (
                                            <View >
                                              <View style={styles.apartadosHeader}>
                                                <Text style={styles.label}>Opciones       </Text>
                                                <Pressable style={styles.btnNuevoApartado} onPress={() => addOpcion(index)}>
                                                  <Text style={styles.btnSubmitText}>+</Text>
                                                </Pressable>
                                              </View>
                                              {apartado.opciones.map((opcion, indexOpcion) => (
                                                <View key={indexOpcion} style={styles.apartadoContainer}>
                                                  <TextInput
                                                    style={styles.apartadoInput}
                                                    placeholder={`Opción ${indexOpcion + 1}`}
                                                    placeholderTextColor={"#666"}
                                                    onChangeText={(event) => editarOpcion(event,index,indexOpcion)}
                                                  />
                                                  {apartado.errorOpciones && <Text style={styles.errorMessage}>No puedes escoger más de 5 opciones</Text>}
                                                  <TouchableOpacity style={styles.deleteContainer} onPress={() => handleDeleteOpcion(indexOpcion,index)}>
                                                    <Text style={styles.deleteButtonText}>Eliminar Opcion</Text>
                                                  </TouchableOpacity>
                                                </View>
                                              ))}
                                            </View>
                                          )}
                                        <Text style={styles.deleteButtonText}>Eliminar Apartado</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                    <Pressable style = {styles.btnSubmit}
                        onPress={nuevoEjercicioHandler}
                        >
                            <Text style = {styles.btnSubmitText}>Añadir Ejercicio</Text>
                        </Pressable>
                    {error && <Text style={styles.errorMessage}>{error}</Text>}
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
      cameraIcon : {
        width: 20,
        height: 20,
        marginLeft : 5,
        marginRight : 5,
      },
      apartadosHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    btnFoto : {
      flexDirection: "row",
      backgroundColor : "#09B9A3",
      paddingVertical : 15,
      borderRadius : 20,
      width : 100,
      height: 50,
      marginTop : 10
    },
      btnNuevoApartado : {
        backgroundColor : "#09B9A3",
        paddingVertical : 15,
        borderRadius : 20,
        width : 50,
        height: 50,
      },
      deleteContainer: {
        marginLeft : 5,
        marginTop : 18,
      },
      deleteButtonText: {
        color: "red",
        fontWeight: "bold",
      },
      apartadoContainer: {
        marginBottom: 10,
      },
      apartadoInput: {
        flex: 1,
        backgroundColor: "#FFF",
        color : 'black',
        padding: 15,
        borderRadius: 20,
        marginVertical : 20,
      },
      respuestaInput: {
        flex: 1,
        backgroundColor: "#FFF",
        color : 'black',
        padding: 15,
        borderRadius: 20,
      },
      picker :{
        backgroundColor : '#FFF',
        padding : 15,
        borderRadius : 20,
        marginBottom : 15,
        width : 300
      },
      errorMessage: {
        marginBottom : 20,
        marginLeft : 35,
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
    exerciseView:{
        marginBottom : 20
    },
    txtexercise:{
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
        marginTop : 30,
        marginBottom : 20,
        backgroundColor : "#09B9A3",
        paddingVertical : 15,
        marginHorizontal : 30,
        borderRadius : 10
      },
      btnSubmitText: {
        textAlign : 'center',
        color : "#FFF",
      }
})

  export default NewExercisesPage