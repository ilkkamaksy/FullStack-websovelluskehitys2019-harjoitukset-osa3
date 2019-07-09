const mongoose = require('mongoose');

if ( process.argv.length<3) {
    console.log('give password as an argument');
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@cluster0-vrmab.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true });

const contactSchema = new mongoose.Schema({
    name: String,
    number: String
});

const Contact = mongoose.model('Contact', contactSchema);

if (process.argv.length<4) {
    Contact.find({}).then(result => {
    result.forEach(contact => {
        console.log(`${contact.name} ${contact.number}`);
    });
    mongoose.connection.close();
    });
} else if (process.argv.length >= 4) {
    const contactName = process.argv[3];
    const contactNumber = process.argv[4];
    
    const contact = new Contact({
        name: contactName,
        number: contactNumber
    });
    
    contact.save().then(response => {
        console.log(`added ${response.name} ${response.number} to phonebook`);
        mongoose.connection.close();
    });
}