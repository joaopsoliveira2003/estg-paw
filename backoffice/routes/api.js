const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const validationsController = require("../controllers/ValidationsController");
const patrimonyController = require("../controllers/PatrimonyController");
const eventController = require("../controllers/EventController");
const ticketController = require("../controllers/TicketController");
const userController = require("../controllers/UserController");
const fidelityController = require("../controllers/FidelityController");
const userTicketController = require("../controllers/UserTicketController");

router.post('/login', asyncHandler(async (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.json({ error: 'Credenciais Inválidas' });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        return res.json({ error: 'Erro ao efetuar login' });
      }

      const payload = {
        sub: user.id,
      };

      const token = jwt.sign(payload, 'estg-paw');

      return res.json({ token: token, user: user });
    });
  })(req, res, next);
}));

router.post('/register', asyncHandler(async (req, res, next) => {
  try {
    let user = {
      name: validationsController.validateString(req.body.name),
      email: validationsController.validateEmail(req.body.email),
      nif: validationsController.validateNIF(req.body.nif),
      password: validationsController.validatePassword(req.body.password),
    }
    let exists = await userController.getUser({ nif: user.nif });
      if (exists) {
        throw new Error("Já existe um utilizador com esse NIF");
      }
    await userController.createUser(user);
    console.log(user);
    res.json({error: ''});
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
}));

router.post("/password", passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res, next) => {
  try {
    let password = validationsController.validatePassword(req.body.newPassword)
    if (!await userController.checkPassword(req.user._id, req.user.salt, validationsController.validatePassword(req.body.oldPassword))) {
      throw new Error("Password atual errada");
    }
    await userController.updateUser({ _id: req.user.id }, { password: password });
    res.json({error: ''});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}));

router.get('/dashboard', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res, next) => {
  try {
    let now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let future = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    res.json({
      acquiredTickets: await userTicketController.countUserTickets({ user_id: req.user._id }),
      availableEvents: await eventController.countEvents({ startDate: { $gte: today } }),
      todayEvents: await eventController.countEvents({ $and: [{ startDate: { $gte: today } }, { endDate: { $lt: future } }] }),
      futureEvents: await eventController.countEvents({ endDate: { $gte: future } }),
      ticketList: await userTicketController.aggregate({user_id : new mongoose.Types.ObjectId(req.user._id)}).sort({_id: -1}).limit(10).exec(),
    })
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}));

router.get('/tickets', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res, next) => {
  try {
    res.json({tickets: await ticketController.aggregateEventsPatrimony({visible: true}).sort({_id: -1}).exec()});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}));

router.get('/tickets/:id', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res, next) => {
  try {
    let ticket = await ticketController.aggregateEventsPatrimony({ _id : new mongoose.Types.ObjectId(validationsController.validateString(req.params.id)), visible: true }).exec();
    if (ticket.length == 0) {
      throw new Error("Bilhete não existe");
    }
    res.json({
      ticket: ticket[0],
      points: req.user.points,
      fidelity: fidelityController.getFidelity(),
      years: (Date.now() - req.user.created_at) / 1000 / 60 / 60 / 24 / 365,
      acquisitions: req.user.acquisitions
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}));

router.get('/profile', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res, next) => {
  try {
    res.json({
      user: await userController.getUser({_id: req.user.id}),
      tickets: await userTicketController.aggregate({user_id: req.user._id}).sort({_id: -1}).exec(),
      totalMoney: await userTicketController.totalMoney({user_id: req.user._id}),
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}));

router.put('/profile', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res, next) => {
  try {
    let user = {
      name: validationsController.validateString(req.body.name),
      email: validationsController.validateEmail(req.body.email),
    }
    await userController.updateUser({ _id: req.user.id }, user);
    res.json({error: ''});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}));

module.exports = router;
