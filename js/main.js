
function initAll() {
    if(renderer) stopRender()
    time = 0
    readInputForm()
    SimInit()
    ThreeJSInit()
    render()
    OutputInit()
    update(1)
    printOutput()
    playRender()
}

// if WebGL is supported
if ( window.WebGLRenderingContext ) {

    // globals

    var draged_name=-1;
    var camera;
    var cameras = [];
    var scene;
    var renderer;
    var material;
    var geometry;
    var canvas;
    var controls;
    var dragControls;
    var dragControlsBody;
    var dragObjects = [];
    var playSim = false;

    setInputForm()

    Helper.initHelps()

    initAll()

    // resize listener
    window.addEventListener( 'resize', onWindowResize );
    document.getElementById('form--simSett').addEventListener( 'change', initAll )

// if WebGL is not supported
} else {
    var warning = WEBGL.getWebGLErrorMessage();
    console.log(Error);
}


/* let helps = document.getElementsByClassName("helpIcon");
for (const h of helps) {
    h.addEventListener("click", (e) => {
        e.currentTarget.classList.add("visible")
    })
} */