import { apiBaseUrl } from "./tempEnv";

function _endpoint(name:string){
  return `${apiBaseUrl}/${name}`;
}

export const apiEndpoints = {
    cells: {
        getAll: _endpoint("cells")
    }
}