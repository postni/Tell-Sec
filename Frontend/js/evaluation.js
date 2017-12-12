var datastore = require("./js/frontend").datastore

function loader() {
    toggleLoad()
    datastore.checkForRisks().then(res =>{
        console.log(res)
        let dev = JSON.parse(res)
        console.log(dev)
        toggleLoad()
        getRisks(dev)
    })    
}

function getRisks(devices) {
    checkOverallRisk()
    if (!this.score) {
        this.score = {}
    }
    //console.log(devices)
    let table = document.getElementById("risk-table")
    let tablehead = table.insertRow()
    let headerText = ["Gerät", "Risiken &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp Folgen/ Maßnahmen &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp  Schaden"]
    headerText.forEach((text) => {
        let th = document.createElement("th")
        th.innerHTML = text
        tablehead.appendChild(th)
    })
    for (let id in devices) {
        console.log(id)
        // console.log(devices[id])
        // if(!devices[id].risks||typeof devices[id].risks === typeof []){
        //     devices[id].risks = {}
        // }
        
        console.log(devices[id].risks)
        
        if (devices[id].devicetype && devices[id].devicetype !=="Unbekannt" && Object.keys(devices[id].risks).length>0) {
            console.log(devices[id].devicetype)
            if (!this.score[id]) {
                this.score[id] = {}
            }
            let device = devices[id];
            //console.log(device)
            let row = table.insertRow()
            let nameCell = row.insertCell()
            nameCell.setAttribute("style", "width:180px")

            let statusIndicator = document.createElement("status-indicator")
            statusIndicator.id = id + "-status"
            nameCell.appendChild(statusIndicator)

            let devicet
            if (device.devicetype === undefined) {
                devicet = "unbekannt"
            } else {
                devicet = device.devicetype
            }

            nameCell.appendChild(document.createTextNode("  " + device.hostname + " (" + devicet + ")"))


            let nameDiv = document.createElement("div")
            nameCell.appendChild(nameDiv)

            let space = document.createElement("br")
            nameDiv.appendChild(space)

            let toggleInput = document.createElement("input")
            toggleInput.setAttribute("type", "checkbox")
            toggleInput.setAttribute("id", id + "-toggle")
            toggleInput.setAttribute("class", "cbx hidden")
            nameDiv.appendChild(toggleInput)

            let toggleBtn = document.createElement("label")
            toggleBtn.setAttribute("for", id + "-toggle")
            toggleBtn.setAttribute("class", "lbl")
            nameDiv.appendChild(toggleBtn)

            //console.log(toggleInput.checked)

            toggleInput.onclick = (event) => {

                //console.log(event)
                if (event.target.checked === false) {
                    //console.log(riskTable)
                    $(riskTable).hide();

                } else if (event.target.checked === true) {
                    //console.log(riskTable)                    
                    $(riskTable).show();

                }
            }


            let riskCell = row.insertCell()

            riskCell.classList.add("py-0")

            let riskTable = document.createElement("table")
            riskTable.setAttribute("style", "display:none")
            // console.log("=============")
            // console.log("Risikotabelle")
            // console.log("=============")
            // console.log(id+"-risks")
            riskTable.id = id + "-risks"
            riskTable.setAttribute("width", "100%")
            
            riskCell.appendChild(riskTable)
            console.log(device)
            for (let risk in device.risks) {
                console.log(risk)
                if (!this.score[id][device.risks[risk].riskID]) {
                    this.score[id][device.risks[risk].riskID] = {
                        "probability": device.risks[risk].probability * 100,
                        "consequences": {}
                    }
                    //console.log(this.score[id][device.risks[risk].riskID])
                }
                let riskRow = riskTable.insertRow()
                let cellRiskLeft = riskRow.insertCell()
                let cellRiskRight = riskRow.insertCell()
                let riskNameTable = document.createElement("table")
                cellRiskLeft.appendChild(riskNameTable)

                insertprobabilitySlider(cellRiskLeft, id + "-" + device.risks[risk].riskID)



                
                riskNameTable.insertRow().innerText = risk

                let consequencesTable = document.createElement("table")
                cellRiskRight.classList.add("py-0")                
                cellRiskRight.appendChild(consequencesTable)
                consequencesTable.classList.add("col-sm-12")
                consequencesTable.id = id + "-" + device.risks[risk].riskID + "-consequences"
                device.risks[risk].consequences.forEach((consequence) => {
                    if (!this.score[id][device.risks[risk].riskID].consequences[consequence.consequenceID]) {
                        this.score[id][device.risks[risk].riskID].consequences[consequence.consequenceID] = {
                            "damage": consequence.damage
                        }
                    }
                    let consequenceRow = consequencesTable.insertRow()
                    consequenceRow.classList.add("justify-content-between")
                    let consequenceText = consequenceRow.insertCell()
                    let consequenceTitle = document.createElement("div")
                    let consequenceDescription = document.createElement("div")
                    consequenceTitle.innerText = consequence.name+":"
                    consequenceDescription.innerText = consequence.description

                    consequenceText.appendChild(consequenceTitle)
                    consequenceText.appendChild(consequenceDescription)

                    insertDamageSlider(consequenceRow.insertCell(), id + "-" + device.risks[risk].riskID, consequence.consequenceID)
                })


                let countermeasuresTable = document.createElement("table")
                countermeasuresTable.setAttribute("style","display:none")
                cellRiskRight.appendChild(countermeasuresTable)
                countermeasuresTable.classList.add("col-sm-12")
                countermeasuresTable.id = id + "-" + device.risks[risk].riskID + "-countermeasures"
                device.risks[risk].countermeasures.forEach((countermeasure) => {
                    let countermeasureRow = countermeasuresTable.insertRow()
                    countermeasureRow.innerText = countermeasure.name
                })



                checkRiskLevelFor([id, device.risks[risk].riskID])


                let space1 = document.createElement("br")
                cellRiskLeft.appendChild(space1)
                space1.setAttribute("id", id +"-"+ device.risks[risk].riskID + "-space1")

                let toggleText = document.createElement("a")
                cellRiskLeft.appendChild(toggleText)
                toggleText.setAttribute("id", id +"-"+ device.risks[risk].riskID + "-toggleText")
                


                let toggleTextLeft = document.createElement("a")
                toggleText.appendChild(toggleTextLeft)
                toggleTextLeft.innerText = 'Folgen ';

                let toggleInputSw = document.createElement("input")
                toggleInputSw.setAttribute("type", "checkbox")
                toggleInputSw.setAttribute("id", id +"-"+ device.risks[risk].riskID + "-toggleSw")
                toggleInputSw.setAttribute("class", "cbx1 hidden")
                toggleText.appendChild(toggleInputSw)
    
                let toggleBtnSw = document.createElement("label")
                toggleBtnSw.setAttribute("for", id +"-"+ device.risks[risk].riskID + "-toggleSw")
                toggleBtnSw.setAttribute("class", "lbl1 mb-0")
                toggleText.appendChild(toggleBtnSw)
                
                let toggleTextRight = document.createElement("a")
                toggleText.appendChild(toggleTextRight)
                toggleTextRight.innerText = ' Maßnahmen';
                //console.log(toggleInput.checked)
    
           
           
                toggleInputSw.onclick = (event) => {
    
    
                    if (event.target.checked === false) {
    
                        $(consequencesTable).show();
                        $(countermeasuresTable).hide();

    
                    } else if (event.target.checked === true) {
    
                        $(consequencesTable).hide();
                        $(countermeasuresTable).show();
    
                    }
                }
            }
        }
    }

}


function insertprobabilitySlider(table, id) {
    let container = document.createElement("div")
    container.setAttribute("style", "width:175px")
    let ids = id.split("-")
    let slider = document.createElement("input")
    slider.setAttribute("type", "range")
    slider.min = 0
    slider.max = 100
    slider.value = this.score[ids[0]][ids[1]].probability
    slider.classList.add("slider")
    // console.log("=================")
    // console.log("Warscheinlichkeit")
    // console.log("=================")
    // console.log(id+"-probability-slider")
    slider.id = id + "-probability-slider"
    //slider.classList.add("slider")
    slider.onclick = (event) => {
        event.stopPropagation()
    }

    slider.oninput = (event) => {
        event.stopPropagation()
        let value = event.target.value
        let id = event.target.id.split('-')
        let label = document.getElementById((id[0] + "-" + id[1] + "-probability"))
        label.innerText = value
    }
    slider.onchange = (event) => {
        let value = event.target.value
        let id = event.target.id.split('-')
        this.score[id[0]][id[1]].probability = value
        let consTable = document.getElementById(id[0] + "-" + id[1] + "-consequences")
        let countermTable = document.getElementById(id[0] + "-" + id[1] + "-countermeasures")
        let sp = document.getElementById(id[0] +"-"+ id[1] + "-space1")
        let toggleT = document.getElementById(id[0] +"-"+ id[1] + "-toggleText")
        console.log(toggleT)
        if (value <= 0) {
            consTable.classList.add("hidden")
            countermTable.classList.add("hidden")
            sp.style.display='none';
            toggleT.style.display='none';
 
        } else {
            consTable.classList.remove("hidden")
            countermTable.classList.remove("hidden")
            sp.style.display='block';
            toggleT.style.display='block';
        }
        checkRiskLevelFor(id);
        //console.log(this.score[id[0]][id[1]])
    }
    container.appendChild(slider)

    let label = document.createElement("label")
    label.setAttribute("id", id + "-probability-label")
    label.innerText = "test"
    label.innerHTML = "Wahrscheinlichkeit: <span id='" + id + "-probability'>" + slider.value + "</span> %"
    container.appendChild(label)
    table.appendChild(container)
}

function insertDamageSlider(cell, riskId, consequenceID) {
    cell.setAttribute("width", "200px")
    let container = document.createElement("div")
    let ids = riskId.split("-")
    //container.id=riskId+"-"+consequenceID+"-consequence"
    let slider = document.createElement("input")
    slider.setAttribute("type", "range")
    slider.setAttribute("style", "width:100px; margin-top:7px")
    slider.min = 1
    slider.max = 5
    slider.value = this.score[ids[0]][ids[1]].consequences[consequenceID].damage
    //console.log("==============")
    //console.log("Schaden-Slider")
    //console.log("==============")
    //console.log(riskId+"-"+consequenceID+"-damage-slider")
    slider.id = riskId + "-" + consequenceID + "-damage-slider"
    slider.classList.add("slider")
    slider.oninput = (event) => {
        let value = parseInt(event.target.value)
        let id = event.target.id.split("-")
        //console.log(id.slice(0, 3).join("-") + "damage")
        let label = document.getElementById(id.slice(0, 3).join("-") + "-damage")
        //console.log(value)
        let valueshow
        if (value === 1) {
            valueshow = 'sehr gering'
        } else if (value === 2) {
            valueshow = 'gering'
        } else if (value === 3) {
            valueshow = 'mittel'
        } else if (value === 4) {
            valueshow = 'hoch'
        } else if (value === 5) {
            valueshow = 'sehr hoch'
        }
        label.innerText = valueshow
    }

    slider.onchange = (event) => {
        let value = event.target.value
        let id = event.target.id.split('-')
        //console.log(id)
        this.score[id[0]][id[1]].consequences[id[2]].damage = value

        checkRiskLevelFor(id);
        //TODO:
        //Change Value in SessionStorage
    }
    container.appendChild(slider)

    let label = document.createElement("label")
    label.setAttribute("style", "margin-top:0px")
    //label.setAttribute("id",id+"-damage-label")
    let hoehe
    if (parseInt(slider.value) === 1) {
        hoehe = 'sehr gering'
    } else if (parseInt(slider.value) === 2) {
        hoehe = 'gering'
    } else if (parseInt(slider.value) === 3) {
        hoehe = 'mittel'
    } else if (parseInt(slider.value) === 4) {
        hoehe = 'hoch'
    } else if (parseInt(slider.value) === 5) {
        hoehe = 'sehr hoch'
    }
    label.innerHTML = "&nbsp &nbsp <span id='" + riskId + "-" + consequenceID + "-damage'>" + hoehe + "</span>"
    container.appendChild(label)
    cell.appendChild(container)
}

function checkRiskLevelFor(elementID) {
    risk = 0.0;
    let allDamageElements = document.querySelectorAll("[id^='" + elementID[0] + "-" + elementID[1] + "'][id$='-damage-slider']")
    let probabilityElement = document.getElementById(elementID[0] + "-" + elementID[1] + "-probability-slider")
    let riskDamage = 0;
    for (damageElement in allDamageElements) {
        if (parseInt(damageElement)) {
            //console.log(allDamageElements[damageElement].value)
            riskDamage += parseInt(allDamageElements[damageElement].value)
        }
    }
    risk = (riskDamage * parseFloat(probabilityElement.value)) / 100

    this.score[elementID[0]][elementID[1]].riskLevel = risk
    checkRiskForDevice(elementID[0])
}

function checkRiskForDevice(deviceID) {
    let sumAllRiskLevels = 0.0
    for (risk in this.score[deviceID]) {
        if (parseInt(risk)) {
            sumAllRiskLevels += this.score[deviceID][risk].riskLevel
        }
    }
    //console.log(sumAllRiskLevels);
    this.score[deviceID].riskLevel = sumAllRiskLevels
    let statusIndicator = document.getElementById(deviceID + "-status")
    //console.log(statusIndicator)
    if (sumAllRiskLevels <= 10) {
        statusIndicator.removeAttribute("negative")
        statusIndicator.removeAttribute("intermediary")
        statusIndicator.removeAttribute("pulse")
        statusIndicator.setAttribute("positive", "")
    } else if (sumAllRiskLevels > 10 && sumAllRiskLevels <= 40) {
        statusIndicator.removeAttribute("negative")
        statusIndicator.removeAttribute("positive")
        statusIndicator.removeAttribute("pulse")
        statusIndicator.setAttribute("intermediary", "")
    } else {
        statusIndicator.removeAttribute("intermediary")
        statusIndicator.removeAttribute("positive")
        statusIndicator.setAttribute("pulse", "")
        statusIndicator.setAttribute("negative", "")
    }
    checkOverallRisk()
}
function checkOverallRisk() {
    let sumAllRiskLevels = -50.0
    let riskLevelChanged = false;
    let deviceCount = 0
    var good = document.getElementById('good');
    var ok = document.getElementById('ok');
    var stop = document.getElementById('stop');
    var empty = document.getElementById('empty')

    for (let id in this.score) {
        sumAllRiskLevels += score[id].riskLevel
        if (sumAllRiskLevels >-50.0 && !riskLevelChanged){
            riskLevelChanged = true;
            sumAllRiskLevels += 50.0
        }
        deviceCount++
    }
    
    sumAllRiskLevels /= deviceCount
    console.log(riskLevelChanged)
    if (sessionStorage.getItem('devices')==='{}' || riskLevelChanged === false) {
        good.style.display = "none";
        stop.style.display = "none";
        ok.style.display = "none";
        empty.style.display = "block";
    } else if (sumAllRiskLevels <= 10) {
        good.style.display = "block";
        stop.style.display = "none";
        ok.style.display = "none";
        empty.style.display = "none";
    } else if (sumAllRiskLevels > 10 && sumAllRiskLevels <= 40) {
        good.style.display = "none";
        ok.style.display = "block";
        stop.style.display = "none";
        empty.style.display = "none";
    } else{
        good.style.display = "none";
        stop.style.display = "block";
        ok.style.display = "none";
        empty.style.display = "none";
    } 

}

function toggleLoad() {
    var i = document.getElementById('loadsc');
    i.classList.toggle("hidden");
}