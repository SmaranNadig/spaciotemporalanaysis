#ifndef FENWICK_H
#define FENWICK_H

#include <vector>
#include <algorithm>

/**
 * Fenwick Tree (Binary Indexed Tree)
 * 
 * Supports efficient range sum queries and point updates.
 * All operations are O(log n).
 * 
 * Time Complexity:
 *   - add(idx, val): O(log n)
 *   - sum(idx): O(log n)
 *   - range_sum(l, r): O(log n)
 * 
 * Space Complexity: O(n)
 */
class Fenwick {
private:
    int n;
    std::vector<int> bit;  // Binary Indexed Tree (1-indexed)

public:
    /**
     * Default constructor
     */
    Fenwick() : n(0) {}

    /**
     * Constructor with size
     * @param size Number of time buckets
     */
    Fenwick(int size) {
        init(size);
    }

    /**
     * Initialize Fenwick tree with given size
     * @param size Number of elements
     */
    void init(int size) {
        n = size;
        bit.assign(n + 1, 0);  // 1-indexed, so size n+1
    }

    /**
     * Add value to position idx
     * @param idx Position (1-indexed)
     * @param val Value to add
     */
    void add(int idx, int val) {
        if (idx <= 0 || idx > n) return;  // Bounds check
        
        for (; idx <= n; idx += idx & -idx) {
            bit[idx] += val;
        }
    }

    /**
     * Get prefix sum from 1 to idx
     * @param idx Position (1-indexed)
     * @return Sum of elements from 1 to idx
     */
    int sum(int idx) {
        if (idx <= 0) return 0;
        if (idx > n) idx = n;
        
        int result = 0;
        for (; idx > 0; idx -= idx & -idx) {
            result += bit[idx];
        }
        return result;
    }

    /**
     * Get range sum from l to r (inclusive)
     * @param l Left bound (1-indexed)
     * @param r Right bound (1-indexed)
     * @return Sum of elements from l to r
     */
    int range_sum(int l, int r) {
        if (l > r) return 0;
        if (l <= 0) l = 1;
        if (r > n) r = n;
        return sum(r) - sum(l - 1);
    }

    /**
     * Get the size of the Fenwick tree
     * @return Size
     */
    int size() const {
        return n;
    }

    /**
     * Clear the tree (reset all values to 0)
     */
    void clear() {
        std::fill(bit.begin(), bit.end(), 0);
    }
};

#endif // FENWICK_H
