# Algorithm Explanation

## Overview

This document provides a detailed explanation of the **KD-Tree + Fenwick Tree** hybrid data structure used for spatio-temporal event analytics.

---

## Table of Contents

1. [Problem Definition](#problem-definition)
2. [KD-Tree Fundamentals](#kd-tree-fundamentals)
3. [Fenwick Tree Fundamentals](#fenwick-tree-fundamentals)
4. [The Hybrid Approach](#the-hybrid-approach)
5. [Algorithm Walkthrough](#algorithm-walkthrough)
6. [Example Execution](#example-execution)

---

## Problem Definition

### Input
A collection of **events**, where each event has:
- **Spatial coordinates**: `(x, y)` representing location (e.g., latitude, longitude)
- **Temporal coordinate**: `t` representing time (discretized into buckets)
- **Weight**: `w` representing count or importance (usually 1)

### Query
Given a **spatial rectangle** `[x1, y1] × [x2, y2]` and a **time range** `[t1, t2]`, return:

**"How many events occurred in this spatial region during this time period?"**

### Challenge
- Naive approach: Scan all N events → **O(N)** per query
- Our goal: Much faster queries using indexing

---

## KD-Tree Fundamentals

### What is a KD-Tree?

A **k-d tree** (k-dimensional tree) is a binary search tree for organizing points in k-dimensional space.

For 2D space (x, y):
- Root splits by **x-coordinate**
- Next level splits by **y-coordinate**
- Alternates at each level

### Example

Points: `[(5,3), (2,6), (8,1), (4,7), (9,4)]`

```
         (5,3) │ split by x
        /      \
    (2,6) ─     (8,1) ─ split by y
      /            \
   (4,7)          (9,4)
```

### Bounding Boxes

Each node stores the **bounding box** of all points in its subtree:

```
Node (5,3):
  minX = 2, maxX = 9
  minY = 1, maxY = 7
```

This enables **spatial pruning** during queries.

### Range Query

To find points in rectangle `[x1, y1, x2, y2]`:

1. **If bounding box doesn't intersect query rectangle**:
   - Skip entire subtree (prune)

2. **If bounding box is completely inside query rectangle**:
   - Include all points in subtree

3. **Otherwise (partial overlap)**:
   - Recursively check both children

This achieves **~O(√N + k)** time where k = points found.

---

## Fenwick Tree Fundamentals

### What is a Fenwick Tree?

A **Fenwick Tree** (Binary Indexed Tree) supports:
- **Point update**: Add value at index i → O(log n)
- **Prefix sum**: Sum from 1 to i → O(log n)
- **Range sum**: Sum from i to j → O(log n)

### Structure

For array size n, we maintain array `bit[1..n]`:

```
bit[i] = sum of elements in range [i - LSB(i) + 1, i]
```

Where `LSB(i)` is the least significant bit of i.

### Operations

**Add value to index i:**
```cpp
void add(int i, int val) {
    for (; i <= n; i += i & -i)
        bit[i] += val;
}
```

**Get sum from 1 to i:**
```cpp
int sum(int i) {
    int res = 0;
    for (; i > 0; i -= i & -i)
        res += bit[i];
    return res;
}
```

**Range sum [l, r]:**
```cpp
int range_sum(int l, int r) {
    return sum(r) - sum(l - 1);
}
```

### Example

Array: `[3, 2, 5, 1, 4, 6]`

Fenwick tree (partial sums):
```
bit[1] = 3
bit[2] = 3 + 2 = 5
bit[3] = 5
bit[4] = 3 + 2 + 5 + 1 = 11
bit[5] = 4
bit[6] = 4 + 6 = 10
```

Query `sum(5)` → 3 + 2 + 5 + 1 + 4 = 15

---

## The Hybrid Approach

### Key Insight

**Store a Fenwick Tree at every KD-Tree node!**

- **KD-Tree**: Manages spatial indexing (x, y)
- **Fenwick Tree**: Manages temporal indexing (t)

### Data Structure

```cpp
struct KDNode {
    double x, y;                  // Point at this node
    double minX, maxX, minY, maxY; // Bounding box
    Fenwick fenwick;              // Temporal index!
    KDNode *left, *right;         // Children
};
```

Each Fenwick tree has size T (number of time buckets, e.g., 1440 for minutes in a day).

### Building

1. **Build KD-Tree** on all event locations (x, y)
   - Standard median-split construction
   - Time: O(N log N)

2. **Initialize Fenwick trees** at each node
   - Each Fenwick has size T
   - Space: O(N × T) worst case, but T is constant (1440)

3. **Insert events**
   - For each event (x, y, t, w):
     - Traverse KD-tree to correct leaf
     - Update Fenwick tree at every node along path
     - Add weight w at time index t

### Querying

To query region `[x1, y1, x2, y2]` and time `[t1, t2]`:

```cpp
function query(node, x1, y1, x2, y2, t1, t2):
    if node is null:
        return 0
    
    // Spatial pruning
    if node's bounding box doesn't intersect query:
        return 0
    
    // Early termination
    if node's bounding box is completely inside query:
        return node.fenwick.range_sum(t1, t2)
    
    // Partial overlap - recurse
    return query(node.left, ...) + query(node.right, ...)
```

---

## Algorithm Walkthrough

### Step 1: Build KD-Tree

**Input events:**
```
(41.88, -87.63, 720, 1)  // Downtown, noon
(41.85, -87.65, 1200, 1) // South, 8 PM
(41.91, -87.67, 360, 1)  // North, 6 AM
```

**KD-Tree structure:**
```
         (41.88, -87.63) │ split by x
         /               \
    (41.85, -87.65) ─    (41.91, -87.67) ─
```

### Step 2: Initialize Fenwick Trees

Each node gets a Fenwick tree of size 1440 (minutes).

```
Node (41.88, -87.63):
  fenwick = Fenwick(1440)
  
Node (41.85, -87.65):
  fenwick = Fenwick(1440)
  
Node (41.91, -87.67):
  fenwick = Fenwick(1440)
```

### Step 3: Insert Events

**Insert (41.88, -87.63, 720, 1):**
- Traverse: Root → matches this node
- Update: `root.fenwick.add(720, 1)`

**Insert (41.85, -87.65, 1200, 1):**
- Traverse: Root → Left child
- Update: 
  - `root.fenwick.add(1200, 1)`
  - `left.fenwick.add(1200, 1)`

**Insert (41.91, -87.67, 360, 1):**
- Traverse: Root → Right child
- Update:
  - `root.fenwick.add(360, 1)`
  - `right.fenwick.add(360, 1)`

### Step 4: Query

**Query: All events in [41.80, -87.70, 41.95, -87.60] from 600-800 (10 AM - 1:20 PM)**

1. Check root (41.88, -87.63):
   - Bounding box [41.85, 41.91] × [-87.67, -87.63]
   - Intersects query? **Yes**
   - Completely inside? **No** (partial overlap)
   - Recurse to children

2. Check left child (41.85, -87.65):
   - Inside query? **Yes**
   - Return: `left.fenwick.range_sum(600, 800)` = 0 (has event at 1200)

3. Check right child (41.91, -87.67):
   - Inside query? **Yes**
   - Return: `right.fenwick.range_sum(600, 800)` = 0 (has event at 360)

4.Check root's own point:
   - Inside query? **Yes**
   - Time in range? **Yes** (720 is in [600, 800])
   - Result: **1 event**

**Total: 1 event found**

---

## Example Execution

### Dataset
1000 crime events in Chicago:
- Coordinates: (41.75 - 41.95, -87.75 - -87.55)
- Times: 0-1439 minutes

### Query 1: Downtown, Morning Rush

```
Spatial: [41.87, -87.65] × [41.90, -87.62]
Temporal: [420, 540] (7 AM - 9 AM)
```

**Execution:**
1. Start at root
2. Prune 60% of tree (out of spatial bounds)
3. Check 40% of nodes
4. For each visited node: Fenwick range query O(log 1440)
5. **Result: 23 events, 0.15 ms**

### Query 2: Night Crime Hotspot

```
Spatial: [41.80, -87.70] × [41.92, -87.60]
Temporal: [1200, 1440] + [0, 240] (8 PM - 4 AM)
```

**Execution:**
1. Larger spatial region → more nodes visited
2. Time range wraps around midnight → two Fenwick queries
3. **Result: 87 events, 0.28 ms**

---

## Complexity Summary

| Operation | Time Complexity | Explanation |
|-----------|----------------|-------------|
| Build | O(N log N) | Sorting for median-split |
| Insert | O(log N × log T) | KD path × Fenwick update |
| Query | O(V × log T) | V visited nodes × Fenwick query |

Where:
- N = number of events
- T = time buckets (constant: 1440)
- V ≈ √N for balanced queries

---

## Conclusion

The **KD-Tree + Fenwick Tree** hybrid provides:
- ✅ **Fast spatial filtering** via KD-Tree pruning
- ✅ **Fast temporal aggregation** via Fenwick range sums
- ✅ **Efficient implementation** with simple code
- ✅ **Practical performance** for real-world datasets

This makes it ideal for applications like crime analytics, pollution monitoring, and event detection systems.
