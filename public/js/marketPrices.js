document.addEventListener('DOMContentLoaded', function () {
  const display = document.getElementById('display_mandi');
  const lastUpdated = document.getElementById('lastUpdated');
  const btnSortPrice = document.getElementById('btn_sort_price');
  const btnSortDistrict = document.getElementById('btn_sort_district');
  const btnSortState = document.getElementById('btn_sort_state');
  const btnSearch = document.getElementById('btn_search');
  const btnReset = document.getElementById('btn_reset');
  const searchInput = document.getElementById('search_input');
  const paginationContainer = document.getElementById('pagination');
  const priceChartCanvas = document.getElementById('priceChart');

  let mandiData = [];
  let currentPage = 1;
  const pageSize = 10;
  let currentChart = null;

  async function fetchStateData(stateName) {
  showLoading();
  try {
    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001ec60ade614eb4a4778b0dbf28ecc281f&format=json&limit=1000&filters[state]=${encodeURIComponent(stateName)}`;

    const response = await fetch(url);
    const data = await response.json();

    const allData = processData(data.records);

    mandiData = allData; // No need to filter here, already state-specific

    if (mandiData.length === 0) {
      display.innerHTML = `<p class="no-data">❌ No data found for "${stateName}".</p>`;
      paginationContainer.innerHTML = '';
      priceChartCanvas.style.display = 'none';
      lastUpdated.textContent = '';
      return;
    }

    currentPage = 1;
    updateDisplay(mandiData);
    updateChart(mandiData);
    lastUpdated.textContent = `Showing results for "${stateName}" | ${new Date().toLocaleString()}`;
  } catch (err) {
    display.innerHTML = `<p class="error">❌ Failed to load data: ${err.message}</p>`;
    paginationContainer.innerHTML = '';
    priceChartCanvas.style.display = 'none';
    lastUpdated.textContent = '';
  }
}

  function updateDisplay(data) {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginated = data.slice(start, end);

    display.innerHTML = paginated.map(item => `
      <div class="mandi-card">
        <h3>${item.market} - ${item.commodity}</h3>
        <p><strong>State:</strong> ${item.state}</p>
        <p><strong>District:</strong> ${item.district}</p>
        <p><strong>Arrival Date:</strong> ${item.arrival_date}</p>
        <p><strong>Min Price:</strong> ₹${item.min_price}</p>
        <p><strong>Max Price:</strong> ₹${item.max_price}</p>
        <p><strong>Modal Price:</strong> ₹${item.modal_price}</p>
        <p><strong>Arrival Quantity:</strong> ${item.arrival_quantity}</p>
      </div>
    `).join('');

    renderPagination(data.length);
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = '';
    if (currentPage > 1) {
      html += `<button class="page-btn" data-page="${currentPage - 1}">Prev</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    if (currentPage < totalPages) {
      html += `<button class="page-btn" data-page="${currentPage + 1}">Next</button>`;
    }

    paginationContainer.innerHTML = html;
    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page);
        updateDisplay(mandiData);
      });
    });
  }

  function updateChart(data) {
    const priceData = {};

    data.forEach(item => {
      const name = item.commodity;
      if (!priceData[name]) {
        priceData[name] = { total: 0, count: 0 };
      }
      priceData[name].total += item.modal_price;
      priceData[name].count += 1;
    });

    const labels = Object.keys(priceData);
    const values = labels.map(label => Math.round(priceData[label].total / priceData[label].count));

    // Clear previous chart
    if (currentChart) {
      currentChart.destroy();
    }

    currentChart = new Chart(priceChartCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Average Modal Price (₹)',
          data: values,
          backgroundColor: '#073900'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Price (₹)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Commodity'
            }
          }
        }
      }
    });
  }

  function processData(records) {
    const seen = new Set();
    return records
      .filter(record => {
        const key = `${record.state}-${record.district}-${record.market}-${record.commodity}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(record => ({
        state: record.state || 'Unknown',
        district: record.district || 'Unknown',
        market: record.market || 'Unknown',
        commodity: record.commodity || 'Unknown',
        variety: record.variety || 'N/A',
        arrival_date: record.arrival_date || 'N/A',
        min_price: parseInt(record.min_price) || 0,
        max_price: parseInt(record.max_price) || 0,
        modal_price: parseInt(record.modal_price) || 0,
        arrival_quantity: record.arrival_quantity || 'N/A'
      }));
  }

  function sortData(type) {
    if (!mandiData.length) return;
    let sorted = [...mandiData];
    if (type === 'price') sorted.sort((a, b) => a.modal_price - b.modal_price);
    if (type === 'district') sorted.sort((a, b) => a.district.localeCompare(b.district));
    if (type === 'state') sorted.sort((a, b) => a.state.localeCompare(b.state));
    currentPage = 1;
    updateDisplay(sorted);
    updateChart(sorted);
  }

  function showLoading() {
    display.innerHTML = '<p class="loading">⏳ Loading data...</p>';
    paginationContainer.innerHTML = '';
    lastUpdated.textContent = '';
    priceChartCanvas.style.display = 'none';
  }

  // Events
  btnSearch.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (!query) return;
    fetchStateData(query);
    priceChartCanvas.style.display = 'block';
  });

  btnReset.addEventListener('click', () => {
    searchInput.value = '';
    display.innerHTML = '';
    paginationContainer.innerHTML = '';
    lastUpdated.textContent = '';
    if (currentChart) currentChart.destroy();
    priceChartCanvas.style.display = 'none';
    mandiData = [];
    currentPage = 1;
  });

  btnSortPrice.addEventListener('click', () => sortData('price'));
  btnSortDistrict.addEventListener('click', () => sortData('district'));
  btnSortState.addEventListener('click', () => sortData('state'));
});