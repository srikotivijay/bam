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
	return Controller.extend("bam.controller.EditCURules", {
			onInit : function () {
				
				// Get logged in user id
				loggedInUserID = DataContext.getUserID();
				
	    		// Create model and set it to initial data
	    		var oModel = new sap.ui.model.json.JSONModel();
	    		this.getView().setModel(oModel);
	    		var curr = this;
	    		var promise = new Promise(function(resolve, reject) {
					DataContext.getAttributeListBasedOnUserID()
					.then(function(data) {
						attributeList = data;
						// code to show/hide the controls on the UI
						curr.setVMForControlVisibility();
					});
				});
				
				this._oi18nModel = new ResourceModel({
                	bundleName: "bam.i18n.i18n"
            	});

				this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
				
				 // set all the dropdowns, get the data from the code master table
		    	oModel.setProperty("/AssignRuleVM/RCU",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddlCU")));
		    	oModel.setProperty("/AssignRuleVM/SubRCU",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddlSubCU")));
		    	
			    	
		    	// assign VM and VM data to a global variable for the page
				this._oGMIDShipToCountryUpdViewModel = oModel;            
				this._oViewModelData = this._oGMIDShipToCountryUpdViewModel.getData();
				
				if(firstTimePageLoad)
				{
					//attach _onRouteMatched to be called everytime on navigation to Edit Attributes Single page
					var oRouter = this.getRouter();
					oRouter.getRoute("editCURules").attachMatched(this._onRouteMatched, this);
					firstTimePageLoad = false;
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
					this.setPageToInitialState();
					this._oEditAttributesID = oEvent.getParameter("arguments").editAttributesID;
					this.setSelectedGMIDCountryVM();
				}
			},
			showControl: function(value){
				return !!value;
			},
			// add properties in view model to set the visibility of controls on basis of the user role
			setVMForControlVisibility: function(){
				var oModel = this._oGMIDShipToCountryUpdViewModel;
				//set the control show/hide values
		    	oModel.setProperty("/SHOW_CURRENCY",this.checkPermission('CURRENCY'));
			    oModel.setProperty("/SHOW_IBP_RELEVANCY",this.checkPermission('IBP_RELEVANCY'));
			    oModel.setProperty("/SHOW_NETTING_DEFAULT",this.checkPermission('NETTING_DEFAULT'));
			    oModel.setProperty("/SHOW_QUADRANT",this.checkPermission('QUADRANT'));
			    oModel.setProperty("/SHOW_CHANNEL",this.checkPermission('CHANNEL'));
			    oModel.setProperty("/SHOW_MARKET_DEFAULT",this.checkPermission('MARKET_DEFAULT'));
			    oModel.setProperty("/SHOW_SUPPLY_SYSTEM_FLAG",this.checkPermission('SUPPLY_SYSTEM'));
			    oModel.setProperty("/SHOW_DEMAND_ATTRIBUTE1",this.checkPermission('DEMAND_ATTRIBUTE1'));
			    oModel.setProperty("/SHOW_DEMAND_ATTRIBUTE2",this.checkPermission('DEMAND_ATTRIBUTE2'));
			    oModel.setProperty("/SHOW_MARKETING_ATTRIBUTE1",this.checkPermission('MARKETING_ATTRIBUTE1'));
			    oModel.setProperty("/SHOW_MARKETING_ATTRIBUTE2",this.checkPermission('MARKETING_ATTRIBUTE2'));
			    oModel.setProperty("/SHOW_SUPPLY_ATTRIBUTE1",this.checkPermission('SUPPLY_ATTRIBUTE1'));
				oModel.setProperty("/SHOW_SUPPLY_ATTRIBUTE2",this.checkPermission('SUPPLY_ATTRIBUTE2'));	
			},
			checkPermission: function(attribute){
				return attributeList.includes(attribute);
			},
			// set the page to initial state
			// clear the value state and value state text for all controls
			setPageToInitialState: function(){
				this.getView().byId("ddlStoredCurrency").setValueStateText("");
				this.getView().byId("ddlStoredCurrency").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("ddlIBPRelevancyFlag").setValueStateText("");
				this.getView().byId("ddlIBPRelevancyFlag").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("ddlNettingDefaultFlag").setValueStateText("");
				this.getView().byId("ddlNettingDefaultFlag").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("ddlQuadrant").setValueStateText("");
				this.getView().byId("ddlQuadrant").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("ddlChannel").setValueStateText("");
				this.getView().byId("ddlChannel").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("ddlMarketDefaultFlag").setValueStateText("");
				this.getView().byId("ddlMarketDefaultFlag").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("ddlSupportSystemFlag").setValueStateText("");
				this.getView().byId("ddlSupportSystemFlag").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("txtDemandAtt1").setValueStateText("");
				this.getView().byId("txtDemandAtt1").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("txtDemandAtt2").setValueStateText("");
				this.getView().byId("txtDemandAtt2").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("txtMktAtt1").setValueStateText("");
				this.getView().byId("txtMktAtt1").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("txtMktAtt2").setValueStateText("");
				this.getView().byId("txtMktAtt2").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("txtSupplyAtt1").setValueStateText("");
				this.getView().byId("txtSupplyAtt1").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("txtSupplyAtt2").setValueStateText("");
				this.getView().byId("txtSupplyAtt2").setValueState(sap.ui.core.ValueState.None);
			},
			// set the selected GMID Country's view model
			setSelectedGMIDCountryVM: function(){
				var oModel = this._oGMIDShipToCountryUpdViewModel;
				if(this._oEditAttributesID !== undefined){
					// Get the GMID-Country combination that is to be edited from GMID_SHIP_TO_COUNTRY table
					// Create a filter array
					var gmidCountryFilterArray = [];
					var gmidCountryFilter = new Filter("ID",sap.ui.model.FilterOperator.EQ, this._oEditAttributesID);
					gmidCountryFilterArray.push(gmidCountryFilter);
					 
					this._oDataModel.read("/GMID_SHIP_TO_COUNTRY",{
					 	filters: gmidCountryFilterArray,
					 	async: false,
		                success: function(oData, oResponse){
			                var selDataVal  = oData.results.pop();
			                oModel.setProperty("/GMID",selDataVal.GMID);
			                oModel.setProperty("/COUNTRY_CODE_ID",selDataVal.COUNTRY_CODE_ID);
			                oModel.setProperty("/CURRENCY_CODE_ID_ORG",selDataVal.CURRENCY_CODE_ID);
			                oModel.setProperty("/CURRENCY_CODE_ID",selDataVal.CURRENCY_CODE_ID);
			                oModel.setProperty("/IBP_RELEVANCY_CODE_ID_ORG",selDataVal.IBP_RELEVANCY_CODE_ID);
			                oModel.setProperty("/IBP_RELEVANCY_CODE_ID",selDataVal.IBP_RELEVANCY_CODE_ID);
			                oModel.setProperty("/NETTING_DEFAULT_CODE_ID_ORG",selDataVal.NETTING_DEFAULT_CODE_ID);
			                oModel.setProperty("/NETTING_DEFAULT_CODE_ID",selDataVal.NETTING_DEFAULT_CODE_ID);
			                oModel.setProperty("/QUADRANT_CODE_ID_ORG",selDataVal.QUADRANT_CODE_ID);
			                oModel.setProperty("/QUADRANT_CODE_ID",selDataVal.QUADRANT_CODE_ID);
			                oModel.setProperty("/CHANNEL_CODE_ID_ORG",selDataVal.CHANNEL_CODE_ID);
			                oModel.setProperty("/CHANNEL_CODE_ID",selDataVal.CHANNEL_CODE_ID);
			                oModel.setProperty("/MARKET_DEFAULT_CODE_ID_ORG",selDataVal.MARKET_DEFAULT_CODE_ID);
			                oModel.setProperty("/MARKET_DEFAULT_CODE_ID",selDataVal.MARKET_DEFAULT_CODE_ID);
			                oModel.setProperty("/SUPPLY_SYSTEM_FLAG_CODE_ID_ORG",selDataVal.SUPPLY_SYSTEM_FLAG_CODE_ID);
			                oModel.setProperty("/SUPPLY_SYSTEM_FLAG_CODE_ID",selDataVal.SUPPLY_SYSTEM_FLAG_CODE_ID);
			                oModel.setProperty("/DEMAND_ATTRIBUTE1_ORG",selDataVal.DEMAND_ATTRIBUTE1);
			                oModel.setProperty("/DEMAND_ATTRIBUTE1",selDataVal.DEMAND_ATTRIBUTE1);
			                oModel.setProperty("/DEMAND_ATTRIBUTE2_ORG",selDataVal.DEMAND_ATTRIBUTE2);
			                oModel.setProperty("/DEMAND_ATTRIBUTE2",selDataVal.DEMAND_ATTRIBUTE2);
			                oModel.setProperty("/MARKETING_ATTRIBUTE1_ORG",selDataVal.MARKETING_ATTRIBUTE1);
			                oModel.setProperty("/MARKETING_ATTRIBUTE1",selDataVal.MARKETING_ATTRIBUTE1);
			                oModel.setProperty("/MARKETING_ATTRIBUTE2_ORG",selDataVal.MARKETING_ATTRIBUTE2);
			                oModel.setProperty("/MARKETING_ATTRIBUTE2",selDataVal.MARKETING_ATTRIBUTE2);
			                oModel.setProperty("/SUPPLY_ATTRIBUTE1_ORG",selDataVal.SUPPLY_ATTRIBUTE1);
			                oModel.setProperty("/SUPPLY_ATTRIBUTE1",selDataVal.SUPPLY_ATTRIBUTE1);
			                oModel.setProperty("/SUPPLY_ATTRIBUTE2_ORG",selDataVal.SUPPLY_ATTRIBUTE2);
			                oModel.setProperty("/SUPPLY_ATTRIBUTE2",selDataVal.SUPPLY_ATTRIBUTE2);
			                //set additional fields to the model
			                oModel.setProperty("/TYPE",selDataVal.TYPE);
			                oModel.setProperty("/CREATED_ON",selDataVal.CREATED_ON);
			                oModel.setProperty("/CREATED_BY",selDataVal.CREATED_BY);
			                oModel.setProperty("/GMID_COUNTRY_STATUS_CODE_ID",selDataVal.GMID_COUNTRY_STATUS_CODE_ID);
			                oModel.setProperty("/FINANCE_SYSTEM_FLAG_CODE_ID",selDataVal.FINANCE_SYSTEM_FLAG_CODE_ID);
			                oModel.setProperty("/COMMENTS",selDataVal.COMMENTS);
		                },
		    		    error: function(){
		            		MessageToast.show("Unable to retrieve selected GMID/Country record.");
		    			}
		    		});
		    		
		    		// Get the Country Label
					// Create a filter array
					var countryFilterArray = [];
					var countryFilter = new Filter("ID",sap.ui.model.FilterOperator.EQ,oModel.getProperty("/COUNTRY_CODE_ID"));
					countryFilterArray.push(countryFilter);
					// Get the selected country record from the CODE_MASTER table
					this._oDataModel.read("/CODE_MASTER",{
							filters: countryFilterArray,
							async: false,
			                success: function(oData, oResponse){
				                // Bind the Country data to the GMIDShipToCountry model
				                oModel.setProperty("/COUNTRY",oData.results.pop().LABEL);
			                },
			    		    error: function(){
			            		MessageToast.show("Unable to retrieve countries.");
			    			}
			    	});
				}
			},
			onChange: function(oEvent){
				
			},
			//click of submit button
			onSubmit: function(){
				
			},
			//cancel click on edit attributes page
			onCancel: function(){
				var curr = this;
				// check if user wants to update the attributes for GMID and country
				MessageBox.confirm("Are you sure you want to cancel your changes and navigate back to the previous page?", {
            		icon: sap.m.MessageBox.Icon.WARNING,
            		actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            		onClose: function(oAction) {
            			if(oAction === "YES"){
            				curr.getOwnerComponent().getRouter().navTo("cuAssignment");
            			}
            		}
        		});
			},
			//navigate back from edit page
			onNavBack: function () {
				var oHistory = History.getInstance();
				var sPreviousHash = oHistory.getPreviousHash();
	
				if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("cuAssignment", true);
				}
			}
  	});
});