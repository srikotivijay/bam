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
	return Controller.extend("bam.controller.EditUserSingle", {
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
	            oModel.setProperty("/ROLE_LIST",roleList);
	            //
	            // assign VM and VM data to a global variable for the page
				this._oUserUpdViewModel = oModel;            
				this._oViewModelData = this._oUserUpdViewModel.getData();
				//
				if(firstTimePageLoad){
					var oRouter = this.getRouter();
					oRouter.getRoute("editUserSingle").attachMatched(this._onRouteMatched, this);
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
	    		//this.setPageToInitialState();
				//get current list of ids from model
		    	var core = sap.ui.getCore();
		    	var globalModel = core.getModel();
		    	globalIds = globalModel.getData();  
				this.setUserDefaultVM(globalIds);
				
				//whenever navigating to page clear the selected items list
				//this.getView().byId("ddlRole").setSelectedItems([]);
				// this.getView().byId("ddlRemoveRole").setSelectedItems([]);
			}
		},
		//set the page to initial state
		//clear the value state and value state text for all controls
		setPageToInitialState: function(){
			// this.getView().byId("ddlAddRole").setValueStateText("");
			// this.getView().byId("ddlAddRole").setValueState(sap.ui.core.ValueState.None);
		},
		// set the default view model for multiple GMID Country combinations' edit page
		setUserDefaultVM: function(editUserIDs){
			var initData = [];
			for (var i = 0; i < editUserIDs.length; i++) {
	    		initData.push({
	    			ID:editUserIDs[i]
	    		});
			}
			//
			this._oUserUpdViewModel.setProperty("/USERID", initData[0].ID);
			var filterArray=[];
            // Creating and adding the filter
            var gmidFilter = new Filter("USER_ID",sap.ui.model.FilterOperator.EQ,initData[0].ID);
            filterArray.push(gmidFilter);
            
            var userDetails;
            var userRoles;
			//query for additional data
			this._oDataModel.read("/USER",
			{
                            	filters: filterArray,
                            	async: false,
                            	success: function(oData, oResponse){
                            		userDetails  = oData.results.pop();
                            		//maxGMIDShipToID  = latestShipToCountry.ID;
                            	},
                            	error: function(){
                            		MessageToast.show("Unable to retrieve user details.");
                            	}
			});
			
			
	        this._oUserUpdViewModel.setProperty("/USERNAME", userDetails.USER_NAME);
	        this._oUserUpdViewModel.setProperty("/EMAIL", userDetails.EMAIL);
	        
	        //query for role data
			this._oDataModel.read("/USER_ROLE",
			{
                filters: filterArray,
                async: false,
                success: function(oData, oResponse){
					userRoles  = oData.results;
                },
                error: function(){
					MessageToast.show("Unable to retrieve user details.");
				}
			});
	        
	        var roleKeyArray = [];
	        for(var i = 0; i < userRoles.length; i++){
	        	roleKeyArray.push(userRoles[i].ROLE_CODE_ID);
	        }
	        this.getView().byId("ddlRole").setSelectedKeys(roleKeyArray);
	        this._oUserUpdViewModel.setProperty("/SELECTED_ROLES", this.getView().byId("ddlRole").getSelectedKeys());
			this._oUserUpdViewModel.setProperty("/EDIT_USER_ID",initData[0].ID);
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
			var hasRuleChanged = curr.checkRoleChange();
			// check if there are any changes to be updated
			if (hasRuleChanged){
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
		checkRoleChange: function(){
			var existingRoles = this._oUserUpdViewModel.getProperty("/SELECTED_ROLES");
			var selectedRoles = this.getView().byId("ddlRole").getSelectedKeys();
			// check any of the existing rules remved
			for(var i = 0; i < existingRoles.length; i++){
				if(selectedRoles.includes(existingRoles[i]) === false){
					return true;
				}
			}
			// check any new role added
			for(var j = 0; j < selectedRoles.length; j++){
				if(existingRoles.includes(selectedRoles[j]) === false){
					return true;
				}
			}
			return false;
		},
		//click of submit button
		onSubmit: function(){
			var curr = this;
			//get the list of updated attributes
			var hasRoleChanged = curr.checkRoleChange();
			// check if there are any changes to be updated
			if (hasRoleChanged){
				// // check if user wants to update the attributes for GMID and country
				MessageBox.confirm(("Role(s) will be updated for the selected user. Continue?"), {
	    			icon: sap.m.MessageBox.Icon.WARNING,
	    			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
	          		onClose: function(oAction) {
	          			var selectedUserID = curr._oViewModelData.EDIT_USER_ID;
	        			curr.fnCallbackSubmitConfirm(oAction, selectedUserID);
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
		fnCallbackSubmitConfirm: function(oAction, selectedUserID){
			var curr = this;
			// //if user confirmed to update the attributes, prepare the object and update the attributes for the GMID and country
			// //else do nothing
			if (oAction === "YES") 
			{
				// creating busy dialog lazily
				if (!this._busyDialog) 
				{
					this._busyDialog = sap.ui.xmlfragment("bam.view.BusyLoading", this);
					this.getView().addDependent(this._busyDialog);
				}
				// setting to a local variable since we are closing it in an oData success function that has no access to global variables.
				var busyDialog = this._busyDialog;
				busyDialog.open();
				
				var insertRoleOps = curr.createUpdateObject(selectedUserID);
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
									MessageBox.alert("User roles updated successfully.",
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
			    			MessageBox.alert("Error updating user roles.",
									{
										icon : MessageBox.Icon.ERROR,
										title : "Error"
									});
						}
	        		});
			}
		},
		createUpdateObject: function(userId){
			// Create current timestamp
			var oDate = new Date();
			var UpdatedUserList = [];
			var insertSuccessCount = 0;
			var insertErrorCount = 0;
			var removeSuccessCount = 0;
			var removeErrorCount = 0;
			var addedRoleList = this.getView().byId("ddlRole").getSelectedKeys();
			for(var j = 0; j < addedRoleList.length; j++){
				var addedRole = {
					ID : 1,
					USER_ID : userId,
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
			var removedRoleList = this.getView().byId("ddlRole").getEnabledItems();
			for(var k = 0; k < removedRoleList.length; k++){
				if(addedRoleList.includes(removedRoleList[k].getKey()) === false){
					var removedRole = {
						ID : 1,
						USER_ID : userId,
						ROLE_CODE_ID : removedRoleList[k].getKey(),
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
		}
	});

});