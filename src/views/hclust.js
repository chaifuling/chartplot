'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var mlDistanceEuclidean = require('ml-distance-euclidean');
var getDistanceMatrix = require('ml-distance-matrix');
var mlMatrix = require('ml-matrix');
var Heap = require('heap');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var getDistanceMatrix__default = /*#__PURE__*/_interopDefaultLegacy(getDistanceMatrix);
var Heap__default = /*#__PURE__*/_interopDefaultLegacy(Heap);

class Cluster {
  constructor() {
    this.children = [];
    this.height = 0;
    this.size = 1;
    this.index = -1;
    this.isLeaf = false;
  }

  /**
   * Creates an array of clusters where the maximum height is smaller than the threshold
   * @param {number} threshold
   * @return {Array<Cluster>}
   */
  cut(threshold) {
    if (typeof threshold !== 'number') {
      throw new TypeError('threshold must be a number');
    }
    if (threshold < 0) {
      throw new RangeError('threshold must be a positive number');
    }
    let list = [this];
    const ans = [];
    while (list.length > 0) {
      const aux = list.shift();
      if (threshold >= aux.height) {
        ans.push(aux);
      } else {
        list = list.concat(aux.children);
      }
    }
    return ans;
  }

  /**
   * Merge the leaves in the minimum way to have `groups` number of clusters.
   * @param {number} groups - Them number of children the first level of the tree should have.
   * @return {Cluster}
   */
  group(groups) {
    if (!Number.isInteger(groups) || groups < 1) {
      throw new RangeError('groups must be a positive integer');
    }

    const heap = new Heap__default["default"]((a, b) => {
      return b.height - a.height;
    });

    heap.push(this);

    while (heap.size() < groups) {
      const first = heap.pop();
      if (first.children.length === 0) {
        break;
      }
      first.children.forEach((child) => heap.push(child));
    }

    const root = new Cluster();
    root.children = heap.toArray();
    root.height = this.height;

    return root;
  }

  /**
   * Traverses the tree depth-first and calls the provided callback with each individual node
   * @param {function} cb - The callback to be called on each node encounter
   */
  traverse(cb) {
    function visit(root, callback) {
      callback(root);
      if (root.children) {
        for (const child of root.children) {
          visit(child, callback);
        }
      }
    }

    visit(this, cb);
  }

  /**
   * Returns a list of indices for all the leaves of this cluster.
   * The list is ordered in such a way that a dendrogram could be drawn without crossing branches.
   * @returns {Array<number>}
   */
  indices() {
    const result = [];
    this.traverse((cluster) => {
      if (cluster.isLeaf) {
        result.push(cluster.index);
      }
    });
    return result;
  }
}

function singleLink(dKI, dKJ) {
  return Math.min(dKI, dKJ);
}

function completeLink(dKI, dKJ) {
  return Math.max(dKI, dKJ);
}

function averageLink(dKI, dKJ, dIJ, ni, nj) {
  const ai = ni / (ni + nj);
  const aj = nj / (ni + nj);
  return ai * dKI + aj * dKJ;
}

function weightedAverageLink(dKI, dKJ) {
  return (dKI + dKJ) / 2;
}

function centroidLink(dKI, dKJ, dIJ, ni, nj) {
  const ai = ni / (ni + nj);
  const aj = nj / (ni + nj);
  const b = -(ni * nj) / (ni + nj) ** 2;
  return ai * dKI + aj * dKJ + b * dIJ;
}

function medianLink(dKI, dKJ, dIJ) {
  return dKI / 2 + dKJ / 2 - dIJ / 4;
}

function wardLink(dKI, dKJ, dIJ, ni, nj, nk) {
  const ai = (ni + nk) / (ni + nj + nk);
  const aj = (nj + nk) / (ni + nj + nk);
  const b = -nk / (ni + nj + nk);
  return ai * dKI + aj * dKJ + b * dIJ;
}

function wardLink2(dKI, dKJ, dIJ, ni, nj, nk) {
  const ai = (ni + nk) / (ni + nj + nk);
  const aj = (nj + nk) / (ni + nj + nk);
  const b = -nk / (ni + nj + nk);
  return Math.sqrt(ai * dKI * dKI + aj * dKJ * dKJ + b * dIJ * dIJ);
}

/**
 * Continuously merge nodes that have the least dissimilarity
 * @param {Array<Array<number>>} data - Array of points to be clustered
 * @param {object} [options]
 * @param {Function} [options.distanceFunction]
 * @param {string} [options.method] - Default: `'complete'`
 * @param {boolean} [options.isDistanceMatrix] - Is the input already a distance matrix?
 * @constructor
 */
function agnes(data, options = {}) {
  const {
    distanceFunction = mlDistanceEuclidean.euclidean,
    method = 'complete',
    isDistanceMatrix = false,
  } = options;

  let updateFunc;
  if (!isDistanceMatrix) {
    data = getDistanceMatrix__default["default"](data, distanceFunction);
  }
  let distanceMatrix = new mlMatrix.Matrix(data);
  const numLeaves = distanceMatrix.rows;

  // allows to use a string or a given function
  if (typeof method === 'string') {
    switch (method.toLowerCase()) {
      case 'single':
        updateFunc = singleLink;
        break;
      case 'complete':
        updateFunc = completeLink;
        break;
      case 'average':
      case 'upgma':
        updateFunc = averageLink;
        break;
      case 'wpgma':
        updateFunc = weightedAverageLink;
        break;
      case 'centroid':
      case 'upgmc':
        updateFunc = centroidLink;
        break;
      case 'median':
      case 'wpgmc':
        updateFunc = medianLink;
        break;
      case 'ward':
        updateFunc = wardLink;
        break;
      case 'ward2':
        updateFunc = wardLink2;
        break;
      default:
        throw new RangeError(`unknown clustering method: ${method}`);
    }
  } else if (typeof method !== 'function') {
    throw new TypeError('method must be a string or function');
  }

  let clusters = [];
  for (let i = 0; i < numLeaves; i++) {
    const cluster = new Cluster();
    cluster.isLeaf = true;
    cluster.index = i;
    clusters.push(cluster);
  }

  for (let n = 0; n < numLeaves - 1; n++) {
    const [row, column, distance] = getSmallestDistance(distanceMatrix);
    const cluster1 = clusters[row];
    const cluster2 = clusters[column];
    const newCluster = new Cluster();
    newCluster.size = cluster1.size + cluster2.size;
    newCluster.children.push(cluster1, cluster2);
    newCluster.height = distance;

    const newClusters = [newCluster];
    const newDistanceMatrix = new mlMatrix.Matrix(
      distanceMatrix.rows - 1,
      distanceMatrix.rows - 1,
    );
    const previous = (newIndex) =>
      getPreviousIndex(newIndex, Math.min(row, column), Math.max(row, column));

    for (let i = 1; i < newDistanceMatrix.rows; i++) {
      const prevI = previous(i);
      const prevICluster = clusters[prevI];
      newClusters.push(prevICluster);
      for (let j = 0; j < i; j++) {
        if (j === 0) {
          const dKI = distanceMatrix.get(row, prevI);
          const dKJ = distanceMatrix.get(prevI, column);
          const val = updateFunc(
            dKI,
            dKJ,
            distance,
            cluster1.size,
            cluster2.size,
            prevICluster.size,
          );
          newDistanceMatrix.set(i, j, val);
          newDistanceMatrix.set(j, i, val);
        } else {
          // Just copy distance from previous matrix
          const val = distanceMatrix.get(prevI, previous(j));
          newDistanceMatrix.set(i, j, val);
          newDistanceMatrix.set(j, i, val);
        }
      }
    }

    clusters = newClusters;
    distanceMatrix = newDistanceMatrix;
  }

  return clusters[0];
}

function getSmallestDistance(distance) {
  let smallest = Infinity;
  let smallestI = 0;
  let smallestJ = 0;
  for (let i = 1; i < distance.rows; i++) {
    for (let j = 0; j < i; j++) {
      if (distance.get(i, j) < smallest) {
        smallest = distance.get(i, j);
        smallestI = i;
        smallestJ = j;
      }
    }
  }
  return [smallestI, smallestJ, smallest];
}

function getPreviousIndex(newIndex, prev1, prev2) {
  newIndex -= 1;
  if (newIndex >= prev1) newIndex++;
  if (newIndex >= prev2) newIndex++;
  return newIndex;
}

exports.Cluster = Cluster;
exports.agnes = agnes;