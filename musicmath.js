// MATH HELPER FUNCTIONS //

// more accurate rounding from Jack Moore due to JS rounding errors
// https://www.jacklmoore.com/notes/rounding-in-javascript/
function round(number, decimalPlaces) {
return Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces)};

// factorial function by Gabriele Petrioli 2010
// https://stackoverflow.com/questions/3959211/what-is-the-fastest-factorial-function-in-javascript?noredirect=1&lq=1
// to do: add memoization?
function factorial(n) {
    var rval=1;
    for (var i=2; i<= n; i++){
        rval = rval * i;
    }
    return rval;
};

// prime number generator tweaked from vitaly-t 2021
// https://stackoverflow.com/questions/17389350/prime-numbers-javascript
// to do: add memoization ?
function* primesGenerator(n) {
    let value = 2, i = 2;
    while (i++ < n) {
        if (value>2) {
        let k, q;
        do {
            k=3;
            value += 2;
            q = Math.floor(Math.sqrt(value));
            while (k <= q && value % k) {
            k += 2;
            }
        } while (k <= q);
        } else {
        value = value === 2 ? 3 : 2;
        }
        yield value;
    }
};

// ordinal indicators by Tomas Langkass 2016
// https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
function nth(n){return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"};

// closest powers of two by Zibri 2022
// https://stackoverflow.com/questions/26965171/fast-nearest-power-of-2-in-javascript
function blpo2(x) {
    x = x | (x >> 1);
    x = x | (x >> 2);
    x = x | (x >> 4);
    x = x | (x >> 8);
    x = x | (x >> 16);
    x = x | (x >> 32);
    return x - (x >> 1);
};

// UNIT CONVERSIONS //
function ratioToCents(ratio) {return Math.log10(ratio)*1200/Math.log10(2)};
function ratioToSavarts(ratio) {return Math.log10(ratio)*1000};
function centsToRatio(cents) {return Math.pow(10,(1/cents))};

// INTERMEDIATE MATH FUNCTIONS //

// creates an array 1...limit
// modified from Niko Ruotsalainen 2015 
// https://stackoverflow.com/questions/3746725/how-to-create-an-array-containing-1-n
function plusOne(limit) {
    var list = Array.from({length: limit}, (_, i) => i + 1); return list
};

// multiplyArray
// cartesian product
// heavy modification from original python by Sheshank S. 2019
// https://stackoverflow.com/questions/57258804/divide-each-element-of-an-array-by-each-element-of-an-other-array
function multiplyArray(array1, array2) {
    var newArray = []
    function compareNumbers (a,b) {return a-b}
    
    for (var i1=0; i1 < array1.length; i1++){
        for (var i2=0; i2 < array2.length; i2++){
        newArray.push(array1[i1]*array2[i2])
        newArray = [...new Set(newArray)] // only keep unique values
        }
    }
    // sort results before returning
    newArray.sort(compareNumbers)
    return newArray
};

// toTheLimit
// returns an array of every number min...max that can be found using only cartesian products of min...limit
// to-do: maybe implement d3.cross
function toTheLimit(min,limit,max) {
    var baseset = plusOne(limit) // starts with 1, filtered later
    var fullset = []
    var uniqueset = []
    var hardstop = 5 // realistic performance hard stop 
    function checkMin(num){return (num >= min)}
    function checkMax(num){return (num <= max)}
    function compareNumbers (a,b) {return a-b}
    
    // filters out numbers below min
    var baliset = baseset.filter(checkMin)
    
    for (var i=0; i <= hardstop; i++){
        // break if went over
        var highest = baliset[baliset.length - 1]
        if (baliset[highest] > max){break}
    
        // multiply each element in the array by itself
        fullset = multiplyArray(baseset,baliset)
    
        // only keep unique values at or equal max
        uniqueset = [...new Set(fullset)] 
        baliset = uniqueset.filter(checkMax)
    
    }
    
    // sort ascending, or 10 comes before 9 
    baliset.sort(compareNumbers)
    
    return baliset
};

// Unlimited 
// finds all numbers excluded by a limit
function unlimited(min, limit, max) {
    // generate a list of every number min...max
    var baseset = plusOne(max)
    var fullset = baseset.filter(x => x >= min)
    // get the array with limit
    var limited = toTheLimit(min,limit,max)
    // filter out the limited set
    var unlimited = fullset.filter(x=> !limited.includes(x))
    
    return unlimited
};

// Quartermaster
// rations out any given array of numbers
// cartesian product + music-specific unit conversions
function quartermaster(arr) {

    var rations =  []
    var unclean = arr
    var denominator = unclean.filter(x => typeof x === 'number')
    var numerator = unclean.filter(x => typeof x === 'number')
    var ratio = []
    var fraction = []
    var cents = []
    var savarts = []
    var centsStd = []
    var combined = []
    var obj = {Ratio: "", Fraction: "", Cents: "", CentsStd: "", RatioStd: "", Savarts: "", Viz: [], Notes: ""}
    var uniqueFractions = []
    var uniqueCentsStd = []
    var counter = 0
    var output = Array(counter)
    function modulo (a) {return ((a%1200)+1200)%1200} // cents[i]%1200 gives remainder, we want modulo
    
    // creates a list of unique fractions and their text representations
    for (var n=0; n < numerator.length; n++){
        for (var d=0; d < denominator.length; d++){
        // creates array with the division of n by d
        fraction.push(round(numerator[n]/denominator[d],3))
        // Text ratio concatenation 
        var textfrac = numerator[n]+"/"+denominator[d]
        ratio.push(textfrac)
        }
    }
    
    // unit conversions
    cents = fraction.map(ratioToCents)
    savarts = fraction.map(ratioToSavarts)
    centsStd = cents.map(modulo) // ensure all values are within 0-1200 range
    
    // combine each array using only unique values for fraction
    for (var i=0; i < fraction.length; i++){
        // skip repeated values
        if (Object.values(uniqueFractions).includes(fraction[i])) {continue} // check whether fraction is repeated
        if (Object.values(uniqueCentsStd).includes(centsStd[i])) {continue} // check whether centsStd is repeated
        if (fraction[i]<1) {continue} // skip fractions smaller than 1:1
        // skip fractions over 1 if needed
        //if (fraction[i] > 1) { continue }
        // for new unique values, adds properties
        var key = ratio[i]
        combined[key] = Object.create(obj)
        combined[key].Ratio = ratio[i]
        combined[key].Fraction = fraction[i]
        combined[key].Cents = Math.abs(round(cents[i],3))
        combined[key].Savarts = Math.abs(round(savarts[i],3))
        //combined[key].Cents = Math.abs(round(ratioToCents(combined[key].Fraction),3))
        if (combined[key].Cents > 1200) {continue}; // skip ratios with cents over 1200
        //combined[key].Savarts = Math.abs(round(ratioToSavarts(combined[key].Fraction),3))
        combined[key].CentsStd = round(centsStd[i],3)
        if (combined[key].CentsStd < 1) {continue}; // skip fractions where mod is 0
        //combined[key].RatioStd = Math.floor(cents[i]/1200) + " + " + 
        combined[key].Viz = [{Blue: centsStd[i], Pink: 1200-centsStd[i]}] 
        uniqueFractions.push(fraction[i])
        uniqueCentsStd.push(centsStd[i])
        counter++
        output.push(combined[key])
    }
    
    return output
};

// musicalHarmonics
// divides every whole number between min...max by the closest power of 2
// returns an array of objects similar to Quartermaster
function musicalHarmonics(min,max) {
    var arr = []
    
    for (var i=min; i<=max; i++){ 
        var p = blpo2(i)
        var r = i + "/" + p
        var o = i + nth(i) + " harmonic"
        var c = Math.abs(round(ratioToCents(i/p),3))
        var sv = Math.abs(round(ratioToSavarts(i/p),3))
        var viz = [{Blue: c, Pink: 1200-c}]
        arr.push({Fraction: round(i/p,3), Ratio: r, Cents: c, Savarts: sv, Notes: o, Viz: viz})
    }
    return arr
};

// MUSICAL FUNCTIONS //

// edoConstructor
// builds an equal temperament system around given inputs
function edoConstructor(rootNote,rootOctave,rootLetter,octaves,edo) {
    // to do: split into root octave generator, 2:1 looper
    
    // initial setup
    let lowestNote = rootNote * 2 ** (rootOctave - octaves)
    let totalNotes = edo*octaves
    let stepRatio = Math.pow(2,1/edo)
    let tempTemp = Array(totalNotes)
    const centConst = 1200/Math.log10(2)
    let stepCents = 1200*Math.log2((rootNote*stepRatio)/rootNote)
    let keepTheChange = round(stepCents,0)
    
    // define lowest note
    tempTemp[0] = {Octave: 1, Hertz: lowestNote, Note: rootLetter}
    
    // fill out each note
    // bug: drags rounding errors so octaves are not exactly 2:1.
    // Should instead create lowest octave and loop it up
    // then loop through whole thing to round end result 
    for (let i=1; i<totalNotes; i++){
        let lastNote = tempTemp[i-1].Hertz
        let lastOctave = tempTemp[i-1].Octave
        
        tempTemp[i] = {
        Octave: Math.ceil((i+1)/(edo)), 
        Hertz: round(lastNote * stepRatio,3),
        Note: ""
        }
    }
    
    // outputs
    return tempTemp
};

// DATA GENERATION // 

// defaults to A4=440 12EDO 8 octaves (typical grand piano)
var octaves = 8;
var edo = 12;
var rootNote = 440;
var rootLetter = "A";
var rootOctave = 4;

var temperament = edoConstructor(rootNote,rootOctave,rootLetter,octaves,edo);