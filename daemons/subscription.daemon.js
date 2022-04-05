import dotenv from 'dotenv'
dotenv.config();

import mail from 'nodemailer'
import schedule from 'node-schedule'
import { promises as fs } from 'fs'
import mongoose from 'mongoose'
import { replaceHTML } from '../util.js'

import * as Subscription from '../models/subscription.model.js';

mongoose.connect(process.env.mongooseUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const mailer = async function(title, obj) {	
    try {
        let email = await fs.readFile('./templates/mail.html', { encoding:'utf-8' } );
        let text = replaceHTML(email, obj);
        let transporter = mail.createTransport({
            service: 'Gmail',
            host:'smtp.gmail.com',
            port: 465,
            maxMessages: Infinity,
            debug: true,
            secure: true,
            auth:{
                user: process.env.CONTACT_EMAIL,
                pass: process.env.PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        let allSubs = await Subscription.Subscription.find();

        allSubs.forEach(function(item) {
            if(typeof item.email !== "undefined") {
                transporter.sendMail({
                    from   : `${process.env.CONTACT_EMAIL} <${process.env.CONTACT_EMAIL}>`,
                    to     : item.email,
                    subject: title,
                    replyTo: process.env.CONTACT_EMAIL,
                    headers: { 'Mime-Version' : '1.0', 'X-Priority' : '3', 'Content-type' : 'text/html; charset=iso-8859-1' },
                    html   : text
                }, (err, info) => {
                    if(err !== null) {
                        console.log(err);
                    }
                    else {
                        console.log(`Email sent to ${item.email} at ${new Date().toISOString()}`);
                    }
                });
            }
        });

    } catch(e) {
        console.log(e);
    }
}

// Run the CronJob
schedule.scheduleJob('*/10 * * * * *', async function() {
    try {
        mailer(`This is our CronJS Email`, {
            'content' : "Hello, welcome to our email 👋"
        });
    } catch(e) {
        console.log(e);
    }
});