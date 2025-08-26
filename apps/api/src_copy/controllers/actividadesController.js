// controllers/actividadesController.js
import {
    getActividadesOfUsuario,
    getActividadesOfEspacio,
    getActividadesOfClase,
    getActividadById
} from '../services/actividades.js';
import { AppError, validationError, notExpectedError } from '../errors/errors.js';

export function actividadesControllerFactory(db) {
    return {
        async getActividadesOfUsuario(req, res, next) {
            let idUsuario = Number(req.params.idUsuario);
        
            // Validamos que el ID sea un número entero válido
            if (!Number.isInteger(idUsuario)) {
                return next(validationError('Id suministrado no válido'));
            }
        
            try {
                // Obtenemos las actividades del usuario
                const actividades = await getActividadesOfUsuario(db, idUsuario);
        
                // Respondemos con los datos obtenidos
                res.status(200).json({ actividades });
            } catch (error) {
                // Manejamos cualquier error inesperado
                let err = error;
                if (!(error instanceof AppError)) {
                    err = notExpectedError({ cause: error });
                }
                next(err);
            }
        },
        

        async getActividadesOfEspacio(req, res, next) {
            let idEspacio = Number(req.params.idEspacio);
        
            // Validamos que el ID sea un número entero válido
            if (!Number.isInteger(idEspacio)) {
                return next(validationError('Id suministrado no válido'));
            }
        
            try {
                // Obtenemos las actividades del espacio
                const actividades = await getActividadesOfEspacio(db, idEspacio);
        
                // Si no hay actividades, respondemos con un error 404
                if (actividades.length === 0) {
                    return res.status(404).json({ error: 'No hay actividades en este espacio o el espacio no existe' });
                }
        
                // Respondemos con los datos obtenidos
                res.status(200).json({ actividades });
            } catch (error) {
                let err = error;
                if (!(error instanceof AppError)) {
                    err = notExpectedError({ cause: error });
                }
                next(err);
            }
        },
        

        async getActividadesOfClase(req, res, next) {
            let idClase = Number(req.params.idClase);
        
            // Validamos que el ID sea un número entero válido
            if (!Number.isInteger(idClase)) {
                return next(validationError('Id suministrado no válido'));
            }
        
            try {
                // Obtenemos las actividades de la clase
                const actividades = await getActividadesOfClase(db, idClase);
        
                // Si no hay actividades, respondemos con un error 404
                if (actividades.length === 0) {
                    return res.status(404).json({ error: 'No hay actividades en esta clase o la clase no existe' });
                }
        
                // Respondemos con los datos obtenidos
                res.status(200).json({ actividades });
            } catch (error) {
                let err = error;
                if (!(error instanceof AppError)) {
                    err = notExpectedError({ cause: error });
                }
                next(err);
            }
        },
        

        async getActividadById(req, res, next) {
            let idActividad = Number(req.params.idActividad);
        
            // Validamos que el ID sea un número entero válido
            if (!Number.isInteger(idActividad)) {
                return next(validationError('Id suministrado no válido'));
            }
        
            try {
                // Obtenemos la actividad por su ID
                const actividad = await getActividadById(db, idActividad);
        
                // Respondemos con los datos obtenidos
                res.status(200).json(actividad);
            } catch (error) {
                let err = error;
                if (!(error instanceof AppError)) {
                    err = notExpectedError({ cause: error });
                }
                next(err);
            }
        }
        
    };
}
