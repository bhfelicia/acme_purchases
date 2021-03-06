const express = require("express");
const html = require("html-template-tag");
const {
  db,
  syncAndSeed,
  models: { Person, Place, Thing, Purchase },
} = require("./db");

const app = express();

app.use(require("method-override")("_method"));
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res, next) => {
  try {
    const [people, places, things, purchases] = await Promise.all([
      Person.findAll(),
      Place.findAll(),
      Thing.findAll(),
      Purchase.findAll({
        include: [Person, Place, Thing],
      }),
    ]);
    res.send(html`
      <html>
        <head>
          <title>Purchases Abroad</title>
        </head>
        <body>
          <h1>Acme Purchases Abroad</h1>
          <h3>Add a purchase!</h3>
          <form method="POST">
            <select name="personId" action="/people/${people.id}">
              <option>Person</option>
                ${people.map(
                  (person) =>
                    html` <option value="${person.id}">${person.name}</option> `
                )}
              </option>
            </select>

            <button>Save Purchase</button>
          </form>
          <div>
            <h2>What They Bought</h2>
            <ul>
              ${purchases.map(
                (purchase) => html` <li>
                  ${purchase.person.name} purchased ${purchase.quantity}
                  ${purchase.thing.name} on ${purchase.date}
                </li>`
              )}
            </ul>
          </div>
        </body>
      </html>
    `);
    // res.send({ people, places, things, purchases });
  } catch (err) {
    next(err);
  }
});

const init = async () => {
  try {
    await syncAndSeed();
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
  } catch (err) {
    console.log(err);
  }
};

init();
