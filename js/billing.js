// Billing and payment flow

function getCurrentUserBills() {
  const session = getSession();
  const allBills = getStorageArray(STORAGE_KEYS.BILLS);
  if (!session) return [];
  // In this demo, we don't strictly link consumerId to user; return all unpaid bills
  return allBills.filter((b) => b.status === "unpaid");
}

function initDashboardBilling() {
  const billsTableBody = document.querySelector(
    "#dashboardBillsTable tbody"
  );
  const totalAmountEl = document.getElementById("totalOutstandingAmount");
  const totalCountEl = document.getElementById("totalOutstandingCount");
  if (!billsTableBody || !totalAmountEl || !totalCountEl) return;

  const bills = getCurrentUserBills();
  let total = 0;
  billsTableBody.innerHTML = "";
  bills.slice(0, 5).forEach((bill) => {
    total += bill.amount;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${bill.month}</td>
      <td>${bill.dueDate}</td>
      <td class="text-right">₹${bill.amount.toFixed(2)}</td>
    `;
    billsTableBody.appendChild(tr);
  });

  totalAmountEl.textContent = `₹${total.toFixed(2)}`;
  totalCountEl.textContent = `${bills.length} unpaid bills`;
}

// ---------- Pay Bill Page ----------

function initPayBillPage() {
  const billsTableBody = document.querySelector("#billsTable tbody");
  if (!billsTableBody) return;

  const bills = getCurrentUserBills();
  const selectAll = document.getElementById("selectAllBills");
  const selectedCountEl = document.getElementById("selectedBillsCount");
  const selectedTotalEl = document.getElementById("selectedBillsTotal");
  const messageEl = document.getElementById("billSelectionMessage");
  const proceedBtn = document.getElementById("proceedToPayBtn");

  let selectedIds = new Set();

  function updateSummary() {
    let total = 0;
    let count = 0;
    bills.forEach((bill) => {
      if (selectedIds.has(bill.id)) {
        total += bill.amount;
        count++;
      }
    });
    selectedCountEl.textContent = count.toString();
    selectedTotalEl.textContent = `₹${total.toFixed(2)}`;
  }

  billsTableBody.innerHTML = "";
  bills.forEach((bill) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" data-bill-id="${bill.id}" /></td>
      <td>${bill.consumerId}</td>
      <td>${bill.month}</td>
      <td>${bill.dueDate}</td>
      <td class="text-right">₹${bill.amount.toFixed(2)}</td>
    `;
    billsTableBody.appendChild(tr);
  });

  billsTableBody.addEventListener("change", (e) => {
    const target = e.target;
    if (target && target.matches('input[type="checkbox"][data-bill-id]')) {
      const billId = target.getAttribute("data-bill-id");
      if (target.checked) {
        selectedIds.add(billId);
      } else {
        selectedIds.delete(billId);
      }
      updateSummary();
    }
  });

  if (selectAll) {
    selectAll.addEventListener("change", () => {
      const checked = selectAll.checked;
      selectedIds = new Set();
      billsTableBody
        .querySelectorAll('input[type="checkbox"][data-bill-id]')
        .forEach((cb) => {
          cb.checked = checked;
          if (checked) {
            selectedIds.add(cb.getAttribute("data-bill-id"));
          }
        });
      updateSummary();
    });
  }

  if (proceedBtn) {
    proceedBtn.addEventListener("click", () => {
      if (selectedIds.size === 0) {
        showMessage(
          messageEl,
          "Please select at least one bill to proceed.",
          "error"
        );
        return;
      }
      const selectedBills = bills.filter((b) => selectedIds.has(b.id));
      const totalAmount = selectedBills.reduce(
        (sum, b) => sum + b.amount,
        0
      );
      const context = {
        bills: selectedBills,
        billAmount: totalAmount,
      };
      localStorage.setItem(
        STORAGE_KEYS.PAYMENT_CONTEXT,
        JSON.stringify(context)
      );
      navigateTo("payment.html");
    });
  }

  updateSummary();
}

// ---------- Payment Summary Page ----------

function initPaymentSummaryPage() {
  const billAmountEl = document.getElementById("billAmount");
  const pgChargeEl = document.getElementById("pgCharge");
  const totalPayableEl = document.getElementById("totalPayable");
  const payNowBtn = document.getElementById("payNowBtn");
  if (!billAmountEl || !pgChargeEl || !totalPayableEl || !payNowBtn) return;

  const raw = localStorage.getItem(STORAGE_KEYS.PAYMENT_CONTEXT);
  if (!raw) {
    showMessage(
      document.getElementById("paymentSummaryMessage"),
      "No bills selected for payment. Please select bills first.",
      "error"
    );
    return;
  }
  const context = JSON.parse(raw);
  const amount = context.billAmount || 0;
  const pgCharge = amount * 0.02;
  const total = amount + pgCharge;

  billAmountEl.textContent = `₹${amount.toFixed(2)}`;
  pgChargeEl.textContent = `₹${pgCharge.toFixed(2)}`;
  totalPayableEl.textContent = `₹${total.toFixed(2)}`;

  payNowBtn.addEventListener("click", () => {
    const modeInput = document.querySelector(
      'input[name="paymentMode"]:checked'
    );
    const paymentMode = modeInput ? modeInput.value : "Debit Card";
    context.pgCharge = pgCharge;
    context.totalAmount = total;
    context.paymentMode = paymentMode;
    localStorage.setItem(
      STORAGE_KEYS.PAYMENT_CONTEXT,
      JSON.stringify(context)
    );
    navigateTo("card-details.html");
  });
}

// ---------- Card Details Page ----------

function initCardDetailsPage() {
  const form = document.getElementById("cardForm");
  if (!form) return;

  const amountEl = document.getElementById("cardAmountToPay");
  const messageEl = document.getElementById("cardMessage");
  const successPanel = document.getElementById("paymentSuccess");
  const summaryEl = document.getElementById("paymentSummary");
  const downloadBtn = document.getElementById("downloadReceiptBtn");
  const printBtn = document.getElementById("printReceiptBtn");

  const cardNumberInput = document.getElementById("cardNumber");
  const cardHolderInput = document.getElementById("cardHolderName");
  const expiryInput = document.getElementById("expiryDate");
  const cvvInput = document.getElementById("cvv");

  attachCardNumberMask(cardNumberInput);
  attachExpiryMask(expiryInput);

  const raw = localStorage.getItem(STORAGE_KEYS.PAYMENT_CONTEXT);
  if (!raw) {
    showMessage(
      messageEl,
      "No payment information found. Please select bills and proceed again.",
      "error"
    );
    return;
  }

  const context = JSON.parse(raw);
  const total = context.totalAmount || 0;
  amountEl.textContent = `₹${total.toFixed(2)}`;

  let latestSummary = null;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    document
      .querySelectorAll("#cardForm .error-msg")
      .forEach((el) => (el.textContent = ""));
    showMessage(messageEl, "", "error");

    const cardNumberRaw = (cardNumberInput.value || "").replace(/\s+/g, "");
    const cardHolderName = cardHolderInput.value.trim();
    const expiry = expiryInput.value.trim();
    const cvv = cvvInput.value.trim();

    let hasError = false;

    if (!isNumeric(cardNumberRaw) || cardNumberRaw.length !== 16) {
      document.getElementById("cardNumberError").textContent =
        "Card number must be exactly 16 digits.";
      hasError = true;
    } else if (!luhnCheck(cardNumberRaw)) {
      document.getElementById("cardNumberError").textContent =
        "Invalid card number.";
      hasError = true;
    }
    if (!isValidCardHolderName(cardHolderName)) {
      document.getElementById("cardHolderNameError").textContent =
        "Name must be at least 10 characters and contain only letters and spaces.";
      hasError = true;
    }
    if (!isValidExpiryDate(expiry)) {
      document.getElementById("expiryDateError").textContent =
        "Expiry date must be in MM/YY format and in the future.";
      hasError = true;
    }
    if (!/^[0-9]{3}$/.test(cvv)) {
      document.getElementById("cvvError").textContent =
        "CVV must be exactly 3 digits.";
      hasError = true;
    }

    if (hasError) {
      showMessage(
        messageEl,
        "Please correct the highlighted card details.",
        "error"
      );
      return;
    }

    if (
      !confirm(
        `You are about to pay ₹${total.toFixed(
          2
        )}. Do you want to proceed with the payment?`
      )
    ) {
      return;
    }

    toggleLoader(true);
    setTimeout(() => {
      toggleLoader(false);
      const txnId = generateTransactionId();
      const now = new Date();
      const session = getSession();

      latestSummary = {
        transactionId: txnId,
        dateTime: formatDateTime(now),
        billAmount: context.billAmount,
        pgCharge: context.pgCharge,
        totalAmount: context.totalAmount,
        paymentMode: context.paymentMode,
        userId: session ? session.userId : "",
        customerName: session ? session.name : "",
      };

      if (summaryEl) {
        summaryEl.innerHTML = `
          <p><strong>Transaction ID:</strong> ${latestSummary.transactionId}</p>
          <p><strong>Date & Time:</strong> ${latestSummary.dateTime}</p>
          <p><strong>Amount Paid:</strong> ₹${latestSummary.totalAmount.toFixed(
            2
          )}</p>
          <p><strong>Payment Mode:</strong> ${latestSummary.paymentMode}</p>
          <p><strong>Status:</strong> <span style="color:#00aa00;font-weight:bold;">Success</span></p>
        `;
      }

      const allBills = getStorageArray(STORAGE_KEYS.BILLS);
      const paidIds = new Set((context.bills || []).map((b) => b.id));
      allBills.forEach((b) => {
        if (paidIds.has(b.id)) {
          b.status = "paid";
        }
      });
      setStorageArray(STORAGE_KEYS.BILLS, allBills);

      const successPanel = document.getElementById("paymentSuccess");
      if (successPanel) {
        successPanel.hidden = false;
      }
      showMessage(
        messageEl,
        "Payment processed successfully.",
        "success"
      );
      form.reset();
    }, 800);
  });

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (!latestSummary) return;
      const html = buildReceiptHtml(latestSummary);
      downloadTextFile(
        `receipt-${latestSummary.transactionId}.html`,
        html
      );
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      if (!latestSummary) return;
      const html = buildReceiptHtml(latestSummary);
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    });
  }
}

// Initialize page-specific billing logic
document.addEventListener("DOMContentLoaded", () => {
  const pathname = window.location.pathname.toLowerCase();
  const href = window.location.href.toLowerCase();
  const filename = pathname.split('/').pop() || '';
  
  if (filename === 'home.html' || pathname.endsWith('home.html') || href.includes('home.html')) {
    initDashboardBilling();
  } else if (filename === 'pay-bill.html' || pathname.endsWith('pay-bill.html') || href.includes('pay-bill.html')) {
    initPayBillPage();
  } else if (filename === 'payment.html' || pathname.endsWith('payment.html') || href.includes('payment.html')) {
    initPaymentSummaryPage();
  } else if (filename === 'card-details.html' || pathname.endsWith('card-details.html') || href.includes('card-details.html')) {
    initCardDetailsPage();
  }
});

