# VIP Members API - Backend Implementation Required

## Status
The VIP Levels frontend page has been successfully updated to display VIP members similar to the Ranking page. However, the backend API endpoint for fetching VIP members is **NOT DOCUMENTED** and needs to be implemented.

## Missing API Endpoint

### Get All VIP Users/Members
- **Endpoint**: `/auth/api/getvipusers` or `/auth/superadmin/getvipusers`
- **Method**: GET
- **Authentication**: JWT Token (Super Admin)
- **Purpose**: Fetch all users who have active or expired VIP subscriptions

### Expected Response Format
```json
[
  {
    "id": "user_id",
    "userId": "PH101",
    "fullName": "John Doe",
    "username": "johndoe",
    "avatar": "https://example.com/avatar.jpg",
    "country": "US",
    "vipLevel": "Gold Plan",
    "planName": "Gold Plan",
    "expiryDate": "2025-12-31T23:59:59Z",
    "validUntil": "2025-12-31T23:59:59Z",
    "isActive": true
  }
]
```

### Required Fields
- `id` or `userId` - User identifier
- `fullName` or `name` - User's full name
- `username` - User's username
- `avatar` or `profileImage` - User's profile picture URL
- `country` - User's country code
- `vipLevel` or `planName` - Name of the VIP plan
- `expiryDate` or `validUntil` - When the VIP subscription expires

## Frontend Implementation Status

### ✅ Completed Features
1. Toggle between "VIP Members" and "VIP Plans" views
2. Search functionality for members (by name, username, user ID)
3. Filter by VIP level dropdown
4. Statistics cards showing:
   - Total VIP Members
   - Active Members
   - VIP Levels count
   - Filtered Results
5. Table displaying:
   - Member avatar, name, country
   - Username with pink highlight
   - User ID badge
   - VIP Level with color-coded badges
   - Expiry date with visual indicator
6. Export functionality for both views
7. Refresh with last updated timestamp
8. Graceful error handling when API is not available

### 🔧 API Integration Points
The frontend is calling:
```javascript
const response = await authService.makeAuthenticatedRequest(
  '/auth/api/getvipusers', 
  { method: 'GET' }
);
```

## Existing VIP Plan APIs (Already Working)
✅ Create VIP Plan: `POST /auth/superadmin/create-vip-plan`
✅ Get All VIP Plans: `GET /auth/api/getappvipplans`

## Diamond Cashout APIs (Already Implemented)
✅ All diamond cashout APIs are properly implemented and working:
- Get pending cashout list
- Approve/Reject cashout requests
- Cashout history
- Convert diamonds to coins
- Diamond wallet summary

## Next Steps for Backend Team
1. Implement the `/auth/api/getvipusers` or `/auth/superadmin/getvipusers` endpoint
2. Return users who have purchased VIP plans
3. Include VIP plan details and expiry information
4. Ensure proper JWT authentication
5. Test with the existing frontend implementation

## Testing
Once the API is implemented, the frontend will automatically:
- Display VIP members in the table
- Show statistics
- Enable search and filtering
- Allow export of member data

No frontend changes will be needed once the API is available.
