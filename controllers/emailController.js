const expressAsyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Emails = require('../models/Emails');
const sgMail = require("@sendgrid/mail");
const keys = require("../config/keys");
const Filter = require('bad-words');

//sendgrid configuration
sgMail.setApiKey(keys.sendgridApiKey);


exports.sendEmail = expressAsyncHandler(async(req, res)=>{
    const userId = req.user.id;
    const userEmail = req.user.email;
    const targetEmail = req.body?.email;
    const subject = req.body?.subject;
    const message = req.body?.message;

    if(!targetEmail || !subject || !message ) throw new Error('some fields are missing');

    const filter = new Filter();
    const newBadWords = ['fait chier', 'putain', 'enculer', 'con', 'connard', 'connasse', 'salaud', 'salope', 'ta gueule'];

    filter.addWords(...newBadWords);
    const isProfane = filter.isProfane(subject, message);
    //if a bad word, profane return true
    if(isProfane){
        throw new Error('Email sent failed, because it contains profane words.');
    }
    try{
        //build up msg
        const msg = {
            to: targetEmail,
            from: 'tagliasco.lou@orange.fr',
            subject: subject,
            html: message
        };
        //send msg
        msgStatus = await sgMail.send(msg);
        console.log(msgStatus);
        //Do a copy of our mail inside our db.
        const msgSaved = new Emails({
            _id: new mongoose.Types.ObjectId(),
            fromEmail: userEmail,
            toEmail: targetEmail,
            subject: subject,
            message: message,
            sentBy: userId
        });
        await msgSaved.save();

        res.json(`message sent to ${targetEmail}`);
    }catch(error){
        res.json(error);
    }
});