// services/actividades.js
import { apiLogger } from '../config/logger.js';
import { notFoundError } from '../utils/errors.js';

/**
 * Obtiene las actividades de un usuario por su ID.
 */
export async function getActividadesOfUsuario(db, idUsuario) {
    const query_doc = await db.sequelize.models.Docente.findOne({
        attributes: ['id'],
        where: { id: idUsuario }
    });

    if (!query_doc || Object.keys(query_doc.dataValues).length === 0) {
        throw notFoundError('Usuario no encontrado');
    }

    const actividades = [];

    apiLogger.info('Searching in Actividad impartida por Docente for actividad_id');
    const query_r = await db.sequelize.models.Actividad.findAll({
        attributes: ['id'],
        include: {
            model: db.sequelize.models.Docente,
            as: 'impartida_por',
            where: { id: idUsuario }
        }
    });

    query_r.forEach((act) => {
        actividades.push({ id: act.dataValues.id });
    });

    return actividades;
}

/**
 * Obtiene las actividades de un espacio por su ID.
 */
export async function getActividadesOfEspacio(db, idEspacio) {
    const query_esp = await db.sequelize.models.Espacio.findOne({
        attributes: ['id'],
        where: { id: idEspacio }
    });

    if (!query_esp || Object.keys(query_esp.dataValues).length === 0) {
        throw notFoundError('Espacio no encontrado');
    }

    const actividades = [];

    apiLogger.info('Searching in Actividad for espacio_id');
    const query_act = await db.sequelize.models.Actividad.findAll({
        attributes: ['id'],
        include: {
            model: db.sequelize.models.Espacio,
            as: 'impartida_en',
            where: { id: idEspacio }
        }
    });

    query_act.forEach((act) => {
        actividades.push({ id: act.dataValues.id });
    });

    return actividades;
}

/**
 * Obtiene las actividades de una clase por su ID.
 */
export async function getActividadesOfClase(db, idClase) {
    const query_cla = await db.sequelize.models.Clase.findOne({
        attributes: ['id'],
        where: { id: idClase }
    });

    if (!query_cla || Object.keys(query_cla.dataValues).length === 0) {
        throw notFoundError('Clase no encontrada');
    }

    const actividades = [];

    apiLogger.info('Searching in Actividad for clase_id');
    const query_act_cla = await db.sequelize.models.Actividad.findAll({
        attributes: ['id'],
        include: {
            model: db.sequelize.models.Clase,
            as: 'sesion_de',
            where: { id: idClase }
        }
    });

    query_act_cla.forEach((act) => {
        actividades.push({ id: act.dataValues.id });
    });

    return actividades;
}

/**
 * Obtiene una actividad por su ID.
 */
export async function getActividadById(db, idActividad) {
    const query_act = await db.sequelize.models.Actividad.findOne({
        attributes: ['id', 'fecha_inicio', 'fecha_fin', 'tiempo_inicio', 'tiempo_fin', 'es_todo_el_dia', 'es_recurrente'],
        where: { id: idActividad },
        include: {
            model: db.sequelize.models.Clase,
            as: 'sesion_de',
            attributes: ['id']
        }
    });

    if (!query_act || Object.keys(query_act.dataValues).length === 0) {
        throw notFoundError('Actividad no encontrada');
    }

    const clase_ids = query_act.sesion_de.map((sesion) => ({ id: sesion.id }));

    return {
        id: query_act.id,
        fecha_inicio: query_act.fecha_inicio,
        fecha_fin: query_act.fecha_fin,
        tiempo_inicio: query_act.tiempo_inicio,
        tiempo_fin: query_act.tiempo_fin,
        es_todo_el_dia: query_act.es_todo_el_dia,
        es_recurrente: query_act.es_recurrente,
        clase_ids
    };
}
