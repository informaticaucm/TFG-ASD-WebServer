// services/usuarios.js
import { apiLogger } from '../config/logger.js';
import bcrypt from 'bcrypt';

const spices = [
    "inOPPh4IThFNhRF0",
    "rYYzv9VdRixlne1k",
    "j8XT8s3IsGqTNrYJ",
    "2CkN3WNmw9ZtkZ0p",
    "1EievW4P3Cn1dgvZ",
    "EXQgyv6DYck0thU8",
    "DHetHwn1uzphv0Gu",
    "TGZbU4V6klXw8hHe",
    "Oxi8DnH6KVXytWFB",
    "Gfx7HYNlCLr5KEaQ"
];

export async function authenticateUser(req, db) {
    const { email, password } = req.body;

    const query = await db.sequelize.models.Docente.findOne({
        attributes: ['id', 'email', 'password', 'nombre', 'apellidos', 'rol'],
        where: { email }
    });

    if (!query) {
        let err = {};
        err.status = 422;
        err.message = 'Datos no válidos';
        throw err;
    }

    const valid = spices.some((spice) => bcrypt.compareSync(spice + password, query.password));
    if (!valid) {
        let err = {};
        err.status = 422;
        err.message = 'Datos no válidos';
        throw err;
    }

    return {
        id: query.id,
        nombre: query.nombre,
        apellidos: query.apellidos,
        email: query.email,
        rol: query.rol
    };
}

export async function createUser(req, db) {
    const { creador, email, nombre, apellidos, password, rol } = req.body;

    const entidad_creador = await db.sequelize.models.Docente.findOne({ where: { id: creador } });
    if (!entidad_creador) {
        let err = {};
        err.status = 404;
        err.message = 'Creador no encontrado';
        throw err;
    }

    if (entidad_creador.rol !== 'Admin' && entidad_creador.rol !== 'Decanato') {
        let err = {};
        err.status = 422;
        err.message = 'Datos no válidos o creador no autorizado';
        throw err;
    }

    const spicedPassword = await bcrypt.hash(spices[Math.floor(Math.random() * spices.length)] + password, 4);

    const [usuario, nuevo] = await db.sequelize.models.Docente.findOrCreate({
        where: { email },
        defaults: { nombre, apellidos, email, password: spicedPassword, rol: rol || 'Usuario' }
    });

    if (!nuevo) {
        let err = {};
        err.status = 409;
        err.message = `El docente con el email ${email} ya existe en la base de datos`;
        throw err;
    }
}

export async function getUsuarios(db) {
    const usuarios = await db.sequelize.models.Docente.findAll({ attributes: ['id'] });
    return usuarios.map((user) => user.dataValues); // Devuelve un array como en el original
}

export async function getUsuarioById(db, idUsuario) {
    const usuario = await db.sequelize.models.Docente.findOne({
        attributes: ['id', 'nombre', 'apellidos', 'email', 'rol'],
        where: { id: idUsuario }
    });

    if (!usuario) {
        let err = {};
        err.status = 404;
        err.message = 'Usuario no encontrado';
        throw err;
    }

    return usuario.dataValues;
}

export async function registerMACToUsuario(req, db, idUsuario) {
    const { mac } = req.body;

    const usuario = await db.sequelize.models.Docente.findOne({ attributes: ['id'], where: { id: idUsuario } });
    if (!usuario) {
        let err = {};
        err.status = 404;
        err.message = 'Usuario no encontrado';
        throw err;
    }

    const [query_mac, created] = await db.sequelize.models.Macs.findOrCreate({
        where: { mac },
        defaults: { mac, usuario_id: idUsuario }
    });

    if (!created) {
        let err = {};
        err.status = 409;
        err.message = 'MAC ya registrada';
        throw err;
    }
}

export async function registerNFCToUsuario(req, db, idUsuario) {
    const { uid } = req.body;

    const usuario = await db.sequelize.models.Docente.findOne({ attributes: ['id'], where: { id: idUsuario } });
    if (!usuario) {
        let err = {};
        err.status = 404;
        err.message = 'Usuario no encontrado';
        throw err;
    }

    const [query_nfc, created] = await db.sequelize.models.Nfcs.findOrCreate({
        where: { nfc: uid },
        defaults: { nfc: uid, usuario_id: idUsuario }
    });

    if (!created) {
        let err = {};
        err.status = 409;
        err.message = 'UID de NFC ya registrado';
        throw err;
    }
}
