const fetch = require('isomorphic-fetch')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (app) => {

	app.get('/api/v1/profile/info', (request, response) => {
	  fetch(`http://koha:8081/api/v1/patrons/${request.session.borrowerNumber}`, {
	    method: 'GET',
	    headers: {
	      'Cookie': request.session.kohaSession
	    }
	  }).then(res => {
	    if (res.status === 200) {
	      return res.json()
	    } else {
	      response.status(res.status).send()
	      throw Error()
	    }
	  }).then(json => {
	    const patron = {
	      borrowerNumber: json.borrowernumber,
	      name: `${json.firstname} ${json.surname}`,
	      address: json.address,
	      zipcode: json.zipcode,
	      city: json.city,
	      country: json.country,
	      mobile: json.smsalertnumber, // is this the only sms number?
	      telephone: json.phone,
	      email: json.email,
	      birthdate: json.dateofbirth,
	      loanerCardIssued: json.dateenrolled,
	      loanerCategory: json.categorycode,
	      lastUpdated: '2016-02-01'
	    }
	    response.status(200).send(patron)
	  }).catch(error => {
	    console.log(error)
	    response.sendStatus(500)
	  })
	})

	app.post('/api/v1/profile/info', jsonParser, (request, response) => {
		const patron = {
		  borrowernumber: request.body.borrowerNumber,
		  surname: request.body.name,
		  address: request.body.address,
		  zipcode: request.body.zipcode,
		  city: request.body.city,
		  country: request.body.country,
		  smsalertnumber: request.body.mobile,
		  phone: request.body.telephone,
		  email: request.body.email,
		  dateofbirth: request.body.birthdate,
		  dateenrolled: request.body.loanerCardIssued,
		  categorycode: request.body.loanerCategory
		}

	  fetch(`http://koha:8081/api/v1/patrons/${request.session.borrowerNumber}`, {
	    method: 'PUT',
	    headers: {
	      'Cookie': request.session.kohaSession
	    },
	    body: JSON.stringify(patron)
	  }).then(res => {
	    if (res.status === 200) {
	      return res.json()
	    } else {
	      response.status(res.status).send(res.body)
	    }
	  }).then(json => {
	    const patron = {
	      borrowerNumber: json.borrowernumber,
	      name: `${json.firstname} ${json.surname}`,
	      address: json.address,
	      zipcode: json.zipcode,
	      city: json.city,
	      country: json.country,
	      mobile: json.smsalertnumber, // is this the only sms number?
	      telephone: json.phone,
	      email: json.email,
	      birthdate: json.dateofbirth,
	      loanerCardIssued: json.dateenrolled,
	      loanerCategory: json.categorycode,
	      lastUpdated: '2016-02-01'
	    }
	    response.status(200).send(patron)
	  }).catch(error => {
	    console.log(error)
	    response.sendStatus(500)
	  })
	})

	app.get('/api/v1/profile/loans', (request, response) => {
	  response.send({
	    name: 'Ola finn Oddvar Nordmann',
	    pickup: [
	      {
	        recordId: 'xx',
	        title: 'Hard-Boiled Wonderland and the End of the World',
	        author: 'Haruki Murakami',
	        publicationYear: '1987',
	        expiry: '2016-09-21',
	        pickupNumber: '40/20220'
	      },
	      {
	        recordId: 'yy',
	        title: 'Hard-Boiled Wonderland and the End of the World',
	        author: 'Haruki Murakami',
	        publicationYear: '1987',
	        expiry: '2016-09-21',
	        pickupNumber: '40/20220'
	      }
	    ],
	    reservations: [
	      {
	        recordId: 'xx',
	        title: 'Hard-Boiled Wonderland and the End of the World',
	        author: 'Lars- Saabye Christensen',
	        orderedDate: '2016-12-03',
	        waitingPeriod: 'xxx',
	        branchCode: 'dfb'
	      },
	      {
	        recordId: 'yy',
	        title: 'Hard-Boiled Wonderland and the End of the World',
	        author: 'Lars- Saabye Christensen',
	        orderedDate: '2016-12-03',
	        waitingPeriod: 'xxx',
	        branchCode: 'dfb'
	      }
	    ],
	    loans: [
	      {
	        recordId: 'xx',
	        title: 'Hard-Boiled Wonderland and the End of the World',
	        author: 'Lars- Saabye Christensen',
	        publicationYear: '1987',
	        dueDate: '2016-12-05'
	      },
	      {
	        recordId: 'yy',
	        title: 'Hard-Boiled Wonderland and the End of the World',
	        author: 'Lars- Saabye Christensen',
	        publicationYear: '1987',
	        dueDate: '2016-12-05'
	      }
	    ]
	  })
	})

	app.post('/api/v1/profile/settings', jsonParser, (request, response) => {
	  request.session.profileSettings = request.body
	  response.sendStatus(200)
	})

	app.get('/api/v1/profile/settings', (request, response) => {
	  if (request.session.profileSettings) {
	    response.send(request.session.profileSettings)
	  } else {
	    response.send({
	      alerts: {
	        reminderOfDueDate: {
	          sms: true,
	          email: false
	        },
	        reminderOfPickup: {
	          sms: false,
	          email: true
	        }
	      },
	      reciepts: {
	        loans: {
	          email: true
	        },
	        returns: {
	          email: true
	        }
	      }
	    })
	  }
	})
}