// globals
var atoms = [];
var walls = [];

var ensenble = "nvt"
var dimension = "2d"

var Np = 50;
var temp = 1.0;
var press = 1.0;
var rcut = 2.5
var rcutsq = rcut**2
var sig = 1
var eps = 1
var dt = 0.001
var dens = 0.01
var Lbox = Math.pow(Np/dens ,1/3)
var Lbox = new THREE.Vector3(Lbox, Lbox, Lbox)
var simBox = {}

var time = 0;

// Atom Class
class Atom {
    constructor(r, v, q, a, ap, f, fp, sig, eps) {
        this.r = r
        this.v = v
        this.q = q
        this.sig = sig
        this.eps = eps
        this.a = new THREE.Vector3(0,0,0)
        this.ap = new THREE.Vector3(0,0,0)
        this.f = new THREE.Vector3(0,0,0)
        this.fp = new THREE.Vector3(0,0,0)
    }
}

// functions
function SimInit() {
    let Totvec = new THREE.Vector3();
    var Nl = Math.round(Math.pow(Np, 1.0/3.0))
    if(dimension == "2d") Nl = Math.round(Math.pow(Np, 1.0/2.0))
    const rm = Nl*sig*1.2>Lbox.x ? Lbox.x/Nl : sig*1.2
    const Nlp = rm*Nl/2
    //Lbox.x = Nl*rm
    //Lbox.y = Nl*rm
    //Lbox.z = Nl*rm
    setInputForm()

    atoms = []

    let Nact = 0
    let totQ = 0.0, q = 0.0
    if(dimension == "2d") {
        for (let i = 0; i < Nl; i++) {
            for (let j = 0; j < Nl; j++) {
                let vec = new THREE.Vector3(0,0,0).random()
                vec.setZ(0.0).normalize()
                vec.multiplyScalar(temp)
                Totvec.add(vec)
                q = Math.random()
                totQ += q
                atoms.push( new Atom(new THREE.Vector3(-Nlp+i*rm , -Nlp+j*rm , 0.0),
                                    vec, q,  sig, eps)
                        )
                Nact++
                if(Nact >= Np) break
            }
            if(Nact >= Np) break
        }
    } else if(dimension == "3d") {
        for (let i = 0; i < Nl; i++) {
            for (let j = 0; j < Nl; j++) {
                for (let k = 0; k < Nl; k++) {
                    let vec = new THREE.Vector3(0,0,0).random()
                    vec.multiplyScalar(temp)
                    Totvec.add(vec)
                    q = Math.random()
                    totQ += q
                    atoms.push( new Atom(new THREE.Vector3(-Nlp+i*rm , -Nlp+j*rm , -Nlp+k*rm),
                                        vec, q)
                            )
                    Nact++
                    if(Nact >= Np) break
                }
                if(Nact >= Np) break
            }
            if(Nact >= Np) break
        }
    }
    totQ /= atoms.length
    Totvec.divideScalar(atoms.length)
    for (let i = 0; i < atoms.length; i++) {
        atoms[i].v.sub(Totvec)
        atoms[i].q -= totQ
    }

    //thermostat()
    return true
}

function getActTemp() {
    let totVSq = 0.0 // tot sum v^2
    for (let i = 0; i < atoms.length; i++) { // loop throw atoms
        //totVSq += atoms[i].v.dot(atoms[i].v) // compute sum v^2
        totVSq += atoms[i].v.lengthSq() // compute sum v^2
    }
    totVSq /= (3*atoms.length-3) // sum v^2 / DoF

    return totVSq
}

function thermostat() { // scale temperature
    //ScaleVelocitiesThermostat()
    FrictionThermostat()
    return true
}

function ScaleVelocitiesThermostat() { // Scale Velocities Thermostat
    let fact = Math.sqrt(temp/tempAct)

    for (let i = 0; i < atoms.length; i++) { // loop throw atoms
        atoms[i].v.multiplyScalar(fact)
    }
}

function FrictionThermostat() { // Friction (Berendsen) Thermostat
    let xi = Math.sqrt(1.0 + 0.01*(temp/tempAct - 1.0))
    for (let i = 0; i < atoms.length; i++) { // loop throw atoms
        atoms[i].v.multiplyScalar(xi)
    }
}

function barostat() {
    FrictionBarostat()
    let vol = Lbox.x*Lbox.y
    if(dimension == "3d") vol *= Lbox.z
    densAct = Np/vol
    //console.log(densAct)
    return true
}

function FrictionBarostat() {  // Friction (Berendsen) Barostat
    let eta = Math.cbrt(1.0 - 0.0002*(press - pressAct))
    Lbox.multiplyScalar(eta)
    simBox.setFromObject(createSimBox())
    for (let i = 0; i < atoms.length; i++) { // loop throw atoms
        atoms[i].r.multiplyScalar(eta)
    }
    //setInputForm()
    //onInputLBox(null)
    return true
}

function lj_f(rij) {
    const sigdr = sig**2/rij
    return 24*eps*(2*sigdr**6 - sigdr**3)/rij
}

function lj_u(rij) {
    const sigdr = sig**2/rij
    return 4*eps*(sigdr**6 - sigdr**3)
}

function coul_f(qi, qj, rij) {
    //return 8.988e9*qi*qj/rij**2
    //console.log("coul_u", qi, qj, rij)
    return qi*qj/rij**2
}

function coul_u(qi, qj, rij) {
    //return 8.988e9*qi*qj/rij
    return qi*qj/rij
}

function pbc(rij) {
    const L = new THREE.Vector3().copy(Lbox);
    const r = new THREE.Vector3().copy(rij);
    return  L.multiply(r.divide(L).round())
}

function force() {
    const n = atoms.length;
    let i, j, rij, fc, rijsq;

    for (i = 0; i < n; i++) {
        atoms[i].a.set(0,0,0)
    }

    PEAct = 0
    PECoulAct = 0
    pressAct = 0
    for (i = 0; i < n-1; i++) {
        for (j = i+1; j < n; j++) {
            rij = new THREE.Vector3().subVectors(atoms[i].r , atoms[j].r)
            rij.sub( pbc(rij));
            if(rij > rcutsq) continue
            rijsq = rij.lengthSq()
            let tmp = lj_f(rijsq)
            tmp += coul_f(atoms[i].q, atoms[j].q, rijsq)
            PEAct += lj_u(rijsq)
            PECoulAct += coul_u(atoms[i].q, atoms[j].q, rijsq)
            PEAct += coul_u(atoms[i].q, atoms[j].q, rijsq)
            fc = rij.normalize().multiplyScalar(tmp)
            atoms[i].a.add(fc.multiplyScalar(1))
            atoms[j].a.add(fc.multiplyScalar(-1))
            pressAct += rij.dot(fc)
        }
    }
    PETailAct = 8.0/3.0*dens*Math.PI*eps*(sig**3)*(((sig/rcut)**9)/3.0 - (sig/rcut)**3)
    PEAct += PETailAct
    PEAct /= n
    PECoulAct /= n

    if(dimension == "2d") {
        pressAct /= 2.0*Lbox.x*Lbox.y
    } else {
        pressAct /= 3.0*Lbox.x*Lbox.y*Lbox.z
    }
    pressAct += 16.0/3.0*(dens**2)*Math.PI*eps*(sig**3)*(((sig/rcut)**9)*2.0/3.0 - (sig/rcut)**3) // tail
    pressAct += dens*temp // id gas part
    return true
}


function newPosition() {
    const n = atoms.length;
    let i;

    for (i = 0; i < n; i++) {
        atoms[i].r.add(new THREE.Vector3().copy(atoms[i].v).multiplyScalar(dt))
                    .add(new THREE.Vector3().copy(atoms[i].a).multiplyScalar(0.5*dt**2))
        atoms[i].r.sub(pbc(atoms[i].r))
    }

    if(ensenble=="npt" || ensenble=="nph") barostat()
}

function newVelocity() {
    const n = atoms.length;
    let i;

    KEAct = 0;
    let vSizes = []
    for (i = 0; i < n; i++) {
        atoms[i].v.add(new THREE.Vector3().copy(atoms[i].a).add(atoms[i].ap).multiplyScalar(0.5*dt) )

        KEAct += 0.5*atoms[i].v.lengthSq();

        atoms[i].ap.copy(atoms[i].a)

        vSizes.push(atoms[i].v.length())
    }
    KEAct /= n

    let maxSize = Math.max(...vSizes)
    let Nn = Math.round(Np*0.25)
    let ds = maxSize/Nn
    let j
    vDist = new Array(Nn+1)
    for (let i = 0; i < vDist.length; i++) { vDist[i]=0 }
    for (let i = 0; i < vSizes.length; i++) {
        j = Math.floor(vSizes[i]/ds)
        vDist[j]++
    }
    tempAct = getActTemp()
    if(ensenble=="nvt" || ensenble=="npt") thermostat()
}
