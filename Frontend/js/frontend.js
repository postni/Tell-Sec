var ipcRenderer = require('electron').ipcRenderer;

class Datastore{

    constructor(){
        if(!!!sessionStorage.getItem("devices")){
            sessionStorage.setItem("devices", JSON.stringify({}))         
        }
        if(!!!sessionStorage.getItem("update")){
            sessionStorage.setItem("update", false)
        }
    }


    getDevices(){
        return JSON.parse(sessionStorage.getItem("devices"));
    }

    getTestdata(){
        console.log("test")
        let testdata = {
            "1": {
            "hostname": "Timo",
            "vendor": "TimoTec",
            "connectedTo":["3"],
            "os": "Timo94",
            "ip": "1234567",
            "mac": "123456789",
            "ports": [
                {
                    "port": "123",
                    "protocol": "test"
                },
                {
                    "port":"2345",
                    "protocol": "test2"
                }
            ],
            "devicetype": "Client",
            "risks": [],
            "categories": []
        },
        "2":{
            "hostname": "Niklas",
            "vendor": "NiklasTec",
            "os": "Niklas94",
            "ip": "1234568",
            "mac": "123456790",
            "ports": [
                {
                    "port": "123",
                    "protocol": "test"
                },
                {
                    "port":"2345",
                    "protocol": "test2"
                }
            ],
            "devicetype": "Router",
            "risks": [],
            "categories": []
        },
        "3":{
            "hostname": "Benedikt",
            "vendor": "BeneTec",
            "connectedTo":["2"],
            "os": "Bene94",
            "ip": "1234569",
            "mac": "123456789",
            "ports": [
                {
                    "port": "123",
                    "protocol": "test"
                },
                {
                    "port":"2345",
                    "protocol": "test2"
                }
            ],
            "devicetype": "Switch",
            "risks": [],
            "categories": []
        },
        "4":{
            "hostname": "Kübra",
            "vendor": "KübraTec",
            "connectedTo":["3"],
            "os": "Kübra94",
            "ip": "1234577",
            "mac": "123456799",
            "ports": [
                {
                    "port": "123",
                    "protocol": "test"
                },
                {
                    "port":"2345",
                    "protocol": "test2"
                }
            ],
            "devicetype": "Client",
            "risks": [],
            "categories": []
        },
        "5":{
            "hostname": "Gülce",
            "vendor": "GülceTec",
            "connectedTo":["3"],
            "os": "Gülce94",
            "ip": "1234567",
            "mac": "123456789",
            "ports": [
                {
                    "port": "123",
                    "protocol": "test"
                },
                {
                    "port":"2345",
                    "protocol": "test2"
                }
            ],
            "devicetype": "Client",
            "risks": [],
            "categories": []
        },
        "6":{
            "hostname": "Hakan",
            "vendor": "HakanTec",
            "connectedTo":["3"],
            "os": "Hakan94",
            "ip": "1234567",
            "mac": "123456789",
            "ports": [
                {
                    "port": "123",
                    "protocol": "test"
                },
                {
                    "port":"2345",
                    "protocol": "test2"
                }
            ],
            "devicetype": "Client",
            "risks": [],
            "categories": []
        }
    }
        sessionStorage.setItem("devices", JSON.stringify(testdata));
        sessionStorage.setItem("update", true)
    }

    newID(){
        let devices = this.getDevices()
        let ids = []
        for(let i in devices){
            ids.push(parseInt(i))
        }
    
        let largest = Math.max.apply(Math, ids);
    
        if(largest<0){
            largest = 0;
        }else{
            largest++;
        }
    
        return (""+largest)
    }

    addDevice(device){
        let devices = JSON.parse(sessionStorage.getItem("devices"));
        
        let devicetype = device.devicetype==="Person"? "Client": device.devicetype;
        devices[device.id] = {"devicetype":devicetype};
               
        sessionStorage.setItem("devices", JSON.stringify(devices))
        //communicator.sendToBackend(devices);
    }

    setDevices(newDevices){
        //TODO
        console.log(newDevices)
        let devices = JSON.parse(sessionStorage.getItem("devices"))
        let nextID  = this.newID();   
        for(n in newDevices){
            for(o in devices){
                if(newDevices[n].ip === devices[o].ip || newDevices[n].mac === devices[o].mac){
                    devices[o].hostname = newDevices[n].hostname ? devices[o].hostname:newDevices[n].hostname;
                    devices[o].ip = devices[o].ip ? devices[o].ip:newDevices[n].ip;
                    devices[o].mac = devices[o].mac ? devices[o].mac:newDevices[n].mac;
                    devices[o].ports = newDevices[n].openPorts ? devices[o].ports :newDevices[n].openPorts;
                    devices[o].os = devices[o].os ? devices[o].os:newDevices[n].osNmap;
                    devices[o].vendor = devices[o].vendor ? devices[o].vendor:newDevices[n].vendor;
                } else{
                    devices[nextID].hostname = newDevices[n].hostname
                    devices[nextID].ip = newDevices[n].ip
                    devices[nextID].mac = newDevices[n].mac
                    devices[nextID].ports = newDevices[n].openPorts
                    devices[nextID].os = newDevices[n].osNmap
                    devices[nextID].vendor = newDevices[n].vendor

                    nextID++;
                }
            }
        }
        sessionStorage.setItem("devices",devices)
        sessionStorage.setItem("update", true)        
    }

    analyseStarten(_callback){
        communicator.analyseSecurity(_callback);
    }
}

class Communicator{
    constructor(){
    }
    analyseSecurity(_callback){
        ipcRenderer.send('analyse', _callback);
    }
    scanNetwork(_callback){
        this.loader = _callback;
        ipcRenderer.send('scan-network');
    }
    scanLocalhost(_callback){
        this.loader = _callback;
        ipcRenderer.send('scan-localhost');
    }
    maximize(){
        ipcRenderer.send('maximize');
    }
}

ipcRenderer.on('reply',(string)=>{
    console.log(string)
})

ipcRenderer.on('scan-complete',(event, data)=>{
    console.log("scan complete")
    datastore.setDevices(data);
});

datastore = new Datastore()
communicator = new Communicator()

module.exports.datastore = datastore
module.exports.communicator = communicator