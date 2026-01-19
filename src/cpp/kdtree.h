#ifndef KDTREE_H
#define KDTREE_H

#include <vector>
#include <algorithm>
#include <memory>
#include <limits>
#include "fenwick.h"

/**
 * Event structure representing a spatio-temporal point
 */
struct Event {
    double x, y;    // Spatial coordinates
    int time;       // Temporal coordinate (bucket index)
    int weight;     // Event weight (usually 1)

    Event(double _x = 0, double _y = 0, int _t = 0, int _w = 1)
        : x(_x), y(_y), time(_t), weight(_w) {}
};

/**
 * KD-Tree Node
 * Each node stores:
 *   - A point (x, y)
 *   - Bounding box of its subtree
 *   - Fenwick tree for temporal queries
 *   - Left and right children
 */
class KDNode {
public:
    double x, y;                          // Point at this node
    double minX, maxX, minY, maxY;        // Bounding box
    bool splitByX;                         // Split dimension
    std::unique_ptr<KDNode> left, right;  // Children
    Fenwick fenwick;                       // Temporal index

    KDNode(double _x, double _y, bool _splitX, int timeSize)
        : x(_x), y(_y), splitByX(_splitX),
          minX(_x), maxX(_x), minY(_y), maxY(_y) {
        fenwick.init(timeSize);
    }

    /**
     * Update bounding box to include point (px, py)
     */
    void updateBounds(double px, double py) {
        minX = std::min(minX, px);
        maxX = std::max(maxX, px);
        minY = std::min(minY, py);
        maxY = std::max(maxY, py);
    }

    /**
     * Check if bounding box intersects query rectangle
     */
    bool intersects(double qx1, double qy1, double qx2, double qy2) const {
        return !(maxX < qx1 || minX > qx2 || maxY < qy1 || minY > qy2);
    }

    /**
     * Check if bounding box is completely inside query rectangle
     */
    bool isInside(double qx1, double qy1, double qx2, double qy2) const {
        return minX >= qx1 && maxX <= qx2 && minY >= qy1 && maxY <= qy2;
    }
};

/**
 * KD-Tree for spatial indexing with temporal Fenwick trees
 */
class KDTree {
private:
    std::unique_ptr<KDNode> root;
    int maxTime;  // Maximum time bucket

    /**
     * Recursively build KD-Tree
     * @param points Vector of events
     * @param start Start index
     * @param end End index
     * @param depth Current depth (determines split dimension)
     * @return Pointer to root of subtree
     */
    std::unique_ptr<KDNode> buildTree(std::vector<Event>& points, 
                                       int start, int end, int depth) {
        if (start > end) return nullptr;

        bool splitByX = (depth % 2 == 0);
        
        // Sort by x or y depending on depth
        if (splitByX) {
            std::sort(points.begin() + start, points.begin() + end + 1,
                     [](const Event& a, const Event& b) { return a.x < b.x; });
        } else {
            std::sort(points.begin() + start, points.begin() + end + 1,
                     [](const Event& a, const Event& b) { return a.y < b.y; });
        }

        // Find median
        int mid = start + (end - start) / 2;
        
        // Create node
        auto node = std::make_unique<KDNode>(
            points[mid].x, points[mid].y, splitByX, maxTime
        );

        // Build left and right subtrees
        node->left = buildTree(points, start, mid - 1, depth + 1);
        node->right = buildTree(points, mid + 1, end, depth + 1);

        // Update bounding box based on children
        if (node->left) {
            node->updateBounds(node->left->minX, node->left->minY);
            node->updateBounds(node->left->maxX, node->left->maxY);
        }
        if (node->right) {
            node->updateBounds(node->right->minX, node->right->minY);
            node->updateBounds(node->right->maxX, node->right->maxY);
        }

        return node;
    }

    /**
     * Insert event into KD-Tree (updates Fenwick trees along path)
     * @param node Current node
     * @param e Event to insert
     */
    void insertEvent(KDNode* node, const Event& e) {
        if (!node) return;

        // Update Fenwick tree at this node
        node->fenwick.add(e.time, e.weight);

        // Update bounding box
        node->updateBounds(e.x, e.y);

        // Recurse to appropriate child
        if (node->splitByX) {
            if (e.x <= node->x) {
                insertEvent(node->left.get(), e);
            } else {
                insertEvent(node->right.get(), e);
            }
        } else {
            if (e.y <= node->y) {
                insertEvent(node->left.get(), e);
            } else {
                insertEvent(node->right.get(), e);
            }
        }
    }

    /**
     * Query range in space and time
     * @param node Current node
     * @param x1, y1, x2, y2 Spatial rectangle
     * @param t1, t2 Temporal range
     * @return Count of events in range
     */
    int queryRange(KDNode* node, double x1, double y1, double x2, double y2,
                   int t1, int t2) const {
        if (!node) return 0;

        // If bounding box doesn't intersect query rectangle → skip
        if (!node->intersects(x1, y1, x2, y2)) {
            return 0;
        }

        // If bounding box is completely inside query rectangle → use Fenwick
        if (node->isInside(x1, y1, x2, y2)) {
            return node->fenwick.range_sum(t1, t2);
        }

        // Partial overlap → recurse to children
        int result = 0;
        
        // Check if this node's point is in range
        if (node->x >= x1 && node->x <= x2 && 
            node->y >= y1 && node->y <= y2) {
            result += node->fenwick.range_sum(t1, t2);
        }

        result += queryRange(node->left.get(), x1, y1, x2, y2, t1, t2);
        result += queryRange(node->right.get(), x1, y1, x2, y2, t1, t2);

        return result;
    }

public:
    KDTree(int _maxTime = 1440) : maxTime(_maxTime) {}

    /**
     * Build KD-Tree from vector of events
     * @param events Vector of events
     */
    void build(std::vector<Event>& events) {
        if (events.empty()) return;
        root = buildTree(events, 0, events.size() - 1, 0);
    }

    /**
     * Insert a new event
     * @param e Event to insert
     */
    void insert(const Event& e) {
        insertEvent(root.get(), e);
    }

    /**
     * Query events in spatio-temporal range
     * @param x1, y1, x2, y2 Spatial rectangle (bottom-left to top-right)
     * @param t1, t2 Temporal range (inclusive)
     * @return Count of events in range
     */
    int query(double x1, double y1, double x2, double y2, int t1, int t2) const {
        // Ensure proper ordering
        if (x1 > x2) std::swap(x1, x2);
        if (y1 > y2) std::swap(y1, y2);
        if (t1 > t2) std::swap(t1, t2);

        return queryRange(root.get(), x1, y1, x2, y2, t1, t2);
    }

    /**
     * Check if tree is empty
     */
    bool empty() const {
        return root == nullptr;
    }
};

#endif // KDTREE_H
