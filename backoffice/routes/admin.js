const express = require("express");
const router = express.Router();
const passport = require("passport");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const validationsController = require("../controllers/ValidationsController");
const patrimonyController = require("../controllers/PatrimonyController");
const eventController = require("../controllers/EventController");
const ticketController = require("../controllers/TicketController");
const userController = require("../controllers/UserController");
const fidelityController = require("../controllers/FidelityController");
const userTicketController = require("../controllers/UserTicketController");

const isAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.admin) {
      next();
    } else {
      res.render("error", {
        message: "- Não tem permissões para aceder a esta página de administração",
        error: { status: 403, stack: "" },
      });
    }
  } else {
    res.redirect("/admin/login");
  }
};

//! Login

router.get(
  "/logout",
  asyncHandler(async (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/admin/login");
    });
  })
);

router.get(
  "/login",
  asyncHandler(async (req, res, next) => {
    res.render("admin/login", { error: "" });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res, next) => {
    passport.authenticate("local", (err, user, info, status) => {
      req.logIn(user, (err) => {
        if (err) {
          res.render("admin/login", {
            error: "Utilizador ou palavra-passe incorretos",
          });
        } else {
          res.redirect("/admin/dashboard");
        }
      });
    })(req, res, next);
  })
);

router.get(
  "/register",
  asyncHandler(async (req, res, next) => {
    res.render("admin/register", { error: "" });
  })
);

router.post(
  "/register",
  asyncHandler(async (req, res, next) => {
    try {
      let newUser = {
        name: validationsController.validateString(req.body.name),
        email: validationsController.validateEmail(req.body.email),
        nif: validationsController.validateNIF(req.body.nif),
        password: validationsController.validatePassword(req.body.password),
      };
      let exists = await userController.getUser({ nif: newUser.nif });
      if (exists) {
        throw new Error("Já existe um utilizador com esse NIF");
      }
      let user = await userController.createUser(newUser);
      req.logIn(user, (err) => {
        if (err) {
          res.render("admin/register", { error: "Erro ao registar" });
        } else {
          res.redirect("/");
        }
      });
    } catch (err) {
      res.render("admin/register", { error: err.message });
    }
  })
);

//! Dashboard
router.get(
  "/dashboard",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let numberOfPatrimonies = await patrimonyController.countPatrimonies();
      let numberOfEvents = await eventController.countEvents();
      let numberOfTickets = await ticketController.countTickets();
      let numberOfUsers = await userController.countUsers();
      let lastTickets = await userTicketController.getLastTickets();
      res.render("admin/dashboard", {
        title: "Dashboard",
        user: req.user,
        numberOfPatrimonies: numberOfPatrimonies,
        numberOfEvents: numberOfEvents,
        numberOfTickets: numberOfTickets,
        numberOfUsers: numberOfUsers,
        lastTickets: lastTickets,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

//! Patrimony CRUD
router.get(
  "/patrimony",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let patrimonies = await patrimonyController
        .getPatrimonies()
        .sort({ _id: -1 })
        .exec();
      res.render("admin/patrimony", {
        title: "Gestão de Património",
        patrimonies: patrimonies,
        user: req.user,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/patrimony",
  isAdmin,
  upload.array("files"),
  asyncHandler(async (req, res, next) => {
    try {
      let patrimony = {
        name: validationsController.validateString(req.body.name),
        category: validationsController.validateString(req.body.category),
        latitude: validationsController.validateLatitude(req.body.latitude),
        longitude: validationsController.validateLongitude(req.body.longitude),
        description: validationsController.validateString(req.body.description),
        files: req.files,
      };
      await patrimonyController.createPatrimony(patrimony);
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.get(
  "/patrimony/:id/files",
  asyncHandler(async (req, res, next) => {
    try {
      let patrimony = await patrimonyController.getPatrimony({
        _id: validationsController.validateString(req.params.id),
      });
      if (!patrimony) {
        throw new Error("Património não encontrado");
      }
      res.render("admin/patrimony-files", {
        title: "Ficheiros do Património",
        patrimony: patrimony,
        user: req.user,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/patrimony/update",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let patrimony = {
        name: validationsController.validateString(req.body.name),
        category: validationsController.validateString(req.body.category),
        latitude: validationsController.validateLatitude(req.body.latitude),
        longitude: validationsController.validateLongitude(req.body.longitude),
        description: validationsController.validateString(req.body.description),
      };
      await patrimonyController.updatePatrimony(
        { _id: validationsController.validateString(req.body.id) },
        patrimony
      );
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/patrimony/delete",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      await patrimonyController.deletePatrimony({
        _id: validationsController.validateString(req.body.id),
      });
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

//! Event CRUD
router.get(
  "/patrimony/:patrimony_id/events",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let events = await eventController
        .getEvents({
          patrimony_id: validationsController.validateString(
            req.params.patrimony_id
          ),
        })
        .exec();
      let patrimony = await patrimonyController.getPatrimony({
        _id: validationsController.validateString(req.params.patrimony_id),
      });

      if (!patrimony) {
        throw new Error("Património não encontrado");
      }

      res.render("admin/event", {
        title: `Gestão de Eventos - ${patrimony.name}`,
        events: events,
        patrimony: patrimony,
        user: req.user,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/patrimony/:patrimony_id/events",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let event = {
        patrimony_id: validationsController.validateString(
          req.params.patrimony_id
        ),
        name: validationsController.validateString(req.body.name),
        startDate: validationsController.validateDate(req.body.startDate),
        endDate: validationsController.validateDate(req.body.endDate),
        description: validationsController.validateString(req.body.description),
      };
      validationsController.validateStartDateEndDate(
        event.startDate,
        event.endDate
      );
      await eventController.createEvent(event);
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/patrimony/:patrimony_id/events/update",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let event = {
        name: validationsController.validateString(req.body.name),
        startDate: validationsController.validateDate(req.body.startDate),
        endDate: validationsController.validateDate(req.body.endDate),
        description: validationsController.validateString(req.body.description),
      };
      validationsController.validateStartDateEndDate(
        event.startDate,
        event.endDate
      );
      await eventController.updateEvent(
        { _id: validationsController.validateString(req.body.id) },
        event
      );
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/patrimony/:patrimony_id/events/delete",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      await eventController.deleteEvent({
        _id: validationsController.validateString(req.body.id),
      });
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

//! Ticket CRUD
router.get(
  "/patrimony/:patrimony_id/events/:event_id/tickets",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let tickets = await ticketController
        .getTickets({
          event_id: validationsController.validateString(req.params.event_id),
        })
        .exec();
      let event = await eventController
        .getEvent({
          _id: validationsController.validateString(req.params.event_id),
        });
      if (!event) {
        throw new Error("Evento não encontrado");
      }
      res.render("admin/ticket", {
        title: `Gestão de Bilhetes - ${event.name}`,
        tickets: tickets,
        event: event,
        user: req.user,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/patrimony/:patrimony_id/events/:event_id/tickets",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let ticket = {
        event_id: validationsController.validateString(req.params.event_id),
        name: validationsController.validateString(req.body.name),
        price: validationsController.validateNumber(req.body.price),
        visible: false
      };
      await ticketController.createTicket(ticket);
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/events/:event_id/tickets/update",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let ticket = {
        name: validationsController.validateString(req.body.name),
        price: validationsController.validateNumber(req.body.price),
        visible: validationsController.validateBoolean(req.body.visible),
      };
      await ticketController.updateTicket(
        { _id: validationsController.validateString(req.body.id) },
        ticket
      );
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/events/:event_id/tickets/delete",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      await ticketController.deleteTicket({
        _id: validationsController.validateString(req.body.id),
      });
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.get(
  "/list-tickets",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let userTickets = await userTicketController.aggregateCountUserTickets().sort({_id: -1}).exec();
      res.render("admin/list-tickets", {
        title: "Listagem de Bilhetes Comprados",
        userTickets: userTickets,
        user: req.user,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

//! Statistics
router.get(
  "/statistic",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      const top3Patrimonies =
        await patrimonyController.getTop3PatrimoniesWithMoreEvents();
      const top3Events = await eventController.getTop3EventsWithMoreTickets();
      const top3Users = await userTicketController.findTop3Users();
      const top3Tickets = await userTicketController.findTop3Tickets();
      const bottom3Tickets = await userTicketController.findBottom3Tickets();
      const averageMoney = await userTicketController.averageMoneyByUsers();

      res.render("admin/statistic", {
        title: "Estatísticas",
        user: req.user,
        top3Patrimonies: top3Patrimonies,
        top3Events: top3Events,
        top3Users: top3Users,
        top3Tickets: top3Tickets,
        bottom3Tickets: bottom3Tickets,
        averageMoney: averageMoney,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

//! User ticket emission
router.get(
  "/user-ticket",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let tickets = await ticketController
        .aggregateEventsPatrimony({ visible: true })
        .sort({ _id: -1 })
        .exec();
      let users = await userController.getUsers().exec();
      res.render("admin/user-ticket", {
        title: "Emissão de Bilhetes",
        tickets: tickets,
        users: users,
        user: req.user,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

//! User Creation
router.get(
  "/new-user",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    res.render("admin/new-user", { title: "Novo Utilizador", user: req.user });
  })
);

router.post(
  "/new-user",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let user = {
        name: validationsController.validateString(req.body.name),
        email: validationsController.validateEmail(req.body.email),
        nif: validationsController.validateNIF(req.body.nif),
        password: validationsController.validatePassword(req.body.password),
        admin:
          validationsController.validateString(req.body.admin) == "true"
            ? true
            : false,
      };
      let exists = await userController.getUser({ nif: user.nif });
      if (exists) {
        throw new Error("Utilizador já existe");
      }
      await userController.createUser(user);
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

//! User List
router.get(
  "/list-user",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let users = await userController
        .getUsers()
        .sort({ _id: -1 })
        .limit(10)
        .exec();
      res.render("admin/list-user", {
        title: "Lista de Utilizadores",
        users: users,
        user: req.user,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/list-user",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let users = await userController
        .getUsers({ nif: validationsController.validateNIF(req.body.nif) })
        .exec();
      res.render("admin/list-user", {
        title: "Lista de Utilizadores",
        users: users,
        user: req.user,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

//! Fidelity
router.get(
  "/fidelity",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let fidelity = fidelityController.getFidelity();
      res.render("admin/fidelity", {
        title: "Fidelização",
        user: req.user,
        fidelity: fidelity,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/fidelity",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let object = {
        points: validationsController.validateNumber(req.body.points),
        acquisitions: validationsController.validateNumber(
          req.body.acquisitions
        ),
        years: validationsController.validateNumber(
          req.body.years
        ),
        age: {
          young: validationsController.validateNumber(req.body.young),
          junior: validationsController.validateNumber(req.body.junior),
          adult: validationsController.validateNumber(req.body.adult),
          senior: validationsController.validateNumber(req.body.senior),
        },
      };
      fidelityController.updateFidelity(object);
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

//! Profile
router.get(
  "/profile/:nif",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let profile = await userController.getUser({
        nif: validationsController.validateNIF(req.params.nif),
      });
      if (!profile) {
        throw new Error("Utilizador não existe");
      }
      let tickets = await userTicketController
        .aggregate({
          user_id: profile._id,
        }).sort({_id: -1})
        .exec();
      res.render("admin/profile", {
        title: "Perfil",
        user: req.user,
        profile: profile,
        tickets: tickets,
      });
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.post(
  "/profile/:nif",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      let user = {
        name: validationsController.validateString(req.body.name),
        email: validationsController.validateEmail(req.body.email)
      };
      if (req.body.password) {
        user.password = validationsController.validatePassword(req.body.password);
      }
      await userController.updateUser(
        { nif: validationsController.validateNIF(req.params.nif) },
        user
      );
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

router.get(
  "/tickets/calculate/nif/:nif/ticket/:ticket/age/:age/points/:points",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      const nif = validationsController.validateNIF(req.params.nif);
      const ticket_id = validationsController.validateString(req.params.ticket);
      const age = validationsController.validateAge(req.params.age);
      const points = Number(validationsController.validateNumber(req.params.points));

      const fidelity = fidelityController.getFidelity();
      const user = await userController.getUser({nif: nif});
      const ticket = await ticketController.getTicket({_id: ticket_id});

      if (!user || !ticket) {
        throw new Error("Utilizador ou bilhete não existem");
      }

      if (user.points < points) {
        throw new Error("Pontos insuficientes");
      }

      let years = (Date.now() - user.created_at) / 1000 / 60 / 60 / 24 / 365;
      let acquisitions = user.acquisitions;

      let ageDiscount = fidelity.age[age];
      
      let pointsDiscount = points / 100 * fidelity.points;

      let clientYearsDiscount = years / 100 * fidelity.years;

      let acquisitionsDiscount = acquisitions / 100 * fidelity.acquisitions;
    
      let usedPoints = points;

      let finalPrice = ticket.price - ageDiscount - pointsDiscount - clientYearsDiscount - acquisitionsDiscount;
      
      if (finalPrice < 0) {
        finalPrice = 0;
        if (finalPrice + pointsDiscount >= 0) {
          usedPoints = points - (finalPrice + pointsDiscount);
        }
      }

      usedPoints = Math.round(usedPoints * 100) / 100;
      ageDiscount = Math.round(ageDiscount * 100) / 100;
      pointsDiscount = Math.round(pointsDiscount * 100) / 100;
      clientYearsDiscount = Math.round(clientYearsDiscount * 100) / 100;
      acquisitionsDiscount = Math.round(acquisitionsDiscount * 100) / 100;
      finalPrice = Math.round(finalPrice * 100) / 100;
      
      res.json({
        finalPrice: finalPrice,
        usedPoints: usedPoints,
        pointsDiscount: pointsDiscount,
        ageDiscount: ageDiscount,
        clientYearsDiscount: clientYearsDiscount,
        acquisitionsDiscount: acquisitionsDiscount,
      });
    } catch (error) {
      res.json({error: error.message});
    }
  })
);

router.post(
  "/user-ticket",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      const nif = validationsController.validateNIF(req.body.nif);
      const ticket_id = validationsController.validateString(req.body.ticket);
      const age = validationsController.validateAge(req.body.age);
      const points = validationsController.validateNumber(req.body.points);

      let user = await userController.getUser({ nif: nif });
      let ticket = await ticketController.getTicket({ _id: ticket_id });
      const fidelity = fidelityController.getFidelity();

      if (!user || !ticket) {
        throw new Error("Utilizador ou bilhete não existem");
      }

      if (user.points < points) {
        throw new Error("Pontos insuficientes");
      }

      let years = (Date.now() - user.created_at) / 1000 / 60 / 60 / 24 / 365;
      let acquisitions = user.acquisitions;

      let ageDiscount = fidelity.age[age];
      
      let pointsDiscount = points / 100 * fidelity.points;

      let clientYearsDiscount = years / 100 * fidelity.years;

      let acquisitionsDiscount = acquisitions / 100 * fidelity.acquisitions;
    
      let usedPoints = points;

      let finalPrice = ticket.price - ageDiscount - pointsDiscount - clientYearsDiscount - acquisitionsDiscount;
      
      if (finalPrice < 0) {
        finalPrice = 0;
        if (finalPrice + pointsDiscount >= 0) {
          usedPoints = points - (finalPrice + pointsDiscount);
        }
      }

      usedPoints = Math.round(usedPoints * 100) / 100;
      ageDiscount = Math.round(ageDiscount * 100) / 100;
      pointsDiscount = Math.round(pointsDiscount * 100) / 100;
      clientYearsDiscount = Math.round(clientYearsDiscount * 100) / 100;
      acquisitionsDiscount = Math.round(acquisitionsDiscount * 100) / 100;
      finalPrice = Math.round(finalPrice * 100) / 100;

      let userTicket = {
        user_id: user.id,
        ticket_id: ticket.id,
        price: finalPrice,
        points: usedPoints,
        discount: ticket.price - finalPrice,
      };
      await userTicketController.createUserTicket(userTicket);
      await userController.updateUser(
        { _id: user.id },
        {
          acquisitions: user.acquisitions + 1,
          points: user.points - usedPoints + 5,
        }
      );
      res.redirect("back");
    } catch (err) {
      res.render("error", {
        message: err.message,
        error: err,
      });
    }
  })
);

module.exports = router;
