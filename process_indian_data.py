#!/usr/bin/env python3
"""
Process Indian Crime Dataset and convert to TypeScript format.
Maps city names to coordinates and formats data for the dashboard.
"""

import csv
import json
import random
from datetime import datetime

# City coordinates mapping (latitude, longitude)
CITY_COORDINATES = {
    'Delhi': (28.6139, 77.2090),
    'Mumbai': (19.0760, 72.8777),
    'Bangalore': (12.9716, 77.5946),
    'Chennai': (13.0827, 80.2707),
    'Kolkata': (22.5726, 88.3639),
    'Hyderabad': (17.3850, 78.4867),
    'Pune': (18.5204, 73.8567),
    'Ahmedabad': (23.0225, 72.5714),
    'Jaipur': (26.9124, 75.7873),
    'Lucknow': (26.8467, 80.9462),
    'Kanpur': (26.4499, 80.3319),
    'Nagpur': (21.1458, 79.0882),
    'Indore': (22.7196, 75.8577),
    'Thane': (19.2183, 72.9781),
    'Bhopal': (23.2599, 77.4126),
    'Visakhapatnam': (17.6868, 83.2185),
    'Patna': (25.5941, 85.1376),
    'Vadodara': (22.3072, 73.1812),
    'Ghaziabad': (28.6692, 77.4538),
    'Ludhiana': (30.9010, 75.8573),
    'Agra': (27.1767, 78.0081),
    'Nashik': (19.9975, 73.7898),
    'Faridabad': (28.4089, 77.3178),
    'Meerut': (28.9845, 77.7064),
    'Rajkot': (22.3039, 70.8022),
    'Kalyan': (19.2437, 73.1355),
    'Vasai': (19.3919, 72.8397),
    'Varanasi': (25.3176, 82.9739),
    'Srinagar': (34.0837, 74.7973),
    'Aurangabad': (19.8762, 75.3433),
    'Dhanbad': (23.7957, 86.4304),
    'Amritsar': (31.6340, 74.8723),
    'Allahabad': (25.4358, 81.8463),
    'Ranchi': (23.3441, 85.3096),
    'Howrah': (22.5958, 88.2636),
    'Coimbatore': (11.0168, 76.9558),
    'Jabalpur': (23.1815, 79.9864),
    'Gwalior': (26.2183, 78.1828),
    'Vijayawada': (16.5062, 80.6480),
    'Jodhpur': (26.2389, 73.0243),
    'Madurai': (9.9252, 78.1198),
    'Raipur': (21.2514, 81.6296),
    'Kota': (25.2138, 75.8648),
    'Chandigarh': (30.7333, 76.7794),
    'Guwahati': (26.1445, 91.7362),
    'Solapur': (17.6599, 75.9064),
    'Hubli': (15.3647, 75.1240),
    'Tiruchirappalli': (10.7905, 78.7047),
    'Bareilly': (28.3670, 79.4304),
    'Moradabad': (28.8389, 78.7768),
    'Mysore': (12.2958, 76.6394),
    'Surat': (21.1702, 72.8311),
}

def parse_time(time_str):
    """Extract time in minutes from datetime string"""
    try:
        dt = datetime.strptime(time_str, '%d-%m-%Y %H:%M')
        return dt.hour * 60 + dt.minute
    except:
        return random.randint(0, 1439)

def generate_random_coords(city_name):
    """
    Generate coordinates for a city within ~10km radius.
    1 degree latitude ~= 111km
    10km ~= 0.09 degrees
    """
    if city_name in CITY_COORDINATES:
        base_lat, base_lon = CITY_COORDINATES[city_name]
        # Random spread approximately 10km (0.09 degrees)
        lat = base_lat + random.uniform(-0.09, 0.09)
        lon = base_lon + random.uniform(-0.09, 0.09)
        return round(lat, 6), round(lon, 6)
    else:
        # Fallback for unknown cities (center of India)
        return round(20.5937 + random.uniform(-2, 2), 6), round(78.9629 + random.uniform(-2, 2), 6)

def process_csv(input_file, output_file, max_records=None):
    """
    1. Update CSV with Latitude and Longitude columns.
    2. Convert to TypeScript data format.
    """
    
    events = []
    updated_rows = []
    fieldnames = []
    
    # READ and MODIFY data
    print("Reading and updating CSV with coordinates (10km radius)...")
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        if 'Latitude' not in fieldnames:
            fieldnames.extend(['Latitude', 'Longitude'])
            
        all_rows = list(reader)
        
        for i, row in enumerate(all_rows):
            if max_records and len(events) >= max_records:
                break
            
            try:
                city = row.get('City', '').strip()
                
                # Check if we already have coords in row, else generate
                if 'Latitude' in row and row['Latitude'] and 'Longitude' in row and row['Longitude']:
                    lat = float(row['Latitude'])
                    lon = float(row['Longitude'])
                else:
                    lat, lon = generate_random_coords(city)
                    row['Latitude'] = lat
                    row['Longitude'] = lon
                
                updated_rows.append(row)
                
                # Process for TS file
                time_minutes = parse_time(row.get('Time of Occurrence', ''))
                case_closed = row.get('Case Closed', '').strip().lower() == 'yes'
                crime_type = row.get('Crime Description', '').strip().upper()
                
                event = {
                    'x': lat,
                    'y': lon,
                    'time': time_minutes,
                    'weight': 1,
                    'type': crime_type,
                    'description': row.get('Crime Domain', ''),
                    'caseClosed': case_closed,
                    'city': city
                }
                
                events.append(event)
            except Exception as e:
                # Keep row even if error processing for TS, but maybe skip event
                updated_rows.append(row)
                continue

    # WRITE UPDATED CSV back to file
    print(f"Updating source CSV file: {input_file}")
    with open(input_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(updated_rows)

    # GENERATE TYPESCRIPT FILE
    city_count = len(set(e['city'] for e in events))
    json_data = json.dumps(events, indent=2)
    
    ts_content = f"""import {{ Event }} from '../types';

// Indian Crime Dataset - Generated from crime_dataset_india.csv
// Total Events: {len(events)}
// Cities: {city_count}

export const indianCrimeData: Event[] = {json_data};
"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print(f"✅ Processed {len(events)} events")
    print(f"📍 Cities found: {city_count}")
    print(f"📁 Source CSV updated with Latitude/Longitude")
    print(f"📁 Output TS written to: {output_file}")
    
    return len(events)

if __name__ == '__main__':
    import os
    
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(script_dir, 'data', 'processed', 'crime_dataset_india.csv')
    output_file = os.path.join(script_dir, 'next-level-design-main', 'src', 'data', 'indianCrimeData.ts')
    
    # Process all records
    count = process_csv(input_file, output_file, max_records=None)
    
    print(f"\\n🎉 Done! Updated CSV and generated indianCrimeData.ts with {count} events")
