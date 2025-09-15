# Repo Info

- Name: BeriProject
- Stack: React + Vite, Tailwind-like classes, lucide-react icons
- Routing: Centralized in src/App.jsx via activeRoute state and Sidebar navigation
- Auth: src/services/authService.js with token in localStorage
- Roles: Defined/normalized in src/config/api.js (USER_TYPES) and src/utils/roleBasedAccess.js
- Sidebar items: src/data/dashboardData.js (navigationItems)
- Components barrel: src/components/index.js

## New Feature: Role Stages (Frontend-only)
- UI Path/Route: `role-stages` (Sidebar label: "Role Stages")
- Access: Super Admin only (handled by roleBasedAccess and App gating)
- Persistence: localStorage (`roleStagesConfig`)
- Roles covered: admin, master-agency, agency, host
- Max stages per role: 3
- Stage fields: name (string), value (number), description (string)

### Files added
- src/services/roleStagesService.js — localStorage CRUD for role stages
- src/components/RoleStages/RoleSelector.jsx — role dropdown
- src/components/RoleStages/StageForm.jsx — create/edit form
- src/components/RoleStages/StageList.jsx — list with edit/delete
- src/components/RoleStages/ConfirmDialog.jsx — generic confirm modal
- src/components/RoleStages/RoleStagesPage.jsx — composed page

### Files updated
- src/data/dashboardData.js — added sidebar item: Role Stages
- src/App.jsx — registered route: role-stages
- src/components/index.js — exported RoleStagesPage
- src/utils/roleBasedAccess.js — unchanged permissions logic, super-admin sees all

### Usage
1) Login as Super Admin
2) Open Sidebar → Role Stages
3) Select role, add/edit/delete up to 3 stages; changes persist in localStorage

### Notes
- No backend calls; purely frontend
- Styles match existing dark theme components
- Safe defaults are generated on first run