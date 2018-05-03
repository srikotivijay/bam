sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"bam/services/DataContext",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/core/routing/History",
		"sap/ui/model/Filter",
		"sap/ui/model/Sorter"
	], function (Controller,DataContext,MessageBox,MessageToast,ResourceModel,History,Filter,Sorter) {
		"use strict";

	var firstTimePageLoad = true;
	var loggedInUserID;
	return Controller.extend("bam.controller.UserManagement", {
		onInit : function () {
			// Get logged in user id
			loggedInUserID = DataContext.getUserID();
					
			// Get logged in user id
			// define a global variable for the oData model		
			var oView = this.getView();
			oView.setModel(this.getOwnerComponent().getModel());
			//
			// get resource model
			this._oi18nModel = this.getOwnerComponent().getModel("i18n");
			//
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
			//
			// if the user does not have access then redirect to accessdenied page
			if(hasAccess === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "userManagement"
				});					
			}
			else{
				this._oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this._oModel,"UserManagementVM");
				this._oModel.setProperty("/showEditButton",hasEditPermission);
				//
				this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
				//remove the selection column
				var oSmartTable = this.getView().byId("smartTblUserManagement");     //Get Hold of smart table
				var oTable = oSmartTable.getTable();          //Analytical Table embedded into SmartTable
				oTable.setEnableColumnFreeze(true);
				//oSmartTable.rebindTable();
				//oTable.getColumns();
			}
			if(firstTimePageLoad)
			{
				//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
				var oRouter = this.getRouter();
				oRouter.getRoute("userManagement").attachMatched(this._onRouteMatched, this);
				firstTimePageLoad = false;
			}
			else
			{
				this.getOwnerComponent().getModel().refresh(true);
				//This is a bandaid for resetting the Checkboxes on the grid, we could not find a method that directly unsets the checkboxes
				//Instead we can unset and set the checkbox
				oTable.setSelectionMode("None");
				oTable.setSelectionMode("MultiToggle");
			}	
				
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		// force init method to be called everytime we naviagte to Maintain Attribuets page 
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
		// navigate back to the homepage
		onHome: function(){
			this.getOwnerComponent().getRouter().navTo("home");
		},
		onBeforeRebindTable: function(oEvent) {
                // refresh the odata model, this will force a refresh of the smart table UI
                // this.getOwnerComponent().getModel().refresh(true);
                //                 //Get bindinParams Object, which includes filters
                // this._oBindingParams = oEvent.getParameter("bindingParams");
                //                 // setting up sorters
                // var aSorters = this._oBindingParams.sorter;
                // var GMIDSorter = new Sorter("CU_RULESET_DESCRIPTION",false);
                // var CountrySorter = new Sorter("GEOGRAPHY",false);
                // aSorters.push(GMIDSorter);
                // aSorters.push(CountrySorter);
        },

		//navigate back from rules page
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
	
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("home", true);
			}
		},
		// function to navigate to edit page
		onEdit : function(){
			//
			this._oSmartTable = this.getView().byId("smartTblUserManagement").getTable();
			// check if more than or less than 1 checkbox is checked
			var index,context,path,indexOfParentheses1,indexOfParentheses2;
			var selectedIndicesLength = this._oSmartTable.getSelectedIndices().length;
			if(selectedIndicesLength > 0){
				index = this._oSmartTable.getSelectedIndices();
				var ids = "";
				var idArr = [];
				var performFullList = false;
	
				for (var i = 0; i < index.length; i++)
				{
					context = this._oSmartTable.getContextByIndex(index[i]); 
					if(context !== undefined){
						path = context.getPath();
						indexOfParentheses1 = path.indexOf("(");
						indexOfParentheses2 = path.indexOf(")");
						ids = path.substring(indexOfParentheses1 + 2,indexOfParentheses2 - 1);
						idArr.push(ids);
					}
					else{
						//if undefined record is hit then stop and go do the full grab
						performFullList = true;
						break;
					}
				}
				//
				if (performFullList){
					idArr = [];
					var editSelection = this.getAllUsers();
					for (var j = 0; j < index.length; j++)
					{
						context = editSelection[index[j]]; 
						if(context !== undefined){
							idArr.push(context.ID);
						}
					}
				}
				//
				ids = ids.substring(0, ids.length - 1);
				var oSelectedUser = idArr;
				//add to model
				var oModel = new sap.ui.model.json.JSONModel(oSelectedUser);
				sap.ui.getCore().setModel(oModel);
				if(selectedIndicesLength === 1){
					this.getOwnerComponent().getRouter().navTo("editUserSingle");
				} 
				else{
					this.getOwnerComponent().getRouter().navTo("editUserMultiple");
				}
			}
			else
			{
				MessageBox.alert("Please select one user record for edit.",
					{
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});
			}
		},
		// function to get all the users
		getAllUsers : function () {
			var result;
			// Creating the array
			var filterArray = [];
			var sortArray = [];
			var aApplicationFilters = this._oSmartTable.getBinding().aApplicationFilters;
			for (var a = 0; a < aApplicationFilters.length; a++){
				filterArray.push(aApplicationFilters[a]);
			}
			// sorting
			var aSorters = this._oSmartTable.getBinding().aSorters;
			for (var i  = 0; i < aSorters.length; i++){
				sortArray.push(aSorters[i]);
			}
			this._oDataModel.read("/V_WEB_USER_ROLES",{
				filters: filterArray,
				sorters: sortArray,
				async: false,
		        success: function(oData, oResponse){
					result =  oData.results;
				},
				error: function(){
					MessageBox.alert("Unable to retreive values for edit. Please contact System Admin.",
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