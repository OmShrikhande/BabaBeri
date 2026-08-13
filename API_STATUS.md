# API Status Guide

Quick reference for which APIs are broken, missing, mocked, or need backend/frontend upgrades in BeriProject.

**Base URL:** `VITE_API_BASE_URL` (default: `http://169.58.40.205:8004`)  
**Service files:** `src/services/authService.js` (main) and `src/services/services.js` (live, gifts, ranking, tiers)

---

## Critical — missing or broken

| API / Feature | Endpoint | Issue |
|---|---|---|
| **VIP Members list** | `GET /auth/api/getvipusers` | **Not implemented on backend.** Frontend is ready (`VipLevels.jsx`). VIP Plans work; members view fails. |
| **Cashout reject** | — | Reject only updates UI locally. **No API call** is made (`useCashoutRequests.js`). |
| **Cashout approve** | Uses `POST /auth/superadmin/saveDiamond` | Workaround only — not a real approve-cashout endpoint. May not update request status correctly. |
| **Supporters ranking** | — | **No API.** `Ranking.jsx` uses `mockSupportersRanking` for the Supporters tab. Hosts tab uses `GET /auth/superadmin/top10ByDiamond`. |
| **VIP plan update** | — | Edit reuses `POST /auth/superadmin/create-vip-plan`. **No update endpoint** wired up. |
| **Wallet OTP (demo)** | — | `sendWalletOtp()` / `verifyWalletOtp()` are **simulated** (accepts hardcoded OTP `123456`). Not real APIs. |
| **Early access signup** | — | Landing page form has **no backend** — UI only. |

---

## Partial — API exists but UI falls back to mock/static data

| Feature | Real API tried | Fallback |
|---|---|---|
| **Live Monitoring** | `GET /live/admin/live-sessions?status=active` | Falls back to `mockLiveUsers` when API fails or returns empty |
| **Live session stats / gifters** | `GET /live/session/{id}/stats`, `GET /live/session/{id}/gifters` | Skipped when on mock data |
| **Warn / block live user** | — | `WarningModal` + block actions are **console.log only** — no API |
| **Dashboard coins recharge chart** | `GET /auth/api/getTotalCoinsSell` (total only) | Bar chart still uses static `dashboardData.js`; API total shown in chart header |
| **Coin Recharge offers** | — | **Local state only** — not saved to backend |
| **Coin Recharge plan modal** | — | Create-plan modal is **local state**; `PlansTab` separately fetches from `GET /auth/user/getAllPlans` |
| **Master Agency table** | Partial API data | Columns like overall diamonds, stage, slab, joining date show **`--` placeholders** |
| **Entity Movement modal** | — | Uses **`subAdminsData` / `agenciesData` mock files** instead of live hierarchy APIs |
| **Sub-admin / agency detail pages** | Mixed | Some detail views still read from **`subAdminsData.js` mock** for navigation context |

---

## Tested — Host upgrade to agency API

`POST /auth/upgrade?hostcode={code}&agencyname={name}&macode={masterAgencyCode}`

| Test case | Result | Notes |
|---|---|---|
| `hostcode=PX314`, `macode=MA100` | **403 Forbidden** | PX314 already belongs to agency `AC101` — not eligible for upgrade |
| `hostcode=PX315` (no owner), `macode=MA100` | **403 Forbidden** | Unassigned host still blocked — likely backend permission rule |
| `hostcode=PH108`, `macode=MA001` | **400 Bad Request** | `master agency not found with this master agency code: MA001` |
| `macode=MA001` (any host) | **400** | MA001 does not exist in database |
| `macode=MA100` | Exists | Two master-agency records share code `MA100` |
| Super Admin / Admin / Master Agency JWT | All tested | Upgrade still returns 403 for MA100 cases |
| Response format | Plain text or JSON | Dashboard now handles both; validates host owner before calling API |

**Dashboard wiring:** `AgencyForm` and `MasterAgencyCreateAgency` call `authService.createAgency()` → `POST /auth/upgrade`.  
**Rules enforced in UI:** host must exist, must be role `HOST`, must not already have an `owner`.

---

## Needs upgrade / known backend quirks

| API | Endpoint | Problem |
|---|---|---|
| **Delete tier (goals)** | `DELETE /auth/superadmin/deletetier/{id}` | Backend sometimes returns **400 with success message** `"Tier (goal) deleted successful"`. Frontend has a workaround. |
| **Update tier** | `PUT /auth/superadmin/updatetires/{id}` | Typo in URL: **`updatetires`** (likely should be `updatetier`). Verify with backend. |
| **Change rate** | `PUT /auth/superadmin/changrate` | Typo: **`changrate`** (likely `changerate`). |
| **Get banners** | `GET /auth/superadmin/getallebanners` | Typo: **`getallebanners`** (likely `getallbanners`). |
| **Get sub-users** | `GET /auth/api/geAllsubUserByCode` | Typo: **`geAllsubUserByCode`** (likely `getAllsubUserByCode`). |
| **Save banner** | `POST /auth/superadmin/savebanner` | Known **403 permission errors** in some roles; extra debug logging in `services.js`. |
| **Active hosts** | `GET /auth/api/allactivate-deactivate-host` | On 403, frontend **falls back** to `GET /auth/user/getallhost?role=HOST` and filters client-side. |
| **Pending cashout (duplicate)** | `GET /auth/superadmin/allpendingcashout` **and** `GET /auth/superadmin/getPendingcashoutList` | Two endpoints for same purpose. App uses **`getPendingcashoutList`** in most places. Consolidate on backend. |
| **Create sub-admin** | `POST /auth/create-admin` | Same endpoint as create admin — **no role/sub-admin distinction** in request body. Verify backend behavior. |
| **Host pending list** | `GET /api/liveusers/list` vs `GET /auth/api/alluserByRole?role=HOST` | Two different flows in `authService` vs `services.js`. Host Verification uses **`/api/liveusers/*`**. |
| **Host upgrade** | `POST /auth/upgrade` | Returns **403** for valid MA100 + unassigned hosts — backend permission or business rule needs clarification. |
| **Logout** | `POST /auth/logout` | Returns **403** for tested JWT tokens. Frontend calls it best-effort, then clears session locally. |
| **Gifts catalog (live API)** | `GET /gifts/catalog` | Returns **403** for super admin. Dashboard uses `GET /auth/superadmin/getallgifts` instead. |

---

## Configured but not used in UI

| Endpoint | Notes |
|---|---|
| `POST /auth/refresh` | Token refresh defined in config but **never called** |
| `POST /auth/api/saveplan` | Plan create endpoint exists; Coin Recharge modal doesn't call it |
| `GET /public/diamond-count` | In `services.js`, no component uses it |
| `POST /public/live-session` | Public live tracking create — not wired to UI |
| `POST /live/start-session` | Not used in admin UI |
| `POST /live/end-session` | Not used in admin UI |
| `POST /live/recover-session` | Not used in admin UI |
| `POST /gifts/send` | Not used in admin UI |
| `GET /live/admin/host-analytics/{hostId}` | Defined in services, not used in components |

---

## Recently wired in dashboard (Aug 2026)

| API | Where used |
|---|---|
| `GET /auth/superadmin/cashouthistory` | Dashboard financial cards, `authService.getCashoutHistory()`, Diamonds Cashout history |
| `GET /auth/superadmin/range` | Dashboard profit/loss/cashout aggregation, diamond analytics chart (auto-load) |
| `GET /public/live-session/all` | Dashboard "Live Tracking" metric, Live & Gifts summary cards |
| `GET /auth/superadmin/getallgifts` | Live & Gifts dashboard — gifts catalog count |
| `GET /auth/api/getTotalCoins` | Dashboard supporter card — available platform coins |
| `GET /auth/api/getTotalCoinsSell` | Dashboard financial + chart header — total coins sold |
| `GET /auth/superadmin/getPendingcashoutList` | Dashboard financial card — pending cashout count |
| `POST /auth/logout` | Called on sign-out (best-effort; backend may return 403) |
| `POST /auth/upgrade` | Create Agency forms — host → agency upgrade |

---

## Working APIs (confirmed wired in frontend)

| Area | Endpoints |
|---|---|
| **Auth** | `POST /auth/login`, `GET /auth/profile`, `GET /auth/user/getByid`, `GET /auth/api/getByCode` |
| **Users & roles** | `GET /auth/api/alluserByRole`, `GET /auth/api/countbyrole`, `GET /auth/api/allusers`, `PUT /auth/api/updatestatus` |
| **Agencies / hierarchy** | `POST /auth/create-admin`, `POST /auth/create-masteragency`, `POST /auth/upgrade`, `GET /auth/getallMasterAgency`, move/change-owner endpoints |
| **Host verification** | `GET /api/liveusers/list`, `GET /api/liveusers/getLiveFormStatus`, `PUT /auth/superadmin/approve-reject-live-form`, `PUT /auth/superadmin/permanent-approve-reject-live-form`, `DELETE /api/liveusers/delete/{id}` |
| **Profile pictures** | `GET /auth/api/allpendingpics`, `PUT /auth/api/approveprofile` |
| **Coins & wallet** | `PUT /auth/api/recharge`, `PUT /auth/api/coinsplus`, `PUT /auth/api/coinsminus`, `GET /auth/api/gethistory`, `GET /auth/superadmin/balance`, superadmin self-recharge + OTP |
| **Diamonds** | `GET /auth/superadmin/count/CREDIT`, `POST /auth/superadmin/saveDiamond`, `POST /auth/superadmin/convertdiamond_to_coin_for_sa` |
| **Goals / tiers** | `GET /auth/api/getallgoals`, `POST /auth/superadmin/savetiers`, `PUT /auth/superadmin/updatetires/{id}`, `DELETE /auth/superadmin/deletetier/{id}` |
| **Gifts & banners** | `GET /auth/superadmin/getallgifts`, `POST /auth/superadmin/savegifts`, `GET /auth/superadmin/getallebanners`, `POST /auth/superadmin/savebanner` |
| **VIP plans** | `GET /auth/api/getappvipplans`, `POST /auth/superadmin/create-vip-plan`, `DELETE /auth/superadmin/delete-vip-plan/{id}` |
| **Ranking (hosts)** | `GET /auth/superadmin/top10ByDiamond?type=&date=` |
| **Live admin** | `GET /live/admin/live-sessions`, `GET /gifts/admin/gift-transactions`, session stats/gifters endpoints |
| **Dashboard** | `GET /auth/api/getTotalCoins`, `GET /auth/api/getTotalCoinsSell`, `GET /auth/superadmin/cashouthistory`, `GET /auth/superadmin/range`, `GET /public/live-session/all` |

---

## Priority fix list

1. **Backend:** Implement `GET /auth/api/getvipusers` for VIP Members page.
2. **Backend:** Fix `POST /auth/upgrade` 403 for valid host + MA100 combinations.
3. **Backend + frontend:** Add proper cashout approve/reject endpoints (replace `saveDiamond` workaround and local-only reject).
4. **Backend:** Add supporters ranking API (or document if it doesn't exist).
5. **Backend:** Add `PUT /auth/superadmin/update-vip-plan/{id}` (or similar) for VIP plan edits.
6. **Frontend:** Wire Coin Recharge offers/plan modal to `POST /auth/api/saveplan` and stop using local-only state.
7. **Frontend:** Add coins time-series API for dashboard recharge chart (currently static bars + API total only).
8. **Backend:** Fix endpoint typos (`updatetires`, `changrate`, `getallebanners`, `geAllsubUserByCode`).
9. **Frontend:** Consolidate `authService.js` and `services.js` into one service layer to avoid duplicate/conflicting API logic.

---

## How to verify

1. Set `VITE_API_BASE_URL` in `.env` (see `.env.example`).
2. Log in as super admin.
3. Open browser DevTools → Network tab.
4. Visit each page and check for failed requests (4xx/5xx) or pages showing "demo data" badges.

---

*Last reviewed from codebase: August 2026*
