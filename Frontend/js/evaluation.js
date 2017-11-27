var datastore = require("./js/frontend").datastore


// Slider1
var prob = document.getElementById("probability");
var output = document.getElementById("demo");
output.innerHTML = prob.value;

prob.oninput = function () {
    output.innerHTML = this.value;
}

// Slider2
var damage = document.getElementById("damage");
var outputd = document.getElementById("demod");
outputd.innerHTML = 'mittel';

damage.oninput = function (i) {
    console.log(i.target)
    if (parseInt(this.value) === 1) {
        console.log(outputd)

        outputd.innerHTML = 'sehr gering';
    } else if (parseInt(this.value) === 2) {
        console.log(outputd)

        outputd.innerHTML = 'gering';
    } else if (parseInt(this.value) === 3) {
        console.log(outputd)

        outputd.innerHTML = 'mittel';
    } else if (parseInt(this.value) === 4) {
        console.log(outputd)

        outputd.innerHTML = 'hoch';
    } else if (parseInt(this.value) === 5) {
        console.log(outputd)

        outputd.innerHTML = 'sehr hoch';

    }

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRisks(){
    let devices = datastore.getDevices();
    let table = document.getElementById("risk-table")
    let tablehead = table.insertRow()
    let headerText = ["Gerät", "Risiken"]
    headerText.forEach((text)=>{
        let th = document.createElement("th")
        th.innerText = text
        tablehead.appendChild(th)        
    })

    for(let id in devices){
        let device = devices[id];
        let row = table.insertRow()
        let nameCell = row.insertCell()
     
        let statusIndicator = document.createElement("status-indicator")
        statusIndicator.setAttribute("negative","")
        statusIndicator.setAttribute("pulse","")
        nameCell.appendChild(statusIndicator)

        nameCell.appendChild(document.createTextNode("  "+device.hostname))
        let riskCell = row.insertCell()

        riskCell.classList.add("py-0")

        let riskTable = document.createElement("table")
        riskTable.id=id+"-risks"
        riskCell.appendChild(riskTable)
        for(let risk in device.risks){
            let riskRow = riskTable.insertRow()
            let cellRiskLeft = riskRow.insertCell()
            let cellRiskRight = riskRow.insertCell()
            let riskNameTable = document.createElement("table")
            cellRiskLeft.appendChild(riskNameTable)
            
            insertProbabilitySlider(cellRiskLeft, id)
            
            riskNameTable.insertRow().innerText = risk.split("_")[1]

            let innerRiskTable = document.createElement("table")
            cellRiskRight.appendChild(innerRiskTable)

            device.risks[risk].consequences .forEach((consequence)=>{
                let consequenceRow = innerRiskTable.insertRow()
                consequenceRow.innerText = consequence
            })

        }
    }

}
getRisks()

function insertProbabilitySlider(table,id){
    let container = document.createElement("div")
    container.setAttribute("id",id+"-propability")


    table.appendChild(container)
}

var decision = getRandomInt(0, 100)
console.log(decision)


var good=document.getElementById('good');
var ok=document.getElementById('ok');
var stop=document.getElementById('stop');
if (decision >= 0 && decision <= 30) {
    good.style.display = "block";
} else if (decision >= 31 && decision <= 60) {
    ok.style.display = "block";
} else {
    stop.style.display = "block";
}