#include <iostream>
#include <cassert>
#include "../cpp/fenwick.h"

using namespace std;

void testBasicOperations() {
    cout << "Testing basic Fenwick operations..." << endl;
    
    Fenwick fw(10);
    
    // Test initial sum
    assert(fw.sum(5) == 0);
    
    // Test single add
    fw.add(3, 5);
    assert(fw.sum(3) == 5);
    assert(fw.sum(2) == 0);
    
    // Test multiple adds
    fw.add(5, 10);
    fw.add(7, 3);
    
    assert(fw.sum(5) == 15);  // 5 + 10
    assert(fw.sum(7) == 18);  // 5 + 10 + 3
    
    cout << "✓ Basic operations passed" << endl;
}

void testRangeSum() {
    cout << "Testing range sum queries..." << endl;
    
    Fenwick fw(20);
    
    // Add values
    fw.add(5, 2);
    fw.add(10, 5);
    fw.add(15, 3);
    
    // Test range sums
    assert(fw.range_sum(1, 5) == 2);
    assert(fw.range_sum(5, 10) == 7);
    assert(fw.range_sum(10, 20) == 8);
    assert(fw.range_sum(1, 20) == 10);
    
    cout << "✓ Range sum queries passed" << endl;
}

void testEdgeCases() {
    cout << "Testing edge cases..." << endl;
    
    Fenwick fw(100);
    
    // Test boundary
    fw.add(1, 10);
    fw.add(100, 20);
    
    assert(fw.sum(1) == 10);
    assert(fw.sum(100) == 30);
    assert(fw.range_sum(1, 1) == 10);
    assert(fw.range_sum(100, 100) == 20);
    
    // Test empty range
    assert(fw.range_sum(50, 99) == 0);
    
    cout << "✓ Edge cases passed" << endl;
}

void testLargeValues() {
    cout << "Testing large values..." << endl;
    
    Fenwick fw(1440);  // Minutes in a day
    
    // Add many values
    for (int i = 1; i <= 1440; i++) {
        fw.add(i, 1);
    }
    
    assert(fw.sum(1440) == 1440);
    assert(fw.range_sum(1, 1440) == 1440);
    assert(fw.range_sum(720, 780) == 61);  // One hour
    
    cout << "✓ Large values passed" << endl;
}

void runAllTests() {
    cout << "\n";
    cout << "╔═══════════════════════════════════════╗" << endl;
    cout << "║   FENWICK TREE UNIT TESTS             ║" << endl;
    cout << "╚═══════════════════════════════════════╝" << endl;
    cout << "\n";
    
    testBasicOperations();
    testRangeSum();
    testEdgeCases();
    testLargeValues();
    
    cout << "\n";
    cout << "╔═══════════════════════════════════════╗" << endl;
    cout << "║   ✅ ALL TESTS PASSED                 ║" << endl;
    cout << "╚═══════════════════════════════════════╝" << endl;
    cout << "\n";
}

int main() {
    runAllTests();
    return 0;
}
