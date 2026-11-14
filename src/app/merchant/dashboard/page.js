"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Store, Users, Clock, CheckCircle2, AlertCircle, Play, Pause, 
  Power, ArrowRight, UserPlus, Phone, Volume2, VolumeX, QrCode, Printer, 
  Sparkles, RefreshCw, ChevronRight, X, UserCheck, ShieldCheck, Ticket, MessageCircle, MapPin,
  LogOut, PlusCircle, Lock, Megaphone, BarChart3, TrendingUp, Calendar, Download, Flame, Zap, Award, FileSpreadsheet,
  Search, Filter, IndianRupee, Receipt, CreditCard, Banknote, FileText, Check, Plus,
  Coffee, Utensils, Timer, Gauge, SlidersHorizontal, AlertTriangle, PlayCircle, PauseCircle,
  Settings, Building, Edit3, Save, Info, Bell, ToggleLeft, ToggleRight, CalendarDays, PhoneCall,
  Moon, RotateCcw, Archive, ShieldAlert,
  Star, ThumbsUp, MessageSquare, Flag, Reply, CornerDownRight,
  Radio, Siren, Send, Copy, ExternalLink, Trash2,
  BookOpen, Wallet, History,
  KeyRound, BadgeCheck, Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OfficialBrandLogo from '@/components/OfficialBrandLogo';
import QRCode from 'qrcode';
import { queueApi } from '@/lib/api';
import { playChime } from '@/lib/audioChime';

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

  // BRD FR-605 / FR-302: Printable Counter QR Standee Generator State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [standeeQrUrl, setStandeeQrUrl] = useState('');
  const [standeeFormat, setStandeeFormat] = useState('TABLETOP'); // 'TABLETOP' (A5) | 'POSTER' (A4) | 'STICKER' (Square)
  const [standeeTheme, setStandeeTheme] = useState('EMERALD'); // 'EMERALD' | 'MIDNIGHT' | 'MINIMAL'
  const [standeeTagline, setStandeeTagline] = useState('Line me khade mat raho, QR scan karo aur aaram se baithiye!');
  const [showStandeeHours, setShowStandeeHours] = useState(true);
  const [showStandeeWifi, setShowStandeeWifi] = useState(false);
  const [standeeWifiName, setStandeeWifiName] = useState('');
  const [standeeWifiPass, setStandeeWifiPass] = useState('');
  const [standeeCopied, setStandeeCopied] = useState(false);

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
  const [billPaymentMode, setBillPaymentMode] = useState('CASH'); // 'CASH' | 'UPI' | 'PENDING' | 'PARTIAL'
  const [billPaidAmount, setBillPaidAmount] = useState('');
  const [billNotes, setBillNotes] = useState('');

  // BRD FR-712: Customer Khata / Udhaar & Balance Ledger State
  const [khataList, setKhataList] = useState([]);
  const [khataSearch, setKhataSearch] = useState('');
  const [khataFilter, setKhataFilter] = useState('ALL'); // 'ALL' | 'DUE' | 'SETTLED'
  const [khataModalOpen, setKhataModalOpen] = useState(false);
  const [selectedKhataCustomer, setSelectedKhataCustomer] = useState(null);
  const [khataEntryType, setKhataEntryType] = useState('PAYMENT'); // 'PAYMENT' | 'CREDIT'
  const [khataEntryAmount, setKhataEntryAmount] = useState('');
  const [khataEntryMode, setKhataEntryMode] = useState('CASH'); // 'CASH' | 'UPI'
  const [khataEntryNotes, setKhataEntryNotes] = useState('');
  const [khataFeedbackMsg, setKhataFeedbackMsg] = useState('');
  const [statementCustomer, setStatementCustomer] = useState(null);
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [newCustomerKhataModalOpen, setNewCustomerKhataModalOpen] = useState(false);
  const [newKhataName, setNewKhataName] = useState('');
  const [newKhataPhone, setNewKhataPhone] = useState('');
  const [newKhataInitialDue, setNewKhataInitialDue] = useState('');
  const [newKhataNotes, setNewKhataNotes] = useState('');

  // BRD FR-711: Staff Attendance & Multi-Operator Login with PIN State
  const [staffList, setStaffList] = useState([]);
  const [activeOperator, setActiveOperator] = useState(null);
  const [staffPinModalOpen, setStaffPinModalOpen] = useState(false);
  const [staffManageModalOpen, setStaffManageModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinTargetStaff, setPinTargetStaff] = useState(null);
  const [pinAction, setPinAction] = useState('SWITCH'); // 'SWITCH' | 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK' | 'OWNER_SETTINGS'
  const [pinError, setPinError] = useState('');
  const [staffFeedbackMsg, setStaffFeedbackMsg] = useState('');
  const [ownerMasterPin, setOwnerMasterPin] = useState('9999');
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');

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

  // BRD FR-602: Shop Profile & Operating Hours Editor State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editShopName, setEditShopName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editZone, setEditZone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editOpenTime, setEditOpenTime] = useState('09:30 AM');
  const [editCloseTime, setEditCloseTime] = useState('08:30 PM');
  const [editWeeklyOff, setEditWeeklyOff] = useState('None');
  const [editLunchBreak, setEditLunchBreak] = useState('');
  const [editAvgWaitMin, setEditAvgWaitMin] = useState(12);
  const [editTokenPrefix, setEditTokenPrefix] = useState('AK');
  const [editEnableWhatsapp, setEditEnableWhatsapp] = useState(true);
  const [profileSavedFeedback, setProfileSavedFeedback] = useState(false);

  // BRD FR-708: Day-End Queue Close & Reset State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [unservedResolution, setUnservedResolution] = useState('EXPIRE'); // 'EXPIRE' | 'NO_SHOW'
  const [lastDayCloseTimestamp, setLastDayCloseTimestamp] = useState(null);

  // BRD FR-1105: Customer Reviews & Ratings Console State
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewFilterRating, setReviewFilterRating] = useState('ALL'); // 'ALL' | 5 | 4 | 3 | 'LOW' | 'AWAITING_REPLY'
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingToReview, setReplyingToReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flaggingReview, setFlaggingReview] = useState(null);
  const [flagReason, setFlagReason] = useState('Not a real customer visit');

  // BRD FR-708 / FR-405: Emergency Flash Queue Broadcast Alert State
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [activeBroadcast, setActiveBroadcast] = useState(null);
  const [broadcastReason, setBroadcastReason] = useState('Power Outage / Generator Delay');
  const [broadcastMessage, setBroadcastMessage] = useState('Market power cut in progress. Generator running, queue moving with ~15 min delay.');
  const [broadcastSeverity, setBroadcastSeverity] = useState('WARNING'); // 'WARNING' | 'CRITICAL' | 'INFO'
  const [broadcastDelayMinutes, setBroadcastDelayMinutes] = useState(15);

  // BRD FR-604 / FR-1201: Universal Service Menu & Rate Card State
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [shopServicesList, setShopServicesList] = useState([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('15');
  const [serviceFeedbackMsg, setServiceFeedbackMsg] = useState('');

  // BRD FR-704 / FR-402: 1-Tap Customer WhatsApp Call & Turn Reminder State
  const [whatsappSentMap, setWhatsappSentMap] = useState({});
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappTargetCustomer, setWhatsappTargetCustomer] = useState(null);
  const [whatsappMessagePreset, setWhatsappMessagePreset] = useState('CALLING_SOON');
  const [whatsappCustomText, setWhatsappCustomText] = useState('');

  // BRD FR-709: Multi-Counter / Multi-Station State
  const [stationsList, setStationsList] = useState([]);
  const [stationModalOpen, setStationModalOpen] = useState(false);
  const [newStationName, setNewStationName] = useState('');
  const [newStationStaff, setNewStationStaff] = useState('');
  const [newStationRole, setNewStationRole] = useState('');
  const [stationFeedbackMsg, setStationFeedbackMsg] = useState('');
  const [billingStationId, setBillingStationId] = useState(null);

  // Industry Archetypes for Multi-Counter Stations (BRD FR-709)
  const CATEGORY_DEFAULT_STATIONS = {
    SALON: [
      { id: 'st-1', name: 'Chair #1', staffName: 'Ramesh (Senior Stylist)', role: 'Hair & Styling', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 },
      { id: 'st-2', name: 'Chair #2', staffName: 'Sonu (Grooming Expert)', role: 'Beard & Shave', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 },
      { id: 'st-3', name: 'Chair #3', staffName: 'Wasim (Spa Specialist)', role: 'Facial & Spa', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 }
    ],
    CLINIC: [
      { id: 'st-1', name: 'Chamber #1', staffName: 'Dr. Verma (OPD)', role: 'General Consultation', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 },
      { id: 'st-2', name: 'Procedure Room', staffName: 'Nurse Sunita', role: 'Dressing & Injection', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 },
      { id: 'st-3', name: 'Dental Chair', staffName: 'Dr. Neha (Dentist)', role: 'Dental Scaling & Care', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 }
    ],
    PHARMACY: [
      { id: 'st-1', name: 'Counter #1', staffName: 'Pharmacist Imran', role: 'Prescription Medicines', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 },
      { id: 'st-2', name: 'Counter #2', staffName: 'Cashier Alok', role: 'Express OTC & Billing', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 }
    ],
    DIAGNOSTIC: [
      { id: 'st-1', name: 'Phlebotomy Chair #1', staffName: 'Technician Rajesh', role: 'Blood Sample Draw', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 },
      { id: 'st-2', name: 'Collection Room #2', staffName: 'Sister Preeti', role: 'Urine & Report Delivery', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 }
    ],
    FOOD: [
      { id: 'st-1', name: 'Dine-in Floor', staffName: 'Captain Manoj', role: 'Table Seating & Order', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 },
      { id: 'st-2', name: 'Takeaway Counter', staffName: 'Packaging Staff', role: 'Parcel Delivery', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 }
    ],
    AUTO: [
      { id: 'st-1', name: 'Bay #1', staffName: 'Ustad Aslam', role: 'Engine & Oil Servicing', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 },
      { id: 'st-2', name: 'Bay #2', staffName: 'Mechanic Deepu', role: 'Brakes, Chain & Wash', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 }
    ],
    RETAIL: [
      { id: 'st-1', name: 'Billing Desk #1', staffName: 'Operator Vikas', role: 'Main Checkout', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 },
      { id: 'st-2', name: 'Express Desk #2', staffName: 'Operator Priya', role: 'Quick Items (<5 items)', active: true, currentToken: null, timerSeconds: 0, totalServedToday: 0 }
    ]
  };

  const getStationsStorageKey = (shop) => `ak_shop_stations_${(shop?.slug || 'shop').toLowerCase()}`;

  const loadShopStations = (shop) => {
    if (!shop || typeof window === 'undefined') return [];
    const key = getStationsStorageKey(shop);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    const catKey = detectCategoryKey(shop);
    const defaults = CATEGORY_DEFAULT_STATIONS[catKey] || CATEGORY_DEFAULT_STATIONS.SALON;
    try {
      localStorage.setItem(key, JSON.stringify(defaults));
    } catch (e) {}
    return defaults;
  };

  // BRD FR-712: Khata / Udhaar Storage Key & Loader
  const getKhataStorageKey = (shop) => `ak_shop_khata_${(shop?.slug || 'shop').toLowerCase()}`;

  const loadShopKhata = (shop) => {
    if (!shop || typeof window === 'undefined') return [];
    const key = getKhataStorageKey(shop);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  };

  // BRD FR-711: Staff Attendance & Multi-Operator Storage Keys & Default Archetypes
  const CATEGORY_DEFAULT_STAFF = {
    SALON: [
      { id: 'stf-1', name: 'Ramesh (Senior Stylist)', role: 'Stylist & Cuts', phone: '9811001100', pin: '1111', status: 'ON_DUTY', clockInTime: '09:00 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 },
      { id: 'stf-2', name: 'Sonu (Grooming Expert)', role: 'Beard & Shave', phone: '9822002200', pin: '2222', status: 'ON_DUTY', clockInTime: '09:30 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 },
      { id: 'stf-3', name: 'Wasim (Spa Specialist)', role: 'Facial & Head Spa', phone: '9833003300', pin: '3333', status: 'ON_BREAK', clockInTime: '10:00 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 }
    ],
    CLINIC: [
      { id: 'stf-1', name: 'Dr. Verma (OPD)', role: 'Chief Consultant', phone: '9811001100', pin: '1111', status: 'ON_DUTY', clockInTime: '09:00 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 },
      { id: 'stf-2', name: 'Nurse Sunita', role: 'Nursing & Procedures', phone: '9822002200', pin: '2222', status: 'ON_DUTY', clockInTime: '08:45 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 },
      { id: 'stf-3', name: 'Dr. Neha (Dentist)', role: 'Dental Care', phone: '9833003300', pin: '3333', status: 'OFF_DUTY', clockInTime: null, clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 }
    ],
    PHARMACY: [
      { id: 'stf-1', name: 'Pharmacist Imran', role: 'Chief Dispenser', phone: '9811001100', pin: '1111', status: 'ON_DUTY', clockInTime: '09:00 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 },
      { id: 'stf-2', name: 'Cashier Alok', role: 'Express OTC & Billing', phone: '9822002200', pin: '2222', status: 'ON_DUTY', clockInTime: '09:15 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 }
    ],
    DIAGNOSTIC: [
      { id: 'stf-1', name: 'Rajesh Technician', role: 'Senior Phlebotomist', phone: '9811001100', pin: '1111', status: 'ON_DUTY', clockInTime: '08:30 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 },
      { id: 'stf-2', name: 'Sister Preeti', role: 'Lab Assistant & Reports', phone: '9822002200', pin: '2222', status: 'ON_DUTY', clockInTime: '08:45 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 }
    ],
    FOOD: [
      { id: 'stf-1', name: 'Captain Manoj', role: 'Floor Manager', phone: '9811001100', pin: '1111', status: 'ON_DUTY', clockInTime: '10:00 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 },
      { id: 'stf-2', name: 'Chef Suresh', role: 'Kitchen Master', phone: '9822002200', pin: '2222', status: 'ON_DUTY', clockInTime: '09:30 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 }
    ],
    AUTO: [
      { id: 'stf-1', name: 'Ustad Aslam', role: 'Master Technician', phone: '9811001100', pin: '1111', status: 'ON_DUTY', clockInTime: '09:00 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 },
      { id: 'stf-2', name: 'Mechanic Deepu', role: 'Brakes & Wash Specialist', phone: '9822002200', pin: '2222', status: 'ON_DUTY', clockInTime: '09:30 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 }
    ],
    RETAIL: [
      { id: 'stf-1', name: 'Vikas Operator', role: 'Head Cashier', phone: '9811001100', pin: '1111', status: 'ON_DUTY', clockInTime: '09:00 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 },
      { id: 'stf-2', name: 'Priya Billing', role: 'Express Checkout', phone: '9822002200', pin: '2222', status: 'ON_DUTY', clockInTime: '09:30 AM', clockOutTime: null, servedCountToday: 0, revenueGeneratedToday: 0 }
    ]
  };

  const getStaffStorageKey = (shop) => `ak_shop_staff_${(shop?.slug || 'shop').toLowerCase()}`;
  const getOwnerPinStorageKey = (shop) => `ak_shop_owner_pin_${(shop?.slug || 'shop').toLowerCase()}`;

  const loadShopStaff = (shop) => {
    if (!shop || typeof window === 'undefined') return [];
    const key = getStaffStorageKey(shop);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    const catKey = detectCategoryKey(shop);
    const defaults = CATEGORY_DEFAULT_STAFF[catKey] || CATEGORY_DEFAULT_STAFF.SALON;
    try {
      localStorage.setItem(key, JSON.stringify(defaults));
    } catch (e) {}
    return defaults;
  };

  const loadOwnerPin = (shop) => {
    if (!shop || typeof window === 'undefined') return '9999';
    const key = getOwnerPinStorageKey(shop);
    try {
      const saved = localStorage.getItem(key);
      if (saved && saved.trim()) return saved.trim();
    } catch (e) {}
    return '9999';
  };

  // Universal Industry Category Default Catalogs (BRD FR-604 / FR-1201)
  const CATEGORY_DEFAULT_SERVICES = {
    PHARMACY: [
      { id: 'srv-rx', name: 'Prescription Medicines Dispensing', price: 350, duration: 8, active: true },
      { id: 'srv-otc', name: 'OTC Medicines & First Aid Kit', price: 120, duration: 5, active: true },
      { id: 'srv-baby', name: 'Baby Care & Diapers Pack', price: 450, duration: 6, active: true },
      { id: 'srv-supp', name: 'Health Supplements & Multivitamins', price: 600, duration: 8, active: true },
      { id: 'srv-surg', name: 'Surgical Disposables & Syringes', price: 180, duration: 5, active: true },
      { id: 'srv-diag', name: 'Blood Pressure & Sugar Strip Test', price: 80, duration: 5, active: true }
    ],
    CLINIC: [
      { id: 'srv-opd', name: 'General Physician OPD Consultation', price: 500, duration: 15, active: true },
      { id: 'srv-dent-chk', name: 'Dental Checkup & Scaling', price: 400, duration: 20, active: true },
      { id: 'srv-follow', name: 'Routine Follow-up Visit', price: 200, duration: 10, active: true },
      { id: 'srv-cavity', name: 'Cavity Filling & Tooth Care', price: 800, duration: 30, active: true },
      { id: 'srv-wound', name: 'Wound Dressing & Injection', price: 150, duration: 10, active: true },
      { id: 'srv-vacc', name: 'Child Immunization & Wellness', price: 300, duration: 15, active: true }
    ],
    DIAGNOSTIC: [
      { id: 'srv-cbc', name: 'Complete Blood Count (CBC)', price: 350, duration: 10, active: true },
      { id: 'srv-sugar', name: 'Fasting Sugar & HbA1c Panel', price: 400, duration: 10, active: true },
      { id: 'srv-thyroid', name: 'Thyroid Profile (T3, T4, TSH)', price: 550, duration: 12, active: true },
      { id: 'srv-lft', name: 'Lipid & Liver Function Test (LFT)', price: 750, duration: 15, active: true },
      { id: 'srv-urine', name: 'Urine Routine & Microscopic', price: 150, duration: 8, active: true },
      { id: 'srv-report', name: 'Report Collection & Doctor Brief', price: 0, duration: 5, active: true }
    ],
    SALON: [
      { id: 'srv-haircut', name: 'Haircut & Styling', price: 150, duration: 20, active: true },
      { id: 'srv-beard', name: 'Beard Trim & Clean Shave', price: 100, duration: 15, active: true },
      { id: 'srv-detan', name: 'De-Tan Skin Glow & Cleanup', price: 350, duration: 25, active: true },
      { id: 'srv-spa', name: 'Anti-Dandruff / Hair Spa', price: 450, duration: 30, active: true },
      { id: 'srv-massage', name: 'Head & Shoulder Oil Massage', price: 200, duration: 15, active: true },
      { id: 'srv-facial', name: 'Herbal Glow Facial', price: 600, duration: 40, active: true }
    ],
    FOOD: [
      { id: 'srv-table', name: 'Dine-in Table Booking', price: 0, duration: 35, active: true },
      { id: 'srv-takeaway', name: 'Takeaway Food & Parcel', price: 250, duration: 15, active: true },
      { id: 'srv-thali', name: 'Executive Special Lunch Thali', price: 220, duration: 20, active: true },
      { id: 'srv-chaat', name: 'Evening Snacks & Hot Chaat', price: 120, duration: 12, active: true },
      { id: 'srv-sweets', name: 'Fresh Sweets Box (1kg/500g)', price: 380, duration: 10, active: true }
    ],
    AUTO: [
      { id: 'srv-oil', name: 'Engine Oil Change & Filter', price: 350, duration: 20, active: true },
      { id: 'srv-service', name: 'Periodic Bike Maintenance & Wash', price: 650, duration: 45, active: true },
      { id: 'srv-brake', name: 'Disc Brake & Chain Tune-up', price: 200, duration: 20, active: true },
      { id: 'srv-tyre', name: 'Tubeless Puncture & Nitrogen Check', price: 80, duration: 10, active: true },
      { id: 'srv-battery', name: 'Battery Health & Electrical Diagnosis', price: 150, duration: 15, active: true }
    ],
    RETAIL: [
      { id: 'srv-ration', name: 'Monthly Ration Packing List', price: 1500, duration: 25, active: true },
      { id: 'srv-express', name: 'Quick Grocery Checkout Pass', price: 150, duration: 10, active: true },
      { id: 'srv-dairy', name: 'Daily Fresh Dairy & Bread Pack', price: 100, duration: 5, active: true },
      { id: 'srv-print', name: 'Document Printing & Photocopy', price: 50, duration: 5, active: true }
    ]
  };

  const detectCategoryKey = (shop) => {
    const cat = ((shop?.categoryName || '') + ' ' + (shop?.name || '') + ' ' + (shop?.slug || '')).toLowerCase();
    if (cat.includes('pharmacy') || cat.includes('medical') || cat.includes('chemist') || cat.includes('medicine')) return 'PHARMACY';
    if (cat.includes('clinic') || cat.includes('doctor') || cat.includes('dental') || cat.includes('dentist') || cat.includes('hospital')) return 'CLINIC';
    if (cat.includes('diagnostic') || cat.includes('pathology') || cat.includes('lab') || cat.includes('blood') || cat.includes('scan')) return 'DIAGNOSTIC';
    if (cat.includes('salon') || cat.includes('barber') || cat.includes('parlour') || cat.includes('spa') || cat.includes('grooming')) return 'SALON';
    if (cat.includes('food') || cat.includes('restaurant') || cat.includes('cafe') || cat.includes('chaat') || cat.includes('sweets') || cat.includes('snack')) return 'FOOD';
    if (cat.includes('auto') || cat.includes('bike') || cat.includes('garage') || cat.includes('puncture') || cat.includes('motor')) return 'AUTO';
    return 'RETAIL';
  };

  const getServicesStorageKey = (shop) => `ak_shop_services_${(shop?.slug || 'shop').toLowerCase()}`;

  const loadShopServices = (shop) => {
    if (!shop || typeof window === 'undefined') return [];
    const key = getServicesStorageKey(shop);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    const catKey = detectCategoryKey(shop);
    const defaults = CATEGORY_DEFAULT_SERVICES[catKey] || CATEGORY_DEFAULT_SERVICES.SALON;
    try {
      localStorage.setItem(key, JSON.stringify(defaults));
    } catch (e) {}
    return defaults;
  };

  const getStorageKey = (shop) => `ak_merchant_history_${(shop?.slug || 'shop').toLowerCase()}`;

  const loadShopRecords = (shop) => {
    if (!shop || typeof window === 'undefined') return [];
    try {
      const key = getStorageKey(shop);
      const savedStr = localStorage.getItem(key);
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  };

  const getReviewsStorageKey = (shop) => `ak_merchant_reviews_${(shop?.slug || 'shop').toLowerCase()}`;

  const loadShopReviews = (shop) => {
    if (!shop || typeof window === 'undefined') return [];
    try {
      const key = getReviewsStorageKey(shop);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  };

  const getBroadcastStorageKey = (shop) => `ak_shop_broadcast_${(shop?.slug || 'shop').toLowerCase()}`;

  const loadShopBroadcast = (shop) => {
    if (!shop || typeof window === 'undefined') return null;
    try {
      const key = getBroadcastStorageKey(shop);
      const saved = localStorage.getItem(key);
      if (saved) {
        const obj = JSON.parse(saved);
        if (obj && obj.active) {
          if (!obj.expiresAt || new Date(obj.expiresAt).getTime() > Date.now()) {
            return obj;
          } else {
            localStorage.removeItem(key);
          }
        }
      }
      return null;
    } catch (e) {
      return null;
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
        window.location.href = '/';
      }
    }
  };

  // Tracks last known token count to detect newly arrived tokens and ring audio chime
  const lastKnownTokenCountRef = useRef(-1);
  const servingTokenRef = useRef(null);
  const completedListRef = useRef([]);
  const absentListRef = useRef([]);

  useEffect(() => {
    servingTokenRef.current = servingToken;
  }, [servingToken]);

  useEffect(() => {
    completedListRef.current = completedList;
  }, [completedList]);

  useEffect(() => {
    absentListRef.current = absentList;
  }, [absentList]);

  // Token matching helper for consistent comparison across UUIDs and numbers
  const isTokenMatch = (a, b) => {
    if (!a || !b) return false;
    if (a.id && b.id && String(a.id) === String(b.id)) return true;
    const ca = String(a.displayToken || a.tokenNumber || '').replace(/\D/g, '');
    const cb = String(b.displayToken || b.tokenNumber || '').replace(/\D/g, '');
    return Boolean(ca && cb && ca === cb);
  };

  // Sync real customer tokens booked for this specific shop from Cloud Backend & Local Fallback
  const syncCustomerQueueForShop = async (shop) => {
    if (!shop || typeof window === 'undefined') return;

    let backendTokens = [];
    if (shop.id) {
      try {
        const res = await queueApi.getShopTokens(shop.id);
        if (res?.data?.data && Array.isArray(res.data.data)) {
          backendTokens = res.data.data;
        }
      } catch (e) {
        // Fallback gracefully if network glitch
      }
    }

    try {
      const allTokensStr = localStorage.getItem('ak_customer_tokens');
      const allTokens = allTokensStr ? JSON.parse(allTokensStr) : [];
      
      const sSlug = (shop.slug || '').toLowerCase();
      const sName = (shop.name || '').toLowerCase();

      // Find local tokens for this shop
      const shopLocalTokens = allTokens.filter(t => {
        const tSlug = (t.shopSlug || '').toLowerCase();
        const tName = (t.shopName || '').toLowerCase();
        return (tSlug && tSlug === sSlug) || (tName && tName === sName);
      });

      // Unified map of tokens: backend cloud tokens + local walk-ins
      const tokenMap = new Map();

      // 1. Local tokens first
      shopLocalTokens.forEach(t => {
        const key = String(t.id || t.displayToken || t.tokenNumber);
        tokenMap.set(key, t);
      });

      // 2. Overlay backend cloud tokens (Ground Truth from Cloud DB)
      backendTokens.forEach(bt => {
        const key = String(bt.id || bt.displayToken || bt.tokenNumber);
        const existing = tokenMap.get(key) || Array.from(tokenMap.values()).find(et => isTokenMatch(et, bt));

        const isLocallyCompleted = completedListRef.current.some(c => isTokenMatch(c, bt));
        const isLocallyAbsent = absentListRef.current.some(a => isTokenMatch(a, bt));
        const isLocallyServing = isTokenMatch(servingTokenRef.current, bt);

        // Maintain terminal state if locally completed/absent or if backend says completed
        let effectiveStatus = bt.status || 'WAITING';
        if (isLocallyCompleted || existing?.status === 'COMPLETED' || bt.status === 'COMPLETED') {
          effectiveStatus = 'COMPLETED';
        } else if (isLocallyAbsent || existing?.status === 'NO_SHOW' || bt.status === 'NO_SHOW' || bt.status === 'SKIPPED') {
          effectiveStatus = 'NO_SHOW';
        } else if (isLocallyServing || existing?.status === 'SERVING' || existing?.status === 'CALLED' || bt.status === 'CALLED' || bt.status === 'SERVING') {
          effectiveStatus = 'SERVING';
        }

        tokenMap.set(key, {
          id: bt.id,
          displayToken: bt.displayToken,
          tokenNumber: bt.displayToken || bt.tokenNumber,
          customerName: bt.customerName || (bt.user?.name) || 'Customer',
          customerPhone: bt.customerPhone || (bt.user?.phone) || 'Online',
          groupSize: bt.groupSize || 1,
          service: bt.serviceName || bt.service || 'General Service',
          customerPurpose: bt.serviceName || bt.service || 'General Service',
          status: effectiveStatus,
          joinedAt: bt.joinedAt,
          completedAt: bt.completedAt
        });
      });

      const shopTokens = Array.from(tokenMap.values());

      // 1. Waiting tokens only (status is 'WAITING' or undefined, excluding serving, completed, and absent)
      const waitingOnly = shopTokens.filter(t => {
        if (t.status && t.status !== 'WAITING') return false;
        if (isTokenMatch(servingTokenRef.current, t)) return false;
        if (completedListRef.current.some(c => isTokenMatch(c, t))) return false;
        if (absentListRef.current.some(a => isTokenMatch(a, t))) return false;
        return true;
      }).map((t, index) => ({
        id: t.id || `token-${index}`,
        tokenNumber: t.displayToken || t.tokenNumber || `${shop.tokenPrefix || 'AK'}-${String(index + 1).padStart(3, '0')}`,
        customerName: t.customerName || 'Customer',
        customerPhone: t.customerPhone || 'Online',
        groupSize: t.groupSize || 1,
        service: t.customerPurpose || t.service || 'General Service',
        estWaitMin: (index + 1) * (shop.avgWaitMin || 12),
        waitAhead: index
      }));

      // Play chime / ring alert when a new customer token arrives!
      if (lastKnownTokenCountRef.current !== -1 && waitingOnly.length > lastKnownTokenCountRef.current) {
        if (soundEnabled) {
          playChime('turn');
        }
        const newest = waitingOnly[waitingOnly.length - 1];
        setAnnouncementMsg(`🔔 Naya Token Aaya! Token #${newest?.tokenNumber || ''} (${newest?.customerName || 'Customer'}) queue me shamil hua!`);
        setTimeout(() => setAnnouncementMsg(''), 6000);
      }
      lastKnownTokenCountRef.current = waitingOnly.length;

      setWaitingQueue(waitingOnly);

      // 2. Currently Serving Token
      const servingItem = shopTokens.find(t => (t.status === 'SERVING' || t.status === 'CALLED') && !completedListRef.current.some(c => isTokenMatch(c, t)));
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
        id: t.id,
        tokenNumber: t.displayToken || t.tokenNumber,
        customerName: t.customerName,
        customerPhone: t.customerPhone,
        groupSize: t.groupSize || 1,
        service: t.customerPurpose || t.service || 'General Service',
        completedAt: t.completedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: t.duration || `${shop.avgWaitMin || 12} min`
      }));
      if (completedOnly.length > 0) {
        setCompletedList(prev => {
          const map = new Map();
          prev.forEach(item => map.set(String(item.tokenNumber), item));
          completedOnly.forEach(item => map.set(String(item.tokenNumber), item));
          return Array.from(map.values());
        });
      }

      // 4. Absent / Skipped Tokens
      const absentOnly = shopTokens.filter(t => t.status === 'NO_SHOW' || t.status === 'SKIPPED').map(t => ({
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

      if (savedShopStr) {
        try {
          const parsed = JSON.parse(savedShopStr);
          setActiveShop(parsed);
          setShopStatus(parsed.status || 'OPEN');
          setIsAuthorized(true);

          // Verify with cloud DB that shop was not deleted (only wipe on explicit 404, never on network error)
          if (parsed.id) {
            shopApi.getShopById(parsed.id).catch((err) => {
              if (err?.response?.status === 404) {
                localStorage.removeItem('ak_active_merchant_shop');
                localStorage.removeItem('ak_role');
                setActiveShop(null);
                setIsAuthorized(false);
              }
            });
          }

          syncCustomerQueueForShop(parsed);
          const recs = loadShopRecords(parsed);
          setShopRecords(recs);
          const revs = loadShopReviews(parsed);
          setReviewsList(revs);

          // Load Emergency Flash Broadcast if active (BRD FR-708 / FR-405)
          const bcast = loadShopBroadcast(parsed);
          setActiveBroadcast(bcast);

          // Load Category Services & Rate Card (BRD FR-604 / FR-1201)
          const servs = loadShopServices(parsed);
          setShopServicesList(servs);

          // Load Multi-Counter Stations (BRD FR-709)
          const stns = loadShopStations(parsed);
          setStationsList(stns);

          // Load Customer Khata / Udhaar Ledger (BRD FR-712)
          const kList = loadShopKhata(parsed);
          setKhataList(kList);

          // Load Staff Attendance & Multi-Operator Roster (BRD FR-711)
          const sList = loadShopStaff(parsed);
          setStaffList(sList);
          const firstOnDuty = sList.find(s => s.status === 'ON_DUTY') || sList[0] || null;
          setActiveOperator(firstOnDuty);
          const oPin = loadOwnerPin(parsed);
          setOwnerMasterPin(oPin);

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
        // Explicitly reject if no active merchant shop is found in session
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
        const bcast = loadShopBroadcast(activeShop);
        setActiveBroadcast(bcast);
        const servs = loadShopServices(activeShop);
        setShopServicesList(servs);
        const stns = loadShopStations(activeShop);
        setStationsList(stns);
        const kList = loadShopKhata(activeShop);
        setKhataList(kList);
        const sList = loadShopStaff(activeShop);
        setStaffList(sList);
        const oPin = loadOwnerPin(activeShop);
        setOwnerMasterPin(oPin);
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, [activeShop]);

  // Live Cloud Queue Polling: syncs tokens from Render Cloud Database every 3 seconds
  useEffect(() => {
    if (!activeShop) return;
    const pollTimer = setInterval(() => {
      syncCustomerQueueForShop(activeShop);
    }, 3000);
    return () => clearInterval(pollTimer);
  }, [activeShop, soundEnabled]);

  // Counter Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCounterSeconds(prev => prev + 1);
      setStationsList(prev => prev.map(s => s.currentToken ? { ...s, timerSeconds: (s.timerSeconds || 0) + 1 } : s));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // BRD FR-605 / FR-302: Generate high-resolution QR Code when shop or theme changes
  useEffect(() => {
    if (!activeShop || typeof window === 'undefined') return;
    const origin = window.location.origin || 'https://abhiikhula.in';
    const bookingUrl = `${origin}/book/${(activeShop.slug || 'shop').toLowerCase()}`;
    const darkColor = standeeTheme === 'MIDNIGHT' ? '#283B3D' : standeeTheme === 'EMERALD' ? '#176B65' : '#111827';

    QRCode.toDataURL(bookingUrl, {
      width: 600,
      margin: 1,
      color: {
        dark: darkColor,
        light: '#FFFFFF'
      }
    })
      .then(url => setStandeeQrUrl(url))
      .catch(err => console.error('Failed to generate QR', err));
  }, [activeShop, standeeTheme, qrModalOpen]);

  // Copy Booking Link to Clipboard
  const handleCopyBookingLink = () => {
    if (typeof window === 'undefined' || !activeShop) return;
    const origin = window.location.origin || 'https://abhiikhula.in';
    const bookingUrl = `${origin}/book/${(activeShop.slug || 'shop').toLowerCase()}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(bookingUrl);
    }
    setStandeeCopied(true);
    setAnnouncementMsg('📋 Booking link copied to clipboard!');
    setTimeout(() => setStandeeCopied(false), 3000);
  };

  // Download High-Resolution QR Code Image
  const handleDownloadQrPng = () => {
    if (!standeeQrUrl || !activeShop) return;
    const link = document.createElement('a');
    link.download = `${(activeShop.slug || 'shop').toLowerCase()}-counter-qr.png`;
    link.href = standeeQrUrl;
    link.click();
    setAnnouncementMsg('📥 High-resolution QR code downloaded!');
  };

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

  // Sync Shop Profile form state whenever activeShop changes (BRD FR-602)
  useEffect(() => {
    if (activeShop) {
      setEditShopName(activeShop.name || '');
      setEditOwnerName(activeShop.ownerName || '');
      setEditCategory(activeShop.categoryName || activeShop.categoryId || 'General Store');
      setEditPhone(activeShop.phone || '');
      setEditZone(activeShop.zone || 'Hazratganj Main Market');
      setEditAddress(activeShop.address || '');

      if (activeShop.openingHours && activeShop.openingHours.includes('-')) {
        const parts = activeShop.openingHours.split('-').map(s => s.trim());
        setEditOpenTime(parts[0] || '09:30 AM');
        setEditCloseTime(parts[1] || '08:30 PM');
      } else {
        setEditOpenTime(activeShop.openTime || '09:30 AM');
        setEditCloseTime(activeShop.closeTime || '08:30 PM');
      }

      setEditWeeklyOff(activeShop.weeklyOff || 'None');
      setEditLunchBreak(activeShop.lunchBreak || '');
      setEditAvgWaitMin(Number(activeShop.avgWaitMin) || 12);
      setEditTokenPrefix(activeShop.tokenPrefix || 'AK');
      setEditEnableWhatsapp(activeShop.enableWhatsapp !== false);
    }
  }, [activeShop]);

  const handleOpenProfileModal = () => {
    if (!activeShop) return;
    setEditShopName(activeShop.name || '');
    setEditOwnerName(activeShop.ownerName || '');
    setEditCategory(activeShop.categoryName || activeShop.categoryId || 'General Store');
    setEditPhone(activeShop.phone || '');
    setEditZone(activeShop.zone || 'Hazratganj Main Market');
    setEditAddress(activeShop.address || '');

    if (activeShop.openingHours && activeShop.openingHours.includes('-')) {
      const parts = activeShop.openingHours.split('-').map(s => s.trim());
      setEditOpenTime(parts[0] || '09:30 AM');
      setEditCloseTime(parts[1] || '08:30 PM');
    } else {
      setEditOpenTime(activeShop.openTime || '09:30 AM');
      setEditCloseTime(activeShop.closeTime || '08:30 PM');
    }

    setEditWeeklyOff(activeShop.weeklyOff || 'None');
    setEditLunchBreak(activeShop.lunchBreak || '');
    setEditAvgWaitMin(Number(activeShop.avgWaitMin) || 12);
    setEditTokenPrefix(activeShop.tokenPrefix || 'AK');
    setEditEnableWhatsapp(activeShop.enableWhatsapp !== false);
    setProfileModalOpen(true);
  };

  const handleSaveShopProfile = (e) => {
    if (e) e.preventDefault();
    if (!activeShop) return;

    if (!editShopName.trim()) {
      alert('Shop Name cannot be empty');
      return;
    }

    const cleanOpeningHours = `${editOpenTime} - ${editCloseTime}`;
    const updatedShop = {
      ...activeShop,
      name: editShopName.trim(),
      ownerName: editOwnerName.trim(),
      categoryName: editCategory,
      phone: editPhone.replace(/\D/g, '').slice(-10),
      zone: editZone,
      address: editAddress.trim(),
      openingHours: cleanOpeningHours,
      openTime: editOpenTime,
      closeTime: editCloseTime,
      weeklyOff: editWeeklyOff,
      lunchBreak: editLunchBreak.trim(),
      avgWaitMin: Number(editAvgWaitMin) || 12,
      tokenPrefix: (editTokenPrefix || 'AK').toUpperCase().slice(0, 4),
      enableWhatsapp: Boolean(editEnableWhatsapp),
      updatedAt: new Date().toISOString()
    };

    setActiveShop(updatedShop);

    // Dynamically update wait times in current waiting queue with new pace
    const pace = Number(editAvgWaitMin) || 12;
    setWaitingQueue(prev => prev.map((t, idx) => ({
      ...t,
      estWaitMin: (idx + 1) * pace
    })));

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ak_active_merchant_shop', JSON.stringify(updatedShop));

        const allShopsStr = localStorage.getItem('ak_merchant_shops');
        if (allShopsStr) {
          const allShops = JSON.parse(allShopsStr);
          const updatedShops = allShops.map(s => (s.slug === updatedShop.slug || s.id === updatedShop.id ? updatedShop : s));
          localStorage.setItem('ak_merchant_shops', JSON.stringify(updatedShops));
        }

        window.dispatchEvent(new Event('storage'));
      } catch (err) {}
    }

    setProfileModalOpen(false);
    setProfileSavedFeedback(true);
    setTimeout(() => setProfileSavedFeedback(false), 4000);
    setAnnouncementMsg(`✅ Shop profile & operating timings updated! Hours: ${cleanOpeningHours}, Pace: ~${pace}m.`);
    playChime();
  };

  // Nightly Auto-Reset Check (BRD FR-203 / FR-708)
  // If the last active date was yesterday, auto-expire stale unserved tokens and reset counter to Token #1
  useEffect(() => {
    if (!activeShop || typeof window === 'undefined') return;
    const sSlug = (activeShop.slug || 'shop').toLowerCase();
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastActiveKey = `ak_last_active_date_${sSlug}`;
    const lastActiveDate = localStorage.getItem(lastActiveKey);

    if (lastActiveDate && lastActiveDate !== todayStr) {
      try {
        const allTokensStr = localStorage.getItem('ak_customer_tokens');
        if (allTokensStr) {
          const allTokens = JSON.parse(allTokensStr);
          const hasStale = allTokens.some(t => {
            const tSlug = (t.shopSlug || '').toLowerCase();
            return tSlug === sSlug && (t.status === 'WAITING' || t.status === 'SERVING');
          });
          if (hasStale) {
            const cleaned = allTokens.map(t => {
              const tSlug = (t.shopSlug || '').toLowerCase();
              if (tSlug === sSlug && (t.status === 'WAITING' || t.status === 'SERVING')) {
                return { ...t, status: 'EXPIRED', expiredReason: 'Nightly rollover auto-reset' };
              }
              return t;
            });
            localStorage.setItem('ak_customer_tokens', JSON.stringify(cleaned));
            setWaitingQueue([]);
            setServingToken(null);
          }
        }
      } catch (e) {}
    }
    localStorage.setItem(lastActiveKey, todayStr);
  }, [activeShop]);

  // Day-End Queue Close & Reset Handler (BRD FR-708)
  const handleConfirmDayEndReset = () => {
    if (!activeShop) return;
    const now = new Date();
    const sSlug = (activeShop.slug || 'shop').toLowerCase();
    const sName = (activeShop.name || '').toLowerCase();

    try {
      // 1. Update waiting or serving tokens in localStorage to EXPIRED or NO_SHOW
      const allTokensStr = localStorage.getItem('ak_customer_tokens');
      if (allTokensStr) {
        const allTokens = JSON.parse(allTokensStr);
        const updatedTokens = allTokens.map(t => {
          const tSlug = (t.shopSlug || '').toLowerCase();
          const tName = (t.shopName || '').toLowerCase();
          const isThisShop = (tSlug && tSlug === sSlug) || (tName && tName === sName);
          if (isThisShop && (t.status === 'WAITING' || t.status === 'SERVING' || !t.status)) {
            return {
              ...t,
              status: unservedResolution === 'NO_SHOW' ? 'NO_SHOW' : 'EXPIRED',
              expiredAt: now.toISOString(),
              expiredReason: 'Day closed by merchant (FR-708)'
            };
          }
          return t;
        });
        localStorage.setItem('ak_customer_tokens', JSON.stringify(updatedTokens));
      }

      // 2. Clear break if active
      if (breakRemainingSeconds > 0) {
        handleEndBreak();
      }

      // 3. Reset live calling queue in memory
      setServingToken(null);
      setWaitingQueue([]);
      setAbsentList([]);
      setShopStatus('CLOSED');
      setResetModalOpen(false);

      // 4. Reset active shop's currentServing back to #1 and waiting count to 0
      const prefix = activeShop.tokenPrefix || 'AK';
      const updatedShop = {
        ...activeShop,
        status: 'CLOSED',
        currentServing: `${prefix}-001`,
        waitingCount: 0,
        lastDayClose: now.toISOString()
      };
      setActiveShop(updatedShop);
      setLastDayCloseTimestamp(now.toISOString());

      // Save to localStorage
      localStorage.setItem('ak_active_merchant_shop', JSON.stringify(updatedShop));
      localStorage.setItem(`ak_last_day_close_${sSlug}`, now.toISOString());

      const allShopsStr = localStorage.getItem('ak_merchant_shops');
      if (allShopsStr) {
        const allShops = JSON.parse(allShopsStr);
        const updatedShops = allShops.map(s => (s.slug === updatedShop.slug || s.id === updatedShop.id ? updatedShop : s));
        localStorage.setItem('ak_merchant_shops', JSON.stringify(updatedShops));
      }

      window.dispatchEvent(new Event('storage'));
      playChime();
      setAnnouncementMsg(`🌙 Day closed! Queue reset to ${prefix}-001 for tomorrow morning.`);
    } catch (e) {
      console.error('Failed to reset day queue:', e);
    }
  };

  // Handle Submit Merchant Reply to Review (BRD FR-1106)
  const handleSubmitMerchantReply = (e) => {
    if (e) e.preventDefault();
    if (!replyingToReview || !replyText.trim()) return;

    const now = new Date();
    const replyDate = 'Today, ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setReviewsList(prev => {
      const updated = prev.map(r => {
        if (r.id === replyingToReview.id) {
          return {
            ...r,
            merchantReply: replyText.trim(),
            merchantReplyDate: replyDate
          };
        }
        return r;
      });

      if (activeShop) {
        try {
          localStorage.setItem(getReviewsStorageKey(activeShop), JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    setReplyModalOpen(false);
    setReplyingToReview(null);
    setReplyText('');
    setAnnouncementMsg(`💬 Public reply posted to ${replyingToReview.customerName}'s review!`);
    playChime();
  };

  // Handle Flag / Report Review
  const handleConfirmFlagReview = () => {
    if (!flaggingReview) return;
    setReviewsList(prev => {
      const updated = prev.map(r => {
        if (r.id === flaggingReview.id) {
          return {
            ...r,
            flagged: true,
            flagReason
          };
        }
        return r;
      });

      if (activeShop) {
        try {
          localStorage.setItem(getReviewsStorageKey(activeShop), JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    setFlagModalOpen(false);
    setFlaggingReview(null);
    setAnnouncementMsg(`🚩 Review by ${flaggingReview.customerName} flagged for admin verification.`);
  };

  // BRD FR-708 / FR-405: Publish Emergency Flash Queue Broadcast
  const handlePublishBroadcast = (e) => {
    if (e) e.preventDefault();
    if (!broadcastMessage.trim()) return;

    const payload = {
      id: 'bcast-' + Date.now(),
      active: true,
      shopSlug: (activeShop?.slug || 'shop').toLowerCase(),
      shopName: activeShop?.name || 'Shop',
      reason: broadcastReason,
      message: broadcastMessage.trim(),
      severity: broadcastSeverity, // 'WARNING' | 'CRITICAL' | 'INFO'
      delayMinutes: Number(broadcastDelayMinutes) || 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 4 * 3600000).toISOString() // 4 hours validity
    };

    if (activeShop) {
      try {
        localStorage.setItem(getBroadcastStorageKey(activeShop), JSON.stringify(payload));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    }

    setActiveBroadcast(payload);
    setBroadcastModalOpen(false);
    setAnnouncementMsg(`📢 Emergency flash broadcast live! Added +${payload.delayMinutes}m delay warning for waiting customers.`);
    playChime();
  };

  // Clear / Dismiss Emergency Flash Queue Broadcast
  const handleClearBroadcast = () => {
    if (activeShop) {
      try {
        localStorage.removeItem(getBroadcastStorageKey(activeShop));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    }
    setActiveBroadcast(null);
    setAnnouncementMsg('✅ Flash broadcast cleared. Customer wait times restored to standard pace.');
    playChime();
  };

  // BRD FR-604 / FR-1201: Service Menu & Rate Card Handlers
  const saveServicesList = (updated) => {
    setShopServicesList(updated);
    if (activeShop) {
      try {
        localStorage.setItem(getServicesStorageKey(activeShop), JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    }
  };

  const handleAddService = (e) => {
    if (e) e.preventDefault();
    if (!newServiceName.trim()) return;
    const priceNum = Math.max(0, parseInt(newServicePrice, 10) || 0);
    const durNum = Math.max(1, parseInt(newServiceDuration, 10) || 15);

    const newObj = {
      id: 'srv-custom-' + Date.now(),
      name: newServiceName.trim(),
      price: priceNum,
      duration: durNum,
      active: true
    };

    const nextList = [...shopServicesList, newObj];
    saveServicesList(nextList);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('15');
    setServiceFeedbackMsg(`✅ Service "${newObj.name}" added to rate card!`);
    setTimeout(() => setServiceFeedbackMsg(''), 3000);
    playChime();
  };

  const handleUpdateServicePrice = (id, newPrice) => {
    const val = Math.max(0, parseInt(newPrice, 10) || 0);
    const nextList = shopServicesList.map(s => s.id === id ? { ...s, price: val } : s);
    saveServicesList(nextList);
  };

  const handleToggleService = (id) => {
    const nextList = shopServicesList.map(s => s.id === id ? { ...s, active: !s.active } : s);
    saveServicesList(nextList);
  };

  const handleDeleteService = (id) => {
    const nextList = shopServicesList.filter(s => s.id !== id);
    saveServicesList(nextList);
    setServiceFeedbackMsg('🗑️ Service removed from rate card.');
    setTimeout(() => setServiceFeedbackMsg(''), 3000);
  };

  const handleResetServicesToCategory = () => {
    const catKey = detectCategoryKey(activeShop);
    const defaults = CATEGORY_DEFAULT_SERVICES[catKey] || CATEGORY_DEFAULT_SERVICES.SALON;
    saveServicesList(defaults);
    setServiceFeedbackMsg(`🔄 Rate card reset to ${catKey} market defaults!`);
    setTimeout(() => setServiceFeedbackMsg(''), 3000);
    playChime();
  };

  // BRD FR-704 / FR-402: WhatsApp Turn Alert Helper Functions
  const getWhatsAppMessageText = (customer, preset = 'CALLING_SOON') => {
    if (!customer) return '';
    const shopName = activeShop?.name || 'Our Store';
    const name = customer.customerName || 'Customer';
    const token = customer.tokenNumber || 'AK-01';
    const peopleAhead = customer.waitAhead ?? 0;
    const waitMin = customer.estWaitMin ?? 10;

    switch (preset) {
      case 'CALLING_SOON':
        return `Namaste ${name} ji! 🙏\n\n*${shopName}* se aapka *Token #${token}* aane wala hai (Aapke aage sirf ${peopleAhead} vyakti hain, ~${waitMin} min).\n\nKripya service counter par aa jayein taaki turn skip na ho.\n\nLive Pass Dekhein: https://abhiikhula.in/tokens\n- Powered by AbhiiKhula`;
      case 'SERVING_NOW':
        return `Namaste ${name} ji! 🔔\n\n*${shopName}* par aapka *Token #${token}* counter par serve ho raha hai! Kripya turant service counter par step-up karein.\n- Powered by AbhiiKhula`;
      case 'ABSENT_RECALL':
        return `Namaste ${name} ji! ⚠️\n\n*${shopName}* par aapka *Token #${token}* call kiya gaya tha lekin aap uplabdh nahi the. Aapka token 10-minute grace hold par hai. Kripya turant counter par sampark karein!\n- Powered by AbhiiKhula`;
      case 'DELAY_NOTICE':
        return `Namaste ${name} ji! ⏳\n\n*${shopName}* par counter par thoda atirikt samay lag raha hai. Aapka *Token #${token}* lagbhag ~${waitMin + 10} minute me call hoga. Asuvidha ke liye khed hai.\n- Powered by AbhiiKhula`;
      default:
        return whatsappCustomText || `Namaste ${name} ji! *${shopName}* se aapke Token #${token} ke baare me counter update.`;
    }
  };

  const handleOpenWhatsAppModal = (customer, defaultPreset = 'CALLING_SOON') => {
    setWhatsappTargetCustomer(customer);
    setWhatsappMessagePreset(defaultPreset);
    setWhatsappCustomText(getWhatsAppMessageText(customer, defaultPreset));
    setWhatsappModalOpen(true);
  };

  const handleDirectWhatsAppSend = (customer, preset = 'CALLING_SOON', customTextOverride = null) => {
    if (!customer?.customerPhone || customer.customerPhone === 'Offline') return;
    const cleanPhone = customer.customerPhone.replace(/\D/g, '').slice(-10);
    const msg = customTextOverride || getWhatsAppMessageText(customer, preset);
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
    
    // Mark timestamp in state
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWhatsappSentMap(prev => ({
      ...prev,
      [customer.tokenNumber]: timeStr
    }));
    setAnnouncementMsg(`💬 WhatsApp alert sent to ${customer.customerName} (${customer.tokenNumber})!`);
    playChime();

    // Open WhatsApp
    window.open(url, '_blank');
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

  // BRD FR-709: Multi-Station / Multi-Counter Operations Handlers
  const saveStationsList = (updated) => {
    setStationsList(updated);
    if (!activeShop || typeof window === 'undefined') return;
    try {
      localStorage.setItem(getStationsStorageKey(activeShop), JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  const handleToggleStationActive = (stationId) => {
    const updated = stationsList.map(s => s.id === stationId ? { ...s, active: !s.active } : s);
    saveStationsList(updated);
  };

  const handleDeleteStation = (stationId) => {
    if (stationsList.length <= 1) {
      alert('You must have at least one station or counter.');
      return;
    }
    const updated = stationsList.filter(s => s.id !== stationId);
    saveStationsList(updated);
    setStationFeedbackMsg('🗑️ Station removed successfully.');
    setTimeout(() => setStationFeedbackMsg(''), 3000);
  };

  const handleAddStation = (e) => {
    e.preventDefault();
    if (!newStationName.trim()) {
      alert('Please enter a station or counter name (e.g. Chair #4, Chamber #2).');
      return;
    }
    const newStation = {
      id: `st-${Date.now()}`,
      name: newStationName.trim(),
      staffName: newStationStaff.trim() || 'Assigned Staff',
      role: newStationRole.trim() || 'Service Specialist',
      active: true,
      currentToken: null,
      timerSeconds: 0,
      totalServedToday: 0
    };
    const updated = [...stationsList, newStation];
    saveStationsList(updated);
    setNewStationName('');
    setNewStationStaff('');
    setNewStationRole('');
    setStationFeedbackMsg(`✅ Added ${newStation.name} successfully!`);
    setTimeout(() => setStationFeedbackMsg(''), 3500);
  };

  const handleResetStationsToCategory = () => {
    if (confirm('Reset all stations to industry category defaults? Any custom stations will be restored.')) {
      const catKey = detectCategoryKey(activeShop);
      const defaults = CATEGORY_DEFAULT_STATIONS[catKey] || CATEGORY_DEFAULT_STATIONS.SALON;
      saveStationsList(defaults);
      setStationFeedbackMsg(`🔄 Stations reset to ${catKey} market defaults!`);
      setTimeout(() => setStationFeedbackMsg(''), 3500);
    }
  };

  const handleCallNextForStation = (stationId) => {
    const station = stationsList.find(s => s.id === stationId);
    if (!station) return;
    if (!station.active) {
      alert(`${station.name} is currently inactive or on leave.`);
      return;
    }
    if (waitingQueue.length === 0) {
      alert('No more customers currently waiting in the queue.');
      return;
    }

    playChime();

    const prevStationToken = station.currentToken;
    const todayDate = new Date().toISOString().slice(0, 10);
    if (prevStationToken) {
      const durMins = Math.max(1, Math.floor((station.timerSeconds || 0) / 60));
      setCompletedList(prev => [
        {
          tokenNumber: prevStationToken.tokenNumber,
          customerName: prevStationToken.customerName,
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: `${durMins} min`,
          amount: 0,
          paymentMode: '-',
          service: prevStationToken.service || 'General Service',
          stationName: station.name
        },
        ...prev
      ]);

      updateRecordInHistory(activeShop, {
        id: prevStationToken.id || `token-${prevStationToken.tokenNumber}`,
        tokenNumber: prevStationToken.tokenNumber,
        customerName: prevStationToken.customerName,
        customerPhone: prevStationToken.customerPhone || 'Offline',
        groupSize: prevStationToken.groupSize || 1,
        service: prevStationToken.service || 'General Service',
        date: todayDate,
        hour: new Date().getHours(),
        status: 'COMPLETED',
        completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationMin: durMins,
        amount: 0,
        paymentMode: '-',
        assignedStation: station.name
      });
    }

    const nextToken = waitingQueue[0];
    const remaining = waitingQueue.slice(1).map((item, idx) => ({
      ...item,
      waitAhead: idx + 1,
      estWaitMin: (idx + 1) * (activeShop?.avgWaitMin || 12)
    }));
    setWaitingQueue(remaining);

    const tokenWithStation = {
      ...nextToken,
      assignedStation: {
        id: station.id,
        name: station.name,
        staffName: station.staffName,
        role: station.role
      }
    };

    const updated = stationsList.map(s => {
      if (s.id === stationId) {
        return {
          ...s,
          currentToken: tokenWithStation,
          timerSeconds: 0,
          totalServedToday: prevStationToken ? (s.totalServedToday || 0) + 1 : (s.totalServedToday || 0)
        };
      }
      return s;
    });
    saveStationsList(updated);

    if (!servingToken) {
      setServingToken(tokenWithStation);
      setCounterSeconds(0);
    }

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
      waitMin: nextToken.estWaitMin || 0,
      assignedStation: station.name
    });

    if (soundEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `Token ${nextToken.tokenNumber}. ${nextToken.customerName || 'Customer'}, please proceed to ${station.name}.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }

    syncWithCustomerStorage(tokenWithStation, prevStationToken);

    setAnnouncementMsg(`🪑 Calling Token ${nextToken.tokenNumber} to ${station.name} (${station.staffName})`);
    setTimeout(() => setAnnouncementMsg(''), 4500);
  };

  const handleOpenStationBilling = (stationId) => {
    const station = stationsList.find(s => s.id === stationId);
    if (!station || !station.currentToken) return;
    setBillingStationId(stationId);
    setBillServices(station.currentToken.service || 'General Service');
    setBillAmount('');
    setBillPaidAmount('');
    setBillPaymentMode('CASH');
    setBillNotes('');
    setBillingModalOpen(true);
  };

  const handleAnnounceStationToken = (stationId) => {
    const station = stationsList.find(s => s.id === stationId);
    if (!station || !station.currentToken) return;
    if (!soundEnabled) {
      setAnnouncementMsg('⚠️ Audio is currently MUTED. Click the Voice button in the header to Unmute.');
      setTimeout(() => setAnnouncementMsg(''), 4000);
      return;
    }
    playChime();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `Token ${station.currentToken.tokenNumber}. ${station.currentToken.customerName || 'Customer'}, please proceed to ${station.name}.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
    setAnnouncementMsg(`📢 Re-announced: Token ${station.currentToken.tokenNumber} to ${station.name}`);
    setTimeout(() => setAnnouncementMsg(''), 3500);
  };

  const handleMarkStationAbsent = (stationId) => {
    const station = stationsList.find(s => s.id === stationId);
    if (!station || !station.currentToken) return;
    const absToken = station.currentToken;
    const todayDate = new Date().toISOString().slice(0, 10);

    setAbsentList(prev => [
      {
        ...absToken,
        skippedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stationName: station.name
      },
      ...prev
    ]);

    updateRecordInHistory(activeShop, {
      id: absToken.id || `token-${absToken.tokenNumber}`,
      tokenNumber: absToken.tokenNumber,
      customerName: absToken.customerName,
      customerPhone: absToken.customerPhone || 'Offline',
      groupSize: absToken.groupSize || 1,
      service: absToken.service || 'General Service',
      date: todayDate,
      hour: new Date().getHours(),
      status: 'NO_SHOW',
      skippedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      assignedStation: station.name
    });

    syncWithCustomerStorage(null, null, absToken);

    const updated = stationsList.map(s => s.id === stationId ? { ...s, currentToken: null, timerSeconds: 0 } : s);
    saveStationsList(updated);

    if (servingToken?.tokenNumber === absToken.tokenNumber) {
      setServingToken(null);
      setCounterSeconds(0);
    }

    setAnnouncementMsg(`Skipped & Marked Absent: ${absToken.customerName} (${absToken.tokenNumber}) from ${station.name}`);
    setTimeout(() => setAnnouncementMsg(''), 4500);
  };

  // BRD FR-712: Customer Khata / Udhaar Operations Handlers
  const saveKhataList = (updated) => {
    setKhataList(updated);
    if (!activeShop || typeof window === 'undefined') return;
    try {
      localStorage.setItem(getKhataStorageKey(activeShop), JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  const recordKhataEntry = ({ customerName, customerPhone, amount, type, serviceOrReason, paymentMode, tokenNumber }) => {
    if (!amount || amount <= 0) return;
    const cleanPhone = (customerPhone || '').replace(/\D/g, '').slice(-10);
    const displayName = (customerName || 'Customer').trim();
    const todayIso = new Date().toISOString();

    setKhataList(prev => {
      let existingIdx = -1;
      if (cleanPhone) {
        existingIdx = prev.findIndex(c => c.customerPhone && c.customerPhone.replace(/\D/g, '').slice(-10) === cleanPhone);
      }
      if (existingIdx === -1 && displayName && displayName !== 'Customer') {
        existingIdx = prev.findIndex(c => c.customerName && c.customerName.toLowerCase() === displayName.toLowerCase());
      }

      let updatedList;
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const newBalance = type === 'CREDIT' 
          ? (existing.totalPending || 0) + Number(amount)
          : Math.max(0, (existing.totalPending || 0) - Number(amount));

        const newTx = {
          id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date: todayIso,
          type,
          amount: Number(amount),
          balanceAfter: newBalance,
          serviceOrReason: serviceOrReason || (type === 'CREDIT' ? 'Store service/product credit' : 'Payment received'),
          paymentMode: paymentMode || (type === 'CREDIT' ? 'UDHAAR' : 'CASH'),
          tokenNumber: tokenNumber || '-'
        };

        const updatedCustomer = {
          ...existing,
          customerName: displayName !== 'Customer' ? displayName : existing.customerName,
          customerPhone: cleanPhone || existing.customerPhone,
          totalPending: newBalance,
          lastUpdated: todayIso,
          transactions: [newTx, ...(existing.transactions || [])]
        };

        updatedList = [...prev];
        updatedList[existingIdx] = updatedCustomer;
      } else {
        const initialBalance = type === 'CREDIT' ? Number(amount) : 0;
        const newTx = {
          id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date: todayIso,
          type,
          amount: Number(amount),
          balanceAfter: initialBalance,
          serviceOrReason: serviceOrReason || (type === 'CREDIT' ? 'Initial credit entry' : 'Payment received'),
          paymentMode: paymentMode || (type === 'CREDIT' ? 'UDHAAR' : 'CASH'),
          tokenNumber: tokenNumber || '-'
        };

        const newCustomer = {
          id: `kh-${Date.now()}`,
          customerName: displayName,
          customerPhone: cleanPhone || 'Offline',
          totalPending: initialBalance,
          lastUpdated: todayIso,
          transactions: [newTx]
        };

        updatedList = [newCustomer, ...prev];
      }

      if (activeShop && typeof window !== 'undefined') {
        try {
          localStorage.setItem(getKhataStorageKey(activeShop), JSON.stringify(updatedList));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}
      }
      return updatedList;
    });
  };

  const handleOpenKhataEntryModal = (customer, actionType = 'PAYMENT') => {
    setSelectedKhataCustomer(customer);
    setKhataEntryType(actionType);
    setKhataEntryAmount(actionType === 'PAYMENT' ? String(customer.totalPending || '') : '');
    setKhataEntryMode('CASH');
    setKhataEntryNotes('');
    setKhataModalOpen(true);
  };

  const handleSaveKhataTransaction = (e) => {
    e.preventDefault();
    if (!selectedKhataCustomer) return;
    const numAmt = Number(khataEntryAmount);
    if (!numAmt || numAmt <= 0) {
      alert('Please enter a valid amount greater than ₹0.');
      return;
    }

    recordKhataEntry({
      customerName: selectedKhataCustomer.customerName,
      customerPhone: selectedKhataCustomer.customerPhone,
      amount: numAmt,
      type: khataEntryType,
      serviceOrReason: khataEntryNotes.trim() || (khataEntryType === 'PAYMENT' ? `Payment received via ${khataEntryMode}` : 'Manual credit entry added'),
      paymentMode: khataEntryMode,
      tokenNumber: '-'
    });

    setKhataModalOpen(false);
    playChime();
    setKhataFeedbackMsg(
      khataEntryType === 'PAYMENT'
        ? `✅ Jama Recorded: ₹${numAmt} received from ${selectedKhataCustomer.customerName} [${khataEntryMode}]`
        : `✅ Credit Recorded: ₹${numAmt} added to ${selectedKhataCustomer.customerName}'s Khata`
    );
    setTimeout(() => setKhataFeedbackMsg(''), 4000);
  };

  const handleCreateNewKhataCustomer = (e) => {
    e.preventDefault();
    if (!newKhataName.trim()) {
      alert('Please enter customer name.');
      return;
    }
    const due = Math.max(0, Number(newKhataInitialDue) || 0);
    const cleanPhone = newKhataPhone.replace(/\D/g, '').slice(-10);

    recordKhataEntry({
      customerName: newKhataName.trim(),
      customerPhone: cleanPhone,
      amount: due > 0 ? due : 0.001,
      type: 'CREDIT',
      serviceOrReason: newKhataNotes.trim() || 'Account opened in Khata ledger',
      paymentMode: 'OPENING_BALANCE'
    });

    if (due === 0) {
      setKhataList(prev => {
        const updated = prev.map(c => (c.customerName === newKhataName.trim()) ? { ...c, totalPending: 0 } : c);
        saveKhataList(updated);
        return updated;
      });
    }

    setNewKhataName('');
    setNewKhataPhone('');
    setNewKhataInitialDue('');
    setNewKhataNotes('');
    setNewCustomerKhataModalOpen(false);
    playChime();
    setKhataFeedbackMsg(`✅ Customer account registered in Khata successfully!`);
    setTimeout(() => setKhataFeedbackMsg(''), 4000);
  };

  const handleSendWhatsAppKhataReminder = (customer) => {
    if (!customer) return;
    const cleanPhone = (customer.customerPhone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('Customer does not have a valid 10-digit mobile number saved.');
      return;
    }

    const shopName = activeShop?.name || 'Hamari Dukan';
    const custName = customer.customerName || 'Customer';
    const pendingAmt = customer.totalPending || 0;

    const message = `Namaste ${custName} ji! 🙏\n\n${shopName} se aapka kul baqaya hisaab ₹${pendingAmt.toLocaleString('en-IN')} pending hai.\n\nKripya suvidha-anusar samay par UPI ya cash se clear kar dein. Kisi bhi sawaal ke liye sampark karein.\n\nDhanyawad! ✨\n— ${shopName}`;

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encoded}`;
    window.open(waUrl, '_blank');
    setKhataFeedbackMsg(`📲 WhatsApp reminder prepared for ${custName} (+91 ${cleanPhone})`);
    setTimeout(() => setKhataFeedbackMsg(''), 4000);
  };

  const handleDownloadKhataCsv = () => {
    const rows = [
      ['Customer Name', 'Phone Number', 'Total Pending Due (INR)', 'Last Transaction Date', 'Last Transaction Details', 'Total Transactions'],
      ...khataList.map(c => [
        `"${(c.customerName || 'Customer').replace(/"/g, '""')}"`,
        c.customerPhone || 'Offline',
        c.totalPending !== undefined ? c.totalPending : 0,
        c.lastUpdated ? new Date(c.lastUpdated).toLocaleDateString('en-IN') : 'Recent',
        `"${((c.transactions && c.transactions[0]?.serviceOrReason) || 'Account opened').replace(/"/g, '""')}"`,
        c.transactions ? c.transactions.length : 0
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeShop?.slug || 'shop'}-customer-khata-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setKhataFeedbackMsg(`📥 Exported ${khataList.length} customer Khata ledger accounts to CSV.`);
    setTimeout(() => setKhataFeedbackMsg(''), 4000);
  };

  // BRD FR-711: Staff Attendance & Multi-Operator Operations Handlers
  const saveStaffList = (updated) => {
    setStaffList(updated);
    if (!activeShop || typeof window === 'undefined') return;
    try {
      localStorage.setItem(getStaffStorageKey(activeShop), JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  const saveOwnerPin = (newPin) => {
    setOwnerMasterPin(newPin);
    if (!activeShop || typeof window === 'undefined') return;
    try {
      localStorage.setItem(getOwnerPinStorageKey(activeShop), newPin);
    } catch (e) {}
  };

  const handleTriggerStaffPinModal = (staffMember, action = 'SWITCH') => {
    setPinTargetStaff(staffMember);
    setPinAction(action);
    setPinInput('');
    setPinError('');
    setStaffPinModalOpen(true);
  };

  const handleVerifyAndExecutePin = () => {
    if (!pinTargetStaff) {
      setPinError('No operator selected.');
      return;
    }

    const expectedPin = pinTargetStaff === 'OWNER' ? ownerMasterPin : (pinTargetStaff.pin || '1111');
    if (pinInput !== expectedPin) {
      playAlert();
      setPinError(`Incorrect 4-digit PIN! (Default demo PIN: ${expectedPin})`);
      setPinInput('');
      return;
    }

    // PIN is correct!
    playChime();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (pinTargetStaff === 'OWNER') {
      setIsOwnerUnlocked(true);
      setStaffPinModalOpen(false);
      setStaffManageModalOpen(true);
      setStaffFeedbackMsg('🔓 Owner Master Mode Unlocked!');
      setTimeout(() => setStaffFeedbackMsg(''), 4000);
      return;
    }

    const staffId = pinTargetStaff.id;
    let feedback = '';

    const updated = staffList.map(st => {
      if (st.id === staffId) {
        if (pinAction === 'CLOCK_IN') {
          feedback = `✅ ${st.name} punched CLOCK-IN at ${nowTimeStr} (On Duty)`;
          return { ...st, status: 'ON_DUTY', clockInTime: nowTimeStr };
        } else if (pinAction === 'CLOCK_OUT') {
          feedback = `👋 ${st.name} punched CLOCK-OUT at ${nowTimeStr} (Off Duty)`;
          return { ...st, status: 'OFF_DUTY', clockOutTime: nowTimeStr };
        } else if (pinAction === 'BREAK') {
          const newStatus = st.status === 'ON_BREAK' ? 'ON_DUTY' : 'ON_BREAK';
          feedback = newStatus === 'ON_BREAK'
            ? `☕ ${st.name} stepped out on BREAK at ${nowTimeStr}`
            : `⚡ ${st.name} resumed duty from break at ${nowTimeStr}`;
          return { ...st, status: newStatus };
        } else if (pinAction === 'SWITCH') {
          feedback = `👤 Active operator switched to ${st.name}`;
          return { ...st, status: 'ON_DUTY', clockInTime: st.clockInTime || nowTimeStr };
        }
      }
      return st;
    });

    saveStaffList(updated);
    const updatedStaff = updated.find(s => s.id === staffId);
    if (updatedStaff) {
      setActiveOperator(updatedStaff);
    }
    setStaffPinModalOpen(false);
    setStaffFeedbackMsg(feedback);
    setTimeout(() => setStaffFeedbackMsg(''), 4500);
  };

  const handleAddStaffMember = (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) {
      alert('Please enter staff operator name.');
      return;
    }
    const cleanPin = (newStaffPin || '1234').trim().replace(/\D/g, '').slice(0, 4) || '1234';
    const cleanPhone = (newStaffPhone || '').replace(/\D/g, '').slice(-10);

    const newMember = {
      id: `stf-${Date.now().toString().slice(-4)}`,
      name: newStaffName.trim(),
      role: newStaffRole.trim() || 'Service Operator',
      phone: cleanPhone || '9876543210',
      pin: cleanPin,
      status: 'ON_DUTY',
      clockInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clockOutTime: null,
      servedCountToday: 0,
      revenueGeneratedToday: 0
    };

    const updated = [...staffList, newMember];
    saveStaffList(updated);
    setActiveOperator(newMember);

    setNewStaffName('');
    setNewStaffRole('');
    setNewStaffPhone('');
    setNewStaffPin('');
    playChime();
    setStaffFeedbackMsg(`✅ Added operator "${newMember.name}" with PIN ${newMember.pin}`);
    setTimeout(() => setStaffFeedbackMsg(''), 4000);
  };

  const handleDeleteStaffMember = (staffId) => {
    if (staffList.length <= 1) {
      alert('At least 1 staff operator must remain registered.');
      return;
    }
    const toRemove = staffList.find(s => s.id === staffId);
    if (!confirm(`Are you sure you want to remove ${toRemove?.name || 'this operator'}?`)) return;

    const updated = staffList.filter(s => s.id !== staffId);
    saveStaffList(updated);
    if (activeOperator?.id === staffId) {
      setActiveOperator(updated[0] || null);
    }
    setStaffFeedbackMsg(`🗑️ Removed operator: ${toRemove?.name}`);
    setTimeout(() => setStaffFeedbackMsg(''), 4000);
  };

  const handleDownloadStaffAttendanceCsv = () => {
    const rows = [
      ['Staff Name', 'Role', 'Status', 'Clock In Time', 'Clock Out Time', 'Customers Served Today', 'Revenue Generated Today (INR)', 'Contact Phone'],
      ...staffList.map(s => [
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${(s.role || '').replace(/"/g, '""')}"`,
        s.status,
        s.clockInTime || 'Not punched',
        s.clockOutTime || '-',
        s.servedCountToday || 0,
        s.revenueGeneratedToday || 0,
        s.phone || '-'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeShop?.slug || 'shop'}-staff-attendance-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStaffFeedbackMsg(`📥 Exported attendance & cuts report for ${staffList.length} staff operators.`);
    setTimeout(() => setStaffFeedbackMsg(''), 4000);
  };

  // 1-Tap Clean Start: Purge all local dummy/test records for clean real-time verification
  const handleClearAllDummyData = () => {
    if (typeof window === 'undefined') return;
    if (!confirm('Kya aap sach me saara purana test / dummy data clear karke fresh real-time session start karna chahte hain?')) return;

    // Remove all local storage keys related to tokens, queue, history, khata, reviews
    localStorage.removeItem('ak_customer_tokens');
    localStorage.removeItem('ak_customer_history');
    if (activeShop) {
      localStorage.removeItem(getStorageKey(activeShop));
      localStorage.removeItem(getKhataStorageKey(activeShop));
      localStorage.removeItem(getReviewsStorageKey(activeShop));
      localStorage.removeItem(getStaffStorageKey(activeShop));
      localStorage.removeItem(getStationsStorageKey(activeShop));
      localStorage.removeItem(`ak_merchant_cap_${(activeShop.slug || 'shop').toLowerCase()}`);
      localStorage.removeItem(`ak_shop_break_${(activeShop.slug || 'shop').toLowerCase()}`);
      localStorage.removeItem(getBroadcastStorageKey(activeShop));
    }

    // Reset local component states to zero
    setWaitingQueue([]);
    setServingToken(null);
    setCompletedList([]);
    setAbsentList([]);
    setShopRecords([]);
    setKhataList([]);
    setReviewsList([]);
    setActiveBroadcast(null);
    setBreakRemainingSeconds(0);
    setShopStatus('OPEN');

    if (activeShop) {
      const freshStaff = loadShopStaff(activeShop);
      setStaffList(freshStaff);
      setActiveOperator(freshStaff[0] || null);
      const freshStations = loadShopStations(activeShop);
      setStationsList(freshStations);
    }

    window.dispatchEvent(new Event('storage'));
    playChime();
    setAnnouncementMsg('✨ All old test data deleted! Ready for clean real-time customer testing.');
    setTimeout(() => setAnnouncementMsg(''), 5000);
  };

  // Sync token state changes with customer localStorage
  const syncWithCustomerStorage = (nextServing, prevCompleted, nextAbsent, billDetails) => {
    if (typeof window === 'undefined') return;
    try {
      const storedStr = localStorage.getItem('ak_customer_tokens');
      if (storedStr) {
        const list = JSON.parse(storedStr);
        if (Array.isArray(list)) {
          const matchTarget = (t, target) => {
            if (!target) return false;
            if (t.id && target.id && String(t.id) === String(target.id)) return true;
            const cleanT = String(t.displayToken || t.tokenNumber || '').replace(/\D/g, '');
            const cleanTarget = String(target.displayToken || target.tokenNumber || '').replace(/\D/g, '');
            return Boolean(cleanT && cleanTarget && cleanT === cleanTarget);
          };

          const updated = list.map(t => {
            if (nextServing && matchTarget(t, nextServing)) {
              return { 
                ...t, 
                status: 'SERVING', 
                peopleAhead: 0, 
                estimatedWaitMin: 0,
                assignedStation: nextServing.assignedStation || t.assignedStation || null
              };
            }
            if (prevCompleted && matchTarget(t, prevCompleted)) {
              return { 
                ...t, 
                status: 'COMPLETED',
                completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                duration: `${Math.max(1, Math.floor(counterSeconds / 60))} min`,
                amount: billDetails?.amount !== undefined ? billDetails.amount : (t.amount || 0),
                paymentMode: billDetails?.paymentMode || t.paymentMode || '-',
                serviceDetails: billDetails?.serviceDetails || t.customerPurpose || t.service,
                assignedStation: prevCompleted.assignedStation || t.assignedStation || null
              };
            }
            if (nextAbsent && matchTarget(t, nextAbsent)) {
              return { 
                ...t, 
                status: 'NO_SHOW',
                skippedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                assignedStation: nextAbsent.assignedStation || t.assignedStation || null
              };
            }
            return t;
          });
          localStorage.setItem('ak_customer_tokens', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
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
      if (activeShop?.id && servingToken.id) {
        queueApi.completeToken(activeShop.id, servingToken.id).catch(() => {});
      }

      setCompletedList(prev => [
        {
          id: servingToken.id,
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

    // Advance backend queue status
    if (activeShop?.id) {
      queueApi.callNext(activeShop.id).catch(() => {});
    }

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
    setBillingStationId(null);
    setBillServices(servingToken.service || 'General Service');
    setBillAmount('');
    setBillPaidAmount('');
    setBillPaymentMode('CASH');
    setBillNotes('');
    setBillingModalOpen(true);
  };

  // Action: Finalize Service (With Bill Amount or Optional Skip)
  const handleFinalizeService = ({ skipBilling = false } = {}) => {
    // If billingStationId is set, find that station and its currentToken
    const activeStation = billingStationId ? stationsList.find(s => s.id === billingStationId) : null;
    const tokenToFinalize = activeStation?.currentToken || servingToken;
    if (!tokenToFinalize) return;

    const durationMins = activeStation 
      ? Math.max(1, Math.floor((activeStation.timerSeconds || 0) / 60))
      : Math.max(1, Math.floor(counterSeconds / 60));
    const todayDate = new Date().toISOString().slice(0, 10);
    const finalAmount = skipBilling ? 0 : (Number(billAmount) || 0);
    const finalPayment = skipBilling ? '-' : (finalAmount > 0 ? billPaymentMode : '-');
    const finalServices = billServices.trim() || tokenToFinalize.service || 'General Service';
    const finalNotes = billNotes.trim();

    // BRD FR-712: Check if there is Udhaar / Pending Balance to record in Khata Ledger
    let pendingUdhaar = 0;
    let actualPaid = finalAmount;
    if (billPaymentMode === 'PENDING') {
      pendingUdhaar = finalAmount;
      actualPaid = 0;
    } else if (billPaymentMode === 'PARTIAL') {
      actualPaid = Math.min(finalAmount, Math.max(0, Number(billPaidAmount) || 0));
      pendingUdhaar = Math.max(0, finalAmount - actualPaid);
    }

    if (pendingUdhaar > 0) {
      recordKhataEntry({
        customerName: tokenToFinalize.customerName || 'Customer',
        customerPhone: tokenToFinalize.customerPhone || '',
        amount: pendingUdhaar,
        type: 'CREDIT',
        serviceOrReason: `${finalServices}${actualPaid > 0 ? ` (₹${actualPaid} paid, ₹${pendingUdhaar} pending)` : ''}`,
        paymentMode: billPaymentMode,
        tokenNumber: tokenToFinalize.tokenNumber
      });
    }

    // Sync with customer storage
    syncWithCustomerStorage(null, tokenToFinalize, null, {
      amount: finalAmount,
      paymentMode: finalPayment,
      serviceDetails: finalServices
    });

    if (activeShop?.id && tokenToFinalize.id) {
      queueApi.completeToken(activeShop.id, tokenToFinalize.id).catch(() => {});
    }

    const completedRecord = {
      tokenNumber: tokenToFinalize.tokenNumber,
      customerName: tokenToFinalize.customerName,
      customerPhone: tokenToFinalize.customerPhone || 'Offline',
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: `${durationMins} min`,
      amount: finalAmount,
      paymentMode: finalPayment,
      service: finalServices,
      serviceBreakdown: finalServices,
      billNotes: finalNotes,
      stationName: activeStation ? activeStation.name : undefined
    };

    setCompletedList(prev => [completedRecord, ...prev]);

    updateRecordInHistory(activeShop, {
      id: tokenToFinalize.id || `token-${tokenToFinalize.tokenNumber}`,
      tokenNumber: tokenToFinalize.tokenNumber,
      customerName: tokenToFinalize.customerName,
      customerPhone: tokenToFinalize.customerPhone || 'Offline',
      groupSize: tokenToFinalize.groupSize || 1,
      service: finalServices,
      serviceBreakdown: finalServices,
      date: todayDate,
      hour: new Date().getHours(),
      status: 'COMPLETED',
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMin: durationMins,
      amount: finalAmount,
      paymentMode: finalPayment,
      billNotes: finalNotes,
      assignedStation: activeStation ? activeStation.name : undefined
    });

    if (billingStationId) {
      const updatedStations = stationsList.map(st => {
        if (st.id === billingStationId) {
          return {
            ...st,
            currentToken: null,
            timerSeconds: 0,
            totalServedToday: (st.totalServedToday || 0) + 1
          };
        }
        return st;
      });
      saveStationsList(updatedStations);
      if (servingToken?.tokenNumber === tokenToFinalize.tokenNumber) {
        setServingToken(null);
        setCounterSeconds(0);
      }
      setBillingStationId(null);
    } else {
      setServingToken(null);
      setCounterSeconds(0);
    }

    // BRD FR-711: Attribute service count & revenue to Active Operator or Station Staff
    if (staffList.length > 0) {
      const staffToCredit = activeStation?.staffName
        ? staffList.find(s => s.name.toLowerCase().includes(activeStation.staffName.toLowerCase()) || activeStation.staffName.toLowerCase().includes(s.name.toLowerCase())) || activeOperator || staffList[0]
        : activeOperator || staffList[0];

      if (staffToCredit) {
        const updatedStaff = staffList.map(s => {
          if (s.id === staffToCredit.id) {
            return {
              ...s,
              servedCountToday: (s.servedCountToday || 0) + 1,
              revenueGeneratedToday: (s.revenueGeneratedToday || 0) + finalAmount
            };
          }
          return s;
        });
        saveStaffList(updatedStaff);
      }
    }

    setBillingModalOpen(false);

    if (finalAmount > 0) {
      setAnnouncementMsg(`✅ Recorded: ${tokenToFinalize.customerName} (${tokenToFinalize.tokenNumber}). Total: ₹${finalAmount.toLocaleString('en-IN')} [${finalPayment}]`);
    } else {
      setAnnouncementMsg(`✅ Marked Completed: ${tokenToFinalize.customerName} (${tokenToFinalize.tokenNumber})`);
    }
    setTimeout(() => setAnnouncementMsg(''), 4500);
  };

  // Action: Mark Absent / Skip
  const handleMarkAbsent = () => {
    if (!servingToken) return;
    const todayDate = new Date().toISOString().slice(0, 10);

    if (activeShop?.id && servingToken.id) {
      queueApi.markNoShow(activeShop.id, servingToken.id).catch(() => {});
    }

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
              href="/merchant/register?tab=login"
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

  // Calculate Review Analytics (BRD FR-1105)
  const totalReviewsCount = reviewsList.length;
  const avgRating = totalReviewsCount > 0 
    ? (reviewsList.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalReviewsCount).toFixed(1)
    : '4.8';
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviewsList.filter(r => r.rating === stars).length;
    const percent = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { stars, count, percent };
  });
  const repliedCount = reviewsList.filter(r => r.merchantReply).length;

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
                {activeShop?.name || 'Apni Dukan Darj Karein'}
              </h1>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#DCE9E3] text-[#176B65]">
                {activeShop?.categoryName || 'Dukan'}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('REVIEWS')}
                className="flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 transition-colors cursor-pointer"
                title="View customer star ratings & feedback (FR-1105)"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{avgRating} ({totalReviewsCount} reviews)</span>
              </button>
            </div>

            <p className="text-xs text-[#283B3D]/70 font-medium flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#F2A15A]" />
              <span>{activeShop?.zone ? `${activeShop.zone}, Lucknow` : 'Location Not Set'}</span>
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

          {/* Counter QR Standee Generator Button (BRD FR-605 / FR-302) */}
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/40 text-xs font-bold text-[#283B3D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            title="Generate & print branded counter tabletop QR standee (FR-605)"
          >
            <QrCode className="w-4 h-4 text-[#176B65]" />
            <span className="hidden sm:inline">Counter QR Standee</span>
            <span className="sm:hidden">QR Standee</span>
          </button>

          {/* Shop Profile & Timings Editor Button (BRD FR-602) */}
          <button
            type="button"
            onClick={handleOpenProfileModal}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/40 text-xs font-bold text-[#283B3D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            title="Edit Operating Hours, Service Pace, Contact & Weekly Off (FR-602)"
          >
            <Settings className="w-4 h-4 text-[#176B65]" />
            <span className="hidden sm:inline">Shop Profile & Timings</span>
            <span className="sm:hidden">Settings</span>
          </button>

          {/* Universal Service Menu & Rate Card Button (BRD FR-604 / FR-1201) */}
          <button
            type="button"
            onClick={() => setServicesModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/40 text-xs font-bold text-[#283B3D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            title="Manage Category Rate Card, Prices and Services (FR-604)"
          >
            <Receipt className="w-4 h-4 text-[#176B65]" />
            <span className="hidden sm:inline">Rate Card & Menu</span>
            <span className="sm:hidden">Rate Card</span>
          </button>

          {/* Multi-Counter / Multi-Station Studio Button (BRD FR-709) */}
          <button
            type="button"
            onClick={() => setStationModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/40 text-xs font-bold text-[#283B3D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            title="Manage Multi-Chairs, Doctors or Counter Desks (FR-709)"
          >
            <Users className="w-4 h-4 text-[#176B65]" />
            <span className="hidden sm:inline">Counters & Chairs</span>
            <span className="sm:hidden">Counters</span>
            <span className="ml-0.5 text-[10px] font-black bg-[#DCE9E3] text-[#176B65] px-1.5 py-0.5 rounded-full">
              {stationsList.filter(s => s.active).length}
            </span>
          </button>

          {/* Customer Khata & Udhaar Button (BRD FR-712) */}
          <button
            type="button"
            onClick={() => setActiveTab('KHATA')}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/40 text-xs font-bold text-[#283B3D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            title="Customer Khata, Udhaar & Pending Balances (FR-712)"
          >
            <BookOpen className="w-4 h-4 text-[#176B65]" />
            <span className="hidden sm:inline">Khata Ledger</span>
            <span className="sm:hidden">Khata</span>
            <span className="ml-0.5 text-[10px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full border border-rose-200">
              ₹{khataList.reduce((acc, c) => acc + (c.totalPending || 0), 0).toLocaleString('en-IN')}
            </span>
          </button>

          {/* Staff Operator & Attendance PIN Switch Button (BRD FR-711) */}
          <button
            type="button"
            onClick={() => handleTriggerStaffPinModal(activeOperator || staffList[0] || null, 'SWITCH')}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/40 text-xs font-bold text-[#283B3D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            title="Switch active operator or punch attendance with PIN (FR-711)"
          >
            <KeyRound className="w-4 h-4 text-[#176B65]" />
            <span className="hidden sm:inline">
              Staff: <span className="text-[#176B65] font-black">{activeOperator?.name?.split(' ')[0] || 'Staff'}</span>
            </span>
            <span className="sm:hidden">Staff</span>
            {activeOperator?.status === 'ON_DUTY' ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="On Duty" />
            ) : activeOperator?.status === 'ON_BREAK' ? (
              <span className="w-2 h-2 rounded-full bg-amber-500 ml-0.5" title="On Break" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-300 ml-0.5" title="Off Duty" />
            )}
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
                if (waitingQueue.length > 0 || servingToken) {
                  setResetModalOpen(true);
                } else {
                  if (breakRemainingSeconds > 0) handleEndBreak();
                  setShopStatus('CLOSED');
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                shopStatus === 'CLOSED' ? 'bg-rose-600 text-white shadow-xs' : 'text-[#283B3D]/70 hover:text-[#283B3D]'
              }`}
            >
              Closed
            </button>
          </div>

          {/* Purge All Dummy Data & Fresh Session (Clean Testing) */}
          <button
            type="button"
            onClick={handleClearAllDummyData}
            className="px-3 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            title="Purge all old test tokens and local data for a clean real-time test"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Fresh Start (Clean)</span>
            <span className="sm:hidden">Reset</span>
          </button>

          {/* Day-End Close & Reset Queue Button (BRD FR-708) */}
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-[#283B3D] hover:bg-[#1f2e30] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            title="Review final hisaab, expire remaining queue, and reset to Token #1 for tomorrow (FR-708)"
          >
            <Moon className="w-4 h-4 text-[#F2A15A]" />
            <span className="hidden sm:inline">Day-End Close</span>
            <span className="sm:hidden">Reset</span>
          </button>

          {/* Emergency Flash Queue Broadcast Alert Button (BRD FR-708 / FR-405) */}
          <button
            type="button"
            onClick={() => setBroadcastModalOpen(true)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
              activeBroadcast
                ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-400 shadow-md'
                : 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900'
            }`}
            title="Broadcast emergency delay alert to all waiting customer passes (FR-405)"
          >
            <Radio className={`w-4 h-4 ${activeBroadcast ? 'text-white animate-pulse' : 'text-amber-600'}`} />
            <span className="hidden sm:inline">{activeBroadcast ? 'Broadcast Live' : 'Flash Alert'}</span>
            <span className="sm:hidden">Alert</span>
            {activeBroadcast && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />
            )}
          </button>

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

      {/* Active Emergency Flash Queue Broadcast Alert Banner (BRD FR-708 / FR-405) */}
      <AnimatePresence>
        {activeBroadcast && activeBroadcast.active && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 sm:p-5 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-2 ${
              activeBroadcast.severity === 'CRITICAL'
                ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 border-rose-300'
                : activeBroadcast.severity === 'INFO'
                ? 'bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 border-teal-300'
                : 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 border-amber-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Siren className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider font-black bg-white/25 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                    <Radio className="w-3 h-3 animate-ping" />
                    Emergency Flash Broadcast • {activeBroadcast.reason}
                  </span>
                  {activeBroadcast.delayMinutes > 0 && (
                    <span className="text-xs font-mono font-black bg-black/40 px-2.5 py-0.5 rounded-md text-amber-200">
                      ⏱️ +{activeBroadcast.delayMinutes}m delay added to all customer passes
                    </span>
                  )}
                  <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-md text-white/90">
                    Live across all customer passes
                  </span>
                </div>
                <p className="text-xs text-white/95 font-semibold">
                  &ldquo;{activeBroadcast.message}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setBroadcastModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer border border-white/30 text-center"
              >
                Edit Alert
              </button>
              <button
                type="button"
                onClick={handleClearBroadcast}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-white/90 text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dismiss & Restore</span>
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

          <button
            type="button"
            onClick={() => setActiveTab('KHATA')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'KHATA'
                ? 'bg-[#176B65] text-white shadow-md'
                : 'text-[#283B3D]/70 hover:bg-[#DCE9E3]/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Khata & Udhaar</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'KHATA' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              ₹{khataList.reduce((acc, c) => acc + (c.totalPending || 0), 0).toLocaleString('en-IN')} Due
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'PROFILE'
                ? 'bg-[#176B65] text-white shadow-md'
                : 'text-[#283B3D]/70 hover:bg-[#DCE9E3]/40'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Shop Profile & Timings</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 hidden sm:inline-block border border-emerald-300">
              FR-602
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REVIEWS')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'REVIEWS'
                ? 'bg-[#176B65] text-white shadow-md'
                : 'text-[#283B3D]/70 hover:bg-[#DCE9E3]/40'
            }`}
          >
            <Star className="w-4 h-4 text-[#F2A15A]" />
            <span>Customer Reviews</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'REVIEWS' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              ★ {avgRating}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STAFF')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'STAFF'
                ? 'bg-[#176B65] text-white shadow-md'
                : 'text-[#283B3D]/70 hover:bg-[#DCE9E3]/40'
            }`}
          >
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span>Staff & Attendance</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'STAFF' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {staffList.filter(s => s.status === 'ON_DUTY').length}/{staffList.length} On Duty
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
          {/* MULTI-COUNTER & MULTI-CHAIR OPERATIONAL STATIONS (BRD FR-709) */}
          {/* ========================================================= */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DCE9E3] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE9E3] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-[#283B3D]">
                      Multi-Station & Multi-Desk Calling Grid
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#176B65] text-white">
                      BRD FR-709
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      ({stationsList.filter(s => s.active).length} of {stationsList.length} Active)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#283B3D]/70 font-semibold mt-0.5">
                    Independent calling & billing for barbers, doctors, pharmacy counters & checkout bays.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setStationModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F3F1E9] hover:bg-[#DCE9E3] border border-[#DCE9E3] text-xs font-bold text-[#283B3D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-[#176B65]" />
                  <span>Manage Stations</span>
                </button>
              </div>
            </div>

            {/* Stations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {stationsList.map((station) => {
                const isStationServing = !!station.currentToken;
                return (
                  <div
                    key={station.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      !station.active
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : isStationServing
                        ? 'bg-gradient-to-br from-emerald-50/80 via-white to-white border-emerald-300 shadow-xs'
                        : 'bg-[#F3F1E9]/40 border-[#DCE9E3] hover:border-[#176B65]/40'
                    }`}
                  >
                    <div>
                      {/* Station Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#DCE9E3]/70 pb-2.5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[#283B3D]">{station.name}</span>
                            <span className={`w-2 h-2 rounded-full ${station.active ? (isStationServing ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500') : 'bg-slate-400'}`}></span>
                          </div>
                          <span className="text-[11px] text-[#283B3D]/70 font-semibold block line-clamp-1">
                            {station.staffName} {station.role ? `• ${station.role}` : ''}
                          </span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          !station.active
                            ? 'bg-slate-200 text-slate-600'
                            : isStationServing
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {!station.active ? 'On Leave' : isStationServing ? 'Serving' : 'Available'}
                        </span>
                      </div>

                      {/* Station Content */}
                      <div className="py-3">
                        {isStationServing ? (
                          <div className="space-y-2">
                            <div className="flex items-baseline justify-between">
                              <span className="text-2xl font-token font-bold text-emerald-800">
                                {station.currentToken.tokenNumber}
                              </span>
                              <span className="text-[11px] font-bold text-[#283B3D]/70 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#176B65]" />
                                <span>{formatTimer(station.timerSeconds || 0)}</span>
                              </span>
                            </div>
                            <div className="text-xs font-bold text-[#283B3D] line-clamp-1">
                              {station.currentToken.customerName || 'Customer'}
                            </div>
                            <div className="text-[11px] text-[#176B65] font-semibold bg-[#DCE9E3]/60 px-2 py-0.5 rounded-md line-clamp-1">
                              {station.currentToken.service || 'General Service'}
                            </div>
                          </div>
                        ) : (
                          <div className="py-3 text-center space-y-1">
                            <span className="text-xs font-bold text-slate-400 block">
                              {station.active ? 'Chair / Desk is Empty' : 'Marked Inactive / Off-duty'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {station.totalServedToday || 0} served today
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Station Actions */}
                    <div className="pt-2 border-t border-[#DCE9E3]/70 space-y-1.5">
                      {station.active && isStationServing && (
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenStationBilling(station.id)}
                            className="col-span-2 py-2 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                            title="Complete service & enter billing amount"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done & Bill</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarkStationAbsent(station.id)}
                            className="py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                            title="Customer not present at this counter"
                          >
                            <span>Skip</span>
                          </button>
                        </div>
                      )}

                      {station.active && !isStationServing && (
                        <button
                          type="button"
                          onClick={() => handleCallNextForStation(station.id)}
                          disabled={waitingQueue.length === 0}
                          className="w-full py-2.5 rounded-xl bg-[#176B65] hover:bg-[#125550] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 shadow-xs"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#F2A15A]" />
                          <span>Call Next Here {waitingQueue.length > 0 ? `(${waitingQueue[0].tokenNumber})` : ''}</span>
                        </button>
                      )}

                      {station.active && isStationServing && (
                        <button
                          type="button"
                          onClick={() => handleAnnounceStationToken(station.id)}
                          className="w-full py-1 rounded-lg text-slate-500 hover:text-[#176B65] text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Re-announce to {station.name}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
                    <div className="flex items-center gap-2 justify-start sm:justify-end flex-wrap">
                      <span className="text-xs text-slate-400">+91 {servingToken.customerPhone}</span>
                      {servingToken.customerPhone && servingToken.customerPhone !== 'Offline' && (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${servingToken.customerPhone}`}
                            className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#DCE9E3] text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                            title="Direct Phone Call"
                          >
                            <PhoneCall className="w-3 h-3 text-emerald-400" />
                            <span>Call</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDirectWhatsAppSend(servingToken, 'SERVING_NOW')}
                            className="px-2 py-0.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95 transition-all"
                            title="Send WhatsApp Serving Now Alert"
                          >
                            <MessageCircle className="w-3 h-3 fill-current" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      )}
                    </div>
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
                  <div
                    key={a.tokenNumber}
                    className="p-1.5 pl-2.5 rounded-xl bg-white border border-amber-300 flex items-center gap-2 shadow-2xs"
                  >
                    <span className="text-[#176B65] font-token font-bold text-xs">{a.tokenNumber}</span>
                    <span className="text-xs font-bold text-[#283B3D]">{a.customerName}</span>
                    <button
                      type="button"
                      onClick={() => handleRecallAbsent(a)}
                      className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold cursor-pointer transition-colors"
                      title="Recall customer back to active counter"
                    >
                      Recall Desk
                    </button>
                    {a.customerPhone && a.customerPhone !== 'Offline' && (
                      <button
                        type="button"
                        onClick={() => handleDirectWhatsAppSend(a, 'ABSENT_RECALL')}
                        className="p-1 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-[10px] cursor-pointer transition-colors"
                        title="Send WhatsApp Turn Missed Hold Alert"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day-End Settlement Card (BRD FR-708) */}
          <div className="bg-gradient-to-r from-slate-900 to-[#283B3D] text-[#F3F1E9] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5 text-[#F2A15A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black">Day-End Queue Settlement</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-[#F2A15A]">
                    FR-708
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                  Pack up for tonight: expire remaining queue, finalize hisaab, and reset to fresh Token #1 for tomorrow.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#176B65] hover:bg-[#135853] text-white font-black text-xs shrink-0 cursor-pointer shadow-xs active:scale-95 w-full sm:w-auto text-center"
            >
              Close Day & Reset
            </button>
          </div>

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
                const sentTime = whatsappSentMap[item.tokenNumber];

                return (
                  <div 
                    key={`${item.id || item.tokenNumber}-${index}`}
                    className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-[#F3F1E9]/70 transition-all border border-transparent hover:border-[#DCE9E3]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 ${
                        index === 0 ? 'bg-[#176B65] text-white shadow-xs' : 'bg-[#DCE9E3] text-[#176B65]'
                      }`}>
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-token font-bold text-sm text-[#176B65]">{item.tokenNumber}</span>
                          <span className="font-black text-xs text-[#283B3D] truncate">{item.customerName}</span>
                          {index === 0 && (
                            <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                              Next
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#283B3D]/70">
                          <span className="truncate">{item.service}</span>
                          <span>•</span>
                          <span>~{item.estWaitMin}m</span>
                          {sentTime && (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              ✓ WA Sent {sentTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasPhone && (
                        <>
                          <a
                            href={`tel:${item.customerPhone}`}
                            title={`Direct phone call to +91 ${item.customerPhone}`}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#283B3D] transition-colors cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleOpenWhatsAppModal(item, index === 0 ? 'CALLING_SOON' : 'CALLING_SOON')}
                            title="Send WhatsApp Turn Reminder"
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95 ${
                              sentTime
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-[#25D366] hover:bg-[#20ba59] text-white'
                            }`}
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline">{sentTime ? 'Ping Again' : 'WA Ping'}</span>
                          </button>
                        </>
                      )}

                      <span className="text-[10px] font-bold text-[#176B65] bg-[#DCE9E3] px-2 py-1 rounded-lg">
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
      {/* TAB: CUSTOMER KHATA / UDHAAR & BALANCE LEDGER (BRD FR-712) */}
      {/* ========================================================= */}
      {activeTab === 'KHATA' && (() => {
        const totalPendingDue = khataList.reduce((sum, c) => sum + (c.totalPending || 0), 0);
        const customersWithDue = khataList.filter(c => (c.totalPending || 0) > 0);
        const settledCustomers = khataList.filter(c => (c.totalPending || 0) === 0);

        // Filter and search
        const cleanQuery = khataSearch.trim().toLowerCase();
        const digitsQuery = khataSearch.replace(/\D/g, '');
        let filteredKhata = khataList.filter(c => {
          if (cleanQuery) {
            const nameMatch = (c.customerName || '').toLowerCase().includes(cleanQuery);
            const rawPhone = (c.customerPhone || '');
            const digitsPhone = rawPhone.replace(/\D/g, '');
            const phoneMatch = rawPhone.includes(cleanQuery) || (digitsQuery && digitsPhone.includes(digitsQuery));
            const reasonMatch = c.transactions && c.transactions.some(tx => (tx.serviceOrReason || '').toLowerCase().includes(cleanQuery));
            if (!nameMatch && !phoneMatch && !reasonMatch) return false;
          }
          if (khataFilter === 'DUE') return (c.totalPending || 0) > 0;
          if (khataFilter === 'SETTLED') return (c.totalPending || 0) === 0;
          if (khataFilter === 'HIGH') return (c.totalPending || 0) >= 300;
          return true;
        });

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Feedback Alert */}
            {khataFeedbackMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
                <span>{khataFeedbackMsg}</span>
              </div>
            )}

            {/* KEY METRICS SUMMARY */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="urban-card rounded-2xl p-4 space-y-1 bg-gradient-to-br from-rose-50 to-white border-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Total Market Udhaar</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-rose-700">
                  ₹{totalPendingDue.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-rose-600/80 font-semibold block">Pending to be collected</span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Khata Customers</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-[#176B65]">
                  {khataList.length}
                </div>
                <span className="text-[11px] text-[#283B3D]/70 font-semibold block">Total Registered Accounts</span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Accounts Due</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-amber-700">
                  {customersWithDue.length}
                </div>
                <span className="text-[11px] text-[#283B3D]/70 font-semibold block">Customers with balance</span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Zero Balance</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-emerald-700">
                  {settledCustomers.length}
                </div>
                <span className="text-[11px] text-emerald-700/80 font-semibold block">Fully Cleared / Settled</span>
              </div>
            </div>

            {/* Khata Ledger Main Table Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DCE9E3] shadow-xs space-y-5">
              {/* Card Header with Search & CTAs */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DCE9E3] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-base text-[#283B3D]">
                        Customer Khata & Udhaar Ledger
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#176B65] text-white">
                        BRD FR-712
                      </span>
                    </div>
                    <p className="text-[11px] text-[#283B3D]/70 font-semibold mt-0.5">
                      Track pending balances, record partial payments (Jama), and send 1-tap WhatsApp reminders.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCustomerKhataModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Customer Khata</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadKhataCsv}
                    className="px-3.5 py-2 rounded-xl bg-[#F3F1E9] hover:bg-[#DCE9E3] border border-[#DCE9E3] text-xs font-bold text-[#283B3D] transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Export customer balances to CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-[#176B65]" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3F1E9]/50 p-3 rounded-2xl border border-[#DCE9E3]">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by customer name or phone number..."
                    value={khataSearch}
                    onChange={(e) => setKhataSearch(e.target.value)}
                    className="w-full bg-white border border-[#DCE9E3] rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                  {khataSearch && (
                    <button
                      type="button"
                      onClick={() => setKhataSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">Filter:</span>
                  {[
                    { id: 'ALL', label: `All (${khataList.length})` },
                    { id: 'DUE', label: `Pending Due (${customersWithDue.length})` },
                    { id: 'SETTLED', label: `Cleared (${settledCustomers.length})` },
                    { id: 'HIGH', label: `High Due ≥₹300 (${khataList.filter(c => (c.totalPending || 0) >= 300).length})` }
                  ].map((flt) => (
                    <button
                      key={flt.id}
                      type="button"
                      onClick={() => setKhataFilter(flt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        khataFilter === flt.id
                          ? 'bg-[#176B65] text-white shadow-xs'
                          : 'bg-white border border-[#DCE9E3] text-[#283B3D] hover:bg-slate-50'
                      }`}
                    >
                      {flt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Khata Customers Table */}
              {filteredKhata.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#DCE9E3] text-[10px] uppercase font-black text-slate-400 tracking-wider">
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Contact</th>
                        <th className="py-3 px-3">Pending Udhaar</th>
                        <th className="py-3 px-3">Last Activity</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCE9E3]/70 text-xs">
                      {filteredKhata.map((customer) => {
                        const isDue = (customer.totalPending || 0) > 0;
                        const lastTx = customer.transactions && customer.transactions[0];
                        return (
                          <tr key={customer.id} className="hover:bg-[#F3F1E9]/40 transition-colors">
                            {/* Customer Name */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isDue ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                  {customer.customerName?.charAt(0) || 'C'}
                                </div>
                                <div>
                                  <span className="font-black text-[#283B3D] block">{customer.customerName}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    {customer.transactions?.length || 1} transactions
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="py-3.5 px-3">
                              <span className="font-semibold text-slate-600 block">
                                {customer.customerPhone && customer.customerPhone !== 'Offline' 
                                  ? `+91 ${customer.customerPhone}` 
                                  : 'Walk-in / No Phone'
                                }
                              </span>
                            </td>

                            {/* Pending Udhaar */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-token font-bold text-sm ${isDue ? 'text-rose-700' : 'text-emerald-700'}`}>
                                  ₹{(customer.totalPending || 0).toLocaleString('en-IN')}
                                </span>
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                                  isDue ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {isDue ? 'Baqaya Due' : 'Cleared'}
                                </span>
                              </div>
                            </td>

                            {/* Last Activity */}
                            <td className="py-3.5 px-3">
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-bold text-[#283B3D] block line-clamp-1">
                                  {lastTx?.serviceOrReason || 'Account opened'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold block">
                                  {customer.lastUpdated ? new Date(customer.lastUpdated).toLocaleDateString('en-IN') : 'Recent'}
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* Jama (Receive Payment) */}
                                {isDue && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenKhataEntryModal(customer, 'PAYMENT')}
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[11px] transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                                    title="Receive payment from customer (Jama)"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Jama</span>
                                  </button>
                                )}

                                {/* Add Udhaar */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenKhataEntryModal(customer, 'CREDIT')}
                                  className="px-2.5 py-1.5 rounded-xl bg-[#F3F1E9] hover:bg-[#DCE9E3] border border-[#DCE9E3] text-[#283B3D] font-bold text-[11px] transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                                  title="Add manual credit / udhaar entry"
                                >
                                  <Plus className="w-3.5 h-3.5 text-[#176B65]" />
                                  <span>+ Udhaar</span>
                                </button>

                                {/* WhatsApp Reminder */}
                                {isDue && customer.customerPhone && customer.customerPhone !== 'Offline' && (
                                  <button
                                    type="button"
                                    onClick={() => handleSendWhatsAppKhataReminder(customer)}
                                    className="px-2.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[11px] transition-all cursor-pointer active:scale-95 shadow-2xs flex items-center gap-1"
                                    title="Send polite WhatsApp payment reminder"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                    <span>Remind</span>
                                  </button>
                                )}

                                {/* Statement / Passbook */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStatementCustomer(customer);
                                    setStatementModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#DCE9E3]/50 border border-[#DCE9E3] text-[#283B3D] font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                                  title="View complete Khata statement passbook"
                                >
                                  <History className="w-3.5 h-3.5 text-[#176B65]" />
                                  <span>Passbook</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#283B3D]">No Customer Khata Accounts Found</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {khataSearch 
                        ? `No customers match "${khataSearch}". Try searching with another name or phone number.`
                        : "Start recording customer udhaar and payments to maintain your digital Khata."
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewCustomerKhataModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#176B65] text-white text-xs font-bold hover:bg-[#125550] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register First Khata Customer</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* ========================================================= */}
      {/* TAB 3: SHOP PROFILE & OPERATING HOURS EDITOR (BRD FR-602) */}
      {/* ========================================================= */}
      {activeTab === 'PROFILE' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Hero Profile Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#DCE9E3] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE9E3] pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#176B65] to-[#283B3D] text-[#F3F1E9] flex items-center justify-center font-black text-2xl shadow-md border-2 border-[#176B65]">
                  {activeShop?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-[#283B3D]">
                      {activeShop?.name || 'Local Merchant Shop'}
                    </h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Verified Shopkeeper
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#176B65]/10 text-[#176B65]">
                      BRD FR-602
                    </span>
                  </div>
                  <p className="text-xs text-[#283B3D]/70 font-semibold mt-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#176B65]" />
                    <span>{activeShop?.zone || 'Hazratganj Main Market'}</span>
                    <span>•</span>
                    <span className="font-bold text-[#176B65]">{activeShop?.categoryName || 'General Store'}</span>
                    <span>•</span>
                    <span>Owner: {activeShop?.ownerName || 'Merchant'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 ${
                  shopStatus === 'OPEN'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : shopStatus === 'PAUSED'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    shopStatus === 'OPEN' ? 'bg-emerald-600' : shopStatus === 'PAUSED' ? 'bg-amber-600' : 'bg-rose-600'
                  }`} />
                  <span>Currently {shopStatus}</span>
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-[#F3F1E9]/70 border border-[#DCE9E3] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#176B65]" />
                  <span>Daily Timings</span>
                </span>
                <div className="text-sm sm:text-base font-black text-[#283B3D]">
                  {activeShop?.openingHours || '10:00 AM - 08:30 PM'}
                </div>
                <span className="text-[10px] text-[#283B3D]/60 font-semibold block">Customer Open Window</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F3F1E9]/70 border border-[#DCE9E3] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider flex items-center gap-1">
                  <CalendarDays className="w-3 h-3 text-amber-700" />
                  <span>Weekly Off</span>
                </span>
                <div className="text-sm sm:text-base font-black text-[#283B3D]">
                  {activeShop?.weeklyOff && activeShop.weeklyOff !== 'None' ? `${activeShop.weeklyOff} Closed` : 'Open 7 Days'}
                </div>
                <span className="text-[10px] text-[#283B3D]/60 font-semibold block">Official Holiday</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F3F1E9]/70 border border-[#DCE9E3] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider flex items-center gap-1">
                  <Timer className="w-3 h-3 text-[#F2A15A]" />
                  <span>Service Pace</span>
                </span>
                <div className="text-sm sm:text-base font-black text-[#176B65]">
                  ~{activeShop?.avgWaitMin || 12}m / person
                </div>
                <span className="text-[10px] text-[#283B3D]/60 font-semibold block">Queue Wait Estimate</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F3F1E9]/70 border border-[#DCE9E3] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-emerald-700" />
                  <span>Support Line</span>
                </span>
                <div className="text-sm sm:text-base font-black text-[#283B3D]">
                  +91 {activeShop?.phone || '9876543210'}
                </div>
                <span className="text-[10px] text-[#283B3D]/60 font-semibold block">Customer WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Success Feedback Alert */}
          {profileSavedFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs font-bold">
                Shop profile, operating hours, and service pace updated successfully! All active customer pass screens are synced.
              </div>
            </motion.div>
          )}

          {/* Settings Editor Form */}
          <form onSubmit={handleSaveShopProfile} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* PANEL 1: SHOP IDENTITY & CONTACTS */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#DCE9E3] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 border-b border-[#DCE9E3] pb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#283B3D]">Shop Identity & Details</h3>
                    <p className="text-[11px] text-[#283B3D]/60 font-semibold">Basic business listing and customer contact</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#283B3D]">
                      Shop / Counter Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editShopName}
                      onChange={(e) => setEditShopName(e.target.value)}
                      placeholder="e.g. Royal Salon & Grooming"
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#283B3D]">
                        Owner / Manager Name
                      </label>
                      <input
                        type="text"
                        value={editOwnerName}
                        onChange={(e) => setEditOwnerName(e.target.value)}
                        placeholder="e.g. Ramesh Verma"
                        className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#283B3D]">
                        Business Category
                      </label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-3 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      >
                        <option value="Barber & Men's Salon">✂️ Barber & Men's Salon</option>
                        <option value="Beauty Parlour & Women's Spa">💇‍♀️ Beauty Parlour & Spa</option>
                        <option value="Doctor Clinic & Healthcare">🩺 Doctor Clinic & Healthcare</option>
                        <option value="Food Stall & Chaat Corner">🍲 Food Stall & Chaat Corner</option>
                        <option value="Mobile & Electronics Repair">📱 Mobile & Electronics Repair</option>
                        <option value="Kirana & Daily Grocery">🛒 Kirana & Daily Grocery</option>
                        <option value="Boutique & Custom Tailoring">🧵 Boutique & Custom Tailoring</option>
                        <option value="CSC & Jan Seva Kendra">🏛️ CSC & Jan Seva Kendra</option>
                        <option value="General Store">🏪 General Retail Store</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#283B3D]">
                        Primary WhatsApp / Phone <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-3 py-2 text-xs font-bold text-[#283B3D] focus-within:border-[#176B65]">
                        <span className="text-slate-400 mr-1.5">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full bg-transparent font-bold focus:outline-none text-[#283B3D]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#283B3D]">
                        Market / Zone
                      </label>
                      <select
                        value={editZone}
                        onChange={(e) => setEditZone(e.target.value)}
                        className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-3 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      >
                        <option value="Hazratganj Main Market">Hazratganj Main Market</option>
                        <option value="Aminabad Bazaar">Aminabad Bazaar</option>
                        <option value="Alambagh Market">Alambagh Market</option>
                        <option value="Gomti Nagar Commercial">Gomti Nagar Commercial</option>
                        <option value="Indira Nagar">Indira Nagar</option>
                        <option value="Chowk Old City">Chowk Old City</option>
                        <option value="Charbagh Station Road">Charbagh Station Road</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#283B3D]">
                      Shop Address & Landmark
                    </label>
                    <textarea
                      rows={2}
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="e.g. Shop #12, Near Mayfair Cinema, Hazratganj, Lucknow"
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-4 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>
                </div>
              </div>

              {/* PANEL 2: TIMINGS & OPERATING SCHEDULE (BRD FR-602) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#DCE9E3] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 border-b border-[#DCE9E3] pb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#283B3D]">Operating Hours & Schedule</h3>
                    <p className="text-[11px] text-[#283B3D]/60 font-semibold">Opening hours, weekly off day and rest periods</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Daily Opening & Closing Hours */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#283B3D]">
                        Daily Opening Time
                      </label>
                      <select
                        value={editOpenTime}
                        onChange={(e) => setEditOpenTime(e.target.value)}
                        className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-3 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      >
                        <option value="08:00 AM">08:00 AM</option>
                        <option value="08:30 AM">08:30 AM</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="09:30 AM">09:30 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#283B3D]">
                        Daily Closing Time
                      </label>
                      <select
                        value={editCloseTime}
                        onChange={(e) => setEditCloseTime(e.target.value)}
                        className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-3 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      >
                        <option value="06:00 PM">06:00 PM</option>
                        <option value="07:00 PM">07:00 PM</option>
                        <option value="08:00 PM">08:00 PM</option>
                        <option value="08:30 PM">08:30 PM</option>
                        <option value="09:00 PM">09:00 PM</option>
                        <option value="09:30 PM">09:30 PM</option>
                        <option value="10:00 PM">10:00 PM</option>
                        <option value="11:00 PM">11:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Weekly Off Day Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#283B3D] uppercase tracking-wider">
                      Weekly Off Day (Closed Day)
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5">
                      {['None', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setEditWeeklyOff(day)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${
                            editWeeklyOff === day
                              ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                              : 'bg-[#F3F1E9]/60 hover:bg-[#DCE9E3] text-[#283B3D] border-[#DCE9E3]'
                          }`}
                        >
                          {day === 'None' ? 'Open 7 Days' : day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Afternoon / Lunch Break Window */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#283B3D]">
                      Afternoon Break Window (Optional)
                    </label>
                    <input
                      type="text"
                      value={editLunchBreak}
                      onChange={(e) => setEditLunchBreak(e.target.value)}
                      placeholder="e.g. 02:00 PM - 03:00 PM (or leave empty)"
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-4 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    />
                    <span className="text-[10px] text-[#283B3D]/60 font-medium block">
                      Shown on customer pass so they know not to visit during lunch
                    </span>
                  </div>

                  {/* Summary Preview */}
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 font-semibold flex items-center justify-between">
                    <span>Active Schedule:</span>
                    <strong className="text-amber-800">
                      {editOpenTime} – {editCloseTime} ({editWeeklyOff === 'None' ? '7 Days' : `${editWeeklyOff} Off`})
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 3: QUEUE SERVICE PACE & CUSTOMER CONTROLS */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#DCE9E3] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#DCE9E3] pb-3">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#176B65] flex items-center justify-center">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#283B3D]">Queue Service Pace & Token Format</h3>
                  <p className="text-[11px] text-[#283B3D]/60 font-semibold">Average handling time per client and prefix formatting</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Service Pace Stepper & Presets */}
                <div className="sm:col-span-2 space-y-3">
                  <label className="block text-xs font-bold text-[#283B3D]">
                    Average Service Time Per Customer (Minutes)
                  </label>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center bg-[#F3F1E9] rounded-2xl border border-[#DCE9E3] p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditAvgWaitMin(Math.max(1, editAvgWaitMin - 1))}
                        className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-base font-black text-[#283B3D] shadow-2xs flex items-center justify-center cursor-pointer active:scale-95"
                      >
                        -
                      </button>
                      <div className="w-24 text-center">
                        <input
                          type="number"
                          min={1}
                          max={300}
                          value={editAvgWaitMin}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setEditAvgWaitMin(isNaN(val) || val < 1 ? 1 : Math.min(300, val));
                          }}
                          className="w-16 text-center text-2xl font-token font-bold text-[#176B65] bg-transparent focus:outline-none"
                        />
                        <span className="text-[10px] text-[#283B3D]/60 block font-bold">min / client</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditAvgWaitMin(Math.min(300, editAvgWaitMin + 1))}
                        className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-base font-black text-[#283B3D] shadow-2xs flex items-center justify-center cursor-pointer active:scale-95"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                      {[5, 8, 10, 12, 15, 20, 30].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEditAvgWaitMin(preset)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            editAvgWaitMin === preset
                              ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                              : 'bg-[#F3F1E9]/70 hover:bg-[#DCE9E3] text-[#283B3D] border-[#DCE9E3]'
                          }`}
                        >
                          {preset}m
                        </button>
                      ))}

                      {/* Custom Minutes Direct Input Box */}
                      <div className="flex items-center gap-1.5 bg-[#F3F1E9] border border-[#DCE9E3] rounded-2xl px-3 py-1.5 ml-auto sm:ml-0">
                        <span className="text-[11px] font-bold text-slate-500">Custom Time:</span>
                        <input
                          type="number"
                          min={1}
                          max={300}
                          placeholder="min"
                          value={editAvgWaitMin}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setEditAvgWaitMin(isNaN(val) || val < 1 ? 1 : Math.min(300, val));
                          }}
                          className="w-14 bg-white border border-[#DCE9E3] rounded-xl px-2 py-1 text-xs font-black text-[#176B65] text-center focus:outline-none focus:border-[#176B65]"
                        />
                        <span className="text-xs font-bold text-[#176B65]">min</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#283B3D]/70 font-semibold">
                    💡 If 5 customers are waiting, the 5th customer will see an estimated wait time of: <strong className="text-[#176B65]">~{5 * editAvgWaitMin} minutes</strong>.
                  </p>
                </div>

                {/* Token Prefix & WhatsApp */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#283B3D]">
                      Token Serial Prefix
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={editTokenPrefix}
                      onChange={(e) => setEditTokenPrefix(e.target.value.toUpperCase())}
                      placeholder="e.g. AK, SAL, DR"
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-4 py-2 text-xs font-black uppercase text-[#176B65] focus:outline-none focus:border-[#176B65]"
                    />
                    <span className="text-[10px] text-[#283B3D]/60 font-semibold block">
                      Generated passes will look like: <strong>{editTokenPrefix || 'AK'}-001</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F3F1E9]/70 border border-[#DCE9E3]">
                    <div>
                      <span className="text-xs font-black text-[#283B3D] block">WhatsApp Alerts</span>
                      <span className="text-[10px] text-[#283B3D]/60 font-semibold">Notify when 2 turns remain</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditEnableWhatsapp(!editEnableWhatsapp)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        editEnableWhatsapp ? 'bg-[#176B65]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          editEnableWhatsapp ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save & Reset Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#DCE9E3] shadow-xs">
              <div className="text-xs text-[#283B3D]/70 font-semibold text-center sm:text-left">
                Changes will take effect instantly for all current and future queue tokens.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('COUNTER')}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-[#283B3D] font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Back to Live Station
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-[#176B65] hover:bg-[#135853] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Save className="w-4 h-4 text-emerald-300" />
                  <span>Save Shop Profile & Timings</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CUSTOMER REVIEWS & RATINGS CONSOLE (BRD FR-1105)   */}
      {/* ========================================================= */}
      {activeTab === 'REVIEWS' && (() => {
        const filteredReviews = reviewsList.filter(r => {
          if (reviewFilterRating === 5 && r.rating !== 5) return false;
          if (reviewFilterRating === 4 && r.rating !== 4) return false;
          if (reviewFilterRating === 3 && r.rating !== 3) return false;
          if (reviewFilterRating === 'LOW' && r.rating > 3) return false;
          if (reviewFilterRating === 'AWAITING_REPLY' && r.merchantReply) return false;

          if (reviewSearchQuery.trim()) {
            const q = reviewSearchQuery.toLowerCase();
            const matchName = (r.customerName || '').toLowerCase().includes(q);
            const matchToken = (r.tokenNumber || '').toLowerCase().includes(q);
            const matchComment = (r.comment || '').toLowerCase().includes(q);
            const matchService = (r.serviceName || '').toLowerCase().includes(q);
            return matchName || matchToken || matchComment || matchService;
          }
          return true;
        });

        const pendingRepliesCount = reviewsList.filter(r => !r.merchantReply).length;

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* OVERVIEW SCORE & DISTRIBUTION CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#DCE9E3] shadow-xs space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#DCE9E3] pb-6">
                
                {/* Score & Stars */}
                <div className="flex items-center gap-5">
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-3xl border border-amber-200/80 shrink-0 min-w-[120px]">
                    <span className="text-4xl sm:text-5xl font-token font-black text-amber-900 block leading-none">
                      {avgRating}
                    </span>
                    <div className="flex items-center justify-center gap-0.5 my-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= Math.round(Number(avgRating))
                              ? 'fill-amber-400 text-amber-500'
                              : 'fill-slate-200 text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                      Overall Score
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-[#283B3D]">
                        Customer Reviews & Reputation
                      </h2>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        BRD FR-1105
                      </span>
                    </div>
                    <p className="text-xs text-[#283B3D]/70 font-semibold">
                      Based on <strong>{totalReviewsCount} verified customer token visits</strong>. Genuine 1-review per token anti-spam protection enabled.
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>100% Verified Customers</span>
                      </span>
                      <span>•</span>
                      <span className="font-bold text-[#176B65] flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{repliedCount} Replied ({Math.round((repliedCount / (totalReviewsCount || 1)) * 100)}%)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution Breakdown */}
                <div className="w-full lg:w-72 space-y-1.5 bg-[#F3F1E9]/50 p-4 rounded-2xl border border-[#DCE9E3]">
                  {ratingDistribution.map(({ stars, count, percent }) => (
                    <div key={stars} className="flex items-center gap-2 text-xs font-semibold text-[#283B3D]">
                      <span className="w-7 text-right shrink-0 flex items-center justify-end gap-0.5 text-xs font-bold">
                        {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      </span>
                      <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-[#DCE9E3]">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-[11px] font-bold text-slate-500 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Compliments / Sentiment Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-1">
                  Customer Praise:
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-emerald-600" />
                  <span>Punctual Service (94%)</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-bold flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-blue-600" />
                  <span>Polite Counter Staff</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-bold flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-teal-600" />
                  <span>Clean & Hygienic</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-amber-600" />
                  <span>Accurate Wait Estimations</span>
                </span>
              </div>
            </div>

            {/* SEARCH & RATING FILTER BAR */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#DCE9E3] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    placeholder="Search reviews by customer name, token number, or keyword..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                  {reviewSearchQuery && (
                    <button
                      onClick={() => setReviewSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="text-xs text-[#283B3D]/70 font-semibold shrink-0">
                  Showing <strong>{filteredReviews.length}</strong> of {totalReviewsCount} reviews
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setReviewFilterRating('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    reviewFilterRating === 'ALL'
                      ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                      : 'bg-white hover:bg-[#F3F1E9] text-[#283B3D] border-[#DCE9E3]'
                  }`}
                >
                  All ({totalReviewsCount})
                </button>

                <button
                  type="button"
                  onClick={() => setReviewFilterRating(5)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    reviewFilterRating === 5
                      ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                      : 'bg-white hover:bg-[#F3F1E9] text-[#283B3D] border-[#DCE9E3]'
                  }`}
                >
                  <span>5 ★</span>
                  <span className="text-[10px] opacity-80">({reviewsList.filter(r => r.rating === 5).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewFilterRating(4)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    reviewFilterRating === 4
                      ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                      : 'bg-white hover:bg-[#F3F1E9] text-[#283B3D] border-[#DCE9E3]'
                  }`}
                >
                  <span>4 ★</span>
                  <span className="text-[10px] opacity-80">({reviewsList.filter(r => r.rating === 4).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewFilterRating('LOW')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    reviewFilterRating === 'LOW'
                      ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                      : 'bg-white hover:bg-[#F3F1E9] text-[#283B3D] border-[#DCE9E3]'
                  }`}
                >
                  <span>3 ★ or Below</span>
                  <span className="text-[10px] opacity-80">({reviewsList.filter(r => r.rating <= 3).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewFilterRating('AWAITING_REPLY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    reviewFilterRating === 'AWAITING_REPLY'
                      ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                      : 'bg-white hover:bg-[#F3F1E9] text-[#283B3D] border-[#DCE9E3]'
                  }`}
                >
                  <span>Awaiting Reply</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    reviewFilterRating === 'AWAITING_REPLY' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {pendingRepliesCount}
                  </span>
                </button>
              </div>
            </div>

            {/* REVIEWS LIST */}
            {filteredReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border shadow-xs transition-all space-y-4 ${
                      rev.flagged ? 'border-rose-200 bg-rose-50/20' : 'border-[#DCE9E3]'
                    }`}
                  >
                    {/* Header: Customer Name, Token Badge, Rating, Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE9E3] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#176B65] to-[#283B3D] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {rev.customerName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-[#283B3D]">{rev.customerName}</span>
                            <span className="text-xs font-mono font-bold bg-[#F3F1E9] text-[#176B65] px-2 py-0.5 rounded-md border border-[#DCE9E3]">
                              {rev.tokenNumber}
                            </span>
                            {rev.verifiedVisit && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified Token Visit</span>
                              </span>
                            )}
                            {rev.flagged && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1 border border-rose-300">
                                <Flag className="w-3 h-3 text-rose-600" />
                                <span>Flagged for Admin Moderation</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                            {rev.serviceName || 'General Service'} • {rev.date}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= rev.rating
                                ? 'fill-amber-400 text-amber-500'
                                : 'fill-slate-200 text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-black text-amber-900 ml-1">
                          {rev.rating}.0
                        </span>
                      </div>
                    </div>

                    {/* Customer Review Text */}
                    <p className="text-xs sm:text-sm text-[#283B3D] font-medium leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    {/* Tags */}
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {rev.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F3F1E9] text-slate-600 border border-[#DCE9E3]"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Merchant Public Reply Box (BRD FR-1106) */}
                    {rev.merchantReply ? (
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 ml-2 sm:ml-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Response from {activeShop?.name || 'Shopkeeper'} (Owner)</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            {rev.merchantReplyDate || 'Recent'}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-950 font-medium">
                          {rev.merchantReply}
                        </p>
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToReview(rev);
                              setReplyText(rev.merchantReply || '');
                              setReplyModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 underline cursor-pointer"
                          >
                            Edit Reply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1 border-t border-[#DCE9E3]/70">
                        <span className="text-[11px] text-slate-400 italic">
                          No owner response posted yet
                        </span>

                        <div className="flex items-center gap-2">
                          {!rev.flagged && (
                            <button
                              type="button"
                              onClick={() => {
                                setFlaggingReview(rev);
                                setFlagReason('Not a real customer visit');
                                setFlagModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Report suspicious or fake review"
                            >
                              <Flag className="w-3.5 h-3.5" />
                              <span>Report</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToReview(rev);
                              setReplyText('');
                              setReplyModalOpen(true);
                            }}
                            className="px-4 py-1.5 rounded-xl bg-[#176B65] hover:bg-[#135853] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Reply to Customer</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#DCE9E3] shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-[#283B3D]">No Reviews Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {reviewSearchQuery
                    ? `No reviews match "${reviewSearchQuery}". Try clearing search or selecting "All".`
                    : 'No customer reviews match your active filter.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setReviewFilterRating('ALL');
                    setReviewSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-xs font-bold text-[#283B3D] transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* ========================================================= */}
      {/* TAB 5: STAFF ATTENDANCE & MULTI-OPERATOR (BRD FR-711)   */}
      {/* ========================================================= */}
      {activeTab === 'STAFF' && (() => {
        const onDutyStaff = staffList.filter(s => s.status === 'ON_DUTY');
        const onBreakStaff = staffList.filter(s => s.status === 'ON_BREAK');
        const offDutyStaff = staffList.filter(s => s.status === 'OFF_DUTY');
        const totalServedAll = staffList.reduce((acc, s) => acc + (s.servedCountToday || 0), 0);
        const totalRevenueAll = staffList.reduce((acc, s) => acc + (s.revenueGeneratedToday || 0), 0);

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Feedback Alert */}
            {staffFeedbackMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
                <span>{staffFeedbackMsg}</span>
                <button onClick={() => setStaffFeedbackMsg('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* KEY METRICS SUMMARY */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
              <div className="urban-card rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Total Staff</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-[#176B65]">
                  {staffList.length}
                </div>
                <span className="text-[11px] text-[#283B3D]/70 font-semibold block">Registered Operators</span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">On Duty Now</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-emerald-700 flex items-center gap-1.5">
                  <span>{onDutyStaff.length}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-[11px] text-emerald-600/80 font-semibold block">Active at counter stations</span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1 bg-gradient-to-br from-amber-50 to-white border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">On Break</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-amber-700">
                  {onBreakStaff.length}
                </div>
                <span className="text-[11px] text-amber-600/80 font-semibold block">Tea / Lunch Paused</span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 tracking-wider">Customers Served</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-[#283B3D]">
                  {totalServedAll}
                </div>
                <span className="text-[11px] text-[#283B3D]/70 font-semibold block">Staff cuts / visits today</span>
              </div>

              <div className="urban-card rounded-2xl p-4 space-y-1 col-span-2 sm:col-span-1 bg-gradient-to-br from-teal-50 to-white border-teal-200">
                <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">Revenue Attributed</span>
                <div className="text-2xl sm:text-3xl font-token font-bold text-teal-800">
                  ₹{totalRevenueAll.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-teal-700/80 font-semibold block">Combined shift billing</span>
              </div>
            </div>

            {/* CURRENT ACTIVE OPERATOR DESK BANNER */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#176B65] to-[#283B3D] text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg font-black text-white shrink-0 border border-white/25">
                  {activeOperator?.name ? activeOperator.name.slice(0, 2).toUpperCase() : 'OP'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-black tracking-wider bg-white/25 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                      <KeyRound className="w-3 h-3 text-[#F2A15A]" />
                      Active Terminal Operator
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      activeOperator?.status === 'ON_DUTY'
                        ? 'bg-emerald-400/25 text-emerald-200 border border-emerald-400/40'
                        : activeOperator?.status === 'ON_BREAK'
                        ? 'bg-amber-400/25 text-amber-200 border border-amber-400/40'
                        : 'bg-white/15 text-white/80'
                    }`}>
                      {activeOperator?.status === 'ON_DUTY' ? '● On Duty' : activeOperator?.status === 'ON_BREAK' ? '☕ On Break' : 'Off Duty'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>{activeOperator?.name || 'No Operator Selected'}</span>
                    <span className="text-xs font-normal text-white/75 bg-white/10 px-2 py-0.5 rounded-md">
                      {activeOperator?.role || 'Service Specialist'}
                    </span>
                  </h3>
                  <p className="text-xs text-white/80">
                    Punched In: <span className="font-bold text-white">{activeOperator?.clockInTime || 'Pending'}</span> • 
                    Served Today: <span className="font-bold text-emerald-300">{activeOperator?.servedCountToday || 0} customers</span> • 
                    Revenue: <span className="font-bold text-[#F2A15A]">₹{(activeOperator?.revenueGeneratedToday || 0).toLocaleString('en-IN')}</span>
                  </p>
                </div>
              </div>

              {/* Operator Quick Switch / Punch Actions */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {activeOperator?.status === 'ON_DUTY' && (
                  <button
                    type="button"
                    onClick={() => handleTriggerStaffPinModal(activeOperator, 'BREAK')}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/50 text-amber-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <Coffee className="w-3.5 h-3.5 text-amber-300" />
                    <span>Punch Break</span>
                  </button>
                )}

                {activeOperator?.status === 'ON_BREAK' && (
                  <button
                    type="button"
                    onClick={() => handleTriggerStaffPinModal(activeOperator, 'BREAK')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/45 border border-emerald-400/50 text-emerald-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Resume Duty</span>
                  </button>
                )}

                {activeOperator?.status !== 'OFF_DUTY' && (
                  <button
                    type="button"
                    onClick={() => handleTriggerStaffPinModal(activeOperator, 'CLOCK_OUT')}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400/50 text-rose-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-300" />
                    <span>Clock Out</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleTriggerStaffPinModal(activeOperator || staffList[0], 'SWITCH')}
                  className="px-4 py-2 rounded-xl bg-white text-[#176B65] hover:bg-slate-100 text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#176B65]" />
                  <span>Switch Operator</span>
                </button>
              </div>
            </div>

            {/* ACTION TOOLBAR & SEARCH */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#DCE9E3]">
              <div className="flex items-center gap-2 text-xs font-black text-[#283B3D]">
                <BadgeCheck className="w-4 h-4 text-[#176B65]" />
                <span>Shop Staff Directory ({staffList.length} Operators)</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadStaffAttendanceCsv}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/40 text-[#283B3D] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title="Export Attendance & Performance Log to CSV (FR-711)"
                >
                  <Download className="w-4 h-4 text-[#176B65]" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isOwnerUnlocked) {
                      setStaffManageModalOpen(true);
                    } else {
                      handleTriggerStaffPinModal('OWNER', 'OWNER_SETTINGS');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#283B3D] hover:bg-[#1e2e30] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title="Owner Master Settings & PIN Manager"
                >
                  <Lock className="w-4 h-4 text-[#F2A15A]" />
                  <span>Owner Mode {isOwnerUnlocked ? '(Unlocked)' : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStaffManageModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Staff Operator</span>
                </button>
              </div>
            </div>

            {/* STAFF ROSTER CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map((staff) => {
                const isActiveTerminal = activeOperator?.id === staff.id;
                const initials = staff.name ? staff.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'OP';

                return (
                  <div
                    key={staff.id}
                    className={`urban-card rounded-3xl p-5 space-y-4 transition-all relative ${
                      isActiveTerminal ? 'border-2 border-[#176B65] shadow-md bg-teal-50/20' : ''
                    }`}
                  >
                    {/* Header: Photo / Initials, Name, Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm relative ${
                          staff.status === 'ON_DUTY'
                            ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400'
                            : staff.status === 'ON_BREAK'
                            ? 'bg-amber-100 text-amber-800 border-2 border-amber-400'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}>
                          {initials}
                          <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            staff.status === 'ON_DUTY'
                              ? 'bg-emerald-500 animate-pulse'
                              : staff.status === 'ON_BREAK'
                              ? 'bg-amber-500'
                              : 'bg-slate-300'
                          }`} />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-sm text-[#283B3D]">{staff.name}</h4>
                            {isActiveTerminal && (
                              <span className="text-[10px] font-black uppercase bg-[#176B65] text-white px-1.5 py-0.5 rounded-md">
                                Current
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-[#176B65] bg-[#DCE9E3]/70 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {staff.role}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${
                        staff.status === 'ON_DUTY'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : staff.status === 'ON_BREAK'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {staff.status === 'ON_DUTY' ? 'On Duty' : staff.status === 'ON_BREAK' ? 'On Break' : 'Off Duty'}
                      </span>
                    </div>

                    {/* Today's Punch Clock & PIN Info */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-[#F3F1E9]/60 rounded-2xl border border-[#DCE9E3]/60 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Clock In</span>
                        <span className="font-bold text-[#283B3D]">{staff.clockInTime || 'Not punched'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">PIN Security</span>
                        <span className="font-mono font-bold text-[#176B65]">
                          {isOwnerUnlocked ? staff.pin : '•••• (Locked)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Customers</span>
                        <span className="font-bold text-emerald-700">{staff.servedCountToday || 0} served</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Today Revenue</span>
                        <span className="font-bold text-[#176B65]">₹{(staff.revenueGeneratedToday || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Quick 1-Tap Attendance Punch Desk Buttons */}
                    <div className="space-y-2 pt-1 border-t border-[#DCE9E3]">
                      <div className="grid grid-cols-2 gap-2">
                        {staff.status === 'OFF_DUTY' ? (
                          <button
                            type="button"
                            onClick={() => handleTriggerStaffPinModal(staff, 'CLOCK_IN')}
                            className="col-span-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Clock In with PIN</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleTriggerStaffPinModal(staff, 'BREAK')}
                              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border active:scale-95 ${
                                staff.status === 'ON_BREAK'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              }`}
                            >
                              <Coffee className="w-3.5 h-3.5" />
                              <span>{staff.status === 'ON_BREAK' ? 'Resume Duty' : 'Take Break'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTriggerStaffPinModal(staff, 'CLOCK_OUT')}
                              className="py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Clock Out</span>
                            </button>
                          </>
                        )}
                      </div>

                      {staff.status !== 'OFF_DUTY' && !isActiveTerminal && (
                        <button
                          type="button"
                          onClick={() => handleTriggerStaffPinModal(staff, 'SWITCH')}
                          className="w-full py-2 rounded-xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-[#283B3D] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-[#176B65]" />
                          <span>Make Active Desk Operator</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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

                    {/* Quick Service Selection Chips from Shop Rate Card */}
                    {shopServicesList.filter(s => s.active).length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">Rate Card:</span>
                        {shopServicesList.filter(s => s.active).slice(0, 6).map((srv) => (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => setWalkinService(srv.name)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                              walkinService === srv.name
                                ? 'bg-[#176B65] text-white border-[#176B65]'
                                : 'bg-white hover:bg-slate-50 text-[#283B3D] border-[#DCE9E3]'
                            }`}
                          >
                            {srv.name} {srv.price > 0 ? `(₹${srv.price})` : ''}
                          </button>
                        ))}
                      </div>
                    )}
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
      {/* MODAL 2: PRINTABLE COUNTER QR CODE STANDEE (BRD FR-605)   */}
      {/* ========================================================= */}
      <AnimatePresence>
        {qrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setQrModalOpen(false)} 
              className="fixed inset-0"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#DCE9E3] z-10 overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-[#DCE9E3] px-6 py-4 bg-[#F3F1E9]/60 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#176B65] text-white flex items-center justify-center shadow-xs">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#283B3D]">Counter QR Standee Generator</h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Printable table-top standee & door poster for customer self-service (BRD FR-605 / FR-302)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-[#DCE9E3] text-[#283B3D]/70 hover:text-[#283B3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body: 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto p-5 sm:p-6 gap-6">
                
                {/* Left Column: Standee Controls & Options */}
                <div className="md:col-span-5 space-y-4">
                  
                  {/* Format Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#283B3D] block">1. Standee Size / Format:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'TABLETOP', label: 'Tabletop (A5)', desc: 'Acrylic Stand' },
                        { id: 'POSTER', label: 'Poster (A4)', desc: 'Door / Wall' },
                        { id: 'STICKER', label: 'Sticker', desc: 'Counter Desk' }
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setStandeeFormat(fmt.id)}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            standeeFormat === fmt.id
                              ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-[#283B3D] border-[#DCE9E3]'
                          }`}
                        >
                          <div className="text-xs font-black">{fmt.label}</div>
                          <div className={`text-[9px] font-semibold ${standeeFormat === fmt.id ? 'text-white/80' : 'text-slate-400'}`}>
                            {fmt.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#283B3D] block">2. Color Theme:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'EMERALD', label: 'Emerald Luxe', dot: 'bg-[#176B65]' },
                        { id: 'MIDNIGHT', label: 'Midnight', dot: 'bg-[#283B3D]' },
                        { id: 'MINIMAL', label: 'Ink-Saver (B&W)', dot: 'bg-slate-900' }
                      ].map((thm) => (
                        <button
                          key={thm.id}
                          type="button"
                          onClick={() => setStandeeTheme(thm.id)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            standeeTheme === thm.id
                              ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-[#283B3D] border-[#DCE9E3]'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${thm.dot} border border-white`} />
                          <span>{thm.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Hindi / English Tagline */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#283B3D] block">3. Customer Notice Headline:</label>
                    <input
                      type="text"
                      value={standeeTagline}
                      onChange={(e) => setStandeeTagline(e.target.value)}
                      placeholder="Line me khade mat raho..."
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>

                  {/* Toggle Options */}
                  <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#F3F1E9]/60 border border-[#DCE9E3]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#283B3D]">Show Timings & Weekly Off</span>
                      <input
                        type="checkbox"
                        checked={showStandeeHours}
                        onChange={(e) => setShowStandeeHours(e.target.checked)}
                        className="w-4 h-4 accent-[#176B65] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#283B3D]">Show Free Wi-Fi Details</span>
                      <input
                        type="checkbox"
                        checked={showStandeeWifi}
                        onChange={(e) => setShowStandeeWifi(e.target.checked)}
                        className="w-4 h-4 accent-[#176B65] cursor-pointer"
                      />
                    </div>

                    {showStandeeWifi && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#DCE9E3]">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Wi-Fi Name (SSID):</label>
                          <input
                            type="text"
                            value={standeeWifiName}
                            onChange={(e) => setStandeeWifiName(e.target.value)}
                            placeholder="e.g. RoyalGuest"
                            className="w-full bg-white border border-[#DCE9E3] rounded-lg px-2 py-1 text-xs font-semibold text-[#283B3D] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Password:</label>
                          <input
                            type="text"
                            value={standeeWifiPass}
                            onChange={(e) => setStandeeWifiPass(e.target.value)}
                            placeholder="e.g. royal1234"
                            className="w-full bg-white border border-[#DCE9E3] rounded-lg px-2 py-1 text-xs font-semibold text-[#283B3D] focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Printer className="w-4 h-4 text-[#F2A15A]" />
                      <span>Print Standee Now</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadQrPng}
                        className="py-2.5 rounded-xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/30 text-xs font-bold text-[#283B3D] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 text-[#176B65]" />
                        <span>Download QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyBookingLink}
                        className="py-2.5 rounded-xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/30 text-xs font-bold text-[#283B3D] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {standeeCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#176B65]" />}
                        <span>{standeeCopied ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 font-semibold text-center pt-1">
                      💡 Tip: Select &ldquo;Save as PDF&rdquo; in the print dialog to download a high-res PDF poster for laminating!
                    </p>
                  </div>
                </div>

                {/* Right Column: Live Printable Standee Card */}
                <div className="md:col-span-7 flex flex-col items-center justify-center bg-slate-100/70 p-4 sm:p-6 rounded-3xl border border-[#DCE9E3]">
                  
                  {/* Standee Container (Targeted by @media print) */}
                  <div 
                    id="printable-standee-card"
                    className={`w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-xl border-2 transition-all flex flex-col justify-between text-center relative overflow-hidden bg-white ${
                      standeeTheme === 'MIDNIGHT'
                        ? 'border-[#283B3D]'
                        : standeeTheme === 'MINIMAL'
                        ? 'border-slate-800'
                        : 'border-[#176B65]'
                    }`}
                  >
                    {/* Top Standee Header Strip */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <OfficialBrandLogo height={32} animate={false} />
                      </div>
                      
                      <div className="space-y-0.5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block ${
                          standeeTheme === 'MIDNIGHT'
                            ? 'bg-[#283B3D] text-white'
                            : standeeTheme === 'MINIMAL'
                            ? 'bg-slate-900 text-white'
                            : 'bg-[#176B65] text-white'
                        }`}>
                          Official Digital Queue Partner
                        </span>
                        <h2 className="text-xl font-black text-[#283B3D] tracking-tight line-clamp-1 pt-1">
                          {activeShop?.name || 'Partner Store'}
                        </h2>
                        <p className="text-[11px] text-[#283B3D]/70 font-bold line-clamp-1">
                          {activeShop?.categoryName || 'Service Counter'} • {activeShop?.address || 'Indira Nagar, Lucknow'}
                        </p>
                      </div>
                    </div>

                    {/* QR Code Center Frame */}
                    <div className="my-4 py-2">
                      <div className={`p-4 rounded-3xl mx-auto shadow-md border-2 inline-block bg-white ${
                        standeeTheme === 'MIDNIGHT'
                          ? 'border-[#283B3D]'
                          : standeeTheme === 'MINIMAL'
                          ? 'border-slate-800'
                          : 'border-[#176B65]'
                      }`}>
                        {standeeQrUrl ? (
                          <img
                            src={standeeQrUrl}
                            alt="Scan to join queue"
                            className="w-48 h-48 mx-auto object-contain block"
                          />
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                            <QrCode className="w-32 h-32 animate-pulse" />
                          </div>
                        )}
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#176B65] mt-1 pt-1 border-t border-[#DCE9E3]">
                          ⚡ SCAN TO TAKE PASS
                        </div>
                      </div>

                      {/* Compatible Scanner Apps */}
                      <p className="text-[10px] font-bold text-slate-500 mt-2">
                        Scan with Phone Camera, Paytm, PhonePe, GPay or WhatsApp
                      </p>
                    </div>

                    {/* Catchy Hindi Headline & Notice */}
                    <div className="space-y-1 bg-[#F3F1E9]/80 p-3 rounded-2xl border border-[#DCE9E3]">
                      <h4 className="text-xs font-black text-[#176B65] uppercase tracking-wide">
                        लाइन में खड़े मत रहो, टोकन लो!
                      </h4>
                      <p className="text-[11px] text-[#283B3D] font-semibold leading-snug">
                        {standeeTagline || 'Line me khade mat raho, QR scan karo aur aaram se baithiye!'}
                      </p>
                    </div>

                    {/* 3 Simple Visual Steps */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold pt-3">
                      <div className="p-2 rounded-xl bg-white border border-[#DCE9E3] shadow-2xs">
                        <div className="text-sm mb-0.5">📸</div>
                        <div className="font-black text-[#283B3D]">1. Scan QR</div>
                        <div className="text-[9px] text-slate-500">Camera / UPI</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#DCE9E3] shadow-2xs">
                        <div className="text-sm mb-0.5">🎫</div>
                        <div className="font-black text-[#283B3D]">2. Get Token</div>
                        <div className="text-[9px] text-slate-500">On your phone</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#DCE9E3] shadow-2xs">
                        <div className="text-sm mb-0.5">🔔</div>
                        <div className="font-black text-[#283B3D]">3. Relax</div>
                        <div className="text-[9px] text-slate-500">Walk up on turn</div>
                      </div>
                    </div>

                    {/* Footer Info Strip */}
                    <div className="mt-4 pt-3 border-t border-[#DCE9E3] space-y-1 text-[10px] text-slate-600">
                      {showStandeeHours && (
                        <div className="flex items-center justify-between font-bold text-[#283B3D]">
                          <span>⏰ Open: {activeShop?.openTime || '09:30 AM'} - {activeShop?.closeTime || '08:30 PM'}</span>
                          <span>Off: {activeShop?.weeklyOff || 'None'}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-slate-500 font-semibold">
                        <span>Pace: ~{activeShop?.avgWaitMin || 12} mins / turn</span>
                        <span>Token Prefix: #{activeShop?.tokenPrefix || 'AK'}</span>
                      </div>

                      {showStandeeWifi && (standeeWifiName || standeeWifiPass) && (
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-[9px] flex items-center justify-between">
                          <span>📶 Free Wi-Fi: {standeeWifiName || 'ShopGuest'}</span>
                          <span>Password: {standeeWifiPass || '12345678'}</span>
                        </div>
                      )}

                      <div className="text-[9px] text-slate-400 font-semibold pt-1">
                        Powered by <strong>AbhiiKhula</strong> • Bharat Ka Hyperlocal Queue Network
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Print Media Style for Crisp Vector Standee Output */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-standee-card, #printable-standee-card * {
            visibility: visible !important;
          }
          #printable-standee-card {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 175mm !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: 3px solid #176B65 !important;
            margin: 0 auto !important;
            padding: 8mm !important;
            background: white !important;
            z-index: 9999999 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* ========================================================= */}
      {/* MODAL 3: SERVICE BILLING / HISAAB (OPTIONAL ON SERVICE DONE)*/}
      {/* ========================================================= */}
      <AnimatePresence>
        {billingModalOpen && (billingStationId ? stationsList.find(s => s.id === billingStationId)?.currentToken : servingToken) && (() => {
          const activeBillingToken = billingStationId ? stationsList.find(s => s.id === billingStationId)?.currentToken : servingToken;
          return (
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
                        Service Complete • Hisaab & Khata
                      </span>
                      <h3 className="font-black text-base text-[#283B3D] mt-0.5">
                        Record Service Billing (Optional)
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => setBillingModalOpen(false)} 
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Customer Pass Summary Banner */}
                <div className="p-4 rounded-2xl bg-[#F3F1E9]/80 border border-[#DCE9E3] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#283B3D] text-[#F3F1E9] flex flex-col items-center justify-center font-token font-bold text-sm shadow-xs shrink-0">
                      <span className="text-[8px] text-[#F2A15A] uppercase tracking-wider">Pass</span>
                      <span>{activeBillingToken.tokenNumber}</span>
                    </div>
                    <div>
                      <span className="font-black text-sm text-[#283B3D] block">{activeBillingToken.customerName}</span>
                      <span className="text-xs text-slate-500 font-medium block">
                        {activeBillingToken.customerPhone ? `+91 ${activeBillingToken.customerPhone}` : 'Walk-in Guest'} • Party of {activeBillingToken.groupSize || 1}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#176B65] bg-[#DCE9E3] px-2.5 py-1 rounded-xl shrink-0">
                    {activeBillingToken.service || 'General Service'}
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
                    
                    {/* Dynamic Rate Card Service Chips with 1-Tap Auto-Amount Calculation */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold">1-Tap Services (Auto-calculates total amount):</span>
                        <button
                          type="button"
                          onClick={() => setServicesModalOpen(true)}
                          className="text-[10px] text-[#176B65] hover:underline font-bold cursor-pointer"
                        >
                          Edit Rate Card
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {shopServicesList.filter(s => s.active).map((srv) => (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => {
                              if (!billServices) {
                                setBillServices(srv.name);
                              } else if (!billServices.includes(srv.name)) {
                                setBillServices(`${billServices} + ${srv.name}`);
                              }
                              // Auto-add price to total bill amount
                              if (srv.price > 0) {
                                setBillAmount(prev => {
                                  const current = parseInt(prev, 10) || 0;
                                  return String(current + srv.price);
                                });
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#DCE9E3] hover:border-[#176B65] hover:bg-[#DCE9E3]/40 text-xs font-bold text-[#283B3D] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                          >
                            <span>+ {srv.name}</span>
                            {srv.price > 0 && (
                              <span className="text-[10px] font-black text-[#176B65] bg-[#DCE9E3]/70 px-1.5 py-0.2 rounded-md">
                                ₹{srv.price}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
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

                  {/* 3. Payment Mode Selector with Udhaar / Khata Support (BRD FR-712) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#283B3D]">
                      Payment Mode (Paisa Kaise Diya?)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'CASH', label: 'Cash (Naqad)', icon: '💵', desc: 'Direct cash handed' },
                        { id: 'UPI', label: 'UPI / QR', icon: '📱', desc: 'GPay / PhonePe / Paytm' },
                        { id: 'PENDING', label: 'Full Udhaar', icon: '⏳', desc: '100% Khata (Pay Later)' },
                        { id: 'PARTIAL', label: 'Partial + Udhaar', icon: '⚖️', desc: 'Kuch diya, baaki udhaar' }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            setBillPaymentMode(mode.id);
                            if (mode.id === 'PENDING') setBillPaidAmount('0');
                          }}
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

                    {/* Partial Payment Calculation Breakdown */}
                    {billPaymentMode === 'PARTIAL' && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-900">Partial Payment Breakdown:</span>
                          <span className="text-[10px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                            Auto-adds to Khata Ledger
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">
                              Amount Paid Now (₹ Abhi Diya) *
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={Number(billAmount) || 0}
                              placeholder="0"
                              value={billPaidAmount}
                              onChange={(e) => setBillPaidAmount(e.target.value)}
                              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">
                              Pending Baqaya (Khata Due)
                            </label>
                            <div className="w-full bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs font-black text-rose-700 flex items-center justify-between">
                              <span>₹{Math.max(0, (Number(billAmount) || 0) - (Number(billPaidAmount) || 0)).toLocaleString('en-IN')}</span>
                              <span className="text-[9px] uppercase font-bold text-rose-500">Khata Due</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Full Udhaar Alert */}
                    {billPaymentMode === 'PENDING' && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          Full bill amount of <strong>₹{Number(billAmount || 0).toLocaleString('en-IN')}</strong> will be added to <strong>{activeBillingToken.customerName}</strong>&apos;s Khata ledger.
                        </span>
                      </div>
                    )}
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
          );
        })()}
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

      {/* ========================================================= */}
      {/* MODAL 6: SHOP PROFILE & TIMINGS POPUP MODAL (BRD FR-602)  */}
      {/* ========================================================= */}
      <AnimatePresence>
        {profileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-[#DCE9E3] relative max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[#283B3D]">Edit Shop Profile & Timings</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        FR-602
                      </span>
                    </div>
                    <p className="text-xs text-[#283B3D]/70 font-semibold">
                      Update operating schedule, weekly off, and customer wait pace.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F3F1E9] text-[#283B3D]/70 hover:text-[#283B3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveShopProfile} className="space-y-4">
                {/* 1. Shop Name & Owner */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#283B3D]">
                    Shop Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editShopName}
                    onChange={(e) => setEditShopName(e.target.value)}
                    className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#283B3D]">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    >
                      <option value="Barber & Men's Salon">✂️ Barber & Men's Salon</option>
                      <option value="Beauty Parlour & Women's Spa">💇‍♀️ Beauty Parlour & Spa</option>
                      <option value="Doctor Clinic & Healthcare">🩺 Doctor Clinic & Healthcare</option>
                      <option value="Food Stall & Chaat Corner">🍲 Food Stall & Chaat Corner</option>
                      <option value="Mobile & Electronics Repair">📱 Mobile & Electronics Repair</option>
                      <option value="Kirana & Daily Grocery">🛒 Kirana & Daily Grocery</option>
                      <option value="Boutique & Custom Tailoring">🧵 Boutique & Custom Tailoring</option>
                      <option value="CSC & Jan Seva Kendra">🏛️ CSC & Jan Seva Kendra</option>
                      <option value="General Store">🏪 General Retail Store</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#283B3D]">
                      WhatsApp / Phone
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>
                </div>

                {/* 2. Opening & Closing Hours */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#283B3D]">
                      Daily Opening Time
                    </label>
                    <select
                      value={editOpenTime}
                      onChange={(e) => setEditOpenTime(e.target.value)}
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    >
                      <option value="08:00 AM">08:00 AM</option>
                      <option value="08:30 AM">08:30 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#283B3D]">
                      Daily Closing Time
                    </label>
                    <select
                      value={editCloseTime}
                      onChange={(e) => setEditCloseTime(e.target.value)}
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    >
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                      <option value="08:00 PM">08:00 PM</option>
                      <option value="08:30 PM">08:30 PM</option>
                      <option value="09:00 PM">09:00 PM</option>
                      <option value="09:30 PM">09:30 PM</option>
                      <option value="10:00 PM">10:00 PM</option>
                      <option value="11:00 PM">11:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* 3. Weekly Off Day */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#283B3D]">
                    Weekly Off Day
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['None', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setEditWeeklyOff(day)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                          editWeeklyOff === day
                            ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                            : 'bg-[#F3F1E9]/70 hover:bg-[#DCE9E3] text-[#283B3D] border-[#DCE9E3]'
                        }`}
                      >
                        {day === 'None' ? '7 Days' : day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Service Pace per client with Custom Input & Stepper */}
                <div className="p-3.5 rounded-2xl bg-[#F3F1E9]/70 border border-[#DCE9E3] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#283B3D]">Service Pace Per Customer</span>
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-[#DCE9E3]">
                      <span className="text-[11px] font-bold text-slate-500">Custom:</span>
                      <input
                        type="number"
                        min={1}
                        max={300}
                        value={editAvgWaitMin}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setEditAvgWaitMin(isNaN(val) || val < 1 ? 1 : Math.min(300, val));
                        }}
                        className="w-12 text-xs font-black text-[#176B65] text-center bg-transparent focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#176B65]">min</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white rounded-xl border border-[#DCE9E3] p-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditAvgWaitMin(Math.max(1, editAvgWaitMin - 1))}
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 text-sm font-black text-[#283B3D] flex items-center justify-center cursor-pointer active:scale-95"
                      >
                        -
                      </button>
                      <span className="w-11 text-center font-bold text-xs text-[#176B65]">{editAvgWaitMin}m</span>
                      <button
                        type="button"
                        onClick={() => setEditAvgWaitMin(Math.min(300, editAvgWaitMin + 1))}
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 text-sm font-black text-[#283B3D] flex items-center justify-center cursor-pointer active:scale-95"
                      >
                        +
                      </button>
                    </div>

                    <div className="grid grid-cols-6 gap-1 flex-1">
                      {[5, 8, 10, 12, 15, 20].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setEditAvgWaitMin(num)}
                          className={`py-1 rounded-lg text-xs font-bold border transition-colors ${
                            editAvgWaitMin === num
                              ? 'bg-[#176B65] text-white border-[#176B65]'
                              : 'bg-white hover:bg-slate-100 text-[#283B3D] border-[#DCE9E3]'
                          }`}
                        >
                          {num}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#135853] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Save className="w-4 h-4 text-emerald-300" />
                    <span>Save Shop Profile & Timings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                    className="w-full py-2.5 rounded-2xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-[#283B3D] font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 7: DAY-END QUEUE CLOSE & RESET MODAL (BRD FR-708)   */}
      {/* ========================================================= */}
      <AnimatePresence>
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-[#DCE9E3] relative max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#283B3D] text-[#F2A15A] flex items-center justify-center shadow-xs">
                    <Moon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[#283B3D]">Day-End Close & Queue Reset</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-[#F2A15A]">
                        FR-708
                      </span>
                    </div>
                    <p className="text-xs text-[#283B3D]/70 font-semibold">
                      Review today&apos;s summary, conclude unserved passes & prepare for tomorrow.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F3F1E9] text-[#283B3D]/70 hover:text-[#283B3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Today's Closing Numbers Summary */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F3F1E9] to-[#DCE9E3]/50 border border-[#DCE9E3] space-y-3">
                <div className="flex items-center justify-between text-xs font-black text-[#283B3D]">
                  <span>Today&apos;s Final Performance</span>
                  <span className="text-[10px] text-slate-500 font-bold">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-[#DCE9E3]">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Served</span>
                    <span className="text-xl font-token font-bold text-emerald-700">
                      {todayCompletedCount}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-medium">completed visits</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#DCE9E3]">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Collection</span>
                    <span className="text-xl font-token font-bold text-[#176B65]">
                      ₹{(
                        completedList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) +
                        shopRecords.filter(r => (r.date === new Date().toISOString().slice(0, 10)) && r.status === 'COMPLETED').reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                      ).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-medium">today&apos;s hisaab</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#DCE9E3]">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">In Line</span>
                    <span className={`text-xl font-token font-bold ${waitingQueue.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {waitingQueue.length}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-medium">unserved queue</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#DCE9E3]">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">At Counter</span>
                    <span className="text-sm font-token font-bold text-[#283B3D] truncate block mt-1">
                      {servingToken ? servingToken.tokenNumber : 'None'}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-medium">serving desk</span>
                  </div>
                </div>
              </div>

              {/* Unserved Queue Handling Resolution */}
              {waitingQueue.length > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-amber-900">
                        {waitingQueue.length} Customer(s) Still In Waiting Queue
                      </h4>
                      <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                        Closing now will automatically expire active waiting passes so customers aren&apos;t left hanging.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] font-bold text-[#283B3D] block">
                      Choose How Unserved Passes are Marked:
                    </label>

                    <button
                      type="button"
                      onClick={() => setUnservedResolution('EXPIRE')}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                        unservedResolution === 'EXPIRE'
                          ? 'bg-white border-[#176B65] shadow-2xs'
                          : 'bg-white/60 border-amber-200 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={unservedResolution === 'EXPIRE'}
                        onChange={() => setUnservedResolution('EXPIRE')}
                        className="mt-1"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#283B3D] block">
                          Gracefully Expire With Day-End Notice (Recommended)
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Pass screen will display: &ldquo;Counter closed for the day. Opens tomorrow at {activeShop?.openingHours?.split('-')[0] || '10:00 AM'}&rdquo;.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUnservedResolution('NO_SHOW')}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                        unservedResolution === 'NO_SHOW'
                          ? 'bg-white border-[#176B65] shadow-2xs'
                          : 'bg-white/60 border-amber-200 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={unservedResolution === 'NO_SHOW'}
                        onChange={() => setUnservedResolution('NO_SHOW')}
                        className="mt-1"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#283B3D] block">
                          Mark as No-Show / Absent
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Recorded as unserved no-show in your daily footfall analytics report.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold">
                    Queue is completely empty! No customers waiting. Perfect time to close the counter.
                  </span>
                </div>
              )}

              {/* Tomorrow Morning Reset Details */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Tomorrow Morning Starting Token:</span>
                  <strong className="text-[#176B65] font-token text-sm font-bold">
                    {activeShop?.tokenPrefix || 'AK'}-001
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Counter Status After Reset:</span>
                  <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[10px]">
                    CLOSED
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Today&apos;s Hisaab Saved To:</span>
                  <span className="font-semibold text-slate-700">Historical Analytics</span>
                </div>
              </div>

              {/* Actions: Download CSV, Confirm Reset, Cancel */}
              <div className="space-y-2 pt-2 border-t border-[#DCE9E3]">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="w-full py-2.5 rounded-2xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-[#283B3D] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4 text-[#176B65]" />
                  <span>Download Today&apos;s Final Hisaab (Excel / CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDayEndReset}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#283B3D] to-slate-900 hover:from-black hover:to-slate-800 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Moon className="w-4 h-4 text-[#F2A15A]" />
                  <span>Confirm Day Close & Reset Queue for Tomorrow</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="w-full py-2 rounded-2xl text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Keep Counter Open (Cancel)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 8: MERCHANT PUBLIC REPLY TO REVIEW (BRD FR-1106)    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {replyModalOpen && replyingToReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-[#DCE9E3] relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Reply className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#283B3D]">Reply to Customer Review</h3>
                    <p className="text-xs text-[#283B3D]/70 font-semibold">
                      Your response will be publicly displayed on the customer&apos;s review card.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setReplyModalOpen(false);
                    setReplyingToReview(null);
                  }}
                  className="w-8 h-8 rounded-full bg-[#F3F1E9] text-[#283B3D]/70 hover:text-[#283B3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer Review Snippet */}
              <div className="p-3.5 rounded-2xl bg-[#F3F1E9]/70 border border-[#DCE9E3] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#283B3D]">
                  <span className="flex items-center gap-1.5">
                    <strong>{replyingToReview.customerName}</strong>
                    <span className="text-slate-400 font-mono">({replyingToReview.tokenNumber})</span>
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= replyingToReview.rating
                            ? 'fill-amber-400 text-amber-500'
                            : 'fill-slate-200 text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">
                  &ldquo;{replyingToReview.comment}&rdquo;
                </p>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSubmitMerchantReply} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#283B3D]">
                    Your Response (as {activeShop?.name || 'Owner'}):
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a polite response to your customer..."
                    className="w-full bg-[#F3F1E9]/50 border border-[#DCE9E3] rounded-2xl p-3.5 text-xs font-medium text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>

                {/* Quick Templates */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Quick Response Templates:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Thank you for your visit and kind feedback! We look forward to serving you again.',
                      'Thank you for your feedback! We have noted this and improved our pace.',
                      'Shukriya ji! Aapki suvidha aur time bachana hamari priority hai.'
                    ].map((template) => (
                      <button
                        key={template}
                        type="button"
                        onClick={() => setReplyText(template)}
                        className="text-[11px] font-semibold text-left px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-[#DCE9E3] text-[#283B3D] transition-colors border border-slate-200 cursor-pointer"
                      >
                        + &ldquo;{template.slice(0, 36)}...&rdquo;
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#135853] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Reply className="w-4 h-4 text-emerald-300" />
                    <span>Post Public Response</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyModalOpen(false);
                      setReplyingToReview(null);
                    }}
                    className="w-full py-2 rounded-2xl text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 9: REPORT / FLAG FAKE REVIEW (BRD FR-1106)          */}
      {/* ========================================================= */}
      <AnimatePresence>
        {flagModalOpen && flaggingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#DCE9E3] relative"
            >
              <div className="flex items-start justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Flag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#283B3D]">Report Suspicious Review</h3>
                    <p className="text-[11px] text-slate-500 font-semibold">Flag for platform admin review</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFlagModalOpen(false);
                    setFlaggingReview(null);
                  }}
                  className="w-7 h-7 rounded-full bg-[#F3F1E9] text-[#283B3D]/70 hover:text-[#283B3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-xs text-rose-900">
                Reporting review by <strong>{flaggingReview.customerName}</strong> ({flaggingReview.tokenNumber}).
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#283B3D]">Select Reason:</label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                >
                  <option value="Not a real customer visit">Not a real customer visit / Fake token</option>
                  <option value="Abusive or inappropriate language">Abusive or offensive language</option>
                  <option value="Competitor defamation / Spam">Competitor defamation / Spam</option>
                  <option value="Mistaken shop identity">Mistaken shop identity</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleConfirmFlagReview}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Flag className="w-4 h-4" />
                  <span>Confirm Report to Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFlagModalOpen(false);
                    setFlaggingReview(null);
                  }}
                  className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 10: EMERGENCY FLASH QUEUE BROADCAST (BRD FR-708/405) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {broadcastModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-[#DCE9E3] relative max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                    broadcastSeverity === 'CRITICAL' ? 'bg-rose-600' : broadcastSeverity === 'INFO' ? 'bg-teal-600' : 'bg-amber-600'
                  }`}>
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#283B3D]">Flash Queue Broadcast</h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Instant emergency delay warning pushed to all waiting customer passes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBroadcastModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F3F1E9] text-[#283B3D]/70 hover:text-[#283B3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Template Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#283B3D] block">
                  ⚡ 1-Tap Quick Templates:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: '⚡ Power Outage',
                      reason: 'Power Outage / Generator Delay',
                      delay: 15,
                      sev: 'WARNING',
                      msg: 'Market power cut in progress. Generator running, counter queue moving with ~15 min delay.'
                    },
                    {
                      label: '🚨 Doctor Emergency',
                      reason: 'Emergency Patient Inflow',
                      delay: 20,
                      sev: 'CRITICAL',
                      msg: 'Doctor attending to an urgent priority medical emergency. Waiting tokens delayed ~20 mins.'
                    },
                    {
                      label: '🧼 Sanitization Break',
                      reason: 'Equipment Sanitization',
                      delay: 10,
                      sev: 'INFO',
                      msg: 'Brief 10-minute counter & tool sanitization cycle in progress for customer hygiene.'
                    },
                    {
                      label: '🌧️ Heavy Rain / Weather',
                      reason: 'Heavy Rain / Traffic Delay',
                      delay: 15,
                      sev: 'WARNING',
                      msg: 'Severe weather causing slow traffic turnover. Expect ~15 min additional queue wait.'
                    }
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setBroadcastReason(tpl.reason);
                        setBroadcastDelayMinutes(tpl.delay);
                        setBroadcastSeverity(tpl.sev);
                        setBroadcastMessage(tpl.msg);
                      }}
                      className="p-2.5 rounded-xl border border-[#DCE9E3] hover:border-[#176B65] hover:bg-[#DCE9E3]/20 text-left transition-all cursor-pointer text-xs font-bold text-[#283B3D]"
                    >
                      <div>{tpl.label}</div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">+{tpl.delay}m • {tpl.sev}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handlePublishBroadcast} className="space-y-4">
                {/* Broadcast Reason & Severity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#283B3D]">Broadcast Reason:</label>
                    <input
                      type="text"
                      value={broadcastReason}
                      onChange={(e) => setBroadcastReason(e.target.value)}
                      placeholder="e.g. Power Outage, Urgent Sanitization"
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#283B3D]">Alert Severity:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'WARNING', label: 'Warning', bg: 'bg-amber-500 text-white', border: 'border-amber-300' },
                        { id: 'CRITICAL', label: 'Critical', bg: 'bg-rose-600 text-white', border: 'border-rose-300' },
                        { id: 'INFO', label: 'Info', bg: 'bg-teal-600 text-white', border: 'border-teal-300' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBroadcastSeverity(item.id)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            broadcastSeverity === item.id ? `${item.bg} shadow-xs font-black` : 'bg-white text-slate-600 border-[#DCE9E3]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delay Adder Stepper */}
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#F3F1E9]/60 border border-[#DCE9E3]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#283B3D]">Queue Delay Offset:</span>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Added dynamically to customer wait times on pass screens
                      </p>
                    </div>
                    <span className="text-sm font-black font-mono text-[#176B65] bg-white px-3 py-1 rounded-lg border border-[#DCE9E3]">
                      +{broadcastDelayMinutes} min
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    {[0, 10, 15, 20, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setBroadcastDelayMinutes(mins)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          broadcastDelayMinutes === mins
                            ? 'bg-[#176B65] text-white border-[#176B65]'
                            : 'bg-white hover:bg-slate-100 text-[#283B3D] border-[#DCE9E3]'
                        }`}
                      >
                        {mins === 0 ? '0m' : `+${mins}m`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Broadcast Message Textarea */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#283B3D]">Custom Notice Message:</label>
                    <span className="text-[10px] text-slate-400 font-semibold">{broadcastMessage.length}/180 chars</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={180}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Write a clear, reassuring message for waiting customers..."
                    className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-xl p-3 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65] leading-relaxed"
                    required
                  />
                </div>

                {/* Live Customer Preview */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    📱 Live Customer Pass Preview:
                  </span>
                  <div className={`p-3.5 rounded-2xl border text-xs shadow-xs ${
                    broadcastSeverity === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : broadcastSeverity === 'INFO'
                      ? 'bg-teal-50 border-teal-300 text-teal-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Radio className="w-3.5 h-3.5 animate-pulse text-amber-600" />
                      <span className="font-black text-[10px] uppercase tracking-wider bg-black/10 px-1.5 py-0.5 rounded">
                        Emergency Notice • {broadcastReason || 'Flash Delay'}
                      </span>
                      {broadcastDelayMinutes > 0 && (
                        <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded ml-auto">
                          +{broadcastDelayMinutes}m delay
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-xs leading-relaxed">
                      {broadcastMessage || 'Emergency delay notice message...'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Broadcast Flash Alert (Push to All Passes)</span>
                  </button>

                  {activeBroadcast && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClearBroadcast();
                        setBroadcastModalOpen(false);
                      }}
                      className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer border border-rose-200 text-center"
                    >
                      Clear Existing Broadcast Alert
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setBroadcastModalOpen(false)}
                    className="w-full py-2 rounded-2xl text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 11: UNIVERSAL SERVICE MENU & RATE CARD (BRD FR-604) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {servicesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setServicesModalOpen(false)} 
              className="fixed inset-0"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#DCE9E3] z-10 overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-[#DCE9E3] px-6 py-4 bg-[#F3F1E9]/60 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#176B65] text-white flex items-center justify-center shadow-xs">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#283B3D]">Service Menu & Rate Card</h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Configure custom services, prices & durations for {activeShop?.name || 'Your Business'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setServicesModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-[#DCE9E3] text-[#283B3D]/70 hover:text-[#283B3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Feedback Toast Banner */}
              {serviceFeedbackMsg && (
                <div className="px-6 py-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold border-b border-emerald-200 flex items-center justify-between">
                  <span>{serviceFeedbackMsg}</span>
                  <button onClick={() => setServiceFeedbackMsg('')} className="text-emerald-600 hover:text-emerald-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Modal Body */}
              <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
                
                {/* Category Identity Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#DCE9E3]/70 to-[#F3F1E9] border border-[#176B65]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#176B65] text-white px-2.5 py-0.5 rounded-md">
                        {detectCategoryKey(activeShop)} RATE CARD
                      </span>
                      <span className="text-xs font-bold text-[#283B3D]">
                        {shopServicesList.filter(s => s.active).length} Active Services Configured
                      </span>
                    </div>
                    <p className="text-xs text-[#283B3D]/70 font-medium mt-1">
                      Services and rates defined here are used for 1-tap billing at the counter and customer passes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetServicesToCategory}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE9E3] hover:bg-slate-50 text-xs font-bold text-[#176B65] transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95 flex items-center gap-1.5"
                    title="Load standard market default services for this industry category"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Defaults</span>
                  </button>
                </div>

                {/* Add New Custom Service Form */}
                <form onSubmit={handleAddService} className="p-4 rounded-2xl bg-[#F3F1E9]/60 border border-[#DCE9E3] space-y-3">
                  <span className="text-xs font-black text-[#283B3D] uppercase tracking-wide block">
                    ➕ Add New Service / Item
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-6">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Service / Item Name:</label>
                      <input
                        type="text"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        placeholder="e.g. Ultrasonic Scaling, CBC Blood Test, Beard Spa"
                        className="w-full bg-white border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Price (₹):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={newServicePrice}
                          onChange={(e) => setNewServicePrice(e.target.value)}
                          placeholder="250"
                          className="w-full bg-white border border-[#DCE9E3] rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Duration (Min):</label>
                      <input
                        type="number"
                        min="1"
                        max="240"
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        placeholder="15"
                        className="w-full bg-white border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save Service to Rate Card</span>
                  </button>
                </form>

                {/* Services List Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#283B3D] px-1">
                    <span>Active Services & Items ({shopServicesList.length}):</span>
                    <span className="text-[11px] text-slate-400 font-semibold">Prices can be edited directly below</span>
                  </div>

                  <div className="space-y-2">
                    {shopServicesList.map((srv, idx) => (
                      <div 
                        key={srv.id || idx}
                        className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          srv.active 
                            ? 'bg-white border-[#DCE9E3] hover:border-[#176B65]' 
                            : 'bg-slate-50/70 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-[#F3F1E9] text-[10px] font-mono font-bold text-slate-500 flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-xs text-[#283B3D] block">
                              {srv.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              ⏱️ ~{srv.duration || 15} mins duration
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 justify-end">
                          {/* Editable Price Tag */}
                          <div className="flex items-center bg-[#F3F1E9] border border-[#DCE9E3] rounded-xl px-2.5 py-1">
                            <span className="text-xs font-black text-[#176B65] mr-1">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={srv.price}
                              onChange={(e) => handleUpdateServicePrice(srv.id, e.target.value)}
                              className="w-16 bg-transparent text-xs font-black text-[#283B3D] focus:outline-none"
                              title="Click to edit price"
                            />
                          </div>

                          {/* Toggle Active Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleService(srv.id)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                              srv.active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {srv.active ? 'Active' : 'Disabled'}
                          </button>

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => handleDeleteService(srv.id)}
                            className="w-7 h-7 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete this service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="border-t border-[#DCE9E3] px-6 py-3.5 bg-[#F3F1E9]/40 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-500 font-semibold">
                  Changes save automatically and reflect across customer passes.
                </span>
                <button
                  type="button"
                  onClick={() => setServicesModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Done
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 12: WHATSAPP CUSTOMER TURN REMINDER (BRD FR-704)    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {whatsappModalOpen && whatsappTargetCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-[#DCE9E3] relative max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#283B3D]">WhatsApp Turn Alert</h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Notify {whatsappTargetCustomer.customerName} (+91 {whatsappTargetCustomer.customerPhone})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsappModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F3F1E9] text-[#283B3D]/70 hover:text-[#283B3D] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer Token Card Summary */}
              <div className="p-3.5 rounded-2xl bg-[#F3F1E9]/70 border border-[#DCE9E3] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#176B65] text-white font-token font-bold text-sm flex items-center justify-center shadow-xs">
                    {whatsappTargetCustomer.tokenNumber}
                  </div>
                  <div>
                    <span className="font-black text-sm text-[#283B3D] block">{whatsappTargetCustomer.customerName}</span>
                    <span className="text-[11px] text-slate-500 font-semibold block">
                      {whatsappTargetCustomer.service} • {whatsappTargetCustomer.waitAhead ?? 0} Ahead (~{whatsappTargetCustomer.estWaitMin ?? 10}m)
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${whatsappTargetCustomer.customerPhone}`}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#DCE9E3] hover:bg-slate-50 text-xs font-bold text-[#283B3D] flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Phone</span>
                </a>
              </div>

              {/* Template Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#283B3D] block">
                  ⚡ Choose Notification Template:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'CALLING_SOON', label: '🔔 Calling Soon', desc: 'Next in line alert' },
                    { id: 'SERVING_NOW', label: '🟢 Serving Now', desc: 'Step up to desk' },
                    { id: 'ABSENT_RECALL', label: '⚠️ Grace Hold', desc: 'Turn missed notice' },
                    { id: 'DELAY_NOTICE', label: '⏳ Delay Notice', desc: '+10m extra wait' }
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setWhatsappMessagePreset(tpl.id);
                        setWhatsappCustomText(getWhatsAppMessageText(whatsappTargetCustomer, tpl.id));
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        whatsappMessagePreset === tpl.id
                          ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-[#283B3D] border-[#DCE9E3]'
                      }`}
                    >
                      <div className="text-xs font-black">{tpl.label}</div>
                      <div className={`text-[10px] font-semibold ${whatsappMessagePreset === tpl.id ? 'text-white/80' : 'text-slate-400'}`}>
                        {tpl.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#283B3D]">Message Content (Editable):</label>
                  <span className="text-[10px] text-slate-400 font-semibold">{whatsappCustomText.length} chars</span>
                </div>
                <textarea
                  rows={5}
                  value={whatsappCustomText}
                  onChange={(e) => setWhatsappCustomText(e.target.value)}
                  className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl p-3 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65] leading-relaxed"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDirectWhatsAppSend(whatsappTargetCustomer, whatsappMessagePreset, whatsappCustomText);
                    setWhatsappModalOpen(false);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Open WhatsApp & Send Message (1-Tap)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWhatsappModalOpen(false)}
                  className="w-full py-2 rounded-2xl text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 13: MULTI-STATION & COUNTER STUDIO (BRD FR-709)       */}
      {/* ========================================================= */}
      <AnimatePresence>
        {stationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-[#DCE9E3] shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#283B3D]">Stations & Counters Management</h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Configure chairs, consultation chambers, billing desks & staff assignments (FR-709)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStationModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#F3F1E9] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Feedback Alert */}
              {stationFeedbackMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <span>{stationFeedbackMsg}</span>
                </div>
              )}

              {/* Category Default Reset Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#DCE9E3]/70 to-[#F3F1E9] border border-[#176B65]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#176B65] text-white px-2.5 py-0.5 rounded-md">
                    {detectCategoryKey(activeShop)} Archetype
                  </span>
                  <p className="text-xs text-[#283B3D]/70 font-medium mt-1">
                    Manage service desks for {activeShop?.name || 'Your Business'}. Add, rename, or mark staff on leave.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetStationsToCategory}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE9E3] hover:bg-slate-50 text-xs font-bold text-[#176B65] transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95 flex items-center gap-1.5"
                  title="Reset to category preset chairs/chambers"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Defaults</span>
                </button>
              </div>

              {/* Add New Station Form */}
              <form onSubmit={handleAddStation} className="p-4 rounded-2xl bg-[#F3F1E9]/50 border border-[#DCE9E3] space-y-3">
                <span className="text-xs font-black text-[#283B3D] block">
                  Add New Station / Chair / Chamber
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#283B3D]/70 mb-1">
                      Station Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chair #4 / Bay #3"
                      value={newStationName}
                      onChange={(e) => setNewStationName(e.target.value)}
                      className="w-full bg-white border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#283B3D]/70 mb-1">
                      Staff / Operator Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wasim (Stylist)"
                      value={newStationStaff}
                      onChange={(e) => setNewStationStaff(e.target.value)}
                      className="w-full bg-white border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#283B3D]/70 mb-1">
                      Role / Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Grooming / OPD"
                      value={newStationRole}
                      onChange={(e) => setNewStationRole(e.target.value)}
                      className="w-full bg-white border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Station</span>
                </button>
              </form>

              {/* Existing Stations List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#283B3D]">
                  <span>Configured Stations ({stationsList.length})</span>
                  <span className="text-slate-400 font-semibold text-[11px]">Toggle Active/On-leave status below</span>
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {stationsList.map((st) => (
                    <div
                      key={st.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        st.active ? 'bg-white border-[#DCE9E3]' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          st.active ? 'bg-[#DCE9E3] text-[#176B65]' : 'bg-slate-200 text-slate-500'
                        }`}>
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#283B3D]">{st.name}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              st.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {st.active ? 'Active' : 'On Leave'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-semibold block">
                            {st.staffName} {st.role ? `• ${st.role}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 mr-1">
                          {st.totalServedToday || 0} served
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleStationActive(st.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            st.active 
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {st.active ? 'Mark On Leave' : 'Mark Active'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStation(st.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Station"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStationModalOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-black text-xs shadow-md transition-all cursor-pointer text-center"
                >
                  Done & Save Stations
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 14: QUICK KHATA SETTLEMENT / CREDIT (BRD FR-712)     */}
      {/* ========================================================= */}
      <AnimatePresence>
        {khataModalOpen && selectedKhataCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#DCE9E3] shadow-2xl space-y-5 my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    khataEntryType === 'PAYMENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {khataEntryType === 'PAYMENT' ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#283B3D]">
                      {khataEntryType === 'PAYMENT' ? 'Receive Payment (Jama)' : 'Add Udhaar (Credit)'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {selectedKhataCustomer.customerName} • {selectedKhataCustomer.customerPhone ? `+91 ${selectedKhataCustomer.customerPhone}` : 'Offline'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setKhataModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#F3F1E9] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Outstanding Banner */}
              <div className="p-3.5 rounded-2xl bg-[#F3F1E9]/70 border border-[#DCE9E3] flex items-center justify-between">
                <span className="text-xs font-bold text-[#283B3D]/70">Current Pending Baqaya:</span>
                <span className="font-token font-bold text-base text-rose-700">
                  ₹{(selectedKhataCustomer.totalPending || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-[#F3F1E9] p-1 rounded-2xl border border-[#DCE9E3]">
                <button
                  type="button"
                  onClick={() => setKhataEntryType('PAYMENT')}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    khataEntryType === 'PAYMENT'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🟢 Jama (Payment Received)
                </button>
                <button
                  type="button"
                  onClick={() => setKhataEntryType('CREDIT')}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    khataEntryType === 'CREDIT'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔴 Udhaar (Add Balance)
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveKhataTransaction} className="space-y-4">
                {/* Amount Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#283B3D]">
                    {khataEntryType === 'PAYMENT' ? 'Kitna Paisa Jama Hua? (Amount Received) *' : 'Kitna Udhaar Jodna Hai? (Credit Amount) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={500000}
                      placeholder="0"
                      value={khataEntryAmount}
                      onChange={(e) => setKhataEntryAmount(e.target.value)}
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl pl-8 pr-4 py-2.5 text-base font-token font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      required
                    />
                  </div>

                  {/* Preset Pills */}
                  {khataEntryType === 'PAYMENT' && (selectedKhataCustomer.totalPending || 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold mr-1">Quick:</span>
                      <button
                        type="button"
                        onClick={() => setKhataEntryAmount(String(selectedKhataCustomer.totalPending))}
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold cursor-pointer"
                      >
                        Poora Hisaab (₹{selectedKhataCustomer.totalPending})
                      </button>
                      {[50, 100, 200, 500].map(amt => (
                        amt < (selectedKhataCustomer.totalPending || 0) && (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setKhataEntryAmount(String(amt))}
                            className="px-2 py-1 rounded-xl bg-white border border-[#DCE9E3] text-[10px] font-bold text-[#283B3D] hover:bg-slate-50 cursor-pointer"
                          >
                            ₹{amt}
                          </button>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Mode Selector for Payment */}
                {khataEntryType === 'PAYMENT' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#283B3D]">
                      Payment Mode (Kisme Diya?)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'CASH', label: 'Cash (Naqad)', icon: '💵' },
                        { id: 'UPI', label: 'UPI (GPay/PhonePe)', icon: '📱' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setKhataEntryMode(m.id)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                            khataEntryMode === m.id
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                              : 'bg-white border-[#DCE9E3] text-[#283B3D]'
                          }`}
                        >
                          <span>{m.icon}</span>
                          <span>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#283B3D]">
                    Remark / Service Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={khataEntryType === 'PAYMENT' ? "e.g. Paid in cash at counter" : "e.g. Medicine purchase / Shaving bill"}
                    value={khataEntryNotes}
                    onChange={(e) => setKhataEntryNotes(e.target.value)}
                    className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl px-3.5 py-2 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full py-3.5 rounded-2xl text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                      khataEntryType === 'PAYMENT' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                    }`}
                  >
                    <span>{khataEntryType === 'PAYMENT' ? 'Confirm & Record Jama' : 'Confirm & Add Udhaar'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 15: CUSTOMER KHATA STATEMENT / PASSBOOK (BRD FR-712) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {statementModalOpen && statementCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full border border-[#DCE9E3] shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center shrink-0">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#283B3D]">
                      Khata Passbook Statement
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {statementCustomer.customerName} • {statementCustomer.customerPhone ? `+91 ${statementCustomer.customerPhone}` : 'Walk-in'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStatementModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#F3F1E9] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Net Balance Pill */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#DCE9E3]/70 to-[#F3F1E9] border border-[#176B65]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Current Net Balance Due
                  </span>
                  <span className="font-token font-bold text-2xl text-rose-700">
                    ₹{(statementCustomer.totalPending || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                {statementCustomer.customerPhone && statementCustomer.customerPhone !== 'Offline' && (
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppKhataReminder(statementCustomer)}
                    className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Send Reminder</span>
                  </button>
                )}
              </div>

              {/* Transaction Passbook List */}
              <div className="space-y-2">
                <span className="text-xs font-black text-[#283B3D] block">
                  Complete Transaction History ({statementCustomer.transactions?.length || 0})
                </span>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {statementCustomer.transactions && statementCustomer.transactions.length > 0 ? (
                    statementCustomer.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          tx.type === 'PAYMENT' ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            tx.type === 'PAYMENT' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {tx.type === 'PAYMENT' ? '↓' : '↑'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-black ${tx.type === 'PAYMENT' ? 'text-emerald-800' : 'text-rose-800'}`}>
                                {tx.type === 'PAYMENT' ? '🟢 Jama (Payment)' : '🔴 Udhaar (Credit)'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                              </span>
                              {tx.paymentMode && (
                                <span className="text-[9px] uppercase font-bold bg-white/80 px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                                  {tx.paymentMode}
                                </span>
                              )}
                              {tx.tokenNumber && tx.tokenNumber !== '-' && (
                                <span className="text-[9px] font-token font-bold text-[#176B65] bg-[#DCE9E3]/70 px-1.5 py-0.2 rounded">
                                  Pass #{tx.tokenNumber}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-600 font-semibold block line-clamp-1 mt-0.5">
                              {tx.serviceOrReason || (tx.type === 'PAYMENT' ? 'Cash/UPI Payment' : 'Service Udhaar')}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`font-token font-bold text-sm block ${tx.type === 'PAYMENT' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {tx.type === 'PAYMENT' ? `-₹${tx.amount}` : `+₹${tx.amount}`}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Bal: ₹{tx.balanceAfter !== undefined ? tx.balanceAfter : statementCustomer.totalPending}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No past transactions found for this customer.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: WhatsApp Statement + Done */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                {statementCustomer.customerPhone && statementCustomer.customerPhone !== 'Offline' && (
                  <button
                    type="button"
                    onClick={() => {
                      const cleanPhone = statementCustomer.customerPhone.replace(/\D/g, '').slice(-10);
                      const shopName = activeShop?.name || 'Hamari Dukan';
                      const txLines = (statementCustomer.transactions || []).slice(0, 5).map(tx => 
                        `• ${tx.date ? new Date(tx.date).toLocaleDateString('en-IN') : 'Recent'}: ${tx.type === 'PAYMENT' ? '🟢 Jama' : '🔴 Udhaar'} ₹${tx.amount} (${tx.serviceOrReason || ''})`
                      ).join('\n');
                      const msg = `Namaste ${statementCustomer.customerName} ji! 🙏\n\n${shopName} Khata Passbook Hisaab:\n\n${txLines}\n\n👉 Kul Baqaya Balance Due: ₹${(statementCustomer.totalPending || 0).toLocaleString('en-IN')}\n\nDhanyawad! ✨\n— ${shopName}`;
                      window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Send Statement on WhatsApp</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setStatementModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-black text-xs shadow-md transition-all cursor-pointer text-center"
                >
                  Done & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 16: ADD NEW CUSTOMER KHATA ACCOUNT (BRD FR-712)       */}
      {/* ========================================================= */}
      <AnimatePresence>
        {newCustomerKhataModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#DCE9E3] shadow-2xl space-y-5 my-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#283B3D]">
                      Register Customer Khata
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Add a customer to your digital Udhaar ledger (FR-712)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNewCustomerKhataModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#F3F1E9] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateNewKhataCustomer} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#283B3D] mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Verma, Gupta Ji"
                    value={newKhataName}
                    onChange={(e) => setNewKhataName(e.target.value)}
                    className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#283B3D] mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={newKhataPhone}
                      onChange={(e) => setNewKhataPhone(e.target.value)}
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-xl pl-12 pr-3.5 py-2.5 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">
                    Used to send WhatsApp payment reminders.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#283B3D] mb-1">
                    Initial Udhaar / Opening Due (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={newKhataInitialDue}
                      onChange={(e) => setNewKhataInitialDue(e.target.value)}
                      className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#283B3D] mb-1">
                    Opening Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Purana hisaab baaki hai"
                    value={newKhataNotes}
                    onChange={(e) => setNewKhataNotes(e.target.value)}
                    className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Khata Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCustomerKhataModalOpen(false)}
                    className="w-full py-2 rounded-2xl text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 17: STAFF OPERATOR PIN NUMPAD & ATTENDANCE PUNCH (BRD FR-711) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {staffPinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStaffPinModalOpen(false)}
              className="fixed inset-0"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#DCE9E3] space-y-4 z-10 text-center"
            >
              <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-[#176B65] flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-[#176B65]" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#283B3D]">
                      {pinTargetStaff === 'OWNER' ? 'Owner Master PIN' : (pinTargetStaff?.name || 'Staff Login')}
                    </h3>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md inline-block">
                      {pinAction === 'SWITCH' ? 'Switch Active Terminal' : pinAction === 'CLOCK_IN' ? 'Punch Clock In (Start Duty)' : pinAction === 'CLOCK_OUT' ? 'Punch Clock Out (End Duty)' : pinAction === 'BREAK' ? 'Punch Break / Resume' : 'Owner Master Authentication'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setStaffPinModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Description */}
              <p className="text-xs text-[#283B3D]/70 font-semibold">
                {pinTargetStaff === 'OWNER'
                  ? 'Enter 4-digit Master Owner PIN to unlock staff manager & PIN editor'
                  : `Enter 4-digit quick PIN for ${pinTargetStaff?.name || 'operator'}`
                }
              </p>

              {/* 4-Digit Display Circles */}
              <div className="py-2">
                <div className="flex items-center justify-center gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const isFilled = pinInput.length > idx;
                    return (
                      <div
                        key={idx}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black font-mono transition-all border-2 ${
                          isFilled
                            ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs scale-105'
                            : 'bg-[#F3F1E9]/70 text-slate-300 border-[#DCE9E3]'
                        }`}
                      >
                        {isFilled ? '●' : '○'}
                      </div>
                    );
                  })}
                </div>

                {/* Keyboard input field for desktop physical typing */}
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPinInput(clean);
                    setPinError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && pinInput.length === 4) {
                      handleVerifyAndExecutePin();
                    }
                  }}
                  autoFocus
                  placeholder="Enter 4-digit PIN"
                  className="w-full mt-2.5 text-center bg-transparent text-xs font-mono font-bold text-transparent caret-[#176B65] focus:outline-none"
                />
              </div>

              {/* Error Message */}
              {pinError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-shake">
                  {pinError}
                </div>
              )}

              {/* Touch Numpad Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (pinInput.length < 4) {
                        setPinInput(prev => prev + num);
                        setPinError('');
                      }
                    }}
                    className="py-3 rounded-2xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-[#283B3D] text-lg font-black transition-colors cursor-pointer active:scale-95 shadow-2xs"
                  >
                    {num}
                  </button>
                ))}

                {/* Clear */}
                <button
                  type="button"
                  onClick={() => {
                    setPinInput('');
                    setPinError('');
                  }}
                  className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer active:scale-95"
                >
                  Clear
                </button>

                {/* 0 */}
                <button
                  type="button"
                  onClick={() => {
                    if (pinInput.length < 4) {
                      setPinInput(prev => prev + '0');
                      setPinError('');
                    }
                  }}
                  className="py-3 rounded-2xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-[#283B3D] text-lg font-black transition-colors cursor-pointer active:scale-95 shadow-2xs"
                >
                  0
                </button>

                {/* Backspace */}
                <button
                  type="button"
                  onClick={() => {
                    setPinInput(prev => prev.slice(0, -1));
                    setPinError('');
                  }}
                  className="py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer active:scale-95"
                >
                  ⌫
                </button>
              </div>

              {/* Hint for demo testing */}
              <div className="text-[10px] text-slate-400 font-semibold pt-1">
                Demo Quick PIN: <span className="font-bold text-[#176B65]">{pinTargetStaff === 'OWNER' ? ownerMasterPin : (pinTargetStaff?.pin || '1111')}</span>
              </div>

              {/* Verify CTA */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={pinInput.length !== 4}
                  onClick={handleVerifyAndExecutePin}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                    pinInput.length === 4
                      ? 'bg-[#176B65] hover:bg-[#125550] text-white shadow-teal-900/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm PIN & Execute</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStaffPinModalOpen(false)}
                  className="w-full py-1.5 rounded-xl text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 18: ADD / MANAGE STAFF OPERATOR STUDIO (BRD FR-711) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {staffManageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStaffManageModalOpen(false)}
              className="fixed inset-0"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl border border-[#DCE9E3] space-y-5 z-10"
            >
              <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-[#176B65] flex items-center justify-center">
                    <BadgeCheck className="w-5 h-5 text-[#176B65]" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#283B3D]">Staff Operators & PIN Credentials</h3>
                    <p className="text-xs text-[#283B3D]/70 font-semibold">
                      Manage operator roster, assign custom 4-digit PINs, and configure store Master PIN
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStaffManageModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form to Register New Staff Operator */}
              <div className="p-4 rounded-2xl bg-[#F3F1E9]/60 border border-[#DCE9E3] space-y-3">
                <h4 className="text-xs font-black uppercase text-[#176B65] tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span>Register New Staff Operator</span>
                </h4>

                <form onSubmit={handleAddStaffMember} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#283B3D]">Operator Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        required
                        className="w-full bg-white border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#283B3D]">Role / Station *</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Stylist / Cashier / Doctor"
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value)}
                        className="w-full bg-white border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#283B3D]">Contact Phone (Optional)</label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="e.g. 9876543210"
                        value={newStaffPhone}
                        onChange={(e) => setNewStaffPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#283B3D]">4-Digit Quick Login PIN *</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="e.g. 1234"
                        value={newStaffPin}
                        onChange={(e) => setNewStaffPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white border border-[#DCE9E3] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Operator to Roster</span>
                  </button>
                </form>
              </div>

              {/* Owner Master PIN Settings */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#283B3D] block">Store Owner Master PIN</span>
                  <span className="text-[11px] text-slate-500">Overrides all terminals and unlocks manager mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={ownerMasterPin}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                      saveOwnerPin(clean);
                    }}
                    className="w-20 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-center text-[#283B3D]"
                  />
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded-md">Saved</span>
                </div>
              </div>

              {/* Current Staff Operators Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-[#283B3D] tracking-wider">
                  Active Staff Directory ({staffList.length})
                </h4>

                <div className="border border-[#DCE9E3] rounded-2xl overflow-hidden divide-y divide-[#DCE9E3]">
                  {staffList.map((st) => (
                    <div key={st.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F3F1E9]/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#176B65] font-black text-xs flex items-center justify-center">
                          {st.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-[#283B3D]">{st.name}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                              {st.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Phone: {st.phone || 'Offline'} • PIN: <span className="font-mono font-bold text-[#176B65]">{st.pin}</span> • Served: {st.servedCountToday || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteStaffMember(st.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove operator"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStaffManageModalOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-[#283B3D] text-xs font-black transition-colors cursor-pointer text-center"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
