var baseNames = ['weight', 'defense', 'magickDefense', 'piercingResist', 'strikingResist', 'staggerResist', 'knockdownResist'];
var elementalNames = ['dark', 'fire', 'holy', 'ice', 'lightning'];
var debilitationNames = ['blindness', 'burning', 'curse', 'drenched', 'frozen', 'loweredDefense', 'loweredStrength', 'loweredMagickDefense', 'loweredMagick',
    'petrification', 'poison', 'possession', 'silence', 'skillStifling', 'sleep', 'tarring', 'thundershock', 'torpor'];
var allNames = baseNames.concat(elementalNames).concat(debilitationNames);
var allNamesTitles = [];
var titleRegex = /[A-Z]/g;
var minMax = {};
var minimumValues = [];
var maximumValues = [];
var scaleFactors = [];
var minimumValuesByName = {};
var maximumValuesByName = {};
var scaleFactorsByName = {};
var sliders = {};
var allArmors = {
    'head armor': [],
    'torso armor': [],
    'chest clothing': [],
    'arm armor': [],
    'leg armor': [],
    'leg clothing': [],
    'cloak': []
};
var sliderInitValues = [0, 0, 1000];

//initialise vars

for (const name of allNames) {
    var title = name;
    title = title.replace('lowered', '&darr;');
    title = title.replace(titleRegex, ' $&');
    allNamesTitles.push(title);
}

function getValuesAsArray(armor) { //returns 30 index array.
    var values = [];
    values.push(armor.weight[6]);
    values.push(armor.defense[6]);
    values.push(armor.magickDefense[6]);
    values.push(armor.piercingResist[6]);
    values.push(armor.strikingResist[6]);
    values.push(armor.staggerResist[6]);
    values.push(armor.knockdownResist[6]);
    var elemental = armor.elementalResist[6];
    for (const key of elementalNames) {
        let value = elemental[key];
        if (!value) value = 0;
        values.push(value);
    }
    var debilitation = armor.debilitationResist[6];
    for (const key of debilitationNames) {
        let value = debilitation[key];
        if (!value) value = 0;
        values.push(value);
    }
    return values;
}

for (var key in armors) {
    let armor = armors[key];
    let types = armor.types;
    for (const type of types) {
        if (allArmors[type]) {
            let values = getValuesAsArray(armor);
            armor.values = values;
            let minMaxType = minMax[type];
            if (minMaxType) {
                for (var i = 0; i < 30; i++) {
                    if (values[i] < minMaxType.min[i]) { minMaxType.min[i] = values[i] }
                    if (values[i] > minMaxType.max[i]) { minMaxType.max[i] = values[i] }
                }
            } else {
                minMax[type] = {
                    'min': values.slice(),
                    'max': values.slice()
                };
            }
            armor.type = type; //guaranteed unique due to our restricted supported types.
            allArmors[type].push(key);
        }
    }
}

//calculate mins and maxes for all stats of all armors
for (var i = 0; i < 30; i++) {
    var min = 0;
    var max = 0;
    for (var key in minMax) {
        min += minMax[key].min[i];
        max += minMax[key].max[i];
    }
    if (i > 2 && max > 100) { //weight, defense and magickDefense are the only values that aren't percentage based.
        max = 100;
    } else if (i == 0) { //weight is the only non-integer
        min = Math.floor(min);
        max = Math.ceil(max);
    }
    var scaleFactor = 1 / max;
    if (i == 0) {
        scaleFactor *= -1; // weight is the only negative attribute.
    }
    minimumValues.push(min);
    maximumValues.push(max);
    scaleFactors.push(scaleFactor);
    minimumValuesByName[allNames[i]] = min;
    maximumValuesByName[allNames[i]] = max;
    scaleFactorsByName[allNames[i]] = scaleFactor;
}

//initialise all armors (that have been put into allArmors)
var selectableArmors = {};
for (var key in allArmors) {
    allArmors[key].sort();
    selectableArmors[key] = allArmors[key].slice(0);
    for (var i = 0; i < allArmors[key].length; i++) {
        var armor = armors[allArmors[key][i]];
        armor.scaledValues = [];
        for (var j = 0; j < 30; j++) {
            var value = armor.values[j];
            armor.scaledValues.push(value * scaleFactors[j]);
        }
    }
}