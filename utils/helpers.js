// helpers.js
function rateForWeight(wKg) {
    const extraBlocks = Math.ceil(Math.max(0, wKg - 5.0) / 5.0);
    return 10 + 8 * extraBlocks;
}

function permutations(arr) {
    if (arr.length <= 1) return [arr.slice()];
    const res = [];
    for (let i = 0; i < arr.length; i++) {
        const x = arr[i];
        const rest = arr.slice(0, i).concat(arr.slice(i+1));
        for (const p of permutations(rest)) res.push([x, ...p]);
    }
    return res;
}

module.exports = { rateForWeight, permutations };
