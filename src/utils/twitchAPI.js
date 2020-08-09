const axios = require('axios');

const twitchNewAPI = axios.create({
    baseURL: 'https://api.twitch.tv/helix',
    headers: {
      Authorization: `Bearer ${process.env.AUTHORIZATION}`,
      'Client-ID': process.env.TWITCH_CLIENT_ID
    },
});

module.exports.getUser = async function(name) {
    const { data } = await twitchNewAPI.get(`/users?login=${name}`);
    return data.data[0];
}