sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/Filter",
	"sap/ui/core/routing/History",
	"bam/services/DataContext",
	"sap/ui/model/FilterOperator"
], function(Controller, JSONModel, MessageToast, MessageBox, ResourceModel,Filter,History,DataContext,FilterOperator) {
	"use strict";
	var attributeList = [];
	var loggedInUserID;
	var firstTimePageLoad = true;
	var selectedPeopleRuleIds;
	//
	var demandManagerAssigner;
	var globalLeaderAssigner;
	var marketingDirectorAssigner;
	var marketingManagerAssigner;
	var masterPlannerAssigner;
	var productManagerAssigner;
	var regionalSupplyChainManagerAssigner;
	var supplyChainManagerAssigner;
	var supplyChainPlanningSpecialistAssigner;
	var permissions;    
	var showDemandManager = false;
	var showGlobalLeader = false;
	var showMarketingDirector = false; 
	var showMarketingManger = false;
	var showMasterPlanner = false;
	var showProductManager = false;
	var showRegionalSupplychainManager = false;
	var showSupplyChainManager = false; 
	var showSupplyChainPlanningSpecialist = false;	
	var filter = [];
	return Controller.extend("bam.controller.EditPeopleRules", {
		onInit : function (){
			if(firstTimePageLoad){
				//attach _onRouteMatched to be called everytime on navigation to Edit Attributes Single page
				var oRouter = this.getRouter();
				oRouter.getRoute("editPeopleRules").attachMatched(this._onRouteMatched, this);
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
			this._oEditPeopleRulesViewModel = new sap.ui.model.json.JSONModel();
			//
			// checking the permission
			var hasAccess = this.checkPermission();
			if(hasAccess === false){
				this.getRouter().getTargets().display("accessDenied", {
					fromTarget : "peopleAssignment"
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
				this.setEditPeopleRulesVM();
				//
				// Changing the visiblit of columns
				this._oModel.setProperty("/showDemandManager", showDemandManager);
				this._oModel.setProperty("/showGlobalLeader",showGlobalLeader);
				this._oModel.setProperty("/showMarketingDirector",showMarketingDirector);
				this._oModel.setProperty("/showMarketingManger",showMarketingManger);
				this._oModel.setProperty("/showMasterPlanner",showMasterPlanner);
				this._oModel.setProperty("/showProductManager",showProductManager);
				this._oModel.setProperty("/showRegionalSupplychainManager",showRegionalSupplychainManager);
				this._oModel.setProperty("/showSupplyChainManager",showSupplyChainManager);
				this._oModel.setProperty("/showSupplyChainPlanningSpecialist",showSupplyChainPlanningSpecialist);
				//
				// Load dropdown
				this.loadDropDowns();
				//
				// setting the defult values
				this._oModel.setProperty("/DEMAND_MANAGER_ID","-1");
				this._oModel.setProperty("/DEMAND_MANAGER_NAME","Select..");
				this._oModel.setProperty("/GLOBAL_LEADER_ID","-1");
				this._oModel.setProperty("/GLOBAL_LEADER_NAME","Select..");
				this._oModel.setProperty("/MARKETING_DIRECTOR_ID","-1");
				this._oModel.setProperty("/MARKETING_DIRECTOR_NAME","Select..");
				this._oModel.setProperty("/MARKETING_MANAGER_ID","-1");
				this._oModel.setProperty("/MARKETING_MANAGER_NAME","Select..");
				this._oModel.setProperty("/MASTER_PLANNER_ID","-1");
				this._oModel.setProperty("/MASTER_PLANNER_NAME","Select..");
				this._oModel.setProperty("/PRODUCT_MANAGER_ID","-1");
				this._oModel.setProperty("/PRODUCT_MANAGER_NAME","Select..");
				this._oModel.setProperty("/REGIONAL_SUPPLY_CHAIN_MANAGER_ID","-1");
				this._oModel.setProperty("/REGIONAL_SUPPLY_CHAIN_MANAGER_NAME","Select..");
				this._oModel.setProperty("/SUPPLY_CHAIN_MANAGER_ID","-1");
				this._oModel.setProperty("/SUPPLY_CHAIN_MANAGER_NAME","Select..");
				this._oModel.setProperty("/SUPPLY_CHAIN_PLANNING_SPECIALIST_ID","-1");
				this._oModel.setProperty("/SUPPLY_CHAIN_PLANNING_SPECIALIST_NAME","Select..");
				//
				this._oRuleUpdViewModel = this._oModel;
				this._oViewModelData = this._oRuleUpdViewModel.getData();
			}
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
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
		// function to navigate back to the previous page
		onNavBack : function(){
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("peopleAssignment", true);
			}			
		},
		//
		// function to check the permission
		checkPermission : function(){
			demandManagerAssigner = this._oi18nModel.getProperty("Module.demandManagerAssigner");
			globalLeaderAssigner = this._oi18nModel.getProperty("Module.globalLeaderAssigner");
			marketingDirectorAssigner = this._oi18nModel.getProperty("Module.marketingDirectorAssigner");
			marketingManagerAssigner = this._oi18nModel.getProperty("Module.marketingManagerAssigner");
			masterPlannerAssigner = this._oi18nModel.getProperty("Module.masterPlannerAssigner");
			productManagerAssigner = this._oi18nModel.getProperty("Module.productManagerAssigner");
			regionalSupplyChainManagerAssigner = this._oi18nModel.getProperty("Module.regulatorSupplyChainManagerAssigner");
			supplyChainManagerAssigner = this._oi18nModel.getProperty("Module.supplyChainManagerAssigner");
			supplyChainPlanningSpecialistAssigner = this._oi18nModel.getProperty("Module.supplyChainPlanningSpecialistAssigner");			
			permissions = DataContext.getUserPermissions();
			var hasAccess = false;
			filter = [];
			for(var i = 0; i < permissions.length; i++)
			{
				if((permissions[i].ATTRIBUTE === demandManagerAssigner ||
					permissions[i].ATTRIBUTE === globalLeaderAssigner ||
					permissions[i].ATTRIBUTE === marketingDirectorAssigner ||
					permissions[i].ATTRIBUTE === marketingManagerAssigner ||
					permissions[i].ATTRIBUTE === masterPlannerAssigner ||
					permissions[i].ATTRIBUTE === productManagerAssigner ||
					permissions[i].ATTRIBUTE === regionalSupplyChainManagerAssigner ||
					permissions[i].ATTRIBUTE === supplyChainManagerAssigner ||
					permissions[i].ATTRIBUTE === supplyChainPlanningSpecialistAssigner) &&
					(permissions[i].ACTION === "ADD" || permissions[i].ACTION === "EDIT")
					)
				{
					//
					// Creatting the filer collection
					filter.push(new Filter(permissions[i].ATTRIBUTE.replace("_ASSIGNER",""),sap.ui.model.FilterOperator.NE,""));
					if(permissions[i].ATTRIBUTE === demandManagerAssigner){
						showDemandManager = true;
						this.getView().byId("cmbDemandManager").setEnabled(true);
						this.getView().byId("cmbDemandManager").setValueStateText("");
						this.getView().byId("cmbDemandManager").setValueState(sap.ui.core.ValueState.None);
					}
					if(permissions[i].ATTRIBUTE === globalLeaderAssigner){
						showGlobalLeader = true;
						this.getView().byId("cmbGlobalLeader").setEnabled(true);
						this.getView().byId("cmbGlobalLeader").setValueStateText("");
						this.getView().byId("cmbGlobalLeader").setValueState(sap.ui.core.ValueState.None);
					}	
					if(permissions[i].ATTRIBUTE === marketingDirectorAssigner){
						showMarketingDirector = true;
						this.getView().byId("cmbMarketingDirector").setEnabled(true);
						this.getView().byId("cmbMarketingDirector").setValueStateText("");
						this.getView().byId("cmbMarketingDirector").setValueState(sap.ui.core.ValueState.None);
					}	
					if(permissions[i].ATTRIBUTE === marketingManagerAssigner){
						showMarketingManger = true;	
						this.getView().byId("cmbMarketingManager").setEnabled(true);
						this.getView().byId("cmbMarketingManager").setValueStateText("");
						this.getView().byId("cmbMarketingManager").setValueState(sap.ui.core.ValueState.None);
					}
					if(permissions[i].ATTRIBUTE === masterPlannerAssigner){
						showMasterPlanner = true;
						this.getView().byId("cmbMasterPlanner").setEnabled(true);
						this.getView().byId("cmbMasterPlanner").setValueStateText("");
						this.getView().byId("cmbMasterPlanner").setValueState(sap.ui.core.ValueState.None);
					}
					if(permissions[i].ATTRIBUTE === productManagerAssigner){
						showProductManager = true;
						this.getView().byId("cmbProductManager").setEnabled(true);
						this.getView().byId("cmbProductManager").setValueStateText("");
						this.getView().byId("cmbProductManager").setValueState(sap.ui.core.ValueState.None);
					}
					if(permissions[i].ATTRIBUTE === regionalSupplyChainManagerAssigner){
						showRegionalSupplychainManager = true;
						this.getView().byId("cmbRegionalSupplyChainManager").setEnabled(true);
						this.getView().byId("cmbRegionalSupplyChainManager").setValueStateText("");
						this.getView().byId("cmbRegionalSupplyChainManager").setValueState(sap.ui.core.ValueState.None);
					}
					if(permissions[i].ATTRIBUTE === supplyChainManagerAssigner){
						showSupplyChainManager = true;
						this.getView().byId("cmbSupplyChainManager").setEnabled(true);
						this.getView().byId("cmbSupplyChainManager").setValueStateText("");
						this.getView().byId("cmbSupplyChainManager").setValueState(sap.ui.core.ValueState.None);
					}
					if(permissions[i].ATTRIBUTE === supplyChainPlanningSpecialistAssigner){
						showSupplyChainPlanningSpecialist = true;
						this.getView().byId("cmbSupplyChainPlanningSpecialist").setEnabled(true);
						this.getView().byId("cmbSupplyChainPlanningSpecialist").setValueStateText("");
						this.getView().byId("cmbSupplyChainPlanningSpecialist").setValueState(sap.ui.core.ValueState.None);
					}
					hasAccess = true;
				}
			}
			return hasAccess;
		},
		//
		setEditPeopleRulesVM: function(){
			var core = sap.ui.getCore();
			var globalModel = core.getModel();
			if(globalModel !== undefined){
				selectedPeopleRuleIds = globalModel.getData();
				var initData = [];
				for (var i = 0; i < selectedPeopleRuleIds.length; i++) {
					initData.push({
						ID:selectedPeopleRuleIds[i]
					});
				}
				this._oModel.setProperty("/EDIT_ATTRIBUTES_ID_LIST",initData);
				this._oModel.setProperty("/RULE_COUNT",selectedPeopleRuleIds.length);				
			}
		},
		loadDropDowns : function(){
			//
			// load the dropdown from user table
			if(showDemandManager){
				var demandManager = this._oi18nModel.getProperty("DEMAND_MANAGER");
				this._oModel.setProperty("/DEMAND_MANAGER", this.getPeopleRoleDropDown(demandManager));
			}
			if(showGlobalLeader){
				var globalLeader = this._oi18nModel.getProperty("GLOBAL_LEADER");
				this._oModel.setProperty("/GLOBAL_LEADER", this.getPeopleRoleDropDown(globalLeader));
			}
			if(showMarketingDirector){
				var marketingDirector = this._oi18nModel.getProperty("MARKETING_DIRECTOR");
				this._oModel.setProperty("/MARKETING_DIRECTOR", this.getPeopleRoleDropDown(marketingDirector));
			}
			if(showMarketingManger){
				var marketingManager = this._oi18nModel.getProperty("MARKETING_MANAGER");
				this._oModel.setProperty("/MARKETING_MANAGER", this.getPeopleRoleDropDown(marketingManager));
			}
			if(showMasterPlanner){
				var masterPlanner = this._oi18nModel.getProperty("MASTER_PLANNER");
				this._oModel.setProperty("/MASTER_PLANNER", this.getPeopleRoleDropDown(masterPlanner));	
			}
			if(showProductManager){
				var productManager = this._oi18nModel.getProperty("PRODUCT_MANAGER");
				this._oModel.setProperty("/PRODUCT_MANAGER", this.getPeopleRoleDropDown(productManager));	
			}
			if(showRegionalSupplychainManager){
				var regionalSupplychainManager = this._oi18nModel.getProperty("REG_SUPPLY_CHAIN_MANAGER");
				this._oModel.setProperty("/REGIONAL_SUPPLY_CHAIN_MANAGER", this.getPeopleRoleDropDown(regionalSupplychainManager));	
			}
			if(showSupplyChainManager){
				var supplychainManager = this._oi18nModel.getProperty("SUPPLY_CHAIN_MANAGER");
				this._oModel.setProperty("/SUPPLY_CHAIN_MANAGER", this.getPeopleRoleDropDown(supplychainManager));	
			}
			if(showSupplyChainPlanningSpecialist){
				var supplychainPlanningSpecialist = this._oi18nModel.getProperty("SUPPLY_CHAIN_PLANNING_SPECIALIST");
				this._oModel.setProperty("/SUPPLY_CHAIN_PLANNING_SPECIALIST", this.getPeopleRoleDropDown(supplychainPlanningSpecialist));
			}
		},
		getPeopleRoleDropDown : function (roleName) {
			var result;
			// Create a filter & sorter array
			var sortArray = [];
			var sorter = new sap.ui.model.Sorter("USER_NAME",false);
			sortArray.push(sorter);
			// Get the Country dropdown list from the CODE_MASTER table
			this._oDataModel.read("/V_USER_BY_PEOPLE_ROLE",{
					sorters: sortArray,
					filters: [ 
								new Filter("USER_ROLE", FilterOperator.EQ, roleName)
							],
					async: false,
	                success: function(oData, oResponse){
	                	// add Please select item on top of the list
		                oData.results.unshift({	"USER_ID":"-1",
		              							"USER_NAME":"Select.."});
		                // Bind the RCU  data 
		                result =  oData.results;
	                },
	    		    error: function(){
    		    		MessageBox.alert("Unable to retrieve dropdown values for People Roles Please contact System Admin.",
						{
							icon : MessageBox.Icon.ERROR,
							title : "Error"
						});
	            		result = [];
	    			}
	    	});
	    	return result;
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
            			curr.getOwnerComponent().getRouter().navTo("peopleAssignment");
            		}
            	}
        	});
		},
		onSubmit : function(){
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
		onChecked: function(oEvent){
			var sourceControlName = oEvent.getSource().getName();
			var isChecked = oEvent.getParameter("selected");
				// if check box is checked then clear the value of the attributes else dont do anything
			// depending on Id clear the text areas of the attributes
			if (sourceControlName === "chkDemandManager")
			{	
				if(isChecked){
					this.getView().byId("cmbDemandManager").setValue("Select..");
					this.getView().byId("cmbDemandManager").setEnabled(false);
					this.getView().byId("cmbDemandManager").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("cmbDemandManager").setEnabled(true);
					this.getView().byId("cmbDemandManager").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if (sourceControlName === "chkGlobalLeader")
			{	
				if(isChecked){
					this.getView().byId("cmbGlobalLeader").setValue("Select..");
					this.getView().byId("cmbGlobalLeader").setEnabled(false);
					this.getView().byId("cmbGlobalLeader").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("cmbGlobalLeader").setEnabled(true);
					this.getView().byId("cmbGlobalLeader").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if (sourceControlName === "chkMarketingDirector")
			{	
				if(isChecked){
					this.getView().byId("cmbMarketingDirector").setValue("Select..");
					this.getView().byId("cmbMarketingDirector").setEnabled(false);
					this.getView().byId("cmbMarketingDirector").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("cmbMarketingDirector").setEnabled(true);
					this.getView().byId("cmbMarketingDirector").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if (sourceControlName === "chkMarketingManager")
			{	
				if(isChecked){
					this.getView().byId("cmbMarketingManager").setValue("Select..");
					this.getView().byId("cmbMarketingManager").setEnabled(false);
					this.getView().byId("cmbMarketingManager").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("cmbMarketingManager").setEnabled(true);
					this.getView().byId("cmbMarketingManager").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if (sourceControlName === "chkMasterPlanner")
			{	
				if(isChecked){
					this.getView().byId("cmbMasterPlanner").setValue("Select..");
					this.getView().byId("cmbMasterPlanner").setEnabled(false);
					this.getView().byId("cmbMasterPlanner").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("cmbMasterPlanner").setEnabled(true);
					this.getView().byId("cmbMasterPlanner").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if (sourceControlName === "chkProductManager")
			{	
				if(isChecked){
					this.getView().byId("cmbProductManager").setValue("Select..");
					this.getView().byId("cmbProductManager").setEnabled(false);
					this.getView().byId("cmbProductManager").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("cmbProductManager").setEnabled(true);
					this.getView().byId("cmbProductManager").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if (sourceControlName === "chkRegionalSupplyChainManager")
			{	
				if(isChecked){
					this.getView().byId("cmbRegionalSupplyChainManager").setValue("Select..");
					this.getView().byId("cmbRegionalSupplyChainManager").setEnabled(false);
					this.getView().byId("cmbRegionalSupplyChainManager").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("cmbRegionalSupplyChainManager").setEnabled(true);
					this.getView().byId("cmbRegionalSupplyChainManager").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if (sourceControlName === "chkSupplyChainManager")
			{	
				if(isChecked){
					this.getView().byId("cmbSupplyChainManager").setValue("Select..");
					this.getView().byId("cmbSupplyChainManager").setEnabled(false);
					this.getView().byId("cmbSupplyChainManager").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("cmbSupplyChainManager").setEnabled(true);
					this.getView().byId("cmbSupplyChainManager").setValueState(sap.ui.core.ValueState.None);
				}
			}
			else if (sourceControlName === "chkSupplyChainPlanningSpecialist")
			{	
				if(isChecked){
					this.getView().byId("cmbSupplyChainPlanningSpecialist").setValue("Select..");
					this.getView().byId("cmbSupplyChainPlanningSpecialist").setEnabled(false);
					this.getView().byId("cmbSupplyChainPlanningSpecialist").setValueState(sap.ui.core.ValueState.Warning);
				}
				else{
					this.getView().byId("cmbSupplyChainPlanningSpecialist").setEnabled(true);
					this.getView().byId("cmbSupplyChainPlanningSpecialist").setValueState(sap.ui.core.ValueState.None);
				}
			}
		},
		//
		getUpdatedCodes: function(){
			// get the crop protection and seeds value from i18n file
	    	var oi18nModel = this.getView().getModel("i18n");
			var updatedAttributesString = "";
			if(showDemandManager){
				if (this.validateRuleValueChange("cmbDemandManager") || this.validateRuleValueChange("chkDemandManager")){
					updatedAttributesString += oi18nModel.getProperty("DEMAND_MANAGER");
					updatedAttributesString += ", ";
				}
			}
			if(showGlobalLeader){
				if (this.validateRuleValueChange("cmbGlobalLeader") || this.validateRuleValueChange("chkGlobalLeader")){
					updatedAttributesString += oi18nModel.getProperty("GLOBAL_LEADER");
					updatedAttributesString += ", ";
				}				
			}
			if(showMarketingDirector){
				if (this.validateRuleValueChange("cmbMarketingDirector") || this.validateRuleValueChange("chkMarketingDirector")){
					updatedAttributesString += oi18nModel.getProperty("MARKETING_DIRECTOR");
					updatedAttributesString += ", ";
				}				
			}
			if(showMarketingManger){
				if (this.validateRuleValueChange("cmbMarketingManager") || this.validateRuleValueChange("chkMarketingManager")){
					updatedAttributesString += oi18nModel.getProperty("MARKETING_MANAGER");
					updatedAttributesString += ", ";
				}				
			}
			if(showMasterPlanner){
				if (this.validateRuleValueChange("cmbMasterPlanner") || this.validateRuleValueChange("chkMasterPlanner")){
					updatedAttributesString += oi18nModel.getProperty("MASTER_PLANNER");
					updatedAttributesString += ", ";
				}				
			}
			if(showProductManager){
				if (this.validateRuleValueChange("cmbProductManager") || this.validateRuleValueChange("chkProductManager")){
					updatedAttributesString += oi18nModel.getProperty("PRODUCT_MANAGER");
					updatedAttributesString += ", ";
				}				
			}
			if(showRegionalSupplychainManager){
				if (this.validateRuleValueChange("cmbRegionalSupplyChainManager") || this.validateRuleValueChange("chkRegionalSupplyChainManager")){
					updatedAttributesString += oi18nModel.getProperty("REG_SUPPLY_CHAIN_MANAGER");
					updatedAttributesString += ", ";
				}				
			}
			if(showSupplyChainManager){
				if (this.validateRuleValueChange("cmbSupplyChainManager") || this.validateRuleValueChange("chkSupplyChainManager")){
					updatedAttributesString += oi18nModel.getProperty("GLOBAL_SUPPLY_CHAIN_MANAGER");
					updatedAttributesString += ", ";
				}				
			}
			if(showSupplyChainPlanningSpecialist){
				if (this.validateRuleValueChange("cmbSupplyChainPlanningSpecialist") || this.validateRuleValueChange("chkSupplyChainPlanningSpecialist")){
					updatedAttributesString += oi18nModel.getProperty("SUPPLY_CHAIN_PLANNING_SPECIALIST");
					updatedAttributesString += ", ";
				}				
			}
			return updatedAttributesString.substring(0, updatedAttributesString.length - 2);
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
			    	batchArray.push(this._oDataModel.createBatchOperation("MST_PEOPLE_RULE(" + editRuleIdList[i].ID + ")", "MERGE", updRule));
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
						curr._oDataModel.remove("/MST_PEOPLE_RULE(" + editRuleIdList[0].ID + ")", {
							success: function(){
								busyDialog.close();
								MessageBox.alert("People for " + successCount + " Rules updated successfully.",
									{
										icon : MessageBox.Icon.SUCCESS,
										title : "Success",
										onClose: function() {
						        			curr.getOwnerComponent().getRouter().navTo("peopleAssignment");
						        	}
								});
							},
							error: function(error){
								busyDialog.close();
				    			MessageBox.alert("People for " + successCount + " Rules updated successfully with errors deleting nulled Rules.",
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
		//
		createUpdateObject: function(){
			// Create current timestamp
			var oDate = new Date();
			var updRule = {
			    		LAST_UPDATED_BY: loggedInUserID,
					    LAST_UPDATED_ON: oDate
			    	};
			if(showDemandManager){
				if(this.getView().byId("chkDemandManager").getSelected()){
						updRule.DEMAND_MANAGER_ID = null;
				}
				else if (this._oViewModelData.DEMAND_MANAGER_ID !== "-1" && this._oViewModelData.DEMAND_MANAGER_ID !== undefined){
						updRule.DEMAND_MANAGER_ID = this._oViewModelData.DEMAND_MANAGER_ID;
				}				
			}
			if(showGlobalLeader){
				if(this.getView().byId("chkGlobalLeader").getSelected()){
						updRule.GLOBAL_BUSINESS_LEADER_ID = null;
				}
				else if (this._oViewModelData.GLOBAL_LEADER_ID !== "-1" && this._oViewModelData.GLOBAL_LEADER_ID !== undefined){
						updRule.GLOBAL_BUSINESS_LEADER_ID = this._oViewModelData.GLOBAL_LEADER_ID;
				}				
			}
			if(showMarketingDirector){
				if(this.getView().byId("chkMarketingDirector").getSelected()){
						updRule.MARKETING_DIRECTOR_ID = null;
				}
				else if (this._oViewModelData.MARKETING_DIRECTOR_ID !== "-1" && this._oViewModelData.MARKETING_DIRECTOR_ID !== undefined){
						updRule.MARKETING_DIRECTOR_ID = this._oViewModelData.MARKETING_DIRECTOR_ID;
				}
			}
			if(showMarketingManger){
				if(this.getView().byId("chkMarketingManager").getSelected()){
						updRule.MARKETING_MANAGER_ID = null;
				}
				else if (this._oViewModelData.MARKETING_MANAGER_ID !== "-1" && this._oViewModelData.MARKETING_MANAGER_ID !== undefined){
						updRule.MARKETING_MANAGER_ID = this._oViewModelData.MARKETING_MANAGER_ID;
				}
			}
			if(showMasterPlanner){
				if(this.getView().byId("chkMasterPlanner").getSelected()){
						updRule.MASTER_PLANNER_ID = null;
				}
				else if (this._oViewModelData.MASTER_PLANNER_ID !== "-1" && this._oViewModelData.MASTER_PLANNER_ID !== undefined){
						updRule.MASTER_PLANNER_ID = this._oViewModelData.MASTER_PLANNER_ID;
				}
			}
			if(showProductManager){
				if(this.getView().byId("chkProductManager").getSelected()){
						updRule.MARKETING_SPECIALIST_ID = null;
				}
				else if (this._oViewModelData.PRODUCT_MANAGER_ID !== "-1" && this._oViewModelData.PRODUCT_MANAGER_ID !== undefined){
						updRule.MARKETING_SPECIALIST_ID = this._oViewModelData.PRODUCT_MANAGER_ID;
				}
			}
			if(showRegionalSupplychainManager){
				if(this.getView().byId("chkRegionalSupplyChainManager").getSelected()){
						updRule.REG_SUPPLY_CHAIN_MANAGER_ID = null;
				}
				else if (this._oViewModelData.REGIONAL_SUPPLY_CHAIN_MANAGER_ID !== "-1" && this._oViewModelData.REGIONAL_SUPPLY_CHAIN_MANAGER_ID !== undefined){
						updRule.REG_SUPPLY_CHAIN_MANAGER_ID = this._oViewModelData.REGIONAL_SUPPLY_CHAIN_MANAGER_ID;
				}
			}
			if(showSupplyChainManager){
				if(this.getView().byId("chkSupplyChainManager").getSelected()){
						updRule.GLOBAL_SUPPLY_CHAIN_MANAGER_ID = null;
				}
				else if (this._oViewModelData.SUPPLY_CHAIN_MANAGER_ID !== "-1" && this._oViewModelData.SUPPLY_CHAIN_MANAGER_ID !== undefined){
						updRule.GLOBAL_SUPPLY_CHAIN_MANAGER_ID = this._oViewModelData.SUPPLY_CHAIN_MANAGER_ID;
				}
			}
			if(showSupplyChainPlanningSpecialist){
				if(this.getView().byId("chkSupplyChainPlanningSpecialist").getSelected()){
						updRule.SUPPLY_CHAIN_PLANNING_SPECIALIST_ID = null;
				}
				else if (this._oViewModelData.SUPPLY_CHAIN_PLANNING_SPECIALIST_ID !== "-1" && this._oViewModelData.SUPPLY_CHAIN_PLANNING_SPECIALIST_ID !== undefined){
						updRule.SUPPLY_CHAIN_PLANNING_SPECIALIST_ID = this._oViewModelData.SUPPLY_CHAIN_PLANNING_SPECIALIST_ID;
				}
			}    	
			//return the object of updated attributes
			return updRule;
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