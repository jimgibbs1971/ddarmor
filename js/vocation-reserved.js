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
    $('.class-select').each(function (index, element) {
        if ($(element).is(':checked')) {
            vocations.push(element.id);
        }
    });
    return vocations;
}

function classChange() {
    filterArmorByVocations(getVocations());
}

function setupSelectedUi() {
    $('#head_armor').autocomplete({ source: selectableArmors['head armor'], minLength: 0 });
    $('#torso_armor').autocomplete({ source: selectableArmors['torso armor'], minLength: 0 });
    $('#chest_clothing').autocomplete({ source: selectableArmors['chest clothing'], minLength: 0 });
    $('#arm_armor').autocomplete({ source: selectableArmors['arm armor'], minLength: 0 });
    $('#leg_armor').autocomplete({ source: selectableArmors['leg armor'], minLength: 0 });
    $('#leg_clothing').autocomplete({ source: selectableArmors['leg clothing'], minLength: 0 });
    $('#cloak').autocomplete({ source: selectableArmors['cloak'], minLength: 0 });

    $('.class-selector').click(function (ev) {
        switch (ev.target.id) {
            case 'allVocations':
                $('.class-select').prop('checked', true);
                classChange();
                break;
            case 'anyVocation':
                $('.class-select').prop('checked', false);
                classChange();
                break;
        }
    });
    $('.class-select').change(classChange);
    $('.armor-select').focus(function (event) {
        var $ui = $(event.target);
        $ui.autocomplete('search', '');
    });
    $('.armor-select').focusout(function (ev) {
        let type = ev.target.id.replace('_', ' ');
        let vocations = getVocations();
        filterArmorTypeByVocations(type, vocations);
    });
}

function resetVocationReserved() {
    $('.armor-select').each(function () {
        $(this).val('');
    });
    $('.class-select').each(function () {
        $(this).prop('checked', false);
    });
    classChange();
}