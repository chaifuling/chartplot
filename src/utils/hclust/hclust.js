'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var mlMatrix = require('ml-matrix');
var Heap = require('heap');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Heap__default = /*#__PURE__*/_interopDefaultLegacy(Heap);

function squaredEuclidean(p, q) {
     let d = {lable:""};
     let num = 0;
    for (let i = 0; i < p.length; i++) {
         num+= (p[i].value - q[i].value) * (p[i].value - q[i].value);
         d.lable = p[i].lable;
        // d += (p[i] - q[i]) * (p[i] - q[i]);
        
    }    // console.log('====================================');
    // console.log(d);
    // console.log('====================================');
    d.value = Math.sqrt(num);
    return d;
}
function euclidean(p, q) {
    return squaredEuclidean(p, q);
}


// export function squaredEuclidean(p, q) {
//     let d = 0;
//     for (let i = 0; i < p.length; i++) {
//         d += (p[i] - q[i]) * (p[i] - q[i]);
//     }
//     return d;
// }
// export function euclidean(p, q) {
//     return Math.sqrt(squaredEuclidean(p, q));
// }

/**
 * Computes a distance/similarity matrix given an array of data and a distance/similarity function.
 * @param {Array} data An array of data
 * @param {function} distanceFn  A function that accepts two arguments and computes a distance/similarity between them
 * @return {Array<Array>} The distance/similarity matrix. The matrix is square and has a size equal to the length of
 * the data array
 */
 function distanceMatrix(data, distanceFn) {
    const result = getMatrix(data.length);

    // Compute upper distance matrix
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j <= i; j++) {
        result[i][j] = distanceFn(data[i], data[j]);
        result[j][i] = result[i][j];
      }
    }
  
    return result;
  }
  
  function getMatrix(size) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      matrix.push(row);
      for (let j = 0; j < size; j++) {
        row.push(0);
      }
    }
    return matrix;
  }
  

  //  export default function distanceMatrix(data, distanceFn) {
  //   const result = getMatrix(data.length);
  
  //   // Compute upper distance matrix
  //   for (let i = 0; i < data.length; i++) {
  //     for (let j = 0; j <= i; j++) {
  //       result[i][j] = distanceFn(data[i], data[j]);
  //       result[j][i] = result[i][j];
  //     }
  //   }
  
  //   return result;
  // }
  
  // function getMatrix(size) {
  //   const matrix = [];
  //   for (let i = 0; i < size; i++) {
  //     const row = [];
  //     matrix.push(row);
  //     for (let j = 0; j < size; j++) {
  //       row.push(0);
  //     }
  //   }
  //   return matrix;
  // }

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
    distanceFunction = euclidean,
    method = 'complete',
    isDistanceMatrix = false,

  } = options;

  let updateFunc;
  if (!isDistanceMatrix) {
    data = distanceMatrix(data, distanceFunction);
  }
  let distanceMatrix$1 = new mlMatrix.Matrix(data.map(item => item.map(items => items.value)));
  const numLeaves = distanceMatrix$1.rows;

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
    const [row, column, distance,smallestName] = getSmallestDistance(distanceMatrix$1,data);
    const cluster1 = clusters[row];
    const cluster2 = clusters[column];
    const newCluster = new Cluster();
    newCluster.size = cluster1.size + cluster2.size;
    newCluster.children.push(cluster1, cluster2);
    newCluster.height = distance;
    newCluster.name = smallestName;
    const newClusters = [newCluster];
    const newDistanceMatrix = new mlMatrix.Matrix(
      distanceMatrix$1.rows - 1,
      distanceMatrix$1.rows - 1,
    );
    const previous = (newIndex) =>
      getPreviousIndex(newIndex, Math.min(row, column), Math.max(row, column));

    for (let i = 1; i < newDistanceMatrix.rows; i++) {
      const prevI = previous(i);
      const prevICluster = clusters[prevI];
      newClusters.push(prevICluster);
      for (let j = 0; j < i; j++) {
        if (j === 0) {
          const dKI = distanceMatrix$1.get(row, prevI);
          const dKJ = distanceMatrix$1.get(prevI, column);
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
          const val = distanceMatrix$1.get(prevI, previous(j));
          newDistanceMatrix.set(i, j, val);
          newDistanceMatrix.set(j, i, val);
        }
      }
    }
    clusters = newClusters;
    distanceMatrix$1 = newDistanceMatrix;
  }

  return clusters[0];
}

function getSmallestDistance(distance,data) {
  let smallest = Infinity;
  let smallestI = 0;
  let smallestJ = 0;
  let smallestName ='';
  for (let i = 1; i < distance.rows; i++) {
    for (let j = 0; j < i; j++) {
      if (distance.get(i, j) < smallest) {
        smallest = distance.get(i, j);
        smallestName= data[i][j].lable;
        smallestI = i;
        smallestJ = j;
      }
    }
  }
  return [smallestI, smallestJ, smallest,smallestName];
}

function getPreviousIndex(newIndex, prev1, prev2) {
  newIndex -= 1;
  if (newIndex >= prev1) newIndex++;
  if (newIndex >= prev2) newIndex++;
  return newIndex;
}

exports.Cluster = Cluster;
exports.agnes = agnes;
