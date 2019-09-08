function resetSliderHandles(s) {
    var id = s[0].id;
    sliders[id] = s;
    var idMin = minimumValuesByName[id];
    var idMax = maximumValuesByName[id];
    for (var i = 0; i < sliderInitValues.length; i++) {
        var h = s.children('div[data-index=' + i + ']');
        switch (i) {
            case 0:
            case 2:
                h.text(Math.floor((s.slider('values')[i] / 1000) * (idMax - idMin)) + idMin);
                break;
            case 1:
                h.text(s.slider('values')[i] / 10);
                break;
        }
    }
}

function setupSliderUi() {
    $('.slider').each(function () {
        var sliderDiv = $(this);
        sliderDiv.slider({
            orientation: 'horizontal',
            min: 0,
            max: 1000,
            values: sliderInitValues.slice(),
            create: function () {
                var s = $(this);
                resetSliderHandles(s);
            },

            slide: function (event, ui) {
                var s = $(this);
                var id = s[0].id;
                var idMin = minimumValuesByName[id];
                var idMax = maximumValuesByName[id];
                var hIdx = ui.handleIndex;
                var h = $(ui.handle);
                switch (hIdx) {
                    case 0:
                    case 2:
                        var minVal = Math.round((ui.values[0] / 1000) * (idMax - idMin)) + idMin;
                        var maxVal = Math.round((ui.values[2] / 1000) * (idMax - idMin)) + idMin;
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
}

function resetSliders() {
    for (var id in sliders) {
        var s = sliders[id];
        s.slider('values', sliderInitValues.slice());
        resetSliderHandles(s);
    }
}