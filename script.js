const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyWnSwlRaRwVvv37B8YBTLLYqeE-ub3P_9aq4LCbcU3zdyKMBZ_9pVHw74Nep4HWV9tYg/exec';

const form = document.getElementById('issueForm');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');

function setMessage(type, text) {
  formMessage.className = `form-message ${type}`;
  formMessage.textContent = text;
}

function clearErrors() {
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((field) => {
    field.classList.remove('input-error');
  });

  const errorNodes = form.querySelectorAll('.error-message');
  errorNodes.forEach((node) => {
    node.textContent = '';
  });
}

function showFieldError(fieldName, message) {
  const field = form.elements[fieldName];
  const customField = form.elements[`${fieldName}Custom`];
  const fieldToMark = field && field.value === 'Other' && customField ? customField : field;
  const errorNode = document.querySelector(`[data-error-for="${fieldName}"]`);

  if (fieldToMark) {
    fieldToMark.classList.add('input-error');
  }

  if (errorNode) {
    errorNode.textContent = message;
  }
}

function getSelectedValue(selectId, customId) {
  const selectField = form[selectId];
  const customField = form[customId];

  if (!selectField) {
    return '';
  }

  if (selectField.value === 'Other') {
    return customField ? customField.value.trim() : '';
  }

  return selectField.value.trim();
}

function toggleCustomInput(selectId, customId) {
  const selectField = form[selectId];
  const customField = form[customId];

  if (!selectField || !customField) {
    return;
  }

  const shouldShow = selectField.value === 'Other';
  customField.classList.toggle('hidden', !shouldShow);

  if (!shouldShow) {
    customField.value = '';
  }
}

function setupCustomFields() {
  const fieldPairs = [
    ['universityName', 'universityNameCustom'],
    ['building', 'buildingCustom'],
    ['floor', 'floorCustom'],
    ['course', 'courseCustom'],
    ['branch', 'branchCustom'],
    ['section', 'sectionCustom'],
  ];

  fieldPairs.forEach(([selectId, customId]) => {
    const selectField = form[selectId];
    const customField = form[customId];

    if (!selectField || !customField) {
      return;
    }

    selectField.addEventListener('change', () => toggleCustomInput(selectId, customId));
    toggleCustomInput(selectId, customId);
  });
}

function resetCustomFields() {
  const fieldPairs = [
    ['universityName', 'universityNameCustom'],
    ['building', 'buildingCustom'],
    ['floor', 'floorCustom'],
    ['course', 'courseCustom'],
    ['branch', 'branchCustom'],
    ['section', 'sectionCustom'],
  ];

  fieldPairs.forEach(([selectId, customId]) => {
    toggleCustomInput(selectId, customId);
  });
}

function validateForm() {
  clearErrors();
  const values = {
    collegeName: form.collegeName.value.trim(),
    universityName: getSelectedValue('universityName', 'universityNameCustom'),
    studentName: form.studentName.value.trim(),
    rollNumber: form.rollNumber.value.trim(),
    email: form.email.value.trim(),
    building: getSelectedValue('building', 'buildingCustom'),
    course: getSelectedValue('course', 'courseCustom'),
    branch: getSelectedValue('branch', 'branchCustom'),
    currentSemester: form.currentSemester.value.trim(),
    section: getSelectedValue('section', 'sectionCustom'),
    floor: getSelectedValue('floor', 'floorCustom'),
    roomNumber: form.roomNumber.value.trim(),
    issueDescription: form.issueDescription.value.trim(),
  };

  let isValid = true;

  Object.entries(values).forEach(([key, value]) => {
    if (!value) {
      showFieldError(key, 'This field is required.');
      isValid = false;
    }
  });

  if (values.collegeName && values.collegeName.length < 3) {
    showFieldError('collegeName', 'College name is too short.');
    isValid = false;
  }

  if (values.universityName && values.universityName.length < 2) {
    showFieldError('universityName', 'University name is too short.');
    isValid = false;
  }

  if (values.studentName && values.studentName.length < 2) {
    showFieldError('studentName', 'Please enter a valid name.');
    isValid = false;
  }

  if (values.rollNumber && !/^[A-Za-z0-9-_/ ]{4,30}$/.test(values.rollNumber)) {
    showFieldError('rollNumber', 'Use letters, numbers, spaces, or - _ /.');
    isValid = false;
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    showFieldError('email', 'Enter a valid email address.');
    isValid = false;
  }

  if (values.building && values.building.length < 2) {
    showFieldError('building', 'Building name is too short.');
    isValid = false;
  }

  if (values.issueDescription && values.issueDescription.length < 10) {
    showFieldError('issueDescription', 'Please describe the issue in more detail.');
    isValid = false;
  }

  return isValid;
}

function isDuplicateSubmission(data) {
  const savedData = sessionStorage.getItem('campusIssueReporterSubmitted');

  if (!savedData) {
    return false;
  }

  try {
    const parsed = JSON.parse(savedData);
    const sameName = parsed.studentName === data.studentName;
    const sameRoll = parsed.rollNumber === data.rollNumber;
    const sameLocation = parsed.building === data.building && parsed.roomNumber === data.roomNumber;
    const sameIssue = parsed.issueDescription === data.issueDescription;

    return sameName && sameRoll && sameLocation && sameIssue;
  } catch (error) {
    return false;
  }
}

async function submitComplaint(event) {
  event.preventDefault();

  if (!validateForm()) {
    setMessage('error', 'Please correct the highlighted fields and try again.');
    return;
  }

  const formData = {
    collegeName: form.collegeName.value.trim(),
    universityName: getSelectedValue('universityName', 'universityNameCustom'),
    studentName: form.studentName.value.trim(),
    rollNumber: form.rollNumber.value.trim(),
    email: form.email.value.trim(),
    building: getSelectedValue('building', 'buildingCustom'),
    course: getSelectedValue('course', 'courseCustom'),
    branch: getSelectedValue('branch', 'branchCustom'),
    currentSemester: form.currentSemester.value.trim(),
    section: getSelectedValue('section', 'sectionCustom'),
    floor: getSelectedValue('floor', 'floorCustom'),
    roomNumber: form.roomNumber.value.trim(),
    issueDescription: form.issueDescription.value.trim(),
  };

  if (isDuplicateSubmission(formData)) {
    setMessage('error', 'This complaint appears to be a duplicate. Please wait before submitting the same issue again.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  setMessage('error', '');

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'submitComplaint',
        ...formData,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to submit the complaint.');
    }

    sessionStorage.setItem('campusIssueReporterSubmitted', JSON.stringify(formData));
    form.reset();
    resetCustomFields();
    setMessage('success', result.message || 'Complaint submitted successfully.');
  } catch (error) {
    const message = error instanceof TypeError
      ? 'Could not reach the complaint service. Check your connection and try again.'
      : error.message || 'Unable to submit the complaint. Please try again.';
    setMessage('error', message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Complaint';
    return;
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Submit Complaint';
}

setupCustomFields();
form.addEventListener('submit', submitComplaint);
