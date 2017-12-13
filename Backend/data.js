var fs = require('fs');
var Datastore = require('nedb')

class Data {
    constructor() {
        this.db = {}
        this.db.enthaelt = new Datastore({ filename: "db/enthaelt.db", autoload: true })
        this.db.folge = new Datastore({ filename: "db/folge.db", autoload: true })
        this.db.fuehrt_zu = new Datastore({ filename: "db/fuehrt_zu.db", autoload: true })
        this.db.massnahme = new Datastore({ filename: "db/massnahme.db", autoload: true })
        this.db.risiko = new Datastore({ filename: "db/risiko.db", autoload: true })
        this.db.risikoquelle = new Datastore({ filename: "db/risikoquelle.db", autoload: true })
        this.db.gehoert_zu = new Datastore({ filename: "db/gehoert_zu.db", autoload: true })
    }

    findIDRQinEnthaelt(idrq){
        return new Promise(resolve =>{
            this.db.enthaelt.find({ IDRQ: idrq }, (err, res) => {
                let risiken = []
                res.forEach((element) => {
                    risiken.push(this.findIDRinRisiko(element.IDR))
                })
                let id = 0
                Promise.all(risiken).then(data => {
                    let existing = []
                    let updatedData = data.filter(d =>{
                        if(!existing.includes(d.Bezeichnung)){
                            existing.push(d.Bezeichnung)
                            return true
                        }else{
                            console.log("!")
                            return false
                        }
                    }).map(d =>{
                        //console.log(d.Bezeichnung)
                        //console.log(bezeichnungen)
                            d.riskID = id
                            id++
                            return d;
                    })
                    //console.log("updated Data")
                    //console.log(updatedData)
                    resolve(updatedData)})
    
            })
        })
        
    }

    findIDRinGehoertZu(idr){
        return new Promise(resolve => {
            this.db.gehoert_zu.find({ IDR: idr }, (err, res) => {
                let massnahmen = []                
                res.forEach((element) => {
                  massnahmen.push(this.findIDMinMassnahme(element.IDM))  
                })
                let id = 0                
                Promise.all(massnahmen).then(data => {
                    let updatedData = data.map(dOld =>{
                        let d ={}                        
                        d.countermeasuresID = id
                        d.name = dOld
                        id++
                        return d;
                    })
                    resolve(updatedData)})
            })
        })
    }

    findIDMinMassnahme(idm){
        return new Promise(resolve =>{
            this.db.massnahme.findOne({ IDM: idm }, (err, res) => {    
                resolve(res.Bezeichnung)
            })
        })
    }

    findIDRinRisiko(idr){
        return new Promise(resolve => {
            this.db.risiko.findOne({ IDR: idr }, (err, res) => {
                var risiko = {
                    Bezeichnung: res.Bezeichnung,
                    Folgen: [],
                    Massnahmen: [],
                    Eintrittswahrscheinlich: res.Eintrittswahrscheinlich? res.Eintrittswahrscheinlich:0.5
                }
                this.findIDRinFuehrtZu(idr).then((res)=>{
                    risiko.Folgen = res;
                    return this.findIDRinGehoertZu(idr)
                }).then(res=>{
                    risiko.Massnahmen = res;
                    resolve(risiko)
                })
        })
        })
    }

    findIDRinFuehrtZu(idr){
        return new Promise(resolve =>{
            this.db.fuehrt_zu.find({ IDR: idr }, (err, res) => {
                let folgen = []
                let existing = []
                res.forEach((element) => {
                    folgen.push(this.findIDFinFolge(element.IDF))
                })
                let id = 0                
                Promise.all(folgen).then(data => {
                    //console.log("data: "+ data)
                    let existing = []
                    let updatedData = data.filter(d => {
                        //console.log(existing)
                        if(!existing.includes(d.Name)){
                            existing.push(d.Name)
                            //console.log(d.Name)
                            return true
                        }else{
                            console.log("!")
                            return false
                        }
                    }).map(dOld =>{
                        let d ={}
                        d.consequenceID = id
                        d.name = dOld.Name
                        d.damage = dOld.Schadensklasse
                        d.description = dOld.Beschreibung
                        id++
                        return d;
                    })
                    resolve(updatedData)})
            })
        })
    }

    findIDFinFolge(id){
        return new Promise(resolve =>{
            this.db.folge.findOne({ IDF: id }, (err, res) => {
                let folge = {
                    Name: res.Bezeichnung,
                    Beschreibung: res.Beschreibung,
                    Schadensklasse: res.Schadensklasse
                }
                resolve(folge)
            })
        })
    }

    findBezeichnunginRisikoquelle(bezeichnung) {
        return new Promise(resolve => {
            var laengeEnthaelt = 999;
            var laengeRisiko = 999
            var laengeGehoert_zu = 999
            var laengeMassnahmen = 999
            var laengeFuehrt_zu = 999
            var laengeFolge = 999

            var ergebnis = {
                Bezeichnung: "",
                Risiken: []
            }
            this.db.risikoquelle.findOne({ Bezeichnung: bezeichnung }, (err, res) => {
                if (err) console.log("err: " + err);
                //console.log(res)
                ergebnis.Bezeichnung = res.Bezeichnung?res.Bezeichnung:"unbekannt";
                if(ergebnis.Bezeichnung === "Mobiles Gerät") ergebnis.Bezeichnung = "mobil"
                else if(ergebnis.Bezeichnung === "Statisches Gerät") ergebnis.Bezeichnung = "stationär"
                else if(ergebnis.Bezeichnung === "Netzwerkspeicher") ergebnis.Bezeichnung = "NAS"
                else if(ergebnis.Bezeichnung === "Maschinensteuerung") ergebnis.Bezeichnung = "Maschine"
                
                this.findIDRQinEnthaelt(res.IDRQ).then(res =>{
                    ergebnis.Risiken = res;
                    resolve(ergebnis);
                })
            })

        })
    }


    analyse(event, devices, _callback) {
        let exists = false;        
        var types = []
        for (let id in devices) {
            exists = false;
            //console.log(devices[id]["devicetype"])
            let devicetype = ""
            if(devices[id]["devicetype"]==="stationär"){
                devicetype = "Statisches Gerät"
            } else if(devices[id]["devicetype"]==="mobil"){
                devicetype = "Mobiles Gerät"                
            }else if( devices[id]["devicetype"]==="Maschine"){
                devicetype = "Maschinensteuerung"
            }else if( devices[id]["devicetype"]==="NAS"){
                devicetype = "Netzwerkspeicher"
            }else if(devices[id]["devicetype"]){       
                devicetype = devices[id]["devicetype"]
            }
            //console.log(devicetype)
            if(!devicetype ||devicetype===""||devicetype==="Unbekannt"){
                console.log("true")
                exists = true;
            }

            types.forEach((typ) => {
                //console.log("->"+typ)
                if (typ === devicetype) {
                    exists = true;
                }
            })
            console.log("exists: "+exists+" |devicetype: "+devicetype+" |types: "+types)
            if (!exists) {
                types.push(devicetype);
            }

        }
        //console.log(types)
        Promise.all(types.map((bezeichnung) => { return this.findBezeichnunginRisikoquelle(bezeichnung).then(r => {return r }) })).then((res) => {
            console.log("!!done!!");
            //console.log("|||||||||||||||||||||||||||||||");
            //console.log("||||||----promise-all----||||||");
            //console.log("|||||||||||||||||||||||||||||||") ;           
            //console.log(res);
            _callback(event,res);
        })
    }

}

var dataManager = new Data()
module.exports.datastore = dataManager;