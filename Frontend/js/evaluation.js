var datastore = require("./js/frontend").datastore

/*loader-Funktion: wird beim öffnen der Auswertungsseite ausgeführt*/
function loader() {
    toggleLoad()
    datastore.checkForRisks().then(res =>{
        let dev = JSON.parse(res)
        toggleLoad()
        getRisks(dev)
    })    
}

/*'getRisks' erzeugt aus den übermittelten Informationen die Auswertungsseite */
function getRisks(devices) {
    checkOverallRisk()  // erzeugt Statusanzeige, s.u.
    if (!this.score) {
        this.score = {}
    }
    // holen der Tabelle aus HTML-file, definieren der Überschriften
    let table = document.getElementById("risk-table")
    let tablehead = table.insertRow()
    let headerText = ["Gerät", "Risiken &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp Folgen/ Maßnahmen &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp  Schaden"]
    headerText.forEach((text) => {
        let th = document.createElement("th")
        th.innerHTML = text
        tablehead.appendChild(th)
    })

    for (let id in devices) {
        if (devices[id].devicetype && devices[id].devicetype !=="Unbekannt" && Object.keys(devices[id].risks).length>0) {
            if (!this.score[id]) {
                this.score[id] = {}
            }
            // Definieren einer Zeile je Gerät
            let device = devices[id];
            let row = table.insertRow()
            let nameCell = row.insertCell()
            nameCell.setAttribute("style", "width:180px")
            // Statusleuchte für jedes Gerät
            let statusIndicator = document.createElement("status-indicator") 
            statusIndicator.id = id + "-status"
            nameCell.appendChild(statusIndicator)

            let devicet
            if (device.devicetype === undefined) {
                devicet = "unbekannt"
            } else {
                devicet = device.devicetype
            }
            // Anzeige Gerätename und Gerätetyp
            nameCell.appendChild(document.createTextNode("  " + device.hostname + " (" + devicet + ")"))

            let nameDiv = document.createElement("div")
            nameCell.appendChild(nameDiv)
            let space = document.createElement("br")
            nameDiv.appendChild(space)
            // Schalter zum ein- und ausblenden der Risiken des Gerätes
            let toggleInput = document.createElement("input")
            toggleInput.setAttribute("type", "checkbox")
            toggleInput.setAttribute("id", id + "-toggle")
            toggleInput.setAttribute("class", "cbx hidden")
            nameDiv.appendChild(toggleInput)
            let toggleBtn = document.createElement("label")
            toggleBtn.setAttribute("for", id + "-toggle")
            toggleBtn.setAttribute("class", "lbl")
            nameDiv.appendChild(toggleBtn)

            // onclick-Event für Klick auf den Schalter
            toggleInput.onclick = (event) => {
                if (event.target.checked === false) {
                    $(riskTable).hide();
                } else if (event.target.checked === true) {                  
                    $(riskTable).show();
                }
            }
            // Risiken-Anzeige
            let riskCell = row.insertCell()
            riskCell.classList.add("py-0")
            let riskTable = document.createElement("table")
            riskTable.setAttribute("style", "display:none") //standardmäßig ausgeblendet
            riskTable.id = id + "-risks"
            riskTable.setAttribute("width", "100%")
            riskCell.appendChild(riskTable)
            // Zuordnen der Wahrscheinlichkeit und Schadenshöhen
            for (let risk in device.risks) {
                if (!this.score[id][device.risks[risk].riskID]) {
                    this.score[id][device.risks[risk].riskID] = {
                        "probability": device.risks[risk].probability * 100,
                        "defaultProbability": device.risks[risk].defaultProbability * 100,
                        "consequences": {},
                        "name": risk
                    }
                }
                // Definition Tabellenstruktur/- aufbau
                let riskRow = riskTable.insertRow()
                let cellRiskLeft = riskRow.insertCell()     // Anzeige Risiken
                let cellRiskRight = riskRow.insertCell()    // Anzeige Folgen/Maßnahmen
                let riskNameTable = document.createElement("table")
                cellRiskLeft.appendChild(riskNameTable)
                // Wahtscheinlichkeitsregler für Risiko
                insertprobabilitySlider(cellRiskLeft, id + "-" + device.risks[risk].riskID)
                // Einfügen der einzelnen Risiken je in eine eigene Zeile
                riskNameTable.insertRow().innerText = risk
                // Folgentabelle 
                let consequencesTable = document.createElement("table")
                cellRiskRight.classList.add("py-0")                
                cellRiskRight.appendChild(consequencesTable)
                consequencesTable.classList.add("col-sm-12")
                consequencesTable.id = id + "-" + device.risks[risk].riskID + "-consequences"
                device.risks[risk].consequences.sort((a,b)=>{
                    return (a.damage < b.damage)
                })
                device.risks[risk].consequences.forEach((consequence) => {
                    if (!this.score[id][device.risks[risk].riskID].consequences[consequence.consequenceID]) {
                        this.score[id][device.risks[risk].riskID].consequences[consequence.consequenceID] = {
                            "damage": consequence.damage,
                            "defaultDamage": consequence.defaultDamage
                        }
                    }
                    // Anlegen von Zeile für einzelen Folgen
                    let consequenceRow = consequencesTable.insertRow()
                    consequenceRow.classList.add("justify-content-between")
                    let consequenceText = consequenceRow.insertCell()
                    let consequenceTitle = document.createElement("div")
                    let consequenceDescription = document.createElement("div")
                    // Anzeige Folge incl. Beschreibung
                    consequenceTitle.innerText = consequence.name+":"
                    consequenceDescription.innerText = consequence.description

                    consequenceText.appendChild(consequenceTitle)
                    consequenceText.appendChild(consequenceDescription)
                    // Slider für Schadenshöhe je Folge
                    insertDamageSlider(consequenceRow.insertCell(), id + "-" + device.risks[risk].riskID, consequence.consequenceID)
                    checkRiskLevelFor([id, device.risks[risk].riskID])                    
                })

                // Maßnahmen-Tabelle (kann alternativ zu Folgen angezeigt werden)
                let countermeasuresTable = document.createElement("table")
                countermeasuresTable.setAttribute("style","display:none") //standardmäßig ausgeblendet
                cellRiskRight.appendChild(countermeasuresTable)
                countermeasuresTable.classList.add("col-sm-12")
                countermeasuresTable.id = id + "-" + device.risks[risk].riskID + "-countermeasures"
                device.risks[risk].countermeasures.forEach((countermeasure) => {
                    // Einfügen und Befüllen einzelner Zeilen für Maßnahmen
                    let countermeasureRow = countermeasuresTable.insertRow()
                    countermeasureRow.innerText = countermeasure.name
                })

                let space1 = document.createElement("br")
                cellRiskLeft.appendChild(space1)
                space1.setAttribute("id", id +"-"+ device.risks[risk].riskID + "-space1")
                //Folgen/Maßnahmen-Anzeige-Schalter
                let toggleText = document.createElement("a")
                cellRiskLeft.appendChild(toggleText)
                toggleText.setAttribute("id", id +"-"+ device.risks[risk].riskID + "-toggleText")
                //Schalter Option 1: Folgen 
                let toggleTextLeft = document.createElement("a")
                toggleText.appendChild(toggleTextLeft)
                toggleTextLeft.innerText = 'Folgen ';
                // Schalter-Definition
                let toggleInputSw = document.createElement("input")
                toggleInputSw.setAttribute("type", "checkbox")
                toggleInputSw.setAttribute("id", id +"-"+ device.risks[risk].riskID + "-toggleSw")
                toggleInputSw.setAttribute("class", "cbx1 hidden")
                toggleText.appendChild(toggleInputSw)
                let toggleBtnSw = document.createElement("label")
                toggleBtnSw.setAttribute("for", id +"-"+ device.risks[risk].riskID + "-toggleSw")
                toggleBtnSw.setAttribute("class", "lbl1 mb-0")
                toggleText.appendChild(toggleBtnSw)
                // Schalter Option 2: Maßnahmen
                let toggleTextRight = document.createElement("a")
                toggleText.appendChild(toggleTextRight)
                toggleTextRight.innerText = ' Maßnahmen';
                //onclick-Event Schalter um Anzeige zu ändern
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
    slider.setAttribute("style", "width:155px")
    slider.classList.add("slider")

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
        let riskName = this.score[id[0]][id[1]].name
        datastore.changeValue([id[0],riskName],(value/100),"probability")
        
        let consTable = document.getElementById(id[0] + "-" + id[1] + "-consequences")
        let countermTable = document.getElementById(id[0] + "-" + id[1] + "-countermeasures")
        let sp = document.getElementById(id[0] +"-"+ id[1] + "-space1")
        let toggleT = document.getElementById(id[0] +"-"+ id[1] + "-toggleText")
        // console.log(toggleT)
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

    let resetButton = document.createElement("i")
    resetButton.classList.add("fa","fa-undo","align-text-top")
    resetButton.id = id + "-probability-undo"
    resetButton.title = "reset"
    resetButton.onclick = (event)=>{
        let id = event.target.id.split('-')
        let value = this.score[id[0]][id[1]].defaultProbability
        let riskName =this.score[id[0]][id[1]].name
        datastore.changeValue([id[0],riskName],(value/100),"probability")
        this.score[id[0]][id[1]].probability = value
        //alert("works - "+value)

        slider.value = value
        let label = document.getElementById((id[0] + "-" + id[1] + "-probability"))
        label.innerText = value

        checkRiskLevelFor(id)
    }
    container.appendChild(resetButton)

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
    slider.setAttribute("style", "width:85px; margin-top:7px")
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
        let riskName = this.score[id[0]][id[1]].name        
        this.score[id[0]][id[1]].consequences[id[2]].damage = value
        datastore.changeValue([id[0],riskName,id[2]],value,"damage")        
        checkRiskLevelFor(id);
    }
    container.appendChild(slider)

    let resetButton = document.createElement("i")
    resetButton.classList.add("fa","fa-undo","align-text-top")
    resetButton.id = riskId + "-" + consequenceID + "-damage-undo"
    resetButton.title = "reset"
    resetButton.onclick = (event)=>{
        let id = event.target.id.split('-')
        let value = this.score[id[0]][id[1]].consequences[id[2]].defaultDamage
        let riskName =this.score[id[0]][id[1]].name
        datastore.changeValue([id[0],riskName,id[2]],100,"damage")
        this.score[id[0]][id[1]].probability = value
        slider.value = value
        let label = document.getElementById(id.slice(0, 3).join("-") + "-damage")
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
        checkRiskLevelFor(id)
    }
    container.appendChild(resetButton)

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
    // console.log(riskLevelChanged)
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