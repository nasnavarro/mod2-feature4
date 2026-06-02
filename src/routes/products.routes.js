import { Router } from "express";
// Middlewares.
import { validateProduct } from "../middlewares/validateProduct.js";
// Controladores.
import * as productsController from "../controllers/products.controller.js";

const router = Router();

// Gestiona las rutas de productos, que tienen estructura previa definida en
// index.routes: /api/products

// Getters
router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProductById);
// Post
router.post('/', validateProduct, productsController.createProduct);
// Put
router.put('/:id', validateProduct, productsController.updateProduct);
// Delete
router.delete('/:id', productsController.deleteProduct);

export default router;