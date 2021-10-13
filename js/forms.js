function getFormsInputs() {
    return {
        //sig: document.getElementById('input--sig'),
        //eps: document.getElementById('input--eps'),
        //rc: document.getElementById('input--rc'),
        temp: document.getElementById('input--temp'),
        press: document.getElementById('input--press'),
        lbox: document.getElementById('input--lbox'),
        dens: document.getElementById('input--dens'),
        //nofp: document.getElementById('input--nOfP'),
        nofp: document.querySelectorAll("#form__input--molecules input"),
        mols: document.querySelectorAll("#form__input--molecules select"),
        //ensemble: document.getElementById('input--ensemble'),
        ensemble: document.querySelectorAll('input[name="ensemble"]'),
        //dimension: document.getElementById('input--dimension'),
        dimension: document.querySelectorAll('input[name="dimesnion"]'),
        tempDiv: document.getElementById('form__input--temp'),
        pressDiv: document.getElementById('form__input--press')
    }
}

function getEnsemble(inputs) {
    let ensemble = "nve"
    //console.log(inputs);
    inputs.forEach(el => {
        if(el.checked) {
            //console.log(el)
            ensemble = el.value
        }
    })
    //console.log(ensemble)
    return ensemble
}

function getFormsRanges() {
    return {
        //sig: document.getElementById('range--sig'),
        //eps: document.getElementById('range--eps'),
        //rc: document.getElementById('range--rc'),
        temp: document.getElementById('range--temp'),
        press: document.getElementById('range--press')
    }
}

function setInputForm() {
    setFormsInputs()
    setFormsRanges()
}

function setFormsInputs() {
    let input = getFormsInputs()
    //input.sig.value = sig
    //input.eps.value = eps
    //input.rc.value = rcut
    input.temp.value = temp
    input.press.value = press
    //input.nofp.value = Np
    input.dens.value = dens
    input.lbox.value = Lbox.x
}

function setFormsRanges() {
    let range = getFormsRanges()
    //range.sig.value = sig
    //range.eps.value = eps
    //range.rc.value = rcut
    range.temp.value = temp
    range.press.value = press
}

function getMols(input) {
    let mols = []
    for (const inMols of input.mols) {
        mols.push(inMols.value)
    }

    return mols
}

function getNps(input) {
    let Nps = []
    for (const mols of input.nofp) {
        Nps.push(mols.value)
    }
    return Nps
}

function getNp(input) {
    let Np = 0
    for (const mols of input.nofp) {
        Np += +mols.value
    }
    return Np
}

function readInputForm() {
    let input = getFormsInputs()
    //console.log(input)

    //console.log("Read Input Form")
    //sig = Number(input.sig.value)
    //eps = Number(input.eps.value)
    temp = Number(input.temp.value)
    press = Number(input.press.value)
    dens = Number(input.dens.value)

    mols = getMols(input)
    Nps = getNps(input)
    Np = getNp(input)
    //Np = Number(input.nofp.value)

    Lbox.x = Number(input.lbox.value)
    Lbox.y = Lbox.x
    Lbox.z = Lbox.x
    ensemble = getEnsemble(input.ensemble)

    input.dimension.forEach(el => {
        if(el.checked) {
            dimension = el.value
        }
    })
    //dimension = input.dimension.value

    //rcut = Number(input.rc.value)
    //if(rcut<1) {
    //    rcut = 1
    //    setFormsInputs()
    //}
    //if(rcut>Lbox.x*0.5) {
    //    rcut = Lbox.x*0.5
    //}
    //rcutsq = rcut**2
}

function onInputDens(event) {
    let input = getFormsInputs()
    input.lbox.value = Math.pow(Np/parseFloat(event.target.value), 1/3)
    readInputForm()
}

function onInputLBox(event) {
    let input = getFormsInputs()
    //input.dens.value = input.nofp.value/Math.pow(parseFloat(event.target.value), 3)
    input.dens.value = Np/Math.pow(parseFloat(input.lbox.value), 3)
    readInputForm()
}

function onInputNp(event) {
    let input = getFormsInputs()
    input.lbox.value = Math.pow(getNp(input)/parseFloat(input.dens.value), 1/3)
    readInputForm()
}

function addMolecule() {
    const mols = document.getElementById("form__input--molecules")
    const id = mols.childElementCount + 1 
    let div = mols.querySelector("div").cloneNode(true)

    let input = div.querySelector("input")
    input.value = 50

    let button = document.createElement("button")
    button.setAttribute("type", "button")
    button.innerText = "remove molecule"
    button.addEventListener("click", removeMolecule)
    div.appendChild(button)

    mols.appendChild(div)

    initAll()
}

function removeMolecule(event) {
    document.getElementById("form__input--molecules").removeChild(event.target.parentNode)
    initAll()
}