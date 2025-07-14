// Utility: get/set localStorage
function getReports() {
  return JSON.parse(localStorage.getItem('aisleReports') || '[]');
}
function setReports(reports) {
  localStorage.setItem('aisleReports', JSON.stringify(reports));
}
function getUser() {
  return localStorage.getItem('user');
}
function getEmployee() {
  return localStorage.getItem('employee');
}

// Login Handlers
const userLoginForm = document.getElementById('userLoginForm');
if (userLoginForm) {
  userLoginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    if (username) {
      localStorage.setItem('user', username);
      window.location.href = 'user_app.html';
    }
  });
}
const employeeLoginForm = document.getElementById('employeeLoginForm');
if (employeeLoginForm) {
  employeeLoginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('employeeUsername').value.trim();
    if (username) {
      localStorage.setItem('employee', username);
      window.location.href = 'employee_app.html';
    }
  });
}

// User App: Check login
if (window.location.pathname.includes('user_app.html')) {
  if (!getUser()) {
    window.location.href = 'user_login.html';
  }
}
// Employee App: Check login
if (window.location.pathname.includes('employee_app.html')) {
  if (!getEmployee()) {
    window.location.href = 'employee_login.html';
  }
}

// --- CUSTOMER UI ENHANCEMENTS (user_app.html) ---
if (document.getElementById('removePhotoBtn') && document.getElementById('photo') && document.getElementById('imgPreview')) {
  const removePhotoBtn = document.getElementById('removePhotoBtn');
  const photoInput = document.getElementById('photo');
  const imgPreview = document.getElementById('imgPreview');
  removePhotoBtn.addEventListener('click', function() {
    photoInput.value = '';
    imgPreview.innerHTML = '';
    removePhotoBtn.style.display = 'none';
  });
}
if (document.getElementById('reportForm') && document.querySelector('button[type="submit"]')) {
  const reportForm = document.getElementById('reportForm');
  const submitBtn = reportForm.querySelector('button[type="submit"]');
  reportForm.addEventListener('submit', function(e) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Report';
    }, 3000);
  });
}
function showSuccessMessage(msg) {
  const confirmation = document.getElementById('confirmation');
  if (confirmation) {
    confirmation.textContent = msg;
    confirmation.classList.remove('hidden');
    setTimeout(() => confirmation.classList.add('hidden'), 3000);
  }
}

// Helper for user_reports.html
window.getUserReportsWithStatus = function() {
  const user = getUser();
  if (!user) return [];
  return getReports().filter(r => r.user === user);
};

// Popup logic
function showPopup(message) {
  const popup = document.getElementById('popup');
  if (popup) {
    popup.innerHTML = `<div id="popupTitle">${message}</div><br><button id="closePopupBtn" aria-label="Close Popup">OK</button>`;
    popup.classList.remove('hidden');
    document.getElementById('closePopupBtn').focus();
    document.getElementById('closePopupBtn').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') closePopup();
    });
    document.getElementById('closePopupBtn').addEventListener('click', closePopup);
  }
}
function closePopup() {
  const popup = document.getElementById('popup');
  if (popup) popup.classList.add('hidden');
}
window.closePopup = closePopup;

// --- EMPLOYEE DASHBOARD: SORT & BULK ACTIONS ---
let selectedBulk = new Set(); // <-- Move this to top-level so it persists
const reportsList = document.getElementById('reportsList');
if (reportsList) {
  function ensureReportIds(reports) {
    let changed = false;
    reports.forEach(report => {
      if (!report.id) {
        report.id = Date.now() + Math.random().toString(36).substr(2, 6);
        changed = true;
      }
    });
    if (changed) setReports(reports);
    return reports;
  }
  function renderReports(sortOrder = 'newest') {
    let reports = getReports();
    reports = ensureReportIds(reports);
    reports = reports.filter(r => !r.solved);
    
    // Apply filters
    const filterSeverity = document.getElementById('filterSeverity')?.value;
    const filterIssueType = document.getElementById('filterIssueType')?.value;
    const filterSection = document.getElementById('filterSection')?.value;
    
    if (filterSeverity) {
      reports = reports.filter(r => r.severity === filterSeverity);
    }
    if (filterIssueType) {
      reports = reports.filter(r => r.issueType === filterIssueType);
    }
    if (filterSection) {
      reports = reports.filter(r => r.section === filterSection);
    }
    
    // Sort
    if (sortOrder === 'severity') {
      const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      reports.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));
    } else {
      reports.sort((a, b) => sortOrder === 'oldest' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
    }
    
    if (reports.length === 0) {
      reportsList.innerHTML = '<div class="no-reports">No reports match your current filters.</div>';
      return;
    }
    reportsList.innerHTML = '';
    reports.forEach(report => {
      const card = document.createElement('div');
      card.className = 'report-card';
      card.tabIndex = 0;
      card.setAttribute('aria-label', `Report by ${report.user} on ${new Date(report.date).toLocaleString()}`);
      // Bulk checkbox
      const bulkCheckbox = document.createElement('input');
      bulkCheckbox.type = 'checkbox';
      bulkCheckbox.className = 'bulk-checkbox';
      bulkCheckbox.setAttribute('aria-label', 'Select for bulk action');
      bulkCheckbox.checked = selectedBulk.has(report.id);
      bulkCheckbox.addEventListener('change', function() {
        if (this.checked) selectedBulk.add(report.id);
        else selectedBulk.delete(report.id);
        card.classList.toggle('selected', this.checked);
      });
      card.appendChild(bulkCheckbox);
      // Create detailed report display
      const severityClass = report.severity === 'high' ? 'severity-high' : 
                           report.severity === 'medium' ? 'severity-medium' : 'severity-low';
      
      card.innerHTML += `
        <div class="report-header">
          <span class="severity-badge ${severityClass}">${report.severity.toUpperCase()}</span>
          <span class="issue-type-badge">${report.issueType.replace('-', ' ').toUpperCase()}</span>
        </div>
        <img src="${report.photo}" alt="Report Photo" />
        <div class="location-info">
          <strong>Aisle ${report.aisleNumber}</strong> • ${report.section}
          ${report.productName ? `<br><em>Product: ${report.productName}</em>` : ''}
        </div>
        <div class="desc">${report.desc}</div>
        <div class="meta">Reported by: <b>${report.user}</b> | Date: ${new Date(report.date).toLocaleString()}</div>
        <div class="meta">Points: ${report.points}${report.bonusPoints ? ` (${report.basePoints} + ${report.bonusPoints} bonus)` : ''} | Redeem: ${report.redeem ? 'Yes' : 'No'}</div>
        <button class="solve-btn" data-id="${report.id}" aria-label="Mark as Solved">Mark as Solved</button>
      `;
      if (selectedBulk.has(report.id)) card.classList.add('selected');
      reportsList.appendChild(card);
    });
    // Add event listeners for solve buttons
    document.querySelectorAll('.solve-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        this.disabled = true;
        markAsSolved(id);
      });
    });
  }
  function markAsSolved(id) {
    const reports = getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx !== -1) {
      reports[idx].solved = true;
      setReports(reports);
      selectedBulk.delete(id); // Remove from selection if present
      renderReports(sortReports ? sortReports.value : 'newest');
    }
  }
  // Bulk solve
  const bulkSolveBtn = document.getElementById('bulkSolveBtn');
  if (bulkSolveBtn) {
    bulkSolveBtn.addEventListener('click', function() {
      const reports = getReports();
      let changed = false;
      reports.forEach(r => {
        if (selectedBulk.has(r.id) && !r.solved) {
          r.solved = true;
          changed = true;
        }
      });
      if (changed) setReports(reports);
      selectedBulk.clear();
      renderReports(sortReports ? sortReports.value : 'newest');
    });
  }
  // Sort dropdown
  const sortReports = document.getElementById('sortReports');
  if (sortReports) {
    sortReports.addEventListener('change', function() {
      renderReports(this.value);
    });
  }
  
  // Filter dropdowns
  const filterSeverity = document.getElementById('filterSeverity');
  const filterIssueType = document.getElementById('filterIssueType');
  const filterSection = document.getElementById('filterSection');
  
  if (filterSeverity) {
    filterSeverity.addEventListener('change', function() {
      renderReports(sortReports ? sortReports.value : 'newest');
    });
  }
  
  if (filterIssueType) {
    filterIssueType.addEventListener('change', function() {
      renderReports(sortReports ? sortReports.value : 'newest');
    });
  }
  
  if (filterSection) {
    filterSection.addEventListener('change', function() {
      renderReports(sortReports ? sortReports.value : 'newest');
    });
  }
  
  // Clear filters button
  const clearFilters = document.getElementById('clearFilters');
  if (clearFilters) {
    clearFilters.addEventListener('click', function() {
      if (filterSeverity) filterSeverity.value = '';
      if (filterIssueType) filterIssueType.value = '';
      if (filterSection) filterSection.value = '';
      if (sortReports) sortReports.value = 'newest';
      renderReports('newest');
    });
  }
  
  renderReports(sortReports ? sortReports.value : 'newest');
}

// --- LOGOUT BUTTONS ---
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('user');
    localStorage.removeItem('employee');
    window.location.href = 'index.html';
  });
}
// --- MY REPORTS BUTTON ---
const myReportsBtn = document.getElementById('myReportsBtn');
if (myReportsBtn) {
  myReportsBtn.addEventListener('click', function() {
    window.location.href = 'user_reports.html';
  });
}
// --- IMAGE PREVIEW & VALIDATION ---
const photoInput = document.getElementById('photo');
const imgPreview = document.getElementById('imgPreview');
const removePhotoBtn = document.getElementById('removePhotoBtn');
if (photoInput && imgPreview) {
  photoInput.addEventListener('change', function() {
    imgPreview.innerHTML = '';
    const file = photoInput.files[0];
    if (file) {
      // Validate type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showPopup('Invalid image type. Please upload a JPG, PNG, or GIF.');
        photoInput.value = '';
        if (removePhotoBtn) removePhotoBtn.style.display = 'none';
        return;
      }
      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showPopup('Image too large. Max size is 5MB.');
        photoInput.value = '';
        if (removePhotoBtn) removePhotoBtn.style.display = 'none';
        return;
      }
      // Show image preview only
      const reader = new FileReader();
      reader.onload = function(e) {
        imgPreview.innerHTML = `<img src="${e.target.result}" alt="Image Preview" style="border:2px solid #0071ce;max-width:100%;border-radius:4px;" />`;
        if (removePhotoBtn) removePhotoBtn.style.display = 'inline-block';
      };
      reader.readAsDataURL(file);
    } else {
      if (removePhotoBtn) removePhotoBtn.style.display = 'none';
    }
  });
}
if (removePhotoBtn && photoInput && imgPreview) {
  removePhotoBtn.addEventListener('click', function() {
    photoInput.value = '';
    imgPreview.innerHTML = '';
    removePhotoBtn.style.display = 'none';
  });
}
// --- SPAM PREVENTION ---
function canSubmitReport() {
  const last = localStorage.getItem('lastReportTime');
  if (!last) return true;
  const now = Date.now();
  return now - parseInt(last, 10) > 60000; // 1 minute cooldown
}
function setLastReportTime() {
  localStorage.setItem('lastReportTime', Date.now().toString());
} 

// User Report Submission
const reportForm = document.getElementById('reportForm');
if (reportForm) {
  reportForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Get all form fields
    const photoInput = document.getElementById('photo');
    const aisleNumber = document.getElementById('aisleNumber').value.trim();
    const section = document.getElementById('section').value;
    const issueType = document.getElementById('issueType').value;
    const severity = document.getElementById('severity').value;
    const productName = document.getElementById('productName').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const redeem = document.getElementById('redeem').checked;
    const username = getUser();
    // Validate required fields
    if (!photoInput.files[0] || !aisleNumber || !section || !issueType || !severity || !desc) {
      alert('Please fill in all required fields.');
      return;
    }
    const file = photoInput.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      const photoData = event.target.result;
      const points = redeem ? 50 : 20;
      let bonusPoints = 0;
      if (severity === 'high') bonusPoints = 10;
      else if (severity === 'medium') bonusPoints = 5;
      const totalPoints = points + bonusPoints;
      const report = {
        id: Date.now() + Math.random().toString(36).substr(2, 6),
        photo: photoData,
        aisleNumber,
        section,
        issueType,
        severity,
        productName,
        desc,
        redeem,
        points: totalPoints,
        basePoints: points,
        bonusPoints,
        date: new Date().toISOString(),
        user: username,
        solved: false
      };
      const reports = getReports();
      reports.push(report);
      setReports(reports);
      alert('Thank you for your report! Your submission is pending employee review.');
      reportForm.reset();
      document.getElementById('imgPreview').innerHTML = '';
    };
    reader.readAsDataURL(file);
  });
} 