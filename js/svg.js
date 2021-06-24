const SvgClosure = function() {
    const svg = document.getElementById('svg--graphs')
    const wSvg = svg.clientWidth
    const hSvg = svg.clientHeight
    const svgNameSpace = 'http://www.w3.org/2000/svg'
      
    function getYAxis(offset) {
        let arrow = ''
        let x= offset[0]
        let y =offset[1] - 10
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
        let x=hSvg + offset[0]
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

    function plotGraph(offset,data) {
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
        let dTime = Math.max(...timeInTime)-timeMin || 1.0
        let dData = Math.min(...data)-dataMax || 1.0
        line = 'M '+((hSvg-30)*(timeInTime[0]-timeMin)/dTime + offset[0])+' '+((hSvg-40)*(data[0]-dataMax)/dData + offset[1]+20)
        for (let i = 1; i < timeInTime.length; i++) {
            line += 'L '+((hSvg-30)*(timeInTime[i]-timeMin)/dTime + offset[0])+' '+((hSvg-40)*(data[i]-dataMax)/dData + offset[1]+20)
        }
        svg.appendChild(
            createLinePath(line, 'red', 3)
        )
    }

    function plotDist(offset,data) {
        /* axes */
        let line = ''
        line += getXAxis(offset)
        line += getYAxis(offset)
        svg.appendChild(
            createLinePath(line, 'black', 3)
        )

        /* graph */
        let dataMax = Math.max(...data) 
        let dTime = data.length
        let dData = Math.min(...data)-dataMax || 1.0
        line = 'M '+offset[0]+' '+((hSvg-40)*(data[0]-dataMax)/dData + offset[1]+20)
        for (let i = 1; i < data.length; i++) {
            line += 'L '+((hSvg-30)*i/dTime + offset[0])+' '+((hSvg-40)*(data[i]-dataMax)/dData + offset[1]+20)
        }
        svg.appendChild(
            createLinePath(line, 'red', 3)
        )
    }

    function initSvg() {
        plotGraph([10,10], tempInTime)
        plotGraph([hSvg+20,10], PEInTime)
        plotGraph([2*hSvg+30,10], KEInTime)
        plotGraph([3*hSvg+40,10], EtotInTime)
        plotGraph([4*hSvg+50,10], pressInTime)
        plotGraph([5*hSvg+60,10], densInTime)
        plotDist([6*hSvg+70,10], vDist)
    }
    
    function clearSvg() {
        while (svg.firstChild) {
            svg.removeChild(svg.lastChild);
          }
    }
    
    return function() {
        clearSvg()
        initSvg()
    }
}

/* const clearAndInitSvg = SvgClosure()
clearAndInitSvg() */
