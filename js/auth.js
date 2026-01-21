// Authentication, registration and session management

function requireSession(redirectToLogin = true) {
  const session = getSession();
  if (!session && redirectToLogin) {
    navigateTo("index.html");
  }
  return session;
}

function updateWelcomeText() {
  const session = getSession();
  const el = document.getElementById("welcomeText");
  if (el && session && session.userId) {
    el.textContent = `Welcome ${session.userId}`;
  }
}

function seedTestUserIfNeeded() {
  const users = getStorageArray(STORAGE_KEYS.USERS);
  // Check if test user already exists
  if (users.some(u => u.userId === "testuser")) return;
  
  // Create a test user for demo purposes
  const testUser = {
    customerId: "1234567890123",
    consumerId: "0000000000001",
    billNumber: "12345",
    title: "Mr.",
    name: "Test User",
    email: "testuser@example.com",
    mobile: { code: "+91", number: "9876543210" },
    userId: "testuser",
    password: "Test1234"
  };
  users.push(testUser);
  setStorageArray(STORAGE_KEYS.USERS, users);
}

function seedBillsIfNeeded() {
  let bills = getStorageArray(STORAGE_KEYS.BILLS);
  if (bills.length > 0) return;
  // Seed some sample unpaid bills
  const now = new Date();
  const consumerId = "0000000000001";
  bills = [
    {
      id: "B1",
      consumerId,
      month: "Nov 2025",
      dueDate: "2025-12-15",
      amount: 1200,
      status: "unpaid",
    },
    {
      id: "B2",
      consumerId,
      month: "Dec 2025",
      dueDate: "2026-01-15",
      amount: 1450,
      status: "unpaid",
    },
    {
      id: "B3",
      consumerId,
      month: "Jan 2026",
      dueDate: "2026-02-15",
      amount: 1325,
      status: "unpaid",
    },
  ];
  setStorageArray(STORAGE_KEYS.BILLS, bills);
}

// ---------- Login Page ----------

function initLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) {
    console.error("Login form not found!");
    return;
  }

  seedTestUserIfNeeded();
  seedBillsIfNeeded();

  const userIdInput = document.getElementById("loginUserId");
  const passwordInput = document.getElementById("loginPassword");
  const toggleBtn = document.getElementById("toggleLoginPassword");
  const messageEl = document.getElementById("loginMessage");

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const userId = userIdInput.value.trim();
    const password = passwordInput.value;
    showMessage(messageEl, "", "error");

    if (!userId) {
      showMessage(messageEl, "User ID is required.", "error");
      return;
    }
    if (!password) {
      showMessage(messageEl, "Password is required.", "error");
      return;
    }

    toggleLoader(true);
    setTimeout(() => {
      try {
        const users = getStorageArray(STORAGE_KEYS.USERS);
        if (!users || users.length === 0) {
          toggleLoader(false);
          showMessage(messageEl, "No users found. Please register first.", "error");
          return;
        }
        const user = users.find(
          (u) => u.userId === userId && u.password === password
        );
        if (!user) {
          toggleLoader(false);
          showMessage(messageEl, "Invalid User ID or password.", "error");
          return;
        }
        setSession({
          userId: user.userId,
          customerId: user.customerId,
          name: user.name,
        });
        toggleLoader(false);
        navigateTo("home.html");
      } catch (error) {
        console.error("Login error:", error);
        toggleLoader(false);
        showMessage(messageEl, "An error occurred. Please try again.", "error");
      }
    }, 500);
  });

  const forgotLink = document.getElementById("forgotPasswordLink");
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      alert(
        "For demo purposes, password recovery is not implemented. Please register a new account if needed."
      );
    });
  }
}

// ---------- Registration Page ----------

function initRegisterPage() {
  const form = document.getElementById("registerForm");
  if (!form) {
    console.error("Registration form not found!");
    return;
  }

  // Reset form visibility and success panel on page load
  form.style.display = '';
  const successPanel = document.getElementById("registrationSuccess");
  if (successPanel) {
    successPanel.hidden = true;
  }

  const consumerIdInput = document.getElementById("consumerId");
  const billNumberInput = document.getElementById("billNumber");
  const titleInput = document.getElementById("title");
  const nameInput = document.getElementById("customerName");
  const emailInput = document.getElementById("email");
  const countryCodeInput = document.getElementById("countryCode");
  const mobileInput = document.getElementById("mobileNumber");
  const userIdInput = document.getElementById("userId");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const messageEl = document.getElementById("registerMessage");
  const strengthValue = document.getElementById("passwordStrengthValue");

  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
    });
  }

  if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener("click", () => {
      const isPassword = confirmPasswordInput.type === "password";
      confirmPasswordInput.type = isPassword ? "text" : "password";
    });
  }

  if (passwordInput && strengthValue) {
    passwordInput.addEventListener("input", () => {
      const { label } = getPasswordStrength(passwordInput.value);
      strengthValue.textContent = label;
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Clear error messages
    document
      .querySelectorAll("#registerForm .error-msg")
      .forEach((el) => (el.textContent = ""));
    showMessage(messageEl, "", "error");

    const consumerId = consumerIdInput.value.trim();
    const billNumber = billNumberInput.value.trim();
    const title = titleInput.value;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const countryCode = countryCodeInput.value;
    const mobile = mobileInput.value.trim();
    const userId = userIdInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    let hasError = false;

    if (!isValidConsumerId(consumerId)) {
      document.getElementById("consumerIdError").textContent =
        "Consumer ID must be exactly 13 digits.";
      hasError = true;
    }
    if (!isValidBillNumber(billNumber)) {
      document.getElementById("billNumberError").textContent =
        "Bill Number must be exactly 5 digits.";
      hasError = true;
    }
    if (!title) {
      document.getElementById("titleError").textContent = "Title is required.";
      hasError = true;
    }
    if (!name) {
      document.getElementById("customerNameError").textContent =
        "Customer Name is required.";
      hasError = true;
    }
    if (!isValidEmail(email)) {
      document.getElementById("emailError").textContent =
        "Please enter a valid email address.";
      hasError = true;
    }
    if (!isValidPhoneNumber(mobile)) {
      document.getElementById("mobileNumberError").textContent =
        "Mobile number must be exactly 10 digits.";
      hasError = true;
    }
    if (!userId || userId.length < 5 || userId.length > 20) {
      document.getElementById("userIdError").textContent =
        "User ID must be between 5 and 20 characters.";
      hasError = true;
    }
    if (!validatePasswordRules(password)) {
      document.getElementById("passwordError").textContent =
        "Password must be at least 8 characters and include uppercase, lowercase and a number.";
      hasError = true;
    }
    if (password !== confirmPassword) {
      document.getElementById("confirmPasswordError").textContent =
        "Passwords do not match.";
      hasError = true;
    }

    const users = getStorageArray(STORAGE_KEYS.USERS);
    if (users.some((u) => u.userId === userId)) {
      document.getElementById("userIdError").textContent =
        "This User ID is already taken.";
      hasError = true;
    }

    if (hasError) {
      showMessage(
        messageEl,
        "Please fix the highlighted errors before submitting.",
        "error"
      );
      return;
    }

    toggleLoader(true);
    setTimeout(() => {
      try {
        const customerId = generateCustomerId();
        const newUser = {
          customerId,
          consumerId,
          billNumber,
          title,
          name,
          email,
          mobile: { code: countryCode, number: mobile },
          userId,
          password, // For demo we store plain; normally this would be hashed.
        };
        users.push(newUser);
        setStorageArray(STORAGE_KEYS.USERS, users);
        
        // Verify it was saved
        const verifyUsers = getStorageArray(STORAGE_KEYS.USERS);
        if (!verifyUsers.find(u => u.userId === userId)) {
          throw new Error("Failed to save user data");
        }

      toggleLoader(false);
      
      const successPanel = document.getElementById("registrationSuccess");
      const summary = document.getElementById("registrationSummary");
      if (successPanel && summary) {
        summary.innerHTML = `
          <p><strong>Customer ID:</strong> ${customerId}</p>
          <p><strong>Customer Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
        `;
        form.style.display = 'none';
        successPanel.hidden = false;
        form.reset();
      }

      const goToLoginBtn = document.getElementById("goToLoginBtn");
      if (goToLoginBtn) {
        // Remove any existing listeners and add new one
        const newBtn = goToLoginBtn.cloneNode(true);
        goToLoginBtn.parentNode.replaceChild(newBtn, goToLoginBtn);
        newBtn.addEventListener("click", () => navigateTo("index.html"));
      }
      } catch (error) {
        console.error("Registration error:", error);
        toggleLoader(false);
        showMessage(messageEl, "An error occurred during registration. Please try again.", "error");
        form.style.display = '';
        if (successPanel) successPanel.hidden = true;
      }
    }, 600);
  });
}

// ---------- Shared Logout ----------

function initLogoutButton() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (confirm("Are you sure you want to logout?")) {
      setSession(null);
      navigateTo("index.html");
    }
  });
}

// Page router based on current location
document.addEventListener("DOMContentLoaded", () => {
  const pathname = window.location.pathname.toLowerCase();
  const href = window.location.href.toLowerCase();
  const filename = pathname.split('/').pop() || '';
  
  // Check for login page
  if (filename === 'index.html' || filename === '' || pathname.endsWith('/') || href.includes('index.html')) {
    initLoginPage();
  } 
  // Check for registration page
  else if (filename === 'register.html' || pathname.endsWith('register.html') || href.includes('register.html')) {
    initRegisterPage();
  } 
  // All other pages require authentication
  else {
    const session = requireSession(true);
    if (session) {
      updateWelcomeText();
      initLogoutButton();
    }
  }
});

