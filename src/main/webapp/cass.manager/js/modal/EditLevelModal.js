var EditLevelModal = (function(EditLevelModal){	
	
	function createContactSmall(pem)
	{
		var ident = AppController.identityController.lookup(pem);
	    return '<span class="ownershipDisplay has-tip" tabindex>'
	    	+ '<span class="qrcodeCanvas"></span>'
	    	+ '<span class="contactText" title="'+pem+'">'+ident.displayName+'</span>'
	    	+ '</span>';
	}
	
	function saveLevelFail(err){
		if(err == undefined)
			err = "Unable to Connect to Server to Save Level";
		
		ViewManager.getView("#editLevelError").displayAlert(err);
	}
	
	function errorDeleting(err){
		if(err == undefined)
			err = "Unable to Connect to Server to Delete Level";
		
		ViewManager.getView("#editLevelError").displayAlert(err);
	}
	
	EditLevelModal.prototype.display = function(containerId, callback)
	{
		var data = this.data;
		var modalCloseCallback = this.closeCallback;
		
		$(containerId).load("partial/modal/editLevel.html", function(html){
			
			ViewManager.showView(new MessageContainer("editLevel"), "#editLevelError", function(){
				if(AppController.identityController.selectedIdentity == undefined && data.isAny(new EcCompetency().getTypes()))
				{
					ViewManager.getView("#editLevelError").displayWarning("You are Creating a Public Level, this level can be modified by anyone");
				}
			});
			
			$("#editLevelCancel").click(function(event){
				event.preventDefault();
				ModalManager.hideModal();
			});
			
			if(data.isAny(new EcCompetency().getTypes()))
			{
				if(AppController.identityController.selectedIdentity != undefined)
				{
					$("#editLevelOwnership").text("");
					
					var pem = AppController.identityController.selectedIdentity.ppk.toPk().toPem()
					
					var contact = $(createContactSmall(pem));
					$("#editLevelOwnership").append(contact);            
		    		contact.children(".qrcodeCanvas").qrcode({
		                width:128,
		                height:128,
		                text:forge.util.decode64(pem.replaceAll("-----.*-----","").trim())
		            });
		    		
		    		$("#editLevelAdvancedOwnership").removeClass("hide");
					$("#editLevelAdvancedOwnership").click(function(ev){
						var level = new EcLevel();
						level.name = $("#editLevelName").val();
						level.title = $("#editLevelTitle").val();
						level.description = $("#editLevelDescription").val();
						level.performance = $("#editLevelPerformance").val();
						
						var owners = $("#editLevelOwnership").children("span").map(function(idx, el){
							return $(el).find(".contactText").attr("title");
						})
						
						for(var i = 0; i < owners.length; i++){
							level.addOwner(EcPk.fromPem(owners[i]))
						}
						
						if(!$("#editLevelVisibilityRow").hasClass("hide")){
							level.privateEncrypted = true;
							var readers = $("#editLevelReaders").children().map(function(idx, el){
								return $(el).find(".contactText").attr("title");
							})
							
							for(var i = 0; i < readers.length; i++){
								level.addReader(EcPk.fromPem(readers[i]))
							}
						}

						ModalManager.showModal(new AdvancedPermissionsModal(level, function(permissionedLevel){
							ModalManager.showModal(new EditLevelModal(data, modalCloseCallback), function(){
								$("#editLevelName").val(permissionedLevel.name);
								$("#editLevelTitle").val(permissionedLevel.title);
								$("#editLevelDescription").val(permissionedLevel.description);
								$("#editLevelPerformance").val(permissionedLevel.performance);
								
								if(permissionedLevel.owner != undefined && permissionedLevel.owner.length > 0)
								{
									$("#editLevelOwnership").text("");
									
									for(var i = 0; i < permissionedLevel.owner.length; i++)
									{	
										if(i > 0)
							    			$("#editLevelOwnership").append(", ");
										
										var pem = permissionedLevel.owner[i];
										
										var contact = $(createContactSmall(pem));
										$("#editLevelOwnership").append(contact);            
							    		contact.children(".qrcodeCanvas").qrcode({
							                width:128,
							                height:128,
							                text:forge.util.decode64(pem.replaceAll("-----.*-----","").trim())
							            });   
									}
								}else{
									$("#editLevelOwnership").text("Public");
								}
								
								if(permissionedLevel.privateEncrypted){
									$("#editLevelVisibilityRow").removeClass("hide");
									$("#editLevelReadersRow").removeClass("hide");
									
									if(permissionedLevel.reader != undefined && permissionedLevel.reader.length > 0)
									{
										$("#editLevelReaders").text("");
										$("#editLevelReaders").css("font-style", "normal");
										
										for(var i = 0; i < permissionedLevel.reader.length; i++)
										{	
											if(i > 0)
								    			$("#editLevelReaders").append(", ");
											
											var pem = permissionedLevel.reader[i];
											
											var contact = $(createContactSmall(pem));
											$("#editLevelReaders").append(contact);            
								    		contact.children(".qrcodeCanvas").qrcode({
								                width:128,
								                height:128,
								                text:forge.util.decode64(pem.replaceAll("-----.*-----","").trim())
								            });   
										}
									}else{
										$("#editLevelReaders").text("None Added Yet");
									}
								}else{
									$("#editLevelVisibilityRow").addClass("hide");
									$("#editLevelReadersRow").addClass("hide");
									
								}
							})
						}))
					});
				}
				
				
				$("#editLevelDelete").remove();
				
				$("#editLevelSubmit").click(function(event){
					event.preventDefault();
					
					var level = new EcLevel();
					if(AppController.identityController.selectedIdentity != undefined){
						level.addOwner(AppController.identityController.selectedIdentity.ppk.toPk());
					}
					level.generateId(AppController.serverController.selectedServerUrl)
					level.name = $("#editLevelName").val();
					level.title = $("#editLevelTitle").val();
					level.description = $("#editLevelDescription").val();
					level.performance = $("#editLevelPerformance").val();
					level.competency = data.shortId();
					
					var owners = $("#editLevelOwnership").children("span").map(function(idx, el){
						return $(el).find(".contactText").attr("title");
					})
					
					for(var i = 0; i < owners.length; i++){
						level.addOwner(EcPk.fromPem(owners[i]))
					}
					
					if(!$("#editLevelVisibilityRow").hasClass("hide")){
						level.privateEncrypted = true;
						var readers = $("#editLevelReaders").children().map(function(idx, el){
							return $(el).find(".contactText").attr("title");
						})
						
						for(var i = 0; i < readers.length; i++){
							level.addReader(EcPk.fromPem(readers[i]))
						}
					}
					
					if(level.name == undefined || level.name == ""){
						ViewManager.getView("#editLevelError").displayAlert("Level Requires a Name to be Saved");
						return;
					}
					
					EcRepository.save(level, function(){
						if(modalCloseCallback != undefined)
							modalCloseCallback(level);
						
						ModalManager.hideModal();
					}, saveLevelFail);
				})
			}
			else if(data.isAny(new EcLevel().getTypes()))
			{
				$("#editLevelDelete").removeClass("hide");
				
				$("#editLevelSubmit").text("Save");
				
				$("#editLevelName").val(data.name);
				$("#editLevelTitle").val(data.title);
				$("#editLevelDescription").val(data.description);
				$("#editLevelPerformance").val(data.performance);
				
				if(data.privateEncrypted == true){
					$("#editLevelVisibilityRow").removeClass("hide");
					$("#editLevelReadersRow").removeClass("hide");
					
					if(data.reader != undefined && data.reader.length > 0)
					{
						$("#editLevelReaders").text("");
						$("#editLevelReaders").css("font-style", "normal");
						
						for(var i = 0; i < data.reader.length; i++)
						{	
							if(i > 0)
				    			$("#editLevelReaders").append(", ");
							
							var pem = data.reader[i];
							
							var contact = $(createContactSmall(pem));
							$("#editLevelReaders").append(contact);            
				    		contact.children(".qrcodeCanvas").qrcode({
				                width:128,
				                height:128,
				                text:forge.util.decode64(pem.replaceAll("-----.*-----","").trim())
				            });   
						}
					}else{
						$("#editLevelReaders").text("None Added Yet");
					}
				}
				
				if(data.owner != undefined && data.owner.length > 0)
				{
					$("#editLevelOwnership").text("");
					
					for(var i = 0; i < data.owner.length; i++)
					{
						if(i > 0)
			    			$("#editLevelOwnership").append(", ");
						
						var pem = data.owner[i];
						
						var contact = $(createContactSmall(pem));
						$("#editLevelOwnership").append(contact);            
			    		contact.children(".qrcodeCanvas").qrcode({
			                width:128,
			                height:128,
			                text:forge.util.decode64(pem.replaceAll("-----.*-----","").trim())
			            });   
					}
				}
				
				var canEdit = false;
				for(var index in EcIdentityManager.ids){
					var pk = EcIdentityManager.ids[index].ppk.toPk()
					if(data.canEdit(pk))
						canEdit = true;
				}
				if(data.owner == undefined || data.owner.length == 0)
					canEdit = true;
				
				if(canEdit)
				{
					if(data.owner != undefined){
						$("#editLevelAdvancedOwnership").removeClass("hide");
						$("#editLevelAdvancedOwnership").click(function(ev){
							data.name = $("#editLevelName").val();
							data.title = $("#editLevelTitle").val();
							data.description = $("#editLevelDescription").val();
							data.performance = $("#editLevelPerformance").val();
							
							var owners = $("#editLevelOwnership").children("span").map(function(idx, el){
								return $(el).find(".contactText").attr("title");
							})
							
							for(var i = 0; i < owners.length; i++){
								data.addOwner(EcPk.fromPem(owners[i]))
							}
							
							if(!$("#editLevelVisibilityRow").hasClass("hide")){
								data.privateEncrypted = true;
								var readers = $("#editLevelReaders").children().map(function(idx, el){
									return $(el).find(".contactText").attr("title");
								})
								
								for(var i = 0; i < readers.length; i++){
									data.addReader(EcPk.fromPem(readers[i]))
								}
							}
							
							ModalManager.showModal(new AdvancedPermissionsModal(data, function(permissionedLevel){
								if(permissionedLevel.privateEncrypted){
									$("#editLevelVisibilityRow").removeClass("hide");
									$("#editLevelReadersRow").removeClass("hide");
									
									if(permissionedLevel.reader != undefined && permissionedLevel.reader.length > 0)
									{
										$("#editLevelReaders").text("");
										$("#editLevelReaders").css("font-style", "normal");
										
										for(var i = 0; i < permissionedLevel.reader.length; i++)
										{	
											var pem = permissionedLevel.reader[i];
											
											var contact = $(createContactSmall(pem));
											$("#editLevelReaders").append(contact);            
								    		contact.children(".qrcodeCanvas").qrcode({
								                width:128,
								                height:128,
								                text:forge.util.decode64(pem.replaceAll("-----.*-----","").trim())
								            });   
										}
									}else{
										$("#editLevelReaders").text("None Added Yet");
									}
								}else{
									$("#editLevelVisibilityRow").addClass("hide");
									$("#editLevelReadersRow").addClass("hide");
									
								}
								
								ModalManager.showModal(new EditLevelModal(permissionedLevel, modalCloseCallback))
							}));
						});
					}
					
					$("#editLevelModalTitle").text("Edit Level");
					
					$("#editLevelSubmit").click(function(event){
						event.preventDefault();
						
						data.name = $("#editLevelName").val();
						data.title = $("#editLevelTitle").val();
						data.description = $("#editLevelDescription").val();
						data.performance = $("#editLevelPerformance").val();
						
						var owners = $("#editLevelOwnership").children("span").map(function(idx, el){
							return $(el).find(".contactText").attr("title");
						})
						
						for(var i = 0; i < owners.length; i++){
							data.addOwner(EcPk.fromPem(owners[i]))
						}
						
						if(!$("#editLevelVisibilityRow").hasClass("hide")){
							data.privateEncrypted = true;
							var readers = $("#editLevelReaders").children().map(function(idx, el){
								return $(el).find(".contactText").attr("title");
							})
							
							for(var i = 0; i < readers.length; i++){
								data.addReader(EcPk.fromPem(readers[i]))
							}
						}
						
						if(data.name == undefined || data.name == ""){
							ViewManager.getView("#editLevelError").displayAlert("Level Requires a Name to be Saved");
							return;
						}
						
						var url = data.id;
						var split = url.split("\/");
						if (split[split.length-4] == "data") 
							split[split.length-1] = new Date().getTime();
						data.id = split.join("/");
						
						EcRepository.save(data, function(level){
							if(modalCloseCallback != undefined)
								modalCloseCallback(data);
							
							ModalManager.hideModal();
						}, saveLevelFail);
					});
					
					$("#editLevelDelete").click(function(event){
						event.preventDefault();
						
						EcRepository._delete(data, function(){
							if(modalCloseCallback != undefined)
								modalCloseCallback(null);
							ModalManager.hideModal();
						}, errorDeleting);
					})
				}
				else
				{
					$("#editLevelModalTitle").text("View Level");
					
					$("#editLevelDelete").remove();
					$("#editLevelSubmit").remove();
					$("#editLevelCancel").remove();
					
					$("#editLevelName").attr("disabled", "disabled");
					$("#editLevelTitle").attr("disabled", "disabled");
					$("#editLevelDescription").attr("disabled", "disabled");
					$("#editLevelPerformance").attr("disabled", "disabled");
				}
			}
			else
			{
				ViewManager.getView("#editLevelError").displayAlert("Unrecognized Context For Level Modal");
				$("#editLevelName").attr("disabled", "disabled");
				$("#editLevelTitle").attr("disabled", "disabled");
				$("#editLevelDescription").attr("disabled", "disabled");
				$("#editLevelPerformance").attr("disabled", "disabled");
				
				$("#editLevelSubmit").click(function(event){
					event.preventDefault();
				});
			}
			
			
			
			if(callback != undefined)
				callback();
		});
	}
	
	return EditLevelModal;
})(EditLevelModal);