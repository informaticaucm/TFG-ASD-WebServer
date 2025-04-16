'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    return await queryInterface.bulkInsert('Join_Departamento_Docentes', [
        {departamento_id:1, docente_id:1},
        {departamento_id:2, docente_id:2},
        {departamento_id:3, docente_id:3},
        {departamento_id:4, docente_id:4},
        {departamento_id:5, docente_id:5},
        {departamento_id:6, docente_id:6}
        
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     return await queryInterface.bulkDelete('Join_Departamento_Docentes', null, {});
  }
};
