$(document).ready(function() {
    setupSelectedUi();
    setupSliderUi();

    $('#help').click(function() {
        $('.help_wall_wrapper').show();
        $('.help_wall_wrapper').click(function() {
            $(this).hide();
        });
    });

    $('#reset').click(function() {
        displayMessage('');
        resetVocationReserved();
        resetSliders();
    });

    $('#calculate').click(function() {
        displayMessage('');
        new ProgressRunner(new CalculateArmorSetProgressRunnable());
    });
});