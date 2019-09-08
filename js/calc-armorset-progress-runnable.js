function CalculateArmorSetProgressRunnable() {
    var selectedArmors = {};
    var iterableArmors = {};
    var iter;
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

    var isArmorFiltered = function (armor) {
        //does it exceed any important maximums?
        for (const i of importantMaxIndexes) {
            if (armor.values[i] > searchMaxes[i]) {
                return true;
            }
        }
    };

    var calculateScore = function (armor) {
        var score = 0;
        for (var i = 0; i < 30; i++) {
            score += searchPrios[i] * armor.scaledValues[i];
        }
        return score;
    };

    var calculateScores = function (armors) {
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

    this.init = function () {
        //extract mins/maxes/prios from sliders and determine which are important
        for (var i = 0; i < 30; i++) {
            var name = allNames[i];
            var idMin = minimumValuesByName[name];
            var idMax = maximumValuesByName[name];
            var slider = sliders[name];
            var sliderValues = slider.slider('values');
            var minVal = Math.round((sliderValues[0] / 1000) * (idMax - idMin)) + idMin;
            var maxVal = Math.round((sliderValues[2] / 1000) * (idMax - idMin)) + idMin;
            var prioVal = sliderValues[1] / 100;
            if (prioVal == 0) {
                prioVal = 0.01; //gives a tiny weighting to make searches work nicely.
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
        $('.armor-select').each(function () {
            var type = this.id.replace('_', ' ');
            var selectedArmorKey = $(this).val();
            if (selectedArmorKey.length > 0) {
                var selectedArmor = armors[selectedArmorKey];
                if (selectedArmor) {
                    if (!isArmorFiltered(selectedArmor)) {
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
        maxPermutations = iter.getPermutations();
        step = Math.min(maxPermutations / 100, 10000000);
        return {
            maxVal: maxPermutations,
            text: 'Calculating ' + iter.getPermutations() + ' permutations...'
        };
    }

    this.run = function () {
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

    this.completed = function () {
        if (topIterations.length == 0) {
            displayMessage('No results met min/max criteria.');
            return;
        }
        displayResults(topIterations);
    }
};