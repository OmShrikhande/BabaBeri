# Diamonds Wallet (Cashout) Feature

## Overview
The Diamonds Wallet (Cashout) feature provides a comprehensive interface for managing diamond transactions, user cashout requests, and transaction history in the PRO X STREAM application. This implementation exactly matches the provided screenshot with modern React best practices.

## 🎯 Screenshot Match
This implementation precisely replicates the provided screenshot including:
- Exact layout and proportions
- Color scheme and styling
- User interface elements
- Data presentation format
- Interactive components

## Features

### 1. Exchange Rate Display
- Visual representation of the coin-to-diamond exchange rate (1 Coin = 1 Diamond)
- Prominent display with coin and diamond icons
- Lightning bolt indicator for quick reference

### 2. User Search & Management
- Search users by ID to view their diamond wallet details
- Display user profile with avatar, name, and username
- Show total cashout amount and total diamonds
- Real-time search functionality with error handling

### 3. Cashout History
- Comprehensive transaction history table
- Shows diamond amounts and timestamps
- Scrollable interface for large datasets
- Clean, organized display with proper formatting

### 4. Cashout Request Management
- Real-time display of pending cashout requests
- Approve/Reject functionality for each request
- Status tracking (pending, approved, rejected)
- Request counter badge showing pending requests

### 5. Filtering & Controls
- Monthly/Weekly/Daily/Yearly filter dropdown
- Notification bell icon
- Responsive filter controls

## Components Architecture

### Main Component: `DiamondsCashout.jsx`
- Central component managing all diamond wallet functionality
- State management for user data, requests, and filters
- Integration with Toast notification system

### Modular Sub-Components:

#### 1. `DiamondUserCard.jsx`
- Displays user profile information
- Shows total cashout and diamond metrics
- Responsive design with proper spacing
- Online status indicator

#### 2. `CashoutHistoryTable.jsx`
- Dedicated component for transaction history
- Scrollable table with proper headers
- Empty state handling
- Hover effects for better UX

#### 3. `CashoutRequestCard.jsx`
- Individual request card component
- Action buttons (Approve/Reject)
- Status display with color coding
- Smooth animations and transitions

#### 4. `CustomDropdown.jsx`
- Reusable dropdown component
- Keyboard navigation support
- Click-outside-to-close functionality
- Accessible design with ARIA attributes
- Theme-consistent styling

### Utility Components:
- `Toast.jsx` - Notification system
- Custom styling and animations

## Styling & Theme

### Color Scheme
- **Background**: Dark theme (#1A1A1A, #121212)
- **Accents**: Pink-purple gradients (#F72585 to #7209B7)
- **Text**: White primary, gray secondary
- **Status Colors**: Green (approved), Red (rejected), Gray (pending)

### Visual Elements
- **Coins**: Yellow circular icons with bullet points
- **Diamonds**: Cyan circular icons with diamond symbols
- **Cards**: Rounded corners with subtle borders
- **Buttons**: Gradient backgrounds with hover effects
- **Scrollbars**: Custom styled with theme colors

## State Management

### Main State Variables:
```javascript
- searchUserId: string - Current search input
- selectedUser: object - Currently selected user data
- selectedFilter: string - Active filter option
- cashoutRequests: array - List of cashout requests
```

### Mock Data Structure:
```javascript
// User Data
{
  name: string,
  username: string,
  avatar: string,
  totalCashout: string,
  totalDiamonds: string,
  cashoutHistory: array
}

// Cashout Request
{
  id: number,
  user: object,
  amount: number,
  status: 'pending' | 'approved' | 'rejected'
}
```

## User Interactions

### Search Flow:
1. User enters ID in search field
2. Click search button or press Enter
3. System validates and displays user data
4. Error toast if user not found

### Request Management Flow:
1. View pending requests in right panel
2. Click Approve/Reject buttons
3. Request status updates immediately
4. Success/error toast notifications
5. Request counter updates automatically

### Filter Flow:
1. Click filter dropdown
2. Select desired time period
3. System applies filter (simulated)
4. Toast confirmation of filter change

## Responsive Design

### Desktop (lg+):
- Three-column layout
- Full feature visibility
- Optimal spacing and sizing

### Tablet (md):
- Two-column layout
- Stacked components
- Maintained functionality

### Mobile (sm):
- Single column layout
- Touch-friendly buttons
- Scrollable sections

## Accessibility Features

### Keyboard Navigation:
- Tab navigation through all interactive elements
- Enter/Space key activation for buttons
- Escape key to close dropdowns

### Screen Reader Support:
- Proper ARIA labels and roles
- Semantic HTML structure
- Alt text for images

### Visual Accessibility:
- High contrast colors
- Clear focus indicators
- Readable font sizes

## Performance Optimizations

### Component Structure:
- Modular components for better reusability
- Efficient state management
- Minimal re-renders

### Data Handling:
- Lazy loading for large datasets
- Efficient filtering and searching
- Optimized scroll performance

## Future Enhancements

### Backend Integration:
- Real-time data fetching
- WebSocket connections for live updates
- API integration for CRUD operations

### Advanced Features:
- Bulk request processing
- Advanced filtering options
- Export functionality
- Analytics dashboard
- Payment gateway integration

### UX Improvements:
- Skeleton loading states
- Progressive loading
- Advanced search filters
- Drag-and-drop functionality

## Demo Data

### Available Test Users:
- **manohar021** - Mohan Manohar (auto-loaded, matches screenshot)
- **priyanka123** - Priyanka Gandhi 
- **rajesh456** - Rajesh Kumar

### Demo Features:
- Pre-populated cashout requests
- Realistic transaction history
- Multiple user profiles for testing
- Various request statuses (pending, approved, rejected)

## Technical Implementation

### Dependencies:
- React 19+ with hooks
- Lucide React for icons
- Custom Toast system
- Tailwind CSS for styling

### File Structure:
```
src/
├── components/
│   ├── DiamondsCashout.jsx
│   ├── DiamondUserCard.jsx
│   ├── CashoutHistoryTable.jsx
│   ├── CashoutRequestCard.jsx
│   ├── CustomDropdown.jsx
│   └── Toast.jsx
├── data/
│   └── diamondsDemoData.js
└── App.jsx (routing integration)
```

### Best Practices Implemented:
- Functional components with hooks
- Proper prop validation
- Error boundary handling
- Clean code structure
- Consistent naming conventions
- Comprehensive documentation