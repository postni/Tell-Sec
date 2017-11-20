var ipcRenderer = require('electron').ipcRenderer;

class Datastore {

    constructor() {
        if (!!!sessionStorage.getItem("devices")) {
            sessionStorage.setItem("devices", JSON.stringify({}))
        }
        if (!!!sessionStorage.getItem("update")) {
            sessionStorage.setItem("update", false)
        }
    }

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

    getTestdata() {
        console.log("test")
        let testdata = {
            "1": {
                "hostname": "Timo",
                "vendor": "TimoTec",
                "connectedTo": ["3"],
                "connectionsToMe":[""],
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
                "devicetype": "Client",
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
                "devicetype": "Router",
                "risks": [],
                "categories": []
            },
            "3": {
                "hostname": "Benedikt",
                "vendor": "BeneTec",
                "connectedTo": ["2"],
                "connectionsToMe": ["1","4","5","6"],
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
        this.analyseStarten();
    }

    analyseStarten() {
        communicator.analyseSecurity();
    }

    getRisks(){
        return sessionStorage.getItem("risks")
    }

    addRisk(riskId, risk){
        let risks = getRisks()
        let devices = getDevices()

        let id = riskId.split("_")[0]

        risks[riskId] = risk;
        risks[riskId]["damage"] = 0;
        //risks[riskId]["influenced"] = devices[]["connectionsToMe"]?devices[]["connectionsToMe"]: [];


    }

    getDevices() {
        return JSON.parse(sessionStorage.getItem("devices"));
    }

    changeValue(id, key,subkey, value) {
        let devices = getDevices();
        console.log(devices)
        devices[id][key] = value;
        console.log(devices)
        sessionStorage.setItem("devices", JSON.stringify(devices));
    }

    addTo(id, key, subkey, value) {  
        let devices = getDevices();
        console.log(devices)
        if(subkey){
            devices[key][subkey].push(value)
        }else{
            devices[key].push(value)
        }
        console.log(devices)
        sessionStorage.setItem("devices", JSON.stringify(devices));
    }

    addDevice(device) {
        let devices = getDevices();

        let devicetype = device.devicetype === "Person" ? "Client" : device.devicetype;
        devices[device.id] = { "devicetype": devicetype };

        sessionStorage.setItem("devices", JSON.stringify(devices))
        //communicator.sendToBackend(devices);
    }

    setDevices(newDevices) {
        if (!newDevices) {
            sessionStorage.setItem("update", true)
        } else {
            console.log("8==========================================o")
            console.log("newDevices")
            console.log(newDevices)
            let devices = getDevices()
            console.log("devices - before")
            console.log(devices)
            let newItems = Object.keys(newDevices).length
            let items = Object.keys(devices).length
            let nextID = this.newID();
            for (let n in newDevices) {
                let exists = false;
                //let itemsInner = items;
                //console.log(itemsInner+" <- i | n -> "+newItems)            
                for (let o in devices) {
                    if (newDevices[n].ip === devices[o].ip || (newDevices[n].mac === devices[o].mac && newDevices[n].mac)) {
                        devices[o].hostname = newDevices[n].hostname ? devices[o].hostname : newDevices[n].hostname;
                        devices[o].ip = devices[o].ip ? devices[o].ip : newDevices[n].ip;
                        devices[o].mac = devices[o].mac ? devices[o].mac : newDevices[n].mac;
                        devices[o].ports = newDevices[n].openPorts ? devices[o].ports : newDevices[n].openPorts;
                        devices[o].os = devices[o].os ? devices[o].os : newDevices[n].osNmap;
                        devices[o].vendor = devices[o].vendor ? devices[o].vendor : newDevices[n].vendor;
                        exists = true
                    }
                    //itemsInner--
                }
                if (!exists) {
                    devices[nextID] = {
                    }
                    devices[nextID]["hostname"] = newDevices[n].hostname ? newDevices[n].hostname : null;
                    devices[nextID]["ip"] = newDevices[n].ip ? newDevices[n].ip : null
                    devices[nextID]["mac"] = newDevices[n].mac ? newDevices[n].mac : null
                    devices[nextID]["ports"] = newDevices[n].openPorts ? newDevices[n].openPorts : null
                    devices[nextID]["os"] = newDevices[n].osNmap ? newDevices[n].osNmap : null
                    devices[nextID]["vendor"] = newDevices[n].vendor ? newDevices[n].vendor : null
                    devices[nextID]["devicetype"] = "Client"
                    nextID++;
                }

            }
            console.log("devices - after")
            console.log(devices)


            sessionStorage.setItem("devices", JSON.stringify(devices))
            sessionStorage.setItem("update", true)
            console.log("8==========================================o")
        }
    }
}

class Communicator {
    constructor() {
    }
    analyseSecurity() {
        ipcRenderer.send('analyse-devices', datastore.getDevices());
    }
    scanNetwork(_callback) {
        this.loader = _callback;
        ipcRenderer.send('scan-network');
    }
    scanLocalhost(_callback) {
        this.loader = _callback;
        ipcRenderer.send('scan-localhost');
    }
    maximize() {
        ipcRenderer.send('maximize');
    }
}

ipcRenderer.on('scan-complete', (event, data) => {
    console.log("scan complete")
    datastore.setDevices(data);
});

ipcRenderer.on('analysis-complete', (event, risiks)=>{
    for(let risk in risks){   
        console.log(risks[risk])
    }
})

datastore = new Datastore()
communicator = new Communicator()

module.exports.datastore = datastore
module.exports.communicator = communicator