const userEvents = require("./handlers/userEvents");
const { onEvent } = require("./index");

//Event build user profile và vector khi có thay đổi hành vi người dùng
onEvent("USER_BEHAVIOR_CHANGED", userEvents.onUserBehaviorChanged);
onEvent("USER_SKILL_CHANGED", userEvents.onUserSkillChanged);

console.log("[EventBus] Loaded event handlers");
