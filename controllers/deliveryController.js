// deliveryController.js
const { PRODUCT_CENTER, PRODUCT_WEIGHT } = require('../data/productData');
const { rateForWeight, permutations } = require('../utils/helpers');
const { buildShortest, reconstructPath } = require('../utils/floydWarshall');

const NODES = ['C1','C2','C3','L1'];
const DIRECT = { 'C1-C2':4, 'C2-C3':3, 'C1-L1':3, 'C2-L1':2.5, 'C3-L1':2 };

const CENTERS = ['C1','C2','C3'];

function calculateMinCost(order) {
    // -------- VALIDATION --------
    if (!order || Object.keys(order).length === 0) {
        throw { status: 400, message: 'Empty order received' };
    }

    for (const [prod, qty] of Object.entries(order)) {
        if (!PRODUCT_CENTER[prod]) throw { status: 400, message: `Product ${prod} not mapped to any center` };
        if (qty < 0) throw { status: 400, message: `Product ${prod} has negative quantity` };
    }

    // -------- PREPARE PICK WEIGHTS --------
    const pickWeight = { C1:0, C2:0, C3:0 };
    for (const [prod, qtyRaw] of Object.entries(order)) {
        const qty = Number(qtyRaw);
        if (qty <= 0) continue;
        const center = PRODUCT_CENTER[prod];
        pickWeight[center] += PRODUCT_WEIGHT[prod] * qty;
    }

    const centersNeeded = Object.keys(pickWeight).filter(c => pickWeight[c] > 0);
    if (centersNeeded.length === 0) return { cost: 0, breakdown: [] };

    // -------- SHORTEST PATHS --------
    const { dist: SHORTEST, next: NEXT } = buildShortest(NODES, DIRECT);

    let best = { cost: Infinity, actions: null };

    for (const start of CENTERS) {
        const perms = permutations(centersNeeded);
        for (const perm of perms) {
            const n = perm.length;
            const masks = 1 << Math.max(0, n-1);
            for (let mask = 0; mask < masks; mask++) {
                let totalCost = 0, currentLoc = start, currentLoad = 0;
                const picked = new Set();
                const actions = [];
                let abort = false;

                for (let i = 0; i < n; i++) {
                    const center = perm[i];
                    const d = SHORTEST[currentLoc][center];
                    if (!isFinite(d)) { abort = true; break; }

                    const rate = rateForWeight(currentLoad);
                    const segCost = d * rate;
                    actions.push({ from: currentLoc, to: center, distance: d, load_before: currentLoad, rate, segCost, note: 'move' });
                    totalCost += segCost;
                    currentLoc = center;

                    if (!picked.has(center)) {
                        currentLoad += pickWeight[center];
                        picked.add(center);
                        actions.push({ at: center, action: 'pickup', picked_weight: pickWeight[center], load_after: currentLoad });
                    }

                    if (i < n-1 && ((mask >> i) & 1) === 1) {
                        const d2 = SHORTEST[currentLoc]['L1'];
                        if (!isFinite(d2)) { abort = true; break; }
                        const rate2 = rateForWeight(currentLoad);
                        const segCost2 = d2 * rate2;
                        actions.push({ from: currentLoc, to: 'L1', distance: d2, load_before: currentLoad, rate: rate2, segCost: segCost2, note: 'deliver' });
                        totalCost += segCost2;
                        currentLoc = 'L1';
                        actions.push({ at: 'L1', action: 'deliver', delivered_weight: currentLoad });
                        currentLoad = 0;
                    }
                }

                if (abort) continue;

                // final delivery to L1
                if (currentLoc !== 'L1') {
                    const d3 = SHORTEST[currentLoc]['L1'];
                    if (!isFinite(d3)) continue;
                    const rate3 = rateForWeight(currentLoad);
                    const segCost3 = d3 * rate3;
                    actions.push({ from: currentLoc, to: 'L1', distance: d3, load_before: currentLoad, rate: rate3, segCost: segCost3, note: 'final-deliver' });
                    totalCost += segCost3;
                    actions.push({ at: 'L1', action: 'deliver', delivered_weight: currentLoad });
                    currentLoad = 0;
                    currentLoc = 'L1';
                }

                if (totalCost < best.cost) {
                    best.cost = totalCost;
                    best.actions = actions;
                }
            }
        }
    }

    return { cost: Math.round(best.cost*100)/100, breakdown: best.actions || [] };
}

module.exports = { calculateMinCost };
