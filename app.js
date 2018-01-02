var restify = require('restify');
var builder = require('botbuilder');
var https = require('https');
var http = require('http');
var requestify = require('requestify');
var request = require('request');
var moment = require('moment'); 
var cognitiveservices = require('botbuilder-cognitiveservices');
var nodemailer = require('nodemailer');
var nocache = require('nocache')
var DynamicsWebApi = require('dynamics-web-api');
var AuthenticationContext = require('adal-node').AuthenticationContext;
var dynamicsWebApi = new DynamicsWebApi({ 
    // webApiUrl: 'https://advancyaqatar0.crm4.dynamics.com/api/data/v8.2/',
    webApiUrl: 'https://advancyaad.crm4.dynamics.com/api/data/v8.2/',
    onTokenRefresh: acquireToken
});
Q = require('q');
var app = require('express')();
app.use(nocache());
// var authorityUrl = 'https://login.microsoftonline.com/d022f938-d149-41eb-89fc-2792c9c82ee2/oauth2/token';
// var resource = 'https://advancyaqatar0.crm4.dynamics.com';
// var clientId = 'a5fca245-2eb5-469b-9a36-445203c29a9b';
// var username = 'moatazattar@advancyaQatar.onmicrosoft.com';

var authorityUrl = 'https://login.microsoftonline.com/94aeda88-8526-4ec8-b28f-fa67a055379f/oauth2/token';
var resource = 'https://advancyaad.crm4.dynamics.com';
var clientId = '1ae582b5-4b16-4b40-b180-0239e9b2b947';
var username = 'amokdad@advancyaad.onmicrosoft.com';
var password = 'p@ssw0rd2';
var adalContext = new AuthenticationContext(authorityUrl);
function acquireToken(dynamicsWebApiCallback){
    function adalCallback(error, token) {
        if (!error){
            dynamicsWebApiCallback(token);
        }
        else{
            session.send(JSON.stringify(error));
        //    console.log(error.stack);
        }
    }
    adalContext.acquireTokenWithUsernamePassword(resource, username, password, clientId, adalCallback);
}

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

function RestartServer(){
    app.get('/restart', function (req, res, next) {
        process.exit(1);
      });
}


// Create chat connector for communicating with the Bot Framework Service
//Local usage
/*var connector = new builder.ChatConnector({
    appId:"b605dcfd-2ec1-4ffd-86a3-5698febbeaf1",// process.env.MICROSOFT_APP_ID,
    appPassword:"vszZWtRjM7wbrXtmyBCu8EW"// process.env.MICROSOFT_APP_PASSWORD
});*/
var initialDialog = "";
var serviceBase = "http://chatbotwizard.azurewebsites.net/api/";
var connector = new builder.ChatConnector({
    appId:"bea33af8-8cb3-4437-8bb3-296df8c1e389",// process.env.MICROSOFT_APP_ID,
    appPassword:")JaSV|[Ea}n[PwQQ"// process.env.MICROSOFT_APP_PASSWORD
});

var connectorCreditCard = new builder.ChatConnector({
    appId:"11244d52-2ed6-46e8-a604-2d8e1b123a62",
    appPassword:"KRZUN2jpzt4ZvRR5q7sNwq9"
});

var connectorLoan = new builder.ChatConnector({
    appId:"fba8910b-8a76-4463-8010-4e606a6f6d35",
    appPassword:"DjecTDRJ1Excy1CMnVUdzWr"
});

// Listen for messages from users 
//server.post('/api/loan/messages', connectorLoan.listen());
//server.post('/api/creditcards/messages', connectorCreditCard.listen());

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector,{
    localizerSettings: { 
        defaultLocale: "en" 
    } 
});

var botCreditCard = new builder.UniversalBot(connectorCreditCard,{
    localizerSettings: { 
        defaultLocale: "en" 
    } 
});

var botLoan = new builder.UniversalBot(connectorLoan,{
    localizerSettings: { 
        defaultLocale: "en" 
    } 
});


var QnaRecognizer = new cognitiveservices.QnAMakerRecognizer({
knowledgeBaseId: "c76d4a69-870f-4d53-8a75-4dc51fa0bdb5", 
subscriptionKey: "f919a2df8db948dc9dc10bef53fe13ce"});

var EnglishRecognizers = {
        EnSupportRecognizer : new builder.RegExpRecognizer( "EnSupport", /(^(?=.*(not working|fix|i want to fix|fix)))/i),
        EnGreetingsRecognizer : new builder.RegExpRecognizer( "EnGreetings",/^(hi|hello|good morning|good evening|good afternoon)/i),///(^(?=.*(hi|hello|good morning|good evening|good afternoon)))/i),// /(Hi|hello|good morning|good evening|good afternoon|)/i),
        MainMenuRecognizer : new builder.RegExpRecognizer( "MainMenu",/^(main menu|back to main menu)/i),///(^(?=.*(main menu|back to main menu|)))/i),
        // greetingRecognizer : new builder.RegExpRecognizer( "Greeting", /(السلام عليكم|صباح الخير|مساء الخير|مرحباً)/i),
        arabicRecognizer : new builder.RegExpRecognizer( "Arabic", /(Arabic)/i), 
        englishRecognizer : new builder.RegExpRecognizer( "English", /(English)/i),
        ChangeLanguageRecognizer : new builder.RegExpRecognizer( "EnglishArabic", /(Change Language | تغيير اللغه)/i),
        CreditCardStartRecognizer : new builder.RegExpRecognizer( "CreditCardStartRecog", /(View all available Credit Card Offers|عرض بطاقات الإئتمان المتاحه)/i),
        LoanStartRecognizer : new builder.RegExpRecognizer( "LoanStartRecog", /(View all available Loans|عرض القروض المتاحه)/i)
    }



var intents = new builder.IntentDialog({ recognizers: [
    QnaRecognizer,
    EnglishRecognizers.EnSupportRecognizer,
    EnglishRecognizers.EnGreetingsRecognizer,
    EnglishRecognizers.MainMenuRecognizer,
    EnglishRecognizers.arabicRecognizer,
    EnglishRecognizers.englishRecognizer,
    EnglishRecognizers.ChangeLanguageRecognizer,
    EnglishRecognizers.CreditCardStartRecognizer,
    EnglishRecognizers.LoanStartRecognizer,
    ] 
})

.matches("EnSupport",(session,args)=>{
    var isSupport = true;
    if(isSupport){
        session.send("Your first intent saids: %s", JSON.stringify(args));
    }
    else{
        session.send("cannotUnderstand");;
        session.endDialog();
    }
})

.matches('MainMenu',(session, args) => {
     var locale =session.conversationData.lang;
    session.conversationData.lang = "en";
    session.preferredLocale(locale,function(err){
        if(!err){
            session.beginDialog("PersonalBanking");  
        };
    })
})
.matches('CreditCardStartRecog',(session, args) => {
    // session.send("%s",session.conversationData.lang);
    var locale =session.conversationData.lang;
    session.preferredLocale(locale,function(err){
        if(!err){
            // session.send("welcomeText");
            session.beginDialog("HeroCardsDialog", { DisplayOptions : "Available Credit Cards", ShowAll: "HeroCardsDialog" , NoOption:"CreditCard" , YesOption:"CollectInformationCRM" });
        };
    })
})
.matches('LoanStartRecog',(session, args) => {
    // session.send("Loan");
    // session.send("%s",session.conversationData.lang);
    // session.send("%s",session.preferredLocale());
    var locale =session.conversationData.lang;
    session.conversationData.lang = "en";
    session.preferredLocale(locale,function(err){
        if(!err){
            // session.send("welcomeText");
            session.beginDialog("HeroCardsDialog", { DisplayOptions : "Available Loan Options", ShowAll: "HeroCardsDialog" , NoOption:"LoanOffers" , YesOption:"CollectInformationCRM" });
        };
    })
    
})
.matches('EnglishArabic',(session, args) => {
    // session.send("%s", session.conversationData.isCreditCardStart)
   
    if(session.conversationData.isCreditCardStart)
        session.beginDialog("setLanguage", {startOption : "creditcard"});
    else
        session.beginDialog("setLanguage", {startOption : "loan"});
           
    
})
.matches('EnGreetings',(session, args) => {
    session.send("welcomeTextinmiddle");
    session.beginDialog("ExistingUser"); 
})
.matches('qna',[
    function (session, args, next) {
        var answerEntity = builder.EntityRecognizer.findEntity(args.entities, 'answer');
        session.send(answerEntity.entity);
        session.endDialog();
    },
    function(session,results){
        if(results.response.index == 0)
        {
            session.send("How can i help");
            session.endDialog();
        }
        else if(results.response.index == 1)
            session.replaceDialog("ExistingUser");
    }
])
.matches('English',(session, args) => {
    // session.send('English');
    /*var locale ="en";
    session.conversationData.lang = "en";
    session.preferredLocale(locale,function(err){
        if(!err){
            // session.send("welcomeText");
            session.replaceDialog("EnglishGreeting");
        };
    })*/
    session.replaceDialog("EnglishGreeting");
})
.matches('Arabic',(session, args) => {
    // session.send('Arabic');
    /*var locale ="ar";
    session.conversationData.lang = locale;
    session.preferredLocale(locale,function(err){
        if(!err){
            // session.send("welcomeText");
            session.replaceDialog("arabicNotYet");
        };
    })*/
    session.replaceDialog("ArabicGreeting");
})

.onDefault((session) => {
    
    if (session.conversationData.dontUnderstandCount == null) {
        session.conversationData.dontUnderstandCount = 1;
    }

    if (session.conversationData.dontUnderstandCount == 3)
    {
        session.conversationData.dontUnderstandCount = 1;
        session.replaceDialog("DontUnderstand");
    }
    else
    {
        session.conversationData.dontUnderstandCount++;
        session.send('defaultIntent');
    }
});

function CreateContact(contact,crmCase, appointment){
    
      dynamicsWebApi.create(contact, "contacts").then(function (response) {
          
         var contactId = response;
         crmCase["customerid_contact@odata.bind"] = "https://advancyaad.crm4.dynamics.com/api/data/v8.2/contacts("+contactId+")";
         crmCase["new_useremail"] = contact.emailaddress1;
         crmCase["new_crmstatus"] = 100000000;
         CreateCase(contact,crmCase, appointment);
  
      })
      .catch(function (error){
          console.log(error);
      });
  }
  function CreateCase(contact,crmCase, appointment){
      dynamicsWebApi.create(crmCase, "incidents").then(function (response) {
        var incidentId = response;
      })
      .catch(function (error){
      });
  }
var program = {
    Constants:{
        questionsBeforeInvest : 5,
        questionBeforeGenericHelp : 3,
        EmailTemplate : {
            Content:{
                en:"Dear {{firstname}}, <br/> Please find below your appointment information <br/><table border=1><tr><td>Doctor Name</td><td>{{doctorName}}</td></tr><tr><td>Location</td><td>{{location}}</td></tr><tr><td>Time Slot</td><td>{{patientTimeSlot}}</td></tr><tr><td>Comment</td><td>{{patientComments}}</td></tr></table><br/>Regards,<br/>Tasmu",
                ar:"<div style='direction:rtl'> عزيزي {{user}} <br/> شكراً على اهتمامك بعقارات الشركه المتحده، سوف نقوم بدراسة طلبك والرد عليك بأقرب فرصة ممكنة <br/><br/><table border=1><tr><td>رقم جوالك</td><td>{{mobile}}</td></tr><tr><td>اهتماماتك</td><td>{{property}}</td></tr><tr><td>الاستعلام عنه</td><td>{{comment}}</td></tr></table><br/> مع تحيات فريق عمل الشركه المتحده</div>"
            },
            Subject:{
                en:"Thank you for submitting an appointment",
                ar:"شكراً من الشركه المتحده"
            }
        },
        YesNo : {
            en:"Yes|No",
            ar:"نعم|كلا"
        }
    },
    Options:{
        LanguageListStart:{
            "العربيه":{Description:"العربيه"},
            "English":{Description:"English"},
        },
    },
    Init : function(){
        program.RegisterDialogs(bot);
        //bot.dialog("/",intents);
        //botCreditCard.dialog("/",intents);
        //botLoan.dialog("/",intents);
    },
    IntentHelper:{
        url : "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/0cfcf9f6-0ad6-47c3-bd2a-094f979484db?subscription-key=13b10b366d2743cda4d800ff0fd10077&timezoneOffset=0&verbose=true&q=",
        GetIntent:function(search){
                var deferred  = Q.defer();
                https.get(program.IntentHelper.url + search, (res) => {
                var body = '';
                res.on('data', (d) => {
                body += d;
                });
                res.on('end', function(){
                    deferred.resolve(body);
                });
                }).on('error', (e) => {
                 deferred.reject(err);
                });
                return deferred.promise;
        }
    },
    RegisterDialogs : function(varBot){
        var response = "", DialogName = "", HeroCardImage = "";
        var mainCounter = 0;
        var dialogCounters = [];
        var responses = [];
       
          requestify.get(serviceBase + 'Dialogs/Get').then(function(response) {
            // Get the response body
            var response = response.getBody();
            for (var i=0; i<response.length; i++){
            var DialogTypeId = response[i].DialogTypeId;
            var DialogName = response[i].DialogName;
            var IsFirstDialog = response[i].IsFirstDialog;
                if (IsFirstDialog)
                initialDialog = DialogName;
            switch (DialogTypeId){
                case "33700895-5218-4E32-8AA2-ED059DEDE8B0": //HeroCard Type
                dialogCounters[i] = DialogName;
                var options = JSON.parse(response[i]["DialogOptions"]);
                var heroOptions = JSON.parse(response[i]["DialogOptions"]).heroOptions;
                var actions = JSON.parse(response[i]["DialogOptions"]).actions;
                dialogCounters[i] = DialogName;
                var heroFoundActions = false;
            varBot.dialog(DialogName,[
                function(session){
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                    var attachments = [];
                    var buttons = [];
                    var actionButtons = "";
                    for (var i=0; i<heroOptions.length; i++){
                        buttons = [];
                        heroFoundActions = false;
                        HeroCardTitle = heroOptions[i].heroCardTitle;
                        HeroCardText = heroOptions[i].heroCardDescription;
                        HeroCardImage = heroOptions[i].heroCardImage;
                        for (var j=0; j<actions.length; j++){
                            if (actions[j].parentIndex == i){
                                actionButtons += "parentIndex:" + actions[j].parentIndex + ";index:" + actions[j].index +";" +  actions[j].optionTitle + "|";
                                if  (actions[j].type != "Link") {
                                buttons.push(
                                        builder.CardAction.imBack(session, actions[j].optionTitle, actions[j].optionTitle)
                                    );
                                }
                                else{
                                    buttons.push(
                                        builder.CardAction.openUrl(session, actions[j].text , actions[j].optionTitle)
                                    ); 
                                }

                            }
                        }
                        attachments.push(
                            new builder.HeroCard(session)
                            .title(HeroCardTitle)
                            .text(HeroCardText)
                            .images([builder.CardImage.create(session, HeroCardImage)])
                            .buttons(buttons)
                        )
                    }
                    msg.attachments(attachments);
                    actionButtons = actionButtons.substring(0, actionButtons.length - 1)

                    builder.Prompts.choice(session, msg, actionButtons ,{listStyle: builder.ListStyle.button});
                    session.conversationData.dialogName = session.dialogStack()[0].id.replace("*:","");
                    mainCounter = dialogCounters.indexOf(session.conversationData.dialogName);

                }
                ,
                function(session,results){

                    responses.push({
                        dialogName : session.conversationData.dialogName,
                        result : results.response.entity.split(";")[1]
                    });;

                    mainCounter = dialogCounters.indexOf(session.conversationData.dialogName);
                    var options = JSON.parse(response[mainCounter]["DialogOptions"]);
                    var DialogTypeId = response[mainCounter].DialogTypeId;
                    var DialogName = response[mainCounter].DialogName;
                    for (var j=0; j<options.actions.length; j++){
                        var parentIndex = results.response.entity.split(";");
                        parentIndex = parentIndex[0].split("parentIndex:")[1];
                        var index = results.response.entity.split(";");
                        index = index[1].split("index:")[1];

                        if (index== options.actions[j].index && parentIndex == options.actions[j].parentIndex){
                        switch (options.actions[j].type){
                            case "dialog":
                            var dialogName = options.actions[j].dialogName;
                            session.replaceDialog(dialogName); 
                            break;
                            case "send":
                            var text = options.actions[j].text;
                            session.send(text);
                            case "Dialog":
                            var dialogName = options.actions[j].dialogName;
                            session.replaceDialog(dialogName); 
                            break;
                            case "Send":
                            var text = options.actions[j].text;
                            session.send(text);
                        break;
                        }

                    }
                }
                try{
                if (options.options.sendEmail){
                    options = options.options;
                    
                    var to = options.email.to;
                    var html = options.email.body;
                    for (var i=0; i<responses.length; i++){
                        to = to.replace("{{" + responses[i].dialogName + "_response}}", responses[i].result);
                        html = html.replace("{{" + responses[i].dialogName + "_response}}", responses[i].result);
                    }
                    console.log(to);
                    /*html = html.replace("{{firstname}}",data.firstname);
                    html = html.replace("{{doctorName}}",data.doctorName);
                    html = html.replace("{{location}}",data.location);
                    html = html.replace("{{patientTimeSlot}}",data.patientTimeSlot);
                    html = html.replace("{{patientComments}}",data.patientComments);*/
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'rattazataom@gmail.com',
                            pass: '!!xuloloL'
                        }
                    });
                    var mailOptions = {
                        from: 'rattazataom@gmail.com',
                        to: to,
                        subject: options.email.subject,
                        html: html,
                        
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                    });
                }
            }
            catch(ex){

            }
                }
                
            ]);
            break;
            case "9EADEF6F-E6F5-440E-945E-182931AA3AC3": //PromptsChoice Type
            dialogCounters[i] = DialogName;
               varBot.dialog(DialogName,[
                function(session){
                    session.conversationData.dialogName = session.dialogStack()[0].id.replace("*:","");
                    mainCounter = dialogCounters.indexOf(session.conversationData.dialogName);
                    var options = JSON.parse(response[mainCounter]["DialogOptions"]);
                    var Text = options.text;
                    dialogCounters[i] = DialogName;
                    var Choices = options.options.choices;
                    builder.Prompts.choice(session, Text, Choices,{listStyle: builder.ListStyle.button});
                },
                function(session,results){
                    responses.push({
                        dialogName : session.conversationData.dialogName,
                        result : results.response.entity
                    });
                    mainCounter = dialogCounters.indexOf(session.conversationData.dialogName);
                    var options = JSON.parse(response[mainCounter]["DialogOptions"]);
                    var DialogTypeId = response[mainCounter].DialogTypeId;
                    var DialogName = response[mainCounter].DialogName;
                    for (var j=0; j<options.actions.length; j++){
                        if (results.response.index == options.actions[j].index){
                        switch (options.actions[j].type){
                            case "dialog":
                            var dialogName = options.actions[j].dialogName;
                            session.replaceDialog(dialogName); 
                            break;
                            case "send":
                            var text = options.actions[j].text;
                            session.send(text);
                            case "Dialog":
                            var dialogName = options.actions[j].dialogName;
                            session.replaceDialog(dialogName); 
                            break;
                            case "Send":
                            var text = options.actions[j].text;
                            session.send(text);
                        break;
                        }

                    }
                }
                try{
                if (options.options.sendEmail){
                    options = options.options;
                    
                    var to = options.email.to;
                    var html = options.email.body;
                    for (var i=0; i<responses.length; i++){
                        to = to.replace("{{" + responses[i].dialogName + "_response}}", responses[i].result);
                        html = html.replace("{{" + responses[i].dialogName + "_response}}", responses[i].result);
                    }
                    console.log(to);
                    /*html = html.replace("{{firstname}}",data.firstname);
                    html = html.replace("{{doctorName}}",data.doctorName);
                    html = html.replace("{{location}}",data.location);
                    html = html.replace("{{patientTimeSlot}}",data.patientTimeSlot);
                    html = html.replace("{{patientComments}}",data.patientComments);*/
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'rattazataom@gmail.com',
                            pass: '!!xuloloL'
                        }
                    });
                    var mailOptions = {
                        from: 'rattazataom@gmail.com',
                        to: to,
                        subject: options.email.subject,
                        html: html,
                        
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                    });
                }
            }
            catch(ex){

            }
                }
            ]);
            break;
            case "64CB72EA-50AD-4A8D-8A1D-136571D83602": //PromptsText Type
            dialogCounters[i] = DialogName;
               varBot.dialog(DialogName,[
                function(session){
                    session.conversationData.dialogName = session.dialogStack()[0].id.replace("*:","");
                    mainCounter = dialogCounters.indexOf(session.conversationData.dialogName);
                    var options = JSON.parse(response[mainCounter]["DialogOptions"]);
                    var Text = options.text;
                    dialogCounters[i] = DialogName;
                    builder.Prompts.text(session, Text);
                },
                function(session,results){
                    responses.push({
                        dialogName : session.conversationData.dialogName,
                        result : results.response
                    });
                    mainCounter = dialogCounters.indexOf(session.conversationData.dialogName);
                    var resultResponse = results.response;

                    var options = JSON.parse(response[mainCounter]["DialogOptions"]);
                    var DialogTypeId = response[mainCounter].DialogTypeId;
                    var DialogName = response[mainCounter].DialogName;

                    for (var j=0; j<options.actions.length; j++){

                        if (options.actions[j].validEmail == true){
                            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            if (!re.test(results.response)){
                                session.send("Invalid Email!");
                                session.replaceDialog(session.conversationData.dialogName);
                                return false;
                            }
                        }
                        switch (options.actions[j].type){
                            case "dialog":
                            var dialogName = options.actions[j].dialogName;
                            session.replaceDialog(dialogName); 
                            break;
                            case "send":
                            var text = options.actions[j].text;
                            session.send(text);
                            case "Dialog":
                            var dialogName = options.actions[j].dialogName;
                            session.replaceDialog(dialogName); 
                            break;
                            case "Send":
                            var text = options.actions[j].text;
                            session.send(text);
                        break;
                        }

                }

                try{
                    if (options.options.sendEmail){
                        options = options.options;
                        var to = options.email.to;
                        var html = options.email.body;
                        for (var i=0; i<responses.length; i++){
                            to = to.replace("{{" + responses[i].dialogName + "_response}}", responses[i].result);
                            html = html.replace("{{" + responses[i].dialogName + "_response}}", responses[i].result);
                        }
                        
                        /*html = html.replace("{{firstname}}",data.firstname);
                        html = html.replace("{{doctorName}}",data.doctorName);
                        html = html.replace("{{location}}",data.location);
                        html = html.replace("{{patientTimeSlot}}",data.patientTimeSlot);
                        html = html.replace("{{patientComments}}",data.patientComments);*/
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'rattazataom@gmail.com',
                                pass: '!!xuloloL'
                            }
                        });
                        var mailOptions = {
                            from: 'rattazataom@gmail.com',
                            to: to,
                            subject: options.email.subject,
                            html: html,
                            
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                        });
                    }
                }
                catch(ex){

                }
                }
            ]);
            break;
        }
    }
            
        });


    },
    Helpers: {
        GetLocal : function(val){
            return val == "1" ? "en" : "ar";
        },
        GetOptions : function(option,locale){
            return option[locale];
        },
        SendEmail : function(data,locale){
            var html = program.Constants.EmailTemplate.Content[locale];
            var subject = program.Constants.EmailTemplate.Subject[locale];
            html = html.replace("{{firstname}}",data.firstname);
            html = html.replace("{{doctorName}}",data.doctorName);
            html = html.replace("{{location}}",data.location);
            html = html.replace("{{patientTimeSlot}}",data.patientTimeSlot);
            html = html.replace("{{patientComments}}",data.patientComments);
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'rattazataom@gmail.com',
                    pass: '!!xuloloL'
                }
            });
            var mailOptions = {
                from: 'rattazataom@gmail.com',
                to: data.email,
                subject: subject,
                html: html,
                
            };
            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
            });
        },
        IsInvestmentIntent: function(args){
            if(args.entities == null || args.entities.length == 0)
                return false;
            return args.entities[0].entity == "invest" || 
            args.entities[0].entity == "investment" ||
            args.entities[0].entity == "investing" ||
            args.entities[0].entity == "land";
        }
    } 
 
}

program.Init();

bot.on('conversationUpdate', function (activity) {  
    requestify.get(serviceBase + 'Dialogs/Get').then(function(response) {
        var response = response.getBody();
        for (var i=0; i<response.length; i++){
            if (response[i].IsFirstDialog){
                if (activity.membersAdded) {
                    activity.membersAdded.forEach((identity) => {
                        if (identity.id === activity.address.bot.id) {
                               bot.beginDialog(activity.address, response[i].DialogName);
                         }
                     });
                }

            }
        }
})

 });


 botCreditCard.on('conversationUpdate', function (activity) {  
    if (activity.membersAdded) {
        activity.membersAdded.forEach((identity) => {
            if (identity.id === activity.address.bot.id) {
                    botCreditCard.beginDialog(activity.address, 'StartCreditCard',{isCreditCardStart : true});
             }
         });
    }
 });


 botLoan.on('conversationUpdate', function (activity) {  
    if (activity.membersAdded) {
        activity.membersAdded.forEach((identity) => {
            if (identity.id === activity.address.bot.id) {
                    botLoan.beginDialog(activity.address, 'LoanStart',{isCreditCardStart : false});
             }
         });
    }
 });
 bot.on("event", function (event) {
    var bot = new builder.UniversalBot(connector,{
        localizerSettings: { 
            defaultLocale: "en" 
        } 
    });
    program.Init();
    //RestartServer();
    var msg = new builder.Message().address(event.address);
    msg.text = "testing";
    bot.send(msg);
    
 })
//  botCreditCard.on('conversationUpdate', function (activity) {  
//     if (activity.membersAdded) {
//         activity.membersAdded.forEach((identity) => {
//             if (identity.id === activity.address.botCreditCard.id) {
//                 //    bot.beginDialog(activity.address, 'setLanguageWithPic');
//                     // session.conversationData.isCreditCardStart = true;
//                     // bot.beginDialog(activity.address, 'LoanStart',{isCreditCardStart : false});
//                 //    bot.beginDialog(activity.address, 'LoanStart');
//              }
//          });
//     }
//  });








 // var bot = new builder.UniversalBot(connector, function (session) {
//     session.sendTyping();
//     setTimeout(function () {
//         session.send("Hello there...");
//     }, 3000);
// });

// bot.use({
//     botbuilder: function (session, next) {
//         // var delta = new Date().getTime();
//         // session.send(JSON.stringify(delta)); 
//         // session.send("Test Use");
//         // session.send(app);
//         session.send("%s", JSON.stringify(session));
//         // session.send("%s",session);

//         // app.get('/', function(req, res){
//         //     // console.log(req.query.name);
//         //     session.send('Response send to client:: '+req.query.name);
//         // });
//         //session.send("%s", JSON.stringify(session));
//         // session.send("%s", JSON.stringify(next));
//         // session.send('Set time out 1');
//         // if (session.conversationData.previousAccess) {
//         //     session.send('Set time out 2');
//         //     // var delta = new Date().getTime() - session.conversationData.previousAccess;
//         //     // session.send(new Date().getTime() - session.conversationData.previousAccess);
//         //         if (new Date().getTime() - session.conversationData.previousAccess > 30000) {
//         //         session.send('Set time out 4');
//         //         session.clearDialogStack();
//         //     }
//         //  }
//         //  session.send('Set time out 3');
//         //  session.conversationData.previousAccess = session.sessionState.lastAccess;
//         // //  session.send(session.privateConversationData.previousAccess);
//         // //  session.send(session.sessionState.lastAccess);
//          next();
//     }
// });

//Recognizers
/**
 *session.conversationData.name
 session.conversationData.Email
 session.conversationData.isRegistered

 */