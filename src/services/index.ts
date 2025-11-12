import AuthService from "./auth";
import MapService from "./map";
import { storeService } from "./store";

export const Service = {
  auth: new AuthService(),
  map: new MapService(),
  store: storeService,
};
