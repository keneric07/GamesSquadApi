const jwt = require('jsonwebtoken')

const carritoControllers = {}


// BASE DE DATOS
const { db } = require('../database');


// SI EL ESTADO DEL CARRITO ES FALSO QUIERE DECIR QUE AÚN NO SE HA COMPRADO

carritoControllers.getCarrito = async (req, res) => {

    try {
        const token = req.headers['x-access-token'];
        const decode = jwt.verify(token, process.env.JWT);
        userId = decode.id;

        const usuariosRef = db.collection('carrito');
        const snapshot = await usuariosRef.where('usuario', '==', userId).where('estado', '==', false).get();
        const data = snapshot.docs.map(async (doc) => {
            const data = await doc.data();
            const juego = await db.collection('juego').doc(data.juego).get();
            const juegoData = juego.data();


            const fechaEnMilisegundos = doc._createTime._seconds * 1000 + Math.floor(doc._createTime._nanoseconds / 1e6);
            const fecha = new Date(fechaEnMilisegundos);

            return {
                id: doc.id,
                titulo: juegoData.titulo,
                imagen: juegoData.images[0],
                estado: data.estado,
                precio: data.precio,
                cantidad: data.cantidad,
                fecha: fecha
            }
        });

        const resolvedData = await Promise.all(data);

        res.json(resolvedData);

    } catch (error) {
        console.log('Error al obtener los documentos', error);
        res.status(500).json({ error: 'Error al obtener los documentos' });
    }
}

carritoControllers.addJuego = async (req, res) => {
    const token = req.headers['x-access-token'];
    const decode = jwt.verify(token, process.env.JWT);
    userId = decode.id;

    const { usuario, juego, precio, cantidad } = req.body;

    try {
        const carritoRef = db.collection('carrito');
        const juegoRef = db.collection('juego').doc(juego);
        const juegoData = await juegoRef.get();

        const newCarrito = {
            usuario: userId,
            juego: juego,
            precio: juegoData.data().precio,
            cantidad: 1,
            estado: false,
        };

        await carritoRef
            .doc()
            .create(newCarrito);

        res.json({ mensaje: 'Se ha agregado el juego al carrito' });

    } catch (error) {
        console.log('Error al agregar el juego al carrito', error);
        res.status(500).json({ error: 'Error al agregar el juego al carrito' });
    }
}

carritoControllers.sumarCantidadJuego = async (req, res) => {

    const { id } = req.params;

    try {
        const carritoRef = db.collection('carrito').doc(id);
        const carrito = await carritoRef.get();
        const llaveRef = db.collection('llave').where('juego', '==', carrito.data().juego);
        const juegoRef = db.collection('juego').doc(carrito.data().juego);

        const llavesData = await llaveRef.get();
        const llaves = llavesData.docs[0]
        const cantidadTotal = llaves.data().llaves.length;
        const juego = await juegoRef.get();
        const precio = juego.data().precio;

        if (carrito.data().cantidad >= cantidadTotal) {
            return res.status(500).json({ error: 'No hay más llaves disponibles' });
        }

        let cantidad = carrito.data().cantidad + 1

        await carritoRef.update({
            cantidad: cantidad,
            precio: precio * cantidad
        });

        res.json({ mensaje: 'Se ha actualizado la cantidad del juego' });

    } catch (error) {
        console.log('Error al actualizar la cantidad del juego', error);
        res.status(500).json({ error: 'Error al actualizar la cantidad del juego' });
    }
}

carritoControllers.restarCantidadJuego = async (req, res) => {

    const { id } = req.params;

    try {
        const carritoRef = db.collection('carrito').doc(id);
        const carrito = await carritoRef.get();

        const juegoRef = db.collection('juego').doc(carrito.data().juego);
        const juego = await juegoRef.get();
        const precio = juego.data().precio;


        if (carrito.data().cantidad <= 1) {
            return res.status(500).json({ error: 'No puedes tener menos llaves' });
        }

        let cantidad = carrito.data().cantidad - 1

        await carritoRef.update({
            cantidad: cantidad,
            precio: precio * cantidad
        });

        res.json({ mensaje: 'Se ha actualizado la cantidad del juego' });

    } catch (error) {
        console.log('Error al actualizar la cantidad del juego', error);
        res.status(500).json({ error: 'Error al actualizar la cantidad del juego' });
    }
}

carritoControllers.deleteJuego = async (req, res) => {

    const { id } = req.params;

    try {
        const carritoRef = db.collection('carrito').doc(id);

        await carritoRef.delete();

        res.json({ mensaje: 'Se ha eliminado el juego del carrito' });

    } catch (error) {
        console.log('Error al eliminar el juego del carrito', error);
        res.status(500).json({ error: 'Error al eliminar el juego del carrito' });
    }
}



module.exports = carritoControllers;