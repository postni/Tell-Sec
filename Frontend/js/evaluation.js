var datastore = require("./js/frontend").datastore

function getRisks(){
    if(!this.score){
        this.score ={}
    }
    let devices = datastore.getDevices();
    //console.log(devices)
    let table = document.getElementById("risk-table")
    let tablehead = table.insertRow()
    let headerText = ["Gerät", "Risiken &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp Folgen &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp Schaden"]
    headerText.forEach((text)=>{
        let th = document.createElement("th")
        th.innerHTML = text
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
        nameCell.setAttribute("style","width:180px")

        let statusIndicator = document.createElement("status-indicator")
        statusIndicator.id = id+"-status"
        nameCell.appendChild(statusIndicator)

        let devicet
        if (device.devicetype === undefined){
            devicet = "unbekannt"
        }else {
            devicet = device.devicetype
        }

        nameCell.appendChild(document.createTextNode("  "+device.hostname+" ("+devicet+")"))

 
        let nameDiv = document.createElement("div")
        nameCell.appendChild(nameDiv)

        let space = document.createElement("br")
        nameDiv.appendChild(space)
    
        let toggleInput = document.createElement("input")
        toggleInput.setAttribute("type","checkbox")
        toggleInput.setAttribute("id",id+"-toggle")
        toggleInput.setAttribute("class","cbx hidden")
        nameDiv.appendChild(toggleInput)

        let toggleBtn = document.createElement("label")
        toggleBtn.setAttribute("for",id+"-toggle")
        toggleBtn.setAttribute("class", "lbl")
        nameDiv.appendChild(toggleBtn)
        
        console.log (toggleInput.checked)
       
        toggleInput.onclick = (event) => {

        
        if(event.target.checked === false){
           
                $(riskTable).hide();
            
        }else if (event.target.checked === true){
           
                $(riskTable).show();
            
        }}


        let riskCell = row.insertCell()

        riskCell.classList.add("py-0")

        let riskTable = document.createElement("table")
        riskTable.setAttribute("style","display:none")
        // console.log("=============")
        // console.log("Risikotabelle")
        // console.log("=============")
        // console.log(id+"-risks")
        riskTable.id=id+"-risks"
        riskTable.setAttribute("width","100%")
        riskCell.appendChild(riskTable)
        for(let risk in device.risks){
            //console.log(risk)
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
            innerRiskTable.id = id+"-"+device.risks[risk].riskID+"-consequences"
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
            checkRiskLevelFor([id,device.risks[risk].riskID])

        }
    }

}
getRisks()



function insertprobabilitySlider(table,id){
    let container = document.createElement("div")
    container.setAttribute("style","width:175px")
    let ids = id.split("-")
    let slider =  document.createElement("input")
    slider.setAttribute("type","range")
    slider.min = 0
    slider.max = 100
    slider.value = this.score[ids[0]][ids[1]].probability
    slider.classList.add("slider")        
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
        let id = event.target.id.split('-')
        let label = document.getElementById((id[0]+"-"+id[1]+"-probability"))
        label.innerText = value
    }
    slider.onchange = (event)=>{
        let value = event.target.value  
        let id = event.target.id.split('-')
        this.score[id[0]][id[1]].probability = value
        let consTable = document.getElementById(id[0]+"-"+id[1]+"-consequences")        
        if(value <= 0){
            consTable.classList.add("hidden")
        }else{
            consTable.classList.remove("hidden")            
        }
        checkRiskLevelFor(id);
        //console.log(this.score[id[0]][id[1]])
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
    cell.setAttribute("width","200px")
    let container = document.createElement("div")
    let ids = riskId.split("-")
    //container.id=riskId+"-"+consequenceID+"-consequence"
    let slider =  document.createElement("input")
    slider.setAttribute("type","range")
    slider.setAttribute("style","width:100px; margin-top:7px")
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
        let value = parseInt(event.target.value)
        let id = event.target.id.split("-")
        console.log(id.slice(0,3).join("-")+"damage")        
        let label = document.getElementById(id.slice(0,3).join("-")+"-damage")
        console.log(value)
        let valueshow
        if(value===1){
            valueshow='sehr gering'
        }else if (value===2){
            valueshow='gering'
        }else if (value===3){
            valueshow='mittel'
        }else if (value===4){
            valueshow='hoch'
        }else if (value===5){
            valueshow='sehr hoch'
        }
        label.innerText=valueshow
    }

    slider.onchange = (event) =>{
        let value = event.target.value  
        let id = event.target.id.split('-')   
        console.log(id)     
        this.score[id[0]][id[1]].consequences[id[2]].damage = value

        checkRiskLevelFor(id);
        //TODO:
        //Change Value in SessionStorage
    }
    container.appendChild(slider)

    let label = document.createElement("label")
    label.setAttribute("style","margin-top:0px")
    //label.setAttribute("id",id+"-damage-label")
    let hoehe
    if(parseInt(slider.value) === 1) {
        hoehe = 'sehr gering'
    }else if(parseInt(slider.value) === 2){
        hoehe = 'gering'
    }else if(parseInt(slider.value) === 3){
        hoehe = 'mittel'
    }else if(parseInt(slider.value) === 4){
        hoehe = 'hoch'
    }else if(parseInt(slider.value) === 5){
        hoehe = 'sehr hoch'
    }
    label.innerHTML ="&nbsp &nbsp <span id='"+riskId+"-"+consequenceID+"-damage'>"+hoehe+"</span>"
    container.appendChild(label)
    cell.appendChild(container)
}

function checkRiskLevelFor(elementID){
    risk = 0.0;
    let allDamageElements = document.querySelectorAll("[id^='"+elementID[0]+"-"+elementID[1]+"'][id$='-damage-slider']")
    let probabilityElement = document.getElementById(elementID[0]+"-"+elementID[1]+"-probability-slider")
    let riskDamage = 0;
    for(damageElement in allDamageElements){
        if(parseInt(damageElement)){
        //console.log(allDamageElements[damageElement].value)
        riskDamage+=parseInt(allDamageElements[damageElement].value)
        }
    }
    risk = (riskDamage*parseFloat(probabilityElement.value))/100

    this.score[elementID[0]][elementID[1]].riskLevel = risk
    checkRiskForDevice(elementID[0])
}

function checkRiskForDevice(deviceID){
    let sumAllRiskLevels = 0.0
    for(risk in this.score[deviceID]){
        if(parseInt(risk)){
            sumAllRiskLevels+= this.score[deviceID][risk].riskLevel
        }
    }
    console.log(sumAllRiskLevels);
    this.score[deviceID].riskLevel = sumAllRiskLevels
    let statusIndicator = document.getElementById(deviceID+"-status")
    console.log(statusIndicator)
    if(sumAllRiskLevels<=20){
        statusIndicator.removeAttribute("negative")
        statusIndicator.removeAttribute("intermediary")
        statusIndicator.removeAttribute("pulse")        
        statusIndicator.setAttribute("positive","")
    }else if(sumAllRiskLevels>20 && sumAllRiskLevels<=60){
        statusIndicator.removeAttribute("negative")
        statusIndicator.removeAttribute("positive")
        statusIndicator.removeAttribute("pulse")        
        statusIndicator.setAttribute("intermediary","")
    }else{
        statusIndicator.removeAttribute("intermediary")
        statusIndicator.removeAttribute("positive")
        statusIndicator.setAttribute("pulse","")        
        statusIndicator.setAttribute("negative","")
    }
    checkOverallRisk()
}
function checkOverallRisk(){
    let sumAllRiskLevels =0.0
    let deviceCount = 0
    var good=document.getElementById('good');
    var ok=document.getElementById('ok');
    var stop=document.getElementById('stop');

    for(let id in this.score){
        sumAllRiskLevels+=score[id].riskLevel
        deviceCount++
    }
    sumAllRiskLevels/=deviceCount
    if(sumAllRiskLevels<=20){
        good.style.display = "block";
        stop.style.display = "none";
        ok.style.display = "none";        
    }else if(sumAllRiskLevels>20 && sumAllRiskLevels<=60){
        good.style.display = "none";        
        ok.style.display = "block";
        stop.style.display = "none";                
    }else{
        good.style.display = "none";        
        stop.style.display = "block";     
        ok.style.display = "none";        
    }

}
