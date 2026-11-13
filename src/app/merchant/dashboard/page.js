"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Store, Users, Clock, CheckCircle2, AlertCircle, Play, Pause, 
  Power, ArrowRight, UserPlus, Phone, Volume2, VolumeX, QrCode, Printer, 
  Sparkles, RefreshCw, ChevronRight, X, UserCheck, ShieldCheck, Ticket, MessageCircle, MapPin,
  LogOut, PlusCircle, Lock, Megaphone, BarChart3, TrendingUp, Calendar, Download, Flame, Zap, Award, FileSpreadsheet,
  Search, Filter, IndianRupee, Receipt, CreditCard, Banknote, FileText, Check, Plus,
  Coffee, Utensils, Timer, Gauge, SlidersHorizontal, AlertTriangle, PlayCircle, PauseCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OfficialBrandLogo from '@/components/OfficialBrandLogo';

export default function MerchantDashboardPage() {
  // Authorization Gate State
  const [isAuthorized, setIsAuthorized] = useState(null); // null = checking, true = authorized, false = blocked
  const [currentUserRole, setCurrentUserRole] = useState('GUEST');

  // Merchant Shop State
  const [activeShop, setActiveShop] = useState(null);
  const [shopStatus, setShopStatus] = useState('OPEN'); // OPEN, PAUSED, CLOSED

  // Live Queue State
  const [servingToken, setServingToken] = useState(null);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [absentList, setAbsentList] = useState([]);
  const [counterSeconds, setCounterSeconds] = useState(145); // simulated timer elapsed

  // Walk-in Customer Modal
  const [walkinModalOpen, setWalkinModalOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinGroupSize, setWalkinGroupSize] = useState(1);
  const [tokenGenerationMode, setTokenGenerationMode] = useState('INDIVIDUAL'); // 'INDIVIDUAL' | 'GROUP'
  const [walkinService, setWalkinService] = useState('General Service');

  // QR Poster Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Sound chime notification toggle
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [announcementMsg, setAnnouncementMsg] = useState('');

  // View Tab: COUNTER | ANALYTICS
  const [activeTab, setActiveTab] = useState('COUNTER');
  const [analyticsDateRange, setAnalyticsDateRange] = useState('TODAY'); // 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH'

  // Service Billing & Hisaab Modal State (Optional post-service accounting)
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [billServices, setBillServices] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billPaymentMode, setBillPaymentMode] = useState('CASH'); // 'CASH' | 'UPI' | 'PENDING'
  const [billNotes, setBillNotes] = useState('');

  // Persistent Real Records for Analytics & Customer Logs
  const [shopRecords, setShopRecords] = useState([]);
  const [customerTableSearch, setCustomerTableSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('ALL'); // ALL, COMPLETED, SERVING, WAITING, NO_SHOW

  // BRD FR-707: Quick Break / Pause Timer State
  const [breakModalOpen, setBreakModalOpen] = useState(false);
  const [breakType, setBreakType] = useState('CUSTOM'); // 'TEA' | 'LUNCH' | 'EXTENDED' | 'CUSTOM' | 'INDEFINITE'
  const [breakTotalSeconds, setBreakTotalSeconds] = useState(0);
  const [breakRemainingSeconds, setBreakRemainingSeconds] = useState(0);
  const [breakReason, setBreakReason] = useState('');
  const [customBreakMinutes, setCustomBreakMinutes] = useState(15);
  const [breakResumeTimeDisplay, setBreakResumeTimeDisplay] = useState('');

  // BRD FR-314: Daily Token Cap Limit State
  const [capModalOpen, setCapModalOpen] = useState(false);
  const [isCapEnabled, setIsCapEnabled] = useState(true);
  const [dailyTokenCap, setDailyTokenCap] = useState(50); // Default 50 tokens
  const [tempCapInput, setTempCapInput] = useState(50);

  const getStorageKey = (shop) => `ak_merchant_history_${(shop?.slug || 'shop').toLowerCase()}`;

  const loadShopRecords = (shop) => {
    if (!shop || typeof window === 'undefined') return [];
    try {
      const key = getStorageKey(shop);
      const savedStr = localStorage.getItem(key);
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if parsed already has non-zero amounts
          const hasAmounts = parsed.some(r => r.amount !== undefined && r.amount > 0);
          if (hasAmounts) {
            return parsed;
          }
          // Migrate legacy records to include amount and paymentMode if missing
          const fallbackAmounts = [250, 150, 500, 350, 300, 950, 450, 200, 600, 380];
          const migrated = parsed.map((item, idx) => {
            if (item.status === 'NO_SHOW' || item.status === 'SKIPPED') {
              return { ...item, amount: 0, paymentMode: '-' };
            }
            const amt = item.amount !== undefined && item.amount !== null ? item.amount : fallbackAmounts[idx % fallbackAmounts.length];
            return {
              ...item,
              amount: amt,
              paymentMode: item.paymentMode || (idx % 2 === 0 ? 'UPI' : 'CASH'),
              serviceBreakdown: item.serviceBreakdown || item.service || 'General Service'
            };
          });
          try {
            localStorage.setItem(key, JSON.stringify(migrated));
          } catch(e) {}
          return migrated;
        }
      }
      
      // Initialize realistic historical data for yesterday, 7 days, and monthly
      const prefix = shop.tokenPrefix || 'AK';
      const now = Date.now();
      const oneDay = 86400000;
      const yesterdayDate = new Date(now - oneDay).toISOString().slice(0, 10);
      const twoDaysAgo = new Date(now - 2 * oneDay).toISOString().slice(0, 10);
      const threeDaysAgo = new Date(now - 3 * oneDay).toISOString().slice(0, 10);
      const fourDaysAgo = new Date(now - 4 * oneDay).toISOString().slice(0, 10);
      const fiveDaysAgo = new Date(now - 5 * oneDay).toISOString().slice(0, 10);
      const sixDaysAgo = new Date(now - 6 * oneDay).toISOString().slice(0, 10);
      const tenDaysAgo = new Date(now - 10 * oneDay).toISOString().slice(0, 10);
      const fifteenDaysAgo = new Date(now - 15 * oneDay).toISOString().slice(0, 10);
      const twentyDaysAgo = new Date(now - 20 * oneDay).toISOString().slice(0, 10);
      const twentyEightDaysAgo = new Date(now - 28 * oneDay).toISOString().slice(0, 10);

      const initialHistory = [
        // Yesterday's Real Customer Records (10 AM to 8 PM) - Total: ₹2,950
        {
          id: 'hist-y-1',
          tokenNumber: `${prefix}-001`,
          customerName: 'Amitabh Saxena',
          customerPhone: '9839120011',
          groupSize: 1,
          service: 'Haircut & Styling',
          serviceBreakdown: 'Haircut & Styling',
          amount: 250,
          paymentMode: 'UPI',
          status: 'COMPLETED',
          createdAt: new Date(now - oneDay - 10 * 3600000).toISOString(),
          completedAt: '10:35 AM',
          date: yesterdayDate,
          hour: 10,
          waitMin: 10,
          durationMin: 25
        },
        {
          id: 'hist-y-2',
          tokenNumber: `${prefix}-002`,
          customerName: 'Rohan Gupta',
          customerPhone: '9839443322',
          groupSize: 1,
          service: 'Beard Grooming',
          serviceBreakdown: 'Beard Grooming & Shape',
          amount: 150,
          paymentMode: 'CASH',
          status: 'COMPLETED',
          createdAt: new Date(now - oneDay - 9 * 3600000).toISOString(),
          completedAt: '11:20 AM',
          date: yesterdayDate,
          hour: 11,
          waitMin: 8,
          durationMin: 18
        },
        {
          id: 'hist-y-3',
          tokenNumber: `${prefix}-003`,
          customerName: 'Dr. Ananya Roy',
          customerPhone: '9415098765',
          groupSize: 2,
          service: 'General Consultation',
          serviceBreakdown: 'General Consultation (2 Pax)',
          amount: 500,
          paymentMode: 'UPI',
          status: 'COMPLETED',
          createdAt: new Date(now - oneDay - 8 * 3600000).toISOString(),
          completedAt: '12:45 PM',
          date: yesterdayDate,
          hour: 12,
          waitMin: 14,
          durationMin: 30
        },
        {
          id: 'hist-y-4',
          tokenNumber: `${prefix}-004`,
          customerName: 'Karan Malhotra',
          customerPhone: '9935123456',
          groupSize: 1,
          service: 'Head Massage & Spa',
          serviceBreakdown: 'Head Massage + Herbal Oil',
          amount: 350,
          paymentMode: 'CASH',
          status: 'COMPLETED',
          createdAt: new Date(now - oneDay - 5 * 3600000).toISOString(),
          completedAt: '03:30 PM',
          date: yesterdayDate,
          hour: 15,
          waitMin: 12,
          durationMin: 22
        },
        {
          id: 'hist-y-5',
          tokenNumber: `${prefix}-005`,
          customerName: 'Manish Tiwari',
          customerPhone: '9889776655',
          groupSize: 1,
          service: 'Haircut & Shave',
          serviceBreakdown: 'Haircut + Clean Shave',
          amount: 300,
          paymentMode: 'CASH',
          status: 'COMPLETED',
          createdAt: new Date(now - oneDay - 3 * 3600000).toISOString(),
          completedAt: '05:15 PM',
          date: yesterdayDate,
          hour: 17,
          waitMin: 18,
          durationMin: 24
        },
        {
          id: 'hist-y-6',
          tokenNumber: `${prefix}-006`,
          customerName: 'Vikas Singh',
          customerPhone: '9794112233',
          groupSize: 1,
          service: 'Beard Trim',
          serviceBreakdown: 'Beard Trim',
          amount: 0,
          paymentMode: '-',
          status: 'NO_SHOW',
          createdAt: new Date(now - oneDay - 2 * 3600000).toISOString(),
          completedAt: '06:05 PM',
          date: yesterdayDate,
          hour: 18,
          waitMin: 0,
          durationMin: 0
        },
        {
          id: 'hist-y-7',
          tokenNumber: `${prefix}-007`,
          customerName: 'Suresh Sharma',
          customerPhone: '9838009988',
          groupSize: 3,
          service: 'Family Grooming Session',
          serviceBreakdown: 'Family Grooming (Haircut x3 + Beard)',
          amount: 950,
          paymentMode: 'UPI',
          status: 'COMPLETED',
          createdAt: new Date(now - oneDay - 1 * 3600000).toISOString(),
          completedAt: '07:20 PM',
          date: yesterdayDate,
          hour: 19,
          waitMin: 15,
          durationMin: 45
        },
        {
          id: 'hist-y-8',
          tokenNumber: `${prefix}-008`,
          customerName: 'Neha Agarwal',
          customerPhone: '9450123890',
          groupSize: 1,
          service: 'Hair Styling & Wash',
          serviceBreakdown: 'Hair Styling & Conditioning Wash',
          amount: 450,
          paymentMode: 'UPI',
          status: 'COMPLETED',
          createdAt: new Date(now - oneDay).toISOString(),
          completedAt: '08:15 PM',
          date: yesterdayDate,
          hour: 20,
          waitMin: 10,
          durationMin: 28
        },

        // Earlier records (2 to 7 days ago - Rolling 7 Days)
        {
          id: 'hist-w-1',
          tokenNumber: `${prefix}-W01`,
          customerName: 'Pooja Verma',
          customerPhone: '9839911223',
          groupSize: 1,
          service: 'General Consultation',
          serviceBreakdown: 'General Consultation',
          amount: 500,
          paymentMode: 'UPI',
          status: 'COMPLETED',
          createdAt: new Date(now - 2 * oneDay).toISOString(),
          completedAt: '11:40 AM',
          date: twoDaysAgo,
          hour: 11,
          waitMin: 12,
          durationMin: 20
        },
        {
          id: 'hist-w-2',
          tokenNumber: `${prefix}-W02`,
          customerName: 'Rahul Srivastava',
          customerPhone: '9451122334',
          groupSize: 2,
          service: 'Haircut & Styling',
          serviceBreakdown: 'Haircut x2 + Styling Gel',
          amount: 600,
          paymentMode: 'CASH',
          status: 'COMPLETED',
          createdAt: new Date(now - 2 * oneDay).toISOString(),
          completedAt: '05:30 PM',
          date: twoDaysAgo,
          hour: 17,
          waitMin: 16,
          durationMin: 35
        },
        {
          id: 'hist-w-3',
          tokenNumber: `${prefix}-W03`,
          customerName: 'Gaurav Mishra',
          customerPhone: '9919223344',
          groupSize: 1,
          service: 'Beard Trim & Spa',
          serviceBreakdown: 'Beard Trim + Face Steam',
          amount: 380,
          paymentMode: 'UPI',
          status: 'COMPLETED',
          createdAt: new Date(now - 3 * oneDay).toISOString(),
          completedAt: '04:15 PM',
          date: threeDaysAgo,
          hour: 16,
          waitMin: 10,
          durationMin: 25
        },
        {
          id: 'hist-w-4',
          tokenNumber: `${prefix}-W04`,
          customerName: 'Deepak Shukla',
          customerPhone: '9839334455',
          groupSize: 1,
          service: 'General Consultation',
          serviceBreakdown: 'General Consultation',
          amount: 0,
          paymentMode: '-',
          status: 'NO_SHOW',
          createdAt: new Date(now - 5 * oneDay).toISOString(),
          completedAt: '01:10 PM',
          date: fiveDaysAgo,
          hour: 13,
          waitMin: 0,
          durationMin: 0
        },
        {
          id: 'hist-w-5',
          tokenNumber: `${prefix}-W05`,
          customerName: 'Sunil Chaurasia',
          customerPhone: '9415778899',
          groupSize: 2,
          service: 'Haircut & Shave',
          serviceBreakdown: 'Haircut + D-Tan Pack',
          amount: 850,
          paymentMode: 'UPI',
          status: 'COMPLETED',
          createdAt: new Date(now - 4 * oneDay).toISOString(),
          completedAt: '02:30 PM',
          date: fourDaysAgo,
          hour: 14,
          waitMin: 14,
          durationMin: 32
        },
        {
          id: 'hist-w-6',
          tokenNumber: `${prefix}-W06`,
          customerName: 'Alok Pandey',
          customerPhone: '9839665544',
          groupSize: 1,
          service: 'Head Massage & Spa',
          serviceBreakdown: 'Head Massage 30min',
          amount: 400,
          paymentMode: 'CASH',
          status: 'COMPLETED',
          createdAt: new Date(now - 6 * oneDay).toISOString(),
          completedAt: '06:40 PM',
          date: sixDaysAgo,
          hour: 18,
          waitMin: 12,
          durationMin: 28
        },

        // Earlier records (10 to 28 days ago - Monthly View)
        {
          id: 'hist-m-1',
          tokenNumber: `${prefix}-M01`,
          customerName: 'Praveen Yadav',
          customerPhone: '9838112299',
          groupSize: 2,
          service: 'Family Grooming Session',
          serviceBreakdown: 'Full Family Package (Haircut + Facial)',
          amount: 1450,
          paymentMode: 'UPI',
          status: 'COMPLETED',
          createdAt: new Date(now - 10 * oneDay).toISOString(),
          completedAt: '03:15 PM',
          date: tenDaysAgo,
          hour: 15,
          waitMin: 15,
          durationMin: 50
        },
        {
          id: 'hist-m-2',
          tokenNumber: `${prefix}-M02`,
          customerName: 'Sanjay Rastogi',
          customerPhone: '9450334411',
          groupSize: 1,
          service: 'General Consultation',
          serviceBreakdown: 'General Health Checkup & Prescription',
          amount: 600,
          paymentMode: 'CASH',
          status: 'COMPLETED',
          createdAt: new Date(now - 15 * oneDay).toISOString(),
          completedAt: '12:10 PM',
          date: fifteenDaysAgo,
          hour: 12,
          waitMin: 10,
          durationMin: 20
        },
        {
          id: 'hist-m-3',
          tokenNumber: `${prefix}-M03`,
          customerName: 'Shalini Dixit',
          customerPhone: '9919556677',
          groupSize: 1,
          service: 'Hair Styling & Wash',
          serviceBreakdown: 'Hair Spa & Deep Conditioning',
          amount: 1200,
          paymentMode: 'UPI',
          status: 'COMPLETED',
          createdAt: new Date(now - 20 * oneDay).toISOString(),
          completedAt: '04:50 PM',
          date: twentyDaysAgo,
          hour: 16,
          waitMin: 18,
          durationMin: 45
        },
        {
          id: 'hist-m-4',
          tokenNumber: `${prefix}-M04`,
          customerName: 'Harish Chandra',
          customerPhone: '9839441188',
          groupSize: 1,
          service: 'Haircut & Styling',
          serviceBreakdown: 'Haircut + Beard Styling',
          amount: 450,
          paymentMode: 'CASH',
          status: 'COMPLETED',
          createdAt: new Date(now - 28 * oneDay).toISOString(),
          completedAt: '01:25 PM',
          date: twentyEightDaysAgo,
          hour: 13,
          waitMin: 8,
          durationMin: 22
        }
      ];

      localStorage.setItem(key, JSON.stringify(initialHistory));
      return initialHistory;
    } catch (e) {
      return [];
    }
  };

  const updateRecordInHistory = (shop, updatedRecord) => {
    if (!shop || !updatedRecord) return;
    setShopRecords(prev => {
      const idx = prev.findIndex(r => r.id === updatedRecord.id || (r.tokenNumber && r.tokenNumber === updatedRecord.tokenNumber && r.date === updatedRecord.date));
      let nextRecords;
      if (idx >= 0) {
        nextRecords = [...prev];
        nextRecords[idx] = { ...nextRecords[idx], ...updatedRecord };
      } else {
        nextRecords = [updatedRecord, ...prev];
      }
      try {
        localStorage.setItem(getStorageKey(shop), JSON.stringify(nextRecords));
      } catch (e) {}
      return nextRecords;
    });
  };

  const addRecordsToHistory = (shop, newRecords) => {
    if (!shop || !Array.isArray(newRecords) || newRecords.length === 0) return;
    setShopRecords(prev => {
      const nextRecords = [...newRecords, ...prev];
      try {
        localStorage.setItem(getStorageKey(shop), JSON.stringify(nextRecords));
      } catch (e) {}
      return nextRecords;
    });
  };

  const getFilteredRecords = () => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const thirtyDaysAgo = Date.now() - 30 * 86400000;

    let list = shopRecords.filter(t => {
      const tDate = t.date || (t.createdAt ? t.createdAt.slice(0, 10) : todayStr);
      const tTime = t.createdAt ? Date.parse(t.createdAt) : Date.now();

      if (analyticsDateRange === 'TODAY') {
        return tDate === todayStr;
      }
      if (analyticsDateRange === 'YESTERDAY') {
        return tDate === yesterdayStr;
      }
      if (analyticsDateRange === 'WEEK') {
        return tTime >= sevenDaysAgo;
      }
      if (analyticsDateRange === 'MONTH') {
        return tTime >= thirtyDaysAgo;
      }
      return true;
    });

    // For TODAY, merge live serving & waiting tokens so they are visible in real-time
    if (analyticsDateRange === 'TODAY') {
      const liveTokens = [];
      if (servingToken && !list.some(r => r.tokenNumber === servingToken.tokenNumber)) {
        liveTokens.push({
          id: servingToken.id || `live-${servingToken.tokenNumber}`,
          tokenNumber: servingToken.tokenNumber,
          customerName: servingToken.customerName,
          customerPhone: servingToken.customerPhone || 'Online',
          groupSize: servingToken.groupSize || 1,
          service: servingToken.service || 'General Service',
          status: 'SERVING',
          createdAt: new Date().toISOString(),
          date: todayStr,
          hour: new Date().getHours(),
          waitMin: 0,
          durationMin: Math.max(1, Math.floor(counterSeconds / 60))
        });
      }
      waitingQueue.forEach(w => {
        if (!list.some(r => r.tokenNumber === w.tokenNumber)) {
          liveTokens.push({
            id: w.id || `live-${w.tokenNumber}`,
            tokenNumber: w.tokenNumber,
            customerName: w.customerName,
            customerPhone: w.customerPhone || 'Online',
            groupSize: w.groupSize || 1,
            service: w.service || 'General Service',
            status: 'WAITING',
            createdAt: new Date().toISOString(),
            date: todayStr,
            hour: new Date().getHours(),
            waitMin: w.estWaitMin || 10,
            durationMin: 0
          });
        }
      });
      list = [...liveTokens, ...list];
    }

    return list;
  };

  // Export Daily CSV report with Billing & Hisaab (BRD FR-1203)
  const handleDownloadCsv = () => {
    const recordsToExport = getFilteredRecords();
    const rows = [
      ['Token Number', 'Customer Name', 'Phone', 'Party Size', 'Services Availed', 'Bill Amount (INR)', 'Payment Mode', 'Status', 'Date', 'Time', 'Duration (min)'],
      ...recordsToExport.map(t => [
        t.tokenNumber,
        `"${(t.customerName || 'Customer').replace(/"/g, '""')}"`,
        t.customerPhone || 'Offline',
        t.groupSize || 1,
        `"${(t.serviceBreakdown || t.service || 'General Service').replace(/"/g, '""')}"`,
        t.amount !== undefined ? t.amount : 0,
        `"${t.paymentMode || '-'}"`,
        t.status || 'COMPLETED',
        t.date || (t.createdAt ? t.createdAt.slice(0, 10) : 'Today'),
        t.completedAt || (t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'),
        t.durationMin || (t.duration ? parseInt(t.duration) : 0)
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeShop?.slug || 'shop'}-${analyticsDateRange.toLowerCase()}-hisaab-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setAnnouncementMsg(`📥 Exported ${recordsToExport.length} customer records & bill amounts to CSV.`);
    setTimeout(() => setAnnouncementMsg(''), 4000);
  };

  // Logout from merchant account
  const handleMerchantLogout = () => {
    if (confirm('Are you sure you want to log out from this shop? You can log back in anytime using your registered mobile number.')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ak_active_merchant_shop');
        localStorage.removeItem('ak_role');
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/merchant/register';
      }
    }
  };

  // Sync real customer tokens booked for this specific shop
  const syncCustomerQueueForShop = (shop) => {
    if (!shop || typeof window === 'undefined') return;
    try {
      const allTokensStr = localStorage.getItem('ak_customer_tokens');
      const allTokens = allTokensStr ? JSON.parse(allTokensStr) : [];
      
      const sSlug = (shop.slug || '').toLowerCase();
      const sName = (shop.name || '').toLowerCase();

      // Find real tokens for this shop
      const shopTokens = allTokens.filter(t => {
        const tSlug = (t.shopSlug || '').toLowerCase();
        const tName = (t.shopName || '').toLowerCase();
        return (tSlug && tSlug === sSlug) || (tName && tName === sName);
      });

      // 1. Waiting tokens only (status is 'WAITING' or undefined)
      const waitingOnly = shopTokens.filter(t => t.status === 'WAITING' || !t.status).map((t, index) => ({
        id: t.id || `token-${index}`,
        tokenNumber: t.displayToken || t.tokenNumber || `${shop.tokenPrefix || 'AK'}-${String(index + 1).padStart(3, '0')}`,
        customerName: t.customerName || 'Customer',
        customerPhone: t.customerPhone || 'Online',
        groupSize: t.groupSize || 1,
        service: t.customerPurpose || t.service || 'General Service',
        estWaitMin: (index + 1) * (shop.avgWaitMin || 12),
        waitAhead: index
      }));
      setWaitingQueue(waitingOnly);

      // 2. Currently Serving Token (only if currently marked SERVING)
      const servingItem = shopTokens.find(t => t.status === 'SERVING');
      if (servingItem) {
        setServingToken({
          id: servingItem.id,
          tokenNumber: servingItem.displayToken || servingItem.tokenNumber,
          customerName: servingItem.customerName || 'Customer',
          customerPhone: servingItem.customerPhone || 'Online',
          groupSize: servingItem.groupSize || 1,
          service: servingItem.customerPurpose || servingItem.service || 'General Service'
        });
      }

      // 3. Completed Tokens
      const completedOnly = shopTokens.filter(t => t.status === 'COMPLETED').map(t => ({
        tokenNumber: t.displayToken || t.tokenNumber,
        customerName: t.customerName,
        customerPhone: t.customerPhone,
        groupSize: t.groupSize || 1,
        service: t.customerPurpose || t.service || 'General Service',
        completedAt: t.completedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: t.duration || `${shop.avgWaitMin || 12} min`
      }));
      if (completedOnly.length > 0) {
        setCompletedList(completedOnly);
      }

      // 4. Absent / Skipped Tokens
      const absentOnly = shopTokens.filter(t => t.status === 'NO_SHOW').map(t => ({
        tokenNumber: t.displayToken || t.tokenNumber,
        customerName: t.customerName,
        customerPhone: t.customerPhone,
        groupSize: t.groupSize || 1,
        service: t.customerPurpose || t.service || 'General Service',
        skippedAt: t.skippedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      if (absentOnly.length > 0) {
        setAbsentList(absentOnly);
      }
    } catch (e) {}
  };

  // Initial Load & Strict Role Authorization Check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('ak_role');
      const savedShopStr = localStorage.getItem('ak_active_merchant_shop');
      const savedSound = localStorage.getItem('ak_merchant_sound_enabled');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }
      setCurrentUserRole(role || 'GUEST');

      if (role === 'MERCHANT' && savedShopStr) {
        try {
          const parsed = JSON.parse(savedShopStr);
          setActiveShop(parsed);
          setShopStatus(parsed.status || 'OPEN');
          setIsAuthorized(true);
          syncCustomerQueueForShop(parsed);
          const recs = loadShopRecords(parsed);
          setShopRecords(recs);

          // Load Daily Token Cap (BRD FR-314)
          try {
            const capKey = `ak_merchant_cap_${(parsed.slug || 'shop').toLowerCase()}`;
            const savedCapStr = localStorage.getItem(capKey);
            if (savedCapStr) {
              const capObj = JSON.parse(savedCapStr);
              if (capObj.cap !== undefined) setDailyTokenCap(Number(capObj.cap));
              if (capObj.enabled !== undefined) setIsCapEnabled(Boolean(capObj.enabled));
              setTempCapInput(Number(capObj.cap || 50));
            }
          } catch (e) {}

          // Load Active Break if any (BRD FR-707)
          try {
            const breakKey = `ak_shop_break_${(parsed.slug || 'shop').toLowerCase()}`;
            const savedBreakStr = localStorage.getItem(breakKey);
            if (savedBreakStr) {
              const breakObj = JSON.parse(savedBreakStr);
              if (breakObj.active) {
                const nowMs = Date.now();
                if (breakObj.resumeTimestamp && breakObj.resumeTimestamp > nowMs) {
                  const remSec = Math.round((breakObj.resumeTimestamp - nowMs) / 1000);
                  setBreakRemainingSeconds(remSec);
                  setBreakTotalSeconds(breakObj.totalSeconds || remSec);
                  setBreakReason(breakObj.reason || 'Break in Progress');
                  setBreakType(breakObj.type || 'CUSTOM');
                  setBreakResumeTimeDisplay(breakObj.resumeTimeDisplay || '');
                  setShopStatus('PAUSED');
                } else if (!breakObj.resumeTimestamp && breakObj.type === 'INDEFINITE') {
                  setBreakReason(breakObj.reason || 'Counter paused indefinitely');
                  setBreakType('INDEFINITE');
                  setShopStatus('PAUSED');
                } else {
                  localStorage.removeItem(breakKey);
                }
              }
            }
          } catch (e) {}
        } catch (e) {
          setIsAuthorized(false);
        }
      } else {
        // Explicitly reject if role is not MERCHANT
        setIsAuthorized(false);
      }
    }

    // Start with 0 / Clean Queue (Shopkeeper does not generate tokens for self)
    setServingToken(null);
    setCompletedList([]);
    setAbsentList([]);
  }, []);

  // Listen to storage events so when a real customer takes a token, it appears in real-time
  useEffect(() => {
    const handleStorageUpdate = () => {
      if (activeShop) {
        syncCustomerQueueForShop(activeShop);
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, [activeShop]);

  // Counter Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCounterSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Countdown Timer for Quick Break (BRD FR-707)
  useEffect(() => {
    if (breakRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setBreakRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShopStatus('OPEN');
          if (activeShop) {
            const breakKey = `ak_shop_break_${(activeShop.slug || 'shop').toLowerCase()}`;
            try {
              localStorage.removeItem(breakKey);
              window.dispatchEvent(new Event('storage'));
            } catch (e) {}
          }
          playChime();
          setAnnouncementMsg('🔔 Break over! Counter is now OPEN for serving.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breakRemainingSeconds, activeShop]);

  // Break Handlers (BRD FR-707)
  const handleStartBreak = (type, minutes, reason) => {
    const totalSec = minutes * 60;
    const now = new Date();
    const resumeDate = minutes > 0 ? new Date(now.getTime() + totalSec * 1000) : null;
    const resumeDisplay = resumeDate ? resumeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Manual Resume';

    setBreakType(type);
    setBreakTotalSeconds(totalSec);
    setBreakRemainingSeconds(totalSec);
    setBreakReason(reason || (type === 'TEA' ? 'Tea Break' : type === 'LUNCH' ? 'Lunch Break' : 'Rest Break'));
    setBreakResumeTimeDisplay(resumeDisplay);
    setShopStatus('PAUSED');
    setBreakModalOpen(false);

    if (activeShop) {
      const breakKey = `ak_shop_break_${(activeShop.slug || 'shop').toLowerCase()}`;
      try {
        localStorage.setItem(breakKey, JSON.stringify({
          active: true,
          type,
          reason: reason || (type === 'TEA' ? 'Tea Break' : type === 'LUNCH' ? 'Lunch Break' : 'Rest Break'),
          totalSeconds: totalSec,
          resumeTimestamp: resumeDate ? resumeDate.getTime() : null,
          resumeTimeDisplay: resumeDisplay,
          startedAt: now.toISOString()
        }));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    }
  };

  const handleEndBreak = () => {
    setBreakRemainingSeconds(0);
    setBreakTotalSeconds(0);
    setBreakReason('');
    setBreakResumeTimeDisplay('');
    setShopStatus('OPEN');

    if (activeShop) {
      const breakKey = `ak_shop_break_${(activeShop.slug || 'shop').toLowerCase()}`;
      try {
        localStorage.removeItem(breakKey);
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    }
    playChime();
    setAnnouncementMsg('Counter resumed to OPEN status.');
  };

  // Daily Token Cap Limit Handlers (BRD FR-314)
  const handleSaveCap = (newCap, enabled) => {
    const validCap = Math.max(5, Number(newCap) || 50);
    setDailyTokenCap(validCap);
    setIsCapEnabled(enabled);
    setCapModalOpen(false);

    if (activeShop) {
      const capKey = `ak_merchant_cap_${(activeShop.slug || 'shop').toLowerCase()}`;
      try {
        localStorage.setItem(capKey, JSON.stringify({
          cap: validCap,
          enabled: Boolean(enabled),
          updatedAt: new Date().toISOString()
        }));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    }
    setAnnouncementMsg(`Daily capacity cap updated to ${validCap} tokens (${enabled ? 'Active' : 'Disabled'}).`);
  };

  const handleQuickExpandCap = (addTokens = 10) => {
    const nextCap = dailyTokenCap + addTokens;
    handleSaveCap(nextCap, true);
  };

  // Play browser chime
  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  // Voice Announcement using Web Speech API
  const speakAnnouncement = (tokenNum, name) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const text = `Token ${tokenNum}. ${name || 'Customer'}, please proceed to the service counter.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Toggle Voice & Chime Sound with persistence & feedback
  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ak_merchant_sound_enabled', String(nextVal));
    }
    if (nextVal) {
      playChime();
      setAnnouncementMsg('🔊 Voice Calling & Chime Unmuted (Active)');
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setAnnouncementMsg('🔇 Voice Calling & Chime Muted (Quiet Mode)');
    }
    setTimeout(() => setAnnouncementMsg(''), 3500);
  };

  // Re-announce current serving token
  const handleRepeatCall = () => {
    if (!servingToken) return;
    if (!soundEnabled) {
      setAnnouncementMsg('⚠️ Audio is currently MUTED. Click the Voice button in the header to Unmute.');
      setTimeout(() => setAnnouncementMsg(''), 4000);
      return;
    }
    playChime();
    speakAnnouncement(servingToken.tokenNumber, servingToken.customerName);
    setAnnouncementMsg(`📢 Re-calling: Token ${servingToken.tokenNumber} (${servingToken.customerName})`);
    setTimeout(() => setAnnouncementMsg(''), 3500);
  };

  // Sync token state changes with customer localStorage
  const syncWithCustomerStorage = (nextServing, prevCompleted, nextAbsent, billDetails) => {
    if (typeof window === 'undefined') return;
    try {
      const storedStr = localStorage.getItem('ak_customer_tokens');
      if (storedStr) {
        const list = JSON.parse(storedStr);
        if (Array.isArray(list)) {
          const updated = list.map(t => {
            const tokenIdentifier = t.displayToken || t.tokenNumber;
            if (nextServing && (tokenIdentifier === nextServing.tokenNumber)) {
              return { ...t, status: 'SERVING', peopleAhead: 0, estimatedWaitMin: 0 };
            }
            if (prevCompleted && (tokenIdentifier === prevCompleted.tokenNumber)) {
              return { 
                ...t, 
                status: 'COMPLETED',
                completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                duration: `${Math.max(1, Math.floor(counterSeconds / 60))} min`,
                amount: billDetails?.amount !== undefined ? billDetails.amount : (t.amount || 0),
                paymentMode: billDetails?.paymentMode || t.paymentMode || '-',
                serviceDetails: billDetails?.serviceDetails || t.customerPurpose || t.service
              };
            }
            if (nextAbsent && (tokenIdentifier === nextAbsent.tokenNumber)) {
              return { 
                ...t, 
                status: 'NO_SHOW',
                skippedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            }
            return t;
          });
          localStorage.setItem('ak_customer_tokens', JSON.stringify(updated));
        }
      }
    } catch (e) {}
  };

  // Action: Call Next Token
  const handleCallNext = () => {
    if (waitingQueue.length === 0) {
      alert('No more customers currently waiting in the queue.');
      return;
    }

    playChime();

    // Mark current serving as completed if one was active
    const prevServing = servingToken;
    const todayDate = new Date().toISOString().slice(0, 10);
    const durationMins = Math.max(1, Math.floor(counterSeconds / 60));

    if (servingToken) {
      setCompletedList(prev => [
        {
          tokenNumber: servingToken.tokenNumber,
          customerName: servingToken.customerName,
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: `${durationMins} min`,
          amount: 0,
          paymentMode: '-',
          service: servingToken.service || 'General Service'
        },
        ...prev
      ]);

      updateRecordInHistory(activeShop, {
        id: servingToken.id || `token-${servingToken.tokenNumber}`,
        tokenNumber: servingToken.tokenNumber,
        customerName: servingToken.customerName,
        customerPhone: servingToken.customerPhone || 'Offline',
        groupSize: servingToken.groupSize || 1,
        service: servingToken.service || 'General Service',
        date: todayDate,
        hour: new Date().getHours(),
        status: 'COMPLETED',
        completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationMin: durationMins,
        amount: 0,
        paymentMode: '-'
      });
    }

    // Pop first from waiting queue
    const nextToken = waitingQueue[0];
    const remaining = waitingQueue.slice(1).map((item, idx) => ({
      ...item,
      waitAhead: idx + 1,
      estWaitMin: (idx + 1) * (activeShop?.avgWaitMin || 12)
    }));

    setServingToken(nextToken);
    setWaitingQueue(remaining);
    setCounterSeconds(0);

    updateRecordInHistory(activeShop, {
      id: nextToken.id || `token-${nextToken.tokenNumber}`,
      tokenNumber: nextToken.tokenNumber,
      customerName: nextToken.customerName,
      customerPhone: nextToken.customerPhone || 'Offline',
      groupSize: nextToken.groupSize || 1,
      service: nextToken.service || 'General Service',
      date: todayDate,
      hour: new Date().getHours(),
      status: 'SERVING',
      waitMin: nextToken.estWaitMin || 0
    });

    // Announce via speech
    speakAnnouncement(nextToken.tokenNumber, nextToken.customerName);

    // Sync with customer storage
    syncWithCustomerStorage(nextToken, prevServing);

    setAnnouncementMsg(`Now Calling: Token ${nextToken.tokenNumber} (${nextToken.customerName})`);
    setTimeout(() => setAnnouncementMsg(''), 4500);
  };

  // Action: Open Service Billing / Hisaab Modal
  const handleOpenBillingModal = () => {
    if (!servingToken) return;
    setBillServices(servingToken.service || 'General Service');
    setBillAmount('');
    setBillPaymentMode('CASH');
    setBillNotes('');
    setBillingModalOpen(true);
  };

  // Action: Finalize Service (With Bill Amount or Optional Skip)
  const handleFinalizeService = ({ skipBilling = false } = {}) => {
    if (!servingToken) return;

    const durationMins = Math.max(1, Math.floor(counterSeconds / 60));
    const todayDate = new Date().toISOString().slice(0, 10);
    const finalAmount = skipBilling ? 0 : (Number(billAmount) || 0);
    const finalPayment = skipBilling ? '-' : (finalAmount > 0 ? billPaymentMode : '-');
    const finalServices = billServices.trim() || servingToken.service || 'General Service';
    const finalNotes = billNotes.trim();

    // Sync with customer storage
    syncWithCustomerStorage(null, servingToken, null, {
      amount: finalAmount,
      paymentMode: finalPayment,
      serviceDetails: finalServices
    });

    const completedRecord = {
      tokenNumber: servingToken.tokenNumber,
      customerName: servingToken.customerName,
      customerPhone: servingToken.customerPhone || 'Offline',
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: `${durationMins} min`,
      amount: finalAmount,
      paymentMode: finalPayment,
      service: finalServices,
      serviceBreakdown: finalServices,
      billNotes: finalNotes
    };

    setCompletedList(prev => [completedRecord, ...prev]);

    updateRecordInHistory(activeShop, {
      id: servingToken.id || `token-${servingToken.tokenNumber}`,
      tokenNumber: servingToken.tokenNumber,
      customerName: servingToken.customerName,
      customerPhone: servingToken.customerPhone || 'Offline',
      groupSize: servingToken.groupSize || 1,
      service: finalServices,
      serviceBreakdown: finalServices,
      date: todayDate,
      hour: new Date().getHours(),
      status: 'COMPLETED',
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMin: durationMins,
      amount: finalAmount,
      paymentMode: finalPayment,
      billNotes: finalNotes
    });

    setServingToken(null);
    setCounterSeconds(0);
    setBillingModalOpen(false);

    if (finalAmount > 0) {
      setAnnouncementMsg(`✅ Recorded: ${servingToken.customerName} (${servingToken.tokenNumber}). Total: ₹${finalAmount.toLocaleString('en-IN')} [${finalPayment}]`);
    } else {
      setAnnouncementMsg(`✅ Marked Completed: ${servingToken.customerName} (${servingToken.tokenNumber})`);
    }
    setTimeout(() => setAnnouncementMsg(''), 4500);
  };

  // Action: Mark Absent / Skip
  const handleMarkAbsent = () => {
    if (!servingToken) return;
    const todayDate = new Date().toISOString().slice(0, 10);

    setAbsentList(prev => [
      {
        ...servingToken,
        skippedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);

    updateRecordInHistory(activeShop, {
      id: servingToken.id || `token-${servingToken.tokenNumber}`,
      tokenNumber: servingToken.tokenNumber,
      customerName: servingToken.customerName,
      customerPhone: servingToken.customerPhone || 'Offline',
      groupSize: servingToken.groupSize || 1,
      service: servingToken.service || 'General Service',
      date: todayDate,
      hour: new Date().getHours(),
      status: 'NO_SHOW',
      skippedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMin: 0
    });

    syncWithCustomerStorage(null, null, servingToken);

    // Advance to next if available
    if (waitingQueue.length > 0) {
      handleCallNext();
    } else {
      setServingToken(null);
      setCounterSeconds(0);
    }
  };

  // Action: Re-call absent customer
  const handleRecallAbsent = (absentItem) => {
    setAbsentList(prev => prev.filter(a => a.tokenNumber !== absentItem.tokenNumber));
    setWaitingQueue(prev => [absentItem, ...prev]);
  };

  // Action: Add Walk-in Token
  const handleAddWalkin = (e) => {
    e.preventDefault();
    const prefix = activeShop?.tokenPrefix || 'AK';
    const count = Number(walkinGroupSize) || 1;
    const baseName = walkinName.trim() || 'Walk-in Guest';
    const basePhone = walkinPhone.trim() || 'Offline';
    const baseService = walkinService.trim() || 'General Service';
    const currentQueueCount = waitingQueue.length + (servingToken ? 1 : 0);
    const startNum = completedList.length + currentQueueCount + 22;

    const nowIso = new Date().toISOString();
    const todayDate = nowIso.slice(0, 10);
    const currentHour = new Date().getHours();

    if (tokenGenerationMode === 'INDIVIDUAL' && count > 1) {
      // Generate multiple individual consecutive tokens
      const newTokens = [];
      for (let i = 0; i < count; i++) {
        const tokenNum = `${prefix}-${(startNum + i).toString().padStart(3, '0')}`;
        newTokens.push({
          id: `walkin-${Date.now()}-${i}`,
          tokenNumber: tokenNum,
          customerName: `${baseName} (#${i + 1}/${count})`,
          customerPhone: basePhone,
          groupSize: 1,
          totalGroupSize: count,
          groupIndex: i + 1,
          service: baseService,
          status: 'WAITING',
          createdAt: nowIso,
          date: todayDate,
          hour: currentHour,
          estWaitMin: (currentQueueCount + i) * (activeShop?.avgWaitMin || 12),
          waitAhead: currentQueueCount + i,
          waitMin: (currentQueueCount + i) * (activeShop?.avgWaitMin || 12),
          durationMin: 0
        });
      }
      setWaitingQueue(prev => [...prev, ...newTokens]);
      addRecordsToHistory(activeShop, newTokens);

      // Persist walk-in tokens in ak_customer_tokens so queue state is unified
      try {
        const storedStr = localStorage.getItem('ak_customer_tokens');
        const currentTokens = storedStr ? JSON.parse(storedStr) : [];
        const walkinEntries = newTokens.map(tok => ({
          id: tok.id,
          shopSlug: activeShop?.slug,
          shopName: activeShop?.name,
          displayToken: tok.tokenNumber,
          tokenNumber: tok.tokenNumber,
          customerName: tok.customerName,
          customerPhone: tok.customerPhone,
          groupSize: tok.groupSize,
          customerPurpose: tok.service,
          status: 'WAITING',
          createdAt: nowIso
        }));
        localStorage.setItem('ak_customer_tokens', JSON.stringify([...currentTokens, ...walkinEntries]));
      } catch (e) {}

      const firstToken = newTokens[0].tokenNumber;
      const lastToken = newTokens[newTokens.length - 1].tokenNumber;
      setAnnouncementMsg(`✅ Generated ${count} Consecutive Tokens: ${firstToken} to ${lastToken}`);
    } else {
      // Single token for the group
      const formattedToken = `${prefix}-${startNum.toString().padStart(3, '0')}`;
      const newWalkin = {
        id: `walkin-${Date.now()}`,
        tokenNumber: formattedToken,
        customerName: count > 1 ? `${baseName} (Party of ${count})` : baseName,
        customerPhone: basePhone,
        groupSize: count,
        service: baseService,
        status: 'WAITING',
        createdAt: nowIso,
        date: todayDate,
        hour: currentHour,
        estWaitMin: currentQueueCount * (activeShop?.avgWaitMin || 12),
        waitAhead: currentQueueCount,
        waitMin: currentQueueCount * (activeShop?.avgWaitMin || 12),
        durationMin: 0
      };
      setWaitingQueue(prev => [...prev, newWalkin]);
      addRecordsToHistory(activeShop, [newWalkin]);

      try {
        const storedStr = localStorage.getItem('ak_customer_tokens');
        const currentTokens = storedStr ? JSON.parse(storedStr) : [];
        const walkinEntry = {
          id: newWalkin.id,
          shopSlug: activeShop?.slug,
          shopName: activeShop?.name,
          displayToken: newWalkin.tokenNumber,
          tokenNumber: newWalkin.tokenNumber,
          customerName: newWalkin.customerName,
          customerPhone: newWalkin.customerPhone,
          groupSize: newWalkin.groupSize,
          customerPurpose: newWalkin.service,
          status: 'WAITING',
          createdAt: nowIso
        };
        localStorage.setItem('ak_customer_tokens', JSON.stringify([...currentTokens, walkinEntry]));
      } catch (e) {}

      setAnnouncementMsg(`✅ Walk-in Token Generated: ${formattedToken} ${count > 1 ? `(Party of ${count})` : ''}`);
    }

    setWalkinModalOpen(false);
    setWalkinName('');
    setWalkinPhone('');
    setWalkinGroupSize(1);
    setTokenGenerationMode('INDIVIDUAL');

    setTimeout(() => setAnnouncementMsg(''), 4500);
  };

  // 1. Loading State
  if (isAuthorized === null) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#176B65] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#283B3D]/60">Verifying Shopkeeper Authorization...</span>
      </div>
    );
  }

  // 2. Access Restricted (Not logged in as Shopkeeper)
  if (isAuthorized === false) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#DCE9E3] shadow-xl text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-3xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center mx-auto shadow-xs border border-[#176B65]/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              Shopkeeper Console Restricted
            </span>
            <h2 className="text-2xl font-black text-[#283B3D]">
              Shopkeeper Login Required
            </h2>
            <p className="text-xs text-[#283B3D]/70 font-medium leading-relaxed">
              {currentUserRole === 'CUSTOMER'
                ? "You are currently signed in as a Customer. The live merchant operations station is exclusively reserved for verified shop owners to call counters and manage queues."
                : "This live operations console is only accessible to verified shopkeepers. Please log in or register your shop to access your counter station."
              }
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/merchant/register"
              className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#135954] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Store className="w-4 h-4 text-[#F2A15A]" />
              <span>Log In as Shopkeeper</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="w-full py-3 rounded-2xl border border-[#DCE9E3] hover:bg-slate-50 text-[#283B3D] font-bold text-xs transition-all flex items-center justify-center cursor-pointer"
            >
              Back to Customer Explore
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate daily capacity numbers (BRD FR-314)
  const todayCompletedCount = completedList.length + shopRecords.filter(r => r.date === new Date().toISOString().slice(0, 10) && r.status === 'COMPLETED').length;
  const todayIssuedCount = todayCompletedCount + waitingQueue.length + (servingToken ? 1 : 0);
  const capPercent = dailyTokenCap > 0 ? Math.round((todayIssuedCount / dailyTokenCap) * 100) : 0;
  const isCapReached = isCapEnabled && todayIssuedCount >= dailyTokenCap;
  const tokensRemainingToday = Math.max(0, dailyTokenCap - todayIssuedCount);

  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 pt-4">
      
      {/* ========================================================= */}
      {/* TOP BAR: SHOP DETAILS & STATUS SWITCH                     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DCE9E3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Shop Name & Zone Info */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center font-bold text-lg shrink-0 border border-[#176B65]/20">
            <Store className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#283B3D]">
                {activeShop?.name || 'Royal Barber & Hair Style'}
              </h1>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#DCE9E3] text-[#176B65]">
                {activeShop?.categoryName || 'Salon & Barber'}
              </span>
            </div>

            <p className="text-xs text-[#283B3D]/70 font-medium flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#F2A15A]" />
              <span>{activeShop?.zone || 'Indira Nagar'}, Lucknow</span>
              <span>•</span>
              <span className="text-slate-400">Prefix: {activeShop?.tokenPrefix || 'AK'}</span>
            </p>
          </div>
        </div>

        {/* Counter Controls: Sound, QR Poster, Status Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Sound Announcement Toggle (Mute / Unmute) */}
          <button
            type="button"
            onClick={toggleSound}
            className={`px-3 py-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 font-bold text-xs shadow-2xs active:scale-95 ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
            title={soundEnabled ? 'Click to Mute Voice Announcements & Chime' : 'Click to Unmute Voice Announcements & Chime'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="hidden sm:inline">Voice: On</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping hidden sm:inline-block" />
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Voice: Muted</span>
                <span className="text-[10px] font-black uppercase text-rose-600 bg-white px-1.5 py-0.5 rounded-md border border-rose-200">Muted</span>
              </>
            )}
          </button>

          {/* QR Poster Button */}
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/40 text-xs font-bold text-[#283B3D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <QrCode className="w-4 h-4 text-[#176B65]" />
            <span>Counter QR Pass</span>
          </button>

          {/* Shop Status Switch (OPEN / PAUSED / CLOSED) with Smart Break Timer (FR-707) */}
          <div className="flex items-center bg-[#F3F1E9] p-1 rounded-2xl border border-[#DCE9E3]">
            <button
              type="button"
              onClick={() => {
                if (breakRemainingSeconds > 0 || shopStatus === 'PAUSED') {
                  handleEndBreak();
                } else {
                  setShopStatus('OPEN');
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                shopStatus === 'OPEN' ? 'bg-emerald-600 text-white shadow-xs' : 'text-[#283B3D]/70 hover:text-[#283B3D]'
              }`}
            >
              ● Open
            </button>
            <button
              type="button"
              onClick={() => setBreakModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                shopStatus === 'PAUSED' ? 'bg-amber-600 text-white shadow-xs animate-pulse' : 'text-[#283B3D]/70 hover:text-[#283B3D]'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>
                {breakRemainingSeconds > 0 
                  ? `Break: ${formatTimer(breakRemainingSeconds)}` 
                  : shopStatus === 'PAUSED' ? 'Paused' : 'Break / Pause'
                }
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (breakRemainingSeconds > 0) handleEndBreak();
                setShopStatus('CLOSED');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                shopStatus === 'CLOSED' ? 'bg-rose-600 text-white shadow-xs' : 'text-[#283B3D]/70 hover:text-[#283B3D]'
              }`}
            >
              Closed
            </button>
          </div>

          {/* Shop Switch / Add Shop / Logout Menu */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#DCE9E3]">
            <Link
              href="/merchant/register?new=true"
              className="p-2.5 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/40 text-xs font-bold text-[#283B3D] transition-colors cursor-pointer"
              title="Register another shop branch"
            >
              <PlusCircle className="w-4 h-4 text-[#176B65]" />
            </Link>
            <button
              type="button"
              onClick={handleMerchantLogout}
              className="p-2.5 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-rose-50 hover:border-rose-200 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              title="Log out from shop"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Real-time Announcement Banner */}
      <AnimatePresence>
        {announcementMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-[#176B65] text-white font-bold text-xs flex items-center justify-between shadow-md"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F2A15A] animate-pulse" />
              <span>{announcementMsg}</span>
            </div>
            <button onClick={() => setAnnouncementMsg('')} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Smart Break / Pause Banner (BRD FR-707) */}
      <AnimatePresence>
        {(shopStatus === 'PAUSED' || breakRemainingSeconds > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-2 border-amber-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Coffee className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-wider font-black bg-white/20 px-2.5 py-0.5 rounded-md">
                    Queue Paused • {breakReason || 'Break in Progress'}
                  </span>
                  {breakRemainingSeconds > 0 ? (
                    <span className="text-xs font-mono font-black bg-black/40 px-2.5 py-0.5 rounded-md text-amber-200">
                      ⏳ {formatTimer(breakRemainingSeconds)} remaining
                    </span>
                  ) : (
                    <span className="text-xs font-bold bg-black/30 px-2 py-0.5 rounded-md text-amber-100">
                      Indefinite Pause
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-100 font-semibold mt-1">
                  Customer pass screens are displaying: &ldquo;{breakReason || 'Counter paused'}&rdquo;.
                  {breakResumeTimeDisplay ? ` Auto-resume set for ~${breakResumeTimeDisplay}.` : ' Ready to resume anytime.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setBreakModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer border border-white/20 text-center"
              >
                Change Break
              </button>
              <button
                type="button"
                onClick={handleEndBreak}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-amber-900 hover:bg-amber-100 text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <PlayCircle className="w-4 h-4 text-emerald-700" />
                <span>Resume Now</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* SECTION TABS: LIVE COUNTER vs DAILY ANALYTICS (BRD FR-710) */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-3xl border border-[#DCE9E3] shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('COUNTER')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'COUNTER'
                ? 'bg-[#176B65] text-white shadow-md'
                : 'text-[#283B3D]/70 hover:bg-[#DCE9E3]/40'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Live Counter Station</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'COUNTER' ? 'bg-white/20 text-white' : 'bg-[#DCE9E3] text-[#176B65]'
            }`}>
              {waitingQueue.length} Waiting
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ANALYTICS'
                ? 'bg-[#176B65] text-white shadow-md'
                : 'text-[#283B3D]/70 hover:bg-[#DCE9E3]/40'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Daily Analytics & Reports</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#F2A15A]/20 text-[#D97706] hidden sm:inline-block">
              BRD FR-710
            </span>
          </button>
        </div>

        {/* Quick status pill on tab right */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#283B3D]/70 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Station Active: {activeShop?.name || 'Local Shop'}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LIVE COUNTER CALLING STATION                      */}
      {/* ========================================================= */}
      {activeTab === 'COUNTER' && (
        <div className="space-y-6">
          {/* KEY METRICS SUMMARY */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="urban-card rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">In Queue Now</span>
              <div className="text-2xl sm:text-3xl font-token font-bold text-[#176B65]">
                {waitingQueue.length}
              </div>
              <span className="text-[11px] text-[#283B3D]/70 font-semibold block">Customers Waiting</span>
            </div>

            <div className="urban-card rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Served Today</span>
              <div className="text-2xl sm:text-3xl font-token font-bold text-[#283B3D]">
                {completedList.length + shopRecords.filter(r => r.date === new Date().toISOString().slice(0, 10) && r.status === 'COMPLETED').length}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block">Completed Visits</span>
            </div>

            <div className="urban-card rounded-2xl p-4 space-y-1 bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-emerald-700" />
                <span>Today's Hisaab</span>
              </span>
              <div className="text-2xl sm:text-3xl font-token font-bold text-emerald-700">
                ₹{(
                  completedList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) +
                  shopRecords.filter(r => (r.date === new Date().toISOString().slice(0, 10)) && r.status === 'COMPLETED').reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                ).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block">Live Earnings Today</span>
            </div>

            <div className="urban-card rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Avg Service Time</span>
              <div className="text-2xl sm:text-3xl font-token font-bold text-[#F2A15A]">
                ~{activeShop?.avgWaitMin || 12}m
              </div>
              <span className="text-[11px] text-[#283B3D]/70 font-semibold block">Per Customer Pace</span>
            </div>

            <div className="urban-card rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Skipped / Absent</span>
              <div className="text-2xl sm:text-3xl font-token font-bold text-amber-600">
                {absentList.length}
              </div>
              <span className="text-[11px] text-[#283B3D]/70 font-semibold block">Recalled if returned</span>
            </div>
          </div>

          {/* DAILY QUEUE CAPACITY & TOKEN CAP BAR (BRD FR-314) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#DCE9E3] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isCapReached ? 'bg-rose-100 text-rose-700' : capPercent >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-[#176B65]'
                }`}>
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-[#283B3D]">Daily Token Capacity Limit</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#176B65]/10 text-[#176B65]">
                      BRD FR-314
                    </span>
                    {isCapEnabled ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isCapReached 
                          ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {isCapReached ? '● CAP FULL' : '● ACTIVE'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        Unlimited (Disabled)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#283B3D]/70 font-semibold mt-0.5">
                    {isCapEnabled ? (
                      <>
                        <span className="font-black text-[#283B3D]">{todayIssuedCount} tokens issued</span> out of <span className="font-black text-[#176B65]">{dailyTokenCap} daily limit</span> ({tokensRemainingToday} slots left today)
                      </>
                    ) : (
                      'Daily token limit is currently disabled. Tokens can be issued without restriction.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {isCapEnabled && (
                  <button
                    type="button"
                    onClick={() => handleQuickExpandCap(10)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Quickly add 10 more tokens for today"
                  >
                    <span>+10 Tokens</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTempCapInput(dailyTokenCap);
                    setCapModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F3F1E9] hover:bg-[#DCE9E3] border border-[#DCE9E3] text-xs font-bold text-[#283B3D] transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#176B65]" />
                  <span>Configure Cap</span>
                </button>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            {isCapEnabled && (
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 w-full bg-[#F3F1E9] rounded-full overflow-hidden p-0.5 border border-[#DCE9E3]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      capPercent >= 100 
                        ? 'bg-rose-500' 
                        : capPercent >= 80 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(capPercent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-[#283B3D]/60">
                  <span>0 Issued</span>
                  <span className={capPercent >= 80 ? 'text-amber-700 font-black' : ''}>
                    {capPercent}% Utilized
                  </span>
                  <span>Cap: {dailyTokenCap} max</span>
                </div>
              </div>
            )}

            {/* Cap Reached Warning Alert */}
            {isCapEnabled && isCapReached && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-rose-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold">
                    Daily token limit reached! Online token generation is paused to protect queue service quality.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickExpandCap(10)}
                  className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  Expand +10
                </button>
              </div>
            )}
          </div>

      {/* ========================================================= */}
      {/* MAIN TWO-COLUMN WORKSPACE: NOW SERVING & QUEUE LIST       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (lg:col-span-7): PRIMARY CALLING STATION */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* NOW SERVING HERO CARD */}
          <div className="bg-[#283B3D] text-[#F3F1E9] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden border-4 border-[#176B65]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#176B65]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F2A15A] bg-white/10 px-3 py-1 rounded-full">
                Desk Counter Serving
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Clock className="w-3.5 h-3.5 text-[#F2A15A]" />
                <span>Elapsed: {formatTimer(counterSeconds)}</span>
              </div>
            </div>

            {servingToken ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Current Customer Pass</span>
                    <div className="text-5xl sm:text-6xl font-token font-bold text-white tracking-tight mt-1">
                      {servingToken.tokenNumber}
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <span className="text-lg font-black text-[#DCE9E3] block">{servingToken.customerName}</span>
                    <span className="text-xs text-slate-400 block">+91 {servingToken.customerPhone}</span>
                    <span className="text-[11px] font-bold text-[#F2A15A] bg-black/30 px-2.5 py-0.5 rounded-md inline-block">
                      {servingToken.service} • Party of {servingToken.groupSize}
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  
                  {/* Call Next */}
                  <button
                    type="button"
                    onClick={handleCallNext}
                    className="sm:col-span-2 py-4 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-black text-sm shadow-lg shadow-[#176B65]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Volume2 className="w-5 h-5 text-[#F2A15A]" />
                    <span>Call Next Customer ({waitingQueue[0]?.tokenNumber || 'Queue Empty'})</span>
                  </button>

                  {/* Mark Complete & Billing Hisaab */}
                  <button
                    type="button"
                    onClick={handleOpenBillingModal}
                    className="py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#283B3D] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    title="Mark Done and record billing details (optional)"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Done & Bill</span>
                  </button>
                </div>

                {/* Secondary Actions: Repeat Announcement & Skip / Absent */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-white/10 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Customer delayed?</span>
                    <button
                      type="button"
                      onClick={handleRepeatCall}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[#DCE9E3] font-bold text-xs cursor-pointer transition-colors"
                      title="Repeat voice announcement and counter chime"
                    >
                      <Megaphone className="w-3.5 h-3.5 text-[#F2A15A]" />
                      <span>Repeat Voice Call</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleMarkAbsent}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Mark Absent / Skip Turn
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <Store className="w-12 h-12 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">Desk Counter is Idle</h3>
                  <p className="text-xs text-slate-400">Ready to serve the next customer in line.</p>
                </div>

                {waitingQueue.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCallNext}
                    className="px-8 py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-[#F2A15A]" />
                    <span>Call First Customer ({waitingQueue[0].tokenNumber})</span>
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Absent / Skipped Turn Recovery Pill */}
          {absentList.length > 0 && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Absent / Skipped Turn List ({absentList.length})</span>
                </span>
                <span className="text-[11px] text-amber-700 font-medium">Click to recall when customer arrives</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {absentList.map((a) => (
                  <button
                    key={a.tokenNumber}
                    type="button"
                    onClick={() => handleRecallAbsent(a)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-xs font-bold text-[#283B3D] flex items-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <span className="text-[#176B65] font-token">{a.tokenNumber}</span>
                    <span>{a.customerName}</span>
                    <span className="text-[10px] text-amber-700 underline font-normal">Recall</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (lg:col-span-5): WAITING QUEUE LIST & WALK-IN CTA */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DCE9E3] shadow-sm space-y-4 flex flex-col h-[520px]">
            
            {/* Header with Walk-in Button */}
            <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-3 shrink-0">
              <div>
                <h3 className="font-black text-base text-[#283B3D]">Live Waiting Queue</h3>
                <span className="text-xs text-[#283B3D]/70 font-medium">{waitingQueue.length} customers in line</span>
              </div>

              <button
                type="button"
                onClick={() => setWalkinModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#F2A15A]" />
                <span>+ Walk-in Pass</span>
              </button>
            </div>

            {/* Scrollable Waiting Queue List with WhatsApp Direct Alert */}
            <div className="overflow-y-auto flex-1 space-y-2.5 divide-y divide-[#DCE9E3]/50 pr-1">
              {waitingQueue.map((item, index) => {
                const hasPhone = item.customerPhone && item.customerPhone !== 'Offline';
                const whatsappUrl = hasPhone 
                  ? `https://wa.me/91${item.customerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hello ${item.customerName}, your token ${item.tokenNumber} at ${activeShop?.name || 'our shop'} is calling soon! You are next in line. Please proceed to the service counter.`)}`
                  : null;

                return (
                  <div 
                    key={`${item.id || item.tokenNumber}-${index}`}
                    className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#F3F1E9]/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-[#DCE9E3] text-[#176B65] text-xs font-black flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-token font-bold text-sm text-[#176B65]">{item.tokenNumber}</span>
                          <span className="font-black text-xs text-[#283B3D] truncate">{item.customerName}</span>
                        </div>
                        <span className="text-[11px] text-[#283B3D]/60 block truncate">
                          {item.service} • Est wait: ~{item.estWaitMin}m
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Send WhatsApp Turn Alert"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <span className="text-[11px] font-bold text-[#176B65] bg-[#DCE9E3] px-2 py-0.5 rounded-md">
                        {item.waitAhead} Ahead
                      </span>
                    </div>
                  </div>
                );
              })}

              {waitingQueue.length === 0 && (
                <div className="py-16 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-xs text-[#283B3D]">Queue is Clear</h4>
                  <p className="text-[11px] text-slate-400">All booked customers have been attended.</p>
                </div>
              )}
            </div>

            {/* Quick Footer info */}
            <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-[#283B3D]/70 font-medium shrink-0 flex items-center justify-between">
              <span>Automatic WhatsApp & Voice Chime Enabled</span>
              <span className="text-emerald-700 font-bold">● Live Radar</span>
            </div>

          </div>

        </div>

      </div>
    </div>
    )}

      {/* ========================================================= */}
      {/* TAB 2: DAILY ANALYTICS & EOD FOOTFALL REPORTS (BRD FR-710)*/}
      {/* ========================================================= */}
      {activeTab === 'ANALYTICS' && (() => {
        const currentFiltered = getFilteredRecords();
        const totalFilteredCount = currentFiltered.length;
        const completedFilteredCount = currentFiltered.filter(t => t.status === 'COMPLETED').length;
        const waitingFilteredCount = currentFiltered.filter(t => t.status === 'WAITING').length;
        const servingFilteredCount = currentFiltered.filter(t => t.status === 'SERVING').length;
        const noShowFilteredCount = currentFiltered.filter(t => t.status === 'NO_SHOW' || t.status === 'SKIPPED').length;

        const fulfillmentRate = totalFilteredCount > 0 
          ? ((completedFilteredCount / totalFilteredCount) * 100).toFixed(1) + '%' 
          : '0.0%';

        // Financial & Hisaab Metrics (BRD Section 18 / Revenue Accounting)
        const totalRevenue = currentFiltered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const cashRevenue = currentFiltered.filter(t => t.paymentMode === 'CASH').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const upiRevenue = currentFiltered.filter(t => t.paymentMode === 'UPI').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const pendingRevenue = currentFiltered.filter(t => t.paymentMode === 'PENDING').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const payingCustomersCount = currentFiltered.filter(t => (Number(t.amount) || 0) > 0).length;
        const avgBillAmount = payingCustomersCount > 0 ? Math.round(totalRevenue / payingCustomersCount) : 0;

        const tokensWithWait = currentFiltered.filter(t => typeof t.waitMin === 'number' && t.waitMin > 0);
        const avgWaitDisplay = tokensWithWait.length > 0
          ? `${Math.round(tokensWithWait.reduce((acc, t) => acc + t.waitMin, 0) / tokensWithWait.length)}m`
          : `${activeShop?.avgWaitMin || 12}m`;

        const tokensWithDuration = currentFiltered.filter(t => typeof t.durationMin === 'number' && t.durationMin > 0);
        const avgDurationDisplay = tokensWithDuration.length > 0
          ? `${Math.round(tokensWithDuration.reduce((acc, t) => acc + t.durationMin, 0) / tokensWithDuration.length)}m`
          : '0m';

        // Full 24-Hour Graph Data (Hour 0 to 23: 12 AM to 11 PM / 12 AM next)
        const hourly24Data = Array.from({ length: 24 }, (_, hour) => {
          const matching = currentFiltered.filter(t => {
            let tHour = t.hour;
            if (tHour === undefined && t.createdAt) {
              tHour = new Date(t.createdAt).getHours();
            }
            return tHour === hour;
          });

          const hourNumber = hour === 0 ? 12 : hour <= 12 ? hour : hour - 12;
          const ampm = hour < 12 ? 'AM' : 'PM';
          const displayLabel = `${hourNumber} ${ampm}`;

          return {
            hour,
            hourNumber,
            ampm,
            displayLabel,
            count: matching.length
          };
        });

        const maxHourTokens = Math.max(0, ...hourly24Data.map(h => h.count));
        const peakHours = hourly24Data.filter(h => h.count === maxHourTokens && h.count > 0);
        const peakHourSummary = peakHours.length > 0
          ? `${peakHours.map(h => h.displayLabel).join(', ')} (${maxHourTokens} ${maxHourTokens === 1 ? 'token' : 'tokens'})`
          : 'No traffic rush recorded yet';

        // Real Service Mix Breakdown
        const serviceCounts = {};
        currentFiltered.forEach(t => {
          const s = t.service || 'General Service';
          serviceCounts[s] = (serviceCounts[s] || 0) + (t.groupSize || 1);
        });
        const serviceMixList = Object.entries(serviceCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([service, count]) => ({
            service,
            count,
            percent: totalFilteredCount > 0 ? Math.round((count / totalFilteredCount) * 100) : 0
          }));

        // Customer Details Table Records (Filter & Search)
        const displayedTableRecords = currentFiltered.filter(t => {
          if (customerStatusFilter !== 'ALL' && t.status !== customerStatusFilter) {
            return false;
          }
          if (customerTableSearch.trim()) {
            const q = customerTableSearch.toLowerCase();
            const matchName = (t.customerName || '').toLowerCase().includes(q);
            const matchPhone = (t.customerPhone || '').includes(q);
            const matchToken = (t.tokenNumber || '').toLowerCase().includes(q);
            const matchService = (t.service || '').toLowerCase().includes(q);
            const matchBreakdown = (t.serviceBreakdown || '').toLowerCase().includes(q);
            const matchPayment = (t.paymentMode || '').toLowerCase().includes(q);
            const matchNotes = (t.billNotes || '').toLowerCase().includes(q);
            return matchName || matchPhone || matchToken || matchService || matchBreakdown || matchPayment || matchNotes;
          }
          return true;
        });

        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Analytics Header with Date Range Filter & Export Actions */}
            <div className="bg-white rounded-3xl p-6 border border-[#DCE9E3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#176B65] bg-[#DCE9E3] px-2.5 py-0.5 rounded-full">
                    Real-time Footfall & Operations Intelligence
                  </span>
                  <span className="text-xs text-slate-400 font-bold">• BRD Section 18.2 / FR-710</span>
                </div>
                <h2 className="text-2xl font-black text-[#283B3D] mt-1">
                  Shop Analytics & Queue Insights
                </h2>
                <p className="text-xs text-[#283B3D]/70 font-medium">
                  {analyticsDateRange === 'TODAY' && "Live real-time records, active wait counters, and customer logs for Today."}
                  {analyticsDateRange === 'YESTERDAY' && "Verified customer visits, turnaround pace, and footfall logs for Yesterday."}
                  {analyticsDateRange === 'WEEK' && "Rolling 7-day customer activity, volume patterns, and service distribution."}
                  {analyticsDateRange === 'MONTH' && "Comprehensive 30-day monthly queue throughput and footfall reports."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* 4 Date Filter Pills: Today, Yesterday, 7 Days, Monthly */}
                <div className="flex items-center bg-[#F3F1E9] p-1 rounded-2xl border border-[#DCE9E3]">
                  {[
                    { id: 'TODAY', label: 'Today (Live)' },
                    { id: 'YESTERDAY', label: 'Yesterday' },
                    { id: 'WEEK', label: '7 Days' },
                    { id: 'MONTH', label: 'Monthly' }
                  ].map((range) => (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setAnalyticsDateRange(range.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        analyticsDateRange === range.id
                          ? 'bg-[#176B65] text-white shadow-xs'
                          : 'text-[#283B3D]/70 hover:text-[#283B3D]'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* Export CSV Button */}
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-3.5 py-2 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Download customer records in CSV format (FR-1203)"
                >
                  <Download className="w-4 h-4 text-[#F2A15A]" />
                  <span>Export CSV</span>
                </button>

                {/* Print Summary */}
                <button
                  type="button"
                  onClick={() => typeof window !== 'undefined' && window.print()}
                  className="px-3.5 py-2 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-slate-50 text-[#283B3D] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Print Analytics & Customer Summary Sheet"
                >
                  <Printer className="w-4 h-4 text-[#176B65]" />
                  <span>Print Sheet</span>
                </button>
              </div>
            </div>

            {/* DEDICATED HISAAB & REVENUE SUMMARY BANNER */}
            <div className="bg-gradient-to-br from-[#176B65] to-[#283B3D] text-[#F3F1E9] rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#F2A15A] border border-white/10 shadow-xs shrink-0">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#F2A15A] block">
                      {analyticsDateRange === 'TODAY' && 'Live Day-End Accounting • Aaj Ka Hisaab'}
                      {analyticsDateRange === 'YESTERDAY' && 'Day Close Revenue • Kal Ka Pura Hisaab'}
                      {analyticsDateRange === 'WEEK' && 'Rolling 7-Day Revenue • Hafte Ka Hisaab'}
                      {analyticsDateRange === 'MONTH' && '30-Day Monthly Earnings • Pure Mahine Ka Hisaab'}
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {analyticsDateRange === 'TODAY' && "Today's Total Billing & Earning"}
                      {analyticsDateRange === 'YESTERDAY' && "Yesterday's Total Shop Collection"}
                      {analyticsDateRange === 'WEEK' && "Last 7 Days Accumulated Revenue"}
                      {analyticsDateRange === 'MONTH' && "Monthly Total Earning & Revenue"}
                    </h3>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-emerald-200/90 font-bold block uppercase tracking-wider">
                    Total Revenue Collected
                  </span>
                  <div className="text-3xl sm:text-4xl font-token font-bold text-white tracking-tight mt-0.5">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Payment Mode & Ticket Breakdown Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">💵 Cash (Naqad)</span>
                  <span className="text-base sm:text-lg font-token font-bold text-[#DCE9E3] block">₹{cashRevenue.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 block">{currentFiltered.filter(t => t.paymentMode === 'CASH').length} cash payments</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">📱 UPI / QR Online</span>
                  <span className="text-base sm:text-lg font-token font-bold text-[#DCE9E3] block">₹{upiRevenue.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 block">{currentFiltered.filter(t => t.paymentMode === 'UPI').length} online payments</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">⏳ Pending / Udhaar</span>
                  <span className="text-base sm:text-lg font-token font-bold text-amber-300 block">₹{pendingRevenue.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 block">{currentFiltered.filter(t => t.paymentMode === 'PENDING').length} pending bills</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">📊 Avg Ticket / Visit</span>
                  <span className="text-base sm:text-lg font-token font-bold text-[#F2A15A] block">₹{avgBillAmount.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 block">{payingCustomersCount} billed visits</span>
                </div>
              </div>
            </div>

            {/* 6 Real KPI Metric Cards (100% Data-Driven) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="urban-card rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Total Tokens</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-[#176B65]">
                  {totalFilteredCount}
                </div>
                <span className="text-[11px] text-[#283B3D]/70 font-semibold block">Footfall Count</span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Served Visits</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-emerald-700">
                  {completedFilteredCount}
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold block">Fulfillment {fulfillmentRate}</span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1 bg-emerald-50/50 border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Total Hisaab</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-emerald-700">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold block">
                  {analyticsDateRange === 'TODAY' ? "Today's Earnings" : analyticsDateRange === 'YESTERDAY' ? "Yesterday's Total" : analyticsDateRange === 'WEEK' ? "7-Day Revenue" : "Monthly Revenue"}
                </span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Avg Wait Time</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-[#F2A15A]">
                  ~{avgWaitDisplay}
                </div>
                <span className="text-[11px] text-[#283B3D]/70 font-semibold block">Before Counter Call</span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Turnaround Pace</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-teal-700">
                  ~{avgDurationDisplay}
                </div>
                <span className="text-[11px] text-[#283B3D]/70 font-semibold block">Avg Service Time</span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Missed / Absent</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-rose-600">
                  {noShowFilteredCount}
                </div>
                <span className="text-[11px] text-rose-600 font-semibold block">No-shows Recorded</span>
              </div>
            </div>

            {/* 24-HOUR GRAPH (12 AM TO 12 AM) */}
            <div className="bg-white rounded-3xl p-6 border border-[#DCE9E3] shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE9E3] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <h3 className="font-black text-base text-[#283B3D]">
                      24-Hour Footfall & Queue Volume (12 AM – 12 AM)
                    </h3>
                  </div>
                  <p className="text-xs text-[#283B3D]/70 font-medium">
                    Real-time customer distribution across all 24 hours of the day (updates live as customers book or walk in)
                  </p>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                  <span>🔥 Peak Rush:</span>
                  <span className="font-black text-amber-700">{peakHourSummary}</span>
                </div>
              </div>

              {/* 24 Columns Bar Visualizer with horizontal scrolling on mobile */}
              <div className="pt-2">
                <div className="overflow-x-auto pb-3">
                  <div 
                    className="min-w-[960px] grid items-end gap-1.5 sm:gap-2 h-52 border-b border-slate-200 pb-2"
                    style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                  >
                    {hourly24Data.map((item) => {
                      const isPeak = maxHourTokens > 0 && item.count === maxHourTokens;
                      const heightPercent = maxHourTokens > 0 && item.count > 0 
                        ? Math.max(14, Math.round((item.count / maxHourTokens) * 100))
                        : 6;

                      return (
                        <div key={item.hour} className="flex flex-col items-center gap-1.5 h-full justify-end group relative">
                          {/* Count Label */}
                          <div className={`transition-all text-center h-4 ${
                            item.count > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <span className={`text-[9px] font-black px-1 rounded ${
                              isPeak ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'text-[#283B3D]'
                            }`}>
                              {item.count > 0 ? item.count : '0'}
                            </span>
                          </div>

                          {/* Bar Element */}
                          <div 
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-lg transition-all cursor-pointer relative group-hover:brightness-95 ${
                              isPeak
                                ? 'bg-gradient-to-t from-amber-500 to-[#F2A15A] shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                                : item.count > 0
                                ? 'bg-gradient-to-t from-[#176B65] to-[#283B3D]'
                                : 'bg-slate-100 group-hover:bg-slate-200'
                            }`}
                            title={`${item.displayLabel}: ${item.count} customers recorded`}
                          >
                            {isPeak && (
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                                <span className="text-[7px] font-black uppercase text-amber-800 bg-amber-200 px-1 py-0.2 rounded shadow-2xs">
                                  Peak
                                </span>
                              </div>
                            )}
                          </div>

                          {/* 24-Hour X-Axis Labels (12 AM, 1 AM ... 12 PM, 1 PM ... 11 PM) */}
                          <span className={`text-[9px] sm:text-[10px] font-bold whitespace-nowrap text-center ${
                            isPeak ? 'text-amber-700 font-black' : item.count > 0 ? 'text-[#176B65] font-black' : 'text-slate-500'
                          }`}>
                            {item.displayLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-medium pt-2 gap-2">
                  <span>Midnight: 12:00 AM (00:00)</span>
                  <span className="text-[#176B65] font-bold">● Midday: 12:00 PM (12:00)</span>
                  <span className="text-amber-700 font-bold">Highest Demand: {peakHourSummary}</span>
                  <span>Night: 11:00 PM (23:00)</span>
                </div>
              </div>
            </div>

            {/* Service Mix Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-[#DCE9E3] shadow-sm space-y-4">
              <div className="border-b border-[#DCE9E3] pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#176B65]" />
                  <h3 className="font-black text-base text-[#283B3D]">Customer Services & Demand Breakdown</h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {serviceMixList.length} distinct service categories recorded
                </span>
              </div>

              {serviceMixList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {serviceMixList.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#F3F1E9]/60 border border-[#DCE9E3] space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-[#283B3D]">
                        <span className="truncate pr-2">{item.service}</span>
                        <span className="text-[#176B65] shrink-0">{item.percent}% ({item.count})</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#176B65] rounded-full transition-all" 
                          style={{ width: `${item.percent}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3">No service data available for this time range.</p>
              )}
            </div>

            {/* CUSTOMER DETAILS & ACTIVITY TABLE */}
            <div className="bg-white rounded-3xl p-6 border border-[#DCE9E3] shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#DCE9E3] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#176B65]" />
                    <h3 className="font-black text-base text-[#283B3D]">
                      Customer Details & Queue Activity Log
                    </h3>
                  </div>
                  <p className="text-xs text-[#283B3D]/70 font-medium mt-0.5">
                    Detailed record of all customer visits, phone numbers, party sizes, services, and queue statuses.
                  </p>
                </div>

                {/* Search & Status Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name, phone, token..."
                      value={customerTableSearch}
                      onChange={(e) => setCustomerTableSearch(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-xl border border-[#DCE9E3] bg-[#F3F1E9]/60 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65] w-48 sm:w-56"
                    />
                  </div>

                  <div className="flex items-center bg-[#F3F1E9] p-1 rounded-xl border border-[#DCE9E3] text-[11px] font-bold">
                    {[
                      { id: 'ALL', label: `All (${currentFiltered.length})` },
                      { id: 'COMPLETED', label: `Completed (${completedFilteredCount})` },
                      { id: 'WAITING', label: `In Queue (${waitingFilteredCount + servingFilteredCount})` },
                      { id: 'NO_SHOW', label: `No-Show (${noShowFilteredCount})` }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCustomerStatusFilter(tab.id)}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          customerStatusFilter === tab.id
                            ? 'bg-[#176B65] text-white shadow-xs'
                            : 'text-[#283B3D]/70 hover:text-[#283B3D]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              {displayedTableRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#DCE9E3] text-[#283B3D]/60 font-black uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-3">Token #</th>
                        <th className="py-3 px-3">Customer Name</th>
                        <th className="py-3 px-3">Mobile Contact</th>
                        <th className="py-3 px-3">Party</th>
                        <th className="py-3 px-3">Services Availed (Kaam)</th>
                        <th className="py-3 px-3 text-right">Bill Amount</th>
                        <th className="py-3 px-3 text-center">Payment</th>
                        <th className="py-3 px-3">Time</th>
                        <th className="py-3 px-3">Duration</th>
                        <th className="py-3 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[#283B3D]">
                      {displayedTableRecords.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-token font-bold text-[#176B65] text-sm">
                            {item.tokenNumber}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#283B3D]">
                            {item.customerName}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">
                            {item.customerPhone ? (item.customerPhone.startsWith('+') ? item.customerPhone : `+91 ${item.customerPhone}`) : 'Offline / Walk-in'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-[#F3F1E9] text-[#283B3D] font-bold text-[11px] border border-[#DCE9E3]">
                              {item.groupSize || 1} {item.groupSize > 1 ? 'People' : 'Person'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-700 max-w-[220px]">
                            <span className="font-semibold block truncate" title={item.serviceBreakdown || item.service}>
                              {item.serviceBreakdown || item.service || 'General Service'}
                            </span>
                            {item.billNotes && (
                              <span className="text-[10px] text-slate-400 block truncate" title={item.billNotes}>
                                Note: {item.billNotes}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            {item.amount !== undefined && item.amount > 0 ? (
                              <span className="font-token font-black text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 inline-block shadow-2xs">
                                ₹{Number(item.amount).toLocaleString('en-IN')}
                              </span>
                            ) : item.status === 'COMPLETED' ? (
                              <span className="text-slate-400 text-xs font-semibold">₹0 / Free</span>
                            ) : (
                              <span className="text-slate-300 text-xs">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {item.paymentMode === 'UPI' && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                                📱 UPI
                              </span>
                            )}
                            {item.paymentMode === 'CASH' && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                                💵 Cash
                              </span>
                            )}
                            {item.paymentMode === 'PENDING' && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                                ⏳ Udhaar
                              </span>
                            )}
                            {(!item.paymentMode || item.paymentMode === '-') && (
                              <span className="text-slate-300 font-bold text-xs">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                            {item.completedAt || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today')}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-700">
                            {item.durationMin ? `${item.durationMin}m` : (item.duration || (item.status === 'WAITING' ? `Est: ${item.waitMin || 10}m` : item.status === 'SERVING' ? 'Serving...' : '-'))}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            {item.status === 'COMPLETED' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                Completed
                              </span>
                            )}
                            {item.status === 'SERVING' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 animate-pulse">
                                Serving at Desk
                              </span>
                            )}
                            {item.status === 'WAITING' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                                In Line (Waiting)
                              </span>
                            )}
                            {item.status === 'NO_SHOW' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                                No-Show / Absent
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-xs text-[#283B3D]">No Customer Records Found</h4>
                  <p className="text-[11px] text-slate-400">
                    {customerTableSearch ? "No customers match your search criteria." : "No customer visits recorded for this selected time filter."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL 1: ADD WALK-IN OFFLINE CUSTOMER                    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {walkinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setWalkinModalOpen(false)} 
              className="fixed inset-0"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#DCE9E3] space-y-5 z-10"
            >
              <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-base text-[#283B3D]">Issue Walk-in Pass</h3>
                </div>
                <button onClick={() => setWalkinModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddWalkin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#283B3D] mb-1">Customer Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar / Walk-in Guest"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#283B3D] mb-1">Mobile Number (Optional)</label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210 (Leave blank for offline)"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#283B3D]">
                        Party Size ({walkinGroupSize} {walkinGroupSize === 1 ? 'Person' : 'People'})
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Custom Group Allowed
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Stepper with - and + and direct number typing */}
                      <div className="flex items-center bg-[#F3F1E9] border border-[#DCE9E3] rounded-2xl p-1">
                        <button
                          type="button"
                          onClick={() => setWalkinGroupSize(prev => Math.max(1, Number(prev || 1) - 1))}
                          className="w-8 h-8 rounded-xl bg-white text-[#283B3D] font-black text-sm flex items-center justify-center hover:bg-slate-100 shadow-2xs cursor-pointer active:scale-95"
                          title="Decrease party size"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={walkinGroupSize}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setWalkinGroupSize(isNaN(val) || val < 1 ? 1 : Math.min(99, val));
                          }}
                          className="w-12 text-center bg-transparent font-black text-sm text-[#283B3D] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setWalkinGroupSize(prev => Math.min(99, Number(prev || 1) + 1))}
                          className="w-8 h-8 rounded-xl bg-[#176B65] text-white font-black text-sm flex items-center justify-center hover:bg-[#125550] shadow-2xs cursor-pointer active:scale-95"
                          title="Increase party size"
                        >
                          +
                        </button>
                      </div>

                      {/* Quick preset buttons */}
                      <div className="flex items-center gap-1.5 flex-1">
                        {[1, 2, 3, 4, 5, 8].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setWalkinGroupSize(num)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              walkinGroupSize === num
                                ? 'bg-[#176B65] text-white shadow-xs'
                                : 'bg-white border border-[#DCE9E3] text-[#283B3D]/70 hover:bg-[#DCE9E3]/40'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Group Mode Switcher when Party Size > 1 */}
                    {walkinGroupSize > 1 && (
                      <div className="mt-3 p-3 bg-[#DCE9E3]/40 border border-[#176B65]/20 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-black text-[#176B65]">
                            Token Generation for {walkinGroupSize} Customers:
                          </label>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-300">
                            Consecutive Turns
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setTokenGenerationMode('INDIVIDUAL')}
                            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                              tokenGenerationMode === 'INDIVIDUAL'
                                ? 'bg-white border-[#176B65] text-[#176B65] shadow-xs'
                                : 'bg-white/60 border-slate-200 text-[#283B3D]/70 hover:bg-white'
                            }`}
                          >
                            <span className="block text-xs font-black">
                              {walkinGroupSize} Separate Tokens
                            </span>
                            <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">
                              1 token per person (called sequentially)
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTokenGenerationMode('GROUP')}
                            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                              tokenGenerationMode === 'GROUP'
                                ? 'bg-white border-[#176B65] text-[#176B65] shadow-xs'
                                : 'bg-white/60 border-slate-200 text-[#283B3D]/70 hover:bg-white'
                            }`}
                          >
                            <span className="block text-xs font-black">
                              1 Shared Group Pass
                            </span>
                            <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">
                              Single token for all {walkinGroupSize} together
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#283B3D] mb-1">Service Note (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Haircut / Beard Grooming / OPD Checkup"
                      value={walkinService}
                      onChange={(e) => setWalkinService(e.target.value)}
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Ticket className="w-4 h-4 text-[#F2A15A]" />
                  <span>
                    {walkinGroupSize > 1 && tokenGenerationMode === 'INDIVIDUAL'
                      ? `Generate ${walkinGroupSize} Consecutive Tokens (#1 to #${walkinGroupSize})`
                      : walkinGroupSize > 1
                      ? `Generate 1 Group Token (Party of ${walkinGroupSize})`
                      : `Generate Token & Add to Line`
                    }
                  </span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 2: PRINTABLE COUNTER QR CODE POSTER                */}
      {/* ========================================================= */}
      <AnimatePresence>
        {qrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setQrModalOpen(false)} 
              className="fixed inset-0"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#DCE9E3] space-y-5 z-10 text-center"
            >
              <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-3">
                <span className="text-xs font-bold text-[#176B65] uppercase tracking-wider">Counter QR Pass</span>
                <button onClick={() => setQrModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#F3F1E9] rounded-2xl p-6 border-2 border-dashed border-[#176B65] space-y-4">
                <OfficialBrandLogo height={36} animate={false} />
                <h4 className="font-black text-sm text-[#283B3D]">{activeShop?.name}</h4>

                <div className="w-44 h-44 bg-white rounded-2xl p-2 mx-auto shadow-xs border border-[#DCE9E3] flex items-center justify-center">
                  <QrCode className="w-36 h-36 text-[#283B3D]" />
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-[#176B65] block">Scan to take token pass</span>
                  <span className="text-[10px] text-slate-500 block">No crowded lobby • Check turn live on phone</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-2xl bg-[#176B65] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#F2A15A]" />
                  <span>Print Poster</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 3: SERVICE BILLING / HISAAB (OPTIONAL ON SERVICE DONE)*/}
      {/* ========================================================= */}
      <AnimatePresence>
        {billingModalOpen && servingToken && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setBillingModalOpen(false)} 
              className="fixed inset-0"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#DCE9E3] space-y-5 z-10 max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Service Complete • Hisaab Khata
                    </span>
                    <h3 className="font-black text-base text-[#283B3D] mt-0.5">
                      Record Service Billing (Optional)
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setBillingModalOpen(false)} 
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Pass Summary Banner */}
              <div className="p-4 rounded-2xl bg-[#F3F1E9]/80 border border-[#DCE9E3] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#283B3D] text-[#F3F1E9] flex flex-col items-center justify-center font-token font-bold text-sm shadow-xs shrink-0">
                    <span className="text-[8px] text-[#F2A15A] uppercase tracking-wider">Pass</span>
                    <span>{servingToken.tokenNumber}</span>
                  </div>
                  <div>
                    <span className="font-black text-sm text-[#283B3D] block">{servingToken.customerName}</span>
                    <span className="text-xs text-slate-500 font-medium block">
                      {servingToken.customerPhone ? `+91 ${servingToken.customerPhone}` : 'Walk-in Guest'} • Party of {servingToken.groupSize || 1}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#176B65] bg-[#DCE9E3] px-2.5 py-1 rounded-xl shrink-0">
                  {servingToken.service || 'General Service'}
                </span>
              </div>

              {/* Billing Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFinalizeService({ skipBilling: false });
                }} 
                className="space-y-4"
              >
                {/* 1. Services Availed Note */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#283B3D]">
                    Customer Ne Kya-Kya Karaya? (Services Breakdown)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Haircut + Beard Grooming + Head Massage"
                    value={billServices}
                    onChange={(e) => setBillServices(e.target.value)}
                    className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                  
                  {/* Quick Preset Service Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">Quick Add:</span>
                    {['+ Haircut', '+ Beard Shave', '+ Facial & Pack', '+ Head Massage', '+ Medicine / OPD', '+ Wash & Dry'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          const tag = chip.replace('+ ', '');
                          if (!billServices) {
                            setBillServices(tag);
                          } else if (!billServices.includes(tag)) {
                            setBillServices(`${billServices} + ${tag}`);
                          }
                        }}
                        className="px-2 py-0.5 rounded-lg bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/50 text-[11px] font-bold text-[#283B3D] transition-colors cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Total Amount Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#283B3D]">
                      Total Bill Amount (Kitna Paisa Hua?)
                    </label>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {billAmount ? `Total: ₹${Number(billAmount).toLocaleString('en-IN')}` : 'Optional / Can skip'}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      ₹
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={500000}
                      placeholder="0"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl pl-8 pr-4 py-3 text-lg font-token font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>

                  {/* Quick Preset Amount Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">Presets:</span>
                    {[100, 150, 200, 250, 350, 500, 750, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBillAmount(String(amt))}
                        className={`px-2.5 py-1 rounded-xl text-xs font-token font-bold transition-all cursor-pointer ${
                          billAmount === String(amt)
                            ? 'bg-[#176B65] text-white shadow-xs'
                            : 'bg-white border border-[#DCE9E3] text-[#283B3D] hover:bg-slate-50'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setBillAmount('')}
                      className="px-2 py-1 rounded-xl text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* 3. Payment Mode Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#283B3D]">
                    Payment Mode (Paisa Kaise Diya?)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'CASH', label: 'Cash (Naqad)', icon: '💵', desc: 'Direct cash handed' },
                      { id: 'UPI', label: 'UPI / QR', icon: '📱', desc: 'GPay / PhonePe / Paytm' },
                      { id: 'PENDING', label: 'Pending / Udhaar', icon: '⏳', desc: 'Will pay next time' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setBillPaymentMode(mode.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          billPaymentMode === mode.id
                            ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-500 shadow-xs'
                            : 'bg-white border-[#DCE9E3] hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base block mb-0.5">{mode.icon}</span>
                        <span className={`text-xs font-black block ${billPaymentMode === mode.id ? 'text-emerald-800' : 'text-[#283B3D]'}`}>
                          {mode.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                          {mode.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Optional Remark / Bill Note */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#283B3D]">
                    Customer / Hisaab Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paid online, ₹50 balance remaining next time"
                    value={billNotes}
                    onChange={(e) => setBillNotes(e.target.value)}
                    className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-4 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>

                {/* Actions: Save & Complete vs Skip (₹0) */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>
                      {billAmount && Number(billAmount) > 0 
                        ? `Save Hisaab (₹${Number(billAmount).toLocaleString('en-IN')}) & Mark Complete`
                        : "Save & Mark Complete"
                      }
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalizeService({ skipBilling: true })}
                    className="w-full py-2.5 rounded-2xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-[#283B3D] font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Skip Billing (Bina Bill / ₹0 Me Complete Karo)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 4: SMART BREAK / PAUSE TIMER MODAL (BRD FR-707)     */}
      {/* ========================================================= */}
      <AnimatePresence>
        {breakModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl border border-[#DCE9E3] relative max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[#283B3D]">Counter Break / Pause Timer</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        FR-707
                      </span>
                    </div>
                    <p className="text-xs text-[#283B3D]/70 font-semibold">
                      Notify waiting customers on their mobile screen with an estimated return time.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBreakModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F3F1E9] text-[#283B3D]/70 hover:text-[#283B3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* If currently on break */}
              {shopStatus === 'PAUSED' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900">Current Break Status</span>
                    {breakRemainingSeconds > 0 && (
                      <span className="text-xs font-mono font-black text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                        {formatTimer(breakRemainingSeconds)} remaining
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-800">
                    Reason: <strong>{breakReason || 'Counter on break'}</strong>
                    {breakResumeTimeDisplay ? ` • Auto-resumes ~${breakResumeTimeDisplay}` : ''}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleEndBreak();
                      setBreakModalOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>End Break & Resume Counter Now</span>
                  </button>
                </div>
              )}

              {/* Quick Preset Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#283B3D] uppercase tracking-wider">
                  Quick Break Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleStartBreak('TEA', 15, 'Tea / Refreshment Break')}
                    className="p-3.5 rounded-2xl border-2 border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 hover:border-amber-400 text-left transition-all cursor-pointer group active:scale-98"
                  >
                    <div className="flex items-center gap-2 text-amber-800 font-black text-sm">
                      <Coffee className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>15 Min</span>
                    </div>
                    <span className="text-xs font-bold text-[#283B3D] block mt-1">Tea Break</span>
                    <span className="text-[10px] text-[#283B3D]/60 block">Quick refreshment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartBreak('LUNCH', 30, 'Lunch / Meal Break')}
                    className="p-3.5 rounded-2xl border-2 border-orange-200 bg-orange-50/50 hover:bg-orange-100/70 hover:border-orange-400 text-left transition-all cursor-pointer group active:scale-98"
                  >
                    <div className="flex items-center gap-2 text-orange-800 font-black text-sm">
                      <Utensils className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>30 Min</span>
                    </div>
                    <span className="text-xs font-bold text-[#283B3D] block mt-1">Lunch Break</span>
                    <span className="text-[10px] text-[#283B3D]/60 block">Afternoon / Dinner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartBreak('EXTENDED', 45, 'Extended Rest / Errand')}
                    className="p-3.5 rounded-2xl border-2 border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 hover:border-teal-400 text-left transition-all cursor-pointer group active:scale-98"
                  >
                    <div className="flex items-center gap-2 text-[#176B65] font-black text-sm">
                      <Timer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>45 Min</span>
                    </div>
                    <span className="text-xs font-bold text-[#283B3D] block mt-1">Rest / Restock</span>
                    <span className="text-[10px] text-[#283B3D]/60 block">Stock & supplies run</span>
                  </button>
                </div>
              </div>

              {/* Custom Minutes & Reason Section */}
              <div className="p-4 rounded-2xl bg-[#F3F1E9]/70 border border-[#DCE9E3] space-y-3">
                <label className="block text-xs font-bold text-[#283B3D]">
                  Custom Break Duration & Note
                </label>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white rounded-xl border border-[#DCE9E3] p-1">
                    <button
                      type="button"
                      onClick={() => setCustomBreakMinutes(Math.max(5, customBreakMinutes - 5))}
                      className="w-8 h-8 rounded-lg hover:bg-[#F3F1E9] text-base font-black text-[#283B3D] flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-16 text-center text-sm font-black text-[#176B65]">
                      {customBreakMinutes}m
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomBreakMinutes(Math.min(180, customBreakMinutes + 5))}
                      className="w-8 h-8 rounded-lg hover:bg-[#F3F1E9] text-base font-black text-[#283B3D] flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Break reason (e.g. Lunch, Prayers, Restock)"
                    value={breakReason}
                    onChange={(e) => setBreakReason(e.target.value)}
                    className="flex-1 bg-white border border-[#DCE9E3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleStartBreak('CUSTOM', customBreakMinutes, breakReason || `Quick break (${customBreakMinutes}m)`)}
                  className="w-full py-2.5 rounded-xl bg-[#176B65] hover:bg-[#135853] text-white font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                >
                  <Timer className="w-4 h-4" />
                  <span>Start Custom {customBreakMinutes}-Minute Break</span>
                </button>
              </div>

              {/* Indefinite Pause Option */}
              <div className="pt-1 border-t border-[#DCE9E3] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleStartBreak('INDEFINITE', 0, breakReason || 'Counter paused indefinitely')}
                  className="px-4 py-2.5 rounded-xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-[#283B3D] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PauseCircle className="w-4 h-4 text-amber-700" />
                  <span>Pause Indefinitely (No Timer)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBreakModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#283B3D]/70 hover:text-[#283B3D] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 5: DAILY TOKEN CAP LIMIT MODAL (BRD FR-314)         */}
      {/* ========================================================= */}
      <AnimatePresence>
        {capModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl border border-[#DCE9E3] relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-[#176B65]">
                    <Gauge className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[#283B3D]">Daily Token Cap Limit</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#176B65]">
                        FR-314
                      </span>
                    </div>
                    <p className="text-xs text-[#283B3D]/70 font-semibold">
                      Control maximum token capacity to prevent crowd congestion.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCapModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F3F1E9] text-[#283B3D]/70 hover:text-[#283B3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cap Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F3F1E9]/70 border border-[#DCE9E3]">
                <div>
                  <span className="text-xs font-black text-[#283B3D] block">Enable Daily Token Limit</span>
                  <span className="text-[11px] text-[#283B3D]/60 font-semibold">
                    {isCapEnabled ? 'Limit is enforced on online token generation' : 'Unlimited tokens allowed per day'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCapEnabled(!isCapEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isCapEnabled ? 'bg-[#176B65]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isCapEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Stepper + Number */}
              {isCapEnabled && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-[#283B3D]">
                    Maximum Tokens Allowed Per Day
                  </label>
                  <div className="flex items-center justify-center gap-4 bg-[#F3F1E9]/50 p-3 rounded-2xl border border-[#DCE9E3]">
                    <button
                      type="button"
                      onClick={() => setTempCapInput(Math.max(5, tempCapInput - 5))}
                      className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-lg font-black text-[#283B3D] shadow-xs flex items-center justify-center cursor-pointer active:scale-95 border border-[#DCE9E3]"
                    >
                      -5
                    </button>
                    <div className="text-center">
                      <span className="text-3xl font-token font-bold text-[#176B65]">
                        {tempCapInput}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 block">tokens / day</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTempCapInput(Math.min(500, tempCapInput + 5))}
                      className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-lg font-black text-[#283B3D] shadow-xs flex items-center justify-center cursor-pointer active:scale-95 border border-[#DCE9E3]"
                    >
                      +5
                    </button>
                  </div>

                  {/* Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#283B3D]/60">Quick Presets</span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[25, 40, 50, 75, 100].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTempCapInput(preset)}
                          className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            tempCapInput === preset
                              ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                              : 'bg-white hover:bg-[#F3F1E9] text-[#283B3D] border-[#DCE9E3]'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Math Preview */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Tokens Issued Today: <strong>{todayIssuedCount}</strong></span>
                    <span>Remaining Slots: <strong className="text-emerald-700">{Math.max(0, tempCapInput - todayIssuedCount)}</strong></span>
                  </div>
                </div>
              )}

              {/* Save & Cancel */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveCap(tempCapInput, isCapEnabled)}
                  className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#135853] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Save Capacity Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCapModalOpen(false)}
                  className="w-full py-2.5 rounded-2xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-[#283B3D] font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
