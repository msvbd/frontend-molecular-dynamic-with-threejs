class Helper {
    static  helpers = []
    static  helpDiv = {}
    
    static initHelps() {
        let helpsHTML = document.getElementsByClassName("helpIcon")
        this.helpDiv = document.getElementById("help")
        this.helpDiv.addEventListener("click", this.mouseLeave)
        for (const helpElement of helpsHTML) {
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
        this.HTMLElement.addEventListener("click", (event) => {
            this.mouseEnter(event, this)
        })
    }
    mouseEnter(event, that) {
        Helper.helpDiv.classList.add("visible")
        Helper.helpDiv.innerHTML = that.innerHTML
    }
    static mouseLeave() {
        Helper.helpDiv.classList.remove("visible")
    }
}
