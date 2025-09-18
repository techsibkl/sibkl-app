import { apiBaseUrl } from "./tempEnv";

function _endpoint(name: string) {
  return `${apiBaseUrl}/${name}`;
}

export const apiEndpoints = {
  people: {
    getAll: _endpoint("people"),
    getById: (id: number | string) => _endpoint(`people/${id}`),
    geteWithNoUid: _endpoint(`people/with-no-uid`),
  },
  cells: {
    getAll: _endpoint("cells"),
    getById: (id: number | string) => _endpoint(`cells/${id}`),
  },
  resources: {
    getAll: _endpoint("resources"),
  },
  createAccount: _endpoint("createAccount"),
  getPersonOfUid: _endpoint("getPersonOfUid"),
};
