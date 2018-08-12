const addPublisher = p => ({ input }) => { // eslint-disable-line no-shadow
  const { title } = input;
  const id = `${p.length + 1}`;
  p.push({ id, title }); // not working ? => p = [...p, newPublisher];
  const i = p.length - 1;
  return [p[i]];
};


module.exports = {
  add: addPublisher,
};
