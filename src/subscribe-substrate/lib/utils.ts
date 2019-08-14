require("dotenv").config();

// gets the event sections to filter on
// if not set in the .env file then all events are processed
export const getEventSections = function() {
    const sections = process.env.SUBSTRATE_EVENT_SECTIONS;
    if (sections) {
        return sections.split(",");
    } else {
        return ["all"];
    }
};


export const getEventMethods = function() {
    const methods = process.env.SUBSTRATE_EVENT_METHODS;
    if (methods) {
        return methods.split(",");
    } else {
        return ["all"];
    }
};
