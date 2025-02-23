import { apiLogger } from '@informaticaucm/seguimiento-logger/src/logger.js';
import moment from 'moment';
import { getAllDispositivos, createDispositivo, findDispositivoById, removeDispositivo, getCurrentEpoch } from './DispositivoService.js';
import { errorValidacion, notExpectedError } from '../../../../utils/errors.js';

export async function getDispositivos(req, res, next, db) {
    try {
        const dispositivos = await getAllDispositivos(db);
        res.status(200).json(dispositivos);
    } catch (error) {
        apiLogger.error(`Error while interacting with database: ${error}`);
        next(notExpectedError({ cause: error }));
    }
}

export async function creaDispositivo(req, res, next, db, api_config) {
    if (
        req.body &&
        Object.keys(req.body).length === 3 &&
        req.body.nombre &&
        req.body.espacioId &&
        req.body.idExternoDispositivo &&
        Number.isInteger(req.body.espacioId) &&
        typeof req.body.nombre === 'string' &&
        typeof req.body.idExternoDispositivo === 'string'
    ) {
        try {
            const respuesta = await createDispositivo(req.body, db, api_config);
            res.status(200).json(respuesta);
        } catch (error) {
            apiLogger.error(`Error while interacting with database: ${error}`);
            next(notExpectedError({ cause: error }));
        }
    } else {
        return next(errorValidacion('Datos no válidos'));
    }
}

export async function getDispositivoById(req, res, next, db) {
    const idDispositivo = Number(req.params.idDispositivo);
    if (!Number.isInteger(idDispositivo)) {
        return next(errorValidacion('Id suministrado no válido'));
    }

    try {
        const dispositivo = await findDispositivoById(idDispositivo, db);
        res.status(200).json(dispositivo);
    } catch (error) {
        apiLogger.error(`Error while interacting with database: ${error}`);
        next(notExpectedError({ cause: error }));
    }
}

export async function deleteDispositivo(req, res, next, db) {
    const idDispositivo = Number(req.params.idDispositivo);
    if (!Number.isInteger(idDispositivo)) {
        return next(errorValidacion('Id suministrado no válido'));
    }

    try {
        await removeDispositivo(idDispositivo, db);
        res.status(204).send(); // Código 204 = No Content, no debe enviar body
    } catch (error) {
        apiLogger.error(`Error while interacting with database: ${error}`);
        next(notExpectedError({ cause: error }));
    }
}

export async function getLocalTime(req, res) {
    const resultado = getCurrentEpoch();
    apiLogger.info(`Pong! ${resultado.epoch}`);
    res.status(200).json(resultado);
}
