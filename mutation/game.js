const addGame = g => ({ input }) => { // eslint-disable-line no-shadow
  const { title, publisherId } = input;
  const id = `${g.length + 1}`;
  g.push({ id, title, publisherId }); // mutation
  const i = g.length - 1;
  return [g[i]];
};

module.exports = {
  add: addGame,
};
