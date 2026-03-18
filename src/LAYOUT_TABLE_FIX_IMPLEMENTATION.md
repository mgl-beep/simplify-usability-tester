# Layout Table Fix - Implementation Changes Required

## ✅ Changes Completed:

1. **Added new state variables** (lines 74-77):
   - `tablePurposes` (string[]): Multi-select array for layout table purposes
   - `convertedTableHtml` (string | null): Stores converted HTML for preview
   
2. **Updated reset logic** (lines 149-152):
   - Reset `tablePurposes` array
   - Reset `convertedTableHtml`

3. **Updated validation** (line 335):
   - Changed from `!tablePurpose` to `tablePurposes.length === 0`

## 🔧 Changes Still Needed:

### 1. Update convertLayoutTable function (lines 732-832)

Replace the entire function with this version that:
- Uses `tablePurposes` array instead of `tablePurpose`
- Removes "side-by-side" and "spacing" options
- Uses semantic HTML without CSS Grid
- Shows preview before applying

```typescript
// Convert layout table to proper HTML structure (MULTI-SELECT + PREVIEW)
const convertLayoutTable = async () => {
  if (!issue?.elementHtml || tablePurposes.length === 0) {
    toast.error('Missing table data or purpose selection');
    return;
  }

  setIsGenerating(true);

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(issue.elementHtml, 'text/html');
    const table = doc.querySelector('table');
    
    if (!table) {
      toast.error('Could not parse table HTML');
      setIsGenerating(false);
      return;
    }

    // Extract all cell content (preserving links and images)
    const cells = Array.from(table.querySelectorAll('td, th'));
    const cellContents = cells.map(cell => cell.innerHTML.trim()).filter(content => content);

    let convertedHtml = '';
    const primaryPurpose = tablePurposes[0]; // Use first selected purpose

    switch (primaryPurpose) {
      case 'list':
        // Convert to <ul><li> - keeps links intact
        convertedHtml = '<ul>\\n' + cellContents.map(content => `  <li>${content}</li>`).join('\\n') + '\\n</ul>';
        break;

      case 'links':
        // Convert to <nav><ul><li><a> structure
        const linkItems = cellContents.map(content => {
          if (content.includes('<a ')) {
            return `  <li>${content}</li>`;
          }
          return `  <li><a href="#">${content}</a></li>`;
        }).join('\\n');
        convertedHtml = `<nav aria-label="Navigation">\\n<ul>\\n${linkItems}\\n</ul>\\n</nav>`;
        break;

      case 'gallery':
        // Convert to stacked <figure><img> - NO CSS Grid
        const galleryItems = cellContents.map(content => {
          if (content.includes('<img')) {
            return `<figure>\\n  ${content}\\n</figure>`;
          }
          return `<figure>\\n  ${content}\\n</figure>`;
        }).join('\\n');
        convertedHtml = galleryItems;
        break;

      case 'data':
        toast.info('Please use the Table Headers/Caption fix instead for data tables.');
        setIsGenerating(false);
        return;

      default:
        toast.error('Invalid table purpose selected');
        setIsGenerating(false);
        return;
    }

    console.log('✅ Converted table HTML:', convertedHtml);
    console.log('📝 Conversion details:', {
      purposes: tablePurposes,
      primaryPurpose,
      originalCellCount: cellContents.length,
      issueId: issue.id,
      location: issue.location
    });

    // Show before/after preview
    setConvertedTableHtml(convertedHtml);
    setPreviewOriginal(issue.elementHtml);
    setPreviewFixed(convertedHtml);
    setShowPreview(true);

  } catch (error) {
    console.error('❌ Error converting layout table:', error);
    toast.error('Failed to convert table. Please try manual conversion.');
  } finally {
    setIsGenerating(false);
  }
};

// Apply the converted table HTML after user confirms preview
const applyConvertedTable = () => {
  if (!convertedTableHtml || !issue) {
    toast.error('No converted HTML available');
    return;
  }

  try {
    onApplyFix(issue, convertedTableHtml);
    toast.success('Table converted to accessible HTML structure!');
    setShowPreview(false);
    onClose();
  } catch (error) {
    console.error('❌ Error applying converted table:', error);
    toast.error('Failed to apply conversion.');
  }
};
```

### 2. Update table purpose selection UI (lines 1624-1920)

Replace the button grid with multi-select checkboxes. Remove:
- ⚖️ Side-by-side layout
- 📏 Spacing/Alignment

Keep only:
- 📋 List of items
- 🔗 Links/Navigation  
- 🖼️ Image gallery
- 📊 Actually data

Change from:
```tsx
!tablePurpose ? (
  /* button grid */
) : (
  /* AI suggestion view */
)
```

To:
```tsx
tablePurposes.length === 0 ? (
  /* checkbox list */
) : (
  /* preview view */
)
```

See `/temp_table_checkboxes_ui.txt` for complete checkbox UI code.

### 3. Key Behavior Changes:

**Before:**
- Single-select buttons
- Shows AI suggestion immediately
- Applies fix directly

**After:**
- Multi-select checkboxes
- Shows before/after preview
- User confirms before applying
- Preserves all content and links
- Uses semantic HTML only (no CSS Grid/Bootstrap)

## 🎯 Expected Result:

When user selects "No" (not a data table), they see:
1. ✅ Checkbox list with 4 options (list, links, gallery, data)
2. ✅ "Fix Now" button appears after selecting at least one
3. ✅ Clicking "Fix Now" shows before/after preview
4. ✅ User can confirm or go back
5. ✅ Conversion preserves all existing content/links
6. ✅ Output is clean semantic HTML (no Grid/Flexbox/Bootstrap)
