sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/Filter",
		"sap/ui/core/routing/History"
	], function (Controller, JSONModel, MessageToast, MessageBox, ResourceModel,Filter,History) {
		"use strict";

	return Controller.extend("bam.controller.EditAttributesMultiple", {
		onInit : function () {
			this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
				
	    	//	Create model and set it to initial data
	    	var oModel = new sap.ui.model.json.JSONModel();
	    	this.getView().setModel(oModel);
	    		
		    //	Bind Stored Currency dropdown
			//	Create a filter & sorter array
			var storedcurrencyFilterArray = [];
			var storedcurrencyFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"CURRENCY");
			storedcurrencyFilterArray.push(storedcurrencyFilter);
			var storedcurrencySortArray = [];
			var storedcurrencySort = new sap.ui.model.Sorter("LABEL",false);
			storedcurrencySortArray.push(storedcurrencySort);
			// Get the Stored Currency dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
				filters: storedcurrencyFilterArray,
				sorters: storedcurrencySortArray,
				async: false,
		        success: function(oData, oResponse){
		        	// add empty item on top of the list
		            oData.results.unshift({	"ID":-1,
		            						"LABEL":""});
			        // Bind the Stored Currency data list to view model
			        oModel.setProperty("/STORED_CURRENCY_LIST",oData.results);
		        },
		    	error: function(){
		            MessageToast.show("Unable to retrieve currencies.");
		    	}
		    });
		    		
		    // Bind IBP Relavancy dropdown
			// Create a filter & sorter array
			var ibprelevancyFilterArray = [];
			var ibprelevancyFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"IBP_RELEVANCY");
			ibprelevancyFilterArray.push(ibprelevancyFilter);
			var ibprelevancySortArray = [];
			var ibprelevancySort = new sap.ui.model.Sorter("LABEL",false);
			ibprelevancySortArray.push(ibprelevancySort);
			// Get the IBP Relevancy dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
				filters: ibprelevancyFilterArray,
				sorters: ibprelevancySortArray,
				async: false,
		        success: function(oData, oResponse){
		         	// add empty item on top of the list
		            oData.results.unshift({	"ID":-1,
		           							"LABEL":""});
		           	// Bind the IBP Relevancy data list to view model
			        oModel.setProperty("/IBP_RELEVANCY_LIST",oData.results);
		        },
		    	error: function(){
		        	MessageToast.show("Unable to retrieve IBP Relevancy data.");
		    	}
		    });
		    		
		    // Bind Netting Default dropdown
			// Create a filter & sorter array
			var nettingdefaultFilterArray = [];
			var nettingdefaultFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"NETTING_DEFAULT");
			nettingdefaultFilterArray.push(nettingdefaultFilter);
			var nettingdefaultSortArray = [];
			var nettingdefaultSort = new sap.ui.model.Sorter("LABEL",false);
			nettingdefaultSortArray.push(nettingdefaultSort);
			// Get the Netting Default dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
				filters: nettingdefaultFilterArray,
				sorters: nettingdefaultSortArray,
				async: false,
		        success: function(oData, oResponse){
		            // add empty item on top of the list
		             oData.results.unshift({"ID":-1,
		              						"LABEL":""});
			        // Bind the Netting Default list to view model
			        oModel.setProperty("/NETTING_DEFAULT_LIST",oData.results);
		        },
		    	error: function(){
		            MessageToast.show("Unable to retrieve netting default data.");
		    	}
		   	});
		    		
		    // Bind Quadrant dropdown
			// Create a filter & sorter array
			var quadrantFilterArray = [];
			var quadrantFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"QUADRANT");
			quadrantFilterArray.push(quadrantFilter);
			var quadrantSortArray = [];
			var quadrantSort = new sap.ui.model.Sorter("LABEL",false);
			quadrantSortArray.push(quadrantSort);
			// Get the Quadrant dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
				filters: quadrantFilterArray,
				sorters: quadrantSortArray,
				async: false,
		        success: function(oData, oResponse){
		        	// add empty item on top of the list
		            oData.results.unshift({	"ID":-1,
		              						"LABEL":""});
			        // Bind the Quadrant data list to view model
			        oModel.setProperty("/QUADRANT_LIST",oData.results);
		        },
		    	error: function(){
		        	MessageToast.show("Unable to retrieve quadrant data.");
		    	}
		    });
		    		
		    // Bind Channel dropdown
			// Create a filter & sorter array
			var channelFilterArray = [];
			var channelFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"CHANNEL");
			channelFilterArray.push(channelFilter);
			var channelSortArray = [];
			var channelSort = new sap.ui.model.Sorter("LABEL",false);
			channelSortArray.push(channelSort);
			// Get the Channel dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
				filters: channelFilterArray,
				sorters: channelSortArray,
				async: false,
		        success: function(oData, oResponse){
		            // add empty item on top of the list
		            oData.results.unshift({	"ID":-1,
		            						"LABEL":""});
			        // Bind the Channel data list to view model
			        oModel.setProperty("/CHANNEL_LIST",oData.results);
		        },
		    	error: function(){
		        	MessageToast.show("Unable to retrieve channel data.");
		    	}
		    });
		    		
		    // Bind Market Default dropdown
			// Create a filter & sorter array
			var marketdefaultFilterArray = [];
			var marketdefaultFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"MARKET_DEFAULT");
			marketdefaultFilterArray.push(marketdefaultFilter);
			var marketdefaultSortArray = [];
			var marketdefaultSort = new sap.ui.model.Sorter("LABEL",false);
			marketdefaultSortArray.push(marketdefaultSort);
			// Get the Market Default dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
				filters: marketdefaultFilterArray,
				sorters: marketdefaultSortArray,
				async: false,
		        success: function(oData, oResponse){
		        	// add empty item on top of the list
		        	oData.results.unshift({	"ID":-1,
		        							"LABEL":""});
			    	// Bind the Market Default data list to view model
			    	oModel.setProperty("/MARKET_DEFAULT_LIST",oData.results);
		        },
		    	error: function(){
		           	MessageToast.show("Unable to retrieve market default data.");
		    	}
		    });
		    	
		    // Bind Supply System Flag dropdown
			// Create a filter & sorter array
			var supplySystemFilterArray = [];
			var supplySystemFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,"SUPPLY_SYSTEM_FLAG");
			supplySystemFilterArray.push(supplySystemFilter);
			var supplySystemSortArray = [];
			var supplySystemSort = new sap.ui.model.Sorter("LABEL",false);
			supplySystemSortArray.push(supplySystemSort);
			// Get the Supply System Flag dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
				filters: supplySystemFilterArray,
				sorters: supplySystemSortArray,
				async: false,
		        success: function(oData, oResponse){
		        	// add empty item on top of the list
		            oData.results.unshift({	"ID":-1,
		            						"LABEL":""});
			        // Bind the Support System data list to view model
			        oModel.setProperty("/SUPPORT_SYSTEM_FLAG_LIST",oData.results);
		        },
		    	error: function(){
		            MessageToast.show("Unable to retrieve supply system flag data.");
		    	}
		    });
		    	
		 	// assign VM and VM data to a global variable for the page
			this._oGMIDShipToCountryUpdViewModel = oModel;            
			this._oViewModelData = this._oGMIDShipToCountryUpdViewModel.getData();
				
		    //attach _onRouteMatched to be called everytime on navigation to Edit Attributes Multiple page
			var oRouter = this.getRouter();
			oRouter.getRoute("editAttributesMultiple").attachMatched(this._onRouteMatched, this);
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		//	get the paramter values and set the view model according to it
		_onRouteMatched : function (oEvent) {
			this.setPageToInitialState();
			var editAttributesIDs = oEvent.getParameter("arguments").editAttributesIDs.split(",");
			this.setGMIDCountryDefaultVM(editAttributesIDs);
		},
		// set the default view model for multiple GMID Country combinations' edit page
		setGMIDCountryDefaultVM: function(editAttributesIDs){
			var initData = [];
			for (var i = 0; i < editAttributesIDs.length; i++) {
	    		initData.push({
	    			ID:editAttributesIDs[i]
	    		});
			}
			this._oGMIDShipToCountryUpdViewModel.setProperty("/EDIT_ATTRIBUTES_ID_LIST",initData);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/CURRENCY_CODE_ID", -1);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/IBP_RELEVANCY_CODE_ID",  -1);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/NETTING_DEFAULT_CODE_ID", -1);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/QUADRANT_CODE_ID", -1);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/CHANNEL_CODE_ID", -1);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/MARKET_DEFAULT_CODE_ID", -1);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/SUPPLY_SYSTEM_FLAG_CODE_ID",  -1);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/DEMAND_ATTRIBUTE1",  undefined);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/NULLIFY_DEMAND_ATTRIBUTE1",  false);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/DEMAND_ATTRIBUTE2", undefined);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/NULLIFY_DEMAND_ATTRIBUTE2",  false);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/MARKETING_ATTRIBUTE1", undefined);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/NULLIFY_MARKETING_ATTRIBUTE1",  false);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/MARKETING_ATTRIBUTE2", undefined);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/NULLIFY_MARKETING_ATTRIBUTE2",  false);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/SUPPLY_ATTRIBUTE1", undefined);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/NULLIFY_SUPPLY_ATTRIBUTE1",  false);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/SUPPLY_ATTRIBUTE2", undefined);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/NULLIFY_SUPPLY_ATTRIBUTE2",  false);
			this._oGMIDShipToCountryUpdViewModel.setProperty("/GMID_COUNTRY_COUNT",editAttributesIDs.length);
		},
		//set the page to initial state
		//clear the value state and value state text for all controls
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
			this.getView().byId("txtDemandAtt1").setEnabled(true);          
			this.getView().byId("txtDemandAtt2").setValueStateText("");
			this.getView().byId("txtDemandAtt2").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("txtDemandAtt2").setEnabled(true);     
			this.getView().byId("txtMktAtt1").setValueStateText("");
			this.getView().byId("txtMktAtt1").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("txtMktAtt1").setEnabled(true);     
			this.getView().byId("txtMktAtt2").setValueStateText("");
			this.getView().byId("txtMktAtt2").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("txtMktAtt2").setEnabled(true);     
			this.getView().byId("txtSupplyAtt1").setValueStateText("");
			this.getView().byId("txtSupplyAtt1").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("txtSupplyAtt1").setEnabled(true);     
			this.getView().byId("txtSupplyAtt2").setValueStateText("");
			this.getView().byId("txtSupplyAtt2").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("txtSupplyAtt2").setEnabled(true);   
		},
		// update textbox attributes to empty if remove value check box is checked
		onChecked : function(oEvent) {
			var sourceControlName = oEvent.getSource().getName();
			var isChecked = oEvent.getParameter("selected");
			// if check box is checked then clear the value of the attributes else dont do anything
			// depending on Id clear the text areas of the attributes
			if (sourceControlName === "chkDemandAtt1")
			{	
				if(isChecked){
					this.getView().byId("txtDemandAtt1").setValue(undefined);
					this.getView().byId("txtDemandAtt1").setEnabled(false);
					this.getView().byId("txtDemandAtt1").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("txtDemandAtt1").setEnabled(true);
					this.getView().byId("txtDemandAtt1").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if(sourceControlName === "chkDemandAtt2")
			{
				if(isChecked){
					this.getView().byId("txtDemandAtt2").setValue(undefined);
					this.getView().byId("txtDemandAtt2").setEnabled(false);
					this.getView().byId("txtDemandAtt2").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("txtDemandAtt2").setEnabled(true);
					this.getView().byId("txtDemandAtt2").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if(sourceControlName === "chkMktAtt1")
			{
				if(isChecked){
					this.getView().byId("txtMktAtt1").setValue(undefined);
					this.getView().byId("txtMktAtt1").setEnabled(false);
					this.getView().byId("txtMktAtt1").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("txtMktAtt1").setEnabled(true);
					this.getView().byId("txtMktAtt1").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if(sourceControlName === "chkMktAtt2")
			{
				if(isChecked){
					this.getView().byId("txtMktAtt2").setValue(undefined);
					this.getView().byId("txtMktAtt2").setEnabled(false);
					this.getView().byId("txtMktAtt2").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("txtMktAtt2").setEnabled(true);
					this.getView().byId("txtMktAtt2").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if(sourceControlName === "chkSupplyAtt1")
			{
				if(isChecked){
					this.getView().byId("txtSupplyAtt1").setValue(undefined);
					this.getView().byId("txtSupplyAtt1").setEnabled(false);
					this.getView().byId("txtSupplyAtt1").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("txtSupplyAtt1").setEnabled(true);
					this.getView().byId("txtSupplyAtt1").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if(sourceControlName === "chkSupplyAtt2")
			{
				if(isChecked){
					this.getView().byId("txtSupplyAtt2").setValue(undefined);
					this.getView().byId("txtSupplyAtt2").setEnabled(false);
					this.getView().byId("txtSupplyAtt2").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("txtSupplyAtt2").setEnabled(true);
					this.getView().byId("txtSupplyAtt2").setValueState(sap.ui.core.ValueState.None);
				}
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
		//validate if the value of various attributes has been updated
		validateAttributeValueChange: function (sourceControlName){
			var type = sourceControlName.substring(0,3);
			if((type === "ddl" && this.getView().byId(sourceControlName).getSelectedKey() !== "-1") || (type === "txt" && this.getView().byId(sourceControlName).getValue().trim() !== "")){
				return true;
			}
			else{
				return false;
			}
		},
		//get the list of updated attributes in string format
		getUpdatedAttributes: function(){
			// get the crop protection and seeds value from i18n file
	    	var oi18nModel = this.getView().getModel("i18n");
			var updatedAttributesString = "";
			if (this.validateAttributeValueChange("ddlStoredCurrency")){
				updatedAttributesString += oi18nModel.getProperty("storedCurrency");
				updatedAttributesString += ", ";
			}
			if (this.validateAttributeValueChange("ddlIBPRelevancyFlag")){
				updatedAttributesString += oi18nModel.getProperty("ibpRelevancy");
				updatedAttributesString += ", ";
			}
			if (this.validateAttributeValueChange("ddlNettingDefaultFlag")){
				updatedAttributesString += oi18nModel.getProperty("nettingDefault");
				updatedAttributesString += ", ";
			}
			if (this.validateAttributeValueChange("ddlQuadrant")){
				updatedAttributesString += oi18nModel.getProperty("quadrant");
				updatedAttributesString += ", ";
			}
			if (this.validateAttributeValueChange("ddlChannel")){
				updatedAttributesString += oi18nModel.getProperty("channel");
				updatedAttributesString += ", ";
			}
			if (this.validateAttributeValueChange("ddlMarketDefaultFlag")){
				updatedAttributesString += oi18nModel.getProperty("marketDefault");
				updatedAttributesString += ", ";
			}
			if (this.validateAttributeValueChange("ddlSupportSystemFlag")){
				updatedAttributesString += oi18nModel.getProperty("supplySystemFlag");
				updatedAttributesString += ", ";
			}
			if (this.getView().byId("chkDemandAtt1").getSelected() || this.validateAttributeValueChange("txtDemandAtt1")){
				updatedAttributesString += oi18nModel.getProperty("demandAtt1");
				updatedAttributesString += ", ";
			}
			if (this.getView().byId("chkDemandAtt2").getSelected() || this.validateAttributeValueChange("txtDemandAtt2")){
				updatedAttributesString += oi18nModel.getProperty("demandAtt2");
				updatedAttributesString += ", ";
			}
			if (this.getView().byId("chkMktAtt1").getSelected() || this.validateAttributeValueChange("txtMktAtt1")){
				updatedAttributesString += oi18nModel.getProperty("mktAtt1");
				updatedAttributesString += ", ";
			}
			if (this.getView().byId("chkMktAtt2").getSelected() || this.validateAttributeValueChange("txtMktAtt2")){
				updatedAttributesString += oi18nModel.getProperty("mktAtt2");
				updatedAttributesString += ", ";
			}
			if (this.getView().byId("chkSupplyAtt1").getSelected() || this.validateAttributeValueChange("txtSupplyAtt1")){
				updatedAttributesString += oi18nModel.getProperty("supplyAtt1");
				updatedAttributesString += ", ";
			}
			if (this.getView().byId("chkSupplyAtt2").getSelected() || this.validateAttributeValueChange("txtSupplyAtt2")){
				updatedAttributesString += oi18nModel.getProperty("supplyAtt2");
				updatedAttributesString += ", ";
			}
			return updatedAttributesString.substring(0, updatedAttributesString.length - 2);
		},
		//click of submit button
		onSubmit: function(){
			var curr = this;
			//get the list of updated attributes
			var updatedAttributesList = curr.getUpdatedAttributes();
			// check if there are any changes to be updated
			if (updatedAttributesList !== ""){
				// check if user wants to update the attributes for GMID and country
				MessageBox.confirm((updatedAttributesList + " attributes will be updated for " + curr._oViewModelData.GMID_COUNTRY_COUNT + " GMID Country combinations. Continue?"), {
	    			icon: sap.m.MessageBox.Icon.WARNING,
	    			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
	          		onClose: function(oAction) {
	          			var editAttrIDList = curr._oViewModelData.EDIT_ATTRIBUTES_ID_LIST;
	        			curr.fnCallbackSubmitConfirm(oAction, editAttrIDList);
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
		//create object of updated attributes only
		createUpdateObject: function(){
			// Create current timestamp
			var oDate = new Date();
			var updGMIDCountry = {
			    		LAST_UPDATED_BY: null,
					    LAST_UPDATED_ON: oDate
			    	};
			if(this._oViewModelData.CURRENCY_CODE_ID != -1){
			   	updGMIDCountry.CURRENCY_CODE_ID = parseInt(this._oViewModelData.CURRENCY_CODE_ID,10);
			}
			if(this._oViewModelData.IBP_RELEVANCY_CODE_ID != -1){
			   	updGMIDCountry.IBP_RELEVANCY_CODE_ID = parseInt(this._oViewModelData.IBP_RELEVANCY_CODE_ID,10);
			}
			if(this._oViewModelData.NETTING_DEFAULT_CODE_ID != -1){
			   	updGMIDCountry.NETTING_DEFAULT_CODE_ID = parseInt(this._oViewModelData.NETTING_DEFAULT_CODE_ID,10);
			}
			if(this._oViewModelData.QUADRANT_CODE_ID != -1){
			   	updGMIDCountry.QUADRANT_CODE_ID = parseInt(this._oViewModelData.QUADRANT_CODE_ID,10);
			}
			if(this._oViewModelData.CHANNEL_CODE_ID != -1){
			   	updGMIDCountry.CHANNEL_CODE_ID = parseInt(this._oViewModelData.CHANNEL_CODE_ID,10);
			}
			if(this._oViewModelData.MARKET_DEFAULT_CODE_ID != -1){
			   	updGMIDCountry.MARKET_DEFAULT_CODE_ID = parseInt(this._oViewModelData.MARKET_DEFAULT_CODE_ID,10);
			}
			if(this._oViewModelData.SUPPLY_SYSTEM_FLAG_CODE_ID != -1){
			   	updGMIDCountry.SUPPLY_SYSTEM_FLAG_CODE_ID = parseInt(this._oViewModelData.SUPPLY_SYSTEM_FLAG_CODE_ID,10);
			}
			
			if (this.getView().byId("chkDemandAtt1").getSelected()){
				updGMIDCountry.DEMAND_ATTRIBUTE1 = null;
			}
			else if(this._oViewModelData.DEMAND_ATTRIBUTE1 !== undefined){    
				updGMIDCountry.DEMAND_ATTRIBUTE1 = this._oViewModelData.DEMAND_ATTRIBUTE1;
			}
			
			if(this.getView().byId("chkDemandAtt2").getSelected()){
				updGMIDCountry.DEMAND_ATTRIBUTE2 = null;
			} 
			else if (this._oViewModelData.DEMAND_ATTRIBUTE2 !== undefined){
			    updGMIDCountry.DEMAND_ATTRIBUTE2 = this._oViewModelData.DEMAND_ATTRIBUTE2;
			}
			
			if(this.getView().byId("chkMktAtt1").getSelected()){
				updGMIDCountry.MARKETING_ATTRIBUTE1 = null;
			}
			else if (this._oViewModelData.MARKETING_ATTRIBUTE1 !== undefined){
			    updGMIDCountry.MARKETING_ATTRIBUTE1 = this._oViewModelData.MARKETING_ATTRIBUTE1;
			}  
			
			if(this.getView().byId("chkMktAtt2").getSelected()){
				updGMIDCountry.MARKETING_ATTRIBUTE2 = null;
			}
			else if (this._oViewModelData.MARKETING_ATTRIBUTE2 !== undefined){
			    updGMIDCountry.MARKETING_ATTRIBUTE2 = this._oViewModelData.MARKETING_ATTRIBUTE2;
			}
			
			if(this.getView().byId("chkSupplyAtt2").getSelected()){
				updGMIDCountry.SUPPLY_ATTRIBUTE1 = null;
			}
			else if (this._oViewModelData.SUPPLY_ATTRIBUTE1 !== undefined){
			    updGMIDCountry.SUPPLY_ATTRIBUTE1 = this._oViewModelData.SUPPLY_ATTRIBUTE1;
			}
			
			if(this.getView().byId("chkSupplyAtt2").getSelected()){
				updGMIDCountry.SUPPLY_ATTRIBUTE2 = null;
			}
			else if (this._oViewModelData.SUPPLY_ATTRIBUTE2 !== undefined){  
			    updGMIDCountry.SUPPLY_ATTRIBUTE2 = this._oViewModelData.SUPPLY_ATTRIBUTE2;
			}
			
			//return the object of updated attributes
			return updGMIDCountry;
		},
		// update the attributes based on user response
		fnCallbackSubmitConfirm: function(oAction, editAttrIDList){
			var curr = this;
			var successUpdate = true;
			var successCount = 0;
			var updGMIDCountry = curr.createUpdateObject();
			//if user confirmed to update the attributes, prepare the object and update the attributes for the GMID and country
			//else do nothing
			if (oAction === "YES") 
			{
				// create a batch array and push each updated GMID to it
				var batchArray = [];
				for(var i = 0; i < editAttrIDList.length; i++) 
			    {
			    	batchArray.push(this._oDataModel.createBatchOperation("GMID_SHIP_TO_COUNTRY(" + editAttrIDList[i].ID + ")", "MERGE", updGMIDCountry));
			    	successCount++;
				}
				this._oDataModel.addBatchChangeOperations(batchArray);
				
				// creating busy dialog lazily
				if (!this._busyDialog) 
				{
					this._busyDialog = sap.ui.xmlfragment("bam.view.BusyLoading", this);
					this.getView().addDependent(this._dialog);
				}
				
				// setting to a local variable since we are closing it in an oData success function that has no access to global variables.
				var busyDialog = this._busyDialog;
				busyDialog.open();
				
				// submit the batch update command
				this._oDataModel.submitBatch(
					function(oData,oResponse)
					{
						busyDialog.close();
						MessageBox.alert("Attributes for " + successCount + " GMID Country combinations updated successfully.",
							{
								icon : MessageBox.Icon.SUCCESS,
								title : "Success",
								onClose: function() {
				        			curr.getOwnerComponent().getRouter().navTo("maintainAttributes");
				        	}
						});
			    	},
			    	function(oError)
			    	{
			    		busyDialog.close();
		    			MessageBox.alert("Error updating attributes for GMID and Country combinations.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
			    	}
			    );

				
			}
		},
		//cancel click on edit attributes page
		onCancel: function(){
			var curr = this;
			//get the list of updated attributes
			var updatedAttributesList = curr.getUpdatedAttributes();
			// check if there are any changes to be updated
			if (updatedAttributesList !== ""){
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
			}
			else{
				curr.getOwnerComponent().getRouter().navTo("maintainAttributes");
			}
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
