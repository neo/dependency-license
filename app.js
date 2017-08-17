require('dotenv').config();
const app = require('express')();
const request = require('request-promise-native');
const getDependencyLicense = require('./get-dependency-license');

const api = 'https://api.github.com';
const access_token = process.env.GITHUB_ACCESS_TOKEN;
const user_agent = 'Dependency License';

const targetFileName = 'package.json';
const errorResponse = { error: 'Please provide a correct path of the package.json file as a query param' };

app.get('/:owner/:repo', async (req, res) => {
  const path = req.query.path && req.query.path.replace(/^\//, '') || targetFileName;

  const url = `${api}/repos${req.path}/contents/${path}`;
  const qs = { access_token };
  const headers = { 'User-Agent': user_agent };
  let response;
  try {
    response = JSON.parse(await request(url, { qs, headers }));
    if (response.name !== targetFileName) {
      res.json(errorResponse);
      return errorResponse;
    }
  } catch(e) {
    if (e.statusCode === 404) {
      res.json(errorResponse);
      return errorResponse;
    } else {
      console.error(e.message);
      return e;
    }
  }

  const package = JSON.parse(new Buffer(response.content, 'base64'));
  const result = await getDependencyLicense(package, req.query.dev, req.query.depth);

  res.json(result);
});

app.listen(process.env.PORT || 3000);
