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
var MyWSModule

function initSomething() {
    readTempInputFrom()
    readPressInputFrom()
}

function initAll() {
    stop()
    console.log("init all");
    if(renderer) stopRender()
    time = 0

    readInputForm()
    SimInit()
    ThreeJSInit()   // 
    render()        // three js render
    OutputInit()    
    update(1)       // make one step
    printOutput()
    playRender()    // start rendering
}

output_init()
main()

// if WebGL is supported
function main() {
    if ( window.WebGLRenderingContext ) {

        setInputForm()
    
        Helper.initHelps()
    
        initAll()
    
        // resize listener
        window.addEventListener( 'resize', onWindowResize );

        //document.getElementById('form--simSett').addEventListener( 'change', initSomething )
        document.getElementById('form__input--temp') .addEventListener('change', initSomething )
        document.getElementById('form__input--press').addEventListener('change', initSomething )
        Array.prototype.map.call(document.getElementsByClassName('newSimIfChange'), (el)=>{
            el.addEventListener( 'change', initAll );
        });

        window.addEventListener("focus", playRender)
        window.addEventListener("blur", stopRender)
    
    // if WebGL is not supported
    } else {
        var warning = WEBGL.getWebGLErrorMessage();
        console.log(Error);
    }
}

/* let helps = document.getElementsByClassName("helpIcon");
for (const h of helps) {
    h.addEventListener("click", (e) => {
        e.currentTarget.classList.add("visible")
    })
} */