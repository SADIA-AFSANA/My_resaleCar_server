const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jlfv4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const productOptionCollection = client.db('resellCar').collection('productsOptions');
        const bookingsCollection = client.db('resellCar').collection('bookings');
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
        })
    }
    finally {

    }
}
run().catch(console.log);



app.get('/', async (req, res) => {
    res.send('resell-car send -server running')
})
app.listen(port, () => console.log(`resell car listen${port}`))