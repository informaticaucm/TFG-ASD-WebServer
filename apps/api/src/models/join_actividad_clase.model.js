import { DataTypes } from 'sequelize';

//Tabla de la relación asiste (Clase asiste Actividad)
export function model(sequelize, DataTypes) {
    
    const Join_Actividad_Clase = sequelize.define('Join_Actividad_Clase', {
    }, {
        freezeTableName: true,
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    });

    return Join_Actividad_Clase;
}
