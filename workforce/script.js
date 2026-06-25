const services = [
  "Commercial Cleaning",
  "Administrative Support",
  "Data Entry",
  "Home Health",
  "ABA Therapy",
  "Transportation",
  "General Labor",
];

const starterWorkers = [
  {
    id: "worker-1",
    workerName: "Avery Johnson",
    phone: "(214) 555-0184",
    email: "avery.johnson@example.com",
    city: "Dallas",
    state: "TX",
    services: ["Commercial Cleaning", "General Labor"],
    backgroundCheck: "Cleared",
    drugScreen: "Cleared",
    availability: "Full-time",
    notes: "Prefers commercial evening shifts.",
  },
  {
    id: "worker-2",
    workerName: "Morgan Lee",
    phone: "(469) 555-0127",
    email: "morgan.lee@example.com",
    city: "Plano",
    state: "TX",
    services: ["Administrative Support", "Data Entry"],
    backgroundCheck: "Pending",
    drugScreen: "Cleared",
    availability: "Part-time",
    notes: "Strong office and spreadsheet experience.",
  },
  {
    id: "worker-3",
    workerName: "Taylor Smith",
    phone: "(817) 555-0149",
    email: "taylor.smith@example.com",
    city: "Fort Worth",
    state: "TX",
    services: ["Home Health", "Transportation"],
    backgroundCheck: "Cleared",
    drugScreen: "Pending",
    availability: "Weekends",
    notes: "Has reliable vehicle and weekend availability.",
  },
];

const storageKey = "igeo-workforce-workers";
const pendingKey = "igeo-workforce-pending-operations";
const cloudConfig = window.IGEO_WORKFORCE || {};
let workers = loadLocalBackup();
let pendingOperations = loadPendingOperations();
let syncInProgress = false;

const elements = {
  addWorkerButton: document.querySelector("#addWorkerButton"),
  availableWorkers: document.querySelector("#availableWorkers"),
  availability: document.querySelector("#availability"),
  backgroundCheck: document.querySelector("#backgroundCheck"),
  city: document.querySelector("#city"),
  clearFormButton: document.querySelector("#clearFormButton"),
  clearedWorkers: document.querySelector("#clearedWorkers"),
  drugScreen: document.querySelector("#drugScreen"),
  email: document.querySelector("#email"),
  emptyState: document.querySelector("#emptyState"),
  exportButton: document.querySelector("#exportButton"),
  form: document.querySelector("#workerForm"),
  formTitle: document.querySelector("#formTitle"),
  mobileWorkerList: document.querySelector("#mobileWorkerList"),
  notes: document.querySelector("#notes"),
  phone: document.querySelector("#phone"),
  refreshCloudButton: document.querySelector("#refreshCloudButton"),
  searchInput: document.querySelector("#searchInput"),
  serviceCount: document.querySelector("#serviceCount"),
  serviceFilter: document.querySelector("#serviceFilter"),
  serviceOptions: document.querySelector("#serviceOptions"),
  state: document.querySelector("#state"),
  statusFilter: document.querySelector("#statusFilter"),
  syncStatus: document.querySelector("#syncStatus"),
  tableBody: document.querySelector("#workerTableBody"),
  totalWorkers: document.querySelector("#totalWorkers"),
  workerId: document.querySelector("#workerId"),
  workerName: document.querySelector("#workerName"),
};

function loadLocalBackup() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(parsed) ? parsed : starterWorkers;
  } catch {
    return starterWorkers;
  }
}

function loadPendingOperations() {
  try {
    const parsed = JSON.parse(localStorage.getItem(pendingKey));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalBackup() {
  localStorage.setItem(storageKey, JSON.stringify(workers));
}

function savePendingOperations() {
  localStorage.setItem(pendingKey, JSON.stringify(pendingOperations));
}

async function init() {
  renderServiceControls();
  renderServiceFilter();
  bindEvents();
  render();
  await refreshCloudData();
}

function renderServiceControls() {
  elements.serviceOptions.innerHTML = services
    .map(
      (service) => `
        <label>
          <input type="checkbox" name="services" value="${escapeHtml(service)}" />
          ${escapeHtml(service)}
        </label>
      `
    )
    .join("");
}

function renderServiceFilter() {
  elements.serviceFilter.innerHTML = [
    '<option value="All Services">All Services</option>',
    ...services.map((service) => `<option value="${escapeHtml(service)}">${escapeHtml(service)}</option>`),
  ].join("");
}

function bindEvents() {
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.clearFormButton.addEventListener("click", resetForm);
  elements.addWorkerButton.addEventListener("click", () => {
    resetForm();
    elements.workerName.focus();
  });
  elements.searchInput.addEventListener("input", render);
  elements.serviceFilter.addEventListener("change", render);
  elements.statusFilter.addEventListener("change", render);
  elements.exportButton.addEventListener("click", exportCsv);
  elements.refreshCloudButton.addEventListener("click", refreshCloudData);
  elements.state.addEventListener("input", () => {
    elements.state.value = elements.state.value.toUpperCase();
  });
  window.addEventListener("online", refreshCloudData);
  window.addEventListener("offline", () => setSyncStatus("offline"));
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.form);
  const selectedServices = formData.getAll("services");

  if (selectedServices.length === 0) {
    alert("Select at least one service for this worker.");
    return;
  }

  const worker = {
    id: elements.workerId.value || crypto.randomUUID(),
    workerName: elements.workerName.value.trim(),
    phone: elements.phone.value.trim(),
    email: elements.email.value.trim(),
    city: elements.city.value.trim(),
    state: elements.state.value.trim().toUpperCase(),
    services: selectedServices,
    backgroundCheck: elements.backgroundCheck.value,
    drugScreen: elements.drugScreen.value,
    availability: elements.availability.value,
    notes: elements.notes.value.trim(),
  };

  upsertLocalWorker(worker);
  resetForm();
  render();
  await syncOperation({ action: "upsert", worker });
}

function upsertLocalWorker(worker) {
  const existingIndex = workers.findIndex((currentWorker) => currentWorker.id === worker.id);
  if (existingIndex >= 0) {
    workers[existingIndex] = worker;
  } else {
    workers.unshift(worker);
  }
  saveLocalBackup();
}

async function syncOperation(operation) {
  if (!navigator.onLine) {
    queueOperation(operation);
    setSyncStatus("offline");
    return;
  }

  try {
    setSyncStatus("pending");
    await performCloudOperation(operation);
    setSyncStatus("synced");
  } catch {
    queueOperation(operation);
    setSyncStatus(navigator.onLine ? "failed" : "offline");
  }
}

function queueOperation(operation) {
  const workerId = operation.worker?.id || operation.id;
  pendingOperations = pendingOperations.filter(
    (pending) => (pending.worker?.id || pending.id) !== workerId
  );
  pendingOperations.push(operation);
  savePendingOperations();
}

async function refreshCloudData() {
  if (syncInProgress) {
    return;
  }
  if (!navigator.onLine) {
    setSyncStatus("offline");
    return;
  }

  syncInProgress = true;
  elements.refreshCloudButton.disabled = true;
  setSyncStatus("pending");

  try {
    await flushPendingOperations();
    await loadCloudWorkers();
    setSyncStatus("synced");
  } catch {
    setSyncStatus(navigator.onLine ? "failed" : "offline");
  } finally {
    syncInProgress = false;
    elements.refreshCloudButton.disabled = false;
  }
}

async function flushPendingOperations() {
  if (!pendingOperations.length) {
    return;
  }

  const operationsToSync = [...pendingOperations];
  for (const operation of operationsToSync) {
    await performCloudOperation(operation);
  }
  pendingOperations = [];
  savePendingOperations();
}

async function performCloudOperation(operation) {
  await postCloudOperation(operation);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await wait(700 + attempt * 500);
    const cloudRows = await readCloudRows();
    const cloudWorkers = cloudRows.map(normalizeCloudWorker).filter((worker) => worker.workerName);
    if (cloudOperationIsVisible(operation, cloudWorkers)) {
      workers = cloudWorkers;
      saveLocalBackup();
      render();
      return;
    }
  }

  throw new Error("The cloud did not confirm the workforce change.");
}

function cloudOperationIsVisible(operation, cloudWorkers) {
  if (operation.action === "delete") {
    return !cloudWorkers.some((worker) => worker.id === operation.id);
  }

  const expected = operation.worker;
  return cloudWorkers.some(
    (worker) =>
      worker.id === expected.id ||
      (expected.email && worker.email.toLowerCase() === expected.email.toLowerCase())
  );
}

async function loadCloudWorkers() {
  const cloudRows = await readCloudRows();
  workers = cloudRows.map(normalizeCloudWorker).filter((worker) => worker.workerName);
  saveLocalBackup();
  render();
}

function readCloudRows() {
  if (!cloudConfig.endpointUrl) {
    return Promise.reject(new Error("Missing workforce endpoint."));
  }

  return new Promise((resolve, reject) => {
    const callbackName = `igeoWorkforce_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => finish(new Error("Cloud request timed out.")), 12000);

    function finish(error, rows) {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
      error ? reject(error) : resolve(rows);
    }

    window[callbackName] = (response) => {
      if (!response?.ok || !Array.isArray(response.rows)) {
        finish(new Error(response?.error || "Cloud returned an invalid response."));
        return;
      }
      finish(null, response.rows);
    };

    script.onerror = () => finish(new Error("Cloud data could not be loaded."));
    script.src = `${cloudConfig.endpointUrl}?callback=${callbackName}&t=${Date.now()}`;
    document.head.appendChild(script);
  });
}

async function postCloudOperation(operation) {
  if (!cloudConfig.endpointUrl) {
    throw new Error("Missing workforce endpoint.");
  }

  await fetch(cloudConfig.endpointUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(operation),
  });
}

function normalizeCloudWorker(row) {
  const workerName =
    valueFrom(row, "workerName", "Worker Name") ||
    [valueFrom(row, "firstName", "First Name"), valueFrom(row, "lastName", "Last Name")]
      .filter(Boolean)
      .join(" ");
  const serviceValue = valueFrom(
    row,
    "services",
    "Services Available",
    "serviceCategory",
    "Service Category"
  );

  return {
    id:
      valueFrom(row, "id", "Worker ID") ||
      `row-${valueFrom(row, "_rowNumber", "Row Number") || stableId(workerName, row.Email)}`,
    workerName,
    phone: valueFrom(row, "phone", "Phone"),
    email: valueFrom(row, "email", "Email"),
    city: valueFrom(row, "city", "City"),
    state: valueFrom(row, "state", "State"),
    services: Array.isArray(serviceValue)
      ? serviceValue
      : String(serviceValue || "")
          .split(/[;,]/)
          .map((item) => item.trim())
          .filter(Boolean),
    backgroundCheck: valueFrom(row, "backgroundCheck", "Background Check") || "Not Started",
    drugScreen: valueFrom(row, "drugScreen", "Drug Screen") || "Not Started",
    availability: valueFrom(row, "availability", "Availability") || "Unavailable",
    notes: valueFrom(row, "notes", "Notes"),
  };
}

function valueFrom(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row[key] !== null) {
      return row[key];
    }
  }
  return "";
}

function stableId(...values) {
  const text = values.filter(Boolean).join("|").toLowerCase();
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function setSyncStatus(status) {
  const labels = {
    synced: "Cloud Synced",
    offline: "Offline Local Backup",
    failed: "Sync Failed",
    pending: "Syncing...",
  };
  elements.syncStatus.textContent = labels[status];
  elements.syncStatus.className = `sync-status is-${status}`;
}

function resetForm() {
  elements.form.reset();
  elements.workerId.value = "";
  elements.formTitle.textContent = "Add workforce member";
}

function render() {
  const filteredWorkers = getFilteredWorkers();
  renderMetrics();
  renderTable(filteredWorkers);
  renderMobileCards(filteredWorkers);
  elements.emptyState.style.display = filteredWorkers.length ? "none" : "block";
}

function renderMetrics() {
  const clearedWorkers = workers.filter(
    (worker) => worker.backgroundCheck === "Cleared" && worker.drugScreen === "Cleared"
  ).length;
  const availableWorkers = workers.filter((worker) => worker.availability !== "Unavailable").length;
  const activeServices = new Set(workers.flatMap((worker) => worker.services));

  elements.totalWorkers.textContent = workers.length;
  elements.availableWorkers.textContent = availableWorkers;
  elements.clearedWorkers.textContent = clearedWorkers;
  elements.serviceCount.textContent = activeServices.size;
}

function getFilteredWorkers() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const serviceFilter = elements.serviceFilter.value;
  const statusFilter = elements.statusFilter.value;

  return workers.filter((worker) => {
    const searchValues = [
      worker.workerName,
      worker.phone,
      worker.email,
      worker.city,
      worker.state,
      worker.availability,
      worker.backgroundCheck,
      worker.drugScreen,
      worker.notes,
      worker.services.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !query || searchValues.includes(query);
    const matchesService = serviceFilter === "All Services" || worker.services.includes(serviceFilter);
    const matchesStatus =
      statusFilter === "All Statuses" ||
      worker.backgroundCheck === statusFilter ||
      worker.drugScreen === statusFilter;

    return matchesSearch && matchesService && matchesStatus;
  });
}

function renderTable(filteredWorkers) {
  elements.tableBody.innerHTML = filteredWorkers.map(renderWorkerRow).join("");
  bindWorkerActions(elements.tableBody);
}

function renderWorkerRow(worker) {
  return `
    <tr>
      <td>
        <span class="worker-name">${escapeHtml(worker.workerName)}</span>
        <span class="contact">${escapeHtml(worker.phone)}</span>
        <span class="contact">${escapeHtml(worker.email)}</span>
      </td>
      <td>${escapeHtml(worker.city)}, ${escapeHtml(worker.state)}</td>
      <td><div class="chips">${renderServiceChips(worker.services)}</div></td>
      <td>${renderStatus("Background", worker.backgroundCheck)} ${renderStatus("Drug", worker.drugScreen)}</td>
      <td>${escapeHtml(worker.availability)}</td>
      <td>
        <div class="row-actions">
          <button class="text-button" type="button" data-edit="${escapeHtml(worker.id)}">Edit</button>
          <button class="danger-button" type="button" data-delete="${escapeHtml(worker.id)}">Delete</button>
        </div>
      </td>
    </tr>
  `;
}

function renderMobileCards(filteredWorkers) {
  elements.mobileWorkerList.innerHTML = filteredWorkers.map(renderMobileCard).join("");
  bindWorkerActions(elements.mobileWorkerList);
}

function bindWorkerActions(container) {
  container.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => editWorker(button.dataset.edit));
  });
  container.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteWorker(button.dataset.delete));
  });
}

function renderMobileCard(worker) {
  return `
    <article class="mobile-card">
      <div class="mobile-card-header">
        <div>
          <span class="worker-name">${escapeHtml(worker.workerName)}</span>
          <span class="contact">${escapeHtml(worker.city)}, ${escapeHtml(worker.state)}</span>
        </div>
        <strong>${escapeHtml(worker.availability)}</strong>
      </div>
      <div class="chips">${renderServiceChips(worker.services)}</div>
      <div class="mobile-meta">
        <span>${escapeHtml(worker.phone)}</span>
        <span>${escapeHtml(worker.email)}</span>
        <div>${renderStatus("Background", worker.backgroundCheck)} ${renderStatus("Drug", worker.drugScreen)}</div>
      </div>
      <div class="row-actions">
        <button class="text-button" type="button" data-edit="${escapeHtml(worker.id)}">Edit</button>
        <button class="danger-button" type="button" data-delete="${escapeHtml(worker.id)}">Delete</button>
      </div>
    </article>
  `;
}

function renderServiceChips(workerServices) {
  return workerServices.map((service) => `<span class="chip">${escapeHtml(service)}</span>`).join("");
}

function renderStatus(label, status) {
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");
  return `<span class="status ${statusClass}">${label}: ${escapeHtml(status)}</span>`;
}

function editWorker(workerId) {
  const worker = workers.find((currentWorker) => currentWorker.id === workerId);
  if (!worker) {
    return;
  }

  elements.workerId.value = worker.id;
  elements.workerName.value = worker.workerName;
  elements.phone.value = worker.phone;
  elements.email.value = worker.email;
  elements.city.value = worker.city;
  elements.state.value = worker.state;
  elements.backgroundCheck.value = worker.backgroundCheck;
  elements.drugScreen.value = worker.drugScreen;
  elements.availability.value = worker.availability;
  elements.notes.value = worker.notes;

  document.querySelectorAll('input[name="services"]').forEach((input) => {
    input.checked = worker.services.includes(input.value);
  });

  elements.formTitle.textContent = "Edit workforce member";
  elements.workerName.focus();
}

async function deleteWorker(workerId) {
  const worker = workers.find((currentWorker) => currentWorker.id === workerId);
  if (!worker || !confirm(`Delete ${worker.workerName} from the workforce roster?`)) {
    return;
  }

  workers = workers.filter((currentWorker) => currentWorker.id !== workerId);
  saveLocalBackup();
  render();
  await syncOperation({ action: "delete", id: workerId });
}

function exportCsv() {
  const filteredWorkers = getFilteredWorkers();
  const headers = [
    "Worker Name",
    "Phone",
    "Email",
    "City",
    "State",
    "Services Available",
    "Background Check",
    "Drug Screen",
    "Availability",
    "Notes",
  ];
  const rows = filteredWorkers.map((worker) => [
    worker.workerName,
    worker.phone,
    worker.email,
    worker.city,
    worker.state,
    worker.services.join("; "),
    worker.backgroundCheck,
    worker.drugScreen,
    worker.availability,
    worker.notes,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(formatCsvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `igeo-workforce-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function formatCsvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

init();
