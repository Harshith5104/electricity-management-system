# Electricity Management System (Pure HTML/CSS/JS)

This is a fully client-side **Electricity Management System** built using only **HTML5**, **CSS3**, and **vanilla JavaScript**, with **localStorage** for data persistence.

## Features

- **Registration** with full validation (consumer ID, bill number, email, mobile, password strength, etc.)
- **Login** and simple **session management**
- **Dashboard** with quick stats and navigation
- **Bill Payment Flow**
  - View unpaid bills
  - Select multiple bills and auto-calc total
  - Payment summary with PG charge (2%)
  - Card details with validation and input masking
  - Payment success + downloadable / printable HTML receipt
- **Complaint Management**
  - Register complaint with dynamic categories
  - Auto-generated complaint IDs (`COMP-YYYYMMDD-XXXX`)
  - Complaint status listing, filtering, search, and details view
- **UI/UX**
  - Responsive layout
  - Consistent black / blue / white theme
  - Inline error and success messages
  - Loading indicator and confirmations

## File Structure

```text
/electricity-management-system
├── index.html              # Login
├── register.html           # Registration
├── home.html               # Dashboard
├── pay-bill.html           # Bill selection
├── payment.html            # Payment summary
├── card-details.html       # Card entry and receipt
├── register-complaint.html # Complaint registration
├── complaint-status.html   # Complaint tracking
├── css/
│   └── styles.css
├── js/
│   ├── utils.js      # Shared helpers, validation, IDs, receipts
│   ├── auth.js       # Registration, login, session, header/logout
│   ├── billing.js    # Bills, payment flow, card handling
│   └── complaints.js # Complaint registration and status
└── README.md
```

## Running the Project

Because the project is fully static, you can run it in two ways:

- **Option 1: Open directly**
  - Double-click `index.html` to open in your browser.
- **Option 2: Use a simple static server (recommended)**
  - For example, with Node.js installed:
    - `npx serve` or `npx http-server .`

Start at `index.html` to register, log in, and use the full flow.

## Notes

- All data (users, bills, complaints, session, payment context) is stored in `localStorage` under the `ems_*` keys.
- This app is for educational/demonstration purposes only; **no real payment gateway is used**, and passwords are not hashed.

