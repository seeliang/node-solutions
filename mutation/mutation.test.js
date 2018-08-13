const { expect } = require('chai');
const { describe, it } = require('mocha');
const mutation = require('./index.js');

// const Games = [
//   { id: '1', title: 'metal gear solid', publisherId: '1' },
//   { id: '2', title: 'god of war', publisherId: '2' },
//   { id: '3', title: 'winning eleven', publisherId: '1' },
// ];

const Publishers = [
  { id: '1', title: 'konami' },
  { id: '2', title: 'santa monica' },
];

describe('mutation', () => {
  describe('publishers', () => {
    it('should add publishers', () => {
      const testPublishers = [].concat(Publishers);
      const newPublisher = { title: 'capcom' };
      const result = mutation.publisher.add(testPublishers)({ input: newPublisher });
      expect(result).to.deep.eq([{ id: '3', title: 'capcom' }]);
      expect(testPublishers).to.deep.eq(
        [
          { id: '1', title: 'konami' },
          { id: '2', title: 'santa monica' },
          { id: '3', title: 'capcom' },
        ],
      );
    });
  });
});
