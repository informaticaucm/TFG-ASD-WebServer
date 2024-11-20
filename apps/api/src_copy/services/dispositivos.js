import { authenticator } from 'otplib';
import moment from 'moment';

export async function getAllDispositivos(db) {
    apiLogger.info('Searching in Dispositivo for id, nombre, espacioId, idExternoDispositivo');
    const query = await db.sequelize.models.Dispositivo.findAll({
        attributes: ['id', 'nombre', 'espacioId', 'idExternoDispositivo'],
    });

    return query.map(disp => disp.dataValues);
}

export async function createDispositivo(body, db, api_config) {
    const transaction = await db.sequelize.transaction();
    try {
        const port_spec = api_config.port_spec ? ':' + api_config.port : '';
        const endpointSeguimiento = `${api_config.protocol}://${api_config.host}${port_spec}${api_config.path}/seguimiento`;
        const dispSecret = authenticator.generateSecret();

        const [disp, created] = await db.sequelize.models.Dispositivo.findOrCreate({
            where: { nombre: body.nombre, espacioId: body.espacioId },
            defaults: {
                nombre: body.nombre,
                espacioId: body.espacioId,
                idExternoDispositivo: body.idExternoDispositivo,
                creadoPor: 1,
                actualizadoPor: 1,
                endpointSeguimiento,
                t0: 0,
                secret: dispSecret,
            },
        });

        if (!created && body.idExternoDispositivo !== disp.dataValues.idExternoDispositivo) {
            await db.sequelize.models.Dispositivo.update(
                { idExternoDispositivo: body.idExternoDispositivo },
                { where: { id: disp.dataValues.id } }
            );
        }

        await transaction.commit();

        return {
            id: disp.id,
            nombre: body.nombre,
            espacioId: body.espacioId,
            idExternoDispositivo: body.idExternoDispositivo,
            creadoEn: disp.creadoEn,
            creadoPor: disp.creadoPor,
            actualizadoEn: disp.actualizadoEn,
            actualizadoPor: disp.actualizadoPor,
            endpointSeguimiento,
            totpConfig: { t0: 0, secret: disp.secret },
            epoch: moment.unix(),
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

export async function findDispositivoById(idDispositivo, db) {
    apiLogger.info('Searching in Dispositivo for all columns');
    const query = await db.sequelize.models.Dispositivo.findOne({
        attributes: { exclude: [] },
        where: { id: idDispositivo },
    });

    return query ? query.dataValues : null;
}

export async function removeDispositivo(idDispositivo, db) {
    const transaction = await db.sequelize.transaction();
    try {
        const query = await db.sequelize.models.Dispositivo.findOne({
            attributes: ['id'],
            where: { id: idDispositivo },
        });

        if (!query) {
            await transaction.rollback();
            return false;
        }

        await db.sequelize.models.Dispositivo.destroy({ where: { id: query.dataValues.id } });
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

export function getCurrentEpoch() {
    return { epoch: Math.floor(new Date().getTime() / 1000) };
}
