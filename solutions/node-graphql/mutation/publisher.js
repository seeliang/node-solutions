const addPublisher = p => ({ input }) => { // eslint-disable-line no-shadow
  const { title } = input;
  const id = `${p.length + 1}`;
  p.push({ id, title }); // mutation
  const i = p.length - 1;
  const result = {
    publisher: p[i],
    userErrors: [],
  }
  return result;
};


const editPublisher = p => ({ input }) => {
  const { id, title } = input;
  if (!p.some((s) => s.id === id)) {
    const result = {
      publisher: null,
      userErrors: [{ field: ['input', 'id'], message: `Publisher with id ${id} not found. No changes made.` }],
    }
    return result;
  }
  const keyIndex = p.reduce((r, s, index) => (s.id === id ? index : r), 0);
  p.splice(keyIndex, 1, { id, title }); // mutation
  return {
    publisher: p[keyIndex],
    userErrors: [],
  }
};

module.exports = {
  add: addPublisher,
  edit: editPublisher,
};
