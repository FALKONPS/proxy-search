$(document).ready(function() {
    
    // Global variables
    let proxyList = [];
    // Constants
    const API_URL = 'http://localhost:2001';

    // Event listeners
    $('#refreshBtn').on('click', loadLastTest);
    
    // Initialize
    loadLastTest();

    function loadLastTest() {
        clearTable();
        closeEventSource();
        disableButton($('#refreshBtn'), 'Refreshing...');

        $.getJSON(`${API_URL}/last_test_results`)
            .done(handleTestResults)
            .fail(handleError)
            .always(() => enableButton($('#refreshBtn'), 'Refresh'));
    }

});