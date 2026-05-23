import express from "express";
import path from "path";
import session from "express-session";
import * as sqlite from "sqlite";
import { Database } from "sqlite";
import sqlite3 from "sqlite3";
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

    //Expire cookie time
    const twoHours = 1000 * 60 * 60 * 2;
    const IN_Prod = process.env.NODE_ENV === "production";
    const app = express();
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.use(express.json());
    app.set("trust proxy", 1);
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

    //user profile
    app.get("/Profile", async (req, res) => {
      if (req.session.Users) {
        res.status(200).send(req.session.Users);
      } else {
        res.status(400).send({ message: "no such user" });
      }
    });
    //Get user that is logged in
    app.get("/user", async (req, res) => {
      if (req.session.Users) {
        res.status(200).send(req.session.Users);
      } else {
        res.status(401).send({ message: "Not logged in" });
      }
    });

    //Signup
    app.post("/signup", async (req, res) => {
      let signedUpUser = await database.run(
        "INSERT INTO Users(email, password, name) VALUES(?,?, ?)",
        [req.body.email, req.body.password, req.body.name],
      );
      let cookieUserInfo;
      if (signedUpUser && signedUpUser.changes && signedUpUser.changes > 0) {
        cookieUserInfo = req.session.Users = {
          name: req.body.name,
          email: req.body.email,
          id: req.body.id,
        };
      }

      if (cookieUserInfo) {
        res.status(200).send(cookieUserInfo);
      } else {
        res.status(400).send({ message: "Invalid email or password" });
      }
    });

    //logout the user
    app.post("/logout", async (req: any, res: any) => {
      req.session.destroy((error: any) => {
        if (error) {
          res.status(400).send({ message: "Could not logout" });
        }
      });
      res.clearCookie();
      res.status(200).send({ message: "Logged out" });
    });

    //Check if user email and password exists to login
    app.post("/Login", async (req, res) => {
      let logedInUsers = await database.all(
        "SELECT * FROM Users WHERE email = ? AND password = ?",
        [req.body.email, req.body.password],
      );
      let cookieUserInfo;
      if (logedInUsers && logedInUsers.length > 0) {
        cookieUserInfo = req.session.Users = {
          name: logedInUsers[0].name,
          email: logedInUsers[0].email,
          id: logedInUsers[0].id,
        };
      }
      if (cookieUserInfo) {
        res.status(200).send(cookieUserInfo);
      } else {
        res.status(400).send({ message: "Invalid email or password" });
      }
    });

    //Get favorite recipes
    app.get("/getFavoriteRecipes", async (req, res) => {
      const userId = req.session.Users?.id;
      let favs = await database.all(
        `SELECT recipes.id, name, cookTimeMinutes, servings, prepTimeMinutes, recipe_image, cuisine, rating FROM recipes INNER JOIN FavoriteRecipes ON recipes.id = FavoriteRecipes.recipe_id WHERE FavoriteRecipes.userId = ?`,
        [userId],
      );
      if (favs) {
        res.status(200).send(favs);
      } else {
        res.status(400).send();
      }
    });

    //Remove favorite recipe
    app.delete("/removeFavoriteRecipe", async (req, res) => {
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
    app.post("/addFavoriteRecipe", async (req, res) => {
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
      let recipes = await database.all(
        "SELECT name, cuisine, recipe_image, cookTimeMinutes, servings, prepTimeMinutes, rating, id FROM recipes",
      );
      res.send(recipes);
    });

    //Get popular recipes
    app.get("/api/popular", async (req, res) => {
      let popularRecipes = await database.all(
        "SELECT name, cuisine, recipe_image, rating, id FROM recipes WHERE rating > 4.6 ",
      );
      res.send(popularRecipes);
    });
    //Get selected recipe for recipe modal
    app.get("/recipes/:id", async (req, res) => {
      let instructionsDetail = await database.all(
        `SELECT recipes.id,instruction,name,cookTimeMinutes, servings,prepTimeMinutes
         FROM recipes INNER JOIN instructions
         ON recipes.id=instructions.recipe_id
         WHERE recipes.id=${req.params.id};`,
      );

      let ingredientsDetail = await database.all(
        `SELECT recipes.id,ingredient,name,cookTimeMinutes, servings,prepTimeMinutes
         FROM recipes INNER JOIN ingredients
         ON recipes.id=ingredients.recipe_id
         WHERE recipes.id=${req.params.id};`,
      );

      res.send({
        ingredientsSection: ingredientsDetail,
        instructionsSection: instructionsDetail,
      });
    });
    app.get("/{*path}", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
    app.listen(8080, () => {
      console.log("Server running on http://localhost:8080");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
})();
