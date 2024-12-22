const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchTableData(tableName) {
    return await withOracleDB(async (connection) => {
        let query = `SELECT * FROM ${tableName}`;
        console.log('Query:', query);
        const result = await connection.execute(query);
        const headers = result.metaData.map(column => column.name);
        const dataResult = result.rows;

        return {
            headers: headers,
            rows: dataResult
        };
    }).catch(error => {
        console.error('Database error:', error);
        throw error;
    });
}

async function selectRows(tableName, conditions) {
    return await withOracleDB(async (connection) => {
        const conditionClauses = Object.keys(conditions)
            .map((key, index) => `${key} = :${index + 1}`)
            .join(' AND ');

        const query = `
            SELECT * FROM ${tableName}
            ${conditionClauses ? `WHERE ${conditionClauses}` : ''}
        `;

        const values = Object.values(conditions);

        try {
            const result = await connection.execute(query, values);
            const headers = result.metaData.map(meta => meta.name);
            return { headers, rows: result.rows };
        } catch (error) {
            console.error('Database select error:', error);
            throw new Error(`Failed to execute select: ${error.message}`);
        }
    });
}

async function getTableHeaders(tableName) {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT column_name, data_type, data_length, nullable 
            FROM all_tab_columns 
            WHERE table_name = :tableName AND owner = :owner
        `;

        const result = await connection.execute(query, [tableName.toUpperCase(), envVariables.ORACLE_USER.toUpperCase()]);
        return result.rows.map(row => {
            return {
                name: row[0],
                type: row[1],
                length: row[2],
                nullable: row[3]
            };
        });
    });
}

async function insertRow(tableName, rowData) {
    return await withOracleDB(async (connection) => {
        const columns = Object.keys(rowData).join(', ');
        const values = Object.values(rowData);
        const placeholders = values.map((_, i) => `:${i + 1}`).join(', ');

        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        console.log("Query: ", query, values);

        try {
            const result = await connection.execute(query, values, { autoCommit: true });
            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Database insert error:', error);
            throw new Error(`Failed to insert row: ${error.message}`);
        }
    });
}

async function updateRow(tableName, rowData) {
    return await withOracleDB(async (connection) => {
        const updateColumns = Object.keys(rowData).filter(key => key.startsWith('new_')).map(key => key.replace('new_', ''));
        const conditionColumns = Object.keys(rowData).filter(key => key.startsWith('old_')).map(key => key.replace('old_', ''));

        if (updateColumns.length === 0) {
            throw new Error('No columns to update. Provide at least one new_ value.');
        }
        if (conditionColumns.length === 0) {
            throw new Error('No conditions provided. Provide at least one old_ value.');
        }

        const newValues = updateColumns.map(col => rowData[`new_${col}`]);
        const oldValues = conditionColumns.map(col => rowData[`old_${col}`]);

        const setClauses = updateColumns.map((col, index) => `${col} = :${index + 1}`).join(', ');
        const whereClauses = conditionColumns.map((col, index) => `${col} = :${updateColumns.length + index + 1}`).join(' AND ');

        const values = [...newValues, ...oldValues];
        const query = `UPDATE ${tableName} SET ${setClauses} WHERE ${whereClauses}`;
        console.log('Query:', query.replace(/:[0-9]+/g, (match) => `'${values[parseInt(match.slice(1)) - 1]}'`));

        try {
            const result = await connection.execute(query, values, { autoCommit: true });
            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Database update error:', error);
            throw new Error(`Failed to update row: ${error.message}`);
        }
    });
}

async function deleteRow(tableName, keyColumn, keyValue) {
    return await withOracleDB(async (connection) => {
        const query = `DELETE FROM ${tableName} WHERE ${keyColumn} = :keyValue`;

        try {
            const result = await connection.execute(query, { keyValue }, { autoCommit: true });
            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Database delete error:', error);
            throw new Error(`Failed to delete row: ${error.message}`);
        }
    });
}

async function getGroupByResults() {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT teamName, SUM(earnings) AS totalEarnings 
            FROM ProPlayer 
            GROUP BY teamName
        `;

        try {
            const result = await connection.execute(query);
            return result.rows.map(row => ({
                teamName: row[0],
                totalEarnings: row[1],
            }));
        } catch (error) {
            console.error('Database query error:', error);
            throw new Error(`Failed to execute Group By query: ${error.message}`);
        }
    });
}

async function getJoinResults(threshold) {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT w.riotID, w.gunName, w.headshotPercentage, p.rank
            FROM WeaponStats w
            JOIN Player p ON w.riotID = p.riotID
            WHERE w.headshotPercentage > :threshold
        `;

        const result = await connection.execute(query, [threshold]);

        return result.rows.map(row => ({
            riotID: row[0],
            gunName: row[1],
            headshotPercentage: row[2],
            rank: row[3]
        }));
    });
}

async function projectAgent(abilities) {
    return await withOracleDB(async (connection) => {
        const selectedColumns = abilities.map(ability => `${ability}`).join(', ');

        const query = `
            SELECT agentname AS agentName, ${selectedColumns}
            FROM agent
        `;

        try {
            const result = await connection.execute(query, []);
            return result.rows.map(row => {
                const rowData = { agentName: row[0] };
                abilities.forEach((ability, index) => {
                    rowData[ability] = row[index + 1];
                });
                return rowData;
            });
        } catch (error) {
            console.error('Database projection error:', error);
            throw new Error(`Failed to fetch projection: ${error.message}`);
        }
    });
}

async function getGroupByHavingResults(threshold) {
    return await withOracleDB(async (connection) => {
        const query = `SELECT agentName, SUM(kills) AS totalKills, SUM(deaths) AS totalDeaths
            FROM PlayedInMatch
            GROUP BY agentName
            HAVING SUM(deaths) < :threshold`;

        const result = await connection.execute(query, [threshold]);

        return result.rows.map(row => ({
            agentName: row[0],
            totalKills: row[1],
            totalDeaths: row[2]
        }));
    });
}
async function divideMatches(riotIds) {
    return await withOracleDB(async (connection) => {
        // Create a temporary table
        await connection.execute(`
            CREATE GLOBAL TEMPORARY TABLE temp_riot_ids (
                riotId VARCHAR2(32)
            ) ON COMMIT DELETE ROWS
        `);

        // Insert RiotIDs into the temporary table
        const riotIdInsertQuery = `
            INSERT INTO temp_riot_ids (riotId)
            VALUES (:1)
        `;
        for (const riotId of riotIds) {
            await connection.execute(riotIdInsertQuery, [riotId]);
        }

        const query = `
            SELECT DISTINCT m.matchId, m.startTime, m.regionName, m.mapName
            FROM Match m
            WHERE NOT EXISTS (
                SELECT 1
                FROM temp_riot_ids t
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM PlayedInMatch p
                    WHERE p.matchId = m.matchId
                    AND p.riotId = t.riotId
                )
            )
        `;

        const result = await connection.execute(query);
        
        await connection.execute(`DROP TABLE temp_riot_ids`);

        return result.rows.map((row) => ({
            matchId: row[0],
            startTime: row[1],
            regionName: row[2],
            mapName: row[3],
        }));
    });
}

async function getAvgSpikePlanted() {
    return await withOracleDB(async (connection) => {
        const query = `SELECT AVG(spikeCount) AS avgSpikePlanted
            FROM (SELECT matchId, COUNT(*) AS spikeCount
                FROM Round
                WHERE spikePlanted = 1
                GROUP BY matchId) spikeCountsPerMatch`;

        const result = await connection.execute(query);

        if (result.rows.length === 0) {
            return 0; 
        }

        return result.rows[0][0]; 
    });
}

module.exports = {
    testOracleConnection,
    fetchTableData,
    selectRows,
    getTableHeaders,
    insertRow,
    updateRow,
    deleteRow,
    getGroupByResults,
    getJoinResults,
    projectAgent,
    getGroupByHavingResults,
    divideMatches,
    getAvgSpikePlanted
};
