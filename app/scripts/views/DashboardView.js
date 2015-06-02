define([
'views/BaseView',
'text!templates/DashboardTemplate.html'
], function(BaseView, DashboardTemplate){
	var DashboardView = BaseView.extend({

		className: "view-dashboard",
		
		template: _.template(DashboardTemplate),

		render: function() {

			BaseView.prototype.render.call(this);
			this.renderBoatsCompleteStatus();
			this.renderBoatsEditingStatus();
			this.renderStatistics();
			this.renderUpcomingEvents();
			this.renderGoneEvents();
			this.renderBoatdaysNumber();
			return this;

		},

		renderBoatsCompleteStatus: function() {

			var boats = Parse.Object.extend("Boat");
			var query = new Parse.Query(boats);
			query.equalTo("status", "complete");

			query.find({

				success: function(results) {

					//Number of boats with complete status
					var boatsCompleteStatus = results.length;
					$('#boatsCompleteStatus').html(boatsCompleteStatus);

					var output = '';

					for (var i = 0; i < results.length; i++) { 

					  	var object = results[i];

						output += '<li class = "list-group-item list-group-item-info">' + object.get('name') + '</li>';

					}

				   $('#boats-status-complete').html(output);

				}, 

				error: function(error) {

					alert("Error: " + error.code + " " + error.message);

				}

			});

		}, 

		renderBoatsEditingStatus: function() {

			var boats = Parse.Object.extend("Boat");
			var query = new Parse.Query(boats);
			query.equalTo("status", "editing");

			query.find({

				success: function(results) {

					//Number of boats with editing status
					var boatsEditingStatus = results.length;
					$('#boatsEditingStatus').html(boatsEditingStatus);

					var output = '';

					for (var i = 0; i < results.length; i++) {

						var object = results[i];

						output += '<li class="list-group-item list-group-item-info">' + object.get('name') + '</li>';
					}

					$('#boats-status-editing').html(output);
				}, 

				error: function(error) {

					alert("Error: " + error.code + " " + error.message);

				}

			});
		},

		renderStatistics: function() {

			var boats = Parse.Object.extend("Boat");
			var query = new Parse.Query(boats);

			query.find({

				success: function(results) {
					
					var boatsNumber = results.length;
					$('#boatsNumber').html(boatsNumber);
				}

			});
		}, 

		renderUpcomingEvents: function() {

			var boatDays = Parse.Object.extend("BoatDay");
			var query = new Parse.Query(boatDays);
			query.greaterThan("date", new Date());

			query.find({

				success: function(results) {

					var upcomingEvents = results.length;
					$('#boatdaysFuture').html(upcomingEvents);
				}

			});
		
		}, 

		renderGoneEvents: function() {

			var boatDays = Parse.Object.extend("BoatDay");
			var query = new Parse.Query(boatDays);
			query.lessThan("date", new Date());

			query.find({

				success: function(results) {

					var goneEvents = results.length;
					$('#boatdaysPast').html(goneEvents);
				}

			});
		
		}, 

		renderBoatdaysNumber: function() {

			var boatDays = Parse.Object.extend("BoatDay");
			var query = new Parse.Query(boatDays);

			query.find({

				success: function(results) {

					var boatdaysNumber = results.length;
					$('#boatdaysNumber').html(boatdaysNumber);
				}

			});


		}


	});
	return DashboardView;
});
