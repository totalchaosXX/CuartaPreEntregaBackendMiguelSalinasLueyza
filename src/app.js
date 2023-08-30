const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises'); 

const app = express();
const PORT = 80.80;


app.use(bodyParser.json());


let products = [];
let carts = [];


async function loadData() {
  try {
    const productsData = await fs.readFile('./data/products.json');
    const cartsData = await fs.readFile('./data/carts.json');
    products = JSON.parse(productsData);
    carts = JSON.parse(cartsData);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

loadData();


async function saveData() {
  try {
    await fs.writeFile('./data/products.json', JSON.stringify(products, null, 2));
    await fs.writeFile('./data/carts.json', JSON.stringify(carts, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}



const cartsRouter = express.Router();

cartsRouter.get('/', (req, res) => {
  res.json(carts);
});

cartsRouter.post('/', (req, res) => {
  const newCart = req.body;
  carts.push(newCart);
  saveData(); 
  res.status(201).json(newCart);
});

cartsRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const cart = carts.find(cart => cart.id === Number(id));

  if (!cart) {
    res.status(404).json({ error: 'Cart not found' });
  } else {
    res.json(cart.products);
  }
});

cartsRouter.post('/:cid/product/:pid', (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  
  const cart = carts.find(cart => cart.id === Number(cid));
  const product = products.find(product => product.id === Number(pid));
  
  if (!cart || !product) {
    res.status(404).json({ error: 'Cart or Product not found' });
  } else {
    const existingProduct = cart.products.find(item => item.product === Number(pid));
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: Number(pid), quantity });
    }
    saveData(); 
    res.json(cart);
  }
});

app.use('/api/carts', cartsRouter);


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
