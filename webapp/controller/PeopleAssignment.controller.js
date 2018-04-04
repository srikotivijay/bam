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
	var permissions;
	var loggedInUserID;
	var demandManagerAssigner;
	var globalLeaderAssigner;
	var marketingDirectorAssigner;
	var marketingManagerAssigner;
	var masterPlannerAssigner;
	var productManagerAssigner;
	var regulatorSupplyChainManagerAssigner;
	var supplyChainManagerAssigner;
    var supplyChainPlanningSpecialistAssigner;
    var filter = [];
	return Controller.extend("bam.controller.PeopleAssignment", {
		onInit : function () {
			// Get logged in user id
			loggedInUserID = DataContext.getUserID();
			var initiallyVisibleColumns = "PEOPLE_RULESET_DESCRIPTION,GEOGRAPHY,PRODUCT_DESCRIPTION";
			var ignorableColumns ="ID,DEMAND_MANAGER,GLOBAL_LEADER,MARKETING_DIRECTOR,MARKETING_MANAGER,MASTER_PLANNER,PRODUCT_MANAGER,REG_SUPPLY_CHAIN_MANAGER,SUPPLY_CHAIN_MANAGER,SUPPLY_CHAIN_PLANNING_SPECIALIST,PEOPLE_RULESET_SEQ";
			// Get logged in user id
			// define a global variable for the oData model		
			var oView = this.getView();
			oView.setModel(this.getOwnerComponent().getModel());
			// get resource model
			this._oi18nModel = this.getOwnerComponent().getModel("i18n");
			// checking the permission
			demandManagerAssigner = this._oi18nModel.getProperty("Module.demandManagerAssigner");
	        globalLeaderAssigner = this._oi18nModel.getProperty("Module.globalLeaderAssigner");
	        marketingDirectorAssigner = this._oi18nModel.getProperty("Module.marketingDirectorAssigner");
	        marketingManagerAssigner = this._oi18nModel.getProperty("Module.marketingManagerAssigner");
	        masterPlannerAssigner = this._oi18nModel.getProperty("Module.masterPlannerAssigner");
	        productManagerAssigner = this._oi18nModel.getProperty("Module.productManagerAssigner");
	        regulatorSupplyChainManagerAssigner = this._oi18nModel.getProperty("Module.regulatorSupplyChainManagerAssigner");
	        supplyChainManagerAssigner = this._oi18nModel.getProperty("Module.supplyChainManagerAssigner");
	        supplyChainPlanningSpecialistAssigner = this._oi18nModel.getProperty("Module.supplyChainPlanningSpecialistAssigner");			
			permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			var hasEditPermission = false;
			for(var i = 0; i < permissions.length; i++)
			{
				if(permissions[i].ATTRIBUTE === demandManagerAssigner ||
					  permissions[i].ATTRIBUTE === globalLeaderAssigner ||
					  permissions[i].ATTRIBUTE === marketingDirectorAssigner ||
					  permissions[i].ATTRIBUTE === marketingManagerAssigner ||
					  permissions[i].ATTRIBUTE === masterPlannerAssigner ||
					  permissions[i].ATTRIBUTE === productManagerAssigner ||
					  permissions[i].ATTRIBUTE === regulatorSupplyChainManagerAssigner ||
					  permissions[i].ATTRIBUTE === supplyChainManagerAssigner ||
					  permissions[i].ATTRIBUTE === supplyChainPlanningSpecialistAssigner)
				{
						hasAccess = true;
						if(permissions[i].ACTION === "ADD" || permissions[i].ACTION === "EDIT")
						{
							hasEditPermission = true;
						}
						break;
				}
			}
			//
			// if the user does not have access then redirect to accessdenied page
			if(hasAccess === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "peopleAssignment"
				});					
			}
			else{
				this._oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this._oModel,"PeopleAssignmentVM");
				this._oModel.setProperty("/showEditButton",hasEditPermission);
				this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
				//remove the selection column
				var oSmartTable = this.getView().byId("smartTblPeopleAssignment");     //Get Hold of smart table
				//         
				filter = [];
				for(var j = 0; j < permissions.length; j++){
					if(permissions[j].ATTRIBUTE === demandManagerAssigner || permissions[j].ATTRIBUTE === globalLeaderAssigner ||
					  permissions[j].ATTRIBUTE === marketingDirectorAssigner || permissions[j].ATTRIBUTE === marketingManagerAssigner ||
					  permissions[j].ATTRIBUTE === masterPlannerAssigner || permissions[j].ATTRIBUTE === productManagerAssigner ||
					  permissions[j].ATTRIBUTE === regulatorSupplyChainManagerAssigner || permissions[j].ATTRIBUTE === supplyChainManagerAssigner ||
					  permissions[j].ATTRIBUTE === supplyChainPlanningSpecialistAssigner){
						initiallyVisibleColumns = initiallyVisibleColumns + "," + permissions[j].ATTRIBUTE.replace("_ASSIGNER","");
						ignorableColumns = ignorableColumns.replace("," + permissions[j].ATTRIBUTE.replace("_ASSIGNER",""), "");
						filter.push(new Filter(permissions[j].ATTRIBUTE.replace("_ASSIGNER",""),sap.ui.model.FilterOperator.NE,""));
					}
				}
				oSmartTable.setIgnoredFields(ignorableColumns);
				oSmartTable.setInitiallyVisibleFields(initiallyVisibleColumns);
				//Analytical Table embedded into SmartTable
				var oTable = oSmartTable.getTable(); 
				oTable.setEnableColumnFreeze(true);
				//oSmartTable.rebindTable();
				//oTable.getColumns();
				if(firstTimePageLoad === false){
					this.getOwnerComponent().getModel().refresh(true);
				}
			}
			if(firstTimePageLoad)
			{
				//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
				var oRouter = this.getRouter();
				oRouter.getRoute("peopleAssignment").attachMatched(this._onRouteMatched, this);
				firstTimePageLoad = false;
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
            this.getOwnerComponent().getModel().refresh(true);
            //Get bindinParams Object, which includes filters
            this._oBindingParams = oEvent.getParameter("bindingParams");
            // setting up filters
            var aFilters = this._oBindingParams.filters;

             var gmidFilterList = new Filter ({
                    filters : filter,
                        and : false
                    });
            if(aFilters.length > 0 && aFilters[0].aFilters != undefined){
            	aFilters[0].bAnd = true;
            	aFilters[0].aFilters.push(gmidFilterList);
            }
            else{
            	aFilters.push(gmidFilterList);
            }
            // setting up sorters
            var aSorters = this._oBindingParams.sorter;
            var GMIDSorter = new Sorter("PEOPLE_RULESET_DESCRIPTION",false);
            var CountrySorter = new Sorter("GEOGRAPHY",false);
            aSorters.push(GMIDSorter);
            aSorters.push(CountrySorter);
        },

		//navigate back from rules page
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
	
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("maintainRules", true);
			}
		},
		// open the new page to add rule/ruleset
		onAdd: function(){
			this.getOwnerComponent().getRouter().navTo("addPeopleRules");
		},
	// navigate to edit attribute page on click of edit
	onEdit: function(){
		//
		this._oSmartTable = this.getView().byId("smartTblPeopleAssignment").getTable();
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
					ids = path.substring(indexOfParentheses1 + 1,indexOfParentheses2);
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
				var editSelection = this.getAllRules();
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
			var oSelectedPeopleRule = idArr;
			//add to model
			var oModel = new sap.ui.model.json.JSONModel(oSelectedPeopleRule);
			sap.ui.getCore().setModel(oModel);
			this.getOwnerComponent().getRouter().navTo("editPeopleRules");
		}
		else
		{
			MessageBox.alert("Please select one Rule record for edit.",
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
			this._oDataModel.read("/V_PEOPLE_RULE",{
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
			var applyPeopleRule = this._oi18nModel.getProperty("applypeoplerule");
			var notStarted = this._oi18nModel.getProperty("notstarted");
			 // Get the Application Activity id for Apply Rules
    	    var appActivityID = DataContext.getApplicationActivityID(applyPeopleRule);
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
							MessageBox.alert("Rules Applied successfully.",
								{
									icon : MessageBox.Icon.SUCCESS,
									title : "Success",
									onClose: function() {
            							curr.getOwnerComponent().getRouter().navTo("peopleAssignment");
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
  		}
  	});
});