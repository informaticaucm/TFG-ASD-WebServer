import { DataTypes } from 'sequelize';

//Tabla de la relación imparte (Docente imparte Actividad)
export function model(sequelize) {
    
    const Join_Departamento_Docentes = sequelize.define('Join_Departamento_Docentes', {
    }, {
        freezeTableName: true,
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    });

    return Join_Departamento_Docentes;
}
