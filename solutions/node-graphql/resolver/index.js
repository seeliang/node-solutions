// resolver
const { Publishers, Games } = require("../data");



const Query = {
  hi: () => "hi",
  games: (parent, arg) => arg?.id ? Games.filter(i => i.id === arg.id) : Games, // why parent works same as arg?
  publishers: (parent, arg) => arg?.id ? Publishers.filter(i => i.id === arg.id) : Publishers
}

const resolver = {
  Query,
  GamesTrace: {
    publisher: (parent) => Publishers.filter(i => i.id === parent.publisherId)
  },
  PublishersTrace: {
    games: (parent) =>
      Games.filter(i => i.publisherId === parent.id)
  }
};

module.exports = {
  resolver,
};
