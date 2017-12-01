var datastore = require('../../Backend/data');
var ipcRenderer = require('electron').ipcRenderer;


class Datastore {

    constructor() {
        console.log('test////////*****//////')
        if (!sessionStorage.getItem("devices")) {
            sessionStorage.setItem("devices", JSON.stringify({}))
        }
        if (!sessionStorage.getItem("update")) {
            sessionStorage.setItem("update", true)

        }
    }

    newID() {
        console.log("<newID()>")
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

    getTestdata() {
        console.log("<getTestdata()>")
        let testdata = {
            "1": {
                "hostname": "Timo",
                "vendor": "TimoTec",
                "connectedTo": ["3"],
                "connectionsToMe": [""],
                "os": "Timo94",
                "ip": "10.23.4.61",
                "mac": "F2:34:A5:67:B2:81",
                "ports": [
                    {
                        "port": "123",
                        "protocol": "test",
                        "service": "SSH"
                    },
                    {
                        "port": "2345",
                        "protocol": "test",
                        "service": "FTP"
                    }
                ],
                //rausnehmen
                /*devicetype": "Client",*/
                "risks": [],
                "categories": []
            },
            "2": {
                "hostname": "Niklas",
                "vendor": "NiklasTec",
                "os": "Niklas94",
                "ip": "10.23.4.62",
                "mac": "F2:34:A5:67:B2:92",
                "connectionsToMe": ["2"],
                "ports": [
                    {
                        "port": "123",
                        "protocol": "test",
                        "service": "SSH"
                    },
                    {
                        "port": "2345",
                        "protocol": "test",
                        "service": "FTP"
                    }
                ],
                //rausnehmen?
                /*"devicetype": "Router",*/
                "risks": [],
                "categories": []
            },
            "3": {
                "hostname": "Benedikt",
                "vendor": "BeneTec",
                "connectedTo": ["2"],
                "connectionsToMe": ["1", "4", "5", "6"],
                "os": "Bene94",
                "ip": "10.23.4.63",
                "mac": "F2:34:A5:67:B2:83",
                "ports": [
                    {
                        "port": "123",
                        "protocol": "test",
                        "service": "SSH"
                    },
                    {
                        "port": "2345",
                        "protocol": "test",
                        "service": "FTP"
                    }
                ],
                "devicetype": "Switch",
                "risks": [],
                "categories": []
            },
            "4": {
                "hostname": "Kübra",
                "vendor": "KübraTec",
                "connectedTo": ["3"],
                "os": "Kübra94",
                "ip": "10.23.4.74",
                "mac": "F2:34:A5:67:B2:94",
                "ports": [
                    {
                        "port": "123",
                        "protocol": "test",
                        "service": "SSH"
                    },
                    {
                        "port": "2345",
                        "protocol": "test",
                        "service": "FTP"
                    }
                ],
                "devicetype": "Client",
                "risks": [],
                "categories": []
            },
            "5": {
                "hostname": "Gülce",
                "vendor": "GülceTec",
                "connectedTo": ["3"],
                "os": "Gülce94",
                "ip": "10.23.4.65",
                "mac": "F2:34:A5:67:B2:85",
                "ports": [
                    {
                        "port": "123",
                        "protocol": "test",
                        "service": "SSH"
                    },
                    {
                        "port": "2345",
                        "protocol": "test",
                        "service": "FTP"
                    }
                ],
                "devicetype": "Client",
                "risks": [],
                "categories": []
            },
            "6": {
                "hostname": "Hakan",
                "vendor": "HakanTec",
                "connectedTo": ["3"],
                "os": "Hakan94",
                "ip": "10.23.4.66",
                "mac": "F2:34:A5:67:B2:86",
                "ports": [
                    {
                        "port": "123",
                        "protocol": "test",
                        "service": "SSH"
                    },
                    {
                        "port": "2345",
                        "protocol": "test",
                        "service": "FTP"
                    }
                ],
                "devicetype": "Client",
                "risks": [],
                "categories": []
            }
        }
        sessionStorage.setItem("devices", JSON.stringify(testdata));
        sessionStorage.setItem("update", true)
        console.log("</getTestdata()>")
    }


    getDevices() {
        console.log("<getDevices()>")
        let rueckgabe = JSON.parse(sessionStorage.getItem("devices"))?JSON.parse(sessionStorage.getItem("devices")):{};
        return rueckgabe;
    }

    changeValue(id, key, subkey, value) {
        console.log("<changeValue()>")
        
        let devices = this.getDevices();
        console.log(devices)
        if (subkey) {
            devices[id][key][subkey] = value;
        } else {
            devices[id][key] = value;
        }



        sessionStorage.setItem("devices", JSON.stringify(devices));
    }

    addTo(id, key, subkey, value) {
        console.log("<addTo()>")        
        let devices = this.getDevices();
        console.log(devices)
        if (!devices[id][key]) {
            devices[id][key] = []
        }
        if (subkey) {
            if (!devices[id][key][subkey]) {
                devices[id][key][subkey] = []
            }
            devices[id][key][subkey].push(value)
        } else {
            devices[id][key].push(value)
        }
        console.log(devices)
        sessionStorage.setItem("devices", JSON.stringify(devices));
    }

    addDevice(device) {
        console.log("<addDevice()>")        
        let devices = this.getDevices();

        let devicetype = device.devicetype === "Person" ? "Unbekannt" : device.devicetype;
        devices[device.id] = { "devicetype": devicetype };

        sessionStorage.setItem("devices", JSON.stringify(devices))
    }

    removeDevice(deviceId) {
        console.log("<removeDevice()>")
        
        let devices = this.getDevices();
        // console.log(devices[deviceId])
        //console.log(deviceId)
        var con = devices[deviceId].connectedTo ? devices[deviceId].connectedTo : null;

        var con2me = devices[deviceId].connectionsToMe ? devices[deviceId].connectionsToMe : null;
        console.log(con2me)
        delete devices[deviceId];
        //console.log(devices)
        //console.log(con)
        if (con) {
            con.forEach((connection) => {
                devices[connection].connectionsToMe = devices[connection].connectionsToMe.filter((id) => {
                    return !(id === deviceId);
                })

            })
        }
        if (con2me) {
            con2me.forEach((connection) => {
                devices[connection].connectedTo = devices[connection].connectedTo.filter((id) => {
                    return !(id === deviceId);
                })

            })
        }


        console.log(devices)
        var d = JSON.stringify(devices)
        sessionStorage.setItem('devices', d);

    }

    setDevices(newDevices) {
        console.log("<setDevice()>")
        
        if (!newDevices) {
            console.log("keine neuen Geräte")
            sessionStorage.setItem("update", true)
        } else {
            let devices = this.getDevices()

            let newItems = Object.keys(newDevices).length
            let items = Object.keys(devices).length
            let nextID = this.newID();
            let idMapper = {}
            for (let n in newDevices) {
                let exists = false;

                for (let o in devices) {
                    if ((newDevices[n].ip === devices[o].ip && newDevices[n].ip) || (newDevices[n].mac === devices[o].mac && newDevices[n].mac)|| (newDevices[n].hostname === devices[o].hostname && newDevices[n].hostname && newDevices[n].hostname!=="Unbekannt")) {
                        devices[o].hostname = devices[o].hostname ? devices[o].hostname : newDevices[n].hostname?newDevices[n].hostname:devices[o].devicetype?devices[o].devicetype:newDevices[n].devicetype;
                        devices[o].ip = devices[o].ip ? devices[o].ip : newDevices[n].ip?newDevices[n].ip:"Unbekannt";
                        devices[o].mac = devices[o].mac ? devices[o].mac : newDevices[n].mac?newDevices[n].mac:"Unbekannt";
                        devices[o].ports = devices[o].ports ? devices[o].ports : newDevices[n].openPorts?newDevices[n].openPorts:"Unbekannt";
                        devices[o].os = devices[o].os ? devices[o].os : newDevices[n].osNmap?newDevices[n].osNmap:"Unbekannt";
                        devices[o].vendor = devices[o].vendor ? devices[o].vendor : newDevices[n].vendor?newDevices[n].vendor:"Unbekannt";
                        idMapper[n]=o;
                        exists = true
                    }
                    //itemsInner--
                }
                if (!exists) {
                    devices[nextID] = {
                    }
                    devices[nextID]["hostname"] = newDevices[n].hostname ? newDevices[n].hostname : newDevices[n].devicetype ? newDevices[n].devicetype: "Unbekannt";
                    devices[nextID]["ip"] = newDevices[n].ip ? newDevices[n].ip : "Unbekannt"
                    devices[nextID]["mac"] = newDevices[n].mac ? newDevices[n].mac : "Unbekannt"
                    devices[nextID]["ports"] = newDevices[n].openPorts ? newDevices[n].openPorts : []
                    devices[nextID]["os"] = newDevices[n].osNmap ? newDevices[n].osNmap : "Unbekannt"
                    devices[nextID]["vendor"] = newDevices[n].vendor ? newDevices[n].vendor : "Unbekannt"
                    devices[nextID]["devicetype"] = newDevices[n].devicetype ? newDevices[n].devicetype : "Unbekannt"
                    idMapper[n]=nextID;
                    // devices[nextID]["connetedTo"] = newDevices[n].connetedTo ? newDevices[n].connetedTo : []
                    // devices[nextID]["connectionsToMe"] = newDevices[n].connectionsToMe ? newDevices[n].connectionsToMe : []
                    nextID++;
                }

            }
            console.log(idMapper)

            for(let id in idMapper){
                if(newDevices[id].connectedTo){
                    newDevices[id].connectedTo.forEach((connection)=>{
                        if(!devices[idMapper[id]].connectedTo)devices[idMapper[id]].connectedTo=[] 
                        devices[idMapper[id]].connectedTo.push(idMapper[connection])
                    })
                }
                if(newDevices[id].connectionsToMe){
                    newDevices[id].connectionsToMe.forEach((connection)=>{
                        if(!devices[idMapper[id]].connectionsToMe)devices[idMapper[id]].connectionsToMe=[]                         
                        devices[idMapper[id]].connectionsToMe.push(idMapper[connection])
                    })
                }
            }

            console.log("devices - after")
            console.log(devices)

            sessionStorage.setItem("devices", JSON.stringify(devices))
            
            console.log("==========================================")
        }
        sessionStorage.setItem("update", true)        
    }

    checkForRisks() {
        console.log("<checkForRisks()>")
        communicator.analyseSecurity();
    }

    addRisks(risks) {
        console.log("<addRisk()>")        
        let devices = this.getDevices()
        for (let dType in risks) {
            for (let id in devices) {
                if (devices[id].devicetype === dType && devices[id].risks) {
                    devices[id].risks = {}
                    risks[dType].forEach((risk) => {
                        let newRisk = {}
                        newRisk.consequences = risk.Folgen
                        newRisk.countermeassures = risk.Massnahmen
                        newRisk.probability = risk.Eintrittswahrscheinlich
                        newRisk.riskID = risk.riskID
                        devices[id].risks[risk.Bezeichnung] = newRisk
                    })
                }
            }
        }
        sessionStorage.setItem("devices", JSON.stringify(devices))
        sessionStorage.setItem("update", true)        
    }
}

class Communicator {
    constructor() {
    }

    analyseSecurity() {
        console.log("<analyseSecurity()>")        
        let risks = ipcRenderer.sendSync('analyse-devices', datastore.getDevices());
        console.log(risks)
        datastore.addRisks(risks)
    }

    scanNetwork() {
        console.log("<scanNetwork()>")        
        sessionStorage.setItem("update", false)
        ipcRenderer.send('scan-network');
    }

    maximize() {
        console.log("<maximize()>")
        
        ipcRenderer.send('maximize');
    }

    pdfPrint(path) {
        console.log("<pdfPrint()>")        
        ipcRenderer.send('print-to-pdf', path);
    }

}

ipcRenderer.on('scan-complete', (event, data) => {
    console.log("scan complete")
    datastore.setDevices(data);
});

datastore = new Datastore()
communicator = new Communicator()

module.exports.datastore = datastore
module.exports.communicator = communicator