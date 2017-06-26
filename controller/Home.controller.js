sap.ui.define([
		"sap/ui/core/mvc/Controller"
	], function (Controller) {
		"use strict";

	return Controller.extend("bam.controller.Home", {
		// Navigate to GMID Submission page
		onGoToGMIDSubmission : function(){
			this.getOwnerComponent().getRouter().navTo("gmidSubmission");
		},
		// Navigate to Maintain Attributes page
		onGoToMaintainAttributes: function(){
			this.getOwnerComponent().getRouter().navTo("maintainAttributes");
		}
  	});
});