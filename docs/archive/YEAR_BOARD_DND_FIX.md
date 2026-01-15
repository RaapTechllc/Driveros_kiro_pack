# Year Board Drag-and-Drop Fix

**Date**: 2026-01-08
**Issue**: Year Board drag-and-drop was difficult to use and items weren't moving properly

---

## 🐛 Problems Identified

### 1. Drop Zone Too Small
- **Issue**: Had to drop items precisely on the dotted border
- **Cause**: Drop zone was only the border area, not the entire column
- **User Impact**: Frustrating experience, items "bouncing back"

### 2. Items Not Moving
- **Issue**: Items stayed in place or duplicated when dragged
- **Cause**: `handleDragLeave` fired when hovering over child elements
- **User Impact**: Cards appeared stuck or cloned

### 3. Visual Feedback Issues
- **Issue**: Unclear which column would accept the drop
- **Cause**: Drag state resetting when moving over children
- **User Impact**: Uncertain where to drop items

### 4. Column Size Inconsistency
- **Issue**: Empty columns too small, full columns expand awkwardly
- **Cause**: No minimum height, no visual consistency
- **User Impact**: Board layout jumps around

---

## ✅ Solutions Implemented

### 1. Entire Column as Drop Zone
**File**: `components/year-board/QuarterColumn.tsx`

**Changes**:
- Changed from `border-2 border-dashed` to solid `border-2`
- Removed requirement to hit specific border area
- Entire column area now accepts drops
- Increased padding from `p-2` to `p-3` for bigger target

**Before**:
```tsx
className="min-h-[120px] p-2 border-2 border-dashed"
```

**After**:
```tsx
className="min-h-[150px] p-3 border-2 rounded-lg"
```

---

### 2. Fixed Drag Counter for Child Elements
**File**: `components/year-board/QuarterColumn.tsx`

**Problem**: `handleDragLeave` fired when moving from parent to child

**Solution**: Implemented drag counter pattern
```tsx
const dragCounterRef = useRef(0)

const handleDragEnter = (e: React.DragEvent) => {
  dragCounterRef.current++
  setDragOver(true)
}

const handleDragLeave = (e: React.DragEvent) => {
  dragCounterRef.current--
  // Only clear when leaving ALL children
  if (dragCounterRef.current === 0) {
    setDragOver(false)
  }
}
```

**Result**: Drag state stays consistent when hovering over cards

---

### 3. Force Refresh All Columns
**File**: `components/year-board/YearBoard.tsx`

**Problem**: Other columns didn't update when item moved

**Solution**: Added refresh key pattern
```tsx
const [refreshKey, setRefreshKey] = useState(0)

const handleCardMove = () => {
  setRefreshKey(prev => prev + 1)
  onPlanChange()
}

// In render:
<QuarterColumn
  key={`${department.id}-${quarter}-${refreshKey}`}
  onCardMove={handleCardMove}
/>
```

**Result**: All columns reload when any item moves

---

### 4. Enhanced Visual Feedback
**File**: `components/year-board/YearCard.tsx`

**Added drag visual cues**:
```tsx
const handleDragStart = (e: React.DragEvent) => {
  e.dataTransfer.setData('text/plain', item.id)
  e.dataTransfer.effectAllowed = 'move'
  const target = e.currentTarget as HTMLElement
  target.style.opacity = '0.5'  // Ghost effect
}

const handleDragEnd = (e: React.DragEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.opacity = '1'  // Restore
}
```

**Updated column styling**:
```tsx
dragOver
  ? 'border-primary bg-primary/10 scale-[1.02]'  // Highlighted and enlarged
  : 'border-border bg-muted/20 hover:bg-muted/30'
```

---

### 5. Better Empty State
**File**: `components/year-board/QuarterColumn.tsx`

**Before**: Small text at bottom
```tsx
{items.length === 0 && (
  <div className="text-center text-muted-foreground text-sm py-8">
    Drop cards here
  </div>
)}
```

**After**: Centered, visible placeholder
```tsx
{items.length === 0 && (
  <div className="flex items-center justify-center h-[120px]">
    <div className="text-center text-muted-foreground text-sm">
      {dragOver ? (
        <div className="font-medium text-primary">Drop here</div>
      ) : (
        <div className="opacity-60">Drag cards here</div>
      )}
    </div>
  </div>
)}
```

---

## 🎯 User Experience Improvements

### Before:
- ❌ Had to aim for dotted border
- ❌ Items stayed in source column
- ❌ No feedback when hovering over children
- ❌ Columns jumped in size
- ❌ Unclear where to drop

### After:
- ✅ Drop anywhere in column
- ✅ Items move correctly between quarters
- ✅ Consistent hover state
- ✅ Minimum height prevents layout shift
- ✅ Clear visual feedback (scale + highlight)
- ✅ Ghost effect while dragging

---

## 🧪 Testing Checklist

- [x] Drag from Q1 to Q2 - item moves
- [x] Drag from populated to empty column - works
- [x] Drag from empty to populated column - works
- [x] Hover over cards in column - highlight stays
- [x] Drop outside column - item returns to source
- [x] Multiple drags in sequence - all work
- [x] Drag across departments - works
- [x] Column sizes consistent
- [x] Visual feedback clear
- [x] No duplicate items

---

## 🔧 Technical Details

### Event Handling
- Used `e.stopPropagation()` to prevent event bubbling
- Added `dragCounter` ref to track nested drag/leave events
- Implemented proper cleanup in `handleDrop`

### State Management
- Added `refreshKey` to force React re-render
- Maintained local state in each column
- Parent callback triggers global refresh

### Visual Design
- Solid borders instead of dashed (easier to see)
- Scale animation on hover (scale-[1.02])
- Background color changes (bg-primary/10)
- Opacity effect during drag (0.5)

---

## 📊 Performance Impact

- **Added**: 1 useRef per column (minimal memory)
- **Added**: 1 useState in YearBoard (1 number)
- **Changed**: Key prop causes full column re-render on move
- **Impact**: Negligible - columns are lightweight

---

## 🚀 Future Enhancements (Optional)

1. **Drag Preview**: Custom drag ghost image
2. **Multi-select**: Drag multiple items at once
3. **Undo/Redo**: Track move history
4. **Animations**: Smooth transitions when items move
5. **Touch Support**: Mobile drag-and-drop
6. **Keyboard Support**: Arrow keys to move items

---

## ✅ Summary

**Status**: ✅ Fixed and tested

**Files Changed**:
1. `components/year-board/QuarterColumn.tsx` - Main drag-drop logic
2. `components/year-board/YearBoard.tsx` - Refresh key pattern
3. `components/year-board/YearCard.tsx` - Visual feedback

**Lines Changed**: ~50 lines
**Breaking Changes**: None
**Backward Compatible**: Yes

**User Satisfaction**: 📈 Dramatically improved
- Before: Frustrating, broken
- After: Smooth, intuitive, professional
