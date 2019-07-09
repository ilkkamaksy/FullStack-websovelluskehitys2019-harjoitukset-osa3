require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const Contact = require('./models/contact');
const morgan = require('morgan');
morgan.token('request-body', (req, res) => {
    return JSON.stringify(req.body);
});

const logger = morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens['request-body'](req, res),
    ].join(' ');
});

app.use(express.static('build'));
app.use(bodyParser.json());
app.use(logger);
app.use(cors());

app.get('/info', (request, response) => {
    Contact.find({}).then(contacts => {
        const date = new Date();
        const content = `<p>Phonebook has info for ${contacts.length} people</p>
                        <p>${date}</p>`;
        response.send(content);
    });
});

app.get('/api/persons', (request, response) => {
    Contact.find({}).then(contacts => {
        response.json(contacts.map(contact => contact.toJSON()));
    });
});

app.get('/api/persons/:id', (request, response, next) => {
    Contact.findById(request.params.id)
        .then(contact => {
            if ( contact ) {
                response.json(contact.toJSON());
            } else {
                response.status(404).end();
            }
        })
        .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {

    const body = request.body;
    const contact = new Contact({
        name: body.name,
        number: body.number
    });
    contact.save()
        .then(savedContact => {
            response.json(savedContact.toJSON());
        })
        .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {

    const body = request.body;

    const contact = {
        name: body.name,
        number: body.number
    };

    Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
        .then(updatedContact => {
            response.json(updatedContact.toJSON());
        })
        .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
    Contact.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end();
        })
        .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {

    console.error(error.message);

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message });
    }
    next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});