import React, { useEffect, useState } from "react"
import config from "../../config/appConfig.json"
import axios from 'axios';
import MainScreen from "../mainScreen/MainScreen";
import {Usuario} from "../mainScreen/MainScreen"
import ImagePicker from 'react-native-image-crop-picker';
import { PermissionsAndroid, TouchableHighlight, TouchableOpacity } from 'react-native';
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
import { Checkbox, RadioButton } from 'react-native-paper';
import NewExercisesPage from "./NewExercisePage";
import EditExercisesPage from "./EditExercisePage";
import {Picker} from '@react-native-picker/picker';
import { encode } from "base-64";





const DoExercisePage = ({userProperties, setUserProperties, exerciseProperties, setExerciseProperties, modalDoExercisePage, setModalDoExercisePage, tokenAPI} : any ) =>{


    interface Apartado {
        id : number,
        enunciado : string,
        respuesta : string,
        errorEnunciado : boolean,
        opciones : string[],
        errorOpciones : boolean
        imagenAdicional : string
    }

    interface CorreccionApartado{
        idApartado : number,
        respuesta : string,
        respuestaCorrecta? : string,
        correccion? : string,
    }


    const inicializarListaRespuestas = Array.from({ length: exerciseProperties.apartados.length }, () => "");
    const inicializarListaApartados = Array.from({ length: exerciseProperties.apartados.length }, () => 0);


    const [currentApartado, setCurrentApartado] = useState <Apartado | null>(null)
    const [indexCurrentApartado, setIndexCurrentApartado] = useState(0)
    const [currentApartadoResponse, setCurrentApartadoResponse] = useState('')
    const [currentApartadoImage, setCurrentApartadoImage] = useState('')
    const [respuestas, setRespuestas] = useState(inicializarListaRespuestas);
    const [listaApartados, setListaApartados] = useState(inicializarListaApartados)
    const [correccionEjercicio, setCorreccionEjercicio] = useState <CorreccionApartado[] | null>(null)
    const[correccion, setCorreccion] = useState(false)
    const [mostrarRespuestas, setMostrarRespuestas] = useState(false)

    useEffect(() =>{
        setCurrentApartado(exerciseProperties.apartados[indexCurrentApartado])
        if(exerciseProperties.apartados[indexCurrentApartado]?.imagenAdicional != null){
            setCurrentApartadoImage(config.API_APP + config.APARTADOS_PATH + config.GET_IMAGE_APARTADO + "?imageName=" + exerciseProperties.apartados[indexCurrentApartado].imagenAdicional)
        }
    },[indexCurrentApartado])

    const terminarHandler = () =>{
        var corregirEjercicioPath = config.API_APP + config.EXERCISE_PATH + config.CHECK_EXERCISE_PATH + "?idEjercicio=" + exerciseProperties.id + "&userName=" + userProperties.nombreUsuario
        console.log(corregirEjercicioPath)
        setIndexCurrentApartado(indexCurrentApartado + 1)
        var cadenaAux = [...respuestas]
        cadenaAux[indexCurrentApartado] = currentApartadoResponse
        setRespuestas(cadenaAux)
        var apartadosAux = [...listaApartados]
        if(currentApartado != undefined){
            apartadosAux[indexCurrentApartado] = currentApartado?.id
            setListaApartados(apartadosAux)
        }
        
        var listaRespuestas : CorreccionApartado[] = []

        for (let i = 0; i < listaApartados.length; i++) {
            var dataRespuesta = {
                idApartado : apartadosAux[i],
                respuesta : cadenaAux[i]
            }
            listaRespuestas.push(dataRespuesta)
        }
        const credencialesAPI = encode(`${tokenAPI}:`);

        const configHeathers = {
            headers: {
                'Authorization': `Basic ${credencialesAPI}`,
            },
        };


        axios.post(corregirEjercicioPath,listaRespuestas, configHeathers).then((response) =>{
            if(response.status == 200){
                setCorreccionEjercicio(response.data)
                setCorreccion(true)
            }
        })


    }

    const anteriorApartadoHandler = () =>{
        setIndexCurrentApartado(indexCurrentApartado - 1)
        setCurrentApartado(exerciseProperties.apartados[indexCurrentApartado])
        var cadenaAux = [...respuestas]
        cadenaAux[indexCurrentApartado] = currentApartadoResponse
        var apartadosAux = [...listaApartados]
        if(currentApartado != undefined){
            apartadosAux[indexCurrentApartado] = currentApartado?.id
            setListaApartados(apartadosAux)
        }
        setRespuestas(cadenaAux)
        setCurrentApartadoImage('')
        setCurrentApartadoResponse('')
    }

    const siguienteApartadoHandler = () =>{
        setIndexCurrentApartado(indexCurrentApartado + 1)
        setCurrentApartado(exerciseProperties.apartados[indexCurrentApartado])
        var cadenaAux = [...respuestas]
        cadenaAux[indexCurrentApartado] = currentApartadoResponse
        var apartadosAux = [...listaApartados]
        if(currentApartado != undefined){
            apartadosAux[indexCurrentApartado] = currentApartado?.id
            setListaApartados(apartadosAux)
        }
        setRespuestas(cadenaAux)
        setCurrentApartadoImage('')
        setCurrentApartadoResponse('')
    }

    const backHandler = () =>{
        setCurrentApartado(exerciseProperties.apartados[0])
        setIndexCurrentApartado(0)
        setModalDoExercisePage(false)
        setCurrentApartadoResponse('')
        setRespuestas(inicializarListaRespuestas)
        setListaApartados(inicializarListaApartados)
        setCorreccionEjercicio(null)
        setCorreccion(false)
        setExerciseProperties(null)
    }

    const handleOptionSelect = (option : any) => {
        if(option == currentApartadoResponse){
            setCurrentApartadoResponse('');
        }
        else{
            setCurrentApartadoResponse(option);
        }
    };

    return(
        <Modal visible = {modalDoExercisePage} animationType="slide">
            <View style = {styles.container}>
                <View style = {styles.backExercise}>
                <Pressable onPress={backHandler} style={styles.backButton}>
                    <Image style = {styles.backButtonImage}
                        source={require('../../assets/images/backButton.png')}
                    />
                </Pressable>
                    <Text style = {styles.btnExerciseTitle}>{exerciseProperties.titulo}</Text>
                </View>
                <ScrollView style = {styles.ScrollView}>
                    {correccion == true ?             
                    (
                        <View>
                            {correccionEjercicio?.map((apartado, index) =>
                                <View style = {styles.table} key={index}>
                                    <View style = {styles.row}>
                                        <Text style={styles.responsesText}>Apartado {" " + index}</Text>      
                                        <Text style={styles.responsesText}>Tu respuesta {apartado.respuesta}</Text>
                                        {
                                            apartado.correccion == "OK" ? (
                                                <Text style={styles.responsesCorrect}>{apartado.correccion}</Text>
                                            ) : apartado.correccion == "MAL" ? (
                                                <Text style={styles.responsesWrong}>{apartado.correccion}</Text>
                                            ) : (
                                                <Text style={styles.responsesNoResponded}>{apartado.correccion}</Text>
                                            )
                                        }
                                        {mostrarRespuestas ? (                                 
                                        <Text style={styles.responsesText}>{apartado.respuestaCorrecta}</Text>
                                        ) : null}
                                    </View>
   
                                </View>

                            )}
                        </View>
                    ) : (
                        <View style = {styles.preguntas}>
                            <Text style = {styles.apartadoTitleText}>
                                {currentApartado?.enunciado}
                            </Text>
                            {currentApartado?.imagenAdicional != null ? (
                                <Image
                                source={{ uri: currentApartadoImage }}
                                style={styles.apartadoImagen} 
                                />
                            ): null                    
                            }
                            {exerciseProperties.tipoejercicio == "Test" ? (
                                <View style={styles.opcionesTest}>
                                {currentApartado?.opciones.map((currentOpcion, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.checkOpcionesTest}
                                        onPress={() => handleOptionSelect(currentOpcion)}
                                    >
                                        <RadioButton.Android
                                            color="#09B9A3"
                                            uncheckedColor="#09B9A3"
                                            value={currentOpcion}
                                            status={currentApartadoResponse === currentOpcion ? 'checked' : 'unchecked'}
                                        />
                                        <Text style={styles.optionTitleText}>{currentOpcion}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            )
                            : (
                                
                            <View style = {styles.campo}>
                                <Text style = {styles.label}>Su respuesta</Text>
                                    <TextInput
                                    style = {styles.input}
                                    placeholder="Respuesta"
                                    placeholderTextColor={"#666"}
                                    value = {currentApartadoResponse}
                                    onChangeText={setCurrentApartadoResponse}
                                />
                            </View>
                            )
                            }
                        </View>
                    )}

                </ScrollView>

                {indexCurrentApartado < exerciseProperties.apartados.length - 1 && correccion == false ?(
                    <Pressable style = {styles.btnNext}  
                      onPress={siguienteApartadoHandler}  >
                            <Text style = {styles.btnNextText}>Siguiente{" >"}</Text>
                    </Pressable>
                ): correccion == false ? (
                <Pressable style = {styles.btnNext}  
                    onPress={terminarHandler}  >
                          <Text style = {styles.btnNextText}>Terminar</Text>
                  </Pressable>
                ) : null}
                {indexCurrentApartado > 0 && correccion == false ?(
                    <Pressable style = {styles.btnBefore}  
                    onPress={anteriorApartadoHandler}>
                        <Text style = {styles.btnNextText}>{"< "}Anterior</Text>
                    </Pressable>
                ):null}
                {correccion == true ?(
                    <Pressable style = {styles.btnBefore}  
                        onPress={() => setMostrarRespuestas(true)}>
                        <Text style = {styles.btnNextText}>Ver Respuestas</Text>
                    </Pressable>
                ):null}
                {correccion == true ?(
                    <Pressable style = {styles.btnNext}  
                        onPress={backHandler}>
                        <Text style = {styles.btnNextText}>Terminar</Text>
                    </Pressable>
                ):null}

            </View>

        </Modal>
    )
}


const styles = StyleSheet.create({
    table: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    preguntas :{
        alignItems: 'center',
    },
    row: {
    flexDirection: 'row',
    marginBottom: 10, 
    },
    container :{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#CFF1E2',
    },
    label:{
        color : '#FFF',
        marginBottom : 10,
        marginTop : 15,
        fontSize : 20,
        fontWeight : 'bold'
    },
    mostrarCorreccion:{
        flexDirection: 'row',
    },
    input:{
        backgroundColor : '#FFF',
        padding : 15,
        borderRadius : 10,
        marginBottom : 15,
        width : 300
    },
    opcionesTest: {
        marginVertical: 20,
        marginHorizontal: 10,
    },
    apartadoImagen: {
        width: 300, 
        height: 200,
        marginTop: 10,
        borderRadius: 30 
    },
    checkOpcionesTest: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ScrollView:{
        marginTop : 100
    },
    apartadoTitleText: {
        fontSize : 30,
        fontWeight : '500',
        color : 'black',
    },
    optionTitleText: {
        fontSize : 20,
        fontWeight : '500',
        color : 'black',
        marginRight : 180
    },
    responsesText: {
        fontSize : 15,
        fontWeight : '500',
        color : 'black',
        marginHorizontal : 5
    },
    responsesCorrect: {
        fontSize : 15,
        fontWeight : '500',
        color : 'green',
        marginHorizontal : 5
    },
    responsesWrong: {
        fontSize : 15,
        fontWeight : '500',
        color : 'red',
        marginHorizontal : 5
    },
    responsesNoResponded: {
        fontSize : 15,
        fontWeight : '500',
        color : 'grey',
        marginHorizontal : 5
    },
    exerciseContainer :{
        borderRadius : 5,
        marginBottom : 50,
        width : 380,
        height : 55,
        backgroundColor : "#CFF1E2",
    },
    scrollViewStyle: {

    },
    filterText : {
        marginHorizontal : 15
    },
    picker :{
        backgroundColor : '#FFF',
        marginBottom : 15,
        width : 150,
        height : 40,
        alignContent : 'center',
        marginHorizontal : 15
    },
    pickerText :{
        height :40
    },
    campo:{
        marginBottom : 15,
        
    },
    campoPicker:{
        marginBottom : 15,
        flexDirection : 'row',
        
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    exercisesContainer:{
        marginBottom : -30,
    },
    exerciseTitleFont:{
        fontSize : 15,
        fontWeight : 'bold',
        color : 'black',
        marginLeft : 5,
    },
    exercisePropertiesText :{
        fontSize : 10,
        fontWeight : 'bold',
        color : 'black',
        marginLeft : 5
    },
    exercisePropertiesDescriptionText :{
        fontSize : 10,
        color : 'black',
        marginLeft : 5
    },

    optionButtons :{
        flexDirection: 'row',
        marginBottom : 20
    },
    backButton: {

      },
    backButtonImage: {
        width: 60,
        height: 60,
    },
    exerciseProperties:{
        flexDirection: 'row',
    },
    optionButton:{
        width : 80,
        height : 50,
        backgroundColor : "#09B9A3",
        paddingVertical : 15,
        borderRadius : 20,
        marginHorizontal: 8
      },
    btnNew:{
        width : 50,
        height: 50,
        backgroundColor : "#09B9A3",
        paddingVertical : 15,
        marginLeft : 50,
        borderRadius : 30
      },
      btnBefore: {
        position: 'absolute',
        bottom: 20, 
        right: 280, 
        width: 100,
        height: 40,
        backgroundColor: "#09B9A3",
        borderRadius: 30,
        justifyContent: 'center', 
        alignItems: 'center', 
    },
      btnNext: {
        position: 'absolute',
        bottom: 20, 
        right: 20, 
        width: 100,
        height: 40,
        backgroundColor: "#09B9A3",
        borderRadius: 30,
        justifyContent: 'center', 
        alignItems: 'center', 
    },
      btnNewNoSelected:{
        width : 50,
        height: 50,
        backgroundColor : "#09B9A3",
        paddingVertical : 15,
        marginLeft : 330,
        borderRadius : 30
      },
      selectedContainer:{
        marginBottom : 50,
        width : 380,
        height : 55,
        backgroundColor: 'lightblue', 
      },
      btnNextText: {
        textAlign : 'center',
        color : "#FFF",
        fontWeight : '900',
        textTransform : "uppercase"
      },
      btnExerciseTitle: {
        textAlign : 'center',
        color : "#FFF",
        fontWeight : '900',
        fontSize : 20,
        textTransform : "uppercase",
        marginTop : 15
      },
      backExercise:{
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: -20,
        backgroundColor: 'transparent',
        padding: 10,
      }
})

export default DoExercisePage