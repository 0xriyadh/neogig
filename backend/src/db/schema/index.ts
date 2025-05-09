import * as user from "./user";
import * as jobSeeker from "./jobSeeker";
import * as company from "./company";
import * as job from "./job";
import * as application from "./application";
import * as savedJob from "./savedJob";
import * as jobQuestion from "./jobQuestion";

export default {
    ...user,
    ...jobSeeker,
    ...company,
    ...job,
    ...application,
    ...savedJob,
    ...jobQuestion,
};
