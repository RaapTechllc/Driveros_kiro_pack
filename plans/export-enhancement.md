# Feature Plan: Export Enhancement - Additional CSV Formats

## Feature Description
Enhance the existing CSV export functionality by adding meeting templates export, combined actions+goals export, and formatted Excel-ready templates with headers, examples, and field descriptions for better usability and data portability.

## User Story
As a business owner using DriverOS,  
I want to export my meeting templates and combined data in various formats so I can use the information in external tools like Excel, project management software, or share with my team.

## Files to Read First
- `app/dashboard/page.tsx` - Current CSV export implementation
- `lib/csv-export.ts` - Existing export utilities (if exists)
- `lib/meeting-templates.ts` - Meeting template data structure
- `components/dashboard/ExportSection.tsx` - Current export UI
- `.kiro/steering/import-export.md` - CSV requirements

## Files to Create/Modify
- `lib/csv-export.ts` - Enhanced export utilities with new formats
- `app/dashboard/page.tsx` - Add new export options to dashboard
- `components/dashboard/ExportSection.tsx` - Update UI with new export buttons
- `components/export/ExportModal.tsx` - New modal for export format selection
- `lib/meeting-export.ts` - Meeting templates CSV export logic
- `__tests__/csv-export.test.ts` - Unit tests for all export formats

## Step-by-Step Tasks

1. **Create enhanced export utilities**
   - Add `exportMeetingTemplates()` function for meeting data
   - Add `exportCombinedData()` for actions + goals in one file
   - Add `exportExcelReady()` with formatted headers and examples
   - Maintain existing `exportActions()` and `exportGoals()` functions

2. **Design meeting templates CSV format**
   - Headers: type, title, duration_min, agenda_item, input_field, output_field
   - One row per agenda item or field for detailed breakdown
   - Include sample data for Warm-Up, Pit Stop, Full Tune-Up

3. **Create combined export format**
   - Single CSV with sections: Goals, Actions, Meetings
   - Use section headers and empty rows for visual separation
   - Maintain all required fields from individual exports

4. **Add Excel-ready formatting**
   - Include field descriptions in header row comments
   - Add example data rows (commented or in separate sheet section)
   - Use Excel-friendly date formats (YYYY-MM-DD)
   - Include data validation hints

5. **Update dashboard export UI**
   - Add "Export Options" dropdown or modal
   - Options: Actions, Goals, Meetings, Combined, Excel Template
   - Show file size estimates and descriptions
   - Maintain one-click export for existing formats

6. **Add export format selection modal**
   - Preview of each format with sample data
   - Format descriptions and use cases
   - Download buttons for each format
   - "Export All" option for complete data package

7. **Enhance export metadata**
   - Add export timestamp and company info to files
   - Include DriverOS version and analysis date
   - Add file headers with usage instructions

## Validation Commands
```bash
npm test -- csv-export.test.ts
npm run dev
# Complete analysis → Dashboard → Test all export options
# Verify CSV files open correctly in Excel/Google Sheets
npm run build
```

## Test Cases

### Unit Tests
- `exportMeetingTemplates()` generates valid CSV with all meeting types
- `exportCombinedData()` includes all sections with proper formatting
- `exportExcelReady()` includes headers, examples, and metadata
- All export functions handle empty data gracefully
- CSV output matches domain model field requirements

### E2E Tests
- Dashboard export dropdown shows all format options
- Each export format downloads successfully
- Combined export contains actions, goals, and meetings
- Excel template opens properly with formatted headers
- Export works with both generated and imported data

## Demo Steps (Judge Experience)

1. **Dashboard Access**: Navigate to dashboard with complete analysis
2. **Export Options**: Click "Export" dropdown, see 5 format options
3. **Individual Exports**: Download Actions CSV, Goals CSV, Meetings CSV
4. **Combined Export**: Download single file with all data sections
5. **Excel Template**: Download Excel-ready format with examples and descriptions
6. **Verification**: Open files in Excel/Google Sheets, show proper formatting
7. **Data Completeness**: Demonstrate all analysis data is preserved and portable

## Acceptance Test
User can export their complete DriverOS analysis in multiple formats including individual CSVs, combined data file, and Excel-ready template with examples, all maintaining data integrity and providing clear usage instructions for external tools.
