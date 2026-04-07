# Coin Recharge Feature

## Overview
The Coin Recharge feature provides a comprehensive interface for managing coin transactions, offers, and recharge plans in the PRO X STREAM application.

## Features

### 1. Online Recharge
- **Offers Section**: Display discounted coin packages with original and discounted prices
- **Recharge Plans**: Standard coin packages with fixed pricing
- **Add More Functionality**: Ability to add new offers and plans through modal dialogs

### 2. Offline Recharge
- **User Search**: Search users by ID to manage their coin balance
- **Transfer Coins**: Add coins to user accounts
- **Revoke Coins**: Remove coins from user accounts
- **Recharge History**: View detailed transaction history

### 3. Interactive Modals
- **Add Offer Modal**: Create new discounted offers with original and discounted pricing
- **Add Plan Modal**: Create new standard recharge plans

## Components

### Main Component: `CoinRecharge.jsx`
- Located in `src/components/CoinRecharge.jsx`
- Uses React hooks for state management
- Integrated with custom Toast notification system

### Toast System: `Toast.jsx`
- Custom notification system for user feedback
- Supports success, error, and warning notifications
- Auto-dismiss functionality with smooth animations

## Navigation
- Accessible via the sidebar menu item "Coin Recharge"
- Route: `/coin-recharge` (handled by App.jsx routing)

## Styling
- Follows the application's dark theme with pink-purple gradients
- Responsive design that works on desktop and mobile
- Hover effects and smooth transitions
- Consistent with the overall application design language

## Data Management
- Mock data for demonstration purposes
- State management using React useState hooks
- Form validation for modal inputs
- Real-time updates to UI after actions

## User Experience
- Intuitive card-based layout for offers and plans
- Clear visual hierarchy with proper spacing
- Interactive elements with hover states
- Toast notifications for user feedback
- Responsive grid layouts that adapt to screen size

## Technical Implementation
- Modern React functional components
- React hooks (useState, useEffect)
- Lucide React icons for consistent iconography
- Tailwind CSS for styling
- Custom CSS animations and transitions

## Future Enhancements
- Integration with backend API
- Real-time data updates
- Advanced filtering and search
- Bulk operations
- Export functionality
- Payment gateway integration