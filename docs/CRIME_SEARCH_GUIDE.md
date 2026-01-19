# 🔍 Crime Type Search Feature

## Overview

The Crime Type Search feature enables intelligent searching and filtering of crimes by type within your selected spatial and temporal boundaries. It uses similarity matching to find related crime types automatically.

---

## ✨ Features

### 1. **Smart Search**
- Type any crime keyword (e.g., "THEFT", "ASSAULT", "NARCOTICS")
- Real-time filtering as you type
- Press `Enter` or click "Search" to execute

### 2. **Similarity Matching**
When enabled, searching for one crime type automatically includes related types:

| Search Term | Also Finds |
|-------------|------------|
| **THEFT** | Robbery, Burglary, Motor Vehicle Theft, Fraud |
| **ASSAULT** | Battery, Robbery, Weapons Violations |
| **NARCOTICS** | Drug Violations, Controlled Substance |
| **ROBBERY** | Theft, Burglary, Assault |
| **VANDALISM** | Criminal Damage, Criminal Trespass |
| **FRAUD** | Theft, Identity Theft, Deceptive Practice |

### 3. **Region-Aware Filtering**
- Only shows crimes within your **current spatial bounds** (the purple rectangle on the map)
- Automatically updates when you change the map region

### 4. **Time-Aware Filtering**
- Only shows crimes within your **current temporal range** (selected time window)
- Automatically updates when you adjust start/end time

### 5. **Visual Indicators**
- **Pulsing Amber Markers** on map = Search results
- **Cyan Dots** = All events
- **Red Circles** = Hotspots

---

## 🎯 How to Use

### Step 1: Set Your Region
1. **Drag on the map** to select a spatial area, OR
2. **Manually enter** coordinates in Query Controls

### Step 2: Set Your Time Range
1. Use the **time sliders** in Query Controls
2. Or click a **Quick Range** button (Night, Morning, etc.)

### Step 3: Search for Crime Type
1. Type a crime type in the **Crime Type Search** box
2. Enable/disable **"Include similar crime types"** checkbox
3. Click **Search** or press `Enter`

### Step 4: View Results
- **Map**: Pulsing amber markers show matching crimes
- **Results List**: Scrollable list with details:
  - Crime type badge
  - Description
  - Exact location (lat, lon)
  - Time of occurrence

---

## 🚀 Quick Search Examples

### Example 1: Find All Thefts in Downtown (Evening)
```
1. Drag-select downtown area on map
2. Click "Evening" (6 PM - 12 AM) preset
3. Type "THEFT" in search box
4. Click Search
5. View amber markers on map + detailed results below
```

### Example 2: Find Violent Crimes in North Side (24 Hours)
```
1. Select North Side region
2. Keep default 24-hour time range
3. Type "ASSAULT" with similarity matching ON
4. Click Search
5. Results include ASSAULT, BATTERY, WEAPONS
```

### Example 3: Find Drug-Related Crimes (Night Only)
```
1. Select any region
2. Click "Night" (12 AM - 6 AM) preset
3. Type "NARCOTICS"
4. View night-time drug crimes
```

---

## 🔧 Technical Details

### Data Processing
To enable this feature with your real Chicago crime data:

1. **Run the enhanced processor**:
```bash
python process_crime_with_types.py
```

This will:
- Extract `Primary Type` from the CSV
- Normalize crime types (e.g., "THEFT", "ASSAULT")
- Add `description` field
- Generate `realCrimeData.ts` with crime types
- Create `crimeSimilarity.ts` mapping

2. **Expected CSV Columns**:
- `Latitude` - Event latitude
- `Longitude` - Event longitude
- `Date` - Event timestamp
- `Primary Type` - Crime type (e.g., "THEFT")
- `Description` - Crime description (optional)

### Crime Type Normalization
The system normalizes variations automatically:

| Raw Data | Normalized To |
|----------|---------------|
| "THEFT", "ROBBERY", "BURGLARY" | `THEFT` |
| "ASSAULT", "BATTERY", "AGGRAVATED ASSAULT" | `ASSAULT` |
| "NARCOTICS", "DRUG VIOLATION" | `NARCOTICS` |
| "MOTOR VEHICLE THEFT", "VEHICULAR HIJACKING" | `MOTOR VEHICLE THEFT` |
| "VANDALISM", "CRIMINAL DAMAGE" | `VANDALISM` |

---

## 📊 Available Crime Types

### Common Types in Chicago Dataset:
- **THEFT** - Larceny, pickpocketing, property theft
- **BATTERY** - Physical harm to person
- **ASSAULT** - Threat or attempt to cause harm  
- **ROBBERY** - Theft using force or threat
- **BURGLARY** - Unlawful entry with intent to commit crime
- **NARCOTICS** - Drug-related offenses
- **MOTOR VEHICLE THEFT** - Car theft, hijacking
- **VANDALISM** - Property damage
- **WEAPONS VIOLATION** - Illegal possession/use
- **FRAUD** - Deceptive practices, identity theft
- **HOMICIDE** - Murder, manslaughter
- **CRIMINAL TRESPASS** - Unlawful presence on property

---

## 🎨 Visual Legend

| Color | Meaning |
|-------|---------|
| **Cyan dots** ● | All crime events in dataset |
| **Amber pulsing circles** 🟡 | Your search results (matching crimes) |
| **Red circles** 🔴 | High-density hotspots |
| **Purple rectangle** 🟣 | Your selected spatial region |

---

## 💡 Pro Tips

1. **Use Similarity Matching** for broader results (e.g., "THEFT" → includes robbery, burglary)
2. **Disable Similarity** for exact matches only
3. **Combine with temporal presets** for quick time-based analysis
4. **Drag-select on map** for precise spatial filtering
5. **Results auto-update** when you change region/time
6. **Click Quick Search buttons** for instant common searches

---

## 🐛 Troubleshooting

### "No matching crimes found"
**Possible Causes:**
- Crime type doesn't exist in the selected region/time
- Spelling doesn't match (try "THEFT" not "theft")
- Region is too small or time window too narrow

**Solutions:**
- ✅ Expand spatial region (drag larger area)
- ✅ Expand time range (full 24 hours)
- ✅ Try similar crime types (enable similarity matching)
- ✅ Use Quick Search buttons for verified terms

### "Search results not showing on map"
**Check:**
- ✅ Are search results visible in the list below?
- ✅ Are the results within your current map bounds?
- ✅ Try zooming out on the map

---

## 🔮 Future Enhancements

### Coming Soon:
- [ ] **Multi-type search** (search for "THEFT OR ASSAULT")
- [ ] **Severity filtering** (high/medium/low priority)
- [ ] **Date range picker** (specific date ranges beyond 24 hours)
- [ ] **Export search results** to CSV/PDF
- [ ] **Save searches** (bookmark frequent queries)
- [ ] **Crime prediction** (ML-based forecasting)
- [ ] **Arrest rate filter** (show only cases with/without arrests)

---

## 📝 Notes

- Search is **case-insensitive** (THEFT = theft = Theft)
- Results are **limited to 20** in the list (performance)
- Map shows **all matching results** with amber markers
- Search uses your **current KD-Tree algorithm** for spatial filtering
- Temporal filtering is **O(1)** comparison per event

---

## 📞 Support

For issues or feature requests:
1. Check the troubleshooting section above
2. Review the example workflows
3. Ensure data processor was run with `Primary Type` column

---

**Happy Crime Hunting! 🔍🚔**
