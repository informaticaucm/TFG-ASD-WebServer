import { DataTypes } from 'sequelize';

export function model(sequelize) {
    
    const Departamento = sequelize.define('Departamento', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          nombre: {
            type: DataTypes.STRING,
            allowNull: false
          },
          email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
          }
    }, {
        freezeTableName: true,
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    });

    Departamento.associate = function (models) {
        /*models.Departamento.hasMany(models.Docente, { as: 'Miembros', foreignKey: { name: 'docente_id', allowNull: false }}); //Un departamento tiene varios docentes
        models.Departamento.belongsToMany(models.Docente, { as: 'pertenece', through: { model: models.Join_Departamento_Docentes, foreignKey: 'departamento_id', allowNull: false }, foreignKey: 'departamento_id' });
*/
    }; 

    return Departamento;
}