// Utility and helper functions shared across the Electricity Management System

const STORAGE_KEYS = {
  USERS: "ems_users",
  BILLS: "ems_bills",
  COMPLAINTS: "ems_complaints",
  SESSION: "ems_session",
  PAYMENT_CONTEXT: "ems_payment_context",
};

// ---------- DOM Helpers ----------

function $(selector) {
  return document.querySelector(selector);
}

function showMessage(el, message, type) {
  if (!el) return;
  el.textContent = message || "";
  el.classList.remove("error", "success");
  if (type) {
    el.classList.add(type);
  }
}

function toggleLoader(show) {
  const loader = $("#globalLoader");
  if (!loader) return;
  if (show) {
    loader.classList.add("visible");
    loader.setAttribute("aria-hidden", "false");
  } else {
    loader.classList.remove("visible");
    loader.setAttribute("aria-hidden", "true");
  }
}

function navigateTo(path) {
  window.location.href = path;
}

function initFooterYear() {
  const yearSpan = $("#footerYear");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

// ---------- Storage Helpers ----------

function getStorageArray(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStorageArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr || []));
}

function getSession() {
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setSession(session) {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

// ---------- ID & Date Helpers ----------

function generateCustomerId() {
  // 13-digit random numeric ID
  let id = "";
  for (let i = 0; i < 13; i++) {
    id += Math.floor(Math.random() * 10).toString();
  }
  return id;
}

function generateTransactionId() {
  const now = new Date();
  const timestamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return "TXN-" + timestamp + "-" + rand;
}

function generateComplaintId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const dateStr = `${y}${m}${d}`;
  const complaints = getStorageArray(STORAGE_KEYS.COMPLAINTS);
  const todayComplaints = complaints.filter((c) =>
    String(c.id).startsWith(`COMP-${dateStr}`)
  );
  const nextNum = todayComplaints.length + 1;
  const seq = String(nextNum).padStart(4, "0");
  return `COMP-${dateStr}-${seq}`;
}

function formatDateTime(dt) {
  return (
    dt.toLocaleDateString() + " " + dt.toLocaleTimeString([], { hour12: true })
  );
}

// ---------- Validation Helpers ----------

function isNumeric(value) {
  return /^[0-9]+$/.test(value);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhoneNumber(num) {
  return /^[0-9]{10}$/.test(num);
}

function getPasswordStrength(pwd) {
  if (!pwd) return { label: "-", score: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;

  let label = "Weak";
  if (score >= 4) label = "Strong";
  else if (score === 3) label = "Medium";
  else if (score <= 2) label = "Weak";

  return { label, score };
}

function validatePasswordRules(pwd) {
  if (!pwd || pwd.length < 8) return false;
  if (!/[a-z]/.test(pwd)) return false;
  if (!/[A-Z]/.test(pwd)) return false;
  if (!/[0-9]/.test(pwd)) return false;
  return true;
}

function isValidConsumerId(id) {
  return isNumeric(id) && id.length === 13;
}

function isValidBillNumber(num) {
  return isNumeric(num) && num.length === 5;
}

// Card validations

function luhnCheck(cardNumber) {
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isValidExpiryDate(exp) {
  if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
  const [mm, yy] = exp.split("/").map((v) => parseInt(v, 10));
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (yy < currentYear) return false;
  if (yy === currentYear && mm < currentMonth) return false;
  return true;
}

function isValidCardHolderName(name) {
  if (!name || name.trim().length < 10) return false;
  return /^[a-zA-Z\s]+$/.test(name.trim());
}

// ---------- Input Masking ----------

function attachCardNumberMask(input) {
  if (!input) return;
  input.addEventListener("input", () => {
    let value = input.value.replace(/\D/g, "").slice(0, 16);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    input.value = parts.join(" ");
  });
}

function attachExpiryMask(input) {
  if (!input) return;
  input.addEventListener("input", () => {
    let value = input.value.replace(/\D/g, "").slice(0, 4);
    if (value.length >= 3) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    input.value = value;
  });
}

// ---------- Receipt Generation ----------

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildReceiptHtml(summary) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Payment Receipt - ${summary.transactionId}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
      .receipt { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
      h2 { margin-top: 0; }
      .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
      .label { font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="receipt">
      <h2>Electricity Payment Receipt</h2>
      <div class="row"><span class="label">Transaction ID:</span><span>${summary.transactionId}</span></div>
      <div class="row"><span class="label">Date & Time:</span><span>${summary.dateTime}</span></div>
      <div class="row"><span class="label">Customer:</span><span>${summary.customerName}</span></div>
      <div class="row"><span class="label">User ID:</span><span>${summary.userId}</span></div>
      <hr />
      <div class="row"><span class="label">Bill Amount:</span><span>₹${summary.billAmount.toFixed(
        2
      )}</span></div>
      <div class="row"><span class="label">PG Charge:</span><span>₹${summary.pgCharge.toFixed(
        2
      )}</span></div>
      <div class="row"><span class="label">Total Paid:</span><span>₹${summary.totalAmount.toFixed(
        2
      )}</span></div>
      <div class="row"><span class="label">Payment Mode:</span><span>${summary.paymentMode}</span></div>
      <div class="row"><span class="label">Status:</span><span>Success</span></div>
    </div>
  </body>
</html>`;
}

// Initialize common elements on each page
document.addEventListener("DOMContentLoaded", () => {
  initFooterYear();
});

