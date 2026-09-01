"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Filter,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  TrendingDown,
  User,
  X,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface ExpenseItem {
  id: string;
  title: string;
  category:
    | "Operations & Maintenance"
    | "Logistics & Delivery"
    | "Packaging & Boxes"
    | "Staff Allowances"
    | "Utilities & Internet"
    | "Tasting & Events";
  amountUGX: number;
  amountUSD: number;
  recordedBy: string;
  paymentMethod: "Cash" | "MTN Mobile Money" | "Airtel Money" | "Visa Card";
  voucherNumber: string;
  date: string;
  status: "Approved" | "Pending" | "Reimbursed";
  notes?: string;
}

const initialExpenses: ExpenseItem[] = [
  {
    id: "EXP-101",
    title: "Cellar Climate Humidity & Temperature Unit Servicing",
    category: "Operations & Maintenance",
    amountUGX: 1850000,
    amountUSD: 500.0,
    recordedBy: "Isaac Kato (Cellar Master)",
    paymentMethod: "Visa Card",
    voucherNumber: "VCH-8821",
    date: "2026-08-28",
    status: "Approved",
    notes: "Quarterly precision HVAC calibration for rare vintage wine storage.",
  },
  {
    id: "EXP-102",
    title: "Express Bottle Delivery Fuel & Rider Allowances",
    category: "Logistics & Delivery",
    amountUGX: 620000,
    amountUSD: 167.56,
    recordedBy: "Jessin Sam (Store Manager)",
    paymentMethod: "MTN Mobile Money",
    voucherNumber: "VCH-8822",
    date: "2026-08-29",
    status: "Approved",
    notes: "Kololo, Naguru, and Entebbe VIP order dispatches.",
  },
  {
    id: "EXP-103",
    title: "Custom Gold-Embossed Velvet Bottle Gift Boxes & Ribbon",
    category: "Packaging & Boxes",
    amountUGX: 1450000,
    amountUSD: 391.89,
    recordedBy: "Brenda Namuli (Inventory)",
    paymentMethod: "Airtel Money",
    voucherNumber: "VCH-8823",
    date: "2026-08-30",
    status: "Approved",
    notes: "500 luxury presentation gift boxes restocked.",
  },
  {
    id: "EXP-104",
    title: "High-Speed Fibre Internet & POS System Backup",
    category: "Utilities & Internet",
    amountUGX: 380000,
    amountUSD: 102.7,
    recordedBy: "Jessin Sam (Store Manager)",
    paymentMethod: "Visa Card",
    voucherNumber: "VCH-8824",
    date: "2026-08-31",
    status: "Pending",
    notes: "Monthly store optical fibre connectivity.",
  },
];

const CATEGORIES = [
  "All Categories",
  "Operations & Maintenance",
  "Logistics & Delivery",
  "Packaging & Boxes",
  "Staff Allowances",
  "Utilities & Internet",
  "Tasting & Events",
] as const;

export default function ExpensesPage() {
  const { formatAmount } = useCurrency();
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ExpenseItem["category"]>("Operations & Maintenance");
  const [amountUGX, setAmountUGX] = useState("");
  const [recordedBy, setRecordedBy] = useState("Jessin Sam (Store Manager)");
  const [paymentMethod, setPaymentMethod] = useState<ExpenseItem["paymentMethod"]>("Cash");
  const [voucherNumber, setVoucherNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Load from API and Supabase
  const loadExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (data?.docs && Array.isArray(data.docs) && data.docs.length > 0) {
        setExpenses(data.docs);
        return;
      }
    } catch (err) {
      console.warn("Failed to fetch expenses from API:", err);
    }

    const saved = localStorage.getItem("magnum_expenses_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExpenses(parsed);
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericUGX = Number(amountUGX) || 0;
    if (!title.trim() || numericUGX <= 0) return;

    const newExpense: ExpenseItem = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      title,
      category,
      amountUGX: numericUGX,
      amountUSD: Number((numericUGX / 3700).toFixed(2)),
      recordedBy,
      paymentMethod,
      voucherNumber: voucherNumber.trim() || `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().slice(0, 10),
      status: "Approved",
      notes,
    };

    // Optimistic UI update
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    localStorage.setItem("magnum_expenses_data", JSON.stringify(updated));

    // Persist to Supabase via API
    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });
    } catch (err) {
      console.warn("Failed to post expense to Supabase:", err);
    }

    // Reset Form
    setTitle("");
    setAmountUGX("");
    setVoucherNumber("");
    setNotes("");
    setIsModalOpen(false);
  };

  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter((exp) => exp.id !== id);
    setExpenses(updated);
    localStorage.setItem("magnum_expenses_data", JSON.stringify(updated));

    try {
      await fetch(`/api/expenses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Failed to delete expense from Supabase:", err);
    }
  };

  const handleToggleStatus = async (id: string, newStatus: ExpenseItem["status"]) => {
    const updated = expenses.map((exp) => (exp.id === id ? { ...exp, status: newStatus } : exp));
    setExpenses(updated);
    localStorage.setItem("magnum_expenses_data", JSON.stringify(updated));

    try {
      await fetch(`/api/expenses?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.warn("Failed to patch expense in Supabase:", err);
    }
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.recordedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "All Categories" || exp.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" || exp.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [expenses, searchQuery, selectedCategory, selectedStatus]);

  // Calculations
  const stats = useMemo(() => {
    const totalUGX = filteredExpenses.reduce((sum, exp) => sum + exp.amountUGX, 0);
    const approvedUGX = filteredExpenses
      .filter((exp) => exp.status === "Approved")
      .reduce((sum, exp) => sum + exp.amountUGX, 0);
    const pendingUGX = filteredExpenses
      .filter((exp) => exp.status === "Pending")
      .reduce((sum, exp) => sum + exp.amountUGX, 0);

    return {
      totalUGX,
      approvedUGX,
      pendingUGX,
      count: filteredExpenses.length,
    };
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Expense Management</h1>
          <p className="text-xs text-[#71717a] mt-1">
            Track, audit, and log operational cellar disbursements, logistics, and store utilities.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-[#b8860b] hover:bg-[#996515] px-5 py-2.5 text-xs font-bold text-white transition shadow-sm flex items-center gap-1.5"
          >
            <Plus size={16} /> Record Expense
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 shadow-2xs space-y-2">
          <p className="text-xs font-bold text-[#71717a] uppercase tracking-wider">Total Expenses (UGX)</p>
          <p className="font-sans text-3xl font-extrabold tracking-tight text-[#18181b]">
            UGX {stats.totalUGX.toLocaleString()}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#b8860b] bg-[#fffcf0] border border-[#f3e5b8] px-2.5 py-0.5 rounded-full">
            <TrendingDown size={14} /> {stats.count} recorded vouchers
          </span>
        </div>

        <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 shadow-2xs space-y-2">
          <p className="text-xs font-bold text-[#71717a] uppercase tracking-wider">Approved Disbursements</p>
          <p className="font-sans text-3xl font-extrabold tracking-tight text-emerald-800">
            UGX {stats.approvedUGX.toLocaleString()}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 size={14} /> Reconciled & Audited
          </span>
        </div>

        <div className="rounded-3xl border border-[#e5e5e4] bg-white p-6 shadow-2xs space-y-2">
          <p className="text-xs font-bold text-[#71717a] uppercase tracking-wider">Pending Approval</p>
          <p className="font-sans text-3xl font-extrabold tracking-tight text-amber-800">
            UGX {stats.pendingUGX.toLocaleString()}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
            <Clock size={14} /> Manager Review Required
          </span>
        </div>

      </div>

      {/* Filters & Search Toolbar */}
      <div className="rounded-3xl border border-[#e5e5e4] bg-white p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expense, employee, voucher..."
            className="w-full h-10 rounded-full border border-[#e5e5e4] bg-[#f7f7f6] pl-9 pr-4 text-xs outline-none focus:border-[#b8860b]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-full border border-[#e5e5e4] bg-[#f7f7f6] px-4 text-xs font-semibold text-[#18181b] outline-none focus:border-[#b8860b]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-full border border-[#e5e5e4] bg-[#f7f7f6] px-4 text-xs font-semibold text-[#18181b] outline-none focus:border-[#b8860b]"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Reimbursed">Reimbursed</option>
          </select>
        </div>

      </div>

      {/* Expenses Table / List */}
      <div className="rounded-3xl border border-[#e5e5e4] bg-white shadow-2xs overflow-hidden">
        
        <div className="divide-y divide-[#f4f4f3]">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#71717a] font-medium">
              No expense records found matching your filters.
            </div>
          ) : (
            filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-5 hover:bg-[#fafaf9] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#18181b] bg-[#f4f4f3] px-2 py-0.5 rounded border border-[#e4e4e7]">
                      {exp.voucherNumber}
                    </span>
                    <span className="rounded-full bg-[#fffcf0] border border-[#f3e5b8] px-2.5 py-0.5 text-[10px] font-bold text-[#b8860b]">
                      {exp.category}
                    </span>
                    <span className="text-[10px] text-[#71717a]">· {exp.date}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#18181b]">{exp.title}</h3>
                  {exp.notes && (
                    <p className="text-xs text-[#71717a]">{exp.notes}</p>
                  )}

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-[#71717a]">
                    <span className="flex items-center gap-1 font-medium">
                      <User size={12} className="text-[#a1a1aa]" /> {exp.recordedBy}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-[#52525b]">{exp.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-right">
                    <p className="font-sans text-base font-extrabold text-[#18181b] tracking-tight">
                      UGX {exp.amountUGX.toLocaleString()}
                    </p>
                    <span className="text-[11px] font-bold text-[#71717a]">
                      ~${exp.amountUSD.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={exp.status}
                      onChange={(e) => handleToggleStatus(exp.id, e.target.value as any)}
                      className={`rounded-full px-3 py-1 text-xs font-bold border outline-none cursor-pointer ${
                        exp.status === "Approved"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : exp.status === "Pending"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-blue-50 text-blue-800 border-blue-200"
                      }`}
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Reimbursed">Reimbursed</option>
                    </select>

                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 text-[#a1a1aa] hover:text-red-600 transition"
                      title="Delete expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* Modal: Record New Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 text-[#18181b] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-none">
            
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#18181b]">Record New Cellar Expense</h3>
                <p className="text-xs text-[#71717a] mt-0.5">Submit operational expenditure for manager auditing</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f3] text-[#71717a] hover:bg-[#e4e4e7] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-[#18181b] block">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. VIP Courier Fuel Allowance"
                  className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs font-semibold text-[#18181b] outline-none focus:border-[#b8860b] shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#18181b] block">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-3 text-xs font-semibold text-[#18181b] outline-none focus:border-[#b8860b] shadow-2xs"
                  >
                    <option value="Operations & Maintenance">Operations & Maintenance</option>
                    <option value="Logistics & Delivery">Logistics & Delivery</option>
                    <option value="Packaging & Boxes">Packaging & Boxes</option>
                    <option value="Staff Allowances">Staff Allowances</option>
                    <option value="Utilities & Internet">Utilities & Internet</option>
                    <option value="Tasting & Events">Tasting & Events</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#18181b] block">Amount (UGX Shs) *</label>
                  <input
                    type="number"
                    required
                    value={amountUGX}
                    onChange={(e) => setAmountUGX(e.target.value)}
                    placeholder="500000"
                    className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-sm font-sans font-bold text-[#18181b] outline-none focus:border-[#b8860b] shadow-2xs"
                  />
                  {amountUGX && (
                    <span className="text-[10px] font-sans font-bold text-[#b8860b]">
                      USD: ~${(Number(amountUGX) / 3700).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#18181b] block">Recorded By (Employee) *</label>
                  <select
                    value={recordedBy}
                    onChange={(e) => setRecordedBy(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-3 text-xs font-semibold text-[#18181b] outline-none focus:border-[#b8860b] shadow-2xs"
                  >
                    <option value="Jessin Sam (Store Manager)">Jessin Sam (Store Manager)</option>
                    <option value="Isaac Kato (Cellar Master)">Isaac Kato (Cellar Master)</option>
                    <option value="Brenda Namuli (Inventory)">Brenda Namuli (Inventory)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#18181b] block">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-3 text-xs font-semibold text-[#18181b] outline-none focus:border-[#b8860b] shadow-2xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Visa Card">Visa Card</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#18181b] block">Voucher / Receipt Reference</label>
                <input
                  type="text"
                  value={voucherNumber}
                  onChange={(e) => setVoucherNumber(e.target.value)}
                  placeholder="e.g. VCH-9941"
                  className="w-full h-11 rounded-2xl border border-[#e5e5e4] bg-white px-4 text-xs font-mono font-semibold text-[#18181b] outline-none focus:border-[#b8860b] shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#18181b] block">Auditing Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional context about the expenditure..."
                  className="w-full rounded-2xl border border-[#e5e5e4] bg-white p-3 text-xs text-[#18181b] outline-none focus:border-[#b8860b] shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full bg-[#f4f4f3] hover:bg-[#e4e4e7] px-5 py-2.5 text-xs font-bold text-[#52525b] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#b8860b] hover:bg-[#996515] px-6 py-2.5 text-xs font-bold text-white transition shadow-sm"
                >
                  Save & Log Expense
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

