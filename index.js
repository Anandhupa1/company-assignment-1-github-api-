const express = require("express");
const { githubRoute } = require("./routes/github.route");

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());




app.get("/", async (req, res) => {
  try {
    res.send("Home page");
  } catch (error) {
    res.status(500).send({ error });
    console.log("error in home page get route", error);
  }
});

app.use("/github", githubRoute);



  app.listen(port, () => {
    console.log(`app started @ http://localhost:${port}`);
  });

