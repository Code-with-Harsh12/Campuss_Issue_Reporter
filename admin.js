const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyWnSwlRaRwVvv37B8YBTLLYqeE-ub3P_9aq4LCbcU3zdyKMBZ_9pVHw74Nep4HWV9tYg/exec';

const authCard = document.getElementById('authCard');
const dashboardSection = document.getElementById('dashboardSection');
const adminEmailField = document.getElementById('adminEmail');
const adminPasswordField = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const complaintsTableBody = document.getElementById('complaintsTableBody');
const loginBtn = document.getElementById('loginBtn');
const refreshBtn = document.getElementById('refreshBtn');
const filterToggleBtn = document.getElementById('filterToggleBtn');
const filterPanel = document.getElementById('filterPanel');
const activeFilterCount = document.getElementById('activeFilterCount');
const complaintCount = document.getElementById('complaintCount');
const filterResultCount = document.getElementById('filterResultCount');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

const filterFields = {
  search: document.getElementById('complaintSearch'),
  university: document.getElementById('universityFilter'),
  building: document.getElementById('buildingFilter'),
  floor: document.getElementById('floorFilter'),
  room: document.getElementById('roomFilter'),
  submittedFrom: document.getElementById('submittedFromFilter'),
  submittedTo: document.getElementById('submittedToFilter'),
};

const filterDefinitions = [
  {
    filterName: 'university',
    header: 'University Name',
    property: 'universityName',
    standardValues: ['AKTU', 'MAA SHAKUMBHRI'],
  },
  {
    filterName: 'building',
    header: 'Building',
    property: 'building',
    standardValues: [
      'Engineering Block',
      'Architecture Block',
      'Administrative Block',
      'Library Block',
      'Hostel Block',
      'Workshop Block',
    ],
  },
  {
    filterName: 'floor',
    header: 'Floor',
    property: 'floor',
    standardValues: [
      'Ground Floor',
      'First Floor',
      'Second Floor',
      'Third Floor',
      'Fourth Floor',
    ],
  },
];

let adminPassword = '';
let adminEmail = '';
let allComplaints = [];

function setLoginError(message) {
  loginError.textContent = message;
}

function showDashboard() {
  authCard.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
}

function formatDateTime(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getStatusClass(status) {
  const normalized = (status || '').toLowerCase().replace(/\s+/g, '-');

  if (normalized === 'in-progress') {
    return 'status-in-progress';
  }

  if (normalized === 'resolved') {
    return 'status-resolved';
  }

  return 'status-pending';
}

function getComplaintValue(complaint, header, property) {
  return complaint[header] || complaint[property] || '';
}

function getComplaintStatus(complaint) {
  return getComplaintValue(complaint, 'Status', 'status') || 'Pending';
}

function getActiveFilterValues() {
  return Object.values(filterFields)
    .map((field) => field.value.trim())
    .filter(Boolean);
}

function updateFilterSummary(filteredCount, totalCount) {
  const activeCount = getActiveFilterValues().length;
  activeFilterCount.textContent = activeCount ? `(${activeCount})` : '';
  complaintCount.textContent = `${filteredCount} of ${totalCount} complaints`;
  filterResultCount.textContent = `Showing ${filteredCount} of ${totalCount} complaints`;
}

function getFilteredComplaints(complaints) {
  const searchTerm = filterFields.search.value.trim().toLocaleLowerCase();
  const fromDate = filterFields.submittedFrom.value
    ? new Date(`${filterFields.submittedFrom.value}T00:00:00`).getTime()
    : null;
  const toDate = filterFields.submittedTo.value
    ? new Date(`${filterFields.submittedTo.value}T23:59:59.999`).getTime()
    : null;

  return complaints.filter((complaint) => {
    const searchableValues = [
      getComplaintValue(complaint, 'Unique Complaint ID', 'complaintId'),
      getComplaintValue(complaint, 'College Name', 'collegeName'),
      getComplaintValue(complaint, 'University Name', 'universityName'),
      getComplaintValue(complaint, 'Student Name', 'studentName'),
      getComplaintValue(complaint, 'University Roll Number', 'rollNumber'),
      getComplaintValue(complaint, 'Contact Email', 'email'),
      getComplaintValue(complaint, 'Building', 'building'),
      getComplaintValue(complaint, 'Course', 'course'),
      getComplaintValue(complaint, 'Branch', 'branch'),
      getComplaintValue(complaint, 'Current Semester', 'currentSemester'),
      getComplaintValue(complaint, 'Section', 'section'),
      getComplaintValue(complaint, 'Floor', 'floor'),
      getComplaintValue(complaint, 'Room or Location', 'roomNumber'),
      getComplaintValue(complaint, 'Issue Description', 'issueDescription'),
      getComplaintStatus(complaint),
    ].join(' ').toLocaleLowerCase();

    if (searchTerm && !searchableValues.includes(searchTerm)) {
      return false;
    }

    const textFiltersMatch = filterDefinitions.every(({ filterName, header, property, standardValues }) => {
      const filterValue = filterFields[filterName].value.trim().toLocaleLowerCase();
      const complaintValue = String(getComplaintValue(complaint, header, property)).trim();

      if (!filterValue) {
        return true;
      }

      if (filterValue === 'other') {
        return Boolean(complaintValue) &&
          !standardValues.some((value) => value.toLocaleLowerCase() === complaintValue.toLocaleLowerCase());
      }

      return complaintValue.toLocaleLowerCase() === filterValue;
    });

    const roomFilter = filterFields.room.value.trim().toLocaleLowerCase();
    const roomValue = String(getComplaintValue(complaint, 'Room or Location', 'roomNumber')).toLocaleLowerCase();

    if (!textFiltersMatch || (roomFilter && !roomValue.includes(roomFilter))) {
      return false;
    }

    const submittedValue = getComplaintValue(
      complaint,
      'Submission Date and Time',
      'submissionDateTime'
    );
    const submittedTime = new Date(submittedValue).getTime();

    if (fromDate !== null && (!Number.isFinite(submittedTime) || submittedTime < fromDate)) {
      return false;
    }
    if (toDate !== null && (!Number.isFinite(submittedTime) || submittedTime > toDate)) {
      return false;
    }

    return true;
  });
}

function renderComplaints(complaints) {
  const filteredComplaints = getFilteredComplaints(complaints);
  complaintsTableBody.replaceChildren();
  updateFilterSummary(filteredComplaints.length, complaints.length);

  if (filteredComplaints.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 9;
    emptyCell.className = 'empty-state';
    emptyCell.textContent = complaints.length === 0
      ? 'No complaints found.'
      : 'No complaints match these search filters.';
    emptyRow.appendChild(emptyCell);
    complaintsTableBody.appendChild(emptyRow);
    return;
  }

  filteredComplaints
    .slice()
    .reverse()
    .forEach((complaint) => {
      const complaintId = complaint['Unique Complaint ID'] || complaint['Complaint ID'] || complaint.complaintId || '—';
      const studentName = complaint['Student Name'] || complaint.studentName || '—';
      const rollNumber = complaint['University Roll Number'] || complaint.rollNumber || '—';
      const currentSemester = getComplaintValue(complaint, 'Current Semester', 'currentSemester') || '—';
      const building = getComplaintValue(complaint, 'Building', 'building') || '—';
      const floor = getComplaintValue(complaint, 'Floor', 'floor');
      const room = getComplaintValue(complaint, 'Room or Location', 'roomNumber');
      const location = [building, floor, room].filter(Boolean).join(', ');
      const description = getComplaintValue(complaint, 'Issue Description', 'issueDescription') || '—';
      const submitted = getComplaintValue(complaint, 'Submission Date and Time', 'submissionDateTime') || '—';
      const status = getComplaintStatus(complaint);
      const row = document.createElement('tr');

      [
        complaintId,
        studentName,
        rollNumber,
        currentSemester,
        location || '—',
        description,
        formatDateTime(submitted),
      ].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      });

      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `status-badge ${getStatusClass(status)}`;
      statusBadge.textContent = status;
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);

      const updateCell = document.createElement('td');
      const statusSelect = document.createElement('select');
      statusSelect.className = 'status-select';
      statusSelect.dataset.complaintId = complaintId;
      statusSelect.dataset.currentStatus = status;

      ['Pending', 'In Progress', 'Resolved'].forEach((statusOption) => {
        const option = document.createElement('option');
        option.value = statusOption;
        option.textContent = statusOption;
        option.selected = statusOption === status;
        statusSelect.appendChild(option);
      });

      updateCell.appendChild(statusSelect);
      row.appendChild(updateCell);
      complaintsTableBody.appendChild(row);
    });

  const selectors = complaintsTableBody.querySelectorAll('.status-select');
  selectors.forEach((select) => {
    select.addEventListener('change', async (event) => {
      const target = event.target;
      const complaintId = target.dataset.complaintId;
      const nextStatus = target.value;
      const previousStatus = target.dataset.currentStatus;

      if (nextStatus === previousStatus) {
        return;
      }

      await updateComplaintStatus(complaintId, nextStatus, target);
    });
  });
}

async function fetchComplaints() {
  const response = await fetch(WEB_APP_URL, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'fetchAllComplaints',
      email: adminEmail,
      password: adminPassword,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Unable to load complaint records.');
  }

  allComplaints = result.complaints || [];
  renderComplaints(allComplaints);
}

async function updateComplaintStatus(complaintId, newStatus, selectElement) {
  const payload = {
    action: 'updateComplaintStatus',
    complaintId,
    status: newStatus,
    email: adminEmail,
    password: adminPassword,
  };

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Unable to update status.');
    }

    selectElement.dataset.currentStatus = newStatus;
    window.alert(result.message || 'Complaint status updated successfully.');
    await fetchComplaints();
  } catch (error) {
    selectElement.value = selectElement.dataset.currentStatus;
    window.alert(error.message || 'Unable to update status. Check your connection and try again.');
  }
}

async function loginAdmin() {
  adminEmail = adminEmailField.value.trim().toLowerCase();
  adminPassword = adminPasswordField.value.trim();

  if (!adminEmail) {
    setLoginError('Please enter the admin email.');
    return;
  }

  if (!adminPassword) {
    setLoginError('Please enter the admin password.');
    return;
  }

  try {
    await fetchComplaints();
    showDashboard();
    setLoginError('');
    adminPasswordField.value = '';
  } catch (error) {
    setLoginError('Could not open the dashboard. Check the password, web app URL, and connection, then try again.');
  }
}

loginBtn.addEventListener('click', loginAdmin);
Object.values(filterFields).forEach((field) => {
  field.addEventListener('input', () => {
    renderComplaints(allComplaints);
  });
  field.addEventListener('change', () => {
    renderComplaints(allComplaints);
  });
});

filterToggleBtn.addEventListener('click', () => {
  const isExpanded = filterToggleBtn.getAttribute('aria-expanded') === 'true';
  filterToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
  filterPanel.classList.toggle('hidden', isExpanded);
});

clearFiltersBtn.addEventListener('click', () => {
  Object.values(filterFields).forEach((field) => {
    field.value = '';
  });
  renderComplaints(allComplaints);
  filterFields.search.focus();
});

refreshBtn.addEventListener('click', async () => {
  if (!adminPassword) {
    setLoginError('Please log in again.');
    return;
  }

  try {
    await fetchComplaints();
  } catch (error) {
    setLoginError('Could not refresh the complaint list. Check your connection and try again.');
  }
});

[adminEmailField, adminPasswordField].forEach((field) => {
  field.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      loginAdmin();
    }
  });
});
