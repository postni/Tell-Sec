var NetworkScanner = require('./scanner');

let scanner = new NetworkScanner();

function fillTable(data){
    console.log("data:");
    console.log("======================================");
    //console.log(data);
    console.log("======================================");
    /*
    let table = document.getElementById("devices");
    let id = 1;
    for(item in data){
        let row = document.createElement("tr");
        let col1 = document.createElement("td");
        col1.appendChild(document.createTextNode(id));
        let col2 = document.createElement("td");
        col2.appendChild(document.createTextNode(data[item][0]["hostname"]));
        let col3 = document.createElement("td");
        col3.appendChild(document.createTextNode(data[item][0]["vendor"]));
        let col4 = document.createElement("td");
        col4.appendChild(document.createTextNode(data[item][0]["osNmap"]));
        let col5 = document.createElement("td");
        col5.appendChild(document.createTextNode(item));
        let col6 = document.createElement("td");
        col6.appendChild(document.createTextNode(data[item][0]["mac"]));
        let col7 = document.createElement("td");
        col7.appendChild(document.createTextNode(JSON.stringify(data[item][0]["openPorts"])));
        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col3);
        row.appendChild(col4);
        row.appendChild(col5);
        row.appendChild(col6);
        row.appendChild(col7);
        table.appendChild(row);
        id++;
    }*/
}

function startScan(){
    scanner.getActiveIPs(scanner.getMyNetworks(),fillTable);
}
