var profile = require('../../profile');

var extend  = require('extend');


function ownershipProfiler(parent) {

	extend(this, parent);

	var _                 = this.util._;
	var ownershipProfiler = this;

	this.start      = function start(dataset, profilerCallback) {


		var metadtaKeys     = ["maintainer", "maintainer_email", "owner_org", "author", "author_email"];
		var profileTemplate = new profile(this);

		var root            = dataset.result ? dataset.result : dataset;
		var dataset_keys    = _.keys(root);

		_.each(metadtaKeys, function(key, index) {
			if (_.has(root, key)) {
				if (!root[key] || _.isEmpty(root[key]))
					profileTemplate.addEntry("undefined", key, key + " field exists but there is no value defined");
			} else profileTemplate.addEntry("missing", key, key + " field is missing");
		});

				// Check if the groups object is defined and run the profiling process on its sub-components
		if (_.has(root, "organization") && root.organization) {

			var organizationKeys     = ["description", "title", "created", "approval_status", "revision_timestamp", "revision_id", "is_organization", "state", "type", "id", "name"];

			// Loop through the meta keys and check if they are undefined or missing
			_.each(organizationKeys, function(key, index) {
				// give specific names for organization fields to differentiate them from general metadata keys
				var entryKey = key == "is_organization" ? "is_organization" : "organization_" + key;

				if (_.has(root.organization, key)) {
					if (!root.organization[key] || _.isEmpty(root.organization[key])) {
						profileTemplate.addEntry("undefined", entryKey, entryKey + " field exists but there is no value defined");
					}
				} else profileTemplate.addEntry("missing", entryKey, entryKey + " field is missing");
			});

		} else profileTemplate.addEntry("missing", "organization", "organization information is missing");



		// Check the validity of the email addresses provided
		if (_.has(root, "maintainer_email") && root.maintainer_email)
			if (! ownershipProfiler.util.validator.isEmail(root.maintainer_email))
				profileTemplate.addEntry("report", "maintainer_email is not a valid e-mail address !");
		if (_.has(root, "author_email") && root.author_email)
			if (! ownershipProfiler.util.validator.isEmail(root.author_email))
				profileTemplate.addEntry("report", "author_email is not a valid e-mail address !");

		// Check if the image_url field for organization is referenceable
		if (_.has(root, "organization") && _.has(root.organization, "image_url")) {
			 ownershipProfiler.util.checkAddress(root.organization.image_url, function(error, body) {
				if (error) {
					profileTemplate.addEntry("report", "The organization image_url defined for this dataset is not reachable !");
					if (root.organization.image_url) {
						profileTemplate.addEntry("unreachableURLs", root.organization.image_url);
					}
					profilerCallback(false, profileTemplate.getProfile());
				} else profilerCallback(false, profileTemplate.getProfile());
			});
		}
	}
}

module.exports = ownershipProfiler;