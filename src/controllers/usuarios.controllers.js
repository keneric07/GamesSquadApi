const usuarioController = {};

// Base de datos
const { db } = require('../database');
const jwt = require('jsonwebtoken');



// validar que vengan todos los campos sino enviar un error, para todos los empoints



// OBTENER TODOS LOS USUARIOS
usuarioController.getUsuarios = async (req, res) => {

    // Referencia a la colección
    try {
        const usuariosRef = db.collection('usuario');
        const snapshot = await usuariosRef.get();
        const documentos = snapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() }
        });
        res.json(documentos);
    } catch (error) {
        console.log('Error al obtener los documentos', error);
        res.status(500).json({ error: 'Error al obtener los documentos' });
    }

}



// OBTENER UN USUARIO
usuarioController.getUsuario = async (req, res) => {

    // Referencia a la colección
    try {
        const usuariosRef = db.collection('usuario');
        const snapshot = await usuariosRef.doc(req.params.id).get();
        if (snapshot.exists) {
            const data = { id: snapshot.id, ...snapshot.data() };
            res.json(data);
        } else {
            res.status(409).json({ error: 'El usuario no existe' });
        }
    } catch (error) {
        console.log('Error al obtener los documentos', error);
        res.status(500).json({ error: 'Error al obtener los documentos' });
    }
}



// CREAR UN USUARIO
usuarioController.createUsuario = async (req, res) => {
    // Referencia a la colección
    try {
        const newUser = req.body;

        newUser.correo = newUser.correo.toLowerCase();
        const usuariosRef = db.collection('usuario');
        const snapshot = await usuariosRef.where('correo', '==', newUser.correo).get();
        const documentos = snapshot.docs.map(doc => doc.data());

        if (documentos.length > 0) {
            res.status(409).json({ error: 'El usuario ya existe' });
        } else {
            await db
                .collection('usuario')
                .doc()
                .create(req.body);

            res.json({ message: 'Usuario creado correctamente' });
        }

    } catch (error) {
        console.log('Error al crear el documento', error);
        res.status(500).json({ error: 'Error al crear el documento' });
    }
}


// ACTUALIZAR UN USUARIO
usuarioController.updateUsuario = async (req, res) => {


    const updateUser = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        // correo: req.body.correo.toLowerCase(),
        // contraseña: req.body.contraseña,
        // tipo_usuario: req.body.tipo_usuario,
        edad: req.body.edad,
        avatar: req.body.avatar,
    }



    // Referencia a la colección
    try {
        const usuariosRef = db.collection('usuario');
        const snapshot = await usuariosRef.doc(req.body.id).get();

        if (!snapshot.exits) {
            await db
                .collection('usuario')
                .doc(req.body.id)
                .update(updateUser);

            res.json({ message: 'Usuario actualizado correctamente' });
        } else {
            res.status(409).json({ error: 'El usuario no existe' });
        }

    } catch (error) {
        console.log('Error al actualizar el documento', error);
        res.status(500).json({ error: 'Error al actualizar el documento' });
    }
}



// ELIMINAR UN USUARIO
usuarioController.deleteUsuario = async (req, res) => {

    // Referencia a la colección
    try {
        const usuariosRef = db.collection('usuario');
        const snapshot = await usuariosRef.doc(req.params.id).get();

        if (snapshot.empty) {
            await db
                .collection('usuario')
                .doc(req.params.id)
                .delete();

            res.json({ message: 'Usuario eliminado correctamente' });
        } else {
            res.status(409).json({ error: 'El usuario no existe' });
        }

    } catch (error) {
        console.log('Error al eliminar el documento', error);
        res.status(500).json({ error: 'Error al eliminar el documento' });
    }
}


usuarioController.inicioSesion = async (req, res) => {
    const { correo, contraseña } = req.body;

    const usuariosRef = db.collection('usuario');
    const snapshot = await usuariosRef.where('correo', '==', correo).get();

    if (snapshot.empty)
        return res.status(400).json({ message: 'Usuario y/o contraseña incorrectos' })

    const documentos = snapshot.docs.map(doc => { return { id: doc.id, ...doc.data() } });


    if (documentos[0].contraseña !== contraseña)
        return res.status(401).json({ message: 'Usuario y/o contraseña incorrectos' })

    const token = jwt.sign({ id: documentos[0].id }, process.env.JWT, { expiresIn: '1h' });
    console.log(token);
    res.status(200).json({
        token
    })
}



usuarioController.validarSesion = async (req, res) => {
    res.status(200).json({
        message: 'ok'
    })
}



module.exports = usuarioController;