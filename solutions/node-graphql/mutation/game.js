const addGame = g => ({ input }) => {
  const { title, publisherId } = input;
  const id = `${g.length + 1}`;
  if (!g.some((s) => s.publisherId === publisherId)) {
    console.log(`Publisher with id ${publisherId} not found. No changes made.`);
    return [];
  }
  g.push({ id, title, publisherId }); // mutation
  const i = g.length - 1;
  return [g[i]];
};

const editGame = g => ({ input }) => {
  const { id, title, publisherId } = input;
  if (!g.some((s) => s.id === id)) {
    console.log(`Game with id ${id} not found. No changes made.`);
    return [];
  }
  const keyIndex = g.reduce((r, s, index) => (s.id === id ? index : r), 0);
  g.splice(keyIndex, 1, { id, title, publisherId }); // mutation
  return [g[keyIndex]];
};

module.exports = {
  add: addGame,
  edit: editGame,
};
