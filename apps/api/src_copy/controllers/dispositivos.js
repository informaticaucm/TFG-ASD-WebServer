import { apiLogger } from '@informaticaucm/seguimiento-logger/src/logger.js';
import moment from 'moment';
import { getAllDispositivos, createDispositivo, findDispositivoById, removeDispositivo, getCurrentEpoch } from './DispositivoService.js';

export async function getDispositivos(req, res, next, db) {
    try {
        const dispositivos = await getAllDispositivos(db);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(dispositivos);
    } catch (error) {
        apiLogger.error(`Error while interacting with database: ${error}`);
        let err = { status: 500, message: 'Something went wrong' };
        return next(err);
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
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(respuesta);
        } catch (error) {
            apiLogger.error(`Error while interacting with database: ${error}`);
            let err = { status: 500, message: 'Something went wrong' };
            return next(err);
        }
    } else {
        let err = { status: 422, message: 'Datos no válidos' };
        return next(err);
    }
}

export async function getDispositivoById(req, res, next, db) {
    const idDispositivo = Number(req.params.idDispositivo);
    if (!Number.isInteger(idDispositivo)) {
        let err = { status: 400, message: 'Id suministrado no válido' };
        return next(err);
    }

    try {
        const dispositivo = await findDispositivoById(idDispositivo, db);
        if (!dispositivo) {
            let err = { status: 404, message: 'Dispositivo no encontrado' };
            return next(err);
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(dispositivo);
    } catch (error) {
        apiLogger.error(`Error while interacting with database: ${error}`);
        let err = { status: 500, message: 'Something went wrong' };
        return next(err);
    }
}

export async function deleteDispositivo(req, res, next, db) {
    const idDispositivo = Number(req.params.idDispositivo);
    if (!Number.isInteger(idDispositivo)) {
        let err = { status: 400, message: 'Id suministrado no válido' };
        return next(err);
    }

    try {
        const success = await removeDispositivo(idDispositivo, db);
        if (!success) {
            let err = { status: 404, message: 'Dispositivo no encontrado' };
            return next(err);
        }
        res.status(204).send('Operación exitosa');
    } catch (error) {
        apiLogger.error(`Error while interacting with database: ${error}`);
        let err = { status: 500, message: 'Something went wrong' };
        return next(err);
    }
}

export async function getLocalTime(req, res) {
    const resultado = getCurrentEpoch();
    apiLogger.info(`Pong! ${resultado.epoch}`);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(resultado);
}
