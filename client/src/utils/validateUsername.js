export default function validateUsername(username) {
    // check if username is empty
    if (!username) {
        return {status :false ,message: "Username is required"};
    }
    // username should not contain special characters except underscore and dot
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
        return {status :false ,message: "Username should not contain special characters"};
    }
    // username should not contain spaces
    if (/\s/.test(username)) {
        return {status :false ,message: "Username should not contain spaces"};
    }
    // username should not be less than 3 characters
    if (username.length < 3) {
        return {status :false ,message: "Username should not be less than 3 characters"};
    }
    // username should not be more than 20 characters
    if (username.length > 20) {
        return {status :false ,message: "Username should not be more than 20 characters"};
    }
    return {status :true ,message: ""};
}