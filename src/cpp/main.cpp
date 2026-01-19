#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <chrono>
#include <iomanip>
#include "kdtree.h"

using namespace std;

/**
 * Parse CSV file and load events
 * Expected format: x,y,time,weight
 */
vector<Event> loadEventsFromCSV(const string& filename) {
    vector<Event> events;
    ifstream file(filename);
    
    if (!file.is_open()) {
        cerr << "Error: Could not open file " << filename << endl;
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
    cout << "✓ Loaded " << events.size() << " events from " << filename << endl;
    return events;
}

/**
 * Print query results
 */
void printQueryResult(int count, double x1, double y1, double x2, double y2, 
                     int t1, int t2, double queryTime) {
    cout << "\n┌─────────────────────────────────────────┐" << endl;
    cout << "│         QUERY RESULT                    │" << endl;
    cout << "└─────────────────────────────────────────┘" << endl;
    cout << "  Spatial Range:" << endl;
    cout << "    Bottom-Left:  (" << fixed << setprecision(4) << x1 << ", " << y1 << ")" << endl;
    cout << "    Top-Right:    (" << x2 << ", " << y2 << ")" << endl;
    cout << "  Temporal Range:" << endl;
    cout << "    From: " << t1 << " → To: " << t2 << endl;
    cout << "  " << string(39, '─') << endl;
    cout << "  ✓ Events Found: " << count << endl;
    cout << "  ⏱  Query Time:   " << fixed << setprecision(3) << queryTime << " ms" << endl;
    cout << "└─────────────────────────────────────────┘\n" << endl;
}

/**
 * Run demo queries
 */
void runDemo(KDTree& tree) {
    cout << "\n" << string(50, '=') << endl;
    cout << "  DEMO QUERIES" << endl;
    cout << string(50, '=') << "\n" << endl;

    // Query 1: Large region, short time
    {
        auto start = chrono::high_resolution_clock::now();
        int count = tree.query(41.75, -87.75, 41.95, -87.55, 600, 720);
        auto end = chrono::high_resolution_clock::now();
        double time = chrono::duration<double, milli>(end - start).count();
        
        cout << "\n[Query 1] Morning Rush Hour in Downtown" << endl;
        printQueryResult(count, 41.75, -87.75, 41.95, -87.55, 600, 720, time);
    }

    // Query 2: Small region, long time
    {
        auto start = chrono::high_resolution_clock::now();
        int count = tree.query(41.87, -87.65, 41.90, -87.62, 0, 1440);
        auto end = chrono::high_resolution_clock::now();
        double time = chrono::duration<double, milli>(end - start).count();
        
        cout << "\n[Query 2] Entire Day in Small Neighborhood" << endl;
        printQueryResult(count, 41.87, -87.65, 41.90, -87.62, 0, 1440, time);
    }

    // Query 3: Night time crime hotspot
    {
        auto start = chrono::high_resolution_clock::now();
        int count = tree.query(41.80, -87.70, 41.92, -87.60, 1200, 300);
        auto end = chrono::high_resolution_clock::now();
        double time = chrono::duration<double, milli>(end - start).count();
        
        cout << "\n[Query 3] Night Crime Hotspot (8 PM - 5 AM)" << endl;
        printQueryResult(count, 41.80, -87.70, 41.92, -87.60, 1200, 300, time);
    }

    // Query 4: Precise location, specific hour
    {
        auto start = chrono::high_resolution_clock::now();
        int count = tree.query(41.88, -87.63, 41.89, -87.62, 720, 780);
        auto end = chrono::high_resolution_clock::now();
        double time = chrono::duration<double, milli>(end - start).count();
        
        cout << "\n[Query 4] Precise Location During Noon Hour" << endl;
        printQueryResult(count, 41.88, -87.63, 41.89, -87.62, 720, 780, time);
    }
}

/**
 * Main function
 */
int main(int argc, char* argv[]) {
    cout << "\n";
    cout << "╔═══════════════════════════════════════════════════════╗" << endl;
    cout << "║   SPATIO-TEMPORAL EVENT ANALYTICS ENGINE              ║" << endl;
    cout << "║   KD-Tree + Fenwick Tree Implementation               ║" << endl;
    cout << "╚═══════════════════════════════════════════════════════╝" << endl;
    cout << "\n";

    // Determine input file
    string filename = "../../data/processed/events.csv";
    if (argc > 1) {
        filename = argv[1];
    }

    cout << "📂 Loading dataset: " << filename << endl;
    
    // Load events
    auto loadStart = chrono::high_resolution_clock::now();
    vector<Event> events = loadEventsFromCSV(filename);
    auto loadEnd = chrono::high_resolution_clock::now();
    
    if (events.empty()) {
        cerr << "❌ No events loaded. Exiting." << endl;
        return 1;
    }

    double loadTime = chrono::duration<double, milli>(loadEnd - loadStart).count();
    cout << "⏱  Load Time: " << fixed << setprecision(2) << loadTime << " ms\n" << endl;

    // Build KD-Tree
    cout << "🔨 Building KD-Tree with Fenwick indices..." << endl;
    KDTree tree(1440);  // 1440 minutes in a day
    
    auto buildStart = chrono::high_resolution_clock::now();
    tree.build(events);
    auto buildEnd = chrono::high_resolution_clock::now();
    
    double buildTime = chrono::duration<double, milli>(buildEnd - buildStart).count();
    cout << "✓ KD-Tree built successfully!" << endl;
    cout << "⏱  Build Time: " << fixed << setprecision(2) << buildTime << " ms\n" << endl;

    // Run demo queries
    runDemo(tree);

    // Interactive mode
    cout << "\n" << string(50, '=') << endl;
    cout << "  INTERACTIVE QUERY MODE" << endl;
    cout << string(50, '=') << "\n" << endl;
    cout << "Enter coordinates and time range for custom queries." << endl;
    cout << "Format: x1 y1 x2 y2 t1 t2" << endl;
    cout << "Example: 41.85 -87.68 41.92 -87.60 600 720" << endl;
    cout << "Type 'exit' to quit.\n" << endl;

    string input;
    while (true) {
        cout << "query> ";
        getline(cin, input);
        
        if (input == "exit" || input == "quit") {
            break;
        }

        stringstream ss(input);
        double x1, y1, x2, y2;
        int t1, t2;
        
        if (ss >> x1 >> y1 >> x2 >> y2 >> t1 >> t2) {
            auto start = chrono::high_resolution_clock::now();
            int count = tree.query(x1, y1, x2, y2, t1, t2);
            auto end = chrono::high_resolution_clock::now();
            double time = chrono::duration<double, milli>(end - start).count();
            
            printQueryResult(count, x1, y1, x2, y2, t1, t2, time);
        } else {
            cout << "❌ Invalid input format. Please try again.\n" << endl;
        }
    }

    cout << "\n👋 Thank you for using the Event Analytics Engine!" << endl;
    return 0;
}
