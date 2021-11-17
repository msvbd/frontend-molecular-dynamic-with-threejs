// globals
var particles = []; // = molecules + wall
var wall = []; // = wallUp + wallBot
var wallUp = [];
var wallBot = [];
var molecules = [];

var ensemble = "nvt"
var dimension = "2d"

var Np = 50;
var Nps = [50];
var mols = ["Simple"]

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
var timeSteps = 0;

var rijsqMin = 1 , sigMixMin = 1

// Atom Class
class Molecule {
    constructor(atoms, bonds, bends, isWall) {
        this.atoms = atoms,
        this.bonds = bonds,
        this.bends = bends,
        this.isWall = isWall
    }

    copy(r, v) {
        let atoms = []
        for (const atom of this.atoms) {
            atoms.push(atom.copy(r, v))
        }
        return new Molecule(
                    atoms,
                    this.bonds,
                    this.bends,
                    this.isWall
                )
    }
}

// Atom Class
class Atom {
    constructor(r, v, q, sig, eps, rcut, color, viewSize) {
        this.r = r
        this.v = v
        this.q = q
        this.sig = sig
        this.eps = eps
        this.rcut = rcut
        this.color = color
        this.viewSize = viewSize
        this.a = new THREE.Vector3(0,0,0)
        this.ap = new THREE.Vector3(0,0,0)
        this.f = new THREE.Vector3(0,0,0)
        this.fp = new THREE.Vector3(0,0,0)
    }

    copy(r, v) {
        return  new Atom(
                    this.r.clone().add(r),
                    this.v.clone().add(v),
                    this.q,
                    this.sig,
                    this.eps,
                    this.rcut,
                    this.color,
                    this.viewSize
                )
    }
}

// Molecules templates
molTemplates = {
    Simple:         new Molecule(
                        [new Atom(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), 0, 1.0, 1.0, 2.5, 0x0077cc, 0.5)],
                        null,
                        null,
                        false
                    ),
    Wall:           new Molecule(
                        [new Atom(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), 0, 1.0, 1.0, 1.0, 0x99ff88, 0.5)],
                        null,
                        null,
                        true
                    ),
    Repulsive_only: new Molecule(
                        [new Atom(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), 0, 1.0, 1.0, 1.0, 0x00cc77, 0.5)],
                        null,
                        null,
                        false
                    ),
    Ar:             new Molecule(
                        [new Atom(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), 0, 1.0, 1.0, 2.5, 0x0077cc, 0.5)],
                        null,
                        null,
                        false
                    ),
/*     Dimer:          new Molecule(
                        [
                            new Atom(new THREE.Vector3(0,-0.45, 0), new THREE.Vector3(0,0,0), 0.5 , 1.0, 1.0, 2.5, 0xff0000, 0.5),
                            new Atom(new THREE.Vector3(0, 0.45, 0), new THREE.Vector3(0,0,0), -0.5, 1.0, 1.0, 2.5, 0x00ff00, 0.5)
                        ],
                        [
                            {id1: 0, id2: 1, k: 100.0, r0: 1.0}
                        ],
                        null,
                        false
                    ),
    Water:          new Molecule(
                        [
                            new Atom(new THREE.Vector3(0  ,  0  , 0), new THREE.Vector3(0,0,0),  0.01 , 1.0, 1.0, 2.5, 0xff0000, 1.0),
                            new Atom(new THREE.Vector3(0.5,  0.5, 0), new THREE.Vector3(0,0,0), -0.005, 1.0, 1.0, 2.5, 0xcccccc, 0.5),
                            new Atom(new THREE.Vector3(0.5, -0.5, 0), new THREE.Vector3(0,0,0), -0.005, 1.0, 1.0, 2.5, 0xcccccc, 0.5)
                        ],
                        [
                            {id1: 0, id2: 1, k: 100.0, r0: 1.0},
                            {id1: 0, id2: 2, k: 100.0, r0: 1.0}
                        ],
                        [
                            {id1: 0, id2: 1, id3: 2, k: 100, a0: Math.PI*0.5}
                        ],
                        false
                    ) */
    }

// functions
function SimInit() {
    let Totvec = new THREE.Vector3();
    var Nl = Math.round(Math.pow(Np, 1.0/3.0))
    if(dimension == "2d") Nl = Math.round(Math.pow(Np, 1.0/2.0))+1
    const rm = Nl*sig*2.0>Lbox.x ? Lbox.x/Nl : sig*2.0
    const Nlp = rm*Nl/2
    const typesArray = createTypesArray()

    //Lbox.x = Nl*rm
    //Lbox.y = Nl*rm
    //Lbox.z = Nl*rm
    setInputForm()

    //console.log("SIM INIT")
    molecules = []
    wallBot = []
    wallUp = []
    particles = []
    wall = []

    let Nact = 0
    let totQ = 0.0, q = 0.0
    if(dimension == "2d") {
        /* create molecules */
        for (let j = 1; j < Nl; j++) {
            for (let i = 0; i < Nl; i++) {
                let vec = new THREE.Vector3(0,0,0).random()
                vec.setZ(0.0).normalize()
                vec.multiplyScalar(temp)
                Totvec.add(vec)
                /* q = Math.random()
                totQ += q */
                molecules.push( molTemplates[typesArray[Nact]].copy(
                        new THREE.Vector3(-Nlp+i*rm , -Nlp+j*rm , 0.0),
                        vec
                    )
                )
                Nact++
                if(Nact >= Np) break
            }
            if(Nact >= Np) break
        }
        /* create walls */
        if(ensemble.includes("_wall")) {
            let nwall = Math.ceil(Lbox.x)
            let dxWall = Lbox.x/nwall
            console.log(nwall, dxWall)
            
            for (let j = 0; j < 2; j++) {
                for (let i = 0; i < nwall; i++) {
                    if(!j) {
                        wallBot.push( molTemplates.Wall.copy(
                            new THREE.Vector3(0.5*dxWall-Lbox.x*0.5+i*dxWall,
                                            -0.5*Lbox.y+j*(Lbox.y-dxWall),
                                            0.0),
                            new THREE.Vector3(0,0,0)
                        ))
                    } else {
                        wallUp.push( molTemplates.Wall.copy(
                            new THREE.Vector3(0.5*dxWall-Lbox.x*0.5+i*dxWall,
                                            -0.5*Lbox.y+j*(Lbox.y-dxWall),
                                            0.0),
                            new THREE.Vector3(0,0,0)
                        ))
                    }
                }
            }
        }
    } else if(dimension == "3d") {
        /* create molecules */
        for (let j = 0; j < Nl; j++) {
            for (let i = 0; i < Nl; i++) {
                for (let k = 0; k < Nl; k++) {
                    let vec = new THREE.Vector3(0,0,0).random()
                    vec.multiplyScalar(temp)
                    Totvec.add(vec)
                    /* q = Math.random()
                    totQ += q */
                    molecules.push( molTemplates[typesArray[Nact]].copy(
                            new THREE.Vector3(-Nlp+i*rm , -Nlp+j*rm , -Nlp+k*rm),
                            vec
                        )
                    )
                    Nact++
                    if(Nact >= Np) break
                }
                if(Nact >= Np) break
            }
            if(Nact >= Np) break
        }
        console.log("Np / Nact", Np, Nact);
        /* create walls */
        if(ensemble.includes("_wall")) {
            let nwall = Math.ceil(Lbox.x)
            let dxWall = Lbox.x/nwall
            console.log(nwall**2, dxWall)
            
            for (let k = 0; k < 2; k++) {
                for (let i = 0; i < nwall; i++) {
                    for (let j = 0; j < nwall; j++) {
                        if(!k) {
                            wallBot.push( molTemplates.Wall.copy(
                                new THREE.Vector3(0.5*dxWall-Lbox.x*0.5+i*dxWall,
                                                 -0.5*Lbox.y+k*(Lbox.y-dxWall),
                                                 (i%2)*0.5*dxWall-Lbox.z*0.5+j*dxWall),
                                new THREE.Vector3(0,0,0)
                            ))
                        } else {
                            wallUp.push( molTemplates.Wall.copy(
                                new THREE.Vector3(0.5*dxWall-Lbox.x*0.5+i*dxWall,
                                                 -0.5*Lbox.y+k*(Lbox.y-dxWall),
                                                 (i%2)*0.5*dxWall-Lbox.z*0.5+j*dxWall),
                                new THREE.Vector3(0,0,0)
                            ))
                        }
                    }
                }
            }
        }
    }
    wall = wallUp.concat(wallBot)
    particles = molecules.concat(wall)

    totQ /= molecules.length
    Totvec.divideScalar(molecules.length)
    for (let i = 0; i < molecules.length; i++) {
        for (let j = 0; j < molecules[i].atoms.length; j++) {
            molecules[i].atoms[j].v.sub(Totvec)
            molecules[i].atoms[j].q -= totQ
        }
    }

    /* pbc function */
    if(ensemble.includes("wall")) {
        pbc = pbc_wall
    } else {
        pbc = pbc_normal
    }

    //thermostat()
    return true
}

function createTypesArray() {
    let res = []
    for (let i = 0; i < mols.length; i++) {
        //console.log(mols[i], Nps[i])
        for (let j = 0; j < Nps[i]; j++) {
            res.push(mols[i])
        }
    }
    //console.log(res)
    return res
}

function getActTemp() {
    let totVSq = 0.0 // tot sum v^2
    for (let i = 0; i < particles.length; i++) { // loop throw molecules
        for (let j = 0; j < particles[i].atoms.length; j++) { // loop throw molecules
            totVSq += particles[i].atoms[j].v.lengthSq() // compute sum v^2
        }
    }
    //console.log(particles.length)
    if(dimension === "2d") {
        totVSq /= (2*particles.length-2) // sum v^2 / DoF    
    } else {
        totVSq /= (3*particles.length-3) // sum v^2 / DoF    
    }
    //asdf
    return totVSq
}

function thermostat() { // scale temperature
    //ScaleVelocitiesThermostat()
    FrictionThermostat()
    return true
}

function ScaleVelocitiesThermostat() { // Scale Velocities Thermostat
    let fact = Math.sqrt(temp/tempAct)

    for (let i = 0; i < particles.length; i++) { // loop throw molecules
        for (let j = 0; j < particles[i].atoms.length; j++) { // loop throw molecules
            particles[i].atoms[j].v.multiplyScalar(fact)
        }
    }
}

function FrictionThermostat() { // Friction (Berendsen) Thermostat
    let xi = Math.sqrt(1.0 + 0.05*(temp/tempAct - 1.0))
    for (let i = 0; i < particles.length; i++) { // loop throw molecules
        for (let j = 0; j < particles[i].atoms.length; j++) { // loop throw molecules
            particles[i].atoms[j].v.multiplyScalar(xi)
        }
    }
}

function randNormal() {
    let u = Math.random()
    let v = Math.random()
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );   
}

function omgDPD(r, rc) {
    return 1 - r/rc
}

function dpdThermostat(r, rijvij) { // DPD "thermostat"
    let rc = 5
    let gamma = 5

    if(r < rc) return 0
    let fDfR = 0
    
    let omgDPDsq = omgDPD(r, rc)**2

    fDfR -= gamma * omgDPDsq * rijvij
    fDfR += Math.sqrt(2.0*temp*gamma * omgDPDsq * dt) * randNormal()

    return fDfR
}

function barostat() {
    FrictionBarostat()
    let vol = Lbox.x*Lbox.y
    if(dimension == "3d") vol *= Lbox.z
    densAct = Np/vol
    return true
}

function FrictionBarostat() {  // Friction (Berendsen) Barostat
    let eta = Math.cbrt(1.0 - 0.0002*(press - pressAct))
    if(dimension == "2d") eta = Math.sqrt(1.0 - 0.0002*(press - pressAct))
    Lbox.multiplyScalar(eta)
    simBox.setFromObject(createSimBox())
    for (let i = 0; i < molecules.length; i++) { // loop throw molecules
        for (let j = 0; j < molecules[i].atoms.length; j++) { // loop throw molecules
            molecules[i].atoms[j].r.multiplyScalar(eta)
        }
    }
    //setInputForm()
    //onInputLBox(null)
    return true
}

/* adaptive timestep */
function findValuesForAdaptivTimeStepFuncion(rijsq, sigMix) {
    if(rijsq < rijsqMin) {
        rijsqMin = rijsq
        sigMixMin = sigMix
    }
}

function adaptivTimeStep(rijsqMin, sigMix) {
    let w = 1 - Math.sqrt(rijsqMin) / sigMix
    if(w > 0.02 ) {
        dt *= 0.99
        //console.log("decrease dt ",dt)
    } else if(w < 0.001) {
        dt *= 1.01
        //console.log("increase dt ",dt)
    }
    if(dt < 0.0001) dt = 0.0001
    if(dt > 0.005) dt = 0.005
}

/* Mixing rools */
function mixingRules(sig1, eps1, sig2, eps2) {
    return [ Math.min(sig1, sig2), Math.sqrt(eps1*eps2) ] // min sqrtAve
    //return [ 0.5*(sig1 + sig2), Math.sqrt(eps1*eps2) ] // Loretz Berholrz
}

/* Lennard-Jones interaction */
function lj_f(rij, sig1, eps1, sig2, eps2) {
    let sig, eps
    [ sig, eps ] = mixingRules(sig1, eps1, sig2, eps2)
    const sigdr = sig**2/rij
    findValuesForAdaptivTimeStepFuncion(rij, sig)
    return 24*eps*(2*sigdr**6 - sigdr**3)/rij
}

function lj_u(rij, sig1, eps1, sig2, eps2) {
    let sig = 0.5*(sig1 + sig2)
    let eps = Math.sqrt(eps1*eps2)
    const sigdr = sig**2/rij
    return 4*eps*(sigdr**6 - sigdr**3)
}

/* Coulombe interaction */
function coul_f(qi, qj, rij) {
    //return 8.988e9*qi*qj/rij**2
    //console.log("coul_u", qi, qj, rij)
    return qi*qj/rij**2
}

function coul_u(qi, qj, rij) {
    //return 8.988e9*qi*qj/rij
    return qi*qj/rij
}

/* Bond interaction */
function bond_f(k, r0ij, rij) {
    return -0.5*k*(rij - r0ij)
}

function bond_u(k, r0ij, rij) {
    return k*(rij - r0ij)**2
}

/* Bend interaction */
function bend_f(k, a0ij, aij) {
    return -0.5*k*(aij - a0ij)
}

function bend_u(k, a0ij, aij) {
    return k*(aij - a0ij)**2
}

/* Periodic Boundary Condition */
function pbc_wall(rij) {
    const L = new THREE.Vector3().copy(Lbox).setY(1000)
    const r = new THREE.Vector3().copy(rij)
    return  L.multiply(r.divide(L).round())
}

function pbc_normal(rij) {
    const L = new THREE.Vector3().copy(Lbox)
    const r = new THREE.Vector3().copy(rij)
    return  L.multiply(r.divide(L).round())
}
var pbc = pbc_normal

/* Forces */
function force() {
    const n = particles.length;
    const nm = molecules.length;
    const nw = wallUp.length;
    let i, j, ip, jp, rij, rcutljsq, fc, rijsq;
    let vij
    let tmp, angle, dist
    let pressTensor = [0.0, 0.0, 0.0]

    /* Zero acceleration */
    for (i = 0; i < nm; i++) {
        for (j = 0; j < molecules[i].atoms.length; j++) {
            molecules[i].atoms[j].a.set(0,0,0)
        }
    }
    
    if(wallUp[0]) {
        if(dimension == "2d") {
            wallUp[0].atoms[0].a
                .add(new THREE.Vector3().set(0, -press*Lbox.x    ,0))
        }else{
            wallUp[0].atoms[0].a
                .add(new THREE.Vector3().set(0, -press*Lbox.x**2 ,0))
        }
    }

    if(wallBot[0]) wallBot[0].atoms[0].a.set(0,0,0)
    for (i = 1; i < nw; i++) {
        wallUp[i].atoms[0].a = wallUp[0].atoms[0].a
        wallBot[i].atoms[0].a = wallBot[0].atoms[0].a
    }


    /* Compute pair forces */
    PEAct = 0
    //PECoulAct = 0
    pressAct = 0
    for (i = 0; i < nm; i++) {
        for (ip = 0; ip < particles[i].atoms.length; ip++) {
            for (j = i+1; j < n; j++) {
                for (jp = 0; jp < particles[j].atoms.length; jp++) {
                    rij = new THREE.Vector3().subVectors(particles[i].atoms[ip].r , particles[j].atoms[jp].r)
                    rij.sub( pbc(rij));
                    //rcutljsq = ((particles[i].atoms[ip].rcut + particles[j].atoms[jp].rcut)*0.5)**2
                    rcutljsq = Math.min(particles[i].atoms[ip].rcut, particles[j].atoms[jp].rcut)
                    rijsq = rij.lengthSq()

                    /* vij = new THREE.Vector3().subVectors(particles[i].atoms[ip].v , particles[j].atoms[jp].v)
                    tmp = dpdThermostat(rij.length(), rij.dot(vij)) */

                    if(rijsq > rcutsq || rijsq > rcutljsq) continue

                    tmp = lj_f(rijsq, particles[i].atoms[ip].sig, particles[i].atoms[ip].eps, particles[j].atoms[jp].sig, particles[j].atoms[jp].eps)
                    tmp += coul_f(particles[i].atoms[ip].q, particles[j].atoms[jp].q, rijsq)

                    PEAct += lj_u(rijsq, particles[i].atoms[ip].sig, particles[i].atoms[ip].eps, particles[j].atoms[jp].sig, particles[j].atoms[jp].eps)
                    //PECoulAct += coul_u(particles[i].atoms[ip].q, particles[j].atoms[jp].q, rijsq)
                    PEAct += coul_u(particles[i].atoms[ip].q, particles[j].atoms[jp].q, rijsq)
                    fc = rij.normalize().multiplyScalar(tmp)

                    particles[i].atoms[ip].a.add(fc.multiplyScalar(1))
                    particles[j].atoms[jp].a.add(fc.multiplyScalar(-1))
                    if(j<nm) {
                        pressAct += rij.dot(fc)
                    }
                }
            }

            /* pressTensor[0] = particles[i].atoms[ip].r.x * particles[i].atoms[ip].a.x + particles[i].atoms[ip].v.x**2
            pressTensor[1] = particles[i].atoms[ip].r.y * particles[i].atoms[ip].a.y + particles[i].atoms[ip].v.y**2
            pressTensor[2] = particles[i].atoms[ip].r.z * particles[i].atoms[ip].a.z + particles[i].atoms[ip].v.z**2 */
        }
    }
/*     for (i = 0; i < wallBot.length; i++) {
        for (ip = 0; ip < wallBot[i].atoms.length; ip++) {
            for (j = 0; j < wallUp.length; j++) {
                for (jp = 0; jp < wallUp[j].atoms.length; jp++) {
                    rij = new THREE.Vector3().subVectors(wallBot[i].atoms[ip].r , wallUp[j].atoms[jp].r)
                    rij.sub( pbc(rij));
                    rcutljsq = ((wallBot[i].atoms[ip].rcut + wallUp[j].atoms[jp].rcut)*0.5)**2
                    rijsq = rij.lengthSq()

                    //vij = new THREE.Vector3().subVectors(wallBot[i].atoms[ip].v , wallUp[j].atoms[jp].v)
                    //tmp = dpdThermostat(rij.length(), rij.dot(vij))

                    if(rijsq > rcutsq || rijsq > rcutljsq) continue

                    tmp = lj_f(rijsq, wallBot[i].atoms[ip].sig, wallBot[i].atoms[ip].eps, wallUp[j].atoms[jp].sig, wallUp[j].atoms[jp].eps)
                    tmp += coul_f(wallBot[i].atoms[ip].q, wallUp[j].atoms[jp].q, rijsq)

                    PEAct += lj_u(rijsq, wallBot[i].atoms[ip].sig, wallBot[i].atoms[ip].eps, wallUp[j].atoms[jp].sig, wallUp[j].atoms[jp].eps)
                    //PECoulAct += coul_u(wallBot[i].atoms[ip].q, wallUp[j].atoms[jp].q, rijsq)
                    PEAct += coul_u(wallBot[i].atoms[ip].q, wallUp[j].atoms[jp].q, rijsq)
                    fc = rij.normalize().multiplyScalar(tmp)
                    wallBot[i].atoms[ip].a.add(fc.multiplyScalar(1))
                    wallUp[j].atoms[jp].a.add(fc.multiplyScalar(-1))
                    pressAct += rij.dot(fc)
                }
            }
        }
    } */

    /* compute bonds & bends */
/*     for (i = 0; i < nm; i++) {
        if(molecules[i].bonds) {
            for (ib = 0; ib < molecules[i].bonds.length; ib++) {
                rij = new THREE.Vector3().subVectors(molecules[i].atoms[molecules[i].bonds[ib].id1].r , molecules[i].atoms[molecules[i].bonds[ib].id2].r)
                rij.sub( pbc(rij));
                dist = rij.length()
    
                tmp = bond_f(   molecules[i].bonds[ib].k , molecules[i].bonds[ib].r0 , dist)
                PEAct += bond_u(molecules[i].bonds[ib].k , molecules[i].bonds[ib].r0 , dist)
                fc = rij.normalize().multiplyScalar(tmp)
                molecules[i].atoms[molecules[i].bonds[ib].id1].a.add(fc.multiplyScalar(1))
                molecules[i].atoms[molecules[i].bonds[ib].id2].a.add(fc.multiplyScalar(-1))
                pressAct += rij.dot(fc)
            }
        }
        if(molecules[i].bends) {
            for (ib = 0; ib < molecules[i].bends.length; ib++) {
                rij1 = new THREE.Vector3().subVectors(molecules[i].atoms[molecules[i].bends[ib].id1].r , molecules[i].atoms[molecules[i].bends[ib].id2].r)
                rij2 = new THREE.Vector3().subVectors(molecules[i].atoms[molecules[i].bends[ib].id1].r , molecules[i].atoms[molecules[i].bends[ib].id3].r)
                angle = Math.acos(rij1.dot(rij2) / (rij1.length() * rij2.length()))
                //console.log("Angle: ",angle)
                
                rij = new THREE.Vector3().crossVectors(rij1, rij2).normalize()
    
                tmp = bond_f(   molecules[i].bends[ib].k , molecules[i].bends[ib].a0 , angle )
                PEAct += bond_u(molecules[i].bends[ib].k , molecules[i].bends[ib].a0 , angle )

                fc = new THREE.Vector3().crossVectors(rij, rij1.normalize()).multiplyScalar(tmp)
                molecules[i].atoms[molecules[i].bends[ib].id1].a.add(fc.multiplyScalar(-1))
                molecules[i].atoms[molecules[i].bends[ib].id2].a.add(fc.multiplyScalar(1))

                fc = new THREE.Vector3().crossVectors(rij, rij2.normalize()).multiplyScalar(tmp)
                molecules[i].atoms[molecules[i].bends[ib].id1].a.add(fc.multiplyScalar(1))
                molecules[i].atoms[molecules[i].bends[ib].id3].a.add(fc.multiplyScalar(-1))
                pressAct += rij.dot(fc)
            }
        }
    } */

/* *************************************************************** */   
/*     if(wallUp[0]) {
        wallUp[0].atoms[0].a.set(0, 0 ,0)
    }
    if(wallBot[0]) wallBot[0].atoms[0].a.set(0,0,0)
    for (i = 1; i < wallUp.length; i++) {
        wallUp[i].atoms[0].a = wallUp[0].atoms[0].a
        wallBot[i].atoms[0].a = wallBot[0].atoms[0].a
    } */
/* *************************************************************** */

    if(wallUp[0]) wallUp[0].atoms[0].a.divideScalar(nw)

    /* compute potential energy */
    PETailAct = 8.0/3.0*dens*Math.PI*eps*(sig**3)*(((sig/rcut)**9)/3.0 - (sig/rcut)**3)
    PEAct += PETailAct
    PEAct /= n
    //PECoulAct /= n

    if(wallUp[0]) {
        let vol = (wallUp[0].atoms[0].r.y - wallBot[0].atoms[0].r.y) * Lbox.x
        if(dimension === "3d") vol *= Lbox.z
        densAct = Np/vol   
    }

    /* compute pressure */
    if(dimension == "2d") {
        pressAct /= 2.0*Lbox.x*Lbox.y
        /* pressTensor[0] /= Lbox.x*Lbox.y*2
        pressTensor[1] /= Lbox.x*Lbox.y*2
        pressTensor[2] /= Lbox.x*Lbox.y*2 */
    } else {
        //pressAct = nm*(pressTensor[0]+pressTensor[1]+pressTensor[2])/(3.0*Lbox.x*Lbox.y*Lbox.z)
        //pressAct /= 3.0*Lbox.x*Lbox.y*Lbox.z*(nm-1)
        pressAct /= 3.0*Lbox.x*Lbox.y*Lbox.z
        /* pressTensor[0] /= Lbox.x*Lbox.y*Lbox.z*3
        pressTensor[1] /= Lbox.x*Lbox.y*Lbox.z*3
        pressTensor[2] = 0.0 */
    }

    //console.log("PRESS", something/nsomething)

    pressAct += 16.0/3.0*(densAct**2)*Math.PI*eps*(sig**3)*(((sig/rcut)**9)*2.0/3.0 - (sig/rcut)**3) // tail
    //pressAct += dens*temp // id gas part
    pressAct += densAct*tempAct // id gas part

    return true
}

function crashTest() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = 0; j < particles[i].atoms.length; j++) {
            if( isNaN(particles[i].atoms[j].r.x) ||
                isNaN(particles[i].atoms[j].r.y) ||
                isNaN(particles[i].atoms[j].r.z) ||
                !isFinite(particles[i].atoms[j].r.x) ||
                !isFinite(particles[i].atoms[j].r.y) ||
                !isFinite(particles[i].atoms[j].r.z)) {
                console.error("Simulation Error");
                return true
            }
        }
    }
    return false
}

function newPosition() {
    const n = particles.length;
    let i,j;

    for (i = 0; i < n; i++) {
        for (j = 0; j < particles[i].atoms.length; j++) {
            particles[i].atoms[j].r.add(new THREE.Vector3().copy(particles[i].atoms[j].v).multiplyScalar(dt))
                        .add(new THREE.Vector3().copy(particles[i].atoms[j].a).multiplyScalar(0.5*dt**2))
            particles[i].atoms[j].r.sub(pbc(particles[i].atoms[j].r))
        }
    }

    if(ensemble=="npt" || ensemble=="nph") barostat()
}

function newVelocity() {
    const n = particles.length;
    const nm = molecules.length;
    const nw = wallUp.length;
    let i,j;

    KEAct = 0;
    let vSizes = []
    for (i = 0; i < nm; i++) {
        for (j = 0; j < molecules[i].atoms.length; j++) {
            molecules[i].atoms[j].v.add(new THREE.Vector3().copy(molecules[i].atoms[j].a).add(molecules[i].atoms[j].ap).multiplyScalar(0.5*dt) )

            KEAct += 0.5*molecules[i].atoms[j].v.lengthSq();

            molecules[i].atoms[j].ap.copy(molecules[i].atoms[j].a)

            vSizes.push(molecules[i].atoms[j].v.length())
        }
    }
    for (i = 0; i < nw; i++) {
        for (j = 0; j < wallUp[i].atoms.length; j++) {
            wallBot[i].atoms[j].a.set(0.0, 0.0, 0.0)
            wallUp[i].atoms[j].a.setX(0.0).setZ(0.0)
            wallUp[i].atoms[j].v.add(new THREE.Vector3().copy(wallUp[i].atoms[j].a).add(wallUp[i].atoms[j].ap).multiplyScalar(0.5*dt) )

            KEAct += 0.5*wallUp[i].atoms[j].v.lengthSq();

            wallUp[i].atoms[j].ap.copy(wallUp[i].atoms[j].a)

            //vSizes.push(wall[i].atoms[j].v.length())
        }
    }
    KEAct /= n

    computeVDist(vSizes)
    tempAct = getActTemp()
    if(ensemble=="nvt" || ensemble=="npt" || ensemble=="npzt_wall") thermostat()
    //if(ensemble=="nvt" || ensemble=="npt") thermostat()
}

function zeroTotalMomentum() {
    let Totvec = new THREE.Vector3();
    Totvec.divideScalar(molecules.length)
    for (let i = 0; i < molecules.length; i++) {
        for (let j = 0; j < molecules[i].atoms.length; j++) {
            Totvec.add(molecules[i].atoms[j].v)
        }
    }
    Totvec.divideScalar(molecules.length)
    for (let i = 0; i < molecules.length; i++) {
        for (let j = 0; j < molecules[i].atoms.length; j++) {
            molecules[i].atoms[j].v.sub(Totvec)
        }
    }
}

function computeVDist(vSizes) {
    let maxSize = Math.max(...vSizes)
    let Nn = Math.round(Np*0.25)
    let ds = maxSize/Nn
    vDist = new Array(Nn+1)
    for (let i = 0; i < vDist.length; i++) { vDist[i]=0 }
    for (let i = 0; i < vSizes.length; i++) {
        j = Math.floor(vSizes[i]/ds)
        vDist[j]++
    }
}