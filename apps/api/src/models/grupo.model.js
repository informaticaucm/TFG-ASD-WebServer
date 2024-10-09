import { DataTypes } from 'sequelize';

export function model(sequelize) {

    const Grupo = sequelize.define('Grupo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        curso: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        letra: {
            type: DataTypes.STRING(2),
            allowNull: false
        }
    }, {
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ['curso', 'letra']
            }
        ],
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    });

    Grupo.associate = function (models) {
        models.Grupo.belongsToMany(models.Asignatura, { as: 'de_asignaturas', through: { model: models.Clase, foreignKey: 'grupo_id' }, foreignKey: 'grupo_id' }); //Un grupo es contenido en una o más asignaturas
    };

    return Grupo;
}
