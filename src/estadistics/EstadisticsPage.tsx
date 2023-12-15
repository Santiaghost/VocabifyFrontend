import React, { useEffect, useState } from "react";
import config from "../../config/appConfig.json";
import axios from 'axios';
import { decode, DecodeOptions, DecodeResponse } from "react-native-pure-jwt";
import FastImage from 'react-native-fast-image';
import UserProfile from "../users/UserProfile";
import {Picker} from '@react-native-picker/picker';
import PieChart from 'react-native-pie-chart'
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

const EstadisticPage = ({userProperties, setUserProperties, tokenAPI} : {userProperties : any, setUserProperties : any, tokenAPI : any}) => {

    interface Estadisticas {
        id? : number,
        idiomaPreferido : string,
        tipoPreferido : string,
        nivelPreferido : string
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

    interface Resultados {
        id? : number,
        ejercicioId : Ejercicio,
        nota : number
    }

    const[estadisticasUsuario, setEstadisticasUsuario] = useState<Estadisticas | null>(null)
    const[resultados, setResultados] = useState<Resultados[]>([])
    const[renderizarComponente, setRenderizarComponente] = useState(false)
    const[aprobados, setAprobados] = useState(1)
    const[suspensos, setSuspensos] = useState(1)

    const sliceColor = ['#0AF706', '#F80808']
    const widthAndHeight = 250


    useEffect (() =>{
        setAprobados(1)
        setSuspensos(1)
        var estadisticasUsuarioEndpoint = config.API_APP + config.EXERCISE_PATH + config.USER_ESTADISTICS_PATH + "?userName=" + userProperties.nombreUsuario
        const credencialesAPI = encode(`${tokenAPI}:`);

        const configHeathers = {
            headers: {
                'Authorization': `Basic ${credencialesAPI}`,
            },
        };

        axios.get(estadisticasUsuarioEndpoint, configHeathers).then((response) =>{
            if(response.status == 200){
                setEstadisticasUsuario(response.data)
            }
        })
        var resultadosUsuarioEndpoint = config.API_APP + config.EXERCISE_PATH + config.USER_RESULTS_PATH + "?userName=" + userProperties.nombreUsuario
        axios.get(resultadosUsuarioEndpoint, configHeathers).then((response) =>{
            if(response.status == 200){
                setResultados(response.data)
                var resultados : Resultados[]
                resultados = response.data

                var aprobadosRes = resultados.filter((elemento) => elemento.nota >= 5).length;
                var suspensosRes = resultados.filter((elemento) => elemento.nota < 5).length;
                setAprobados(aprobadosRes)
                setSuspensos(suspensosRes)

                var listaSuspensos = resultados.filter((elemento) => elemento.nota < 5);
                

            }
        })

    },[renderizarComponente])

    return(
        <View style ={styles.container}>
            <ScrollView style={styles.scrollViewStyle} >
               <Text style = {styles.titleFormat}>Tus Preferencias</Text>
               <View style = {styles.table}>
                    <View style = {styles.tableRow}>
                        <Text style = {styles.mainCelda}>Idioma preferido</Text>
                        <Text style = {styles.mainCelda}>Tipo ejercicio favorito</Text>
                        <Text style = {styles.mainCelda}>Nivel más habituado</Text>
                    </View>
                    <View style = {styles.tableRow}>
                        <Text style = {styles.celda}>{estadisticasUsuario?.idiomaPreferido}</Text>
                        <Text style = {styles.celda}>{estadisticasUsuario?.tipoPreferido}</Text>
                        <Text style = {styles.celda}>{estadisticasUsuario?.nivelPreferido}</Text>
                    </View>
               </View>
               <Text style = {styles.titleFormat}>Tus Resultados</Text>
               <View style = {styles.table}>
                    <View style = {styles.tableRow}>
                        <Text style = {styles.mainCelda}>Título ejercicio</Text>
                        <Text style = {styles.mainCelda}>Idioma</Text>
                        <Text style = {styles.mainCelda}>Nivel</Text>
                        <Text style = {styles.mainCelda}>Nota</Text>
                    </View>
                    {resultados.map((resultado, index) => (
                        <View style = {styles.tableRow} key = {index}>
                            <Text style = {styles.celda}>{resultado.ejercicioId.titulo}</Text>
                            <Text style = {styles.celda}>{resultado.ejercicioId.idioma}</Text>
                            <Text style = {styles.celda}>{resultado.ejercicioId.nivel}</Text>
                            {resultado.nota < 5 ? (
                                <Text style = {[styles.celda, {color : 'red'}]}>{resultado.nota}</Text>

                            ) : (
                                <Text style = {[styles.celda, {color : 'green'}]}>{resultado.nota}</Text>
                            )}
                        </View>

                    ))}
                </View>
                {aprobados > 0 && suspensos > 0 ?
                    (                
                        <View style = {styles.graphicContainer}>
                            <Text style={styles.title}>Tus estadísticas</Text>
                            <View style={styles.legend}>
                                <Text style={styles.legendTitle}>Suspensos ({suspensos})</Text>
                                <View style={styles.failLegend}/>
                                <Text style={styles.legendTitle}>Aprobados ({aprobados})</Text>
                                <View style={styles.passLegend}/>
                            </View>
                            <PieChart
                                widthAndHeight={widthAndHeight}
                                series={[aprobados,suspensos]}
                                sliceColor={sliceColor}
                                coverRadius={0.45}
                                coverFill={'#FFF'}
                            />
                        </View>
                    ) : null
                }
                <Text style = {styles.titleFormat}>Te recomendamos que realices ejercicios de refuerzo de los siguientes idiomas y su correspondiente nivel</Text>
                <View style = {styles.table}>
                    <View style = {styles.tableRow}>
                        <Text style = {styles.mainCelda}>Idioma</Text>
                        <Text style = {styles.mainCelda}>Nivel</Text>
                    </View>
                    {resultados.filter((elemento) => elemento.nota < 5).map((resultado, index) => (
                        <View style = {styles.tableRow}>
                            <Text style = {styles.celda}>{resultado.ejercicioId.idioma}</Text>
                            <Text style = {styles.celda}>{resultado.ejercicioId.nivel}</Text>
                        </View>

                    ))}
                </View>


            </ScrollView>
        </View>
    )


}




export default EstadisticPage;

const styles = StyleSheet.create({
    titleFormat:{
        margin: 10,
    },
    title: {
        fontSize: 24,
        margin: 10,
    },
    legend : {
        flexDirection: 'row',
    },
    passLegend:{
        backgroundColor : "#0AF706",
        width : 10,
        height : 10,
        marginTop : 18,
        marginRight :19
    },
    failLegend:{
        backgroundColor : "#F80808",
        width : 10,
        height : 10,
        marginTop : 18,
        marginRight :19
    },
    legendTitle : {
        fontSize: 17,
        margin: 10,
    },
    graphicContainer:{
        alignItems: 'center',
        padding : 0
    },
    table :{
        borderWidth: 1,
        borderColor: '#000',
        margin: 10,
        width : 360,
    },
    mainTableRow:{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
    },
    mainCelda : {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#000',
        textAlign: 'center',
        fontWeight : 'bold',
        color : 'white',
        backgroundColor : '#0EF0D3',
        height : 60
    },
    tableRow:{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
    },
    celda : {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#000',
        textAlign: 'center',
    },
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