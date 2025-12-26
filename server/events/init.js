// server/events/init
const jobEvents = require("./handlers/jobEvents");
const recruiterEvents = require("./handlers/recruiterEvents");
const userEvents = require("./handlers/userEvents");
const { onEvent } = require("./index");

//Event build user profile và vector khi có thay đổi hành vi người dùng
onEvent("USER_BEHAVIOR_CHANGED", userEvents.onUserBehaviorChanged);
onEvent("USER_SKILL_CHANGED", userEvents.onUserSkillChanged);

// Event build recruiter vector khi có thay đổi preference của recruiter
onEvent("RECRUITER_PREF_CHANGED", recruiterEvents.onRecruiterPreferenceChanged);

// Event build job vector khi có thay đổi job
onEvent("JOB_CHANGED", jobEvents.onJobChanged);
