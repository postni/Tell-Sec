//Einbinden von Modulen und Packages zum einholen von Interface-Informationen und zum scannen des Netzwerks
const os = require('os');
const ifaces = os.networkInterfaces();
const nmap = require('node-nmap');
const IpSubnetCalculator = require('ip-subnet-calculator');
const network = require("network")

class NWtester {
    constructor() { }

    //Eingabe: event (Parameter 1)              || IPC event (zum zurück senden der Daten an Frontend)
    //         _callback (Parameter 3)          || Rückruffunktion die mit den Daten aufgerufen wird
    scanNetwork(event,_callback) {
        let ifaceList = []
        let myIPs = []
        let gateways = {}
        let networks = {}
        //Erstellen von key-value Objekt mit Gateways als keys zum späteren auslesen von Verbindungen
        network.get_interfaces_list((err, list)=>{
            list.forEach(iface => {
                if(iface.gateway_ip){
                    gateways[iface.gateway_ip] = {}
                }
            })
        })
        //Iterieren durch alle Interfaces (identifizieren von Subnetzen) und starten von von Ping Scan für jedes Subnetz
        Object.keys(ifaces).forEach(i => {
            let iface = ifaces[i]
            iface = iface.forEach(adapter => {
                let subnetInformation = IpSubnetCalculator.calculateCIDRPrefix(adapter.address, adapter.netmask)
                myIPs.push(adapter.address)
                if(adapter.family==="IPv4" && !adapter.internal){
                    let network = subnetInformation.ipLowStr+ "/" + subnetInformation.prefixSize
                    if(!networks[network]){
                        networks[network] = {
                            "lowestIP": subnetInformation.ipLow,
                            "highestIP":subnetInformation.ipHigh,
                            "devices":[]
                        }
                    }
                }
                //Starten von Ping Scan
                let devices = this.getDevices(adapter)
                ifaceList.push(devices)
            })
        })
        //Starten von OS- und Port-Scan für alle im Netzwerk aktiven Geräte (sobald die Ping Scans aller Schnittstellen durchgelaufen sind)
        Promise.all(ifaceList).then(r => {
            let mergedResponse = [].concat.apply([],r)
            let promises = []
            mergedResponse.forEach(host=>{ 
                promises.push( this.getHostInformation(host, myIPs))
            })
            //Hinzufügen von Verknüpfungen zwischen den Geräten. Anschließend Rückmelden der 
            Promise.all(promises).then(r =>{
                let mergedResponse = [].concat.apply([],r)
                return this.getConnections(mergedResponse, gateways, networks)
            }).then(dataDone => {_callback(event, dataDone)})
        })
    }

    //Eingabe: adapter (Parameter 1)              || Informationen zu Schnittstelle in form eines Objekts
    //Rückgabewert: Promise mit Array aus Geräteinformationen zu aktiven Geräten im Netzwerk
    getDevices(adapter) {
        return new Promise(resolve => {
            let subnetInformation = IpSubnetCalculator.calculateCIDRPrefix(adapter.address, adapter.netmask)
            //Prüfen ob die Schnittstelle mit IPv4 arbeitet und ob es sich um einen externen Netzwerkadapter handelt
            if (adapter.family === 'IPv4' && adapter.internal === false && !(IpSubnetCalculator.toDecimal(adapter.address) <= 2852126719 && IpSubnetCalculator.toDecimal(adapter.address) >= 2835349504) && !(IpSubnetCalculator.toDecimal(adapter.address)>=419430400 && IpSubnetCalculator.toDecimal(adapter.address)<=436207615)) {
                let subnet = subnetInformation.ipLowStr + "/" + subnetInformation.prefixSize

                //Erstellen eines Nmap-Ping-Scans
                var nmapscan = new nmap.NmapScan(subnet, '-sP');
                nmapscan.scanTimeout = 400000
                nmapscan.on('complete', (data) => {
                    resolve(data)
                });
                nmapscan.on('error', (error) => {
                    resolve([])
                });
                //Starten des Scans
                nmapscan.startScan();
            } else {
                resolve([])
            }
        })
    }

    //Eingabe: host (Parameter 1)              || Informationen zu aktivem Gerät in form eines Objekts
    //         myIPs (Parameter 2)             || Liste mit den IP Adressen aller Schnittstellen des eigenen Geräts
    //Rückgabewert: Promise mit Array aus Geräteinformationen zu gescanntem Gerät
    getHostInformation(host, myIPs){
        return new Promise(resolve =>{
            //Erstellen eines Nmap OS- und Port-Scans
            var nmapscan = new nmap.OsAndPortScan(host.ip);
            nmapscan.scanTimeout = 400000
            nmapscan.on('complete', (data) => {
                //Wenn keine Informationen gefunden wurden: Ergebniss des Ping Scans weiter verwenden
                if(data === []) {
                    data = [host]
                }
                //Für eigenes Gerät den Hostnamen nachtragen falls beim Scan keine Informationen gefunden wurden
                if(myIPs.includes(data.ip)&&!data.hostname){
                    data.hostname = os.hostname()
                }
                resolve(data)
            });
            nmapscan.on('error', (error) => {
                console.log(error)
                //Für eigenes Gerät den Hostnamen nachtragen falls beim Scan keine Informationen gefunden wurden
                if(myIPs.includes(host.ip)&&!host.hostname){
                    host.hostname = os.hostname()
                }
                //Bei Fehler: Ergebniss des Ping Scans weiter verwenden
                resolve([host])
            });
            //Starten des Scans
            nmapscan.startScan();
        })
    }

    //Eingabe: data (Parameter 1)                 || Liste zu allen aktiven Geräten im Netzwerk in form eines key-value Objekts
    //         gateways (Parameter 2)             || Liste aus den Standardgateways aller aktiver Schnittstellen des eigenen Geräts
    //         networks (Parameter 3)             || Liste aller Netzwerksegmente mit denen das eigene Gerät verbunden ist
    //Rückgabewert: Promise mit Objekt aus Geräteinformationen zu allen sich im Netzwerk befindenden Geräten inkl. deren Verbindungen zueinander
    getConnections(data, gateways, networks){
        return new Promise(resolve =>{
            //Iterieren über alle Geräte in data
            for(let key in data){
                let myIP = data[key].ip
                let ipDec = IpSubnetCalculator.toDecimal(myIP)

                //Prüfen ob die IP des aktuellen Geräts in dem Gateway Objekt steht.
                //Wenn ja, ist klar dass alle Geräte, die sich im gleichen Subnetz befinden, mit diesem Gerät verbunden werden müssen
                if(Object.keys(gateways).includes(myIP)){
                    
                    gateways[myIP] = {
                        "key": key,
                        "subnet": ""
                    }
                
                    for(let nw in networks){
                        if(networks[nw].lowestIP<=ipDec && networks[nw].highestIP >= ipDec){
                            gateways[myIP].subnet = nw
                        }
                    }

                }else{
                    for(let nw in networks){
                        if(networks[nw].lowestIP<=ipDec && networks[nw].highestIP >= ipDec){
                            networks[nw].devices.push(key)
                        }
                    }
                }
            }
            //Erneutes Iterieren über alle Geräte in Data zum Eintragen der zuvor gefundenen Veerbindungen
            for(let key in data){
                let myIP = data[key].ip
                if(Object.keys(gateways).includes(myIP)){
                    networks[gateways[myIP].subnet].devices.forEach(id=>{
                        if(!data[id].connectedTo){
                            data[id].connectedTo = []
                        }
                        data[id].connectedTo.push(myIP)
                        if(!data[key].connectionsToMe){
                            data[key].connectionsToMe = []
                        }
                        data[key].connectionsToMe.push(data[id].ip)
                    })
                }
                
            }
            //Zurückgeben der aktualisierten Daten
            resolve(data)
        })
    }

}
module.exports = new NWtester();