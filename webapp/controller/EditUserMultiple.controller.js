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
            //
            this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
            // Loading Dropdown
            var roleList = DataContext.getDropdownValues(this._oi18nModel.getProperty("ddRole"));
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
	    		this.setPageToInitialState();
				//get current list of ids from model
		    	var core = sap.ui.getCore();
		    	var globalModel = core.getModel();
		    	globalIds = globalModel.getData();  
				this.setUserDefaultVM(globalIds);
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
		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf bam.view.EditUserMultiple
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf bam.view.EditUserMultiple
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf bam.view.EditUserMultiple
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf bam.view.EditUserMultiple
		 */
		//	onExit: function() {
		//
		//	}

	});

});