const addPublisher = p => ({ input }) => { // eslint-disable-line no-shadow
  const { title } = input;
  const id = `${p.length + 1}`;
  p.push({ id, title }); // mutation
  const i = p.length - 1;
  return [p[i]];
};


const editPublisher = p => ({ input }) => {
  const { id, title } = input;
  if (!p.some((s) => s.id === id)) {
    console.log(`Publisher with id ${id} not found. No changes made.`);
    return [];
  }
  const keyIndex = p.reduce((r, s, index) => (s.id === id ? index : r), 0);
  p.splice(keyIndex, 1, { id, title }); // mutation
  return [p[keyIndex]];
};

module.exports = {
  add: addPublisher,
  edit: editPublisher,
};
