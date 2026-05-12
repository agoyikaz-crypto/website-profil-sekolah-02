/**
 * PPDB Data Manager for Admin Dashboard
 * Handles real-time PPDB data fetching, filtering, and rendering
 */

class PPDBManager {
  constructor() {
    this.currentPage = 1;
    this.pageSize = 10;
    this.currentFilter = 'all';
    this.searchTerm = '';
    this.isLoading = false;
    this.data = [];
    this.filteredData = [];

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadInitialData();
  }

  /**
   * Bind UI events
   */
  bindEvents() {
    // Search functionality
    const searchInput = document.getElementById('ppdb-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = String(e.target.value).toLowerCase();
        this.applyFilters();
      });
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('[data-status-filter]');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.setActiveFilter(e.target.dataset.statusFilter);
      });
    });

    // Refresh button
    const refreshButton = document.getElementById('refresh-ppdb');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.refreshData();
      });
    }

    // Pagination
    this.bindPaginationEvents();
  }

  /**
   * Load initial data
   */
  async loadInitialData() {
    console.log('🔄 LOADING INITIAL DATA...');
    
    try {
      this.setLoadingState(true);
      
      // Force cache clear to get fresh data
      window.adminAPI.clearCache();
      
      // Add timestamp to force fresh fetch
      const response = await window.adminAPI.getPPDBData({ t: Date.now() });
      
      console.log('📥 API RESPONSE:', response);
      
      // Add fallback for undefined response.data
      const rows = response.data || [];
      console.log('📊 ROWS WITH FALLBACK:', rows);
      
      if (rows && rows.length > 0) {
        // CRITICAL: Replace data array completely
        this.data = rows;
        console.log('🔄 DATA REPLACEMENT COMPLETE:', {
          oldDataCount: 0,
          newDataCount: this.data.length,
          replacementComplete: this.data.length === (rows?.length || 0)
        });
        
        // Log exact keys from newest row
        if (this.data.length > 0) {
          console.log('🔑 NEWEST ROW KEYS:', Object.keys(this.data[0]));
          console.log('🔑 NEWEST ROW VALUES:', Object.values(this.data[0]));
        }
        
        // Normalize ALL rows immediately after fetch
        this.data = this.data.map(this.normalizeRow.bind(this));
        console.log('🔄 NORMALIZED DATA SAMPLE:', this.data[0]);
        
        // Verify newest row is included
        if (this.data.length > 0) {
          console.log('📊 DATA ORDER ANALYSIS:', {
            totalRows: this.data.length,
            oldestRow: this.data[0], // First row from Google Sheets
            newestRow: this.data[this.data.length - 1], // Last row from Google Sheets
            oldestRegistration: this.data[0]['Waktu pendaftaran'],
            newestRegistration: this.data[this.data.length - 1]['Waktu pendaftaran']
          });
          this.showDebugInfo(`Oldest: ${this.data[0]['Nama Lengkap']} at ${this.data[0]['Waktu pendaftaran']}`);
          this.showDebugInfo(`Newest: ${this.data[this.data.length - 1]['Nama Lengkap']} at ${this.data[this.data.length - 1]['Waktu pendaftaran']}`);
        } else {
          console.log('⚠️ NO DATA IN RESPONSE');
          this.showDebugInfo('No data received from API');
        }
        
        // CRITICAL: Replace filteredData completely with natural Google Sheets order
        this.filteredData = [...this.data];
        console.log('🔄 FILTERED DATA REPLACEMENT:', {
          oldFilteredCount: this.filteredData.length,
          newFilteredCount: this.filteredData.length,
          replacementComplete: true
        });
        
        console.log('✅ FINAL DATA STATE:', {
          totalRecords: this.data.length,
          oldestRecord: this.data[0],
          newestRecord: this.data[this.data.length - 1]
        });
        
        // Force complete table rerender
        console.log('🎨 FORCING COMPLETE TABLE RERENDER');
        this.renderTable();
        this.updateStats();
        
      } else {
        console.log('⚠️ NO RESPONSE DATA OR EMPTY DATA');
        this.data = [];
        this.filteredData = [];
        this.renderTable();
      }
      
    } catch (error) {
      console.error('💥 LOAD ERROR:', error);
      this.showDebugInfo('Error occurred:', error);
      this.showError('Failed to load PPDB data: ' + error.message);
      this.data = [];
      this.filteredData = [];
      this.renderTable();
    } finally {
      // CRITICAL: Always stop loading state
      console.log('🛑 STOPPING LOADING STATE');
      this.setLoadingState(false);
    }
  }

  /**
   * Normalize row object keys to handle any variations
   */
  normalizeRow(row) {
    const normalized = {};
    Object.keys(row).forEach(key => {
      normalized[String(key || '').trim()] = row[key];
    });
    return normalized;
  }

  /**
   * Refresh data from server
   */
  async refreshData() {
    console.log('🔄 MANUAL REFRESH TRIGGERED');
    this.showDebugInfo('Manual refresh - forcing fresh data fetch...');
    
    // Clear all cache and force fresh fetch
    window.adminAPI.clearCache();
    await this.loadInitialData();
  }

  /**
   * Apply filters and search
   */
  applyFilters() {
    this.filteredData = this.data.filter(row => {
      // Status filter
      if (this.currentFilter !== 'all') {
        const rowStatus = String(row.Status || '').toLowerCase();
        if (rowStatus !== this.currentFilter) {
          return false;
        }
      }

      // Search filter
      if (this.searchTerm) {
        const searchableText = [
          String(row['Nama Lengkap'] || '').toLowerCase(),
          String(row['NISN'] || '').toLowerCase(),
          String(row['Email'] || '').toLowerCase(),
          String(row['No HP'] || '').toLowerCase(),
          String(row['Tempat Lahir'] || '').toLowerCase(),
          String(row['Tanggal Lahir'] || '').toLowerCase(),
          String(row['Jenis Kelamin'] || '').toLowerCase(),
          String(row['Alamat'] || '').toLowerCase()
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(this.searchTerm)) {
          return false;
        }
      }

      return true;
    });

    this.currentPage = 1;
    this.renderTable();
  }

  /**
   * Set active filter
   */
  setActiveFilter(filter) {
    this.currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('[data-status-filter]').forEach(button => {
      button.classList.remove('bg-primary', 'text-white');
      button.classList.add('text-on-surface/60', 'hover:bg-white/60');
    });

    const activeButton = document.querySelector(`[data-status-filter="${filter}"]`);
    if (activeButton) {
      activeButton.classList.remove('text-on-surface/60', 'hover:bg-white/60');
      activeButton.classList.add('bg-primary', 'text-white');
    }

    this.applyFilters();
  }

  /**
   * Render data table
   */
  renderTable() {
    const tableBody = document.getElementById('ppdb-table-body');
    if (!tableBody) return;

    // Log real API data being rendered
    console.log('🎯 RENDERING REAL API DATA:', this.filteredData);

    // TEMPORARILY DISABLE PAGINATION - Show ALL data to find 'kambing'
    console.log('🎨 RENDERING ALL DATA (PAGINATION DISABLED):', {
      totalData: this.data.length,
      totalFiltered: this.filteredData.length,
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      firstDataRecord: this.data[0],
      firstFilteredRecord: this.filteredData[0]
    });

    // Search specifically for 'kambing' row
    const kambingRow = this.data.find(row => {
      const name = String(row['Nama Lengkap'] || '').toLowerCase();
      return name.includes('kambing');
    });

    if (kambingRow) {
      console.log('🎯 KAMBING ROW FOUND:', kambingRow);
      console.log('🎯 KAMBING DETAILS:', {
        name: kambingRow['Nama Lengkap'],
        registration: kambingRow['Waktu pendaftaran'],
        status: kambingRow.Status,
        rowIndex: this.data.indexOf(kambingRow)
      });
    } else {
      console.log('⚠️ KAMBING ROW NOT FOUND IN DATA');
    }

    // Render ALL filtered data without pagination limits
    const allPageData = this.filteredData;

    if (allPageData.length === 0) {
      console.log('📭 NO DATA TO RENDER - showing empty state');
      tableBody.innerHTML = this.renderEmptyState();
      return;
    }

    console.log('📊 RENDERING ALL DATA:', {
      totalRows: allPageData.length,
      firstRow: allPageData[0],
      lastRow: allPageData[allPageData.length - 1]
    });

    // Clear tbody completely before injecting dynamic rows
    tableBody.innerHTML = '';

    // Render with fresh data verification
    allPageData.forEach((row, index) => {
      const actualIndex = index + 1;
      console.log(`📝 RENDERING ROW ${actualIndex}:`, {
        name: row['Nama Lengkap'],
        registration: row['Waktu pendaftaran'],
        status: row.Status,
        isKambing: String(row['Nama Lengkap'] || '').toLowerCase().includes('kambing')
      });
      
      const rowElement = document.createElement('tr');
      rowElement.innerHTML = this.renderTableRow(row);
      tableBody.appendChild(rowElement);
    });
    
    // Hide pagination temporarily
    const paginationContainer = document.getElementById('ppdb-pagination');
    if (paginationContainer) {
      paginationContainer.innerHTML = '<div class="text-center text-sm text-gray-500">Pagination temporarily disabled to show all data</div>';
    }
    
    console.log('✅ TABLE RENDERING COMPLETE - All data displayed');
  }

  /**
   * Render single table row
   */
  renderTableRow(row) {
    const id = row.ID || '';
    const namaLengkap = row['Nama Lengkap'] || '';
    const registrationTime = row['Waktu pendaftaran'] || '';
    const status = row.Status || 'pending';
    
    console.log('🎯 RENDERING ROW:', { id, namaLengkap, registrationTime, status });
    
    // Check if this is kambing row
    const isKambing = String(namaLengkap).toLowerCase().includes('kambing');
    if (isKambing) {
      console.log('🎯 KAMBING ROW RENDERED:', { id, namaLengkap, status });
    }
    
    // Generate initials for avatar
    const initials = String(namaLengkap || '').split(' ').map(name => String(name || '').charAt(0)).join('').toUpperCase().substring(0, 2);
    
    // Format registration date
    const registrationDate = this.formatDate(registrationTime);
    const registrationTimeFormatted = registrationTime ? new Date(registrationTime).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '';
    
    // Status badge with click handler
    let statusBadge = '';
    if (status === 'approved') {
      statusBadge = '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100/20 text-green-700 border border-green-200/50 cursor-pointer hover:bg-green-100/30 transition-all" onclick="ppdbManager.showStatusModal(\'' + id + '\', \'' + status + '\')"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Approved</span>';
    } else if (status === 'rejected') {
      statusBadge = '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100/20 text-red-700 border border-red-200/50 cursor-pointer hover:bg-red-100/30 transition-all" onclick="ppdbManager.showStatusModal(\'' + id + '\', \'' + status + '\')"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>Rejected</span>';
    } else {
      statusBadge = '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100/20 text-yellow-700 border border-yellow-200/50 cursor-pointer hover:bg-yellow-100/30 transition-all" onclick="ppdbManager.showStatusModal(\'' + id + '\', \'' + status + '\')"><span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Pending</span>';
    }
    
    // Action buttons with proper handlers
    const actionButtons = '<div class="flex items-center justify-end gap-2"><button class="p-2 text-on-surface/60 hover:text-primary hover:bg-white/60 rounded-lg transition-all" onclick="ppdbManager.viewStudent(\'' + id + '\')" title="View Details"><span class="material-symbols-outlined text-sm">visibility</span></button><button class="p-2 text-on-surface/60 hover:text-primary hover:bg-white/60 rounded-lg transition-all" onclick="ppdbManager.editStudent(\'' + id + '\')" title="Edit Student"><span class="material-symbols-outlined text-sm">edit</span></button><button class="p-2 text-on-surface/60 hover:text-error hover:bg-error/10 rounded-lg transition-all" onclick="ppdbManager.deleteStudent(\'' + id + '\', \'' + this.escapeHtml(namaLengkap) + '\')" title="Delete Student"><span class="material-symbols-outlined text-sm">delete</span></button></div>';
    
    return '<tr class="hover:bg-white/40 transition-all group cursor-pointer"><td class="px-6 sm:px-10 py-5 sm:py-6"><div class="flex items-center gap-3 sm:gap-5"><div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-primary/10 backdrop-blur-md flex items-center justify-center text-primary font-bold text-base sm:text-lg ring-1 ring-primary/20 flex-shrink-0">' + initials + '</div><div class="min-w-0"><p class="font-bold text-on-surface text-sm sm:text-lg truncate">' + this.escapeHtml(namaLengkap) + '</p><p class="text-[10px] sm:text-label-sm font-label-sm text-on-surface/50">ID: ' + this.escapeHtml(id) + '</p></div></div></td><td class="px-4 sm:px-8 py-5 sm:py-6"><p class="font-medium text-on-surface text-xs sm:text-base">' + registrationDate + '</p><p class="text-[10px] sm:text-label-sm font-label-sm text-on-surface/50">' + registrationTimeFormatted + '</p></td><td class="px-4 sm:px-8 py-5 sm:py-6 text-center sm:text-left">' + statusBadge + '</td><td class="px-6 sm:px-10 py-5 sm:py-6 text-right">' + actionButtons + '</td></tr>';
  }

  /**
   * Render pagination
   */
  renderPagination() {
    const paginationContainer = document.getElementById('ppdb-pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let paginationHTML = '<div class="flex items-center justify-center gap-2">';
    
    // Previous button
    paginationHTML += `
      <button 
        onclick="ppdbManager.goToPage(${this.currentPage - 1})" 
        class="p-2 rounded-lg ${this.currentPage === 1 ? 'text-on-surface/20 cursor-not-allowed' : 'text-on-surface/60 hover:text-primary hover:bg-white/60'} transition-all"
        ${this.currentPage === 1 ? 'disabled' : ''}
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        paginationHTML += `
          <button 
            onclick="ppdbManager.goToPage(${i})" 
            class="px-3 py-1 rounded-lg ${i === this.currentPage ? 'bg-primary text-white' : 'text-on-surface/60 hover:text-primary hover:bg-white/60'} transition-all"
          >
            ${i}
          </button>
        `;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        paginationHTML += '<span class="text-on-surface/40">...</span>';
      }
    }

    // Next button
    paginationHTML += `
      <button 
        onclick="ppdbManager.goToPage(${this.currentPage + 1})" 
        class="p-2 rounded-lg ${this.currentPage === totalPages ? 'text-on-surface/20 cursor-not-allowed' : 'text-on-surface/60 hover:text-primary hover:bg-white/60'} transition-all"
        ${this.currentPage === totalPages ? 'disabled' : ''}
      >
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    `;

    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
  }

  /**
   * Pagination navigation
   */
  goToPage(page) {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    this.renderTable();
  }

  /**
   * Update statistics
   */
  async updateStats() {
    try {
      const stats = await window.adminAPI.getPPDBStats();
      
      // Update dashboard stats if elements exist
      const totalElement = document.getElementById('ppdb-total');
      const pendingElement = document.getElementById('ppdb-pending');
      const approvedElement = document.getElementById('ppdb-approved');
      const rejectedElement = document.getElementById('ppdb-rejected');

      if (totalElement) totalElement.textContent = stats.total;
      if (pendingElement) pendingElement.textContent = stats.pending;
      if (approvedElement) approvedElement.textContent = stats.approved;
      if (rejectedElement) rejectedElement.textContent = stats.rejected;

    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  /**
   * Action handlers
   */
  viewDetails(rowNumber) {
    const student = this.data.find(row => row.rowNumber == rowNumber);
    if (!student) return;

    // TODO: Implement detail modal
    console.log('View details for:', student);
    alert(`View details for ${student['Nama Lengkap']}`);
  }

  editStudent(rowNumber) {
    const student = this.data.find(row => row.rowNumber == rowNumber);
    if (!student) return;

    // TODO: Implement edit modal
    console.log('Edit student:', student);
    alert(`Edit ${student['Nama Lengkap']}`);
  }

  async deleteStudent(rowNumber) {
    const student = this.data.find(row => row.rowNumber == rowNumber);
    if (!student) return;

    if (!confirm(`Are you sure you want to delete ${student['Nama Lengkap']}?`)) {
      return;
    }

    // TODO: Implement delete functionality
    console.log('Delete student:', student);
    alert(`Delete ${student['Nama Lengkap']} - Not implemented yet`);
  }

  /**
   * Loading states
   */
  setLoadingState(isLoading) {
    this.isLoading = isLoading;
    
    const loadingElement = document.getElementById('ppdb-loading');
    const tableElement = document.getElementById('ppdb-table');
    
    if (loadingElement && tableElement) {
      if (isLoading) {
        loadingElement.style.display = 'block';
        tableElement.style.display = 'none';
      } else {
        loadingElement.style.display = 'none';
        tableElement.style.display = 'table';
      }
    }
  }

  /**
   * Error handling
   */
  showError(message) {
    const errorElement = document.getElementById('ppdb-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    } else {
      alert(message);
    }
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    return `
      <tr>
        <td colspan="4" class="px-6 sm:px-10 py-12 text-center">
          <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl text-gray-400">person_search</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">No PPDB Data Found</h3>
              <p class="text-sm text-gray-500">No student registrations have been submitted yet.</p>
            </div>
            <button onclick="ppdbManager.showCreateStudentModal()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <span class="material-symbols-outlined text-sm mr-1">add</span>
              Add First Student
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Show debug information
   */
  showDebugInfo(title, content) {
    console.log('🔍 DEBUG INFO:', title, content);
    
    // Only show debug info if debug mode is enabled
    if (window.location.search.includes('debug=true')) {
      const debugDiv = document.getElementById('debug-info');
      if (debugDiv) {
        debugDiv.innerHTML = `
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 class="font-bold text-yellow-800 mb-2">${title}</h4>
            <pre class="text-xs text-yellow-700 whitespace-pre-wrap">${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}</pre>
          </div>
        `;
        debugDiv.style.display = 'block';
      }
    }
  }

  /**
   * Utility methods
   */
  getStatusClass(status) {
    const statusLower = String(status || '').toLowerCase();
    switch (statusLower) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }

  formatDate(dateString) {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  bindPaginationEvents() {
    // Pagination is handled by onclick attributes in renderPagination
  }

  /**
   * Update student status by ID
   */
  async updateStatus(id, status) {
    console.log('🔄 UPDATING STATUS:', { id, status });
    
    try {
      this.setLoadingState(true);
      const response = await window.adminAPI.getPPDBData({ 
        action: 'updateStatus', 
        id: id, 
        status: status 
      });
      
      console.log('✅ STATUS UPDATE RESPONSE:', response);
      
      if (response.status === 'success') {
        this.showNotification('Status updated successfully', 'success');
        await this.loadInitialData(); // Refresh data
        return true;
      } else {
        this.showNotification(response.message || 'Failed to update status', 'error');
        return false;
      }
    } catch (error) {
      console.error('💥 STATUS UPDATE ERROR:', error);
      this.showNotification('Failed to update status: ' + error.message, 'error');
      return false;
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Get student by ID
   */
  async getStudent(id) {
    console.log('🔍 GETTING STUDENT:', id);
    
    try {
      const response = await window.adminAPI.getPPDBData({ 
        action: 'get', 
        id: id 
      });
      
      console.log('✅ GET STUDENT RESPONSE:', response);
      
      if (response.status === 'success') {
        return response.data;
      } else {
        this.showNotification(response.message || 'Failed to get student', 'error');
        return null;
      }
    } catch (error) {
      console.error('💥 GET STUDENT ERROR:', error);
      this.showNotification('Failed to get student: ' + error.message, 'error');
      return null;
    }
  }

  /**
   * Update student data by ID
   */
  async updateStudent(id, studentData) {
    console.log('✏️ UPDATING STUDENT:', { id, ...studentData });
    
    try {
      this.setLoadingState(true);
      const response = await window.adminAPI.getPPDBData({ 
        action: 'update', 
        id: id, 
        ...studentData 
      });
      
      console.log('✅ STUDENT UPDATE RESPONSE:', response);
      
      if (response.status === 'success') {
        this.showNotification('Student updated successfully', 'success');
        await this.loadInitialData(); // Refresh data
        return true;
      } else {
        this.showNotification(response.message || 'Failed to update student', 'error');
        return false;
      }
    } catch (error) {
      console.error('💥 STUDENT UPDATE ERROR:', error);
      this.showNotification('Failed to update student: ' + error.message, 'error');
      return false;
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Delete student by ID
   */
  async deleteStudent(id, name) {
    console.log('🗑️ DELETING STUDENT:', { id, name });
    
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return false;
    }
    
    try {
      this.setLoadingState(true);
      const response = await window.adminAPI.getPPDBData({ 
        action: 'delete', 
        id: id 
      });
      
      console.log('✅ STUDENT DELETE RESPONSE:', response);
      
      if (response.status === 'success') {
        this.showNotification('Student deleted successfully', 'success');
        await this.loadInitialData(); // Refresh data
        return true;
      } else {
        this.showNotification(response.message || 'Failed to delete student', 'error');
        return false;
      }
    } catch (error) {
      console.error('💥 STUDENT DELETE ERROR:', error);
      this.showNotification('Failed to delete student: ' + error.message, 'error');
      return false;
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Create new student
   */
  async createStudent(studentData) {
    console.log('➕ CREATING STUDENT:', studentData);
    
    try {
      this.setLoadingState(true);
      const response = await window.adminAPI.postPPDBData({ 
        action: 'create', 
        formType: 'ppdb',
        ...studentData 
      });
      
      console.log('✅ STUDENT CREATE RESPONSE:', response);
      
      if (response.status === 'success') {
        this.showNotification('Student created successfully', 'success');
        await this.loadInitialData(); // Refresh data
        return true;
      } else {
        this.showNotification(response.message || 'Failed to create student', 'error');
        return false;
      }
    } catch (error) {
      console.error('💥 STUDENT CREATE ERROR:', error);
      this.showNotification('Failed to create student: ' + error.message, 'error');
      return false;
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Show notification toast
   */
  showNotification(message, type = 'success') {
    console.log('📢 NOTIFICATION:', { message, type });
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
    
    if (type === 'success') {
      toast.className += ' bg-green-500 text-white';
      toast.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined">check_circle</span>
          <span>${message}</span>
        </div>
      `;
    } else if (type === 'error') {
      toast.className += ' bg-red-500 text-white';
      toast.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined">error</span>
          <span>${message}</span>
        </div>
      `;
    }
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  /**
   * Show status update modal
   */
  showStatusModal(id, currentStatus) {
    console.log('🔄 SHOWING STATUS MODAL:', { id, currentStatus });
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Update Status</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">New Status</label>
            <select id="status-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="approved" ${currentStatus === 'approved' ? 'selected' : ''}>Approved</option>
              <option value="rejected" ${currentStatus === 'rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
          <div class="flex gap-3 justify-end">
            <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
            <button onclick="ppdbManager.updateStatus('${id}', document.getElementById('status-select').value); this.closest('.fixed').remove()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Update</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Show view student modal
   */
  async viewStudent(id) {
    console.log('👁 VIEWING STUDENT:', id);
    
    const student = await this.getStudent(id);
    if (!student) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Student Details</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <p class="px-3 py-2 bg-gray-50 rounded-lg">${this.escapeHtml(student.ID || '')}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <p class="px-3 py-2 bg-gray-50 rounded-lg">${this.escapeHtml(student['Nama Lengkap'] || '')}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">NISN</label>
              <p class="px-3 py-2 bg-gray-50 rounded-lg">${this.escapeHtml(student.NISN || '')}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
              <p class="px-3 py-2 bg-gray-50 rounded-lg">${this.escapeHtml(student['Tempat Lahir'] || '')}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
              <p class="px-3 py-2 bg-gray-50 rounded-lg">${this.escapeHtml(student['Tanggal Lahir'] || '')}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <p class="px-3 py-2 bg-gray-50 rounded-lg">${this.escapeHtml(student['Jenis Kelamin'] || '')}</p>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <p class="px-3 py-2 bg-gray-50 rounded-lg">${this.escapeHtml(student.Alamat || '')}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <p class="px-3 py-2 bg-gray-50 rounded-lg">${this.escapeHtml(student['No HP'] || '')}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p class="px-3 py-2 bg-gray-50 rounded-lg">${this.escapeHtml(student.Email || '')}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
              <p class="px-3 py-2 bg-gray-50 rounded-lg">${this.escapeHtml(student['Waktu pendaftaran'] || '')}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <p class="px-3 py-2 bg-gray-50 rounded-lg">${this.escapeHtml(student.Status || '')}</p>
            </div>
          </div>
          <div class="flex justify-end mt-6">
            <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Show edit student modal
   */
  async editStudent(id) {
    console.log('✏️ EDITING STUDENT:', id);
    
    const student = await this.getStudent(id);
    if (!student) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Edit Student</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form id="edit-form" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input type="text" value="${this.escapeHtml(student.ID || '')}" disabled class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="Nama Lengkap" value="${this.escapeHtml(student['Nama Lengkap'] || '')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">NISN</label>
              <input type="text" name="NISN" value="${this.escapeHtml(student.NISN || '')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
              <input type="text" name="Tempat Lahir" value="${this.escapeHtml(student['Tempat Lahir'] || '')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
              <input type="date" name="Tanggal Lahir" value="${this.escapeHtml(student['Tanggal Lahir'] || '')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="Jenis Kelamin" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="Laki-laki" ${student['Jenis Kelamin'] === 'Laki-laki' ? 'selected' : ''}>Male</option>
                <option value="Perempuan" ${student['Jenis Kelamin'] === 'Perempuan' ? 'selected' : ''}>Female</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea name="Alamat" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">${this.escapeHtml(student.Alamat || '')}</textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" name="No HP" value="${this.escapeHtml(student['No HP'] || '')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="Email" value="${this.escapeHtml(student.Email || '')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    const form = modal.querySelector('#edit-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      if (await this.updateStudent(id, data)) {
        modal.remove();
      }
    });
  }

  /**
   * Show create student modal
   */
  showCreateStudentModal() {
    console.log('➕ SHOWING CREATE STUDENT MODAL');
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Add New Student</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form id="create-form" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="Nama Lengkap" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Enter full name">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">NISN</label>
              <input type="text" name="NISN" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Enter NISN">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
              <input type="text" name="Tempat Lahir" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Enter birth place">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
              <input type="date" name="Tanggal Lahir" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="Jenis Kelamin" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="">Select Gender</option>
                <option value="Laki-laki">Male</option>
                <option value="Perempuan">Female</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea name="Alamat" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Enter full address"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" name="No HP" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Enter phone number">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="Email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Enter email address">
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Add Student</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    const form = modal.querySelector('#create-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      if (await this.createStudent(data)) {
        modal.remove();
      }
    });
  }
}

/**
 * Initialize PPDB manager when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('ppdb-table-body')) {
    window.ppdbManager = new PPDBManager();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PPDBManager;
}
