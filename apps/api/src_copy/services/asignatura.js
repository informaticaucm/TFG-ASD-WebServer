export async function getAsignaturaById(db, idAsignatura) {
    const asignatura = await db.sequelize.models.Asignatura.findOne({
        attributes: ['nombre', 'siglas', 'departamento', 'periodo'],
        where: { id: idAsignatura }
    });

    if (!asignatura) {
        throw { status: 404, message: 'Asignatura no encontrada' };
    }

    return asignatura;
}
