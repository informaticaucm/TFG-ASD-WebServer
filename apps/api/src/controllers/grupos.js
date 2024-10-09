import { apiLogger } from '../../../../packages/logger/src/logger.js';
import { Op } from 'sequelize';

export async function getGrupoById(req, res, next, db) {
    let idGrupo = Number(req.params.idGrupo);
    if (!Number.isInteger(idGrupo)) {
        let err = {};
        err.status = 400;
        err.message = 'Id suministrado no válido';
        return next(err);
    }

    const transaction = await db.sequelize.transaction();
        
    try {
        apiLogger.info('Searching in Grupo for curso, letra');
        const query_gru = await db.sequelize.models.Grupo.findOne({
            attributes:['curso', 'letra'],
            where: {
                id: req.params.idGrupo
            }
        });

        if (query_gru == null || Object.keys(query_gru.dataValues).length == 0) {
            await transaction.rollback();
            let err = {};
            err.status = 404;
            err.message = 'Grupo no encontrado';
            return next(err);
        }

        const resultado = query_gru.dataValues;

        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(resultado);
    }
    catch (error) {
        apiLogger.error(`Error while interacting with database: ${error}`);
        await transaction.rollback();
        let err = {};
        err.status = 500;
        err.message = 'Something went wrong';
        return next(err);
    }
      
    await transaction.commit();
}

export async function getGrupoByCursoLetra(req, res, next, db) {
    
    let curso = Number(req.body.curso);
    if (!Number.isInteger(curso)) {
        let err = {};
        err.status = 400;
        err.message = 'Datos suministrados no válidos';
        return next(err);
    }

    if (typeof req.body.letra != "string") {
        let err = {};
        err.status = 400;
        err.message = 'Datos suministrados no válidos';
        return next(err);
    }

    const transaction = await db.sequelize.transaction();

    try {
        const query_grupo = await db.sequelize.models.Grupo.findOne({
            attributes: ['id'],
            where: {
                curso: curso,
                letra: req.body.letra
            }
        });
    
        if (query_grupo == null || Object.keys(query_grupo.dataValues).length == 0) {
            await transaction.rollback();
            let err = {};
            err.status = 404;
            err.message = 'Grupo no encontrado';
            return next(err);
        }
    
        res.status(200).send(query_grupo.dataValues);
    }
    catch (error) {
        apiLogger.error(`Error while interacting with database: ${error}`);
        await transaction.rollback();
        let err = {};
        err.status = 500;
        err.message = 'Something went wrong';
        return next(err);
    }
    
    transaction.commit();
    return;
}
