'use strict';

export default {
  endpoint: 'https://api.twitch.tv/kraken',

  clientId: 'sf954451u6y5bcsilwklkw4tsd8za3',

  request (query) {
    return fetch(this.endpoint + query, {
      headers: {
        'Client-ID': this.clientId,
        'accept': 'application/vnd.twitchtv.v5+json', // TODO migrate to the new Twitch API
      }
    })
      .then(response => {
        if (response.status !== 200) {
          throw new Error('Bad response from server');
        }
        return response.json();
      });
  },

  getStreamsByGame (game) {
    return this.request('/streams?game=' + game)
      .then(data => data.streams.map(item => item.channel.name));
  },

  async getStreamInfo (channel) {
    const channelId = await this.getChannelId(channel);
    return this.request('/streams/' + channelId);
  },

  async getChannelId(channel) {
    const response = await this.request(`/users/?login=${channel}`);
    return response && response.users && response.users[0] && response.users[0]._id;
  },

  getGameList () {
    return this.request('/games/top?limit=30')
      .then(data => {
        return data.top.map(item => item.game.name);
      });
  },

  searchGames (query) {
    return this.request('/search/games?type=suggest&live=true&query=' + query)
      .then(data => data.games.map(game => game.name));
  },

  getFeaturedStreams () {
    return this.request('/streams/featured')
      .then(data => data.featured.map(item => item.stream.channel.name));
  }
};
