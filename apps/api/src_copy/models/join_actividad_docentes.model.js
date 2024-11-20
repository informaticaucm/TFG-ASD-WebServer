import { DataTypes } from 'sequelize';

//Tabla de la relación imparte (Docente imparte Actividad)
export function model(sequelize) {
    
    const Join_Actividad_Docentes = sequelize.define('Join_Actividad_Docentes', {
    }, {
        freezeTableName: true,
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    });

    return Join_Actividad_Docentes;
}
