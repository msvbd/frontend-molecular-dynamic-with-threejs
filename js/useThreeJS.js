function createCamera() {
    cameras = []
    let aspr = window.innerWidth / window.innerHeight

    cameras.push(new THREE.PerspectiveCamera( 45, aspr, 0.1, 1000 ));
    cameras.push(new THREE.OrthographicCamera( -aspr*Lbox.x, aspr*Lbox.x, Lbox.y, -Lbox.y, 1, 1000 ));
    //camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    //camera = new THREE.OrthographicCamera( -0.5*50, 0.5*50, -0.5*50, 0.5*50, -100, 100 );
    //camera.position.set( 0, 10, -20 );
    //camera.lookAt( 0, 0, 0 );
    cameras[0].position.set( 0, 10, 20 );
    cameras[0].lookAt( 0, 0, 0 );
    cameras[1].position.set( 0, 0, 20 );
    cameras[1].lookAt( 0, 0, 0 );
    camera = cameras[1];
}

function createLights() {
    //const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );

    const ambientLight = new THREE.HemisphereLight(
        0xddeeff,
        0x202020,
        1	);

    //const ambientLight = new THREE.AmbientLight( 0x404040 )

    const mainLight = new THREE.DirectionalLight( 0xffffff, 1 );
    mainLight.position.set( 10, -10, 10 );
    scene.add( ambientLight, mainLight );
}

function createMaterials() {
    const wall = new THREE.MeshStandardMaterial( {
        color: 0xffaa44,
        flatShading: true
        //opacity: 0.5
    } );

    const atom = new THREE.MeshStandardMaterial( {
        color: 0x44aaff,
        flatShading: true
    } );

    return {
        wall,
        atom
    };
}

function createGeometries() {
    const wall = new THREE.PlaneBufferGeometry(30, 30, 1, 1);
    const atom = new THREE.SphereBufferGeometry(sig*0.5, 10, 10);

    return {
        wall,
        atom
    };
}

function createHelpers() {
    function add(dir, hex) {
        //dir.normalize();
        const origin = new THREE.Vector3().copy(Lbox).multiplyScalar(-0.55);
        const length = 2;
        const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 1.0, 0.5 );
        scene.add( arrowHelper );
    }

    add(new THREE.Vector3( 1, 0, 0 ), 0xff0000);
    add(new THREE.Vector3( 0, 1, 0 ), 0x00ff00);
    add(new THREE.Vector3( 0, 0, 1 ), 0x0000ff);
}

function createSimBox() {
    const object = new THREE.Mesh( new THREE.BoxGeometry(Lbox.x, Lbox.y, Lbox.z), 
                                    new THREE.MeshBasicMaterial( {color: 0x00ff00} ) );
    const box = new THREE.BoxHelper( object, 0x000000 );
    return box
}


function createMeshes() {
    const materials = createMaterials();
    const geometries = createGeometries();

    //const wall = new THREE.Mesh(geometries.wall, materials.wall);
    //wall.rotation.set(-0.5*Math.PI, 0, 0);
    //scene.add(wall);
    //scene.add(new THREE.GridHelper(30, 10));

    simBox = createSimBox()
    scene.add( simBox );
    //simBox.add(createSimBox())

    //for (var part of atoms) {
    for (let i = 0; i < atoms.length; i++) {
        const particle = new THREE.Mesh(
            geometries.atom,
            materials.atom
        );
        // console.log(particle)
        particle.position.set(...Object.values(atoms[i].r));
        atoms[i].r = particle.position;

        scene.add(particle);
        //dragObjects.push(particle);
    }
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer();

    let canvasWrapper = document.getElementById('canvas--wrapper')

    canvas = document.getElementsByTagName("canvas")[0]
    //if(canvas !== undefined) canvas.parentNode.removeChild(canvas)
    if(canvas === undefined) {
        canvas = renderer.domElement;
        canvasWrapper.appendChild( canvas );
    } else {
        canvas.parentNode.replaceChild(renderer.domElement, canvas)
    }
    renderer.physicallyCorrectLights = false;
}

function createControls() {
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableKeys = false;
    controls.enablePan = false;
    controls.enableZoom = true;

    dragControlsBody = new THREE.DragControlsBody( dragObjects, camera, renderer.domElement );
    dragControlsBody.addEventListener( 'dragstart', function ( event ) {
        draged_name = event.object;
        controls.enabled = false;
    });

    dragControlsBody.addEventListener( 'dragend', function ( event ) {
        draged_name = 0;
        controls.enabled = true;
    });
}

function ThreeJSInit() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    createCamera()
    createLights()
    createMeshes()
    createRenderer()
    createControls()
    createHelpers()
    onWindowResize()
}

function update(n) {
    let st;
    
    for (st = 0; st < n; st++) {
        time += dt;
        newPosition()
        force()
        newVelocity()
    }
}

function render() {
    renderer.render( scene, camera );
}

function play() { playSim = true; switchInputsReadonly(true) }

function stop() { playSim = false; switchInputsReadonly(false)}

function playRender() {
    console.log("play");
    let nSteps = 10
    play()
    renderer.setAnimationLoop( () => {
        let startTime = new Date().getTime()
        if(playSim) { update(nSteps) }
        render();
        printOutput()
        let fps = 1000/(new Date().getTime() - startTime)
        if(fps < 15) {
            nSteps--
            if(nSteps<1) nSteps=1
        } else {
            nSteps++
        }
        //sleep(2000);
    } );
}

function stopRender() {
    stop()
    renderer.setAnimationLoop( null );
    console.log("stop");
}

function onWindowResize() {
    //let aspr = window.innerWidth / window.innerHeight
    let canvasWrapper =  document.getElementById('canvas--wrapper')
    let aspr = canvasWrapper.offsetWidth / canvasWrapper.offsetHeight

    cameras[0].aspect = aspr

    cameras[1].left = -aspr*Lbox.x
    cameras[1].right = aspr*Lbox.x

    //camera.aspect = document.body.clientWidth / document.body.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( canvasWrapper.offsetWidth, canvasWrapper.offsetHeight, true );
    renderer.render( scene, camera );
}
