var vis = require('./vis/dist/vis'); //require("vis/dist/vis.min.js")
var datastore = require('./js/frontend').datastore

/* Bilder */
var DIR = '../img';

// create an array with nodes
var nodes = new vis.DataSet([
    //{ id: 1, shape: 'image', image: 'img/person.png', label: 'Person' },
]);

// create an array with edges
var edges = new vis.DataSet([
    //{ from: 1, to: 3 }
]);

// create a network
var container = document.getElementById('mynetwork');

// provide the data in the vis format
var data = {
    nodes: nodes,
    edges: edges
};


// initialize your network!
var options = {
    locale: 'de',
    manipulation: {
        addNode: false,
        addEdge: function (data, callback) {
            if (data.from == data.to) {

            }
            else {
                callback(data);
            }
            
        }
    }
}
var network = new vis.Network(container, data, options);

var ids = 100;

/*funktionen*/
function loader(){
    toggleLoad()
    this.getData = window.setInterval(checkForUpdate,1000)
    }
function checkForUpdate(){
    let updater = JSON.parse(sessionStorage.getItem("update"))
    console.log("updater var: "+updater)
    if(updater){
        console.log(sessionStorage.getItem("update"))
        sessionStorage.setItem("update",false)
        update()
    }
}
function update(){
    try{
        console.log("update")
        window.clearInterval(this.getData);
    }
    catch(err){
        console.log(err)
    }
    let ids = nodes.getIds();
    console.log("IDs: "+ids);
    nodes.remove(ids)

    let devices = datastore.getDevices()
    console.log(devices)
    for(let i in devices){
        console.log(typeof(i)+" - "+i)
        let d = devices[i]
        let img = d.devicetype==="Client"? "person": "symbole/"+d.devicetype.toLowerCase()
        appendNode(d.hostname,img,i);
    }
    for(let j in devices){
        console.log(typeof(j)+" - "+j)
        let d = devices[j]
        let img = d.devicetype==="Client"? "person": "symbole/"+d.devicetype.toLowerCase()
        if(!!d.connectedTo){
            d.connectedTo.forEach((edge)=>{
                appendEdge(j,edge);
            })
        }
    }
    toggleLoad()
}

function appendEdge(from,to){
    try{   
        edges.add({
            "from":from,
            "to":to,
        })

    }catch(err) {
        alert(err);
    }
}

function addNode(label, img) {
    let myId = datastore.newID()
    let data = {id:myId,"devicetype":label}
    datastore.addDevice(data);
    appendNode(label, img,myId);
}

function appendNode(label, img, id){
    try {
        nodes.add({
            id: id,
            label: label,
            shape: 'image',
            image: 'img/' + img + '.png'
        });
        ids++;
    }
    catch (err) {
        alert(err);
    }
}

function removeElement() {
    let selectedNodes = network.getSelectedNodes();
    let selectedEdges = network.getSelectedEdges();
    selectedNodes.forEach(function (element) {
        try {
            nodes.remove({ id: element });
        }
        catch (err) {
            alert(err);
        }

    }, this);
    selectedEdges.forEach(function (element) {
        try {
            edges.remove({ id: element });
        }
        catch (err) {
            alert(err);
        }

    }, this);

}
/*Ausgabe label des angeklickten Elements */
network.on("click", (params)=>{
    let label = (nodes._data[(params.nodes[0])].label);
    console.log("label: "+label);
    document.getElementById("label").innerText = label
    modal.style.display = "block";
})




/*.................... */
// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];



// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function toggleLoad () {
    var i = document.getElementById('loadsc');
    i.classList.toggle("hidden");
}


module.exports.update = update;