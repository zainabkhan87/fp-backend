const productModel = require("../models/products");
const fs = require("fs");
const path = require("path");

class Product {
  // Delete Images
  static deleteImages(images, mode) {
    const basePath = path.join(__dirname, "../../public/uploads/products/");
    images.forEach((img) => {
      const fileName = mode === "file" ? img.filename : img;
      const filePath = path.join(basePath, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
    });
  }

  async getAllProduct(req, res) {
    try {
      const Products = await productModel.find({})
        .populate("pCategory", "_id cName")
        .sort({ _id: -1 });

      return res.json({ Products });
    } catch (err) {
      console.error(err);
    }
  }

  async postAddProduct(req, res) {
    const { pName, pDescription, pPrice, pQuantity, pCategory, pOffer, pStatus } = req.body;
    const images = req.files;

    if (!pName || !pDescription || !pPrice || !pQuantity || !pCategory || !pOffer || !pStatus) {
      Product.deleteImages(images, "file");
      return res.json({ error: "All fields are required" });
    }

    if (pName.length > 255 || pDescription.length > 3000) {
      Product.deleteImages(images, "file");
      return res.json({ error: "Name must be ≤ 255 chars, Description ≤ 3000" });
    }

    if (images.length !== 2) {
      Product.deleteImages(images, "file");
      return res.json({ error: "Must provide exactly 2 images" });
    }

    try {
      const allImages = images.map((img) => img.filename);
      const newProduct = new productModel({
        pImages: allImages,
        pName,
        pDescription,
        pPrice,
        pQuantity,
        pCategory,
        pOffer,
        pStatus,
      });
      await newProduct.save();
      return res.json({ success: "Product created successfully" });
    } catch (err) {
      console.error(err);
    }
  }

  async postEditProduct(req, res) {
    const {
      pId, pName, pDescription, pPrice,
      pQuantity, pCategory, pOffer, pStatus, pImages
    } = req.body;
    const editImages = req.files;

    if (!pId || !pName || !pDescription || !pPrice || !pQuantity || !pCategory || !pOffer || !pStatus) {
      return res.json({ error: "All fields are required" });
    }

    if (pName.length > 255 || pDescription.length > 3000) {
      return res.json({ error: "Name must be ≤ 255 chars, Description ≤ 3000" });
    }

    if (editImages && editImages.length === 1) {
      Product.deleteImages(editImages, "file");
      return res.json({ error: "Must provide exactly 2 images" });
    }

    try {
      let editData = {
        pName, pDescription, pPrice,
        pQuantity, pCategory, pOffer, pStatus,
      };

      if (editImages && editImages.length === 2) {
        const newFilenames = editImages.map((img) => img.filename);
        editData.pImages = newFilenames;
        Product.deleteImages(pImages.split(","), "string");
      }

      await productModel.findByIdAndUpdate(pId, editData);
      return res.json({ success: "Product edited successfully" });
    } catch (err) {
      console.error(err);
    }
  }

  async getDeleteProduct(req, res) {
    const { pId } = req.body;
    if (!pId) return res.json({ error: "Product ID required" });

    try {
      const product = await productModel.findByIdAndDelete(pId);
      if (product) {
        Product.deleteImages(product.pImages, "string");
        return res.json({ success: "Product deleted successfully" });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async getSingleProduct(req, res) {
    const { pId } = req.body;
    if (!pId) return res.json({ error: "Product ID required" });

    try {
      const product = await productModel.findById(pId)
        .populate("pCategory", "cName")
        .populate("pRatingsReviews.user", "name email userImage");

      return res.json({ Product: product });
    } catch (err) {
      console.error(err);
    }
  }

  async getProductByCategory(req, res) {
    const { catId } = req.body;
    if (!catId) return res.json({ error: "Category ID required" });

    try {
      const products = await productModel
        .find({ pCategory: catId })
        .populate("pCategory", "cName");

      return res.json({ Products: products });
    } catch (err) {
      return res.json({ error: "Product search failed" });
    }
  }

  async getProductByPrice(req, res) {
    const { price } = req.body;
    if (!price) return res.json({ error: "Price is required" });

    try {
      const products = await productModel
        .find({ pPrice: { $lt: price } })
        .populate("pCategory", "cName")
        .sort({ pPrice: -1 });

      return res.json({ Products: products });
    } catch (err) {
      return res.json({ error: "Price filter failed" });
    }
  }

  async getWishProduct(req, res) {
    const { productArray } = req.body;
    if (!productArray) return res.json({ error: "Product array required" });

    try {
      const products = await productModel.find({ _id: { $in: productArray } });
      return res.json({ Products: products });
    } catch (err) {
      return res.json({ error: "Wishlist fetch failed" });
    }
  }

  async getCartProduct(req, res) {
    const { productArray } = req.body;
    if (!productArray) return res.json({ error: "Product array required" });

    try {
      const products = await productModel.find({ _id: { $in: productArray } });
      return res.json({ Products: products });
    } catch (err) {
      return res.json({ error: "Cart fetch failed" });
    }
  }

  async postAddReview(req, res) {
    const { pId, uId, rating, review } = req.body;
    if (!pId || !uId || !rating || !review) {
      return res.json({ error: "All fields are required" });
    }

    try {
      const product = await productModel.findById(pId);
      const alreadyReviewed = product.pRatingsReviews.some((r) => r.user.toString() === uId);

      if (alreadyReviewed) {
        return res.json({ error: "You already reviewed this product" });
      }

      product.pRatingsReviews.push({ review, user: uId, rating });
      await product.save();
      return res.json({ success: "Thanks for your review" });
    } catch (err) {
      console.error(err);
      return res.json({ error: "Review submission failed" });
    }
  }

  async deleteReview(req, res) {
    const { rId, pId } = req.body;
    if (!rId || !pId) return res.json({ error: "Review and Product ID required" });

    try {
      await productModel.findByIdAndUpdate(pId, {
        $pull: { pRatingsReviews: { _id: rId } },
      });
      return res.json({ success: "Your review is deleted" });
    } catch (err) {
      console.error(err);
    }
  }
}

const productController = new Product();
module.exports = productController;
