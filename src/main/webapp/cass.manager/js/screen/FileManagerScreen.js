FileManagerScreen = (function(FileManagerScreen){
	
	function uploadFailed(err)
	{
		if(err == undefined)
			err = "Unable to Connect to Server for Upload";
		ViewManager.getView("#fileManagerMessageContainer").displayAlert(err, "uploadFail");
	}
	
	function downloadFailed(err)
	{
		if(err == undefined)
			err = "Unable to Connect to Server for Download";
		ViewManager.getView("#fileManagerMessageContainer").displayAlert(err, "downloadFail");
	}
	
	function searchFailed(err)
	{
		if(err == undefined)
			err = "Unable to Connect to Server to Search";
		ViewManager.getView("#fileManagerMessageContainer").displayAlert(err, "searchFail");
	}
	
	
	var tile = '<div class="tile" tabindex="0" style="display:block"><div class="cube app document"><div class="front"><p class="title"></p></div><div class="back"><p class="status"></p><div class="actions"></div></div></div><a class="hotspot finger" title=""></a></div>';
	function displayResult(obj)
	{
	    $("#fileManagerResults").html("");
	    for (var index in obj)
	    {
	        $("#fileManagerResults").append(tile);
	        var t = $("#fileManagerResults").children(".tile").last();
	        var name = obj[index]["name"];
	        t.find(".title").text(name);
	        t.attr("id",obj[index].id);
	    }
	    
	    $( "#fileManagerResults" ).on( "click", ".tile",function(){
	    	ViewManager.getView("#fileManagerMessageContainer").clearAlert("downloadFail");
	        AppController.repositoryController.downloadFile($(this).attr("id"), downloadFailed);
	    });
	}
	
	function fileSearch(){
		var query = $("#fileManagerSearchText").val();

		ViewManager.getView("#fileManagerMessageContainer").clearAlert("searchFail");
		AppController.searchController.fileSearch(query, fileManagerSearchesPublic, displayResult, searchFailed);
	}


	function startFileUpload()
	{
	    var tile = '<div class="tile" tabindex="0" style="display:block"><div class="cube app document"><div class="front"><p class="title">Initializing...</p></div><div class="back"><p class="status"></p><div class="actions"></div></div></div><a class="hotspot finger" title=""></a></div>';
	    $("#fileManagerResults").append(tile);
	    if (files.length > 0)
	        if (fileManagerEncrypted)
	            setTimeout(function(){startFileUpload2(true);},100);
	        else
	            setTimeout(function(){startFileUpload2(false);},100);
	}

	function startFileUpload2(encrypt)
	{
	    var t = $("#fileManagerResults").children(".tile").last();
	    t.find(".title").text("Uploading...");
	    setTimeout(function(){startFileUpload3(encrypt);},100);
	}

	function startFileUpload3(encrypt)
	{
	    var reader = new FileReader();
	    reader.onload = function(event) {
	        if (encrypt)
	        {
	            AppController.repositoryController.encryptAndUploadFile(files[0].name,
	            		event.target.result.split(",")[1],
	            		event.target.result.split(";")[0].split(":")[1],
	            		fileUploaded,
	            		uploadFailed
	            );
	        }
	        else
	        {
	        	AppController.repositoryController.uploadFile(files[0].name,
	        			event.target.result.split(",")[1],
	        			event.target.result.split(";")[0].split(":")[1],
	            		fileUploaded,
	            		uploadFailed
	        	);
	        }
	        
	    };
	    reader.readAsDataURL(files[0]);    
	}
	
	function fileUploaded()
	{
		ViewManager.getView("#fileManagerMessageContainer").clearAlert("uploadFail");
		
	    var t = $("#fileManagerResults").children(".tile").last();
	    t.find(".title").text("Completed.");
	    files.shift();
	    if (files.length != 0)
	        startFileUpload();
	    else
	    	fileSearch();
	}
	
	var fileManagerEncrypted = true;
	var fileManagerSearchesPublic = true;

	var brdr = '2px dotted #0B85A1';
	var obj = $("#dragTarget");

	var files;
	var timeout;
	
	FileManagerScreen.prototype.display = function(containerId, callback)
	{
		$(containerId).load("partial/screen/fileManager.html", function(){
			ViewManager.showView(new MessageContainer("fileSearch"), "#fileManagerMessageContainer");
			
			fileSearch();

			$( "#fileManagerSearchText" ).on( "keyup", function(event){
				fileSearch();
			});
			
			$( "#fileManagerSearchBtn" ).click(fileSearch);
			
			$("#fileManagerEncrypted").change(function(){
			    fileManagerEncrypted = this.checked;
			    fileSearch();
			})
			$("#fileManagerPublic").change(function(){
			    fileManagerSearchesPublic = this.checked;
			    fileSearch();
			})
			
			$("#dragTarget").on('dragenter', function (e)
			{
				e.stopPropagation();
				e.preventDefault();
				brdr = '2px solid #0B85A1';
			});
			$("#dragTarget").on('dragover', function (e) 
			{
				e.stopPropagation();
			    e.preventDefault();
			    brdr = '2px solid #0B85A1';
				$("#dragTarget").css('border', brdr);
			});
			
			$("body").on('dragover', function (e) 
			{
				clearTimeout( timeout );
				timeout = setTimeout( function(){         
					$("#dragTarget").css('border', '');
				}, 200);
				$("#dragTarget").css('border', brdr);
			});
			$("#dragTarget").on('dragleave', function (e) 
			{
				e.stopPropagation();
				e.preventDefault();
				brdr = '2px dotted #0B85A1';
			});
			
			$("#dragTarget").on('drop', function (e) 
			{
				$(this).css('border', '');
				e.preventDefault();
				var fileContainer = e.originalEvent.dataTransfer.files;
				if (fileManagerEncrypted && AppController.identityController.selectedIdentity == null)
				{
					ViewManager.getView("#fileManagerMessageContainer").displayAlert("Cannot Encrypt, User Not Logged In or Identity Not Selected", "noIdentity");
					return;
				}else{
					ViewManager.getView("#fileManagerMessageContainer").clearAlert("noIdentity");
				}
				
				files = [];
				for (var index = 0;index < fileContainer.length;index++)
					files.push(fileContainer[index]);
				$("#fileManagerResults").html("");
				startFileUpload();
			});
			
			if(callback != undefined)
				callback();
		});
	};
	
	return FileManagerScreen;
})(FileManagerScreen);