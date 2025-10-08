import AuthService from "./auth";
import MapService from "./map";

export const Service = {
  auth: new AuthService(),
  map: new MapService(),
};
