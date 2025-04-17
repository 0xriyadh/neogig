import * as user from "./user";
import * as jobSeeker from "./jobSeeker";
import * as company from "./company";

export default {
    ...user,
    ...jobSeeker,
    ...company,
};
