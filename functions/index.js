const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require("./permission_product.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const express = require('express');
const app = express();
const db=admin.firestore();

const cors= require('cors');
app.use( cors({origin:true}))


//routes
app.get('/hello-world', (req,res)=>{
    return res.status(200).send('hello');
});

//create

app.post('/product/add', (req,res)=>{
    (async ()=> {
        try{
            const document_category=db.collection('category').doc('/'+req.body.categoryId+'/');
            let product__category =await document_category.get();
            let res_category=product__category.data();
            
            console.log("hello")
            console.log(res_category)
            await db.collection('product_unique_name').doc('/'+req.body.name+'/')
                .create({
                    status:"accepted"
                })
            
            await db.collection('products')
            .add({
                name:req.body.name,
              
                categoryId:req.body.categoryId,
                categoryName:res_category.name,
                averageRating:'Not Given Yet',
                numberOfRaters:0
            })
            
           
            return res.status(201).send();

        }
        catch (error){
            a=String(error)
            if(a.includes('ALREADY_EXISTS')){
                return res.status(400).send();
            }
            console.log(error)
            return res.status(500).send();
        }

    })();
});


//delete
app.delete('/product/remove/:id', (req,res)=>{
    (async ()=> {
        try{
            const product_doc=db.collection('products').doc(req.params.id);
            let product =await product_doc.get();
            let response=product.data().name;
            db.collection('product_unique_name').doc(response).delete();
            const document=db.collection('products').doc(req.params.id).delete();
            


            return res.status(201).send();

        }
        catch (error){
            
            return res.status(500).send(error);
        }

    })();
});
//read
app.get('/product/list', (req,res)=>{
    (async ()=> {
        try{
            let query=db.collection('products');
        
            let respons=[];
            await query.get().then(querySnapshot =>{
                let docs=querySnapshot.docs;
                for(let doc of docs){
                    const selectedItem={
                        id:doc.id,
                        name:doc.data().name,
                        categoryId:doc.data().categoryId,
                        categoryName:doc.data().categoryName,
                        averageRating:doc.data().averageRating,
                        numberOfRaters:doc.data().numberOfRaters

                    }
                    respons.push(selectedItem)

                }
                return respons;
            })

            
            return res.status(200).send(respons);

        }
        catch (error){
            console.log("Hello")
            console.log(error);
            return res.status(500).send(error);
        }

    })();
});

//update

app.put('/product/updateCategory/:id', (req,res)=>{
    (async ()=> {
        try{
            const document_category=db.collection('category').doc('/'+req.body.categoryId+'/');
            let product__category =await document_category.get();
            let res_category=product__category.data();
            console.log(res_category)
            const document=db.collection('products').doc(req.params.id);
            await document.update({
                
               
                categoryId:req.body.categoryId,
                categoryName:res_category.name
               
            });


            return res.status(201).send();

        }
        catch (error){
            console.log("Hello")
            console.log(error);
            return res.status(500).send(error);
        }

    })();
});



//export the api to firebase cloud functuin

exports.app =functions.https.onRequest(app);
