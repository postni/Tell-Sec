const os = require('os');
const nmap = require('node-nmap');
const ifaces = os.networkInterfaces();
const IpSubnetCalculator = require('ip-subnet-calculator');


class NWtester {
    constructor() {

    }

    scanNetwork(event, _callback) {
        let ifaceList = []
        let myIPs = []
        Object.keys(ifaces).forEach(i => {
                let iface = ifaces[i]
                iface = iface.forEach(adapter => {
                    myIPs.push(adapter.address)
                    let devices = this.getDevices(adapter)
                    ifaceList.push(devices)
                })
        })
        //console.log(ifaceList)
        Promise.all(ifaceList).then(r => {
            let mergedResponse = [].concat.apply([],r)
            let promises = []
            mergedResponse.forEach(host=>{ 
                promises.push( this.getHostInformation(host, myIPs))
            })
            console.log("IPscan: "+promises)
            Promise.all(promises).then(r =>{
                //console.log(r)
                let mergedResponse = [].concat.apply([],r)
                //console.log(mergedResponse)
                _callback(event, mergedResponse)
            })
                
            //console.log(r)
            //console.log(mergedResponse)
        })
    }

    getDevices(adapter) {
        return new Promise(resolve => {
            if (adapter.family === 'IPv4' && adapter.internal === false && !(IpSubnetCalculator.toDecimal(adapter.address) <= 2852126719 && IpSubnetCalculator.toDecimal(adapter.address) >= 2835349504) && IpSubnetCalculator.toDecimal(adapter.netmask)>=4294836224) {
                let subnet = IpSubnetCalculator.calculateCIDRPrefix(adapter.address, adapter.netmask).ipLowStr + "/" + IpSubnetCalculator.calculateCIDRPrefix(adapter.address, adapter.netmask).prefixSize

                var nmapscan = new nmap.NmapScan(subnet, '-sP');
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
                resolve([])
            }
        })
    }
    getHostInformation(host, myIPs){
      
        console.log("OS Scan for "+host.ip)
        return new Promise(resolve =>{

            var nmapscan = new nmap.OsAndPortScan(host.ip);
            nmapscan.on('complete', (data) => {

                console.log("complete")
                console.log(host.ip)
                if(myIPs.includes(data.ip)&&!data.hostname){
                    console.log(data)
                    data.hostname = os.hostname()
                }
                resolve(data)
            });
            nmapscan.on('error', (error) => {
                console.log(error)
                console.log(myIPs+" <- "+host.ip)
                if(myIPs.includes(host.ip)&&!host.hostname){
                    console.log(host)
                    host.hostname = os.hostname()
                }
                resolve([host])
            });
            nmapscan.startScan();
        })
    }
    

}
module.exports = new NWtester();