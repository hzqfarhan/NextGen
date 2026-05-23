import { BillCategory, BillMode, BillPaymentRail } from "@/store/useStore";

export interface BillField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  mask?: "account" | "phone" | "reference";
}

export interface BillTemplate {
  category: BillCategory;
  title: string;
  description: string;
  icon: string;
  defaultMode: BillMode;
  defaultRail: BillPaymentRail;
  setupFields: BillField[];
  paymentFields: BillField[];
}

export const MALAYSIAN_BANKS = [
  "BeU",
  "Maybank",
  "CIMB Bank",
  "Public Bank",
  "RHB Bank",
  "Hong Leong Bank",
  "AmBank",
  "UOB Malaysia",
  "Bank Rakyat",
  "OCBC Bank Malaysia",
  "HSBC Bank Malaysia",
  "Bank Islam Malaysia",
  "Affin Bank",
  "Alliance Bank Malaysia",
  "Standard Chartered Malaysia",
  "MBSB Bank",
  "Bank Muamalat Malaysia"
];

export const BILL_TEMPLATES: BillTemplate[] = [
  {
    category: "rent",
    title: "Rent",
    description: "sewa rumah, bilik, hostel, kolej",
    icon: "🏠",
    defaultMode: "simulated_autopay",
    defaultRail: "bank_transfer",
    setupFields: [
      { name: "name", label: "Bill Name", type: "text", placeholder: "e.g. My Rent", required: true },
      { name: "amount", label: "Amount (RM)", type: "number", placeholder: "0.00", required: true },
      { name: "dueDay", label: "Due Day of Month", type: "number", placeholder: "1", required: true },
      { name: "provider", label: "Landlord / Hostel Name", type: "text", placeholder: "e.g. Encik Ali", required: true },
    ],
    paymentFields: [
      { name: "bankName", label: "Bank Name", type: "select", options: MALAYSIAN_BANKS, required: true },
      { name: "accountNumber", label: "Bank Account Number", type: "text", placeholder: "•••• •••• ••••", mask: "account", required: true },
      { name: "recipientName", label: "Recipient Name", type: "text", placeholder: "e.g. Ali bin Abu", required: true },
      { name: "referenceNumber", label: "Recipient Reference", type: "text", placeholder: "e.g. Rental May 2026", required: true },
    ]
  },
  {
    category: "phone",
    title: "Phone Bill",
    description: "Postpaid/prepaid monthly commitment",
    icon: "📱",
    defaultMode: "simulated_autopay",
    defaultRail: "jompay",
    setupFields: [
      { name: "name", label: "Bill Name", type: "text", placeholder: "e.g. Celcom Bill", required: true },
      { name: "productType", label: "Plan Type", type: "select", options: ["Postpaid", "Prepaid"], required: true },
      { name: "provider", label: "Provider", type: "select", options: ["CelcomDigi", "Maxis", "U Mobile", "Yes", "Hotlink", "Xpax", "RedONE", "Yoodo"], required: true },
      { name: "amount", label: "Amount (RM)", type: "number", placeholder: "0.00", required: true },
      { name: "dueDay", label: "Due Day of Month", type: "number", placeholder: "15", required: true },
    ],
    paymentFields: []
  },
  {
    category: "ptptn",
    title: "PTPTN",
    description: "Student loan repayment",
    icon: "🎓",
    defaultMode: "simulated_autopay",
    defaultRail: "jompay",
    setupFields: [
      { name: "name", label: "Bill Name", type: "text", placeholder: "e.g. My PTPTN", required: true },
      { name: "productType", label: "PTPTN Product Type", type: "select", options: ["Ujrah (1%)", "Conventional", "SSPN-i", "SSPN-i Plus"], required: true },
      { name: "amount", label: "Repayment Amount (RM)", type: "number", placeholder: "0.00", required: true },
      { name: "dueDay", label: "Due Day of Month", type: "number", placeholder: "27", required: true },
    ],
    paymentFields: [
      { name: "billerCode", label: "JomPAY Biller Code", type: "text", placeholder: "e.g. 4848", required: true },
      { name: "ref1", label: "Ref-1 (IC Number)", type: "text", placeholder: "••••••-••-••••", mask: "account", required: true },
      { name: "ref2", label: "Ref-2 (Phone Number)", type: "text", placeholder: "01x-xxx xxxx", mask: "phone" },
    ]
  },
  {
    category: "internet",
    title: "Internet",
    description: "Unifi, TIME, Maxis Fibre, etc",
    icon: "🌐",
    defaultMode: "simulated_autopay",
    defaultRail: "jompay",
    setupFields: [
      { name: "name", label: "Bill Name", type: "text", placeholder: "e.g. Home WiFi", required: true },
      { name: "provider", label: "Provider", type: "select", options: ["Unifi", "TIME", "Maxis Fibre", "Astro Fibre", "Allo"], required: true },
      { name: "amount", label: "Amount (RM)", type: "number", placeholder: "0.00", required: true },
      { name: "dueDay", label: "Due Day of Month", type: "number", placeholder: "10", required: true },
    ],
    paymentFields: [
      { name: "accountNumber", label: "Account Number", type: "text", placeholder: "•••• ••••", mask: "account", required: true },
    ]
  },
  {
    category: "streaming",
    title: "Streaming",
    description: "Netflix, Spotify, YouTube Premium, etc",
    icon: "🎬",
    defaultMode: "auto_track",
    defaultRail: "card_subscription",
    setupFields: [
      { name: "serviceName", label: "Service Name", type: "select", options: ["Netflix", "Spotify", "YouTube Premium", "iCloud", "Disney+ Hotstar", "Amazon Prime", "HBO Go"], required: true },
      { name: "planName", label: "Plan Name", type: "text", placeholder: "e.g. Premium Family" },
      { name: "amount", label: "Amount (RM)", type: "number", placeholder: "0.00", required: true },
      { name: "dueDay", label: "Renewal Date (Day)", type: "number", placeholder: "1", required: true },
    ],
    paymentFields: [
      { name: "accountEmail", label: "Account Email", type: "text", placeholder: "your@email.com", required: true },
      { name: "paymentSourceLabel", label: "Payment Source", type: "select", options: ["NextGen Card •••• 4292", "Main Account", "Other Bank Card"], required: true },
    ]
  },
  {
    category: "transport",
    title: "Transport Pass",
    description: "My50, Rapid KL, TNG tracking",
    icon: "🚆",
    defaultMode: "auto_track",
    defaultRail: "ewallet",
    setupFields: [
      { name: "passType", label: "Pass Type", type: "select", options: ["My50 (Monthly)", "MyCity Pass (1-Day)", "MyCity Pass (3-Day)", "KTM Komuter Link", "TNG Reload Tracking"], required: true },
      { name: "amount", label: "Amount (RM)", type: "number", placeholder: "50.00", required: true },
      { name: "dueDay", label: "Renewal Date (Day)", type: "number", placeholder: "1", required: true },
    ],
    paymentFields: [
      { name: "tngCardNickname", label: "TNG Card Nickname", type: "text", placeholder: "e.g. Main Card" },
      { name: "tngCardLast4", label: "Last 4 Digits", type: "text", placeholder: "••••", required: true },
    ]
  },
  {
    category: "petrol",
    title: "Petrol",
    description: "Monthly petrol budget",
    icon: "⛽",
    defaultMode: "budget_lock",
    defaultRail: "budget_only",
    setupFields: [
      { name: "name", label: "Budget Name", type: "text", placeholder: "e.g. Petrol Budget", required: true },
      { name: "amount", label: "Budget Amount (RM)", type: "number", placeholder: "200.00", required: true },
      { name: "dueDay", label: "Reset Date (Day)", type: "number", placeholder: "1", required: true },
      { name: "vehicleLabel", label: "Vehicle Label", type: "text", placeholder: "e.g. Myvi (VAA 1234)" },
    ],
    paymentFields: []
  },
  {
    category: "custom",
    title: "Custom Bill",
    description: "Anything else",
    icon: "📄",
    defaultMode: "simulated_autopay",
    defaultRail: "bank_transfer",
    setupFields: [
      { name: "name", label: "Bill Name", type: "text", placeholder: "e.g. My Custom Bill", required: true },
      { name: "amount", label: "Amount (RM)", type: "number", placeholder: "0.00", required: true },
      { name: "dueDay", label: "Due Day of Month", type: "number", placeholder: "1", required: true },
    ],
    paymentFields: [
      { name: "bankName", label: "Bank Name", type: "select", options: MALAYSIAN_BANKS, required: true },
      { name: "accountNumber", label: "Account Number", type: "text", placeholder: "•••• ••••", required: true },
      { name: "recipientName", label: "Recipient Name", type: "text", placeholder: "e.g. Ali bin Abu", required: true },
      { name: "referenceNumber", label: "Recipient Reference", type: "text", placeholder: "e.g. Custom Payment", required: true },
    ]
  }
];
