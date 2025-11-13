import { apiBaseUrl } from "./tempEnv";

function _endpoint(name: string) {
	return `${apiBaseUrl}/${name}`;
}

export const apiEndpoints = {
	announcements: {
		getAll: _endpoint("announcements"),
	},
	people: {
		getAll: _endpoint("people"),
		getById: (id: number | string) => _endpoint(`people/${id}`),
		geteWithNoUid: _endpoint(`people/with-no-uid`),
		update: (id: number | string) => _endpoint(`people/update/${id}`),
	},
	peopleFlows: {
		getAll: _endpoint("peopleFlows"),
		add: _endpoint("peopleFlows/add"),
		complete: _endpoint("peopleFlows/complete"),
		updateCustomAttr: _endpoint("peopleFlows/updateCustomAttr"),
		updateLastContacted: _endpoint("peopleFlows/updateLastContacted"),
		updateStatus: _endpoint("peopleFlows/updateStatus"),
		updateStep: _endpoint("peopleFlows/updateStep"),
	},
	cells: {
		getAll: _endpoint("cells"),
		getById: (id: number | string) => _endpoint(`cells/${id}`),
	},
	resources: {
		getAll: _endpoint("resources"),
	},
	otp: {
		create: _endpoint("otp/create"),
		verify: _endpoint("otp/verify"),
	},
	users: {
		createAccount: _endpoint("users/create-account"),
		createUserWithExistingPerson: _endpoint(
			"users/create-user-with-existing-person"
		),
		getPersonOfUid: _endpoint("users/get-person-of-uid"),
		updateDeviceToken: _endpoint("users/update-device-token"),
	},
};
