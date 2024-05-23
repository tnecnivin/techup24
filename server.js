// Needed for dotenv
require("dotenv").config();

// Needed for Express
var express = require('express')
var app = express()

// Needed for EJS
app.set('view engine', 'ejs');

// Needed for public directory
app.use(express.static(__dirname + '/public'));

// Needed for parsing form data
app.use(express.json());       
app.use(express.urlencoded({extended: true}));

// Needed for Prisma to connect to database
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

// Main landing page
app.get('/', async function(req, res) {

    // Try-Catch for any errors
    try {
        // Get all products
        const products = await prisma.product.findMany({
          orderBy: [
            {
              id: 'desc'
            }
          ]
        });

        // console.log("Product = " + JSON.stringify(products));

        await res.render('pages/home', { products: products });

      } catch (error) {
        res.render('pages/home');
        console.log(error);
      } 
});

app.post('/update-price', async function(req, res) {
  try {
    const productId = parseInt(req.body.productId);
    const newSource = req.body.newSource;
    const latestPrice = req.body.latestPrice;
    const currency = req.body.currency || "SGD"; // Default to SGD if not provided
    const thumbsUp = req.body.thumbsUp || 0; // Default to 0 if not provided
    const thumbsDown = req.body.thumbsDown || 0; // Default to 0 if not provided

    // Fetch the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ ok: false, message: 'Product not found' });
    }
    const lastUpdated = new Date().toLocaleString();

    // Parse the price field as JSON
    let others = product.others;

    // Update or add the new source price information
    others[newSource] = {
      price: latestPrice,
      currency: currency,
      thumbsUp: thumbsUp,
      thumbsDown: thumbsDown,
      lastUpdated: lastUpdated
    };

    // Update the product with the modified price
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { others: others },
    });

    res.json({ ok: true, message: 'Product price updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, message: 'An error occurred while updating the product price' });
  }
});

app.post('/add-product', async function(req, res) {
  const { name, price, source, size, imageURL} = req.body;
  try { 
    const newProduct = await prisma.product.create({
      data: {
        product: name,
        size: size,
        currentPrice:0.0,
        fourWeekHigh:0.0,
        fourWeekLow:0.0,
        imageURL: imageURL,
        price:{},
        thumbsDownCnt:0,
        thumbsUpCnt:0,
        others: {
          [source]: {
            price: price,
            currency: "SGD",
            thumbsUp: 0,
            thumbsDown: 0,
            lastUpdated: new Date().toLocaleString()
          }
        }
      }
    });

    res.json({ ok: true, message: 'Product added successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, message: 'An error occurred while adding the product' });
  }
});


// Tells the app which port to run on
app.listen(8080);