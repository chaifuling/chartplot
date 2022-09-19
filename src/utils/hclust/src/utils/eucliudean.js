
export function squaredEuclidean(p, q) {
     let d = {lable:""};
     let num = 0;
    for (let i = 0; i < p.length; i++) {
         num+= (p[i].value - q[i].value) * (p[i].value - q[i].value);
         d.lable = p[i].lable
        // d += (p[i] - q[i]) * (p[i] - q[i]);
        
    };
    // console.log('====================================');
    // console.log(d);
    // console.log('====================================');
    d.value = Math.sqrt(num)
    return d;
}
export function euclidean(p, q) {
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
