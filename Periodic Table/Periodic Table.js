// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: atom;

/* =======================================================
Script Name : Periodic Table.js
Author      : dharmikumbhani201@gmail.com
Version     : 1.0.0
Description : 
    Get information of elements in periodic table like
        symbol
        number (Z)
        atomic_mass (A)
        electron_affinity (Eₐ)
        phase (❄️,💧,♨️)
        name
        summary
        discovered_by 
    from the periodic table about a specifc element
Dependencies: N/A
======================================================= */

//##################################################################

const BASE_URL = "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/periodic-table-lookup.json";

const COLORS = {
    blackLG1: {
        l : '#434343',
        r : '#000000'
    },
    darkBlue: {
        l: '#1C1C1C',
        r: '#29323C',
    }
}
const FONTS = {
    symbol: Font.boldSystemFont(48),
    properties: Font.mediumSystemFont(18),
    name: Font.semiboldSystemFont(14),
    summary: Font.regularSystemFont(16),
    credits: Font.mediumSystemFont(12),
}
const TRUNKET_LENGTH = 5;

const data = await fetchRandomElement();
const widget = createWidget(data);
Script.setWidget(widget);
Script.complete();
console.log(data)

function trunkNumber (number) {
    if (number != null) {
        const string = number.toString();
        const finalNumber = string.slice(0, TRUNKET_LENGTH);
        return finalNumber;
    }
    else {
        return "-"
    }
}

async function fetchRandomElement(){
    const urlToFetch = BASE_URL
    const JSON = await fetchJSON(`${urlToFetch}`);
    const randomNumber = await getRandomIntInclusive(0,118);
    const element = await JSON.order[randomNumber];
    const symbol = JSON[element].symbol;
    const number = JSON[element].number;
    const full_atomic_mass = JSON[element].atomic_mass;	
    const atomic_mass = await trunkNumber(full_atomic_mass);
    const full_electron_affinity = JSON[element].electron_affinity;
    const electron_affinity = await trunkNumber(full_electron_affinity);
    const phaseText = JSON[element].phase;
    let phase
    if (phaseText === 'Solid') {
        phase = "❄️";
    } else if (phaseText === 'Liquid') {
        phase = "💧";
    } else if (phaseText === 'Gas') {
        phase = "♨️";
    }
    const name = JSON[element].name;
    const fullSummary = JSON[element].summary;
    const summary = fullSummary.replace(`${name} `,"")
    const discovered_by = JSON[element].discovered_by;
    const category = JSON[element].category;
    return {
        element,
        symbol,
        number,
        atomic_mass,
        electron_affinity,
        phase,
        category,
        name,
        summary,
        discovered_by,
    }
}
    //==========================
    // Random Number Generator
    //-----
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); 
        //The maximum is inclusive and the minimum is inclusive
    }

    /**
     * Make a REST request and return the response*
     * @param {*} url URL to make the request to
     * @param {*} headers Headers for the request
     */
    async function fetchJSON(url, headers) {
        try {
            console.log(`Fetching url: ${url}`);
            const request = new Request(url);
        //   req.headers = headers;
            const response = await request.loadJSON();
            return response;
        } catch (error) {
            console.log(`Couldn't fetch ${url}`);
        }
    }

//==========================
// Creating Widget function
//-----
function createWidget(data) {

    console.log(`Creating widget with: ${JSON.stringify(data)}`);
  
    const widget = new ListWidget();
        widget.backgroundGradient = DiagonalLinearGradient(COLORS.darkBlue.l, COLORS.darkBlue.r);
        widget.setPadding(24, 24, 20, 20);
    let nextRefresh = Date.now() + 1000*30
    widget.refreshAfterDate = new Date(nextRefresh)
  
    const VStackMain = widget.addStack();
        VStackMain.layoutVertically();
        VStackMain.setPadding(0,0,0,0);
        
        const HStack1 = VStackMain.addStack();

            const column1 = HStack1.addStack()
                column1.setPadding(0,0,0,0);
                column1.centerAlignContent();
                column1.borderColor = Color.white();
                column1.borderWidth = 5;
                column1.cornerRadius = 12;
                column1.size = new Size(85,80)

                column1.addSpacer();

                const symbol = column1.addText(`${data.symbol}`);
                    symbol.textColor = Color.white();
                    symbol.font = FONTS.symbol;
                    symbol.centerAlignText();
                    symbol.minimumScaleFactor = 0.5;
                
                column1.addSpacer();


            HStack1.addSpacer();

            const column2 = HStack1.addStack()
                column2.layoutVertically();
                column2.setPadding(4,0,4,0);
                column2.centerAlignContent();
                column2.size = new Size(0, 85)

                column2.addSpacer();

                const c2r1 = column2.addStack();
                    c2r1.setPadding(0,0,0,0);
                textPart("Z: ", data.number, c2r1, "properties");

                column2.addSpacer();

                
                const c2r2 = column2.addStack();
                    c2r2.setPadding(0,0,0,0);
                textPart("A: ", data.atomic_mass, c2r2, "properties");

                column2.addSpacer();

            HStack1.addSpacer();

            const column3 = HStack1.addStack()
                column3.layoutVertically();
                column3.setPadding(4,0,4,0);
                column3.size = new Size(0, 85);
                
                column3.addSpacer();
                const c3r1 = column3.addStack();
                    c3r1.setPadding(0,0,0,0);
                textPart("Eₐ: ", data.electron_affinity, c3r1, "properties");

                column3.addSpacer();

                const c3r2 = column3.addStack();
                    c3r2.setPadding(0,0,0,0);
                textPart("Phase: ", data.phase, c3r2, "properties");
                column3.addSpacer();

            HStack1.addSpacer();
        
        VStackMain.addSpacer(6);

        const name = VStackMain.addText(`${data.name}`)
            name.font = FONTS.name;
            name.textOpacity = 0.6;
            name.textColor = Color.white();
        
        VStackMain.addSpacer(8);


        
        const summary = VStackMain.addText(`${data.summary}`)
            summary.font = FONTS.summary;
            summary.textColor = Color.white();
            summary.leftAlignText();
            summary.minimumScaleFactor = 0.5;
        
        VStackMain.addSpacer();

        const HStack2 = VStackMain.addStack();
            
            HStack2.addSpacer();
            
            textPart("Discovered By: ", data.discovered_by, HStack2, "credits");

    return widget;
  }

    function textPart(fixed, dynamic, parentStack, fontType){
    const fixedText = parentStack.addText(`${fixed}`);
        fixedText.textColor = Color.white();
        fixedText.textOpacity = 0.6
        fixedText.font = FONTS[fontType];
    const dynamicText = parentStack.addText(`${dynamic}`);
        dynamicText.textColor = Color.white();
        dynamicText.textOpacity = 1.0
        dynamicText.font = FONTS[fontType];
    }

    //==========================
    // Diagonal Gradient
    //-----
    function DiagonalLinearGradient(l,r){
        const bgColor = new LinearGradient();
        bgColor.colors = [new Color(l), new Color(r)];
        bgColor.locations = [1.0, 0.0];
        bgColor.startPoint = new Point(1, 1);
        bgColor.endPont = new Point(0, 0);
        return bgColor
    }

