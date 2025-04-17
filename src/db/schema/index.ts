import * as user from "./user";
import * as jobSeeker from "./jobSeeker";
import * as company from "./company";
import * as job from "./job";
import * as application from "./application";

export default {
    ...user,
    ...jobSeeker,
    ...company,
    ...job,
    ...application,
};
