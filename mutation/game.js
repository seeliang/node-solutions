const addGame = g => ({ input }) => { // eslint-disable-line no-shadow
  const { title, publisherId } = input;
  const id = `${g.length + 1}`;
  g.push({ id, title, publisherId }); // mutation
  const i = g.length - 1;
  return [g[i]];
};

const editGame = g => ({ input }) => {
  const { id, title, publisherId } = input;
  const keyIndex = g.reduce((r, s, index) => (s.id === id ? index : r), 0);
  g.splice(keyIndex, 1, { id, title, publisherId }); // mutation
  return [g[keyIndex]];
};

module.exports = {
  add: addGame,
  edit: editGame,
};
