/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

async function fetchAndDisplayTable(tableName) {
    const tableElement = document.getElementById('tableSelectionTable');
    const tableHead = tableElement.querySelector('thead tr');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/table?table=${tableName}`);
    const responseData = await response.json();

    const tableHeaders = responseData.headers;
    const tableRows = responseData.data;

    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    tableHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        tableHead.appendChild(th);
    });

    tableRows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cellData => {
            const td = document.createElement('td');
            td.textContent = cellData;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

function generateInsertForm(fields) {
    const formContainer = document.getElementById('dynamicInsertFormContainer');
    const formElement = document.getElementById('dynamicInsertForm');

    formElement.innerHTML = '';

    fields.forEach(field => {
        const label = document.createElement('label');
        label.textContent = `${field.name}:`;
        
        const input = document.createElement('input');
        input.id = `field_${field.name}`;
        input.name = field.name;
        input.placeholder = `Enter ${field.name}`;

        if (field.type === 'NUMBER') {
            input.type = 'number';
        } else if (field.type === 'VARCHAR2') {
            input.type = 'text';
            input.maxLength = field.length || 255;
        }

        if (field.required) {
            input.required = true;
        }

        formElement.appendChild(label);
        formElement.appendChild(input);
        formElement.appendChild(document.createElement('br'));
    });

    formContainer.style.display = 'block';
}

function generateUpdateForm(fields) {
    const formContainer = document.getElementById('dynamicUpdateFormContainer');
    const formElement = document.getElementById('dynamicUpdateForm');
    formElement.innerHTML = '';

    fields.forEach(field => {
        const labelOld = document.createElement('label');
        labelOld.textContent = `Old ${field.name}:`;

        const inputOld = document.createElement('input');
        inputOld.id = `old_field_${field.name}`;
        inputOld.name = `old_${field.name}`;
        inputOld.placeholder = `Old ${field.name}`;

        const labelNew = document.createElement('label');
        labelNew.textContent = `New ${field.name}:`;

        const inputNew = document.createElement('input');
        inputNew.id = `new_field_${field.name}`;
        inputNew.name = `new_${field.name}`;
        inputNew.placeholder = `New ${field.name}`;

        if (field.type === 'NUMBER') {
            inputOld.type = 'number';
            inputNew.type = 'number';
        } else if (field.type === 'VARCHAR2') {
            inputOld.type = 'text';
            inputNew.type = 'text';
            inputNew.maxLength = field.length || 255;
        }

        if (field.required) {
            inputOld.required = true;
            inputNew.required = true;
        }

        formElement.appendChild(labelOld);
        formElement.appendChild(inputOld);
        formElement.appendChild(document.createElement('br'));
        formElement.appendChild(labelNew);
        formElement.appendChild(inputNew);
        formElement.appendChild(document.createElement('br'));
    });

    formContainer.style.display = 'block';
}

// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();

    document.getElementById('tableSelection').addEventListener('submit', async (event) => {
        event.preventDefault();
        const selectedTable = document.getElementById('tableSelect').value;
        await fetchAndDisplayTable(selectedTable);
    });

    document.getElementById('submitSelectForm').addEventListener('click', async (event) => {
        event.preventDefault();

        const selectedTable = document.getElementById('insertUpdateTableSelect').value;
        const formData = new FormData(document.getElementById('dynamicInsertForm'));

        const conditions = {};
        formData.forEach((value, key) => {
            if (value.trim()) { // Only include non-empty conditions
                conditions[key] = value;
            }
        });

        const response = await fetch(`/select-table?table=${selectedTable}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(conditions)
        });

        const responseData = await response.json();
        const resultContainer = document.getElementById('selectResultContainer');
        const resultMsg = document.getElementById('selectResultMsg');
        const resultTable = document.getElementById('selectResultTable');

        if (responseData.success) {
            resultMsg.textContent = 'Query executed successfully!';
            resultMsg.style.color = 'green';
            resultTable.innerHTML = '';

            const headerRow = document.createElement('tr');
            responseData.headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            resultTable.appendChild(headerRow);

            responseData.rows.forEach(row => {
                const rowElement = document.createElement('tr');
                row.forEach(cell => {
                    const td = document.createElement('td');
                    td.textContent = cell;
                    rowElement.appendChild(td);
                });
                resultTable.appendChild(rowElement);
            });
        } else {
            resultMsg.textContent = `Failed: ${responseData.error || 'Unknown error'}`;
            resultMsg.style.color = 'red';
            resultTable.innerHTML = '';
        }

        resultContainer.style.display = 'block';
    });

    document.getElementById('insertUpdateForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const selectedTable = document.getElementById('insertUpdateTableSelect').value;

        const response = await fetch(`/table-headers?table=${selectedTable}`);
        const responseData = await response.json();

        if (responseData.success) {
            const fields = responseData.headers;
            generateInsertForm(fields);
            generateUpdateForm(fields);
        } else {
            alert('Error fetching table fields!');
        }
    });

    document.getElementById('submitInsertForm').addEventListener('click', async (event) => {
        event.preventDefault();
    
        const selectedTable = document.getElementById('insertUpdateTableSelect').value;
        const formData = new FormData(document.getElementById('dynamicInsertForm'));
    
        const data = {};
        formData.forEach((value, key) => {
            if (value.trim()) { // Include only non-empty values
                data[key] = value;
            }
        });
    
        const response = await fetch(`/insert-table?table=${selectedTable}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    
        const responseData = await response.json();
        const messageElement = document.getElementById('insertResultMsg');
    
        if (responseData.success) {
            messageElement.textContent = 'Inserted successfully!';
            messageElement.style.color = 'green';
            formData.reset();
        } else {
            messageElement.textContent = `Failed: ${responseData.error || 'Unknown error'}`;
            messageElement.style.color = 'red';
        }
    });

    document.getElementById('submitUpdateForm').addEventListener('click', async (event) => {
        event.preventDefault();
        const selectedTable = document.getElementById('insertUpdateTableSelect').value;
        const formData = new FormData(document.getElementById('dynamicUpdateForm'));
        const data = {};
        formData.forEach((value, key) => {
            if (value.trim()) { // Include only non-empty values
                data[key] = value;
            }
        });
    
        const response = await fetch(`/update-table?table=${selectedTable}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    
        const responseData = await response.json();
        const messageElement = document.getElementById('updateResultMsg');

        if (responseData.success) {
            messageElement.textContent = 'Updated successfully!';
            messageElement.style.color = 'green';
            formData.reset();
        } else {
            messageElement.textContent = `Failed: ${responseData.error || 'Unknown error'}`;
            messageElement.style.color = 'red';
        }
    });

    document.getElementById('submitDeleteForm').addEventListener('click', async (event) => {
        event.preventDefault();
    
        const riotID = document.getElementById('deleteRiotID').value;
    
        if (!riotID) {
            alert('Please provide a RiotID to delete.');
            return;
        }
    
        try {
            const response = await fetch(`/delete-row?table=Player&keyColumn=RiotID&keyValue=${riotID}`, {
                method: 'DELETE',
            });
    
            const responseData = await response.json();
            const messageElement = document.getElementById('deleteResultMsg');
    
            if (responseData.success) {
                messageElement.textContent = 'Row deleted successfully!';
                messageElement.style.color = 'green';
                document.getElementById('deleteForm').reset();
            } else {
                messageElement.textContent = `Failed: ${responseData.error || 'Unknown error'}`;
                messageElement.style.color = 'red';
            }
        } catch (error) {
            console.error('Error during deletion:', error);
            alert('An error occurred while deleting the row.');
        }
    });
    
    document.getElementById('submitGroupByForm').addEventListener('click', async (event) => {
        event.preventDefault();
    
        try {
            const response = await fetch('/group-by-query', {
                method: 'GET',
            });
    
            const responseData = await response.json();
            const resultContainer = document.getElementById('groupByResultContainer');
    
            if (responseData.success) {
                const results = responseData.data;
                if (results.length === 0) {
                    resultContainer.innerHTML = '<p>No results found.</p>';
                    return;
                }
    
                const table = document.createElement('table');
                table.style.border = '1px solid black';
                table.style.borderCollapse = 'collapse';
    
                const headerRow = document.createElement('tr');
                Object.keys(results[0]).forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    th.style.border = '1px solid black';
                    th.style.padding = '5px';
                    headerRow.appendChild(th);
                });
                table.appendChild(headerRow);
    
                results.forEach(row => {
                    const tableRow = document.createElement('tr');
                    Object.values(row).forEach(value => {
                        const td = document.createElement('td');
                        td.textContent = value;
                        td.style.border = '1px solid black';
                        td.style.padding = '5px';
                        tableRow.appendChild(td);
                    });
                    table.appendChild(tableRow);
                });
    
                resultContainer.innerHTML = '';
                resultContainer.appendChild(table);
            } else {
                resultContainer.innerHTML = `<p style="color: red;">Failed: ${responseData.error || 'Unknown error'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching Group By results:', error);
            alert('An error occurred while fetching the results.');
        }
    });

    document.getElementById('joinForm').addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const headshotThreshold = document.getElementById('headshotThreshold').value;
    
        const response = await fetch(`/join-query?threshold=${headshotThreshold}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
    
        const result = await response.json();
        const resultsTableBody = document.querySelector('#joinResultTable tbody');
        resultsTableBody.innerHTML = '';
    
        if (result.success) {
            const rows = result.data;
    
            rows.forEach(row => {
                const tableRow = document.createElement('tr');
                tableRow.innerHTML = `
                    <td>${row.riotID}</td>
                    <td>${row.gunName}</td>
                    <td>${row.headshotPercentage}</td>
                    <td>${row.rank}</td>
                `;
                resultsTableBody.appendChild(tableRow);
            });
    
            document.getElementById('joinResultContainer').style.display = 'block';
        } else {
            alert('Failed to fetch results: ' + result.error);
        }
    });

    document.getElementById('divideForm').addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const riotIdsInput = document.getElementById('riotIdsInput').value.trim();
        if (!riotIdsInput) {
            alert('Please enter at least one RiotID.');
            return;
        }
    
        const riotIds = riotIdsInput.split(',').map(id => id.trim());
    
        const response = await fetch('/divide-matches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ riotIds }),
        });
    
        const responseData = await response.json();
    
        const resultContainer = document.getElementById('divideResultContainer');
        const tableHeaders = document.getElementById('divideTableHeaders');
        const tableBody = document.getElementById('divideTableBody');
    
        if (responseData.success) {
            resultContainer.style.display = 'block';
            tableHeaders.innerHTML = '';
            tableBody.innerHTML = '';
    
            if (responseData.data.length > 0) {
                Object.keys(responseData.data[0]).forEach((key) => {
                    const th = document.createElement('th');
                    th.textContent = key;
                    tableHeaders.appendChild(th);
                });
            }
    
            responseData.data.forEach((row) => {
                const tr = document.createElement('tr');
                Object.values(row).forEach((value) => {
                    const td = document.createElement('td');
                    td.textContent = value;
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        } else {
            alert(`Division failed: ${responseData.error || 'Unknown error'}`);
        }
    });
    
    document.getElementById('submitProjectionForm').addEventListener('click', async (event) => {
        event.preventDefault();
    
        const checkboxes = document.querySelectorAll('#projectionAgentSelect input[type="checkbox"]:checked');
        const selectedAbilities = Array.from(checkboxes).map(cb => cb.value);
    
        if (selectedAbilities.length === 0) {
            alert('Please select at least one ability.');
            return;
        }
    
        try {
            const response = await fetch(`/project-agent?abilities=${selectedAbilities.join(',')}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
    
            const responseData = await response.json();
            const resultContainer = document.getElementById('projectionResultContainer');
    
            if (responseData.success) {
                resultContainer.innerHTML = '';
    
                const table = document.createElement('table');
                table.border = 1;
    
                const headerRow = table.insertRow();
                headerRow.insertCell().textContent = 'Agent Name';
    
                selectedAbilities.forEach(ability => {
                    headerRow.insertCell().textContent = ability;
                });
    
                responseData.data.forEach(row => {
                    const tableRow = table.insertRow();
                    tableRow.insertCell().textContent = row.agentName;
    
                    selectedAbilities.forEach(ability => {
                        tableRow.insertCell().textContent = row[ability];
                    });
                });
    
                resultContainer.appendChild(table);
            } else {
                resultContainer.innerHTML = `<p style="color: red;">Failed to fetch data: ${responseData.error}</p>`;
            }
        } catch (error) {
            console.error('Error fetching projection data:', error);
            document.getElementById('projectionResultContainer').innerHTML = 
                `<p style="color: red;">Error fetching data.</p>`;
        }
    });    

    document.getElementById('groupByHavingForm').addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const deathThreshold = document.getElementById('deathThreshold').value;
    
        const response = await fetch(`/group-by-having?threshold=${deathThreshold}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
    
        const result = await response.json();
    
        if (result.success) {
            const tableBody = document.querySelector('#groupByHavingResultTable tbody');
            tableBody.innerHTML = '';
    
            result.data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.agentName}</td>
                    <td>${row.totalKills}</td>
                    <td>${row.totalDeaths}</td>
                `;
                tableBody.appendChild(tr);
            });
    
            document.getElementById('groupByHavingResultContainer').style.display = 'block';
        } else {
            alert('Failed to fetch results: ' + result.error);
        }
    });

    document.getElementById('nestedForm').addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const response = await fetch('/nested-query', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
    
        const result = await response.json();
    
        if (result.success) {
            document.getElementById('nestedQueryResult').textContent = `Average Spike Planted: ${result.data.avgSpikePlanted}`;
            document.getElementById('nestedResultContainer').style.display = 'block';
        } else {
            alert('Failed to fetch results: ' + result.error);
        }
    });
};
