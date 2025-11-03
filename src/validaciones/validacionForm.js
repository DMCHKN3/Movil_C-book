
export const validarform = (user, contra, nombre, apellidos, correo) =>{
  const resUser = /^[0-9]{10}$/;
  const resContra = /^[A-Za-z0-9\-_.,"#%]{7,16}$/;
  const resNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,100}$/;
  const resApellidos = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,100}$/;
  const resCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if(!user || !contra || !nombre || !apellidos || !correo){
    Alert.alert('Error', 'Por favor complete todos los campos');
    return false;
  }

  if(!resUser.test(user)){
    Alert.alert('Error', 'El usuario debe ser tu boleta de 10 dígitos');
    return false;
  }
    if(!resContra.test(contra)){
    Alert.alert('Error', 'La contraseña solo puede contener letras, números y los símbolos -_.,”#%');
    return false;
  }
    if(!resNombre.test(nombre)){
    Alert.alert('Error', 'El nombre solo puede contener letras y espacios con un mínimo de 2 caracteres y máximo de 100');
    return false;
  }

    if(!resApellidos.test(apellidos)){
    Alert.alert('Error', 'Los apellidos solo pueden contener letras y espacios con un mínimo de 2 caracteres y máximo de 100');
    return false;
  }

  if(!resCorreo.test(correo)){
    Alert.alert('Error', 'El correo debe de tener un formato válido (ejemplo@dominio.com)');
    return false;
  }

  return true;
}