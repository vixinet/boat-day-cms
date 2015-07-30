define([
'views/BaseView',
'text!templates/SendNotification.html'
], function(BaseView, SendNotification){
	var SendNotificationView = BaseView.extend({

		className: "view-host-update",
		
		template: _.template(SendNotification),

		collectionProfiles: {},

		events : {
			"submit form" : "send"
		},

		render: function() {

			BaseView.prototype.render.call(this);
			var self = this;

			
			var fetched = 0;
			var total = 0;
			var select = $('<select>').attr({ id: 'profile', name: 'profile', class: 'form-control' });

			var doQuery = function() {
				console.log('fetched='+fetched);
				console.log('total='+total);

				queryProfiles.find().then(function(matches) {
					
					_.each(matches, function(profile) {
						select.append($('<option>').attr('value', profile.id).text(profile.get('firstName') + ' ' + profile.get('lastName')));
						self.collectionProfiles[profile.id] = profile;
					});

					fetched += matches.length;

					if( total > fetched) {
						queryProfiles.skip(fetched);
						doQuery();
					} else {
						self.$el.find('.profiles').html(select);
					}
					
				});
			};

			var queryProfiles = new Parse.Query(Parse.Object.extend("Profile"));
			queryProfiles.equalTo('status', 'complete');
			queryProfiles.ascending('displayName');
			queryProfiles.limit(500);
			queryProfiles.count().then(function(_total) {
				total = _total;
				doQuery();
			});

			

			return this;
		}, 

		send: function(event) {

			event.preventDefault();

			var self = this;
			
			console.log();

			var data = {
				to: self.collectionProfiles[this._in('profile').val()],
				action: "bd-message", 
				message: this._in('message').val(), 
				fromTeam: true,
				from: Parse.User.current().get('profile'), 
				//sendEmail: Boolean(this._in('sendEmail').val().selected)
				sendEmail: Boolean(this.$el.find('[name="sendEmail"]').val())
				// boat: this.model
				// boatday: this.model
			}; 

			var sendNotificationSuccess = function( SendNotification ) {

				Parse.history.navigate('dashboard', true);

			};

			this.model.save(data).then(sendNotificationSuccess);

		}

	});
	return SendNotificationView;
});
