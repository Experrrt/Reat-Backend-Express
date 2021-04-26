const users = [];

function addUser(id, name, room, _id, img) {
  const index = users.findIndex((user) => user.id == id);
  if (index !== -1) users[index] = { id, name, room, _id, img };
  else users.push({ id, name, room, _id, img });
  // console.log(users);
  return { id, name, room, _id, img };
}

function getUser(id) {
  console.log("all users:");
  users.map((x) => {
    console.log(x.id);
  });
  const index = users.findIndex((user) => user.id == id);
  if (index === -1) return;
  return users[index];
}

function getJoinedUsers() {
  const map = users.map((x) => {
    return {
      user: {
        name: x.name,
        id: x._id,
        img: x.img,
      },
    };
  });
  return map;
}

function userLeave(id) {
  const index = users.findIndex((user) => user.id == id);
  if (index === -1) return;
  const leaver = users[index];
  users.splice(index, 1);
  return leaver;
}

module.exports = {
  addUser,
  getUser,
  getUsers: getJoinedUsers,
  userLeave,
};
