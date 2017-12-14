const os = require('os');
const nmap = require('node-nmap');
const ifaces = os.networkInterfaces();
const IpSubnetCalculator = require('ip-subnet-calculator');
const network = require("network")

class NWtester {
    constructor() {

    }

    scanNetwork(event,_callback) {
        console.log("scan start")
        let ifaceList = []
        let myIPs = []
        let gateways = {}
        let networks = {}

        network.get_interfaces_list((err, list)=>{
            list.forEach(iface => {
                if(iface.gateway_ip){
                    console.log(iface.name+" - "+iface.ip_address)
                    gateways[iface.gateway_ip] = {}
                }
            })
        })
        Object.keys(ifaces).forEach(i => {
                let iface = ifaces[i]
                iface = iface.forEach(adapter => {
                    myIPs.push(adapter.address)
                    if(adapter.family==="IPv4" && !adapter.internal){
                        let network = IpSubnetCalculator.calculateCIDRPrefix(adapter.address, adapter.netmask).ipLowStr+ "/" + IpSubnetCalculator.calculateCIDRPrefix(adapter.address, adapter.netmask).prefixSize
                        if(!networks[network]){
                            networks[network] = {
                                "lowestIP": IpSubnetCalculator.calculateCIDRPrefix(adapter.address, adapter.netmask).ipLow,
                                "highestIP":IpSubnetCalculator.calculateCIDRPrefix(adapter.address, adapter.netmask).ipHigh,
                                "devices":[]
                            }
                        }
                    }
                    let devices = this.getDevices(adapter)
                    ifaceList.push(devices)
                })
        })
        console.log(ifaceList)
        Promise.all(ifaceList).then(r => {
            console.log(r)
            let mergedResponse = [].concat.apply([],r)
            let promises = []
            mergedResponse.forEach(host=>{ 
                promises.push( this.getHostInformation(host, myIPs))
            })
            console.log("IPscan: "+promises)
            Promise.all(promises).then(r =>{
                //console.log(r)
                let mergedResponse = [].concat.apply([],r)
                return this.getConnections(mergedResponse, gateways, networks)
            }).then(dataDone => {_callback(event, dataDone)})
                
            //console.log(r)
            //console.log(mergedResponse)
        })
    }

    getDevices(adapter) {
        return new Promise(resolve => {
            if (adapter.family === 'IPv4' && adapter.internal === false && !(IpSubnetCalculator.toDecimal(adapter.address) <= 2852126719 && IpSubnetCalculator.toDecimal(adapter.address) >= 2835349504) && !(IpSubnetCalculator.toDecimal(adapter.address)>=419430400 && IpSubnetCalculator.toDecimal(adapter.address)<=436207615)) {
                let subnet = IpSubnetCalculator.calculateCIDRPrefix(adapter.address, adapter.netmask).ipLowStr + "/" + IpSubnetCalculator.calculateCIDRPrefix(adapter.address, adapter.netmask).prefixSize

                var nmapscan = new nmap.NmapScan(subnet, '-sP');

                nmapscan.scanTimeout = 400000                
                nmapscan.on('complete', (data) => {

                    console.log("complete")
                    console.log(subnet)
                    resolve(data)
                });
                nmapscan.on('error', (error) => {
                    console.log("subnet")
                    resolve([])
                });
                nmapscan.startScan();
            } else {
                console.log("  - Family: "+adapter.family+"  - Internal: "+adapter.internal+"  - Netmask: "+adapter.netmask+"  - Adress: "+adapter.address)
                resolve([])
            }
        })
    }

    getHostInformation(host, myIPs){
        console.log("OS Scan for "+host.ip)
        return new Promise(resolve =>{

            var nmapscan = new nmap.OsAndPortScan(host.ip);
            nmapscan.scanTimeout = 400000
            nmapscan.on('complete', (data) => {

                console.log("OS & Port for "+host.ip+" complete")
                //console.log(host.ip)
                //console.log(data)
                if(myIPs.includes(data.ip)&&!data.hostname){
                    console.log(data)
                    data.hostname = os.hostname()
                }
                console.log(data)
                if(data === []) {
                    data = [host]
                    console.log(data)                    
                 }
                 console.log(nmapscan.scanTime)     
                resolve(data)
            });
            nmapscan.on('error', (error) => {
                console.log(error)
                //console.log(myIPs+" <- "+host.ip)
                if(myIPs.includes(host.ip)&&!host.hostname){
                    console.log(host)
                    host.hostname = os.hostname()
                }
                console.log(nmapscan.scanTime)                
                console.log(host)
                resolve([host])
            });
            nmapscan.startScan();
        })
    }
    
    getConnections(data, gateways, networks){
        return new Promise(resolve =>{
            //console.log(data)
            //console.log(gateways)
            //console.log(networks)
            //let subnet = {}
            for(let key in data){
                let myIP = data[key].ip
                let ipDec = IpSubnetCalculator.toDecimal(myIP)
                
                console.log(myIP)
                if(Object.keys(gateways).includes(myIP)){
                    console.log("includes: "+myIP)
                    
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
            //console.log(subnet)
            //console.log(networks)
            //console.log(data)
            resolve(data)
        })
    }

}
module.exports = new NWtester();