import { apiBaseUrl } from "./tempEnv";

function _endpoint(name: string) {
  return `${apiBaseUrl}/${name}`;
}

export const apiEndpoints = {
  people: {
    getAll: _endpoint("people"),
    getById: (id: number | string) => _endpoint(`people/${id}`),
  },
  cells: {
    getAll: _endpoint("cells"),
    getById: (id: number | string) => _endpoint(`cells/${id}`),

  },

  getPersonOfUid: _endpoint("getPersonOfUid"),
};
