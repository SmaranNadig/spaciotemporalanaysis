# 🌍 Spatio-Temporal Event Analytics Dashboard - User Guide

**A Complete Guide to Operating the Interactive Visualization Dashboard**

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Understanding Each Component](#understanding-each-component)
4. [How to Run Queries](#how-to-run-queries)
5. [Interpreting Results](#interpreting-results)
6. [Example Queries](#example-queries)
7. [Tips & Best Practices](#tips--best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Opening the Dashboard

**Method 1: From File Explorer**
1. Navigate to: `c:\Users\nadig\OneDrive\Desktop\dsael\src\web`
2. Double-click `index.html`
3. The dashboard will open in your default browser

**Method 2: From Command Line**
```powershell
cd c:\Users\nadig\OneDrive\Desktop\dsael\src\web
start index.html
```

**Method 3: Direct URL**
```
file:///C:/Users/nadig/OneDrive/Desktop/dsael/src/web/index.html
```

### System Requirements

- ✅ **Browser**: Chrome, Firefox, Edge, or Safari (latest version)
- ✅ **JavaScript**: Must be enabled
- ✅ **Display**: 1280×720 minimum resolution recommended
- ✅ **Internet**: Not required (works offline)

### First Load

When the page loads, you should see:
- ✅ Purple gradient header with title
- ✅ Four statistics cards showing zeros
- ✅ Event map with blue dots (2,000 events auto-generated)
- ✅ Query controls on the right
- ✅ Temporal heatmap at the bottom

**If you see a blank page:** Check browser console (F12) for errors.

---

## 📊 Dashboard Overview

The dashboard is divided into **6 main sections**:

```
┌─────────────────────────────────────────────────┐
│  HEADER - Title & Project Name                  │
├──────────────────────┬──────────────────────────┤
│  STATISTICS CARDS (4 cards showing metrics)     │
├──────────────────────┼──────────────────────────┤
│                      │  QUERY CONTROLS          │
│  EVENT MAP           │  - Spatial Range         │
│  (Main visualization)│  - Temporal Range        │
│                      │  - Execute Button        │
├──────────────────────┼──────────────────────────┤
│                      │  RESULTS PANEL           │
│  (Same as map)       │  (Query history)         │
├──────────────────────┴──────────────────────────┤
│  TEMPORAL HEATMAP (24-hour distribution)        │
├─────────────────────────────────────────────────┤
│  FOOTER - Project Information                   │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Understanding Each Component

### 1. Statistics Cards (Top Row)

#### **Card 1: Total Events** 📊
- **Shows**: Number of events loaded in the system
- **Default**: 2,000 (auto-generated sample data)
- **Updates**: When page reloads
- **Example**: "2,000"

#### **Card 2: Avg Query Time** ⚡
- **Shows**: Average time taken to execute queries
- **Default**: "0 ms" (no queries run yet)
- **Updates**: After each query
- **Example**: "0.245 ms"

#### **Card 3: Queries Run** 🔍
- **Shows**: Total number of queries executed
- **Default**: "0"
- **Updates**: Increments with each query
- **Example**: "7"

#### **Card 4: Last Result** 🎯
- **Shows**: Number of events found in last query
- **Default**: "-" (no queries yet)
- **Updates**: After each query
- **Example**: "156 events"

---

### 2. Event Map (Left Panel)

#### **Visual Elements**

| Element | Appearance | Meaning |
|---------|------------|---------|
| **Grid Lines** | Light gray, 10×10 grid | Spatial reference |
| **Blue Dots** | Small semi-transparent circles | Individual events |
| **Red Pulsating Circles** | Large animated red circles | Detected hotspots (high concentration) |
| **Red Rectangle** | Temporary highlight | Your last query region |

#### **Interactive Features**

**Hover Over Map:**
- Bottom of map shows current coordinates
- Format: `(latitude, longitude)`
- Example: `(41.8812, -87.6298)`

**Pulsating Hotspots:**
- Automatically detect areas with >20 events
- Shows top 3 hotspot locations
- Animation updates 20 times per second

**Query Highlight:**
- When you run a query, region flashes red
- Highlight lasts 2 seconds
- Helps visualize what area you searched

---

### 3. Query Controls (Right Top Panel)

This is where you configure your search parameters.

#### **A. Spatial Range Section**

Defines the **geographic rectangle** to search within.

**Input Fields:**

| Field | Label | Description | Example Value |
|-------|-------|-------------|---------------|
| **X1** | Lat | Bottom-left latitude | 41.80 |
| **Y1** | Lon | Bottom-left longitude | -87.70 |
| **X2** | Lat | Top-right latitude | 41.92 |
| **Y2** | Lon | Top-right longitude | -87.60 |

**How It Works:**
- X1, Y1 = One corner of rectangle
- X2, Y2 = Opposite corner
- Together they define a rectangular search area

**Visual Aid:**
```
        (X2, Y2) ← Top-right
           ┌─────────┐
           │ Search  │
           │  Area   │
           └─────────┘
(X1, Y1) ← Bottom-left
```

**Tips:**
- ✅ Larger area = more events found
- ✅ Values don't have to be min/max ordered (auto-corrected)
- ✅ Use mouse hover on map to find coordinates

---

#### **B. Temporal Range Section**

Defines the **time window** to search within.

**Sliders:**

| Slider | Range | Unit | Display |
|--------|-------|------|---------|
| **Start Time** | 0-1439 | Minutes (since midnight) | HH:MM format |
| **End Time** | 0-1439 | Minutes (since midnight) | HH:MM format |

**Time Conversion:**
- 0 minutes = 00:00 (midnight)
- 360 minutes = 06:00 (6 AM)
- 720 minutes = 12:00 (noon)
- 1080 minutes = 18:00 (6 PM)
- 1439 minutes = 23:59 (almost midnight)

**Live Display:**
- As you drag sliders, time display updates
- Shows in 24-hour format
- Example: "14:30" = 2:30 PM

**Wraparound Queries:**
- If Start > End, it wraps around midnight
- Example: Start=1200 (8 PM), End=360 (6 AM)
- Searches: 8 PM → midnight + midnight → 6 AM

---

#### **C. Quick Time Ranges**

Four preset buttons for common time windows:

| Button | Time Range | Minutes | Use Case |
|--------|------------|---------|----------|
| **Night** | 12 AM - 6 AM | 0-360 | Late night events |
| **Morning** | 6 AM - 12 PM | 360-720 | Morning rush hour |
| **Afternoon** | 12 PM - 6 PM | 720-1080 | Daytime activity |
| **Evening** | 6 PM - 12 AM | 1080-1440 | Evening/night events |

**How to Use:**
1. Click any button
2. Sliders automatically adjust
3. Time displays update
4. **Still need to click "Execute Query"** to run

---

#### **D. Execute Query Button** 🚀

The main action button to run your search.

**Appearance:**
- Full-width purple gradient button
- Rocket emoji icon (🚀)
- Text: "Execute Query"

**When Clicked:**
1. Reads all input values
2. Searches through 2,000 events
3. Counts matches
4. Measures execution time
5. Updates statistics
6. Adds result to results panel
7. Flashes query region on map

**Visual Feedback:**
- Button scales up on hover
- Slight shadow/glow effect
- Smooth animation

---

### 4. Results Panel (Right Bottom)

Shows history of your queries (newest first).

#### **Empty State**
When no queries run yet:
```
         🔍
  No queries executed yet
  Configure parameters and click "Execute Query"
```

#### **Query Result Card**

Each result shows:

```
┌────────────────────────────────┐
│  156 events        ⚡ 0.245 ms │  ← Count & Time
├────────────────────────────────┤
│  📍 Region: (41.80, -87.70)    │  ← Spatial range
│            → (41.92, -87.60)   │
│  ⏰ Time: 20:00 → 04:00        │  ← Time range
└────────────────────────────────┘
```

**Components:**

| Element | Description |
|---------|-------------|
| **Event Count** | Number in large purple text |
| **Query Time** | Green badge with milliseconds |
| **Region** | Coordinates of search rectangle |
| **Time** | Time range in HH:MM format |

**Features:**
- ✅ Scrollable list (max height: 600px)
- ✅ Keeps last 10 results only
- ✅ Hover effect (shifts left slightly)
- ✅ Slide-in animation when added

**Clear Button:**
- Located in panel header
- Removes all results
- Resets statistics

---

### 5. Temporal Heatmap (Bottom)

Shows **when** events occur throughout the day.

#### **Visual Design**

```
│
│ █        High activity
│ █
│ █  █
│ █  █  █
│ █  █  █     █
└─────────────────────────
 0:00  6:00  12:00  18:00  24:00
```

**Color Coding:**
- 🔵 **Blue bars** = Low activity (few events)
- 🟡 **Yellow bars** = Medium activity
- 🔴 **Red bars** = High activity (many events)

**Bar Height:**
- Taller bar = More events during that hour
- Height is relative to maximum count
- Scaled to use 90% of canvas height

**Time Labels:**
- Shows every 3 hours (0:00, 3:00, 6:00, etc.)
- Total of 24 bars (one per hour)

**How to Read:**
1. Find the hour you're interested in
2. Check bar color and height
3. Compare to other hours

**Example Interpretation:**
> "Red tall bar at 21:00 (9 PM) means many events occurred during 9-10 PM hour"

---

## 🎮 How to Run Queries

### Basic Query Flow

**Step-by-Step Instructions:**

#### **Step 1: Set Spatial Range**
```
1. Look at the map to identify area of interest
2. Note approximate coordinates
3. Enter coordinates in input fields:
   - X1 (Lat): Bottom-left latitude
   - Y1 (Lon): Bottom-left longitude
   - X2 (Lat): Top-right latitude
   - Y2 (Lon): Top-right longitude
```

**Example:**
- Want to search downtown area
- X1: 41.87, Y1: -87.65
- X2: 41.90, Y2: -87.62

#### **Step 2: Set Temporal Range**

**Option A - Use Sliders:**
```
1. Drag "Start Time" slider to desired start
2. Watch display update (e.g., "08:00")
3. Drag "End Time" slider to desired end
4. Watch display update (e.g., "17:00")
```

**Option B - Use Quick Buttons:**
```
1. Click one of the quick buttons:
   - Night, Morning, Afternoon, or Evening
2. Sliders adjust automatically
```

**Example:**
- Want morning rush hour
- Click "Morning" button
- Or manually set: Start=360 (6 AM), End=720 (12 PM)

#### **Step 3: Execute Query**
```
1. Click the purple "🚀 Execute Query" button
2. Wait for processing (very fast, <1ms usually)
3. Watch for red rectangle flash on map
4. Check results panel for new result card
```

#### **Step 4: Review Results**
```
1. Look at "Last Result" statistic
2. Read detailed result card in results panel
3. Observe updated "Avg Query Time"
4. Check "Queries Run" counter
```

---

### Advanced Query Techniques

#### **Nighttime Wraparound Query**

To search from 8 PM to 4 AM:
```
Start Time: 1200 (20:00 / 8 PM)
End Time: 240 (04:00 / 4 AM)

This searches:
- 8 PM → Midnight (1200-1439 minutes)
- Midnight → 4 AM (0-240 minutes)
```

#### **Full Day Search**

To search all events in a region:
```
Start Time: 0 (00:00)
End Time: 1439 (23:59)

Expected: ~1/region_fraction of total events
```

#### **Precise Hour Window**

To search single hour (e.g., noon hour):
```
Start Time: 720 (12:00)
End Time: 779 (12:59)

Expected: ~1/24 of events in that location
```

#### **Small vs Large Regions**

**Small Region Technique:**
```
Difference between X1-X2 and Y1-Y2: ~0.01-0.03
Example:
  X1: 41.88, X2: 41.89 (0.01 difference)
  Y1: -87.64, Y2: -87.62 (0.02 difference)

Result: Very specific area, fewer events
```

**Large Region Technique:**
```
Difference between X1-X2 and Y1-Y2: ~0.10-0.20
Example:
  X1: 41.75, X2: 41.95 (0.20 difference)
  Y1: -87.75, Y2: -87.55 (0.20 difference)

Result: Entire city, many events
```

---

## 📈 Interpreting Results

### Understanding the Numbers

#### **Event Count**
```
156 events
```
**What it means:**
- 156 events matched both spatial AND temporal criteria
- Out of 2,000 total events
- Percentage: (156 / 2000) × 100 = 7.8% of all events

**Context:**
- 0-50 events = Very specific query
- 50-200 events = Moderate query
- 200-500 events = Large query
- 500+ events = Very broad query

#### **Query Time**
```
⚡ 0.245 ms
```
**What it means:**
- Took 0.245 milliseconds to execute
- That's 0.000245 seconds
- Very fast!

**Context:**
- 0-0.5 ms = Excellent (typical)
- 0.5-1.0 ms = Good
- 1.0-2.0 ms = Normal
- 2.0+ ms = Slower (but still fast)

**Note:** 
> With the C++ KD-Tree implementation, these times would be even faster for larger datasets!

### Common Query Patterns

#### **Pattern 1: Hotspot Discovery**
```
Query: Large region, all day
Result: High event count (500+ events)
Interpretation: This is a hotspot area
```

#### **Pattern 2: Time-Specific Events**
```
Query: Large region, 1-hour window
Result: Low event count (20-50 events)
Interpretation: Normal distribution, no time anomaly
```

#### **Pattern 3: Night Crime Pattern**
```
Query: Any region, Night (0-360) or Evening (1080-1440)
Result: Higher than expected count
Interpretation: More events occur at night
```

---

## 💡 Example Queries

### Example 1: Downtown Morning Rush

**Objective:** Find events in downtown Chicago during morning commute

**Steps:**
1. Spatial Range:
   - X1: `41.87`, Y1: `-87.65`
   - X2: `41.90`, Y2: `-87.62`
2. Click "Morning" button (6 AM - 12 PM)
3. Click "Execute Query"

**Expected Result:**
- ~100-150 events
- Query time: ~0.2 ms

**Interpretation:**
- Moderate activity during morning in downtown
- Compare to other time periods to see patterns

---

### Example 2: Night Crime Hotspot

**Objective:** Find late-night events in wider area

**Steps:**
1. Spatial Range:
   - X1: `41.80`, Y1: `-87.70`
   - X2: `41.92`, Y2: `-87.60`
2. Click "Night" button (12 AM - 6 AM)
3. Click "Execute Query"

**Expected Result:**
- ~200-300 events
- Red pulsating circles should be in this area

**Interpretation:**
- High concentration indicates hotspot
- Check temporal heatmap for confirmation

---

### Example 3: Specific Hour Analysis

**Objective:** Events at specific time (e.g., noon hour)

**Steps:**
1. Spatial Range:
   - X1: `41.75`, Y1: `-87.75`
   - X2: `41.95`, Y2: `-87.55` (entire map)
2. Manual time:
   - Start: `720` (12:00 PM)
   - End: `779` (12:59 PM)
3. Click "Execute Query"

**Expected Result:**  
- ~80-100 events (roughly 1/24 of 2000)
- Proportional to hour's share

**Interpretation:**
- Validates time distribution
- Compare to heatmap bar at 12:00

---

### Example 4: Wraparound Night Query

**Objective:** Events from evening to early morning

**Steps:**
1. Spatial Range:
   - X1: `41.85`, Y1: `-87.68`
   - X2: `41.90`, Y2: `-87.62`
2. Manual time:
   - Start: `1200` (20:00 / 8 PM)
   - End: `360` (06:00 / 6 AM)
3. Click "Execute Query"

**Expected Result:**
- High count if night activity is simulated
- Tests wraparound logic

**Interpretation:**
- Shows total nighttime activity
- Combines two time ranges

---

## ⚡ Tips & Best Practices

### For Better Results

1. **Start Broad, Then Narrow**
   ```
   First Query:  Entire map + full day → See total
   Second Query: Specific region + full day → See location pattern
   Third Query:  Specific region + specific time → See detailed pattern
   ```

2. **Use Hotspots as Guides**
   - Red pulsating circles show high-density areas
   - Query around these for guaranteed results
   - Compare different time periods in same hotspot

3. **Compare with Heatmap**
   - Run query for specific hour
   - Check if result matches heatmap bar height
   - Validates spatial vs temporal distribution

4. **Experiment with Wraparound**
   - Try queries that cross midnight
   - Useful for night shift patterns
   - Tests understanding of time logic

5. **Watch Performance Metrics**
   - Average query time should stay low
   - Track how many queries you've run
   - Practice query optimization

### Common Mistakes to Avoid

❌ **Mistake 1:** Forgetting to click "Execute Query"
- Changing parameters doesn't auto-run
- Must click button to execute

❌ **Mistake 2:** Coordinates outside map range
- Valid range: X: 41.75-41.95, Y: -87.75 to -87.55
- Outside this = zero results

❌ **Mistake 3:** Misreading time format
- Times are in 24-hour format
- 20:00 = 8 PM, not 8 AM

❌ **Mistake 4:** Expecting real-time updates
- Map shows all 2,000 events always
- Query doesn't filter displayed dots
- Only counts and reports matches

❌ **Mistake 5:** Not checking results panel
- Statistics update, but check panel for details
- Each result card has full information

---

## 🔧 Troubleshooting

### Problem: No events showing on map

**Symptoms:**
- Map is blank or shows only grid lines
- No blue dots visible

**Solutions:**
1. **Check Browser Console:**
   - Press F12
   - Look for JavaScript errors
   - Common: "Cannot read property..."
   
2. **Refresh Page:**
   - Press F5 or Ctrl+R
   - Data regenerates on load
   
3. **Check Browser Compatibility:**
   - Use Chrome, Firefox, or Edge
   - Ensure JavaScript is enabled

---

### Problem: Query returns 0 events

**Symptoms:**
- Result shows "0 events"
- Expected to find some

**Solutions:**
1. **Check Coordinate Range:**
   - Ensure coordinates are within: X: 41.75-41.95, Y: -87.75 to -87.55
   - Try expanding the region
   
2. **Check Time Range:**
   - Ensure Start and End are different
   - Try full day: 0-1439
   
3. **Try Entire Map:**
   ```
   X1: 41.75, Y1: -87.75
   X2: 41.95, Y2: -87.55
   Time: 0 to 1439
   Should return: 2000 events
   ```

---

### Problem: Dashboard looks broken/unstyled

**Symptoms:**
- No colors, plain HTML
- Layout is broken

**Solutions:**
1. **Check Files Present:**
   - Ensure `styles.css` is in same folder
   - Ensure `app.js` is in same folder
   
2. **Check Browser Console:**
   - Look for "Failed to load resource"
   - May indicate missing files
   
3. **Reload Completely:**
   - Press Ctrl+Shift+R (hard reload)
   - Clears cache and reloads all resources

---

### Problem: Sliders not working

**Symptoms:**
- Can't drag sliders
- Time display doesn't update

**Solutions:**
1. **Check JavaScript:**
   - Open browser console (F12)
   - Look for errors
   
2. **Try Different Browser:**
   - Test in Chrome or Firefox
   - May be browser-specific issue
   
3. **Verify app.js Loaded:**
   - Check Network tab in dev tools
   - Ensure app.js loaded successfully

---

### Problem: Map not rendering

**Symptoms:**
- Map container is empty
- Canvas element missing

**Solutions:**
1. **Check Canvas Element:**
   - Right-click map area → Inspect
   - Verify `<canvas id="eventCanvas">` exists
   
2. **Check JavaScript Console:**
   - Look for canvas-related errors
   - Common: "Cannot get context of null"
   
3. **Verify HTML Structure:**
   - Open index.html in text editor
   - Check for accidental deletions

---

## 📱 Keyboard Shortcuts

While the dashboard doesn't have specific shortcuts, these browser shortcuts are useful:

| Shortcut | Action |
|----------|--------|
| **F5** | Refresh page |
| **Ctrl+R** | Refresh page |
| **Ctrl+Shift+R** | Hard refresh (clear cache) |
| **F11** | Fullscreen mode |
| **Ctrl++** | Zoom in |
| **Ctrl+-** | Zoom out |
| **Ctrl+0** | Reset zoom |
| **F12** | Open developer tools |

---

## 🎓 Learning Exercises

### Exercise 1: Coverage Test
**Goal:** Understand query coverage

1. Run query: Entire map, full day
2. Note result (should be 2000)
3. Run query: Half the X range, full day
4. Note result (should be ~1000)
5. **Question:** Why approximately half?

---

### Exercise 2: Time Distribution
**Goal:** Verify time distribution

1. Run query: Entire map, each hour separately
2. Record event count for each hour
3. Add all counts together
4. **Question:** Does total equal 2000?

---

### Exercise 3: Hotspot Analysis
**Goal:** Find and analyze hotspots

1. Identify 3 red pulsating circles
2. Query small area around each
3. Compare event counts
4. **Question:** Which hotspot has most events?

---

### Exercise 4: Performance Comparison
**Goal:** Compare query complexities

1. Query: Small region, 1 hour → Note time
2. Query: Large region, 1 hour → Note time
3. Query: Small region, all day → Note time
4. Query: Large region, all day → Note time
5. **Question:** Which is fastest/slowest?

---

## 📞 Getting Help

### Resources

1. **Project Documentation:**
   - README.md - Project overview
   - algorithm_explanation.md - How it works
   - complexity_analysis.md - Performance details

2. **Source Code:**
   - `app.js` - JavaScript logic (well-commented)
   - `index.html` - Page structure
   - `styles.css` - Visual design

3. **Browser Console:**
   - Press F12
   - Check for error messages
   - See console.log output

---

## 🎉 Conclusion

You now know how to:
- ✅ Open and navigate the dashboard
- ✅ Configure spatial and temporal ranges
- ✅ Execute queries and interpret results
- ✅ Use advanced features like wraparound
- ✅ Troubleshoot common issues
- ✅ Analyze spatio-temporal patterns

**Next Steps:**
1. Practice with the example queries
2. Try creating your own query patterns
3. Compare dashboard results with C++ program
4. Explore the source code to understand implementation

**Happy Querying!** 🚀

---

*Last Updated: 2025-12-23*  
*Dashboard Version: 1.0*  
*For DSA Semester 3 Project*
