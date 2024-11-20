import { DataTypes } from 'sequelize';

//Tabla de la relación en (Actividad en Espacio) 
export function model(sequelize) {
    
    const Join_Actividad_Espacio = sequelize.define('Join_Actividad_Espacio', {
    }, {
        freezeTableName: true,
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    });

    return Join_Actividad_Espacio;
}
