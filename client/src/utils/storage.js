// code to save and retrieve user, also add 1 day to the expiry date

const saveUser = (user) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 1);
  localStorage.setItem("user", JSON.stringify({ ...user, expiry }));
};

const getUser = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && new Date(user.expiry) > new Date()) {
    return user;
  } else {
    localStorage.removeItem("user");
  }
  return null;
};

export { saveUser, getUser };