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
        await res.render('pages/about', { products: products });

      } catch (error) {
        res.render('pages/about');
        console.log(error);
      } 
});

// About page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

// New post page
app.get('/new', function(req, res) {
    res.render('pages/new');
});

// Create a new post
app.post('/new', async function(req, res) {
  const { newSource, latestPrice } = req.body;

  try {
      const newProduct = await prisma.product.create({
          data: {
              source: newSource,
              price: parseFloat(latestPrice)
          }
      });
      res.status(201).json(newProduct);
  } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
  }
});

// Delete a post by id
app.post("/delete/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        await prisma.post.delete({
            where: { id: parseInt(id) },
        });
      
        // Redirect back to the homepage
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
  });

// Tells the app which port to run on
app.listen(8080);