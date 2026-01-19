#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <chrono>
#include "kdtree.h"

using namespace std;

// Simple CSV loader
vector<Event> loadEvents(const string& filename) {
    vector<Event> events;
    ifstream file(filename);
    
    if (!file.is_open()) {
        cerr << "Error: Could not open " << filename << endl;
        return events;
    }

    string line;
    getline(file, line);  // Skip header
    
    while (getline(file, line)) {
        stringstream ss(line);
        string token;
        vector<string> tokens;
        
        while (getline(ss, token, ',')) {
            tokens.push_back(token);
        }
        
        if (tokens.size() >= 4) {
            double x = stod(tokens[0]);
            double y = stod(tokens[1]);
            int t = stoi(tokens[2]);
            int w = stoi(tokens[3]);
            events.emplace_back(x, y, t, w);
        }
    }
    
    file.close();
    cout << "Loaded " << events.size() << " events" << endl;
    return events;
}

int main() {
    cout << "Spatio-Temporal Event Analytics" << endl;
    cout << "================================\n" << endl;

    // Load events
    string filename = "../../data/processed/events.csv";
    cout << "Loading dataset: " << filename << endl;
    
    auto loadStart = chrono::high_resolution_clock::now();
    vector<Event> events = loadEvents(filename);
    auto loadEnd = chrono::high_resolution_clock::now();
    
    if (events.empty()) {
        cerr << "No events loaded. Exiting." << endl;
        return 1;
    }

    double loadTime = chrono::duration<double, milli>(loadEnd - loadStart).count();
    cout << "Load Time: " << loadTime << " ms\n" << endl;

    // Build KD-Tree
    cout << "Building KD-Tree..." << endl;
    KDTree tree(1440);
    
    auto buildStart = chrono::high_resolution_clock::now();
    tree.build(events);
    auto buildEnd = chrono::high_resolution_clock::now();
    
    double buildTime = chrono::duration<double, milli>(buildEnd - buildStart).count();
    cout << "Build Time: " << buildTime << " ms\n" << endl;

    // Run test queries
    cout << "Running test queries...\n" << endl;

    // Query 1: Large region, morning
    {
        auto start = chrono::high_resolution_clock::now();
        int count = tree.query(41.80, -87.70, 41.92, -87.60, 360, 720);
        auto end = chrono::high_resolution_clock::now();
        double time = chrono::duration<double, milli>(end - start).count();
        
        cout << "Query 1: Morning (6-12 AM) in large region" << endl;
        cout << "  Result: " << count << " events" << endl;
        cout << "  Time: " << time << " ms\n" << endl;
    }

    // Query 2: Night time
    {
        auto start = chrono::high_resolution_clock::now();
        int count = tree.query(41.85, -87.68, 41.90, -87.62, 1200, 1440);
        auto end = chrono::high_resolution_clock::now();
        double time = chrono::duration<double, milli>(end - start).count();
        
        cout << "Query 2: Evening (8 PM - 12 AM)" << endl;
        cout << "  Result: " << count << " events" << endl;
        cout << "  Time: " << time << " ms\n" << endl;
    }

    // Query 3: Full day
    {
        auto start = chrono::high_resolution_clock::now();
        int count = tree.query(41.87, -87.65, 41.90, -87.62, 0, 1440);
        auto end = chrono::high_resolution_clock::now();
        double time = chrono::duration<double, milli>(end - start).count();
        
        cout << "Query 3: Full day in downtown" << endl;
        cout << "  Result: " << count << " events" << endl;
        cout << "  Time: " << time << " ms\n" << endl;
    }

    cout << "================================" << endl;
    cout << "All tests completed successfully!" << endl;

    return 0;
}
