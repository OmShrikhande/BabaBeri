// Mock data for Live Monitoring
export const mockLiveUsers = [
  {
    id: 1,
    username: 'Sarah_Beauty',
    thumbnail: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120&h=120&fit=crop&crop=face',
    viewerCount: '10.2K',
    diamondCount: '11.4M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Beauty Tips & Makeup Tutorial',
    category: 'Beauty',
    duration: '2h 15m',
    country: 'US'
  },
  {
    id: 2,
    username: 'Mike_Gaming',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
    viewerCount: '8.5K',
    diamondCount: '9.2M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Epic Gaming Session - Live',
    category: 'Gaming',
    duration: '1h 45m',
    country: 'UK'
  },
  {
    id: 3,
    username: 'Luna_Music',
    thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face',
    viewerCount: '15.7K',
    diamondCount: '18.9M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Live Music Performance',
    category: 'Music',
    duration: '3h 22m',
    country: 'CA'
  },
  {
    id: 4,
    username: 'Alex_Dance',
    thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
    viewerCount: '6.3K',
    diamondCount: '7.8M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Dance Challenge Live',
    category: 'Dance',
    duration: '45m',
    country: 'AU'
  },
  {
    id: 5,
    username: 'Emma_Talk',
    thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
    viewerCount: '12.1K',
    diamondCount: '14.6M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Life Chat & Q&A',
    category: 'Talk Show',
    duration: '1h 30m',
    country: 'DE'
  },
  {
    id: 6,
    username: 'David_Art',
    thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
    viewerCount: '4.9K',
    diamondCount: '5.3M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Digital Art Creation',
    category: 'Art',
    duration: '2h 5m',
    country: 'FR'
  },
  {
    id: 7,
    username: 'Sophia_Cooking',
    thumbnail: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&h=120&fit=crop&crop=face',
    viewerCount: '9.8K',
    diamondCount: '12.1M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Cooking Italian Pasta',
    category: 'Cooking',
    duration: '1h 20m',
    country: 'IT'
  },
  {
    id: 8,
    username: 'Ryan_Fitness',
    thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face',
    viewerCount: '7.2K',
    diamondCount: '8.7M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Morning Workout Session',
    category: 'Fitness',
    duration: '55m',
    country: 'US'
  },
  {
    id: 9,
    username: 'Zoe_Fashion',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
    viewerCount: '13.4K',
    diamondCount: '16.2M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Fashion Haul & Styling',
    category: 'Fashion',
    duration: '2h 40m',
    country: 'JP'
  },
  {
    id: 10,
    username: 'Carlos_Travel',
    thumbnail: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=120&h=120&fit=crop&crop=face',
    viewerCount: '5.6K',
    diamondCount: '6.9M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Live from Tokyo Streets',
    category: 'Travel',
    duration: '1h 15m',
    country: 'JP'
  },
  {
    id: 11,
    username: 'Maya_Yoga',
    thumbnail: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=120&h=120&fit=crop&crop=face',
    viewerCount: '8.9K',
    diamondCount: '10.5M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Morning Yoga Session',
    category: 'Wellness',
    duration: '1h 10m',
    country: 'IN'
  },
  {
    id: 12,
    username: 'Jake_Comedy',
    thumbnail: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&h=120&fit=crop&crop=face',
    viewerCount: '11.3K',
    diamondCount: '13.8M',
    isLive: true,
    status: 'streaming',
    streamTitle: 'Stand-up Comedy Live',
    category: 'Comedy',
    duration: '1h 35m',
    country: 'US'
  }
];

export const violationTypes = [
  {
    id: 'promotion',
    label: 'Promotion',
    description: 'User is promoting external content or services',
    severity: 'medium',
    color: 'yellow'
  },
  {
    id: 'vulgar',
    label: 'Vulgar Content',
    description: 'User is displaying inappropriate or vulgar content',
    severity: 'high',
    color: 'red'
  },
  {
    id: 'substance',
    label: 'Smoking/Drinking',
    description: 'User is smoking or drinking during the stream',
    severity: 'medium',
    color: 'orange'
  },
  {
    id: 'harassment',
    label: 'Harassment',
    description: 'User is engaging in harassment or bullying behavior',
    severity: 'high',
    color: 'red'
  },
  {
    id: 'spam',
    label: 'Spam Content',
    description: 'User is posting repetitive or spam content',
    severity: 'low',
    color: 'blue'
  }
];

export const streamCategories = [
  'All Categories',
  'Beauty',
  'Gaming',
  'Music',
  'Dance',
  'Talk Show',
  'Art',
  'Cooking',
  'Fitness',
  'Fashion',
  'Travel',
  'Wellness',
  'Comedy',
  'Education',
  'Technology'
];

export const sortOptions = [
  { value: 'viewers', label: 'Most Viewers' },
  { value: 'diamonds', label: 'Most Diamonds' },
  { value: 'duration', label: 'Longest Stream' },
  { value: 'recent', label: 'Recently Started' }
];