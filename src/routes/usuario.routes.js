const { Router } = require('express');
const router = Router();

const { verifyToken, isAdmin } = require('../middlewares/authJwt')


// Controladores
const {
    getUsuarios,
    getUsuario,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    inicioSesion,
    validarSesion
} = require('../controllers/usuarios.controllers.js');


// Rutas

// OBTENER TODOS LOS USUARIOS
router.get('/usuarios', [verifyToken, isAdmin], getUsuarios)

// OBETENER UN USUARIO
router.get('/usuarios/:id', [verifyToken, isAdmin], getUsuario)

// CREAR UN USUARIO
router.post('/usuarios', createUsuario)

// ACTUALIZAR UN USUARIO
router.put('/usuarios', [verifyToken], updateUsuario)

// ELIMINAR UN USUARIO
router.delete('/usuarios/:id', [verifyToken, isAdmin], deleteUsuario)

// INICIAR SESIÓN
router.post('/login', inicioSesion)


// VALIDAR SESSION
router.get('/validar-sesion', [verifyToken, isAdmin], validarSesion)

module.exports = router;
