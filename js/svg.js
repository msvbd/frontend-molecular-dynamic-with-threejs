const SvgClosure = function() {
    const graphs = document.getElementById('graphs')
    //const svg = document.getElementById('svg--graphs')
    //const wSvg = svg.clientWidth
    //const hSvg = svg.clientHeight
    let wSvg = 0, hSvg = 0, svg, id = 0
    let isInit = false
    let divs = []
    let globalLabel = ""
    const svgNameSpace = 'http://www.w3.org/2000/svg'
      
    function getYAxis(offset) {
        let arrow = ''
        let x = offset[0]
        let y = offset[1] - 10
        arrow += 'M '+x+' '+(hSvg-offset[1])
        arrow += 'L '+x+' '+y
        arrow += 'M '+x+' '+y
        arrow += 'L '+(x+10)+' '+(y+20)
        arrow += 'M '+x+' '+y
        arrow += 'L '+(x-10)+' '+(y+20)
        return arrow
    }
    function getXAxis(offset) {
        let arrow = ''
        let x = hSvg + offset[0] -10
        let y = hSvg - offset[1]
        arrow += 'M '+(offset[0])+' '+y
        arrow += 'L '+x+' '+y
        arrow += 'M '+x+' '+y
        arrow += 'L '+(x-20)+' '+(y-10)
        arrow += 'M '+x+' '+y
        arrow += 'L '+(x-20)+' '+(y+10)
        return arrow
    }
    
    function createLinePath(line, color, lw) {
        let path = document.createElementNS(svgNameSpace,'path')
        path.setAttribute('d', line)
        path.setAttribute('stroke-width', lw)
        path.setAttribute('stroke', color)
        path.setAttribute('fill', 'transparent')
        return path
    }

    function getDiv(help) {
        id++
     
        if(isInit) {
            if(id >= divs.length) id = 0
            return divs[id].lastChild
        } else {
            let div = document.createElement("div")
            div.setAttribute("class", "graphs__div--graph")
            div.dataset.id = id
            div.addEventListener("click", () => {
                let svg = event.currentTarget.lastChild
                if(svg.getAttribute("width") == "250px") {
                    svg.setAttribute("width", "0px")
                } else {
                    svg.setAttribute("width", "250px")
                }
            })
            let header = document.createElement("header")
            header.setAttribute("class", "graph--head")
            header.innerText = globalLabel
            header.innerHTML += ' <span class="helpIcon"><div class="helpText">'+help+'</div></span>'

            div.appendChild(header)

            svg = document.createElementNS(svgNameSpace,'svg')
            svg.setAttribute("width", "0px")
            svg.setAttribute("height", "150px")
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
            div.appendChild(svg)
            graphs.appendChild(div)
            wSvg = 250//svg.clientWidth + 20
            hSvg = 150//svg.clientHeight + 0
            //console.log(wSvg, hSvg)

            divs.push(div)
            return svg
        }   
    }

    function plotGraph(offset,data, label, help) {
        
        //plotSomething(offset, label)
        globalLabel = label
        svg = getDiv(help)
   
        /* axes */
        let line = ''
        line += getXAxis(offset)
        line += getYAxis(offset)
        svg.appendChild(
            createLinePath(line, 'black', 3)
        )

        /* graph */
        let timeMin = Math.min(...timeInTime)
        let dataMax = Math.max(...data) 
        let dataMin = Math.min(...data) 
        let ave = data.reduce((d, cur) => cur+=d)
        ave /= data.length
        ave = roundOutput(ave, 100000)
        let dTime = Math.max(...timeInTime)-timeMin || 1.0
        let dData = dataMin-dataMax || 1.0
        line = 'M '+((hSvg-30)*(timeInTime[0]-timeMin)/dTime + offset[0])+' '+((hSvg-40)*(data[0]-dataMax)/dData + offset[1]+20)
        for (let i = 1; i < timeInTime.length; i++) {
            line += 'L '+((hSvg-30)*(timeInTime[i]-timeMin)/dTime + offset[0])+' '+((hSvg-40)*(data[i]-dataMax)/dData + offset[1]+20)
        }
        svg.appendChild(
            createLinePath(line, 'red', 3)
        )

        /* text */
        //<text x="20" y="35" class="small">My</text>
/*         let text = document.createElementNS(svgNameSpace,'text')
        text.setAttribute("x",30)
        text.setAttribute("y",15)
        text.innerHTML = label
        svg.appendChild(text) */

        text = document.createElementNS(svgNameSpace,'text')
        text.setAttribute("x",10)
        text.setAttribute("y",30)
        text.innerHTML = dataMax
        svg.appendChild(text)

        /* average */
        text = document.createElementNS(svgNameSpace,'text')
        let avey = ((hSvg-40)*(ave-dataMax)/dData + offset[1]+20)
        text.setAttribute("x",10)
        text.setAttribute("y",avey)
        text.innerHTML = ave
        svg.appendChild(text)
        
        line = document.createElementNS(svgNameSpace,'line')
        line.setAttribute("x1",80)
        line.setAttribute("y1",avey)
        line.setAttribute("x2",hSvg+50)
        line.setAttribute("y2",avey)
        line.setAttribute("stroke","black")
        line.setAttribute("stroke-dasharray","4")
        //<line x1="0" y1="3" x2="30" y2="3" stroke="black" stroke-dasharray="4" />
        svg.appendChild(line)
        
        text = document.createElementNS(svgNameSpace,'text')
        text.setAttribute("x",10)
        text.setAttribute("y",hSvg-10)
        text.innerHTML = dataMin
        svg.appendChild(text)
    }

    function plotDist(offset,data, label, help) {
                
        globalLabel = label
        svg = getDiv(help)
        //<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" id="svg--graphs"></svg>

        /* axes */
        let line = ''
        line += getXAxis(offset)
        line += getYAxis(offset)
        svg.appendChild(
            createLinePath(line, 'black', 3)
        )

        if(!data[0]) return
        let ave = new Array(data[0].length)
        let i, j
        for (i = 0; i < ave.length; i++) { ave[i]=0 }
        for (i = 0; i < data.length; i++) {
            for (j = 0; j < data[i].length; j++) {
                ave[j] += data[i][j]
                //ave[i] += data
            }
        }
        for (i = 0; i < ave.length; i++) { ave[i]/=data.length }
        //console.log(ave);
        //console.log(data.length);

        /* graph */
        let dataMax = Math.max(...ave) 
        let dTime = ave.length
        let dData = Math.min(...ave)-dataMax || 1.0
        line = 'M '+offset[0]+' '+((hSvg-40)*(ave[0]-dataMax)/dData + offset[1]+20)
        for (let i = 1; i < ave.length; i++) {
            line += 'L '+((hSvg-30)*i/dTime + offset[0])+' '+((hSvg-40)*(ave[i]-dataMax)/dData + offset[1]+20)
        }
        svg.appendChild(
            createLinePath(line, 'red', 3)
        )
    }

    function initSvg() {
        offsetX = 80
        offsetY = 10
        plotDist([40,offsetY], vDistInTime, "Distribuce rychlost??", '<p>Distribuce rychlost?? ukazuje jak?? pod??l ????stic m?? jakou rychlost. Po ??ase by se m??la distribuce ust??lit a ji?? se p????li?? nem??nit. Distribuce by m??la odpov??dat Maxwelovu-Boltzmanuvu rozd??len?? rychlost??.</p>')
        plotGraph([offsetX,offsetY], tempInTime, "T(t)", "<p>Graf z??vislosti teploty na ??ase. Teplota by se m??la ust??lit na rovnov????n?? hodnot??, pop??. na hodnot??, kterou jste nastavili. Kolem t??to hodnot by m??la hodnota oscilovat.</p>")
        plotGraph([offsetX,offsetY], PEInTime, "PE(t)", "<p>Celkov?? potenci??ln?? energie ????stic.</p>")
        plotGraph([offsetX,offsetY], KEInTime, "KE(t)", "<p>Celkov?? kinetick?? energie ????stic.</p>")
        plotGraph([offsetX,offsetY], EtotInTime, "Etot(t)", "<p>Sou??et celkov?? potenci??ln?? a celkov?? kinetick?? energie. V p????pad?? simulac?? **E nebo **H bude hodnota oscilovat kolem rovnov????n?? hodnoty.</p>")
        plotGraph([offsetX,offsetY], pressInTime, "P(t)", "<p>Graf z??vislosti tlaku na ??ase. Tlak by se m??la ust??lit na rovnov????n?? hodnot??, pop??. na hodnot??, kterou jste nastavili. Kolem t??to hodnot by m??la hodnota oscilovat. POZOR: Pro tento p????pad se st??nou je v??po??et tlaku ??patn??. Simulace se kvalitativn?? chov?? spr??vn??, ale d??v?? ??patn?? v??sledky. Ovlivn??ny budou dal???? veli??iny(PE, hustota, ...).</p>")
        plotGraph([offsetX,offsetY], densInTime, "Hustota(t)", "<p>Graf z??vislosti hustoty na ??ase. Hutota by se m??la ust??lit na rovnov????n?? hodnot??, pop??. na hodnot??, kterou jste nastavili. Pro simulace NP* bude hustota oscilovat kolek rovnov????n?? hodnoty.</p>")
        isInit = true
    }
    
    function clearSvg() {
        let svgs = graphs.getElementsByTagName("svg")
        for (let i = 0; i < svgs.length; i++) {
            while (svgs[i].firstChild) {
                svgs[i].removeChild(svgs[i].lastChild);
              } 
        }
        /* while (graphs.firstChild) {
            console.log(graphs.lastChild);
            graphs.removeChild(graphs.lastChild);
          } */
    }
    
    return function() {
        clearSvg()
        initSvg()
    }
}

/* const clearAndInitSvg = SvgClosure()
clearAndInitSvg() */
