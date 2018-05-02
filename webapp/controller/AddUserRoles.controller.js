sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter",
		"sap/ui/core/routing/History",
		"bam/services/DataContext"
	], function (Controller, JSONModel, MessageToast, MessageBox, ResourceModel,Filter,History,DataContext) {
		"use strict";
	
	var attributeList = [];
	var loggedInUserID;
	var firstTimePageLoad = true;
	var globalIds;
	return Controller.extend("bam.controller.AddUserRoles", {
		onInit : function () {
			if(firstTimePageLoad)
			{
				//attach _onRouteMatched to be called everytime on navigation to Edit Attributes Single page
				var oRouter = this.getRouter();
				oRouter.getRoute("addUserRoles").attachMatched(this._onRouteMatched, this);
				firstTimePageLoad = false;
			}				
			// Get logged in user id
			loggedInUserID = DataContext.getUserID();
			// define a global variable for the oData model		    
			var oView = this.getView();
			oView.setModel(this.getOwnerComponent().getModel());
			// get resource model
			this._oi18nModel = this.getOwnerComponent().getModel("i18n");
			
			//
			this._oAddUserRolesViewModel = new sap.ui.model.json.JSONModel();
			// checking the permission
			var maintainMaterialAttributes = this._oi18nModel.getProperty("Module.userManagement");
			var permissions = DataContext.getUserPermissions();
			var hasAccess = true;
			//
			// if the user does not have access then redirect to accessdenied page
			if(hasAccess === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "addUserRoles"
				});	
			}
			else{
				this._isChanged = false;
				// Assigning view model for the page
				this._oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this._oModel);
				this._oModel.setSizeLimit(20000);
				this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
				//
				if (!this._busyDialog) 
				{
					this._busyDialog = sap.ui.xmlfragment("bam.view.BusyLoading", this);
					this.getView().addDependent(this._dialog);
				}

			}
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
			//get the paramter values and set the view model according to it
		_onRouteMatched : function (oEvent) {
			// If the user does not exist in the BAM database, redirect them to the denied access page
			if(DataContext.isBAMUser() === false)
			{
				this.getOwnerComponent().getRouter().navTo("accessDenied");
			}
			else
			{
				this.onInit();
			}
		},
			// add properties in view model to set the visibility of controls on basis of the user role
		checkPermission: function(attribute){
			return attributeList.includes(attribute);
		},
			// //navigate back from edit page
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
		onHome: function(){
			//	var oSmartTable = this.byId("smartTblBAMAttributes");
				//oSmartTable.exit();
				this.getOwnerComponent().getRouter().navTo("home");
			},
			
		onSearch: function (oEvent) {
				var result;
				// Create a filter & sorter array
				var filterArray = [];
				var userID = this._oModel.getProperty("/USER_ID");
				var userFilter = new Filter("USER_ID",sap.ui.model.FilterOperator.EQ,userID);
				filterArray.push(userFilter);
				var sortArray = [];
				//var sorter = new sap.ui.model.Sorter("NAME",false);
				//sortArray.push(sorter);
				
				// Get the User list
					this._oDataModel.read("/USER",{
							filters: filterArray,
							async: false,
			                success: function(oData, oResponse){
			                	if(oData.results.length === 1){
			                		/////
			                		this._oDataModel.read("/V_WEB_USER_ROLES",{
											async: false,
											filters: filterArray,
							                success: function(oData, oResponse){
							                	MessageBox.alert("Success.",
												{
													icon : MessageBox.Icon.ERROR,
													title : "Error"
												});
							                },
							    		    error: function(){
						    		    		MessageBox.alert("Unable to retrieve dropdown values for Rule Set Please contact System Admin.",
												{
													icon : MessageBox.Icon.ERROR,
													title : "Error"
												});
							            		result = [];
							    			}
							    	});
			                		////
			                	}
			                	else{
			                		//throw error saying user was not found
			                		MessageBox.alert("User not found. Please contact System Admin.",
								{
									icon : MessageBox.Icon.ERROR,
									title : "Error"
								});
			                		}
			                		 result =  oData.results;
			                },
			    		    error: function(){
		    		    		MessageBox.alert("Unable to retreive values. Please contact System Admin.",
								{
									icon : MessageBox.Icon.ERROR,
									title : "Error"
								});
			            		result = [];
			    			}
			    	});
			    	return result;
		}
  	});
});