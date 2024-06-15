import { manifest } from "~/middleware/config-routing";

export default eventHandler((event) => {
    return manifest;
});
  