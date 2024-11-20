// clases.js

import { apiLogger } from '../../../../packages/logger/src/logger.js';
import { getClaseById, getClaseOfAsignaturaGrupo } from './clase.service.js';

export async function getClaseById(req, res, next, db) {
    let idClase = Number(req.params.idClase);
    if (!Number.isInteger(idClase)) {
        const err = { status: 400, message: 'Id suministrado no válido' };
        return next(err);
    }

    try {
        apiLogger.info('Searching in Clase for asignatura_id, grupo_id');
        const resultado = await getClaseById(db, idClase);

        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(resultado);
    } catch (error) {
        apiLogger.error(`Error: ${error.message}`);
        const err = { status: 500, message: 'Something went wrong' };
        return next(err);
    }
}

export async function getClaseOfAsignaturaGrupo(req, res, next, db) {
    let asignatura_id = Number(req.body.asignatura_id);
    let grupo_id = Number(req.body.grupo_id);

    if (!Number.isInteger(asignatura_id) || !Number.isInteger(grupo_id)) {
        const err = { status: 400, message: 'Id suministrado no válido' };
        return next(err);
    }

    try {
        const resultado = await getClaseOfAsignaturaGrupo(db, asignatura_id, grupo_id);

        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(resultado);
    } catch (error) {
        apiLogger.error(`Error: ${error.message}`);
        const err = { status: 500, message: 'Something went wrong' };
        return next(err);
    }
}
