import React, { useEffect, useState } from "react"
import config from "../../config/appConfig.json"
import axios from 'axios';
import MainScreen from "../mainScreen/MainScreen";
import {Usuario} from "../mainScreen/MainScreen"
import ImagePicker from 'react-native-image-crop-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { PermissionsAndroid, TouchableHighlight } from 'react-native';
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
import NewExercisesPage from "./NewExercisePage";
import EditExercisesPage from "./EditExercisePage";
import {Picker} from '@react-native-picker/picker';
import DoExercisePage from "./DoExercisePage";
import { encode } from "base-64";



  
const ExercisesPage = ({userProperties, setUserProperties, tokenAPI} : {userProperties : any, setUserProperties : any, tokenAPI : any}) =>{

    interface Apartado {
        enunciado : string,
        respuesta : string,
        errorEnunciado : boolean,
        opciones : string[],
        errorOpciones : boolean,
        imagenAdicional : string
    }

    interface Ejercicio {
        id : number,
        titulo : string,
        apartados : Apartado[],
        idioma : string,
        nivel : string,
        tipoejercicio:  string
    }

    const data = [
        { label: 'Item 1', value: '1' },
        { label: 'Item 2', value: '2' },
        { label: 'Item 3', value: '3' },
        { label: 'Item 4', value: '4' },
        { label: 'Item 5', value: '5' },
        { label: 'Item 6', value: '6' },
        { label: 'Item 7', value: '7' },
        { label: 'Item 8', value: '8' },
      ];

  
      const renderLabel = () => {
        if (value || isFocus) {
          return (
            <Text style={[styles.label, isFocus && { color: 'blue' }]}>
              Dropdown label
            </Text>
          );
        }
        return null;
      };

    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const[modalNewExercisePage, setModalNewExercisePage] = useState(false)
    const[modalDoExercisePage, setModalDoExercisePage] = useState(false)
    const[modalEditExercisePage, setModalEditExercisePage] = useState(false)
    const[ejercicios, setEjercicios] = useState<Ejercicio[]>([])
    const[ejerciciosCopia, setEjerciciosCopia] = useState<Ejercicio[]>([])
    const [selectedExercise, setSelectedExercise] = useState<Ejercicio | null>(null);
    const [mostrarOpciones, setMostrarOpciones] = useState(false)
    const [filtro, setFiltro] = useState('Todos')
    const [filtroTodos, setFiltroTodos] = useState(false)
    const [filtroNivel, setFiltroNivel] = useState(false)
    const [filtroIdioma, setFiltroIdioma] = useState(false)
    const [filtroTipo, setFiltroTipo] = useState(false)
    const [filtroNivelValue, setFiltroNivelValue] = useState('Básico')
    const [filtroTipoValue, setFiltroTipoValue] = useState('Rellenar')
    const [filtroIdiomaValue, setFiltroIdiomaValue] = useState('Español')
    const [renderizarComponente, setRenderizarComponente] = useState(false)
    

    const handleSelectedExercise = (ejercicio : any) =>{
        if(ejercicio == selectedExercise){
            setSelectedExercise(null)
            setMostrarOpciones(false)
        }
        else{
            setSelectedExercise(ejercicio)
            setMostrarOpciones(true)
        }

    }

    const publishExercise = () =>{
        Alert.alert(
            'Publicar ejercicio',
            '¿Seguro que desea publicar este ejercicio?',
            [
              { text: 'Cancelar' },
              { text: 'Aceptar', onPress: async () => {
                var publishExerciseEndpoint = config.API_APP + config.EXERCISE_PATH + config.PUBLISH_EXERCISE_PATH + "?idEjercicio=" + selectedExercise?.id + "&userName=" + userProperties.nombreUsuario
                console.log(publishExerciseEndpoint)
                const credencialesAPI = encode(`${tokenAPI}:`);

                const configHeathers = {
                    headers: {
                      'Authorization': `Basic ${credencialesAPI}`,
                    },
                };
                axios.post(publishExerciseEndpoint,null,configHeathers).then((response) =>{
                    if(response.status == 200){
                        const showAlert = () => {
                            Alert.alert(
                              'Publicar ejercicio',
                              'El ejercicio se ha publicado correctamente',
                              [
                                { text: 'Aceptar'},
                              ],
                              { cancelable: false }
                            );
                          };
                    }
                    else{
                        const showAlert = () => {
                            Alert.alert(
                              'Publicar ejercicio',
                              'Hubo un error al publicar el ejercicio',
                              [
                                { text: 'Aceptar'},
                              ],
                              { cancelable: false }
                            );
                          };
                    } 
                })       
              } },
            ],
            { cancelable: false }
          );

    }

    useEffect(() => {
        let getExercisesEndpoint = config.API_APP + config.USER_PATH + config.USER_GET_EXERCISES_PATH + "?username=" + userProperties.nombreUsuario
        const credencialesAPI = encode(`${tokenAPI}:`);
        const configHeathers = {
            headers: {
                'Authorization': `Basic ${credencialesAPI}`,
            },
        };

        axios.get(getExercisesEndpoint, configHeathers).then((response) =>{
            if(response.status == 200){
                setEjercicios(response.data)
                setEjerciciosCopia(response.data)
            }
        })
    }, [modalEditExercisePage, modalNewExercisePage, renderizarComponente, filtroTodos])

    const borrarEjercicioHandler = (ejercicio : any) =>{
        Alert.alert(
            '¿Estás seguro?',
            'Si está publicado ya no aparecerá a los demás usuarios',
            [
              { text: 'Cancelar' },
              { text: 'Aceptar', onPress: () =>{
                if(ejercicio != null){
                    let deleteExerciseEndpoint = config.API_APP + config.EXERCISE_PATH + config.EXERCISE_DELETE_PATH + "?idEjercicio=" + ejercicio.id
                    const credencialesAPI = encode(`${tokenAPI}:`);

                    const configHeathers = {
                        headers: {
                        'Authorization': `Basic ${credencialesAPI}`,
                        },
                    };
                    axios.delete(deleteExerciseEndpoint, configHeathers)
                    setRenderizarComponente(!renderizarComponente)
                }
              }}
            ]
        )

    }

    const filtrarPorNivel = (nivel : any) =>{
        const filtroNivel = ejerciciosCopia.filter((ejercicio) => ejercicio.nivel == nivel)
        setEjercicios(filtroNivel)
    }
    const filtrarPorIdioma = (idioma : any) =>{
        const filtroIdioma = ejerciciosCopia.filter((ejercicio) => ejercicio.idioma == idioma)
        setEjercicios(filtroIdioma)
    }
    const filtrarPorTipoEjercicio = (tipoejercicio : any) =>{
        const filtroTipo = ejerciciosCopia.filter((ejercicio) => ejercicio.tipoejercicio == tipoejercicio)
        setEjercicios(filtroTipo)
    }

    return (
        <View style ={styles.container}>
                {ejercicios.length == 0 ?  (
                    <View>
                        <ScrollView style={styles.scrollViewStyle} >
                            <View style = {styles.exercisesContainer}>
                                <View style = {styles.campo}>
                                    <Text style = {styles.filterText}>Filtrar Por</Text>
                                    <View style = {styles.campoPicker}>
                                        <View style = {styles.picker}>
                                            <Picker style = {styles.pickerText}
                                                selectedValue={filtro}
                                                onValueChange={(itemValue, itemIndex) => {
                                                    setFiltro(itemValue);
                                                    if(itemValue == "Todos"){
                                                        setRenderizarComponente(!renderizarComponente)
                                                    }
                                                }}
                                                >
                                                    <Picker.Item label="Todos" value="Todos" />
                                                    <Picker.Item label="Nivel" value="Nivel" />
                                                    <Picker.Item label="Idioma" value="Idioma" />
                                                    <Picker.Item label="Tipo" value="Tipo" />
                                            </Picker>
                                        </View>

                                        {filtro == "Nivel" ? (
                                            <View style = {styles.picker}>
                                                <Picker style = {styles.pickerText}
                                                    selectedValue={filtroNivelValue}
                                                    onValueChange={(itemValue, itemIndex) => {
                                                        filtrarPorNivel(itemValue);
                                                        setFiltroNivelValue(itemValue);
                                                    }}
                                                    >
                                                    <Picker.Item label="Básico" value="Básico" />
                                                    <Picker.Item label="Fácil" value="Fácil" />
                                                    <Picker.Item label="Intermedio" value="Intermedio" />
                                                    <Picker.Item label="Difícil" value="Difícil" />
                                                    <Picker.Item label="Avanzado" value="Avanzado" />
                                                </Picker>
                                            </View>
                                        ) : null}
                                        {filtro == "Idioma" ? (
                                            <View style = {styles.picker}>
                                                <Picker style = {styles.pickerText}
                                                    selectedValue={filtroNivelValue}
                                                    onValueChange={(itemValue, itemIndex) => {
                                                        filtrarPorIdioma(itemValue);
                                                        setFiltroIdiomaValue(itemValue);
                                                    }}
                                                    >
                                                        <Picker.Item label="Español" value="Español" />
                                                        <Picker.Item label="Inglés" value="Inglés" />
                                                        <Picker.Item label="Francés" value="Francés" />
                                                        <Picker.Item label="Italiano" value="Italiano" />
                                                        <Picker.Item label="Alemán" value="Alemán" />
                                                        <Picker.Item label="Portugués" value="Portugués" />
                                                        <Picker.Item label="Ruso" value="Ruso" />
                                                </Picker>
                                            </View>
                                        ) : null}
                                        {filtro == "Tipo" ? (
                                            <View style = {styles.picker}>
                                                <Picker style = {styles.pickerText}
                                                    selectedValue={filtroNivelValue}
                                                    onValueChange={(itemValue, itemIndex) => {
                                                        filtrarPorTipoEjercicio(itemValue);
                                                        setFiltroTipoValue(itemValue);
                                                    }}
                                                    >
                                                    <Picker.Item label="Rellenar" value="Rellenar" />
                                                    <Picker.Item label="Test" value="Test" />
                                                    <Picker.Item label="Responder" value="Responder" />
                                                </Picker>
                                            </View>
                                        ) : null}

                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                        <View >
                            <Pressable style = {styles.btnNewNoSelected}
                                onPress={() => setModalNewExercisePage(true)}    >
                                    <Text style = {styles.btnNewText}>+</Text>
                            </Pressable>
                        </View>
                        <Text>No aparecen resultados para sus criterios</Text>
                    </View>

                ):(
                    <ScrollView style={styles.scrollViewStyle} >
                    <View style = {styles.exercisesContainer}>
                        <View style = {styles.campo}>
                            <Text style = {styles.filterText}>Filtrar Por</Text>
                            <View style = {styles.campoPicker}>
                                <View style = {styles.picker}>
                                    <Picker style = {styles.pickerText}
                                        selectedValue={filtro}
                                        onValueChange={(itemValue, itemIndex) => {
                                            setFiltro(itemValue);
                                            if(itemValue == "Todos"){
                                                setRenderizarComponente(!renderizarComponente)
                                            }
                                        }}
                                        >
                                            <Picker.Item label="Todos" value="Todos" />
                                            <Picker.Item label="Nivel" value="Nivel" />
                                            <Picker.Item label="Idioma" value="Idioma" />
                                            <Picker.Item label="Tipo" value="Tipo" />
                                    </Picker>
                                </View>

                                {filtro == "Nivel" ? (
                                    <View style = {styles.picker}>
                                        <Picker style = {styles.pickerText}
                                            selectedValue={filtroNivelValue}
                                            onValueChange={(itemValue, itemIndex) => {
                                                filtrarPorNivel(itemValue);
                                                setFiltroNivelValue(itemValue);
                                            }}
                                            >
                                            <Picker.Item label="Básico" value="Básico" />
                                            <Picker.Item label="Fácil" value="Fácil" />
                                            <Picker.Item label="Intermedio" value="Intermedio" />
                                            <Picker.Item label="Difícil" value="Difícil" />
                                            <Picker.Item label="Avanzado" value="Avanzado" />
                                        </Picker>
                                    </View>
                                ) : null}
                                {filtro == "Idioma" ? (
                                    <View style = {styles.picker}>
                                        <Picker style = {styles.pickerText}
                                            selectedValue={filtroNivelValue}
                                            onValueChange={(itemValue, itemIndex) => {
                                                filtrarPorIdioma(itemValue);
                                                setFiltroIdiomaValue(itemValue);
                                            }}
                                            >
                                                <Picker.Item label="Español" value="Español" />
                                                <Picker.Item label="Inglés" value="Inglés" />
                                                <Picker.Item label="Francés" value="Francés" />
                                                <Picker.Item label="Italiano" value="Italiano" />
                                                <Picker.Item label="Alemán" value="Alemán" />
                                                <Picker.Item label="Portugués" value="Portugués" />
                                                <Picker.Item label="Ruso" value="Ruso" />
                                        </Picker>
                                    </View>
                                ) : null}
                                {filtro == "Tipo" ? (
                                    <View style = {styles.picker}>
                                        <Picker style = {styles.pickerText}
                                            selectedValue={filtroNivelValue}
                                            onValueChange={(itemValue, itemIndex) => {
                                                filtrarPorTipoEjercicio(itemValue);
                                                setFiltroTipoValue(itemValue);
                                            }}
                                            >
                                            <Picker.Item label="Rellenar" value="Rellenar" />
                                            <Picker.Item label="Test" value="Test" />
                                            <Picker.Item label="Responder" value="Responder" />
                                        </Picker>
                                    </View>
                                ) : null}

                            </View>

                        </View>
                        {ejercicios.map((ejercicio, index) => (
                            <TouchableHighlight key = {index}
                                onPress={() => handleSelectedExercise(ejercicio)}
                                style = {[
                                    styles.exerciseContainer,
                                    selectedExercise === ejercicio && styles.selectedContainer
                                ]}>
                                <View>
                                    <Text style = {styles.exerciseTitleFont}>{ejercicio.titulo}</Text>
                                    <View style = {styles.exerciseProperties}>
                                        <Text style = {styles.exercisePropertiesText}>Tipo Ejercicio :</Text>
                                        <Text style = {styles.exercisePropertiesDescriptionText}>{ejercicio.tipoejercicio}</Text>
                                        <Text style = {styles.exercisePropertiesText}>Idioma :</Text>
                                        <Text style = {styles.exercisePropertiesDescriptionText}>{ejercicio.idioma}</Text>
                                        <Text style = {styles.exercisePropertiesText}>Nivel :</Text>
                                        <Text style = {styles.exercisePropertiesDescriptionText}>{ejercicio.nivel}</Text>
                                        <Text style = {styles.exercisePropertiesText}>Nº Apartados :</Text>
                                        <Text style = {styles.exercisePropertiesDescriptionText}>{ejercicio.apartados.length}</Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        ))}
                        
                        </View>
                    </ScrollView>
                    )
                    }
                    {selectedExercise != null ? (
                        <View style = {styles.optionButtons}>
                            <Pressable style = {styles.optionButton}
                                onPress={() => setModalEditExercisePage(true)}    >
                                    <Text style = {styles.btnNewText}>Modificar</Text>
                            </Pressable>
                            <Pressable style = {styles.optionButton}
                                onPress={() => borrarEjercicioHandler(selectedExercise)}    >
                                    <Text style = {styles.btnNewText}>Eliminar</Text>
                            </Pressable>
                            <Pressable style = {styles.optionButton}
                                onPress={() => setModalDoExercisePage(true)}    >
                                    <Text style = {styles.btnNewText}>Realizar</Text>
                            </Pressable>
                            <Pressable style = {styles.optionButton}
                                onPress={() => publishExercise()}    >
                                    <Text style = {styles.btnNewText}>Publicar</Text>
                            </Pressable>
                            <Pressable style = {styles.btnNew}
                                onPress={() => setModalNewExercisePage(true)}    >
                                        <Text style = {styles.btnNewText}>+</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style ={{marginBottom : 20}}>
                            <Pressable style = {styles.btnNewNoSelected}
                                onPress={() => setModalNewExercisePage(true)}    >
                                    <Text style = {styles.btnNewText}>+</Text>
                            </Pressable>
                        </View>
                    )}

                    <NewExercisesPage
                        modalNewExercisePage = {modalNewExercisePage}
                        setModalNewExercisePage = {setModalNewExercisePage}
                        userProperties = {userProperties}
                        setUserProperties = {setUserProperties}
                        tokenAPI = {tokenAPI}
                    />
                     {selectedExercise != null ? (
                        <DoExercisePage
                            userProperties = {userProperties}
                            setUserProperties = {setUserProperties}
                            exerciseProperties = {selectedExercise}
                            setExerciseProperties = {setSelectedExercise}
                            modalDoExercisePage = {modalDoExercisePage}
                            setModalDoExercisePage = {setModalDoExercisePage}
                            tokenAPI = {tokenAPI}
                    
                        />
                     ): null}
                    {selectedExercise != null ? (
                        <EditExercisesPage
                            modalEditExercisePage = {modalEditExercisePage}
                            setModalEditExercisePage = {setModalEditExercisePage}
                            userProperties = {userProperties}
                            setUserProperties = {setUserProperties}
                            selectedExercise = {selectedExercise}
                            setSelectedExercise = {setSelectedExercise}
                            tokenAPI = {tokenAPI}
                    />
                    ) : null}
            </View>

    )
}

const styles = StyleSheet.create({
        profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    dropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
      },
      icon: {
        marginRight: 5,
      },
      label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
      },
      placeholderStyle: {
        fontSize: 16,
      },
      selectedTextStyle: {
        fontSize: 16,
      },
      iconStyle: {
        width: 20,
        height: 20,
      },
      inputSearchStyle: {
        height: 40,
        fontSize: 16,
      },
    container :{
        alignItems: 'center',
        marginTop : 30,
        flex: 1,
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
    
    exerciseProperties:{
        flexDirection: 'row',
    },
    optionButton:{
        width : 80,
        height : 50,
        backgroundColor : "#09B9A3",
        paddingVertical : 15,
        borderRadius : 20,
        marginHorizontal: 5
      },
    btnNew:{
        width : 50,
        height: 50,
        backgroundColor : "#09B9A3",
        paddingVertical : 15,
        marginLeft : 2,
        borderRadius : 30
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
      exerciseContainer :{
        borderRadius : 5,
        marginBottom : 50,
        width : 380,
        height : 55,
        backgroundColor : "#CFF1E2"
        },
      btnNewText: {
        textAlign : 'center',
        color : "#FFF",
        fontWeight : '900',
        textTransform : "uppercase"
      }
})

export default ExercisesPage