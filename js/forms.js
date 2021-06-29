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
        ensenble: document.getElementById('input--ensemble'),
        dimension: document.getElementById('input--dimension'),
        tempDiv: document.getElementById('form__input--temp'),
        pressDiv: document.getElementById('form__input--press')
    }
}

function updateFormView() {
    let inputs = getFormsInputs()
    let ensemble = inputs.ensenble.value
    if(ensemble == "nph") {
        inputs.tempDiv.style.display = "none"
        inputs.pressDiv.style.display = "block"
    } else if(ensemble == "npt") {
        inputs.tempDiv.style.display = "block"
        inputs.pressDiv.style.display = "block"
    } else if(ensemble == "nve") {
        inputs.tempDiv.style.display = "none"
        inputs.pressDiv.style.display = "none"
    } else if(ensemble == "nvt") {
        inputs.tempDiv.style.display = "block"
        inputs.pressDiv.style.display = "none"
    }
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

function switchInputsReadonly(value) {
    let input = getFormsInputs()
    let range = getFormsRanges()
    //input.sig.readOnly = value
    //input.eps.readOnly = value
    //input.rc.readOnly = value
    input.temp.readOnly = value
    input.press.readOnly = value
    input.lbox.readOnly = value
    input.dens.readOnly = value
    //input.nofp.readOnly = value

    //range.sig.readOnly = value
    //range.eps.readOnly = value
    //range.rc.readOnly = value
    range.press.readOnly = value
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

function getNp(input) {
    let Np = 0
    for (const mols of input.nofp) { Np += +mols.value }
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

    Np = getNp(input)
    //Np = Number(input.nofp.value)

    Lbox.x = Number(input.lbox.value)
    Lbox.y = Lbox.x
    Lbox.z = Lbox.x
    ensenble = input.ensenble.value
    dimension = input.dimension.value

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