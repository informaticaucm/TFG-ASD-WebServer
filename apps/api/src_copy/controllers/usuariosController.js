// controllers/usuariosController.js
import {
    authenticateUser,
    createUser,
    getUsuarios,
    getUsuarioById,
    getUsuariosByName,
    registerMACToUsuario,
    registerNFCToUsuario
} from '../services/usuarios.js';
import { AppError, validationError, notExpectedError } from '../errors/errors.js';

export function usuariosControllerFactory(db) {
    return {
        async authenticateUser(req, res, next) {
            try {
                const user = await authenticateUser(req, db);
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json(user);
            } catch (error) {
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async createUser(req, res, next) {
            try {
                await createUser(req, db);
                res.status(201).send('Usuario creado con éxito');
            } catch (error) {
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async getUsuarios(req, res, next) {
            try {
                const usuarios = await getUsuarios(db);
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json(usuarios);
            } catch (error) {
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async getUsuarioById(req, res, next) {
            const idUsuario = Number(req.params.idUsuario);
            if (!Number.isInteger(idUsuario)) {
                return next(validationError('Id suministrado no válido'));
            }

            try {
                const usuario = await getUsuarioById(db, idUsuario);
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json(usuario);
            } catch (error) {
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async getUsuariosByNames(req, res, next) {
            const nombreUsuario = String(req.params.nombreUsuario);
            try {
                const usuarios = await getUsuariosByName(db, nombreUsuario);
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json(usuarios);
            } catch (error) {
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async registerMACToUsuario(req, res, next) {
            const idUsuario = Number(req.params.idUsuario);
            if (!Number.isInteger(idUsuario)) {
                return next(validationError('Id suministrado no válido'));
            }

            try {
                await registerMACToUsuario(req, db, idUsuario);
                res.status(200).send('MAC registrada con éxito');
            } catch (error) {
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async registerNFCToUsuario(req, res, next) {
            const idUsuario = Number(req.params.idUsuario);
            if (!Number.isInteger(idUsuario)) {
                return next(validationError('Id suministrado no válido'));
            }

            try {
                await registerNFCToUsuario(req, db, idUsuario);
                res.status(200).send('UID de NFC registrado con éxito');
            } catch (error) {
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        }
    };
}
