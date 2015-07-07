define([
'async!https://maps.google.com/maps/api/js?sensor=false',
'views/BaseView',
'text!templates/BoatDayTemplate.html', 
'text!templates/SeatRequestsTemplate.html'
], function(gmaps, BaseView, BoatDayTemplate, SeatRequestsTemplate){
	var BoatDayView = BaseView.extend({

		className: "view-boatday-update",
		
		template: _.template(BoatDayTemplate),

		seatRequests: {},

		events : {
			'submit form' : 'update',
			"click .update-seatRequests": "updateSeatRequest"

		},

		_map: null,

		_marker: null,

		render: function() {

			BaseView.prototype.render.call(this);

			this.renderSeatRequests();

			this.$el.find('.date').datepicker({
				startDate: '0d',
				autoclose: true
			});

			if( this.model.get('date') ) {
				this.$el.find('.date').datepicker('setDate', this.model.get('date'));

			}

			this.setupGoogleMap();

			return this;

		}, 

		updateSeatRequest: function(event) {

			event.preventDefault();

			var self = this;
			
			// var data = {

			// 	status: this._in('status').val(),
			// 	contribution: this._in('contribution').val(),
			// 	seats: this._in('seats').val(),
			// 	rating: this._in('rating').val()
			// };

			// var seatRequestUpdateSuccess = function( boatday ) {

			// 	self.render();

			// };

			// var query = self.model.relation('seatRequests').get(self.seatRequests.id).query();
			// query.save(data).then(seatRequestUpdateSuccess);
			alert("Still TODO")
			
		},

		setupGoogleMap: function() {

			var self = this;

			var displayMap = function(latlng) {

				var opts = {
					zoom: 10,
					center: latlng
				};

				if( !self._map ) {
					
					var ctn = self.$el.find('.map').get(0);
					self._map = new google.maps.Map(ctn, opts);

					google.maps.event.addListener(self._map, 'click', function(event) {

						self.moveMarker(event.latLng)

					});

				}

				if( self.model.get('location') ) {

					self.moveMarker(new google.maps.LatLng(self.model.get('location').latitude, self.model.get('location').longitude));

				}

			};

			var handlePosition = function(position) {

    			displayMap(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

			};

			var handleNoPosition = function(error) {

				displayMap(new google.maps.LatLng(25.761919, -80.190225));

			};

			if (navigator.geolocation) {

				// Edit DC: 
				// The navigator takes too much time and blocks everything. We prefere to desactivate it.

				// navigator.geolocation.getCurrentPosition(handlePosition, handleNoPosition);
				handleNoPosition();

			} else {

				handleNoPosition();

			}

		},

		moveMarker: function(latlng) {

			var self = this;

			var gotAddress = function (results, status) {

				if (status === google.maps.GeocoderStatus.OK) {

					if (results[0]) {
						var addr = results[0].formatted_address;
						self._in('locationText').val(addr.slice(0, addr.lastIndexOf(",")));
					
					}

				}

			};

			self._map.panTo(latlng);

			new google.maps.Geocoder().geocode({ 'latLng': latlng }, gotAddress);

			if( !self._marker ) {
					
				self._marker = new google.maps.Marker({
					map: self._map,
					draggable: true,
					animation: google.maps.Animation.DROP,
					position: latlng
				});

			} else {

				self._marker.setPosition(latlng);

			}

		},

		renderSeatRequests: function() {

			var self = this;

			this.$el.find('#seatRequests').html("");
			var tpl = _.template(SeatRequestsTemplate);

			var query = self.model.relation('seatRequests').query();
			query.find().then(function(matches) {
				_.each(matches, function(seatRequests){
					
					console.log(seatRequests.get('profile'));
					var data = {

						id: seatRequests.id, 
						rating: seatRequests.get('rating'),
						seats: seatRequests.get('seats'),
						status: seatRequests.get('status'), 
						contribution: seatRequests.get('contribution'), 
						profile: seatRequests.get('profile'), 
						//displayName: seatRequests.get('profile').get('displayName')
					}
					self.$el.find('#seatRequests').append( tpl(data) );
				});
			});
		},

		update: function(event) {
			
			event.preventDefault();

			var data = {

				availableSeats: parseInt(this._in('availableSeats').val()),
				bookingPolicy: this._in('bookingPolicy').val(),
				cancellationPolicy: this._in('cancellationPolicy').val(), 
				category: this._in('category').val(), 
				date: this._in('date').datepicker('getDate'),
				departureTime: parseInt(this._in('departureTime').val()), 
				description: this._in('description').val(), 
				duration: parseInt(this._in('duration').val()), 
				name: this._in('name').val(), 
				price: parseInt(this._in('price').val()), 
				status: this._in('status').val(), 
				category: this._in('activity').val(),
				location: self._marker ? new Parse.GeoPoint({latitude: self._marker.getPosition().lat(), longitude: self._marker.getPosition().lng()}) : null,
				locationText: this._in('locationText').val(),
				features: {
					leisure: {
						cruising: Boolean(this.$el.find('[name="featuresLeisureCruising"]').is(':checked')),
						partying: Boolean(this.$el.find('[name="featuresLeisurePartying"]').is(':checked')),
						sightseeing: Boolean(this.$el.find('[name="featuresLeisureSightseeing"]').is(':checked')),
						other: Boolean(this.$el.find('[name="featuresLeisureOther"]').is(':checked'))
					},
					fishing: {
						flats: Boolean(this.$el.find('[name="featuresFishingFlats"]').is(':checked')),
						lake: Boolean(this.$el.find('[name="featuresFishingLake"]').is(':checked')),
						offshore: Boolean(this.$el.find('[name="featuresFishingOffshore"]').is(':checked')),
						recreational: Boolean(this.$el.find('[name="featuresFishingRecreational"]').is(':checked')),
						other: Boolean(this.$el.find('[name="featuresFishingOther"]').is(':checked')),
						equipment: Boolean(this.$el.find('[name="featuresFishingEquipment"]').is(':checked')),
						equipmentItems: {
							bait: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsBait"]').is(':checked')),
							lines: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsLines"]').is(':checked')),
							hooks: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsHooks"]').is(':checked')),
							lures: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsLures"]').is(':checked')),
							nets: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsNets"]').is(':checked')),
							rods: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsRods"]').is(':checked')),
							sinkers: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsSinkers"]').is(':checked'))
						}
					},
					sports: {
						snorkeling: Boolean(this.$el.find('[name="featuresSportsSnorkeling"]').is(':checked')),
						tubing: Boolean(this.$el.find('[name="featuresSportStubing"]').is(':checked')),
						wakeBoarding: Boolean(this.$el.find('[name="featuresSportsWakeBoarding"]').is(':checked')),
						waterSkiing: Boolean(this.$el.find('[name="featuresSportsWaterSkiing"]').is(':checked')),
						equipment: Boolean(this.$el.find('[name="featuresSportsEquipment"]').is(':checked')),
						equipmentItems: {
							fins: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsFins"]').is(':checked')),
							helmets: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsHelmets"]').is(':checked')),
							masks: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsMasks"]').is(':checked')),
							snorkels: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsSnorkels"]').is(':checked')),
							towLine: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsTowLine"]').is(':checked')),
							tubes: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsTubes"]').is(':checked')),
							wakeboard: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsWakeboard"]').is(':checked')),
							waterSkis: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsWaterSkis"]').is(':checked'))
						}
					},
					global: {
						children: Boolean(this.$el.find('[name="featuresGlobalChildren"]').is(':checked')),
						smoking: Boolean(this.$el.find('[name="featuresGlobalSmoking"]').is(':checked')),
						drinking: Boolean(this.$el.find('[name="featuresGlobalDrinking"]').is(':checked')),
						pets: Boolean(this.$el.find('[name="featuresGlobalPets"]').is(':checked')) 
					}, 
					extras: {
						food: Boolean(this.$el.find('[name="featuresExtrasFood"]').is(':checked')),
						drink: Boolean(this.$el.find('[name="featuresExtrasDrink"]').is(':checked')),
						music: Boolean(this.$el.find('[name="featuresExtrasMusic"]').is(':checked')),
						towels: Boolean(this.$el.find('[name="featuresExtrasTowels"]').is(':checked')),
						sunscreen: Boolean(this.$el.find('[name="featuresExtrasSunscreen"]').is(':checked')),
						inflatables: Boolean(this.$el.find('[name="featuresExtrasInflatables"]').is(':checked'))
					}
				}

			};
			
			var boatdayUpdateSuccess = function( boatday ) {

				Parse.history.navigate('boatdays', true);

			};

			this.model.save(data).then(boatdayUpdateSuccess);

		},

	});
	return BoatDayView;
});
