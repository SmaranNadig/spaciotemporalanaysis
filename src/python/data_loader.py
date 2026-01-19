"""
Data Loader for Spatio-Temporal Event Analytics

Loads real-world datasets (crime, pollution, etc.) and converts them
into the format required by the KD-Tree engine.

Supported datasets:
- Chicago Crime Data
- NYC Traffic Accidents
- Custom CSV files
"""

import pandas as pd
import numpy as np
from datetime import datetime
import os

class EventDataLoader:
    def __init__(self):
        self.events = []
        
    def load_chicago_crimes(self, filepath):
        """
        Load Chicago Crime Dataset
        Expected columns: Date, Latitude, Longitude, (optional) Type
        """
        print(f"📂 Loading Chicago Crime Data from {filepath}...")
        
        try:
            df = pd.read_csv(filepath)
            
            # Check required columns
            required_cols = ['Latitude', 'Longitude', 'Date']
            for col in required_cols:
                if col not in df.columns:
                    # Try alternative names
                    alt_names = {
                        'Latitude': ['lat', 'latitude', 'LAT'],
                        'Longitude': ['lon', 'longitude', 'LON', 'lng'],
                        'Date': ['date', 'DATE', 'Timestamp', 'timestamp']
                    }
                    found = False
                    for alt in alt_names.get(col, []):
                        if alt in df.columns:
                            df.rename(columns={alt: col}, inplace=True)
                            found = True
                            break
                    if not found:
                        raise ValueError(f"Required column '{col}' not found")
            
            # Remove rows with missing coordinates
            df = df.dropna(subset=['Latitude', 'Longitude', 'Date'])
            
            # Convert to events
            events = []
            for _, row in df.iterrows():
                x = float(row['Latitude'])
                y = float(row['Longitude'])
                
                # Parse time
                time_bucket = self._parse_time_to_bucket(row['Date'])
                
                events.append({
                    'x': x,
                    'y': y,
                    'time': time_bucket,
                    'weight': 1
                })
            
            self.events = events
            print(f"✓ Loaded {len(events)} crime events")
            return events
            
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return []
    
    def load_generic_csv(self, filepath, x_col='x', y_col='y', time_col='time'):
        """
        Load generic CSV with custom column names
        """
        print(f"📂 Loading data from {filepath}...")
        
        try:
            df = pd.read_csv(filepath)
            
            if x_col not in df.columns or y_col not in df.columns:
                raise ValueError(f"Columns {x_col} or {y_col} not found")
            
            events = []
            for _, row in df.iterrows():
                x = float(row[x_col])
                y = float(row[y_col])
                
                if time_col in df.columns:
                    if isinstance(row[time_col], (int, float)):
                        time_bucket = int(row[time_col])
                    else:
                        time_bucket = self._parse_time_to_bucket(row[time_col])
                else:
                    time_bucket = np.random.randint(0, 1440)  # Random time
                
                events.append({
                    'x': x,
                    'y': y,
                    'time': time_bucket,
                    'weight': 1
                })
            
            self.events = events
            print(f"✓ Loaded {len(events)} events")
            return events
            
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return []
    
    def _parse_time_to_bucket(self, time_str):
        """
        Convert timestamp string to minute bucket (0-1439)
        """
        try:
            # Try multiple date formats
            formats = [
                '%m/%d/%Y %I:%M:%S %p',  # 12/31/2023 11:59:59 PM
                '%Y-%m-%d %H:%M:%S',      # 2023-12-31 23:59:59
                '%m/%d/%Y %H:%M',         # 12/31/2023 23:59
                '%Y-%m-%d',               # 2023-12-31
            ]
            
            dt = None
            for fmt in formats:
                try:
                    dt = datetime.strptime(str(time_str), fmt)
                    break
                except:
                    continue
            
            if dt is None:
                # If all parsing fails, return random time
                return np.random.randint(0, 1440)
            
            # Convert to minute of day (0-1439)
            return dt.hour * 60 + dt.minute
            
        except:
            return np.random.randint(0, 1440)
    
    def normalize_coordinates(self, target_range=(0, 100)):
        """
        Normalize coordinates to a specific range
        Useful for visualization
        """
        if not self.events:
            return
        
        xs = [e['x'] for e in self.events]
        ys = [e['y'] for e in self.events]
        
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        
        for event in self.events:
            event['x'] = self._normalize(event['x'], min_x, max_x, *target_range)
            event['y'] = self._normalize(event['y'], min_y, max_y, *target_range)
        
        print(f"✓ Normalized coordinates to range {target_range}")
    
    def _normalize(self, val, old_min, old_max, new_min, new_max):
        """Normalize value from old range to new range"""
        if old_max == old_min:
            return (new_min + new_max) / 2
        return ((val - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min
    
    def save_processed(self, output_path):
        """
        Save processed events to CSV
        Format: x,y,time,weight
        """
        if not self.events:
            print("❌ No events to save")
            return
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        df = pd.DataFrame(self.events)
        df.to_csv(output_path, index=False)
        print(f"✓ Saved {len(self.events)} events to {output_path}")
    
    def generate_sample_data(self, n_events=1000, 
                            lat_range=(41.75, 41.95),
                            lon_range=(-87.75, -87.55)):
        """
        Generate synthetic sample data for testing
        Simulates crime events in Chicago
        """
        print(f"🎲 Generating {n_events} synthetic events...")
        
        events = []
        
        # Create some hotspots
        hotspots = [
            (41.88, -87.63),  # Downtown
            (41.85, -87.65),  # South Loop
            (41.91, -87.67),  # North Side
        ]
        
        for i in range(n_events):
            # 70% from hotspots, 30% random
            if np.random.random() < 0.7:
                hotspot = hotspots[np.random.randint(0, len(hotspots))]
                x = np.random.normal(hotspot[0], 0.02)
                y = np.random.normal(hotspot[1], 0.02)
            else:
                x = np.random.uniform(*lat_range)
                y = np.random.uniform(*lon_range)
            
            # Time: More crime at night
            if np.random.random() < 0.4:
                # Night time (8 PM - 4 AM)
                time_bucket = np.random.randint(1200, 1440) if np.random.random() < 0.5 else np.random.randint(0, 240)
            else:
                # Day time
                time_bucket = np.random.randint(240, 1200)
            
            events.append({
                'x': x,
                'y': y,
                'time': time_bucket,
                'weight': 1
            })
        
        self.events = events
        print(f"✓ Generated {len(events)} synthetic events")
        return events

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("  SPATIO-TEMPORAL DATA PROCESSOR")
    print("="*60 + "\n")
    
    loader = EventDataLoader()
    
    # Try to load real Chicago crime data
    data_path = "../../data/chicago_crimes_sample.csv"
    
    if os.path.exists(data_path):
        loader.load_chicago_crimes(data_path)
    else:
        print(f"⚠️  Sample dataset not found at {data_path}")
        print("📊 Generating synthetic data instead...\n")
        loader.generate_sample_data(n_events=5000)
    
    # Save processed data
    output_path = "../../data/processed/events.csv"
    loader.save_processed(output_path)
    
    # Print statistics
    if loader.events:
        xs = [e['x'] for e in loader.events]
        ys = [e['y'] for e in loader.events]
        ts = [e['time'] for e in loader.events]
        
        print("\n" + "="*60)
        print("  DATASET STATISTICS")
        print("="*60)
        print(f"  Total Events:    {len(loader.events)}")
        print(f"  X Range:         {min(xs):.4f} to {max(xs):.4f}")
        print(f"  Y Range:         {min(ys):.4f} to {max(ys):.4f}")
        print(f"  Time Range:      {min(ts)} to {max(ts)} (minutes)")
        print("="*60 + "\n")
        
        print("✅ Data processing complete!")
        print(f"📁 Output location: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    main()
