document.querySelector("#read-file").addEventListener('click', function() {
	// no file selected to read
	if(document.querySelector("#file").value == '') {
		console.log('No file selected');
		return;
	}

	var file = document.querySelector("#file").files[0];

	var reader = new FileReader();
	reader.onload = function(e) {
		// binary data
		console.log(e.target.result);
	};
	reader.onerror = function(e) {
		// error occurred
		console.log('Error : ' + e.type);
	};
	reader.readAsBinaryString(file);
});