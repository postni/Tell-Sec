var datastore = require('./js/frontend').datastore

function loader() {
    toggleLoad()
    this.getData = window.setInterval(checkForUpdate, 1000)
}

function checkForUpdate() {
    //datastore.checkForRisks();
    let updater = JSON.parse(sessionStorage.getItem("update"))
    console.log("updater var: " + updater)
    if (updater) {
        window.clearInterval(this.getData);
        console.log(sessionStorage.getItem("update"))
        //sessionStorage.setItem("update", false)
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

    let devices = datastore.getDevices()
    console.log(devices)
    let table = document.getElementById("devices");
    table.innerHTML = ""
    for (let i in devices) {
        let d = devices[i]

        //TODO

        let row = document.createElement("tr");
        let col1 = document.createElement("td");
        col1.appendChild(document.createTextNode(i));
        let col2 = document.createElement("td");
        col2.appendChild(document.createTextNode(
            (d["hostname"] === null) ? "unbekannt" : d["hostname"]
        ));
        let col3 = document.createElement("td");
        col3.appendChild(document.createTextNode(
            (d["vendor"] === undefined) ? "unbekannt" : d["vendor"]
        ));
        let col4 = document.createElement("td");
        col4.appendChild(document.createTextNode(d["os"]));
        let col5 = document.createElement("td");
        col5.appendChild(document.createTextNode(
            (d["ip"] === undefined) ? "unbekannt" : d["ip"]
        ));
        let col6 = document.createElement("td");
        col6.appendChild(document.createTextNode(
            (d["mac"] === null) ? "unbekannt" : d["mac"]
        ));
        let col7 = document.createElement("td");
        col7.appendChild(document.createTextNode(JSON.stringify(d["ports"])));
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
function toggleLoad() {
    var i = document.getElementById('loadsc');
    i.classList.toggle("hidden");
}