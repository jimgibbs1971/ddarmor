function ProgressRunner(runnable) {
	var body = $('body');
	var progressBar = $('#progress_bar');
	var progressText = $('#progress_text');
	var wallWrapper = $('.wall_wrapper');
	var progressLabel = $('.progress-label');
	var progressCancelled = false;
	var lastPVal = 0;
	var cancelButton = $('#progress_cancel');
	progressBar.progressbar({
		change: function(event, ui) {
			progressLabel.text( progressBar.progressbar( 'value' ) + "%" );
		},
		complete: function(event, ui) {
			progressLabel.text( "100%" );
		}
	});
	progressText.text('Initialising...');
	progressLabel.text('0%');
	progressBar.progressbar('value', 0);
	wallWrapper.show();
	body.addClass('wall_prevent_scroll');
	
	cancelButton.click(function(event, ui) { 
		progressCancelled = true; 
	});
	
	var workProgress = function(runnable, maxVal) {
		if (progressCancelled) {
			workStop(false);
			return;
		}
		var res = runnable.run();
		var val = res.val;
		var pVal = Math.floor(val * 100 / maxVal);
		if (pVal != lastPVal) {
			progressBar.progressbar('value', pVal);
			lastPVal = pVal;
		}
		if (res.text) {
			progressText.text(res.text);
		}
		if (val < maxVal) {
			setTimeout(workProgress, 0, runnable, maxVal);
			return;
		}
		setTimeout(workStop, 100, true);
	}
	
	var workStop = function(completed) {
		body.removeClass('wall_prevent_scroll');
		wallWrapper.hide();
		if (completed) {
			setTimeout(runnable.completed, 0);
		}
		return true;
	}
	
	setTimeout(function() {
		var init = runnable.init();
		if (init == null) {
			workStop(false);
			return;
		} else {
			progressText.text(init.text ? init.text : 'Running...');
			setTimeout(workProgress, 0, runnable, init.maxVal);	
		}
	},1000);
}