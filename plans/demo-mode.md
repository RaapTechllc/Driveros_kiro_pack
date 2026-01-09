# Feature Plan: Demo Mode - Pre-filled Judge Experience

## Feature Description
Create a "Judge Demo" mode that instantly loads a complete, realistic business analysis with pre-filled data, allowing judges to immediately explore all DriverOS features without going through the onboarding process, while maintaining the ability to exit demo mode and start fresh.

## User Story
As a hackathon judge with limited time,  
I want to instantly see a fully populated DriverOS dashboard with realistic data so I can quickly evaluate all features without completing lengthy onboarding forms.

## Files to Read First
- `app/page.tsx` - Landing page with demo button
- `lib/demo-data.ts` - Existing demo data structure
- `app/dashboard/page.tsx` - Dashboard implementation
- `components/layout/TopBanner.tsx` - Demo mode indicator
- `lib/types.ts` - Data interfaces

## Files to Create/Modify
- `app/page.tsx` - Add "Judge Demo" button to landing page
- `lib/demo-mode.ts` - New demo mode utilities and state management
- `app/dashboard/page.tsx` - Detect and load demo mode data
- `components/layout/TopBanner.tsx` - Add demo mode banner with exit option
- `components/demo/DemoTour.tsx` - Optional guided tour overlay
- `lib/demo-data.ts` - Expand with complete realistic dataset
- `__tests__/demo-mode.test.ts` - Unit tests for demo functionality

## Step-by-Step Tasks

1. **Create demo mode utilities**
   - Add `enableDemoMode()` and `exitDemoMode()` functions
   - Store demo state in localStorage with 'demo-mode' key
   - Create comprehensive demo dataset with realistic business data

2. **Add Judge Demo button to landing**
   - Add prominent "Judge Demo" button on homepage
   - Style distinctly from regular "Start Flash Scan" button
   - Include brief description: "See full analysis instantly"

3. **Implement demo mode detection**
   - Check for demo mode in dashboard and other pages
   - Load demo data instead of user data when in demo mode
   - Ensure all features work with demo data

4. **Add demo mode indicator**
   - Show clear "Demo Mode" banner at top of all pages
   - Include "Exit Demo" button in banner
   - Use distinct styling (orange/yellow theme) to indicate demo state

5. **Create realistic demo dataset**
   - Complete Flash Scan and Full Audit results
   - Sample imported actions and goals
   - Meeting templates with sample data
   - Realistic company profile (TechFlow Solutions)

6. **Add demo mode exit functionality**
   - Clear demo mode flag from localStorage
   - Redirect to landing page or onboarding
   - Ensure clean slate for real usage

7. **Optional: Add guided tour**
   - 5-step overlay highlighting key features
   - Dismissible tooltips pointing to Gear, Accelerator, Signal Board, Action Bay, Export
   - Skip option for judges who want to explore freely

## Validation Commands
```bash
npm test -- demo-mode.test.ts
npm run dev
# Click "Judge Demo" → Should load full dashboard instantly
# Click "Exit Demo" → Should return to clean landing page
npm run build
```

## Test Cases

### Unit Tests
- `enableDemoMode()` sets localStorage flag correctly
- `exitDemoMode()` clears all demo data
- Demo data structure matches all required interfaces
- Demo mode detection works across page refreshes

### E2E Tests
- Click "Judge Demo" → Dashboard loads with full data in <3 seconds
- Demo banner appears on all pages with exit button
- Export functionality works with demo data
- "Exit Demo" returns to clean landing page
- Regular onboarding still works when not in demo mode

## Demo Steps (Judge Experience)

1. **Landing**: Judge visits homepage, sees "Judge Demo" button prominently displayed
2. **Instant Load**: Click button → Dashboard appears in <3 seconds with complete analysis
3. **Guided Tour**: Optional 5-step overlay highlights key features (30 seconds)
4. **Feature Exploration**: 
   - Gear indicator shows "3 - Drive" 
   - Weekly Accelerator displays "Weekly Active Users"
   - Signal Board shows 5 engines with realistic scores
   - Action Bay contains mix of generated + imported actions
   - CSV export downloads realistic data
5. **Exit Demo**: Clear demo mode indicator, easy exit to try real onboarding

## Acceptance Test
Judge can click one button and immediately see a fully functional DriverOS dashboard with realistic business data, explore all features, export CSV files, and easily exit to start fresh - all within 2 minutes of landing on the site.
