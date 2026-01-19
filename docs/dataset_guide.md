# Dataset Guide

## Overview

This guide explains how to work with real-world datasets for the Spatio-Temporal Event Analytics Engine.

---

## Supported Datasets

### 1. Chicago Crime Data 🚔

**Source:** [Chicago Data Portal](https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-Present/ijzp-q8t2)

**Description:**  
Reported incidents of crime that occurred in the City of Chicago from 2001 to present.

**Columns Used:**
- `Date` - Timestamp of the incident
- `Latitude` - Latitude coordinate
- `Longitude` - Longitude coordinate
- `Primary Type` - Type of crime (optional)

**Sample Format:**
```csv
ID,Date,Latitude,Longitude,Primary Type
12345678,01/01/2023 11:30:00 PM,41.881832,-87.623177,THEFT
12345679,01/02/2023 02:15:00 AM,41.874116,-87.649908,BATTERY
```

**How to Download:**
1. Visit [Chicago Data Portal](https://data.cityofchicago.org/)
2. Search for "Crimes - 2001 to Present"
3. Export as CSV (limit to recent year for smaller file)
4. Save as `data/chicago_crimes_sample.csv`

**Pro Tip:** Use filters to download only specific years or crime types to reduce file size.

---

### 2. NYC Traffic Accidents 🚗

**Source:** [NYC Open Data](https://data.cityofnewyork.us/)

**Description:**  
Motor vehicle collisions in New York City.

**Columns Used:**
- `CRASH DATE` and `CRASH TIME`
- `LATITUDE`
- `LONGITUDE`
- `NUMBER OF PERSONS INJURED`

**Sample Format:**
```csv
CRASH DATE,CRASH TIME,LATITUDE,LONGITUDE,NUMBER OF PERSONS INJURED
12/31/2023,14:30,40.7589,-73.9851,0
01/01/2024,02:15,40.7128,-74.0060,2
```

---

### 3. Air Quality Data 🌫️

**Source:** [OpenAQ](https://openaq.org/) or local environmental agencies

**Description:**  
Air quality measurements from sensor stations.

**Columns Used:**
- `timestamp` - Time of measurement
- `latitude` - Station latitude
- `longitude` - Station longitude
- `pm25` or `aqi` - Pollution value

**Sample Format:**
```csv
timestamp,latitude,longitude,pm25
2023-12-31T08:00:00Z,41.8781,-87.6298,45.2
2023-12-31T09:00:00Z,41.8781,-87.6298,38.7
```

---

### 4. Custom CSV Data 📊

**You can use any CSV with these minimum columns:**

| Column | Description | Example |
|--------|-------------|---------|
| `x` or `latitude` | X-coordinate | 41.8781 |
| `y` or `longitude` | Y-coordinate | -87.6298 |
| `time` or `timestamp` | Time (any format) | 2023-12-31 14:30:00 |
| `weight` (optional) | Event weight | 1 |

---

## Data Processing

### Using Python Data Loader

The provided `data_loader.py` script handles common formats:

```bash
cd src/python
python data_loader.py
```

**What it does:**
1. Loads CSV file
2. Parses timestamps → minutes (0-1439)
3. Normalizes coordinates (optional)
4. Exports processed data to `data/processed/events.csv`

### Custom Processing

**Example: Converting timestamps**

```python
from datetime import datetime

timestamp = "12/31/2023 11:30:00 PM"
dt = datetime.strptime(timestamp, "%m/%d/%Y %I:%M:%S %p")

# Convert to minute of day (0-1439)
minute = dt.hour * 60 + dt.minute
print(f"Time bucket: {minute}")  # 1410 (11:30 PM)
```

**Example: Normalizing coordinates**

```python
def normalize(val, old_min, old_max, new_min, new_max):
    return ((val - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min

# Chicago coordinates
lat = 41.8781
lon = -87.6298

# Normalize to [0, 100]
x = normalize(lat, 41.75, 41.95, 0, 100)
y = normalize(lon, -87.75, -87.55, 0, 100)
```

---

## Dataset Statistics

### Recommended Sizes

| Use Case | Events | Memory | Query Time |
|----------|--------|--------|------------|
| Testing | 1,000 | ~6 MB | <0.05 ms |
| Demo | 10,000 | ~57 MB | ~0.15 ms |
| Production | 100,000 | ~570 MB | ~0.30 ms |
| Large-scale | 1,000,000 | ~5.7 GB | ~0.50 ms |

### Computing Statistics

```bash
cd src/python
python -c "
import pandas as pd
df = pd.read_csv('../../data/processed/events.csv')
print(f'Total events: {len(df)}')
print(f'X range: {df.x.min():.4f} to {df.x.max():.4f}')
print(f'Y range: {df.y.min():.4f} to {df.y.max():.4f}')
print(f'Time range: {df.time.min()} to {df.time.max()}')
"
```

---

## Data Quality

### Cleaning Steps

**1. Remove Missing Coordinates**
```python
df = df.dropna(subset=['latitude', 'longitude'])
```

**2. Filter Invalid Coordinates**
```python
# For Chicago
df = df[(df.latitude >= 41.6) & (df.latitude <= 42.1)]
df = df[(df.longitude >= -87.9) & (df.longitude <= -87.5)]
```

**3. Handle Time Parsing Errors**
```python
def safe_parse_time(time_str):
    try:
        dt = datetime.strptime(time_str, "%m/%d/%Y %I:%M:%S %p")
        return dt.hour * 60 + dt.minute
    except:
        return None

df['time'] = df['timestamp'].apply(safe_parse_time)
df = df.dropna(subset=['time'])
```

**4. Remove Duplicates**
```python
df = df.drop_duplicates(subset=['latitude', 'longitude', 'timestamp'])
```

---

## Output Format

### Processed Events CSV

**File:** `data/processed/events.csv`

**Format:**
```csv
x,y,time,weight
41.8781,-87.6298,720,1
41.8912,-87.6543,1200,1
41.8654,-87.6123,360,1
```

**Columns:**
- `x` - X-coordinate (latitude or normalized)
- `y` - Y-coordinate (longitude or normalized)
- `time` - Time bucket (0-1439 for minutes)
- `weight` - Event weight (usually 1)

**This file is directly consumed by the C++ engine!**

---

## Example Workflows

### Workflow 1: Chicago Crime

```bash
# 1. Download data
# Visit https://data.cityofchicago.org/ and download crime CSV

# 2. Place in data directory
mv ~/Downloads/Crimes_*.csv data/chicago_crimes_sample.csv

# 3. Process data
cd src/python
python data_loader.py

# 4. Verify output
head ../../data/processed/events.csv

# 5. Run C++ engine
cd ../../build
./spatiotemporal.exe
```

### Workflow 2: Custom Dataset

```python
# custom_loader.py
import pandas as pd

# Load your data
df = pd.read_csv('my_data.csv')

# Map columns
df['x'] = df['my_lat_column']
df['y'] = df['my_lon_column']

# Convert time
from datetime import datetime
df['time'] = df['my_time_column'].apply(lambda t: 
    datetime.strptime(t, '%Y-%m-%d %H:%M:%S').hour * 60 + 
    datetime.strptime(t, '%Y-%m-%d %H:%M:%S').minute
)

# Add weight
df['weight'] = 1

# Save
df[['x', 'y', 'time', 'weight']].to_csv('../../data/processed/events.csv', index=False)
print(f"Processed {len(df)} events")
```

---

## Generating Synthetic Data

For testing without real data:

```python
cd src/python
python data_loader.py  # Will auto-generate if no dataset found
```

**Or manually:**

```python
import numpy as np
import pandas as pd

# Generate 5000 synthetic events
events = []
for i in range(5000):
    x = np.random.uniform(41.75, 41.95)  # Chicago lat range
    y = np.random.uniform(-87.75, -87.55)  # Chicago lon range
    time = np.random.randint(0, 1440)  # Random time of day
    events.append({'x': x, 'y': y, 'time': time, 'weight': 1})

df = pd.DataFrame(events)
df.to_csv('data/processed/events.csv', index=False)
print(f"Generated {len(df)} synthetic events")
```

---

## Troubleshooting

### Issue: "Could not load dataset"

**Solution:**
- Check file path is correct
- Verify CSV has required columns
- Check for encoding issues (use UTF-8)

### Issue: "Time parsing failed"

**Solution:**
- Print first few timestamps to see format
- Update `_parse_time_to_bucket()` in `data_loader.py`
- Add your time format to the `formats` list

### Issue: "Too much memory used"

**Solution:**
- Reduce dataset size (sample subset of rows)
- Use normalized coordinates (smaller range)
- Consider using sparse Fenwick trees (future optimization)

---

## Best Practices

✅ **Start small** - Test with 1,000 events first  
✅ **Validate data** - Check for missing/invalid coordinates  
✅ **Document sources** - Keep track of where data came from  
✅ **Version datasets** - Name files with dates (e.g., `crimes_2023.csv`)  
✅ **Clean data** - Remove duplicates and outliers  

---

## Additional Resources

- [Chicago Data Portal](https://data.cityofchicago.org/)
- [NYC Open Data](https://opendata.cityofnewyork.us/)
- [OpenAQ Air Quality Data](https://openaq.org/)
- [Kaggle Datasets](https://www.kaggle.com/datasets)

---

**Need help with a specific dataset? Check the project README or create an issue!**
