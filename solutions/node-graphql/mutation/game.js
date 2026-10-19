const addGame = ({ publishers, games }) => ({ input }) => {
  const { title, publisherId } = input;
  console.log(publishers, publisherId);
  const id = `${games?.length + 1}`;
  if (!publishers?.some((p) => p.id === publisherId)) {
    console.log(`Publisher with id ${publisherId} not found. No changes made.`);
    return {
      game: null,
      userErrors: [{ field: ['input', 'publisherId'], message: `Publisher with id ${publisherId} not found. No changes made.` }],
    };
  }
  console.log(`Adding game with id ${id}, title ${title}, publisherId ${publisherId}`);
  games.push({ id, title, publisherId }); // mutation
  const i = games.length - 1;
  return {
    game: games[i],
    userErrors: [],
  };
};

const editGame = g => ({ input }) => {
  const { id, title, publisherId } = input;
  if (!g.some((s) => s.id === id)) {
    console.log(`Game with id ${id} not found. No changes made.`);
    return {
      game: null,
      userErrors: [{ field: ['input', 'id'], message: `Game with id ${id} not found. No changes made.` }],
    };
  }
  const keyIndex = g.reduce((r, s, index) => (s.id === id ? index : r), 0);
  g.splice(keyIndex, 1, { id, title, publisherId }); // mutation
  return {
    game: g[keyIndex],
    userErrors: [],
  };
};

module.exports = {
  add: addGame,
  edit: editGame,
};
