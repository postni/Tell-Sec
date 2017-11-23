var vis = require('./vis/dist/vis'); //require("vis/dist/vis.min.js")
var datastore = require('./js/frontend').datastore
var filehandler = require('./js/filehandler')
$(document).ready(() => { $('.mdb-select').material_select() })
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
    interaction: {
        navigationButtons: true,
        keyboard: true
      },
    layout: {
        randomSeed: undefined,
        improvedLayout:true,
        hierarchical: {
          enabled:true,
          levelSeparation: 150,
          nodeSpacing: 100,
          treeSpacing: 200,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true,
          direction: 'LR',        // UD, DU, LR, RL
          sortMethod: 'hubsize'   // hubsize, directed
        }
    },
    
    locale: 'de',
    edges:{
        arrows: {
          to:     {enabled: true, scaleFactor:1, type:'arrow'},
          middle: {enabled: false, scaleFactor:1, type:'arrow'},
          from:   {enabled: false, scaleFactor:1, type:'arrow'}
        }},
    
    manipulation: {
        addNode: false,
        addEdge: function (data, callback) {
            if (data.from == data.to) {

            }
            else {
                callback(data);
                datastore.addTo(data.from, 'connectedTo', null, data.to)
                datastore.addTo(data.to, 'connectionsToMe', null, data.from)
            }

        }
    }
}
var network = new vis.Network(container, data, options);

var ids = 100;

/*funktionen*/
function loader() {
    toggleLoad()
    this.getData = window.setInterval(checkForUpdate, 1000)
}
function checkForUpdate() {
    let updater = JSON.parse(sessionStorage.getItem("update"))
    console.log("updater var: " + updater)
    if (updater) {
        console.log(sessionStorage.getItem("update"))
       // sessionStorage.setItem("update", false)
        updateMyData()
    }
}
function updateMyData() {
    try {
        console.log("update")
        window.clearInterval(this.getData);
    }
    catch (err) {
        console.log(err)
    }
    datastore.checkForRisks()
    let ids = nodes.getIds();
    console.log("IDs: " + ids);
    nodes.remove(ids)
    edges._data = {}

    let devices = datastore.getDevices()
    console.log(devices)
    for (let i in devices) {
        console.log(typeof (i) + " - " + i)
        let d = devices[i]
        let label = d.hostname ? d.hostname : d.devicetype
        let help = d.devicetype ? d.devicetype.toLowerCase() : "person"
        let img = d.devicetype === "Client" ? "person" : "symbole/" + help
        appendNode(label, img, i);
    }
    for (let j in devices) {
        console.log(typeof (j) + " - " + j)
        let d = devices[j]
        if (!!d.connectedTo) {
            d.connectedTo.forEach((edge) => {
                appendEdge(j, edge);
            })
        }
    }
    let showLoader = JSON.parse(sessionStorage.getItem("showloader"));
    if (showLoader === true) {
        console.log("showloader: " + showLoader)
        toggleLoad()
    }
}

function appendEdge(from, to) {
    try {
        edges.add({
            "from": from,
            "to": to,
        })

    } catch (err) {
        alert(err);
    }
}
function updateContent(key, element) {
    console.log(document.getElementById('modal-id'));
    console.log(document.getElementById('modal-id'))
    var i = document.getElementById('modal-id').innerText;
    datastore.changeValue(i, key, null, element.value)
    if (key === 'hostname' || key === 'devicetype') {
        updateMyData()
    }

}
function addNode(label, img) {
    let myId = datastore.newID()
    let data = { id: myId, "devicetype": label }
    datastore.addDevice(data);
    appendNode(label, img, myId);
}

function appendNode(label, img, id) {
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
            console.log(element)
            datastore.removeDevice(element);
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
    modal.style.display = "none";

}
/*Ausgabe label des angeklickten Elements */
network.on("click", (params) => {
    if (params.nodes[0]) {
        let myId = params.nodes[0];
        let devices = datastore.getDevices();
        document.getElementById("modal-id").innerText = myId;
        /*  document.getElementById("modal-label").innerText = devices[myId].hostname ? devices[myId].hostname : "unbekannt" 
          document.getElementById("modal-devicetype").innerText = (devices[myId].devicetype ? "(" + devices[myId].devicetype + ")" : "(" + "unbekannt" + ")")*/
        document.getElementById("modal-hostname").value = devices[myId].hostname ? devices[myId].hostname : "unbekannt"
        document.getElementById("modal-ip").value = devices[myId].ip ? devices[myId].ip : "unbekannt"
        document.getElementById("modal-mac").value = devices[myId].mac ? devices[myId].mac : "unbekannt"
        document.getElementById("modal-vendor").value = devices[myId].vendor ? devices[myId].vendor : "unbekannt"
        document.getElementById("modal-os").value = devices[myId].os ? devices[myId].os : "unbekannt"
        let add = document.getElementById("add-ports");


        let ports = document.getElementById("modal-ports");
        ports.innerHTML = "";

        let portID = 0;
        let protocolID = 0;
        let serviceID = 0;


        if (devices[myId].ports) {
            devices[myId].ports.forEach((p) => {
                let div = document.createElement("div")
                div.classList.add("row", "no-margin", "justify-content")
                let d1 = document.createElement("div")
                d1.classList.add("col-sm-3", "pl-0")
                let p1 = document.createElement("p")
                p1.classList.add("modal-text-line", "md-form")
                let port = document.createElement("input")
                port.type = "text"
                port.classList.add("modal-text", "form-control")
                port.id = "port-" + portID
                portID++
                console.log("Port: " + p.port)
                port.value = p.port
                let portLabel = document.createElement("label")
                portLabel.classList.add("active")
                portLabel.htmlFor = port.id
                portLabel.innerText = "Port"
                p1.appendChild(portLabel)
                p1.appendChild(port)
                d1.appendChild(p1)

                let d2 = document.createElement("div")
                d2.classList.add("col-sm-5")
                let p2 = document.createElement("p")
                p2.classList.add("modal-text-line", "md-form")
                let protocol = document.createElement("input")
                protocol.type = "text"
                protocol.classList.add("modal-text", "form-control")
                protocol.id = "protocol-" + protocolID
                protocol.value = p.protocol
                let protocolLabel = document.createElement("label")
                protocolLabel.classList.add("active")
                protocolLabel.htmlFor = protocol.id
                protocolLabel.innerText = "Protocol"
                p2.appendChild(protocolLabel)
                p2.appendChild(protocol)
                d2.appendChild(p2)

                let d3 = document.createElement("div")
                d3.classList.add("col-sm-4")
                let p3 = document.createElement("p")
                p3.classList.add("modal-text-line", "md-form")
                let service = document.createElement("input")
                service.type = "text"
                service.classList.add("modal-text", "form-control")
                service.id = "service-" + serviceID
                service.value = p.service
                let serviceLabel = document.createElement("label")
                serviceLabel.classList.add("active")
                serviceLabel.htmlFor = service.id
                serviceLabel.innerText = "Service"
                p3.appendChild(serviceLabel)
                p3.appendChild(service)
                d3.appendChild(p3)

                div.appendChild(d1);
                div.appendChild(d2);
                div.appendChild(d3)
                ports.appendChild(div);
            })
        } else {
            ports.innerHTML = ""
        }

        add.onclick = () => {
            let allPorts = document.querySelectorAll("[id^=port-]")
            let portID = 0
    
            let pLength = allPorts.length
            for(let i =0; i<pLength;i++){
                let id = (allPorts[i].id)
                id=id.split("-")[1]
                portID=id>portID?id:portID
            }

            let allProtocols = document.querySelectorAll("[id^=protocol-]")
            let protocolID = 0
    
            let prLength = allProtocols.length
            for(let i =0; i<prLength;i++){
                let id = (allProtocols[i].id)
                id=id.split("-")[1]
                protocolID=id>protocolID?id:protocolID
            }

            let allServices = document.querySelectorAll("[id^=service-]")
            let serviceID = 0
    
            let sLength = allServices.length
            for(let i =0; i<sLength;i++){
                let id = (allServices[i].id)
                id=id.split("-")[1]
                serviceID=id>serviceID?id:serviceID
            }


            let div = document.createElement("div")
            div.classList.add("row", "no-margin", "justify-content")
            let d1 = document.createElement("div")
            d1.classList.add("col-sm-3", "pl-0")
            let p1 = document.createElement("p")
            p1.classList.add("modal-text-line", "md-form")
            let port = document.createElement("input")
            port.type = "text"
            port.classList.add("modal-text", "form-control")
            port.id = "port-" + portID
            portID++
            let portLabel = document.createElement("label")
            portLabel.htmlFor = port.id
            portLabel.innerText = "Port"
            p1.appendChild(portLabel)
            p1.appendChild(port)
            d1.appendChild(p1)

            let d2 = document.createElement("div")
            d2.classList.add("col-sm-5")
            let p2 = document.createElement("p")
            p2.classList.add("modal-text-line", "md-form")
            let protocol = document.createElement("input")
            protocol.type = "text"
            protocol.classList.add("modal-text", "form-control")
            protocol.id = "protocol-" + protocolID
            let protocolLabel = document.createElement("label")
            protocolLabel.htmlFor = protocol.id
            protocolLabel.innerText = "Protocol"
            p2.appendChild(protocolLabel)
            p2.appendChild(protocol)
            d2.appendChild(p2)

            let d3 = document.createElement("div")
            d3.classList.add("col-sm-4")
            let p3 = document.createElement("p")
            p3.classList.add("modal-text-line", "md-form")
            let service = document.createElement("input")
            service.type = "text"
            service.classList.add("modal-text", "form-control")
            service.id = "service-" + serviceID
            let serviceLabel = document.createElement("label")
            serviceLabel.htmlFor = service.id
            serviceLabel.innerText = "Service"
            p3.appendChild(serviceLabel)
            p3.appendChild(service)
            d3.appendChild(p3)

            div.appendChild(d1);
            div.appendChild(d2);
            div.appendChild(d3)
            ports.appendChild(div);

            //ports.appendChild()
        }


        //.innerText = devices[myId].ports?devices[myId].ports:"unbekannt"
        //console.log("label: " + label);
        //document.getElementById("label").innerText = label
        modal.style.display = "block";
    }
})

function opensave () {
    filehandler.saveDialog()
}
function openopen () {
    filehandler.openDialog()
    sessionStorage.setItem("update", false)
    this.getData = window.setInterval(checkForUpdate, 1000)    
}


/*.................... */
// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];



// When the user clicks on <span> (x), close the modal
span.onclick = function () {
     modal.style.display = "none";
}


// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function toggleLoad() {
    var i = document.getElementById('loadsc');
    i.classList.toggle("hidden");
    let hidden = false
    console.log("loader hidden?")
    i.classList.forEach((d) => {
        console.log(d)
        hidden = d === "hidden" ? true : hidden;
    })
    console.log(hidden)
    console.log("##############################")
    console.log("show loader?")
    let showloader = hidden ? false : true;
    console.log(showloader)
    sessionStorage.setItem("showloader", showloader)
}


module.exports.update = update;