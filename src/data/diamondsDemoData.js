// Demo data for Diamonds Wallet (Cashout) feature
// This matches the exact data shown in the screenshot

export const demoUsers = {
  'manohar021': {
    name: 'Mohan Manohar',
    username: '@manohar021',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    totalCashout: '15,00,000',
    totalDiamonds: '1,00,000',
    isOnline: true,
    cashoutHistory: [
      { diamonds: 500, date: '3:24 PM, 24 Jun 2025' },
      { diamonds: 500, date: '3:24 PM, 24 Jun 2025' },
      { diamonds: 500, date: '3:24 PM, 24 Jun 2025' },
      { diamonds: 500, date: '3:24 PM, 24 Jun 2025' },
      { diamonds: 500, date: '3:24 PM, 24 Jun 2025' },
      { diamonds: 500, date: '3:24 PM, 24 Jun 2025' },
      { diamonds: 500, date: '3:24 PM, 24 Jun 2025' },
      { diamonds: 500, date: '3:24 PM, 24 Jun 2025' },
      { diamonds: 500, date: '3:24 PM, 24 Jun 2025' }
    ]
  },
  'priyanka123': {
    name: 'Priyanka Gandhi',
    username: '@priyanka123',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    totalCashout: '8,50,000',
    totalDiamonds: '75,000',
    isOnline: true,
    cashoutHistory: [
      { diamonds: 1000, date: '2:15 PM, 23 Jun 2025' },
      { diamonds: 750, date: '1:30 PM, 23 Jun 2025' },
      { diamonds: 500, date: '12:45 PM, 23 Jun 2025' },
      { diamonds: 300, date: '11:20 AM, 23 Jun 2025' },
      { diamonds: 800, date: '10:15 AM, 23 Jun 2025' }
    ]
  },
  'rajesh456': {
    name: 'Rajesh Kumar',
    username: '@rajesh456',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    totalCashout: '12,25,000',
    totalDiamonds: '95,000',
    isOnline: false,
    cashoutHistory: [
      { diamonds: 600, date: '4:20 PM, 22 Jun 2025' },
      { diamonds: 400, date: '3:15 PM, 22 Jun 2025' },
      { diamonds: 750, date: '2:30 PM, 22 Jun 2025' },
      { diamonds: 300, date: '1:45 PM, 22 Jun 2025' },
      { diamonds: 500, date: '12:30 PM, 22 Jun 2025' },
      { diamonds: 350, date: '11:15 AM, 22 Jun 2025' }
    ]
  }
};

export const demoCashoutRequests = [
  {
    id: 1,
    user: {
      name: 'Priyanka Gandhi',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      time: '10 May, 11:44 am'
    },
    amount: 5000,
    status: 'pending',
    requestDate: '2025-06-24T11:44:00Z'
  },
  {
    id: 2,
    user: {
      name: 'Priyanka Gandhi',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      time: '12 May, 11:44 am'
    },
    amount: 5000,
    status: 'pending',
    requestDate: '2025-06-24T11:44:00Z'
  },
  {
    id: 3,
    user: {
      name: 'Priyanka Gandhi',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      time: '15 May, 11:44 am'
    },
    amount: 5000,
    status: 'pending',
    requestDate: '2025-06-24T11:44:00Z'
  },
  {
    id: 4,
    user: {
      name: 'Rajesh Kumar',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      time: '16 May, 2:30 pm'
    },
    amount: 3500,
    status: 'approved',
    requestDate: '2025-06-23T14:30:00Z'
  },
  {
    id: 5,
    user: {
      name: 'Anita Sharma',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      time: '17 May, 9:15 am'
    },
    amount: 2750,
    status: 'rejected',
    requestDate: '2025-06-22T09:15:00Z'
  }
];

export const exchangeRates = {
  coinToDiamond: 1,
  diamondToCoin: 1,
  lastUpdated: '2025-06-24T12:00:00Z'
};

export const filterOptions = [
  'Daily',
  'Weekly', 
  'Monthly',
  'Yearly'
];

// Utility functions for demo data
export const getUserById = (userId) => {
  return demoUsers[userId] || null;
};

export const getPendingRequestsCount = () => {
  return demoCashoutRequests.filter(request => request.status === 'pending').length;
};

export const getRequestsByStatus = (status) => {
  return demoCashoutRequests.filter(request => request.status === status);
};

export const updateRequestStatus = (requestId, newStatus) => {
  const requestIndex = demoCashoutRequests.findIndex(req => req.id === requestId);
  if (requestIndex !== -1) {
    demoCashoutRequests[requestIndex].status = newStatus;
    return true;
  }
  return false;
};