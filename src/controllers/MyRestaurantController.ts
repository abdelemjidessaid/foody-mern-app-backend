import { Request, Response } from "express";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import Restaurant from "../models/Restaurant";

const createRestaurant = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const existingRestaurant = await Restaurant.findOne({ user: req.userId });

    if (existingRestaurant) {
      return res.status(409).json({ message: "User restaurant already exists" });
    }

    // const image = req.file as Express.Multer.File;
    // const base64Image = Buffer.from(image.buffer).toString("base64");
    // const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    // const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = imageUrl;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();

    res.status(201).send(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong while creating new restaurant" });
  }
};

const getRestaurant = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });

    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    res.json(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error occured while fetching the restaurant" });
  }
};

const updateRestaurant = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });

    if (!restaurant) return res.status(404).json({ message: "Resaturant not found" });

    // update the restaurant instance with the new values
    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();
    res.status(200).send(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong while updating the Restaurant" });
  }
};

const uploadImage = async (image: Express.Multer.File) => {
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

  return uploadResponse.url;
};

export default { createRestaurant, getRestaurant, updateRestaurant };
