/**
 * Dashboard Statistics Manager
 * Handles real-time statistics for admin dashboard
 */

class DashboardStats {
  constructor() {
    this.refreshInterval = 30000; // 30 seconds
    this.intervalId = null;
    this.init();
  }

  init() {
    this.loadStats();
    this.startAutoRefresh();
    this.bindEvents();
  }

  /**
   * Load dashboard statistics
   */
  async loadStats() {
    try {
      const [ppdbStats, paymentStats] = await Promise.all([
        window.adminAPI.getPPDBStats(),
        window.adminAPI.getPaymentStats()
      ]);

      this.updatePPDBStats(ppdbStats);
      this.updatePaymentStats(paymentStats);
      this.updateLastRefresh();

    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      this.showError('Failed to load statistics');
    }
  }

  /**
   * Update PPDB statistics in dashboard
   */
  updatePPDBStats(stats) {
    // Update PPDB stat cards
    this.updateElement('ppdb-total', stats.total);
    this.updateElement('ppdb-pending', stats.pending);
    this.updateElement('ppdb-approved', stats.approved);
    this.updateElement('ppdb-rejected', stats.rejected);
    this.updateElement('ppdb-latest', stats.latestRegistration);

    // Update PPDB mini chart if exists
    this.updateMiniChart('ppdb-chart', [
      { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
      { label: 'Approved', value: stats.approved, color: 'bg-green-500' },
      { label: 'Rejected', value: stats.rejected, color: 'bg-red-500' }
    ]);
  }

  /**
   * Update Payment statistics in dashboard
   */
  updatePaymentStats(stats) {
    // Update payment stat cards
    this.updateElement('payment-total', stats.total);
    this.updateElement('payment-amount', this.formatCurrency(stats.totalAmount));
    this.updateElement('payment-ppdb', stats.ppdbPayments);
    this.updateElement('payment-other', stats.otherPayments);

    // Update payment mini chart if exists
    this.updateMiniChart('payment-chart', [
      { label: 'PPDB', value: stats.ppdbPayments, color: 'bg-blue-500' },
      { label: 'Other', value: stats.otherPayments, color: 'bg-purple-500' }
    ]);
  }

  /**
   * Update individual element with animation
   */
  updateElement(id, value) {
    const element = document.getElementById(id);
    if (!element) return;

    const currentValue = element.textContent;
    element.textContent = value;

    // Add animation class
    element.classList.add('stat-updated');
    setTimeout(() => {
      element.classList.remove('stat-updated');
    }, 300);
  }

  /**
   * Update mini chart
   */
  updateMiniChart(chartId, data) {
    const chartContainer = document.getElementById(chartId);
    if (!chartContainer) return;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return;

    let chartHTML = '<div class="flex items-center gap-1 h-2">';
    
    data.forEach(item => {
      const percentage = (item.value / total) * 100;
      if (percentage > 0) {
        chartHTML += `<div class="${item.color} rounded-full" style="width: ${percentage}%"></div>`;
      }
    });
    
    chartHTML += '</div>';
    
    // Update chart container
    const existingChart = chartContainer.querySelector('.mini-chart');
    if (existingChart) {
      existingChart.innerHTML = chartHTML;
    } else {
      chartContainer.innerHTML = `<div class="mini-chart">${chartHTML}</div>`;
    }
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    this.stopAutoRefresh();
    this.intervalId = setInterval(() => {
      this.loadStats();
    }, this.refreshInterval);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Bind events
   */
  bindEvents() {
    // Manual refresh button
    const refreshButton = document.getElementById('refresh-dashboard');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.loadStats();
      });
    }

    // Pause auto-refresh on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoRefresh();
      } else {
        this.startAutoRefresh();
      }
    });
  }

  /**
   * Update last refresh time
   */
  updateLastRefresh() {
    const refreshElement = document.getElementById('last-refresh');
    if (refreshElement) {
      const now = new Date();
      refreshElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorElement = document.getElementById('dashboard-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Destroy
   */
  destroy() {
    this.stopAutoRefresh();
  }
}

// Initialize dashboard stats when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboard-stats')) {
    window.dashboardStats = new DashboardStats();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardStats;
}
