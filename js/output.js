
var timeInTime = [0]
var tempInTime = [0]
var pressInTime = [0]
var KEInTime = [0]
var PEInTime = [0]
var densInTime = [0]
var EtotInTime = [0]
var vDistInTime = []

var tempAct = temp
var KEAct = 0
var PEAct = 0
var PETailAct = 0
//var PECoulAct = 0
var densAct = dens
var pressAct = press
var vDist = [0]
var clearAndInitSvg

/* var timeSeriesHelper = []
var reductionConstant = dt */
var nReduce = 100

function output_init() {
    clearAndInitSvg = SvgClosure()
    clearAndInitSvg()
}

function OutputInit() {
    timeInTime = []
    tempInTime = []
    pressInTime = []
    KEInTime = []
    PEInTime = []
    densInTime = []
    EtotInTime = []
    vDistInTime = []

    tempAct = 0
    KEAct = 0
    PEAct = 0
    PETailAct = 0
    //PECoulAct = 0
    densAct = 0
    pressAct = 0
    vDist = [0]    
}

function roundOutput(num, prec) {
    return Math.round(num*prec)/prec
}

function timeSeriesFilter(el,i) {
    return timeSeriesHelper[i]%reductionConstant<=0.1*reductionConstant
}

function reduceTimeSeriesLength() {
    /* reductionConstant = dt
    timeSeriesHelper = [...timeInTime]
    timeInTime = timeInTime.filter(timeSeriesFilter)
    tempInTime = tempInTime.filter(timeSeriesFilter)
    KEInTime = KEInTime.filter(timeSeriesFilter)
    PEInTime = PEInTime.filter(timeSeriesFilter)
    EtotInTime = EtotInTime.filter(timeSeriesFilter) */
    let nReduce2 = 1
    timeInTime = timeInTime.slice(nReduce2)
    tempInTime = tempInTime.slice(nReduce2)
    densInTime = densInTime.slice(nReduce2)
    pressInTime = pressInTime.slice(nReduce2)
    KEInTime = KEInTime.slice(nReduce2)
    PEInTime = PEInTime.slice(nReduce2)
    EtotInTime = EtotInTime.slice(nReduce2)
    vDistInTime = vDistInTime.slice(nReduce2)
}

function pushTimeSeries(temp, press, ke, pe, etot, dens, vDist) {
    timeInTime.push(time)
    tempInTime.push(temp)
    densInTime.push(dens)
    pressInTime.push(press)
    KEInTime.push(ke)
    PEInTime.push(pe)
    EtotInTime.push(etot)
    vDistInTime.push(vDist)
}

function printOutput() {
    let temp = roundOutput(tempAct, 100000)
    let press = roundOutput(pressAct, 100000)
    let ke = roundOutput(KEAct, 100000)
    let pe = roundOutput(PEAct, 100000)
    //let peTail = roundOutput(PETailAct, 100000)
    //let peCoul = roundOutput(PECoulAct, 100000)
    let etot = roundOutput(KEAct+PEAct, 100000)
    let dens = roundOutput(densAct, 100000)

    pushTimeSeries(temp, press, ke, pe, etot, dens, vDist)

    if(timeInTime.length >= nReduce) {
        reduceTimeSeriesLength()
    }

    clearAndInitSvg()

/*     document.getElementById('output--teperature').innerText = "T = " + temp
    document.getElementById('output--KE').innerText = "KE = "+ ke
    document.getElementById('output--PE').innerText = "PE = "+ pe
    document.getElementById('output--PETail').innerText = "PETail = "+ peTail
    document.getElementById('output--PECoul').innerText = "PECoul = "+ peCoul
    document.getElementById('output--Etot').innerText = "Etot = "+ etot
    document.getElementById('output--press').innerText = "Press = "+ press */
}

