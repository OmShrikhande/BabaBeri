# Agencies Feature

## Overview
The Agencies feature provides a comprehensive management interface for viewing and managing agencies within the admin dashboard. It follows a modern, dark-themed design with a focus on usability and responsiveness.

## Features

### Agencies List Page
- **Modern Interface**: Dark-themed design with purple/magenta accents
- **Search Functionality**: Real-time search by agency name or ID
- **Filtering**: Filter agencies by tier (Royal Silver, Gold, Platinum)
- **Loading States**: Skeleton placeholders during data loading
- **Responsive Design**: Works on all screen sizes with horizontal scrolling on mobile
- **Statistics Cards**: Overview of total agencies, earnings, and hosts
- **Interactive Table**: Clickable rows with view and delete actions

### Agency Detail Page
- **Progress Tracking**: Visual progress bar showing goal completion
- **Earnings Dashboard**: Last month, this month, and redeemable diamonds
- **Achievement Tiers**: Visual cards showing Royal Silver/Gold/Platinum tiers
- **Host Management**: Detailed table of all hosts under the agency
- **Revenue Share**: Clear display of current tier and revenue percentage

## Navigation
- Click on "Agencies" in the sidebar to view the agencies list
- Click on any agency row or the eye icon to view agency details
- Use the back button to return to the agencies list

## Data Structure
- Each agency has: ID, name, earnings, goals, hosts, and tier information
- Hosts include: ID, name, earnings, and redeemed amounts
- Achievement tiers have revenue sharing percentages

## Technical Implementation
- React functional components with hooks
- Tailwind CSS for styling
- Loading states with skeleton components
- Responsive design with mobile-first approach
- Mock data structure for demonstration

## Components
- `Agencies.jsx` - Main agencies list component
- `AgencyDetail.jsx` - Individual agency detail view
- `LoadingSkeleton.jsx` - Reusable loading state components
- `agencyData.js` - Mock data for agencies and tiers

## Styling
- Dark theme with #1A1A1A and #2A2A2A backgrounds
- Magenta (#F72585) and purple (#7209B7) accent colors
- Yellow highlights for earnings and achievements
- Consistent card-based layout
- Hover effects and transitions