# BeriProject

A modern React + Vite admin dashboard application with features for agency management, user verification, wallet management, and ranking systems.

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)

## Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd BeriProject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Getting Started

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Linting

Check code for errors and style issues:

```bash
npm run lint
```

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable React components
├── config/          # Configuration files
├── data/            # Mock data and constants
├── hooks/           # Custom React hooks
├── services/        # API services and utilities
├── utils/           # Helper functions
├── App.jsx          # Main application component
├── main.jsx         # Application entry point
└── index.css        # Global styles
```

## Key Features

- **Agencies Management** - View and manage agency information and tiers
- **Host Verification** - Verify and manage host accounts
- **Wallet Management** - Diamond and coin wallet systems
- **User Ranking** - Ranking and achievement tracking
- **Dashboard** - Administrative dashboard with analytics
- **Responsive Design** - Mobile-first design approach

## Technology Stack

- **React** 19.1.0
- **Vite** 5.2.8
- **Tailwind CSS** 4.1.11
- **React Router** 7.7.0
- **Framer Motion** 12.23.12
- **Recharts** 3.1.0
- **Axios** 1.11.0

## Environment Setup

For API configuration and environment variables, create a `.env` file in the root directory if needed.

## Documentation

Feature-specific documentation:
- [Agencies Feature](./AGENCIES_FEATURE.md)
- [Coin Recharge Feature](./COIN_RECHARGE_FEATURE.md)
- [Diamonds Wallet Feature](./DIAMONDS_WALLET_FEATURE.md)
- [Ranking Implementation](./RANKING_IMPLEMENTATION.md)
- [Host Verification](./HOSTVERIFICATION.md)
- [Dashboard Enhancements](./DASHBOARD_ENHANCEMENTS.md)

## Development Workflow

1. Create a new branch for your feature
2. Make changes and test locally
3. Run linting to ensure code quality: `npm run lint`
4. Submit a pull request .

## Support

For issues or questions, refer to the feature documentation files or check the TODO.txt for ongoing tasks.
