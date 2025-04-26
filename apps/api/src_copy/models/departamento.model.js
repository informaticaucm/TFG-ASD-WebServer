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
      Departamento.belongsToMany(models.Docente, {
          through: models.Join_Departamento_Docentes,
          foreignKey: 'departamento_id',
          otherKey: 'docente_id',
          as: 'docentes'
      });
  };

    return Departamento;
}