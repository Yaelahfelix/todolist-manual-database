import express from "express";
import moment from "moment";
import winston from "winston";
import fs from "fs";
import path from "path";
import uniqid from "uniqid";
import ejs from "ejs";

export const app = express();

app.set("views", path.join(path.resolve(), "src"));
app.use(express.json());
app.set("view engine", "ejs");

// const logger = new winston.createLogger({
//   transports: [
//     new winston.transports.File({
//       level: 'info',
//       filename: 'src/database.log',
//     })

//   ]
// })

app.get("/", async (req, res) => {
  const data = fs.readFileSync("src/database.log", "utf-8");
  res.render("index.ejs", JSON.parse(data));
});

app.post("/create", (req, res) => {
  if (!["low", "medium", "high"].includes(req.body.priority)) {
    return res.status(400).send("priority just accept: low | medium | high");
  }
  const { data } = JSON.parse(fs.readFileSync("src/database.log", "utf-8"));

  const reqData = {
    id: uniqid(),
    name: req.body.name,
    createdAt: moment(),

    // low | medium | high
    priority: req.body.priority,
  };

  data.push(reqData);

  fs.writeFile("src/database.log", JSON.stringify({ data }), "utf-8", () => {
    res.status(200).json({
      code: 200,
      status: "OK",
      data: reqData,
    });
  });
});

app.delete("/delete/:id", async (req, res) => {
  const { data } = JSON.parse(fs.readFileSync("src/database.log", "utf-8"));
  const id = req.params.id;
  const index = data.findIndex((todo) => todo.id === id);

  if (index === -1) {
    res.status(400).json({
      code: 400,
      message: {
        id: "NOT_BLANK",
      },
    });
  } else {
    const filteredData = data.filter((todo) => todo.id !== id);

    fs.writeFile("src/database.log", JSON.stringify({ data: filteredData }), "utf-8", () => {
      res.status(200).json({
        code: 200,
        message: "Data successfully deleted",
      });
    });
  }
});

app.listen(3000, () => {
  console.info("Server listening on port 3000");
});
