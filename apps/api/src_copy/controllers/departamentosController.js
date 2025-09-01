// controllers/departamentosController.js

import { getDepartamentos } from '../services/departamentos.js';
import { AppError, validationError, notExpectedError } from '../errors/errors.js';
import { apiLogger } from '@informaticaucm/seguimiento-logger';

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

        async getDepartamentoByDocenteId(req, res, next) {
            try {
            const docenteId = Number(req.params.docenteId);
            if (!Number.isFinite(docenteId)) {
                return next(validationError('docenteId no válido'));
            }

            const Docente = db.sequelize.models.Docente;
            const Departamento = db.sequelize.models.Departamento;

            const docente = await Docente.findByPk(docenteId, {
                include: [{
                model: Departamento,
                as: 'departamentos',
                attributes: ['id', 'nombre'],
                through: { attributes: [] }
                }]
            });

            if (!docente) {
                return next(validationError('Docente no encontrado'));
            }

            const deps = docente.departamentos || [];

            // Si tu regla de negocio es “un docente pertenece a un solo departamento”:
            if (deps.length === 0) {
                return res.status(200).json({ departamento: null }); // sin departamento asignado
            }

            // Si vinieran varios, devolvemos el primero (o cambia a 409 si quieres forzar unicidad)
            const dep = deps[0];

            return res.status(200).json({
                departamento: { id: dep.id, nombre: dep.nombre }
            });
            } catch (error) {
            return next(error instanceof AppError ? error : notExpectedError({ cause: error }));
            }
        }
    };
}