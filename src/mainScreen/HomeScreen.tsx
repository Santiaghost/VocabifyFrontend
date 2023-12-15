import React, { useEffect, useState } from "react";
import config from "../../config/appConfig.json";
import axios from 'axios';
import { decode, DecodeOptions, DecodeResponse } from "react-native-pure-jwt";
import FastImage from 'react-native-fast-image';
import UserProfile from "../users/UserProfile";
import {Picker} from '@react-native-picker/picker';
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
    Image,
    TouchableOpacity,
    TouchableHighlight
} from 'react-native';
import ExercisesPage from "../exercises/ExercisesPage";
import DoExercisePage from "../exercises/DoExercisePage";
import { encode } from "base-64";

export interface Usuario {
    nombreUsuario: string;
    correo: string;
    telefono :string;
    imagenPerfil: string;
}

interface UsuarioApp{
    username : string
}

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

interface EjerciciosPublicados {
    id : number,
    userName : string,
    ejercicioId : Ejercicio,
    likes : number,
    popularidad : number,
    likeado? : boolean
}



const HomeScreen = ({userProperties, setUserProperties, tokenAPI} : {userProperties : any, setUserProperties : any, tokenAPI: any}) => {


    const [ejerciciosMostrar, setEjerciciosMostrar] = useState<EjerciciosPublicados[]>([])
    const [todosEjerciciosPublicados, setTodosEjerciciosPublicados] = useState<EjerciciosPublicados[]>([])
    const [ejerciciosLikes, setEjerciciosLikes] = useState<EjerciciosPublicados[]>([])
    const [ejerciciosRefuerzo, setEjerciciosRefuerzo] = useState<EjerciciosPublicados[]>([])
    const [ejerciciosRealizados, setEjerciciosRealizados] = useState<EjerciciosPublicados[]>([])
    const [renderizarComponente, setRenderizarComponente] = useState(false)
    const [selectedExercise, setSelectedExercise] = useState<Ejercicio | null>(null);
    const [mostrarOpciones, setMostrarOpciones] = useState(false)
    const [filtro, setFiltro] = useState('Todos')
    const [orden, setOrden] = useState('Todos')
    const [filtroTodos, setFiltroTodos] = useState(false)
    const [filtroNivelValue, setFiltroNivelValue] = useState('Básico')
    const [filtroTipoValue, setFiltroTipoValue] = useState('Rellenar')
    const [filtroIdiomaValue, setFiltroIdiomaValue] = useState('Español')
    const[modalDoExercisePage, setModalDoExercisePage] = useState(false)
    const [valorBusqueda, setValorBusqueda] = useState('')

    useEffect(() =>{
        console.log("hola")
        var ejerciciosPublicadosPath = config.API_APP + config.EXERCISE_PATH + config.ALL_PUBLISHED_EXERCISE_PATH

        var ejerciciosLikeadosPath =  config.API_APP + config.EXERCISE_PATH + config.ALL_LIKED_EXERCISES_PATH + "?userName=" + userProperties.nombreUsuario
        var ejerciciosPublicadosUsuarioPath =  config.API_APP + config.EXERCISE_PATH + config.ALL_PUBLISHED_EXERCISES_PATH + "?userName=" + userProperties.nombreUsuario
        var ejerciciosRefuerzoPath =  config.API_APP + config.EXERCISE_PATH + config.BOOSTER_EXERCISE_PATH + "?userName=" + userProperties.nombreUsuario

        const credencialesAPI = encode(`${tokenAPI}:`);

        const configHeathers = {
            headers: {
                'Authorization': `Basic ${credencialesAPI}`,
            },
        };

        axios.get(ejerciciosLikeadosPath, configHeathers).then((response) =>{
            if(response.status == 200){
                let ejerciciosLikesAux : EjerciciosPublicados[] = response.data
                const nuevaLista = ejerciciosLikesAux.map((elemento) => ({
                    ...elemento,
                    likeado: true,
                  }));
                setEjerciciosLikes(nuevaLista)
                axios.get(ejerciciosPublicadosPath, configHeathers).then((response) =>{
                    if(response.status ==200){
                        var ejerciciosMostrarAux : EjerciciosPublicados[] = response.data
                        var contador = 0
                        ejerciciosMostrarAux.forEach((elemento) => {
                            if(ejerciciosLikesAux.some((ejercicioLike) => ejercicioLike.id === elemento.id)){
                                ejerciciosMostrarAux[contador].likeado = true
                            }
                            else{
                                ejerciciosMostrarAux[contador].likeado = false
        
                            }
                            contador++
                        });           
                        if(valorBusqueda != ''){
                            ejerciciosMostrarAux = ejerciciosMostrarAux.filter((elemento) =>
                            elemento.ejercicioId.titulo.toLowerCase().includes(valorBusqueda.toLowerCase())
                             );
                        }
                        setEjerciciosMostrar(ejerciciosMostrarAux)
                        setTodosEjerciciosPublicados(ejerciciosMostrarAux)
                        if(filtro != "Todos"){
                            filterHandler(filtro)
                        }
                    }
                })
            }
        })
        axios.get(ejerciciosRefuerzoPath, configHeathers).then((response) =>{
            if(response.status == 200){
                setEjerciciosRefuerzo(response.data)
            }
        })

    }, [renderizarComponente])

    const orderHandler =(value : any) =>{
        if(value == "Gustados"){
            setOrden("Gustados")
            const nuevaLista = [...ejerciciosMostrar];
            nuevaLista.sort((a, b) => b.likes - a.likes); 
            setEjerciciosMostrar(nuevaLista)
        }
        else{
            setOrden(value)
        }
    }

    const handleBusqueda = (valor : any) =>{
        setValorBusqueda(valor)
        var ejerciciosMostrarAux = [...ejerciciosMostrar]
        ejerciciosMostrarAux = ejerciciosMostrarAux.filter((elemento) =>
            elemento.ejercicioId.titulo.toLowerCase().includes(valorBusqueda.toLowerCase())
        );
        setEjerciciosMostrar(ejerciciosMostrarAux)
    }

    const handleSelectedExercise = (ejercicio : any) =>{
        if(ejercicio.id == selectedExercise?.id){
            setSelectedExercise(null)
            setMostrarOpciones(false)
        }
        else{
            setSelectedExercise(ejercicio)
            setMostrarOpciones(true)
        }

    }

    const likeEjercicioHandler = (ejercicioPublicado : EjerciciosPublicados) =>{
        if(ejercicioPublicado.likeado != true){
            var likeEjercicio = config.API_APP + config.EXERCISE_PATH + config.LIKE_EXERCISE_PATH + "?userName=" + userProperties.nombreUsuario + "&idEjercicio=" + ejercicioPublicado.ejercicioId.id
            const credencialesAPI = encode(`${tokenAPI}:`);

            const configHeathers = {
                headers: {
                    'Authorization': `Basic ${credencialesAPI}`,
                },
            };
            axios.post(likeEjercicio, configHeathers)
            setRenderizarComponente(!renderizarComponente)
        }
        else{
            var dislikeEjercicio = config.API_APP + config.EXERCISE_PATH + config.DISLIKE_EXERCISE_PATH + "?userName=" + userProperties.nombreUsuario + "&idEjercicio=" + ejercicioPublicado.ejercicioId.id
            const credencialesAPI = encode(`${tokenAPI}:`);
            const configHeathers = {
                headers: {
                    'Authorization': `Basic ${credencialesAPI}`,
                },
            };
            axios.delete(dislikeEjercicio, configHeathers)
            setRenderizarComponente(!renderizarComponente)
        }
    }

    const filterHandler =(value : any) =>{
        if(value == "Favoritos"){
            setFiltro("Favoritos")
            setEjerciciosMostrar([...ejerciciosLikes])
        }
        else if(value == "Nivel"){
            setFiltro("Nivel")
            filtrarPorNivel(filtroNivelValue)
        }
        else if(value == "Idioma"){
            setFiltro("Idioma")
            filtrarPorIdioma(filtroIdiomaValue)
        }
        else if(value == "Tipo"){
            setFiltro("Tipo")
            filtrarPorTipoEjercicio(filtroTipoValue)
        }
        else if(value == "Refuerzo"){
            setFiltro("Refuerzo")
            var ejerciciosPublicadosTodos = [...todosEjerciciosPublicados]
            var ejerciciosRefuerzoPublicados = [...ejerciciosRefuerzo]
            const mostrarEjerciciosRefuerzo : EjerciciosPublicados[] =  ejerciciosPublicadosTodos.filter((ej) => ejerciciosRefuerzoPublicados.some((ej2) => ej.ejercicioId.id == ej2.ejercicioId.id))
            setEjerciciosMostrar(mostrarEjerciciosRefuerzo)
        }
    }

    const filtrarPorNivel = (nivel : any) =>{
        const filtroNivel = todosEjerciciosPublicados.filter((ejercicio) => ejercicio.ejercicioId.nivel == nivel)
        setEjerciciosMostrar(filtroNivel)
    }
    const filtrarPorIdioma = (idioma : any) =>{
        const filtroIdioma = todosEjerciciosPublicados.filter((ejercicio) => ejercicio.ejercicioId.idioma == idioma)
        setEjerciciosMostrar(filtroIdioma)
    }
    const filtrarPorTipoEjercicio = (tipoejercicio : any) =>{
        const filtroTipo = todosEjerciciosPublicados.filter((ejercicio) => ejercicio.ejercicioId.tipoejercicio == tipoejercicio)
        setEjerciciosMostrar(filtroTipo)
    }


    return(
        <View style ={styles.container}>
                    {ejerciciosMostrar.length == 0 ?  (
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
                                                    setFiltro(itemValue)
                                                    setRenderizarComponente(!renderizarComponente)

                                                }}
                                                >
                                                    <Picker.Item label="Todos" value="Todos" />
                                                    <Picker.Item label="Nivel" value="Nivel" />
                                                    <Picker.Item label="Idioma" value="Idioma" />
                                                    <Picker.Item label="Tipo" value="Tipo" />
                                                    <Picker.Item label="Mis favoritos" value="Favoritos" />
                                                    <Picker.Item label="Refuerzo" value="Refuerzo" />
                                            </Picker>
                                        </View>

                                        {filtro == "Nivel" ? (
                                            <View style = {styles.picker}>
                                                <Picker style = {styles.pickerText}
                                                    selectedValue={filtroNivelValue}
                                                    onValueChange={(itemValue, itemIndex) => {
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
                                                    selectedValue={filtroIdiomaValue}
                                                    onValueChange={(itemValue, itemIndex) => {
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
                                                    selectedValue={filtroTipoValue}
                                                    onValueChange={(itemValue, itemIndex) => {
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
                                    <TextInput
                                        placeholder="Buscar..."
                                        style = {styles.input}
                                        onChangeText={(valor) => handleBusqueda(valor)}
                                    />
                                </View>
                            </View>
                        </ScrollView>
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
                                            setFiltro(itemValue)
                                            setRenderizarComponente(!renderizarComponente)
                                        }}
                                        >
                                            <Picker.Item label="Todos" value="Todos" />
                                            <Picker.Item label="Nivel" value="Nivel" />
                                            <Picker.Item label="Idioma" value="Idioma" />
                                            <Picker.Item label="Tipo" value="Tipo" />
                                            <Picker.Item label="Mis favoritos" value="Favoritos" />
                                            <Picker.Item label="Refuerzo" value="Refuerzo" />
                                    </Picker>
                                </View>
                                

                                {filtro == "Nivel" ? (
                                    <View style = {styles.pickerOption}>
                                        <Picker style = {styles.pickerText}
                                            selectedValue={filtroNivelValue}
                                            onValueChange={(itemValue, itemIndex) => {
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
                                    <View style = {styles.pickerOption}>
                                        <Picker style = {styles.pickerText}
                                            selectedValue={filtroIdiomaValue}
                                            onValueChange={(itemValue, itemIndex) => {
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
                                    <View style = {styles.pickerOption}>
                                        <Picker style = {styles.pickerText}
                                            selectedValue={filtroTipoValue}
                                            onValueChange={(itemValue, itemIndex) => {
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
                            <Text style = {styles.filterText}>Ordenar Por</Text>
                            <View style = {styles.pickerOrder}>
                                    <Picker style = {styles.pickerText}
                                        selectedValue={orden}
                                        onValueChange={(itemValue, itemIndex) => {
                                            orderHandler(itemValue);
                                            if(itemValue == "Todos"){
                                                setRenderizarComponente(!renderizarComponente)
                                            }
                                        }}
                                        >
                                            <Picker.Item label="Mas recomendados" value="Recomendados" />
                                            <Picker.Item label="Mas gustados" value="Gustados" />
                                            <Picker.Item label="Mas realizados" value="Realizados" />
                                    </Picker>
                                </View>

                            <TextInput
                                placeholder="Buscar..."
                                style = {styles.input}
                                onChangeText={(valor) => handleBusqueda(valor)}
                            />

                        </View>
                        {ejerciciosMostrar.map((ejercicio, index) => (
                            <TouchableHighlight key = {index}
                                onPress={() => handleSelectedExercise(ejercicio.ejercicioId)}
                                style = {[
                                    styles.exerciseContainer,
                                    selectedExercise?.id === ejercicio.ejercicioId.id && styles.selectedContainer
                                ]}>
                                <View style = {styles.ejerciseContainer} key={index}>
                                    <Text style = {styles.exerciseTitleFont}>{ejercicio.ejercicioId.titulo}</Text>
                                    <View style = {styles.exerciseProperties}>
                                        <Text style = {styles.exercisePropertiesText}>Publicado por :</Text>
                                        <Text style = {styles.exercisePropertiesDescriptionText}>{ejercicio.userName}</Text>
                                        <Image
                                            source={{ uri: `${config.API_APP}${config.USER_PATH}${config.USERNAME_IMAGES_PATH}?userName=${ejercicio.userName}&v=${Date.now()}` }}
                                            style={styles.imagenUsuario}                                      
									   />
                                    </View>
                                    <View style = {styles.exerciseProperties}>
                                        <Text style = {styles.exercisePropertiesText}>Tipo:</Text>
                                        <Text style = {styles.exercisePropertiesDescriptionText}>{ejercicio.ejercicioId.tipoejercicio}</Text>
                                        <Text style = {styles.exercisePropertiesText}>Idioma :</Text>
                                        <Text style = {styles.exercisePropertiesDescriptionText}>{ejercicio.ejercicioId.idioma}</Text>
                                        <Text style = {styles.exercisePropertiesText}>Nivel :</Text>
                                        <Text style = {styles.exercisePropertiesDescriptionText}>{ejercicio.ejercicioId.nivel}</Text>
                                        <Text style = {styles.exercisePropertiesText}>Apartados :</Text>
                                        <Text style = {styles.exercisePropertiesDescriptionText}>{ejercicio.ejercicioId.apartados.length}</Text>
                                        <Pressable style = {styles.containerImagenCorazon}
                                            onPress={() =>{ 
                                                likeEjercicioHandler(ejercicio)
                                                setRenderizarComponente(!renderizarComponente)
                                            }}>
                                        {ejercicio.likeado == true ? (
                                            <Image
                                                source={require('../../assets/images/ejercicios/corazonLleno.png')}
                                                style={[styles.imagenCorazon, {marginTop : -5}]}
                                            />
                                        ) : (
                                            <Image
                                                source={require('../../assets/images/ejercicios/corazonVacio.png')}
                                                style={[styles.imagenCorazon, {marginTop : -5}]}
                                            />
                                        )}
                                        </Pressable>
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
                                onPress={() => setModalDoExercisePage(true)}    >
                                    <Text style = {styles.btnNewText}>Realizar</Text>
                            </Pressable>
                        </View>
                    ) : null}
                    {selectedExercise != null ? (
                        <DoExercisePage
                            userProperties = {userProperties}
                            setUserProperties = {setUserProperties}
                            exerciseProperties = {selectedExercise}
                            setExerciseProperties = {setSelectedExercise}
                            modalDoExercisePage = {modalDoExercisePage}
                            setModalDoExercisePage = {setModalDoExercisePage}
                    
                        />
                     ): null}

        </View>
    )

}

export default HomeScreen




const styles = StyleSheet.create({
    container :{
        alignItems: 'center',
        marginTop : 30,
        flex: 1,
    },
    input:{
        backgroundColor : '#FFF',
        padding : 15,
        borderRadius : 10,
        marginBottom : 15,
        width : 300
    },
    ejerciseContainer:{
        marginVertical : 0
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
    },
    pickerOption: {
        backgroundColor : '#FFF',
        marginBottom : 15,
        width : 150,
        height : 40,
        alignContent : 'center',
        marginLeft: 15
    },
    pickerOrder :{
        backgroundColor : '#FFF',
        marginBottom : 15,
        width : 200,
        height : 40,
        alignContent : 'center',
  
    },
    containerImagenCorazon : {
        marginBottom : 40
    },
    imagenUsuario:{
        height : 20,
        width : 20,
        borderRadius : 15,
        marginLeft : 5,
        marginTop : -5
    },
    imagenCorazon:{
        height : 30,
        width : 30,
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
        marginVertical : 3
    },
    exercisePropertiesText :{
        fontSize : 10,
        fontWeight : 'bold',
        color : 'black',
        marginLeft : 5
    },
    exerciseLikesDescriptionText :{
        fontSize : 6,
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
      btnNewNoSelected:{
        width : 50,
        height: 50,
        backgroundColor : "#09B9A3",
        paddingVertical : 15,
        marginLeft : 330,
        borderRadius : 30
      },
      exerciseContainer :{
        borderRadius : 5,
        marginBottom : 50,
        width : 380,
        height : 65,
        backgroundColor : "#CFF1E2"
    },
      selectedContainer:{
        marginBottom : 50,
        width : 380,
        height : 65,
        backgroundColor: 'lightblue', 
      },
      btnNewText: {
        textAlign : 'center',
        color : "#FFF",
        fontWeight : '900',
        textTransform : "uppercase"
      }
})