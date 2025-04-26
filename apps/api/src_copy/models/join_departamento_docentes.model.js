import { DataTypes } from 'sequelize';

//Tabla de la relación pertenece (Join_Departamento_Docentes)
export function model(sequelize) {
    const Join_Departamento_Docentes = sequelize.define('Join_Departamento_Docentes', {
        docente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        departamento_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        freezeTableName: true,
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    });
    return Join_Departamento_Docentes;
}
