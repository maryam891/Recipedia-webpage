import express from "express";
import cors from "cors";
import path from "path";
import session from "express-session";
import * as sqlite from "sqlite";
import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import axios from "axios";
const SQLiteStore = require("connect-sqlite3")(session);

declare module "express-session" {
  interface SessionData {
    Users: {
      name: string;
      email: string;
      id: number;
    };
  }
}
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "https://recipedia-webbpage-production.up.railway.app/api/$1",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.options("*", cors());

app.use(express.json());

app.set("trust proxy", 1);

let database: Database;

require("dotenv").config();
(async () => {
  try {
    console.log("Opening database...");
    database = await sqlite.open({
      driver: sqlite3.Database,
      filename: "./recipedia.sqlite",
    });
    console.log("Database opened successfully");

    await database.run("PRAGMA foreign_keys = ON");
    console.log("Redo att göra databasanrop");

    const api = axios.create({
      baseURL: "/",
      withCredentials: true,
    });
    //Use axios interceptor to navigate the user when session is expired(401) and  if url is not Login since session can expire on other pages
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 401 &&
          !error.config.url.includes("/Login?sessionExpired=1")
        ) {
          return error.response
            .status(401)
            .send({ message: "Session expired" });
        }
        return Promise.reject(error);
      },
    );
    const bcrypt = require("bcrypt");
    //Expire cookie time
    const twoHours = 1000 * 60 * 60 * 2;
    const IN_Prod = process.env.NODE_ENV === "production";

    app.use(
      session({
        store: new SQLiteStore({ db: "sessions.sqlite", dir: "./" }),
        secret: process.env.SESSION_SECRET ?? "fallback-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: IN_Prod,
          maxAge: twoHours,
          sameSite: "lax",
        },
      }),
    );

    //Get user that is logged in
    app.get("/api/user", async (req, res) => {
      if (req.session.Users) {
        res.status(200).send(req.session.Users);
      } else {
        res.status(401).send({ message: "User does not exist" });
      }
    });

    //Signup
    app.post("/api/signup", async (req, res) => {
      //Hash password using bcrypt function to get unique string data
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let alreadyExist = await database.get(
        "SELECT Email FROM Users WHERE Email=?",
        [req.body.Email],
      );
      if (alreadyExist) {
        res
          .status(409)
          .send({ message: "User already exist with the same email adress" });
        return;
      }
      let signedUpUser = await database.run(
        "INSERT INTO Users(email, password, name) VALUES(?,?, ?)",
        [req.body.email, hashedPassword, req.body.name],
      );
      let cookieUserInfo;
      if (
        signedUpUser &&
        signedUpUser.lastID &&
        signedUpUser.changes &&
        signedUpUser.changes > 0
      ) {
        cookieUserInfo = req.session.Users = {
          name: req.body.name,
          email: req.body.email,
          id: signedUpUser.lastID,
        };
      }

      if (cookieUserInfo) {
        res.status(200).send(cookieUserInfo);
      } else {
        res.status(400).send({ message: "Could not create user" });
      }
    });

    //logout the user
    app.post("/api/logout", async (req: any, res: any) => {
      req.session.destroy((error: any) => {
        if (error) {
          res.status(400).send({ message: "Could not logout" });
        }
      });
      res.clearCookie();
      res.status(200).send({ message: "Logged out" });
    });

    app.post("/api/Login", async (req, res) => {
      try {
        let loggedInUsers = await database.all(
          "SELECT * FROM Users WHERE email = ?",
          [req.body.email],
        );
        //Get first user data
        let user = loggedInUsers[0];
        let cookieUserInfo;
        //If there is a user with a matching email and password that matches the stored password, then save the session.
        // This also handles both bcrypt-hashed passwords and older plain-text values.
        if (loggedInUsers.length > 0 && user) {
          const passwordMatches =
            (await bcrypt.compare(req.body.password, user.password)) ||
            req.body.password === user.password;

          if (passwordMatches) {
            cookieUserInfo = req.session.Users = {
              name: loggedInUsers[0].name,
              email: loggedInUsers[0].email,
              id: loggedInUsers[0].id,
            };
          }
        }
        if (cookieUserInfo) {
          res.status(200).send(cookieUserInfo);
        } else {
          res.status(400).send({ message: "Invalid email or password" });
        }
      } catch (error) {
        res.status(400).send({ message: "Invalid email or password" });
      }
    });

    //Get favorite recipes
    app.get("/api/getFavoriteRecipes", async (req, res) => {
      const userId = req.session.Users?.id;
      let favs = await database.all(
        `SELECT recipes.id, name, cookTimeMinutes, servings, prepTimeMinutes, recipe_image, cuisine, rating FROM recipes INNER JOIN FavoriteRecipes ON recipes.id = FavoriteRecipes.recipe_id WHERE FavoriteRecipes.userId = ?`,
        [userId],
      );
      if (favs && userId) {
        res.status(200).send(favs);
      } else {
        res.status(400).send({ message: "Not logged in" });
      }
    });

    //Remove favorite recipe
    app.delete("/api/removeFavoriteRecipe", async (req, res) => {
      const userId = req.session.Users?.id;
      let delFavRecipe = await database.run(
        "DELETE FROM FavoriteRecipes WHERE userId=? AND recipe_id=?",
        [userId, req.body.recipe_id],
      );
      if (delFavRecipe) {
        res.status(200).send(delFavRecipe);
      } else {
        res.status(400).send();
      }
    });

    //Add favorite recipe
    app.post("/api/addFavoriteRecipe", async (req, res) => {
      const userId = req.session.Users?.id;
      const recipeId = req.body.recipe_id;
      let addFav = await database.run(
        "INSERT INTO FavoriteRecipes(userId, recipe_id) VALUES(?,?)",
        [userId, recipeId],
      );
      if (addFav) {
        res.status(200).send(addFav);
      } else {
        res.status(400).send({ message: "could not add to favorites" });
      }
    });

    //Get recipes
    app.get("/api/recipes", async (req, res) => {
      try {
        let recipes = await database.all(
          "SELECT name, cuisine, recipe_image, cookTimeMinutes, servings, prepTimeMinutes, rating, id FROM recipes",
        );
        res.send(recipes);
      } catch (error) {
        console.log(error, "Could not get recipes");
        res.status(400).send();
      }
    });

    //Get popular recipes
    app.get("/api/popular", async (req, res) => {
      try {
        let popularRecipes = await database.all(
          "SELECT name, cuisine, recipe_image, rating, id FROM recipes WHERE rating > 4.6 ",
        );
        res.send(popularRecipes);
      } catch (error) {
        console.log(error, "Could not get favorite recipes");
        res.status(400).send({ message: "Could not get favorite recipes" });
      }
    });
    //Get selected recipe for recipe modal
    app.get("/api/recipes/:id", async (req, res) => {
      let instructionsDetail = await database.all(
        `SELECT recipes.id,instruction,name,cookTimeMinutes, servings,prepTimeMinutes
         FROM recipes INNER JOIN instructions
         ON recipes.id=instructions.recipe_id
         WHERE recipes.id= ?`,
        [req.params.id],
      );

      let ingredientsDetail = await database.all(
        `SELECT recipes.id,ingredient,name,cookTimeMinutes, servings,prepTimeMinutes
         FROM recipes INNER JOIN ingredients
         ON recipes.id=ingredients.recipe_id
         WHERE recipes.id= ?`,
        [req.params.id],
      );

      res.send({
        ingredientsSection: ingredientsDetail,
        instructionsSection: instructionsDetail,
      });
    });

    app.listen(8080, () => {
      console.log("Server running on http://localhost:8080");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
})();
