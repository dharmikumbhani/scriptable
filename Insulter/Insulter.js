// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: dizzy; share-sheet-inputs: plain-text;

/* =======================================================
Script Name : Insulter.js
Author      : dharmikumbhani201@gmail.com
Version     : 1.0.0
Description : 
  Get a well deserved insult
Dependencies: N/A
Actions     : 
======================================================= */


//##################################################################

//==============BASE URLS

//--------GENERIC
const GENERATE_RANDOM_INSULT = "https://evilinsult.com/generate_insult.php?lang=en&type=json";

const FONT_SIZE_INSULT = 26;
const FONT = Font.boldSystemFont(FONT_SIZE_INSULT);

//==============COLORS
const COLORS =  {
//   bg: '#030E49',
    bg: '#F2F2F2',
    text: '#F20746'
}
  

const data = await fetchRandomInsult();
const widget = createWidget(data);
Script.setWidget(widget);
Script.complete();
  
  
async function fetchRandomInsult(){
    const urlToFetch = GENERATE_RANDOM_INSULT;
    const insult_JSON = await fetchJSON(`${urlToFetch}`);
    const insult = insult_JSON.insult;
    console.log(insult);
    return {insult}
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
widget.backgroundColor = new Color(COLORS.bg);

widget.useDefaultPadding();

//===STACK 1 - VERTICAL 
    const insultVerticalStack = widget.addStack();
    insultVerticalStack.layoutVertically();

    //-------VSTACK - upper spacer
    insultVerticalStack.addSpacer();

    //-------VSTACK - insult
    // const upperCaseInsult = data.insult
    const insult = insultVerticalStack.addText(`${data.insult.toUpperCase()}`);
        insult.textColor = new Color(COLORS.text)
        insult.textOpacity = 1.0;
        insult.font = FONT;
        insult.centerAlignText();
        insult.minimumScaleFactor = 0.5

    //-------VSTACK - lower spacer

    insultVerticalStack.addSpacer();
return widget;
}
