const addPublisher = p => ({ input }) => { // eslint-disable-line no-shadow
  const { title } = input;
  const id = `${p.length + 1}`;
  p.push({ id, title }); // mutation
  const i = p.length - 1;
  return [p[i]];
};


const editPublisher = p => ({ input }) => {
  const { id, title } = input;
  const keyIndex = p.reduce((r, s, index) => (s.id === id ? index : r), 0);
  p.splice(keyIndex, 1, { id, title }); // mutation
  return [p[keyIndex]];
};

module.exports = {
  add: addPublisher,
  edit: editPublisher,
};
