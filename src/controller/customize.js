const fs = require("fs");
const path = require("path"); // Added path module
const categoryModel = require("../models/categories");
const productModel = require("../models/products");
const orderModel = require("../models/orders");
const userModel = require("../models/users");
const customizeModel = require("../models/customize");

class Customize {
  async getImages(req, res) {
    try {
      let Images = await customizeModel.find({});
      if (Images) {
        return res.json({ Images });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async uploadSlideImage(req, res) {
    let image = req.file.filename;
    if (!image) {
      return res.json({ error: "All field required" });
    }
    try {
      let newCustomize = new customizeModel({
        slideImage: image,
      });
      await newCustomize.save(); // ✅ Modern Mongoose usage
      return res.json({ success: "Image upload successfully" });
    } catch (err) {
      console.log(err);
    }
  }

  async deleteSlideImage(req, res) {
    let { id } = req.body;
    if (!id) {
      return res.json({ error: "All field required" });
    } else {
      try {
        let deletedSlideImage = await customizeModel.findById(id);
        if (!deletedSlideImage) {
          return res.json({ error: "Image not found" });
        }

        const filePath = path.join(__dirname, "../../public/upload/customize", deletedSlideImage.slideImage); // ✅ Fixed path

        let deleteImage = await customizeModel.findByIdAndDelete(id);
        if (deleteImage) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.log(err);
            }
            return res.json({ success: "Image deleted successfully" });
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getAllData(req, res) {
    try {
      const [Categories, Products, Orders, Users] = await Promise.all([
        categoryModel.countDocuments(),
        productModel.countDocuments(),
        orderModel.countDocuments(),
        userModel.countDocuments(),
      ]);

      return res.json({ Categories, Products, Orders, Users });
    } catch (err) {
      console.log(err);
    }
  }
}

const customizeController = new Customize();
module.exports = customizeController;
