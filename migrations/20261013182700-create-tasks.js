"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("tasks", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },

            title: {
                type: Sequelize.STRING(255),
                allowNull: false
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },

            status: {
                type: Sequelize.ENUM("To Do", "In Progress", "Done"),
                allowNull: false,
                defaultValue: "To Do"
            },

            project_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "projects",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },

            assigned_to: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
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

        // Performans için index'ler
        await queryInterface.addIndex("tasks", ["project_id"], {
            name: "idx_tasks_project_id"
        });

        await queryInterface.addIndex("tasks", ["assigned_to"], {
            name: "idx_tasks_assigned_to"
        });

        await queryInterface.addIndex("tasks", ["status"], {
            name: "idx_tasks_status"
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex("tasks", "idx_tasks_status");
        await queryInterface.removeIndex("tasks", "idx_tasks_assigned_to");
        await queryInterface.removeIndex("tasks", "idx_tasks_project_id");
        await queryInterface.dropTable("tasks");
    }
};
