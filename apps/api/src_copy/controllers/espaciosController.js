import {
    getEspacios as fetchEspacios,
    getEspacioById as fetchEspacioById,
    getEspaciosOfUsuario as fetchEspaciosOfUsuario,
    getEspacioOfActividad as fetchEspacioOfActividad
} from '../services/espacios.js';
import { AppError, validationError, notExpectedError } from '../errors/errors.js';

export function espaciosControllerFactory(db) {
    return {
        async getEspacios(req, res, next) {
            try {
                const espacios = await fetchEspacios(db); // Llama al servicio
                res.status(200).json(espacios);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        },

        async getEspacioById(req, res, next) {
            const idEspacio = Number(req.params.idEspacio);
            if (!Number.isInteger(idEspacio)) {
                return next(validationError('Id suministrado no válido'));
            }

            try {
                const espacio = await fetchEspacioById(db, idEspacio);
                res.status(200).json(espacio);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        },

        async getEspaciosOfUsuario(req, res, next) {
            const idUsuario = Number(req.params.idUsuario);
            if (!Number.isInteger(idUsuario)) {
                return next(validationError('Id suministrado no válido'));
            }

            // Validamos si req.body.opcion está presente
            const opcion = req.body.opcion ?? null;

            try {
                const espacios = await fetchEspaciosOfUsuario(db, idUsuario, opcion);
                res.status(200).json(espacios);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        },

        async getEspacioOfActividad(req, res, next) {
            const idActividad = Number(req.params.idActividad);
            if (!Number.isInteger(idActividad)) {
                return next(validationError('Id suministrado no válido'));
            }

            try {
                const espacio = await fetchEspacioOfActividad(db, idActividad);
                res.status(200).json(espacio);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        }
    };
}
