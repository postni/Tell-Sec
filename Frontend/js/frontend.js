var datastore = require('../../Backend/data');
var ipcRenderer = require('electron').ipcRenderer;
var shell = require("electron").shell


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
            "0": {
                "hostname": "DIR-868L",
                "vendor": "D-LINK",
                "connectedTo": [""],
                "connectionsToMe": ["3", "4", "10"],
                "os": "DD-WRT Linux-based",
                "ip": "10.23.4.61",
                "mac": "F2:34:A5:67:B2:81",
                "ports": [
                    {
                        "port": "80",
                        "protocol": "TCP",
                        "service": "HTTP"
                    },
                    {
                        "port": "143",
                        "protocol": "TCP/UDP",
                        "service": "IMAP"
                    },
                    {
                        "port": "107",
                        "protocol": "TCP",
                        "service": "Remote Tellnet Service Protocol"
                    }
                ],
                //rausnehmen
                "devicetype": "Router",
                "risks": [],
                "categories": []
            },
            "1": {
                "hostname": "HGST Ultrastar 7K4000",
                "vendor": "Hitachi",
                "os": "Niklas94",
                "ip": "10.23.4.62",
                "mac": "F2:34:A5:67:B2:92",
                "connectedTo": ["4"],
                "connectionsToMe": [""],
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
                "devicetype": "Server",
                "risks": [],
                "categories": []
            },
            "2": {
                "hostname": "Allegro-13SE",
                "vendor": "Toshiba",
                "connectedTo": ["3"],
                "connectionsToMe": [""],
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
                "devicetype": "Server",
                "risks": [],
                "categories": []
            },
            "3": {
                "hostname": "RJ45 GO-SW-8E",
                "vendor": "D-Link",
                "connectedTo": ["0"],
                "connectionsToMe": ["2", "6", "7"],
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
                "devicetype": "Switch",
                "risks": [],
                "categories": []
            },
            "4": {
                "hostname": "RJ45 GO-SW-8E",
                "vendor": "D-Link",
                "connectedTo": ["0"],
                "connectionsToMe": ["1", "5"],
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
                "devicetype": "Switch",
                "risks": [],
                "categories": []
            },
            "5": {
                "hostname": "DiskStation DS218",
                "vendor": "Synology",
                "connectedTo": ["4"],
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
                "devicetype": "NAS",
                "risks": [],
                "categories": []
            },
            "6": {
                "hostname": "BHX 200",
                "vendor": "Homag",
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
                "devicetype": "Maschine",
                "risks": [],
                "categories": []
            },
            "7": {
                "hostname": "BHX 050/055",
                "vendor": "Homag",
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
                "devicetype": "Maschine",
                "risks": [],
                "categories": []
            },
            "10": {
                "hostname": "WAC510",
                "vendor": "Netgear",
                "connectedTo": ["0"],
                "connectionsToMe": ["11", "14"],

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
                "devicetype": "Access Point",
                "risks": [],
                "categories": []
            },
            "11": {
                "hostname": "Inspiron DT 3668",
                "vendor": "Dell",
                "connectedTo": ["10"],
                "connectionsToMe": [""],

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
                "devicetype": "stationär",
                "risks": [],
                "categories": []
            },
            "14": {
                "hostname": "Galaxy S8",
                "vendor": "Samsung",
                "connectedTo": ["10"],
                "connectionsToMe": [""],

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
                "devicetype": "mobil",
                "risks": [],
                "categories": []
            },



        }
        sessionStorage.setItem("devices", JSON.stringify(testdata));
        sessionStorage.setItem("update", true)
        console.log("</getTestdata()>")
    }


    getDevices() {
        console.log("<getDevices()>")
<<<<<<< HEAD
        let rueckgabe = JSON.parse(sessionStorage.getItem("devices"))?JSON.parse(sessionStorage.getItem("devices")):{};
        console.log(rueckgabe)
=======
        let rueckgabe = JSON.parse(sessionStorage.getItem("devices")) ? JSON.parse(sessionStorage.getItem("devices")) : {};
>>>>>>> 180c988566bb69cf38d0baa6187c965fcf03b266
        return rueckgabe;
    }

    changeValue(id, key, subkey, subsubkey, value) {
        console.log("<changeValue()>")

        let devices = this.getDevices();
        console.log(devices)


        if (subsubkey) {

            if (!devices[id][key]) {
                if(typeof subkey === "number") {
                    devices[id][key] = []
                } else {
                devices[id][key] = {}
                }
            }
            if (!devices[id][key][subkey]) {
                devices[id][key][subkey] = {}
                console.log(devices[id][key][subkey])
            }
            if (!devices[id][key][subkey][subsubkey]) {
                devices[id][key][subkey][subsubkey] = {}
            }



            devices[id][key][subkey][subsubkey] = value;
        } else if (subkey) {
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
        var con = undefined
        if (devices[deviceId].connectedTo) {
            con = devices[deviceId].connectedTo
        }

        var con2me = undefined
        if (devices[deviceId].connectionsToMe) {
            con2me = devices[deviceId].connectionsToMe
        }

        delete devices[deviceId];
        //console.log(devices)
        //console.log(devices)
        console.log(con)
        if (con) {
            con.forEach((connection) => {
                console.log(connection)
                devices[connection].connectionsToMe = devices[connection].connectionsToMe.filter((id) => {
                    return !(id === deviceId);
                })

            })
        }
        console.log(con2me)
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
            let connectionsToOthers = {}
            let connectionsFromOthers = {}

            let ipIdMapper = {}

            for (let n in newDevices) {
                console.log(newDevices[n])
                if (newDevices[n].connectionsToMe) {
                    console.log(newDevices[n].connectionsToMe)
                    if (newDevices[n].connectionsToMe[0].length > 3) {
                        console.log(newDevices[n].connectionsToMe[0])
                        connectionsFromOthers[n] = newDevices[n].connectionsToMe
                        console.log(delete newDevices[n].connectionsToMe)
                        console.log()
                    }
                }
                if (newDevices[n].connectedTo) {
                    console.log(newDevices[n].connectedTo)
                    if (newDevices[n].connectedTo[0].length > 3) {
                        console.log(newDevices[n].connectedTo[0])
                        connectionsToOthers[n] = newDevices[n].connectedTo
                        console.log(delete newDevices[n].connectedTo)
                    }
                }
                if (!ipIdMapper[newDevices[n].ip]) {
                    ipIdMapper[newDevices[n].ip] = n
                }
                console.log(newDevices[n])
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
            console.log(newDevices)
            for (let id in newDevices) {
                console.log(id)
                if (!newDevices[id].connectedTo) {
                    console.log(connectionsToOthers[id])
                    newDevices[id].connectedTo = connectionsToOthers[id]
                }
                if (!newDevices[id].connectionsToMe) {
                    console.log(connectionsFromOthers[id])
                    newDevices[id].connectionsToMe = connectionsFromOthers[id]
                }
            }
            //console.log(connectionsToOthers)
            //console.log(connectionsFromOthers)
            //console.log(ipIdMapper)
            let devices = this.getDevices()

            let newItems = Object.keys(newDevices).length
            let items = Object.keys(devices).length
            let nextID = JSON.parse(this.newID());
            let idMapper = {}
            for (let n in newDevices) {
                let exists = false;
                console.log(n)

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
                    //itemsInner--
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
                    // devices[nextID]["connetedTo"] = newDevices[n].connetedTo ? newDevices[n].connetedTo : []
                    // devices[nextID]["connectionsToMe"] = newDevices[n].connectionsToMe ? newDevices[n].connectionsToMe : []
                    nextID++;
                }
                console.log(newDevices[n])

            }
            console.log(idMapper)
            for (let id in idMapper) {
                console.log(id)
                if (newDevices[id].connectedTo) {
                    console.log(newDevices[id].connectedTo) //is array of ips
                    newDevices[id].connectedTo.forEach((connection) => {
                        console.log(connection)
                        console.log(idMapper[id])
                        if (!devices[idMapper[id]].connectedTo) devices[idMapper[id]].connectedTo = []
                        devices[idMapper[id]].connectedTo.push(idMapper[connection])
                    })
                }
                if (newDevices[id].connectionsToMe) {
                    console.log(newDevices[id].connectionsToMe)
                    newDevices[id].connectionsToMe.forEach((connection) => {
                        console.log(connection)
                        if (!devices[idMapper[id]].connectionsToMe) devices[idMapper[id]].connectionsToMe = []
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
        return new Promise(resolve =>{
            console.log("<checkForRisks()>")
            sessionStorage.setItem("update", false)        
            communicator.analyseSecurity().then((risks)=>{
                console.log("addRisks:")
                this.addRisks(risks).then(res =>{console.log(res)+resolve(res)})
            })
        })
        
    }

    addRisks(risks) {
<<<<<<< HEAD
        return new Promise(resolve =>{
            console.log("<addRisk()>")        
            let devices = this.getDevices()
            let dTypesPromises = []
            for(let dType in risks){
                dTypesPromises.push(new Promise(resolve =>{
                    let type = dType==="Statisches Gerät"? "stationär": dType==="Mobiles Gerät"? "mobil":dType==="Maschinensteuerung"?"Maschine":dType==="Netzwerkspeicher"?"NAS":dType;
                    //console.log(type)
                    let devicePromises = []
                    for(let id in devices){
                        //console.log(id)                        
                        devicePromises.push(new Promise(resolve =>{
                            let risklist = []
                            //console.log(devices[id].devicetype+" - "+type+" | "+Object.keys(devices[id].risks).length>0)
                            if (devices[id].devicetype!=="Unbekannt" && devices[id].devicetype === type && !Object.keys(devices[id].risks).length>0) {
                                risks[dType].forEach((risk) => {
                                    let newRisk = {}
                                    newRisk.consequences = risk.Folgen
                                    newRisk.countermeasures = risk.Massnahmen
                                    newRisk.probability = risk.Eintrittswahrscheinlich
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
                //console.log(dTypesPromises)
            }
            Promise.all(dTypesPromises).then(res => { 
                    let merged = [].concat.apply([], res);
                    this.assignRisks(devices, merged).then(res => {
                        let deviceString = JSON.stringify(res)
                        //console.log(deviceString)
                        sessionStorage.setItem("devices", deviceString)
                        sessionStorage.setItem("update", true)
                        resolve(deviceString)
                    })                      
                
            })
        })        
    }
    assignRisks(devices, risks){
        //console.log(JSON.stringify(risks))
        // console.log(JSON.stringify(devices))
        return new Promise(resolve =>{
            let devWithRisks = devices
            let riskLength = Object.keys(risks).length
            if(riskLength===0) resolve(devices)
            risks.forEach(risk => {
                //console.log(Object.keys(devWithRisks)+" - "+risk.device)
                if(!devWithRisks[risk.device].risks || Array.isArray(devWithRisks[risk.device].risks)) devWithRisks[risk.device].risks = {}
                devWithRisks[risk.device].risks[risk.name] = risk.data
                //console.log(JSON.stringify(devWithRisks[risk.device]))
                riskLength--
                console.log(riskLength)
                if(riskLength===0){
                    resolve(devWithRisks)                    
                }
            })
        })
=======
        console.log("<addRisk()>")
        let devices = this.getDevices()
        for (let dType in risks) {
            for (let id in devices) {
                if (devices[id].devicetype === dType && devices[id].risks) {
                    devices[id].risks = {}
                    risks[dType].forEach((risk) => {
                        let newRisk = {}
                        newRisk.consequences = risk.Folgen
                        newRisk.countermeasures = risk.Massnahmen
                        newRisk.probability = risk.Eintrittswahrscheinlich
                        newRisk.riskID = risk.riskID
                        devices[id].risks[risk.Bezeichnung] = newRisk
                    })
                }
            }
        }
        sessionStorage.setItem("devices", JSON.stringify(devices))
        sessionStorage.setItem("update", true)
>>>>>>> 180c988566bb69cf38d0baa6187c965fcf03b266
    }
}

class Communicator {
    constructor() {
    }

    analyseSecurity() {
        return new Promise(resolve => {
            console.log("<analyseSecurity()>")
            let dev = datastore.getDevices()
            let risks = ipcRenderer.sendSync('analyse-devices', dev);
            console.log(risks)
            resolve(risks)
        })        
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

    callHomepage() {
        shell.openExternal("https://1524300.wixsite.com/tellmesec")
    }

    toAnalysis(){
        ipcRenderer.send('test');
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