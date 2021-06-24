
function initAll() {
    readInputForm()
    SimInit()
    ThreeJSInit()
    render()
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
    var playSim = true;

    setInputForm()

    initAll()

    // resize listener
    window.addEventListener( 'resize', onWindowResize );
    document.getElementById('form--simSett').addEventListener( 'change', initAll )

// if WebGL is not supported
} else {
    var warning = WEBGL.getWebGLErrorMessage();
    console.log(Error);
}
