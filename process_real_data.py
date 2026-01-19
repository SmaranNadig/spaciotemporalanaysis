"""
Real Chicago Crime Data Processor
Processes the actual Chicago crime dataset for the analytics engine
"""

import csv
import os
from datetime import datetime
import sys

def parse_date_to_minutes(date_str):
    """Convert various date formats to minutes of day (0-1439)"""
    if not date_str or date_str.strip() == '':
        return None
    
    # Try different formats
    formats = [
        '%m/%d/%Y %I:%M:%S %p',  # 12/15/2024 11:30:00 PM
        '%m/%d/%Y %H:%M:%S',      # 12/15/2024 23:30:00
        '%Y-%m-%d %H:%M:%S',      # 2024-12-15 23:30:00
        '%m/%d/%Y %H:%M',         # 12/15/2024 23:30
        '%m/%d/%Y',               # 12/15/2024 (assume noon)
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            # Convert to minute of day (0-1439)
            return dt.hour * 60 + dt.minute
        except ValueError:
            continue
    
    # If all parsing fails, return None
    return None

def process_real_crime_data(input_file, output_file, max_events=10000):
    """
    Process real Chicago crime CSV
    
    Args:
        input_file: Path to raw crime CSV
        output_file: Path to save processed events.csv
        max_events: Maximum number of events to process (for performance)
    """
    
    print(f"\n{'='*60}")
    print(f"  PROCESSING REAL CHICAGO CRIME DATA")
    print(f"{'='*60}\n")
    
    print(f"📂 Input: {input_file}")
    print(f"📁 Output: {output_file}")
    print(f"🔢 Max events: {max_events:,}\n")
    
    events = []
    skipped = 0
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            print("🔄 Processing rows...")
            
            for i, row in enumerate(reader):
                if i >= max_events:
                    print(f"✓ Reached max limit of {max_events:,} events")
                    break
                
                # Progress indicator
                if (i + 1) % 1000 == 0:
                    print(f"  Processed {i+1:,} rows... (kept {len(events):,}, skipped {skipped:,})")
                
                try:
                    # Extract coordinates
                    lat = row.get('Latitude', '').strip()
                    lon = row.get('Longitude', '').strip()
                    
                    if not lat or not lon or lat == '' or lon == '':
                        skipped += 1
                        continue
                    
                    x = float(lat)
                    y = float(lon)
                    
                    # Validate Chicago area (rough bounds)
                    if not (41.6 <= x <= 42.1 and -87.95 <= y <= -87.5):
                        skipped += 1
                        continue
                    
                    # Extract and parse date
                    date_str = row.get('Date', '').strip()
                    time_bucket = parse_date_to_minutes(date_str)
                    
                    if time_bucket is None:
                        skipped += 1
                        continue
                    
                    # Add event
                    events.append({
                        'x': x,
                        'y': y,
                        'time': time_bucket,
                        'weight': 1
                    })
                    
                except (ValueError, KeyError) as e:
                    skipped += 1
                    continue
        
        print(f"\n✓ Processing complete!")
        print(f"  Total rows processed: {i + 1:,}")
        print(f"  Valid events: {len(events):,}")
        print(f"  Skipped (missing data): {skipped:,}")
        
        if len(events) == 0:
            print("\n❌ ERROR: No valid events found!")
            print("   Check that the CSV has 'Latitude', 'Longitude', and 'Date' columns")
            return False
        
        # Save to output file
        print(f"\n💾 Saving to {output_file}...")
        
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w', newline='') as f:
            f.write('x,y,time,weight\n')
            for event in events:
                f.write(f"{event['x']:.6f},{event['y']:.6f},{event['time']},{event['weight']}\n")
        
        print(f"✓ Saved {len(events):,} events")
        
        # Print statistics
        print(f"\n{'='*60}")
        print(f"  DATASET STATISTICS")
        print(f"{'='*60}")
        
        xs = [e['x'] for e in events]
        ys = [e['y'] for e in events]
        ts = [e['time'] for e in events]
        
        print(f"  Total Events:     {len(events):,}")
        print(f"  Latitude Range:   {min(xs):.4f} to {max(xs):.4f}")
        print(f"  Longitude Range:  {min(ys):.4f} to {max(ys):.4f}")
        print(f"  Time Range:       {min(ts)} to {max(ts)} minutes")
        print(f"  Data Source:      REAL Chicago Crime Data")
        print(f"{'='*60}\n")
        
        # Show sample
        print("📊 Sample events (first 5):")
        for i, event in enumerate(events[:5], 1):
            hours = event['time'] // 60
            mins = event['time'] % 60
            print(f"  {i}. ({event['x']:.4f}, {event['y']:.4f}) at {hours:02d}:{mins:02d}")
        
        print(f"\n✅ SUCCESS! Real crime data ready to use!")
        print(f"📁 Output: {os.path.abspath(output_file)}\n")
        
        return True
        
    except FileNotFoundError:
        print(f"\n❌ ERROR: File not found: {input_file}")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {e}")
        return False

if __name__ == "__main__":
    # Configuration
    input_file = "Crimes_-_2001_to_Present_20251223.csv"
    output_file = "data/processed/events.csv"
    max_events = 10000  # Process first 10,000 events
    
    # Allow command line override
    if len(sys.argv) > 1:
        max_events = int(sys.argv[1])
    
    # Process the data
    success = process_real_crime_data(input_file, output_file, max_events)
    
    if success:
        print("🎯 Next steps:")
        print("  1. Run C++ program: cd src/cpp && ./test.exe")
        print("  2. Or use with web dashboard (refresh browser)")
    else:
        print("\n⚠️  Processing failed. Using synthetic data as fallback:")
        print("     python generate_data.py")
