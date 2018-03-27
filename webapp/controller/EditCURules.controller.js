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
	return Controller.extend("bam.controller.EditCURules", {
		onInit : function () {
			if(firstTimePageLoad)
			{
				//attach _onRouteMatched to be called everytime on navigation to Edit Attributes Single page
				var oRouter = this.getRouter();
				oRouter.getRoute("editCURules").attachMatched(this._onRouteMatched, this);
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
			this._oEditCURulesViewModel = new sap.ui.model.json.JSONModel();
			// checking the permission
			var maintainRule = this._oi18nModel.getProperty("Module.maintainRules");
			var permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === maintainRule && (permissions[i].ACTION === "EDIT" || permissions[i].ACTION === "ADD"))
				{
						hasAccess = true;
						break;
				}
			}
			//
			// if the user does not have access then redirect to accessdenied page
			if(hasAccess === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "editCURules"
				});	
			}
			else{
				this._isChanged = false;
				// Assigning view model for the page
				this._oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this._oModel);
				this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
				//
				if (!this._busyDialog) 
				{
					this._busyDialog = sap.ui.xmlfragment("bam.view.BusyLoading", this);
					this.getView().addDependent(this._dialog);
				}
				// set all the dropdowns, get the data from the code master table
				// default load
				this._oModel.setProperty("/RCU",this.getRCUDropDown());
				this._oModel.setProperty("/SubRCU",this.getSubRCUDropDown());
				this._oModel.setProperty("/RCU_CODE","-1");
				this._oModel.setProperty("/RCU_DESC","Select..");
				this._oModel.setProperty("/SUBRCU_CODE","-1");
				this._oModel.setProperty("/SUBRCU_DESC","Select..");
				this._oModel.setProperty("/CU_STATE","None");
				this._oModel.setProperty("/SUBCU_STATE","None");
				this._oModel.setProperty("/CU_STATE_TEXT","None");
				this._oModel.setProperty("/SUBCU_STATE_TEXT","None");
				//
				var ddlCU = this.getView().byId("cmbCU");
				ddlCU.setValueStateText("");
				ddlCU.setValueState(sap.ui.core.ValueState.None);
				var ddlSubCU = this.getView().byId("cmbSubCU");
				ddlSubCU.setValueStateText("");
				ddlSubCU.setValueState(sap.ui.core.ValueState.None);
				//
				
				this._oRuleUpdViewModel = this._oModel;
				this._oViewModelData = this._oRuleUpdViewModel.getData();
				//
				var core = sap.ui.getCore();
				var globalModel = core.getModel();
				globalIds = globalModel.getData();
				this.setEditCURulesVM(globalIds);
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
				//this._oEditAttributesID = oEvent.getParameter("arguments").editAttributesID;
				
					////get current list of ids from model
			    	//var core = sap.ui.getCore();
			    	////debugger; // eslint-disable-line
			    //	var globalModel = core.getModel();
			    	//globalIds = globalModel.getData();  
					////debugger; // eslint-disable-line
					//this.setEditCURulesVM(globalIds);

			}
		},
			// add properties in view model to set the visibility of controls on basis of the user role
		checkPermission: function(attribute){
			return attributeList.includes(attribute);
		},
		
		getRCUDropDown : function () {
			var result;
			// Create a filter & sorter array
			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("RCU_DESC",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_RCU",{
				sorters: sortArray,
				async: false,
				success: function(oData, oResponse){
					// add Please select item on top of the list
					oData.results.unshift({	"RCU_CODE":-1,
											"RCU_DESC":"Select.."});
					// Bind the Country data to the GMIDShipToCountry model
					result =  oData.results;
				},
				error: function(){
					MessageBox.alert("Unable to retrieve dropdown values for RCU Please contact System Admin.",
					{
						icon : MessageBox.Icon.ERROR,
						title : "Error"
					});
					result = [];
				}
			});
			return result;
		},
		getSubRCUDropDown : function () {
			var result;
			// Create a filter & sorter array

			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("SUB_RCU_DESC",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_SUB_RCU",{
					sorters: sortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"SUB_RCU_CODE":-1,
		              							"SUB_RCU_DESC":"Select.."});
		                // Bind the Country data to the GMIDShipToCountry model
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for SUB RCU Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
		},
		
		setEditCURulesVM: function(editAttributesIDs){
			var initData = [];
			for (var i = 0; i < editAttributesIDs.length; i++) {
	    		initData.push({
	    			ID:editAttributesIDs[i]
	    		});
			}
			this._oModel.setProperty("/EDIT_ATTRIBUTES_ID_LIST",initData);
			this._oModel.setProperty("/RULE_COUNT",editAttributesIDs.length);
		},
			// onChange: function(oEvent){
				
			// },
			// //click of submit button
		onSubmit: function(){
			var currObj = this;
			var updatedCodes = currObj.getUpdatedCodes();	
			if (updatedCodes !== ""){
				var ruleCount = this._oModel.getProperty("/RULE_COUNT");
				// check if user wants to update the attributes for GMID and country
				MessageBox.confirm((updatedCodes + " will be updated for " + ruleCount + " rule(s). Continue?"), {
	    			icon: sap.m.MessageBox.Icon.WARNING,
	    			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
	          		onClose: function(oAction) {
	          			var editRuleIdList = currObj._oModel.getProperty("/EDIT_ATTRIBUTES_ID_LIST");
	        			currObj.fnCallbackSubmitConfirm(oAction, editRuleIdList);
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
			var updRule = {
			    		LAST_UPDATED_BY: loggedInUserID,
					    LAST_UPDATED_ON: oDate
			    	};
			if(this.getView().byId("chkCU1").getSelected()){
					updRule.RCU_CODE = null;
			}
			else if (this._oViewModelData.RCU_CODE !== "-1" && this._oViewModelData.RCU_CODE !== undefined){
					updRule.RCU_CODE = this._oViewModelData.RCU_CODE;
			}
			//
			if(this.getView().byId("chkSubCU1").getSelected()){
				updRule.SUB_RCU_CODE = null;
			}
			else if (this._oViewModelData.SUBRCU_CODE !== "-1" && this._oViewModelData.SUBRCU_CODE !== undefined){
				updRule.SUB_RCU_CODE = this._oViewModelData.SUBRCU_CODE;
			}
			//return the object of updated attributes
			return updRule;
		},		
		// update the rules based on user response
		fnCallbackSubmitConfirm: function(oAction, editRuleIdList){
			var curr = this;
			var successCount = 0;
			
			//if user confirmed to update the attributes, prepare the object and update the attributes for the GMID and country
			//else do nothing
			if (oAction === "YES") 
			{
				var updRule = curr.createUpdateObject();
				// create a batch array and push each updated GMID to it
				var batchArray = [];
				for(var i = 0; i < editRuleIdList.length; i++) 
			    {
			    	batchArray.push(this._oDataModel.createBatchOperation("MST_CU_RULE(" + editRuleIdList[i].ID + ")", "MERGE", updRule));
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
						curr._oDataModel.remove("/MST_CU_RULE(" + editRuleIdList[0].ID + ")", {
							success: function(){
								busyDialog.close();
								MessageBox.alert("CU for " + successCount + " Rules updated successfully.",
									{
										icon : MessageBox.Icon.SUCCESS,
										title : "Success",
										onClose: function() {
						        			curr.getOwnerComponent().getRouter().navTo("cuAssignment");
						        	}
								});
							},
							error: function(){
								busyDialog.close();
				    			MessageBox.alert("CU for " + successCount + " Rules updated successfully with errors deleting nulled Rules.",
								{
									icon : MessageBox.Icon.ERROR,
									title : "Error"
								});
							}
						});
			    	},
			    	function(oError)
			    	{
			    		busyDialog.close();
		    			MessageBox.alert("Error updating attributes for Rules.",
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
            				curr.getOwnerComponent().getRouter().navTo("cuAssignment");
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
				oRouter.navTo("cuAssignment", true);
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
			if (this.validateRuleValueChange("cmbCU") || this.validateRuleValueChange("chkCU1")){
				updatedAttributesString += oi18nModel.getProperty("cu");
				updatedAttributesString += ", ";
			}
			if (this.validateRuleValueChange("cmbSubCU")|| this.validateRuleValueChange("chkSubCU1")){
				updatedAttributesString += oi18nModel.getProperty("subCU");
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