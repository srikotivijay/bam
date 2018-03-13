sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"bam/services/DataContext",
		"sap/ui/model/resource/ResourceModel"
	], function (Controller,DataContext,ResourceModel) {
		"use strict";
		
	return Controller.extend("bam.controller.MaintainRules", {
		// Navigate to CU SUB CU Assignment page
		onGoToCuSubCuAssignment : function(){
			this.getOwnerComponent().getRouter().navTo("cuAssignment");
		},
		// navigate back to the homepage
		onHome: function(){
		//	var oSmartTable = this.byId("smartTblBAMAttributes");
			//oSmartTable.exit();
			this.getOwnerComponent().getRouter().navTo("home");
		}
  	});
});