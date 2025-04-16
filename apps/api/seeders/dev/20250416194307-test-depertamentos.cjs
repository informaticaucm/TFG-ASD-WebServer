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
    return await queryInterface.bulkInsert('Departamento', [
        {id: 1, nombre: "Sistemas Informáticos y Computación", email: "SIYC+pruebas@ucm.es"},//todos los correos son inventados
        {id: 2, nombre: "Arquitectura de Computadores y Automática", email: "ACYA+pruebas@ucm.es"},//todos los correos son inventados
        {id: 3, nombre: "Ingeniería del Software e Inteligencia Artificial", email: "ISIA+pruebas@ucm.es"},//todos los correos son inventados
        {id: 4, nombre: "Álgebra, Geometría y Topología", email: "AGYT+pruebas@ucm.es"},//todos los correos son inventados
        {id: 5, nombre: "Análisis Matemático y Matemática Aplicada", email: "AMMA+pruebas@ucm.es"},//todos los correos son inventados
        {id: 6, nombre: "Administración Financiera y Contabilidad", email: "AFYC+pruebas@ucm.es"},//todos los correos son inventados
        {id: 7, nombre: "Estadística e Investigación Operativa", email: "EEIO+pruebas@ucm.es"},//todos los correos son inventados
        {id: 8, nombre: "Estructura de la Materia, Física Térmica y Electrónica", email: "EMFTE+pruebas@ucm.es"},//todos los correos son inventados
        {id: 9, nombre: "Física de Materiales", email: "FDM+pruebas@ucm.es"},//todos los correos son inventados
        {id: 10, nombre: "Dibujo y Grabado", email: "DYG+pruebas@ucm.es"}//todos los correos son inventados
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     return await queryInterface.bulkDelete('Departamento', null, {});
  }
};
