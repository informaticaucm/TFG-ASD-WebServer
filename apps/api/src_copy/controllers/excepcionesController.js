// controllers/excepcionesController.js
import {
    createExcepcion,
    getExcepcionById,
    getExcepcionesOfActividad
} from '../services/excepciones.js';
import { AppError, validationError, notExpectedError } from '../errors/errors.js';

export function excepcionesControllerFactory(db) {
    return {
        async createExcepcion(req, res, next) {
            try {
                const response = await createExcepcion(req, db); // Llama al servicio
                res.setHeader('Content-Type', 'text/html');
                res.status(200).send(response);
            } catch (error) {
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async getExcepcionById(req, res, next) {
            try {
                const response = await getExcepcionById(req, db); // Llama al servicio
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(response);
            } catch (error) {
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        },

        async getExcepcionesOfActividad(req, res, next) {
            try {
                const response = await getExcepcionesOfActividad(req, db); // Llama al servicio
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(response);
            } catch (error) {
                const err = error instanceof AppError ? error : notExpectedError({ cause: error });
                next(err);
            }
        }
    };
}
