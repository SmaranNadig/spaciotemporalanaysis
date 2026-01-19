"""
Quick data generator for testing
Creates synthetic event data for the analytics engine
"""

import random
import os

def generate_events(n=5000):
    """Generate synthetic crime events"""
    print(f"🎲 Generating {n} synthetic events...")
    
    events = []
    
    # Hotspots around Chicago
    hotspots = [
        (41.88, -87.63),  # Downtown
        (41.85, -87.65),  # South
        (41.91, -87.67),  # North
    ]
    
    for i in range(n):
        # 70% from hotspots, 30% random
        if random.random() < 0.7:
            hotspot = random.choice(hotspots)
            x = random.gauss(hotspot[0], 0.02)
            y = random.gauss(hotspot[1], 0.02)
        else:
            x = random.uniform(41.75, 41.95)
            y = random.uniform(-87.75, -87.55)
        
        # More events at night
        if random.random() < 0.4:
            # Night (8 PM - 4 AM)
            if random.random() < 0.5:
                time = random.randint(0, 240)  # 12 AM - 4 AM
            else:
                time = random.randint(1200, 1440)  # 8 PM - 12 AM
        else:
            # Day
            time = random.randint(240, 1200)
        
        events.append(f"{x:.6f},{y:.6f},{time},1")
    
    return events

def main():
    print("\n" + "="*60)
    print("  SYNTHETIC DATA GENERATOR")
    print("="*60 + "\n")
    
    # Create directory
    output_dir = "data/processed"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate events
    events = generate_events(5000)
    
    # Save to CSV
    output_file = os.path.join(output_dir, "events.csv")
    with open(output_file, 'w') as f:
        f.write("x,y,time,weight\n")
        for event in events:
            f.write(event + "\n")
    
    print(f"✓ Generated {len(events)} events")
    print(f"📁 Saved to: {output_file}")
    
    # Print statistics
    xs = [float(e.split(',')[0]) for e in events]
    ys = [float(e.split(',')[1]) for e in events]
    ts = [int(e.split(',')[2]) for e in events]
    
    print("\n" + "="*60)
    print("  STATISTICS")
    print("="*60)
    print(f"  Total Events:    {len(events)}")
    print(f"  X Range:         {min(xs):.4f} to {max(xs):.4f}")
    print(f"  Y Range:         {min(ys):.4f} to {max(ys):.4f}")
    print(f"  Time Range:      {min(ts)} to {max(ts)} (minutes)")
    print("="*60 + "\n")
    print("✅ Ready to use with C++ engine!")

if __name__ == "__main__":
    main()
