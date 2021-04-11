// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: infinity;

/* =======================================================
Script Name : Random Number Fact.js
Author      : dharmikumbhani201@gmail.com
Version     : 1.0.0
Description : 
  Fact on a randomly generated number
Dependencies: N/A
Actions     : 
======================================================= */


//##################################################################

//==============BASE URLS

const BASE_URL = "http://numbersapi.com"

//===============Font name and sizes
const FONT_NAME_NUMBER = 'Futura-CondensedExtraBold';
const FONT_NAME_FACT = 'Futura-Medium';
const FONT_SIZE_NUMBER = 42; //Bold
const FONT_SIZE_FACT_TEXT = 16; //Regular

//===============Colors
const COLORS = {
    blackLG:{
        l: '#000000',
        r: '#676767'
    },
    purpleLG:{
      l: '#B448B2',
      r:'#FF6091'
    },
    blueLG:{
        l: '#0038FF',
        r:'#3EABFF'
    },
    textcolor: '#FFFFFF',
}


// Fetch data and create widget
const data = await fetchRandomNumberFact();
const widget = createWidget(data);
Script.setWidget(widget);
Script.complete();


//==========================
// Fetching Fact using Random Number Generator Function
//-----
async function fetchRandomNumberFact(){
    var randomNumber = getRandomIntInclusive(0,365)
    console.log(randomNumber)

    const fact = await fetchText(`${BASE_URL}/${randomNumber}`);
    // console.log(fact);

    var regex = new RegExp(".?"+ randomNumber + " ");
    // console.log(regex);
    
    const strippedFact = fact.replace(regex, "");
    console.log(strippedFact);
    return {
        randomNumber,
        strippedFact
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
     * Make a REST request and return the response for* 
     * @param {*} url URL to make the request to
     * @param {*} headers Headers for the request
     */
    async function fetchText(url, headers) {
        try {
        console.log(`Fetching url: ${url}`);
        const request = new Request(url);
        //   req.headers = headers;
        const response = await request.loadString();
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
    const bgColor = new LinearGradient();
    bgColor.colors = [new Color(COLORS.purpleLG.l), new Color(COLORS.purpleLG.r)];
    bgColor.locations = [1.0, 0.0];
    bgColor.startPoint = new Point(1, 1);
    bgColor.endPont = new Point(0, 0);
    widget.backgroundGradient = bgColor;
    widget.setPadding(10, 15, 15, 10);
  
    const stack = widget.addStack();
    stack.layoutVertically();
    stack.spacing = 4;
    stack.size = new Size(320, 0);
  
    // Number Display Text
    const randomNumber = stack.addText(`${data.randomNumber}`);
    randomNumber.textColor = Color.white();
    randomNumber.textOpacity = 1.0;
    randomNumber.font = new Font(FONT_NAME_NUMBER, FONT_SIZE_NUMBER);
  
    // Fact Display Text
    const fact = stack.addText(`${data.strippedFact}`);
    fact.textColor = Color.white();
    fact.font = new Font(FONT_NAME_FACT, FONT_SIZE_FACT_TEXT);

    return widget;
  }

  