import { supabase } from "../supabase";
import { Alert } from "react-native";

export async function getLibros() {
    const { data, error } = await supabase
        .from('libros')
        .select('*');
    if (error) {
        console.error("Error al obtener los libros:", error);
        Alert.alert("Error", "No se pudieron cargar los libros.");
        return [];
    }
    return data;
}