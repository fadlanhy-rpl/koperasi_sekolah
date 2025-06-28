import './bootstrap';

// ====================================================
// KOPERASI MANAGEMENT SYSTEM JS (resources/js/app.js)
// ====================================================

// ========== INIT DOM ==========
document.addEventListener("DOMContentLoaded", () => {
  initializeTooltips();
  initializeModals();
  initializeFormValidations();
  initializeDataTables();
  initializeNotifications();
});

// ========== TOOLTIP ==========
function initializeTooltips() {
  const tooltipElements = document.querySelectorAll("[data-tooltip]");
  tooltipElements.forEach((element) => {
    element.addEventListener("mouseenter", showTooltip);
    element.addEventListener("mouseleave", hideTooltip);
  });
}

function showTooltip(event) {
  const tooltip = document.createElement("div");
  tooltip.className = "absolute bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg z-50";
  tooltip.textContent = event.target.getAttribute("data-tooltip");
  tooltip.style.top = event.target.offsetTop - 35 + "px";
  tooltip.style.left = event.target.offsetLeft + "px";
  tooltip.id = "tooltip";
  document.body.appendChild(tooltip);
}

function hideTooltip() {
  const tooltip = document.getElementById("tooltip");
  if (tooltip) tooltip.remove();
}

// ========== MODAL ==========
function initializeModals() {
  const modalTriggers = document.querySelectorAll("[data-modal]");
  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openModal(trigger.getAttribute("data-modal")));
  });

  const modalCloses = document.querySelectorAll("[data-modal-close]");
  modalCloses.forEach((close) => {
    close.addEventListener("click", () => closeModal(close.getAttribute("data-modal-close")));
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
}

// ========== FORM VALIDATION ==========
function initializeFormValidations() {
  const forms = document.querySelectorAll("form[data-validate]");
  forms.forEach((form) => {
    form.addEventListener("submit", function (event) {
      if (!validateForm(this)) event.preventDefault();
    });
  });
}

function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      showFieldError(field, "Field ini wajib diisi");
      isValid = false;
    } else {
      clearFieldError(field);
    }
  });

  const emailFields = form.querySelectorAll('input[type="email"]');
  emailFields.forEach((field) => {
    if (field.value && !isValidEmail(field.value)) {
      showFieldError(field, "Format email tidak valid");
      isValid = false;
    }
  });

  return isValid;
}

function showFieldError(field, message) {
  clearFieldError(field);
  const errorDiv = document.createElement("div");
  errorDiv.className = "text-red-500 text-sm mt-1 field-error";
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
  field.classList.add("border-red-500");
}

function clearFieldError(field) {
  const existingError = field.parentNode.querySelector(".field-error");
  if (existingError) existingError.remove();
  field.classList.remove("border-red-500");
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ========== DATA TABLE ==========
function initializeDataTables() {
  const tables = document.querySelectorAll("[data-table]");
  tables.forEach((table) => addTableFeatures(table));
}

function addTableFeatures(table) {
  const headers = table.querySelectorAll("th[data-sort]");
  headers.forEach((header) => {
    header.style.cursor = "pointer";
    header.addEventListener("click", () => sortTable(table, header.getAttribute("data-sort")));
  });
}

function sortTable(table, column) {
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const columnIndex = Number.parseInt(column);

  rows.sort((a, b) => {
    const aText = a.cells[columnIndex].textContent.trim();
    const bText = b.cells[columnIndex].textContent.trim();
    return aText.localeCompare(bText);
  });

  rows.forEach((row) => tbody.appendChild(row));
}

// ========== NOTIFICATION ==========
function initializeNotifications() {
  const notifications = document.querySelectorAll(".notification");
  notifications.forEach((notification) => {
    setTimeout(() => hideNotification(notification), 5000);
  });
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");

  const typeConfig = {
    info: { color: "bg-blue-500", icon: "fas fa-info-circle" },
    error: { color: "bg-red-500", icon: "fas fa-exclamation-circle" },
    success: { color: "bg-green-500", icon: "fas fa-check-circle" },
    warning: { color: "bg-yellow-500", icon: "fas fa-exclamation-triangle" },
  };

  const config = typeConfig[type] || typeConfig.info;

  notification.className = `notification ${config.color} text-white p-4 rounded-lg shadow-lg flex items-center`;
  notification.innerHTML = `<i class="${config.icon} mr-3 text-xl"></i><span>${message}</span>`;
  document.body.appendChild(notification);

  setTimeout(() => hideNotification(notification), 5000);
}

function hideNotification(notification) {
  if (!notification) return;
  notification.style.transition = "opacity 0.3s ease, transform 0.3s ease-out";
  notification.style.opacity = "0";
  notification.style.transform = "translateX(100%)";
  setTimeout(() => {
    if (notification.parentNode) notification.parentNode.removeChild(notification);
  }, 300);
}

// ========== UTILITY ==========
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ========== AJAX ==========
function makeRequest(url, options = {}) {
  const defaultOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content"),
    },
  };

  return fetch(url, { ...defaultOptions, ...options }).then((response) => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  });
}

// ========== CONFIRM DELETE MODAL ==========
window.KoperasiApp = {
  showNotification,
  hideNotification,
  openModal,
  closeModal,
  formatCurrency,
  formatDate,
  makeRequest,
  debounce,
  confirmDelete,
};

function confirmDelete(deleteUrl, itemName, itemType = "item") {
  const modalId = "confirmDeleteModal";

  let modalElement = document.getElementById(modalId);
  if (!modalElement) {
    modalElement = document.createElement("div");
    modalElement.id = modalId;
    modalElement.className = "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden items-center justify-center z-50 animate-fade-in";

    modalElement.innerHTML = `
      <div class="relative p-6 border w-full max-w-md mx-auto shadow-xl rounded-2xl bg-white animate-bounce-in">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <i class="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900">Konfirmasi Penghapusan</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-600" id="${modalId}Message">
              Apakah Anda yakin ingin menghapus ${itemType} "${itemName}"? Tindakan ini tidak dapat diurungkan.
            </p>
          </div>
          <div class="items-center px-4 py-3 space-x-3">
            <button id="${modalId}ConfirmButton" class="px-6 py-2.5 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700">
              Ya, Hapus
            </button>
            <button id="${modalId}CancelButton" class="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300">
              Batal
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalElement);
  } else {
    document.getElementById(`${modalId}Message`).innerHTML = `Apakah Anda yakin ingin menghapus ${itemType} "${itemName}"? Tindakan ini tidak dapat diurungkan.`;
  }

  openModal(modalId);

  const confirmButton = document.getElementById(`${modalId}ConfirmButton`);
  const cancelButton = document.getElementById(`${modalId}CancelButton`);

  const newConfirmButton = confirmButton.cloneNode(true);
  confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

  newConfirmButton.onclick = () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = deleteUrl;
    form.style.display = "none";

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

    form.innerHTML = `
      <input type="hidden" name="_token" value="${csrfToken}">
      <input type="hidden" name="_method" value="DELETE">
    `;

    document.body.appendChild(form);
    form.submit();
    closeModal(modalId);
  };

  cancelButton.onclick = () => closeModal(modalId);
}
