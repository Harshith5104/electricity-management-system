// Complaint registration and tracking

const COMPLAINT_CATEGORIES = {
  "Billing Related": [
    "Wrong Reading",
    "Overcharge",
    "Payment Not Reflected",
    "Tariff Issue",
  ],
  "Voltage Related": ["Low Voltage", "High Voltage", "Fluctuation"],
  "Frequent Disruption": [
    "Unscheduled Outage",
    "Scheduled Outage Information",
  ],
  "Street Light Related": [
    "Street Light Not Working",
    "Street Light Flickering",
  ],
  "Pole Related": ["Damaged Pole", "Leaning Pole"],
  "Meter Issue": ["Meter Not Working", "Meter Burnt", "Meter Reading Doubt"],
  "New Connection": ["New Domestic Connection", "New Commercial Connection"],
  Other: ["General Query", "Other"],
};

// ---------- Dashboard Complaints ----------

function initDashboardComplaints() {
  const tableBody = document.querySelector(
    "#dashboardComplaintsTable tbody"
  );
  const recentCountEl = document.getElementById("recentComplaintsCount");
  if (!tableBody || !recentCountEl) return;

  const complaints = getStorageArray(STORAGE_KEYS.COMPLAINTS);
  const now = new Date();
  const cutoff = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 30
  );
  const recent = complaints.filter(
    (c) => new Date(c.date) >= cutoff
  );
  recentCountEl.textContent = recent.length.toString();

  tableBody.innerHTML = "";
  recent.slice(0, 5).forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.type}</td>
      <td>${c.status}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// ---------- Register Complaint Page ----------

function populateComplaintCategories() {
  const typeSelect = document.getElementById("complaintType");
  const categorySelect = document.getElementById("complaintCategory");
  if (!typeSelect || !categorySelect) return;

  typeSelect.addEventListener("change", () => {
    const type = typeSelect.value;
    const cats = COMPLAINT_CATEGORIES[type] || [];
    categorySelect.innerHTML =
      '<option value="">Select category</option>' +
      cats.map((c) => `<option>${c}</option>`).join("");
  });
}

function initRegisterComplaintPage() {
  const form = document.getElementById("complaintForm");
  if (!form) return;

  populateComplaintCategories();

  const typeInput = document.getElementById("complaintType");
  const categoryInput = document.getElementById("complaintCategory");
  const contactPersonInput = document.getElementById("contactPerson");
  const landmarkInput = document.getElementById("landmark");
  const consumerNoInput = document.getElementById("complaintConsumerNo");
  const mobileInput = document.getElementById("complaintMobile");
  const addressInput = document.getElementById("complaintAddress");
  const descriptionInput = document.getElementById("problemDescription");
  const messageEl = document.getElementById("complaintMessage");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    document
      .querySelectorAll("#complaintForm .error-msg")
      .forEach((el) => (el.textContent = ""));
    showMessage(messageEl, "", "error");

    const type = typeInput.value;
    const category = categoryInput.value;
    const contactPerson = contactPersonInput.value.trim();
    const landmark = landmarkInput.value.trim();
    const consumerNo = consumerNoInput.value.trim();
    const mobile = mobileInput.value.trim();
    const address = addressInput.value.trim();
    const description = descriptionInput.value.trim();

    let hasError = false;

    if (!type) {
      document.getElementById("complaintTypeError").textContent =
        "Please select complaint type.";
      hasError = true;
    }
    if (!category) {
      document.getElementById("complaintCategoryError").textContent =
        "Please select category.";
      hasError = true;
    }
    if (!contactPerson) {
      document.getElementById("contactPersonError").textContent =
        "Contact person is required.";
      hasError = true;
    }
    if (!isValidConsumerId(consumerNo)) {
      document.getElementById("complaintConsumerNoError").textContent =
        "Consumer No must be exactly 13 digits.";
      hasError = true;
    }
    if (!isValidPhoneNumber(mobile)) {
      document.getElementById("complaintMobileError").textContent =
        "Mobile number must be exactly 10 digits.";
      hasError = true;
    }
    if (!address) {
      document.getElementById("complaintAddressError").textContent =
        "Address is required.";
      hasError = true;
    }
    if (!description || description.length < 20) {
      document.getElementById("problemDescriptionError").textContent =
        "Description must be at least 20 characters.";
      hasError = true;
    }

    if (hasError) {
      showMessage(
        messageEl,
        "Please correct the highlighted fields.",
        "error"
      );
      return;
    }

    if (
      !confirm(
        "Do you want to submit this complaint? Our team will contact you shortly."
      )
    ) {
      return;
    }

    toggleLoader(true);
    setTimeout(() => {
      const complaints = getStorageArray(STORAGE_KEYS.COMPLAINTS);
      const session = getSession();
      const complaintId = generateComplaintId();
      const now = new Date();

      const complaint = {
        id: complaintId,
        userId: session ? session.userId : "",
        type,
        category,
        contactPerson,
        landmark,
        consumerNo,
        mobile,
        address,
        description,
        status: "Pending",
        date: now.toISOString(),
      };

      complaints.push(complaint);
      setStorageArray(STORAGE_KEYS.COMPLAINTS, complaints);

      toggleLoader(false);
      showMessage(
        messageEl,
        "Complaint Registered Successfully.",
        "success"
      );

      const successPanel = document.getElementById("complaintSuccess");
      const summary = document.getElementById("complaintSummary");
      if (successPanel && summary) {
        successPanel.hidden = false;
        summary.innerHTML = `
          <p><strong>Complaint ID:</strong> ${complaint.id}</p>
          <p><strong>Type:</strong> ${complaint.type}</p>
          <p><strong>Category:</strong> ${complaint.category}</p>
          <p><strong>Registered Date:</strong> ${formatDateTime(now)}</p>
          <p><strong>Status:</strong> ${complaint.status}</p>
          <p><strong>Contact Person:</strong> ${complaint.contactPerson}</p>
          <p><strong>Consumer No:</strong> ${complaint.consumerNo}</p>
        `;
      }

      form.reset();
    }, 700);
  });
}

// ---------- Complaint Status Page ----------

function initComplaintStatusPage() {
  const tableBody = document.querySelector("#complaintsTable tbody");
  if (!tableBody) return;

  const statusFilter = document.getElementById("statusFilter");
  const searchInput = document.getElementById("searchComplaint");
  const detailsPanel = document.getElementById("complaintDetailsPanel");
  const detailsEl = document.getElementById("complaintDetails");

  function loadAndRender() {
    const session = getSession();
    const all = getStorageArray(STORAGE_KEYS.COMPLAINTS);
    let list = all;
    if (session) {
      list = all.filter((c) => c.userId === session.userId);
    }
    const status = statusFilter.value;
    const q = searchInput.value.trim().toLowerCase();

    let filtered = list;
    if (status !== "all") {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (q) {
      filtered = filtered.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    tableBody.innerHTML = "";
    filtered.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.type}</td>
        <td>${new Date(c.date).toLocaleDateString()}</td>
        <td>${c.status}</td>
        <td><button class="btn btn-small btn-secondary" data-view-id="${c.id}">View Details</button></td>
      `;
      tableBody.appendChild(tr);
    });
  }

  tableBody.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.matches("button[data-view-id]")) {
      const id = target.getAttribute("data-view-id");
      const complaints = getStorageArray(STORAGE_KEYS.COMPLAINTS);
      const c = complaints.find((x) => x.id === id);
      if (!c || !detailsEl || !detailsPanel) return;
      detailsPanel.hidden = false;
      detailsEl.innerHTML = `
        <p><strong>Complaint ID:</strong> ${c.id}</p>
        <p><strong>Type:</strong> ${c.type}</p>
        <p><strong>Category:</strong> ${c.category}</p>
        <p><strong>Status:</strong> ${c.status}</p>
        <p><strong>Registered Date:</strong> ${formatDateTime(
          new Date(c.date)
        )}</p>
        <p><strong>Consumer No:</strong> ${c.consumerNo}</p>
        <p><strong>Contact Person:</strong> ${c.contactPerson}</p>
        <p><strong>Mobile:</strong> ${c.mobile}</p>
        <p><strong>Address:</strong> ${c.address}</p>
        <p><strong>Landmark:</strong> ${c.landmark || "-"}</p>
        <p><strong>Description:</strong><br/>${c.description}</p>
      `;
    }
  });

  statusFilter.addEventListener("change", loadAndRender);
  searchInput.addEventListener("input", loadAndRender);

  loadAndRender();
}

// Initialize complaints logic
document.addEventListener("DOMContentLoaded", () => {
  const pathname = window.location.pathname.toLowerCase();
  const href = window.location.href.toLowerCase();
  const filename = pathname.split('/').pop() || '';
  
  if (filename === 'home.html' || pathname.endsWith('home.html') || href.includes('home.html')) {
    initDashboardComplaints();
  } else if (filename === 'register-complaint.html' || pathname.endsWith('register-complaint.html') || href.includes('register-complaint.html')) {
    initRegisterComplaintPage();
  } else if (filename === 'complaint-status.html' || pathname.endsWith('complaint-status.html') || href.includes('complaint-status.html')) {
    initComplaintStatusPage();
  }
});

