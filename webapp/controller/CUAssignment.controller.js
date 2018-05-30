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
    var dropdownFilters = [];
    var fuzzyFilters = [];
    var filter = [];
	return Controller.extend("bam.controller.CUAssignment", {
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
			var maintainRule = this._oi18nModel.getProperty("Module.maintainRules");
			var permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === maintainRule)
				{
						hasAccess = true;
						break;
				}
			}
			//
			// if the user does not have access then redirect to accessdenied page
			if(hasAccess === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "cuAssignment"
				});					
			}
			else{
				this._oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this._oModel,"CUAssignmentVM");
				this._oModel.setSizeLimit(20000);
				this._oModel.setProperty("/showEditButton",true);
				var oSmartFilterbar = this.getView().byId("smartFilterBar");
				oSmartFilterbar.clear(); // clear the existing filters
				this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
				//remove the selection column
				var oSmartTable = this.getView().byId("smartTblCUAssignment");     //Get Hold of smart table
				this._oSmartTable = oSmartTable;
				var oTable = oSmartTable.getTable();          //Analytical Table embedded into SmartTable
				oTable.setEnableColumnFreeze(true);
				oSmartFilterbar.search();
				
				fuzzyFilters = [];
				dropdownFilters = [];
				this._oModel.setProperty("/RuleSet",this.getRulesDropDown());
				this._oModel.setProperty("/GeographySet",this.getGeoWithLevels());
			}
			if(firstTimePageLoad)
			{
				//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
				var oRouter = this.getRouter();
				oRouter.getRoute("cuAssignment").attachMatched(this._onRouteMatched, this);
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
			DataContext.clearPersFilter(this._oSmartTable,this._oBindingParams);
			this.getOwnerComponent().getRouter().navTo("home");
		},
		onBeforeRebindTable: function(oEvent) {
            // refresh the odata model, this will force a refresh of the smart table UI
            this.getOwnerComponent().getModel().refresh(true);
            //Get bindinParams Object, which includes filters
            this._oBindingParams = oEvent.getParameter("bindingParams");
                            
            var aFilters = this._oBindingParams.filters;
            var prevFilters = [];
            
           
    		if(fuzzyFilters.length > 0 || dropdownFilters.length > 0){
				while (aFilters.length > 0){
					prevFilters.push(aFilters.pop());
				}
			
				var dFitler = new Filter ({
				    	filters : prevFilters,
				        bAnd : true
				    });
				aFilters.push(dFitler);
			
				if(fuzzyFilters.length > 0){
					var fuzzyFilter = new Filter ({
					    filters : fuzzyFilters,
					        bAnd : false
					    });
					if(aFilters.length > 0 && aFilters[0].aFilters != undefined){
						aFilters[0].bAnd = true;
						aFilters[0].aFilters.push(fuzzyFilter);
					}
					else{
						aFilters.push(fuzzyFilter);
					}
				}
				
				if(dropdownFilters.length > 0){
					var ruleGeoFilters = new Filter ({
					    filters : dropdownFilters,
					        bAnd : true
					    });
					if(aFilters.length > 0 && aFilters[0].aFilters != undefined){
						aFilters[0].bAnd = true;
						aFilters[0].aFilters.push(ruleGeoFilters);
					}
					else{
						aFilters.push(ruleGeoFilters);
					}
				}
        	}
            // setting up sorters
            var aSorters = this._oBindingParams.sorter;
            var GMIDSorter = new Sorter("CU_RULESET_DESCRIPTION",false);
            var CountrySorter = new Sorter("GEOGRAPHY",false);
            aSorters.push(GMIDSorter);
            aSorters.push(CountrySorter);
        },

		//navigate back from rules page
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			DataContext.clearPersFilter(this._oSmartTable,this._oBindingParams);
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("maintainRules", true);
			}
		},
		// open the new page to add rule/ruleset
		onAdd: function(){
			this.getOwnerComponent().getRouter().navTo("addCURules");
		},
		// navigate to edit attribute page on click of edit
		onEdit: function(){
			this._oSmartTable = this.getView().byId("smartTblCUAssignment").getTable();
			// check if more than or less than 1 checkbox is checked
			var index,context,path,indexOfParentheses1,indexOfParentheses2;
			var selectedIndicesLength = this._oSmartTable.getSelectedIndices().length;
			
			if(selectedIndicesLength > 0){
				index = this._oSmartTable.getSelectedIndices();
				var ids = "";
				var idArr = [];
				var editSelection = this.getAllRules();
				for (var j = 0; j < index.length; j++)
				{
					context = editSelection[index[j]]; 
					if(context.SEQ_VALID_FLAG === 'F'){
						MessageBox.alert("You cannot edit level 170 rules.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
						return;
					}
					else if(context !== undefined){
						idArr.push(context.ID);
					}
				}
				
				//
				ids = ids.substring(0, ids.length - 1);
					var oData = idArr;
					//add to model
					var oModel = new sap.ui.model.json.JSONModel(oData);
					sap.ui.getCore().setModel(oModel);
				this.getOwnerComponent().getRouter().navTo("editCURules");
			}
			else
			{
				MessageBox.alert("Please select one CU Rule record for edit.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
					});
			}
		},
		getAllRules : function () {
			var result;
			// Create a filter & sorter array
			// filter RCU based on CU, if CU is selected
			// show all RCU if CU is not selected
			var filterArray = [];
			var sortArray = [];
			// for (var a = 0; a < this._oBindingParams.filters[0].aFilters.length; a++){
			// 	filterArray.push(this._oBindingParams.filters[0].aFilters[a]);
			// }
			var aApplicationFilters = this._oSmartTable.getBinding().aApplicationFilters;
			for (var a = 0; a < aApplicationFilters.length; a++){
				filterArray.push(aApplicationFilters[a]);
			}
			var aSorters = this._oSmartTable.getBinding().aSorters;
			for (var a = 0; a < aSorters.length; a++){
				sortArray.push(aSorters[a]);
			}
		
			//var sortArray = [];
			//var sorter = new sap.ui.model.Sorter("SUB_RCU_DESC",false);
			//sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/V_WEB_CU_RULES",{
					filters: filterArray,
					sorters: sortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                // oData.results.unshift({	"SUB_RCU_CODE":-1,
		              		// 					"SUB_RCU_DESC":"Select.."});
		                // Bind the SUB RCU  data
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
		},
		onApply : function(){
			var curr = this;
			MessageBox.confirm("Are you sure you want to apply rules?",{
       		icon: sap.m.MessageBox.Icon.WARNING,
       		actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
       		onClose: function(oAction) {
       			if(oAction === "YES"){
       			curr.applyRules();
       			}
       		}
      		});
		},
		// apply rule button logic
		applyRules : function(){
			var curr = this;
			var applyCURule = this._oi18nModel.getProperty("applucurule");
			var ruleApplySuccess = this._oi18nModel.getProperty("applypeoplerulesuccessmessage"); 
			var notStarted = this._oi18nModel.getProperty("notstarted");
			 // Get the Application Activity id for Apply Rules
    	    var appActivityID = DataContext.getApplicationActivityID(applyCURule);
    	    var oDate = new Date();
    	    	var updAppActivity = {
    	    		ID: appActivityID,
    	    		APPLY_FLAG : 'T',
    	    		JOB_STATUS : notStarted,
    	    		APPLIED_ON : oDate,
    	    		APPLIED_BY : loggedInUserID
		};
		
			this._oDataModel.update("/RULE_APPLICATION_ACTIVITY("+appActivityID+")", updAppActivity,
			        {
						merge: true,
			        	// show success alert to the user
					    success: function(){
							MessageBox.alert(ruleApplySuccess,
								{
									icon : MessageBox.Icon.SUCCESS,
									title : "Success",
									onClose: function() {
            							curr.getOwnerComponent().getRouter().navTo("cuAssignment");
            						}
							});
						},
						// show error alert to the user
						error: function(oError){
							MessageBox.alert("Error updating rules.",
								{
									icon : MessageBox.Icon.ERROR,
									title : "Error"
							});
						}
			        });
  		},
  		getRulesDropDown : function () {
			var result;
			// Create a filter & sorter array
		//	var filterArray = [];
			//var validFlagFilter = new Filter("VALID_FLAG",sap.ui.model.FilterOperator.EQ,"T");
			//filterArray.push(validFlagFilter);
			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("LABEL",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/MST_CU_RULESET",{
					async: false,
					//filters: filterArray,
	                success: function(oData, oResponse){
		                result =  oData.results;
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
	    	return result;
		},
		getGeoWithLevels: function(){
  				var result;
			// Create a filter & sorter array
			// filter RCU based on CU, if CU is selected
			// show all RCU if CU is not selected
			var filterArray = [];
			var sortArray = [];
			
			var levelArray = ["GEO_LEVEL6"];
			for (var a = 0; a < levelArray.length; a++){
				filterArray.push(new Filter("GEO_LEVEL",sap.ui.model.FilterOperator.EQ,levelArray[a]));
			}
			filterArray.push(new Filter("VALID_FLAG",sap.ui.model.FilterOperator.EQ,'T'));
			// var aSorters = this._oSmartTable.getBinding().aSorters;
			// for (var a = 0; a < aSorters.length; a++){
			// 	sortArray.push(aSorters[a]);
			// }
			
			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("GEO_LEVEL",false);
			sortArray.push(sorter);
			//Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/V_GEO_ALL_LEVEL",{
					filters: filterArray,
					sorters: sortArray,
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                // oData.results.unshift({	"SUB_RCU_CODE":-1,
		              		// 					"SUB_RCU_DESC":"Select.."});
		                // Bind the SUB RCU  data
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
  		},
  		filterSearch: function(){
			dropdownFilters = [];
			fuzzyFilters = [];
			var geoName = this._oModel.getProperty("/SELECTED_GEO_NAME");
			var geoLevel = this._oModel.getProperty("/SELECTED_GEO_LEVEL");
			//var rulesetDescription = this._oModel.getProperty("/RULESET_DESCRIPTION");
			var rulesetLevel = this._oModel.getProperty("/SELECTED_CU_RULESET_SEQ");
			var fuzzyText = this._oModel.getProperty("/FUZZY");
			if(geoName != undefined && geoName !== ""){
				dropdownFilters.push(new Filter("GEOGRAPHY",sap.ui.model.FilterOperator.EQ,geoName));
			}
			if(geoLevel != undefined && geoLevel !== ""){
				dropdownFilters.push(new Filter("GEO_LEVEL",sap.ui.model.FilterOperator.EQ,geoLevel));
			}
			if(rulesetLevel != undefined && rulesetLevel !== ""){
				dropdownFilters.push(new Filter("CU_RULESET_DESCRIPTION",sap.ui.model.FilterOperator.Contains,rulesetLevel));
			}
			if(fuzzyText != undefined && fuzzyText !== ""){
				fuzzyText = fuzzyText.toUpperCase();
				fuzzyFilters.push(new Filter("CU_RULESET_DESCRIPTION",sap.ui.model.FilterOperator.Contains,fuzzyText));
				fuzzyFilters.push(new Filter("GEOGRAPHY",sap.ui.model.FilterOperator.Contains,fuzzyText));
				fuzzyFilters.push(new Filter("PRODUCT_DESCRIPTION",sap.ui.model.FilterOperator.Contains,fuzzyText));
				fuzzyFilters.push(new Filter("CU_DESCRIPTION",sap.ui.model.FilterOperator.Contains,fuzzyText));
				fuzzyFilters.push(new Filter("SCU_DESCRIPTION",sap.ui.model.FilterOperator.Contains,fuzzyText));
			}
		}
  	});
});