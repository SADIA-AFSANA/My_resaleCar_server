const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jlfv4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorize access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        // const productsOptionCollection = client.db('resellCar').collection('productssOptions');
        const productOptionCollection = client.db('resellCar').collection('productsOptions');
        const bookingsCollection = client.db('resellCar').collection('bookings');
        const usersCollection = client.db('resellCar').collection('users');


        app.get('/productsOptions', async (req, res) => {
            const query = {};
            const options = await productOptionCollection.find(query).toArray();
            // const bookingQuery = { sellerName }
            res.send(options);
        });
        //         app.get('/v2/productsOptions', async (res, res) => {
        //             const options = await productOptionCollection.aggregate([
        //                 {
        //             $lookup:
        //         }
        //     ])
        // })


        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking)
            const query = {
                sellerName: booking.sellerName
            }
            const count = await bookingsCollection.find(query).toArray();
            if (count.length) {
                const message = `already booked${booking.sellerName}`
                return res.send({ acknowledged: false, message })
            }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN)
                return res.send({ accessToken: token })
            }

            res.status(403).send({ accessToken: '' })
        });

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.put()

    }
    finally {

    }
}
run().catch(console.log);



app.get('/', async (req, res) => {
    res.send('resell-car send -server running')
})
app.listen(port, () => console.log(`resell car listen${port}`))