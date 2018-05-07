sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter",
		"sap/ui/core/routing/History",
		"bam/services/DataContext"
], function(Controller, JSONModel, MessageToast, MessageBox, ResourceModel,Filter,History,DataContext) {
	"use strict";
	//
	var userList = [];
	var loggedInUserID;
	var firstTimePageLoad = true;
	var globalIds;
	return Controller.extend("bam.controller.EditUserMultiple", {
		//
		onInit : function () {
			// Get logged in user id
			loggedInUserID = DataContext.getUserID();
			//
			//	Create model and set it to initial data
	    	var oModel = new sap.ui.model.json.JSONModel();
	    	this.getView().setModel(oModel);
	    	this._oi18nModel = new ResourceModel({
                bundleName: "bam.i18n.i18n"
            });
            
            // checking the permission
			var userManagement = this._oi18nModel.getProperty("Module.userManagement");
			var permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			var hasEditPermission = false;
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === userManagement)
				{
						hasAccess = true;
						if(permissions[i].ACTION === "ADD" || permissions[i].ACTION === "EDIT"){
							hasEditPermission = true;
						}
				}
			}
			if(hasAccess === false || hasEditPermission === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "editUserSingle"
				});					
			}
			else{
				 //
	            this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
	            // Loading Dropdown
	            var roleList = DataContext.getDropdownValues(this._oi18nModel.getProperty("ddRole"));
	            //remove "Select"
	            roleList.splice(0,1);
	            oModel.setProperty("/ADD_ROLE_LIST",roleList);
	            oModel.setProperty("/REMOVE_ROLE_LIST",roleList);
	            //
	            // assign VM and VM data to a global variable for the page
				this._oUserUpdViewModel = oModel;            
				this._oViewModelData = this._oUserUpdViewModel.getData();
				//
				if(firstTimePageLoad){
					var oRouter = this.getRouter();
					oRouter.getRoute("editUserMultiple").attachMatched(this._onRouteMatched, this);
					firstTimePageLoad = false;
				}
			}
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		//	get the paramter values and set the view model according to it
		_onRouteMatched : function (oEvent) {
			// If the user does not exist in the BAM database, redirect them to the denied access page
			if(DataContext.isBAMUser() === false)
			{
				this.getOwnerComponent().getRouter().navTo("accessDenied");
			}
			else
			{
				//get current list of ids from model
		    	var core = sap.ui.getCore();
		    	var globalModel = core.getModel();
		    	globalIds = globalModel.getData();  
				this.setUserDefaultVM(globalIds);
				
				//whenever navigating to page clear the selected items list
				this.getView().byId("ddlAddRole").setSelectedItems([]);
				this.getView().byId("ddlRemoveRole").setSelectedItems([]);
			}
		},
		// set the default view model for multiple GMID Country combinations' edit page
		setUserDefaultVM: function(editUserIDs){
			var initData = [];
			for (var i = 0; i < editUserIDs.length; i++) {
	    		initData.push({
	    			ID:editUserIDs[i]
	    		});
			}
			this._oUserUpdViewModel.setProperty("/EDIT_USER_ID_LIST",initData);
			this._oUserUpdViewModel.setProperty("/USER_COUNT",editUserIDs.length);
		},
		//navigate back from edit page
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
	
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("userManagement", true);
			}
		},
		//cancel click on edit attributes page
		onCancel: function(){
			var curr = this;
			//get the list of updated attributes
			var updatedUserList = curr.getUpdatedUsers();
			// check if there are any changes to be updated
			if (updatedUserList !== ""){
				// check if user wants to update the attributes for GMID and country
				MessageBox.confirm("Are you sure you want to cancel your changes and navigate back to the previous page?", {
	            	icon: sap.m.MessageBox.Icon.WARNING,
	            	actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
	            	onClose: function(oAction) {
	            		if(oAction === "YES"){
	            			curr.getOwnerComponent().getRouter().navTo("userManagement");
	            		}
	            	}
	        	});
			}
			else{
				curr.getOwnerComponent().getRouter().navTo("userManagement");
			}
		},
		//get the list of updated attributes in string format
		getUpdatedUsers: function(){
			// get the crop protection and seeds value from i18n file
	    	var oi18nModel = this.getView().getModel("i18n");
			var updatedUserString = "";
			if (this.validateUserValueChange("ddlAddRole")){
				updatedUserString += oi18nModel.getProperty("ddRole");
				updatedUserString += ", ";
			}
			if (this.validateUserValueChange("ddlRemoveRole")){
				updatedUserString += oi18nModel.getProperty("ddRole");
				updatedUserString += ", ";
			}
			return updatedUserString.substring(0, updatedUserString.length - 2);
		},
		//validate if the value of various attributes has been updated
		validateUserValueChange: function (sourceControlName){
			var type = sourceControlName.substring(0,3);
			if((type === "ddl" && this.getView().byId(sourceControlName).getSelectedKeys().length > 0) || (type === "txt" && this.getView().byId(sourceControlName).getValue().trim() !== "")){
				return true;
			}
			else{
				return false;
			}
		},
		//click of submit button
		onSubmit: function(){
			var curr = this;
			//get the list of updated attributes
			var updatedUserList = curr.getUpdatedUsers();
			// check if there are any changes to be updated
			if (updatedUserList !== ""){
				var duplicateRoles  = this.validateDuplicateRoles();
				if(duplicateRoles !== ""){
					// check if user wants to update the attributes for GMID and country
					MessageBox.alert(duplicateRoles + " role(s) selected for both add and remove", {
		    			icon : MessageBox.Icon.ERROR,
						title : "Error"
		       		});	
		       		return;
				}
				// check if user wants to update the attributes for GMID and country
				MessageBox.confirm(("Roles will be updated for " + curr._oViewModelData.USER_COUNT + " users. Continue?"), {
	    			icon: sap.m.MessageBox.Icon.WARNING,
	    			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
	          		onClose: function(oAction) {
	          			var editUserIDList = curr._oViewModelData.EDIT_USER_ID_LIST;
	        			curr.fnCallbackSubmitConfirm(oAction, editUserIDList);
	            	}
	       		});
			}
			else{
				// check if user wants to update the attributes for GMID and country
				MessageBox.alert("There are no pending changes", {
	    			icon : MessageBox.Icon.ERROR,
					title : "Error"
	       		});
			}
		},
		// update the attributes based on user response
		fnCallbackSubmitConfirm: function(oAction, editUserIDList){
			var curr = this;
			// //if user confirmed to update the attributes, prepare the object and update the attributes for the GMID and country
			// //else do nothing
			if (oAction === "YES") 
			{
				// creating busy dialog lazily
				if (!this._busyDialog) 
				{
					this._busyDialog = sap.ui.xmlfragment("bam.view.BusyLoading", this);
					this.getView().addDependent(this._dialog);
				}
				// setting to a local variable since we are closing it in an oData success function that has no access to global variables.
				var busyDialog = this._busyDialog;
				busyDialog.open();
				
				var insertRoleOps = curr.createUpdateObject(editUserIDList);
				var sprocTriggerObj = {
						ID : 1,
						USER_ID : 'NONE',
						ROLE_CODE_ID : '1',
						IS_ADDED : 'F',
						MODIFIED_ON : new Date(),
						MODIFIED_BY : loggedInUserID,
						RUN_SPROC : 'T'
					};
				this._oDataModel.create("/USER_ROLE_ASSIGNMENT_STG", sprocTriggerObj,
	        		{
			        	success: function(){
			        		busyDialog.close();
			        		if(!insertRoleOps.Errors){
									MessageBox.alert("User roles for " + editUserIDList.length + " users updated successfully.",
										{
											icon : MessageBox.Icon.SUCCESS,
											title : "Success",
											onClose: function() {
							        			curr.getOwnerComponent().getRouter().navTo("userManagement");
							        	}
									});
							}
							else{
								MessageBox.alert("Error updating " + insertRoleOps.ErrorCount + " user roles.",
									{
										icon : MessageBox.Icon.ERROR,
										title : "Error"
									});
							}
			    		},
			    		error: function(){
			    			busyDialog.close();
			    			MessageBox.alert("Error updating " + editUserIDList.length + " user roles.",
									{
										icon : MessageBox.Icon.ERROR,
										title : "Error"
									});
						}
	        		});
			}
		},
		createUpdateObject: function(userIdList){
			// Create current timestamp
			var oDate = new Date();
			var UpdatedUserList = [];
			var insertSuccessCount = 0;
			var insertErrorCount = 0;
			var removeSuccessCount = 0;
			var removeErrorCount = 0;
			for(var i = 0; i < userIdList.length; i++){
				var addedRoleList = this.getView().byId("ddlAddRole").getSelectedKeys();
				for(var j = 0; j < addedRoleList.length; j++){
					var addedRole = {
						ID : 1,
						USER_ID : userIdList[i].ID,
						ROLE_CODE_ID : addedRoleList[j],
						IS_ADDED : 'T',
						MODIFIED_ON : oDate,
						MODIFIED_BY : loggedInUserID,
						RUN_SPROC : 'F'
					};
					this._oDataModel.create("/USER_ROLE_ASSIGNMENT_STG", addedRole,
			        		{
					        	success: function(){
					        		insertSuccessCount++;
					    		},
					    		error: function(){
					    			insertErrorCount++;
								}
			        		});
					UpdatedUserList.push(addedRole);
				}
				//
				var removedRoleList = this.getView().byId("ddlRemoveRole").getSelectedKeys();
				for(var k = 0; k < removedRoleList.length; k++){
					var removedRole = {
						ID : 1,
						USER_ID : userIdList[i].ID,
						ROLE_CODE_ID : removedRoleList[k],
						IS_ADDED : 'F',
						MODIFIED_ON : oDate,
						MODIFIED_BY : loggedInUserID,
						RUN_SPROC : 'F'
					};
					this._oDataModel.create("/USER_ROLE_ASSIGNMENT_STG", removedRole,
			        		{
					        	success: function(){
					        		removeSuccessCount++;
					    		},
					    		error: function(){
					    			removeErrorCount++;
								}
			        		});
					UpdatedUserList.push(removedRole);
				}
			}    	
			//return the object of updated attributes
			var TempUpdate = {
				UpdatedUserList: UpdatedUserList,
				Errors: (removeErrorCount + insertErrorCount > 0 ) ? true : false,
				ErrorCount: removeErrorCount + insertErrorCount
			};
			return TempUpdate;
		},
		//
		validateDuplicateRoles : function(){
			var addedRoleList = this.getView().byId("ddlAddRole").getSelectedItems();
			var removedRoleList = this.getView().byId("ddlRemoveRole").getSelectedItems();
			var duplicateRoles = "";
			for(var i = 0; i < addedRoleList.length; i++){
				for(var j = 0; j < removedRoleList.length; j++){
					if(addedRoleList[i].getText() === removedRoleList[j].getText()){
						duplicateRoles = duplicateRoles + addedRoleList[i].getText() + ", ";
					}
				}
			}
			if(duplicateRoles.length > 0){
				return duplicateRoles.substring(0, duplicateRoles.length - 2);
			}
			else{
				return duplicateRoles;
			}
		}
	});

});