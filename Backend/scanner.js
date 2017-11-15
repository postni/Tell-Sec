//const fs = require('fs');
const IpSubnetCalculator = require('ip-subnet-calculator');
const nmap = require('node-nmap');
const os = require('os');
const ifaces = os.networkInterfaces();
nmap.nmapLocation = "nmap"; //default 

var NmapScanner = class NmapScanner {
    constructor() {
        this.activeHosts = {};
    }

    //gibt eine Liste(Array) aller Netzwerke zurück (jeweils kleinste und größte IP im Netzwerk)
    getMyNetworks(){
        console.log("MyNetworks");
        var subnets = [];

        //berechnet für jeden Netzwerkadapter die niedrigste und höchste IP-Adresse
        Object.keys(ifaces).forEach((ifname) => {

            ifaces[ifname].forEach((iface) => {
                if ('IPv4' !== iface.family || iface.internal !== false || (IpSubnetCalculator.toDecimal(iface.address) <= 2852126719 && IpSubnetCalculator.toDecimal(iface.address) >= 2835349504)) {
                    console.log("TODO (IPv6 etc.)");
                    return;
                } else {
                    let ipLow = IpSubnetCalculator.calculateCIDRPrefix(iface.address, iface.netmask).ipLow;
                    let ipHigh = IpSubnetCalculator.calculateCIDRPrefix(iface.address, iface.netmask).ipHigh;
                    console.log("MyIP: " + iface.address + " - MyNetmask: " + iface.netmask)
                    console.log("Lowest IP in subnet: " + ipLow + " / " + IpSubnetCalculator.toString(ipLow))
                    console.log("Highest IP in subnet: " + ipHigh + " / " + IpSubnetCalculator.toString(ipHigh))
                    console.log("====================================================")
                    subnets.push({ ipLow: ipLow, ipHigh: ipHigh });
                }
            });
        });
        return subnets;
    }

    //bekommt ein Array aus subnetzen (jeweils niedriste/höchste IP) und gibt eine Liste aktiver Hosts in allen Subnetzen zurück.
    getActiveIPs(subnets, completeScan, event){
        let ipList = '';
        let ipCount = 0;
        subnets.forEach((subnet) => {
            console.log("subnet: ")
            console.log(JSON.stringify(subnet));
            for (let i = subnet.ipLow; i <= subnet.ipHigh; i++) {
                ipList = (ipList === "") ? IpSubnetCalculator.toString(i) : ipList + " " + IpSubnetCalculator.toString(i);
                ipCount++;
            }
        });
        //console.log("ipList");
        //console.log(ipList);
        let scan = new nmap.NmapScan(ipList, '-sn');

        scan.on('complete',(data) => {
            //console.log("===== complete =====");
            let hosts = [];
            data.forEach((d)=>{
                hosts.push(d.ip);
            })
            //console.log(this.activeHosts)
            this.getPortsAndOS(hosts,completeScan, event);       
            
        });
        scan.on('error', (error) => {
            console.log(error);
        });
        scan.startScan();
    }

    getPortsAndOS(hosts, completeScan, event){
        let itemsToProcess = hosts.length;
        hosts.forEach((ip)=>{
            let scanner = new nmap.OsAndPortScan(ip);
            scanner.on('complete', (data) => {
                console.log("Host: " + ip);
                console.log(data);
                this.activeHosts[ip] = data[0];
                itemsToProcess--;
                if(itemsToProcess===0){
                    console.log(event)
                    console.log("geht :)")
                    completeScan(event,this.activeHosts);
                }
                //console.log(JSON.stringify(this.activeIPs[IP]));
            });
            scanner.on('error', function (error) {
                itemsToProcess--;
                if(itemsToProcess===0){
                    console.log(event)
                    console.log("?????? geht nicht ????????")
                    completeScan(event,[]);
                }
                console.log("error: "+error);
            });
    
            scanner.startScan();
        });
    }
    
    getMyIPs(completeScan, event){
        let ips = []
        Object.keys(ifaces).forEach((ifname) => {

            ifaces[ifname].forEach((iface) => {
                if ('IPv4' !== iface.family || iface.internal !== false || (IpSubnetCalculator.toDecimal(iface.address) <= 2852126719 && IpSubnetCalculator.toDecimal(iface.address) >= 2835349504)) {
                    return;
                } else {
                    let myIP = iface.address;
                    ips.push(myIP);
                }
            });
            this.getPortsAndOS(ips,completeScan, event); 
        });
    }

}

module.exports = NmapScanner;