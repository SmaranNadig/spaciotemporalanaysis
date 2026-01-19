"""
Enhanced Real Chicago Crime Data Processor with Crime Type Support
Includes Primary Type from the Chicago crime dataset
"""

import csv
import os
from datetime import datetime
import sys
import json

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

def normalize_crime_type(crime_type):
    """Normalize crime type to a standard format"""
    if not crime_type:
        return "OTHER"
    
    crime_type = crime_type.strip().upper()
    
    # Mapping variations to standard types
    mappings = {
        'THEFT': ['THEFT', 'ROBBERY', 'BURGLARY', 'LARCENY', 'PICKPOCKET', 'PURSE SNATCHING'],
        'ASSAULT': ['ASSAULT', 'BATTERY', 'AGGRAVATED ASSAULT', 'AGGRAVATED BATTERY'],
        'NARCOTICS': ['NARCOTICS', 'DRUG', 'CONTROLLED SUBSTANCE'],
        'MOTOR VEHICLE THEFT': ['MOTOR VEHICLE THEFT', 'VEHICULAR HIJACKING'],
        'VANDALISM': ['VANDALISM', 'CRIMINAL DAMAGE', 'CRIMINAL TRESPASS'],
        'WEAPONS': ['WEAPONS VIOLATION', 'CONCEALED CARRY LICENSE VIOLATION'],
        'FRAUD': ['DECEPTIVE PRACTICE', 'FRAUD', 'FORGERY', 'IDENTITY THEFT'],
    }
    
    # Check if crime_type matches any of the variations
    for standard, variations in mappings.items():
        if any(var in crime_type for var in variations):
            return standard
    
    return crime_type

# Crime type similarity matrix
CRIME_SIMILARITY = {
    'THEFT': ['ROBBERY', 'BURGLARY', 'MOTOR VEHICLE THEFT', 'FRAUD'],
    'ROBBERY': ['THEFT', 'BURGLARY', 'ASSAULT'],
    'BURGLARY': ['THEFT', 'ROBBERY', 'MOTOR VEHICLE THEFT', 'CRIMINAL TRESPASS'],
    'ASSAULT': ['BATTERY', 'ROBBERY', 'WEAPONS'],
    'BATTERY': ['ASSAULT', 'HOMICIDE'],
    'NARCOTICS': ['OTHER NARCOTIC VIOLATION'],
    'MOTOR VEHICLE THEFT': ['THEFT', 'BURGLARY'],
    'VANDALISM': ['CRIMINAL DAMAGE', 'CRIMINAL TRESPASS'],
    'FRAUD': ['THEFT', 'IDENTITY THEFT', 'DECEPTIVE PRACTICE'],
    'WEAPONS': ['ASSAULT', 'HOMICIDE'],
}

def process_real_crime_data_with_types(input_file, output_csv, output_json, max_events=10000):
    """
    Process real Chicago crime CSV with crime type information
    
    Args:
        input_file: Path to raw crime CSV
        output_csv: Path to save processed events.csv
        output_json: Path to save TypeScript data file
        max_events: Maximum number of events to process
    """
    
    print(f"\n{'='*60}")
    print(f"  PROCESSING REAL CHICAGO CRIME DATA WITH TYPES")
    print(f"{'='*60}\n")
    
    print(f"📂 Input: {input_file}")
    print(f"📁 Output CSV: {output_csv}")
    print(f"📁 Output TS: {output_json}")
    print(f"🔢 Max events: {max_events:,}\n")
    
    events = []
    skipped = 0
    crime_type_counts = {}
    
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
                    
                    # Extract crime type
                    primary_type = row.get('Primary Type', row.get('PRIMARY TYPE', 'OTHER')).strip()
                    crime_type = normalize_crime_type(primary_type)
                    
                    # Count crime types
                    crime_type_counts[crime_type] = crime_type_counts.get(crime_type, 0) + 1
                    
                    # Extract description
                    description = row.get('Description', row.get('DESCRIPTION', '')).strip()
                    
                    # Add event
                    events.append({
                        'x': x,
                        'y': y,
                        'time': time_bucket,
                        'weight': 1,
                        'type': crime_type,
                        'description': description[:100] if description else crime_type  # Limit description length
                    })
                    
                except (ValueError, KeyError) as e:
                    skipped += 1
                    continue
        
        print(f"\n✓ Processing complete!")
        print(f"  Total rows processed: {i + 1:,}")
        print(f"  Valid events: {len(events):,}")
        print(f"  Skipped (missing data): {skipped:,}")
        print(f"  Unique crime types: {len(crime_type_counts)}")
        
        if len(events) == 0:
            print("\n❌ ERROR: No valid events found!")
            print("   Check that the CSV has required columns")
            return False
        
        # Save to CSV file
        print(f"\n💾 Saving to {output_csv}...")
        
        os.makedirs(os.path.dirname(output_csv), exist_ok=True)
        
        with open(output_csv, 'w', newline='', encoding='utf-8') as f:
            f.write('x,y,time,weight,type,description\n')
            for event in events:
                f.write(f"{event['x']:.6f},{event['y']:.6f},{event['time']},{event['weight']},\"{event['type']}\",\"{event['description']}\"\n")
        
        print(f"✓ Saved CSV with {len(events):,} events")
        
        # Save to TypeScript file for React app
        print(f"\n💾 Saving to {output_json}...")
        
        os.makedirs(os.path.dirname(output_json), exist_ok=True)
        
        with open(output_json, 'w', encoding='utf-8') as f:
            f.write("import { Event } from '../types';\n\n")
            f.write("export const realCrimeData: Event[] = [\n")
            for i, event in enumerate(events):
                comma = "," if i < len(events) - 1 else ""
                f.write(f"  {{\n")
                f.write(f'    "x": {event["x"]},\n')
                f.write(f'    "y": {event["y"]},\n')
                f.write(f'    "time": {event["time"]},\n')
                f.write(f'    "weight": {event["weight"]},\n')
                f.write(f'    "type": "{event["type"]}",\n')
                f.write(f'    "description": "{event["description"]}"\n')
                f.write(f"  }}{comma}\n")
            f.write("];\n")
        
        print(f"✓ Saved TypeScript with {len(events):,} events")
        
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
        
        # Show crime type breakdown
        print("📊 Crime Type Breakdown (Top 10):")
        sorted_types = sorted(crime_type_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        for crime_type, count in sorted_types:
            percentage = (count / len(events)) * 100
            print(f"  {crime_type:30s} {count:5d} ({percentage:5.1f}%)")
        
        print(f"\n✅ SUCCESS! Enhanced crime data ready to use!")
        print(f"📁 CSV Output: {os.path.abspath(output_csv)}")
        print(f"📁 TS Output: {os.path.abspath(output_json)}\n")
        
        # Save crime similarity data
        similarity_file = os.path.join(os.path.dirname(output_json), 'crimeSimilarity.ts')
        with open(similarity_file, 'w', encoding='utf-8') as f:
            f.write("// Crime type similarity mappings\n")
            f.write("export const crimeSimilarity: Record<string, string[]> = ")
            f.write(json.dumps(CRIME_SIMILARITY, indent=2))
            f.write(";\n")
        
        print(f"📁 Similarity matrix: {similarity_file}\n")
        
        return True
        
    except FileNotFoundError:
        print(f"\n❌ ERROR: File not found: {input_file}")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Configuration
    input_file = "Crimes_-_2001_to_Present_20251223.csv"
    output_csv = "data/processed/events_with_types.csv"
    output_json = "next-level-design-main/src/data/realCrimeData.ts"
    max_events = 10000  # Process first 10,000 events
    
    # Allow command line override
    if len(sys.argv) > 1:
        max_events = int(sys.argv[1])
    
    # Process the data
    success = process_real_crime_data_with_types(input_file, output_csv, output_json, max_events)
    
    if success:
        print("🎯 Next steps:")
        print("  1. Update Event type in next-level-design-main/src/types/index.ts")
        print("  2. Add CrimeSearch component to Dashboard")
        print("  3. Run: cd next-level-design-main && npm run dev")
    else:
        print("\n⚠️  Processing failed.")
