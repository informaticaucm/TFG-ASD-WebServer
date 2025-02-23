// services/actividades.js
import { apiLogger } from '../../../../packages/logger/src/logger.js';  // Asumimos que tienes un logger configurado
import { AppError, notFoundError } from '../errors/errors.js';
//import { apiLogger } from '../config/logger.js';
//import { notFoundError } from '../utils/errors.js';

/**
 * Obtiene las actividades de un usuario por su ID.
 */
/*export async function getActividadesOfUsuario(db, idUsuario) {
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
}*/

export async function getActividadesOfUsuario(db, idUsuario) {
    // Realiza una consulta a la base de datos para obtener todas las actividades
    // en las que el usuario (docente) participa.

    apiLogger.info('Searching in Actividad impartida por Docente for actividad_id');
    const query_r = await db.sequelize.models.Actividad.findAll({
        attributes: ['id'],
        include: {
            model: db.sequelize.models.Docente,
            as: 'impartida_por', // Nombre de la relación en Sequelize
            where: { id: idUsuario }, // Filtramos solo por el docente específico
            attributes: []
        }
    });

    // Convertimos el resultado en un array con solo los IDs de las actividades
    return query_r.map(act => ({ id: act.id }));
}



/**
 * Obtiene las actividades de un espacio por su ID.
 */
/*export async function getActividadesOfEspacio(db, idEspacio) {
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
}*/

/**
 * Obtiene las actividades de un espacio por su ID.
 */
export async function getActividadesOfEspacio(db, idEspacio) {
    apiLogger.info('Searching in Actividad for espacio_id');
    const query_act = await db.sequelize.models.Actividad.findAll({
        attributes: ['id'], // Solo traemos el ID de la actividad, nada más
        include: {
            model: db.sequelize.models.Espacio,
            as: 'impartida_en', // Alias de la relación en Sequelize
            where: { id: idEspacio },
            attributes: [] // No necesitamos datos de Espacio, solo filtramos por él
        }
    });

    // Convertimos el resultado en un array con solo los IDs de las actividades
    return query_act.map(act => ({ id: act.id }));
}


/**
 * Obtiene las actividades de una clase por su ID.
 */

/**
 * Obtiene las actividades de una clase por su ID.
 */
export async function getActividadesOfClase(db, idClase) {
    // Buscamos todas las actividades relacionadas con la clase dada
    apiLogger.info('Searching in Actividad for clase_id');
    const query_act_cla = await db.sequelize.models.Actividad.findAll({
        attributes: ['id'], // Solo obtenemos el ID de la actividad
        include: {
            model: db.sequelize.models.Clase,
            as: 'sesion_de', // Alias de la relación en Sequelize
            where: { id: idClase },
            attributes: [] // No necesitamos información de Clase, solo filtramos por ella
        }
    });

    // Devolvemos solo los IDs de las actividades
    return query_act_cla.map(act => ({ id: act.id }));
}

/*export async function getActividadesOfClase(db, idClase) {
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
}*/

/**
 * Obtiene una actividad por su ID.
 */
export async function getActividadById(db, idActividad) {
    // Buscamos la actividad por su ID y obtenemos la información relevante
    const query_act = await db.sequelize.models.Actividad.findOne({
        attributes: [
            'id', 'fecha_inicio', 'fecha_fin', 
            'tiempo_inicio', 'tiempo_fin', 
            'es_todo_el_dia', 'es_recurrente'
        ],
        where: { id: idActividad },
        include: {
            model: db.sequelize.models.Clase,
            as: 'sesion_de',
            attributes: ['id']
        }
    });

    // Si la actividad no existe, lanzamos un error
    if (!query_act) {
        throw notFoundError('Actividad no encontrada');
    }

    // Convertimos las clases asociadas en un array de IDs
    const clase_ids = query_act.sesion_de ? query_act.sesion_de.map((sesion) => ({ id: sesion.id })) : [];

    // Devolvemos la actividad con los datos requeridos
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


/*export async function getActividadById(db, idActividad) {
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
}*/
