$(document).ready(function() {
    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    
    var allArmors = {
        'head armor' : [],
        'torso armor' : [],
        'chest clothing' : [],
        'arm armor' : [],
        'leg armor' : [],
        'leg clothing' : [],
        'cloak' : []
    };
    var baseNames = ['weight','defense','magickDefense','piercingResist','strikingResist','staggerResist','knockdownResist'];
    var elementalNames = ['dark','fire','holy','ice','lightning'];
    var debilitationNames = ['blindness','burning','curse','drenched','frozen','loweredDefense','loweredStrength','loweredMagickDefense','loweredMagick',
                             'petrification','poison','possession','silence','skillStifling','sleep','tarring','thundershock','torpor'];
    var allNames = baseNames.concat(elementalNames).concat(debilitationNames);
    var allNamesTitles = [];
    var minMax = {};
    var minimumValues = [];
    var maximumValues = [];
    var scaleFactors = [];
    var minimumValuesByName = {};
    var maximumValuesByName = {};
    var scaleFactorsByName = {};
    var sliders = {};

    var titleRegex = /[A-Z]/g;
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
    
    function filterArmorTypeByVocations(type, vocations) {
        selectableArmors[type].length = 0;
        for (const key of allArmors[type]) {
            let armor = armors[key];
            let usableBy = armor.usableBy;
            let valid = true;
            for (const vocation of vocations) {
                if (!usableBy.includes(vocation)) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                selectableArmors[type].push(key);
            }
        }
        let id = '#' + type.replace(' ', '_');
        let $elem = $(id).first();
        let value = $elem.val();
        if (!selectableArmors[type].includes(value)) {
            $elem.val('');
        }
    }
    
    function filterArmorByVocations(vocations) {
        for (var key in allArmors) {
            filterArmorTypeByVocations(key, vocations);
        }
    }
    
    function getVocations() {
        let vocations = [];
        $('.class-select').each(function(index, element) {
            if ($(element).is(':checked')) {
                vocations.push(element.id);
            }
        });
        return vocations;
    }
    
    function classChange(ev) {
        filterArmorByVocations(getVocations());
    }
    
    $('#head_armor').autocomplete({source:selectableArmors['head armor'], minLength:0});
    $('#torso_armor').autocomplete({source:selectableArmors['torso armor'], minLength:0});
    $('#chest_clothing').autocomplete({source:selectableArmors['chest clothing'], minLength:0});
    $('#arm_armor').autocomplete({source:selectableArmors['arm armor'], minLength:0});
    $('#leg_armor').autocomplete({source:selectableArmors['leg armor'], minLength:0});
    $('#leg_clothing').autocomplete({source:selectableArmors['leg clothing'], minLength:0});
    $('#cloak').autocomplete({source:selectableArmors['cloak'], minLength:0});
    
    let sliderInitValues = [0, 0, 1000];

    $('.slider').each(function() {
        var sliderDiv = $(this);
        sliderDiv.slider({
            orientation: 'horizontal',
            min: 0,
            max: 1000,
            values: sliderInitValues.slice(),
            create: function() {
                var s = $(this);
                var id = s[0].id;
                sliders[id] = s;
                var idMin = minimumValuesByName[id];
                var idMax = maximumValuesByName[id];
                for (var i = 0; i < sliderInitValues.length; i++) {
                    var h = s.children('div[data-index=' + i + ']');
                    switch (i) {
                        case 0:
                        case 2:
                            h.text( Math.floor( (s.slider( 'values' )[i] / 1000) * (idMax - idMin) ) + idMin);
                            break;
                        case 1:
                            h.text( s.slider( 'values' )[i] / 10);
                            break;
                    }
                }
            },
            
            slide: function( event, ui ) {
                var s = $(this);
                var id = s[0].id;
                var idMin = minimumValuesByName[id];
                var idMax = maximumValuesByName[id];
                var hIdx = ui.handleIndex;
                var h = $(ui.handle);
                switch (hIdx) {
                    case 0:
                    case 2:
                        var minVal = Math.round( (ui.values[0] / 1000) * (idMax - idMin) ) + idMin;
                        var maxVal = Math.round( (ui.values[2] / 1000) * (idMax - idMin) ) + idMin;
                        var val;
                        if (minVal > maxVal) {
                            if (hIdx == 0) {
                                val = maxVal;
                            } else {
                                val = minVal;
                            }
                        } else {
                            val = hIdx == 0 ? minVal : maxVal;
                        }
                        var sliderVal = Math.round(1000 * ((val - idMin) / (idMax - idMin)));
                        if (hIdx == 0) {
                            s.slider('values', [sliderVal, ui.values[1], ui.values[2]]);
                        } else {
                            s.slider('values', [ui.values[0], ui.values[1], sliderVal]);
                        }
                        h.text(val);							
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    case 1:
                        h.text(Math.floor(ui.values[hIdx] / 10));
                        break;
                }
                for (var i = 0; i < sliderInitValues.length; i++) {
                    if (i == hIdx) {
                        h.css('z-index', '2');
                    } else {
                        var hOther = s.children('div[data-index=' + i + ']');
                        hOther.css('z-index', '0');
                    }
                }
            }
        });
    });
    
    $('.class-selector').click(function(ev) {
        switch (ev.target.id) {
            case 'allVocations':
                $('.class-select').prop('checked', true);
                classChange(ev);
                break;
            case 'anyVocation':
                $('.class-select').prop('checked', false);
                classChange(ev);
                break;
        }
    });
    $('.class-select').change(classChange);
    $('.armor-select').focus(function(event) {
        var $ui = $(event.target);
        $ui.autocomplete('search', '');
    });
    $('.armor-select').focusout(function(ev) {
        let type = ev.target.id.replace('_', ' ');
        let vocations = getVocations();
        filterArmorTypeByVocations(type, vocations);
    });
    
    function Runnable() {
        var selectedArmors = {};
        var iterableArmors = {};
        var iter;
        var maxVal;
        var step;
        var searchMins = [];
        var searchMaxes = [];
        var searchPrios = [];
        var importantMinIndexes = [];
        var importantMaxIndexes = [];
        var selectedMins = [];
        var selectedMaxes = [];
        var topScores = [-1000000];
        var topIterations = [];

        var isArmorFiltered = function(armor) {
            //does it exceed any important maximums?
            for (const i of importantMaxIndexes) {
                if (armor.values[i] > searchMaxes[i]) {
                    return true;
                }
            }
        };

        var calculateScore = function(armor) {
            var score = 0;
            for (var i = 0; i < 30; i++) {
                score += searchPrios[i] * armor.scaledValues[i];
            }
            return score;
        };

        var calculateScores = function(armors) {
            var score = 0;
            for (var i = 0; i < 30; i++) {
                var iValue = 0;
                for (const armor of armors) {
                    iValue += armor.values[i];
                }
                if (i > 2) { // all attributes are percentages, so over 100% has no extra value
                    iValue = Math.min(100, iValue);
                }
                score += searchPrios[i] * scaleFactors[i] * iValue;
            }
            return score;
        };

        this.init = function() {
            //extract mins/maxes/prios from sliders and determine which are important
            for (var i = 0; i < 30; i++) {
                var name = allNames[i];
                var idMin = minimumValuesByName[name];
                var idMax = maximumValuesByName[name];
                var slider = sliders[name];
                var sliderValues = slider.slider( 'values' );
                var minVal = Math.round( (sliderValues[0] / 1000) * (idMax - idMin) ) + idMin;
                var maxVal = Math.round( (sliderValues[2] / 1000) * (idMax - idMin) ) + idMin;
                var prioVal = sliderValues[1] / 100;
                if (prioVal == 0) {
                    prioVal = 0.01; //bugfix: gives a tiny weighting to weight to make searches work nicely.
                }
                searchMins.push(minVal);
                searchMaxes.push(maxVal);
                searchPrios.push(prioVal);
                if (minVal > idMin) {
                    importantMinIndexes.push(i);
                    selectedMins[i] = 0;
                }
                if (maxVal < idMax) {
                    importantMaxIndexes.push(i);
                    selectedMaxes[i] = 0;
                }
            }

            //populate the selectedArmors and iterableArmors structures, pre-filtering
            //armors if possible            
            $('.armor-select').each(function() {
                var type = this.id.replace('_', ' ');
                var selectedArmorKey = $(this).val();
                if (selectedArmorKey.length > 0) {
                    var selectedArmor = armors[selectedArmorKey];
                    if (selectedArmor) {
                        if(!isArmorFiltered(selectedArmor)) {
                            selectedArmors[type] = selectedArmor;
                            for (const i of importantMinIndexes) {
                                selectedMins[i] += selectedArmor.values[i];
                            }
                            for (const i of importantMaxIndexes) {
                                selectedMaxes[i] += selectedArmor.values[i];
                            }
                        }
                        return;
                    }
                }
                iterableArmors[type] = [];
                for (const key of selectableArmors[type]) {
                    var iterableArmor = armors[key];
                    if (!isArmorFiltered(iterableArmor)) {
                        iterableArmor.score = calculateScore(iterableArmor);
                        iterableArmors[type].push(iterableArmor);
                    }
                }
            });

            //check that there is at least one armor in each type
            var searchValid = true;
            for (var type in allArmors) {
                if (!selectedArmors[type] && iterableArmors[type] && iterableArmors[type].length == 0) {
                    searchValid = false;
                    break;
                }
            }
            
            if (!searchValid) {
                displayMessage('No search possible for min/max criteria.');
                return null;
            }

            //sort each type by score, descending. then trim arrays to top 10 scores
            var armorComparator = function (armor1, armor2) {
                return armor2.score - armor1.score;
            };
            for (var type in iterableArmors) {
                var typeArmors = iterableArmors[type];
                typeArmors.sort(armorComparator);
                var cnt = 0;
                var lastScore = -100000;
                for (var idx = 0; idx < typeArmors.length; idx++) {
                    var armor = typeArmors[idx];
                    if (armor.score != lastScore) {
                        cnt++;
                        if (cnt > 10) {
                            iterableArmors[type] = typeArmors.slice(0, idx);
                            break;
                        }
                        lastScore = armor.score;
                    }
                }
            }

            iter = new SetIterator(iterableArmors); 
            maxVal = iter.getPermutations();
            step = Math.min(maxVal / 100, 10000000);
            return {
                maxVal: maxVal,
                text: 'Calculating ' + iter.getPermutations() + ' permutations...'
            };
        }

        this.run = function() {
            var i = 0;
            nextIteration:
            while (iter.hasNext() && i++ < step) {
                var iteration = iter.next();
                for (var key in selectedArmors) {
                    iteration.push(selectedArmors[key]);
                }
                //does it not meet any important minimums?
                for (const minI of importantMinIndexes) {
                    var min = selectedMins[minI];
                    for (const armor of iteration) {
                        min += armor.values[minI];
                    }
                    
                    if (min < searchMins[minI]) {
                        continue nextIteration;
                    }
                    //console.log('min:' + min + ', searchMins[' + minI + ']:' + searchMins[minI]);
                }
                //does it exceed any important maximums?
                for (const maxI of importantMaxIndexes) {
                    var max = selectedMaxes[maxI];
                    for (const armor of iteration) {
                        max += armor.values[maxI];
                    }
                    if (max > searchMaxes[maxI]) {
                        continue nextIteration;
                    }
                }
                //add to top iterations by score
                var iterationScore = calculateScores(iteration);

                for (var j = 0; j < topScores.length; j++) {
                    var topScore = topScores[j];
                    if (iterationScore < topScore) {
                        continue;
                    }
                    if (iterationScore > topScore) {
                        topScores.splice(j, 0, iterationScore);
                        topIterations.splice(j, 0, [iteration]);
                    } else if (topScores == topScore) {
                        topIterations[j].push(iteration);
                    }
                    break;
                }
                if (topScores.length > 10) {
                    topScores = topScores.slice(0, 10);
                    topIterations = topIterations.slice(0, 10);
                }
            }
            var val = iter.getPermutation();
            return {
                val: val
            };
        }

        this.completed = function() {
            if (topIterations.length == 0) {
                displayMessage('No results met min/max criteria.');
                return;
            }
            displayResults(topIterations, allNamesTitles, armors);
        }
    };

    function startSearch() {
        displayMessage('');
        new ProgressRunner(new Runnable());
    }
   
    $('#calculate').click(startSearch);
});