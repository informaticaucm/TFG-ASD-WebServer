// clase.service.js

export async function getClaseById(db, idClase) {
    //const transaction = await db.sequelize.transaction();

    try {
        const query_cla = await db.sequelize.models.Clase.findOne({
            attributes: ['asignatura_id', 'grupo_id'],
            where: { id: idClase }
        });

        if (!query_cla) {
            //await transaction.rollback();
            throw new Error('Clase no encontrada');
        }

        return query_cla.dataValues;
    } catch (error) {
        //await transaction.rollback();
        throw new Error(`Error while interacting with database: ${error.message}`);
    } 
	/*
	finally {
        //await transaction.commit();
    }*/
}

export async function getClaseOfAsignaturaGrupo(db, asignatura_id, grupo_id) {
    //const transaction = await db.sequelize.transaction();

    try {
        const query_asig = await db.sequelize.models.Asignatura.findOne({
            attributes: ['id'],
            where: { id: asignatura_id }
        });

        if (!query_asig) {
            //await transaction.rollback();
            throw new Error('Asignatura no encontrada');
        }

        const query_gr = await db.sequelize.models.Grupo.findOne({
            attributes: ['id'],
            where: { id: grupo_id }
        });

        if (!query_gr) {
            //await transaction.rollback();
            throw new Error('Grupo no encontrado');
        }

        const query_cla = await db.sequelize.models.Clase.findOne({
            attributes: ['id'],
            where: { asignatura_id, grupo_id }
        });

        if (!query_cla) {
            //await transaction.rollback();
            throw new Error('Clase no encontrada');
        }

        return { id: query_cla.id };
    } catch (error) {
        //await transaction.rollback();
        throw new Error(`Error while interacting with database: ${error.message}`);
    } 
	/*
	
	finally {
        await transaction.commit();
    }
	*/
}
