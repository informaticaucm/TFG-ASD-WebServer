import { 
    registroAsistencia,
    getAsistencias,
    getAsistenciaById,
    updateAsistenciaById,
    getMacsBLE
} from '../services/asistencia.js';
import { AppError, validationError, notExpectedError } from '../errors/errors.js';

export function asistenciasControllerFactory(db) {
    return {
        async registroAsistencia(req, res, next) {
            try {
                const result = await registroAsistencia(db, req.body);
                res.status(201).json(result);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        },

        async getAsistencias(req, res, next) {
            try {
                // Usamos req.query en lugar de req.body para filtros
                const result = await getAsistencias(db, req.query);
                res.status(200).json(result);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        },

        async getAsistenciaById(req, res, next) {
            try {
                const idAsistencia = Number(req.params.idAsistencia);
                if (!Number.isInteger(idAsistencia)) {
                    return next(validationError('Id suministrado no válido'));
                }

                const result = await getAsistenciaById(db, idAsistencia);
                res.status(200).json(result);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        },

        async updateAsistenciaById(req, res, next) {
            try {
                const idAsistencia = Number(req.params.idAsistencia);
                if (!Number.isInteger(idAsistencia)) {
                    return next(validationError('Id suministrado no válido'));
                }

                const result = await updateAsistenciaById(db, idAsistencia, req.body);
                res.status(200).json(result);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        },

        async getMacsBLE(req, res, next) {
            try {
                // Validamos que los parámetros obligatorios están presentes
                const { espacioId, comienzo, fin } = req.query;
                if (!espacioId || !comienzo || !fin) {
                    return next(validationError('Faltan parámetros requeridos: espacioId, comienzo, fin'));
                }

                const result = await getMacsBLE(db, { espacioId, comienzo, fin });
                res.status(200).json(result);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        }
    };
}
