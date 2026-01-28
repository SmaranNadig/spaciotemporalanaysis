# 🌍 Spatio-Temporal Event Analytics Engine

**A Practical DSA Project using KD-Tree + Fenwick Tree for Real-World Location-Based Datasets**

---

## 📋 Overview

This project implements an efficient query engine for spatio-temporal data using:
- **K-D Tree** → Fast spatial filtering (x, y coordinates)
- **Fenwick Tree** → Fast temporal filtering (time ranges)

### Real-World Applications
- 🚔 Crime hotspot detection
- 🌫️ Air quality monitoring
- 🚗 Traffic accident analysis
- 📡 Public Wi-Fi usage patterns

---

## 🎯 Problem Statement

Many real-world applications generate events at specific locations `(x, y)` and times `(t)`. 
We need to efficiently answer queries like:

> **"How many events occurred in this rectangular region during this time window?"**

**Example Queries:**
- "How many crimes happened in downtown Chicago between 10 PM and 2 AM?"
- "What's the total pollution measured in this area during rush hour?"
- "How many accidents occurred near this highway exit last week?"

---

## 🏗️ Architecture

### Data Structure Combination

```
KD-Tree (Spatial Index)
├── Each node represents a spatial region
├── Each node contains a Fenwick Tree for temporal queries
└── Enables fast pruning of irrelevant spatial regions

Fenwick Tree (Temporal Index)
├── Supports O(log T) range sum queries
├── Stores event counts per time bucket
└── Enables fast temporal filtering
```

### Why This Combination?

| Structure | Purpose | Time Complexity |
|-----------|---------|-----------------|
| **KD-Tree** | Spatial filtering | O(√N + k) for range query |
| **Fenwick Tree** | Temporal aggregation | O(log T) for range sum |
| **Combined** | Spatio-temporal query | ~O(V log T) where V = visited nodes |

---

## 📁 Project Structure

```
dsael/
├── src/
│   ├── cpp/                    # Core C++ implementation
│   │   ├── fenwick.h          # Fenwick Tree implementation
│   │   ├── kdtree.h           # KD-Tree implementation
│   │   ├── spatiotemporal.h   # Combined query engine
│   │   └── main.cpp           # Demo application
│   ├── python/                 # Data processing
│   │   ├── data_loader.py     # Dataset loader
│   │   ├── preprocessor.py    # Coordinate conversion
│   │   └── generator.py       # Test data generator
│   └── legacy_web/             # (Old) HTML Visualization
├── next-level-design-main/      # 🆕 Premium React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── data/
│   ├── chicago_crimes_sample.csv
│   └── processed/
├── tests/
│   ├── test_fenwick.cpp
│   ├── test_kdtree.cpp
│   └── test_integration.cpp
├── docs/
│   ├── algorithm_explanation.md
│   ├── complexity_analysis.md
│   └── dataset_guide.md
├── build/
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- C++ compiler (g++ or MSVC)
- Python 3.8+
- Node.js & npm (for the frontend)

### Build & Run

```bash
# 1. Compile C++ code
cd src/cpp
g++ -std=c++17 -O2 main.cpp -o spatiotemporal.exe

# 2. Process dataset
cd ../python
python data_loader.py

# 3. Run query engine
cd ../../build
./spatiotemporal.exe

# 4. Launch Premium Frontend
cd ../next-level-design-main
npm install
npm run dev
# Open the local URL provided (usually http://localhost:8080)
```

---

## 💡 Key Features

### 1. Efficient Query Engine
- ✅ Insert events: `insert_event(x, y, t, weight)`
- ✅ Range queries: `query(x1, y1, x2, y2, t1, t2)`
- ✅ Spatial pruning via bounding boxes
- ✅ Temporal aggregation via Fenwick trees

### 2. Real Dataset Support
- Chicago Crime Data
- NYC Traffic Accidents
- Air Quality Sensors
- Custom CSV datasets

### 3. Interactive Visualization
- Map-based query interface
- Temporal heatmaps
- Query result statistics
- Performance metrics

---

## 📊 Performance Analysis

### Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build KD-Tree | O(N log N) | O(N) |
| Insert Event | O(log N × log T) | O(1) |
| Range Query | O(V × log T) | O(1) |

Where:
- N = number of events
- T = number of time buckets
- V = visited KD-Tree nodes (~√N for balanced queries)

### Benchmark Results (10,000 events)

```
Build Time:        45ms
Average Insert:    0.02ms
Average Query:     0.15ms
Memory Usage:      ~8MB
```

---

## 🎓 Educational Value

This project demonstrates:
1. ✅ **Advanced Data Structures** - KD-Tree, Fenwick Tree
2. ✅ **Algorithmic Optimization** - Spatial indexing, range queries
3. ✅ **Real-World Applications** - Crime analytics, environmental monitoring
4. ✅ **Software Engineering** - Modular design, testing, documentation
5. ✅ **Data Processing** - CSV parsing, coordinate conversion

---

## 📖 Documentation

- [Algorithm Explanation](docs/algorithm_explanation.md) - Detailed walkthrough
- [Complexity Analysis](docs/complexity_analysis.md) - Performance proofs
- [Dataset Guide](docs/dataset_guide.md) - Working with real data
- [API Reference](docs/api_reference.md) - Function documentation

---

## 🧪 Testing

```bash
# Run unit tests
cd tests
g++ test_fenwick.cpp -o test_fenwick.exe && ./test_fenwick.exe
g++ test_kdtree.cpp -o test_kdtree.exe && ./test_kdtree.exe

# Run integration tests
g++ test_integration.cpp -o test_integration.exe && ./test_integration.exe
```

---

## 📈 Example Queries

```cpp
// Query 1: Crime count in downtown area between 8 PM - 4 AM
int count = engine.query(
    41.87, -87.65,  // bottom-left corner
    41.90, -87.62,  // top-right corner
    1200, 240       // 8 PM (1200 min) to 4 AM (240 min)
);

// Query 2: All events in last hour at specific location
int recent = engine.query(
    lat-0.01, lon-0.01,
    lat+0.01, lon+0.01,
    current_time - 60, current_time
);
```

---

## 🔬 Extensions & Future Work

- [ ] 3D KD-Tree for altitude-based queries
- [ ] Dynamic tree balancing
- [ ] GPU acceleration for large datasets
- [ ] Machine learning integration for pattern detection
- [ ] Real-time streaming data support

---

## 📚 References

1. Bentley, J.L. (1975). "Multidimensional binary search trees used for associative searching"
2. Fenwick, P.M. (1994). "A new data structure for cumulative frequency tables"
3. Chicago Data Portal - Crime Dataset
4. Samet, H. (2006). "Foundations of Multidimensional and Metric Data Structures"

---

## 👥 Contributors

**Semester 3 DSA Project**  
Data Structures and Algorithms Practical

---

## 📝 License

This project is created for educational purposes.

---

**Built with ❤️ for learning advanced data structures**
