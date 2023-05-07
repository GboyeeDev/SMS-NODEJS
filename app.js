const express = require('express');
const bodyParser = require('body-parser');
const Nexmo = require('nexmo');
const ejs = require('ejs');
const socketio = require('socket.io');
require('dotenv').config();

const nexmo = new Nexmo({
    apiKey: process.env.NEXMO_APIKEY,
    apiSecret: process.env.NEXMO_APISECRET
}, {debug: true});

const app = express();

app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});


// receive from front end(vanilla.js)
app.post('/', (req, res) => {
    const { number, text } = req.body;

    nexmo.message.sendSms(
        '08064849328', number, text, { type: 'unicode' },
        (err, responseData) => {
            if(err) {
                console.log(err);
            } else {
                console.dir(responseData);
                //Get data from response
                const data = {
                    id: responseData.messages[0]['message-id'],
                    number: responseData.messages[0]['to']
                }
                //emit to the client
                io.emit('smsStatus', data);
            }
        }
    );
});

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
    console.log(`Server listening to port ${PORT}`);
});


//socket.io for reply after send message
const io = socketio(server);
io.on('connection', (socket) => {
    console.log('Connected');
    io.on('disconnect', () => {
        console.log('Disconnected');
    })
})

