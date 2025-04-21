// services/espacios.js
import { apiLogger } from '../../../../packages/logger/src/logger.js';
import { notFoundError } from '../errors/errors.js';
import moment from 'moment';
import { Op } from 'sequelize';
import { isInRecurrencia } from '@informaticaucm/seguimiento-events';

// Utilidad para mapear espacios
function mapEspacios(query) {
    return query.map((esp) => ({
        id: esp.dataValues.id,
        nombre: `${esp.dataValues.tipo} ${esp.dataValues.numero}`,
        edificio: esp.dataValues.edificio
    }));
}

// Utilidad para manejar excepciones y actividades recurrentes
async function processExcepcionesYRecurrencias(act, excepciones, recurrencias, hoy_hora_inicio) {
    let cancelada = excepciones.some(
        (exc) =>
            moment(exc.fecha_inicio_act + 'Z').utc().format('YYYY-MM-DD HH:mm') === hoy_hora_inicio.format('YYYY-MM-DD HH:mm')
    );

    if (act.es_recurrente === 'Sí') {
        return recurrencias.some((rec) =>
            isInRecurrencia(act, rec, hoy_hora_inicio.format('YYYY-MM-DD HH:mm:ss')) && !cancelada
        );
    }

    return !cancelada;
}

export async function getEspacios(db) {
    apiLogger.info('Fetching espacios');
    const query = await db.sequelize.models.Espacio.findAll({
        attributes: ['id', 'tipo', 'numero', 'edificio'],
        order: [['edificio'], ['tipo'], ['numero']]
    });

    return mapEspacios(query);
}

export async function getEspacioById(db, idEspacio) {
    apiLogger.info(`Fetching espacio with id ${idEspacio}`);
    const query = await db.sequelize.models.Espacio.findOne({
        attributes: ['id', 'creadoPor', 'actualizadoPor', 'creadoEn', 'actualizadoEn', 'edificio', 'tipo', 'numero'],
        where: { id: idEspacio }
    });

    if (!query) {
        throw notFoundError('Espacio no encontrado');
    }

    return {
        id: query.id,
        creadoEn: query.creadoEn,
        actualizadoEn: query.actualizadoEn,
        creadoPor: query.creadoPor,
        actualizadoPor: query.actualizadoPor,
        nombre: `${query.tipo} ${query.numero}`,
        edificio: query.edificio
    };
}

export async function getEspaciosOfUsuario(db, idUsuario, opcion) {
    apiLogger.info(`Fetching espacios for usuario ${idUsuario} with opcion ${opcion}`);
    const docente = await db.sequelize.models.Docente.findOne({ attributes: ['id'], where: { id: idUsuario } });

    if (!docente) {
        throw notFoundError('Usuario no encontrado');
    }

    const currentHour = moment().format('HH:mm');
    const respuesta = { espacios: [] };

    if (opcion === 'espacios_rutina') {
        const actividades = await db.sequelize.models.Actividad.findAll({
            attributes: ['id', 'tiempo_inicio', 'tiempo_fin', 'es_recurrente', 'fecha_inicio', 'fecha_fin'],
            include: { model: db.sequelize.models.Docente, as: 'impartida_por', where: { id: idUsuario } },
            //where: { tiempo_inicio: { [Op.lte]: currentHour }, tiempo_fin: { [Op.gte]: currentHour } }
        });

        const actividadesIds = actividades.map((act) => act.dataValues.id);

        const espacios = await db.sequelize.models.Espacio.findAll({
            attributes: ['id'],
            include: {
                model: db.sequelize.models.Actividad,
                as: 'ocupado_por',
                where: { id: { [Op.or]: actividadesIds } }
            },
            order: [['edificio'], ['tipo'], ['numero']]
        });

        respuesta.espacios = mapEspacios(espacios);
    } else if (opcion === 'espacios_irregularidad') {

        const actividadesDelDocente = await db.sequelize.models.Actividad.findAll({
            attributes: ['id'],
            include: {
                model: db.sequelize.models.Docente,
                as: 'impartida_por',
                where: { id: idUsuario }
            }
        });
    
        const idsActividadesDocente = actividadesDelDocente.map(act => act.dataValues.id);
    
        if(actividadesDelDocente.length===0){
            respuesta.espacios=[];
        }
        
        else{

            const espacios = await db.sequelize.models.Espacio.findAll({
                attributes: ['id'],
                where: {
                    id: {
                        [Op.notIn]: idsActividadesDocente.length > 0 ? idsActividadesDocente : [null]  // previene error si está vacío
                    }
                },
                order: [['edificio'], ['tipo'], ['numero']]
            });
            
            respuesta.espacios = mapEspacios(espacios);
        }
    } 
    else {
        throw new Error('Opción no válida');
    }

    return respuesta;
}

export async function getEspacioOfActividad(db, idActividad) {
    apiLogger.info(`Fetching espacio for actividad ${idActividad}`);
    const actividad = await db.sequelize.models.Actividad.findOne({ where: { id: idActividad } });

    if (!actividad) {
        throw notFoundError('Actividad no encontrada');
    }

    const espacios = await db.sequelize.models.Espacio.findAll({
        attributes: ['id'],
        include: {
            model: db.sequelize.models.Actividad,
            as: 'ocupado_por',
            where: { id: idActividad }
        }
    });

    return mapEspacios(espacios);
}
