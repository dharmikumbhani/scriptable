// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: hand-holding-heart;
// share-sheet-inputs: plain-text;

/* =======================================================
Script Name : Covid Tracker India v2.js
Author      : dharmikumbhani201@gmail.com
Version     : 1.0.0
Description : 
  Shows the latest number of newly confirmed cases and no of revcovered patients from any state in India.
Dependencies: N/A
Actions     : 
======================================================= */


//##################################################################

//==============BASE URLS
// const BASE_URL = "https://api.covid19india.org/v4/min/data.min.json"
const BASE_URL = "https://api.covid19india.org/states_daily.json";

//===============CONSTANTS
const COLORS = {
    blackLG: {
        l : '#41454F',
        r : '#202226'
    },
    darkBlue: {
        l: '#455260',
        r: '#2B343F',
    },
    noOfCases: '#EB4A5F',
    noOfRecoveries: '#3FC67D',
    text: Color.white(),
}
const FONTS = {
    stateDate: Font.mediumSystemFont(10),
    noOfCases: Font.boldSystemFont(36),
    noOfRecoveries: Font.boldSystemFont(28),
    text: Font.regularSystemFont(10),
}
const SHADOW = {	
	// color: Color.black(),
    color: new Color('#00000030'),
    radius: 4,
    offset:  new Point(0,6),
}
let stateCode = "mh";
let stateName
// https://gist.github.com/shubhamjain/35ed77154f577295707a#file-indianstates-json-L2
const STATE_CODES = {
    "AN":"Andaman and Nicobar Islands",
    "AP":"Andhra Pradesh",
    "AR":"Arunachal Pradesh",
    "AS":"Assam",
    "BR":"Bihar",
    "CG":"Chandigarh",
    "CH":"Chhattisgarh",
    "DN":"Dadra and Nagar Haveli",
    "DD":"Daman and Diu",
    "DL":"Delhi",
    "GA":"Goa",
    "GJ":"Gujarat",
    "HR":"Haryana",
    "HP":"Himachal Pradesh",
    "JK":"Jammu and Kashmir",
    "JH":"Jharkhand",
    "KA":"Karnataka",
    "KL":"Kerala",
    "LA":"Ladakh",
    "LD":"Lakshadweep",
    "MP":"Madhya Pradesh",
    "MH":"Maharashtra",
    "MN":"Manipur",
    "ML":"Meghalaya",
    "MZ":"Mizoram",
    "NL":"Nagaland",
    "OR":"Odisha",
    "PY":"Puducherry",
    "PB":"Punjab",
    "RJ":"Rajasthan",
    "SK":"Sikkim",
    "TN":"Tamil Nadu",
    "TS":"Telangana",
    "TR":"Tripura",
    "UP":"Uttar Pradesh",
    "UK":"Uttarakhand",
    "WB":"West Bengal"
}

if (args.widgetParameter != undefined){	
    stateCode = (args.widgetParameter.toUpperCase() in STATE_CODES) ?   args.widgetParameter : 'mh';
}
stateName = STATE_CODES[stateCode.toUpperCase()]
// Fetch data and create widget
const data = await fetchCovidData();
const widget = createWidget(data);
Script.setWidget(widget);
Script.complete();


//==========================
// Fetching Covid data = raw Api call + Refining the number with commas
//-----
async function fetchCovidData(){

    const rawData = await fetchRawData(`${BASE_URL}`);

    // 0* -- Deceased
    // 1* -- Recovered
    // 2* -- Confirmed
    const statesDaily = await rawData.states_daily;
    statesDaily.reverse();
    statesDaily.splice(20,-1);
    console.log(statesDaily.length);
    const numDeceased = await statesDaily[0][stateCode];
    const deceased = numberWithCommas(numDeceased);
    const numRecovered = await statesDaily[1][stateCode];
    const recovered = numberWithCommas(numRecovered);
    const numConfirmed = await statesDaily[2][stateCode];
    const confirmed = numberWithCommas(numConfirmed);
    const lastDate = new Date(statesDaily[2].dateymd);
    const dateString = lastDate.toLocaleDateString('en-US', {day: 'numeric',  month: 'long' });
    console.log(dateString)
    console.log(confirmed, recovered, deceased);
    return {
        confirmed,
        recovered,
        deceased,
        dateString
    }
}
    //-------------------------------------
    // Fetch Function
    //-------------------------------------
    /**
     * Make a REST request and return the response for* 
     * @param {*} url URL to make the request to
     * @param {*} headers Headers for the request
     */
    async function fetchRawData(url, headers) {
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

    //-------------------------------------
    // Taking the numbers and convetring them to comma seperated values
    /**
     * @param {*} x number to which commas are to be added
     */
    //-------------------------------------
    function numberWithCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

//==========================
// Creating Widget function
//-----
/** 
 * @param {*} data data of entire confirmed, deceased,recovered and array of the past 7 days confirmed cases
 */
function createWidget(data) {

    console.log(`Creating widget with: ${JSON.stringify(data)}`);
  
    const widget = new ListWidget();
        widget.backgroundGradient = DiagonalLinearGradient(COLORS.darkBlue.l, COLORS.darkBlue.r);
    
  
    const stack = widget.addStack();
        stack.layoutVertically();

    // State Name and Date
    const state = stack.addText(`${stateName}, ${data.dateString}`);
        state.textColor = COLORS.text;
        state.textOpacity = 1.0;
        state.font = FONTS.stateDate;

    stack.addSpacer();

    // Confirmed cases today
    const noOfCases = stack.addText(`${data.confirmed}`);
        noOfCases.textColor = new Color(COLORS.noOfCases)
        noOfCases.textOpacity = 1.0;
        noOfCases.font = FONTS.noOfCases;
        noOfCases.leftAlignText();
        noOfCases.shadowColor = SHADOW.color;
        noOfCases.shadowRadius = SHADOW.radius;
        noOfCases.shadowOffset = SHADOW.offset;
    

    const horizontalTextStack1 = stack.addStack();
        horizontalTextStack1.layoutHorizontally();

        horizontalTextStack1.addSpacer();

        const newC = horizontalTextStack1.addText(`new cases`);
            newC.textColor = COLORS.text;
            newC.textOpacity = 0.6;
            newC.font = FONTS.text;
            newC.rightAlignText();
    
    stack.addSpacer();

    // Recoveries today
    const noOfRecoveries = stack.addText(`${data.recovered}`);
        noOfRecoveries.textColor = new Color(COLORS.noOfRecoveries)
        noOfRecoveries.textOpacity = 1.0;
        noOfRecoveries.font = FONTS.noOfRecoveries;
        noOfRecoveries.leftAlignText();
        noOfRecoveries.shadowColor = SHADOW.color;
        noOfRecoveries.shadowRadius = SHADOW.radius;
        noOfRecoveries.shadowOffset = SHADOW.offset;

    const horizontalTextStack2 = stack.addStack();
    horizontalTextStack2.layoutHorizontally();

        horizontalTextStack2.addSpacer();
    
        const newR = horizontalTextStack2.addText(`new recoveries`);
            newR.textColor = COLORS.text;
            newR.textOpacity = 0.6;
            newR.font = FONTS.text;
            newR.rightAlignText();

    stack.addSpacer();

    return widget;
}
    //-------------------------------------
    // Gradient creator defaults to diagonal mainly for the background of the widget
    //-------------------------------------
    function DiagonalLinearGradient(l,r, x1=1, y1=0, x2=0, y2=1){
        const bgColor = new LinearGradient();
            bgColor.colors = [new Color(l), new Color(r)];
            bgColor.locations = [0.0, 1.0];
            bgColor.startPoint = new Point(x1, y1);
            bgColor.endPont = new Point(x2,y2);
        return bgColor
    }