import React, { useEffect, useState } from "react";
import config from "../../config/appConfig.json";
import axios from 'axios';
import { decode, DecodeOptions, DecodeResponse } from "react-native-pure-jwt";
import FastImage from 'react-native-fast-image';
import UserProfile from "../users/UserProfile";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    TouchableOpacity
} from 'react-native';
import ExercisesPage from "../exercises/ExercisesPage";
import HomeScreen from "./HomeScreen";
import EstadisticPage from "../estadistics/EstadisticsPage";

export interface Usuario {
    nombreUsuario: string;
    correo: string;
    telefono :string;
    imagenPerfil: string;

}

const MainScreen = ({ modalLogged, setModalLogged, token, setToken, tokenAPI, setTokenAPI }: any) => {
    const [userProperties, setUserProperties] = useState<Usuario>()
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [fotoPerfil, setfotoPerfil] = useState('')
    const [mostrarImagen, setMostrarImagen] = useState(false);
    const [modalProfile, setModalProfile] = useState(false)
    const [modalExercises, setModalExercises] = useState(false)
    const [modalHome, setModalHome] = useState(false)
    const [modalEstadistics, setModalEstadistics] = useState(false)

    const cerrarSesionHandler = () =>{
        const usuarioVacio  = {
            nombreUsuario : "",
            correo : "",
            telefono : "",
            imagenPerfil : ""
        }
        deleteUserToken()
        setUserProperties(usuarioVacio)
        setIsDropdownVisible(false)
        setModalLogged(false)
        setToken('')
        setMostrarImagen(false)
        setfotoPerfil('')
        setModalExercises(false)
        setModalHome(false)
        setModalEstadistics(false)
    }

    const modalExerciseHandler = () =>{
        setModalExercises(true)
        setModalEstadistics(false)
        setModalHome(false)
    }

    const modalHomeHandler = () =>{
        setModalHome(true)
        setModalEstadistics(false)
        setModalExercises(false)
    }

    const modalEstadisticsHandler = () =>{
        setModalEstadistics(true)
        setModalHome(false)
        setModalExercises(false)
    }

    const saveUserToken = async (userToken : any) =>{
        AsyncStorage.setItem('tokenUsuario', JSON.stringify(userToken))
    }
    const deleteUserToken = async () =>{
        AsyncStorage.removeItem('tokenUsuario')
    }
  

    useEffect(() => {
        const fetchData = async () => {
            const secretKey = config.TOKEN_KEY;
            try {
                if (token !== "") {
                    const decoded = await decode(token, secretKey);
                    if (decoded && typeof decoded === 'object') {
                        const usuario: Usuario = decoded.payload as Usuario;
                        setUserProperties(usuario);
                        saveUserToken(token)
                        if (usuario.imagenPerfil !== "") {
                            setMostrarImagen(true);
                            let imageURL = `${config.API_APP}${config.USER_PATH}${config.IMAGES_PATH}?imageName=${usuario.imagenPerfil}&v=${Date.now()}`;
                            setfotoPerfil(imageURL);
                        }
                    }
                }
            } catch (error) {
                console.log('Error al decodificar el token:', error);
            }
        };
        fetchData();
    }, [token]);

    return (
        <Modal animationType="slide" visible={modalLogged}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <Text style={styles.headerTitle}>Hola {userProperties?.nombreUsuario}</Text>
                        <TouchableOpacity
                            onPress={() => setIsDropdownVisible(!isDropdownVisible)}
                        >
                            {mostrarImagen ? (
                                <View>
                                    <FastImage
                                        source={{ uri: fotoPerfil }}
                                        style={styles.profileIcon}                                      
                                    />
                                </View>
                            ) :(
                                <View>
                                    <Image
                                        source={require('../../assets/images/profile.png')}
                                        style={styles.profileIcon}
                                    />
                                </View>
                            )}


                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.menuOptionsContainer}
                    >
                        <TouchableOpacity style={styles.menuOption} onPress={modalHomeHandler}>
                            <Text style={styles.optionText}>Home</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuOption} onPress={modalExerciseHandler}>
                            <Text style={styles.optionText}>Mis ejercicios</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuOption} onPress={modalEstadisticsHandler}>
                            <Text style={styles.optionText}>Mis estadísticas</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {modalExercises && <ExercisesPage userProperties={userProperties} setUserProperties={setUserProperties} tokenAPI={tokenAPI} />}
                {modalHome && <HomeScreen userProperties={userProperties} setUserProperties={setUserProperties} tokenAPI={tokenAPI} />}
                {modalEstadistics && <EstadisticPage userProperties={userProperties} setUserProperties={setUserProperties} tokenAPI={tokenAPI} />}
            </View>


            

            <UserProfile
                modalProfile={modalProfile}
                setModalProfile={setModalProfile}
                userProperties={userProperties}
                setUserProperties={setUserProperties}
                fotoPerfil={fotoPerfil}
                setfotoPerfil={setfotoPerfil}
                mostrarImagen={mostrarImagen}
                tokenAPI={tokenAPI}
            />

            <Modal animationType="none" transparent={true} visible={isDropdownVisible}>
                <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                        style={styles.closeDropdownButton}
                        onPress={() => setModalProfile(true)}
                    >
                        <Text style={styles.profileIconContainer}>Mis opciones</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.closeDropdownButton}
                        onPress={cerrarSesionHandler}
                    >
                        <Text style={styles.closeSesionText}>Cerrar sesión</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.closeDropdownButton}
                        onPress={() => setIsDropdownVisible(false)}
                    >
                        <Text style={styles.closeDropdownText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </Modal>


    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        backgroundColor: "#09B9A3",
        paddingVertical: 10,
    },
    exerciseContainer:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        marginBottom: 350,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    profileOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    profileIconContainer: {
        fontSize: 16,
        color: "black",
    },
    headerTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    menuOptionsContainer: {
        paddingVertical: -15,
        paddingHorizontal: 16,
    },
    menuOptions: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuOption: {
        padding: 10,
        marginRight: 50,
    },
    optionText: {
        fontSize: 14,
    },
    dropdownContainer: {
        position: "absolute",
        top: 60, 
        right: 10, 
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
    },
    closeDropdownButton: {
        alignItems: "center",
    },
    closeDropdownText: {
        fontSize: 16,
        color: "red",
    },
    closeSesionText: {
        fontSize: 16,
        color: "blue",
    },
});

export default MainScreen;
