# Frontend Molecular Dynamic With ThreeJs

[msvbd.cz/project/front-end-md-threejs/](https://msvbd.cz/project/front-end-md-threejs/)

### EN description
Welcome to the page of my little experiment. The goal was to test the web browser's capabilities as a tool for solving and rendering the molecular dynamics simulation. The simulations speed is not dizzying, but it is running in a web browser :D To my surprise, it works better than I expected. With a reasonable number of particles and a reasonable computer, the result doesn't take much time. The site can illustrate some statistical physics aspects, but exact results cannot be relied upon. When programming, I have to cheat some details of the simulations to make the speed reasonable. Well, what are you waiting for? Just click the play button. Have fun :)

### CZ popis
Výtám Vás na stránce mého malého experimentu. Mím cílem bylo otestovat možnosti webového prohlížeče, jakožto nástroje pro výpočet a rendervoání výsledků simulace molekulární dynamiky. Rychlost simulací není nijak závratná, ale co byste chtěly běží to ve webovém prohlížeči :D K mému překvapení to funguje lépe než jsem čekal. S rozumným počtem částic a na rozumném počítači není třeba čekat příliž dlouho na výsledek. Stránku lze použít pro ilustraci některých fyzikálních aspoktů statistické fyziky, ovšem na přesná čísla nelze spoléhat. Při programování jsem některé aspekty simulace ošidit, aby rychlost byla rozumná. No na co čekáte stačí kliknout na tlačítko play. Přeji příjemnou zábavu :)


## Known issues
- Result density in NVT ensemble is not correct. I don't know why o_O
- Pressure in simulations with walls is not correct. It should be computed from x & z component of pressure tensor.