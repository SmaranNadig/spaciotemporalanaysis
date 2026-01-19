# 🖱️ Click-and-Drag Selection Guide

## ✨ New Feature Added!

The dashboard now supports **interactive click-and-drag** region selection on the map! This makes it much easier to select spatial query regions.

---

## 🎯 How to Use

### Step-by-Step:

1. **Position your cursor** on the map at one corner of the region you want to query

2. **Click and hold** the left mouse button

3. **Drag** to the opposite corner of your desired region
   - You'll see a **blue dashed rectangle** appear as you drag
   - The rectangle fills with a semi-transparent blue color

4. **Release** the mouse button
   - The input fields automatically populate with the selected coordinates!
   - Check the browser console for confirmation message

5. **Adjust time range** using the sliders (if needed)

6. **Click "Execute Query"** to search the selected region

---

## 🎨 Visual Feedback

While dragging:
- **Blue dashed outline** - Shows the selection boundary
- **Blue semi-transparent fill** - Highlights the selected area
- **Tooltip hidden** - The "Click and drag..." text disappears during selection

After release:
- **Input fields update** - X1, Y1, X2, Y2 automatically filled
- **Console message** - Confirms the selected region
- **Selection overlay disappears** - Map returns to normal view

---

## 💡 Tips

### ✅ Best Practices:

1. **Zoom your browser** if you need more precision
   - `Ctrl +` to zoom in
   - `Ctrl -` to zoom out

2. **Start from any corner** - It doesn't matter which direction you drag

3. **Check the coordinates** in the input fields after selecting

4. **Fine-tune manually** if needed by editing the input fields

5. **Watch the coordinate display** at the bottom of the map while dragging

### ⚡ Quick Selection Strategies:

**For Hotspots:**
```
1. Look for the red pulsating circles (hotspots)
2. Drag a box around one hotspot
3. Execute query to see event concentration
```

**For Comparisons:**
```
1. Select region A → Execute query → Note count
2. Select region B → Execute query → Compare counts
3. Analyze spatial distribution patterns
```

**For Precision:**
```
1. Drag a rough selection
2. Fine-tune the coordinates in input fields
3. Round to nice numbers (e.g., 41.85 instead of 41.8523)
```

---

## 🔧 Technical Details

### What Happens Behind the Scenes:

```javascript
1. Mouse Down → Record starting pixel position
2. Mouse Move → Update current position, redraw selection rectangle
3. Mouse Up → Convert pixels to lat/lon, populate inputs
```

### Coordinate Conversion:

The system automatically converts:
- **Pixel X** (0-800) → **Latitude** (41.75-41.95)
- **Pixel Y** (0-600) → **Longitude** (-87.75 to -87.55)

Note: Y-axis is inverted (higher pixel = lower longitude)

---

## 🐛 Troubleshooting

### Problem: Selection doesn't appear

**Solution:**
- Make sure you're clicking inside the canvas (not on the grid borders)
- Try refreshing the page (F5)

### Problem: Coordinates not updating

**Solution:**
- Check browser console (F12) for errors
- Make sure you released the mouse button
- Try selecting again

### Problem: Selection is too small/large

**Solution:**
- You can always manually adjust the input fields
- Or drag a new selection to override

### Problem: Dragging feels laggy

**Solution:**
- This is normal if you have a slower computer
- The selection still works, just wait for mouse release
- Consider using manual input for precise selections

---

## 📝 Example Workflow

### Finding a Night Crime Hotspot:

```
1. Observe the map for red pulsating circles (hotspots)

2. Select a hotspot:
   - Click on top-left of a red circle
   - Drag to bottom-right
   - Release
   
3. Set time to night:
   - Click "Night" button (12 AM - 6 AM)
   OR
   - Click "Evening" button (6 PM - 12 AM)

4. Execute query

5. Result shows events in that hotspot during night hours

6. Compare with daytime by clicking "Morning" or "Afternoon"
```

---

## 🎓 Learning Exercise

### Exercise: Compare Three Hotspots

1. **Identify** the 3 red pulsating circles on the map

2. **For each hotspot:**
   ```
   a. Drag-select the hotspot area
   b. Set time to "Full Day" (0-1439)
   c. Execute query
   d. Note the event count
   ```

3. **Compare results** - Which hotspot has the most events?

4. **Temporal analysis:**
   ```
   a. Select the busiest hotspot
   b. Query it with "Night" time range
   c. Query it with "Morning" time range
   d. Compare counts
   ```

**Goal:** Understand both spatial AND temporal patterns using visual selection!

---

## ⌨️ Keyboard Modifiers (Future Enhancement)

*Note: These are NOT currently implemented, but could be added:*

- **Shift+Drag** → Square selection (equal X and Y range)
- **Ctrl+Click** → Add to existing selection
- **Double-click** → Select entire map
- **Right-click** → Context menu with saved selections

---

## 🎉 Advantages Over Manual Input

| Manual Input | Click-and-Drag |
|--------------|----------------|
| Need to know coordinates | Visual selection |
| Prone to typos | Accurate to pixel |
| Slow for comparisons | Fast iteration |
| Hard to visualize | See selection live |
| Requires precision | Forgiving, can retry |

---

## 🚀 Next Steps

Now that you can visually select regions:

1. **Practice** - Try selecting different sized regions
2. **Experiment** - Compare hotspots visually
3. **Combine** - Use drag-select + time ranges for powerful queries
4. **Explore** - Find patterns you couldn't see with manual input

---

**Enjoy the enhanced interactive experience!** 🎨

*Last Updated: 2025-12-23*
