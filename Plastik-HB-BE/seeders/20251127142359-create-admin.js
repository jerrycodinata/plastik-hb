"use strict";
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("plastikhb2025", salt);

    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: uuidv4(),
          username: "admin",
          email: "admin@plastikhb.store",
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "users",
      { email: "admin@plastikhb.store" },
      {}
    );
  },
};
