var datastore = require('./js/frontend').datastore

/*loader-Funktion: wird beim öffnen der Listen-Ansicht ausgeführt*/
function loader() {
    toggleLoad()
    this.getData = window.setInterval(checkForUpdate, 1000)
}

/* 'checkForUpdate' liest 'update'-Variable aus sessionStorage, welche besagt
ob Daten bereits vorliegen und leitet entsprechend weiter*/
function checkForUpdate() {
    let updater = JSON.parse(sessionStorage.getItem("update"))
    if (updater) {
        window.clearInterval(this.getData);
        updateMyData()
    }
}

/*"updatemydata" aktualisiert den Datensatz der Tabelle*/
function updateMyData() {
    //Beenden des in "loader" definierten Intervalls
    try {
        console.log("update")
        window.clearInterval(this.getData);
    }
    catch (err) {
        console.log(err)
    }
    /*'devices' bekommt JSON Objekt mit allen Geräten aus sessionStorage von 
    'getDevices' aus frontend.js*/
    let devices = datastore.getDevices()
    // Anlegen der Tabelle
    let table = document.getElementById("devices");
    table.innerHTML = ""
    
    for (let i in devices) {
        let d = devices[i]
        // Anlegen einer Zeile pro Gerät
        let row = document.createElement("tr");
        //Spalte 1: Zeilennummer
        let col1 = document.createElement("td");
        col1.appendChild(document.createTextNode(i));
        //Spalte 2: hotname
        let col2 = document.createElement("td");
        col2.appendChild(document.createTextNode(
            (d["hostname"] === null) ? "unbekannt" : d["hostname"]
        ));
        // Spalte 3: hersteller
        let col3 = document.createElement("td");
        col3.appendChild(document.createTextNode(
            (d["vendor"] === undefined) ? "unbekannt" : d["vendor"]
        ));
        //Spalte 4: Betriebssystem
        let col4 = document.createElement("td");
        col4.appendChild(document.createTextNode(d["os"]));
        //Spalte 5: IP
        let col5 = document.createElement("td");
        col5.appendChild(document.createTextNode(
            (d["ip"] === undefined) ? "unbekannt" : d["ip"]
        ));
        // Spalte 6: MAC
        let col6 = document.createElement("td");
        col6.appendChild(document.createTextNode(
            (d["mac"] === null) ? "unbekannt" : d["mac"]
        ));
        // Spalte 7: Ports
        let col7 = document.createElement("td");
        let ul = document.createElement("ul")
        ul.classList.add("no-margin")
        let ports = d["ports"]

        if(typeof ports === "object"){
            ports.forEach((port)=>{
                let li = document.createElement("li")
                li.innerText = port.port + ": "+port.protocol+" / "+port.service
                ul.appendChild(li)
            })
            col7.appendChild(ul)
        }else{
            col7.appendChild(document.createTextNode(JSON.stringify(d["ports"])));
        }
        // Die angelegten Felder werden der zu Beginn angelegten Zeile zugeordnet
        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col3);
        row.appendChild(col4);
        row.appendChild(col5);
        row.appendChild(col6);
        row.appendChild(col7);
        table.appendChild(row);
    }

    toggleLoad()

}

/*Funktion zum Anzeigen des Ladescreens */
function toggleLoad() {
    var i = document.getElementById('loadsc');
    i.classList.toggle("hidden");
}