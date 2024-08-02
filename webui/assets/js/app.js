$(document).ready(function() {
    
    // Global variables
    let proxyList = [];
    let selectedCountries = [];
    let currentSort = { field: 'speed', direction: 'desc' };
    let eventSource = null

    // Constants
    const API_URL = 'http://localhost:2001';

    const countryRegion = {
        "Middle East": ["SA", "IR", "AE", "QA", "EG", "IL", "IQ", "JO", "KW", "LB", "OM", "SY", "YE"],
        "Asia": ["IN", "CN", "SG", "JP", "VN", "KR", "BD", "HK", "MY", "TH", "PH", "TW", "KH", "ID", "PK", "NP", "LK", "MM"],
        "Europe": ["RU", "DE", "GB", "FR", "IT", "ES", "NL", "UA", "PL", "SE", "NO", "FI", "DK", "RO", "CZ", "BE", "AT", "HU", "BG", "GR", "PT", "CH", "SK", "LV", "LT", "EE", "IE", "IS"],
        "Americas": ["US", "CA", "BR", "MX", "AR", "CL", "CO", "PE", "VE", "EC", "UY", "BO", "PY", "GY"],
        "Africa": ["ZA", "EG", "NG", "DZ", "MA", "KE", "GH", "UG", "TZ", "SN", "ET", "ZM", "ZW", "CM", "CI", "MW", "MU", "RW", "BF", "ML", "NE", "BI"],
        "Oceania": ["AU", "NZ", "FJ", "PG"]
    };
    
    const countryNames = {
        "SA": "Saudi Arabia", "IR": "Iran", "AE": "United Arab Emirates", "QA": "Qatar", "EG": "Egypt", "IL": "Israel", "IQ": "Iraq", "JO": "Jordan", "KW": "Kuwait", "LB": "Lebanon", "OM": "Oman", "SY": "Syria", "YE": "Yemen",
        "IN": "India", "CN": "China", "SG": "Singapore", "JP": "Japan", "VN": "Viet Nam", "KR": "Korea", "BD": "Bangladesh", "HK": "Hong Kong", "MY": "Malaysia", "TH": "Thailand", "PH": "Philippines", "TW": "Taiwan", "KH": "Cambodia", "ID": "Indonesia", "PK": "Pakistan", "NP": "Nepal", "LK": "Sri Lanka", "MM": "Myanmar",
        "RU": "Russian Federation", "DE": "Germany", "GB": "United Kingdom", "FR": "France", "IT": "Italy", "ES": "Spain", "NL": "Netherlands", "UA": "Ukraine", "PL": "Poland", "SE": "Sweden", "NO": "Norway", "FI": "Finland", "DK": "Denmark", "RO": "Romania", "CZ": "Czechia", "BE": "Belgium", "AT": "Austria", "HU": "Hungary", "BG": "Bulgaria", "GR": "Greece", "PT": "Portugal", "CH": "Switzerland", "SK": "Slovakia", "LV": "Latvia", "LT": "Lithuania", "EE": "Estonia", "IE": "Ireland", "IS": "Iceland",
        "US": "United States of America", "CA": "Canada", "BR": "Brazil", "MX": "Mexico", "AR": "Argentina", "CL": "Chile", "CO": "Colombia", "PE": "Peru", "VE": "Venezuela", "EC": "Ecuador", "UY": "Uruguay", "BO": "Bolivia", "PY": "Paraguay", "GY": "Guyana",
        "ZA": "South Africa", "NG": "Nigeria", "DZ": "Algeria", "MA": "Morocco", "KE": "Kenya", "GH": "Ghana", "UG": "Uganda", "TZ": "Tanzania", "SN": "Senegal", "ET": "Ethiopia", "ZM": "Zambia", "ZW": "Zimbabwe", "CM": "Cameroon", "CI": "Côte d'Ivoire", "MW": "Malawi", "MU": "Mauritius", "RW": "Rwanda", "BF": "Burkina Faso", "ML": "Mali", "NE": "Niger", "BI": "Burundi",
        "AU": "Australia", "NZ": "New Zealand", "FJ": "Fiji", "PG": "Papua New Guinea"
    };

    // Event listeners
    $('#refreshBtn').on('click', loadLastTest);
    $('#testBtn').on('click', startProxyTest);
    $('#hideUnavailable').on('change', renderTable);
    $('#countrySelect').on('change', renderTable);
    $('#settingsBtn').on('click', updateSettings);
    $('#themeToggle').on('click', toggleTheme);
    $('.sort').on('click', handleSort);
    $('#addCountriesBtn').on('click', addSelectedCountries);
    $('#selectedCountries').on('click', '.remove-country', removeCountry);
    $('#maxProxies').on('change', renderTable);
    $('input[type="checkbox"]').on('change', renderTable);
    $("#multiCountryGroups").on('change', updateMultiCountrySelector);
    $(window).on('beforeunload', closeEventSource);
    
    // Initialize
    updateCountryGroups();
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

    function startProxyTest() {
        clearTable();
        disableButton($('#testBtn'), 'Testing...');

        const data = {
            countries: selectedCountries,
            connectionTypes: getSelectedConnectionTypes(),
            maxProxies: parseInt($('#maxProxies').val()) || 50
        };

        $.ajax({
            url: `${API_URL}/test`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        })
        .done(handleTestStart)
        .fail(handleError)
        .always(() => enableButton($('#testBtn'), 'Make Test'));
    }

    function handleTestResults(data) {
        proxyList = data;
        updateCountrySelector();
        updateMultiCountrySelector();
        renderTable();
    }

    function handleTestStart(data) {
        if (data.ok) {
            console.log(data.ok);
            proxyList = [];
            closeEventSource();
            eventSource = new EventSource(`${API_URL}/proxies`);
            eventSource.onmessage = handleProxyUpdate;
            eventSource.onerror = handleEventSourceError;
        }
    }

    function handleProxyUpdate(event) {
        const proxy = JSON.parse(event.data);
        proxyList.push(proxy);
        renderTable();
    }

    function handleEventSourceError(error) {
        console.error('EventSource failed:', error);
        closeEventSource();
        loadLastTest();
    }

    function closeEventSource() {
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }
    }

    function updateSettings() {
        console.log('Settings update requested');
    }

    function toggleTheme(e) {
        e.preventDefault();
        $('body').toggleClass('dark-mode');
    }

    function handleSort() {
        const field = $(this).data('sort');
        const direction = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
        currentSort = { field, direction };
        sortTable(field, direction);
        updateSortIcon($(this), direction);
    }

    function addSelectedCountries() {
        const newCountries = $('#multiCountrySelect').val();
        selectedCountries = [...new Set([...selectedCountries, ...newCountries])];
        updateSelectedCountriesDisplay();
        renderTable();
    }

    function removeCountry(e) {
        e.preventDefault();
        const countryToRemove = $(this).data('country');
        selectedCountries = selectedCountries.filter(c => c !== countryToRemove);
        updateSelectedCountriesDisplay();
        renderTable();
    }

    function updateCountryGroups() {
        const $countryGroups = $('#multiCountryGroups');
        $countryGroups.empty();
        $.each(countryRegion, (region, countries) => {
            $countryGroups.append($('<option>', { value: region, text: region }));
        });
    }

    function updateMultiCountrySelector() {
        const $multiCountrySelect = $('#multiCountrySelect');
        $multiCountrySelect.empty();
        const selectedRegion = $("#multiCountryGroups").val();
        $.each(countryRegion[selectedRegion], (index, country) => {
            $multiCountrySelect.append($('<option>', { value: country, text: countryNames[country] }));
        });
    }

    function updateCountrySelector() {
        const $countrySelect = $('#countrySelect');
        const countryCounts = {};

        proxyList.forEach(proxy => {
            countryCounts[proxy.country] = (countryCounts[proxy.country] || 0) + 1;
        });

        $countrySelect.empty().append($('<option>', { value: "", text: "All Countries" }));

        $.each(countryCounts, (country, count) => {
            $countrySelect.append($('<option>', {
                value: country,
                text: `${countryNames[country] || country} (${count})`
            }));
        });
    }

    function updateSelectedCountriesDisplay() {
        const $selectedCountriesDiv = $('#selectedCountries');
        $selectedCountriesDiv.empty();

        selectedCountries.forEach(country => {
            $selectedCountriesDiv.append(`
                <span class="badge bg-secondary">
                    ${countryNames[country]}
                    <a href="#" class="remove-country" data-country="${country}">&times;</a>
                </span>
            `);
        });
    }

    function renderTable() {
        const $proxyTableBody = $('#proxyTableBody');
        $proxyTableBody.empty();
        let visibleCount = 0;
        const hideUnavailable = $('#hideUnavailable').is(':checked');
        const maxProxies = parseInt($('#maxProxies').val()) || Infinity;
        const selectedTypes = getSelectedConnectionTypes();

        proxyList.forEach(proxy => {
            if (shouldRenderProxy(proxy, hideUnavailable, selectedTypes) && visibleCount < maxProxies) {
                appendProxy(proxy);
                visibleCount++;
            }
        });

        updateProxyCount(visibleCount);
    }

    function shouldRenderProxy(proxy, hideUnavailable, selectedTypes) {
        return (!hideUnavailable || parseFloat(proxy.speed) > 0) &&
               (selectedCountries.length === 0 || selectedCountries.includes(proxy.country)) &&
               (selectedTypes.length === 0 || selectedTypes.includes(proxy.type.toLowerCase()));
    }

    function appendProxy(proxy) {
        $('#proxyTableBody').append(`
            <tr class="${parseFloat(proxy.speed) > 0 ? 'available' : 'not-available'}">
                <td class="text-center">${proxy.address}</td>
                <td class="text-center">${countryNames[proxy.country] || proxy.country}</td>
                <td class="text-center">${proxy.type}</td>
                <td class="text-center">${proxy.speed} MB/s</td>
            </tr>
        `);
    }

    function updateProxyCount(count) {
        $('#proxyCount').text(`Showing ${count} of ${proxyList.length} proxies`);
    }

    function sortTable(field, direction) {
        proxyList.sort((a, b) => {
            let keyA = a[field];
            let keyB = b[field];

            if (field === 'speed') {
                keyA = parseFloat(keyA);
                keyB = parseFloat(keyB);
            }

            if (keyA < keyB) return direction === 'asc' ? -1 : 1;
            if (keyA > keyB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        renderTable();
    }

    function updateSortIcon($element, direction) {
        $element.find('i')
            .toggleClass('fa-sort-asc', direction === 'asc')
            .toggleClass('fa-sort-desc', direction === 'desc');
    }

    function getSelectedConnectionTypes() {
        return $('input[type="checkbox"]:checked').map(function() {
            return this.value;
        }).get();
    }

    function clearTable() {
        $('#proxyTableBody').empty();
    }

    function disableButton($button, text) {
        $button.prop('disabled', true).html(`<i class="fa fa-spinner fa-spin"></i> ${text}`);
    }

    function enableButton($button, text) {
        $button.prop('disabled', false).html(`<i class="fa fa-refresh"></i> ${text}`);
    }

    function handleError(error) {
        console.error('Error:', error);
        closeEventSource();
    }
});