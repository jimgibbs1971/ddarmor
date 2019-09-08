function displayMessage(message) {
    $('#resultPanel').text(message);
}

function displayResults(topIterations) {
    var armorTypes = [
        'head armor',
        'torso armor',
        'chest clothing',
        'arm armor',
        'leg armor',
        'leg clothing',
        'cloak'
    ];
    var resultHtml = '<table class="result-table">';
    var resultArmors = {};

    function getArmorBlock(resultArmors) {
        var ht = '<div class="result-armor-outer">';
        for (const type of armorTypes) {
            var armor = resultArmors[type];
            ht += '<div class="result-armor-name" data-armor="' + armor.name + '">' + armor.name + '</div>';
        }
        ht += '</div>';
        return ht;
    }

    function getArmorStats(resultArmors) {
        var ht = '<div class="result-armor-outer">';
        for (var i = 0; i < allNamesTitles.length; i++) {
            var name = allNamesTitles[i];
            var value = 0;
            for (var key in resultArmors) {
                var armor = resultArmors[key];
                value += armor.values[i];
            }
            if (value != 0) {
                value = (Math.round(100 * value) / 100);
                ht += '<div class="result-armor-inner">';
                ht += '<div class="result-armor-attr">' + name + '</div>';
                ht += '<div class="result-armor-value">' + value + '</div>';
                ht += '</div>';
            }
        }
        ht += '</div>';
        return ht;
    }

    for (var i = 0; i < topIterations.length; i++) {
        var topIteration = topIterations[i];
        var ties = topIteration.length;
        for (var j = 0; j < ties; j++) {
            resultHtml += '<tr>'
            if (j == 0) {
                resultHtml += '<td rowspan="' + ties + '">' + (i + 1) + '</td>';
            }
            var armorSet = topIteration[j];
            for (const armor of armorSet) {
                resultArmors[armor.type] = armor;
            }
            resultHtml += '<td>';
            resultHtml += getArmorBlock(resultArmors, armorTypes);
            resultHtml += '<td>';
            resultHtml += getArmorStats(resultArmors, allNamesTitles);
            resultHtml += '</td></tr>';
        }
    }
    resultHtml += '</table>';
    $('#resultPanel').html(resultHtml);
    $('div[data-armor]').hover(
        function (inEvent) {
            var target = inEvent.target;
            var $target = $(target);
            var $table = $target.closest('table.result-table tr');
            var offset = $table.offset();
            var x = Math.floor(offset.left + $table.width());
            var y = Math.floor(offset.top);
            var st = 'position:absolute;top:' + y + 'px;left:' + x + 'px;';
            var armorName = target.attributes['data-armor'].nodeValue;
            var armor = armors[armorName];
            var ht = '<div class="popup-title">' + armorName + '</div>';
            ht += '<div class="popup-type">' + armor.type + '</div>';
            ht += getArmorStats([armor]);
            var pu = $('#armorPopup');
            pu.html(ht);
            pu.attr('style', st);
            pu.show();
        },
        function (outEvent) {
            var pu = $('#armorPopup');
            pu.hide();
            pu.html('');
        }
    );
}