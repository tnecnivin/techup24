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

        console.log("Product = " + JSON.stringify(products));

        // Render the homepage with all the blog posts
        // await res.render('pages/home', { blogs: blogs });
        await res.render('pages/home', { products: products });

      } catch (error) {
        res.render('pages/home');
        console.log(error);
      } 
});

app.post('/update-price', async function(req, res) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(req.body.productId)
      },
    });

    const price = product.price;
    price[req.body.newSource] = req.body.latestPrice;
    
    // Update the product with the modified price
    const updatedProduct = await prisma.product.update({
      where: {
        id: parseInt(req.body.productId),
      },
      data: {
        price: price,
      },
    });
    
    res.json({ ok: true, message: 'Product price updated successfully' });

    } catch (error) {
      res.render('pages/about');
      console.log(error);
    } 
});


// Tells the app which port to run on
app.listen(8080);