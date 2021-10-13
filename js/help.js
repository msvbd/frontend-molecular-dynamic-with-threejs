class Helper {
    static  helpers = []
    static  helpDiv = {}
    
    static initHelps() {
        let helpsHTML = document.getElementsByClassName("helpIcon")
        this.helpDiv = document.getElementById("help")
        for (const helpElement of helpsHTML) {
            //console.log(helpElement);
            this.helpers.push(new Helper(helpElement).init())
        }
    }

    constructor(HTMLElement) {
        this.innerHTML = ""
        this.HTMLElement = HTMLElement
    }

    init() {
        let helpText = this.HTMLElement.getElementsByClassName("helpText")[0]
        this.innerHTML = helpText.innerHTML
        this.HTMLElement.removeChild(helpText)
        this.HTMLElement.addEventListener("mouseenter", () => {
            this.mouseEnter(event, this)
        })
        this.HTMLElement.addEventListener("mouseleave", this.mouseLeave)
    }
    mouseEnter(event, that) {
        Helper.helpDiv.classList.remove("top")
        Helper.helpDiv.classList.remove("bottom")
        Helper.helpDiv.classList.add("visible")

        Helper.helpDiv.innerHTML = that.innerHTML
        if(event.clientY/window.innerHeight > 0.5)
            return Helper.helpDiv.classList.add("top")
        Helper.helpDiv.classList.add("bottom")
    }
    mouseLeave() {
        Helper.helpDiv.classList.remove("visible")
    }
}
