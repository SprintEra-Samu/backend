"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("permissions", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },

            code: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("permissions");
    }
};