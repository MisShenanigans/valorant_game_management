const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/table', async (req, res) => {
    const tableName = req.query.table;

    if (!tableName) {
        return res.status(400).json({ error: 'Table name is required.' });
    }

    try {
        const { headers, rows } = await appService.fetchTableData(tableName);
        res.json({ headers, data: rows });
    } catch (error) {
        console.error('Error fetching table data:', error);
        res.status(500).json({ error: 'Failed to fetch table data.' });
    }
});

router.post('/select-table', async (req, res) => {
    const tableName = req.query.table;
    const conditions = req.body;

    if (!tableName) {
        return res.status(400).json({ success: false, error: 'Table name is required.' });
    }

    try {
        const result = await appService.selectRows(tableName, conditions);
        res.json({
            success: true,
            headers: result.headers,
            rows: result.rows
        });
    } catch (error) {
        console.error('Error selecting data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/table-headers', async (req, res) => {
    const tableName = req.query.table;

    if (!tableName) {
        return res.status(400).json({ success: false, error: 'Table name is required.' });
    }

    try {
        const headers = await appService.getTableHeaders(tableName);
        res.json({ success: true, headers });
    } catch (error) {
        console.error('Error fetching table headers:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch table headers.' });
    }
});

router.post('/insert-table', async (req, res) => {
    const tableName = req.query.table;
    const rowData = req.body;

    if (!tableName || !rowData) {
        return res.status(400).json({ success: false, error: 'Table name and row data are required.' });
    }

    try {
        const insertResult = await appService.insertRow(tableName, rowData);
        if (insertResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, error: 'Insertion failed without details.' });
        }
    } catch (error) {
        console.error('Error inserting data:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/update-table', async (req, res) => {
    const tableName = req.query.table;
    const rowData = req.body;

    if (!tableName || !rowData) {
        return res.status(400).json({ success: false, error: 'Table name and row data are required.' });
    }

    try {
        const updateResult = await appService.updateRow(tableName, rowData);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, error: 'Update failed without details.' });
        }
    } catch (error) {
        console.error('Error updating data:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/delete-row', async (req, res) => {
    const tableName = req.query.table;
    const keyColumn = req.query.keyColumn;
    const keyValue = req.query.keyValue;

    if (!tableName || !keyColumn || !keyValue) {
        return res.status(400).json({ success: false, error: 'Table name, key column, and key value are required.' });
    }

    try {
        const deleteResult = await appService.deleteRow(tableName, keyColumn, keyValue);
        if (deleteResult) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Row not found or could not be deleted.' });
        }
    } catch (error) {
        console.error('Error deleting row:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/group-by-query', async (req, res) => {
    try {
        const results = await appService.getGroupByResults();
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error executing Group By query:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/join-query', async (req, res) => {
    const threshold = req.query.threshold;

    if (!threshold) {
        return res.status(400).json({ success: false, error: 'Headshot percentage threshold is required.' });
    }

    try {
        const joinResults = await appService.getJoinResults(threshold);
        res.json({ success: true, data: joinResults });
    } catch (error) {
        console.error('Error fetching join query results:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch join query results.' });
    }
});

router.get('/project-agent', async (req, res) => {
    const selectedAbilities = req.query.abilities.split(',');

    if (!selectedAbilities || selectedAbilities.length === 0) {
        return res.status(400).json({ success: false, error: 'At least one ability is required.' });
    }

    try {
        const projectionData = await appService.projectAgent(selectedAbilities);
        res.json({ success: true, data: projectionData });
    } catch (error) {
        console.error('Error fetching projection data:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch projection data.' });
    }
});

router.get('/group-by-having', async (req, res) => {
    const { threshold } = req.query;

    if (!threshold || isNaN(threshold)) {
        return res.status(400).json({ success: false, error: 'Invalid threshold value provided.' });
    }

    try {
        const groupByResults = await appService.getGroupByHavingResults(threshold);
        res.json({ success: true, data: groupByResults });
    } catch (error) {
        console.error('Error fetching group by results:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch group by results.' });
    }
});

router.post('/divide-matches', async (req, res) => {
    const riotIds = req.body.riotIds;

    if (!riotIds || !Array.isArray(riotIds) || riotIds.length === 0) {
        return res.status(400).json({ success: false, error: 'RiotIDs are required.' });
    }

    try {
        const divisionResult = await appService.divideMatches(riotIds);
        res.json({ success: true, data: divisionResult });
    } catch (error) {
        console.error('Error dividing matches:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/nested-query', async (req, res) => {
    try {
        const avgSpikePlanted = await appService.getAvgSpikePlanted();
        res.json({ success: true, data: { avgSpikePlanted } });
    } catch (error) {
        console.error('Error fetching nested query results:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch nested query results.' });
    }
});

module.exports = router;
