// Dashboard mock data
export const metricsData = {
  totalSubAdmins: 156,
  totalMasterAgencies: 45,
  agencies: 287,
  hosts: 1234,
  overallCoins: 2450000,
  liveUsers: 5678,
  voiceRooms: 89,
  totalDiamonds: 125000
};

export const coinsRechargeData = {
  weekly: [
    { name: 'Mon', amount: 12000, isCurrentPeriod: false },
    { name: 'Tue', amount: 19000, isCurrentPeriod: false },
    { name: 'Wed', amount: 15000, isCurrentPeriod: false },
    { name: 'Thu', amount: 22000, isCurrentPeriod: false },
    { name: 'Fri', amount: 18000, isCurrentPeriod: true },
    { name: 'Sat', amount: 25000, isCurrentPeriod: false },
    { name: 'Sun', amount: 16000, isCurrentPeriod: false }
  ],
  monthly: [
    { name: 'Jan', amount: 450000, isCurrentPeriod: false },
    { name: 'Feb', amount: 380000, isCurrentPeriod: false },
    { name: 'Mar', amount: 520000, isCurrentPeriod: false },
    { name: 'Apr', amount: 480000, isCurrentPeriod: false },
    { name: 'May', amount: 600000, isCurrentPeriod: false },
    { name: 'Jun', amount: 550000, isCurrentPeriod: false },
    { name: 'Jul', amount: 620000, isCurrentPeriod: false },
    { name: 'Aug', amount: 580000, isCurrentPeriod: false },
    { name: 'Sep', amount: 650000, isCurrentPeriod: false },
    { name: 'Oct', amount: 700000, isCurrentPeriod: false },
    { name: 'Nov', amount: 680000, isCurrentPeriod: false },
    { name: 'Dec', amount: 720000, isCurrentPeriod: true }
  ],
  yearly: [
    { name: '2020', amount: 4200000, isCurrentPeriod: false },
    { name: '2021', amount: 5800000, isCurrentPeriod: false },
    { name: '2022', amount: 6900000, isCurrentPeriod: false },
    { name: '2023', amount: 8200000, isCurrentPeriod: false },
    { name: '2024', amount: 9500000, isCurrentPeriod: true }
  ]
};

export const supporterCardsData = {
  thisMonthRecharge: {
    title: "This Month's Coin Recharge",
    value: "₹15,000",
    icon: "TrendingUp",
    color: "pink"
  },
  totalRecharge: {
    title: "Total Coin Recharge",
    value: "₹15,00,000",
    icon: "DollarSign",
    color: "purple"
  }
};

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'sub-admins', label: 'Sub Admin', icon: 'Users' },
  { id: 'master-agency', label: 'Master Agency', icon: 'Building' },
  { id: 'agencies', label: 'Agencies', icon: 'Building2' },
  { id: 'host-verification', label: 'Host Verification', icon: 'Shield' },
  { id: 'users-details', label: 'Host Details', icon: 'UserCheck' },
  { id: 'live-monitoring', label: 'Live Monitoring', icon: 'Eye' },
  { id: 'vs-monitoring', label: 'VS Monitoring', icon: 'Sword' }, // New entry
  { id: 'party-monitoring', label: 'Party Monitoring', icon: 'Mic' }, // New entry
  { id: 'coin-recharge', label: 'Coin Recharge', icon: 'Coins' },
  { id: 'diamonds-wallet', label: 'Diamonds Cashout', icon: 'Gem' },
  { id: 'ranking', label: 'Rankings', icon: 'Trophy' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart' },
  { id: 'user-details', label: 'User Details', icon: 'User' }, // Slight rename for clarity
  { id: 'vip-levels', label: 'VIP / Levels', icon: 'Crown' },
  { id: 'gifts-banners', label: 'Gifts / Banners', icon: 'Gift' },
  { id: 'recordings', label: 'Recordings', icon: 'Video' },
  { id: 'block-user', label: 'Block Users', icon: 'UserX' },
  { id: 'reports-ban', label: 'Reports / Ban Request', icon: 'Flag' },
  { id: 'ai-warnings', label: 'AI Warnings', icon: 'AlertTriangle' }, // Renamed from "All Warnings"
  { id: 'songs-library', label: 'Songs Library', icon: 'Music' },
  { id: 'developer-settings', label: 'Developer Settings', icon: 'Settings' }
];
