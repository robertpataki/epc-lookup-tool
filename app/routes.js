const express = require('express')
const router = express.Router()
const axios = require('axios')
const Promise = require('promise')

const USERNAME = process.env.EPC_USERNAME;
const PASSWORD = process.env.EPC_PASSWORD;
const TOKEN = process.env.EPC_TOKEN;

console.log(USERNAME, PASSWORD, TOKEN);

axios.defaults.headers.common['Authorization'] = TOKEN;
axios.defaults.headers.common['Accept'] = 'application/json';

// Add your routes here - above the module.exports line

router.get('/lookup', (req, res) => {
  res.redirect('/')
})

router.get('/', (req, res) => {
  res.render('index.html', {
    searchBox: false
  })
})

router.post('/lookup', (req, res, next) => {
  const postcode = req.body['postcode']
  const houseNumber = req.body['house-number']

  if (!houseNumber || !postcode) {
    res.redirect('/')
  } else {
    lookup(houseNumber, postcode).then(results => {
      res.render('results', {propertyData: results})
    }).catch(error => {
      res.render('error', {postcode: postcode, houseNumber: houseNumber})
    })
  }
})

function lookup(houseNumber, postcode) {
  return new Promise(function (resolve, reject) {
    axios.get(`https://epc.opendatacommunities.org/api/v1/domestic/search?size=1&postcode=${postcode}&address=${houseNumber}`, {
      auth: {
        username: USERNAME,
        password: PASSWORD
      }
    })
    .then(response => {
      const propertyData = {
        addressLine1: response.data.rows[0]['address1'].split(',').join(''),
        postcode: response.data.rows[0]['postcode'],
        addressLine2: response.data.rows[0]['address2'],
        addressLine3: response.data.rows[0]['address3'],
        
        inspectionDate: response.data.rows[0]['inspection-date'],
        floorArea: response.data.rows[0]['total-floor-area'],
        extensionCount: response.data.rows[0]['extension-count'],
        currentEnergyRating: response.data.rows[0]['current-energy-rating'],
        numberHeatedRooms: response.data.rows[0]['number-heated-rooms'],
        mainHeatDescription: response.data.rows[0]['mainheat-description'],

        floorHeight: response.data.rows[0]['floor-height'],
        buildingReferenceNumber: response.data.rows[0]['building-reference-number'],
        localAuthorityLabel: response.data.rows[0]['local-authority-label']
      }
      resolve(propertyData)
    })
    .catch(error => {
      reject(error)
    })
  })
}

module.exports = router
