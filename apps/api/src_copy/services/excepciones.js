// services/excepciones.js
import { apiLogger } from '../../../../packages/logger/src/logger.js';
import moment from 'moment';
import * as recurrence_tool from '@informaticaucm/seguimiento-events';
import { notFoundError, validationError } from '../errors/errors.js';
import { Op } from 'sequelize';

export async function createExcepcion(req, db) {
    const { actividad_id, esta_cancelado, esta_reprogramado, fecha_inicio_act, fecha_fin_act, fecha_inicio_ex, fecha_fin_ex } = req.body;

    // Validación de entrada
    if (!Number.isInteger(actividad_id)) {
        throw validationError('Id suministrado no válido');
    }
    if (esta_cancelado == null && esta_reprogramado == null) {
        throw validationError('Datos no válidos - debe especificar si está cancelado o reprogramado');
    }
 
    const transaction = await db.sequelize.transaction();
    try {
        apiLogger.info('Fetching actividad details for excepcion creation');
        const actividad = await db.sequelize.models.Actividad.findOne({
            attributes: ['id', 'es_recurrente', 'fecha_inicio', 'fecha_fin', 'tiempo_inicio', 'tiempo_fin'],
            where: { id: actividad_id }
        });

        if (!actividad) {
            throw notFoundError('Actividad no encontrada');
        }

        const excepcionesExistentes = await db.sequelize.models.Excepcion.findAll({
            where: { actividad_id }
        });

        // Manejo de lógica para excepciones
        if (esta_cancelado === 'Sí') {
            await handleCancelExcepcion(excepcionesExistentes, db, req, actividad, transaction);
        } else if (esta_reprogramado === 'Sí') {
            await handleRescheduleExcepcion(excepcionesExistentes, db, req, actividad, transaction);
        } else {
            await handleSustitutionExcepcion(excepcionesExistentes, db, req, actividad, transaction)
        }

        await transaction.commit();
        return 'Excepción creada con éxito';
    } catch (error) {
        await transaction.rollback();
        apiLogger.error(`Error while interacting with database: ${error}`);
        throw error;
    }
}

export async function getExcepcionById(req, db) {
    const excepcionId = Number(req.params.idExcepcion);
    if (!Number.isInteger(excepcionId)) {
        throw validationError('Id suministrado no válido');
    }

    apiLogger.info(`Fetching excepcion with id ${excepcionId}`);
    const excepcion = await db.sequelize.models.Excepcion.findOne({ where: { id: excepcionId } });

    if (!excepcion) {
        throw notFoundError('Excepción no encontrada');
    }

    return {
        actividad_id: excepcion.actividad_id,
        esta_reprogramado: excepcion.esta_reprogramado,
        esta_cancelado: excepcion.esta_cancelado,
        fecha_inicio_act: excepcion.fecha_inicio_act,
        fecha_fin_act: excepcion.fecha_fin_act,
        fecha_inicio_ex: excepcion.fecha_inicio_ex,
        fecha_fin_ex: excepcion.fecha_fin_ex
    };
}

export async function getExcepcionesOfActividad(req, db) {
    const idActividad = Number(req.params.idActividad);
    if (!Number.isInteger(idActividad)) {
        throw validationError('Id suministrado no válido');
    }

    apiLogger.info(`Fetching excepciones for actividad ${idActividad} in getExcepcionesOfActividad`);
    const actividad = await db.sequelize.models.Actividad.findOne({
        attributes: ['id'],
        where: { id: idActividad }
    });

    if (!actividad) {
        throw notFoundError('Actividad no encontrada');
    }

    const excepciones = await db.sequelize.models.Excepcion.findAll({
        attributes: ['id'],
        where: { actividad_id: idActividad }
    });

    return { excepciones: excepciones.map((exc) => ({ id: exc.id })) };
}

export async function getExcepcionesByIntervalo(req, db) {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
        throw validationError('Faltan parámetros requeridos: fechaInicio, fechaFin');
    }
    console.log("Estamos en EXCEPCIONES DE API/SRC_COPY/SERVICES/EXCEPCIONES.JS");
    const excepciones = await db.sequelize.models.Excepcion.findAll({
        where: {
            fecha_inicio_act: {
                [Op.between]: [fechaInicio, fechaFin]
            }
        },
        attributes: [
            'id',
            'actividad_id',
            'esta_cancelado',
            'esta_reprogramado',
            'fecha_inicio_act',
            'fecha_fin_act',
            'fecha_inicio_ex',
            'fecha_fin_ex'
        ]
    });

    return { excepciones };
}

// Lógica para manejar excepciones canceladas
async function handleCancelExcepcion(excepciones, db, req, actividad, transaction) {
    const { fecha_inicio_act, fecha_fin_act } = req.body;

    const match = excepciones.find(
        (excep) =>
            excep.fecha_inicio_act === fecha_inicio_act && excep.fecha_fin_act === fecha_fin_act
    );

    if (match) {
        await db.sequelize.models.Excepcion.update(
            { esta_cancelado: 'Sí' },
            { where: { id: match.id }, transaction }
        );
    } else {
        const validActividad = await verifyActividad(db, fecha_inicio_act, actividad, actividad.id);
        if (validActividad) {
            await db.sequelize.models.Excepcion.create({
                fecha_inicio_act: `${fecha_inicio_act}`,
                fecha_fin_act: `${fecha_fin_act}`,
                actividad_id: actividad.id,
                esta_cancelado: 'Sí',
                esta_reprogramado: 'No'
            });
        } else {
            throw validationError('Datos no válidos - la actividad no coincide con la fecha proporcionada - handleCancelExcepcion');
        }
    }
}

// Lógica para manejar excepciones reprogramadas
async function handleRescheduleExcepcion(excepciones, db, req, actividad, transaction) {
    const { fecha_inicio_act, fecha_fin_act, fecha_inicio_ex, fecha_fin_ex } = req.body;

    const match = excepciones.find(
        (excep) =>
            excep.fecha_inicio_act === fecha_inicio_act &&
            excep.fecha_fin_act === fecha_fin_act &&
            excep.esta_reprogramado === 'Sí' &&
            excep.esta_cancelado === 'No'
    );
    
 
    if (match) {
        await db.sequelize.models.Excepcion.update(
            {
                esta_cancelado: 'No',
                esta_reprogramado: 'Sí',
                fecha_inicio_ex,
                fecha_fin_ex
            },
            { where: { id: match.id },transaction }
        );
    } else {
        //const validActividad = await verifyActividad(db, fecha_inicio_act, actividad, actividad.id);
        //if (validActividad) {
            await db.sequelize.models.Excepcion.create({
                fecha_inicio_act: `${fecha_inicio_act}`,
                fecha_fin_act: `${fecha_fin_act}`,
                fecha_inicio_ex: `${fecha_inicio_ex}`,
                fecha_fin_ex: `${fecha_fin_ex}`,
                actividad_id: actividad.id,
                esta_cancelado: 'No',
                esta_reprogramado: 'Sí'
            },{transaction});
        //} else {
        //    throw validationError('Datos no válidos - la actividad no coincide con la fecha proporcionada - handleRescheduleExcepcion');
        //}
    }
}

// Lógica para manejar excepciones de sustitución
async function handleSustitutionExcepcion(excepciones, db, req, actividad, transaction) {
    const { fecha_inicio_act, fecha_fin_act, fecha_inicio_ex, fecha_fin_ex, sustituto_id } = req.body;

    const match = excepciones.find(
        (excep) =>
            excep.fecha_inicio_act === fecha_inicio_act &&
            excep.fecha_fin_act === fecha_fin_act &&
            excep.esta_reprogramado === 'No' &&
            excep.esta_cancelado === 'No'
    );
    
 
    if (match) {
        await db.sequelize.models.Excepcion.update(
            {
                esta_cancelado: 'No',
                esta_reprogramado: 'No',
                fecha_inicio_ex,
                fecha_fin_ex,
            },
            { where: { id: match.id },transaction }
        );
    } else {
        //const validActividad = await verifyActividad(db, fecha_inicio_act, actividad, actividad.id);
        //if (validActividad) {
            await db.sequelize.models.Excepcion.create({
                fecha_inicio_act: `${fecha_inicio_act}`,
                fecha_fin_act: `${fecha_fin_act}`,
                fecha_inicio_ex: `${fecha_inicio_ex}`,
                fecha_fin_ex: `${fecha_fin_ex}`,
                actividad_id: actividad.id,
                esta_cancelado: 'No',
                esta_reprogramado: 'No',
                suplente_id: sustituto_id
            },{transaction});
        //} else {
        //    throw validationError('Datos no válidos - la actividad no coincide con la fecha proporcionada - handleRescheduleExcepcion');
        //}
    }
}

// Verifica la validez de una actividad en una fecha específica
export async function verifyActividad(db, fecha_inicio_act, actividad, actividadId) {
    const fecha = moment(fecha_inicio_act ).format('YYYY-MM-DD');
    const mmt_inicio = moment(fecha + 'T' + actividad.tiempo_inicio, 'YYYY-MM-DDTHH:mm').utc();

    if (actividad.es_recurrente === 'Sí') {
        const recurrencias = await db.sequelize.models.Recurrencia.findAll({
            include: {
                model: db.sequelize.models.Actividad,
                as: 'recurrencia_de',
                where: { id: actividadId }
            }
        });
        
        return recurrencias.some((recurrencia) =>
            recurrence_tool.isInRecurrencia(actividad, recurrencia, moment(fecha_inicio_act ).utc().format('YYYY-MM-DD[T]HH:mm'))
        );
    }

    return mmt_inicio.format('YYYY-MM-DD HH:mm') === moment(fecha_inicio_act).format('YYYY-MM-DD HH:mm');
}
