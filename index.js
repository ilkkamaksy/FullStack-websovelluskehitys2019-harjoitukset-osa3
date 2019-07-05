const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
morgan.token('request-body', (req, res) => { 
    return JSON.stringify(req.body) 
});

const customMorgan = morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens['request-body'](req, res),
    ].join(' ')
  })

app.use(bodyParser.json());
app.use(customMorgan);
app.use(cors());

let persons = [
          {
            "name": "Arto Hellas",
            "number": "040-123456",
            "id": 1
          },
          {
            "name": "Ada Lovelace",
            "number": "39-44-5323523",
            "id": 2
          },
          {
            "name": "Dan Abramov",
            "number": "12-43-234345",
            "id": 3
          },
          {
            "name": "Mary Poppendieck",
            "number": "39-23-6423122",
            "id": 4
          },
          {
            "name": "Matti Meikäläinen",
            "number": "0123 1231232",
            "id": 5
          },
          {
            "name": "Erkki Esimerkki",
            "number": "044 123123",
            "id": 6
          },
          {
            "name": "Pekka Pouta",
            "number": "0400 700 700",
            "id": 7
          },
          {
            "name": "Matti Tapio",
            "number": "0124 12312",
            "id": 8
          }
        ]

const generateId = () => {
    const maxId = persons.length > 0
    ? Math.max(...persons.map(p => p.id))
    : 0
    return Math.floor(Math.random() * (1000 - maxId) + 1000);
}

app.get('/info', (request, response) => {
    const date = new Date();
    const content = `<p>Phonebook has info for ${persons.length} people</p>
                    <p>${date}</p>`;
    response.send(content)
})

app.get('/api/persons', (request, response) => {
    response.send(persons);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(person => {
        return person.id === id
    });

    if ( person ) {
        response.json(person);
    } else {
        response.status(404).send("404 not found").end();
    }
});

app.post('/api/persons', (request, response) => {
    const body = request.body;
    
    if ( !body.name ) {
        return response.status(400).json({
            error: 'Name missing'
        });
    }

    if ( !body.number ) {
        return response.status(400).json({
            error: 'Number missing'
        });
    }

    const person = {    
        name: body.name,
        number: body.number,
        id: generateId()
    }

    const duplicate = persons.find(person => {
        return person.name === body.name
    });

    if ( typeof duplicate !== 'undefined' ) {
        return response.status(400).json({
            error: 'Name must be unique'
        });    
    } 

    persons.concat(person);
    response.json(person)
    
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => {
        return person.id === id
    });
    response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});