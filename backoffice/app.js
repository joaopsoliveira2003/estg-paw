//! Express
const express = require("express");
const app = express();

//! Path
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.locals.basedir = path.join(__dirname, "views");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//! Logger
const logger = require("morgan");
app.use(logger("dev"));

//! Cookie Parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//! Cors
const cors = require("cors");
app.use(cors());

//! Mongoose
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/paw");

//! Session
const session = require("express-session");
const MongoStore = require("connect-mongo");

app.use(
  session({
    store: MongoStore.create({ mongoUrl: "mongodb://localhost/paw" }),
    resave: false,
    saveUninitialized: false,
    secret: "estg-paw",
  })
);

//! Passport
const passport = require("passport");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

const User = require("./models/User");
const userController = require("./controllers/UserController");

passport.deserializeUser((id, done) => {
  User.findById(id)
    .exec()
    .then((user) => {
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
});

const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");

passport.use(
  new LocalStrategy((nif, password, done) => {
    User.findOne({ nif: nif })
      .exec()
      .then((user) => {
        if (!user) {
          return done(null, false);
        }

        const hash = crypto
          .pbkdf2Sync(password, user.salt, 1000, 64, "sha512")
          .toString("hex");
        if (hash !== user.password) {
          return done(null, false);
        }

        return done(null, user);
      })
      .catch((err) => {
        return done(err);
      });
  })
);

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "estg-paw",
};

passport.use(
  new JwtStrategy(jwtOptions, (jwt_payload, done) => {
    User.findOne({ _id: jwt_payload.sub })
      .exec()
      .then((user) => {
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      })
      .catch((err) => {
        return done(err);
      });
  })
);

app.use(passport.initialize());
app.use(passport.session());

//! Stripe
const stripe = require("stripe")(
  "token-here"
);

const validationsController = require("./controllers/ValidationsController");
const ticketController = require("./controllers/TicketController");
const userTicketController = require("./controllers/UserTicketController");
const fidelityController = require("./controllers/FidelityController");

app.get("/stripe/user/:user_id/ticket/:ticket_id/points/:points/age/:age", async (req, res) => {
  try {
    const user = await userController.getUser({
      _id: validationsController.validateString(req.params.user_id),
    });
    if (!user) {
      throw new Error("Utilizador não existe");
    }
    const ticket = await ticketController.getTicket({
      _id: validationsController.validateString(req.params.ticket_id),
    });
    if (!ticket) {
      throw new Error("Bilhete não existe");
    }
    let points = validationsController.validateNumber(req.params.points);
    if (points > user.points) {
      throw new Error("Pontos insuficientes");
    }
    let age = validationsController.validateAge(req.params.age);
    let fidelity = fidelityController.getFidelity();
    let userAcquisitions = user.acquisitions;
    let userYears = new Date().getFullYear() - user.created_at.getFullYear();

    let pointsDiscount = points / 100 * fidelity.points;
    let clientYearsDiscount = userYears / 100 * fidelity.years;
    let ageDiscount = fidelity.age[age] / 100 * ticket.price;
    let acquisitionsDiscount = userAcquisitions / 100 * fidelity.acquisitions;

    let usedPoints = points;

    let finalPrice = ticket.price - pointsDiscount - clientYearsDiscount - ageDiscount - acquisitionsDiscount;
    if (finalPrice < 0) {
      if (finalPrice + pointsDiscount < 0) {
        usedPoints = points - (finalPrice + pointsDiscount);
      }
      finalPrice = 0;
    } else if (finalPrice < 0.50) {
      throw new Error("Preço mínimo é de 0.50€");
    }
    if (finalPrice == 0) {
      await userTicketController.createUserTicket({
        user_id: user.id,
        ticket_id: ticket.id,
        price: 0,
      });
      await userController.updateUser(user.id, {
        points: user.points - usedPoints + 5,
        acquisitions: user.acquisitions + 1,
      });
      res.redirect(303, `http://localhost:4200/dashboard`);
      return;
    }
    const session = await stripe.checkout.sessions.create({
      client_reference_id: user.id,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: finalPrice * 100,
            product_data: {
              name: ticket.name,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        ticket_id: ticket.id,
        points: usedPoints,
        discount: ticket.price - finalPrice,
      },
      mode: "payment",
      success_url: "http://localhost:4200/dashboard",
      cancel_url: `http://localhost:4200/tickets/${ticket.id}`,
    });
    res.redirect(303, session.url);
  } catch (error) {
      res.render("error", {
        message: error.message,
        error: error,
      });
  }
});

const endpointSecret =
  "secre-here";

app.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }


    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        let user = await userController.getUser({_id: session.client_reference_id});
        await userTicketController.createUserTicket({
          user_id: session.client_reference_id,
          ticket_id: session.metadata.ticket_id,
          price: (session.amount_total / 100).toFixed(2),
          discount: session.metadata.discount,
          points: session.metadata.points,
        });
        await userController.updateUser(session.client_reference_id, {
          points: user.points - session.metadata.points + 5,
          acquisitions: user.acquisitions + 1,
        });
        break;
    }

    res.send();
  }
);

//! Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//! Routes
const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const apiRouter = require("./routes/api");

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/api", apiRouter);

//! Error Handling
const createError = require("http-errors");

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
