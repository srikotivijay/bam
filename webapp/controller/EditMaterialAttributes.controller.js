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
	return Controller.extend("bam.controller.EditMaterialAttributes", {
		onInit : function () {
			if(firstTimePageLoad)
			{
				//attach _onRouteMatched to be called everytime on navigation to Edit Attributes Single page
				var oRouter = this.getRouter();
				oRouter.getRoute("editMaterialAttributes").attachMatched(this._onRouteMatched, this);
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
			this._oEditMaterialAttributesViewModel = new sap.ui.model.json.JSONModel();
			// checking the permission
			var maintainMaterialAttributes = this._oi18nModel.getProperty("Module.maintainMaterialAttributes");
			var permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === maintainMaterialAttributes && permissions[i].ACTION === "EDIT")
				{
						hasAccess = true;
						break;
				}
			}
			//
			// if the user does not have access then redirect to accessdenied page
			if(hasAccess === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "editMaterialAttributes"
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
				// set all the dropdowns, get the data from the code master table
				// default load
				this._oModel.setProperty("/ALERT_EXCLUSION",this.getAlertExclusionDropDown());
				this._oModel.setProperty("/BUSINESS_SEGMENT",this.getBusinessSegmentDropDown());
				this._oModel.setProperty("/ID","-1");
				this._oModel.setProperty("/LABEL","Select..");
				this._oModel.setProperty("/BUSINESS_SEGMENT_CODE","-1");
				this._oModel.setProperty("/BUSINESS_SEGMENT_DESC","Select..");
				//
				var ddlAlertExclusion = this.getView().byId("cmbAlertExclusion");
				ddlAlertExclusion.setValueStateText("");
				ddlAlertExclusion.setValueState(sap.ui.core.ValueState.None);
				var ddlBusinessSegment = this.getView().byId("cmbBusSegment");
				ddlBusinessSegment.setValueStateText("");
				ddlBusinessSegment.setValueState(sap.ui.core.ValueState.None);
				//
				
				this._oRuleUpdViewModel = this._oModel;
				this._oViewModelData = this._oRuleUpdViewModel.getData();
				//
				var core = sap.ui.getCore();
				var globalModel = core.getModel();
				globalIds = globalModel.getData();
				this.setEditMaintainAttributesVM(globalIds);
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
		
		getAlertExclusionDropDown : function () {
			var result;
			// Create a filter & sorter array
			var filterArray = [];
			var dropdownType = 'ALERT_EXCLUSION';
			var countryFilter = new Filter("CODE_TYPE",sap.ui.model.FilterOperator.EQ,dropdownType);
			filterArray.push(countryFilter);
			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("LABEL",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/CODE_MASTER",{
					filters: filterArray,
					sorters: sortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"ID":-1,
		              							"LABEL":"Select..."});
		                // Bind the Country data to the GMIDShipToCountry model
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for  Alert Exclusion Flag Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		
		},
		getBusinessSegmentDropDown : function () {
			var result;
			// Create a filter & sorter array
			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("BUSINESS_SEGMENT_DESC",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_BUSINESS_SEGMENT",{
					sorters: sortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"BUSINESS_SEGMENT_CODE":-1,
		              							"BUSINESS_SEGMENT_DESC":"Select.."});
		                // Bind the Country data to the GMIDShipToCountry model
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for Business Segment Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		},
		
		setEditMaintainAttributesVM: function(editAttributesIDs){
			var initData = [];
			for (var i = 0; i < editAttributesIDs.length; i++) {
	    		initData.push({
	    			ID:editAttributesIDs[i]
	    		});
			}
			this._oModel.setProperty("/EDIT_ATTRIBUTES_ID_LIST",initData);
			this._oModel.setProperty("/MATERIAL_COUNT",editAttributesIDs.length);
		},
			// onChange: function(oEvent){
				
			// },
			// //click of submit button
		onSubmit: function(){
			var currObj = this;
				// check if the values are selected from combobox
			if (this._oViewModelData.ID === "" || this._oViewModelData.BUSINESS_SEGMENT_CODE === "")
			{
				MessageBox.alert('Please select the values from the dropdownlist',{
                	icon : MessageBox.Icon.ERROR,
                    title : "Error"});
                return;
			}
			var updatedCodes = currObj.getUpdatedCodes();	
			if (updatedCodes !== ""){
				var ruleCount = this._oModel.getProperty("/MATERIAL_COUNT");
				// check if user wants to update the attributes for GMID and country
				MessageBox.confirm((updatedCodes + " will be updated for " + ruleCount + " Material(s). Continue?"), {
	    			icon: sap.m.MessageBox.Icon.WARNING,
	    			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
	          		onClose: function(oAction) {
	          			var editMaterialIdList = currObj._oModel.getProperty("/EDIT_ATTRIBUTES_ID_LIST");
	        			currObj.fnCallbackSubmitConfirm(oAction, editMaterialIdList);
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
		//
		createUpdateObject: function(){
			// Create current timestamp
			var oDate = new Date();
			var updMaterial = {
			    		LAST_UPDATED_BY: loggedInUserID,
					    LAST_UPDATED_ON: oDate
			    	};
		   if (this._oViewModelData.ID !== "-1" && this._oViewModelData.ID !== undefined){
					updMaterial.ALERT_EXCLUSION_CODE_ID = this._oViewModelData.ID;
					}
			if (this._oViewModelData.BUSINESS_SEGMENT_CODE !== "-1" && this._oViewModelData.BUSINESS_SEGMENT_CODE !== undefined){
				updMaterial.BUSINESS_SEGMENT_CODE = this._oViewModelData.BUSINESS_SEGMENT_CODE;
			}
			//return the object of updated attributes
			return updMaterial;
		},		
		// update the rules based on user response
		fnCallbackSubmitConfirm: function(oAction, editMaterialIdList){
			var curr = this;
			var successCount = 0;
			
			//if user confirmed to update the attributes, prepare the object and update the attributes for the GMID and country
			//else do nothing
			if (oAction === "YES") 
			{
				var updMaterial = curr.createUpdateObject();
				// create a batch array and push each updated GMID to it
				var batchArray = [];
				for(var i = 0; i < editMaterialIdList.length; i++) 
			    {
			    	batchArray.push(this._oDataModel.createBatchOperation("MST_GMID(" + editMaterialIdList[i].ID + ")", "MERGE", updMaterial));
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
						MessageBox.alert(successCount + " Materials updated successfully.",
							{
								icon : MessageBox.Icon.SUCCESS,
								title : "Success",
								onClose: function() {
									curr.getOwnerComponent().getRouter().navTo("maintainMaterialAttributes");
						        }
						});
			    	},
			    	function(oError)
			    	{
			    		busyDialog.close();
		    			MessageBox.alert("Error updating Material Attributes.",
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
				// check if user wants to update the attributes for GMID and country
				MessageBox.confirm("Are you sure you want to cancel your changes and navigate back to the previous page?", {
            		icon: sap.m.MessageBox.Icon.WARNING,
            		actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            		onClose: function(oAction) {
            			if(oAction === "YES"){
            				curr.getOwnerComponent().getRouter().navTo("maintainMaterialAttributes");
            			}
            		}
        		});
			},
			// //navigate back from edit page
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("maintainMaterialAttributes", true);
			}
		},
		validateRuleValueChange: function (sourceControlName){
			var type = sourceControlName.substring(0,3);
			if((type === "cmb" && this.getView().byId(sourceControlName).getSelectedKey() !== "-1") || 
				(type === "txt" && this.getView().byId(sourceControlName).getValue().trim() !== "") ||
				(type === "chk" && this.getView().byId(sourceControlName).getSelected())
				){
				return true;
			}
			else{
				return false;
			}
		},
		getUpdatedCodes: function(){
			// get the crop protection and seeds value from i18n file
	    	var oi18nModel = this.getView().getModel("i18n");
			var updatedAttributesString = "";
			// || this.validateRuleValueChange("chkCU1")
			if (this.validateRuleValueChange("cmbAlertExclusion") ){
				updatedAttributesString += oi18nModel.getProperty("AlertExclusion");
				updatedAttributesString += ", ";
			}
			// || this.validateRuleValueChange("chkSubCU1")
			if (this.validateRuleValueChange("cmbBusSegment")){
				updatedAttributesString += oi18nModel.getProperty("BusinessSegment");
				updatedAttributesString += ", ";
			}
			return updatedAttributesString.substring(0, updatedAttributesString.length - 2);
		},
		onChange: function(oEvent){
				var sourceControl = oEvent.getSource();
				var sourceControlName = oEvent.getSource().getName();
				// call the method to check if any of the attribute value has been updated 
				if (this.validateRuleValueChange(sourceControlName)){
					// if true set the value state to warning to highlight the change to the user
					sourceControl.setValueStateText("Attribute value changed");
					sourceControl.setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					// if false set the value state to none to remove highlight from the control
					sourceControl.setValueStateText("");
					sourceControl.setValueState(sap.ui.core.ValueState.None);
				}
		}		
  	});
});