var SaveIdModal = (function(SaveIdModal){	

	function submitSave(){
		AppController.loginController.save(
			saveSuccess,
			saveFailure
		);
	}
	function saveSuccess()
	{
		ModalManager.hideModal();	
		
		AppMenu.prototype.rebuildIdentityList();
	}
	function saveFailure(err)
	{
		ViewManager.getView("#saveIdentityMessageContainer").displayAlert(err);
	}
	
	SaveIdModal.prototype.display = function(containerId, callback)
	{
		var msg = this.msg;
		$(containerId).load("partial/modal/saveId.html", function(){
			ViewManager.showView(new MessageContainer("saveId"), "#saveIdentityMessageContainer");
			
			if(msg == undefined){
				msg = "Something has changed...";
			}
			$("#saveMessageContainer").text(msg);
			
			$("#saveId").click(function(event){
				submitSave()
			});
			
			$("#skipSaveId").click(function(event){
				ModalManager.hideModal();
			});
			
			if(callback != undefined)
				callback();
		});
	}
	
	return SaveIdModal;
})(SaveIdModal);