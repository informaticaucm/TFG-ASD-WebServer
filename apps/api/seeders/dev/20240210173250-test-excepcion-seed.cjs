'use strict';

const { escapeRequest } = require('../../../ui/src/middleware');

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
    return await queryInterface.bulkInsert('Excepcion', [
      { id: 1, esta_reprogramado: 'Sí', esta_cancelado: 'No', fecha_inicio_act: new Date('2025-01-01T10:00Z'), fecha_fin_act: new Date('2025-12-31T12:00Z'), fecha_inicio_ex: new Date('2025-01-01T10:00Z'), fecha_fin_ex: new Date('2025-12-12T12:00Z'), motivo: 'Reunión de coordinación', fecha_original: new Date('2025-05-30T10:00Z'), es_todo_el_día: 'No', creado_por: 'admin', actividad_id: 1, suplente_id: 3 },
      { id: 2, esta_reprogramado: 'No', esta_cancelado: 'Sí', fecha_inicio_act: new Date('2025-02-01T10:00Z'), fecha_fin_act: new Date('2025-02-28T12:00Z'), fecha_inicio_ex: new Date('2025-02-01T10:00Z'), fecha_fin_ex: new Date('2025-12-12T12:00Z'), motivo: 'Falta del docente', fecha_original: new Date('2025-02-01T10:00Z'), es_todo_el_día: 'Sí', creado_por: '3', actividad_id: 2, suplente_id: null}
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return await queryInterface.bulkDelete('Excepcion', null, {});
  }
};
