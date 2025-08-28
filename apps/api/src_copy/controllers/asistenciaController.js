import { 
    registroAsistencia,
    getAsistencias,
    getAsistenciaById,
    updateAsistenciaById,
    getMacsBLE
} from '../services/asistencia.js';
import { AppError, validationError, notExpectedError } from '../errors/errors.js';
import { apiLogger } from '@informaticaucm/seguimiento-logger';

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
                const filtrado = req.body || req.query || {};
                const result = await getAsistencias(db, filtrado);
                console.log('Asistencias obtenidas:\n', result);
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
        },

        async getEstadisticasAsistencias(req, res, next) {
            try {
                // Obtén el rango de fechas desde los parámetros de la solicitud
                const { fechaInicio, fechaFin } = req.query;

                if (!fechaInicio || !fechaFin) {
                    return next(validationError('Faltan parámetros requeridos: fechaInicio, fechaFin'));
                }

                // Llama al servicio para obtener las asistencias en el rango de fechas
                const asistencias = await getAsistencias(db, { fechaInicio, fechaFin });

                // Procesa las asistencias para calcular estadísticas
                const estadisticas = {
                    total: asistencias.length,
                    asistidas: 0,
                    noAsistidas: 0,
                    irregularidades: 0,
                    faltasPorClase: {},
                    noAsistidasPorDocente: [] // Nuevo array para el resultado solicitado
                };

                // Contador por docente para "No Asistida"
                const contadorDocente = {};

                asistencias.forEach(asistencia => {
                    if (asistencia.estado === 'Asistida') {
                        estadisticas.asistidas++;
                    } else if (asistencia.estado === 'No Asistida') {
                        estadisticas.noAsistidas++;
                        const docenteId = asistencia.docente_id;
                        if (!contadorDocente[docenteId]) {
                            contadorDocente[docenteId] = 0;
                        }
                        contadorDocente[docenteId]++;
                    } else {
                        estadisticas.irregularidades++;
                    }

                });

                // Formatea el resultado como array de objetos
                estadisticas.noAsistidasPorDocente = Object.entries(contadorDocente).map(([docente_id, cantidad]) => ({
                    docente_id: Number(docente_id),
                    cantidad
                }));

                // Devuelve las estadísticas como respuesta
                res.status(200).json(estadisticas);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        }
    };
}
