let nodeData = [
    {id: 1, label: 'Rohtak'},
    {id: 2, label: 'Dighal'},
    {id: 3, label: 'Sampla'},
    {id: 4, label: 'Jhajjar'},
    {id: 5, label: 'Bahadurgarh'},
    {id: 6, label: 'Badli'},
    {id: 7, label: 'Delhi'},
    {id: 8, label: 'Farukh Nagar'},
    {id: 9, label: 'Gurgaon'},
    {id: 10, label: 'Faridabad'},
];

let edgeData = [
    {from: 1, to: 2, weight: 1, value: 17, id: 1},
    {from: 1, to: 3, weight: 1, value: 23, id: 2},
    {from: 2, to: 3, weight: 1, value: 16, id: 3},
    {from: 2, to: 4, weight: 1, value: 21, id: 4},
    {from: 3, to: 5, weight: 1, value: 20, id: 5},
    {from: 5, to: 7, weight: 1, value: 20, id: 6},
    {from: 4, to: 5, weight: 1, value: 34, id: 7},
    {from: 6, to: 4, weight: 1, value: 16, id: 8},
    {from: 6, to: 5, weight: 1, value: 20, id: 9},
    {from: 6, to: 7, weight: 1, value: 40, id: 10},
    {from: 6, to: 9, weight: 1, value: 28, id: 11},
    {from: 4, to: 8, weight: 1, value: 26, id: 12},
    {from: 8, to: 9, weight: 1, value: 22, id: 13},
    {from: 7, to: 9, weight: 1, value: 40, id: 14},
    {from: 9, to: 10, weight: 1, value: 38, id: 15},
    {from: 7, to: 10, weight: 1, value: 50, id: 16},
];

let container = document.getElementById('mynetwork');
let startingNode = null;
const startingContainer = document.getElementById('startingPoint');
let destinationNode = null;
const destinationContainer = document.getElementById('destinationPoint');
let network = null
let nodes = null;
let edges = null;

let graph = [... new Array(nodeData.length)].map(value => []);

edgeData.map(value => {
    graph[value.from-1].push({
        vertices: value.to,
        weight: value.value,
    });
    graph[value.to-1].push({
        vertices: value.from,
        weight: value.value,
    });
});
console.log(graph);

console.log("graph: ", graph);

class PriorityQueue
{
    constructor(len) {
        this.queue = new Array(len+1);
        this.n = 0;
    }

    insert(vertex, priority, prevNode)
    {
        const temp = {
            vertex: vertex,
            priority: priority,
            prevNode: prevNode,
        };
        this.queue[++this.n] = temp;
        this.swim(this.n);
    }

    delMin()
    {
        const temp = this.queue[1];
        this.exchange(1, this.n--);
        this.queue[this.n+1] = null;
        this.sink(1);
        return temp;
    }

    updatePriority(vertex, priority, prevNode)
    {
        let i = 0;
        let temp = this.queue.map(value => {
            if(value) return value.vertex
        }).indexOf(vertex);
        if(this.queue[temp].priority > priority)
        {
            this.queue[temp].priority = priority;
            this.queue[temp].prevNode = prevNode;
        }
        if(i!==0){
            this.exchange(i, this.n);
            this.swim(this.n);
        }

    }

    swim(i)
    {
        while ((i > 1) && (this.less(i, Math.floor(i/2))))
        {
            this.exchange(i, Math.floor(i/2));
            i = Math.floor(i/2);
        }
    }

    sink(i)
    {
        while (i*2 <= this.n)
        {
            let k = Math.floor(i*2);
            if(k < this.n && (this.less(k+1, k))) k++;
            if(this.less(i, k)) break;
            this.exchange(i, k);
            i = k;
        }
    }

    exchange(i, j)
    {
        console.log("i and j", i,j," -- queue", this.queue);
        const temp = this.queue[i];
        this.queue[i] = this.queue[j];
        this.queue[j] = temp;

    }

    less(i, j)
    {
        return this.queue[i].priority < this.queue[j].priority;

    }

    isEmpty()
    {
        return this.n === 0;
    }
}

renderMap();


function compute()
{
    const X = []
    const A = [... new Array(nodeData.length)].map(value => Infinity);
    const path = new Array(nodeData.length);

    const pq = new PriorityQueue(nodeData.length);

    nodeData.forEach(value => {
        if(value.id === startingNode)
            pq.insert(value.id, 0, null);
        else
            pq.insert(value.id, Infinity, startingNode);
    });



    while (!pq.isEmpty())
    {
        console.log("popped")
        const smallNode = pq.delMin();

        graph[smallNode.vertex-1].forEach(value => {
            console.log("adjusting", value.vertices)
            if(!X.includes(value.vertices))
                pq.updatePriority(value.vertices, value.weight+smallNode.priority, smallNode.vertex);
        });
        X.push(smallNode.vertex);
        A[smallNode.vertex-1] = smallNode.priority;
        if(smallNode.prevNode === null)
            path[smallNode.vertex-1] = [smallNode.vertex];
        else
            path[smallNode.vertex-1] = [...path[smallNode.prevNode-1], smallNode.vertex];
        console.log(pq.queue);
        if(smallNode.vertex === destinationNode) break;

    }
    console.log("nodes traversed: ", X);
    console.log("shortest distance to each node:", A);
    console.log("path followed: ", path);

    highlightPath(path[destinationNode-1]);

}

function highlightPath(path)
{
    console.log("path", path);
    for ( let i = 0; i < path.length-1 ; i++)
    {
        edgeData = edgeData.map(value => {
            console.log(path[i],path[i+1])
            if((value.from === path[i] && value.to === path[i+1]) || (value.from === path[i+1] && value.to === path[i]))
            {
                network.clustering.updateEdge(value.id, {width: 5});
                console.log(value.id);
            }
            return value;
        })
    }
}


function renderMap()
{
    // create an array with nodes
    nodes = new vis.DataSet(nodeData);

// create an array with edges
    edges = new vis.DataSet(edgeData.map(value => {
        return {id: value.id, from: value.from, to: value.to, weight: value.weight, title: value.value}
    }));
    console.log("edges",edges);

// create a network


// provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {};

// initialize your network!
    network = new vis.Network(container, data, options);

    network.on('click', e => {

        console.log(e);
        if(e.nodes.length !== 0)
        {
            if(startingNode === null)
            {
                startingNode = e.nodes[0];
                startingContainer.innerHTML = nodeData[e.nodes[0]-1].label;
                destinationContainer.classList.remove('disabled');
                startingContainer.classList.add('disabled');
            }
            else if(destinationNode === null)
            {
                destinationNode = e.nodes[0];
                destinationContainer.innerHTML = nodeData[e.nodes[0]-1].label;
                destinationContainer.classList.add('disabled');
                compute();
            }

        }
    })

}


