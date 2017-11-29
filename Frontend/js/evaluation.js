var datastore = require("./js/frontend").datastore
/*
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
*/



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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRisks(){
    if(!this.score){
        this.score ={}
    }
    let devices = datastore.getDevices();
    //console.log(devices)
    let table = document.getElementById("risk-table")
    let tablehead = table.insertRow()
    let headerText = ["Gerät", "Risiken"]
    headerText.forEach((text)=>{
        let th = document.createElement("th")
        th.innerText = text
        tablehead.appendChild(th)        
    })
    for(let id in devices){
         if(!this.score[id]){
            this.score[id] = {} 
         }
        let device = devices[id];
        //console.log(device)
        let row = table.insertRow()
        let nameCell = row.insertCell()

        let statusIndicator = document.createElement("status-indicator")
        statusIndicator.setAttribute("negative","")
        statusIndicator.setAttribute("pulse","")
        nameCell.appendChild(statusIndicator)
        nameCell.appendChild(document.createTextNode("  "+device.hostname))

 
        let nameDiv = document.createElement("div")
        nameCell.appendChild(nameDiv)

        let space = document.createElement("br")
        nameDiv.appendChild(space)
    
        let toggleInput = document.createElement("input")
        toggleInput.setAttribute("type","checkbox")
        toggleInput.setAttribute("id","unchecked")
        toggleInput.setAttribute("class","cbx hidden")
        nameDiv.appendChild(toggleInput)

        let toggleBtn = document.createElement("label")
        toggleBtn.setAttribute("for","unchecked")
        toggleBtn.setAttribute("class", "lbl")
        nameDiv.appendChild(toggleBtn)
        
        


        let riskCell = row.insertCell()

        riskCell.classList.add("py-0")

        let riskTable = document.createElement("table")
        // console.log("=============")
        // console.log("Risikotabelle")
        // console.log("=============")
        // console.log(id+"-risks")
        riskTable.id=id+"-risks"
        riskTable.setAttribute("width","100%")
        riskCell.appendChild(riskTable)
        for(let risk in device.risks){
            console.log(risk)
            if(!this.score[id][device.risks[risk].riskID]){
                this.score[id][device.risks[risk].riskID]={
                    "probability": device.risks[risk].probability*100,
                    "consequences":{}
                }
                //console.log(this.score[id][device.risks[risk].riskID])
            }
            let riskRow = riskTable.insertRow()
            let cellRiskLeft = riskRow.insertCell()
            let cellRiskRight = riskRow.insertCell()
            let riskNameTable = document.createElement("table")
            cellRiskLeft.appendChild(riskNameTable)
            
            insertprobabilitySlider(cellRiskLeft, id+"-"+device.risks[risk].riskID)
            
            riskNameTable.insertRow().innerText = risk

            let innerRiskTable = document.createElement("table")
            cellRiskRight.appendChild(innerRiskTable)
            innerRiskTable.classList.add("col-sm-12")
            //console.log(device.risks)
            device.risks[risk].consequences.forEach((consequence)=>{
                if(!this.score[id][device.risks[risk].riskID].consequences[consequence.consequenceID]){
                    this.score[id][device.risks[risk].riskID].consequences[consequence.consequenceID] = {
                        "damage": consequence.damage
                    }
                }
                let consequenceRow = innerRiskTable.insertRow()
                consequenceRow.classList.add("justify-content-between")
                let consequenceText = consequenceRow.insertCell()
                consequenceText.innerText = consequence.name
                insertDamageSlider(consequenceRow.insertCell(),id+"-"+device.risks[risk].riskID, consequence.consequenceID)
            })

        }
    }

}
getRisks()

function insertprobabilitySlider(table,id){
    let container = document.createElement("div")
    container.setAttribute("id",id+"-propability")
    let ids = id.split("-")
    let slider =  document.createElement("input")
    slider.setAttribute("type","range")
    slider.min = 0
    slider.max = 100
    slider.value = this.score[ids[0]][ids[1]].probability
    // console.log("=================")
    // console.log("Warscheinlichkeit")
    // console.log("=================")
    // console.log(id+"-probability-slider")
    slider.id = id+"-probability-slider"
    //slider.classList.add("slider")
    slider.onclick = (event) =>{
        event.stopPropagation()
    }

    slider.oninput = (event) =>{
        event.stopPropagation()
        let value = event.target.value
        let id = event.target.id.split(/[-_]+/)
        let label = document.getElementById((id[0]+"-"+id[1]+"-probability"))
        label.innerText = value
    }
    slider.onchange = (event)=>{
        let value = event.target.value  
        let id = event.target.id.split(/[-_]+/)

        this.score[id[0]][id[1]].probability = value
        console.log(this.score[id[0]][id[1]])
    }
    container.appendChild(slider)

    let label = document.createElement("label")
    label.setAttribute("id",id+"-probability-label")
    label.innerText ="test"
    label.innerHTML ="Wahrscheinlichkeit: <span id='"+id+"-probability'>"+slider.value+"</span> %"
    container.appendChild(label)
    table.appendChild(container)
}

function insertDamageSlider(cell,riskId, consequenceID){
    cell.setAttribute("width","150px")
    let container = document.createElement("div")
    let ids = riskId.split("-")
    //container.id=riskId+"-"+consequenceID+"-consequence"
    let slider =  document.createElement("input")
    slider.setAttribute("type","range")
    slider.min = 1
    slider.max = 5
    slider.value = this.score[ids[0]][ids[1]].consequences[consequenceID].damage
    //console.log("==============")
    //console.log("Schaden-Slider")
    //console.log("==============")
    //console.log(riskId+"-"+consequenceID+"-damage-slider")
    slider.id = riskId+"-"+consequenceID+"-damage-slider"
    slider.classList.add("slider")    
    slider.oninput = (event) =>{        
        let value = event.target.value
        let id = event.target.id.split("-")
        console.log(id.slice(0,3).join("-")+"damage")        
        let label = document.getElementById(id.slice(0,3).join("-")+"-damage")
        label.innerText=value
        //datastore.changeValue(id[0],"risks",id.slice(0,3).join("-"),value)
        //if(this.data[id[0]][id[1]])
    }
    container.appendChild(slider)

    let label = document.createElement("label")
    //label.setAttribute("id",id+"-damage-label")
    label.innerHTML ="Schadenshöhe: <span id='"+riskId+"-"+consequenceID+"-damage'>"+slider.value+"</span>"
    container.appendChild(label)
    cell.appendChild(container)
}
