export default function validatePassword(password) {
    if (password.length < 6) {
      return {status :false ,message: "Password must be at least 6 characters long"};
    }
    // it must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
    if (!regex.test(password)) {
      return {status :false ,message: "Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character"};
    }
    return {status :true ,message: ""};
  }