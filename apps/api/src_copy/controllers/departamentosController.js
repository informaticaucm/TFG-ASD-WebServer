// controllers/departamentosController.js

import { getDepartamentos } from '../services/departamentos.js';
import { AppError, validationError, notExpectedError } from '../errors/errors.js';

export function departamentosControllerFactory(db) {
    return {
        async getAllDepartamentos(req, res, next) {
            try {
                const departamentos = await getDepartamentos(db); // Llama al servicio
                res.status(200).json(departamentos);
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        },

        // Nueva función: obtiene el departamento por docente_id
        async getDepartamentoByDocenteId(req, res, next) {
            try {
                console.log("Valor de req: ", req);
                const docenteId = Number(req.params.docenteId);
                if (!docenteId) {
                    return next(validationError('docenteId no válido'));
                }
                // Consulta el docente en la base de datos
                const docente = await db.sequelize.models.Docente.findByPk(docenteId);
                if (!docente) {
                    return next(validationError('Docente no encontrado'));
                }
                // Devuelve el departamento (ajusta el campo si es necesario)
                res.status(200).json({ departamento: docente.departamento });
            } catch (error) {
                next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        },
    };
}