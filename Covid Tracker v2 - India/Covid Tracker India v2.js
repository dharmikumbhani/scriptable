// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: hand-holding-heart;
// share-sheet-inputs: plain-text;

/* =======================================================
Script Name : Covid Tracker India.js
Author      : dharmikumbhani201@gmail.com
Version     : 1.0.0
Description : 
  Displays the latest number of cofirmed cases for any state in India along with a graph depciting the trend for the number of cases for the last 7 days.
Dependencies: N/A
Actions     : 
======================================================= */


//##################################################################

//===============Base URL
// const BASE_URL = "https://api.covid19india.org/v4/min/data.min.json"
const BASE_URL = "https://api.covid19india.org/states_daily.json";

//===============CONSTANTS
//===============Colors
const COLORS = {
    blackLG: {
        l : '#41454F',
        r : '#202226'
    },
    darkBlue: {
        l: '#455260',
        r: '#2B343F',
    },
    lightPurple: {
        l: '#EBF5FF',
        r: '#BFCAE7'
    },
    redGraphGradient: {
        l: '#EB4A5F',
        r: '#EB4A5F00'
    },
    noOfCases: '#EB4A5F',
    noOfRecoveries: '#3FC67D',
    text: Color.black(),
}
const FONTS = {
    stateDate: Font.mediumSystemFont(10),
    noOfCases: Font.boldSystemFont(36),
    noOfRecoveries: Font.boldSystemFont(25),
    text: Font.regularSystemFont(10),
}
const SHADOW = {	
    color: new Color('#00000025'),
    radius: 4,
    offset:  new Point(0,6),
}
const GRAPHING = {
	xMax: 174,
	yMax: 82,
    xOffset: 29,
    bottomLeft: new Point(0,84),
    bottomRight: new Point(this.xOffset*6, 84),
    canvasSize: new Size(172, 81),
}
let stateCode = "mh"
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
	stateCode = (args.widgetParameter.toUpperCase() in STATE_CODES) ? args.widgetParameter : 'mh';
}
stateName = STATE_CODES[stateCode.toUpperCase()] || "Maharashtra";


// Fetch data and create widget
const data = await fetchCovidData();
const image = createGraph(data)
const widget = createWidget(data, image);
Script.setWidget(widget);
Script.complete();


//==========================
// Fetching Covid data = raw Api call + Refining the number with commas
//==========================
async function fetchCovidData(){

    const rawData = await fetchRawData(`${BASE_URL}`);

    // 0* -- Deceased
    // 1* -- Recovered
    // 2* -- Confirmed
    const statesDaily = await rawData.states_daily;
	statesDaily.reverse();
    statesDaily.splice(21,statesDaily.length);
    // console.log(statesDaily.length);
    const numDeceased = await statesDaily[0][stateCode];
    const deceased = numberWithCommas(numDeceased);
    const numRecovered = await statesDaily[1][stateCode];
    const recovered = numberWithCommas(numRecovered);
    const numConfirmed = await statesDaily[2][stateCode];
    const confirmed = numberWithCommas(numConfirmed);
    const lastDate = new Date(statesDaily[2].dateymd);
    const dateString = lastDate.toLocaleDateString('en-US', {day: 'numeric',  month: 'long' });
    // console.log(dateString)
    // console.log(confirmed, recovered, deceased);
    // console.log(statesDaily[23]);
    const confValues = [
        statesDaily[20][stateCode],
        statesDaily[17][stateCode],
        statesDaily[14][stateCode],
        statesDaily[11][stateCode],
        statesDaily[8][stateCode],
        statesDaily[5][stateCode],
        statesDaily[2][stateCode]
    ]
    //Changing conf values from strings to integers
    confValues.forEach((string, index) => confValues[index] = parseInt(confValues[index]));
    return {
        confirmed,
        recovered,
        deceased,
        dateString,
        confValues
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



////==========================
// Full Graph creation = getting points + Drawing graph => returns the image that can directly be used by widgetStack.addImage()
////==========================
/** 
 * @param {*} data data of entire confirmed, deceased,recovered and array of the past 7 days confirmed cases
 */
function createGraph(data){
    const points = graphingValues(data)
    const image = drawingImage(points)
    return image;
}

//==========================
// Finding values to be used by the image
//-------------------------------------
/** 
 * @param {*} data data of entire confirmed, deceased,recovered and array of the past 7 days confirmed cases
 */

function graphingValues(data) {
    const arrayOfValues = data.confValues;	
    const interpolatedArray = gettingYValuesThroughLInter(arrayOfValues);
    // console.log(interpolatedArray);
    // Inversion of values for the inverted canvas
    let invertedArray = []
    invertedArray = interpolatedArray.map(value => GRAPHING.yMax - value);
    console.log(invertedArray);

    let graphingPoints = [] 
    graphingPoints = invertedArray.map((value,index) => new Point(GRAPHING.xOffset*[index], value));
    // console.log(graphingPoints);

    // Main array of points to drawn the entire graph
	const points = [
		new Point(0, 84),
        ...graphingPoints,
		new Point(174, 84)
    ]
    return points;
}
    //-------------------------------------
    // Getting Y values
    //-------------------------------------
    function gettingYValuesThroughLInter(array) {
        // lower bound (x1,y1)
        const lowerBoundX1 = Math.min(...array);
        const lowerBoundY1 = GRAPHING.yMax-68;

        // upper bound (x2,y2)
        const upperBoundX2 = Math.max(...array);
        const upperBoundY2 = GRAPHING.yMax;

        let interpolatedArray = []
        // getting the interpolated float values 
        interpolatedArray = array.map(value => {
            return lInterp(value,lowerBoundX1, lowerBoundY1, upperBoundX2, upperBoundY2)
        });
        // Rounding up the interpolated values
        interpolatedArray.forEach((string, index) => interpolatedArray[index] = Math.round(interpolatedArray[index]));
        return interpolatedArray;
    }

    //-------------------------------------
    // Mathematical formula for linear interpolation
    //-------------------------------------
    function lInterp(x,x1,y1,x2,y2){
        // Mathematical formula
        const y = (((y2-y1)/(x2-x1))*(x-x1)) + y1
        return y
    }

//-------------------------------------
// Creating the graph/image
//-------------------------------------
/** 
 * @param {*} points array of "points" (interpolated and inverte) that are to be used to draw the graph
 */
function drawingImage(points){
    
    // Creating Path
    const path = new Path();
        path.move(points[0])
        path.addLines(points);
        path.closeSubpath();	
	
    //Main Drawing part with inputed paths
    let dc = new DrawContext();	
        dc.size = GRAPHING.canvasSize;
        // console.log(getAllFuncs(dc));
        dc.opaque = false;	
        dc.addPath(path);
        dc.setStrokeColor(new Color(COLORS.redGraphGradient.l, 1.0));
        dc.setLineWidth(1.5);
        dc.strokePath();
        dc.addPath(path)
        dc.setFillColor(new Color(COLORS.redGraphGradient.l, 0.5))
        dc.fillPath();
        const drawn = dc.getImage();


    return drawn
}

//==========================
// Creating widget function
//==========================
/** 
 * @param {*} data data of confirmed, deceased, recovered values
 * @param {*} image drawn image of the graph
 */
function createWidget(data, image) {

    console.log(`Creating widget with: ${JSON.stringify(data)}`);
  
    const widget = new ListWidget();
        widget.backgroundGradient = DiagonalLinearGradient(COLORS.lightPurple.l, COLORS.lightPurple.r);
        widget.setPadding(0,0,0,0);

    const vStackMain = widget.addStack();
        vStackMain.layoutVertically();
        vStackMain.setPadding(0,0,0,0);
        vStackMain.size = new Size(169,169)

        const upperHalf = vStackMain.addStack();
            upperHalf.layoutVertically();
            upperHalf.setPadding(16,16,0,0);
        
            const state = upperHalf.addText(`${stateName}, ${data.dateString}`);
                state.textColor = COLORS.text;
                state.textOpacity = 1.0;
                state.font = FONTS.stateDate;

            upperHalf.addSpacer(6);

            // Confirmed cases today
            const noOfCases = upperHalf.addText(`${data.confirmed}`);
                noOfCases.textColor = new Color(COLORS.noOfCases)
                noOfCases.textOpacity = 1.0;
                noOfCases.font = FONTS.noOfCases;
                noOfCases.leftAlignText();
                noOfCases.shadowColor = SHADOW.color;
                noOfCases.shadowRadius = SHADOW.radius;
                noOfCases.shadowOffset = SHADOW.offset;


            const newC = upperHalf.addText(`new cases`);
                newC.textColor = COLORS.text;
                newC.font = FONTS.text;
                newC.leftAlignText();

        const lowerHalf = vStackMain.addStack();
            lowerHalf.layoutHorizontally();
            lowerHalf.setPadding(0,0,0,0);	
// 			 lowerHalf.size = new Size(169,0);
			lowerHalf.addImage(image);

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


//-------------------------------------
// Miscellaneous functions
//-------------------------------------
function getAllFuncs(toCheck) {
    var props = [];
    var obj = toCheck;
    do {
        props = props.concat(Object.getOwnPropertyNames(obj));
    } while (obj = Object.getPrototypeOf(obj));

    return props.sort().filter(function(e, i, arr) { 
       if (e!=arr[i+1] && typeof toCheck[e] == 'function') return true;
    });
}