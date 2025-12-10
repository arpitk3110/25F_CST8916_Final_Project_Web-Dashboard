/**
 * Rideau Canal Dashboard - Frontend Application
 * Handles data fetching, UI updates, and chart rendering
 */

// Configuration
const API_BASE_URL = window.location.origin;
const REFRESH_INTERVAL = 30000; // 30 seconds

// Global state
let iceChart = null;
let tempChart = null;

/**
 * Initialize the dashboard
 */
async function initDashboard() {
    console.log('🚀 Initializing Rideau Canal Dashboard...');

    // Initial data fetch
    await updateDashboard();

    // Set up auto-refresh
    setInterval(updateDashboard, REFRESH_INTERVAL);

    console.log('✅ Dashboard initialized successfully');
}

/**
 * Update all dashboard data
 */
async function updateDashboard() {
    try {
        // Fetch latest data for all locations
        const latestResponse = await fetch(`${API_BASE_URL}/api/latest`);
        const latestData = await latestResponse.json();

        if (latestData.success) {
            updateLocationCards(latestData.data);
            updateLastUpdateTime();
        }

        // Fetch status
        const statusResponse = await fetch(`${API_BASE_URL}/api/status`);
        const statusData = await statusResponse.json();

        if (statusData.success) {
            updateOverallStatus(statusData.overallStatus);
        }

        // Update charts with historical data
        await updateCharts();

    } catch (error) {
        console.error('Error updating dashboard:', error);
        showError('Failed to fetch latest data. Retrying...');
    }
}

/**
 * Safely format a metric value (handles null/undefined)
 */
function formatMetric(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '--';
    }
    return Number(value).toFixed(1);
}

/**
 * Update location cards with latest data
 */
function updateLocationCards(locations) {
    locations.forEach(location => {
        const locationKey = getLocationKey(location.location);

        // Update metrics
        document.getElementById(`ice-${locationKey}`).textContent =
            formatMetric(location.avgIceThickness);
        document.getElementById(`temp-${locationKey}`).textContent =
            formatMetric(location.avgSurfaceTemperature);
        document.getElementById(`snow-${locationKey}`).textContent =
            formatMetric(location.avgSnowAccumulation);

        // Update safety status badge (remove UNKNOWN fallback)
        const statusBadge = document.getElementById(`status-${locationKey}`);
        const status = location.safetyStatus;

        if (!status) {
            // No status available -> keep neutral/empty badge
            statusBadge.textContent = '';
            statusBadge.className = 'safety-badge';
        } else {
            statusBadge.textContent = status;
            const statusClass = status.toLowerCase().replace(/[^a-z]/g, '');
            statusBadge.className = `safety-badge ${statusClass}`;
        }
    });
}

/**
 * Update overall status badge
 */
function updateOverallStatus(status) {
    const statusBadge = document.getElementById('overallStatus');
    statusBadge.className = `status-badge ${status.toLowerCase()}`;
    statusBadge.innerHTML = `<span class="status-text">Canal Status: ${status}</span>`;
}

/**
 * Update last update timestamp
 */
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-CA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = timeString;
}

/**
 * Update charts with historical data
 */
async function updateCharts() {
    try {
        const locations = ["Dow's Lake", "Fifth Avenue", "NAC"];
        const colors = {
            "Dow's Lake": 'rgb(75, 192, 192)',
            "Fifth Avenue": 'rgb(255, 99, 132)',
            "NAC": 'rgb(54, 162, 235)'
        };

        // Fetch historical data for all locations
        const historicalData = await Promise.all(
            locations.map(async (location) => {
                const response = await fetch(
                    `${API_BASE_URL}/api/history/${encodeURIComponent(location)}?limit=12`
                );
                const data = await response.json();
                return { location, data: data.data || [] };
            })
        );

        // Prepare chart data
        const iceDatasets = historicalData.map(({ location, data }) => ({
            label: location,
            data: data.map(d => d.avgIceThickness),
            borderColor: colors[location],
            backgroundColor: colors[location] + '33',
            tension: 0.4,
            fill: false
        }));

        const tempDatasets = historicalData.map(({ location, data }) => ({
            label: location,
            data: data.map(d => d.avgSurfaceTemperature),
            borderColor: colors[location],
            backgroundColor: colors[location] + '33',
            tension: 0.4,
            fill: false
        }));

        // Get time labels from first location's data
        const firstLocationData = historicalData[0].data || [];
        const labels = firstLocationData.map(d =>
            new Date(d.windowEndTime).toLocaleTimeString('en-CA', {
                hour: '2-digit',
                minute: '2-digit'
            })
        );

        // Update or create ice thickness chart
        if (iceChart) {
            iceChart.data.labels = labels;
            iceChart.data.datasets = iceDatasets;
            iceChart.update();
        } else {
            const ctx = document.getElementById('iceThicknessChart').getContext('2d');
            iceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: iceDatasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Ice Thickness (cm)'
                            }
                        }
                    }
                }
            });
        }

        // Update or create temperature chart
        if (tempChart) {
            tempChart.data.labels = labels;
            tempChart.data.datasets = tempDatasets;
            tempChart.update();
        } else {
            const ctx = document.getElementById('temperatureChart').getContext('2d');
            tempChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: tempDatasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Surface Temperature (°C)'
                            }
                        }
                    }
                }
            });
        }

    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

/**
 * Convert location name to key for DOM IDs
 */
function getLocationKey(location) {
    const keyMap = {
        "Dow's Lake": "dows",
        "Fifth Avenue": "fifth",
        "NAC": "nac"
    };
    return keyMap[location] || location.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Show error message (you can enhance this with a toast notification)
 */
function showError(message) {
    console.error(message);
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initDashboard);
