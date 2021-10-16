// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: quote-right;
// share-sheet-inputs: plain-text;

/* =======================================================
Script Name : notion-re-reads.js
Author      : dharmikumbhani201@gmail.com
Version     : 1.0.0
Description : Get your re-reads from notion
Dependencies: N/A
Actions     :
======================================================= */


//##################################################################
//       ⚠️⚠️⚠️⚠️ TO BE ADDED BY YOU - Mandatory ⚠️⚠️⚠️⚠️
//============== PASTE INSIDE "" ========================
const NOTION_LINK = ""
// eg. const NOTION_LINK = "https://www.notion.so/re-reads-9d7ca77104ab4cd198b925711e010860"
const BEARER_TOKEN = ""
// eg. const BEARER_TOKEN = "Bearer secret_8cjBVUGCUJs82wu1zQ3hKbiSZ1A6Z2r3AutslyTgrrA"

//##################################################################


const permissibleValuesForSelectorType = {
    "quote": "quote",
    "paragraph": "paragraph",
    "heading_1": "heading_1",
    "heading_2": "heading_2",
    "heading_3": "heading_3",
    "bulleted_list_item": "bulleted_list_item",
    "numbered_list_item": "numbered_list_item",
    "to_do": "to_do"
}
//============== OTHER EDITABLES
//==============Font Names and Sizes
let selector = "quote"
if (args.widgetParameter != undefined){	
    selector = (args.widgetParameter.toLowerCase() in permissibleValuesForSelectorType) ?  args.widgetParameter : 'quote';
}
// Selector Parameter for Configurations:
// Possible values include "paragraph", "heading_1", "heading_2", "heading_3", "bulleted_list_item", "numbered_list_item", "to_do"

const FONT_NAME_QUOTE = 'BradleyHandITCTT-Bold'
//Refer http://iosfonts.com for other available fonts.
const FONT_SIZE_QUOTE = 24
//===============================


//##################################################################

let API_URL

const HEADERS = {
    "Accept": "application/json",
    'Notion-Version': '2021-05-11',
    "Authorization": `${BEARER_TOKEN}`
}

//==============COLORS
let BGCOLOR = {
    l: '#FFFFFF',
    r: '#FFFFFF',
    authorTag: '#C7CAE1'
  };
var data
if(NOTION_LINK != "" && BEARER_TOKEN != ""){
    if (args.widgetParameter in permissibleValuesForSelectorType || args.widgetParameter === ""){
        data = await fetchRandomChoosenContentFromNotion();
    } else {
        data = `Invalid Parameter input. Valid Parameters include "paragraph", "heading_1", "heading_2", "heading_3", "bulleted_list_item", "numbered_list_item", "to_do" `
    }
} else {
    data = "You are missing Notion Link or the Bearer Token"
}
const widget = createWidget(data);
Script.setWidget(widget);
Script.complete();

function makeAPILinkFromNotionLink(notionLink){
    const UUID = notionLink.slice(notionLink.length - 32)
    const APILink = `https://api.notion.com/v1/blocks/${UUID}/children?page_size=100`
    console.log("API End Point:", APILink);
    return APILink
}
async function fetchRandomChoosenContentFromNotion(){
    const urlToFetch = makeAPILinkFromNotionLink(NOTION_LINK);
    let next_cursor
    let allResultsArray = []

    //Run it the first time
    let pageJSON = await fetchJSON(`${urlToFetch}`, HEADERS);
    let resultsArray = refiningData(pageJSON)
    allResultsArray.push(...resultsArray)

    //Run it the second time and check and keep running
    while(pageJSON.next_cursor != undefined && pageJSON.has_more === true) {
        next_cursor = pageJSON.next_cursor

        pageJSON = await fetchJSON(`${urlToFetch}`+`&start_cursor=${next_cursor}`, HEADERS);
        resultsArray = refiningData(pageJSON)
        allResultsArray.push(...resultsArray)
    }
    // console.log(FullJSObject);

    // console.log(allResultsArray)
    // console.log(allResultsArray.length);

    //================= Get Random Number depending on the array length
    const randomNumberFromArray = randomSelectorFromArray(allResultsArray)
    // console.log(randomNumberFromArray);

    //================= Get Specific Quote Object
    const choosenObject = allResultsArray[randomNumberFromArray]
    // console.log(choosenObject)

    //================= Get the actual Quote
    const content = gettingContentFromChoosenObject(choosenObject)

    return content
}
    function refiningData(object){
        const choosenArray = object.results.filter((resultObj)=> resultObj.type === selector)
        return choosenArray
    }

    function randomSelectorFromArray(arr){
        return random = Math.floor(Math.random()*arr.length)
    }

    function gettingContentFromChoosenObject(choosenObject){
        let content= ""
        if(choosenObject != undefined) {
            const textArray = choosenObject[selector].text;
            for(i=0; i<textArray.length; i++){
                content += textArray[i].text.content;
                // console.log(textArray[i].text.content)
            }
            return content
        }
        else{
            content = `No ${selector} were found on your page`
            return content
            // console.error(`No ${selector} were found on your page`)
        }
    }

//----- HELPER FUNCTIONS
/**
     * Make a REST request and return the response*
     * @param {*} url URL to make the request to
     * @param {*} headers Headers for the request
     */
 async function fetchJSON(url, headers) {
    try {
        console.log(`Fetching url: ${url}`);
        const request = new Request(url);
        request.headers = headers;
		console.log(request)
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
    const bgColor = new LinearGradient();
        bgColor.colors = [new Color(BGCOLOR.l), new Color(BGCOLOR.r)];
        bgColor.locations = [1.0, 0.0];
        bgColor.startPoint = new Point(1, 1);
        bgColor.endPont = new Point(0, 0);
    widget.backgroundGradient = bgColor;
    widget.setPadding(0, 0, 0, 0);
    // widget.useDefaultPadding();

    //===STACK 1 - VERTICAL
        const quoteVerticalStack = widget.addStack();
        quoteVerticalStack.layoutVertically();
        quoteVerticalStack.setPadding(0,20,0, 24)

        //-------VSTACK - upper spacer
        quoteVerticalStack.addSpacer();

        //-------VSTACK - QUOTE
        const quote = quoteVerticalStack.addText(`${data}`);
        // quote.textColor = Color.white()
        quote.textColor = Color.black()
        quote.textOpacity = 1.0;
        quote.font = new Font(FONT_NAME_QUOTE, FONT_SIZE_QUOTE)

        //-------VSTACK - lower spacer
        quoteVerticalStack.addSpacer();

    return widget;
}