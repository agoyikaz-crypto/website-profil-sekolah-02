/**
 * Admin Dashboard API Service
 * Handles all communication with Google Apps Script backend
 * Supports both GET (data retrieval) and POST (data submission) operations
 */

class AdminAPIService {
  constructor() {
    this.baseEndpoint = "https://script.google.com/macros/s/AKfycbw18EI-H034EnBoQD2swZZK1b5oJ2GAfRJuM43kKqwG_Cv9mmoogW9ftRqF4BNqZ2EjIw/exec";
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Generic request handler for both GET and POST
   */
  async request(params = {}, method = 'GET') {
    const cacheKey = this.generateCacheKey(params, method);
    
    console.log(`🔄 API Request: ${method} to ${this.baseEndpoint}`);
    console.log(`📤 Parameters:`, params);
    
    // DISABLE ALL CACHING TEMPORARILY to force fresh data
    // Check cache for GET requests - DISABLED
    // if (method === 'GET') {
    //   const cached = this.getFromCache(cacheKey);
    //   if (cached) {
    //     console.log('✅ Using cached data');
    //     return cached;
    //   }
    // }

    try {
      let url = this.baseEndpoint;
      let requestOptions = {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        muteHttpExceptions: true
      };

      if (method === 'GET') {
        // Add parameters as query string with cache busting
        const timestamp = Date.now();
        const allParams = { ...params, t: timestamp };
        const queryString = new URLSearchParams(allParams).toString();
        url += '?' + queryString;
        console.log(`🌐 GET URL: ${url}`);
      } else {
        // Send parameters in body for POST
        requestOptions.body = new URLSearchParams(params);
        console.log(`📤 POST Body:`, requestOptions.body);
      }

      console.log(`🚀 Making request...`);

      const response = await fetch(url, requestOptions);
      const responseText = await response.text();
      
      console.log('📥 Raw API Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed JSON Response:', data);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (data.status === 'error') {
        console.error('❌ Server returned error:', data.message);
        throw new Error(data.message || 'Server returned an error');
      }

      console.log('🎉 Request successful!');

      // DISABLE CACHING TEMPORARILY
      // Cache successful GET responses
      // if (method === 'GET') {
      //   this.setCache(cacheKey, data);
      //   console.log('💾 Data cached for 5 minutes');
      // }

      return data;

    } catch (error) {
      console.error('💥 API Request failed:', error);
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Fetch PPDB data with optional filtering and pagination
   */
  async getPPDBData(options = {}) {
    const params = {
      formType: 'ppdb',
      ...options
    };

    return this.request(params, 'GET');
  }

  /**
   * Fetch payment data with optional filtering and pagination
   */
  async getPaymentData(options = {}) {
    const params = {
      formType: 'pembayaran',
      ...options
    };

    return this.request(params, 'GET');
  }

  /**
   * Submit PPDB data (maintains existing POST functionality)
   */
  async submitPPDBData(formData) {
    const params = {
      formType: 'ppdb',
      ...formData
    };

    return this.request(params, 'POST');
  }

  /**
   * Submit payment data (maintains existing POST functionality)
   */
  async submitPaymentData(formData) {
    const params = {
      formType: 'pembayaran',
      ...formData
    };

    return this.request(params, 'POST');
  }

  /**
   * Create new PPDB student (POST with action=create)
   */
  async postPPDBData(formData) {
    const params = {
      formType: 'ppdb',
      action: 'create',
      ...formData
    };

    return this.request(params, 'POST');
  }

  /**
   * Get student by ID (GET with action=get)
   */
  async getStudentById(id) {
    const params = {
      formType: 'ppdb',
      action: 'get',
      id: id
    };

    return this.request(params, 'GET');
  }

  /**
   * Update student data (GET with action=update)
   */
  async updateStudent(id, data) {
    const params = {
      formType: 'ppdb',
      action: 'update',
      id: id,
      ...data
    };

    return this.request(params, 'GET');
  }

  /**
   * Delete student (GET with action=delete)
   */
  async deleteStudent(id) {
    const params = {
      formType: 'ppdb',
      action: 'delete',
      id: id
    };

    return this.request(params, 'GET');
  }

  /**
   * Update student status (GET with action=updateStatus)
   */
  async updateStudentStatus(id, status) {
    const params = {
      formType: 'ppdb',
      action: 'updateStatus',
      id: id,
      status: status
    };

    return this.request(params, 'GET');
  }

  /**
   * Cache management
   */
  generateCacheKey(params, method) {
    return `${method}:${JSON.stringify(params)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Utility methods for common operations
   */
  async getPPDBStats() {
    try {
      const allData = await this.getPPDBData({ limit: 1000 });
      const data = allData.data || [];

      return {
        total: data.length,
        pending: data.filter(row => String(row.Status || '').toLowerCase() === 'pending').length,
        approved: data.filter(row => String(row.Status || '').toLowerCase() === 'approved').length,
        rejected: data.filter(row => String(row.Status || '').toLowerCase() === 'rejected').length,
        latestRegistration: data.length > 0 ? data[0]['Waktu pendaftaran'] || '' : ''
      };
    } catch (error) {
      console.error('Failed to get PPDB stats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        latestRegistration: ''
      };
    }
  }

  async getPaymentStats() {
    try {
      const allData = await this.getPaymentData({ limit: 1000 });
      const data = allData.data || [];

      return {
        total: data.length,
        totalAmount: data.reduce((sum, row) => {
          const amount = parseFloat(row.Nominal) || 0;
          return sum + amount;
        }, 0),
        ppdbPayments: data.filter(row => String(row['Jenis Pembayaran'] || '').toLowerCase() === 'ppdb').length,
        otherPayments: data.filter(row => String(row['Jenis Pembayaran'] || '').toLowerCase() !== 'ppdb').length
      };
    } catch (error) {
      console.error('Failed to get payment stats:', error);
      return {
        total: 0,
        totalAmount: 0,
        ppdbPayments: 0,
        otherPayments: 0
      };
    }
  }
}

// Create global instance
window.adminAPI = new AdminAPIService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminAPIService;
}
