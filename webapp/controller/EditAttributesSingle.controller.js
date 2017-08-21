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
	return Controller.extend("bam.controller.EditAttributesSingle", {
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
		    	oModel.setProperty("/STORED_CURRENCY_LIST",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddStoredCurrency")));
		    	oModel.setProperty("/IBP_RELEVANCY_LIST",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddIBPRelevancyFlag")));
		    	oModel.setProperty("/NETTING_DEFAULT_LIST",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddNettingDefaultFlag")));
		    	oModel.setProperty("/QUADRANT_LIST",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddQuadrant")));
		    	oModel.setProperty("/CHANNEL_LIST",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddChannel")));
		    	oModel.setProperty("/MARKET_DEFAULT_LIST",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddMarketDefault")));
		    	oModel.setProperty("/SUPPORT_SYSTEM_FLAG_LIST",DataContext.getDropdownValues(this._oi18nModel.getProperty("ddSupplySystemFlag")));
			    	
		    	// assign VM and VM data to a global variable for the page
				this._oGMIDShipToCountryUpdViewModel = oModel;            
				this._oViewModelData = this._oGMIDShipToCountryUpdViewModel.getData();
				
				if(firstTimePageLoad)
				{
					//attach _onRouteMatched to be called everytime on navigation to Edit Attributes Single page
					var oRouter = this.getRouter();
					oRouter.getRoute("editAttributesSingle").attachMatched(this._onRouteMatched, this);
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
				var sourceControl = oEvent.getSource();
				var sourceControlName = oEvent.getSource().getName();
				// call the method to check if any of the attribute value has been updated 
				if (this.validateAttributeValueChange(sourceControlName)){
					// if true set the value state to warning to highlight the change to the user
					sourceControl.setValueStateText("Attribute value changed");
					sourceControl.setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					// if false set the value state to none to remove highlight from the control
					sourceControl.setValueStateText("");
					sourceControl.setValueState(sap.ui.core.ValueState.None);
				}
			},
			// validate if the value of various attributes has been updated
			validateAttributeValueChange: function (sourceControlName){
				if ((sourceControlName === "ddlStoredCurrency" && this._oViewModelData.CURRENCY_CODE_ID_ORG != this._oViewModelData.CURRENCY_CODE_ID)
				|| (sourceControlName === "ddlIBPRelevancyFlag" && this._oViewModelData.IBP_RELEVANCY_CODE_ID_ORG != this._oViewModelData.IBP_RELEVANCY_CODE_ID)
				|| (sourceControlName === "ddlNettingDefaultFlag" && this._oViewModelData.NETTING_DEFAULT_CODE_ID_ORG != this._oViewModelData.NETTING_DEFAULT_CODE_ID)
				|| (sourceControlName === "ddlQuadrant" && this._oViewModelData.QUADRANT_CODE_ID_ORG != this._oViewModelData.QUADRANT_CODE_ID)
				|| (sourceControlName === "ddlChannel" && this._oViewModelData.CHANNEL_CODE_ID_ORG != this._oViewModelData.CHANNEL_CODE_ID)
				|| (sourceControlName === "ddlMarketDefaultFlag" && this._oViewModelData.MARKET_DEFAULT_CODE_ID_ORG != this._oViewModelData.MARKET_DEFAULT_CODE_ID)
				|| (sourceControlName === "ddlSupportSystemFlag" && this._oViewModelData.SUPPLY_SYSTEM_FLAG_CODE_ID_ORG != this._oViewModelData.SUPPLY_SYSTEM_FLAG_CODE_ID)
				|| (sourceControlName === "txtDemandAtt1" && this._oViewModelData.DEMAND_ATTRIBUTE1_ORG != this._oViewModelData.DEMAND_ATTRIBUTE1)
				|| (sourceControlName === "txtDemandAtt2" && this._oViewModelData.DEMAND_ATTRIBUTE2_ORG != this._oViewModelData.DEMAND_ATTRIBUTE2)
				|| (sourceControlName === "txtMktAtt1" && this._oViewModelData.MARKETING_ATTRIBUTE1_ORG != this._oViewModelData.MARKETING_ATTRIBUTE1)
				|| (sourceControlName === "txtMktAtt2" && this._oViewModelData.MARKETING_ATTRIBUTE2_ORG != this._oViewModelData.MARKETING_ATTRIBUTE2)
				|| (sourceControlName === "txtSupplyAtt1" && this._oViewModelData.SUPPLY_ATTRIBUTE1_ORG != this._oViewModelData.SUPPLY_ATTRIBUTE1)
				|| (sourceControlName === "txtSupplyAtt2" && this._oViewModelData.SUPPLY_ATTRIBUTE2_ORG != this._oViewModelData.SUPPLY_ATTRIBUTE2)
				){ 
					return true;
				}
				else{
					return false;
				}
			},
			//click of submit button
			onSubmit: function(){
				var curr = this;
				// Check if any Attributes have the comma or semicolon,
				// need to show message to use if either of these ( , or ;) are entered
			   //get the list of updated attributes where special characters are entered
			   var invalidCharUpdatedAttributes = curr.getInvalidCharUpdatedAttributes();
		  	   if (invalidCharUpdatedAttributes !== "")
		        {
		        	MessageBox.alert("Special characters comma and semi-colon are not allowed in " + invalidCharUpdatedAttributes + ".",
			        	{
			        		icon : MessageBox.Icon.ERROR,
							title : "Error"
			        	});
			        	return;
		        }
				var gmid = this._oViewModelData.GMID;
				var country = this._oViewModelData.COUNTRY;
				// check if user wants to update the attributes for GMID and country
				MessageBox.confirm("Highlighted attributes will be updated for GMID " + gmid + " and country " + country + ". Continue?", {
            		icon: sap.m.MessageBox.Icon.WARNING,
            		actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            		onClose: function(oAction) {
            			curr.fnCallbackSubmitConfirm(oAction);
            		}
        		});
			},
			//get the list of  attributes in string format where invalid characters has been entered
			getInvalidCharUpdatedAttributes: function(){
				// get the crop protection and seeds value from i18n file
		    	var oi18nModel = this.getView().getModel("i18n");
				var invalidCharacterAttributesString = "";
				if (this.getView().byId("txtDemandAtt1").getValue().indexOf(",") >= 0 || this.getView().byId("txtDemandAtt1").getValue().indexOf(";") >= 0){
					invalidCharacterAttributesString += oi18nModel.getProperty("demandAtt1");
					invalidCharacterAttributesString += ", ";
				}
				if (this.getView().byId("txtDemandAtt2").getValue().indexOf(",") >= 0 || this.getView().byId("txtDemandAtt2").getValue().indexOf(";") >= 0){
					invalidCharacterAttributesString += oi18nModel.getProperty("demandAtt2");
					invalidCharacterAttributesString += ", ";
				}
				if (this.getView().byId("txtMktAtt1").getValue().indexOf(",") >= 0 || this.getView().byId("txtMktAtt1").getValue().indexOf(";") >= 0){
					invalidCharacterAttributesString += oi18nModel.getProperty("mktAtt1");
					invalidCharacterAttributesString += ", ";
				}
				if (this.getView().byId("txtMktAtt2").getValue().indexOf(",") >= 0 || this.getView().byId("txtMktAtt2").getValue().indexOf(";") >= 0){
					invalidCharacterAttributesString += oi18nModel.getProperty("mktAtt2");
					invalidCharacterAttributesString += ", ";
				}
				if (this.getView().byId("txtSupplyAtt1").getValue().indexOf(",") >= 0 || this.getView().byId("txtSupplyAtt1").getValue().indexOf(";") >= 0){
					invalidCharacterAttributesString += oi18nModel.getProperty("supplyAtt1");
					invalidCharacterAttributesString += ", ";
				}
				if (this.getView().byId("txtSupplyAtt2").getValue().indexOf(",") >= 0 || this.getView().byId("txtSupplyAtt2").getValue().indexOf(";") >= 0){
					invalidCharacterAttributesString += oi18nModel.getProperty("supplyAtt2");
					invalidCharacterAttributesString += ", ";
				}
				return invalidCharacterAttributesString.substring(0, invalidCharacterAttributesString.length - 2);
			},
			// update the attributes based on user response
			fnCallbackSubmitConfirm: function(oAction){
				var curr = this;
				//if user confirmed to update the attributes, prepare the object and update the attributes for the GMID and country
				//else do nothing
				if (oAction === "YES") {
					// Create current timestamp
			    	var oDate = new Date();
			    	var country = this._oViewModelData.COUNTRY;
					// create updated GMIDShipToCountry object
					var updGMIDCountry = {
								ID: this._oEditAttributesID,
					        	GMID: this._oViewModelData.GMID,
					        	COUNTRY_CODE_ID: parseInt(this._oViewModelData.COUNTRY_CODE_ID,10),
					        	TYPE:this._oViewModelData.TYPE,
					        	CURRENCY_CODE_ID: parseInt(this._oViewModelData.CURRENCY_CODE_ID,10),
					        	IBP_RELEVANCY_CODE_ID: parseInt(this._oViewModelData.IBP_RELEVANCY_CODE_ID,10),
					        	NETTING_DEFAULT_CODE_ID: parseInt(this._oViewModelData.NETTING_DEFAULT_CODE_ID,10),
					        	QUADRANT_CODE_ID:parseInt(this._oViewModelData.QUADRANT_CODE_ID,10),
					        	CHANNEL_CODE_ID: parseInt(this._oViewModelData.CHANNEL_CODE_ID,10),
					        	MARKET_DEFAULT_CODE_ID: parseInt(this._oViewModelData.MARKET_DEFAULT_CODE_ID,10),
					        	SUPPLY_SYSTEM_FLAG_CODE_ID: parseInt(this._oViewModelData.SUPPLY_SYSTEM_FLAG_CODE_ID,10),
					        	DEMAND_ATTRIBUTE1: this._oViewModelData.DEMAND_ATTRIBUTE1,
					        	DEMAND_ATTRIBUTE2: this._oViewModelData.DEMAND_ATTRIBUTE2,
					        	MARKETING_ATTRIBUTE1: this._oViewModelData.MARKETING_ATTRIBUTE1,
					        	MARKETING_ATTRIBUTE2: this._oViewModelData.MARKETING_ATTRIBUTE2,
					        	SUPPLY_ATTRIBUTE1: this._oViewModelData.SUPPLY_ATTRIBUTE1,
					        	SUPPLY_ATTRIBUTE2: this._oViewModelData.SUPPLY_ATTRIBUTE2,
					        	FINANCE_SYSTEM_FLAG_CODE_ID: this._oViewModelData.FINANCE_SYSTEM_FLAG_CODE_ID,
					        	GMID_COUNTRY_STATUS_CODE_ID:this._oViewModelData.GMID_COUNTRY_STATUS_CODE_ID,
					        	CREATED_BY:this._oViewModelData.CREATED_BY,
					        	CREATED_ON:this._oViewModelData.CREATED_ON,
					        	LAST_UPDATED_BY: loggedInUserID,
					        	LAST_UPDATED_ON: oDate,
					        	COMMENTS:this._oViewModelData.COMMENTS
			    	};
			    
					this._oDataModel.update("/GMID_SHIP_TO_COUNTRY("+this._oEditAttributesID+")", updGMIDCountry,
			        {
			        	// show success alert to the user
					    success: function(){
							MessageBox.alert("Attributes for GMID " + updGMIDCountry.GMID + " and country " + country + " updated successfully.",
								{
									icon : MessageBox.Icon.SUCCESS,
									title : "Success",
									onClose: function() {
            							curr.getOwnerComponent().getRouter().navTo("maintainAttributes");
            						}
							});
						},
						// show error alert to the user
						error: function(oError){
							MessageBox.alert("Error updating attributes for GMID " + updGMIDCountry.GMID + " and country " + country + ".",
								{
									icon : MessageBox.Icon.ERROR,
									title : "Error"
							});
						}
			        });
				}
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
            				curr.getOwnerComponent().getRouter().navTo("maintainAttributes");
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
					oRouter.navTo("maintainAttributes", true);
				}
			}
  	});
});