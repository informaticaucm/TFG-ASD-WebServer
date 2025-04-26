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
    };
}