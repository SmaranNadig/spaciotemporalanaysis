"""
Convert events.csv to JavaScript data file for web dashboard
"""

import csv
import json

def convert_csv_to_js(csv_file, js_file, max_events=2000):
    """
    Convert CSV to JavaScript array for web dashboard
    
    Args:
        csv_file: Path to events.csv
        js_file: Path to output .js file
        max_events: Limit for browser performance (2000 recommended)
    """
    
    print(f"\n🔄 Converting CSV to JavaScript...")
    print(f"📂 Input: {csv_file}")
    print(f"📁 Output: {js_file}")
    print(f"🔢 Max events: {max_events:,}\n")
    
    events = []
    
    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if i >= max_events:
                break
            
            events.append({
                'x': float(row['x']),
                'y': float(row['y']),
                'time': int(row['time']),
                'weight': int(row['weight'])
            })
    
    print(f"✓ Loaded {len(events):,} events")
    
    # Write as JavaScript file
    with open(js_file, 'w') as f:
        f.write('// Real Chicago Crime Data - Auto-generated\n')
        f.write('// Source: Chicago Police Department Open Data Portal\n')
        f.write(f'// Total Events: {len(events):,}\n\n')
        f.write('const realCrimeData = ')
        f.write(json.dumps(events, indent=2))
        f.write(';\n')
    
    print(f"✓ Saved to {js_file}")
    print(f"\n✅ Ready to use in web dashboard!\n")

if __name__ == "__main__":
    convert_csv_to_js(
        csv_file="data/processed/events.csv",
        js_file="src/web/realdata.js",
        max_events=10000  # Use all real data (was 2000 for performance)
    )
