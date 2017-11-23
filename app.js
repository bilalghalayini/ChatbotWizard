var restify = require('restify');
var builder = require('botbuilder');
var https = require('https');
var cognitiveservices = require('botbuilder-cognitiveservices');
var nodemailer = require('nodemailer');
var DynamicsWebApi = require('dynamics-web-api');
var AuthenticationContext = require('adal-node').AuthenticationContext;
var dynamicsWebApi = new DynamicsWebApi({ 
    // webApiUrl: 'https://advancyaqatar0.crm4.dynamics.com/api/data/v8.2/',
    webApiUrl: 'https://advancyaaqatar.crm.dynamics.com/api/data/v8.2/',
    onTokenRefresh: acquireToken
});
Q = require('q');
var app = require('express')();

// var authorityUrl = 'https://login.microsoftonline.com/d022f938-d149-41eb-89fc-2792c9c82ee2/oauth2/token';
// var resource = 'https://advancyaqatar0.crm4.dynamics.com';
// var clientId = 'a5fca245-2eb5-469b-9a36-445203c29a9b';
// var username = 'moatazattar@advancyaQatar.onmicrosoft.com';

var authorityUrl = 'https://login.microsoftonline.com/28e841b2-0c6d-4ec8-b792-66d36aaaa093/oauth2/token';
var resource = 'https://advancyaaqatar.crm.dynamics.com';
var clientId = '7867c3c0-da4a-4658-91dc-24c7373a46b3';
var username = 'amokdad@advancyaaQatar.onmicrosoft.com';
var password = '1!!xuloloL';
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

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId:"b605dcfd-2ec1-4ffd-86a3-5698febbeaf1",// process.env.MICROSOFT_APP_ID,
    appPassword:"vszZWtRjM7wbrXtmyBCu8EW"// process.env.MICROSOFT_APP_PASSWORD
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
server.post('/api/loan/messages', connectorLoan.listen());
server.post('/api/creditcards/messages', connectorCreditCard.listen());

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
        arabicRecognizer : new builder.RegExpRecognizer( "Arabic", /(العربية)/i), 
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
    var locale ="en";
    session.conversationData.lang = "en";
    session.preferredLocale(locale,function(err){
        if(!err){
            // session.send("welcomeText");
            session.replaceDialog("ExistingUser");
        };
    })
})
.matches('Arabic',(session, args) => {
    // session.send('Arabic');
    var locale ="ar";
    session.conversationData.lang = locale;
    session.preferredLocale(locale,function(err){
        if(!err){
            // session.send("welcomeText");
            session.replaceDialog("arabicNotYet");
        };
    })
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


var program = {
    Constants:{
        questionsBeforeInvest : 5,
        questionBeforeGenericHelp : 3,
        EmailTemplate : {
            Content:{
                en:"Dear {{user}} <br/> Thanks alot for your interest in AdvancaBank, our team will study your inquiry and will get back to you as soon as possible <br/><table border=1><tr><td>Mobile</td><td>{{mobile}}</td></tr><tr><td>Type</td><td>{{property}}</td></tr><tr><td>Comment</td><td>{{comment}}</td></tr></table><br/>Regards,<br/>AdvancaBank Team",
                ar:"<div style='direction:rtl'> عزيزي {{user}} <br/> شكراً على اهتمامك بعقارات الشركه المتحده، سوف نقوم بدراسة طلبك والرد عليك بأقرب فرصة ممكنة <br/><br/><table border=1><tr><td>رقم جوالك</td><td>{{mobile}}</td></tr><tr><td>اهتماماتك</td><td>{{property}}</td></tr><tr><td>الاستعلام عنه</td><td>{{comment}}</td></tr></table><br/> مع تحيات فريق عمل الشركه المتحده</div>"
            },
            Subject:{
                en:"Thank you for contacting AdvancaBank",
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
        UserType:{
            en:{
                "Looking For Property":{Description:"Looking For Property"},
                "Resident Services":{Description:"Resident Services"}
            },
            ar:{
                "تبحث عن عقار / منزل":{Description:"تبحث عن عقار / منزل"},
                "ساكن":{Description:"ساكن"}
            }
        },
        AnyOtherThing:{
            en:{
                "Yes":{Description:"Yes"},
                "No, Back to main":{Description:"No, Back to main"}
            },
            ar:{
                "نعم":{Description:"نعم"},
                "لا, الرجوع للقايمه الريئسيه":{Description:"لا, الرجوع للقايمه الريئسيه"}
            }
        },
        EndofService:{
            en:{
               "Return to Main Menu":{Description:"Return to Main Menu"},
                "No Thanks":{Description:"No Thanks"},
            },
            ar:{
               "رجوع للقائمه الرئيسيه":{Description:"رجوع للقائمه الرئيسيه"},
                "لا شكرا":{Description:"لا شكرا"},
            }
        },
        NotValidUser:{
            en:{
                "Call Us":{Description:"Call Us"},
                "Visit Us":{Description:"Visit Us"},
                "Try Again":{Description:"No Thanks"},
                "Main Menu":{Description:"Main Menu"},
            },
            ar:{
               "أتصل بنا":{Description:"أتصل بنا"},
               "قم بزيارتنا":{Description:"قم بزيارتنا"},
               "محاوله مره أخري":{Description:"محاوله مره أخري"},
               "القائمه الرئيسيه":{Description:"القائمه الرئيسيه"},
            }
        },
        DontUnderstand:{
            en:{
                "Call Us":{Description:"Call Us"},
                "Visit Us":{Description:"Visit Us"},
                "Main Menu":{Description:"Main Menu"},
            },
            ar:{
               "أتصل بنا":{Description:"أتصل بنا"},
               "قم بزيارتنا":{Description:"قم بزيارتنا"},
               "محاوله مره أخري":{Description:"محاوله مره أخري"},
            }
        },
        ArabicNotYet:{
            en:{
                "Call Us":{Description:"Call Us"},
                "Visit Us":{Description:"Visit Us"},
                "Back to Main Menu":{Description:"Back to Main Menu"},
            },
            ar:{
               "أتصل بنا":{Description:"أتصل بنا"},
               "قم بزيارتنا":{Description:"قم بزيارتنا"},
               "رجوع للقائمه الرئيسيه":{Description:"رجوع للقائمه الرئيسيه"},
            }
        },
        AlreadyUser:{
            en:{
               "Yes":{Description:"Yes"},
                "No":{Description:"No"},
            },
            ar:{
               "نعم":{Description:"نعم"},
                "لا":{Description:"لا"},
            }
        },
        PropertyInterest:{
            en:{
               "More Info":{Description:"Yes"},
                "Show All":{Description:"Show All"},
                "Back":{Description:"Back"}
            },
            ar:{
                "المزيد":{Description:"نعم"},
                "لا":{Description:"لا"},
                "إظهر الكل":{Description:"إظهر الكل"}
            }
        },
        Services:{
            en:{
                "Personal Banking":{Description:"Personal Banking"},
                "Business Banking":{Description:"Business Banking"},
                "Private Banking":{Description:"Private Banking"},
                "Submit Inquiries":{Description:"Submit Inquiries"},
            },
            ar:{
                "حساب شخصي":{Description:"حساب شخصي"},
                "حساب شركه":{Description:"حساب شركه"},
                "حساب خاص":{Description:"حساب خاص"},
                "تقديم طلب":{Description:"تقديم طلب"},
            }
        },
        CreditCardServices:{
            en:{
                "View all available Credit Card Offers":{Description:"View all available Credit Card Offers"},
                "Ask about Frequent Flier Miles offer":{Description:"Ask about Frequent Flier Miles offer"},
                "Back":{Description:"Back"},
            },
            ar:{
                "عرض بطاقات الإئتمان المتاحه":{Description:"عرض بطاقات الإئتمان المتاحه"},
                "عروض الماتحه":{Description:"عروض الماتحه"},
                "الرجوع":{Description:"الرجوع"},
            }
        },
        CreditCardServicesStart:{
            en:{
                "View all available Credit Card Offers":{Description:"View all available Credit Card Offers"},
                "Main Menu":{Description:"Main Menu"},
                "Change Language | تغيير اللغه":{Description:"Change Language| تغيير اللغه"},
            },
            ar:{
                "عرض بطاقات الإئتمان المتاحه":{Description:"عرض بطاقات الإئتمان المتاحه"},
                "القائمه الرئيسيه":{Description:"القائمه الرئيسيه"},
                "Change Language | تغيير اللغه":{Description:"Change Language| تغيير اللغه"},
            }
        },
        LoanServicesStart:{
            en:{
                "View all available Loans":{Description:"View all available Loans"},
                "Main Menu":{Description:"Main Menu"},
                "Change Language | تغيير اللغه":{Description:"Change Language| تغيير اللغه"},
            },
            ar:{
                "عرض القروض المتاحه":{Description:"عرض القروض المتاحه"},
                "القائمه الرئيسيه":{Description:"القائمه الرئيسيه"},
                "Change Language | تغيير اللغه":{Description:"Change Language| تغيير اللغه"},
            }
        },
        LoanOffersServices:{
            en:{
                "View all available Loan Offers":{Description:"View all available Credit Card Offers"},
                "Ask us any question":{Description:"Ask us any question"},
                "Back":{Description:"Back"},
            },
            ar:{
                "عروض القروض المتاحه":{Description:"عروض القروض المتاحه"},
                "إسالنا...":{Description:"إسالنا..."},
                "الرجوع":{Description:"الرجوع"},
            }
        },
       PersonalBankingServices :{
            en:{
                "Our Credit Cards":{Description:"Our Credit Cards"},
                "Our Loan Offers":{Description:"Our Loan Offers"},
                "Our Accounts":{Description:"Our Accounts"},
                "Back":{Description:"Back"},
            },
            ar:{
                "بطاقات الإئتمان":{Description:"بطاقات الإئتمان"},
                "عروض القروض":{Description:"عروض القروض"},
                "حساباتنا":{Description:"حساباتنا"},
                "الرجوع":{Description:"الرجوع"},
            }
        },
        AvailableProperty:{
            en:{
                "Location":{ 
                    Cards : false,
                    Title:"Location", 
                    Description:"please select one of the below locations",
                    Items:{
                        "Ras Abu Funtas": {
                            Cards : false,
                            Title:"west bay",
                            Description:"An area of 4.01 km², situated adjacent to Do​​ha’s new Hamad International Airport, Ras Bufontas is an ideal location for businesses requiring international connectivity.<br/>Ras Bufontas is set to become an advanced technology and logistics hub for the region, attracting regional and global business, trade, and investment thereby contributing to the Qatari Government’s vision of becoming a SMART nation.<br/>This Zone will provide a vibrant and inspiring workplace. A long-lasting, high-quality, and low-maintenance design includes service hubs, public spaces, land for labour accommodation, utilities access, versatile office and retail space, and our Headquarters.<br/>With the Gulf Region and beyond on ​the doorstep, the world-class infrastructure at Ras Bufontas will help your business to grow both within and outside of Qatar.​​​"
                        },
                        "Um Al Houl": {
                            Cards : false,
                            Title:"west bay",
                            Description:"it is in the fourth street blabla"
                        }
                    }           
                },
                "Working Hours":{
                    Cards : false,
                    Title:"Working Hours", 
                    Description:"please select one of the below",
                    Items:{
                        "Morning": {
                            Cards : false,
                            Title:"Morning",
                            Description:"Sunday: 8:00 - 12:00<br/>Monday: 8:00 - 12:00<br/>Tuesday: 8:00 - 12:00<br/>Wednesday: 8:00 - 12:00<br/>Thursday: 8:00 - 12:00​​​"
                        },
                        "Evening": {
                            Cards : false,
                            Title:"Evening",
                            Description:"Sunday: 2:00 - 8:00<br/>Monday: 2:00 - 8:00<<br/>Tuesday: 2:00 - 8:00<<br/>Wednesday: 2:00 - 8:00<<br/>Thursday: 2:00 - 8:00​​​"
                        }
                    }    
                },
                "Available Credit Cards":{
                    Cards : true,
                    Title:"Available Credit Cards", 
                    Description:"please select one of the below",
                    Items:{
                        "Platinum Card": {
                            Cards : true,
                            Image: "https://raw.githubusercontent.com/moatazattar/Bank-Chatbot/master/images/Card%20Platinum.jpg",
                            Title:"Platinum Card",
                            Description:"This is our best offer card and provides ultimate value for your money. From offerings to savings to cashback, it has it all.",
                            Pref: "This is our best offer card and provides ultimate value for your money. From offerings to savings to cashback, it has it all. \n\n 1-UBER RIDES WITH PLATINUM\n 2. \n \n \n \n \n \n \n \n\n\n\n\n2-THE GLOBAL LOUNGE COLLECTION\n\n\n\n\n3-$200 AIRLINE FEE CREDIT\n\n\n\n\n4-FEE CREDIT FOR GLOBAL ENTRY OR TSA PRE\n\n\n\n\n5-FINE HOTELS & RESORTS\n\n\n\n\n6-THE HOTEL COLLECTION\n\n\n\n\n7-PLATINUM TRAVEL SERVICE\n\n\n\n\n8-STARWOOD PREFERRED GUEST® GOLD\n\n\n\n\n9-HILTON HONORS™ GOLD STATUS\n\n\n\n\n10-NO FOREIGN TRANSACTION FEES\n\n\n11-CAR RENTAL PRIVILEGES"
                        },  
                        "Gold Card": {
                            Cards : true,
                            Image: "https://raw.githubusercontent.com/moatazattar/Bank-Chatbot/master/images/Card%20Gold.jpg",
                            Title:"Gold Card",
                            Description:"One of our most popular cards with all types of clients, benefit from\n Reward Points and much more.",
                            Pref: "One of our most popular cards with all types of clients, benefit from\n Reward Points and much more. \n\n Premier Rewards Gold Card from American Express: Reward yourself\n for the things you already do. \n\n Special Offer For You: \n\n Earn 50,000 Points after you spend $2,000 on purchases on your new\n Card in your first 3 months. \n\n This offer is available to you by clicking through this web page.\n If you leave or close this web page and return later, this offer\n may no longer be available. \n\n ANNUAL FEE \n\n $0 intro annual fee for the first year, then $195 \n\n NO INTEREST CHARGES \n\n No interest charges because you pay your balance in full each month\n \n \n \n \n \n \n \n \n"
                        },  
                        "Diner’s Club": {
                            Cards : true,
                            Image: "https://raw.githubusercontent.com/moatazattar/Bank-Chatbot/master/images/Card%20Diner.jpg",
                            Title:"Diner’s Club",
                            Description:"If you’re a fancy eater, you’ll love this card. Discounts & reward schemes from shops all around Qatar. \n\n ​​​​",
                            Pref: " If you’re a fancy eater, you’ll love this card. Discounts & reward schemes from shops all around Qatar. \n\n • World-class merchandise: Select from hundreds of brand-name merchandise options, from electronics and home essentials to sports and outdoors.\n 2. \n \n \n \n \n \n \n \n\n\n\n\n•       Gift Certificates-eGift Certificates: Choose from a selection of retail, dining, hotel, car rental and gas certificates from national establishments.\n\n\n\n\n•       Self-Booking Travel Tool: Use Club Rewards' new Self-Booking Travel tool to search and book your flights or car rentals.\n\n\n\n\n•       Tailored Travel Credit: Fly on virtually any airline, at anytime, with no blackout dates and no restrictions on the number of seats available, or use your points for hotel stays, car rentals and cruises.\n\n\n\n\n•       Frequent Flyer Miles: Redeem Club Rewards points for miles with numerous frequent flyer programs. Airline partners include Air Canada Aeroplan®, Delta SkyMiles®, British Airways Avios Points, Southwest Airlines Rapid Rewards®, and many more\n\n\n\n\n•       Frequent Guest Points: Use your points in participating hotel frequent guest programs. You must be enrolled in the frequent guest program in order to redeem your points. Hotel programs included Marriott Rewards Points, Starwood Preferred Guest® Starpoints®, Hilton HHonorsTM and many more\n\n\n\n\n•       Personalized Rewards: Cardmembers with 50,000+ points can design their own reward. Whatever the wish... whatever the dream... we'll help make it come true."
                        }
                    }   
                },
                "Available Loan Options":{
                    Cards : true,
                    Title:"Available Loan Options", 
                    Description:"please select one of the below",
                    Items:{
                        "Personal Loan": {
                            Cards : true,
                            Image: "https://raw.githubusercontent.com/moatazattar/Bank-Chatbot/master/images/Loan%20Personal.png",
                            Title:"Personal Loan",
                            Description:"No matter what your aspirations and needs, our financing packages and offering...",
                            Pref: "No matter what your aspirations and needs, our financing packages and offerings will help you and provide you with the necessary support to get there. \n\n  With our products and offerings package, you are now closer to many things you desired, such as going on your dream vacation, providing the best educational opportunities for your children, celebrating special occasions as planned or receiving the most advanced and up-to-date medical treatment, in addition to pampering yourself with the most plush and prestigious products. \n\n  Types of Personal Loans: Personal Loan against Salary Personal Loan against Fixed Deposit: You can get the cash you need while maintaining your fixed deposit and accruing profits. \n\n  With a personal loan against your fixed term deposit, you get cash up to 90% of your fixed deposit value at the lowest interest rates upon application using only your ID. \n\n  IPO Loans: Whether you are an experienced stock market investor, or just getting started, an IPO finance loan can help you grab the best opportunities. \n\n "
                        },  
                        "Home Loan": {
                            Cards : true,
                            Image: "https://raw.githubusercontent.com/moatazattar/Bank-Chatbot/master/images/Loan%20Home.png",
                            Title:"Home Loan",
                            Description:"We can help you turn your dreams into action with AdvancaBank Mortgage Loan Features: • Low interest rates.....",
                            Pref: "We can help you turn your dreams into action with AdvancaBank Mortgage Loan Features: \n\n  •  Low interest rates (1) \n\n  •  No management fees \n\n  •  Flexible monthly repayments \n\n  •  Financing ready properties, under construction and Land (2) \n\n  •  Programs for salaried & self-employed customers \n\n  •  Dedicated mortgage loan center for all mortgage financing services * All loans subject to bank approval. \n\n  The bank reserves the right to request additional documents and to impose additional conditions in order to complete the approval process. \n\n "
                        },  
                        "Car Loan": {
                            Cards : true,
                            Image: "https://raw.githubusercontent.com/moatazattar/Bank-Chatbot/master/images/Loan%20Car.png",
                            Title:"Car Loan",
                            Description:"Drive the car of your dreams today. An AdvancaBank Vehicle Loan is affordable and provides flexible t....​​​​",
                            Pref: "Drive the car of your dreams today. An AdvancaBank Vehicle Loan is affordable and provides flexible tenure options to meet every need. Features: \n\n  •  Low interest rates \n\n  •  No management fees \n\n  •  Fast approval \n\n  •  Up to 100% financing \n\n  •  Flexible 6 to 72 month repayment options \n\n  •  Financing of new and pre-owned cars \n\n  •  Discounted comprehensive insurance \n\n  •  Down payment assistance Next step \n\n  •  Salary account with the Bank required"
                        }
                    }   
                }
            }
            ,
            ar:{
                "المكان":{ 
                    Cards : false,
                    Title:"المكان", 
                    Description:"الرجاء الاختيار من الأماكن التالية",
                    Items:{
                        "راس أبو فنطاس": {
                            Cards : false,
                            Title:"الدفنة",
                            Description:"​​تبلغ مساحة رأس بوفنطاس حوالي 4 كيلو متر مربع، وتقع هذه المنطقة بالقرب من مطار حمد الدولي، وتمتاز بموقعها المثالي للأعمال التي تستدعي التواصل على مستوى دولي.<br/>تتميز رأس بوفنطاس بكل ما يجعلها مركزاً للتكنولوجيا والخدمات اللوجستية في المنطقة، والقدرة على جذب الأعمال الإقليمية والعالمية، والتبادل التجاري والاستثمارات التي ستحقق خ​طة حكومة دولة قطر في أن تصبح الدولة الذكية.<br/>يعزز استدامة الأعمال ومستوى الجودة الرفيع والكلفة المنخفضة للصيانة، وذلك كونها تحتوي على مراكز وخدمات،والمساحات العامة، ومباني العمال، وخدمات المرافق العامة، وتجهيزات المكاتب والمتاجر، والمقر الرئيسي الخاص بشركة 'مناطق'."
                        },
                        "أم الهلول": {
                            Cards : false, 
                            Title:"الغرافة",
                            Description:"​​تبلغ مساحة رأس بوفنطاس حوالي 4 كيلو متر مربع، وتقع هذه المنطقة بالقرب من مطار حمد الدولي، وتمتاز بموقعها المثالي للأعمال التي تستدعي التواصل على مستوى دولي.<br/>تتميز رأس بوفنطاس بكل ما يجعلها مركزاً للتكنولوجيا والخدمات اللوجستية في المنطقة، والقدرة على جذب الأعمال الإقليمية والعالمية، والتبادل التجاري والاستثمارات التي ستحقق خ​طة حكومة دولة قطر في أن تصبح الدولة الذكية.<br/>يعزز استدامة الأعمال ومستوى الجودة الرفيع والكلفة المنخفضة للصيانة، وذلك كونها تحتوي على مراكز وخدمات،والمساحات العامة، ومباني العمال، وخدمات المرافق العامة، وتجهيزات المكاتب والمتاجر، والمقر الرئيسي الخاص بشركة 'مناطق'."
                        }
                    }           
                },
                "مواعيد العمل":{
                    Cards : false,
                    Title:"مواعيد العمل", 
                    Description:"الرجاء ألإختيار من التالي",
                    Items:{
                        "صباحاً": {
                            Cards : false,
                            Title:"صباحاً",
                            Description:"الأحد : 8:00 - 12:00 <br/>الاثنين : 8:00 - 12:00 <br/>الثلاثاء : 8:00 - 12:00 <br/> الاربعاء : 8:00 - 12:00 <br/>الخميس : 8:00 - 12:00​​​"
                        },
                        "مساءً": {
                            Cards : false,
                            Title:"مساءً",
                            Description:"الأحد : 8:00 - 2:00 <br/>الاثنين : 8:00 - 2:00 <br/>الثلاثاء : 8:00 - 2:00 <br/> الاربعاء : 8:00 - 2:00 <br/>الخميس : 8:00 - 2:00"
                        }
                    }    
                },
                "الفريق الإداري":{
                    Cards : true,
                    Title:"الفريق الإداري", 
                    Description:"الرجاء ألإختيار من التالي",
                    Items:{
                        "فهد راشد الكعبي": {
                            Cards : true,
                            Image: "https://www.manateq.qa/Admin/PublishingImages/MTQICONS/Fahad%20Al%20Kaabi_Chief%20Executive%20Officer.JPG",
                            Title:"فهد راشد الكعبي",
                            Description:"​شغل الكعبي منصب الرئيس التنفيذي لشركة قطر للإدارة المشاريع (QPM) قبل إلتحاقه بشركة المناطق الاقتصادية. يتمتع الكعبي بخبرة واسعة، تصل إلى أكثر من 17 عاما لا سيما في مجال الهندسة، وإدارة المشاريع ، ومستويات الادارة العليا، حيث تقلد عدة مناصب هامة منها مدير ادارة مشاريع المياه ومدير ادارة كفاءة الطاقة بشركة كهرماء، حيث قام السيد الكعبي خلال هذه الفترة بوضع العديد من السياسات والاستراتيجيات المتعلقة بترشيد إستخدام الكهرباء والماء، كما عمل أيضا على زيادة الوعي بأهمية المحافظة على الطاقة في قطر وفق أعلى المعايير الإقليمية والدولية. حصل الكعبي على شهادة البكالوريوس في الهندسية الصناعية وشهادة البكالوريوس في إدارة الأعمال من جامعة ميامي بالولايات المتحدة الأمريكية، وحصل على درجة الماجستير في إدارة المشاريع من جامعة هيوستن عام 2007.يأمل الكعبي، ومن خلال موقعه كرئيس تنفيذي لشركة المناطق الإقتصادية، في أن يساهم في تحقيق رؤية الشركة التي تهدف إلى دعم التنوع والتنافسية والى تسهيل نمو قطاع الشركات والصناعات الصغيرة والمتوسطة في الإقتصاد القطري تماشيا مع رؤية قطر الوطنية 2030​​​"
                        },
                        "محمد العمادي": {
                            Cards : true,
                            Image: "https://www.manateq.qa/PublishingImages/Al%20Emadi%203.jpg",
                            Title:"محمد العمادي",
                            Description:"يشغل السيد محمد لطف الله العمادي منصب رئيس الشؤون الإدارية والمالية في شركة المناطق الاقتصادية ويدير حالياً أربعة أقسام مختلفة وهي قسم الموارد البشرية، وقسم الموارد المالية، وقسم تكنولوجيا المعلومات، وقسم الخدمات. ويتمتّع العمادي بخبرة ودراية واسعة بفضل الخبرات التي اكتسبها خلال العشرين عام الماضية من مجالات وقطاعات مختلفة مثل البنوك والخدمات اللوجستية والتطوير العقاري والإستثمار. فقبل التحاقه بشركة مناطق، شغل العمادي العديد من المناصب الهامة طيلة مسيرته المهنية في العديد من الشركات على غرار بنك التنمية الصناعية، وشركة الخليج للمخازن، وشركة بروة الدولية للإستثمار العقاري، وشركة أسباير كتارا للإستثمار.​يحمل السيد محمد العمادي بكالوريوس في الهندسة الصناعية من جامعة تكساس إيه اند إم في الولايات المتحده الأمريكيه، كما حصل على العديد من الشهادات من خلال الدورات التدريبية وورش العمل في مجال القياده والإدارة والمحاسبة المالية."
                        },
                        "محمد المالكي": {
                            Cards : true,
                            Image: "https://www.manateq.qa/Admin/PublishingImages/MTQICONS/Mohammed%20Al%20Malki.JPG",
                            Title:"محمد المالكي",
                            Description:"يشغل السيد محمد حسن المالكي منصب رئيس شؤون تطوير وتخطيط الأعمال في شركة المناطق الاقتصادية - مناطق منذ عام 2014. ويتمتّع محمد حسن بدراية واسعة في مجال التخطيط الاستراتيجي والتسويق وتنمية العلاقات وتطوير الأعمال بفضل الخبرات التي اكتسبها من مجالات مختلفة. فقبل انضمامه إلى فريق إدارة مناطق، شغل محمد حسن المالكي منصب رئيس قسم التخطيط الاستراتيجي بالمؤسسة العامة القطرية للكهرباء والماء  وتضمنت مهامه في الإشراف على رسم خارطة الطريق، وتشكيل منتدى التخطيط الاستراتيجي، بالإضافة إلى تحديد الأهداف القصيرة والطويلة المدى للمؤسسة. كما شملت خبرات المالكي السابقة أعمالاً في ميادين مختلفة على غرار تصميم ومراقبة الشبكة الهيدروليكية للمياه فضلاً عن إعداد خطة عمل الشبكة الموزّعة للمياه في .كما يجدر بالذكر أن محمد حسن المالكي يحمل درجة الماجستير في الإدارة من جامعة ليدز ودرجة البكالوريوس في علوم الهندسة الميكانيكية من جامعة قطر. بالإضافة إلى ذلك، التحق المالكي بالعديد من الدورات التدريبية وورشات العمل لتطوير قدراته في إدارة الأعمال والتخطيط الاستراتيجي لا سيما التطبيق العملي ‪'Balance Scorecard'‪ لتحقيق التميز في الأداء، وأيضاً أساليب القيادة لإدارة فعالة، وغيرها العديد من الدورات​​​​"
                        },
                        "حمد النعيمي": {
                            Cards : true,
                            Image: "https://www.manateq.qa/Admin/PublishingImages/MTQICONS/Hamad%20Al%20Naimi_Chief%20Operations%20officer.JPG",
                            Title:"حمد النعيمي",
                            Description:"يشغل السيد حمد راشد النعيمي منصب رئيس شؤون العمليات في شركة المناطق الاقتصادية - مناطق منذ عام 2015، حيث يتولّى مجموعة واسعة من المهام والمسؤوليات منها تطوير وتنفيذ السياسات الاستراتيجية للتشغيل والصيانة لشركة مناطق. وخلال مسيرته المهنية، تولّى النعيمي عدة مناصب هامة أكسبته خبرة ودراية واسعة في العديد من المجالات. فقبل أن يتولّى منصب الرئيس التنفيذي للعمليات، شغل النعيمي العديد من المناصب منها مدير مشروع منطقة الكرعانة الاقتصادية، كما تولّى منصب مدير مراقبة المشاريع والعقود حيث كان يشرف على تنفيذ وتطويّر آليات دعم المشاريع والمشتريات التابعة لها.قبل انضمامه إلى فريق إدارة شركة المناطق الاقتصادية، شغل النعيمي منصب مدير عام الهندسة والانشاءات لدى شركة المتحدة للتنمية، حيث تولى قيادة مجموعة من المشاريع الضخمة من التصميم الى التسليم النهائي كما تم تعيينه عضو مجلس ادارة احدى الشركات التابعه لها، كما تولّى منصب الرئيس الفني لشركة راس غاز، حيث كان يشغل مهمة إدارة المصالح المشتركة مع شركة قطر للغاز والعديد من الشركات التابعة لشركة قطر للبترول. كما كان مسؤولاً عن العديد من المشاريع الضخمة في كل من شركة راس غاز وهيئة الأشغال العامة، حيث تولّى إدارة وتنفيذ مشاريع البنية التحتية. السيد حمد النعيمي حاصل على بكالوريوس في الهندسة المدنية ، كما يملك اكثر من خمسة عشر عاما من الخبره العمليه والادارية وقد تميز بتمتّعه بمهارات قيادية فذة. فهو عضوٌ نشط في معهد إدارة المشاريع الخاصة، والجمعية الأمريكية لإدارة المشاريع - القسم العربي. كما التحق النعيمي بالعديد من الدورات التدريبية والبرامج التأهيلية لتطوير قدراته في إدارة الأعمال والريادة في المشاريع على غرار البرنامج العالمي'الرئيس التنفيذي المستقبلي' في قطر، وبرنامج القيادات التنفيذية من مركز قطر للقيادات."
                        },
                        "حمد المري": {
                            Cards : true,
                            Image: "https://www.manateq.qa/Admin/PublishingImages/MTQICONS/Hamad%20Al%20Marri_Chief%20Projects%20Officer.JPG",
                            Title:"حمد المري",
                            Description:"​انضم المهندس حمد جارالله المري لشركة المناطق الاقتصادية - مناطق بصفته رئيساً لشؤون المشاريع، ويتولّى مجموعة واسعة من المسؤوليات منها تطوير وقيادة المخطّطات الاستراتيجية، ورسم خارطة الطريق الفنية للمشاريع، والتنسيق مع فريق تطوير الأعمال لتنفيذ استراتيجية الشركة، ومراقبة مراحل تشييد وتطوير المشاريع. كما يجدر بالذكر أن المري، وقبل التحاقه بمناطق، بدأ مسيرته المهنية عام 1997 حيث عمل بشركة سنمبروجيتي في ميلان، ومن ثم انتقل إلى العمل في شركة هيونداي في العاصمة سيول، كما عمل بشركة بكتل الأمريكية، ومنها إلى شركة قطر للبترول وصولاً إلى الالتحاق بشركة مناطق عام ٢٠١٣ بعد تجربة مهنية عالمية المستوى.​يحمل المهندس المري البكالوريوس في الهندسة الميكانيكية، وأكثر من ثلاثين شهادةً في العديد من الدورات التدريبية والبرامج التأهيلية والقيادية. التحق المري بالعديد من اللجان أثناء مسيرته المهنية مثل لجنة المناقصات لشركة ميرسك قطر للبترول ومشروع البتروكيماويات التابع لقطر للبترول وشال وشل، وشركة دولفين للطاقة وشركة توتال قطر، فضلاً عن عمله كنائب لرئيس الفريق القائم على أعمال الغاز الطبيعي المضغوط لفائدة النقل العمومي. المهندس/ حمد المري شارك في العديد من المؤتمرات والمناسبات داخل وخارج دولة قطر.​​​"
                        }
                    }   
                }
            }
        },
         ManualHelp:{
            en:{
                "Call Us":{ 
                    Title:"Call Us", 
                    Description:"+974 40323333",        
                },
                "Visit Us":{
                    Title:"Visit Us", 
                    Description:"Visit Us",  
                },
                "Ask us to call you back":{
                    Title:"Ask us to call you back", 
                    Description:"please select one of the below",   
                }
            },
            ar:{
                "اتصل بنا عبر الهاتف":{ 
                    Title:"اتصل بنا عبر الهاتف", 
                    Description:"+974 40323333",        
                },
                "زرنا في مكاتبنا":{
                    Title:"زرنا في مكاتبنا", 
                    Description:"زرنا في مكاتبنا",  
                },
                "اطلب منا ان نتصل بك":{
                    Title:"اطلب منا ان نتصل بك", 
                    Description:"please select one of the below",   
                }
            },
        },
        Languages:"العربية|English"
    },
    Init : function(){
        
        program.RegisterDialogs(bot);
        program.RegisterDialogs(botCreditCard);
        program.RegisterDialogs(botLoan);
        bot.dialog("/",intents);
        botCreditCard.dialog("/",intents);
        botLoan.dialog("/",intents);
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

        varBot.dialog("CreditCard",[
            function(session, args){
                var CreditCardServicesList = program.Helpers.GetOptions(program.Options.CreditCardServices,session.preferredLocale());
                builder.Prompts.choice(session, "getCreditCardServices", CreditCardServicesList,{listStyle: builder.ListStyle.button});
            },
            function(session,results){
                if (results.response.index == 0) {
                   //credit cards hero cards
                   session.replaceDialog("HeroCardsDialog", { DisplayOptions : "Available Credit Cards", ShowAll: "HeroCardsDialog" , NoOption:"CreditCard" , YesOption:"CollectInformationCRM" });
                }
                else if(results.response.index == 1)
                {
                    session.send("whichService");
                    session.endDialog();
                }
                else if(results.response.index == 2)
                {
                    session.replaceDialog("PersonalBanking");
                }
            }
        ]);

        

        varBot.dialog("setLanguage",[
        function(session, args){
            // session.send(session.conversationData.lang);
            session.dialogData.startOption = args.startOption;
            builder.Prompts.choice(session, "selectYourLanguageStart",program.Options.LanguageListStart,{listStyle: builder.ListStyle.button});
        },
        function(session,results){
            var locale = program.Helpers.GetLocal(results.response.index);
            session.conversationData.lang = locale;
            session.preferredLocale(locale,function(err){
                if(!err)
                {
                    if(session.dialogData.startOption == "creditcard")
                        session.replaceDialog("StartCreditCard");
                    if(session.dialogData.startOption == "loan")
                        session.beginDialog("LoanStart");
                    if(session.dialogData.startOption == null)
                        if (results.response.index == 1) 
                            session.beginDialog("ExistingUser");
                        else
                            session.beginDialog("arabicNotYet");
                }       
            });
        }
    ]);

        varBot.dialog("ExistingUser",[
            function(session,results){
                if(session.conversationData.isRegistered)
                    session.replaceDialog("Services");
                else
                {                    
                    var AlreadyUserOptions = program.Helpers.GetOptions(program.Options.AlreadyUser,session.preferredLocale());
                    builder.Prompts.choice(session, "areYouMemeber", AlreadyUserOptions,{listStyle: builder.ListStyle.button});
                }
            },
            function(session,results){
            //    session.conversationData.userType = results.response.entity;
                if(results.response.index == 1)
                {
                    session.conversationData.isRegistered = false;
                    session.replaceDialog("Services");
                }
                else
                {
                    session.conversationData.isRegistered = true;
                    session.replaceDialog("ValidateUser"); 
                }
            },
               function (session,results) {
                   if (results.response.index == 0) {
                    session.beginDialog("getEmailCRM",{ reprompt: false, isRegistered : true });
                   }
                   else
                    session.beginDialog("getEmailCRM",{ reprompt: false, isRegistered : false });
            },
            function (session,results) {
                // session.send(JSON.stringify(results));
                if(session.CRMResult)
                    session.send("Hi Mr. "+ session.conversationData.firstName);
                session.replaceDialog("Services");
            } 
        ]);

        varBot.dialog("EndofService",[
            function(session,results){
                  var EndofServiceOptions = program.Helpers.GetOptions(program.Options.EndofService,session.preferredLocale());
                  builder.Prompts.choice(session, "endofservice", EndofServiceOptions,{listStyle: builder.ListStyle.button});
            },
            function(session,results){
                if(results.response.index == 0)
                    session.replaceDialog("Services"); 
                else
                    session.send("nothanks");
            }
        ]);

        varBot.dialog("NotValidUser",[
            function(session,results){
                  var NotValidUserOptions = program.Helpers.GetOptions(program.Options.NotValidUser,session.preferredLocale());
                  builder.Prompts.choice(session, "NotValidUser", NotValidUserOptions,{listStyle: builder.ListStyle.button});
            },
            function(session,results){
                if(results.response.index == 0)
                    session.send("callus"); 
                else if(results.response.index == 1)
                    session.send('<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.5577835921285!2d51.5055749!3d25.285457299999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45dad01d5d434b%3A0x7370ee6db605fda7!2sBarwa+Tower+3%2C+C+Ring+Rd%2C+Doha!5e0!3m2!1sen!2sqa!4v1503151592480" width="600" height="450" frameborder="0" style="border:0" allowfullscreen></iframe>').endDialog();
                else if(results.response.index == 2)
                    session.replaceDialog("ValidateUser");
                else if(results.response.index == 3)
                    session.replaceDialog("Services");
            }
        ]);

        varBot.dialog("DontUnderstand",[
            function(session,results){
                  var DontUnderstandOptions = program.Helpers.GetOptions(program.Options.DontUnderstand,session.preferredLocale());
                  builder.Prompts.choice(session, "DontUnderstand", DontUnderstandOptions,{listStyle: builder.ListStyle.button});
            },
            function(session,results){
                if(results.response.index == 0)
                    session.send("callusdontunderstand"); 
                else if(results.response.index == 1)
                    session.send('<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.5577835921285!2d51.5055749!3d25.285457299999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45dad01d5d434b%3A0x7370ee6db605fda7!2sBarwa+Tower+3%2C+C+Ring+Rd%2C+Doha!5e0!3m2!1sen!2sqa!4v1503151592480" width="600" height="450" frameborder="0" style="border:0" allowfullscreen></iframe>').endDialog();
                // else if(results.response.index == 2)
                //     session.replaceDialog("Services");

                session.replaceDialog("Services");
            }
        ]);

        varBot.dialog("CommentsandSendEmail",[
            function(session,results){ //get how you heard about us
                 if (results.RequestType != null && results.RequestType == "Inquiry")
                {
                    session.conversationData.InternetedProduct = "General Inquiry";
                    builder.Prompts.text(session, "addInquiry");
                }
                 else
                    builder.Prompts.text(session, "addComment");
            },
            function(session,results){ // end
                session.dialogData.comment = results.response;
                session.send(session.dialogData.name);
                //Send Email

                program.Helpers.SendEmail({
                    email:session.conversationData.email,
                    user:session.conversationData.firstName,
                    mobile:session.conversationData.mobile,
                    property:session.conversationData.InternetedProduct,
                    comment:session.dialogData.comment
                },session.preferredLocale());
                session.send("thanksInquiry",session.conversationData.email);
                session.conversationData.applicationSubmitted = true;
                

                var lead = {
                    subject: "Intersted in "+ session.conversationData.InternetedProduct,
                    firstname: session.conversationData.firstName,
                    description: session.dialogData.comment,
                    mobilephone: session.conversationData.mobile,
                    emailaddress1: session.conversationData.email
                };
                //call dynamicsWebApi.create function 
                dynamicsWebApi.create(lead, "leads").then(function (id) {
                    // session.send("Your data had been saved");
                }).catch(function (error) {
                    session.send("Item Not Added");
                })

                session.replaceDialog("EndofService");

            }
        ]);
        
        varBot.dialog("ValidateUser",[
            function(session,args){
                session.beginDialog("getEmail");
                // session.beginDialog("getEmailCRMLead",{ reprompt: false, isRegistered : session.conversationData.isRegistered });
            },
            function (session,results) {
                session.dialogData.email =  results.response;
                session.beginDialog("getMobile");
            },
            function(session,results){ //get mobile
                session.dialogData.mobile = results.response;
                session.beginDialog("getDateofBirth");
            },
            function(session,results){ //get how you heard about us
                //{“type”:“chrono.duration”,“entity”:“13-1-1989”,“startIndex”:0,“endIndex”:9,“resolution”:{“resolution_type”:“chrono.duration”,
                    // “start”:“1989-01-13T09:00:00.000Z”,“ref”:“2017-08-19T14:14:10.558Z”},“score”:1}
                session.conversationData.isRegistered = false;
                var dateFormat = require('dateformat');
                var inputDate= results.response.resolution.start;
                var  inputDateyyyymm =  dateFormat(inputDate, "isoDateTime").substring(0,10);
                // session.send("%s", inputDateyyyymm);
                session.send("Please standby, I will get back to you in a few moments");
                dynamicsWebApi.retrieveAll("contacts", ["firstname","emailaddress1","mobilephone", "birthdate"], "statecode eq 0").then(function (response) {
                    var records = response.value;
                    // session.send("%s",JSON.stringify(records));
                    // session.send("%s",session.dialogData.email);
                    if(JSON.stringify(records).toLowerCase().indexOf(session.dialogData.email.toLowerCase()) > 0 )
                    {
                        // session.send("In");
                        for (var i = 0; i < records.length; i++) {
                            var element = records[i];
                            // session.send("In 2");
                            if (element.emailaddress1 != null && element.emailaddress1.toLowerCase() == session.dialogData.email.toLowerCase()) {
                                if (element.mobilephone != null && element.mobilephone == session.dialogData.mobile ) {
                                    if (inputDateyyyymm == element.birthdate)  { //1989-01-13
                                        session.conversationData.isRegistered = true;
                                        session.conversationData.firstName = element.firstname;
                                        session.conversationData.email = session.dialogData.email;
                                        session.conversationData.mobile = element.mobilephone;
                                        session.send("ValidUser",element.firstname)
                                        session.replaceDialog("Services");
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    session.replaceDialog("NotValidUser");
                }
                )
                .catch(function (session, error){
                    session.replaceDialog("NotValidUser");
                });
            }
        ]);

        varBot.dialog("CollectInformationCRM",[
            function(session,args){
                // session.beginDialog("getEmail");
                
                if (args.RequestType != null && args.RequestType == "Inquiry")
                {
                    session.dialogData.RequestType = args.RequestType;
                    session.conversationData.InternetedProduct = "General Inquery"   
                }

                if(session.conversationData.email == null )
                    session.beginDialog("getEmailCRMLead",{ reprompt: false, isRegistered : session.conversationData.isRegistered,RequestType : args.RequestType});
                else
                {
                    // if (session.dialogData.RequestType != null && session.dialogData.RequestType == "Inquiry")
                    // {
                        session.replaceDialog("CommentsandSendEmail", {RequestType : args.RequestType})  
                    // }
                    // else
                        // session.replaceDialog("CommentsandSendEmail",{RequestType : ""})  
                }
            },
            function (session,results) {
                if(session.CRMResult)
                {
                    if (session.dialogData.RequestType != null && session.dialogData.RequestType == "Inquiry")
                    {
                        session.send("EmailCRMInquiry", session.conversationData.firstName);
                        session.replaceDialog("CommentsandSendEmail", {RequestType : "Inquiry"})     
                    }
                    else
                    {
                        session.send("EmailCRM", session.conversationData.firstName);
                        session.replaceDialog("CommentsandSendEmail",{RequestType : ""})  
                    }
                }
                else
                {
                    session.dialogData.email = results.response;
                    session.beginDialog("getname");   
                }
            },
            function(session,results){ //get mobile
                session.dialogData.name =  session.conversationData.name;
                session.beginDialog("getMobile");
            },
            function(session,results){ //get how you heard about us
                session.dialogData.mobile = results.response;
                if (session.dialogData.RequestType != null && session.dialogData.RequestType == "Inquiry")
                        builder.Prompts.text(session, "addInquiry");  
                    else
                        builder.Prompts.text(session, "addComment");  
            },
            function(session,results){ // end
                session.dialogData.comment = results.response;
                // session.send(session.dialogData.name);
                // session.send(session.dialogData.email);
                //Send Email
                program.Helpers.SendEmail({
                    email:session.dialogData.email,
                    user:session.dialogData.name,
                    mobile:session.dialogData.mobile,
                    property:session.conversationData.InternetedProduct,
                    comment:session.dialogData.comment
                },session.preferredLocale());
                session.send("thanksInquiry",session.dialogData.email);
                session.conversationData.applicationSubmitted = true;

                var lead = {
                    subject: "Intersted in "+ session.conversationData.InternetedProduct,
                    firstname: session.dialogData.name,
                    description: session.dialogData.comment,
                    mobilephone: session.dialogData.mobile,
                    emailaddress1: session.dialogData.email
                };
                //call dynamicsWebApi.create function 
                dynamicsWebApi.create(lead, "leads").then(function (id) {
                    // session.send("Your data had been saved");
                }).catch(function (error) {
                    session.send("Item Not Added");
                })
                session.replaceDialog("EndofService");
            }
        ]);

        varBot.dialog('getDateofBirth', [
            function (session) {
                builder.Prompts.time(session, 'dateofbirthformat');
            },
            function (session, results) {
                session.endDialogWithResult(results);
            }
        ]);

        varBot.dialog("getNationality",[
            function(session){ //get girst name
                if(session.conversationData.nationality == null){
                    builder.Prompts.text(session,"nationalityPlease");
                }
                else{
                    session.endDialog();
                }
            },
            function(session,results){ 
                session.conversationData.nationality = results.response;
                session.endDialog();
            }
        ]);

        varBot.dialog("getname",[
            function(session){ //get girst name
                if(session.conversationData.name == null){
                    builder.Prompts.text(session,"firstNamePlease");
                }
                else{
                    session.endDialog();
                }
            },
            function(session,results){ 
                session.conversationData.name = results.response;
                session.endDialog();
            }
        ]);

        varBot.dialog("getFirstname",[
            function(session){ //get fisrt name
                if(session.conversationData.firstName == null){
                    builder.Prompts.text(session,"firstOnlyNamePlease");
                }
                else{
                    session.endDialog();
                }
            },
            function(session,results){ 
                session.conversationData.firstName = results.response;
                session.endDialog();
            }
        ]);

        varBot.dialog("getLastname",[
            function(session){ //get last name
                if(session.conversationData.lastName == null){
                    builder.Prompts.text(session,"LastOnlyNamePlease");
                }
                else{
                    session.endDialog();
                }
            },
            function(session,results){ 
                session.conversationData.lastName = results.response;
                session.endDialog();
            }
        ]);

        varBot.dialog("getEmail",[
            function(session,args){
                if (args && args.reprompt) {
                    builder.Prompts.text(session, "validEmail");
                } else {
                builder.Prompts.text(session, "enterBankEmail");
                }
            },
            function(session,results)
            {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(re.test(results.response))
                    session.endDialogWithResult(results);
                else
                    session.replaceDialog('getEmail', { reprompt: true });
            }
        ]);

        varBot.dialog("getEmailCRM",[
            function(session,args){
                if (args && args.reprompt) {
                        builder.Prompts.text(session, "validEmail");
                } else {
                    if (args.isRegistered)
                        builder.Prompts.text(session, "enterEmailCRM");
                    else if(!args.isRegistered)
                        builder.Prompts.text(session, "enterEmailNoCRM");
                    else
                        builder.Prompts.text(session, "enterBankEmail");
                }
            },
            function(session,results)
            {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(re.test(results.response))
                    {
                        session.send("Please standby, I will get back to you in a few moments");
                        dynamicsWebApi.retrieveAll("contacts", ["emailaddress1","firstname"], "statecode eq 0").then(function (response) {
                            var records = response.value;
                            // session.send(JSON.stringify(response.value));
                            // session.send('%s' , JSON.stringify(records).toLowerCase().indexOf(results.response.toLowerCase()))
                            if(JSON.stringify(records).toLowerCase().indexOf(results.response.toLowerCase()) > 0 )
                            {
                                for (var i = 0; i < records.length; i++) {
                                    var element = records[i];
                                    if (element.emailaddress1 != null && element.emailaddress1.toLowerCase() == results.response.toLowerCase()) {
                                        session.CRMResult = true;
                                        session.conversationData.isRegistered = true;
                                        session.conversationData.firstName = element.firstname;
                                        break;
                                    }
                                }
                                session.endDialogWithResult(results);
                            }
                            else
                            {
                                session.dialogData.email = results.response;
                                session.beginDialog("CollectDataCRM",{Email:results.response}); 
                            }
                        })
                        .catch(function (error){
                            session.send(JSON.stringify( error));
                        });
                    }
                else
                    session.replaceDialog('getEmail', { reprompt: true });
            }
        ]);
        
        varBot.dialog("getEmailCRMLead",[
            function(session,args){
                if (args && args.reprompt) {
                        builder.Prompts.text(session, "validEmail");
                } else {
                    if (args.isRegistered && args.RequestType == "")
                        builder.Prompts.text(session, "enterEmailCRM");
                    else if(!args.isRegistered && args.RequestType == "")
                        builder.Prompts.text(session, "enterEmailNoCRM");
                    else if (args.RequestType == "Inquiry") 
                        builder.Prompts.text(session, "enterEmailInquiry");
                    else
                        builder.Prompts.text(session, "enterBankEmail");
                }
            },
            function(session,results)
            {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(re.test(results.response))
                    {
                        session.conversationData.email = results.response;
                        session.send("Please standby, I will get back to you in a few moments");
                        dynamicsWebApi.retrieveAll("leads", ["emailaddress1","firstname", "mobilephone"], "statecode eq 0").then(function (response) {
                            var records = response.value;
                            if(JSON.stringify(records).toLowerCase().indexOf(results.response.toLowerCase()) > 0 )
                            {
                                for (var i = 0; i < records.length; i++) {
                                    var element = records[i];
                                    if (element.emailaddress1 != null && element.emailaddress1.toLowerCase() == results.response.toLowerCase()) {
                                        session.CRMResult = true;
                                        session.conversationData.isRegistered = true;
                                        session.conversationData.firstName = element.firstname;
                                        session.conversationData.mobile = element.mobilephone;
                                        break;
                                    }
                                }
                                session.endDialogWithResult(results);
                            }
                            else
                            {
                                session.endDialogWithResult(results);
                                // session.dialogData.email = results.response;
                                // session.beginDialog("CollectDataCRM",{Email:results.response}); 
                            }
                        })
                        .catch(function (error){
                            session.send(JSON.stringify( error));
                        });
                    }
                else
                    session.replaceDialog('getEmail', { reprompt: true });
            }
        ]);

        varBot.dialog("CollectDataCRM",[
            function(session,args){
                session.dialogData.email = args.Email;
                session.beginDialog("getFirstname");    
            },
            function(session,results){ //get fisrt name
                session.dialogData.firstName = results.response;
                session.beginDialog("getLastname");
            },
            function(session,results){ //get last name
                session.dialogData.lastName = results.response;
                session.beginDialog("getMobile");
            },
            function(session,results){ //get how you heard about us
                session.dialogData.mobile = results.response;
                session.send("Please standby, I will get back to you in a few moments");
                dynamicsWebApi.retrieveAll("leads", ["emailaddress1"], "statecode eq 0").then(function (response) {
                    var records = response.value;
                    if(JSON.stringify(records).toLowerCase().indexOf(session.dialogData.email.toLowerCase()) < 0 )
                    {
                        var lead = {
                                subject: "Not Registered Resident Chatbot Record",
                                firstname: session.conversationData.firstName,
                                lastname: session.conversationData.lastName,
                                mobilephone: session.dialogData.mobile,
                                emailaddress1: session.dialogData.email
                            };
                            //call dynamicsWebApi.create function 
                            dynamicsWebApi.create(lead, "leads").then(function (id) {
                                //session.send("Item Added");
                            }).catch(function (error) {
                                session.send("Item Not Added");
                            })
                        session.endDialogWithResult(results);
                    }
                    else
                        session.endDialogWithResult(results);
                })
                .catch(function (error){
                    session.send("");
                });
            }
        ]);
        
        varBot.dialog("getMobile",[
            function(session,args){
                if (args && args.reprompt) {
                    builder.Prompts.text(session, "validMobile");
                } else {
                builder.Prompts.text(session, "getMobileNumber");
                }
            },
            function(session,results)
            {
                var re = /[0-9]{8}/;
                if(re.test(results.response))
                    session.endDialogWithResult(results);
                else
                    session.replaceDialog('getMobile', { reprompt: true });
            }
        ]);
        
        varBot.dialog("manualHelp",[
            function(session){
                
                var locale = session.preferredLocale();
                builder.Prompts.choice(session, "manualHelpText", program.Options.ManualHelp[locale],{listStyle: builder.ListStyle.button});
            },
            function(session,results){
                var index = JSON.stringify(results.response.index);
                var locale = session.preferredLocale();
                if(index == 0){
                    session.send(program.Options.ManualHelp[locale][results.response.entity].Description).endDialog();
                }
                if(index == 1){
                    session.send("<iframe style='height:300px' src='https://gis.manateq.qa/manateq/manateqmain.aspx?language=ar'></iframe>").endDialog();
                }
                //program.Options.ManualHelp[locale]
                if(index == 2){
                    session.replaceDialog("invest");
                }
            }]);

     
        


        varBot.dialog("Services",[
            function(session){
                var ServicesList = program.Helpers.GetOptions(program.Options.Services,session.preferredLocale());
                builder.Prompts.choice(session, "getServices", ServicesList,{listStyle: builder.ListStyle.button});
            },
            function(session,results){
                if (results.response.index == 0) {
                    // session.send("whichService");
                    session.replaceDialog("PersonalBanking");
                }
                else if(results.response.index == 1)
                {
                    session.send("Sorry, I’m still “Under Development” and learning about this section");
                    session.replaceDialog("Services");
                }
                else if(results.response.index == 2)
                {
                    session.send("Sorry, I’m still “Under Development” and learning about this section");
                    session.replaceDialog("Services");
                }
                else if(results.response.index == 3)
                {
                    // session.send("1. Sorry, I’m still “Under Development” and learning about this section");
                    session.replaceDialog("CollectInformationCRM" , {RequestType : "Inquiry"});
                }
            }
        ]);

        

        varBot.dialog("PersonalBanking",[
            function(session){
                var personalBankingServicesList = program.Helpers.GetOptions(program.Options.PersonalBankingServices,session.preferredLocale());
                builder.Prompts.choice(session, "getServicesDynamic", personalBankingServicesList,{listStyle: builder.ListStyle.button});
            },
            function(session,results){
                if (results.response.index == 0) {
                   //credit cards dialog
                   session.replaceDialog("CreditCard");
                }
                else if(results.response.index == 1)
                {
                   session.replaceDialog("LoanOffers");
                }
                else if(results.response.index == 2)
                {
                    session.send("1. Sorry, I’m still “Under Development” and learning about this section");
                    session.replaceDialog("PersonalBanking");
                }
                else if(results.response.index == 3)
                {
                    session.replaceDialog("Services");
                }
            }
        ]);
        
        

        varBot.dialog("StartCreditCard",[
            function(session, results){
                if(results!= null && results.isCreditCardStart != null )
                {
                    session.conversationData.isCreditCardStart = results.isCreditCardStart;
                    session.send("CreditCardStarttext");
                    // session.send("%s",session.conversationData.lang);
                    if(session.conversationData.lang == null)
                    {
                        var locale ="en";
                        session.conversationData.lang = "en";
                        session.preferredLocale(locale,function(err){
                            if(!err){
                                // session.send("%s",session.conversationData.lang);
                                var CreditCardServicesList = program.Helpers.GetOptions(program.Options.CreditCardServicesStart,session.preferredLocale());
                                builder.Prompts.choice(session, "getCreditCardServices", CreditCardServicesList,{listStyle: builder.ListStyle.button});
                            };
                        })
                    }
                    else
                    {
                        var CreditCardServicesList = program.Helpers.GetOptions(program.Options.CreditCardServicesStart,session.preferredLocale());
                        builder.Prompts.choice(session, "getCreditCardServices", CreditCardServicesList,{listStyle: builder.ListStyle.button});
                    }
                }
                else
                {
                    var CreditCardServicesList = program.Helpers.GetOptions(program.Options.CreditCardServicesStart,session.preferredLocale());
                    builder.Prompts.choice(session, "getCreditCardServices", CreditCardServicesList,{listStyle: builder.ListStyle.button});
                }
            },
            function(session,results){
                if (results.response.index == 0) {
                   //credit cards hero cards
                   session.replaceDialog("HeroCardsDialog", { DisplayOptions : "Available Credit Cards", ShowAll: "HeroCardsDialog" , NoOption:"CreditCard" , YesOption:"CollectInformationCRM" });
                }
                else if(results.response.index == 1)
                    session.replaceDialog("ExistingUser");
                else if(results.response.index == 2)
                    session.replaceDialog("setLanguage", {startOption : "creditcard"});
            }
        ]);

        varBot.dialog("LoanStart",[
            function(session, results){
                if(results != null && results.isCreditCardStart != null )
                {
                    session.conversationData.isCreditCardStart = results.isCreditCardStart;
                    session.send("LoanStarttext");
                    if(session.conversationData.lang == null)
                    {
                        var locale = program.Helpers.GetLocal(1);
                        session.conversationData.lang = locale;
                        session.preferredLocale(locale,function(err){
                        if(!err){
                            // session.send("%s",session.preferredLocale());
                            var LoanServicesList = program.Helpers.GetOptions(program.Options.LoanServicesStart,session.preferredLocale());
                            builder.Prompts.choice(session, "getLoanServices", LoanServicesList,{listStyle: builder.ListStyle.button});
                        }
                        })
                    }
                    else
                    {
                        var LoanServicesList = program.Helpers.GetOptions(program.Options.LoanServicesStart,session.preferredLocale());
                        builder.Prompts.choice(session, "getLoanServices", LoanServicesList,{listStyle: builder.ListStyle.button});
                    }
                }
                else
                    {
                        var LoanServicesList = program.Helpers.GetOptions(program.Options.LoanServicesStart,session.preferredLocale());
                        builder.Prompts.choice(session, "getLoanServices", LoanServicesList,{listStyle: builder.ListStyle.button});
                    }
            },
            function(session,results){
                if (results.response.index == 0) {
                   //credit cards hero cards
                   session.replaceDialog("HeroCardsDialog", { DisplayOptions : "Available Loan Options", ShowAll: "HeroCardsDialog" , NoOption:"LoanOffers" , YesOption:"CollectInformationCRM" });
                }
                else if(results.response.index == 1)
                    session.replaceDialog("ExistingUser");
                else if(results.response.index == 2)
                    session.replaceDialog("setLanguage", {startOption : "loan"});
            }
        ]);

        varBot.dialog("LoanOffers",[
            function(session){
                var LoanOffersServicesList = program.Helpers.GetOptions(program.Options.LoanOffersServices,session.preferredLocale());
                builder.Prompts.choice(session, "getLoanServices", LoanOffersServicesList,{listStyle: builder.ListStyle.button});
            },
            function(session,results){
                if (results.response.index == 0) {
                   //Loan hero cards
                   session.replaceDialog("HeroCardsDialog", { DisplayOptions : "Available Loan Options", ShowAll: "HeroCardsDialog" , NoOption:"LoanOffers" , YesOption:"CollectInformationCRM" });
                }
                else if(results.response.index == 1)
                {
                    session.send("whichService");
                    session.endDialog();
                }
                else if(results.response.index == 2)
                {
                    session.replaceDialog("PersonalBanking");
                }
            }
        ]);
        varBot.dialog("arabicNotYet",[
            function(session,results){
                  var ArabicNotYetOptions = program.Helpers.GetOptions(program.Options.ArabicNotYet,session.preferredLocale());
                  builder.Prompts.choice(session, "ArabicNotYet", ArabicNotYetOptions,{listStyle: builder.ListStyle.button});
            },
            function(session,results){
                if(results.response.index == 0)
                 {   
                    session.send("contactus"); 
                    session.replaceDialog("setLanguage", {startOption : null});
                 }
                else if(results.response.index == 1)
                {  
                    session.send('<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.5577835921285!2d51.5055749!3d25.285457299999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45dad01d5d434b%3A0x7370ee6db605fda7!2sBarwa+Tower+3%2C+C+Ring+Rd%2C+Doha!5e0!3m2!1sen!2sqa!4v1503151592480" width="600" height="450" frameborder="0" style="border:0" allowfullscreen></iframe>').endDialog();
                    session.replaceDialog("setLanguage", {startOption : null});
                 }
                else if(results.response.index == 2)
                    session.replaceDialog("setLanguage", {startOption : null});
            }
        ]);
         

        //////////////////////////
            varBot.dialog("HeroCardsDialog",[
            function(session, args){
                session.dialogData.ShowAll = args.ShowAll;
                session.dialogData.YesOption = args.YesOption;
                session.dialogData.NoOption = args.NoOption;
                session.dialogData.DisplayOptions = args.DisplayOptions;

                var locale = session.preferredLocale();
                var result = program.Options.AvailableProperty[locale][args.DisplayOptions];
                session.dialogData.item = result;
                if(!result.Cards)
                {
                    builder.Prompts.choice(session, result.Description, result.Items,{listStyle: builder.ListStyle.button});
                }
                else{
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                    var attachments = [];
                    var txt = session.localizer.gettext(session.preferredLocale(),"select");
                    for(var i in result.Items)
                    {
                        attachments.push(
                             new builder.HeroCard(session)
                            .title(result.Items[i].Title)
                            .text(result.Items[i].Description.substring(0,250)+"...")
                            .images([builder.CardImage.create(session, result.Items[i].Image)])
                            .buttons([
                                builder.CardAction.imBack(session, result.Items[i].Title, txt)
                            ])
                        );
                    }
                    msg.attachments(attachments);
                    //session.send(msg);
                    builder.Prompts.choice(session, msg, result.Items,{listStyle: builder.ListStyle.button});
                }
            },
            function(session,results){
                var item = session.dialogData.item.Items[results.response.entity];
                if(item.Cards)
                {
                    var msg = new builder.Message(session);
                    var PropertyInterests = program.Helpers.GetOptions(program.Options.PropertyInterest,session.preferredLocale());
                    session.conversationData.InternetedProduct = item.Title;
                    // session.send(JSON.stringify(PropertyInterests))
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                    msg.attachments([
                        new builder.HeroCard(session)
                        .title(item.Title)
                        .text(item.Pref)
                        .images([builder.CardImage.create(session, item.Image)])
                        .buttons([
                            builder.CardAction.imBack(session,Object.keys(PropertyInterests)[0], Object.keys(PropertyInterests)[0]),
                            builder.CardAction.imBack(session,Object.keys(PropertyInterests)[1],Object.keys(PropertyInterests)[1]),
                            builder.CardAction.imBack(session, Object.keys(PropertyInterests)[2],Object.keys(PropertyInterests)[2])
                        ])
                    ])

                    // session.send(msg);//.endDialog();
                    builder.Prompts.choice(session, msg, PropertyInterests, {listStyle: builder.ListStyle.button});
                }
                else{
                   session.send(item.Title + "\n\n" +  item.Description);
                   session.endDialog();     
                }
            },
             function(session,results){
                if(results.response.index == 0) 
                    session.replaceDialog(session.dialogData.YesOption, {RequestType : ""});
                else if(results.response.index == 1)
                    session.replaceDialog(session.dialogData.ShowAll, { DisplayOptions : session.dialogData.DisplayOptions, ShowAll: session.dialogData.ShowAll , NoOption:session.dialogData.NoOption , YesOption:session.dialogData.YesOption}); 
                else if(results.response.index == 2)
                    session.replaceDialog(session.dialogData.NoOption);
             }
        ]);

        /////////////////////////


        
        varBot.dialog("setLanguageWithPic",[
            function(session){
                var msg = new builder.Message(session);
                msg.attachmentLayout(builder.AttachmentLayout.carousel);
                var txt = session.localizer.gettext("en","selectYourLanguage");
                msg.attachments([
                new builder.HeroCard(session)
                    .title("AdvancaBank")
                    .text(txt)
                    .images([builder.CardImage.create(session, "https://raw.githubusercontent.com/moatazattar/Bank-Chatbot/master/images/AdvancyaBankLogo.png")])
                    .buttons([
                        builder.CardAction.imBack(session, "English", "English"),
                        builder.CardAction.imBack(session, "العربية", "العربية"),
                    ])
                ]);
                builder.Prompts.choice(session, msg, "العربية|English");
            }
            ,
            function(session,results){
               var locale = program.Helpers.GetLocal(results.response.index);
            //    session.send("%s", results.response.index)
               session.conversationData.lang = locale;
               session.preferredLocale(locale,function(err){
                   if(!err){
                        // session.send("welcomeText");
                        if (results.response.index == 0) {
                            session.replaceDialog("arabicNotYet");
                        }
                        else
                            session.replaceDialog("ExistingUser");
                   }
               }
            );  
            },
            function (session,results) {
                session.conversationData.userType = results.response.entity;
                if(results.response.index == 1)
                {
                    // session.send("%s",session.conversationData.isRegistered);
                    if (session.conversationData.isRegistered) {
                        session.replaceDialog("Services");
                        // session.send("whichService");
                        // session.endDialog();
                    }
                    else
                    {
                        var AlreadyUserOptions = program.Helpers.GetOptions(program.Options.AlreadyUser,session.preferredLocale());
                        builder.Prompts.choice(session, "areYouMemeber", AlreadyUserOptions,{listStyle: builder.ListStyle.button});
                    }
                    // session.send("whichService");
                    // session.replaceDialog("Services");
                }
                else
                {
                    session.replaceDialog("PropertyOptions"); 
                }
            },
               function (session,results) {
                   if (results.response.index == 0) {
                    session.beginDialog("getEmailCRM",{ reprompt: false, isRegistered : true });
                   }
                   else
                    session.beginDialog("getEmailCRM",{ reprompt: false, isRegistered : false });
            },
            function (session,results) {
                // session.send(JSON.stringify(results));
                if(session.CRMResult)
                    session.send("Hi Mr. "+ session.conversationData.firstName);
                
                session.replaceDialog("Services");
            } 
        ])
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
            html = html.replace("{{user}}",data.user);
            html = html.replace("{{mobile}}",data.mobile);
            html = html.replace("{{property}}",data.property);
            // html = html.replace("{{sector}}",data.sector);
            // html = html.replace("{{operation}}",data.operation);
            // html = html.replace("{{heard}}",data.heard);
            html = html.replace("{{comment}}",data.comment);
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
    if (activity.membersAdded) {
        activity.membersAdded.forEach((identity) => {
            if (identity.id === activity.address.bot.id) {
                   bot.beginDialog(activity.address, 'setLanguageWithPic');
             }
         });
    }
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