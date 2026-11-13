export const MOCK_SHOPS = [
  {
    id: "d1b2c3d4-0000-0000-0000-000000000001",
    name: "Royal Barber & Hair Style",
    slug: "royal-barber-indira-nagar",
    categoryName: "Salon & Barber",
    address: "Shop 12, Main Market, Sector 14, Indira Nagar, Lucknow",
    status: "OPEN",
    verified: true,
    crowdLabel: "Light",
    waitingCount: 2,
    estimatedWaitMin: 10,
    currentServing: "#1",
    phone: "9876543210",
    openingHours: "09:00 AM – 09:30 PM",
    description: "Modern professional grooming, styling, and beard care with live digital queue tracking.",
    imageUrl: "/images/barber.jpg",
    rating: 4.9,
    reviewCount: 48,
    reviews: [
      { customerName: "Aman Sharma", stars: 5, text: "Haircut on-time mila! Bina dhoop aur line ke sofa par baithne ka jhanjhat khatam.", tags: ["ON_TIME", "BEHAVIOUR"], date: "Yesterday" },
      { customerName: "Rahul Gupta", stars: 5, text: "Digital token system is wonderful. Staff was very polite and skilled.", tags: ["BEHAVIOUR"], date: "3 days ago" },
      { customerName: "Vikram Singh", stars: 4, text: "Good styling, clean tools, waited only 5 mins at shop.", tags: ["ON_TIME"], date: "1 week ago" }
    ]
  },
  {
    id: "d1b2c3d4-0000-0000-0000-000000000002",
    name: "Gupta Medical Store",
    slug: "gupta-medical-indira-nagar",
    categoryName: "Medical & Pharmacy",
    address: "Plot 8, Aurobindo Park Cross, Indira Nagar, Lucknow",
    status: "OPEN",
    verified: true,
    crowdLabel: "Moderate",
    waitingCount: 3,
    estimatedWaitMin: 12,
    currentServing: "#2",
    phone: "9876543211",
    openingHours: "08:00 AM – 11:00 PM",
    description: "100% genuine prescription medicines and wellness products with fast counter pickup.",
    imageUrl: "/images/pharmacy.jpg",
    rating: 4.8,
    reviewCount: 36,
    reviews: [
      { customerName: "Pooja Verma", stars: 5, text: "Dawa lene ke liye line me nahi lagna pada. Counter par pahuche aur turant packet ready tha.", tags: ["ON_TIME"], date: "2 days ago" },
      { customerName: "Mohd. Tariq", stars: 5, text: "Very polite bhaiya, 100% genuine medicines and fast bill.", tags: ["BEHAVIOUR"], date: "5 days ago" }
    ]
  },
  {
    id: "d1b2c3d4-0000-0000-0000-000000000003",
    name: "Dr. Verma Dental & Oral Care Clinic",
    slug: "dr-verma-dental-care",
    categoryName: "Doctor & Clinic",
    address: "B-23, Sector 14, Main Market, Indira Nagar, Lucknow",
    status: "OPEN",
    verified: true,
    crowdLabel: "Light",
    waitingCount: 2,
    estimatedWaitMin: 15,
    currentServing: "D-004",
    phone: "9876543212",
    openingHours: "10:00 AM – 02:00 PM & 05:00 PM – 09:00 PM",
    description: "Specialized multi-chair dental treatments with digital contact-free queue management.",
    imageUrl: "/images/clinic.jpg",
    rating: 4.9,
    reviewCount: 52,
    reviews: [
      { customerName: "Dr. Sandeep Shukla", stars: 5, text: "Dr. Verma attends very patiently. Token calling on phone meant zero waiting in clinic lobby.", tags: ["ON_TIME", "BEHAVIOUR"], date: "Yesterday" },
      { customerName: "Kavita Rastogi", stars: 5, text: "Super clean clinic and painless dental checkup.", tags: ["BEHAVIOUR"], date: "4 days ago" }
    ]
  },
  {
    id: "d1b2c3d4-0000-0000-0000-000000000004",
    name: "Awadh Fast Food & Chaat Corner",
    slug: "awadh-fast-food",
    categoryName: "Food & Chaat",
    address: "Food Street, Sector 11, Indira Nagar, Lucknow",
    status: "BUSY",
    verified: true,
    crowdLabel: "High Rush",
    waitingCount: 9,
    estimatedWaitMin: 20,
    currentServing: "A-044",
    phone: "9876543213",
    openingHours: "12:00 PM – 11:00 PM",
    description: "Authentic Lucknow street cuisine and fresh snacks with digital tokens instead of crowded counters.",
    imageUrl: "/images/food.jpg",
    rating: 4.7,
    reviewCount: 85,
    reviews: [
      { customerName: "Sachin Yadav", stars: 5, text: "Crispy Basket Chaat! Sabse acchi baat ye hai ki counter par dhakka-mukki nahi karni padti.", tags: ["ON_TIME"], date: "Yesterday" },
      { customerName: "Anjali Mishra", stars: 4, text: "Token display is very helpful in high rush hours.", tags: ["BEHAVIOUR"], date: "3 days ago" }
    ]
  },
  {
    id: "d1b2c3d4-0000-0000-0000-000000000005",
    name: "LifeCare Pathology & Diagnostic Lab",
    slug: "lifecare-pathology-lab",
    categoryName: "Diagnostic & Lab",
    address: "Opp. Bhootnath Market Gate 2, Indira Nagar, Lucknow",
    status: "OPEN",
    verified: true,
    crowdLabel: "Light",
    waitingCount: 1,
    estimatedWaitMin: 8,
    currentServing: "P-007",
    phone: "9876543214",
    openingHours: "07:00 AM – 08:00 PM",
    description: "Certified routine blood tests and rapid preventive checkups with minimal lobby wait times.",
    imageUrl: "/images/diagnostic.jpg",
    rating: 4.8,
    reviewCount: 29,
    reviews: [
      { customerName: "Neeraj Srivastava", stars: 5, text: "Blood collection was completely hygienic and on time.", tags: ["ON_TIME"], date: "3 days ago" },
      { customerName: "Sunita Roy", stars: 5, text: "Reports delivered on WhatsApp within 4 hours.", tags: ["BEHAVIOUR"], date: "1 week ago" }
    ]
  },
  {
    id: "d1b2c3d4-0000-0000-0000-000000000006",
    name: "SpeedWheel Multi-brand Auto Service",
    slug: "speedwheel-auto-service",
    categoryName: "Auto Service",
    address: "Service Road, Ring Road Crossing, Indira Nagar, Lucknow",
    status: "OPEN",
    verified: true,
    crowdLabel: "Moderate",
    waitingCount: 3,
    estimatedWaitMin: 35,
    currentServing: "S-019",
    phone: "9876543215",
    openingHours: "09:00 AM – 08:00 PM",
    description: "Two-wheeler quick service, puncture, oil replacement, and multi-bay repairs with live queue status.",
    imageUrl: "/images/auto.jpg",
    rating: 4.6,
    reviewCount: 41,
    reviews: [
      { customerName: "Gaurav Pandey", stars: 5, text: "Oil change and chain lubrication done smoothly.", tags: ["ON_TIME"], date: "4 days ago" },
      { customerName: "Rajesh Kumar", stars: 4, text: "Token update on phone helped me grab coffee while bike was being serviced.", tags: ["BEHAVIOUR"], date: "1 week ago" }
    ]
  }
];

export const MOCK_CATEGORIES = [
  { 
    id: "salon", 
    name: "Salon & Barber", 
    icon: "Scissors", 
    imageUrl: "/images/barber.jpg",
    description: "Haircuts, styling, beard grooming & spa care with live digital queue tracking.",
    count: 2,
    avgWait: "10-15 min",
    badge: "● Verified Salons Live"
  },
  { 
    id: "pharmacy", 
    name: "Medical & Pharmacy", 
    icon: "Pill", 
    imageUrl: "/images/pharmacy.jpg",
    description: "100% genuine prescription medicines and wellness products with fast counter pickup.",
    count: 3,
    avgWait: "8-12 min",
    badge: "● Fast Counter Pickup"
  },
  { 
    id: "clinic", 
    name: "Doctor & Clinic", 
    icon: "Stethoscope", 
    imageUrl: "/images/clinic.jpg",
    description: "Multi-chair dental clinics, general physicians & OPD consultations with zero lobby crowd.",
    count: 2,
    avgWait: "15-20 min",
    badge: "● Contactless Turn Radar"
  },
  { 
    id: "food", 
    name: "Food & Chaat", 
    icon: "UtensilsCrossed", 
    imageUrl: "/images/food.jpg",
    description: "Authentic Lucknow street cuisine and fresh snacks with digital tokens instead of counter push.",
    count: 4,
    avgWait: "10-20 min",
    badge: "● No Counter Rush"
  },
  { 
    id: "diagnostic", 
    name: "Diagnostic & Lab", 
    icon: "Activity", 
    imageUrl: "/images/diagnostic.jpg",
    description: "Certified routine blood tests, preventive health checkups and rapid report delivery.",
    count: 2,
    avgWait: "5-10 min",
    badge: "● Minimal Lobby Wait"
  },
  { 
    id: "auto", 
    name: "Auto & Repair Service", 
    icon: "Wrench", 
    imageUrl: "/images/auto.jpg",
    description: "Two-wheeler quick service, puncture repair, oil replacement and multi-bay tracking.",
    count: 2,
    avgWait: "20-35 min",
    badge: "● Live Bay Tracking"
  }
];
