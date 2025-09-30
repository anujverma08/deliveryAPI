// floydWarshall.js
function buildShortest(nodes, directEdges) {
    const INF = 1e12;
    const dist = {}, next = {};
    for (const u of nodes) {
        dist[u] = {}; next[u] = {};
        for (const v of nodes) {
            dist[u][v] = (u === v ? 0 : INF);
            next[u][v] = null;
        }
    }

    for (const k of Object.keys(directEdges)) {
        const [u,v] = k.split('-');
        const w = directEdges[k];
        dist[u][v] = Math.min(dist[u][v], w);
        dist[v][u] = Math.min(dist[v][u], w);
        next[u][v] = v;
        next[v][u] = u;
    }

    for (const k of nodes) {
        for (const i of nodes) {
            for (const j of nodes) {
                const through = dist[i][k] + dist[k][j];
                if (through < dist[i][j]) {
                    dist[i][j] = through;
                    next[i][j] = next[i][k];
                }
            }
        }
    }

    return { dist, next };
}

function reconstructPath(u, v, next) {
    if (!next[u][v]) return null;
    const path = [u];
    let cur = u;
    while (cur !== v) {
        cur = next[cur][v];
        if (!cur) return null;
        path.push(cur);
        if (path.length > 100) return null; // safety
    }
    return path;
}

module.exports = { buildShortest, reconstructPath };
