const axios = require('axios');
const vercelToken = 'qvDXUViZnEGfqoE0EAM1J3gC'; //Replace with your token
const apiEndPt = 'https://api.vercel.com/v6/deployments?teamId=devjobs'; // Replace '[teamID]' with your team ID

let config = {
  method: 'get',
  url: apiEndPt,
  headers: {
    Authorization: 'Bearer ' + vercelToken,
  },
};

let results = [];

(function loop() {
  axios(config)
    .then(function(response) {
      results.push(...response.data);
      if (response.data.pagination && response.data.pagination.next !== null) {
        config.url = `${apiEndPt}&until=${response.data.pagination.next}`;
        loop();
      } else {
        //you can use the final results object and for example save it to a file
        console.log(results);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
})();
