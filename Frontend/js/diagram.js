var vis = require('./vis/dist/vis'); 
var datastore = require('./js/frontend').datastore
var filehandler = require('./js/filehandler')
$(document).ready(() => { $('.mdb-select').material_select() })


/* Erzeugung zweier "vis.DataSet" zur späteren Speicherung von Knoten (Geräten) und Kanten (Verbindungen).
Spätere Speicherung in Form von Array mit Parametern id, image und label für Knoten bzw. "from" und "to" für Kanten.*/
var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);

/* Erzeugung der Zeichenfläche, auf welcher Knoten und Kanten angezeigt werden sollen. 
'myNetwork' = ID der angelegten Zeichenfläche im HTML-Dokuent*/
var container = document.getElementById('mynetwork');

// Zur internen Verarbeitung benötigt vis die Knoten und Kanten in einer 'data-Variable.
var data = {
    nodes: nodes,
    edges: edges
};


/* Angaben bzgl. des Netzwerkes, vodefiniertes Muster von vis.js
Die Variable 'options' wird an späterer Stelle neben data und container zur Erzeugung der Zeichenfläche mitgegeben.*/
var options = {
    interaction: {                  // Einstellungen bzgl. Navigation auf Zeichenfläche
        navigationButtons: true,
        keyboard: true,
        tooltipDelay: 300,
      },
    layout: {                       // Einstellungen bzgl. Anordnung der Elemente
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
          direction: 'LR',        
          sortMethod: 'hubsize'   
        }
    },
    locales: {                      // Anpassung der vordefinierten Texte 
        "myde": {
            edit: 'Editieren',
            del: 'Verbindung löschen',
            back: 'Zurück',
            addEdge: 'Verbindung hinzufügen',
            editEdge: 'Verbindung editieren',
            edgeDescription: 'Klicke auf ein Netzwerk-Element und ziehe die Verbindung zu einem anderen, um diese zu verbinden.',
            editEdgeDescription: 'Klicke auf einen der Verbindungspunkte und ziehe diesen auf ein anderes Netzwerk-Element, um die Verbindung zu editieren.',
        }
    },
    locale: 'myde',
    edges:{                         // Darstellung der Kanten
        arrows: {
          to:     {enabled: true, scaleFactor:1, type:'arrow'},
          middle: {enabled: false, scaleFactor:1, type:'arrow'},
          from:   {enabled: false, scaleFactor:1, type:'arrow'}
        }},
    
    manipulation: {                 // Anzeige Funktionen im vis-Menü
        addNode: false,
        deleteNode: false,
        deleteEdge: true,
        initiallyActive: true,
        
        /*Neben der Speicherung für die vis-Zeichenfläche (Anzeige), bedarf es einer weiteren Speicherung 
        der Elemente und Kanten zur Verarbeitung der Daten. Die Funktion untenan sorgt mithilfe der Funktion 
        "addTo" (frontend.js) für entsprechende zweite Speicherung der Kanten im sessionStorage des Browsers. */
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

/*Erezeugung der Zeichenfläche (vis.Network) mit den zuvor definierten Parametern */
var network = new vis.Network(container, data, options);

var ids = 100;

/*loader-Funktion: wird beim öffnen der Map-Ansicht ausgeführt*/
function loader() {
    toggleLoad()
    this.getData = window.setInterval(checkForUpdate, 1000)
    toggleVideo()

}

/* 'toggleVideo' managet die Anzeige des Einfühungsvideos*/
function toggleVideo() {    
    //'showVideo' aus localStorage beinhaltet Entscheidung des Users zur Anzeige
    let showVideo = JSON.parse(localStorage.getItem('showVideo'))
    let divVideo = document.getElementById('divVideo')
    let video = document.getElementById('video')
    if(showVideo) {
        divVideo.style.display = "block";
        localStorage.setItem('showVideo', false)
    } else {
        divVideo.style.display = "none";
        video.pause()
    }
    //Schließend des Videos nach vollständigem Abspielen
    document.getElementById('video').addEventListener('ended',myHandler,false);
    function myHandler(e) {
        divVideo.style.display='none';
    }
}

/* 'checkForUpdate' liest 'update'-Variable aus sessionStorage, welche besagt
ob Daten bereits vorliegen und leitet entsprechend weiter*/
function checkForUpdate() {
    let updater = JSON.parse(sessionStorage.getItem("update"))
    console.log("updater var: " + updater)
    if (updater) {
        updateMyData()
    }
}
/*"updatemydata" aktualisiert den Datensatz der Zeichenfläche*/
function updateMyData() {
    //Beenden des in "loader" definierten Intervalls
    try {
        console.log("update")
        window.clearInterval(this.getData);
    }
    catch (err) {
        console.log(err)
    }
    let ids = nodes.getIds();
    nodes.remove(ids)
    edges._data = {}
    /*'devices' bekommt JSON Objekt mit allen Geräten aus sessionStorage von 
    'getDevices' aus frontend.js*/
    let devices = datastore.getDevices()
    
    // zeichnen des Netzwerkplans
    for (let i in devices) {
        let d = devices[i]
        let label = d.hostname ? d.hostname : d.devicetype
        let help = d.devicetype ? d.devicetype.toLowerCase() : "unbekannt"
        let img = d.devicetype === "Client" ? "person" : "symbole/" +  help.replace(" ", "")
        appendNode(label, img, i, d.devicetype);
    }
    for (let j in devices) {
        let d = devices[j]
        if (!!d.connectedTo) {
            d.connectedTo.forEach((edge) => {
                appendEdge(j, edge);
            })
        }
    }
    let showLoader = JSON.parse(sessionStorage.getItem("showloader"));
    if (showLoader === true) {
        toggleLoad()
    }
}

/*hinzufügen von Kanten in den Speicher der vis-Zeichenfläche*/
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

/*'updateContent' bereitet Inhalte aus überliefertem Device für 'changeValue' 
aus frontend.js*/
function updateContent(element) {
    let type = element.id.split('-')[1]
    let id = document.getElementById('modal-id').innerText
    let value = element.value
    let promise = datastore.changeValue([id,type],value,type)        
    
    if(type === 'hostname' || type === 'devicetype'){
        promise.then(()=>{updateMyData()})
    }
}

/*'addNode' zur Erzeugung neuer Geräte über das Sidemenü*/
function addNode(label, img, title) {
    let myId = datastore.newID()
    let data = { id: myId, "devicetype": label }
    datastore.addDevice(data);      //aktualisieren des sessionStorage
    appendNode(label, img, myId, title); //aktualisieren der Zeichenfläche
}

/*'appendNode' zum Hinzufügen neuer Geräte auf der Zeichenfläche */
function appendNode(label, img, id, title) {
    try {
        nodes.add({
            id: id,
            label: label,
            shape: 'image',
            image: 'img/' + img + '.png',
            title: title
        });
        ids++;
    }
    catch (err) {
        alert(err);
    }
}

/*'removeElement' zum löschen markierter Elemente */
function removeElement() {
    let selectedNodes = network.getSelectedNodes();
    let selectedEdges = network.getSelectedEdges();
    
    selectedNodes.forEach(function (element) {
        try {
            nodes.remove({ id: element }); //löschen von der Zeichenfläche
            datastore.removeDevice(element); //löschen aus dem Sessionstorage
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

/*onclick-Event zum Anzeigen eines Modals entsprechend des angeklickten Gerätes */
network.on("click", (params) => {
    
    if (params.nodes[0]) {
        let myId = params.nodes[0];
        let devices = datastore.getDevices();
        // Befüllen der Modal-Felder mit gerätespezifischen Daten
        document.getElementById("modal-id").innerText = myId;
        document.getElementById("modal-hostname").value = devices[myId].hostname ? devices[myId].hostname : "unbekannt"
        document.getElementById("modal-ip").value = devices[myId].ip ? devices[myId].ip : "unbekannt"
        document.getElementById("modal-mac").value = devices[myId].mac ? devices[myId].mac : "unbekannt"
        document.getElementById("modal-vendor").value = devices[myId].vendor ? devices[myId].vendor : "unbekannt"
        document.getElementById("modal-os").value = devices[myId].os ? devices[myId].os : "unbekannt"
       
        // Auswahl PullDownMenü Gerätetyp
        let select = document.getElementById("modal-devicetype")
        select.selectedIndex = 0
        let dtype = !devices[myId].devicetype || devices[myId].devicetype ==="Client" ?"Unbekannt": devices[myId].devicetype
        for(let i=0; i< select.options.length;i++){
            if(select.options[i].value === dtype){
                select.selectedIndex = i
                select.parentElement.getElementsByTagName("input")[0].value = dtype    
            }
        }
       
        let add = document.getElementById("add-ports");
        let ports = document.getElementById("modal-ports");
        ports.innerHTML = "";
        let portID = 0;
        //Erzeugen eines Listeneintrages je Port, wenn vorhanden
        if (devices[myId].ports) {
            devices[myId].ports.forEach((p) => {
                //Anlegen Zeile für den Port
                let div = document.createElement("div")
                div.classList.add("row", "no-margin", "justify-content")

                //Anlegen Input-Feld für Port-Wert
                let d1 = document.createElement("div")
                d1.classList.add("col-sm-3", "pl-0")
                let p1 = document.createElement("p")
                p1.classList.add("modal-text-line", "md-form")
                let port = document.createElement("input")
                port.type = "text"
                port.classList.add("modal-text", "form-control")
                port.id = "port-" + portID
                // Befüllen
                port.value = p.port
                //Anzeige des Feld-Namen
                let portLabel = document.createElement("label")
                portLabel.classList.add("active")
                portLabel.htmlFor = port.id
                portLabel.innerText = "Port"
                //Beziehungen der angelegten Elemente festlegen
                p1.appendChild(portLabel)
                p1.appendChild(port)
                d1.appendChild(p1)
                //Änderung des Wertes durch User-Eingabe
                port.onchange = (event)=> {
                    let content = event.target.value
                    let ids = [document.getElementById("modal-id").innerText,event.target.id.split("-")[1]]
                    datastore.changeValue(ids, content, 'port')
                }
                
                //Anlegen Input-Feld für den Wert 'Protokoll'
                let d2 = document.createElement("div")
                d2.classList.add("col-sm-5")
                let p2 = document.createElement("p")
                p2.classList.add("modal-text-line", "md-form")
                let protocol = document.createElement("input")
                protocol.type = "text"
                protocol.classList.add("modal-text", "form-control")
                protocol.id = "protocol-" + portID
                // Befüllen
                protocol.value = p.protocol
                // Anzeigen des Feld-Namen
                let protocolLabel = document.createElement("label")
                protocolLabel.classList.add("active")
                protocolLabel.htmlFor = protocol.id
                protocolLabel.innerText = "Protocol"
                //Beziehungen der angelegten Elemente festlegen
                p2.appendChild(protocolLabel)
                p2.appendChild(protocol)
                d2.appendChild(p2)
                //Änderung des Wertes durch User-Eingabe
                protocol.onchange = (event)=> {
                    let content = event.target.value
                    let ids = [document.getElementById("modal-id").innerText,event.target.id.split("-")[1]]
                    datastore.changeValue(ids, content, 'protocol')
                }
                
                //Anlegen Input-Feld für den Wert 'Protokoll'
                let d3 = document.createElement("div")
                d3.classList.add("col-sm-4")
                let p3 = document.createElement("p")
                p3.classList.add("modal-text-line", "md-form")
                let service = document.createElement("input")
                service.type = "text"
                service.classList.add("modal-text", "form-control")
                service.id = "service-" + portID
                // Befüllen
                service.value = p.service
                // Anzeigen des Feld-Namen
                let serviceLabel = document.createElement("label")
                serviceLabel.classList.add("active")
                serviceLabel.htmlFor = service.id
                serviceLabel.innerText = "Service"
                //Beziehungen der angelegten Elemente festlegen
                p3.appendChild(serviceLabel)
                p3.appendChild(service)
                d3.appendChild(p3)
                //Änderung des Wertes durch User-Eingabe
                service.onchange = (event)=> {
                    let content = event.target.value
                    let ids = [document.getElementById("modal-id").innerText,event.target.id.split("-")[1]]
                    datastore.changeValue(ids, content, 'service')
                }
                
                // Die drei angelegten Felder werden der zu Beginn angelegten Zeile zugeordnet
                div.appendChild(d1);
                div.appendChild(d2);
                div.appendChild(d3)
                ports.appendChild(div);
                portID++                
            })
        } else {    //sofern keine zu ladenden Ports vorhanden
            ports.innerHTML = ""
        }

        //Button zum Hinzufügen von Port
        add.onclick = () => {
            let allPorts = document.querySelectorAll("[id^=port-]")
            let portID = allPorts.length

            //Anlegen Zeile für den Port
            let div = document.createElement("div")
            div.classList.add("row", "no-margin", "justify-content")

            //Anlegen Input-Feld für Port-Wert
            let d1 = document.createElement("div")
            d1.classList.add("col-sm-3", "pl-0")
            let p1 = document.createElement("p")
            p1.classList.add("modal-text-line", "md-form")
            let port = document.createElement("input")
            port.type = "text"
            port.classList.add("modal-text", "form-control")
            port.id = "port-" + portID
            // Anzeigen des Feld-Namen
            let portLabel = document.createElement("label")
            portLabel.htmlFor = port.id
            portLabel.innerText = "Port"
            //Beziehungen der angelegten Elemente festlegen
            p1.appendChild(portLabel)
            p1.appendChild(port)
            d1.appendChild(p1)
            //Änderung des Wertes durch User-Eingabe
            port.onchange = (event)=> {
                let content = event.target.value
                let ids = [document.getElementById("modal-id").innerText,event.target.id.split("-")[1]]
                datastore.changeValue(ids, content, 'port')
            }

            //Anlegen Input-Feld für den Wert 'Protokoll'
            let d2 = document.createElement("div")
            d2.classList.add("col-sm-5")
            let p2 = document.createElement("p")
            p2.classList.add("modal-text-line", "md-form")
            let protocol = document.createElement("input")
            protocol.type = "text"
            protocol.classList.add("modal-text", "form-control")
            protocol.id = "protocol-" + portID
            // Anzeigen des Feld-Namen
            let protocolLabel = document.createElement("label")
            protocolLabel.htmlFor = protocol.id
            protocolLabel.innerText = "Protocol"
            //Beziehungen der angelegten Elemente festlegen
            p2.appendChild(protocolLabel)
            p2.appendChild(protocol)
            d2.appendChild(p2)
            //Änderung des Wertes durch User-Eingabe
            protocol.onchange = (event)=> {
                let content = event.target.value
                let ids = [document.getElementById("modal-id").innerText,event.target.id.split("-")[1]]
                datastore.changeValue(ids, content, 'protocol')
            }

            //Anlegen Input-Feld für den Wert 'Service'
            let d3 = document.createElement("div")
            d3.classList.add("col-sm-4")
            let p3 = document.createElement("p")
            p3.classList.add("modal-text-line", "md-form")
            let service = document.createElement("input")
            service.type = "text"
            service.classList.add("modal-text", "form-control")
            service.id = "service-" + portID
            // Anzeigen des Feld-Namen
            let serviceLabel = document.createElement("label")
            serviceLabel.htmlFor = service.id
            serviceLabel.innerText = "Service"
            //Beziehungen der angelegten Elemente festlegen
            p3.appendChild(serviceLabel)
            p3.appendChild(service)
            d3.appendChild(p3)
            //Änderung des Wertes durch User-Eingabe
            service.onchange = (event)=> {
                let content = event.target.value
                let ids = [document.getElementById("modal-id").innerText,event.target.id.split("-")[1]]
                datastore.changeValue(ids, content, 'service')
            }
            // Die drei angelegten Felder werden der zu Beginn angelegten Zeile zugeordnet
            div.appendChild(d1);
            div.appendChild(d2);
            div.appendChild(d3)
            ports.appendChild(div);
            portID++

            let id = document.getElementById('modal-id').innerText
            //Hinzufügen des Ports zum sessionStorage
            datastore.addTo(id,"ports",null,{"port":"","protocol":"","service":""})
        }
        // Modal anzeigen
        modal.style.display = "block"; 
    }
})




/* Modal und Sidemenü öffnen/schließen*/
var modal = document.getElementById('myModal');
var sidenav = document.getElementById('siden');
var btn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0]; // = Kreuz zum schließen
span.onclick = function () {
     modal.style.display = "none";
}

// Schließen von Modal/ Sidemenü, wenn ein Klick ausßerhalb diesem erfolgt
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }else if (event.target == sidenav) {
       sidenav.style.display = "none";
}}

/*Funktion zum Anzeigen des Ladescreens */
function toggleLoad() {
    var i = document.getElementById('loadsc');
    i.classList.toggle("hidden");
    let hidden = false
    i.classList.forEach((d) => {
        hidden = d === "hidden" ? true : hidden;
    })
    let showloader = hidden ? false : true;
    sessionStorage.setItem("showloader", showloader)
}


module.exports.update = update;