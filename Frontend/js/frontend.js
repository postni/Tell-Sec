var datastore = require('../../Backend/data');
var ipcRenderer = require('electron').ipcRenderer;
var shell = require("electron").shell;
var testdata = require("../../testdata");

//Klasse die sich um die Organisation der vom Nutzer erstellten und vom Netzwerkscan ausgelesenen Daten kümmert
class Datastore {

    //Anlegen von sessionStorage Keys zur späteren Verwendung
    constructor() {
        if (!sessionStorage.getItem("devices")) {
            sessionStorage.setItem("devices", JSON.stringify({}))
        }
        if (!sessionStorage.getItem("update")) {
            sessionStorage.setItem("update", true)
        }
    }

    //Generieren von neuen IDs für Geräte (inkl. sicherstellen der Eindeutigkeit)
    newID() {
        let devices = this.getDevices()
        let ids = []
        for (let i in devices) {
            ids.push(parseInt(i))
        }
        let largest = Math.max.apply(Math, ids);
        if (largest < 0) {
            largest = 0;
        } else {
            largest++;
        }
        return ("" + largest)
    }

    //Einholen von Testdaten für Demozwecke. Später irrelevant
    getTestdata() {
        sessionStorage.setItem("devices", JSON.stringify(testdata));
        sessionStorage.setItem("update", true)
    }

    //Daten aus Session Storage holen und zurückgeben
    getDevices() {
        let rueckgabe = JSON.parse(sessionStorage.getItem("devices")) ? JSON.parse(sessionStorage.getItem("devices")) : {};
        return rueckgabe;
    }

    //Wert von Objekteigenscht ändern
    //Eingabe: keys (Parameter 1)       || Array aus benötigten keys (z.B. Geräte oder Port IDs)
    //         value (Parameter 2)      || Neuer Wert
    //         type (Parameter 3)       || Art von Attribut welches geändert werden soll
    changeValue(keys, value ,type){
        return new Promise(resolve =>{
            let devices = this.getDevices();
            console.log(keys)
            //Je nach typ werden die Keys an unterschiedlichen Stellen aufgerufen.
            switch (type){
                case "port" :
                    devices[keys[0]].ports[keys[1]].port = value               
                    break;
                case "protocol" : 
                    devices[keys[0]].ports[keys[1]].protocol = value               
                    break;
                case "service" : 
                    devices[keys[0]].ports[keys[1]].service = value               
                    break;
                case "probability" : 
                    devices[keys[0]].risks[keys[1]].probability = value               
                    break;
                case "damage" : 
                    devices[keys[0]].risks[keys[1]].consequences[keys[2]].damage = value               
                    break;
                default:
                    //Standardmäßig werden die Werte direkt unter dem entsprechenden Gerät geändert
                    devices[keys[0]][keys[1]] = value
                break;
            }
    
            sessionStorage.setItem("devices", JSON.stringify(devices))
            resolve("done")
        })
        
    }

    //Neuen Wert zu Array hinzufügen
    //Eingabe: id (Parameter 1)                 || ID des entsprechenden Geräts
    //         key (Parameter 2)                || key auf dem sich das betreffende Array befindet
    //         subkey (Parameter 3)<optional>   ||  "
    //         value (Parameter 4)              || Hinzuzufügender Wert
    addTo(id, key, subkey, value) {
        let devices = this.getDevices();
        if (!devices[id][key]) {
            devices[id][key] = []
        }
        if (subkey) {
            if (!devices[id][key][subkey]) {
                devices[id][key][subkey] = []
            }
            devices[id][key][subkey].push(value)
        } else {
            if (!devices[id][key]) {
                devices[id][key] = []
            }
            devices[id][key].push(value)
        }
        sessionStorage.setItem("devices", JSON.stringify(devices));
    }

    //Hinzufügen von Gerät zu temporären Daten (devices im Session Storage)
    //Eingabe: devices (Parameter 1)        || Informationen zum neuen Gerät
    addDevice(device) {
        let devices = this.getDevices();
        let devicetype = device.devicetype === "Person" ? "Unbekannt" : device.devicetype;
        devices[device.id] = { "devicetype": devicetype };
        sessionStorage.setItem("devices", JSON.stringify(devices))
    }

    //Gerät aus den Temporären Daten löschen Inkl. löschen der Verbindungen aus den Gerätedaten anderer Geräte
    //Eingabe: deviceId (Parameter 1)        || ID des zu löschenden Geräts
    removeDevice(deviceId) {
        let devices = this.getDevices();

        var con = undefined
        if (devices[deviceId].connectedTo) {
            con = devices[deviceId].connectedTo
        }

        var con2me = undefined
        if (devices[deviceId].connectionsToMe) {
            con2me = devices[deviceId].connectionsToMe
        }

        delete devices[deviceId];
        if (con) {
            con.forEach((connection) => {
                if(connection){
                    devices[connection].connectionsToMe = devices[connection].connectionsToMe.filter((id) => {
                        return !(id === deviceId);
                    })
                }
            })
        }
        if (con2me) {
            con2me.forEach((connection) => {
                if(connection){
                    devices[connection].connectedTo = devices[connection].connectedTo.filter((id) => {
                        return !(id === deviceId);
                    })
                }
            })
        }
        var d = JSON.stringify(devices)
        sessionStorage.setItem('devices', d);
    }

    //Hinzufügen bzw. ersetzen von Geräten zu den Temporären Daten (Bei netzwerkscan oder laden von Daten)
    setDevices(newDevices) {
        if (!newDevices) {
            sessionStorage.setItem("update", true)
        } else {
            let connectionsToOthers = {}
            let connectionsFromOthers = {}

            let ipIdMapper = {}

            for (let n in newDevices) {
                if (newDevices[n].connectionsToMe) {
                    if (newDevices[n].connectionsToMe[0].length > 3) {
                        connectionsFromOthers[n] = newDevices[n].connectionsToMe
                        console.log(delete newDevices[n].connectionsToMe)
                    }
                }
                if (newDevices[n].connectedTo) {
                    if (newDevices[n].connectedTo[0].length > 3) {
                        connectionsToOthers[n] = newDevices[n].connectedTo
                        console.log(delete newDevices[n].connectedTo)
                    }
                }
                if (!ipIdMapper[newDevices[n].ip]) {
                    ipIdMapper[newDevices[n].ip] = n
                }
            }
            for (let ip in ipIdMapper) {
                for (let id in connectionsToOthers) {
                    connectionsToOthers[id] = connectionsToOthers[id].map(connection => {
                        if (connection === ip) return ipIdMapper[ip]
                        else return connection
                    })
                }
                for (let id in connectionsFromOthers) {
                    connectionsFromOthers[id] = connectionsFromOthers[id].map(connection => {
                        if (connection === ip) return ipIdMapper[ip]
                        else return connection
                    })
                }
            }
            for (let id in newDevices) {
                if (!newDevices[id].connectedTo) {
                    newDevices[id].connectedTo = connectionsToOthers[id]
                }
                if (!newDevices[id].connectionsToMe) {
                    newDevices[id].connectionsToMe = connectionsFromOthers[id]
                }
            }
            let devices = this.getDevices()

            let newItems = Object.keys(newDevices).length
            let items = Object.keys(devices).length
            let nextID = JSON.parse(this.newID());
            let idMapper = {}

            for (let n in newDevices) {
                let exists = false;
                for (let o in devices) {
                    if ((newDevices[n].ip === devices[o].ip && newDevices[n].ip) || (newDevices[n].mac === devices[o].mac && newDevices[n].mac) || (newDevices[n].hostname === devices[o].hostname && newDevices[n].hostname && newDevices[n].hostname !== "Unbekannt")) {
                        devices[o].hostname = devices[o].hostname ? devices[o].hostname : newDevices[n].hostname ? newDevices[n].hostname : devices[o].devicetype ? devices[o].devicetype : newDevices[n].devicetype;
                        devices[o].ip = devices[o].ip ? devices[o].ip : newDevices[n].ip ? newDevices[n].ip : "Unbekannt";
                        devices[o].mac = devices[o].mac ? devices[o].mac : newDevices[n].mac ? newDevices[n].mac : "Unbekannt";
                        devices[o].ports = devices[o].ports ? devices[o].ports : newDevices[n].openPorts ? newDevices[n].openPorts : "Unbekannt";
                        devices[o].os = devices[o].os ? devices[o].os : newDevices[n].osNmap ? newDevices[n].osNmap : "Unbekannt";
                        devices[o].vendor = devices[o].vendor ? devices[o].vendor : newDevices[n].vendor ? newDevices[n].vendor : "Unbekannt";
                        idMapper[n] = o;
                        exists = true
                    }
                }
                if (!exists) {
                    devices[nextID] = {
                    }
                    devices[nextID]["hostname"] = newDevices[n].hostname ? newDevices[n].hostname : newDevices[n].devicetype ? newDevices[n].devicetype : "Unbekannt";
                    devices[nextID]["ip"] = newDevices[n].ip ? newDevices[n].ip : "Unbekannt"
                    devices[nextID]["mac"] = newDevices[n].mac ? newDevices[n].mac : "Unbekannt"
                    devices[nextID]["ports"] = newDevices[n].openPorts ? newDevices[n].openPorts : []
                    devices[nextID]["os"] = newDevices[n].osNmap ? newDevices[n].osNmap : "Unbekannt"
                    devices[nextID]["vendor"] = newDevices[n].vendor ? newDevices[n].vendor : "Unbekannt"
                    devices[nextID]["devicetype"] = newDevices[n].devicetype ? newDevices[n].devicetype : "Unbekannt"
                    idMapper[n] = JSON.stringify(nextID);
                    nextID++;
                }
            }
            //Ändern von ID's für neue Geräte (Redundanten IDs vorbeugen)
            for (let id in idMapper) {
                if (newDevices[id].connectedTo) {
                    newDevices[id].connectedTo.forEach((connection) => {
                        if (!devices[idMapper[id]].connectedTo) devices[idMapper[id]].connectedTo = []
                        devices[idMapper[id]].connectedTo.push(idMapper[connection])
                    })
                }
                if (newDevices[id].connectionsToMe) {
                    newDevices[id].connectionsToMe.forEach((connection) => {
                        if (!devices[idMapper[id]].connectionsToMe) devices[idMapper[id]].connectionsToMe = []
                        devices[idMapper[id]].connectionsToMe.push(idMapper[connection])
                    })
                }
            }

            sessionStorage.setItem("devices", JSON.stringify(devices))
        }
        sessionStorage.setItem("update", true)
    }

    //Einholen der Risikoinformation (Weiterleiten der Anfrage an Communicatior und von dort aus ans Backend)
    //Ergebnisse über addRisks Funktion in Datensatz einpflegen lassen und abschließend zurückgeben
    checkForRisks() {
        return new Promise(resolve =>{
            sessionStorage.setItem("update", false)        
            communicator.analyseSecurity().then((risks)=>{
                this.addRisks(risks).then(res =>{resolve(res)})
            })
        })
        
    }

    //Einpflegen von Risiken in Datensatz
    //Eingabe: risks (Parameter 1)      || Objekt mit Risikoinformationen für einzelne Gerätetypen
    addRisks(risks) {
        return new Promise(resolve =>{
            let devices = this.getDevices()
            let dTypesPromises = []
            //Durchlaufen aller Gerätetypen in risks
            for(let dType in risks){
                dTypesPromises.push(new Promise(resolve =>{
                    let type = dType==="Statisches Gerät"? "stationär": dType==="Mobiles Gerät"? "mobil":dType==="Maschinensteuerung"?"Maschine":dType==="Netzwerkspeicher"?"NAS":dType;
                    let devicePromises = []
                    //durchlaufen aller Geräte und einpflegen der Risiken für den jeweiligen Gerätetyp
                    for(let id in devices){
                        devicePromises.push(new Promise(resolve =>{
                            let risklist = []
                            if (devices[id].devicetype!=="Unbekannt" && devices[id].devicetype === type && (!devices[id].risks || (devices[id].risks&&!Object.keys(devices[id].risks).length>0))) {
                                risks[dType].forEach((risk) => {
                                    let newRisk = {}
                                    newRisk.consequences = risk.Folgen
                                    newRisk.countermeasures = risk.Massnahmen
                                    newRisk.probability = risk.Eintrittswahrscheinlichkeit
                                    newRisk.defaultProbability = risk.Eintrittswahrscheinlichkeit
                                    newRisk.riskID = risk.riskID
                                    risklist.push({"device":id,"name":risk.Bezeichnung,"data":newRisk})
                                })
                            }
                            resolve(risklist)                            
                        }))
                    }
                    Promise.all(devicePromises).then(resp => {
                        let merged = [].concat.apply([], resp);
                        resolve(merged)})
                }))
            }
            //Aktuallisierte, temporäre Daten einpflegen und an übergeordnete Information zurückgeben
            Promise.all(dTypesPromises).then(res => { 
                    let merged = [].concat.apply([], res);
                    this.assignRisks(devices, merged).then(res => {
                        let deviceString = JSON.stringify(res)
                        sessionStorage.setItem("devices", deviceString)
                        sessionStorage.setItem("update", true)
                        resolve(deviceString)
                    })                      
                
            })
        })        
    }
    assignRisks(devices, risks){
        return new Promise(resolve =>{
            let devWithRisks = devices
            let riskLength = Object.keys(risks).length
            if(riskLength===0) resolve(devices)
            risks.forEach(risk => {
                if(!devWithRisks[risk.device].risks || Array.isArray(devWithRisks[risk.device].risks)) devWithRisks[risk.device].risks = {}
                devWithRisks[risk.device].risks[risk.name] = risk.data
                riskLength--
                console.log(riskLength)
                if(riskLength===0){
                    resolve(devWithRisks)                    
                }
            })
        })
    }
}


//Klasse für dei Komminukation zwischen front und Backend
class Communicator {
    constructor() {
    }

    //Risikoanalyse in Backend starten
    analyseSecurity() {
        return new Promise(resolve => {
            let dev = datastore.getDevices()
            let risks = ipcRenderer.sendSync('analyse-devices', dev);
            resolve(risks)
        })        
    }

    //Netzwerkscan in Backend starten
    scanNetwork() {
        sessionStorage.setItem("update", false)
        ipcRenderer.send('scan-network');
    }

    //Backend beauftragen das Electron Fenster zu maximieren
    maximize() {
        ipcRenderer.send('maximize');
    }

    //Druck der aktuellen Seite als PDF beauftragen
    pdfPrint(path) {
        ipcRenderer.send('print-to-pdf', path);
    }

    //Aufrufen der Tell Homepage in Browser
    callHomepage() {
        shell.openExternal("https://1524300.wixsite.com/tellmesec")
    }

    //Auf Auswertungsseite weiterleiten
    toAnalysis(){
        ipcRenderer.send('go-to-evaluation');
    }

}

//Entgegennehmen der Antwort zum abgeschlossen Netzwerkscan aus dem Backend
//Einpflegen der Daten über setDevices
ipcRenderer.on('scan-complete', (event, data) => {
    console.log("scan complete")
    datastore.setDevices(data);
});


//Exportieren der datastore und communicator klassen zur Verwendung in anderen Frontend Komponenten
datastore = new Datastore()
communicator = new Communicator()
module.exports.datastore = datastore
module.exports.communicator = communicator