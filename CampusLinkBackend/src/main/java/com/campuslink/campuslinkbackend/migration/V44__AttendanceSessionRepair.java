package com.campuslink.campuslinkbackend.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

public class V44__AttendanceSessionRepair extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        try (Statement statement = connection.createStatement()) {
            dropForeignKeysReferencing(connection, statement, "attendance_session");
            if (columnExists(connection, "programme_attendance", "attendance_session_id")) {
                statement.execute("ALTER TABLE programme_attendance DROP COLUMN attendance_session_id");
            }
            if (tableExists(connection, "attendance_session")) {
                if (columnExists(connection, "attendance_session", "status")
                        && !columnExists(connection, "attendance_session", "session_status")) {
                    statement.execute(
                            "ALTER TABLE attendance_session CHANGE COLUMN `status` session_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'"
                    );
                }
                if (!columnExists(connection, "attendance_session", "session_status")) {
                    statement.execute("DROP TABLE attendance_session");
                }
            }
            if (!tableExists(connection, "attendance_session")) {
                statement.execute(
                        "CREATE TABLE attendance_session ("
                                + "id BIGINT AUTO_INCREMENT PRIMARY KEY, "
                                + "programme_id BIGINT NOT NULL, "
                                + "organizer_id BIGINT NOT NULL, "
                                + "session_secret VARCHAR(64) NOT NULL, "
                                + "session_label VARCHAR(150) NOT NULL, "
                                + "session_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', "
                                + "started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "
                                + "ended_at TIMESTAMP NULL, "
                                + "CONSTRAINT fk_att_session_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE, "
                                + "CONSTRAINT fk_att_session_organizer FOREIGN KEY (organizer_id) REFERENCES user(id) ON DELETE CASCADE"
                                + ")"
                );
            }
            if (!indexExists(connection, "attendance_session", "idx_attendance_session_programme_status")) {
                statement.execute(
                        "CREATE INDEX idx_attendance_session_programme_status ON attendance_session (programme_id, session_status)"
                );
            }
            if (!columnExists(connection, "programme_attendance", "attendance_session_id")) {
                statement.execute("ALTER TABLE programme_attendance ADD COLUMN attendance_session_id BIGINT NULL");
            }
            if (!foreignKeyExists(connection, "programme_attendance", "fk_attendance_session")) {
                statement.execute(
                        "ALTER TABLE programme_attendance ADD CONSTRAINT fk_attendance_session "
                                + "FOREIGN KEY (attendance_session_id) REFERENCES attendance_session(id) ON DELETE SET NULL"
                );
            }
        }
    }

    private void dropForeignKeysReferencing(Connection connection, Statement statement, String referencedTable)
            throws Exception {
        String sql = "SELECT TABLE_NAME, CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS "
                + "WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_TYPE = 'FOREIGN KEY' "
                + "AND TABLE_NAME IN ("
                + "SELECT TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE "
                + "WHERE CONSTRAINT_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME = '" + referencedTable + "'"
                + ")";
        try (Statement query = connection.createStatement();
             ResultSet resultSet = query.executeQuery(sql)) {
            while (resultSet.next()) {
                String tableName = resultSet.getString("TABLE_NAME");
                String constraintName = resultSet.getString("CONSTRAINT_NAME");
                statement.execute("ALTER TABLE " + tableName + " DROP FOREIGN KEY " + constraintName);
            }
        }
    }

    private boolean tableExists(Connection connection, String tableName) throws Exception {
        return queryCount(connection,
                "SELECT COUNT(*) FROM information_schema.TABLES "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '" + tableName + "'") > 0;
    }

    private boolean columnExists(Connection connection, String tableName, String columnName) throws Exception {
        return queryCount(connection,
                "SELECT COUNT(*) FROM information_schema.COLUMNS "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '" + tableName + "' "
                        + "AND COLUMN_NAME = '" + columnName + "'") > 0;
    }

    private boolean foreignKeyExists(Connection connection, String tableName, String constraintName) throws Exception {
        return queryCount(connection,
                "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS "
                        + "WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = '" + tableName + "' "
                        + "AND CONSTRAINT_NAME = '" + constraintName + "'") > 0;
    }

    private boolean indexExists(Connection connection, String tableName, String indexName) throws Exception {
        return queryCount(connection,
                "SELECT COUNT(*) FROM information_schema.STATISTICS "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '" + tableName + "' "
                        + "AND INDEX_NAME = '" + indexName + "'") > 0;
    }

    private int queryCount(Connection connection, String sql) throws Exception {
        try (Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(sql)) {
            resultSet.next();
            return resultSet.getInt(1);
        }
    }
}
