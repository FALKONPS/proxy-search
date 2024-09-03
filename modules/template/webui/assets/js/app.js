$(document).ready(function () {
  // Global variables
  let proxies = [];
  let selectedCountries = [];
  let currentSort = { field: 'speed', direction: 'desc' };
  let isPolling = false;
  let pollInterval;
  var visibleCount = 0;
  // Constants
  const API_URL = ''; // remove CORS

  const countryRegion = {
    'Middle East': [
      'PS', // We often forget what we love :')
      'SA',
      'IR',
      'AE',
      'QA',
      'EG',
      'IL',
      'IQ',
      'JO',
      'KW',
      'LB',
      'OM',
      'SY',
      'YE',
    ],
    Asia: [
      'IN',
      'CN',
      'SG',
      'JP',
      'VN',
      'KR',
      'BD',
      'HK',
      'MY',
      'TH',
      'PH',
      'TW',
      'KH',
      'ID',
      'PK',
      'NP',
      'LK',
      'MM',
    ],
    Europe: [
      'RU',
      'DE',
      'GB',
      'FR',
      'IT',
      'ES',
      'NL',
      'UA',
      'PL',
      'SE',
      'NO',
      'FI',
      'DK',
      'RO',
      'CZ',
      'BE',
      'AT',
      'HU',
      'BG',
      'GR',
      'PT',
      'CH',
      'SK',
      'LV',
      'LT',
      'EE',
      'IE',
      'IS',
    ],
    Americas: [
      'US',
      'CA',
      'BR',
      'MX',
      'AR',
      'CL',
      'CO',
      'PE',
      'VE',
      'EC',
      'UY',
      'BO',
      'PY',
      'GY',
    ],
    Africa: [
      'ZA',
      'EG',
      'NG',
      'DZ',
      'MA',
      'KE',
      'GH',
      'UG',
      'TZ',
      'SN',
      'ET',
      'ZM',
      'ZW',
      'CM',
      'CI',
      'MW',
      'MU',
      'RW',
      'BF',
      'ML',
      'NE',
      'BI',
    ],
    Oceania: ['AU', 'NZ', 'FJ', 'PG'],
  };

  const countryNames = {
    PS: 'Palestine',
    SA: 'Saudi Arabia',
    IR: 'Iran',
    AE: 'United Arab Emirates',
    QA: 'Qatar',
    EG: 'Egypt',
    IL: 'Israel',
    IQ: 'Iraq',
    JO: 'Jordan',
    KW: 'Kuwait',
    LB: 'Lebanon',
    OM: 'Oman',
    SY: 'Syria',
    YE: 'Yemen',
    IN: 'India',
    CN: 'China',
    SG: 'Singapore',
    JP: 'Japan',
    VN: 'Viet Nam',
    KR: 'Korea',
    BD: 'Bangladesh',
    HK: 'Hong Kong',
    MY: 'Malaysia',
    TH: 'Thailand',
    PH: 'Philippines',
    TW: 'Taiwan',
    KH: 'Cambodia',
    ID: 'Indonesia',
    PK: 'Pakistan',
    NP: 'Nepal',
    LK: 'Sri Lanka',
    MM: 'Myanmar',
    RU: 'Russian Federation',
    DE: 'Germany',
    GB: 'United Kingdom',
    FR: 'France',
    IT: 'Italy',
    ES: 'Spain',
    NL: 'Netherlands',
    UA: 'Ukraine',
    PL: 'Poland',
    SE: 'Sweden',
    NO: 'Norway',
    FI: 'Finland',
    DK: 'Denmark',
    RO: 'Romania',
    CZ: 'Czechia',
    BE: 'Belgium',
    AT: 'Austria',
    HU: 'Hungary',
    BG: 'Bulgaria',
    GR: 'Greece',
    PT: 'Portugal',
    CH: 'Switzerland',
    SK: 'Slovakia',
    LV: 'Latvia',
    LT: 'Lithuania',
    EE: 'Estonia',
    IE: 'Ireland',
    IS: 'Iceland',
    US: 'United States of America',
    CA: 'Canada',
    BR: 'Brazil',
    MX: 'Mexico',
    AR: 'Argentina',
    CL: 'Chile',
    CO: 'Colombia',
    PE: 'Peru',
    VE: 'Venezuela',
    EC: 'Ecuador',
    UY: 'Uruguay',
    BO: 'Bolivia',
    PY: 'Paraguay',
    GY: 'Guyana',
    ZA: 'South Africa',
    NG: 'Nigeria',
    DZ: 'Algeria',
    MA: 'Morocco',
    KE: 'Kenya',
    GH: 'Ghana',
    UG: 'Uganda',
    TZ: 'Tanzania',
    SN: 'Senegal',
    ET: 'Ethiopia',
    ZM: 'Zambia',
    ZW: 'Zimbabwe',
    CM: 'Cameroon',
    CI: "Côte d'Ivoire",
    MW: 'Malawi',
    MU: 'Mauritius',
    RW: 'Rwanda',
    BF: 'Burkina Faso',
    ML: 'Mali',
    NE: 'Niger',
    BI: 'Burundi',
    AU: 'Australia',
    NZ: 'New Zealand',
    FJ: 'Fiji',
    PG: 'Papua New Guinea',
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
  $('#multiCountryGroups').on('change', updateMultiCountrySelector);
  $('#stopBtn').click(force_stop);

  function force_stop() {
    fetch(`${API_URL}/force_stop`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'stop' }),
    });
  }
  function checkServerStatus() {
    // Note: Possible conflict when a timeout is not set; the page will reload after the request
    // This is solved by setting an AbortController
    // This method is still in the testing stage
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000); // 15 SEC
    fetch(`${API_URL}/status`)
      .then((response) => {
        clearTimeout(timeoutId);
        return response.json();
      })
      .then((data) => {
        test_duration = data.test_duration;
        matched_proxy = data.matched_proxy;
        if (data.is_testing) {
          disableButton($('#testBtn'), 'Testing...', 'fa-spinner fa-spin');
          enableButton(
            $('#stopBtn'),
            'Force Stop Signal',
            'fa-circle-exclamation'
          );
          loadLastTest();
          startPolling();
        } else {
          test_duration = 0;
          loadLastTest();
        }
      })
      .catch((error) => {
        console.error('Error checking server status:', error);
        loadLastTest();
      });
  }

  function loadLastTest() {
    clearTable();
    disableButton($('#refreshBtn'), 'Refreshing...', 'fa-spinner');
    $.getJSON(`${API_URL}/last_test`)
      .done(handleTestResults)
      .fail(handleError)
      .always(() => {
        enableButton($('#refreshBtn'), 'Refresh', 'fa-refresh');
      });
  }

  function startProxyTest() {
    clearTable();
    disableButton($('#testBtn'), 'Testing...', 'fa-spinner fa-spin');
    enableButton($('#stopBtn'), 'Force Stop Signal', 'fa-circle-exclamation');
    fetch(`${API_URL}/status`)
      .then((response) => response.json())
      .then((data) => {
        if (data.is_testing) {
          console.log('Test already in progress. Starting polling.');
          startPolling();
        } else {
          // const countryList = selectedCountries.map(
          //   (value) => countryNames[value]
          // );
          const testData = {
            countries: selectedCountries,
            connectionTypes: getSelectedConnectionTypes(),
            maxProxies: parseInt($('#maxProxies').val()),
            searchEngine: $('#searchEngine').val(),
          };

          return fetch(`${API_URL}/test`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
          });
        }
      })
      .then((response) => {
        if (response) return response.json();
      })
      .then((data) => {
        if (data && data.success) {
          console.log(data.message);
          proxies = [];
          startPolling();
        }
      })
      .catch((error) => {
        console.error('Error starting proxy test:', error);
        enableButton($('#testBtn'), 'Make Test', 'fa-check');
        disableButton($('#stopBtn'), 'Not Running', 'fa-triangle-exclamation');
      });
  }

  function startPolling() {
    if (isPolling) return;
    isPolling = true;

    pollInterval = setInterval(() => {
      fetch(`${API_URL}/get_buffer`)
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) {
            handleProxyUpdates(data);
          }
        })
        .catch((error) => {
          console.error('Error polling for updates:', error);
        });

      fetch(`${API_URL}/status`)
        .then((response) => response.json())
        .then((data) => {
          if (!data.is_testing) {
            stopPolling();
            enableButton($('#testBtn'), 'Make Test', 'fa-check');
            disableButton(
              $('#stopBtn'),
              'Not Running',
              'fa-triangle-exclamation'
            );
          } else {
            // Update after each interval call
            updateProxyCount(
              visibleCount,
              data.matched_proxy,
              data.test_duration
            );
          }
        })
        .catch((error) => {
          console.error('Error checking test completion:', error);
        });
    }, 1000);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    isPolling = false;
  }

  function handleTestResults(data) {
    proxies = data;
    renderTable();
  }

  function handleProxyUpdates(updates) {
    updates.forEach((proxy) => {
      proxies.push(proxy);
    });
    updateCountrySelector();
    updateMultiCountrySelector();
    renderTable();
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
    const direction =
      currentSort.field === field && currentSort.direction === 'asc'
        ? 'desc'
        : 'asc';
    currentSort = { field, direction };
    sortTable(field, direction);
    updateSortIcon($(this), direction);
  }

  function sortTable(field, direction) {
    proxies.sort((a, b) => {
      let keyA = a[field];
      let keyB = b[field];

      if (field === 'speed' || field === 'latency') {
        keyA = parseFloat(keyA);
        keyB = parseFloat(keyB);
      } else if (field === 'address') {
        keyA = parseInt(keyA.split(':')[1]);
        keyB = parseInt(keyB.split(':')[1]);
      }

      if (keyA < keyB) return direction === 'asc' ? -1 : 1;
      if (keyA > keyB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    renderTable();
  }

  function addSelectedCountries() {
    const newCountries = $('#multiCountrySelect').val();
    selectedCountries = [...new Set([...selectedCountries, ...newCountries])];
    updateSelectedCountriesDisplay();
    renderTable();
  }

  function removeCountry() {
    const countryToRemove = $(this).data('country');
    selectedCountries = selectedCountries.filter((c) => c !== countryToRemove);
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
    const selectedRegion = $('#multiCountryGroups').val();
    $.each(countryRegion[selectedRegion], (index, country) => {
      $multiCountrySelect.append(
        $('<option>', { value: country, text: countryNames[country] })
      );
    });
  }
  function updateCountrySelector() {
    const countrySelect = $('#countrySelect');
    const countryCounts = {};

    proxies.forEach((proxy) => {
      if (proxy.country in countryCounts) {
        countryCounts[proxy.country]++;
      } else {
        countryCounts[proxy.country] = 1;
      }
    });

    const totalProxies = proxies.length;
    let allCountriesOption = countrySelect.find('option[value=""]');
    if (allCountriesOption.length === 0) {
      countrySelect.prepend(
        `<option value="">All Countries (${totalProxies})</option>`
      );
    } else {
      allCountriesOption.text(`All Countries (${totalProxies})`);
    }

    const sortedCountries = Object.entries(countryCounts).sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1]; // descending
      }
      return (countryNames[a[0]] || a[0]).localeCompare(
        countryNames[b[0]] || b[0]
      );
    });

    sortedCountries.forEach(([country, count]) => {
      const optionText = `${countryNames[country] || country} (${count})`;
      let option = countrySelect.find(`option[value="${country}"]`);

      if (option.length === 0) {
        countrySelect.append(
          `<option value="${country}">${optionText}</option>`
        );
      } else {
        option.text(optionText);
      }
    });

    countrySelect.find('option').each(function () {
      const value = $(this).val();
      if (value !== '' && !(value in countryCounts)) {
        $(this).remove();
      }
    });
  }
  function updateSelectedCountriesDisplay() {
    const $selectedCountriesDiv = $('#selectedCountries');
    $selectedCountriesDiv.empty();

    selectedCountries.forEach((country) => {
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
    const $countrySelect = $('#countrySelect');
    $proxyTableBody.empty();
    visibleCount = 0;
    const country = $countrySelect.val();
    const hideUnavailable = $('#hideUnavailable').is(':checked');
    const maxProxies = parseInt($('#maxProxies').val()) || Infinity;
    const selectedTypes = getSelectedConnectionTypes();
    if (getAutomaticSortValue()) {
      sortTableBySpeedDesc();
    }
    proxies.forEach((proxy) => {
      if (
        shouldRenderProxy(proxy, hideUnavailable, selectedTypes, country) &&
        visibleCount < maxProxies
      ) {
        appendProxy(proxy);
        visibleCount++;
      }
    });
    updateProxyCount(visibleCount, proxies.length, 0);
  }
  function shouldRenderProxy(proxy, hideUnavailable, selectedTypes, country) {
    return (
      (!hideUnavailable || parseFloat(proxy.speed) > 0) && // Show the non-zero speed proxy If there is no selector, show all
      (selectedTypes.length === 0 ||
        selectedTypes.includes(proxy.type.toLowerCase())) && // If the type 'proxy' is in selectedTypes, include only the 'proxy' type. Otherwise, if there is no selector, show all
      (country === '' || proxy.country === country)
    );
  }

  function appendProxy(proxy) {
    $('#proxyTableBody').append(`
      <tr class="${
        parseFloat(proxy.speed) > 0
          ? 'available bg-light-blue'
          : 'not-available'
      }">
        <td class="text-center">${proxy.address}</td>
        <td class="text-center">${
          countryNames[proxy.country] || proxy.country
        }</td>
        <td class="text-center">${proxy.city}</td>
        <td class="text-center">${proxy.type}</td>
        <td class="text-center">${proxy.anonymity}</td>
        <td class="text-center">${proxy.speed} MB/s</td>
        <td class="text-center">${proxy.latency || 'N/N'} ms</td>
      </tr>
    `);
  }

  function updateProxyCount(count, matched_proxy, test_duration) {
    updateCountrySelector();
    total_time = Math.abs(
      test_duration * (matched_proxy - count) - count * test_duration
    );

    const hours = Math.floor(total_time / 3600);
    const minutes = Math.floor((total_time % 3600) / 60);
    const seconds = total_time % 60;

    let formattedTime = '';

    if (hours > 0) {
      formattedTime += `${hours.toString().padStart(2, '0')}:`;
    }
    if (hours > 0 || minutes > 0) {
      formattedTime += `${minutes.toString().padStart(2, '0')}:`;
    }
    formattedTime += `${seconds.toString().padStart(2, '0')}`;
    formattedTime = formattedTime.replace(/:+$/, '');
    $('#proxyCount').html(
      `Showing ${count} of ${matched_proxy} proxies<br>Remaining test time ${formattedTime}`
    );
  }

  function updateSortIcon($element, direction) {
    $element
      .find('i')
      .toggleClass('fa-sort-asc', direction === 'asc')
      .toggleClass('fa-sort-desc', direction === 'desc');
  }

  function getSelectedConnectionTypes() {
    return $('input[type="checkbox"][id$="Check"]:checked')
      .map(function () {
        return this.value;
      })
      .get();
  }
  function getAutomaticSortValue() {
    return (
      $('input[type="checkbox"][id="automaticSort"]:checked').val() == 'on'
    );
  }
  function clearTable() {
    $('#proxyTableBody').empty();
  }

  function disableButton($button, text, fa) {
    $button.prop('disabled', true).html(`<i class="fa ${fa}"></i> ${text}`);
  }

  function enableButton($button, text, fa) {
    $button.prop('disabled', false).html(`<i class="fa ${fa}"></i> ${text}`);
  }

  function handleError(error) {
    console.error('Error:', error);
  }
  function sortTableBySpeedDesc() {
    proxies.sort((a, b) => parseFloat(b.speed) - parseFloat(a.speed));
  }

  function get_search_engine() {
    fetch(`${API_URL}/get_search_engine`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          console.error('Network response was not ok');
          throw new Error('Network response was not ok');
        }
      })
      .then((data) => {
        if (Array.isArray(data.value)) {
          var searchEngine = $('#searchEngine');
          searchEngine.empty();
          data.value.forEach(function (engine) {
            searchEngine.append(
              $('<option>', {
                value: engine,
                text: engine,
              })
            );
          });
        } else {
          console.error('Invalid data format');
        }
      })
      .catch((error) => {
        console.error('Failed to fetch search engines:', error);
      });
  }

  // Initialize
  // load proxies
  checkServerStatus();
  get_search_engine();
  // country-related data
  updateCountryGroups();
  updateMultiCountrySelector();

  // depends on proxies
  renderTable();
});
