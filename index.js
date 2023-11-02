const express =  require("express")
const dotenv = require("dotenv")
dotenv.config()
const mongoose = require("mongoose")
const nodemailer = require("nodemailer");
const Razorpay = require('razorpay');
const cors =  require("cors")
// const RouterOne = require("./Modues/Router")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.DB)
.then(()=>{
    console.log("Database is connected");
})
.catch(()=>{
    console.log("Database is Not connected");
})

// app.use("/api" , RouterOne)


const OrderSchema = mongoose.Schema({
  isPaid: Boolean,
  amount: Number,
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String,
  },
  Name : String,
  Email : String,
  Phone : String,
  adult : String,
  child : String,
  tax:String,
  charge:String,
  totalcharge:String,
  Roomname : String,
  total:String,
  firstdate:String,
  seconddate:String,
  Roomid : String

});
const Order = mongoose.model('Order', OrderSchema);


const OrderSchemaCon = mongoose.Schema({
  Name : String,
  Surename : String,
  Phone : String,
  Email : String,
  Subject : String,
  Message : String

});
const OrderCon = mongoose.model('OrderCon', OrderSchemaCon);


const OrderSchemaRoom = mongoose.Schema({
  Roomid:String,
  RoomType : String,
  RoomPhoto : String,
  RoomName : String,
  Charge : String,

});
const OrderConRoomList = mongoose.model('OrderRoom', OrderSchemaRoom);

app.get('/get-razorpay-key', (req, res) => {
  res.send({ key: process.env.RAZORPAY_KEY_ID });
});

app.post('/create-order', async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    const options = {
      amount: req.body.amount,
      currency: 'INR',
    };
    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send('Some error occured');
    res.send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/pay-order', async (req, res) => {
  try {
    const { amount,Name , Email, Phone , adult , child ,tax, charge , totalcharge,Roomname,total,Roomid , razorpayPaymentId,firstdate,seconddate, razorpayOrderId, razorpaySignature } =
      req.body;
    const newOrder = Order({
      isPaid: true,
      amount: amount,
      razorpay: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      },
      Name : Name,
      Email : Email,
      Phone:Phone,
      adult:adult,
      child : child,
      tax:tax,
      charge:charge,
      totalcharge:totalcharge,
      Roomname : Roomname,
      total:total,
      firstdate:firstdate,
      seconddate:seconddate,
      Roomid : Roomid
    });
console.log(Roomid);
    await newOrder.save();
    // console.log(mail)
    res.send({
      msg: 'Payment was successfull'
      
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
      }
  });
  const mailOptions = {
      from: process.env.EMAIL,
      to: Email ,  
      subject: "Conformation",
      html: `
      <div style="height: auto; width:100% ; background-color: white;">
      <div>
        <div style="text-align: center;"><img src="https://i.postimg.cc/9M8YR2ZT/Group-54.png" style="width: 56px; height:56px"></div>
        <div style="text-align: center;"><img src="https://i.postimg.cc/XJRcc817/Group-61.png" style="width: 284px;"></div>

<br />
<br />
        <div style="text-align: center;"><h2>Thanks For Choosing The West Wind</h2></div>
        <br>
        <div style="text-align: center;">We are thrilled to inform you that your reservation at The West 
          <br />Wind has been confirmed.</div>
          <br>
          <div style="text-align: center;" ><h2>Reservation Details</h2></div>
          <br>

          <div style="margin-left: 40px;" ><span style="font-weight: bold;">Name</span> : ${Name}</div>
        <br>
          <div style="margin-left: 40px;"><span style="font-weight: bold;">Phone No</span> : +${Phone}</div>
        <br>
          <div style="margin-left: 40px;"><span style="font-weight: bold;">Email</span> : ${Email}</div>
        <br>
          <div style="margin-left: 40px;"><span style="font-weight: bold;">Number od Guests</span> : ${adult} adults and ${child} child</div>
        <br>
          <div style="margin-left: 40px;"><span style="font-weight: bold;">Check-in and Check-out </span> : ${firstdate} - ${seconddate}</div>
        <br>
          <div style="margin-left: 40px;"><span style="font-weight: bold;">Selected Room </span> : ${Roomname}</div>
        <br>
          <div style="margin-left: 40px;"><span style="font-weight: bold;">Total NIght </span> : ${total}</div>
          <br>
        <br > 
          <div style="width: 100%;  display: flex; justify-content : space-between; ">
            <div style="margin-left: 40px;"><p style="font-weight: bold;">Amount</p><p style="text-align: center;">${charge}</p></div>
            <div><p style="font-weight: bold;">TAX & GST</p ><p style="text-align: center;">${tax}</p></div>
            <div><p style="font-weight: bold;">Paid Amount</p><p style="text-align: center;">${totalcharge}</p></div>
            <div><p style="font-weight: bold;">Balance Amount</p><p style="text-align: center;">${totalcharge}</p></div>
          </div>
          <br>
          <div style="margin-left: 40px;">Please feel free to reach out if you have any further requests or if there's anything else we can assist you with. We
            <br /> want to ensure that your visit with us is absolutely perfect.</div>
        <br>
            <div style=" width: 100%; display: flex; justify-content : space-between;">
              <div style="margin-left: 40px;">Phone Number : +91 245 151 1556</div>
              <div>Email Address : abc@gmail.com</div>
            </div>

      </div>
  </div>

  
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log("Error" + error)
      } else {
          console.log("Email sent:" + info.response);
          res.status(201).json({status:201,info})
      }

  })
  
  const mailOptionsT = {
    from: process.env.EMAIL,
    to: "nagaraj02022000@gmail.com" ,  
    subject: "Conformation",
    html: `

    <div style="height: auto; width:100% ; background-color: white;">
        <div>
          <div style="text-align: center;"><img src="https://i.postimg.cc/9M8YR2ZT/Group-54.png" style="width: 56px; height:56px"></div>
          <div style="text-align: center;"><img src="https://i.postimg.cc/XJRcc817/Group-61.png" style="width: 284px;"></div>
    
    <br />
    <br />
          <div style="text-align: center;"><h2>Reservation Confirmed</h2></div>
          <br>
          <div style="text-align: center;">We are thrilled to inform you that your reservation at The West 
            <br />Wind has been confirmed.</div>
            <br>
            <div style="text-align: center;" ><h2>Customer Information</h2></div>
            <br>
    
            <div style="margin-left: 40px;" ><span style="font-weight: bold;">Name</span> : ${Name}</div>
          <br>
            <div style="margin-left: 40px;"><span style="font-weight: bold;">Phone No</span> : ${Phone}</div>
          <br>
            <div style="margin-left: 40px;"><span style="font-weight: bold;">Email</span> : ${Email}</div>
          <br>
            <div style="margin-left: 40px;"><span style="font-weight: bold;">Number od Guests</span> : ${adult} adults and ${child} child</div>
          <br>
            <div style="margin-left: 40px;"><span style="font-weight: bold;">Check-in and Check-out </span> : ${firstdate} - ${seconddate}</div>
          <br>
            <div style="margin-left: 40px;"><span style="font-weight: bold;">Selected Room </span> : ${Roomname}</div>
          <br>
            <div style="margin-left: 40px;"><span style="font-weight: bold;">Total NIght </span> : ${total}</div>
            <br>
          <br>
            <div style="width: 100%; display: flex; justify-content : space-between; ">
              <div style="margin-left: 40px;"><p style="font-weight: bold;">Amount</p><p style="text-align: center;">${charge}</p></div>
              <div ><p style="font-weight: bold;">TAX & GST</p ><p style="text-align: center;">${tax}</p></div>
              <div><p style="font-weight: bold;">Paid Amount</p><p style="text-align: center;">${totalcharge}</p></div>
              <div><p style="font-weight: bold;">Balance Amount</p><p style="text-align: center;">${totalcharge}</p></div>
            </div>
        </div>
    </div>

  `
};

transporter.sendMail(mailOptionsT, (error, info) => {
    if (error) {
        console.log("Error" + error)
    } else {
        console.log("Email sent:" + info.response);
        res.status(201).json({status:201,info})
    }

})


  } catch (error) {
    console.log(error);
    res.status(500).send(error);
    
  }
});





app.post('/contact-details', async (req, res) => {
  try {
    const {Name , Surename , Phone , Email , Subject , Message } =
      req.body;
    const newOrderCon = OrderCon({
      Name : Name,
      Surename:Surename,
      Email : Email,
      Phone:Phone,
      Subject : Subject,
      Message:Message
      
    });

    await newOrderCon.save();
    // console.log(mail)
    res.send({
      msg: 'Contact infomation send successfully'
      
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
      }
  });
  const mailOptions = {
      from: process.env.EMAIL,
      to: Email ,  
      subject: "Conformation",
      html: `

      <div style="height: auto; width:100% ;backgroud-color:white;">
      <div>
      <div style="text-align: center;"><img src="https://i.postimg.cc/9M8YR2ZT/Group-54.png" style="width: 56px; height:56px"></div>
      <div style="text-align: center;"><img src="https://i.postimg.cc/XJRcc817/Group-61.png" style="width: 284px;"></div>
      
      <br />
      <br />
      <div style="text-align: center;"><h2>Thanks For Choosing The West Wind</h2></div>
      <br>
      <div style="text-align: center;">We are thrilled to inform you that your reservation at The West 
        <br />Wind has been confirmed.</div>
        <br>
        <div style="width: 100%; text-align: center;"><h2>Customer Information</h2></div>
        <br>
        <div style="margin-left: 40px;"><span style="font-weight: bold;">Name</span> : ${Name}</div>
      <br>
        <div style="margin-left: 40px;"><span style="font-weight: bold;">Surename No</span> : ${Surename}</div>
      <br>
        <div style="margin-left: 40px;"><span style="font-weight: bold;">Email</span> : ${Email}</div>
      <br>
        <div style="margin-left: 40px;"><span style="font-weight: bold;">Phone</span> : ${Phone} </div>
      <br>
        <div style="margin-left: 40px;"><span style="font-weight: bold;">Subject </span> : ${Subject}</div>
      <br>
        <div style="margin-left: 40px;"><span style="font-weight: bold;">Message </span> : ${Message}</div>
      <br>
      
        <div style="margin-left: 40px;">Please feel free to reach out if you have any further requests or if there's anything else we can assist you with. We
          <br /> want to ensure that your visit with us is absolutely perfect.</div>
      <br>
          <div style= "width: 100%; display: flex; justify-content : space-between;">
            <div style="margin-left: 40px;">Phone Number : +91 245 151 1556</div>
            <div>Email Address : abc@gmail.com</div>
          </div>
      
      </div>
      
        
  
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log("Error" + error)
      } else {
          console.log("Email sent:" + info.response);
          res.status(201).json({status:201,info})
      }

  })


  const mailOptionsB = {
    from: process.env.EMAIL,
    to: "nagaraj022000@gmail.com" ,  
    subject: "Conformation",
    html: `

    <div style="height: auto; width:100% ;backgroud-color:white;">
    <div>
    <div style="text-align: center;"><img src="https://i.postimg.cc/9M8YR2ZT/Group-54.png" style="width: 56px; height:56px"></div>
    <div style="text-align: center;"><img src="https://i.postimg.cc/XJRcc817/Group-61.png" style="width: 284px;"></div>
    
    <br />
    <br />
    <div style="text-align: center;"><h2>Enquiry Information</h2></div>
    <br>
    <div style="text-align: center;">We are thrilled to inform you that your reservation at The West 
      <br />Wind has been confirmed.</div>
      <br>
      <div style="width: 100%; text-align: center;"><h2>Customer Information</h2></div>
      <br>
      <div style="margin-left: 40px;"><span style="font-weight: bold;">Name</span> : ${Name}</div>
    <br>
      <div style="margin-left: 40px;"><span style="font-weight: bold;">Surename No</span> : ${Surename}</div>
    <br>
      <div style="margin-left: 40px;"><span style="font-weight: bold;">Email</span> : ${Email}</div>
    <br>
      <div style="margin-left: 40px;"><span style="font-weight: bold;">Phone</span> : ${Phone} </div>
    <br>
      <div style="margin-left: 40px;"><span style="font-weight: bold;">Subject </span> : ${Subject}</div>
    <br>
      <div style="margin-left: 40px;"><span style="font-weight: bold;">Message </span> : ${Message}</div>
    <br>
    
      <div style="margin-left: 40px;">Please feel free to reach out if you have any further requests or if there's anything else we can assist you with. We
        <br /> want to ensure that your visit with us is absolutely perfect.</div>
    <br>
        <div style= "width: 100%; display: flex; justify-content : space-between;">
          <div style="margin-left: 40px;">Phone Number : +91 245 151 1556</div>
          <div>Email Address : abc@gmail.com</div>
        </div>
    
    </div>
    
      

  `
};

transporter.sendMail(mailOptionsB, (error, info) => {
    if (error) {
        console.log("Error" + error)
    } else {
        console.log("Email sent:" + info.response);
        res.status(201).json({status:201,info})
    }

})
  

  } catch (error) {
    console.log(error);
    res.status(500).send(error);
    
  }
});


app.get('/list-orders', async (req, res) => {
  const orders = await Order.find();
  res.send(orders);
});


app.post('/Roomlist', async (req, res) => {
  const Contact = new OrderConRoomList({
    ...req.body
})
 const datas =  await Contact.save()

  res.json(datas)
});
  
app.get('/Room_list', async (req, res) => {
  const orders = await OrderConRoomList.find();
  res.json(orders);
});


app.listen(process.env.PORT , ()=>{
  console.log("PORT Number : " , process.env.PORT);
})
