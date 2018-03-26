sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"bam/services/DataContext",
		"sap/m/MessageBox",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/core/routing/History",
		"sap/ui/model/Filter",
		"sap/ui/model/Sorter"
	], function (Controller,DataContext,MessageBox,ResourceModel,History,Filter,Sorter) {
		"use strict";

  	var loggedInUserID;
	var firstTimePageLoad = true;
	return Controller.extend("bam.controller.CUAssignment", {
		onInit : function () {
			// Get logged in user id
		    loggedInUserID = DataContext.getUserID();
			 // define a global variable for the oData model		    
		   	var oView = this.getView();
		   	oView.setModel(this.getOwnerComponent().getModel());
		   	this._oModel = new sap.ui.model.json.JSONModel();
		   	this._oModel.setProperty("/showEditButton",false);
		   	this.getView().setModel(this._oModel,"CUAssignmentVM");
		   		// get resource model
			this._oi18nModel = this.getOwnerComponent().getModel("i18n");
			this._oDataModel = new sap.ui.model.odata.ODataModel("/ODataService/BAMDataService.xsodata/", true);
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
						this._oModel.setProperty("/showEditButton",true);
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
	    		//remove the selection column
	    		var oSmartTable = this.getView().byId("smartTblCUAssignment");     //Get Hold of smart table
				var oTable = oSmartTable.getTable();          //Analytical Table embedded into SmartTable

				oTable.setEnableColumnFreeze(true);
				//oTable.getColumns();
		    	
		    	if(firstTimePageLoad)
		    	{
		    		//attach _onRouteMatched to be called everytime on navigation to Maintain Attributes page
		    		var oRouter = this.getRouter();
					oRouter.getRoute("cuAssignment").attachMatched(this._onRouteMatched, this);
		    	}				
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
				if(firstTimePageLoad)
				{
					firstTimePageLoad = false;
				}
				else
				{
					this.onInit();
				}
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
		if(selectedIndicesLength > 1){
		index = this._oSmartTable.getSelectedIndices();
		var ids="";
		var idArr = [];
		
		var performFullList = false;

		for (var i=0;i < index.length;i++)
		{
			context = this._oSmartTable.getContextByIndex(index[i]); 
			if(context != undefined){
				path = context.getPath();
				indexOfParentheses1 = path.indexOf("(");
				indexOfParentheses2 = path.indexOf(")");
				ids=path.substring(indexOfParentheses1 + 1,indexOfParentheses2);
				idArr.push(ids);
			}
			else{
				//if undefined record is hit then stop and go do the full grab
				performFullList = true;
				break;
			}
		}

		if (performFullList){
			idArr = [];
			
			var editSelection = this.getAllRules();
			for (var i=0;i < index.length;i++)
			{
				context = editSelection[index[i]]; 
				if(context != undefined){
					
					idArr.push(context.ID);

				}
			}
		}
		
		
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
		}
  	});
});