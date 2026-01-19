"""
Quick script to add sample crime types to existing realCrimeData.ts
This will randomly assign crime types to make the search feature work
"""

import random
import re

# Crime types to randomly assign
CRIME_TYPES = [
    ("THEFT", "Retail Theft"),
    ("THEFT", "Theft from Building"),
    ("ASSAULT", "Simple Assault"),
    ("ASSAULT", "Aggravated Assault"),
    ("BATTERY", "Domestic Battery"),
    ("BATTERY", "Simple Battery"),
    ("ROBBERY", "Armed Robbery"),
    ("ROBBERY", "Street Robbery"),
    ("BURGLARY", "Residential Burglary"),
    ("BURGLARY", "Commercial Burglary"),
    ("NARCOTICS", "Possession of Narcotics"),
    ("NARCOTICS", "Drug Distribution"),
    ("MOTOR VEHICLE THEFT", "Auto Theft"),
    ("VANDALISM", "Criminal Damage to Property"),
    ("WEAPONS", "Unlawful Use of Weapon"),
    ("FRAUD", "Deceptive Practice"),
]

def add_crime_types_to_file(input_file, output_file):
    """Add random crime types to the data"""
    print(f"Reading {input_file}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("Adding crime types...")
    
    # Find all event objects
    # Pattern: { "x": number, "y": number, "time": number, "weight": number }
    pattern = r'(\{[^}]*"weight":\s*\d+\s*)\}'
    
    def replace_event(match):
        event_content = match.group(1)
        # Add random crime type
        crime_type, description = random.choice(CRIME_TYPES)
        new_content = f'{event_content},\n    "type": "{crime_type}",\n    "description": "{description}"\n  }}'
        return new_content
    
    # Replace all events
    modified_content = re.sub(pattern, replace_event, content)
    
    print(f"Writing to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(modified_content)
    
    print(f"✅ Done! Added crime types to all events")
    print(f"📁 Output: {output_file}")
    print("\n🎯 Now restart your dev server:")
    print("   1. Press Ctrl+C in the terminal")
    print("   2. Run: npm run dev")
    print("   3. Refresh browser and try searching!")

if __name__ == "__main__":
    input_file = "next-level-design-main/src/data/realCrimeData.ts"
    output_file = "next-level-design-main/src/data/realCrimeData.ts"
    
    add_crime_types_to_file(input_file, output_file)
